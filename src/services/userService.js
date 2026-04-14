import { del, dele, edit, get, getPage, post } from "../utils/request";

const V2_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/v1/', '/v2/') || 'http://localhost:8080/api/v2/';

export const getUserList = async () => {
    const response = await get("users");
    return response;
}
export const updateUser = async (userId, data) => {
    const response = await edit(`users/${userId}`, data);
    return response;
}
export const deleteUser = async (userId) => {
    const response = await del(`users/${userId}`);
    return response;
}
export const getUserPage = async (params) => {
    const response = await getPage("users", params);
    return response;
}
export const createUser = async (data) => {
    const response = await post("users", data);
    return response;
}
export const getUserById = async (userId) => {
    const response = await get(`users/${userId}`);
    return response;
}

// API v2 - cập nhật thông tin cá nhân cho user đang đăng nhập
export const updateMyInfo = async (data) => {
    const { getAccessToken } = await import("../utils/tokenStore");
    const token = getAccessToken();
    const response = await fetch(V2_BASE + "users/me", {
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(data)
    });
    
    const contentType = response.headers.get("content-type");
    let result = null;
    if (contentType && contentType.includes("application/json")) {
        result = await response.json().catch(() => null);
    } else {
        result = await response.text().catch(() => null);
    }

    if (!response.ok) {
        throw result || { message: "Có lỗi xảy ra" };
    }
    return result;
}

// API v2 - đổi mật khẩu cho user đang đăng nhập
export const changeMyPassword = async (data) => {
    const { getAccessToken } = await import("../utils/tokenStore");
    const token = getAccessToken();
    const response = await fetch(V2_BASE + "users/me/password", {
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(data)
    });

    const contentType = response.headers.get("content-type");
    let result = null;
    if (contentType && contentType.includes("application/json")) {
        result = await response.json().catch(() => null);
    } else {
        result = await response.text().catch(() => null);
    }

    if (!response.ok) {
        throw result || { message: "Có lỗi xảy ra" };
    }
    return result;
}
