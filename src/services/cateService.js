import { edit, get, post } from "../utils/request"

export const getCateList = async () => {
    const response = await get("categories");
    return response;
}

export const getCatePage = async (params) => {
    const response = await get("categories", params);
    return response;
}

export const createCategory = async (data) => {
    const response = await post("categories", data);
    return response;
}

export const updateCategory = async (id, values) => {
    const response = await edit(`categories/${id}`, values);
    return response;
}