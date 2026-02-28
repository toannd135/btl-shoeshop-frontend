import { Modal, Form, Input, Select, Button, message, DatePicker, Upload } from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { updateUser } from "../../services/userService";
import { getRoleList } from "../../services/roleService";
import dayjs from "dayjs";


function UserUpdate({ open, onClose, user, onReload }) {
    const [form] = Form.useForm();
    const [role, setRole] = useState([]);
    const [avatarFile, setAvatarFile] = useState(null);

    const fetchAPIRole = async () => {
        const response = await getRoleList();
        setRole(response.data.roles || []);
    }
    useEffect(() => {
        fetchAPIRole();
        if (open) {
            form.resetFields();
            setAvatarFile(null);
            if (user) {
                form.setFieldsValue({
                    firstName: user.firstName,
                    lastName: user.lastName,
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
        }

    }, [open, user, form]);

    const handleSubmit = async (values) => {
        try {
            let finalAvatarUrl = values.avatarImage;
            if (avatarFile) {
                const formData = new FormData();
                formData.append("file", avatarFile);
                formData.append("upload_preset", "shoes_shop_fe");

                const cloudinaryRes = await fetch(
                    "https://api.cloudinary.com/v1_1/dkuckfe1m/image/upload",
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const cloudData = await cloudinaryRes.json();
                if (cloudData.secure_url) {
                    finalAvatarUrl = cloudData.secure_url; 
                } else {
                    message.error("Lỗi khi upload ảnh lên Cloudinary!");
                    return;
                }
            }
            const { roleId, ...rest } = values;
            const payload = {
                ...rest,
                avatarImage: finalAvatarUrl,
                dateOfBirth: values.dateOfBirth
                    ? values.dateOfBirth.format("YYYY-MM-DD")
                    : null,
                role: roleId ? { id: roleId } : null
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
            onCancel={() => {
                setAvatarFile(null);
                onClose();
            }}
            footer={null}
            centered
            width={800}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item label="Ảnh đại diện" name="avatarImage">
                    <Upload
                        showUploadList={false}
                        beforeUpload={(file) => {
                            if (file.size > 1024 * 1024) {
                                message.error("Ảnh phải nhỏ hơn 1 MB");
                                return Upload.LIST_IGNORE;
                            }
                            setAvatarFile(file);
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                form.setFieldsValue({ avatarImage: e.target.result }); // Hiển thị preview
                            };
                            reader.readAsDataURL(file);
                            return false;
                        }}
                    >
                        <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
                    </Upload>
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
                    rules={[{ required: true, message: "Không được để trống" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Họ và tên đệm"
                    name="lastName"
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
                    <Input disabled />
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
                        <Button onClick={() => {
                            setAvatarFile(null);
                            onClose();
                        }}>
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
