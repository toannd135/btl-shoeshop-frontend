import React from 'react';
import './Login.css';
// Dựa vào cấu trúc thư mục của bạn, tôi import ảnh logo từ thư mục images
import logoShoes from '../../images/logoPtitShoesShoppng.png';

const Login = () => {
    return (
        <div className="login-container">
            <div className="login-card">
                {/* Cột trái: Form đăng nhập */}
                <div className="login-form-section">
                    <h2 className="login-title">Đăng nhập</h2>

                    <form className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Nhập tên đăng nhập"
                            />
                        </div>

                        <div className="form-group">
                            <div className="label-password">
                                <label htmlFor="password">Mật khẩu</label>
                                <a href="/forgot-password" className="forgot-password">Quên mật khẩu?</a>
                            </div>
                            <input
                                type="password"
                                id="password"
                                placeholder="Nhập mật khẩu"
                            />
                        </div>

                        <button type="submit" className="btn-login">Đăng nhập</button>
                    </form>

                    <div className="login-divider">
                        <span>Hoặc tiếp tục với</span>
                    </div>

                    <button type="button" className="btn-google">
                        {/* Sử dụng link ảnh logo Google trực tiếp hoặc bạn có thể tải về thư mục assets */}
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                            alt="Google logo"
                            className="google-icon"
                        />
                        Đăng nhập với Google
                    </button>

                    <p className="register-link">
                        Chưa có tài khoản? <a href="/register">Đăng ký</a>
                    </p>
                </div>

                {/* Cột phải: Hình ảnh/Logo */}
                <div className="login-image-section">
                    <img
                        src={logoShoes}
                        alt="Shoes Shop Logo"
                        className="shoes-logo"
                    // Nếu ảnh logo màu đen/khác, bạn có thể chỉnh filter qua CSS, 
                    // hoặc lý tưởng nhất là dùng ảnh logo nét viền trắng đã cắt sẵn (png trong suốt).
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;