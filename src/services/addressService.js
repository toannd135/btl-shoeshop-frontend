import { get, post, edit, dele } from "../utils/request"; // Đường dẫn tuỳ thuộc vào cấu trúc dự án của bạn

const API_PATH = "addresses";

export const getAllAddresses = async () => {
    return await get(API_PATH);
};

export const getAddressById = async (id) => {
    return await get(`${API_PATH}/${id}`);
};

export const createAddress = async (data) => {
    return await post(API_PATH, data);
};

export const updateAddress = async (id, data) => {
    return await edit(`${API_PATH}/${id}`, data);
};

export const deleteAddress = async (id) => {
    return await dele(`${API_PATH}/${id}`);
};