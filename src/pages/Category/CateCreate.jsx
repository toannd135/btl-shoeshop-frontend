import { Modal, Form, Input, Select, Button, message } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { createCategory } from "../../services/cateService";

function CateCreate({ open, onClose, parentCategories }) {
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        try {
            const response = await createCategory(values);
            if (response) {
                form.resetFields();
                message.success("Tạo danh mục thành công!");
                onClose(true);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Tạo danh mục thất bại!");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Tạo mới danh mục</span>
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
                    className="btn-create"
                    onClick={() => form.submit()}
                >
                    Tạo
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'ACTIVE' }}>
                <Form.Item
                    label="Tên danh mục"
                    name="categoryName"
                    rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
                >
                    <Input placeholder="Nhập tên danh mục" />
                </Form.Item>

                <Form.Item
                    label="Danh mục cha"
                    name="parentId"
                    rules={[{ required: false, message: "Vui lòng chọn danh mục cha!" }]}
                >
                    <Select placeholder="Chọn danh mục cha" allowClear>
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
                    <Select placeholder="Chọn trạng thái">
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

export default CateCreate;