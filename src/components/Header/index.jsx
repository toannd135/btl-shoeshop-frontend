import React from "react";
import { Link } from "react-router-dom";
import "./header.css";

const Header = () => {
    return (
        <header className="header">
            <div className="logo">PTIT<span>SNEAKER</span></div>

            <nav className="nav">
                <Link to="/home">Trang chủ</Link>
                <Link to="/products">Sản phẩm</Link>
                <Link to="/sale">Khuyến mãi</Link>
                <Link to="/blog">Blog</Link>
            </nav>

            <div className="header-icons">
                <Link to="/login" className="icon">Login</Link>
                <Link to="/cart" className="icon">Giỏ hàng</Link>
            </div>
        </header>
    );
};

export default Header;