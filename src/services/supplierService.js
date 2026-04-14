import { get, post, edit, del } from "../utils/request";

export const getAllSuppliers = async () => {
  return await get("supplier/all");
};

export const getSupplierById = async (id) => {
  return await get(`supplier/${id}`);
};

export const createSupplier = async (data) => {
  return await post("supplier", data);
};

export const updateSupplier = async (id, data) => {
  return await edit(`supplier/${id}`, data);
};

export const deleteSupplier = async (id) => {
  return await del(`supplier/${id}`);
};

export const addSupplierVariant = async (supplierId, data) => {
  return await post(`supplier/${supplierId}/add`, data);
};

export const updateSupplierVariant = async (supplierId, variantId, data) => {
  return await edit(`supplier/${supplierId}/add/${variantId}`, data);
};

export const deleteSupplierVariant = async (supplierId, variantId) => {
  return await del(`supplier/${supplierId}/remove/${variantId}`);
};