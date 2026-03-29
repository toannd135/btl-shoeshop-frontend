import React, { useState, useRef, useEffect } from "react";
import "./ChatBot.css";

const BOT_AVATAR = "🤖";

const QUICK_REPLIES = [
    "Xem sản phẩm mới",
    "Chính sách đổi trả",
    "Theo dõi đơn hàng",
    "Khuyến mãi hôm nay",
];

const WELCOME_MSG = {
    id: 0,
    from: "bot",
    text: "Xin chào! Mình là trợ lý của SHOESHOP 👟\nMình có thể giúp gì cho bạn?",
    time: new Date(),
};

const ChatBot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MSG]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    const formatTime = (date) =>
        date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    const sendMessage = (text) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), from: "user", text, time: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setTyping(true);

        // Giả lập bot reply sau 1 giây
        setTimeout(() => {
            setTyping(false);
            const botMsg = {
                id: Date.now() + 1,
                from: "bot",
                text: "Cảm ơn bạn đã liên hệ! Nhân viên của chúng mình sẽ phản hồi sớm nhất có thể 🙏",
                time: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
        }, 1000);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

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
                            <span className="chatbot-status">● Đang hoạt động</span>
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
                <div className="chatbot-messages">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`msg-row ${msg.from}`}>
                            {msg.from === "bot" && (
                                <div className="msg-avatar">{BOT_AVATAR}</div>
                            )}
                            <div className="msg-bubble-wrap">
                                <div className="msg-bubble">{msg.text}</div>
                                <span className="msg-time">{formatTime(msg.time)}</span>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {typing && (
                        <div className="msg-row bot">
                            <div className="msg-avatar">{BOT_AVATAR}</div>
                            <div className="msg-bubble typing">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Quick replies */}
                <div className="quick-replies">
                    {QUICK_REPLIES.map((q) => (
                        <button key={q} className="quick-btn" onClick={() => sendMessage(q)}>
                            {q}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="chatbot-input-bar">
                    <input
                        type="text"
                        className="chatbot-input"
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="chatbot-send"
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim()}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatBot;