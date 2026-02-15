import { dele, edit, get, getPage} from "../utils/request";
export const getUserList = async () => {
    const response = await get("users");
    return response;
}
export const updateUser = async (userId, data) => {
    const response = await edit(`users/${userId}`, data);
    return response;
}
export const deleteUser = async (userId) => {
    const response = await dele(`users/${userId}`);
    return response;
}
export const getUserPage = async (params) => {
    const response = await getPage("users", params);
    return response;
}
