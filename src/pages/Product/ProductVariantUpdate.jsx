import { Modal, Form, Input, InputNumber, Select, Button, message, Row, Col, ColorPicker, Upload } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { updateProductVariant, createVariantImage, getVariantImages, deleteVariantImage } from "../../services/productService";
import "./ProductVariantCreate.css"; 

function ProductVariantUpdate({ open, onClose, productId, variant, onReload }) {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && variant) {
            // 1. Đổ dữ liệu text vào form
            form.setFieldsValue({
                color: variant.color,
                sku: variant.sku,
                size: variant.size,
                quantity: variant.quantity,
                basePrice: variant.basePrice,
                status: variant.status
            });

            // 2. Lấy luôn mảng ảnh 'images' mà ProductVariantList đã truyền sang
            if (variant.images && variant.images.length > 0) {
                const formattedImages = variant.images.map(img => ({
                    uid: img.imageId, // Bắt buộc phải có uid cho Ant Design
                    imageId: img.imageId, // Lưu ID thật để tí gọi API xóa
                    name: 'image.png',
                    status: 'done',
                    url: img.imageURL, // Hiển thị ảnh cũ lên UI
                }));
                setFileList(formattedImages);
            } else {
                setFileList([]); // Nếu không có ảnh thì set rỗng
            }
        }
    }, [open, variant, form]);

    // HÀM XỬ LÝ KHI USER BẤM NÚT XÓA (THÙNG RÁC)
    const handleRemove = async (file) => {
        // Nếu file có 'imageId' -> Đây là ảnh cũ đã nằm trên server -> Phải gọi API xóa db
        if (file.imageId) {
            try {
                await deleteVariantImage(productId, variant.productVariantId, file.imageId);
                message.success("Đã xóa ảnh trên hệ thống!");
            } catch (error) {
                message.error("Lỗi kết nối, xóa ảnh thất bại!");
                return false; // Trả về false để UI không xóa cái ảnh đó đi (vì DB chưa xóa được)
            }
        }
        // Nếu là ảnh mới tải lên chưa kịp lưu -> Antd tự động vứt khỏi UI, không cần gọi API
        return true; 
    };

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
            
            await updateProductVariant(productId, variant.productVariantId, payload);
            
            // Lọc ra file MỚI (originFileObj) để upload
            const newFiles = fileList.filter(file => file.originFileObj);
            if (newFiles.length > 0) {
                const uploadPromises = newFiles.map((file, index) => {
                    const formData = new FormData();
                    formData.append("image", file.originFileObj);
                    formData.append("isPrimary", index === 0 && fileList.length === newFiles.length); // Xử lý logic primary tùy bạn
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
            width={700}
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

                {/* TÁCH DÒNG GIÁ CƠ BẢN RA */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Giá cơ bản (VNĐ)" name="basePrice">
                            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                        </Form.Item>
                    </Col>
                </Row>

                {/* GIAO DIỆN UPLOAD MỚI (CÓ NÚT XÓA) */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Cập nhật hình ảnh">
                            <Upload
                                listType="picture-card"  // 1. CHUYỂN SANG DẠNG LƯỚI CARD CÓ THÙNG RÁC
                                fileList={fileList}
                                onRemove={handleRemove}  // 2. GỌI HÀM XÓA KHI BẤM VÀO THÙNG RÁC
                                beforeUpload={() => false}
                                multiple={true}
                                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                                accept="image/*"
                            >
                                {/* Nút thêm ảnh giao diện mới */}
                                {fileList.length >= 8 ? null : (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Thêm ảnh</div>
                                    </div>
                                )}
                            </Upload>
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