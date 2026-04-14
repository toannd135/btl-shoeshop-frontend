import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccessToken, setCurrentUser } from "../../utils/tokenStore";

function OAuth2RedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        const userId = searchParams.get("userId");
        const username = searchParams.get("username");
        const fullName = searchParams.get("fullName");
        const roleCode = searchParams.get("roleCode");
        const avatarImage = searchParams.get("avatarImage");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        setAccessToken(token);

        setCurrentUser({
            userId: userId || "",
            username: username || "",
            fullName: fullName || "",
            roleCode: roleCode || "",
            avatarImage: avatarImage || ""
        });

        window.dispatchEvent(new Event("loginSuccess"));
        navigate("/", { replace: true });
    }, [searchParams, navigate]);

    return null;
}

export default OAuth2RedirectHandler;