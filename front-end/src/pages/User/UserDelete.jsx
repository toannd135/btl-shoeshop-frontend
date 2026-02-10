import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm, notification } from "antd";
import { deleteUser } from "../../services/userService";

function UserDelete(props) {
    const { record, onReload } = props;
    const [api, contextHolder] = notification.useNotification();

    const handleDelete = async () => {
        try {
            const res = await deleteUser(record.userId);
            if (res) {
                api.success({
                    message: "Xóa thành công",
                    description: `User ${record.username} đã bị xóa`
                });
                onReload();
            }
        } catch (err) {
            api.error({
                message: "Xóa thất bại",
                description: "Có lỗi xảy ra"
            });
        }
    };

    return (
        <>
            {contextHolder}
            <Popconfirm
                title="Chắc chắn xóa user này?"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDelete}
            >
                <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                />
            </Popconfirm>
        </>
    );
}

export default UserDelete;
