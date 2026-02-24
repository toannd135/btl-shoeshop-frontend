import { Modal, Form, Input, Select } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useEffect } from "react";

function RoleDetail({ open, onClose, role }) {
    
    const [form] = Form.useForm();

    useEffect(() => {
        if (role) {
            form.setFieldsValue({
                name: role.name,
                code: role.code,
                status: role.status,
                description: role.description
            });
        }
    }, [role, form]);

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <LockOutlined />
                    <span>Chi tiết vai trò</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            centered
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Tên" name="name">
                    <Input />
                </Form.Item>

                <Form.Item label="Code" name="code">
                    <Input />
                </Form.Item>

                <Form.Item label="Trạng thái" name="status">
                    <Select>
                        <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                        <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                        <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
                        <Select.Option value="DELETED">DELETED</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={8} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default RoleDetail;
