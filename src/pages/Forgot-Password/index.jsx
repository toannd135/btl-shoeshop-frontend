import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./forgot.css";
import logo from "../../images/logoPtitShoesShoppng.png";
import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSendRequest = async () => {
        alert("🟢 TEST: Nút bấm đã nhận lệnh!");
        console.log("👉 Bắt đầu gửi email:", email);
        if (!email) {
            alert("Vui lòng nhập email!");
            return;
        }
        try {
            console.log("👉 Đang gọi API forgotPassword...");
            const response = await forgotPassword({ email });
            console.log("✅ API trả về:", response);
            alert("Mã OTP đã được gửi đến email của bạn.");
            navigate("/otp", { state: { email } });
        } catch (error) {
            console.error("🛑 LỖI RỒI NÀY:", error);
            alert(error.message || "Có lỗi xảy ra khi gửi yêu cầu.");
        }
    };

    return (
        <div className="forgot-wrapper">
            <div className="forgot-container">
                <div className="forgot-left">
                    <h2>Đổi mật khẩu</h2>
                    <div className="form-group">
                        <label>Tên email đăng nhập</label>
                        <input
                            type="email"
                            placeholder="Nhập email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button className="forgot-btn" onClick={handleSendRequest}>
                        Gửi yêu cầu
                    </button>
                </div>
                <div className="forgot-right">
                    <img src={logo} alt="Shoes Shop Logo" className="forgot-logo" />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;