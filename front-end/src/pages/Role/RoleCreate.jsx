import { Modal, Form, Input, Select, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { createRole } from "../../services/roleService";
import { getPermissionList } from "../../services/permissionService";
import { useState } from "react";
function RoleCreate({ open, onClose, role }) {
    const [form] = Form.useForm();
    const [permissions, setPermissions] = useState([]);
    useEffect(() => {
        const fetchPermissions = async () => {
            const res = await getPermissionList();
            setPermissions(res.data.permissions || []);
        };
        fetchPermissions();
        if (role) {
            form.setFieldsValue({
                name: role.name,
                code: role.code,
                status: role.status,
            });
        }
    }, [role, form]);

    const handleSubmit = async (values) => {
        try {
            const payload = {
                name: values.name,
                code: values.code,
                status: values.status,
                permissions: values.permissionIds
                    ? values.permissionIds.map(id => ({ id }))
                    : []
            };

            const response = await createRole(payload);

            if (response) {
                form.resetFields();
                message.success("Tạo vai trò thành công!");
                onClose(true);
            }
        } catch (error) {
            console.error(error);
            message.error("Tạo vai trò thất bại!");
        }
    };

    return (
        <>

            <Modal
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <LockOutlined />
                        <span>Tạo mới vai trò</span>
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
                        type="primary"
                        className="btn-create"
                        onClick={() => form.submit()}
                    >
                        Tạo
                    </Button>
                ]}
            >

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}>
                        <Input placeholder="Nhập tên vai trò" />
                    </Form.Item>

                    <Form.Item label="Code" name="code" rules={[{ required: true, message: 'Vui lòng nhập code vai trò!' }]}>
                        <Input placeholder="Nhập code vai trò" />
                    </Form.Item>

                    <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                        <Select placeholder="Trạng thái">
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

export default RoleCreate;
