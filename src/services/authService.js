import { post } from "../utils/request";

export const login = async (data) => {
    const response = await post("auth/login", data);
    return response;
};

export const logout = async () => {
    return post("auth/logout");
};

export const register = async (data) => {
    const response = await post("auth/register", data);
    return response;
};

export const refreshToken = () => {
    return post("auth/refresh-token");
};

export const verifyOtp = async (data) => {
    return post("auth/verify-otp", data);
};

export const forgotPassword = async (data) => {
    return post("auth/forgot-password", data);
};

export const resetPassword = async (data) => {
    return post("auth/reset-password", data);
};