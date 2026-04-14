import { useEffect, useState } from "react";
import { Table, Input, Select, message } from "antd";
import { Link } from "react-router-dom";
import { SearchOutlined, StarFilled, EyeOutlined } from "@ant-design/icons";
import { getReviews } from "../../services/reviewService";
import ReviewDetail from "./ReviewDetail";
import ReviewDelete from "./ReviewDelete";
import "./Review.css";

const { Option } = Select;

function ReviewList() {
    const [reviews, setReviews]         = useState([]);
    const [total, setTotal]             = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize]       = useState(10);
    const [keyword, setKeyword]         = useState("");
    const [ratingFilter, setRatingFilter] = useState(null);
    const [sortField, setSortField]     = useState("createdAt");
    const [loading, setLoading]         = useState(false);

    const [selectedReview, setSelectedReview] = useState(null);
    const [openDetail, setOpenDetail]         = useState(false);

    // ── Thống kê trang hiện tại ───────────────────────────────
    const countByRating = (min, max) =>
        reviews.filter((r) => r.rating >= min && r.rating <= max).length;

    const stats = [
        { label: "Tổng đánh giá",    value: total,                  color: "#6366f1", bg: "#eef2ff" },
        { label: "Tích cực (4-5 ★)", value: countByRating(4, 5),    color: "#16a34a", bg: "#d9f7e6" },
        { label: "Trung bình (3 ★)", value: countByRating(3, 3),    color: "#d97706", bg: "#fef3c7" },
        { label: "Tiêu cực (1-2 ★)", value: countByRating(1, 2),    color: "#dc2626", bg: "#fde2e2" },
    ];

    // ── Gọi API ──────────────────────────────────────────────
    const buildParams = () => {
        const params = {
            page: currentPage,
            sizePerPage: pageSize,
            sort: sortField,
        };
        if (keyword.trim())   params.keyword = keyword.trim();
        if (ratingFilter)     params.rating  = ratingFilter;
        return params;
    };

    const fetchReviews = async (params) => {
        setLoading(true);
        try {
            const res = await getReviews(params);
            // Backend bọc trong { statusCode, message, data: { items, page, pageSize, pages, total } }
            const payload = res?.data ?? res;
            setReviews(payload?.items ?? []);
            setTotal(payload?.total   ?? 0);
        } catch (err) {
            console.error("Lỗi tải đánh giá:", err);
            message.error("Không thể tải danh sách đánh giá!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(buildParams());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, keyword, ratingFilter, sortField]);

    const handleReload = () => fetchReviews(buildParams());

    // ── Render helpers ────────────────────────────────────────
    const renderStars = (rating) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <StarFilled
                    key={s}
                    style={{ color: s <= rating ? "#faad14" : "#e0e0e0", fontSize: 13 }}
                />
            ))}
            <span
                style={{
                    marginLeft: 6,
                    fontWeight: 600,
                    color: rating >= 4 ? "#16a34a" : rating === 3 ? "#d97706" : "#dc2626",
                }}
            >
                {rating}/5
            </span>
        </div>
    );

    // ── Columns ───────────────────────────────────────────────
    const columns = [
        {
            title: "Người đánh giá",
            key: "user",
            render: (_, r) => {
                const name = `${r.userLastName ?? ""} ${r.userFirstName ?? ""}`.trim() || "—";
                return (
                    <div>
                        <div style={{ fontWeight: 600 }}>{name}</div>
                    </div>
                );
            },
        },
        {
            title: "Sản phẩm",
            dataIndex: "productName",
            key: "productName",
            render: (name) => <span style={{ fontWeight: 500 }}>{name || "—"}</span>,
        },
        {
            title: "Xếp hạng",
            dataIndex: "rating",
            key: "rating",
            render: (rating) => renderStars(rating),
            sorter: true,
        },
        {
            title: "Nội dung",
            dataIndex: "note",
            key: "note",
            render: (note) => (
                <span className="review-note">
                    {note || <i style={{ color: "#bbb" }}>Không có nội dung</i>}
                </span>
            ),
        },
        {
            title: "Ngày đánh giá",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—"),
            sorter: true,
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => { setSelectedReview(record); setOpenDetail(true); }}
                        style={{
                            border: "1px solid #6366f1",
                            background: "white",
                            color: "#6366f1",
                            padding: "4px 10px",
                            borderRadius: 6,
                            cursor: "pointer",
                        }}
                    >
                        <EyeOutlined />
                    </button>
                    <ReviewDelete review={record} onReload={handleReload} />
                </div>
            ),
        },
    ];

    // ── JSX ───────────────────────────────────────────────────
    return (
        <>
            <div className="review-container">
                {/* Header */}
                <div className="review-header">
                    <h2>Quản lý đánh giá</h2>
                    <h5>
                        <Link to="/admin">Dashboard</Link> / Đánh giá
                    </h5>
                </div>

                {/* Thẻ thống kê */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            style={{
                                background: s.bg,
                                border: `1px solid ${s.color}33`,
                                borderRadius: 8,
                                padding: "14px 20px",
                            }}
                        >
                            <div style={{ fontSize: 13, color: "#555" }}>{s.label}</div>
                            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>
                                {s.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Thanh tìm kiếm & lọc */}
                <div className="review-bar">
                    <div className="review-bar_left">
                        <Input
                            placeholder="Tìm theo nội dung đánh giá..."
                            prefix={<SearchOutlined />}
                            className="review-search"
                            value={keyword}
                            allowClear
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                setCurrentPage(1);
                            }}
                        />

                        <Select
                            placeholder="Lọc theo sao"
                            className="review-filter"
                            allowClear
                            onChange={(val) => {
                                setRatingFilter(val ?? null);
                                setCurrentPage(1);
                            }}
                        >
                            {[5, 4, 3, 2, 1].map((star) => (
                                <Option key={star} value={star}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        {star}&nbsp;
                                        <StarFilled style={{ color: "#faad14" }} />
                                    </div>
                                </Option>
                            ))}
                        </Select>

                        <Select
                            value={sortField}
                            className="review-filter"
                            onChange={(val) => {
                                setSortField(val);
                                setCurrentPage(1);
                            }}
                        >
                            <Option value="createdAt">Mới nhất</Option>
                            <Option value="rating">Xếp hạng</Option>
                        </Select>
                    </div>

                    <div style={{ fontSize: 13, color: "#888" }}>
                        Tổng: <strong>{total}</strong> đánh giá
                    </div>
                </div>

                {/* Bảng */}
                <Table
                    loading={loading}
                    dataSource={reviews}
                    columns={columns}
                    rowKey="reviewId"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        pageSizeOptions: ["5", "10", "20", "50"],
                        showTotal: (t) => `Tổng ${t} đánh giá`,
                    }}
                    onChange={(pagination, _filters, sorter) => {
                        setCurrentPage(pagination.current);
                        setPageSize(pagination.pageSize);
                        if (sorter?.field) setSortField(sorter.field);
                    }}
                    style={{ background: "#fff", borderRadius: 5, border: "1px solid #ddd" }}
                />
            </div>

            <ReviewDetail
                open={openDetail}
                onClose={() => setOpenDetail(false)}
                review={selectedReview}
            />
        </>
    );
}

export default ReviewList;
