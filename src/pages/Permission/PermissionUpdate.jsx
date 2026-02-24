import { Modal, Form, Input, Select, Button, message } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { updatePermission } from "../../services/permissionService";
import { useEffect } from "react";
function PermissionUpdate({ open, onClose, permission }) {
    const [form] = Form.useForm();

    useEffect(() => {
            if (permission) {
                form.setFieldsValue({
                    name: permission.name,
                    apiPath: permission.apiPath,
                    method: permission.method,
                    module: permission.module,
                    status: permission.status
                });
            }
        }, [permission, form]);
    
        const handleSubmit = async (values) => {
            const response = await updatePermission(permission.permissionId, values);
            if (response) {
                form.resetFields();
                message.success("Cập nhật quyền thành công!");
                onClose(true);
            } else {
                message.error("Cập nhật quyền thất bại!");
            }
        };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Cập nhật quyền</span>
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
                    label="Tên quyền"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên quyền!" }]}
                >
                    <Input disabled/>
                </Form.Item>

                <Form.Item
                    label="Đường dẫn"
                    name="apiPath"
                    rules={[{ required: true, message: "Vui lòng nhập API Path!" }]}
                >
                    <Input disabled/>
                </Form.Item>

                <Form.Item
                    label="Phương thức"
                    name="method"
                    rules={[{ required: true, message: "Vui lòng chọn method!" }]}
                >
                    <Select disabled>
                        <Select.Option value="GET">GET</Select.Option>
                        <Select.Option value="POST">POST</Select.Option>
                        <Select.Option value="PUT">PUT</Select.Option>
                        <Select.Option value="DELETE">DELETE</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Danh mục"
                    name="module"
                    rules={[{ required: true, message: "Vui lòng nhập module!" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Trạng thái"
                    name="status"
                    rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                >
                    <Select >
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

export default PermissionUpdate;
