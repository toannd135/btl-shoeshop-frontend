import React, { useState, useEffect } from "react";
import "./ScrollToTop.css";

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <button
            className={`scroll-top-btn ${visible ? "show" : ""}`}
            onClick={scrollUp}
            aria-label="Lên đầu trang"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <line x1="5" y1="5" x2="12" y2="5" />
                <line x1="19" y1="5" x2="12" y2="5" />
                <polyline points="8 9 12 5 16 9" />
            </svg>
        </button>
    );
};

export default ScrollToTop;