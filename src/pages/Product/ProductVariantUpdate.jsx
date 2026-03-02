import { Modal, Form, Input, InputNumber, Select, Button, message, Row, Col, ColorPicker } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { updateProductVariant } from "../../services/productService";

function ProductVariantUpdate({ open, onClose, productId, variant, onReload }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && variant) {
            form.setFieldsValue({
                color: variant.color,
                sku: variant.sku,
                size: variant.size,
                quantity: variant.quantity,
                basePrice: variant.basePrice,
                status: variant.status
            });
        }
    }, [open, variant, form]);

    const handleSubmit = async (values) => {
        try {
            const colorHex = typeof values.color === 'string' ? values.color : values.color.toHexString();

            const payload = {
                color: colorHex,
                sku: values.sku,
                size: values.size,
                quantity: values.quantity,
                basePrice: values.basePrice,
                status: values.status
            };

            await updateProductVariant(productId, variant.productVariantId, payload);
            message.success("Cập nhật biến thể thành công!");
            onReload();
            onClose();
        } catch (err) {
            console.error(err);
            message.error("Cập nhật thất bại");
        }
    };

    return (
        <Modal
            title={<><EditOutlined /> Sửa biến thể</>}
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="SKU" name="sku">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Màu sắc" name="color" rules={[{ required: true }]}>
                            <ColorPicker showText format="hex" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Kích thước" name="size">
                            <InputNumber style={{ width: '100%' }}/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Số lượng" name="quantity">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Trạng thái" name="status">
                            <Select options={[
                                { value: "ACTIVE", label: "ACTIVE" },
                                { value: "INACTIVE", label: "INACTIVE" },
                                { value: "SUSPENDED", label: "SUSPENDED" },
                                { value: "DELETED", label: "DELETED" }
                            ]} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Giá cơ bản (VNĐ)" name="basePrice">
                    <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" htmlType="submit">Lưu cập nhật</Button>
                </div>
            </Form>
        </Modal>
    );
}

export default ProductVariantUpdate;