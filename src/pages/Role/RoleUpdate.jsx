import { Modal, Form, Input, Select, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useEffect, useMemo } from "react";
import { updateRole } from "../../services/roleService";

function RoleUpdate({ open, onClose, role, permissions = [] }) {
    const [form] = Form.useForm();

    const permissionOptions = useMemo(() => {
        return permissions.map((p) => ({
            value: p.permissionId || p.id,
            label: p.name,
        }));
    }, [permissions]);

    useEffect(() => {
        if (!open) return;

        form.resetFields();

        if (role) {
            const selectedPermissions = (role.permissions || []).map((p) => ({
                value: p.permissionId || p.id,
                label: p.name,
            }));

            form.setFieldsValue({
                name: role.name,
                code: role.code,
                status: role.status,
                permissionIds: selectedPermissions,
            });
        }
    }, [open, role, form]);

    const handleSubmit = async (values) => {
        const permissionMap = new Map();

        (values.permissionIds || []).forEach((item) => {
            const id =
                typeof item === "object"
                    ? item?.value || item?.key || item?.id
                    : item;

            if (id) {
                permissionMap.set(id, { id });
            }
        });

        const payload = {
            status: values.status,
            permissions: Array.from(permissionMap.values()),
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
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <LockOutlined />
                    <span>Chỉnh sửa vai trò</span>
                </div>
            }
            open={open}
            onCancel={() => onClose(false)}
            centered
            destroyOnClose
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

                <Form.Item label="Quyền hạn" name="permissionIds">
                    <Select
                        mode="multiple"
                        placeholder="Chọn quyền"
                        labelInValue
                        optionFilterProp="label"
                        
                        options={permissionOptions}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default RoleUpdate;