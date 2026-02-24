import { Modal, Form, Input, Select, Button, message, DatePicker } from "antd";
import { useEffect, useState } from "react";
import { getRoleList } from "../../services/roleService";
import { createUser } from "../../services/userService";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

function UserCreate({ open, onClose, user, onReload }) {
    const [form] = Form.useForm();
    const [roles, setRoles] = useState([]);

    const fetchRoles = async () => {
        const res = await getRoleList();
        setRoles(res.data.roles || []);
    };

    useEffect(() => {
        fetchRoles();
        if (user) {
            form.setFieldsValue({
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth
                    ? dayjs(user.dateOfBirth)
                    : null,
                avatarImage: user.avatarImage,
                status: user.status,
                roleId: user.role?.roleId
            });
        }
    }, [user, form]);

    const handleSubmit = async (values) => {
        try {
            const payload = {
                firstName: values.firstName,
                lastName: values.lastName,
                username: values.username,
                email: values.email,
                password: values.password,
                phone: values.phone,
                gender: values.gender,
                avatarImage: values.avatarImage,
                dateOfBirth: values.dateOfBirth
                    ? values.dateOfBirth.format("YYYY-MM-DD")
                    : null,
                role: {
                    id: values.roleId
                }
            };

            await createUser(payload);
            message.success("Tạo người dùng thành công");
            onClose(true);

        } catch (err) {
            console.error(err);
            message.error("Tạo thất bại");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Tạo mới người dùng</span>
                </div>
            }
            open={open}
            onCancel={() => onClose(false)}
            footer={null}
            centered
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item label="Ảnh đại diện" name="avatarImage">
                    <Input />
                </Form.Item>
                <Form.Item shouldUpdate>
                    {() => {
                        const avatar = form.getFieldValue("avatarImage");
                        return avatar ? (
                            <div style={{ marginBottom: 20 }}>
                                <img
                                    src={avatar}
                                    alt="avatar preview"
                                    style={{
                                        width: 120,
                                        height: 120,
                                        objectFit: "cover",
                                        borderRadius: "50%",
                                        border: "3px solid #16a34a"
                                    }}
                                />
                                <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>

                                </div>
                            </div>
                        ) : null;
                    }}
                </Form.Item>

                <Form.Item
                    label="Tên"
                    name="firstName"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Họ đệm"
                    name="lastName"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Tên tài khoản"
                    name="username"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: "email" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="phone">
                    <Input />
                </Form.Item>

                <Form.Item label="Giới tính" name="gender">
                    <Select
                        options={[
                            { value: "MALE", label: "MALE" },
                            { value: "FEMALE", label: "FEMALE" },
                            { value: "OTHER", label: "OTHER" },
                        ]}
                    />
                </Form.Item>

                <Form.Item label="Ngày sinh" name="dateOfBirth">
                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    label="Trạng thái"
                    name="status"
                    initialValue="ACTIVE"
                >
                    <Select
                        options={[
                            { value: "ACTIVE", label: "ACTIVE" },
                            { value: "INACTIVE", label: "INACTIVE" },
                            { value: "SUSPENDED", label: "SUSPENDED" },
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    label="Role"
                    name="roleId"
                    rules={[{ required: true }]}
                >
                    <Select
                        options={roles.map(r => ({
                            value: r.roleId,
                            label: r.name
                        }))}
                    />
                </Form.Item>

                <Form.Item>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <Button onClick={() => onClose(false)}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Tạo mới
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default UserCreate;