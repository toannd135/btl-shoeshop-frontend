import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./header.css";
import { getProductList } from "../../services/productService"; 

const Header = () => {
    const [products, setProducts] = useState([]);

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

    return (
        <header className="home-header">
            <div className="home-logo">PTIT<span>SNEAKER</span></div>

            <nav className="home-nav">
                <Link to="/home">Trang chủ</Link>
                
                <div className="nav-item-dropdown">
                    <Link to="/products" className="nav-link-main">Sản phẩm</Link>
                    
                    <div className="dropdown-content">
                        {products.length > 0 ? (
                            products.map((item) => (
                                <Link 
                                    key={item.productId || item.id} 
                                    to={`/productDetail/${item.productId || item.id}`}
                                    className="dropdown-item"
                                >
                                    {item.name}
                                </Link>
                            ))
                        ) : (
                            <span className="dropdown-item">Đang tải...</span>
                        )}
                    </div>
                </div>

                <Link to="/sale">Khuyến mãi</Link>
                <Link to="/blog">Blog</Link>
            </nav>

            <div className="home-header-icons">
                <Link to="/login" className="home-icon">Login</Link>
                <Link to="/cart" className="home-icon">Giỏ hàng</Link>
            </div>
        </header>
    );
};

export default Header;