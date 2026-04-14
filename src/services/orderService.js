import { get, edit, getPage } from "../utils/request";

export const getOrderList = async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return await get(`admin/orders?${queryString}`);
};

export const getOrderDetail = async (id) => {
    return await get(`admin/orders/${id}`);
};

export const updateOrderStatus = async (id, data) => {
    return await edit(`admin/orders/${id}/status`, data);
};

export const exportOrdersCsv = async (params) => {
    const { getAccessToken } = await import("../utils/tokenStore");
    const token = getAccessToken();

    // Lọc bỏ params rỗng/undefined
    const cleanParams = Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== "") acc[k] = v;
        return acc;
    }, {});

    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `http://localhost:8080/api/v1/admin/orders/export/csv${queryString ? "?" + queryString : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Xuất CSV thất bại!");
    }

    // Lấy tên file từ header Content-Disposition nếu có, fallback về tên mặc định
    const disposition = response.headers.get("Content-Disposition");
    let filename = "orders_export.csv";
    if (disposition) {
        const match = disposition.match(/filename=([^;]+)/);
        if (match) filename = match[1].replace(/"/g, "").trim();
    }

    // Tạo blob và tự động trigger download
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
};

export const getMyOrders = async (params) => {
    return await getPage("orders", params);
};

export const getMyOrderDetail = async (orderId) => {
    return await get(`orders/${orderId}`);
};

export const cancelMyOrder = async (orderId, reason) => {
    return await edit(`orders/${orderId}/cancel?reason=${encodeURIComponent(reason)}`);
};