import React from "react";
import "./otp.css";
import logo from "../../images/logoPtitShoesShoppng.png";

const Otp = () => {
    return (
        <div className="forgot-wrapper">
            <div className="forgot-container">

                {/* LEFT */}
                <div className="forgot-left">
                    <h2 >Xác thực OTP</h2>

                    <div className="form-group">
                        <label>Mã OTP gồm 6 số</label>

                        <div className="otp-inputs">
                            <input type="text" maxLength="1" />
                            <input type="text" maxLength="1" />
                            <input type="text" maxLength="1" />
                            <input type="text" maxLength="1" />
                            <input type="text" maxLength="1" />
                            <input type="text" maxLength="1" />
                        </div>
                    </div>

                    <button className="otp-btn">
                        Xác nhận
                    </button>
                </div>

                {/* RIGHT */}
                <div className="otp-right">
                    <img src={logo} alt="Shoes Shop Logo" className="otp-logo" />
                </div>

            </div>
        </div>
    );
};

export default Otp;