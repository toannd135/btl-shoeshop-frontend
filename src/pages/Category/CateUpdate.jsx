import { Modal, Form, Input, Select, Button, message } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { updateCategory } from "../../services/cateService";
import { useEffect } from "react";

function CateUpdate({ open, onClose, category, parentCategories }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (category) {
            form.setFieldsValue({
                categoryName: category.categoryName,
                parentId: category.parentId,
                status: category.status
            });
        }
    }, [category, form]);

    const handleSubmit = async (values) => {
        try {
            const response = await updateCategory(category.categoryId, values);
            if (response) {
                form.resetFields();
                message.success("Cập nhật danh mục thành công!");
                onClose(true);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Cập nhật danh mục thất bại!");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Cập nhật danh mục</span>
                </div>
            }
            open={open}
            onCancel={() => onClose(false)}
            centered
            footer={[
                <Button key="cancel" onClick={() => onClose(false)}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => form.submit()}
                >
                    Cập nhật
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label="Tên danh mục"
                    name="categoryName"
                    rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Danh mục cha"
                    name="parentId"
                    rules={[{ required: true, message: "Vui lòng chọn danh mục cha!" }]}
                >
                    <Select placeholder="Chọn danh mục cha">
                        {parentCategories.map(parent => (
                            <Select.Option key={parent.categoryId} value={parent.categoryId}>
                                {parent.categoryName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Trạng thái"
                    name="status"
                    rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                >
                    <Select>
                        <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                        <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                        <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
                        <Select.Option value="DELETED">DELETED</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CateUpdate;