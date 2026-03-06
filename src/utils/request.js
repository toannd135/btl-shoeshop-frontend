import { getAccessToken } from "./tokenStore";

const API_DOMAIN = "http://localhost:8080/api/v1/";
// const API_DOMAIN = import.meta.env.VITE_API_BASE_URL;
const getHeaders = () => {
    const token = getAccessToken();

    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

const handleResponse = async (response) => {

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type");

    let result = null;

    if (contentType && contentType.includes("application/json")) {
        result = await response.json();
    }
    else {
        result = await response.text();
    }

    if (!response.ok) {
        throw result || { message: "Request failed" };
    }

    return result;
};

export const sendForm = async (path, method = "POST", formData) => {
    const token = getAccessToken();
    const headers = {
        Accept: "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_DOMAIN + path, {
        method: method,
        headers: headers,
        body: formData,
        credentials: "include"
    });

    return handleResponse(response);
};

export const get = async (path) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "GET",
        headers: getHeaders(),
        credentials: "include"
    });

    return handleResponse(response);
};

export const post = async (path, body = {}) => {
    const headers = getHeaders();
    if (
        path === "auth/login" ||
        path === "auth/register" ||
        path === "auth/forgot-password" ||
        path === "auth/verify-otp" ||
        path === "auth/reset-password"
    ) {
        delete headers.Authorization;
    }

    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(body)
    });

    return handleResponse(response);
};

export const del = async (path) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "DELETE",
        headers: getHeaders(),
        credentials: "include"
    });

    return handleResponse(response);
};

export const dele = async (path) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Request failed");
    }

    return true;
}

export const edit = async (path, body = {}) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "PUT",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(body)
    });

    return handleResponse(response);
};

export const getPage = async (path, params = {}) => {

    const cleanParams = Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== "") acc[k] = v;
        return acc;
    }, {});

    const queryString = new URLSearchParams(cleanParams).toString();
    const url = queryString
        ? `${API_DOMAIN + path}?${queryString}`
        : API_DOMAIN + path;

    const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
        credentials: "include"
    });

    return handleResponse(response);
};