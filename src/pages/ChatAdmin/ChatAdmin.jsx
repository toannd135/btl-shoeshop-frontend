import { useState, useEffect, useRef, useCallback } from "react";
import { Input, Spin, Empty, Avatar, Button } from "antd";
import { SearchOutlined, SendOutlined, ArrowLeftOutlined, MessageOutlined } from "@ant-design/icons";
import {
    getConversations,
    getConversationMessages,
    sendMessage,
    createWebSocketConnection,
    subscribeToConversation,
    unsubscribe as unsub,
    disconnectWebSocket,
    isWebSocketConnected
} from "../../services/chatService";
import { isSenderCurrentUser } from "../../utils/tokenStore";
import "./ChatAdmin.css";

const formatConversationTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    const oneDay = 86400000;
    if (diff < oneDay) {
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 7 * oneDay) {
        const days = Math.floor(diff / oneDay);
        return `${days} ngày trước`;
    }
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const formatMessageTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const ConversationSkeleton = () => (
    <div>
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="chat-skeleton-item">
                <div className="chat-skeleton-avatar" style={{ animationDelay: `${i * 0.1}s` }} />
                <div className="chat-skeleton-content">
                    <div className="chat-skeleton-line" style={{ width: "70%", animationDelay: `${i * 0.1}s` }} />
                    <div className="chat-skeleton-line" style={{ width: "50%", animationDelay: `${i * 0.15}s` }} />
                </div>
            </div>
        ))}
    </div>
);

const MessageSkeleton = () => (
    <div className="chat-messages-area">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`chat-message-wrapper ${i % 2 === 0 ? "me" : "other"}`}>
                <div className="chat-message-avatar">
                    <div className="chat-skeleton-avatar" style={{ animationDelay: `${i * 0.1}s` }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div className="chat-skeleton-line" style={{ width: 180, animationDelay: `${i * 0.1}s` }} />
                    <div className="chat-skeleton-line" style={{ width: 80, animationDelay: `${i * 0.15}s` }} />
                </div>
            </div>
        ))}
    </div>
);

