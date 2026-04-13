import { useEffect, useMemo, useState } from "react";
import { Table, Input, Select, Button, DatePicker, Tag, message } from "antd";
import { Link } from "react-router-dom";
import { SearchOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "./InventoryTransaction.css";

import { searchInventoryTransactions } from "../../services/inventoryTransactionService";
import { getProductList, getProductVariants } from "../../services/productService";
import InventoryTransactionCreate from "./InventoryTransactionCreate";
import InventoryTransactionUpdateStatus from "./InventoryTransactionUpdateStatus";

dayjs.extend(utc);

const { RangePicker } = DatePicker;

const TYPE_OPTIONS = [
    { value: "PURCHASE", label: "Nhập từ NCC" },
    { value: "SALE", label: "Bán hàng" },
    { value: "CUSTOMER_RETURN", label: "Khách trả hàng" },
    { value: "SUPPLIER_RETURN", label: "Trả NCC" },
    { value: "ADJUST", label: "Điều chỉnh" },
];

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
];

function InventoryTransactionList() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [openCreate, setOpenCreate] = useState(false);

    const [filters, setFilters] = useState({
        keyword: "",
        variantId: undefined,
        type: undefined,
        status: undefined,
        dateRange: null,
        page: 1,
        size: 10,
        sortBy: "createdAt",
        direction: "desc",
    });

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
        pages: 0,
    });

    const productOptions = useMemo(() => {
        return (products || []).flatMap((product) => {
            const variants = product.variants || [];

            return variants.map((variant) => ({
                value: variant.productVariantId,
                label: `${product.name} | ${variant.sku || "N/A"} | ${variant.color || "?"} | Size ${variant.size || "?"}`,
                raw: {
                    ...variant,
                    productName: product.name,
                    productBrand: product.brand,
                    productImage: product.imageUrl,
                },
            }));
        });
    }, [products]);

    const variantMap = useMemo(() => {
        const map = {};
        productOptions.forEach((item) => {
            map[item.value] = item;
        });
        return map;
    }, [productOptions]);

    const typeMap = useMemo(() => {
        const map = {};
        TYPE_OPTIONS.forEach((item) => {
            map[item.value] = item.label;
        });
        return map;
    }, []);

    const renderStatus = (status) => {
        const colorMap = {
            PENDING: { color: "gold", text: "Chờ xử lý" },
            COMPLETED: { color: "green", text: "Hoàn thành" },
            CANCELLED: { color: "red", text: "Đã hủy" },
        };

        const config = colorMap[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const renderType = (type) => {
        const colorMap = {
            PURCHASE: "blue",
            SALE: "volcano",
            CUSTOMER_RETURN: "cyan",
            SUPPLIER_RETURN: "purple",
            ADJUST: "geekblue",
        };
        return <Tag color={colorMap[type] || "default"}>{typeMap[type] || type}</Tag>;
    };

    const fetchProducts = async () => {
        try {
            const res = await getProductList();
            const productList = res?.data || res || [];

            const productsWithVariants = await Promise.all(
                productList.map(async (product) => {
                    try {
                        const variantRes = await getProductVariants(product.productId);
                        const variants = variantRes?.data || variantRes || [];

                        return {
                            ...product,
                            variants,
                        };
                    } catch (error) {
                        console.error(`Lỗi lấy biến thể của product ${product.productId}`, error);
                        return {
                            ...product,
                            variants: [],
                        };
                    }
                })
            );

            setProducts(productsWithVariants);
        } catch (error) {
            console.error("Lỗi lấy sản phẩm", error);
            message.error("Không thể tải danh sách sản phẩm/biến thể");
        }
    };

    const fetchTransactions = async (nextFilters = filters) => {
        try {
            setLoading(true);

            const params = {
                page: nextFilters.page,
                size: nextFilters.size,
                sortBy: nextFilters.sortBy,
                direction: nextFilters.direction,
            };

            if (nextFilters.variantId) params.variantId = nextFilters.variantId;
            if (nextFilters.type) params.type = nextFilters.type;
            if (nextFilters.dateRange?.[0]) {
                params.fromDate = dayjs(nextFilters.dateRange[0]).utc().toISOString();
            }
            if (nextFilters.dateRange?.[1]) {
                params.toDate = dayjs(nextFilters.dateRange[1]).utc().toISOString();
            }

            const response = await searchInventoryTransactions(params);
            const data = response?.data || response || {};
            let items = data?.items || [];

            if (nextFilters.keyword?.trim()) {
                const keyword = nextFilters.keyword.trim().toLowerCase();
                items = items.filter((item) => {
                    const variantLabel = variantMap[item.variantId]?.label?.toLowerCase() || "";
                    const reason = item.reason?.toLowerCase() || "";
                    const type = item.type?.toLowerCase() || "";
                    const status = item.status?.toLowerCase() || "";

                    return (
                        variantLabel.includes(keyword) ||
                        reason.includes(keyword) ||
                        type.includes(keyword) ||
                        status.includes(keyword)
                    );
                });
            }

            if (nextFilters.status) {
                items = items.filter((item) => item.status === nextFilters.status);
            }

            setTransactions(items);
            setPagination({
                page: data?.page || nextFilters.page,
                pageSize: data?.pageSize || nextFilters.size,
                total: data?.total || items.length,
                pages: data?.pages || 0,
            });
        } catch (error) {
            console.error("Lỗi lấy giao dịch kho", error);
            message.error(error?.message || "Không thể tải dữ liệu kho");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchTransactions(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.page,
        filters.size,
        filters.sortBy,
        filters.direction,
        filters.keyword,
        filters.variantId,
        filters.type,
        filters.status,
        filters.dateRange,
    ]);

    const handleRefresh = () => {
        fetchTransactions(filters);
    };

    const columns = [
        {
            title: "STT",
            key: "stt",
            width: 60,
            align: "center",
            render: (_, __, index) => (pagination.page - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Biến thể",
            dataIndex: "variantId",
            key: "variantId",
            width: 220,
            render: (variantId) => {
                const option = variantMap[variantId];
                const variant = option?.raw;

                return (
                    <div className="inventory-variant-cell">
                        <img
                            src={variant?.imageUrl || variant?.productImage || "https://via.placeholder.com/56"}
                            alt={variant?.productName || "variant"}
                            className="inventory-variant-image"
                        />
                        <div className="inventory-variant-content">
                            <div className="inventory-variant-name">
                                {variant?.productName || "Không rõ sản phẩm"}
                            </div>
                            <div className="inventory-variant-id">
                                SKU: {variant?.sku || "N/A"} | {variant?.color || "?"} | {variant?.size || "?"}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantityChange",
            key: "quantityChange",
            width: 90,
            align: "center",
            render: (value) => (
                <span className={value >= 0 ? "inventory-qty-positive" : "inventory-qty-negative"}>
                    {value > 0 ? `+${value}` : value}
                </span>
            ),
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            width: 140,
            render: renderType,
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            width: 140,
            ellipsis: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: renderStatus,
        },
        {
            title: "Hành động",
            key: "actions",
            width: 120,
            align: "center",
            render: (_, record) => (
                <InventoryTransactionUpdateStatus
                    record={record}
                    onReload={() => fetchTransactions(filters)}
                />
            ),
        },
    ];

    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <h2>Quản lý kho hàng</h2>
                <h5>
                    <Link to="/">Dashboard</Link> / Kho hàng
                </h5>
            </div>

            <div className="inventory-toolbar">
                <div className="inventory-toolbar-left">
                    <Input
                        placeholder="Tìm theo biến thể, lý do, loại..."
                        prefix={<SearchOutlined />}
                        className="inventory-search"
                        value={filters.keyword}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                keyword: e.target.value,
                                page: 1,
                            }))
                        }
                    />

                    <Select
                        allowClear
                        placeholder="Chọn biến thể"
                        value={filters.variantId}
                        className="inventory-select inventory-select-variant"
                        showSearch
                        optionFilterProp="label"
                        options={productOptions}
                        onChange={(value) => setFilters((prev) => ({ ...prev, variantId: value, page: 1 }))}
                    />

                    <Select
                        allowClear
                        placeholder="Loại giao dịch"
                        value={filters.type}
                        className="inventory-select"
                        options={TYPE_OPTIONS}
                        onChange={(value) => setFilters((prev) => ({ ...prev, type: value, page: 1 }))}
                    />

                    <Select
                        allowClear
                        placeholder="Trạng thái"
                        value={filters.status}
                        className="inventory-select"
                        options={STATUS_OPTIONS}
                        onChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}
                    />

                    <RangePicker
                        className="inventory-date-range"
                        value={filters.dateRange}
                        onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value, page: 1 }))}
                        showTime
                        format="DD/MM/YYYY HH:mm"
                    />

                    <Button
                        icon={<ReloadOutlined />}
                        className="inventory-refresh-btn"
                        onClick={handleRefresh}
                    >
                        Làm mới
                    </Button>
                </div>

                <div className="inventory-toolbar-right">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="inventory-create-btn"
                        onClick={() => setOpenCreate(true)}
                    >
                        Tạo phiếu kho
                    </Button>
                </div>
            </div>

            <div className="inventory-table-wrapper">
                <Table
                    rowKey="itId"
                    loading={loading}
                    dataSource={transactions}
                    columns={columns}
                    scroll={{ x: 1100, y: "calc(100vh - 360px)" }}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                    }}
                    onChange={(pageInfo, _, sorter) => {
                        const nextSortBy = sorter?.field || filters.sortBy;
                        const nextDirection = sorter?.order === "ascend" ? "asc" : "desc";

                        setFilters((prev) => ({
                            ...prev,
                            page: pageInfo.current,
                            size: pageInfo.pageSize,
                            sortBy: nextSortBy,
                            direction: sorter?.order ? nextDirection : prev.direction,
                        }));
                    }}
                />
            </div>

            <InventoryTransactionCreate
                open={openCreate}
                onClose={(created) => {
                    setOpenCreate(false);
                    if (created) {
                        fetchTransactions({ ...filters, page: 1 });
                    }
                }}
                productOptions={productOptions}
                onReload={() => fetchTransactions({ ...filters, page: 1 })}
            />
        </div>
    );
}

export default InventoryTransactionList;