import { useState, useEffect } from "react";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getFilteredProducts, getProductVariants } from "../../services/productService";
import "./Search.css";

function Search() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Hiệu ứng "Gõ đến đâu tìm đến đó" (Debounce 500ms để tránh gọi API liên tục)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim() !== "") {
                setLoading(true);
                try {
                    const res = await getFilteredProducts({ keyword: searchTerm });
                    const dataList = res.data?.items || res.data || [];
                    
                    // Cắt lấy tối đa 5 sản phẩm
                    const top5 = dataList.slice(0, 5);

                    // Lấy giá min của từng sản phẩm thông qua variant
                    const formattedResults = await Promise.all(
                        top5.map(async (product) => {
                            try {
                                const productId = product.productId || product.id;
                                const variantRes = await getProductVariants(productId);
                                const variants = variantRes.data?.data || variantRes.data || [];
                                let minPrice = 0;
                                if (variants.length > 0) {
                                    minPrice = Math.min(...variants.map(v => v.basePrice || 0));
                                }
                                return { ...product, minPrice };
                            } catch (err) {
                                return { ...product, minPrice: 0 };
                            }
                        })
                    );
                    setSearchResults(formattedResults);
                } catch (error) {
                    console.error("Lỗi tìm kiếm:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500); // Đợi 0.5s sau khi ngừng gõ mới gọi API

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Format tiền tệ
    const formatPrice = (price) => {
        if (!price) return "0 ₫";
        return price.toLocaleString('vi-VN') + " ₫";
    };

    // Đóng Modal và clear dữ liệu
    const handleClose = () => {
        setIsModalOpen(false);
        setSearchTerm("");
        setSearchResults([]);
    };

    return (
        <>
            {/* Thanh Search mồi hiển thị trên Header */}
            <div className="header__search" onClick={() => setIsModalOpen(true)}>
                <SearchOutlined className="search__icon" />
                <span className="search__placeholder">Tìm kiếm...</span>
            </div>

            {/* Modal Overlay (Hiển thị như Ảnh 1) */}
            {isModalOpen && (
                <div className="search-modal-overlay" onClick={handleClose}>
                    <div className="search-modal-container" onClick={e => e.stopPropagation()}>
                        
                        <div className="search-modal-header">
                            <h3>TÌM KIẾM</h3>
                            <CloseOutlined className="search-close-icon" onClick={handleClose} />
                        </div>

                        <div className="search-modal-input-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <SearchOutlined className="search-modal-icon" />
                        </div>

                        {loading && <div className="search-loading">Đang tìm kiếm...</div>}

                        {/* Danh sách kết quả (Hiển thị như Ảnh 2) */}
                        {!loading && searchResults.length > 0 && (
                            <div className="search-results-list">
                                {searchResults.map((item) => (
                                    <div
                                        className="search-result-item"
                                        key={item.productId || item.id}
                                        onClick={() => {
                                            handleClose();
                                            navigate(`/productDetail/${item.productId || item.id}`);
                                        }}
                                    >
                                        <div className="search-item-image">
                                            <img src={item.imageUrl || "https://placehold.co/60"} alt={item.name} />
                                        </div>
                                        <div className="search-item-info">
                                            <div className="search-item-name">{item.name}</div>
                                            <div className="search-item-price">{formatPrice(item.minPrice)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && searchTerm.trim() !== "" && searchResults.length === 0 && (
                            <div className="search-loading">Không tìm thấy sản phẩm nào.</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Search;