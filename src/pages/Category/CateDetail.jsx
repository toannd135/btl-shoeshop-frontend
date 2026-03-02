import { Modal, Form, Input, Select } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useEffect } from "react";

function CateDetail({ open, onClose, category, categoryMap }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (category) {
            form.setFieldsValue({
                categoryName: category.categoryName,
                parentName: category.parentId ? categoryMap[category.parentId] : "Danh mục gốc",
                status: category.status,
                createdAt: category.createdAt ? new Date(category.createdAt).toLocaleString() : "",
                updatedAt: category.updatedAt ? new Date(category.updatedAt).toLocaleString() : "",
            });
        }
    }, [category, form, categoryMap]);

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Chi tiết danh mục</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            centered
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Tên danh mục" name="categoryName">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Danh mục cha" name="parentName">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Trạng thái" name="status">
                    <Select disabled>
                        <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                        <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                        <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
                        <Select.Option value="DELETED">DELETED</Select.Option>
                    </Select>
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item label="Ngày tạo" name="createdAt" style={{ flex: 1 }}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Cập nhật lần cuối" name="updatedAt" style={{ flex: 1 }}>
                        <Input disabled />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
}

export default CateDetail;