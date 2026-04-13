import { del, edit, get, getPage, post } from "../utils/request";
export const getPermissionList = async () => {
    // Sử dụng getPage với size lớn để lấy toàn bộ danh sách (vì backend có phân trang mặc định)
    const response = await getPage("permissions", { size: 1000 });
    return response;
}
export const getPermissionPage = async (params) => {
    const response = await getPage("permissions", params);
    return response;
}
export const getPermissionDetail = async (id) => {
    const response = await get(`permissions/${id}`);
    return response;
}
export const createPermission = async (data) => {
    const response = await post(`permissions`, data);
    return response;
}
export const updatePermission = async (id, data) => {
    const response = await edit(`permissions/${id}`, data);
    return response;
}
export const deletePermission = async (id) => {
    const response = await del(`permissions/${id}`);
    return response;
}

