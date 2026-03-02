import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
    getProductById, 
    getProductVariants, 
    getVariantImages 
} from "../../services/productService"; 
import "./ProductVariant.css";

function ProductDetail() {
    const { id: productId } = useParams(); // Lấy ID sản phẩm từ URL
    
    // States lưu trữ dữ liệu
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [images, setImages] = useState([]);
    
    // States quản lý UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // States tương tác
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [activeVariant, setActiveVariant] = useState(null);

    // EFFECT 1: Lấy thông tin Product và danh sách Variants khi vào trang
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                // Gọi song song 2 API độc lập để tối ưu tốc độ
                const [productData, variantsData] = await Promise.all([
                    getProductById(productId),
                    getProductVariants(productId)
                ]);
                
                // Backend của bạn trả về data trực tiếp (ResponseEntity.ok().body)
                setProduct(productData.data || []); 
                setVariants(variantsData.data || []);

                // Nếu sản phẩm có biến thể, chọn cái đầu tiên làm mặc định
                if (variantsData && variantsData.length > 0) {
                    setActiveVariant(variantsData[0]);
                    setSelectedSize(variantsData[0].size);
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setError("Không thể tải thông tin sản phẩm lúc này.");
            } finally {
                setLoading(false);
            }
        };

        if (productId) fetchInitialData();
    }, [productId]);

    // EFFECT 2: Lấy hình ảnh mỗi khi Variant thay đổi
    useEffect(() => {
        const fetchImagesForVariant = async () => {
            if (!activeVariant || !productId) return;
            
            try {
                const imagesData = await getVariantImages(productId, activeVariant.productVariantId);
                setImages(imagesData.data || []);

                // Set ảnh mặc định (ưu tiên ảnh primary)
                if (imagesData && imagesData.length > 0) {
                    const primaryImg = imagesData.find(img => img.isPrimary) || imagesData[0];
                    setSelectedImage(primaryImg.imageURL);
                } else {
                    // Fallback về ảnh đại diện của product nếu variant không có ảnh
                    setSelectedImage(product?.imageUrl || "");
                }
            } catch (err) {
                console.error("Lỗi khi tải ảnh biến thể:", err);
            }
        };

        fetchImagesForVariant();
    }, [activeVariant, productId, product]); // Chạy lại khi activeVariant thay đổi

    // Xử lý sự kiện người dùng
    const handleQuantityChange = (type) => {
        if (type === "decrease" && quantity > 1) setQuantity(quantity - 1);
        if (type === "increase" && quantity < (activeVariant?.quantity || 1)) setQuantity(quantity + 1);
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setQuantity(1); // Reset số lượng về 1
        
        // Tìm và set lại variant mới
        const newVariant = variants.find(v => v.size === size);
        if (newVariant) setActiveVariant(newVariant);
    };

    // Render các trạng thái
    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải dữ liệu sản phẩm...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
    if (!product) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Không tìm thấy sản phẩm.</div>;

    return (
        <div className="pro-container">
            {/* --- Cột trái: Hình ảnh --- */}
            <div className="pro-left">
                <div className="pro-thumbnail-list">
                    {images.map((img) => (
                        <div 
                            key={img.imageId} 
                            className={`pro-thumbnail ${selectedImage === img.imageURL ? 'active' : ''}`}
                            onClick={() => setSelectedImage(img.imageURL)}
                        >
                            <img src={img.imageURL} alt="Thumbnail" />
                        </div>
                    ))}
                </div>
                <div className="pro-main-image">
                    {selectedImage ? (
                        <img src={selectedImage} alt={product.name} />
                    ) : (
                        <div>Chưa có hình ảnh</div>
                    )}
                </div>
            </div>

            {/* --- Cột phải: Thông tin --- */}
            <div className="pro-right">
                <div className="pro-header">
                    <h1 className="pro-name">{product.name}</h1>
                    <div className="pro-brand">
                        <span>Thương hiệu: <strong>{product.brand}</strong></span>
                        <span className="divider">|</span>
                        <span>Mã: {activeVariant?.sku || "Đang cập nhật"}</span>
                    </div>
                </div>

                <div className="pro-price-box">
                    <div className="pro-price-current">
                        {activeVariant?.basePrice?.toLocaleString('vi-VN')}đ
                    </div>
                </div>

                {/* Các khu vực Khuyến mãi, Màu sắc giữ nguyên */}
                <div className="pro-color">
                    <span className="label">Màu Sắc : <strong>{activeVariant?.color || "Đang cập nhật"}</strong></span>
                    <div className="color-options">
                        <div className="color-circle active" title={activeVariant?.color}></div>
                    </div>
                </div>

                <div className="pro-size">
                    <span className="label">Kích Thước : <strong>US {selectedSize}</strong></span>
                    <div className="size-grid">
                        {variants.map((variant) => (
                            <div 
                                key={variant.productVariantId} 
                                className={`size-item ${selectedSize === variant.size ? 'active' : ''} ${variant.quantity === 0 ? 'out-of-stock' : ''}`}
                                onClick={() => variant.quantity > 0 && handleSizeSelect(variant.size)}
                            >
                                US {variant.size}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pro-quantity">
                    <span className="label">Số lượng (Còn lại: {activeVariant?.quantity || 0})</span>
                    <div className="quantity-control">
                        <button onClick={() => handleQuantityChange("decrease")}>-</button>
                        <input type="text" value={quantity} readOnly />
                        <button onClick={() => handleQuantityChange("increase")}>+</button>
                    </div>
                </div>

                <div className="pro-action">
                    <button className="btn-buy-now" disabled={!activeVariant || activeVariant.quantity === 0}>
                        <span className="icon">💳</span> MUA NGAY
                    </button>
                    <button className="btn-add-cart" disabled={!activeVariant || activeVariant.quantity === 0}>
                        <span className="icon">🛒</span> THÊM VÀO GIỎ
                    </button>
                </div>

                <div className="pro-des">
                    <details open>
                        <summary>Đặc điểm nổi bật</summary>
                        <p>{product.description}</p>
                    </details>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;