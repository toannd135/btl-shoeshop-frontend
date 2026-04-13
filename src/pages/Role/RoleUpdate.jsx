import { Modal, Form, Input, Select, Button, message, Space } from "antd";
import { LockOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { updateRole } from "../../services/roleService";
import { getPermissionList } from "../../services/permissionService";

function RoleUpdate({ open, onClose, role }) {
    const [form] = Form.useForm();
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        const fetchPermissions = async () => {
            const res = await getPermissionList();
            setPermissions(res.data.permissions || []);
        };
        fetchPermissions();
    }, []);

    useEffect(() => {
        if (role) {
            form.setFieldsValue({
                name: role.name,
                code: role.code,
                status: role.status,
                description: role.description,
                permissions: role.permissions?.map(p => p.permissionId)
            });
        }
    }, [role, form]);

    const handleSubmit = async (values) => {
        const data = {
            ...values,
            permissions: values.permissions?.map(id => ({ id })) || []
        };
        const response = await updateRole(role.roleId, data);
        if (response) {
            form.resetFields();
            message.success("Cập nhật vai trò thành công!");
            onClose(true);
        } else {
            message.error("Cập nhật vai trò thất bại!");
        }
    };

    const handleClearAll = async () => {
        const response = await updateRole(role.roleId, { clearAll: true });
        if (response) {
            message.success("Đã xóa tất cả quyền!");
            onClose(true);
        } else {
            message.error("Xóa tất cả quyền thất bại!");
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
                width={800}
                footer={[
                    <Button key="cancel" onClick={onClose}>
                        Hủy
                    </Button>,
                    <Button
                        key="clear"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleClearAll}
                    >
                        Xóa tất cả quyền
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

                    <Form.Item label="Quyền hạn" name="permissions">
                        <Select
                            mode="multiple"
                            placeholder="Chọn quyền hạn"
                            style={{ width: '100%' }}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={permissions.map(p => ({
                                label: `${p.module} - ${p.name} (${p.method} ${p.apiPath})`,
                                value: p.permissionId
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default RoleUpdate;
