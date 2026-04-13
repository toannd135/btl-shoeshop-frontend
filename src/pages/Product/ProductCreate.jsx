import { Modal, Form, Input, Select, Button, message, Upload } from "antd";
import { SafetyCertificateOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { createProduct } from "../../services/productService";
import { getCateList } from "../../services/cateService";

const { TextArea } = Input;

function ProductCreate({ open, onClose }) {
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

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("brand", values.brand);
            formData.append("description", values.description);
            formData.append("gender", values.gender);

            if (values.categoryId) formData.append("categoryId", values.categoryId);
            if (values.status) formData.append("status", values.status);

            if (imageFile) {
                formData.append("image", imageFile);
            }

            await createProduct(formData);
            message.success("Tạo sản phẩm gốc thành công!");

            form.resetFields();
            setImageFile(null);
            onClose(true);
        } catch (err) {
            console.error(err);
            message.error("Tạo thất bại");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Tạo mới sản phẩm</span>
                </div>
            }
            open={open}
            onCancel={() => {
                setImageFile(null);
                onClose(false);
            }}
            footer={null}
            centered
            width={800}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="Ảnh sản phẩm (MultipartFile image)">
                    <Upload
                        showUploadList={false}
                        beforeUpload={file => {
                            if (file.size > 2 * 1024 * 1024) {
                                message.error('Ảnh phải nhỏ hơn 2MB');
                                return Upload.LIST_IGNORE;
                            }
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onload = e => form.setFieldsValue({ imageUrl: e.target.result });
                            reader.readAsDataURL(file);
                            return false;
                        }}
                    >
                        <Button icon={<UploadOutlined />}>Chọn file ảnh</Button>
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
                    <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: "Bắt buộc nhập" }]} style={{ flex: 1 }}>
                        <Input placeholder="VD: Nike Air Force 1" />
                    </Form.Item>
                    <Form.Item label="Thương hiệu (Brand)" name="brand" rules={[{ required: true, message: "Bắt buộc nhập" }]} style={{ flex: 1 }}>
                        <Input placeholder="VD: Nike" />
                    </Form.Item>
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                    <Form.Item label="Danh mục" name="categoryId" style={{ flex: 1 }}>
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={categories
                                .filter(c => c.status === 'ACTIVE')
                                .map(c => {
                                    let labelDisplay = c.categoryName;
                                    if (c.parentId) {
                                        const parentCate = categories.find(p => p.categoryId === c.parentId);
                                        if (parentCate) {
                                            labelDisplay = `${c.categoryName} - ${parentCate.categoryName}`;
                                        }
                                    }
                                    return {
                                        value: c.categoryId,
                                        label: labelDisplay
                                    };
                                })
                            }
                            placeholder="Chọn danh mục"
                        />
                    </Form.Item>
                    <Form.Item label="Giới tính" name="gender" rules={[{ required: true, message: "Bắt buộc chọn" }]} style={{ flex: 1 }}>
                        <Select
                            options={[
                                { value: "MALE", label: "MALE" },
                                { value: "FEMALE", label: "FEMALE" },
                                { value: "OTHER", label: "OTHER" },
                            ]}
                        />
                    </Form.Item>
                </div>

                <Form.Item label="Trạng thái" name="status" initialValue="ACTIVE">
                    <Select
                        options={[
                            { value: "ACTIVE", label: "ACTIVE" },
                            { value: "INACTIVE", label: "INACTIVE" },
                            { value: "SUSPENDED", label: "SUSPENDED" },
                            { value: "DELETED", label: "DELETED" }
                        ]}
                    />
                </Form.Item>

                <Form.Item label="Mô tả chi tiết" name="description" rules={[{ required: true, message: "Bắt buộc nhập" }]}>
                    <TextArea rows={4} placeholder="Nhập mô tả..." />
                </Form.Item>

                <Form.Item>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <Button onClick={() => onClose(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit">Tạo mới</Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ProductCreate;