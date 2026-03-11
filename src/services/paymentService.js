import { post } from "../utils/request"

export const createPayment = async (data) => {
    const queryParams = new URLSearchParams(data).toString();
    
    return await post(`payment/create?${queryParams}`);
}