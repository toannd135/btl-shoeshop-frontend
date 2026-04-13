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

export const exportOrdersCsv = (params) => {
    const queryString = new URLSearchParams(params).toString();
    window.location.href = `http://localhost:8080/api/v1/admin/orders/export?${queryString}`;
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