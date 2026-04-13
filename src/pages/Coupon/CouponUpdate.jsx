import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, message, Row, Col } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { updateCoupon } from "../../services/couponService";

const { Option } = Select;
const { RangePicker } = DatePicker;

function CouponUpdate({ open, onClose, coupon }) {
    const [form] = Form.useForm();
    const [discountType, setDiscountType] = useState(null);

    useEffect(() => {
        if (coupon && open) {
            setDiscountType(coupon.discountType);
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
    }, [coupon, form, open]);

    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                startsAt: values.timeRange[0].toISOString(),
                expiresAt: values.timeRange[1].toISOString(),
            };
            delete payload.timeRange;

            if (payload.discountType === 'FREE_SHIPPING' && !payload.discountValue) {
                payload.discountValue = 0;
            }

            const response = await updateCoupon(coupon.couponId, payload);
            if (response) {
                message.success("Cập nhật mã giảm giá thành công!");
                onClose(true);
            }
        } catch (error) {
            message.error(error.message || "Cập nhật mã giảm giá thất bại!");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Cập nhật Mã giảm giá</span>
                </div>
            }
            open={open}
            onCancel={() => onClose(false)}
            centered
            width={700}
            footer={[
                <Button key="cancel" onClick={() => onClose(false)}>Hủy</Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    Cập nhật
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="code" label="Mã Code" rules={[{ required: true, message: "Vui lòng nhập!" }]}>
                            <Input style={{ textTransform: "uppercase" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="name" label="Tên chương trình" rules={[{ required: true, message: "Vui lòng nhập!" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="discountType" label="Loại giảm giá" rules={[{ required: true, message: "Vui lòng chọn!" }]}>
                            <Select onChange={(value) => {
                                setDiscountType(value);
                                if(value === 'FREE_SHIPPING') form.setFieldsValue({ discountValue: 0 });
                            }}>
                                <Option value="FIXED_AMOUNT">Giảm tiền mặt</Option>
                                <Option value="PERCENTAGE">Giảm phần trăm</Option>
                                <Option value="FREE_SHIPPING">Miễn phí vận chuyển</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: discountType !== 'FREE_SHIPPING', message: "Vui lòng nhập!" }]}>
                            <InputNumber style={{ width: "100%" }} disabled={discountType === 'FREE_SHIPPING'} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="minOrderValue" label="Đơn tối thiểu" rules={[{ required: true, message: "Vui lòng nhập!" }]}>
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="maxDiscount" label="Mức giảm tối đa">
                            <InputNumber style={{ width: "100%" }} disabled={discountType === 'FIXED_AMOUNT'} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="usageLimit" label="Số lượt dùng" rules={[{ required: true, message: "Vui lòng nhập!" }]}>
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn!" }]}>
                            <Select>
                                <Option value="ACTIVE">ACTIVE</Option>
                                <Option value="INACTIVE">INACTIVE</Option>
                                <Option value="SUSPENDED">SUSPENDED</Option>
                                <Option value="DELETED">DELETED</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="timeRange" label="Thời gian áp dụng" rules={[{ required: true, message: "Vui lòng chọn!" }]}>
                    <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CouponUpdate;