import { Modal, Form, Input, InputNumber, Select, Button, message, Row, Col, ColorPicker } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { createProductVariant } from "../../services/productService";

function ProductVariantCreate({ open, onClose, productId, onReload }) {
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        try {
            const colorHex = typeof values.color === 'string' ? values.color : values.color.toHexString();

            const payload = {
                color: colorHex,
                sku: values.sku,
                size: values.size,
                quantity: values.quantity,
                basePrice: values.basePrice,
                status: values.status || "ACTIVE"
            };

            await createProductVariant(productId, payload);
            message.success("Tạo biến thể thành công!");

            form.resetFields();
            onReload();
            onClose();
        } catch (err) {
            console.error(err);
            message.error("Tạo biến thể thất bại");
        }
    };

    return (
        <Modal
            title={<><SafetyCertificateOutlined /> Thêm biến thể mới</>}
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="SKU" name="sku" rules={[{ required: true }]}>
                            <Input placeholder="VD: AM90-WHT-42" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Màu sắc" name="color" rules={[{ required: true }]} initialValue="#1677ff">
                            <ColorPicker showText format="hex" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Kích thước" name="size" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} placeholder="VD: 42" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Trạng thái" name="status" initialValue="ACTIVE">
                            <Select options={[
                                { value: "ACTIVE", label: "ACTIVE" },
                                { value: "INACTIVE", label: "INACTIVE" },
                                { value: "SUSPENDED", label: "SUSPENDED" },
                                { value: "DELETED", label: "DELETED" }
                            ]} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Giá cơ bản (VNĐ)" name="basePrice" rules={[{ required: true, type: 'number', min: 1 }]}>
                    <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" htmlType="submit">Lưu lại</Button>
                </div>
            </Form>
        </Modal>
    );
}

export default ProductVariantCreate;