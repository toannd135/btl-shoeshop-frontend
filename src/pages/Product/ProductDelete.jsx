import { DeleteOutlined } from "@ant-design/icons";
import { Popconfirm, notification } from "antd";
import { deleteProduct } from "../../services/productService";

function ProductDelete({ record, onReload }) {
    const [api, contextHolder] = notification.useNotification();

    const handleDelete = async () => {
        try {
            await deleteProduct(record.productId);

            api.success({
                message: "Xóa thành công",
                description: `Sản phẩm ${record.name} đã bị xóa`
            });

            onReload();
        } catch (err) {
            api.error({
                message: "Xóa thất bại",
                description: "Có lỗi xảy ra hoặc sản phẩm đang chứa biến thể."
            });
        }
    };

    return (
        <>
            {contextHolder}
            <Popconfirm
                title="Chắc chắn xóa sản phẩm này?"
                description="Hành động này không thể hoàn tác."
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

export default ProductDelete;