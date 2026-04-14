import { useState } from "react";
import { Popconfirm, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { adminDeleteReview } from "../../services/reviewService";

function ReviewDelete({ review, onReload }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await adminDeleteReview(review.reviewId);
            message.success("Xóa đánh giá thành công!");
            onReload();
        } catch (error) {
            message.error("Xóa đánh giá thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popconfirm
            title="Xóa đánh giá"
            description="Bạn có chắc chắn muốn xóa đánh giá này không?"
            onConfirm={handleDelete}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading }}
        >
            <button
                style={{
                    border: "1px solid #ef4444",
                    background: "white",
                    color: "#ef4444",
                    padding: "4px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                }}
            >
                <DeleteOutlined />
            </button>
        </Popconfirm>
    );
}

export default ReviewDelete;
