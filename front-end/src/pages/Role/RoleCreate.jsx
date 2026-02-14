import { Modal, Form, Input, Select, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { createRole } from "../../services/roleService";

function RoleCreate({ open, onClose, role }) {
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

    const handleSubmit = async (values) => {
        const response = await createRole(values);
        if (response) {
            form.resetFields();
            message.success("Tạo vai trò thành công!");
            onClose(true);
        } else {
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

                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={8} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default RoleCreate;
