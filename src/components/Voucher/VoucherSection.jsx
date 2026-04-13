import React, { useState, useEffect } from "react";
import { Row, Col, Card, Tag, Typography, Button, Divider, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { getCouponList } from "../../services/couponService";

const { Title, Text, Paragraph } = Typography;

const VoucherSection = () => {

    const [coupons, setCoupons] = useState([]);

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await getCouponList();
                const dataList = res.data?.content || res.data?.data || res.data || res || [];
                // Chỉ lấy 4 mã nổi bật nhất để hiển thị ở trang chủ
                setCoupons(dataList.slice(0, 4));
            } catch (error) {
                console.error("Lỗi lấy danh sách coupon:", error);
            }
        };

        fetchCoupons();
    }, []);

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code)
            .then(() => {
                message.success(`Đã sao chép mã: ${code}`);
            })
            .catch(() => {
                message.error("Trình duyệt của bạn không hỗ trợ sao chép tự động!");
            });
    };

    return (
        <section style={{ padding: '80px 40px', background: '#f5f5f5' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 50, fontWeight: 600 }}>
                    Voucher <span style={{ color: '#e53935', fontWeight: 'normal', borderBottom: '3px solid #e53935', paddingBottom: 4 }}>giảm giá</span>
                </Title>

                <Row gutter={[20, 20]} justify="center">
                    {coupons.map((coupon) => (
                        <Col span={6} xs={24} sm={12} lg={6} key={coupon.couponId}>
                            <Card
                                hoverable
                                style={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: '#f0f0f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)' }}
                                bodyStyle={{ padding: 25, flex: 1, display: 'flex', flexDirection: 'column' }}
                            >
                                <div style={{ flex: 1 }}>
                                    <Tag color="volcano" style={{ marginBottom: 15, fontWeight: 'bold', padding: '4px 10px', fontSize: 13 }}>{coupon.code}</Tag>
                                    <Title level={4} style={{ marginTop: 0, color: '#38434F', fontSize: 22 }}>{coupon.code}</Title>
                                    <Paragraph type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                                        {coupon.discountType === 'PERCENTAGE'
                                            ? `Giảm ${coupon.discountValue}%`
                                            : `Giảm ${formatPrice(coupon.discountValue)}`}{" "}
                                        cho đơn tối thiểu {formatPrice(coupon.minOrderValue)}.
                                    </Paragraph>
                                </div>
                                <div>
                                    <Divider dashed style={{ margin: '15px 0' }} />
                                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 15 }}>
                                        HSD: {new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}
                                    </Text>
                                    <Button
                                        type="primary"
                                        icon={<CopyOutlined />}
                                        block
                                        style={{ background: '#38434F', borderColor: '#38434F', height: 44, borderRadius: 22, fontWeight: 600, fontSize: 15 }}
                                        onClick={() => copyToClipboard(coupon.code)}
                                    >
                                        Sao chép mã
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </section>
    );
};

export default VoucherSection;