import { get, post, edit, del } from "../utils/request";

export const getPurchaseOrders = async (params) => {
  const query = new URLSearchParams(params).toString();
  return await get(`purchase-orders?${query}`);
};

export const getPurchaseOrderById = async (id) => {
  return await get(`purchase-order/${id}`);
};

export const createPurchaseOrder = async (supplierId, data) => {
  return await post(`suppliers/${supplierId}/purchase-orders`, data);
};

export const updatePurchaseOrder = async (poId, data) => {
  return await edit(`purchase-order/${poId}`, data);
};

export const changePurchaseOrderItem = async (poId, data) => {
  return await post(`purchase-order/${poId}/items`, data);
};

export const deletePurchaseOrderItem = async (poId, itemId) => {
  return await del(`purchase-order/${poId}/items/${itemId}`);
};