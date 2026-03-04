import {edit, get, getPage, post} from "../utils/request";
export const getRoleList = async () => {
    const response = await get("roles");
    return response;
}
export const createRole = async (data) => {
    const res = await post("roles", data);
    return res;
}
export const updateRole = async (id, data) => {
    const res = await edit(`roles/${id}`, data);
    return res;
}
export const getRolePage = async (params) => {
    const response = await getPage("roles", params);
    return response;
}