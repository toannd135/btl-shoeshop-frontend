import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
    getProductById, 
    getProductVariants, 
    getVariantImages 
} from "../../services/productService"; 
import "./ProductDetail.css";

const getColorStyle = (colorString) => {
    if (!colorString) return "#ccc";
    if (colorString.startsWith("#")) return colorString;
    
    const colorMap = {
        "ĐEN": "#000000", "TRẮNG": "#ffffff", "XÁM": "#808080", 
        "ĐỎ": "#ff0000", "XANH": "#0000ff", "VÀNG": "#ffff00", 
        "NÂU": "#8B4513", "HỒNG": "#FFC0CB"
    };
    return colorMap[colorString.toUpperCase()] || "#ccc"; 
};

function ProductDetail() {
    const { id: productId } = useParams(); 

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [images, setImages] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [selectedImage, setSelectedImage] = useState("");
    
    const [availableColors, setAvailableColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    
    const [quantity, setQuantity] = useState(1);
    const [activeVariant, setActiveVariant] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [productData, variantsData] = await Promise.all([
                    getProductById(productId),
                    getProductVariants(productId)
                ]);
                
                setProduct(productData.data || []); 
                const variantsList = variantsData.data || [];
                setVariants(variantsList);

                if (variantsList.length > 0) {
                    const uniqueColors = [...new Set(variantsList.map(v => v.color))];
                    setAvailableColors(uniqueColors);
                    
                    const initialColor = uniqueColors[0];
                    setSelectedColor(initialColor);
                    
                    const initialVariantsOfColor = variantsList.filter(v => v.color === initialColor);
                    setSelectedSize(initialVariantsOfColor[0].size);
                    setActiveVariant(initialVariantsOfColor[0]);
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

    useEffect(() => {
        const fetchAllVariantImages = async () => {
            if (variants.length === 0 || !productId) return;
            
            try {
                const variantIds = [...new Set(variants.map(v => v.productVariantId))];
                const imagePromises = variantIds.map(vId => getVariantImages(productId, vId));
                const imagesResults = await Promise.all(imagePromises);

                let allImages = [];
                imagesResults.forEach(res => {
                    const imgs = res.data || [];
                    allImages = [...allImages, ...imgs];
                });
                setImages(allImages);
                if (product?.imageUrl) {
                    setSelectedImage(product.imageUrl);
                } else if (allImages.length > 0) {
                    setSelectedImage(allImages[0].imageURL);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách ảnh:", err);
            }
        };

        fetchAllVariantImages();
    }, [variants, productId, product]);

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setQuantity(1);

        const variantsOfNewColor = variants.filter(v => v.color === color);
        const sizeExistsInNewColor = variantsOfNewColor.find(v => v.size === selectedSize);
        const newSize = sizeExistsInNewColor ? selectedSize : variantsOfNewColor[0].size;
        
        const newActiveVariant = variantsOfNewColor.find(v => v.size === newSize);
        setSelectedSize(newSize);
        setActiveVariant(newActiveVariant);
        if (newActiveVariant && images.length > 0) {
            const variantImages = images.filter(img => img.productVariantId === newActiveVariant.productVariantId);
            if (variantImages.length > 0) {
                const primaryImg = variantImages.find(img => img.isPrimary) || variantImages[0];
                setSelectedImage(primaryImg.imageURL);
            }
        }
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setQuantity(1); 
        const newVariant = variants.find(v => v.color === selectedColor && v.size === size);
        if (newVariant) setActiveVariant(newVariant);
    };

    const handleQuantityChange = (type) => {
        if (type === "decrease" && quantity > 1) setQuantity(quantity - 1);
        if (type === "increase" && quantity < (activeVariant?.quantity || 1)) setQuantity(quantity + 1);
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải dữ liệu sản phẩm...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
    if (!product) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Không tìm thấy sản phẩm.</div>;

    const availableSizesForSelectedColor = variants.filter(v => v.color === selectedColor);
    const uniqueThumbnails = [];
    const seenUrls = new Set();

    if (product?.imageUrl) {
        seenUrls.add(product.imageUrl);
        uniqueThumbnails.push({
            imageId: 'main-product-img', 
            imageURL: product.imageUrl
        });
    }

    images.forEach(img => {
        if (!seenUrls.has(img.imageURL)) {
            seenUrls.add(img.imageURL);
            uniqueThumbnails.push(img);
        }
    });

    return (
        <div>
            <div className="pro-breadcrumb" style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px', color: '#666', fontSize: '14px' }}>
                <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Trang chủ</Link> 
                <span style={{ margin: '0 10px' }}>/</span> 
                <span>{product.name}</span>
            </div>

            <div className="pro-container">
                <div className="pro-left">
                    <div className="pro-thumbnail-list">
                        {uniqueThumbnails.length > 0 ? uniqueThumbnails.map((img, index) => (
                            <div 
                                key={img.imageId || index} 
                                className={`pro-thumbnail ${selectedImage === img.imageURL ? 'active' : ''}`}
                                onClick={() => setSelectedImage(img.imageURL)}
                            >
                                <img src={img.imageURL} alt="Thumbnail" />
                            </div>
                        )) : (
                            <div className="pro-thumbnail active">
                                <img src={product.imageUrl} alt="Thumbnail" />
                            </div>
                        )}
                    </div>
                    <div className="pro-main-image">
                        {selectedImage ? (
                            <img src={selectedImage} alt={product.name} />
                        ) : (
                            <div>Chưa có hình ảnh</div>
                        )}
                    </div>
                </div>

                <div className="pro-right">
                    <div className="pro-header">
                        <h1 className="pro-name">{product.name}</h1>
                        <div className="pro-brand">
                            <span>Thương hiệu: <strong>{product.brand || "Đang cập nhật"}</strong></span>
                            <span className="divider">|</span>
                            <span>Mã sản phẩm: {activeVariant?.sku || "Đang cập nhật"}</span>
                        </div>
                    </div>

                    <div className="pro-price-box">
                        <div className="pro-price-current">
                            {activeVariant?.basePrice?.toLocaleString('vi-VN')}đ
                        </div>
                    </div>

                    {availableColors.length > 0 && (
                        <div className="pro-color">
                            <span className="label">Màu Sắc : <strong>{selectedColor}</strong></span>
                            <div className="color-options">
                                {availableColors.map(color => (
                                    <div 
                                        key={color}
                                        className={`color-circle ${selectedColor === color ? 'active' : ''}`} 
                                        style={{ backgroundColor: getColorStyle(color) }}
                                        title={color}
                                        onClick={() => handleColorSelect(color)}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pro-size">
                        <span className="label">Kích Thước : <strong>US {selectedSize}</strong></span>
                        <div className="size-grid">
                            {availableSizesForSelectedColor.map((variant) => (
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

                    {product.description && (
                        <div className="pro-des">
                            <details open>
                                <summary>Đặc điểm nổi bật</summary>
                                <p>{product.description}</p>
                            </details>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;