import { Modal, Descriptions, Divider, Table, Tag } from "antd";
import dayjs from "dayjs";

function OrderDetail({ open, onClose, order }) {
    if (!order) return null;

    const itemColumns = [
        { title: "Sản phẩm", dataIndex: "productName", key: "productName" },
        { title: "Size", dataIndex: "size", key: "size", align: "center" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity", align: "center" },
        { title: "Đơn giá", dataIndex: "price", key: "price", align: "right", render: (price) => `${Number(price).toLocaleString('vi-VN')} ₫` }
    ];

    return (
        <Modal
            title={<span style={{ fontSize: 18 }}>Chi tiết Đơn hàng #{order.orderId.split('-')[0]}</span>}
            open={open}
            onCancel={onClose}
            footer={null}
            width={850}
            centered
        >
            <Divider orientation="left">Thông tin chung</Divider>
            <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Mã ĐH">{order.orderId}</Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">{dayjs(order.orderDate).format("DD/MM/YYYY HH:mm:ss")}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái"><Tag color="blue">{order.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Ghi chú KH">{order.note || "Không có"}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Tài khoản đặt hàng (UserShortInfo)</Divider>
            {order.user ? (
                <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Tên tài khoản">{order.user.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{order.user.email}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{order.user.phone}</Descriptions.Item>
                    <Descriptions.Item label="User ID">{order.user.userId}</Descriptions.Item>
                </Descriptions>
            ) : (
                <p style={{ color: "gray" }}>Khách vãng lai (Không có tài khoản)</p>
            )}

            <Divider orientation="left">Thông tin Giao hàng</Divider>
            <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Người nhận">{order.receiverName}</Descriptions.Item>
                <Descriptions.Item label="SĐT Nhận">{order.receiverPhone}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>{order.shippingAddress}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Danh sách Sản phẩm</Divider>
            <Table 
                dataSource={order.items || []} 
                columns={itemColumns} 
                rowKey={(r, i) => i} 
                pagination={false} 
                size="small" 
                summary={() => (
                    <Table.Summary>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3} align="right"><b>Tổng tiền SP:</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">{Number(order.totalPrice).toLocaleString('vi-VN')} ₫</Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3} align="right"><b>Phí Ship:</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">{Number(order.shippingFee).toLocaleString('vi-VN')} ₫</Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3} align="right"><b>Giảm giá:</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">- {Number(order.discountAmount).toLocaleString('vi-VN')} ₫</Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3} align="right"><b>THÀNH TIỀN:</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right"><b style={{ color: 'red', fontSize: 16 }}>{Number(order.finalPrice).toLocaleString('vi-VN')} ₫</b></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />
        </Modal>
    );
}

export default OrderDetail;