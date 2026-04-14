import React, { useState, useEffect } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

import slide1 from "../../images/slide1.png";
import slide2 from "../../images/slide2.png";
import slide3 from "../../images/slide3.png";
import slide4 from "../../images/slide4.png";
import slide5 from "../../images/slide5.png";

import i1 from "../../images/coll_1.png";
import i2 from "../../images/coll_2.png";
import i3 from "../../images/coll_3.png";
import i4 from "../../images/coll_4.png";
import i5 from "../../images/coll_5.png";
import i6 from "../../images/coll_6.png";

import sale1 from "../../images/sale1.png";
import sale2 from "../../images/sale2.png";
import sale3 from "../../images/sale3.png";
import sale4 from "../../images/sale4.png";
import sale5 from "../../images/sale5.png";

import VoucherSection from "../../components/Voucher/VoucherSection";
import ProductHighlight from "../../components/ProductHighlight/ProductHighlight";
import Header from "../../components/Header";
import ProductList from "../../components/ProductList";
import ChatBot from "../../components/ChatBot";
import ScrollToTop from "../../components/ScrollToTop";
import { getProductList, getProductVariants } from "../../services/productService";
import { getCouponList } from "../../services/couponService";
import { RxFontRoman } from "react-icons/rx";
const Home = () => {
    const slides = [
        { image: slide1 },
        { image: slide2 },
        { image: slide3 },
        { image: slide4 },
        { image: slide5 }
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrent((prev) =>
            prev === 0 ? slides.length - 1 : prev - 1
        );
    };
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const targetDate = new Date();
        targetDate.setHours(targetDate.getHours() + 12);

        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate - now;

            if (difference <= 0) {
                clearInterval(timer);
                return;
            }

            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const [flashSaleProducts, setFlashSaleProducts] = useState([]);
    const [loadingFlash, setLoadingFlash] = useState(true);

    useEffect(() => {
        const fetchFlashSale = async () => {
            try {
                const now = new Date();

                const [products, coupons] = await Promise.all([
                    getProductList(),
                    getCouponList()
                ]);

                // Lọc chỉ lấy coupon còn hiệu lực
                const activeCoupons = coupons.data.filter(c =>
                    c.status === "ACTIVE" &&
                    new Date(c.expiresAt) > now
                );

                // Tính số tiền giảm thực tế của 1 coupon với 1 giá
                const calcDiscount = (price, coupon) => {
                    if (price < (coupon.minOrderValue ?? 0)) return 0;

                    if (coupon.discountType === "PERCENTAGE") {
                        const disc = price * coupon.discountValue / 100;
                        return coupon.maxDiscount
                            ? Math.min(disc, coupon.maxDiscount)
                            : disc;
                    }
                    if (coupon.discountType === "FIXED_AMOUNT") {
                        return Math.min(coupon.discountValue, price);
                    }
                    // FREE_SHIPPING - không ảnh hưởng giá sản phẩm
                    return 0;
                };

                // Lấy variants cho từng product song song
                const productsWithVariants = await Promise.all(
                    products.data.map(async (product) => {
                        try {
                            const variantsRaw = await getProductVariants(product.id ?? product.productId);
                            console.log("variants raw:", variantsRaw); // xem structure
                            const variants = variantsRaw?.data ?? variantsRaw?.content ?? variantsRaw ?? [];
                            return { ...product, variants };
                        } catch {
                            return { ...product, variants: [] };
                        }
                    })
                );
                // Tính giá sale cho từng product
                const enriched = productsWithVariants
                    .map((product) => {
                        const activeVariants = product.variants?.filter(
                            v => v.status === "ACTIVE" || v.status === "AVAILABLE"
                        ) ?? [];

                        if (activeVariants.length === 0) return null;

                        // Lấy variant giá thấp nhất
                        const minVariant = activeVariants.reduce((min, v) =>
                            Number(v.basePrice) < Number(min.basePrice) ? v : min
                        );
                        const basePrice = Number(minVariant.basePrice);

                        // Tìm coupon giảm nhiều nhất
                        let bestDiscount = 0;
                        let bestCoupon = null;
                        activeCoupons.forEach((coupon) => {
                            const disc = calcDiscount(basePrice, coupon);
                            if (disc > bestDiscount) {
                                bestDiscount = disc;
                                bestCoupon = coupon;
                            }
                        });

                        const salePrice = basePrice - bestDiscount;
                        return { ...product, basePrice, salePrice, bestCoupon, bestDiscount };
                    })
                    .filter(Boolean); // bỏ product không có variant

                // Sort giá tăng dần, lấy top 5
                const top5 = enriched
                    .sort((a, b) => a.salePrice - b.salePrice)
                    .slice(0, 5);

                setFlashSaleProducts(top5);
            } catch (err) {
                console.error("Flash sale fetch error:", err);
            } finally {
                setLoadingFlash(false);
            }
        };

        fetchFlashSale();
    }, []);

    return (
        <div className="home">

            <Header />
            {/* SLIDER */}
            <div className="slider">
                <button className="prev" onClick={prevSlide}>❮</button>

                <div
                    className="slide"
                    style={{ backgroundImage: `url(${slides[current].image})` }}
                >
                    {/* <div className="overlay">
                        <h1>{slides[current].title}</h1>
                        <Link to="/products" className="btn">
                            Khám phá ngay →
                        </Link>
                    </div> */}
                </div>

                <button className="next" onClick={nextSlide}>❯</button>
            </div>

            <section className="collection">
                <div className="collection-header">
                    <span className="collection-badge">Bộ sưu tập nổi bật</span>
                    <h2>
                        Khám phá các <span>bộ sưu tập</span>
                    </h2>
                    <p>
                        Lựa chọn phong cách phù hợp với nhu cầu vận động, thời trang và trải nghiệm mỗi ngày.
                    </p>
                </div>

                <div className="collection-list">
                    <Link to="/productsPage" className="collection-item">
                        <div className="collection-image-wrap">
                            <img src={i1} alt="Giày chạy bộ" />
                        </div>
                        <div className="collection-content">
                            <h3>Giày chạy bộ</h3>
                            <span>Xem ngay</span>
                        </div>
                    </Link>

                    <Link to="/productsPage" className="collection-item">
                        <div className="collection-image-wrap">
                            <img src={i2} alt="Giày đi bộ" />
                        </div>
                        <div className="collection-content">
                            <h3>Giày đi bộ</h3>
                            <span>Xem ngay</span>
                        </div>
                    </Link>

                    <Link to="/productsPage" className="collection-item">
                        <div className="collection-image-wrap">
                            <img src={i3} alt="Giày Tennis" />
                        </div>
                        <div className="collection-content">
                            <h3>Giày Tennis</h3>
                            <span>Xem ngay</span>
                        </div>
                    </Link>

                    <Link to="/productsPage" className="collection-item">
                        <div className="collection-image-wrap">
                            <img src={i4} alt="Giày thời trang" />
                        </div>
                        <div className="collection-content">
                            <h3>Giày thời trang</h3>
                            <span>Xem ngay</span>
                        </div>
                    </Link>

                    <Link to="/productsPage" className="collection-item">
                        <div className="collection-image-wrap">
                            <img src={i5} alt="Giày Trekking" />
                        </div>
                        <div className="collection-content">
                            <h3>Giày Trekking</h3>
                            <span>Xem ngay</span>
                        </div>
                    </Link>

                    <Link to="/productsPage" className="collection-item">
                        <div className="collection-image-wrap">
                            <img src={i6} alt="Giày luyện tập" />
                        </div>
                        <div className="collection-content">
                            <h3>Giày luyện tập</h3>
                            <span>Xem ngay</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* FLASH SALE */}
            <section className="flash-sale">
                <div className="flash-top">
                    <h2>FLASH SALE ⚡</h2>
                    <div className="flash-countdown-wrapper">
                        <div className="flash-countdown-label">
                            Nhanh lên nào!
                            <strong>Sự kiện sẽ kết thúc sau</strong>
                        </div>
                        <div className="countdown">
                            <div data-label="Giờ">{String(timeLeft.hours).padStart(2, "0")}</div>
                            <span>:</span>
                            <div data-label="Phút">{String(timeLeft.minutes).padStart(2, "0")}</div>
                            <span>:</span>
                            <div data-label="Giây">{String(timeLeft.seconds).padStart(2, "0")}</div>
                        </div>
                    </div>
                </div>

                <div className="flash-products">
                    {loadingFlash ? (
                        <p style={{ color: "#fff", padding: "20px" }}>Đang tải...</p>
                    ) : flashSaleProducts.length === 0 ? (
                        <p style={{ color: "#fff", padding: "20px" }}>Không có sản phẩm sale.</p>
                    ) : (
                        flashSaleProducts.map((product, index) => {
                            const discountPercent = product.bestDiscount > 0
                                ? Math.round((product.bestDiscount / product.basePrice) * 100)
                                : 0;

                            return (
                                <Link
                                    to={`/productDetail/${product.id ?? product.productId}`}
                                    className="flash-card"
                                    key={product.id ?? product.productId}
                                >
                                    {discountPercent > 0 && (
                                        <div className="flash-badge">-{discountPercent}%</div>
                                    )}
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="flash-product-img"
                                        onError={(e) => { e.target.style.display = "none"; }}
                                    />

                                    <h4>{product.brand?.toUpperCase() ?? ""}</h4>
                                    <p>{product.name}</p>
                                    <span className="price">
                                        {product.salePrice.toLocaleString("vi-VN")}đ
                                    </span>
                                    {product.bestDiscount > 0 && (
                                        <span className="original-price">
                                            {product.basePrice.toLocaleString("vi-VN")}đ
                                        </span>
                                    )}
                                </Link>
                            );
                        })
                    )}
                </div>
            </section>

            <VoucherSection />

            <ProductHighlight />

            <ProductList />

            <ChatBot />

            <ScrollToTop />

            {/* <Footer /> */}

        </div>
    );
};

export default Home;