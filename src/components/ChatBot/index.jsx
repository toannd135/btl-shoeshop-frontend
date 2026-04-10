import React, { useState, useRef, useEffect, useCallback } from "react";
import "./ChatBot.css";
import {
    ensureConversation,
    getConversationMessages,
    sendMessage as sendMessageApi,
    createWebSocketConnection,
    subscribeToConversation,
    unsubscribe as unsub,
    disconnectWebSocket,
    isWebSocketConnected
} from "../../services/chatService";
import { getAccessToken, isSenderCurrentUser } from "../../utils/tokenStore";

/** Phía bubble: user = của mình (phải), bot = đối phương (trái). Tin hệ thống không có senderId thì theo `from`. */
const chatBotSide = (msg) => {
    if (msg.senderId != null && msg.senderId !== "") {
        return isSenderCurrentUser(msg.senderId) ? "user" : "bot";
    }
    return msg.from === "user" ? "user" : "bot";
};

const BOT_AVATAR = "🤖";

const QUICK_REPLIES = [
    "Xem sản phẩm mới",
    "Chính sách đổi trả",
    "Theo dõi đơn hàng",
    "Khuyến mãi hôm nay",
];

const ChatBot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);

    // State cho pagination
    const [conversationId, setConversationId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const subscriptionRef = useRef(null);
    const scrollPositionRef = useRef(null);
    const isAtBottomRef = useRef(true);

    // Dùng ref để giữ callback mới nhất, tránh stale closure trong useCallback chain
    const onMessageRef = useRef(null);
    const onConnectedRef = useRef(null);
    const conversationIdRef = useRef(null);

    const PAGE_SIZE = 20;

    // Format thời gian tin nhắn
    const formatTime = (dateOrString) => {
        if (!dateOrString) return "";
        const date = typeof dateOrString === 'string' ? new Date(dateOrString) : dateOrString;
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    // Kiểm tra user đã đăng nhập chưa
    const isLoggedIn = !!getAccessToken();

    // Xử lý tin nhắn mới từ WebSocket — dùng functional update để luôn nhận state mới nhất
    const handleNewMessage = useCallback((messageData) => {
        setMessages(prev => {
            // Tránh duplicate
            if (prev.some(m => m.id === messageData.messageId)) {
                return prev;
            }

            const newMsg = {
                id: messageData.messageId,
                senderId: messageData.senderId,
                from: isSenderCurrentUser(messageData.senderId) ? "user" : "bot",
                text: messageData.content,
                time: messageData.createdAt ? new Date(messageData.createdAt) : new Date(),
                senderSummary: messageData.senderSummary
            };

            return [...prev, newMsg];
        });
    }, []);

    // Gửi tin nhắn
    const handleSendMessage = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        // Nếu chưa đăng nhập
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để gửi tin nhắn!");
            return;
        }

        // Nếu chưa có conversation
        if (!conversationIdRef.current) {
            alert("Đang khởi tạo cuộc trò chuyện, vui lòng thử lại!");
            return;
        }

        setSending(true);
        setInput("");

        try {
            const response = await sendMessageApi(trimmed);
            const sentMessage = response?.data || response;

            // Optimistic update: thêm tạm message vào UI
            if (sentMessage) {
                const newMsg = {
                    id: sentMessage.messageId || `temp-${Date.now()}`,
                    senderId: sentMessage.senderId,
                    from: "user",
                    text: sentMessage.content || trimmed,
                    time: sentMessage.createdAt ? new Date(sentMessage.createdAt) : new Date(),
                    senderSummary: sentMessage.senderSummary
                };

                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id && m.id.startsWith('temp-'))) {
                        return prev;
                    }
                    return [...prev, newMsg];
                });

                isAtBottomRef.current = true;
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
            setInput(trimmed);
        } finally {
            setSending(false);
        }
    }, [sending, isLoggedIn]);

    // Quick reply click
    const handleQuickReply = (replyText) => {
        handleSendMessage(replyText);
    };

    // Kết nối WebSocket cho conversation cụ thể
    const connectWebSocket = useCallback(async (convId) => {
        // Cleanup subscription cũ trước
        if (subscriptionRef.current) {
            unsub(subscriptionRef.current);
            subscriptionRef.current = null;
        }

        // Nếu đã connect rồi thì chỉ cần subscribe thôi
        if (isWebSocketConnected()) {
            console.log("ChatBot: WebSocket already connected, subscribing to:", convId);
            setConnected(true);
            conversationIdRef.current = convId;
            subscriptionRef.current = subscribeToConversation(convId, (msg) => {
                if (onMessageRef.current) onMessageRef.current(msg);
            });
            return;
        }

        // Tạo connection mới
        try {
            await createWebSocketConnection(
                () => {
                    console.log("ChatBot WebSocket connected to conversation:", convId);
                    setConnected(true);
                    conversationIdRef.current = convId;

                    // Cleanup subscription cũ nếu có
                    if (subscriptionRef.current) {
                        unsub(subscriptionRef.current);
                        subscriptionRef.current = null;
                    }

                    subscriptionRef.current = subscribeToConversation(convId, (msg) => {
                        if (onMessageRef.current) onMessageRef.current(msg);
                    });
                },
                (error) => {
                    console.error("ChatBot WebSocket error:", error);
                    setConnected(false);
                },
                () => {
                    console.log("ChatBot WebSocket disconnected");
                    setConnected(false);
                }
            );
        } catch (error) {
            console.error("Failed to connect ChatBot WebSocket:", error);
            setConnected(false);
        }
    }, []);

    // Cập nhật refs mỗi khi callback thay đổi
    useEffect(() => {
        onMessageRef.current = handleNewMessage;
    }, [handleNewMessage]);

    // Load thêm tin nhắn cũ (infinite scroll)
    const loadMoreMessages = useCallback(async () => {
        if (!conversationIdRef.current || loadingMore || !hasMore) return;

        setLoadingMore(true);
        if (messagesContainerRef.current) {
            scrollPositionRef.current = messagesContainerRef.current.scrollHeight;
        }

        try {
            const nextPage = page + 1;
            const response = await getConversationMessages(conversationIdRef.current, nextPage, PAGE_SIZE);
            const olderMessages = response?.content || response?.data?.content || [];

            if (olderMessages.length === 0) {
                setHasMore(false);
                return;
            }

            const convertedOlder = olderMessages.map((msg, index) => ({
                id: msg.messageId || `older-${nextPage}-${index}`,
                senderId: msg.senderId,
                from: isSenderCurrentUser(msg.senderId) ? "user" : "bot",
                text: msg.content,
                time: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                senderSummary: msg.senderSummary
            }));

            setMessages(prev => [...convertedOlder, ...prev]);
            setPage(nextPage);

            const isLastPage = response?.last ?? response?.data?.last ?? true;
            setHasMore(!isLastPage);

            // Giữ nguyên vị trí scroll
            requestAnimationFrame(() => {
                if (messagesContainerRef.current && scrollPositionRef.current) {
                    const newHeight = messagesContainerRef.current.scrollHeight;
                    const scrollDiff = newHeight - scrollPositionRef.current;
                    messagesContainerRef.current.scrollTop = scrollDiff;
                }
            });
        } catch (error) {
            console.error("Error loading more messages:", error);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, page]);

    // Handle scroll - detect khi nào cần load thêm
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || loadingMore) return;

        const { scrollTop } = messagesContainerRef.current;

        if (scrollTop < 80 && hasMore) {
            loadMoreMessages();
        }
    }, [loadingMore, hasMore, loadMoreMessages]);

    // Auto scroll xuống cuối khi có tin nhắn mới (nếu đang ở cuối)
    useEffect(() => {
        if (messagesEndRef.current && isAtBottomRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Track xem user có đang ở cuối không
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScrollTrack = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
        };

        container.addEventListener('scroll', handleScrollTrack);
        return () => container.removeEventListener('scroll', handleScrollTrack);
    }, [messages]);

    // Khởi tạo conversation và load messages
    const initializeChat = useCallback(async () => {
        if (!isLoggedIn) {
            setMessages([{
                id: 'system-1',
                from: 'bot',
                text: 'Vui lòng đăng nhập để sử dụng chat với chúng tôi.',
                time: new Date()
            }]);
            return;
        }

        setLoading(true);
        try {
            // Bước 1: Ensure conversation
            const convResponse = await ensureConversation();
            const convData = convResponse?.data || convResponse;
            const convId = convData?.conversationId;

            if (!convId) {
                throw new Error("Failed to get conversation ID");
            }

            setConversationId(convId);
            conversationIdRef.current = convId;

            // Bước 2: Load messages
            const messagesResponse = await getConversationMessages(convId, 0, PAGE_SIZE);
            const messagesData = messagesResponse?.content || messagesResponse?.data?.content || [];

            const convertedMessages = messagesData.map((msg, index) => ({
                id: msg.messageId || `temp-${index}`,
                senderId: msg.senderId,
                from: isSenderCurrentUser(msg.senderId) ? "user" : "bot",
                text: msg.content,
                time: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                senderSummary: msg.senderSummary
            }));

            setMessages(convertedMessages);

            const isLastPage = messagesResponse?.last ?? messagesResponse?.data?.last ?? true;
            setHasMore(!isLastPage);
            setPage(0);

            // Bước 3: Connect WebSocket
            await connectWebSocket(convId);
        } catch (error) {
            console.error("Error initializing chat:", error);
            setMessages([{
                id: 'error-1',
                from: 'bot',
                text: 'Không thể kết nối. Vui lòng thử lại.',
                time: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, connectWebSocket]);

    // Khởi tạo khi mở chat
    useEffect(() => {
        if (open && !conversationId) {
            initializeChat();
        }
    }, [open, conversationId, initializeChat]);

    // Cleanup khi đóng chat — KHÔNG có dependency nào gây disconnect ngoài ý muốn
    useEffect(() => {
        return () => {
            // Chỉ cleanup khi component unmount
        };
    }, []);

    // Cleanup khi đóng chat widget
    useEffect(() => {
        if (!open) {
            if (subscriptionRef.current) {
                unsub(subscriptionRef.current);
                subscriptionRef.current = null;
            }
            disconnectWebSocket();
            setConnected(false);
            // Reset conversation để lần sau mở lại re-init đầy đủ
            setConversationId(null);
            conversationIdRef.current = null;
            setMessages([]);
            setPage(0);
            setHasMore(true);
        }
    }, [open]);

    return (
        <>
            {/* Nút mở chat */}
            <button
                className={`chatbot-toggle ${open ? "active" : ""}`}
                onClick={() => setOpen(!open)}
                aria-label="Mở chat"
            >
                {open ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.148 2 11.25c0 2.7 1.2 5.133 3.13 6.862L4 22l4.24-1.682A10.7 10.7 0 0 0 12 20.5c5.523 0 10-4.148 10-9.25S17.523 2 12 2Z" />
                    </svg>
                )}
                {!open && <span className="chatbot-dot" />}
            </button>

            {/* Khung chat */}
            <div className={`chatbot-window ${open ? "open" : ""}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-avatar">{BOT_AVATAR}</div>
                        <div>
                            <p className="chatbot-name">SHOESHOP</p>
                            <span className={`chatbot-status ${connected ? 'online' : ''}`}>
                                {connected ? '● Đang hoạt động' : '○ Đang kết nối...'}
                            </span>
                        </div>
                    </div>
                    <button className="chatbot-close" onClick={() => setOpen(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="chatbot-messages" ref={messagesContainerRef} onScroll={handleScroll}>
                    {loading ? (
                        <div className="chatbot-loading">
                            <div className="loading-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="chatbot-empty">
                            <p>Hãy bắt đầu cuộc trò chuyện với chúng tôi!</p>
                        </div>
                    ) : (
                        <>
                            {loadingMore && (
                                <div className="chatbot-load-more">
                                    <div className="loading-dots small">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            {messages.map((msg) => {
                                const side = chatBotSide(msg);
                                return (
                                <div key={msg.id} className={`msg-row ${side}`}>
                                    {side === "bot" && (
                                        <div className="msg-avatar">{BOT_AVATAR}</div>
                                    )}
                                    <div className="msg-bubble-wrap">
                                        <div className="msg-bubble">{msg.text}</div>
                                        <span className="msg-time">{formatTime(msg.time)}</span>
                                    </div>
                                </div>
                            );
                            })}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick replies */}
                {messages.length <= 3 && !loading && (
                    <div className="quick-replies">
                        {QUICK_REPLIES.map((q) => (
                            <button key={q} className="quick-btn" onClick={() => handleQuickReply(q)}>
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="chatbot-input-bar">
                    <input
                        type="text"
                        className="chatbot-input"
                        placeholder={isLoggedIn ? "Nhập tin nhắn..." : "Đăng nhập để chat"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(input);
                            }
                        }}
                        disabled={sending || !isLoggedIn}
                    />
                    <button
                        className="chatbot-send"
                        onClick={() => handleSendMessage(input)}
                        disabled={!input.trim() || sending || !isLoggedIn}
                    >
                        {sending ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20">
                                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                                </circle>
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatBot;
