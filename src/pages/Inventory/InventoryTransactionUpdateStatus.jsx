import { Button, Popconfirm, Space, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { updateInventoryTransactionStatus } from "../../services/inventoryTransactionService";

function InventoryTransactionUpdateStatus({ record, onReload }) {
    const isPending = record?.status === "PENDING";

    const handleUpdateStatus = async (status) => {
        try {
            await updateInventoryTransactionStatus(record.itId, status);
            message.success("Cập nhật trạng thái thành công");
            if (onReload) onReload();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái", error);
            message.error(error?.message || "Cập nhật trạng thái thất bại");
        }
    };

    return (
        <Space>
            <Popconfirm
                title="Đánh dấu hoàn thành phiếu này?"
                okText="Xác nhận"
                cancelText="Hủy"
                disabled={!isPending}
                onConfirm={() => handleUpdateStatus("COMPLETED")}
            >
                <Button
                    type="text"
                    icon={<CheckCircleOutlined />}
                    disabled={!isPending}
                    style={{ color: isPending ? "#16a34a" : undefined }}
                />
            </Popconfirm>

            <Popconfirm
                title="Hủy phiếu này?"
                okText="Xác nhận"
                cancelText="Hủy"
                disabled={!isPending}
                onConfirm={() => handleUpdateStatus("CANCELLED")}
            >
                <Button
                    type="text"
                    icon={<CloseCircleOutlined />}
                    disabled={!isPending}
                    style={{ color: isPending ? "#dc2626" : undefined }}
                />
            </Popconfirm>
        </Space>
    );
}

export default InventoryTransactionUpdateStatus;