import { post, get } from "../utils/request"

export const createPayment = async (data) => {
    const queryParams = new URLSearchParams(data).toString();
    
    return await post(`payment/create?${queryParams}`);
}

export const verifyVNPayPayment = async (queryString) => {
    return await get(`payment/payment_infor${queryString}`);
}