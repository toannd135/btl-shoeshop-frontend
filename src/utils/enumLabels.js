export const ORDER_STATUS_META = {
    PENDING: {
        label: "Chờ xác nhận",
        color: "orange",
    },
    CONFIRMED: {
        label: "Đã xác nhận",
        color: "blue",
    },
    SHIPPING: {
        label: "Đang giao hàng",
        color: "purple",
    },
    DELIVERED: {
        label: "Đã giao / Đã nhập kho",
        color: "green",
    },
    CANCELLED: {
        label: "Đã hủy",
        color: "red",
    },
    RETURNED: {
        label: "Trả hàng",
        color: "default",
    },
};

export const INVENTORY_TRANSACTION_TYPE_META = {
    PURCHASE: {
        label: "Nhập từ nhà cung cấp",
        color: "green",
    },
    SALE: {
        label: "Bán hàng",
        color: "blue",
    },
    CUSTOMER_RETURN: {
        label: "Khách trả hàng",
        color: "cyan",
    },
    SUPPLIER_RETURN: {
        label: "Trả NCC",
        color: "orange",
    },
    ADJUST: {
        label: "Điều chỉnh kho",
        color: "purple",
    },
};

export const INVENTORY_TRANSACTION_STATUS_META = {
    PENDING: {
        label: "Chờ xử lý",
        color: "gold",
    },
    CANCELLED: {
        label: "Đã hủy",
        color: "red",
    },
    COMPLETED: {
        label: "Hoàn tất",
        color: "green",
    },
};

export const SUPPLIER_STATUS_META = {
    ENABLED: {
        label: "Đang hoạt động",
        color: "green",
    },
    DISABLED: {
        label: "Ngưng hoạt động",
        color: "red",
    },
    ACTIVE: {
        label: "Đang hoạt động",
        color: "green",
    },
    INACTIVE: {
        label: "Ngưng hoạt động",
        color: "red",
    },
};

export const getEnumMeta = (metaMap, value) => {
    return metaMap[value] || { label: value || "--", color: "default" };
};