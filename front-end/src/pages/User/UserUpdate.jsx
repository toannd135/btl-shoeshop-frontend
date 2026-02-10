import { EditOutlined } from "@ant-design/icons";
import { Form, Input, Button, notification, Modal, Spin, Select } from "antd";
import { useEffect, useState } from "react";
import { updateUser } from "../../services/userService";
import { getRoleList } from "../../services/roleService";

function UserUpdate(props) {
    const { record, onReload } = props;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();
    const [roles, setRoles] = useState([]);
    const fetchAPIRole = async () => {
        const res = await getRoleList();
        setRoles(res.data.roles || []);
    };
    useEffect(() => {
        fetchAPIRole();
    }, []);
    const handleOpen = () => {
        setOpen(true);
        form.setFieldsValue({
            ...record,
            roleId: record.role?.roleId,
        });
    };

    const handleCancel = () => {
        setOpen(false);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        const res = await updateUser(record.userId, values);

        setTimeout(() => {
            if (res) {
                api.success({
                    message: "Cập nhật thành công",
                    description: `User ${record.username} đã được cập nhật`
                });
                setOpen(false);
                onReload();
            } else {
                api.error({
                    message: "Cập nhật thất bại",
                    description: "Có lỗi xảy ra"
                });
            }
            setLoading(false);
        }, 2000);
    };

    return (
        <>
            {contextHolder}
            <Button
                size="small"
                type="primary"
                icon={<EditOutlined />}
                onClick={handleOpen}
            />

            <Modal
                open={open}
                title="Cập nhật người dùng"
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
            >
                <Spin spinning={loading}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[{ required: true }]}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item name="firstName" label="Tên">
                            <Input />
                        </Form.Item>

                        <Form.Item name="lastName" label="Họ">
                            <Input />
                        </Form.Item>


                        <Form.Item name="email">
                            <Input disabled />
                        </Form.Item>


                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Ảnh đại diện"
                            name="avatarImage"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Giới tính"
                            name="gender"
                        >
                            <Select>
                                <Select.Option value="MALE">MALE</Select.Option>
                                <Select.Option value="FEMALE">FEMALE</Select.Option>
                                <Select.Option value="OTHER">OTHER</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Trang thái" name="status">
                            <Select>
                                <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                                <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                                <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
                                <Select.Option value="DELETED">DELETED</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Role"
                            name="roleId"
                            rules={[{ required: true }]}
                        >
                            <Select placeholder="Chọn role">
                                {roles.map(r => (
                                    <Select.Option key={r.roleId} value={r.roleId}>
                                        {r.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Lưu thay đổi
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
}

export default UserUpdate;
