import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, message, Row, Col } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import { createCoupon } from "../../services/couponService";

const { Option } = Select;
const { RangePicker } = DatePicker;

function CouponCreate({ open, onClose }) {
    const [form] = Form.useForm();
    const [discountType, setDiscountType] = useState(null);

    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                startsAt: values.timeRange[0].toISOString(),
                expiresAt: values.timeRange[1].toISOString(),
            };
            delete payload.timeRange;

            // Nếu là freeship thì gán giá trị giảm = 0 cho backend (tuỳ logic backend của bạn)
            if (payload.discountType === 'FREE_SHIPPING' && !payload.discountValue) {
                payload.discountValue = 0;
            }

            const response = await createCoupon(payload);
            if (response) {
                form.resetFields();
                setDiscountType(null);
                message.success("Tạo mã giảm giá thành công!");
                onClose(true);
            }
        } catch (error) {
            message.error(error.message || "Tạo mã giảm giá thất bại!");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SafetyCertificateOutlined />
                    <span>Tạo mới Mã giảm giá</span>
                </div>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                setDiscountType(null);
                onClose(false);
            }}
            centered
            width={700}
            footer={[
                <Button key="cancel" onClick={() => { form.resetFields(); setDiscountType(null); onClose(false); }}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" className="btn-create" onClick={() => form.submit()}>
                    Tạo
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="code" label="Mã Code" rules={[{ required: true, message: "Vui lòng nhập!" }]}>
                            <Input placeholder="VD: SUMMER2026" style={{ textTransform: "uppercase" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="name" label="Tên chương trình" rules={[{ required: true, message: "Vui lòng nhập!" }]}>
                            <Input placeholder="VD: Khuyến mãi Mùa hè sôi động" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="discountType" label="Loại giảm giá" rules={[{ required: true, message: "Vui lòng chọn!" }]}>
                            <Select placeholder="Chọn loại giảm giá" onChange={(value) => {
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
                        <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE" rules={[{ required: true, message: "Vui lòng chọn!" }]}>
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

export default CouponCreate;