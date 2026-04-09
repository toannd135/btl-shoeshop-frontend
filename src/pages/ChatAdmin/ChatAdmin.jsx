import { useState, useEffect, useRef, useCallback } from "react";
import { Input, Spin, Empty, Avatar, Button } from "antd";
import { SearchOutlined, SendOutlined, ArrowLeftOutlined, MessageOutlined } from "@ant-design/icons";
import { getConversations, getConversationMessages, sendMessage } from "../../services/chatService";
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
    const lastMessageRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchValue]);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            setConversationsLoading(true);
            try {
                const params = debouncedSearch ? { search: debouncedSearch } : {};
                const res = await getConversations(params);
                const data = res?.data?.conversations || res?.conversations || [];
                setConversations(data);
            } catch (error) {
                console.error("Lỗi tải danh sách cuộc trò chuyện:", error);
                setConversations([]);
            } finally {
                setConversationsLoading(false);
            }
        };
        fetchConversations();
    }, [debouncedSearch]);

    // Fetch messages when select conversation
    const fetchMessages = useCallback(async (conversationId, pageNum = 0, append = false) => {
        if (pageNum === 0) {
            setMessagesLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const res = await getConversationMessages({ conversationId: conversationId, page: pageNum, size: 20 });
            const content = res?.content || res?.data?.content || res?.data || [];
            const lastPage = res?.last ?? res?.data?.last ?? true;

            if (append) {
                setMessages((prev) => [...content.reverse(), ...prev]);
            } else {
                setMessages(content);
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

    // Handle select conversation
    const handleSelectConversation = (conv) => {
        setSelectedConversation(conv);
        setMessages([]);
        setPage(0);
        setHasMore(true);
        setIsMobileListVisible(false);
        fetchMessages(conv.conversationId, 0, false);
    };

    // Handle scroll to load more
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || loadingMore || !hasMore || messagesLoading) return;

        const { scrollTop } = messagesContainerRef.current;
        if (scrollTop < 80) {
            const nextPage = page + 1;
            setLoadingMore(true);
            fetchMessages(selectedConversation.conversationId, nextPage, true).then(() => {
                if (messagesContainerRef.current) {
                    const newScrollHeight = messagesContainerRef.current.scrollHeight;
                    messagesContainerRef.current.scrollTop = 40;
                }
            });
        }
    }, [page, loadingMore, hasMore, messagesLoading, selectedConversation, fetchMessages]);

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

    // Send message
    const handleSendMessage = async () => {
        const trimmed = messageInput.trim();
        if (!trimmed || !selectedConversation || sending) return;

        setSending(true);
        try {
            const receiverId = selectedConversation.senderSummary?.senderId;
            await sendMessage(receiverId, trimmed);
            const newMsg = {
                messageId: Date.now().toString(),
                conversationId: selectedConversation.conversationId,
                content: trimmed,
                me: true,
                createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, newMsg]);
            setMessageInput("");
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
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
                        ))
                    )}
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
                                    const isMe = msg.me === true || msg.me === "true";
                                    const showAvatar = index === 0 ||
                                        messages[index - 1]?.me !== msg.me ||
                                        messages[index - 1]?.senderId !== msg.senderId;

                                    return (
                                        <div
                                            key={msg.messageId}
                                            className={`chat-message-wrapper ${isMe ? "me" : "other"}`}
                                            ref={index === messages.length - 1 ? lastMessageRef : null}
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