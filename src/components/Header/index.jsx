import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiShoppingCart, FiSearch, FiLogOut, FiSettings, FiX, FiUser as FiProfile, FiMenu } from 'react-icons/fi';
import "./header.css";

import { getCateList } from "../../services/cateService";
import { getFilteredProducts, getProductVariants } from "../../services/productService";
import { getMyCart } from "../../services/cartService";
import { logout } from "../../services/authService";
import { getCurrentUser, clearAccessToken, clearCurrentUser } from "../../utils/tokenStore";
import { Dropdown, message } from "antd";

import logo from "../../images/logoPtitShoesShoppng.png";

const Header = () => {
    const navigate = useNavigate();

    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [cartCount, setCartCount] = useState(0);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [totalSearchElements, setTotalSearchElements] = useState(0);

    const [categories, setCategories] = useState([]);

    const isLoggedIn = !!userProfile;
    const adminRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "INVENTORY_MANAGER", "SELLER"];
    const isAdmin = userProfile && adminRoles.some(role => {
        const userRole = userProfile.roleCode || "";
        return userRole === role || userRole === `ROLE_${role}`;
    });

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

    useEffect(() => {
        fetchUserFromMemory();
        fetchCartCount();

        const handleLoginSuccess = () => {
            fetchUserFromMemory();
            fetchCartCount();
        };

        const handleLogoutSuccess = () => {
            fetchUserFromMemory();
            setCartCount(0);
        };

        window.addEventListener("loginSuccess", handleLoginSuccess);
        window.addEventListener("logoutSuccess", handleLogoutSuccess);
        window.addEventListener("cartUpdated", fetchCartCount);

        return () => {
            window.removeEventListener("loginSuccess", handleLoginSuccess);
            window.removeEventListener("logoutSuccess", handleLogoutSuccess);
            window.removeEventListener("cartUpdated", fetchCartCount);
        };
    }, []);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const cateRes = await getCateList();
                const cateList = cateRes.data?.data || cateRes.data || cateRes || [];
                setCategories(Array.isArray(cateList) ? cateList : []);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu menu:", error);
            }
        };

        fetchMenuData();
    }, []);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== "undefined") {
                if (window.scrollY > lastScrollY && window.scrollY > 50) {
                    setShow(false);
                } else {
                    setShow(true);
                }
                setLastScrollY(window.scrollY);
            }
        };

        window.addEventListener("scroll", controlNavbar);
        return () => window.removeEventListener("scroll", controlNavbar);
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
        if (!basePrice) return "0đ";
        return basePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";
    };

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
                                    minPrice = Math.min(...variants.map((v) => v.basePrice || 0));
                                }

                                return { ...product, minPrice };
                            } catch (err) {
                                return { ...product, minPrice: 0 };
                            }
                        })
                    );

                    setSearchResults(productsWithMinPrice);
                    setTotalSearchElements(apiResponseData?.total || dataList.length);
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

    const mainMenus = ["Nam", "Nữ", "Bé trai", "Bé gái"];

    const getCategoryId = (cate) => cate?.categoryId || cate?.id;
    const getParentId = (cate) => cate?.parentId;

    const getChildrenOfParent = (parentId) => {
        return categories.filter((child) => {
            const childParentId = getParentId(child);
            if (Array.isArray(childParentId)) {
                return childParentId.includes(parentId);
            }
            return childParentId === parentId;
        });
    };

    const userMenuItems = [
        {
            key: "account",
            label: (
                <Link to="/account" style={{ fontWeight: 500, color: "red", padding: "5px 10px" }}>
                    Tài khoản
                </Link>
            ),
        },
        ...(isAdmin
            ? [
                {
                    key: "admin",
                    label: (
                        <Link to="/admin" style={{ fontWeight: 500, padding: "5px 10px" }}>
                            Trang quản trị
                        </Link>
                    ),
                },
            ]
            : []),
        { type: "divider" },
        {
            key: "logout",
            label: (
                <div onClick={handleLogout} style={{ fontWeight: 500, color: "red", padding: "5px 10px" }}>
                    Đăng xuất
                </div>
            ),
        },
    ];

    return (
        <header className={`header-client ${show ? '' : 'hidden'}`}>
            <div className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
            </div>

            <Link to='/' className="logo">
                <img src={logo} alt="PTIT Shoe Shop logo" />
            </Link>

            <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <Link to="/sale" className="nav-highlight">Khuyến mãi</Link>

                {mainMenus.map((menuName, index) => {
                    const parentCate = categories.find(
                        (c) => c.categoryName?.trim().toLowerCase() === menuName.trim().toLowerCase()
                    );

                    if (!parentCate) {
                        return (
                            <div className="menu-item" key={index}>
                                <span className="menu-link">{menuName}</span>
                            </div>
                        );
                    }

                    const parentId = getCategoryId(parentCate);
                    const childCategories = getChildrenOfParent(parentId);

                    return (
                        <div className="menu-item" key={parentId}>
                            <Link
                                to={`/productsPage?categoryId=${parentId}`}
                                className="menu-link"
                            >
                                {menuName} {childCategories.length > 0 && <span className="arrow">▼</span>}
                            </Link>

                            {childCategories.length > 0 && (
                                <div className="simple-dropdown">
                                    {childCategories.map((child) => (
                                        <Link
                                            key={getCategoryId(child)}
                                            to={`/productsPage?categoryId=${getCategoryId(child)}`}
                                        >
                                            {child.categoryName}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
            </nav>

            <div className="header-client-icons">
                <div className="icon" style={{ cursor: "pointer" }} onClick={() => setIsSearchOpen(true)}>
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
                                                <div className="search-item-name">
                                                    {item.name} - {item.brand || "Brand"}
                                                </div>
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
                                                navigate(`/search?keyword=${encodeURIComponent(searchTerm)}`);
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
                    <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
                        <div className="icon" title={userProfile.username} style={{ cursor: "pointer" }}>
                            <img
                                src={userProfile.avatarImage}
                                alt="avatar"
                                style={{
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "1px solid #ddd",
                                }}
                            />
                        </div>
                    </Dropdown>
                ) : (
                    <Link to="/login" className="icon">
                        <FiUser size={26} />
                    </Link>
                )}

                {isLoggedIn && (
                    <Link to="/cart" className="icon cart-icon">
                        <FiShoppingCart size={24} />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;