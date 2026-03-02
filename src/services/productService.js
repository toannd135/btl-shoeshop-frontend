import { get, del, edit, post, sendForm } from "../utils/request";

export const getProductList = async () => {
    return await get("products/all");
};

export const getProductById = async (id) => {
    return await get(`products/${id}`);
};

export const getProductVariants = async (productId) => {
    return await get(`products/${productId}/variants`);
};

export const createProductVariant = async (productId, data) => {
    return await post(`products/${productId}/variants`, data);
};

export const updateProductVariant = async (productId, variantId, data) => {
    return await edit(`products/${productId}/variants/${variantId}`, data);
};

export const deleteProductVariant = async (productId, variantId) => {
    return await del(`products/${productId}/variants/${variantId}`);
};

export const getVariantImages = async (productId, variantId) => {
    return await get(`products/${productId}/variants/${variantId}/images`);
};

export const createVariantImage = async (productId, variantId, formData) => {
    return await sendForm(`products/${productId}/variants/${variantId}/images`, "POST", formData);
};

export const createProduct = async (formData) => {
    return await sendForm("products", "POST", formData);
};

export const updateProduct = async (id, formData) => {
    return await sendForm(`products/${id}`, "PUT", formData);
};

export const deleteProduct = async (id) => {
    return await del(`products/${id}`);
};