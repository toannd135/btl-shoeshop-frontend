import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./resetpassword.css";
import logo from "../../images/logoPtitShoesShoppng.png";
import { resetPassword } from "../../services/authService";

const CreatePassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const navigate = useNavigate();
    
    const location = useLocation();
    const email = location.state?.email;
    const resetToken = location.state?.resetToken;

    const handleSubmit = async () => {
        if (!newPassword || !confirmNewPassword) {
            alert("Vui lòng điền đầy đủ mật khẩu.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            alert("Mật khẩu nhập lại không khớp.");
            return;
        }

        try {
            const data = {
                email,
                resetToken,
                newPassword,
                confirmNewPassword
            };
            
            const responseMessage = await resetPassword(data);
            const successText = responseMessage.message || (responseMessage.data && responseMessage.data.response) || "Đổi mật khẩu thành công!";
            alert(successText);
            navigate("/login"); 
        } catch (error) {
            alert(error.message || "Lỗi khi đặt lại mật khẩu.");
        }
    };

    return (
        <div className="forgot-wrapper">
            <div className="forgot-container">
                <div className="forgot-left">
                    <h2 >Tạo mật khẩu</h2>

                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: "20px" }}>
                        <label>Nhập lại mật khẩu mới</label>
                        <input
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                    </div>

                    <button className="forgot-btn" onClick={handleSubmit}>
                        Xác nhận
                    </button>
                </div>

                <div className="forgot-right">
                    <img src={logo} alt="Shoes Shop Logo" className="forgot-logo" />
                </div>
            </div>
        </div>
    );
};

export default CreatePassword;