import { get, post, del } from "../utils/request";

export const addToCart = async (data) => {
    return await post("cart", data);
};

export const getMyCart = async () => {
    return await get("cart");
};

export const updateCartItemQuantity = async (data) => {
  return await post("cart/update-quantity-item", data);
};

export const deleteCartItem = async (cartItemId) => {
  return await del(`cart/${cartItemId}`);
};