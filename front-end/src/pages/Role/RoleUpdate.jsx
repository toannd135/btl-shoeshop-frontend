import { Modal, Form, Input, Select, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { updateRole } from "../../services/roleService";

function RoleUpdate({ open, onClose, role, permissions = [] }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (role) {
            form.setFieldsValue({
                name: role.name,
                code: role.code,
                status: role.status,
                permissionIds: role.permissions?.map(p => p.permissionId),
            });
        }
    }, [role, form]);

    const handleSubmit = async (values) => {
        const payload = {
            status: values.status,
            permissions: values.permissionIds?.map(id => ({ id }))
        };

        const response = await updateRole(role.roleId, payload);

        if (response) {
            form.resetFields();
            message.success("Cập nhật vai trò thành công!");
            onClose(true);
        } else {
            message.error("Cập nhật vai trò thất bại!");
        }
    };

    return (
        <>

            <Modal
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <LockOutlined />
                        <span>Chỉnh sửa vai trò</span>
                    </div>
                }
                open={open}
                onCancel={onClose}
                centered
                footer={[
                    <Button key="cancel" onClick={onClose}>
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
                    <Form.Item label="Tên" name="name">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item label="Code" name="code">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item label="Trạng thái" name="status">
                        <Select>
                            <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                            <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                            <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
                            <Select.Option value="DELETED">DELETED</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Quyền hạn"
                        name="permissionIds"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn quyền"
                            options={permissions.map(p => ({
                                value: p.permissionId,
                                label: p.name
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default RoleUpdate;
