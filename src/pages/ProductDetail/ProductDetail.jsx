import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    getProductById,
    getProductVariants,
    getVariantImages,
    getRecommendedProducts
} from "../../services/productService";
import { getCouponList } from "../../services/couponService";
import "./ProductDetail.css";
import { getMyCart, addToCart } from "../../services/cartService";
import { getAccessToken, getCurrentUser } from "../../utils/tokenStore";
import { getReviews, createReview } from "../../services/reviewService";

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

// Hàm hỗ trợ format tiền
const formatMoneyK = (value) => {
    if (!value) return "0đ";
    if (value >= 1000) return (value / 1000) + "k";
    return value + "đ";
};

// Hàm format mô tả coupon
// Hàm format mô tả coupon chuẩn theo Enum Backend
const getCouponDescription = (coupon) => {
    const type = coupon.discountType; // Lấy đúng Enum từ backend
    let desc = "";

    // 1. Xử lý giá trị giảm dựa theo loại
    if (type === "PERCENTAGE") {
        desc = `Giảm ${coupon.discountValue}%`;
    } else if (type === "FIXED_AMOUNT") {
        desc = `Giảm ${formatMoneyK(coupon.discountValue)}`;
    } else if (type === "FREE_SHIPPING") {
        desc = "Miễn phí vận chuyển";
    }

    // 2. Xử lý điều kiện đơn hàng tối thiểu
    if (coupon.minOrderValue && coupon.minOrderValue > 0) {
        desc += ` cho đơn hàng tối thiểu ${formatMoneyK(coupon.minOrderValue)}.`;
    } else {
        desc += ".";
    }

    // 3. Xử lý giới hạn giảm tối đa 
    // (Thường Fixed Amount không cần cái này vì nó giảm số tiền cố định rồi)
    if (coupon.maxDiscount && coupon.maxDiscount > 0 && type !== "FIXED_AMOUNT") {
        desc += ` Mã giảm tối đa ${formatMoneyK(coupon.maxDiscount)}`;
    }

    return desc;
};

// Hàm format ngày tháng
const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
};

const SuggestedProductCard = ({ prod }) => {
    const navigate = useNavigate();
    const [price, setPrice] = useState(0);

    useEffect(() => {
        const fetchVariantPrice = async () => {
            try {
                const res = await getProductVariants(prod.productId);
                const variantsList = res?.data || res || [];

                if (variantsList.length > 0) {
                    setPrice(variantsList[0].basePrice || 0);
                }
            } catch (err) {
                console.error("Lỗi lấy giá sản phẩm gợi ý:", err);
            }
        };

        if (prod?.productId) {
            fetchVariantPrice();
        }
    }, [prod.productId]);

    return (
        <div
            className="suggested-card"
            onClick={() => navigate(`/product/${prod.productId}`)}
        >
            <div className="suggested-img-box">
                <img
                    src={prod.imageUrl}
                    alt={prod.name}
                />
            </div>
            <div className="suggested-info">
                <h4 className="suggested-name">{prod.name}</h4>
                <p className="suggested-price">
                    {price > 0 ? `${price.toLocaleString('vi-VN')}đ` : "Đang cập nhật"}
                </p>
            </div>
        </div>
    );
};

