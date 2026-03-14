import { get, edit } from "../utils/request";

export const getOrderList = async (params) => {
    // params: { status, phone, startDate, endDate, page, size }
    const queryString = new URLSearchParams(params).toString();
    return await get(`admin/orders?${queryString}`);
};

export const getOrderDetail = async (id) => {
    return await get(`admin/orders/${id}`);
};

export const updateOrderStatus = async (id, data) => {
    // data: { newStatus, adminNote }
    return await edit(`admin/orders/${id}/status`, data);
};

export const exportOrdersCsv = (params) => {
    const queryString = new URLSearchParams(params).toString();
    // Tải file trực tiếp từ trình duyệt
    window.location.href = `http://localhost:8080/api/v1/admin/orders/export?${queryString}`;
};