import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiShoppingCart } from 'react-icons/fi';
import "./header.css";
import { getProductList } from "../../services/productService";
import { getCurrentUser } from "../../utils/tokenStore";
import { Dropdown, message } from "antd";
import { logout } from "../../services/authService";
import { clearAccessToken, clearCurrentUser } from "../../utils/tokenStore";

const Header = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [userProfile, setUserProfile] = useState(null);
    const fetchUserFromMemory = () => {
        const user = getCurrentUser();
        setUserProfile(user);
    };
    useEffect(() => {
        fetchUserFromMemory();
        window.addEventListener("loginSuccess", fetchUserFromMemory);
        window.addEventListener("logoutSuccess", fetchUserFromMemory);
        return () => {
            window.removeEventListener("loginSuccess", fetchUserFromMemory);
            window.removeEventListener("logoutSuccess", fetchUserFromMemory);
        };
    }, []);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await getProductList();
                const dataList = res.data || res;
                setProducts(dataList.slice(0, 10));
            } catch (error) {
                console.error("Lỗi lấy danh sách sản phẩm cho menu:", error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 50) {
                    setShow(false);
                } else {
                    setShow(true);
                }
                setLastScrollY(window.scrollY);
            }
        };
        window.addEventListener('scroll', controlNavbar);
        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [lastScrollY]);
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.log("Logout API failed, clearing client anyway");
        }

        clearAccessToken();
        clearCurrentUser();
        window.dispatchEvent(new Event("logoutSuccess"));

        message.success("Đăng xuất thành công");
        navigate("/login");
    };

    const userMenuItems = [
        {
            key: 'logout',
            label: (
                <div onClick={handleLogout} style={{ fontWeight: 500, color: 'red', padding: '5px 10px' }}>
                    Đăng xuất
                </div>
            ),
        }
    ];

    return (
        <header className={`header-client ${show ? '' : 'hidden'}`}>
            <div className="logo">PTIT<span style={{ color: 'black' }}>SNEAKER</span></div>
            <nav className="nav">

                <Link to="/home">Trang chủ</Link>

                <div className="menu-item">
                    <Link to="/products" className="menu-link">
                        Sản phẩm <span className="arrow">▼</span>
                    </Link>

                    <div className="mega-menu">
                        <div className="mega-col dynamic-col">
                            <h4>Mới Cập Nhật</h4>
                            {products.length > 0 ? (
                                products.map((item) => (
                                    <Link
                                        key={item.productId || item.id}
                                        to={`/productDetail/${item.productId || item.id}`}
                                    >
                                        {item.name}
                                    </Link>
                                ))
                            ) : (
                                <span>Đang tải...</span>
                            )}
                        </div>

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

            <div className="header-client-icons">
                {userProfile ? (
                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                        <div className="icon" title={userProfile.username} style={{ cursor: 'pointer' }}>
                            <img
                                src={userProfile.avatarImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTp3E05PU096A0sYK811kyRs0MwZNqZNpGOQ&s"}
                                alt="avatar"
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '1px solid #ddd'
                                }}
                            />
                        </div>
                    </Dropdown>
                ) : (
                    <Link to="/login" className="icon">
                        <FiUser size={26} />
                    </Link>
                )}

                <Link to="/cart" className="icon cart-icon">
                    <FiShoppingCart size={24} />
                    <span className="cart-badge">0</span>
                </Link>
            </div>

        </header>
    );
};

export default Header;