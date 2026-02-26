import "./Login.css";
import logoShoes from '../../images/logoPtitShoesShoppng.png';
import { message, notification } from "antd";
import { useState } from "react";
import { login } from "../../services/authService";
import { setAccessToken } from "../../utils/tokenStore";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        username: "",
        password: "",
    });
    const handleChange = (e) => {
        const {id, value} = e.target;
        setData({
            ...data,
            [id]: value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!data.username || !data.password){
            message.warning("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        try{
            const res = await login(data);
            const {accessToken, user} = res.data;
            
            setAccessToken(accessToken);

            notification.success({
                message: "Đăng nhập thành công!",
                description: `Chào mừng ${user.username} đã quay trở lại!`
            });

            navigate("/");
        } catch (err) {
            notification.error({
                message: "Đăng nhập thất bại!",
                description: err?.message || "Sai tài khoản hoặc mật khẩu!"
            });
        }
    }
    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-form-section">
                    <h2 className="login-title">Đăng nhập</h2>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Nhập tên đăng nhập"
                                value={data.username}
                                onChange={handleChange}
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
                                value={data.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="btn-login">Đăng nhập</button>
                    </form>

                    <div className="login-divider">
                        <span>Hoặc tiếp tục với</span>
                    </div>

                    <button type="button" className="btn-google">
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
                <div className="login-image-section">
                    <img
                        src={logoShoes}
                        alt="Shoes Shop Logo"
                        className="shoes-logo"
                    />
                </div>
            </div>
        </div>
    )
}

export default Login;