import { Modal, Form, Input, Select, Row, Col } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import dayjs from "dayjs";

const { TextArea } = Input;

function ProductDetail({ open, onClose, product, categoryMap }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (product) {
            form.setFieldsValue({
                productId: product.productId,
                name: product.name,
                brand: product.brand,
                description: product.description,
                categoryName: categoryMap && categoryMap[product.categoryId] ? categoryMap[product.categoryId] : "Không xác định",
                gender: product.gender,
                status: product.status,
                createdAt: product.createdAt ? dayjs(product.createdAt).format("DD/MM/YYYY HH:mm:ss") : "",
                updatedAt: product.updatedAt ? dayjs(product.updatedAt).format("DD/MM/YYYY HH:mm:ss") : "",
            });
        }
    }, [product, form, categoryMap]);

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Chi tiết sản phẩm</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={800}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Ảnh minh họa">
                    <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center" }}>
                        {product?.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt="product"
                                style={{ width: 150, height: 150, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }}
                            />
                        ) : (
                            <span style={{ color: "#aaa" }}>Chưa có hình ảnh</span>
                        )}
                    </div>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="ID Sản phẩm" name="productId">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tên sản phẩm" name="name">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Thương hiệu (Brand)" name="brand">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Giới tính" name="gender">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Danh mục" name="categoryName">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Trạng thái" name="status">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Ngày tạo" name="createdAt">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Lần cập nhật cuối" name="updatedAt">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Mô tả chi tiết" name="description">
                    <TextArea rows={4} disabled />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ProductDetail;