import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./otp.css";
import logo from "../../images/logoPtitShoesShoppng.png";
import { verifyOtp } from "../../services/authService";

const Otp = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;
    const initialTime = location.state?.timeToLive || 0;
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleVerifyOtp = async () => {
        if (timeLeft <= 0) {
            alert("Mã OTP đã hết hạn, vui lòng yêu cầu gửi lại!");
            return;
        }
        const otpCode = otp.join("");
        if (otpCode.length < 6) {
            alert("Vui lòng nhập đủ 6 số OTP.");
            return;
        }

        try {
            const res = await verifyOtp({ email, otp: otpCode });
            const resetToken = res.data ? res.data.response : res.response;
            navigate("/resetpassword", {
                state: { email, resetToken }
            });
        } catch (error) {
            alert(error.message || "Mã OTP không chính xác hoặc đã hết hạn.");
        }
    };

    return (
        <div className="forgot-wrapper">
            <div className="forgot-container">
                <div className="forgot-left">
                    <h2>Xác thực OTP</h2>
                    <p style={{ marginBottom: "20px" }}>Đang xác thực cho: <strong>{email}</strong></p>
                    <p style={{ marginBottom: "20px", color: timeLeft > 0 ? "blue" : "red", fontSize: "18px", fontWeight: "bold" }}>
                        {timeLeft > 0 ? `Thời gian còn lại: ${formatTime(timeLeft)}` : "Mã OTP đã hết hạn!"}
                    </p>
                    <div className="form-group">
                        <label>Mã OTP gồm 6 số</label>
                        <div className="otp-inputs">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={data}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onFocus={(e) => e.target.select()}
                                    disabled={timeLeft <= 0}
                                />
                            ))}
                        </div>
                    </div>

                    <button className="otp-btn"
                        onClick={handleVerifyOtp}
                        disabled={timeLeft <= 0}
                        style={{ opacity: timeLeft <= 0 ? 0.5 : 1, cursor: timeLeft <= 0 ? "not-allowed" : "pointer" }}
                    >
                        Xác nhận
                    </button>
                </div>
                <div className="otp-right">
                    <img src={logo} alt="Shoes Shop Logo" className="otp-logo" />
                </div>
            </div>
        </div>
    );
};

export default Otp;