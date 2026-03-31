import { Modal, Form, Input, InputNumber, Select, Button, message, Row, Col, ColorPicker, Upload } from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { updateProductVariant, createVariantImage } from "../../services/productService";
import "./ProductVariantCreate.css"; // Dùng chung file CSS với form Create để lấy style giao diện Messenger

function ProductVariantUpdate({ open, onClose, productId, variant, onReload }) {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

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
            if (variant.imageURL) {
                setFileList([{
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: variant.imageURL, // Ảnh cũ có URL từ server
                }]);
            } else {
                setFileList([]);
            }
        }
    }, [open, variant, form]);

    // Tạo URL preview cho ảnh đầu tiên (hỗ trợ cả ảnh cũ từ server và ảnh mới thêm)
    const previewImage = useMemo(() => {
        if (fileList.length > 0) {
            const firstFile = fileList[0];
            if (firstFile.originFileObj) {
                return URL.createObjectURL(firstFile.originFileObj); // Ảnh mới chọn
            }
            return firstFile.url; // Ảnh cũ đã có trên server
        }
        return null;
    }, [fileList]);

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
                status: values.status
            };
            
            // 1. Cập nhật thông tin biến thể
            await updateProductVariant(productId, variant.productVariantId, payload);
            
            // 2. Lọc ra những file MỚI được chọn (có originFileObj) để gọi API upload
            const newFiles = fileList.filter(file => file.originFileObj);

            if (newFiles.length > 0) {
                const uploadPromises = newFiles.map((file, index) => {
                    const formData = new FormData();
                    formData.append("image", file.originFileObj);
                    // Đặt isPrimary = true cho ảnh mới upload đầu tiên
                    formData.append("isPrimary", index === 0); 
                    return createVariantImage(productId, variant.productVariantId, formData);
                });

                await Promise.all(uploadPromises);
            }

            message.success("Cập nhật biến thể thành công!");
            onReload();
            onClose();
        } catch (err) {
            console.error(err);
            message.error("Cập nhật thất bại");
        } finally {
            setLoading(false);
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
                            <InputNumber style={{ width: '100%' }} />
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

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Giá cơ bản (VNĐ)" name="basePrice">
                            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Cập nhật hình ảnh">
                            <Upload
                                beforeUpload={() => false}
                                multiple={true}
                                showUploadList={false} // Ẩn danh sách mặc định
                                fileList={fileList}
                                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                                accept="image/*"
                            >
                                <Button icon={<UploadOutlined />}>Thêm ảnh mới</Button>
                            </Upload>

                            {/* UI HIỂN THỊ KIỂU MESSENGER */}
                            {fileList.length > 0 && (
                                <div className="messenger-image-preview">
                                    <img 
                                        src={previewImage} 
                                        alt="preview" 
                                        className="preview-img" 
                                    />
                                    {fileList.length > 1 && (
                                        <div className="preview-overlay">
                                            +{fileList.length - 1}
                                        </div>
                                    )}
                                </div>
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Button onClick={onClose} disabled={loading}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>Lưu cập nhật</Button>
                </div>
            </Form>
        </Modal>
    );
}

export default ProductVariantUpdate;