import { getAccessToken } from "../utils/tokenStore";

const API_DOMAIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1").replace(/\/+$/, "");

/** Chuẩn hóa base URL cho SockJS (cùng host với API nếu không set VITE_WS_URL) */
function resolveWsBaseUrl() {
    const explicit = import.meta.env.VITE_WS_URL;
    if (explicit && String(explicit).trim()) {
        return String(explicit).replace(/\/+$/, "");
    }
    try {
        const api = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1/";
        const u = new URL(api);
        return `${u.protocol}//${u.host}`;
    } catch {
        return "http://localhost:8080";
    }
}

// Ensure conversation - tạo hoặc lấy conversation hiện tại của user
export const ensureConversation = async () => {
    const token = getAccessToken();
    const response = await fetch(`${API_DOMAIN}/chat/conversations/ensure`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include"
    });
    
    if (!response.ok) {
        throw new Error("Failed to ensure conversation");
    }
    return await response.json();
};

// Get paged messages cho 1 conversation
export const getConversationMessages = async (conversationId, page = 0, size = 20) => {
    const token = getAccessToken();
    const response = await fetch(
        `${API_DOMAIN}/chat/messages?conversationId=${conversationId}&page=${page}&size=${size}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            credentials: "include"
        }
    );
    
    if (!response.ok) {
        throw new Error("Failed to fetch messages");
    }
    return await response.json();
};

// Send message qua REST API
// content: nội dung tin nhắn
// receiverId: optional - chỉ cần khi admin gửi cho user cụ thể
export const sendMessage = async (content, receiverId = null) => {
    const token = getAccessToken();
    const body = { content };
    if (receiverId) {
        body.receiverId = receiverId;
    }
    const response = await fetch(`${API_DOMAIN}/chat/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(body)
    });
    
    if (!response.ok) {
        throw new Error("Failed to send message");
    }
    return await response.json();
};

// Get conversations list cho admin
export const getConversations = async () => {
    const token = getAccessToken();
    const response = await fetch(`${API_DOMAIN}/conversations`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include"
    });
    
    if (!response.ok) {
        throw new Error("Failed to fetch conversations");
    }
    return await response.json();
};

// ============================================================
// WebSocket connection cho realtime chat
// ============================================================
// Signature: createWebSocketConnection(onConnected, onError, onDisconnected)
// - onConnected(): called when STOMP connects successfully
// - onError(error): called on connection/subscription error
// - onDisconnected(): called when STOMP disconnects
// ============================================================
let stompClient = null;

// Module-level callback refs — cập nhật mỗi lần gọi connect
let _onConnectedCallback = null;
let _onErrorCallback = null;
let _onDisconnectedCallback = null;

/** SockJS thường đóng/mở socket khi chuyển transport — KHÔNG được reject promise ở onWebSocketClose trước khi STOMP onConnect. */
const CONNECT_TIMEOUT_MS = 25000;

export const createWebSocketConnection = (onConnected, onError, onDisconnected) => {
    return new Promise(async (resolve, reject) => {
        let settled = false;
        let connectTimer = null;

        const fail = (err) => {
            if (settled) return;
            settled = true;
            if (connectTimer) {
                clearTimeout(connectTimer);
                connectTimer = null;
            }
            if (onError) onError(err);
            reject(err);
        };

        const succeed = () => {
            if (settled) return;
            settled = true;
            if (connectTimer) {
                clearTimeout(connectTimer);
                connectTimer = null;
            }
            resolve(stompClient);
        };

        // Cập nhật refs để dùng trong reconnect và callbacks
        _onConnectedCallback = onConnected;
        _onErrorCallback = onError;
        _onDisconnectedCallback = onDisconnected;

        // Cleanup connection cũ
        disconnectWebSocket();

        try {
            const { Client } = await import("@stomp/stompjs");
            const sockjsMod = await import("sockjs-client");
            const SockJS = sockjsMod.default || sockjsMod;

            const token = getAccessToken();
            const base = resolveWsBaseUrl();
            // Thêm token vào query để handshake (xhr/jsonp) vẫn có JWT — backend WebSocketAuthInterceptor đọc Authorization=
            let wsUrl = `${base}/ws`;
            if (token) {
                const auth = `Bearer ${token}`;
                wsUrl += `${wsUrl.includes("?") ? "&" : "?"}Authorization=${encodeURIComponent(auth)}`;
            }

            connectTimer = setTimeout(() => {
                if (!settled) {
                    console.error("STOMP connect timeout after", CONNECT_TIMEOUT_MS, "ms");
                    fail(new Error("WebSocket/STOMP kết nối quá lâu — kiểm tra backend và CORS"));
                }
            }, CONNECT_TIMEOUT_MS);

            stompClient = new Client({
                webSocketFactory: () => new SockJS(wsUrl),
                connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
                reconnectDelay: 5000,
                heartbeatIncoming: 0,
                heartbeatOutgoing: 0,
                onConnect: () => {
                    console.log("STOMP connected:", base + "/ws");
                    if (_onConnectedCallback) _onConnectedCallback();
                    succeed();
                },
                onStompError: (frame) => {
                    console.error("STOMP broker error:", frame?.headers?.message, frame?.body);
                    fail(new Error(frame?.headers?.message || "STOMP error"));
                },
                onWebSocketError: (event) => {
                    console.error("WebSocket transport error:", event);
                },
                onWebSocketClose: (event) => {
                    // SockJS: socket có thể đóng tạm khi đổi transport — không reject ở đây
                    console.warn("WebSocket transport closed (có thể bình thường với SockJS):", event?.code, event?.reason);
                },
                onDisconnect: () => {
                    console.log("STOMP disconnected");
                    if (_onDisconnectedCallback) _onDisconnectedCallback();
                }
            });

            stompClient.activate();
        } catch (error) {
            console.error("Failed to create WebSocket connection:", error);
            fail(error);
        }
    });
};

export const subscribeToConversation = (conversationId, onMessageReceived) => {
    if (!stompClient || !stompClient.connected) {
        console.warn("STOMP client not connected, cannot subscribe");
        return null;
    }

    const topic = `/topic/conversation/${conversationId}`;
    console.log(`Subscribing to: ${topic}`);

    const subscription = stompClient.subscribe(
        topic,
        (message) => {
            console.log("Received message via WebSocket:", message.body);
            if (onMessageReceived) {
                try {
                    const messageData = JSON.parse(message.body);
                    console.log("Parsed message data:", messageData);
                    onMessageReceived(messageData);
                } catch (e) {
                    console.error("Failed to parse message:", e);
                }
            }
        }
    );

    return subscription;
};

export const unsubscribe = (subscription) => {
    if (subscription) {
        subscription.unsubscribe();
    }
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
};

export const isWebSocketConnected = () => {
    return stompClient && stompClient.connected;
};