function ProductDetail() {
    const { id: productId } = useParams();
    const navigate = useNavigate();
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
    const [showCartModal, setShowCartModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [cartSummary, setCartSummary] = useState({ totalPrice: 0, totalItems: 0 });

    // --- STATE QUẢN LÝ COUPON ---
    const [coupons, setCoupons] = useState([]);
    const [showAllCoupons, setShowAllCoupons] = useState(false); // Mở danh sách mã (Ảnh 3)
    const [selectedCoupon, setSelectedCoupon] = useState(null);  // Mở chi tiết mã (Ảnh 2)

    // --- STATE QUẢN LÝ ĐÁNH GIÁ ---
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ avgRating: 0, totalElements: 0, ratingCounts: [] });
    const [newReview, setNewReview] = useState({ rating: 5, note: "" });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState("");

    const sliderRef = useRef(null);
    const [suggestedProducts, setSuggestedProducts] = useState([]);

    const fetchReviews = async () => {
        try {
            const res = await getReviews({ productId, page: 1, sizePerPage: 100 });
            const data = res?.data || res;
            const items = data.items || [];
            setReviews(items);

            const total = items.length;
            const avg = total > 0 ? items.reduce((sum, r) => sum + r.rating, 0) / total : 0;
            const counts = [5, 4, 3, 2, 1].map(star => {
                const count = items.filter(r => r.rating === star).length;
                const percent = total > 0 ? (count / total) * 100 : 0;
                return { star, count, percent };
            });

            setReviewStats({ avgRating: avg, totalElements: total, ratingCounts: counts });
        } catch (err) {
            console.error("Lỗi lấy danh sách đánh giá:", err);
        }
    };

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (sliderRef.current) {
                const slider = sliderRef.current;
                const scrollAmount = 260;
                if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
                    slider.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // 1. LẤY SẢN PHẨM VÀ BIẾN THỂ (Bắt buộc phải có)
                const [productData, variantsData, recommendData] = await Promise.all([
                    getProductById(productId),
                    getProductVariants(productId),
                    getRecommendedProducts()
                ].map(p => p.catch(e => e)));

                setProduct(productData.data || productData || []);
                const variantsList = variantsData.data || variantsData || [];
                setVariants(variantsList);
                const recList = recommendData.data || [];
                setSuggestedProducts(recList);

                if (variantsList.length > 0) {
                    const uniqueColors = [...new Set(variantsList.map(v => v.color))];
                    setAvailableColors(uniqueColors);

                    const initialColor = uniqueColors[0];
                    setSelectedColor(initialColor);

                    const initialVariantsOfColor = variantsList.filter(v => v.color === initialColor);
                    setSelectedSize(initialVariantsOfColor[0].size);
                    setActiveVariant(initialVariantsOfColor[0]);
                }

                // 2. LẤY MÃ GIẢM GIÁ ĐỘC LẬP (Lỗi thì bỏ qua, không làm sập trang)
                try {
                    const couponsData = await getCouponList();
                    // Xử lý thông minh: Quét cả .data.content, .data hoặc chính nó
                    const fetchedCoupons = couponsData?.data?.content || couponsData?.data || couponsData || [];

                    if (Array.isArray(fetchedCoupons)) {
                        setCoupons(fetchedCoupons);
                    }
                } catch (couponError) {
                    console.error("Lỗi tải mã giảm giá, bỏ qua hiển thị coupon:", couponError);
                    setCoupons([]); // Đưa về rỗng để ẩn UI đi
                }

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu sản phẩm:", err);
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

    const closeModal = () => {
        setShowCartModal(false);
    };

    const handleAddToCart = async () => {
        if (!activeVariant) return;

        if (!getAccessToken()) {
            navigate("/login");
            return;
        }

        const user = getCurrentUser();
        if (!user) {
            alert("Không lấy được thông tin người dùng, vui lòng đăng nhập lại!");
            return;
        }

        try {
            const payload = {
                variantId: activeVariant.productVariantId,
                quantity: quantity
            };

            const response = await addToCart(payload);

            if (response.statusCode === 200) {
                const cartData = await getMyCart();
                const items = cartData.data?.items || [];
                const total = items.reduce(
                    (sum, item) =>
                        sum + ((item.variant?.price || 0) * item.quantity),
                    0
                );

                setCartSummary({
                    totalPrice: total,
                    totalItems: items.length
                });

                setShowSuccessModal(true);
                window.dispatchEvent(new Event("cartUpdated"));
            }
        } catch (err) {
            console.error("Lỗi chi tiết khi thêm vào giỏ:", err); // <-- Thêm dòng này
            alert(err.response?.data?.message || err.message || "Lỗi khi thêm vào giỏ hàng");
        }
    };

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

    const handleThumbnailClick = (img) => {
        setSelectedImage(img.imageURL);
        if (img.productVariantId) {
            const matchedVariant = variants.find(v => v.productVariantId === img.productVariantId);

            if (matchedVariant) {
                if (selectedColor !== matchedVariant.color) {
                    setSelectedColor(matchedVariant.color);
                }
                setSelectedSize(matchedVariant.size);
                setActiveVariant(matchedVariant);
                setQuantity(1);
            }
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Đã sao chép mã: ${code}`);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!getAccessToken()) {
            navigate("/login");
            return;
        }
        if (!activeVariant) {
            setReviewError("Vui lòng chọn loại sản phẩm để đánh giá.");
            return;
        }
        if (!newReview.note.trim()) {
            setReviewError("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        setSubmittingReview(true);
        setReviewError("");

        try {
            await createReview(activeVariant.productVariantId, newReview);
            setNewReview({ rating: 5, note: "" });
            fetchReviews();
            alert("Đã gửi đánh giá thành công!");
        } catch (err) {
            console.error(err);
            setReviewError(err.response?.data?.message || err.message || "Có lỗi xảy ra khi gửi đánh giá.");
        } finally {
            setSubmittingReview(false);
        }
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
                                onClick={() => handleThumbnailClick(img)}
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

                    {/* VÙNG HIỂN THỊ MÃ GIẢM GIÁ (NẰM TRÊN MÀU SẮC) */}
                    {coupons.length > 0 && (
                        <div className="pro-coupon-section">
                            <span className="coupon-label-text">Mã giảm giá</span>
                            <div className="coupon-tags-wrapper">
                                {coupons.slice(0, 3).map(coupon => (
                                    <div
                                        key={coupon.couponId}
                                        className="coupon-tag"
                                        onClick={() => setShowAllCoupons(true)} // MỞ DANH SÁCH
                                    >
                                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M1.33333 0C0.596954 0 0 0.596954 0 1.33333V3.53504C0.771617 3.80585 1.33333 4.53765 1.33333 5.40562C1.33333 6.27359 0.771617 7.00538 0 7.2762V10.6667C0 11.403 0.596954 12 1.33333 12H14.6667C15.403 12 16 11.403 16 10.6667V7.2762C15.2284 7.00538 14.6667 6.27359 14.6667 5.40562C14.6667 4.53765 15.2284 3.80585 16 3.53504V1.33333C16 0.596954 15.403 0 14.6667 0H1.33333ZM4.66667 3.33333H3.33333V4.66667H4.66667V3.33333ZM3.33333 5.33333H4.66667V6.66667H3.33333V5.33333ZM4.66667 7.33333H3.33333V8.66667H4.66667V7.33333Z" fill="#F59E0B" />
                                        </svg>
                                        {coupon.code}
                                    </div>
                                ))}
                                <button className="coupon-arrow-btn" onClick={() => setShowAllCoupons(true)}>
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CHỌN MÀU SẮC */}
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

                    {/* CHỌN KÍCH THƯỚC */}
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

                    {/* CHỌN SỐ LƯỢNG */}
                    <div className="pro-quantity">
                        <span className="label">Số lượng (Còn lại: {activeVariant?.quantity || 0})</span>
                        <div className="quantity-control">
                            <button onClick={() => handleQuantityChange("decrease")}>-</button>
                            <input type="text" value={quantity} readOnly />
                            <button onClick={() => handleQuantityChange("increase")}>+</button>
                        </div>
                    </div>

                    {/* NÚT MUA HÀNG */}
                    <div className="pro-action">
                        <button className="btn-buy-now" disabled={!activeVariant || activeVariant.quantity === 0}>
                            <span className="icon">💳</span> MUA NGAY
                        </button>
                        <button className="btn-add-cart" onClick={handleAddToCart} disabled={!activeVariant || activeVariant.quantity === 0}>
                            <span className="icon">🛒</span> THÊM VÀO GIỎ
                        </button>
                        {showSuccessModal && (
                            <div className="cart-modal-overlay">
                                <div className="cart-modal-content">
                                    <button className="close-btn" onClick={closeModal}>×</button>
                                    <div className="modal-header-success">
                                        <div className="modal-header-success">
                                            ✓ Thêm vào giỏ hàng thành công
                                        </div>
                                    </div>
                                    <div className="modal-body-product">
                                        <img src={selectedImage} alt="product" width="80" />
                                        <div>
                                            <h4>{product.name}</h4>
                                            <p>{selectedColor} / US {selectedSize}</p>
                                        </div>
                                    </div>
                                    <div className="modal-footer-summary">
                                        <div className="summary-row">
                                            <span>
                                                Giỏ hàng hiện có <b>{cartSummary.totalItems}</b> sản phẩm
                                            </span>

                                            <span className="total-red">
                                                {cartSummary.totalPrice?.toLocaleString()}đ
                                            </span>
                                        </div>
                                        <div className="modal-actions">
                                            <button className="btn-back" onClick={() => setShowSuccessModal(false)}>Quay lại</button>
                                            <button className="btn-view-cart" onClick={() => navigate("/cart")}>Xem giỏ hàng</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MÔ TẢ SẢN PHẨM */}
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

            {/* DRAWER: DANH SÁCH MÃ GIẢM GIÁ (ẢNH 3) */}
            {showAllCoupons && (
                <div className="coupon-drawer-overlay" onClick={() => setShowAllCoupons(false)}>
                    <div className="coupon-drawer-content" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header">
                            <button className="back-btn" onClick={() => setShowAllCoupons(false)}>←</button>
                            <h3>Chọn mã giảm giá</h3>
                        </div>
                        <div className="drawer-body">
                            {coupons.map(coupon => (
                                <div
                                    className="drawer-coupon-card"
                                    key={coupon.couponId}
                                    onClick={() => setSelectedCoupon(coupon)} // NHẤN VÀO THẺ MỞ CHI TIẾT
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="card-left">
                                        <span className="card-badge">{coupon.code}</span>
                                        <h4 className="card-code">{coupon.code}</h4>
                                        <p className="card-desc">{getCouponDescription(coupon)}</p>
                                        <span className="card-date">HSD: {formatDate(coupon.expiresAt)}</span>
                                        <button className="card-action-btn" onClick={(e) => {
                                            e.stopPropagation(); // Ngăn không cho nổi bọt lên mở popup chi tiết
                                            handleCopyCode(coupon.code);
                                            setShowAllCoupons(false);
                                        }}>
                                            Dùng ngay
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: CHI TIẾT MÃ GIẢM GIÁ (ẢNH 2) */}
            {selectedCoupon && (
                <div className="coupon-modal-overlay" onClick={() => setSelectedCoupon(null)}>
                    <div className="coupon-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedCoupon(null)}>✕</button>
                        <h2 className="modal-title">{selectedCoupon.code}</h2>
                        <p className="modal-desc">{getCouponDescription(selectedCoupon)}</p>

                        <div className="coupon-code-box">
                            <span className="code-text">{selectedCoupon.code}</span>
                        </div>

                        <div className="coupon-conditions">
                            <p>- Đồng giá 2 triệu cho nhóm sản phẩm Set combo</p>
                            <p>- Tổng giá trị sản phẩm từ 5 triệu trở lên</p>
                            {/* Bạn có thể render thêm các điều kiện lấy từ backend tại đây */}
                        </div>

                        <button className="copy-btn" onClick={() => {
                            handleCopyCode(selectedCoupon.code);
                            setSelectedCoupon(null);
                        }}>
                            Sao chép mã
                        </button>
                    </div>
                </div>
            )}
            <div className="review-wrapper">
                <div className="rating-summary">

                    <div className="rating-left">
                        <div className="rating-score">
                            {reviewStats.avgRating.toFixed(1)} / 5
                        </div>

                        <div className="rating-stars">
                            {"★".repeat(Math.round(reviewStats.avgRating))}
                            {"☆".repeat(5 - Math.round(reviewStats.avgRating))}
                        </div>

                        <div className="rating-count">
                            {reviewStats.totalElements} đánh giá
                        </div>
                    </div>

                    <div className="rating-right">
                        {reviewStats.ratingCounts.map(item => (
                            <div key={item.star} className="rating-bar-row">

                                <span>{item.star} sao</span>

                                <div className="rating-bar">
                                    <div
                                        className="rating-bar-fill"
                                        style={{ width: `${item.percent}%` }}
                                    />
                                </div>

                                <span>({Math.round(item.percent)}%)</span>

                            </div>
                        ))}
                    </div>

                </div>

                <div className="review-section">
                    <h2 className="review-title">Đánh giá sản phẩm</h2>

                    <form className="review-form" onSubmit={handleSubmitReview}>
                        <h4>Viết đánh giá của bạn</h4>
                        {reviewError && <p className="review-error">{reviewError}</p>}
                        <div className="form-group-star">
                            <span>Đánh giá: </span>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    className={`star-select ${star <= newReview.rating ? 'active' : ''}`}
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea
                            className="review-input-text"
                            rows="4"
                            placeholder="Nhập nội dung đánh giá..."
                            value={newReview.note}
                            onChange={(e) => setNewReview({ ...newReview, note: e.target.value })}
                        />
                        <button type="submit" className="btn-submit-review" disabled={submittingReview}>
                            {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                    </form>

                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div className="review-item" key={review.reviewId}>
                                <div className="review-avatar-text">
                                    {review.userFirstName?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="review-content">
                                    <div className="review-header">
                                        <span className="review-name">
                                            {`${review.userLastName} ${review.userFirstName}`}
                                        </span>
                                        <span className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>

                                    <div className="review-stars">
                                        {"★".repeat(review.rating)}
                                        {"☆".repeat(5 - review.rating)}
                                    </div>

                                    <p className="review-text">{review.note}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: "#666" }}>Chưa có đánh giá nào cho sản phẩm này.</p>
                    )}

                </div>
            </div>

            <div className="suggested-wrapper">
                <h2 className="suggested-title">Có thể bạn sẽ thích</h2>

                {suggestedProducts.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#666" }}>Chưa có sản phẩm gợi ý nào.</p>
                ) : (
                    <div className="suggested-list" ref={sliderRef}>
                        {suggestedProducts.map((prod) => (
                            <SuggestedProductCard key={prod.productId} prod={prod} />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

export default ProductDetail;