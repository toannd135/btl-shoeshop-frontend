import { Modal, Form, Input, Select, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { updateRole } from "../../services/roleService";

function RoleUpdate({ open, onClose, role, permissions = [] }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (role) {
                form.setFieldsValue({
                    name: role.name,
                    code: role.code,
                    status: role.status,
                    permissionIds: role.permissions?.map(p => ({
                        value: p.permissionId || p.id,
                        label: p.name
                    })),
                });
            }
        }
    }, [open, role, form]);

    const handleSubmit = async (values) => {
        const payload = {
            status: values.status,
            permissions: values.permissionIds?.map(obj => ({
                id: obj.value || obj 
            }))
        };

        try {
            const response = await updateRole(role.roleId, payload);
            if (response) {
                message.success("Cập nhật vai trò thành công!");
                onClose(true);
            } else {
                message.error("Cập nhật vai trò thất bại!");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi hệ thống khi cập nhật!");
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
                destroyOnClose
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
                            labelInValue
                            options={permissions.map(p => ({
                                key: p.permissionId || p.id,
                                value: p.permissionId || p.id,
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
