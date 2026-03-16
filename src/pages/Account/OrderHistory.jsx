import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Modal, Descriptions, Divider, Spin, Image, Select } from 'antd'; // 👉 
import { getMyOrders, getMyOrderDetail } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';

const { Option } = Select; 

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentStatus, setCurrentStatus] = useState(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0
    });

    const fetchOrders = async (page = 1, pageSize = 5, status = currentStatus) => {
        setLoading(true);
        try {
            const params = { page: page - 1, size: pageSize };
            if (status) {
                params.status = status;
            }

            const res = await getMyOrders(params);
            if (res && res.data) {
                setOrders(res.data.content || []);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    total: res.data.totalElements
                }));
            }
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
            message.error("Không thể tải danh sách đơn hàng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(pagination.current, pagination.pageSize, currentStatus);
    }, []);
    const handleFilterChange = (value) => {
        setCurrentStatus(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchOrders(1, pagination.pageSize, value);
    };

    const handleTableChange = (newPagination) => {
        fetchOrders(newPagination.current, pagination.pageSize, currentStatus);
    };

    const handleViewDetail = async (orderId) => {
        setIsModalVisible(true);
        setLoadingDetail(true);
        try {
            const res = await getMyOrderDetail(orderId);
            if (res && res.data) {
                setSelectedOrder(res.data);
            }
        } catch (error) {
            console.error("Lỗi tải chi tiết:", error);
            message.error("Không thể tải chi tiết đơn hàng!");
            setIsModalVisible(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedOrder(null);
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING': return { color: 'gold', text: 'CHỜ XÁC NHẬN' };
            case 'CONFIRMED': return { color: 'blue', text: 'ĐÃ XÁC NHẬN' };
            case 'SHIPPING': return { color: 'cyan', text: 'ĐANG GIAO' };
            case 'DELIVERED': return { color: 'green', text: 'HOÀN THÀNH' };
            case 'CANCELLED': return { color: 'red', text: 'ĐÃ HỦY' };
            case 'RETURNED': return { color: 'purple', text: 'TRẢ HÀNG' };
            default: return { color: 'default', text: status };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + " " + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (text) => (
                <b title={text} style={{ color: '#1677ff' }}>
                    #{text.substring(0, 8).toUpperCase()}
                </b>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (date) => formatDate(date),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'finalPrice',
            key: 'finalPrice',
            render: (price) => <span style={{ fontWeight: '500' }}>{price?.toLocaleString('vi-VN')} đ</span>
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status) => {
                const config = getStatusConfig(status);
                return <Tag color={config.color} key={status}>{config.text}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => handleViewDetail(record.orderId)}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    const itemColumns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Image
                        width={50}
                        height={50}
                        style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid #f0f0f0' }}
                        src={record.imageUrl || "https://via.placeholder.com/50"}
                        alt={record.productName}
                    />
                    <span
                        style={{ fontWeight: 500, color: '#1677ff', cursor: 'pointer' }}
                        onClick={() => {
                            handleCloseModal();
                            navigate(`/productDetail/${record.productId}`);
                        }}
                    >
                        {record.productName}
                    </span>
                </div>
            )
        },
        { title: 'Size', dataIndex: 'size', key: 'size', align: 'center' },
        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center' },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            render: (price) => `${price?.toLocaleString('vi-VN')} đ`
        },
        {
            title: 'Thành tiền',
            key: 'total',
            align: 'right',
            render: (_, record) => <b style={{ color: '#ff4d4f' }}>{(record.price * record.quantity)?.toLocaleString('vi-VN')} đ</b>
        },
    ];

    return (
        <div className="order-history-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="tab-title" style={{ margin: 0 }}>Đơn hàng của tôi</h2>
                <Select
                    placeholder="Tất cả trạng thái"
                    style={{ width: 200 }}
                    allowClear // Có nút X để xóa bộ lọc (hiển thị tất cả)
                    onChange={handleFilterChange}
                    value={currentStatus}
                >
                    <Option value="PENDING">Chờ xác nhận</Option>
                    <Option value="CONFIRMED">Đã xác nhận</Option>
                    <Option value="SHIPPING">Đang giao</Option>
                    <Option value="DELIVERED">Hoàn thành</Option>
                    <Option value="CANCELLED">Đã hủy</Option>
                    <Option value="RETURNED">Trả hàng</Option>
                </Select>
            </div>

            <Table
                columns={columns}
                dataSource={orders}
                rowKey="orderId"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                }}
                onChange={handleTableChange}
            />

            <Modal
                title={
                    selectedOrder ?
                        `Chi tiết đơn hàng #${selectedOrder.orderId.substring(0, 8).toUpperCase()}`
                        : "Chi tiết đơn hàng"
                }
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                ]}
                width={800}
                centered
            >
                {loadingDetail ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin size="large" />
                    </div>
                ) : selectedOrder && (
                    <>
                        <Descriptions bordered size="small" column={2} style={{ marginTop: 15 }}>
                            <Descriptions.Item label="Người nhận"><b>{selectedOrder.receiverName}</b></Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại"><b>{selectedOrder.receiverPhone}</b></Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao" span={2}>{selectedOrder.shippingAddress}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">{formatDate(selectedOrder.orderDate)}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={getStatusConfig(selectedOrder.status).color}>
                                    {getStatusConfig(selectedOrder.status).text}
                                </Tag>
                            </Descriptions.Item>
                            {selectedOrder.note && (
                                <Descriptions.Item label="Ghi chú" span={2}>
                                    <span style={{ color: 'red' }}>{selectedOrder.note}</span>
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider orientation="left">Danh sách sản phẩm</Divider>

                        <Table
                            dataSource={selectedOrder.items}
                            columns={itemColumns}
                            rowKey={(record, index) => index}
                            pagination={false}
                            size="small"
                        />

                        <div style={{ textAlign: 'right', marginTop: 20, fontSize: '15px' }}>
                            <p>Tổng tiền hàng: <span>{selectedOrder.totalPrice?.toLocaleString('vi-VN')} đ</span></p>
                            <p>Phí vận chuyển: <span>{selectedOrder.shippingFee?.toLocaleString('vi-VN')} đ</span></p>
                            <p>Giảm giá: <span>- {selectedOrder.discountAmount?.toLocaleString('vi-VN')} đ</span></p>
                            <h3 style={{ marginTop: 10 }}>
                                Tổng thanh toán: <span style={{ color: '#ff4d4f', fontSize: '20px' }}>{selectedOrder.finalPrice?.toLocaleString('vi-VN')} đ</span>
                            </h3>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default OrderHistory;