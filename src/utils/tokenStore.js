let accessToken = null;
let currentUser = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => {
    return accessToken;
};

export const clearAccessToken = () => {
    accessToken = null;
};

export const setCurrentUser = (user) => {
    currentUser = user;
};
export const getCurrentUser = () => {
    return currentUser;
};
export const clearCurrentUser = () => {
    currentUser = null;
};

/**
 * ID người đăng nhập (UUID string). Ưu tiên user từ login/refresh; fallback JWT `sub`.
 * Dùng để xác định tin nhắn "của tôi" — broadcast WebSocket luôn set `me` theo người gửi, không theo người xem.
 */
export const getCurrentUserId = () => {
    const u = getCurrentUser();
    if (u?.userId != null && String(u.userId).trim() !== "") {
        return String(u.userId);
    }
    const token = getAccessToken();
    if (!token) return null;
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        const payload = JSON.parse(jsonPayload);
        return payload.sub != null ? String(payload.sub) : null;
    } catch {
        return null;
    }
};

/** `true` nếu tin nhắn do user hiện tại gửi (so khớp `senderId` với viewer). */
export const isSenderCurrentUser = (senderId) => {
    if (senderId == null || senderId === "") return false;
    const uid = getCurrentUserId();
    if (!uid) return false;
    return uid.toLowerCase() === String(senderId).toLowerCase();
};