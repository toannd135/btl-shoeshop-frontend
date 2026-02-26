import { Form, Input, InputNumber, Button, Upload, message } from "antd";
import { createProduct } from "../../services/productService";
import { UploadOutlined } from "@ant-design/icons";
function ProductCreate() {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const rules = [
        {
            required: true,
            message: "Required",
        },
    ]
    const handleSubmit = async (values) => {
        const response = await createProduct(values);
        if (response) {
            form.resetFields();
            messageApi.open({
                type: 'success',
                content: 'Tạo sản phẩm thành công!',
                duration: 3
            });
        }
        else {
            messageApi.open({
                type: 'error',
                content: 'Tạo sản phẩm thất bại!',
                duration: 3
            });
        }
    }
    return (
        <>
            {contextHolder}
            <Form form={form} layout="vertical" name="product-create" onFinish={handleSubmit}>
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
                <Form.Item
                    label="Ảnh sản phẩm"
                    name="thumbnail"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList}
                    rules={rules}
                >
                    <Upload
                        listType="picture"
                        maxCount={1}
                        beforeUpload={() => false}
                    >
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Thêm
                    </Button>
                </Form.Item>
            </Form>
        </>
    )
}

export default ProductCreate;