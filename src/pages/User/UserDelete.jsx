import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm, notification } from "antd";
import { deleteUser } from "../../services/userService";

function UserDelete(props) {
    const { record, onReload } = props;
    const [api, contextHolder] = notification.useNotification();

    const handleDelete = async () => {
        try {
            await deleteUser(record.userId);

            api.success({
                message: "Xóa thành công",
                description: `User ${record.username} đã bị xóa`
            });

            onReload();
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
                <button
                    style={{
                        border: "1px solid #dc2626",
                        background: "white",
                        color: "#dc2626",
                        padding: "4px 10px",
                        borderRadius: 6,
                        cursor: "pointer"
                    }}
                >
                    <DeleteOutlined />
                </button>
            </Popconfirm>
        </>
    );
}

export default UserDelete;
