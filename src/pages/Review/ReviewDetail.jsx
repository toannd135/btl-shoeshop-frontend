import { Drawer, Descriptions, Tag, Rate } from "antd";

function ReviewDetail({ open, onClose, review }) {
    if (!review) return null;

    const fullName = `${review.userFirstName || ""} ${review.userLastName || ""}`.trim() || "—";
    const createdAt = review.createdAt
        ? new Date(review.createdAt).toLocaleString("vi-VN")
        : "—";

    return (
        <Drawer
            title="Chi tiết đánh giá"
            open={open}
            onClose={onClose}
            width={500}
        >
            <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600, width: 150 }}>
                <Descriptions.Item label="Người dùng">
                    {fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Sản phẩm">
                    {review.productName || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Xếp hạng">
                    <Rate disabled defaultValue={review.rating} style={{ fontSize: 16 }} />
                    <span style={{ marginLeft: 8, color: "#faad14", fontWeight: 600 }}>
                        ({review.rating}/5)
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="Nội dung">
                    <span style={{ whiteSpace: "pre-wrap" }}>{review.note || <i style={{ color: "#aaa" }}>Không có nội dung</i>}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {createdAt}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
}

export default ReviewDetail;
