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

    // Pagination
    const [conversationId, setConversationId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const subscriptionRef = useRef(null);
    const prevScrollHeightRef = useRef(0);

    // Refs to avoid stale closures
    const onMessageRef = useRef(null);
    const conversationIdRef = useRef(null);

    const PAGE_SIZE = 20;

    // Track sent message IDs để dedupe
    const sentMessageIdsRef = useRef(new Set());

    const formatTime = (dateOrString) => {
        if (!dateOrString) return "";
        const date = typeof dateOrString === 'string' ? new Date(dateOrString) : dateOrString;
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    const isLoggedIn = !!getAccessToken();

    // ================================================================
    // HELPER: convert message từ API
    // ================================================================
    const convertMessage = useCallback((msg) => ({
        id: msg.messageId,
        senderId: msg.senderId,
        from: isSenderCurrentUser(msg.senderId) ? "user" : "bot",
        text: msg.content,
        time: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        senderSummary: msg.senderSummary
    }), []);

    // ================================================================
    // FETCH MESSAGES — CORE LOGIC (đồng bộ với ChatAdmin)
    // page=0: DESC (newest first) → reverse để ASC (oldest→newest)
    // page>0: ASC (oldest first) → prepend
    // ================================================================
    const fetchMessages = useCallback(async (convId, pageNum = 0) => {
        if (pageNum === 0) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const direction = pageNum === 0 ? "desc" : "asc";
            const response = await getConversationMessages(convId, pageNum, PAGE_SIZE, direction);
            const content = response?.content || response?.data?.content || response?.data || [];
            const lastPage = response?.last ?? response?.data?.last ?? true;

            const converted = content.map(msg => convertMessage(msg));

            if (pageNum === 0) {
                // Initial load: DESC (newest→oldest) → reverse để ASC (oldest→newest)
                const reversed = [...converted].reverse();
                setMessages(reversed);
                setHasMore(!lastPage);
                setPage(0);

                // Scroll to bottom sau khi render
                requestAnimationFrame(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                });
            } else {
                // Load more: ASC (oldest first) → prepend
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const newMsgs = converted.filter(m => !existingIds.has(m.id));
                    const reversed = [...newMsgs].reverse();
                    return [...reversed, ...prev];
                });
                setHasMore(!lastPage);
                setPage(pageNum);

                // Giữ nguyên scroll position
                requestAnimationFrame(() => {
                    if (messagesContainerRef.current && prevScrollHeightRef.current > 0) {
                        const newScrollHeight = messagesContainerRef.current.scrollHeight;
                        const heightDiff = newScrollHeight - prevScrollHeightRef.current;
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollTop + heightDiff;
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            if (pageNum === 0) setMessages([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            prevScrollHeightRef.current = 0;
        }
    }, [convertMessage]);

    // ================================================================
    // HANDLER: WebSocket message
    // ================================================================
    const handleNewMessage = useCallback((messageData) => {
        const msgId = messageData.messageId;
        if (!msgId) return;

        // Bỏ qua nếu đã có trong dedupe set
        if (sentMessageIdsRef.current.has(msgId)) {
            sentMessageIdsRef.current.delete(msgId);
        }

        setMessages(prev => {
            // Dedupe
            if (prev.some(m => m.id === msgId)) return prev;

            // Replace temp message nếu có
            const tempIdx = prev.findIndex(m =>
                m.id && m.id.startsWith('temp-') &&
                m.text === messageData.content &&
                m.senderId === messageData.senderId
            );
            if (tempIdx !== -1) {
                const updated = [...prev];
                updated[tempIdx] = convertMessage(messageData);
                return updated;
            }

            // APPEND vào cuối
            return [...prev, convertMessage(messageData)];
        });
    }, [convertMessage]);

    useEffect(() => {
        onMessageRef.current = handleNewMessage;
    }, [handleNewMessage]);

    // ================================================================
    // HANDLER: Send message
    // ================================================================
    const handleSendMessage = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để gửi tin nhắn!");
            return;
        }

        if (!conversationIdRef.current) {
            alert("Đang khởi tạo cuộc trò chuyện, vui lòng thử lại!");
            return;
        }

        setSending(true);
        setInput("");

        try {
            const response = await sendMessageApi(trimmed);
            const sentMessage = response?.data || response;

            if (sentMessage) {
                const realId = sentMessage.messageId;
                const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                sentMessageIdsRef.current.add(tempId);
                if (realId) sentMessageIdsRef.current.add(realId);

                setMessages(prev => {
                    if (prev.some(m => m.id === tempId || (realId && m.id === realId))) return prev;
                    return [...prev, {
                        id: tempId,
                        senderId: sentMessage.senderId,
                        from: "user",
                        text: sentMessage.content || trimmed,
                        time: sentMessage.createdAt ? new Date(sentMessage.createdAt) : new Date(),
                        senderSummary: sentMessage.senderSummary
                    }];
                });

                // Scroll to bottom sau khi gửi
                requestAnimationFrame(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
            setInput(trimmed);
        } finally {
            setSending(false);
        }
    }, [sending, isLoggedIn]);

    const handleQuickReply = (replyText) => {
        handleSendMessage(replyText);
    };

    // ================================================================
    // HANDLER: Scroll load more
    // ================================================================
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || loadingMore || !hasMore || loading) return;

        const { scrollTop } = messagesContainerRef.current;
        if (scrollTop < 80) {
            const nextPage = page + 1;
            const convId = conversationIdRef.current;
            if (!convId) return;

            prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
            setLoadingMore(true);
            fetchMessages(convId, nextPage);
        }
    }, [page, loadingMore, hasMore, loading, fetchMessages]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    // ================================================================
    // WEBSOCKET
    // ================================================================
    const connectWebSocket = useCallback(async (convId) => {
        if (subscriptionRef.current) {
            unsub(subscriptionRef.current);
            subscriptionRef.current = null;
        }

        if (isWebSocketConnected()) {
            setConnected(true);
            conversationIdRef.current = convId;
            subscriptionRef.current = subscribeToConversation(convId, (msg) => {
                if (onMessageRef.current) onMessageRef.current(msg);
            });
            return;
        }

        try {
            await createWebSocketConnection(
                () => {
                    console.log("ChatBot WebSocket connected to conversation:", convId);
                    setConnected(true);
                    conversationIdRef.current = convId;

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

    // ================================================================
    // INIT CHAT
    // ================================================================
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
            const convResponse = await ensureConversation();
            const convData = convResponse?.data || convResponse;
            const convId = convData?.conversationId;

            if (!convId) {
                throw new Error("Failed to get conversation ID");
            }

            setConversationId(convId);
            conversationIdRef.current = convId;

            // Fetch messages: page=0, direction=desc → sẽ reverse ở trong fetchMessages
            await fetchMessages(convId, 0);

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
    }, [isLoggedIn, fetchMessages, connectWebSocket]);

    // Init when chat opens
    useEffect(() => {
        if (open && !conversationId) {
            initializeChat();
        }
    }, [open, conversationId, initializeChat]);

    // Cleanup when chat closes
    useEffect(() => {
        if (!open) {
            if (subscriptionRef.current) {
                unsub(subscriptionRef.current);
                subscriptionRef.current = null;
            }
            disconnectWebSocket();
            setConnected(false);
            setConversationId(null);
            conversationIdRef.current = null;
            setMessages([]);
            setPage(0);
            setHasMore(true);
        }
    }, [open]);

    // ================================================================
    // RENDER
    // ================================================================
    return (
        <>
            {/* Toggle button */}
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

            {/* Chat window */}
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
                <div className="chatbot-messages" ref={messagesContainerRef}>
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
