import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiShoppingCart, FiSearch, FiLogOut, FiSettings, FiX, FiUser as FiProfile } from 'react-icons/fi';
import "./header.css";

// Giả sử file chứa getCateList của bạn tên là categoryService
import { getCateList } from "../../services/cateService";
import { getProductList, getFilteredProducts, getProductVariants } from "../../services/productService";
import { getMyCart } from "../../services/cartService";
import { logout } from "../../services/authService";
import { getCurrentUser, clearAccessToken, clearCurrentUser } from "../../utils/tokenStore";
import { Dropdown, message } from "antd";

import logo from '../../images/logoPtitShoesShoppng.png';

const Header = () => {
    const navigate = useNavigate();

    // --- STATE CHO NAVBAR ---
    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [userProfile, setUserProfile] = useState(null);
    const [cartCount, setCartCount] = useState(0);

    // --- STATE CHO TÌM KIẾM ---
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [totalSearchElements, setTotalSearchElements] = useState(0);

    // --- STATE CHO MEGA MENU ---
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Khai báo Enum Gender
    const genders = [
        { code: 'MALE', label: 'Sneaker Nam' },
        { code: 'FEMALE', label: 'Sneaker Nữ' },
        { code: 'OTHER', label: 'Sneaker Unisex/Khác' }
    ];

    const isLoggedIn = !!userProfile;
    const isAdmin = userProfile && (userProfile.roleCode === 'ADMIN' || userProfile.roleCode === 'ROLE_ADMIN');

    const fetchUserFromMemory = () => {
        const user = getCurrentUser();
        setUserProfile(user);
    };

    const fetchCartCount = async () => {
        const user = getCurrentUser();
        if (!user) {
            setCartCount(0);
            return;
        }
        try {
            const res = await getMyCart();
            const items = res.data?.items || [];
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalQuantity);
        } catch (error) {
            console.error("Lỗi lấy số lượng giỏ hàng:", error);
        }
    };

    // Khởi tạo Auth & Cart
    useEffect(() => {
        fetchUserFromMemory();
        fetchCartCount();
        window.addEventListener("loginSuccess", () => {
            fetchUserFromMemory();
            fetchCartCount();
        });
        window.addEventListener("logoutSuccess", () => {
            fetchUserFromMemory();
            setCartCount(0);
        });
        window.addEventListener("cartUpdated", fetchCartCount);
        return () => {
            window.removeEventListener("loginSuccess", fetchUserFromMemory);
            window.removeEventListener("logoutSuccess", fetchUserFromMemory);
            window.removeEventListener("cartUpdated", fetchCartCount);
        };
    }, []);

    // Fetch dữ liệu cho Mega Menu (Categories và Brands)
    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                // 1. Lấy danh sách Categories
                const cateRes = await getCateList();
                console.log(cateRes);
                const cateList = cateRes.data?.data || cateRes.data || cateRes || [];
                setCategories(cateList);

                // 2. Lấy danh sách Product để bóc tách Brand
                const prodRes = await getProductList();
                const dataList = prodRes.data?.data || prodRes.data || prodRes || [];

                // Trích xuất các brand (loại bỏ các giá trị null/undefined và trùng lặp)
                const uniqueBrands = [...new Set(dataList.map(item => item.brand).filter(Boolean))];
                setBrands(uniqueBrands);

            } catch (error) {
                console.error("Lỗi lấy dữ liệu menu:", error);
            }
        };
        fetchMenuData();
    }, []);

    // Hiệu ứng cuộn trang ẩn hiện Navbar
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

    const formatPrice = (basePrice) => {
        if (!basePrice) return "0";
        return basePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";
    };

    // Tìm kiếm
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim() !== "") {
                try {
                    const res = await getFilteredProducts({ keyword: searchTerm });
                    const apiResponseData = res.data;
                    const dataList = apiResponseData.items || [];
                    const top5Products = dataList.slice(0, 5);
                    const productsWithMinPrice = await Promise.all(
                        top5Products.map(async (product) => {
                            try {
                                const productId = product.productId || product.id;
                                const variantRes = await getProductVariants(productId);
                                const variants = variantRes.data?.data || variantRes.data || variantRes || [];

                                let minPrice = 0;
                                if (variants && variants.length > 0) {
                                    minPrice = Math.min(...variants.map(v => v.basePrice || 0));
                                }
                                return { ...product, minPrice };
                            } catch (err) {
                                console.error(`Lỗi lấy biến thể cho sản phẩm ${product.id}:`, err);
                                return { ...product, minPrice: 0 };
                            }
                        })
                    );
                    setSearchResults(productsWithMinPrice);
                    setTotalSearchElements(apiResponseData?.totalElements || dataList.length);
                } catch (error) {
                    console.error("Lỗi tìm kiếm:", error);
                }
            } else {
                setSearchResults([]);
                setTotalSearchElements(0);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const userMenuItems = [
        {
            key: 'account',
            label: (
                <Link to="/account" style={{ fontWeight: 500, color: 'red', padding: '5px 10px' }}>
                    Tài khoản
                </Link>
            )
        },
        ...(isAdmin ? [
            {
                key: 'admin',
                label: (
                    <Link to="/admin" style={{ fontWeight: 500, padding: '5px 10px' }}>
                        Trang quản trị
                    </Link>
                )
            }
        ] : []),
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: (
                <div onClick={handleLogout} style={{ fontWeight: 500, color: 'red', padding: '5px 10px' }}>
                    Đăng xuất
                </div>
            ),
        },
    ];

    return (
        <header className={`header-client ${show ? '' : 'hidden'}`}>
            <Link to='/' className="logo">
                <img src={logo} alt="PTIT Shoe Shop logo" />
            </Link>
            <nav className="nav">

                <Link to="/">Trang chủ</Link>

                <div className="menu-item">
                    <Link to="/productsPage" className="menu-link">
                        Sản phẩm <span className="arrow">▼</span>
                    </Link>

                    <div className="mega-menu">
                        <div className="mega-col">
                            <h4>Thương hiệu</h4>
                            <div className="mega-col-links">
                                {brands.length > 0 ? (
                                    brands.map((brand, index) => (
                                        <Link key={index} to={`/productsPage?brand=${brand}`}>
                                            {brand}
                                        </Link>
                                    ))
                                ) : (
                                    <span>Đang tải...</span>
                                )}
                            </div>
                        </div>

                        <div className="mega-col">
                            <h4>Nhu cầu sử dụng</h4>
                            <div className="mega-col-links">
                                {categories.length > 0 ? (
                                    categories.map((cate) => (
                                        <Link key={cate.categoryId || cate.id} to={`/productsPage?categoryId=${cate.categoryId || cate.id}`}>
                                            {cate.categoryName || cate.name}
                                        </Link>
                                    ))
                                ) : (
                                    <span>Đang tải...</span>
                                )}
                            </div>
                        </div>

                        {/* --- Cột 3: ĐỐI TƯỢNG (GENDER) --- */}
                        <div className="mega-col">
                            <h4>Đối tượng</h4>
                            <div className="mega-col-links">
                                {genders.map((gender) => (
                                    <Link key={gender.code} to={`/productsPage?gender=${gender.code}`}>
                                        {gender.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <Link to="/sale">Khuyến mãi</Link>
                <Link to="/blog">Blog</Link>

            </nav>

            <div className="header-client-icons">
                <div className="icon" style={{ cursor: 'pointer' }} onClick={() => setIsSearchOpen(true)}>
                    <FiSearch size={24} />
                </div>
                {isSearchOpen && (
                    <div className="search-modal-overlay">
                        <div className="search-modal-content">
                            <div className="search-modal-header">
                                <h3>TÌM KIẾM</h3>
                                <button className="close-search-btn" onClick={() => setIsSearchOpen(false)}>
                                    <FiX size={30} />
                                </button>
                            </div>

                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                                <FiSearch className="search-input-icon" size={20} color="#ccc" />
                            </div>

                            {searchResults.length > 0 && (
                                <div className="search-results-list">
                                    {searchResults.map((item) => (
                                        <div
                                            className="search-result-item"
                                            key={item.productId || item.id}
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                navigate(`/productDetail/${item.productId || item.id}`);
                                            }}
                                        >
                                            <div className="search-item-info">
                                                <div className="search-item-name">{item.name} - {item.brand || "Brand"}</div>
                                                <div className="search-item-price">{formatPrice(item.minPrice)}</div>
                                            </div>
                                            <div className="search-item-image">
                                                <img src={item.imageUrl || "placeholder.png"} alt={item.name} />
                                            </div>
                                        </div>
                                    ))}

                                    {totalSearchElements > 5 && (
                                        <div
                                            className="search-view-more"
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                navigate(`/search?keyword=${searchTerm}`);
                                            }}
                                        >
                                            Xem thêm {totalSearchElements - 5} sản phẩm
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {userProfile ? (
                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                        <div className="icon" title={userProfile.username} style={{ cursor: 'pointer' }}>
                            <img
                                src={userProfile.avatarImage}
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

                {/* Cart */}
                {isLoggedIn && (
                    <Link to="/cart" className="icon cart-icon">
                        <FiShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span className="cart-badge">{cartCount}</span>
                        )}
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;