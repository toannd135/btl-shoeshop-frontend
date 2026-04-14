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
    isWebSocketConnected,
    markConversationAsRead
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
    const prevScrollHeightRef = useRef(0);
    const autoScrollRef = useRef(true); // true = auto scroll khi có message mới

    // Refs cho các callback — tránh stale closure
    const selectedConversationRef = useRef(null);
    const onMessageRef = useRef(null);
    const sentMessageIdsRef = useRef(new Set());
    const globalSubscriptionRef = useRef(null);

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

    // ================================================================
    // HELPER: updateConversationPreview — dùng chung cho mọi nơi
    // Cập nhật conversationsList immutable: lastMessage, updatedAt,
    // read flag, đẩy lên đầu.
    // ================================================================
    const updateConversationPreview = useCallback((
        conversationId,
        messageContent,
        messageCreatedAt,
        senderSummary,
        options = {}
    ) => {
        const {
            isRead = false,
            moveToTop = true
        } = options;

        setConversations(prev => {
            const idx = prev.findIndex(c => c.conversationId === conversationId);

            if (idx === -1) {
                // Conversation mới — tạo từ messageData và thêm vào đầu
                const newConv = {
                    conversationId,
                    lastMessage: messageContent,
                    updatedAt: messageCreatedAt,
                    read: isRead,
                    senderSummary: senderSummary || {}
                };
                return [newConv, ...prev];
            }

            // Cập nhật item tại idx
            const updated = [...prev];
            updated[idx] = {
                ...updated[idx],
                lastMessage: messageContent,
                updatedAt: messageCreatedAt,
                read: isRead
            };

            // Đẩy lên đầu nếu cần (sort theo mới nhất)
            if (moveToTop && idx > 0) {
                const [item] = updated.splice(idx, 1);
                updated.unshift(item);
            }

            return updated;
        });
    }, []);

    // ================================================================
    // HELPER: markConversationAsRead — chỉ chạy khi conversation đang mở
    // Gọi API backend + cập nhật local state ngay lập tức
    // ================================================================
    const handleMarkConversationAsRead = useCallback((conversationId) => {
        // Cập nhật local state trước (optimistic)
        setConversations(prev => prev.map(c =>
            c.conversationId === conversationId
                ? { ...c, read: true }
                : c
        ));
        // Gọi API backend (non-blocking)
        markConversationAsRead(conversationId).catch(err =>
            console.error("Lỗi mark as read:", err)
        );
    }, []);

    // ================================================================
    // MAIN HANDLER: onMessageReceived — xử lý mọi tin nhắn realtime
    // ================================================================
    const handleNewMessage = useCallback((messageData) => {
        const currentConv = selectedConversationRef.current;
        const activeConvId = currentConv?.conversationId;
        const incomingConvId = messageData.conversationId;
        const isActive = activeConvId === incomingConvId;
        const isMine = isSenderCurrentUser(messageData.senderId);

        const msgId = messageData.messageId;

        // Bỏ qua nếu không có messageId
        if (!msgId) {
            console.warn("[WS] Bỏ qua message không có messageId:", messageData);
            return;
        }

        // Bỏ qua nếu message thuộc conversation KHÔNG đang mở
        if (!isActive) {
            // Chỉ cập nhật conversationsList, không đụng đến message list
            updateConversationPreview(incomingConvId, messageData.content, messageData.createdAt, messageData.senderSummary, {
                isRead: false,
                moveToTop: true
            });
            return;
        }

        // === Conversation đang mở: cập nhật message list ===
        setMessages(prev => {
            // Dedupe: bỏ qua nếu messageId đã tồn tại
            if (prev.some(m => m.id === msgId)) {
                return prev;
            }

            // Reconciler: nếu có temp message cùng content + sender, thay thế tại chỗ
            // (không thay đổi thứ tự)
            const idx = prev.findIndex(m =>
                m.id && m.id.startsWith('temp-') &&
                m.content === messageData.content &&
                m.senderId === messageData.senderId
            );
            if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = {
                    id: msgId,
                    conversationId: incomingConvId,
                    senderId: messageData.senderId,
                    content: messageData.content,
                    me: isMine,
                    createdAt: messageData.createdAt,
                    senderSummary: messageData.senderSummary
                };
                return updated;
            }

            // Xóa khỏi dedupe set nếu có
            sentMessageIdsRef.current.delete(msgId);

            // APPEND vào CUỐI — tin mới luôn ở dưới
            return [...prev, {
                id: msgId,
                conversationId: incomingConvId,
                senderId: messageData.senderId,
                content: messageData.content,
                me: isMine,
                createdAt: messageData.createdAt,
                senderSummary: messageData.senderSummary
            }];
        });

        // B. Cập nhật conversationsList preview (IMMEDIATE)
        updateConversationPreview(incomingConvId, messageData.content, messageData.createdAt, messageData.senderSummary, {
            isRead: true,
            moveToTop: true
        });

        // Bật auto-scroll khi có message mới
        autoScrollRef.current = true;

        // Gọi mark read ngay khi nhận message trong conversation đang mở
        handleMarkConversationAsRead(incomingConvId);
    }, [updateConversationPreview, handleMarkConversationAsRead]);

    // Cập nhật ref mỗi khi handleNewMessage thay đổi
    useEffect(() => {
        onMessageRef.current = handleNewMessage;
    }, [handleNewMessage]);

    // ================================================================
    // GLOBAL WEBSOCKET CONNECTION — subscribe /topic/chat thay vì
    // subscribe từng conversation riêng.
    // Đây là fix chính cho Bug 2: trước đây mỗi conversation tạo 1
    // connection mới, nên khi chuyển conversation thì WS cũ không
    // nhận tin nhắn từ conversation cũ.
    // ================================================================
    const connectGlobalWebSocket = useCallback(async () => {
        // Cleanup cũ
        if (globalSubscriptionRef.current) {
            unsub(globalSubscriptionRef.current);
            globalSubscriptionRef.current = null;
        }
        if (isWebSocketConnected()) {
            // Đã connect rồi → chỉ subscribe global topic
            globalSubscriptionRef.current = subscribeToConversation("chat", (msg) => {
                if (onMessageRef.current) onMessageRef.current(msg);
            });
            return;
        }

        try {
            await createWebSocketConnection(
                () => {
                    console.log("Admin: Global WebSocket connected");
                    if (globalSubscriptionRef.current) {
                        unsub(globalSubscriptionRef.current);
                        globalSubscriptionRef.current = null;
                    }
                    // Subscribe global topic — nhận mọi tin nhắn từ mọi conversation
                    globalSubscriptionRef.current = subscribeToConversation("chat", (msg) => {
                        if (onMessageRef.current) onMessageRef.current(msg);
                    });
                },
                (error) => {
                    console.error("Admin WebSocket error:", error);
                },
                () => {
                    console.log("Admin WebSocket disconnected");
                }
            );
        } catch (error) {
            console.error("Failed to connect Admin global WebSocket:", error);
        }
    }, []);

    // Kết nối global WS khi mount
    useEffect(() => {
        connectGlobalWebSocket();
        return () => {
            if (globalSubscriptionRef.current) {
                unsub(globalSubscriptionRef.current);
                globalSubscriptionRef.current = null;
            }
            disconnectWebSocket();
        };
    }, [connectGlobalWebSocket]);

    // Fetch conversations list
    const fetchConversationList = useCallback(async (silent = false, preserveReadOf = null) => {
        if (!silent) setConversationsLoading(true);
        try {
            const params = debouncedSearch ? { search: debouncedSearch } : {};
            const res = await getConversations(params);
            const data = res?.conversations || res?.data?.conversations || res?.data || [];

            setConversations(prev => {
                if (!preserveReadOf) return data;
                // Giữ nguyên read flag local của conversation đang mở
                // (backend trả về read=false khi user gửi tin nhắn mới)
                return data.map(conv => {
                    if (conv.conversationId === preserveReadOf) {
                        const local = prev.find(c => c.conversationId === preserveReadOf);
                        return local ? { ...conv, read: local.read } : conv;
                    }
                    return conv;
                });
            });
        } catch (error) {
            console.error("Lỗi tải danh sách cuộc trò chuyện:", error);
        } finally {
            if (!silent) setConversationsLoading(false);
        }
    }, [debouncedSearch]);

    // Gọi fetch on mount + khi debouncedSearch thay đổi
    useEffect(() => {
        fetchConversationList();
    }, [fetchConversationList]);

    // Fetch messages cho 1 conversation
    // page=0: DESC (newest first) → reverse để ASC (oldest first) → render từ trên xuống
    // page>0: ASC (oldest first) → prepend lên đầu
    const fetchMessages = useCallback(async (conversationId, pageNum = 0) => {
        if (pageNum === 0) {
            setMessagesLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            // page=0: DESC (mới nhất trước) từ backend
            // page>0: ASC (cũ nhất trước) để pagination
            const direction = pageNum === 0 ? "desc" : "asc";
            const res = await getConversationMessages(conversationId, pageNum, PAGE_SIZE, direction);
            const content = res?.content || res?.data?.content || res?.data || [];
            const lastPage = res?.last ?? res?.data?.last ?? true;

            const convertedMessages = content.map((msg) => ({
                id: msg.messageId,
                conversationId: msg.conversationId,
                senderId: msg.senderId,
                content: msg.content,
                me: isSenderCurrentUser(msg.senderId),
                createdAt: msg.createdAt,
                senderSummary: msg.senderSummary
            }));

            if (pageNum === 0) {
                // Initial load: backend DESC (newest→oldest) → reverse để ASC (oldest→newest)
                // ASC array: messages[0] = oldest (top), messages[last] = newest (bottom)
                const reversed = [...convertedMessages].reverse();
                setMessages(reversed);

                // Scroll xuống đáy ngay sau khi render xong
                requestAnimationFrame(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                });
            } else {
                // Load more: backend ASC (oldest first) → prepend trực tiếp
                // newMsgs = [oldest_older, ..., newest_older] (ASC từ backend)
                // prev = [oldest_current, ..., newest_current]
                // result = [oldest_older, ..., newest_older, oldest_current, ..., newest_current]
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const newMsgs = convertedMessages.filter(m => !existingIds.has(m.id));
                    const reversed = [...newMsgs].reverse();
                    return [...reversed, ...prev];
                });

                // Giữ nguyên vị trí scroll: scrollTop tăng theo số px đã thêm vào đầu
                requestAnimationFrame(() => {
                    if (messagesContainerRef.current && prevScrollHeightRef.current > 0) {
                        const newScrollHeight = messagesContainerRef.current.scrollHeight;
                        const heightDiff = newScrollHeight - prevScrollHeightRef.current;
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollTop + heightDiff;
                    }
                });
            }

            setHasMore(!lastPage);
            setPage(pageNum);
        } catch (error) {
            console.error("Lỗi tải tin nhắn:", error);
            if (pageNum === 0) setMessages([]);
        } finally {
            setMessagesLoading(false);
            setLoadingMore(false);
            prevScrollHeightRef.current = 0;
        }
    }, []);

    // ================================================================
    // HANDLER: Select conversation
    // ================================================================
    const handleSelectConversation = (conv) => {
        setSelectedConversation(conv);
        setMessages([]);
        setPage(0);
        setHasMore(true);
        setIsMobileListVisible(false);

        // MARK READ khi chọn
        handleMarkConversationAsRead(conv.conversationId);

        // Fetch messages: page=0 → DESC (newest first) → sẽ reverse ở trên
        fetchMessages(conv.conversationId, 0);
    };

    // ================================================================
    // HANDLER: Scroll load more (cuộn lên trên)
    // ================================================================
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || loadingMore || !hasMore || messagesLoading) return;

        const { scrollTop } = messagesContainerRef.current;
        // Nếu scroll gần top (< 80px) và còn dữ liệu cũ -> load more
        if (scrollTop < 80) {
            const nextPage = page + 1;
            const convId = selectedConversationRef.current?.conversationId;
            if (!convId) return;

            // Lưu scrollHeight TRƯỚC KHI load để giữ vị trí
            prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;

            setLoadingMore(true);
            fetchMessages(convId, nextPage);
        }
    }, [page, loadingMore, hasMore, messagesLoading, fetchMessages]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    // Auto scroll khi có tin nhắn mới (chỉ khi user đang ở cuối)
    useEffect(() => {
        if (autoScrollRef.current && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Tắt auto-scroll khi user scroll lên xem tin cũ
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleUserScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            // Nếu user scroll lên (không phải đang ở cuối), tắt auto-scroll
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
            if (!isAtBottom) {
                autoScrollRef.current = false;
            } else {
                autoScrollRef.current = true;
            }
        };

        container.addEventListener("scroll", handleUserScroll);
        return () => container.removeEventListener("scroll", handleUserScroll);
    }, []);

    // ================================================================
    // HANDLER: Send message
    // ================================================================
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
                const realId = sentMessage.messageId;
                const tempId = realId || `temp-${Date.now()}`;

                sentMessageIdsRef.current.add(tempId);
                if (realId) sentMessageIdsRef.current.add(realId);

                // Optimistic append vào message list
                setMessages(prev => {
                    if (prev.some(m => m.id === tempId || (realId && m.id === realId))) {
                        return prev;
                    }
                    return [...prev, {
                        id: tempId,
                        conversationId: conv.conversationId,
                        senderId: sentMessage.senderId,
                        content: trimmed,
                        me: isSenderCurrentUser(sentMessage.senderId),
                        createdAt: new Date().toISOString(),
                        senderSummary: sentMessage.senderSummary
                    }];
                });

                // Cập nhật conversationsList preview NGAY (không chờ WS echo)
                // Tin nhắn gửi đi: read = true (admin đang ở trong conv này)
                updateConversationPreview(
                    conv.conversationId,
                    trimmed,
                    new Date().toISOString(),
                    sentMessage.senderSummary,
                    { isRead: true, moveToTop: true }
                );

                // Bật auto-scroll khi gửi message
                autoScrollRef.current = true;
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
        setIsMobileListVisible(true);
        setSelectedConversation(null);
        setMessages([]);
        setPage(0);
    };

    // ================================================================
    // RENDER
    // ================================================================
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
                                    {conv.read === false && (
                                        <span className="chat-unread-dot" />
                                    )}
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
