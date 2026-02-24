import { Modal, Form, Input, Select } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useEffect } from "react";

function PermissionDetail({ open, onClose, permission }) {
    
    const [form] = Form.useForm();

    useEffect(() => {
        if (permission) {
            form.setFieldsValue({
                name: permission.name,
                apiPath: permission.apiPath,
                method: permission.method,
                module: permission.module,
                status: permission.status,
            });
        }
    }, [permission, form]);

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Chi tiết quyền</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            centered
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Tên quyền" name="name">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Đường dẫn" name="apiPath">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Phương thức" name="method">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Danh mục" name="module">
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
            </Form>
        </Modal>
    );
}

export default PermissionDetail;
