import { Modal, Form, Input, Select, Button, message, Upload } from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { updateProduct } from "../../services/productService";
import { getCateList } from "../../services/cateService";

const { TextArea } = Input;

function ProductUpdate({ open, onClose, product, onReload }) {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCateList();
                setCategories(res.data || []);
            } catch (error) {
                console.error("Lỗi lấy danh mục", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (open) {
            form.resetFields();
            setImageFile(null);
            if (product) {
                form.setFieldsValue({
                    name: product.name,
                    brand: product.brand,
                    description: product.description,
                    categoryId: product.categoryId,
                    gender: product.gender,
                    status: product.status,
                    imageUrl: product.imageUrl
                });
            }
        }
    }, [open, product, form]);

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            if (values.name) formData.append("name", values.name);
            if (values.brand) formData.append("brand", values.brand);
            if (values.description) formData.append("description", values.description);
            if (values.gender) formData.append("gender", values.gender);
            if (values.categoryId) formData.append("categoryId", values.categoryId);
            if (values.status) formData.append("status", values.status);

            if (imageFile) {
                formData.append("image", imageFile); 
            }

            await updateProduct(product.productId, formData);
            message.success("Cập nhật sản phẩm thành công");

            onClose();
            onReload();
        } catch (error) {
            message.error("Cập nhật thất bại");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <EditOutlined />
                    <span>Cập nhật sản phẩm</span>
                </div>
            }
            open={open}
            onCancel={() => {
                setImageFile(null);
                onClose();
            }}
            footer={null}
            centered
            width={800}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="Đổi ảnh minh họa">
                    <Upload
                        showUploadList={false}
                        beforeUpload={file => {
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onload = e => form.setFieldsValue({ imageUrl: e.target.result });
                            reader.readAsDataURL(file);
                            return false;
                        }}
                    >
                        <Button icon={<UploadOutlined />}>Tải ảnh khác lên</Button>
                    </Upload>
                </Form.Item>

                <Form.Item shouldUpdate>
                    {() => {
                        const preview = form.getFieldValue("imageUrl");
                        return preview ? (
                            <div style={{ marginBottom: 10 }}>
                                <img src={preview} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }} />
                            </div>
                        ) : null;
                    }}
                </Form.Item>

                <div style={{ display: "flex", gap: 16 }}>
                    <Form.Item label="Tên sản phẩm" name="name" style={{ flex: 1 }}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Thương hiệu" name="brand" style={{ flex: 1 }}>
                        <Input />
                    </Form.Item>
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                    <Form.Item label="Danh mục (Category)" name="categoryId" style={{ flex: 1 }}>
                        <Select
                            options={categories
                                .filter(c => c.parentId != null) 
                                .map(c => ({
                                    value: c.categoryId,
                                    label: c.categoryName 
                                }))
                            }
                            placeholder="Chọn danh mục con"
                        />
                    </Form.Item>
                    <Form.Item label="Giới tính" name="gender" style={{ flex: 1 }}>
                        <Select options={[{ value: "MALE", label: "MALE" }, { value: "FEMALE", label: "FEMALE" }, { value: "OTHER", label: "OTHER" }]} />
                    </Form.Item>
                </div>

                <Form.Item label="Trạng thái" name="status">
                    <Select options={[{ value: "ACTIVE", label: "ACTIVE" }, { value: "INACTIVE", label: "INACTIVE" }, { value: "SUSPENDED", label: "SUSPENDED" },
                    { value: "DELETED", label: "DELETED" }]} />
                </Form.Item>

                <Form.Item label="Mô tả" name="description">
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ProductUpdate;