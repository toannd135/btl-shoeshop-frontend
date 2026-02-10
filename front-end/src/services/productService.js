import {del, edit, get, post} from "../utils/request";
export const getProductList = async () => {
    const response = await get("products");
    return response;
}
export const createProduct = async (options) => {
    const response = await post("products", options);
    return response;
}
export const updateProduct = async (id, options) => {
    const response = await edit(`products/${id}`, options);
    return response;
}
export const deleteProduct = async (id) => {
    const response = await del(`products/${id}`);
    return response;
}