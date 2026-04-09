import { Button, Form, Input, InputNumber, Modal, Select, message } from "antd";
import { createInventoryTransaction } from "../../services/inventoryTransactionService";

const TYPE_OPTIONS = [
    { value: "PURCHASE", label: "Nhập từ NCC" },
    { value: "SALE", label: "Bán hàng" },
    { value: "CUSTOMER_RETURN", label: "Khách trả hàng" },
    { value: "SUPPLIER_RETURN", label: "Trả NCC" },
    { value: "ADJUST", label: "Điều chỉnh" },
];

function InventoryTransactionCreate({ open, onClose, productOptions = [], onReload }) {
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        try {
            await createInventoryTransaction({
                variantId: values.variantId,
                quantityChange: values.quantityChange,
                type: values.type,
                reason: values.reason,
            });

            message.success("Tạo phiếu kho thành công");
            form.resetFields();
            onClose(true);
            if (onReload) onReload();
        } catch (error) {
            console.error("Lỗi tạo giao dịch kho", error);
            message.error(error?.message || "Tạo phiếu kho thất bại");
        }
    };

    return (
        <Modal
            title="Tạo phiếu kho"
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose(false);
            }}
            footer={[
                <Button
                    key="cancel"
                    onClick={() => {
                        form.resetFields();
                        onClose(false);
                    }}
                >
                    Đóng
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    Tạo mới
                </Button>,
            ]}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label="Biến thể sản phẩm"
                    name="variantId"
                    rules={[{ required: true, message: "Vui lòng chọn biến thể" }]}
                >
                    <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="Chọn biến thể"
                        options={productOptions}
                    />
                </Form.Item>

                <Form.Item
                    label="Loại giao dịch"
                    name="type"
                    rules={[{ required: true, message: "Vui lòng chọn loại giao dịch" }]}
                >
                    <Select placeholder="Chọn loại giao dịch" options={TYPE_OPTIONS} />
                </Form.Item>

                <Form.Item
                    label="Số lượng thay đổi"
                    name="quantityChange"
                    rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
                    extra="Nhập số dương để tăng kho, số âm để giảm kho."
                >
                    <InputNumber style={{ width: "100%" }} placeholder="Ví dụ: 10 hoặc -2" />
                </Form.Item>

                <Form.Item
                    label="Lý do"
                    name="reason"
                    rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
                >
                    <Input.TextArea rows={4} placeholder="Nhập lý do tạo phiếu kho" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default InventoryTransactionCreate;