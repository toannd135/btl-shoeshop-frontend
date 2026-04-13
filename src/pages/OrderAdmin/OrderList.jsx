import { useEffect, useState } from "react";
import { Table, Input, Select, Button, Popover, Tag, DatePicker } from "antd";
import { Link } from "react-router-dom";
import { SearchOutlined, EyeOutlined, EditOutlined, DownloadOutlined, UnorderedListOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getOrderList, exportOrdersCsv } from "../../services/orderService";
import OrderDetail from "./OrderDetail";
import OrderStatusUpdate from "./OrderStatusUpdate";
import OrderItemList from "./OrderItemList";
import "./Order.css";

const { RangePicker } = DatePicker;

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    
    // Biến lưu SĐT đang gõ trên ô Input
    const [searchPhone, setSearchPhone] = useState("");
    // Biến lưu SĐT sau khi đã dừng gõ nửa giây (Dùng để gọi API)
    const [debouncedPhone, setDebouncedPhone] = useState("");
    
    const [filterStatus, setFilterStatus] = useState(null);
    const [dateRange, setDateRange] = useState(null);

    const [openDetail, setOpenDetail] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // --- CƠ CHẾ DEBOUNCE: CHỜ NGƯỜI DÙNG DỪNG GÕ 0.5 GIÂY ---
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedPhone(searchPhone);
        }, 500);

        return () => {
            clearTimeout(timerId); // Nếu gõ tiếp thì hủy hẹn giờ cũ
        };
    }, [searchPhone]);
    // --------------------------------------------------------

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage - 1, 
                size: pageSize,
            };
            
            // Dùng cái biến đã debounce để gửi xuống Backend
            if (debouncedPhone) params.phone = debouncedPhone;
            
            if (filterStatus) params.status = filterStatus;
            if (dateRange && dateRange[0] && dateRange[1]) {
                params.startDate = dateRange[0].toISOString();
                params.endDate = dateRange[1].toISOString();
            }

            const res = await getOrderList(params);
            setOrders(res.data.content || []);
            setTotal(res.data.totalElements || 0);
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng", error);
        } finally {
            setLoading(false);
        }
    };

    // Khi người dùng gõ tìm kiếm mới thì ép về trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedPhone]);

    // Gọi API mỗi khi Trang, Filter, hoặc SĐT (đã debounce) thay đổi
    useEffect(() => {
        fetchOrders();
    }, [currentPage, pageSize, filterStatus, dateRange, debouncedPhone]);

    const handleExport = () => {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        if (dateRange && dateRange[0] && dateRange[1]) {
            params.startDate = dateRange[0].toISOString();
            params.endDate = dateRange[1].toISOString();
        }
        exportOrdersCsv(params);
    };

    const renderStatus = (status) => {
        const colorMap = {
            PENDING: "orange",
            CONFIRMED: "blue",
            SHIPPING: "purple",
            DELIVERED: "green",
            CANCELLED: "red",
            RETURNED: "default"
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
    };

    const columns = [
        {
            title: "Mã Đơn",
            dataIndex: "orderId",
            key: "orderId",
            render: (id) => <span style={{ fontWeight: 600 }}>#{id.split('-')[0]}</span>,
        },
        {
            title: "Ngày đặt",
            dataIndex: "orderDate",
            key: "orderDate",
            render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "SĐT Nhận",
            dataIndex: "receiverPhone",
            key: "receiverPhone",
        },
        {
            title: "Tổng tiền SP",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (price) => `${Number(price).toLocaleString('vi-VN')} ₫`,
        },
        {
            title: "Thành tiền (Thực thu)",
            dataIndex: "finalPrice",
            key: "finalPrice",
            render: (price) => <span style={{ color: "#e30019", fontWeight: "bold" }}>{Number(price).toLocaleString('vi-VN')} ₫</span>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => renderStatus(status),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => { setSelectedOrder(record); setOpenDetail(true); }}
                        style={{ border: "1px solid #6366f1", background: "white", color: "#6366f1", padding: "4px 8px", borderRadius: 6, cursor: "pointer" }}
                        title="Xem chi tiết"
                    >
                        <EyeOutlined />
                    </button>
                    
                    <Popover
                        content={<OrderItemList items={record.items} orderId={record.orderId} />}
                        trigger="click"
                        placement="bottomRight"
                        destroyTooltipOnHide={true}
                    >
                        <button style={{ border: "1px solid #8b5cf6", background: "white", color: "#8b5cf6", padding: "4px 8px", borderRadius: 6, cursor: "pointer" }} title="Xem sản phẩm">
                            <UnorderedListOutlined />
                        </button>
                    </Popover>

                    <button
                        onClick={() => { setSelectedOrder(record); setOpenUpdate(true); }}
                        style={{ border: "1px solid #16a34a", background: "white", color: "#16a34a", padding: "4px 8px", borderRadius: 6, cursor: "pointer" }}
                        title="Cập nhật trạng thái"
                    >
                        <EditOutlined />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="order-container">
            <div className="order-header">
                <h2>Quản lý đơn hàng</h2>
                <h5><Link to="/">Dashboard</Link> / Đơn hàng</h5>
            </div>

            <div className="order-bar">
                <div className="order-bar_left">
                    <Input
                        placeholder="Tìm SĐT người nhận..."
                        prefix={<SearchOutlined />}
                        className="order-search"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        // Đã bỏ onPressEnter vì giờ nó tự search luôn rồi
                    />
                    <Select
                        placeholder="Lọc trạng thái"
                        allowClear
                        className="order-arrange"
                        onChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}
                        options={[
                            { value: "PENDING", label: "Chờ xác nhận" },
                            { value: "CONFIRMED", label: "Đã xác nhận" },
                            { value: "SHIPPING", label: "Đang giao hàng" },
                            { value: "DELIVERED", label: "Đã giao" },
                            { value: "CANCELLED", label: "Đã hủy" },
                            { value: "RETURNED", label: "Trả hàng" }
                        ]}
                    />
                    <RangePicker 
                        onChange={(dates) => { setDateRange(dates); setCurrentPage(1); }} 
                        format="DD/MM/YYYY"
                    />
                </div>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    className="order-export"
                    onClick={handleExport}
                >
                    Xuất CSV
                </Button>
            </div>

            <Table
                dataSource={orders}
                columns={columns}
                rowKey="orderId"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                }}
                onChange={(pagination) => {
                    setCurrentPage(pagination.current);
                    setPageSize(pagination.pageSize);
                }}
            />

            <OrderDetail open={openDetail} onClose={() => setOpenDetail(false)} order={selectedOrder} />
            <OrderStatusUpdate open={openUpdate} onClose={() => setOpenUpdate(false)} order={selectedOrder} onReload={fetchOrders} />
        </div>
    );
}

export default OrderList;