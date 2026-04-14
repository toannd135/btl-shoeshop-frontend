import { getPage, get } from "../utils/request";
import { getAccessToken } from "../utils/tokenStore";

const API_DOMAIN = import.meta.env.VITE_API_BASE_URL;

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

// Xuất báo cáo thống kê tổng hợp ra file CSV
export const exportReportCsv = async (params = {}) => {
    const token = getAccessToken();

    // Lọc bỏ params rỗng/undefined
    const cleanParams = Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== "") acc[k] = v;
        return acc;
    }, {});

    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `${API_DOMAIN}admin/reports/export/csv${queryString ? "?" + queryString : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Xuất báo cáo CSV thất bại!");
    }

    // Lấy tên file từ header Content-Disposition nếu có, fallback về tên mặc định
    const disposition = response.headers.get("Content-Disposition");
    let filename = "thong_ke_tong_hop.csv";
    if (disposition) {
        const match = disposition.match(/filename=([^;]+)/);
        if (match) filename = match[1].replace(/"/g, "").trim();
    }

    // Tạo blob và tự động trigger download
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
};