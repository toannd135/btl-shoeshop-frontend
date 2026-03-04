import React from "react";
import "./resetpassword.css";
import logo from "../../images/logoPtitShoesShoppng.png";

const CreatePassword = () => {
    return (
        <div className="forgot-wrapper">
            <div className="forgot-container">

                {/* LEFT */}
                <div className="forgot-left">
                    <h2>Tạo mật khẩu</h2>

                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: "20px" }}>
                        <label>Nhập lại mật khẩu mới</label>
                        <input
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>

                    <button className="forgot-btn">
                        Xác nhận
                    </button>
                </div>

                {/* RIGHT */}
                <div className="forgot-right">
                    <img
                        src={logo}
                        alt="Shoes Shop Logo"
                        className="forgot-logo"
                    />
                </div>

            </div>
        </div>
    );
};

export default CreatePassword;