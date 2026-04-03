import { getPage, get } from "../utils/request";

// Lấy thống kê doanh thu
export const getRevenueReport = async (params = {}) => {
    const response = await getPage("admin/reports/revenue", params);
    return response;
};

// Lấy top sản phẩm
export const getTopProductsReport = async (params = {}) => {
    const response = await getPage("admin/reports/top-products", params);
    return response;
};

export const getCustomerOverviewReport = async () => {
    const response = await get("admin/reports/customers/overview");
    return response;
};

// Lấy top khách hàng VIP
export const getTopSpendersReport = async (params = {}) => {
    const response = await getPage("admin/reports/customers/top-spenders", params);
    return response;
};

export const getTopSellingProducts = async () => {
    return await get("admin/analytics/top-selling-products");
};