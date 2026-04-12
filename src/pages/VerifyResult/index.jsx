import { useSearchParams, useNavigate } from "react-router-dom";
import "./VerifyResult.css";

function VerifyResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const status = searchParams.get("status");

    const isSuccess = status === "success";
    const isFailed = status === "failed";

    return (
        <div className="verify-result-container">
            <div className="verify-result-card">
                <h2>
                    {isSuccess
                        ? "Xác thực thành công"
                        : isFailed
                        ? "Xác thực thất bại"
                        : "Kết quả xác thực"}
                </h2>

                <p>
                    {isSuccess
                        ? "Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ."
                        : "Liên kết xác thực không hợp lệ hoặc đã hết hạn."}
                </p>

                <button onClick={() => navigate("/login")}>Đi đến đăng nhập</button>
            </div>
        </div>
    );
}

export default VerifyResult;