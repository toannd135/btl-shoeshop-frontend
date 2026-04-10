import { useLocation, useNavigate } from "react-router-dom";
import "./VerifyEmailNotice.css";

function VerifyEmailNotice() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "";

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                <h2>Kiểm tra email của bạn</h2>

                <p>
                    Chúng tôi đã gửi một liên kết xác thực đến
                    {email ? <strong> {email}</strong> : " email của bạn"}.
                </p>

                <p>
                    Vui lòng mở email và bấm vào liên kết xác nhận để kích hoạt tài khoản.
                </p>

                <p>
                    Sau khi xác thực thành công, bạn mới có thể đăng nhập vào hệ thống.
                </p>

                <div className="verify-email-actions">
                    <button onClick={() => navigate("/login")}>Về trang đăng nhập</button>
                    <button onClick={() => navigate("/register")}>Đăng ký lại</button>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmailNotice;