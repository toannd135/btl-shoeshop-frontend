import { useState } from 'react';
import './Register.css';
import logoShoes from '../../images/logoPtitShoesShoppng.png';
import { message, notification } from 'antd';
import { register } from '../../services/authService';
function Register() {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password || !formData.email) {
            message.warning("Vui lòng nhập đầy đủ các trường bắt buộc!");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            message.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                username: formData.username,
                phone: formData.phone,
                password: formData.password
            });
            notification.success({
                message: "Đăng ký thành công",
                description: "Tài khoản của bạn đã được tạo. Hãy đăng nhập để tiếp tục.",
            });
        }
        catch (err) {
            console.log("REGISTER ERROR:", err);
            notification.error({
                message: "Đăng ký thất bại",
                description: err.message || JSON.stringify(err)
            });
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">

                <div className="register-form-section">
                    <div className="register-header">
                        <h2 className="register-title">Tạo tài khoản mới</h2>
                        <p className="register-subtitle">Đăng ký tài khoản mới của bạn</p>
                    </div>


                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group-half">
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
                                {showPassword ? "👁️" : "👁️‍🗨️"}
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