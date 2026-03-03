import React from "react";
import "./forgot.css";
import logo from "../../images/logoPtitShoesShoppng.png";  

const ForgotPassword = () => {
    return (
        <div className="forgot-wrapper">
            <div className="forgot-container">

                {/* LEFT SIDE */}
                <div className="forgot-left">
                    <h2>Đổi mật khẩu</h2>

                    <div className="form-group">
                        <label>Tên email đăng nhập</label>
                        <input
                            type="email"
                            placeholder="Nhập email"
                        />
                    </div>

                    <button className="forgot-btn">
                        Gửi yêu cầu
                    </button>
                </div>

                {/* RIGHT SIDE */}
                <div className="forgot-right">
                    <img src={logo} alt="Shoes Shop Logo" className="forgot-logo" />
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;