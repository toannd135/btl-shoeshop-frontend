import { Table, Rate } from "antd";
import ProductEdit from "./ProductEdit";
import ProductDelete from "./ProductDelete";
import { useEffect, useState } from "react";
import { getProductList } from "../../services/productService";
import { Link } from "react-router-dom";
function ProductList() {
    const [products, setProducts] = useState([]);
    const fetchAPI = async () => {
        const response = await getProductList();
        setProducts(response.data.products || []);
    }
    useEffect(() => {
        fetchAPI();
    }, []);
    const handleReload = () => {
        fetchAPI();
    }
    const columns = [
        {
            title: "Tên sản phẩm",
            key: "title",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img src={record.thumbnail} alt={record.title}
                        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 5 }}
                    />
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.title}</div>
                        <div style={{ color: "#888", fontSize: 12 }}>{record.brand}</div>
                    </div>
                </div>
            )
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
        },
        {
            title: "Số lượng",
            dataIndex: "stock",
            key: "stock"
        },
        {
            title: "Loại sản phẩm",
            dataIndex: "category",
            key: "category"
        },
        {
            title: "Đánh giá",
            dataIndex: "rating",
            key: "rating",
            render: (rating) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Rate disabled allowHalf defaultValue={rating} />
                    <span>{rating}</span>
                </div>
            )
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 12 }}>
                    <ProductEdit record={record} onReload={handleReload} style={{ cursor: "pointer" }} />
                    <ProductDelete record={record} onReload={handleReload} style={{ color: "red", cursor: "pointer" }} />
                </div>
            )
        }

    ]
    return (
        <>
            <div style={{ marginBottom: 24, marginTop: 30 }}>
                <h1>Sản phẩm</h1>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div style={{ color: "#1677ff" }}>
                        <Link to="/">Trang chủ</Link> / Pages / Sản phẩm
                    </div>

                </div>
            </div>
            <Table dataSource={products} columns={columns} rowKey="id" />
        </>
    )
}

export default ProductList;