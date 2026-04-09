import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccessToken, setCurrentUser } from "../../utils/tokenStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function OAuth2RedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            setAccessToken(token);

            // Lấy thông tin user sau khi đăng nhập Google thành công
            fetch(API_BASE + "auth/refresh-token", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data?.data?.user) {
                        setCurrentUser(data.data.user);
                        setAccessToken(data.data.accessToken || token);
                    }
                    window.dispatchEvent(new Event("loginSuccess"));
                    navigate("/");
                })
                .catch(() => {
                    // Ngay cả khi lấy user info thất bại, vẫn đã có access token
                    window.dispatchEvent(new Event("loginSuccess"));
                    navigate("/");
                });
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return null;
}

export default OAuth2RedirectHandler;