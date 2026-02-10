import {del, edit, get} from "../utils/request";
export const getUserList = async () => {
    const response = await get("users");
    return response;
}
export const updateUser = async (userId, data) => {
    const response = await edit(`users/${userId}`, data);
    return response;
}
export const deleteUser = async (userId) => {
    const response = await del(`users/${userId}`);
    return response;
}
