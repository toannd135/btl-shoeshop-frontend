import React, { useState } from 'react';
import './Register.css';
import logoShoes from '../../images/logoPtitShoesShoppng.png';

const Register = () => {
    // 1. State quản lý UI ẩn/hiện mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 2. State quản lý dữ liệu form (Data Logic)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    // 3. Hàm xử lý khi người dùng gõ vào input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value // Cập nhật đúng trường dữ liệu đang được gõ
        });
    };

    // 4. Hàm xử lý khi bấm nút "Tạo tài khoản"
    const handleSubmit = (e) => {
        e.preventDefault(); // Ngăn chặn hành vi reload trang mặc định của form

        // -- Bước Validation cơ bản (FE tự kiểm tra) --
        if (!formData.username || !formData.password || !formData.email) {
            alert("Vui lòng nhập đầy đủ các trường bắt buộc!");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        // -- Bước Gửi API (Tạm thời log ra console để bạn xem kết quả) --
        console.log("Dữ liệu chuẩn bị gửi xuống Back-End:", formData);

        // Ở đây sau này bạn sẽ viết code gọi API, ví dụ:
        // axios.post('/api/register', formData).then(...)
    };

    return (
        <div className="register-container">
            <div className="register-card">

                <div className="register-form-section">
                    <div className="register-header">
                        <h2 className="register-title">Tạo tài khoản mới</h2>
                        <p className="register-subtitle">Đăng ký tài khoản mới của bạn</p>
                    </div>

                    {/* Thêm sự kiện onSubmit vào form */}
                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group-half">
                                {/* Thêm name, value và onChange */}
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                />
                            </div>
                            <div className="form-group-half">
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Username"
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone"
                            />
                        </div>

                        <div className="form-group password-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                            />
                            <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                {/* ... (Giữ nguyên phần SVG con mắt ở code trước) ... */}
                                {showPassword ? "👁️" : "👁️‍🗨️"} {/* Tạm thay bằng emoji cho gọn text, bạn nhớ giữ lại SVG nhé */}
                            </span>
                        </div>

                        <div className="form-group password-group">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                            />
                            <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {/* ... (Giữ nguyên phần SVG con mắt ở code trước) ... */}
                                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                            </span>
                        </div>

                        <button type="submit" className="btn-register">Tạo tài khoản</button>
                    </form>

                    <p className="login-link">
                        Đã có tài khoản? <a href="/login">Đăng nhập</a>
                    </p>
                </div>

                <div className="register-image-section">
                    <img src={logoShoes} alt="Shoes Shop Logo" className="shoes-logo" />
                </div>

            </div>
        </div>
    );
};

export default Register;