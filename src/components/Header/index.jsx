import React from "react";
import { Link } from "react-router-dom";
import { FiUser, FiShoppingCart } from 'react-icons/fi';
import "./header.css";

const Header = () => {
    return (
        <header className="header">
            <div className="logo">PTIT<span style={{ color: 'black' }}>SNEAKER</span></div>
            <nav className="nav">

                <Link to="/home">Trang chủ</Link>

                <div className="menu-item">
                    <Link to="/products" className="menu-link">
                        Sản phẩm <span className="arrow">▼</span>
                    </Link>

                    <div className="mega-menu">

                        <div className="mega-col">
                            <h4>Đối tượng</h4>
                            <Link to="/products/nam">Sneaker Nam</Link>
                            <Link to="/products/nu">Sneaker Nữ</Link>
                            <Link to="/products/unisex">Sneaker Unisex</Link>
                            <Link to="/products/kids">Sneaker Trẻ Em</Link>
                            <Link to="/products/couple">Sneaker Couple</Link>
                        </div>

                        <div className="mega-col">
                            <h4>Thương hiệu</h4>
                            <Link to="/brand/nike">Nike</Link>
                            <Link to="/brand/adidas">ADIDAS</Link>
                            <Link to="/brand/puma">PUMA</Link>
                            <Link to="/brand/crocs">CROCS</Link>
                            <Link to="/brand/fitflop">FITFLOP</Link>
                        </div>

                        <div className="mega-col">
                            <h4>Nhu Cầu Sử Dụng</h4>
                            <Link to="/use/school">Sneaker đi học – đi làm</Link>
                            <Link to="/use/run">Sneaker chạy bộ</Link>
                            <Link to="/use/gym">Sneaker tập gym</Link>
                            <Link to="/use/sport">Sneaker chơi thể thao</Link>
                            <Link to="/use/street">Sneaker đi chơi – dạo phố</Link>
                        </div>

                        <div className="mega-col">
                            <h4>Phong Cách</h4>
                            <Link to="/style/low">Sneaker cổ thấp</Link>
                            <Link to="/style/high">Sneaker cổ cao</Link>
                            <Link to="/style/mid">Sneaker cổ trung</Link>
                            <Link to="/style/chunky">Sneaker đế dày</Link>
                            <Link to="/style/vintage">Sneaker Retro</Link>
                        </div>

                    </div>
                </div>

                <Link to="/sale">Khuyến mãi</Link>
                <Link to="/blog">Blog</Link>

            </nav>

            <div className="header-icons">
                <Link to="/login" className="icon">
                    <FiUser size={24} />
                </Link>
                <Link to="/cart" className="icon cart-icon">
                    <FiShoppingCart size={24} />
                    <span className="cart-badge">0</span>
                </Link>
            </div>

        </header>
    );
};

export default Header;