import {get} from "../utils/request";
export const getRoleList = async () => {
    const response = await get("roles");
    return response;
}