function ChatAdmin() {
    const [conversations, setConversations] = useState([]);
    const [conversationsLoading, setConversationsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);

    const [messageInput, setMessageInput] = useState("");
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const subscriptionRef = useRef(null);
    const reconnectTimerRef = useRef(null);

    // Dùng refs để tránh stale closure trong callbacks và reconnect
    const selectedConversationRef = useRef(null);
    const onMessageRef = useRef(null);

    const PAGE_SIZE = 20;

    // Luôn giữ ref đồng bộ với state
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchValue]);

    // Fetch conversations
    useEffect(() => {
        const fetchConversationList = async () => {
            setConversationsLoading(true);
            try {
                const params = debouncedSearch ? { search: debouncedSearch } : {};
                const res = await getConversations(params);
                const data = res?.conversations || res?.data?.conversations || res?.data || [];
                setConversations(data);
            } catch (error) {
                console.error("Lỗi tải danh sách cuộc trò chuyện:", error);
                setConversations([]);
            } finally {
                setConversationsLoading(false);
            }
        };
        fetchConversationList();
    }, [debouncedSearch]);

    // Fetch messages when select conversation
    const fetchMessages = useCallback(async (conversationId, pageNum = 0, append = false) => {
        if (pageNum === 0) {
            setMessagesLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const res = await getConversationMessages(conversationId, pageNum, PAGE_SIZE);
            const content = res?.content || res?.data?.content || res?.data || [];
            const lastPage = res?.last ?? res?.data?.last ?? true;

            const convertedMessages = content.map((msg, index) => ({
                id: msg.messageId || `msg-${index}`,
                conversationId: msg.conversationId,
                senderId: msg.senderId,
                content: msg.content,
                me: isSenderCurrentUser(msg.senderId),
                createdAt: msg.createdAt,
                senderSummary: msg.senderSummary
            }));

            if (append) {
                setMessages(prev => [...convertedMessages, ...prev]);
            } else {
                setMessages(convertedMessages);
            }
            setHasMore(!lastPage);
            setPage(pageNum);
        } catch (error) {
            console.error("Lỗi tải tin nhắn:", error);
            if (!append) setMessages([]);
        } finally {
            setMessagesLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Handle new message from WebSocket — dùng ref để luôn nhận conversation mới nhất
    const handleNewMessage = useCallback((messageData) => {
        const currentConv = selectedConversationRef.current;
        if (!currentConv) return;

        if (messageData.conversationId !== currentConv.conversationId) {
            // Cập nhật conversation list cho các conversation khác
            setConversations(prev => prev.map(conv => {
                if (conv.conversationId === messageData.conversationId) {
                    return {
                        ...conv,
                        lastMessage: messageData.content,
                        updatedAt: messageData.createdAt
                    };
                }
                return conv;
            }));
            return;
        }

        // Thêm message vào conversation hiện tại
        setMessages(prev => {
            if (prev.some(m => m.id === messageData.messageId)) return prev;
            return [...prev, {
                id: messageData.messageId,
                conversationId: messageData.conversationId,
                senderId: messageData.senderId,
                content: messageData.content,
                me: isSenderCurrentUser(messageData.senderId),
                createdAt: messageData.createdAt,
                senderSummary: messageData.senderSummary
            }];
        });

        // Cập nhật conversation list
        setConversations(prev => prev.map(conv => {
            if (conv.conversationId === currentConv.conversationId) {
                return {
                    ...conv,
                    lastMessage: messageData.content,
                    updatedAt: messageData.createdAt
                };
            }
            return conv;
        }));
    }, []);

    // Cập nhật ref mỗi khi callback thay đổi
    useEffect(() => {
        onMessageRef.current = handleNewMessage;
    }, [handleNewMessage]);

    // Connect WebSocket cho conversation cụ thể
    const connectWebSocket = useCallback(async (conversationId) => {
        // Cleanup subscription cũ
        if (subscriptionRef.current) {
            unsub(subscriptionRef.current);
            subscriptionRef.current = null;
        }
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        // Nếu đã connect rồi, chỉ subscribe thôi
        if (isWebSocketConnected()) {
            console.log("Admin: WebSocket already connected, subscribing to:", conversationId);
            subscriptionRef.current = subscribeToConversation(conversationId, (msg) => {
                if (onMessageRef.current) onMessageRef.current(msg);
            });
            return;
        }

        // Tạo connection mới
        try {
            await createWebSocketConnection(
                () => {
                    console.log("Admin WebSocket connected to:", conversationId);
                    // Cleanup subscription cũ
                    if (subscriptionRef.current) {
                        unsub(subscriptionRef.current);
                        subscriptionRef.current = null;
                    }
                    subscriptionRef.current = subscribeToConversation(conversationId, (msg) => {
                        if (onMessageRef.current) onMessageRef.current(msg);
                    });
                },
                (error) => {
                    console.error("Admin WebSocket error:", error);
                },
                () => {
                    console.log("Admin WebSocket disconnected");
                    // NOT scheduling reconnect here — STOMP's reconnectDelay handles it automatically.
                    // Module-level _onConnectedCallback/_onErrorCallback are updated on next connect attempt.
                }
            );
        } catch (error) {
            console.error("Failed to connect Admin WebSocket:", error);
        }
    }, []);

    // Handle select conversation
    const handleSelectConversation = (conv) => {
        setSelectedConversation(conv);
        setMessages([]);
        setPage(0);
        setHasMore(true);
        setIsMobileListVisible(false);

        fetchMessages(conv.conversationId, 0, false);
        connectWebSocket(conv.conversationId);
    };

    // Handle scroll to load more
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || loadingMore || !hasMore || messagesLoading) return;

        const { scrollTop } = messagesContainerRef.current;
        if (scrollTop < 80) {
            const nextPage = page + 1;
            const convId = selectedConversationRef.current?.conversationId;
            if (!convId) return;

            setLoadingMore(true);
            fetchMessages(convId, nextPage, true).then(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = 40;
                }
            });
        }
    }, [page, loadingMore, hasMore, messagesLoading, fetchMessages]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    // Auto scroll to bottom when new messages
    useEffect(() => {
        if (messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            if (subscriptionRef.current) {
                unsub(subscriptionRef.current);
                subscriptionRef.current = null;
            }
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
            disconnectWebSocket();
        };
    }, []);

    // Cleanup khi conversation bị unset (back to list) — KHÔNG disconnect toàn bộ WS
    useEffect(() => {
        if (!selectedConversation) {
            if (subscriptionRef.current) {
                unsub(subscriptionRef.current);
                subscriptionRef.current = null;
            }
        }
    }, [selectedConversation]);

    // Send message
    const handleSendMessage = async () => {
        const trimmed = messageInput.trim();
        const conv = selectedConversationRef.current;
        if (!trimmed || !conv || sending) return;

        setSending(true);
        try {
            const receiverId = conv.senderSummary?.senderId;
            const response = await sendMessage(trimmed, receiverId);
            const sentMessage = response?.data || response;

            if (sentMessage) {
                setMessages(prev => [...prev, {
                    id: sentMessage.messageId || `temp-${Date.now()}`,
                    conversationId: conv.conversationId,
                    senderId: sentMessage.senderId,
                    content: trimmed,
                    me: isSenderCurrentUser(sentMessage.senderId),
                    createdAt: new Date().toISOString(),
                    senderSummary: sentMessage.senderSummary
                }]);
            }

            setMessageInput("");
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
            alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleBackToList = () => {
        if (subscriptionRef.current) {
            unsub(subscriptionRef.current);
            subscriptionRef.current = null;
        }
        setIsMobileListVisible(true);
        setSelectedConversation(null);
        setMessages([]);
    };

    return (
        <div className="chat-admin-container">
            {/* Left: Conversation List */}
            <div className={`chat-admin-sidebar ${!isMobileListVisible ? "hidden" : ""}`}>
                <div className="chat-sidebar-header">
                    <h3>Tin nhắn</h3>
                    <Input
                        className="chat-sidebar-search"
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        prefix={<SearchOutlined />}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        allowClear
                    />
                </div>

                <div className="chat-conversation-list">
                    {conversationsLoading ? (
                        <ConversationSkeleton />
                    ) : conversations.length === 0 ? (
                        <div className="chat-empty-state">
                            <Empty description="Chưa có cuộc trò chuyện nào" />
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.conversationId}
                                className={`chat-conversation-item ${selectedConversation?.conversationId === conv.conversationId ? "active" : ""}`}
                                onClick={() => handleSelectConversation(conv)}
                            >
                                <div className="chat-conversation-avatar">
                                    <Avatar src={conv.senderSummary?.avatar} size={48}>
                                        {conv.senderSummary?.senderName?.[0]}
                                    </Avatar>
                                </div>
                                <div className="chat-conversation-info">
                                    <div className="chat-conversation-name">
                                        {conv.senderSummary?.senderName || "Người dùng"}
                                    </div>
                                    <div className="chat-conversation-preview">
                                        {conv.lastMessage}
                                    </div>
                                </div>
                                <div className="chat-conversation-meta">
                                    <span className="chat-conversation-time">
                                        {formatConversationTime(conv.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* Right: Chat Area */}
            <div className="chat-admin-main">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header">
                            <button className="chat-header-back" onClick={handleBackToList}>
                                <ArrowLeftOutlined />
                            </button>
                            <div className="chat-header-avatar">
                                <Avatar
                                    src={selectedConversation.senderSummary?.avatar}
                                    size={42}
                                >
                                    {selectedConversation.senderSummary?.senderName?.[0]}
                                </Avatar>
                            </div>
                            <div className="chat-header-info">
                                <h4>{selectedConversation.senderSummary?.senderName || "Người dùng"}</h4>
                                <p>Cuộc trò chuyện</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        {messagesLoading ? (
                            <MessageSkeleton />
                        ) : (
                            <div className="chat-messages-area" ref={messagesContainerRef}>
                                {loadingMore && (
                                    <div className="chat-load-more-trigger">
                                        <Spin size="small" />
                                    </div>
                                )}
                                {messages.map((msg, index) => {
                                    const isMe = isSenderCurrentUser(msg.senderId);
                                    const prev = messages[index - 1];
                                    const prevIsMe = prev ? isSenderCurrentUser(prev.senderId) : false;
                                    const showAvatar = index === 0 ||
                                        prevIsMe !== isMe ||
                                        prev?.senderId !== msg.senderId;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`chat-message-wrapper ${isMe ? "me" : "other"}`}
                                        >
                                            {showAvatar && !isMe && (
                                                <div className="chat-message-avatar">
                                                    <Avatar
                                                        src={msg.senderSummary?.avatar}
                                                        size={32}
                                                    >
                                                        {msg.senderSummary?.senderName?.[0]}
                                                    </Avatar>
                                                </div>
                                            )}
                                            <div className="chat-message-bubble">
                                                <div className="chat-message-text">{msg.content}</div>
                                                <div className="chat-message-time">
                                                    {formatMessageTime(msg.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="chat-input-area">
                            <div className="chat-input-wrapper">
                                <textarea
                                    placeholder="Nhập tin nhắn..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                />
                            </div>
                            <Button
                                type="primary"
                                className="chat-send-btn"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim() || sending}
                                loading={sending}
                            />
                        </div>
                    </>
                ) : (
                    <div className="chat-empty-state">
                        <MessageOutlined style={{ fontSize: 64, color: "#ccc" }} />
                        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatAdmin;
