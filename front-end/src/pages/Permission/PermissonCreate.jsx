import { Modal, Form, Input, Select, Button, message } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { createPermission } from "../../services/permissionService";

function PermissionCreate({ open, onClose }) {
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        const response = await createPermission(values);

        if (response) {
            form.resetFields();
            message.success("Tạo quyền thành công!");
            onClose(true);
        } else {
            message.error("Tạo quyền thất bại!");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Tạo mới quyền</span>
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
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label="Tên quyền"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên quyền!" }]}
                >
                    <Input placeholder="Nhập tên quyền" />
                </Form.Item>

                <Form.Item
                    label="Đường dẫn"
                    name="apiPath"
                    rules={[{ required: true, message: "Vui lòng nhập đường dẫn!" }]}
                >
                    <Input placeholder="/api/example" />
                </Form.Item>

                <Form.Item
                    label="Phương thức"
                    name="method"
                    rules={[{ required: true, message: "Vui lòng chọn phương thức!" }]}
                >
                    <Select placeholder="Chọn phương thức">
                        <Select.Option value="GET">GET</Select.Option>
                        <Select.Option value="POST">POST</Select.Option>
                        <Select.Option value="PUT">PUT</Select.Option>
                        <Select.Option value="DELETE">DELETE</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Danh mục"
                    name="module"
                    rules={[{ required: true, message: "Vui lòng nhập danh mục!" }]}
                >
                    <Input placeholder="USER / ROLE / PRODUCT ..." />
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

export default PermissionCreate;
