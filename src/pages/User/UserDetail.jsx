import { Modal, Form, Input, Select } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useEffect } from "react";

function UserDetail({ open, onClose, user }) {

    const [form] = Form.useForm();

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                avatarImage: user.avatarImage,
                status: user.status,
                role: user.role?.name
            });
        }
    }, [user, form]);

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Chi tiết người dùng</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={800}
        >
            <Form form={form} layout="vertical">

                <Form.Item label="Ảnh đại diện">
                    {user?.avatarImage && (
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <img
                                src={user.avatarImage}
                                alt="avatar"
                                style={{
                                    width: 100,
                                    height: 100,
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                    border: "1px solid #ddd"
                                }}
                            />
                            <a
                                href={user.avatarImage}
                                target="_blank"
                                rel="noreferrer"
                                style={{ wordBreak: "break-all" }}
                            >
                                {user.avatarImage}
                            </a>
                        </div>
                    )}
                </Form.Item>

                <Form.Item label="Họ và tên" name="fullName">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Tên tài khoản" name="username">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Email" name="email">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="phone">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Giới tính" name="gender">
                    <Select disabled />
                </Form.Item>

                <Form.Item label="Ngày sinh" name="dateOfBirth">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Trạng thái" name="status">
                    <Select disabled />
                </Form.Item>

                <Form.Item label="Role" name="role">
                    <Input disabled />
                </Form.Item>

            </Form>
        </Modal>
    );
}

export default UserDetail;
