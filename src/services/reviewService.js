import { get, post, del, getPage } from "../utils/request";

export const getReviews = async (params) => {
    return await getPage("reviews/search", params);
};

export const createReview = async (variantId, data) => {
    return await post(`reviews/variants/${variantId}`, data);
};

export const deleteReview = async (reviewId) => {
    return await del(`reviews/${reviewId}`);
};

// Dùng cho admin/manager - không kiểm tra ownership
export const adminDeleteReview = async (reviewId) => {
    return await del(`reviews/admin/${reviewId}`);
};

export const getMyReviews = async () => {
    return await get(`reviews/my-reviews`);
};
