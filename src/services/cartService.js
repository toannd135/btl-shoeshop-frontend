import { get, post, del } from "../utils/request";

export const addToCart = async (data) => {
    return await post("cart", data);
};

export const getMyCart = async () => {
    return await get("cart");
};