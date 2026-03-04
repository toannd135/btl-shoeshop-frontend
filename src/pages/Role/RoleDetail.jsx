import { Modal, Form, Input, Select } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useEffect } from "react";

function RoleDetail({ open, onClose, role, permissions = [] }) {

    const [form] = Form.useForm();

    useEffect(() => {
        if (role) {
            form.setFieldsValue({
                name: role.name,
                code: role.code,
                status: role.status,
                permissionIds: role.permissions?.map(p => p.name),
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
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Code" name="code">
                    <Input disabled/>
                </Form.Item>

                <Form.Item label="Trạng thái" name="status">
                    <Select disabled>
                        <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                        <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                        <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
                        <Select.Option value="DELETED">DELETED</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Quyền hạn" name="permissionIds">
                    <Select
                        mode="multiple"
                        disabled
                        options={permissions.map(p => ({
                            value: p.name,
                            label: p.name
                        }))}
                    />
                </Form.Item>

            </Form>
        </Modal>
    );
}

export default RoleDetail;
