import { Modal, Form, Input, Select, Button, message, DatePicker } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { updateUser } from "../../services/userService";
import { getRoleList } from "../../services/roleService";
import dayjs from "dayjs";


function UserUpdate({ open, onClose, user, onReload }) {
    const [form] = Form.useForm();
    const [role, setRole] = useState([]);
    const fetchAPIRole = async () => {
        const response = await getRoleList();
        setRole(response.data.roles || []);
    }
    useEffect(() => {
        fetchAPIRole();
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
                ...values,
                dateOfBirth: values.dateOfBirth
                    ? values.dateOfBirth.format("YYYY-MM-DD")
                    : null
            };
            await updateUser(user.userId, payload);
            message.success("Cập nhật thành công");
            onClose();
            onReload();
        } catch (error) {
            message.error("Cập nhật thất bại");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <EditOutlined />
                    <span>Cập nhật người dùng</span>
                </div>
            }
            open={open}
            onCancel={onClose}
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
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ required: true, message: "Không được để trống" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Tên tài khoản"
                    name="username"
                    rules={[{ required: true, message: "Không được để trống" }]}
                >
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
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

                <Form.Item label="Trạng thái" name="status">
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
                    rules={[{ required: true, message: "Vui lòng chọn role" }]}
                >
                    <Select
                        placeholder="Chọn role"
                        options={role.map(r => ({
                            value: r.roleId,
                            label: r.name
                        }))}
                    />
                </Form.Item>

                <Form.Item>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <Button onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default UserUpdate;
