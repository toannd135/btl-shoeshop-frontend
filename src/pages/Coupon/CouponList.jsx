import { useEffect, useState } from "react";
import { Card, Tag, Row, Col, Button, Input, Select } from "antd";
import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

import { getCouponList } from "../../services/couponService"; 
import CouponDetail from "./CouponDetail";
import CouponCreate from "./CouponCreate";
import CouponUpdate from "./CouponUpdate";
import "./Coupon.css"; 

function CouponList() {
    const [allCoupons, setAllCoupons] = useState([]); 
    const [displayCoupons, setDisplayCoupons] = useState([]); 
    
    const [searchValue, setSearchValue] = useState("");
    const [sortValue, setSortValue] = useState("default");
    
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);

    const handleViewDetail = (coupon) => {
        setSelectedCoupon(coupon);
        setOpenModal(true);
    };

    const handleEdit = (coupon) => {
        setSelectedCoupon(coupon);
        setOpenUpdateModal(true);
    };

    const fetchAPI = async () => {
        try {
            const res = await getCouponList();
            setAllCoupons(res.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };

    useEffect(() => {
        fetchAPI();
    }, []);

    useEffect(() => {
        let filtered = [...allCoupons];
        if (searchValue.trim() !== "") {
            const lowerSearch = searchValue.toLowerCase();
            filtered = filtered.filter(c => 
                (c.name && c.name.toLowerCase().includes(lowerSearch)) ||
                (c.code && c.code.toLowerCase().includes(lowerSearch))
            );
        }

        if (sortValue === "expires_asc") {
            filtered.sort((a, b) => {
                if (!a.expiresAt) return 1;
                if (!b.expiresAt) return -1;
                return dayjs(a.expiresAt).valueOf() - dayjs(b.expiresAt).valueOf();
            });
        } else if (sortValue === "expires_desc") {
            filtered.sort((a, b) => {
                if (!a.expiresAt) return 1;
                if (!b.expiresAt) return -1;
                return dayjs(b.expiresAt).valueOf() - dayjs(a.expiresAt).valueOf();
            });
        } else if (sortValue === "value_desc") {
            filtered.sort((a, b) => (b.discountValue || 0) - (a.discountValue || 0));
        }

        setDisplayCoupons(filtered);
    }, [allCoupons, searchValue, sortValue]);

    const renderStatus = (status) => {
        const colorMap = {
            ACTIVE: { bg: "#d9f7e6", color: "#1f8f4e" },
            INACTIVE: { bg: "#f0f0f0", color: "#555" },
            EXPIRED: { bg: "#fde2e2", color: "#c53030" },
        };
        const style = colorMap[status] || colorMap.INACTIVE;
        return (
            <Tag
                style={{
                    background: style.bg,
                    color: style.color,
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 12,
                    border: "none"
                }}
            >
                {status}
            </Tag>
        );
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return "0 đ";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Hàm lấy thông tin nhãn (Badge) trên góc card
    const getBadgeInfo = (type) => {
        if (type === 'PERCENTAGE') return { class: 'percentage', text: 'Giảm %' };
        if (type === 'FREE_SHIPPING') return { class: 'freeship', text: 'Freeship' };
        return { class: 'fixed', text: 'Giảm Tiền' };
    };

    // Hàm hiển thị giá trị ưu đãi
    const getDiscountText = (type, value) => {
        if (type === 'PERCENTAGE') return `${value || 0}%`;
        if (type === 'FREE_SHIPPING') return 'Miễn phí vận chuyển';
        return formatCurrency(value);
    };

    return (
        <div className="coupon-container">
            <div className="coupon-header">
                <h2>Quản lý mã giảm giá</h2>
                <h5>
                    <Link to="/">Dashboard</Link> / Mã giảm giá
                </h5>
            </div>

            <div className="coupon-bar">
                <div className="coupon-bar_left">
                    <Input
                        placeholder="Tìm theo tên hoặc mã code..."
                        prefix={<SearchOutlined />}
                        className="coupon-search"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)} 
                    />

                    <Select
                        value={sortValue}
                        className="coupon-arrange"
                        onChange={(value) => setSortValue(value)}
                        options={[
                            { value: "default", label: "Sắp xếp mặc định" },
                            { value: "expires_asc", label: "Hạn sử dụng tăng dần" },
                            { value: "expires_desc", label: "Hạn sử dụng giảm dần" },
                            { value: "value_desc", label: "Giá trị giảm cao nhất" },
                        ]}
                    />
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="coupon-create"
                    onClick={() => setOpenCreateModal(true)}
                >
                    Tạo mới
                </Button>
            </div>

            <div className="coupon-content">
                <Row gutter={[24, 24]}>
                    {displayCoupons.map((coupon) => {
                        const badgeInfo = getBadgeInfo(coupon.discountType);
                        return (
                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={coupon.couponId}>
                                <Card
                                    title={
                                        <div className="coupon-card-title">
                                            <div className="coupon-name" title={coupon.name}>
                                                {coupon.name}
                                            </div>
                                            <span className={`discount-badge ${badgeInfo.class}`}>
                                                {badgeInfo.text}
                                            </span>
                                        </div>
                                    }
                                    extra={renderStatus(coupon.status)}
                                    hoverable
                                    style={{ display: 'flex', flexDirection: 'column', minHeight: '340px' }} 
                                    bodyStyle={{
                                        padding: "20px",
                                        display: "flex",
                                        flexDirection: "column",
                                        flex: 1, 
                                    }}
                                >
                                    <div className="coupon-main-info">
                                        <div className="coupon-code-box">
                                            {coupon.code}
                                        </div>

                                        <div className="coupon-meta">
                                            <div><strong>Ưu đãi: </strong> 
                                                <span style={{ color: "#d9363e", fontWeight: "bold" }}>
                                                    {getDiscountText(coupon.discountType, coupon.discountValue)}
                                                </span>
                                            </div>
                                            <div><strong>Tối thiểu: </strong> {formatCurrency(coupon.minOrderValue)}</div>
                                            <div><strong>Lượt dùng: </strong> {coupon.timesUsed} / {coupon.usageLimit}</div>
                                            <div><strong>HSD: </strong> {coupon.expiresAt ? dayjs(coupon.expiresAt).format("DD/MM/YYYY HH:mm") : "---"}</div>
                                        </div>
                                    </div>

                                    <div className="coupon-footer">
                                        <span className="view-detail" onClick={() => handleViewDetail(coupon)}>
                                            Xem chi tiết
                                        </span>
                                        <Button icon={<EditOutlined />} onClick={() => handleEdit(coupon)}>
                                            Edit
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </div>

            <CouponDetail
                open={openModal}
                onClose={() => setOpenModal(false)}
                coupon={selectedCoupon}
            />
            <CouponCreate
                open={openCreateModal}
                onClose={(created) => {
                    setOpenCreateModal(false);
                    if (created) fetchAPI();
                }}
            />
            <CouponUpdate
                open={openUpdateModal}
                coupon={selectedCoupon}
                onClose={(updated) => {
                    setOpenUpdateModal(false);
                    if (updated) fetchAPI();
                }} 
            />
        </div>
    );
}

export default CouponList;