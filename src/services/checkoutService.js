import { post } from "../utils/request";

export const checkoutOrder = async (data) => {
    return await post("checkout", data);
};