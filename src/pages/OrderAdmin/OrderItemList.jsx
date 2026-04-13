import { Table } from "antd";

function OrderItemList({ items, orderId }) {
    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: "productName",
            key: "productName",
            render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>
        },
        {
            title: "Size",
            dataIndex: "size",
            key: "size",
            align: "center"
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            align: "center"
        },
        {
            title: "Đơn giá",
            dataIndex: "price",
            key: "price",
            align: "right",
            render: (price) => `${Number(price).toLocaleString('vi-VN')} ₫`
        }
    ];

    return (
        <div style={{ width: 500, padding: "8px 0" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>Sản phẩm đơn #{orderId?.split('-')[0]}</h3>
            <Table
                dataSource={items || []}
                columns={columns}
                rowKey={(record, index) => index}
                pagination={false}
                size="small"
                scroll={{ y: 250 }}
            />
        </div>
    );
}

export default OrderItemList;