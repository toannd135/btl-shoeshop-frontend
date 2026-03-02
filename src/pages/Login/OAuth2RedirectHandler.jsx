import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccessToken } from "../../utils/tokenStore";

function OAuth2RedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            setAccessToken(token);
            navigate("/"); 
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return (
        null
    );
}

export default OAuth2RedirectHandler;