import React from "react";
import "./footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">

                {/* BRAND */}
                <div className="footer-col">
                    <h2 className="logo">PTIT<span>SNEAKER</span></h2>
                    <p>
                        Chuyên cung cấp giày sneaker chính hãng,
                        cam kết chất lượng và giá tốt nhất.
                    </p>

                    <div className="contact">
                        <p>📍 120 Yên Lãng, Đống Đa, TP.Hà Nội</p>
                        <p>📞 0123456789</p>
                        <p>✉ support@ptitsneaker.vn</p>
                    </div>

                    <div className="social">
                        <i className="fab fa-facebook"></i>
                        <i className="fab fa-instagram"></i>
                        <i className="fab fa-tiktok"></i>
                        <i className="fab fa-youtube"></i>
                    </div>
                </div>

                {/* QUICK LINKS */}
                <div className="footer-col">
                    <h4>Liên kết nhanh</h4>
                    <ul>
                        <li>Trang chủ</li>
                        <li>Sản phẩm</li>
                        <li>Khuyến mãi</li>
                        <li>Giới thiệu</li>
                        <li>Liên hệ</li>
                    </ul>
                </div>

                {/* SUPPORT */}
                <div className="footer-col">
                    <h4>Hỗ trợ khách hàng</h4>
                    <ul>
                        <li>Chính sách giao hàng</li>
                        <li>Chính sách đổi trả</li>
                        <li>Chính sách bảo hành</li>
                        <li>Tra cứu đơn hàng</li>
                    </ul>
                </div>

                {/* NEWSLETTER */}
                <div className="footer-col">
                    <h4>Nhận ưu đãi</h4>
                    <p>Đăng ký để nhận thông tin mới nhất</p>

                    <div className="newsletter">
                        <input type="email" placeholder="Nhập email của bạn..." />
                        <button>Gửi</button>
                    </div>

                    <div className="payment">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="master" />
                    </div>
                </div>

            </div>

            <div className="footer-bottom">
                © 2026 EGA Sneaker. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;