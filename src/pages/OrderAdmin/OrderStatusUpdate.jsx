import { Modal, Form, Select, Input, Button, message } from "antd";
import { useEffect, useState } from "react";
import { updateOrderStatus } from "../../services/orderService";

const { TextArea } = Input;

function OrderStatusUpdate({ open, onClose, order, onReload }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && order) {
            form.setFieldsValue({
                newStatus: order.status,
                adminNote: "" // Khởi tạo rỗng để Admin nhập lý do mới
            });
        }
    }, [open, order, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await updateOrderStatus(order.orderId, values);
            message.success("Cập nhật trạng thái đơn hàng thành công!");
            onReload();
            onClose();
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi cập nhật trạng thái!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Cập nhật Đơn hàng #${order?.orderId?.split('-')[0]}`}
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            centered
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item 
                    label="Trạng thái mới" 
                    name="newStatus" 
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                    <Select options={[
                        { value: "PENDING", label: "Chờ xác nhận" },
                        { value: "CONFIRMED", label: "Đã xác nhận" },
                        { value: "SHIPPING", label: "Đang giao hàng" },
                        { value: "DELIVERED", label: "Đã giao (Thành công)" },
                        { value: "CANCELLED", label: "Đã hủy" },
                        { value: "RETURNED", label: "Trả hàng/Hoàn tiền" }
                    ]} />
                </Form.Item>

                <Form.Item 
                    label="Ghi chú nội bộ (Tùy chọn)" 
                    name="adminNote"
                    tooltip="Ghi chú này khách hàng không nhìn thấy. Dùng để note lại lý do đổi trạng thái (VD: Khách boom hàng, Đã gọi báo hết size...)"
                >
                    <TextArea rows={4} placeholder="Nhập lý do hoặc ghi chú nội bộ..." />
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Button onClick={onClose} disabled={loading}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Lưu trạng thái
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export default OrderStatusUpdate;