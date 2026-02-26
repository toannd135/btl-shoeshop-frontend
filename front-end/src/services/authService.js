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