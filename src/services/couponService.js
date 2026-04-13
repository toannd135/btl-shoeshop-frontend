import { edit, get, post } from "../utils/request";
export const getCouponList = async () => {
    return await get("coupons");
}

export const getCouponPage = async (params) => {
    return await get("coupons", params);
}

export const createCoupon = async (data) => {
    return await post("coupons", data);
}

export const updateCoupon = async (id, data) => {
    return await edit(`coupons/${id}`, data);
}