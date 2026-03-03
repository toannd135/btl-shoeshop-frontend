import { Modal, Form, Input, InputNumber, Select, Button, message, Row, Col, ColorPicker, Upload } from "antd";
import { SafetyCertificateOutlined, UploadOutlined } from "@ant-design/icons";
import { createProductVariant, createVariantImage } from "../../services/productService";
import { useState } from "react";

function ProductVariantCreate({ open, onClose, productId, onReload }) {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (values) => {
        setLoading(true);
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
            const res = await createProductVariant(productId, payload);
            const newVariantId = res.data?.productVariantId || res.productVariantId;
            if (fileList.length > 0 && newVariantId) {
                const formData = new FormData();
                formData.append("image", fileList[0].originFileObj);
                formData.append("isPrimary", true);
                formData.append("status", "ACTIVE");

                await createVariantImage(productId, newVariantId, formData);
            }
            message.success("Tạo biến thể thành công!");
            form.resetFields();
            setFileList([]);
            onReload();
            onClose();
        } catch (err) {
            console.error(err);
            message.error("Tạo biến thể thất bại");
        } finally {
            setLoading(false);
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

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Giá cơ bản (VNĐ)" name="basePrice" rules={[{ required: true, type: 'number', min: 1 }]}>
                            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Hình ảnh (Tùy chọn)">
                            <Upload
                                beforeUpload={() => false} 
                                maxCount={1}
                                listType="picture"
                                fileList={fileList}
                                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                                accept="image/*"
                            >
                                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" htmlType="submit">Lưu lại</Button>
                </div>
            </Form>
        </Modal>
    );
}

export default ProductVariantCreate;