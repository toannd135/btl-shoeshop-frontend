import React, { useState, useEffect } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

import slide1 from "../../images/slider1.png";
import slide2 from "../../images/slider2.png";
// import slide3 from "../../images/slide3.png";
// import slide4 from "../../images/slide4.png";

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
import Footer from "../../components/Footer";
const Home = () => {
    const slides = [
        { image: slide1 },
        { image: slide2 }
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
                <h2>
                    Khám phá các <span>bộ sưu tập</span>
                </h2>

                <div className="collection-list">

                    <Link to="/products" className="collection-item">
                        <img src={i1} alt="" />
                        <p>Giày chạy bộ</p>
                    </Link>

                    <Link to="/products" className="collection-item">
                        <img src={i2} alt="" />
                        <p>Giày đi bộ</p>
                    </Link>

                    <Link to="/products" className="collection-item">
                        <img src={i3} alt="" />
                        <p>Giày Tennis</p>
                    </Link>

                    <Link to="/products" className="collection-item">
                        <img src={i4} alt="" />
                        <p>Giày thời trang</p>
                    </Link>

                    <Link to="/products" className="collection-item">
                        <img src={i5} alt="" />
                        <p>Giày Trekking</p>
                    </Link>

                    <Link to="/products" className="collection-item">
                        <img src={i6} alt="" />
                        <p>Giày luyện tập</p>
                    </Link>

                </div>
            </section>

            {/* FLASH SALE */}
            <section className="flash-sale">

                <div className="flash-top">
                    <h2>FLASH SALE ⚡</h2>

                    <div className="countdown">
                        <div>{String(timeLeft.hours).padStart(2, "0")}</div>
                        <span>:</span>
                        <div>{String(timeLeft.minutes).padStart(2, "0")}</div>
                        <span>:</span>
                        <div>{String(timeLeft.seconds).padStart(2, "0")}</div>
                    </div>
                </div>

                <div className="flash-products">

                    <Link to="/sale" className="flash-card">
                        <img src={sale1} alt="" />
                        <h4>PUMA</h4>
                        <p>Giày Sneaker Puma</p>
                        <span className="price">1.539.000đ</span>
                    </Link>

                    <Link to="/sale" className="flash-card">
                        <img src={sale2} alt="" />
                        <h4>ADIDAS</h4>
                        <p>Giày Chạy Bộ Adidas</p>
                        <span className="price">1.250.000đ</span>
                    </Link>

                    <Link to="/sale" className="flash-card">
                        <img src={sale3} alt="" />
                        <h4>MIZUNO</h4>
                        <p>Giày Wave Rider</p>
                        <span className="price">1.845.000đ</span>
                    </Link>

                    <Link to="/sale" className="flash-card">
                        <img src={sale4} alt="" />
                        <h4>NIKE</h4>
                        <p>Giày Nike ZoomX</p>
                        <span className="price">2.580.000đ</span>
                    </Link>

                    <Link to="/sale" className="flash-card">
                        <img src={sale5} alt="" />
                        <h4>UNDER ARMOUR</h4>
                        <p>Giày Under Armour</p>
                        <span className="price">1.845.000đ</span>
                    </Link>

                </div>

            </section>

            <VoucherSection />

            <ProductHighlight />

            <Footer />

        </div>
    );
};

export default Home;