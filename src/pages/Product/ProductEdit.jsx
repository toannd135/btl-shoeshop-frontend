import { EyeOutlined } from "@ant-design/icons";
import { Form, Input, InputNumber, Button, notification, Modal, Spin } from "antd";
import {updateProduct} from "../../services/productService";
import { useState } from "react";
function ProductEdit(props) {
    const { record, onReload } = props;
    const [showModal, setShowModal] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const handleShowModal = () => {
        setShowModal(true);
    }
    const handleCancel = () => {
        setShowModal(false);
        form.resetFields();
    }
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();

    const rules = [
        {
            required: true,
            message: "Required",
        },
    ]
    const handleSubmit = async (values) => {
        setSpinning(true);
        const response = await updateProduct(record.id, values);
        setTimeout(() => {
            if (response) {
                api.success({
                    message: 'Successfully updated!',
                    description: `Updated successfully room ${record.name}`
                });
                setShowModal(false);
                onReload();
            }
            else {
                api.error({
                    message: 'Unsuccessfully  updated!',
                    description: `Updated Unsuccessfully  room ${record.name}`
                });
            }
            setSpinning(false);
        }, 3000);

    }
    return (
        <>
            {contextHolder}
            <Button size="small" type="primary" icon={<EyeOutlined />} onClick={handleShowModal} />
            <Modal open={showModal} onCancel={handleCancel} title="Edit room" footer={null}>
                <Spin spinning={spinning} tip="Loading...">
                    <Form form={form} layout="vertical" name="product-create" onFinish={handleSubmit} initialValues={record}>
                        <Form.Item label="Tên sản phẩm" name="title" rules={rules}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Giá" name="price" rules={rules}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Số lượng" name="stock" rules={rules}>
                            <InputNumber min={1} />
                        </Form.Item>
                        <Form.Item label="Loại sản phẩm" name="category" rules={rules}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Mô tả" name="description" rules={rules}>
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Sửa
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </>
    )
}

export default ProductEdit;