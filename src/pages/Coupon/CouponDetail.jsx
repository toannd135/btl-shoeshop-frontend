import { Modal, Form, Input, InputNumber, Select, Row, Col, DatePicker } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

function CouponDetail({ open, onClose, coupon }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (coupon) {
            form.setFieldsValue({
                code: coupon.code,
                name: coupon.name,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minOrderValue: coupon.minOrderValue,
                maxDiscount: coupon.maxDiscount,
                usageLimit: coupon.usageLimit,
                status: coupon.status,
                timeRange: [dayjs(coupon.startsAt), dayjs(coupon.expiresAt)]
            });
        }
    }, [coupon, form]);

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Chi tiết Mã giảm giá</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={700}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Mã Code" name="code">
                            <Input disabled style={{ fontWeight: "bold", color: "#1890ff" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tên chương trình" name="name">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Loại giảm giá" name="discountType">
                            <Select disabled>
                                <Select.Option value="FIXED_AMOUNT">Giảm tiền mặt</Select.Option>
                                <Select.Option value="PERCENTAGE">Giảm phần trăm</Select.Option>
                                <Select.Option value="FREE_SHIPPING">Miễn phí vận chuyển</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Giá trị giảm" name="discountValue">
                            <InputNumber disabled style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Đơn tối thiểu" name="minOrderValue">
                            <InputNumber disabled style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Mức giảm tối đa" name="maxDiscount">
                            <InputNumber disabled style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Số lượt dùng" name="usageLimit">
                            <InputNumber disabled style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Trạng thái" name="status">
                            <Select disabled>
                                <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                                <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                                <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
                                <Select.Option value="DELETED">DELETED</Select.Option>
                                <Select.Option value="EXPIRED">EXPIRED</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Thời gian áp dụng" name="timeRange">
                    <RangePicker disabled showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CouponDetail;