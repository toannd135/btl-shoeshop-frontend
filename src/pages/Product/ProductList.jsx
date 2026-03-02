import { useEffect, useState, useMemo } from "react";
import { Table, Input, Select, Button, Popover } from "antd";
import { Link } from "react-router-dom";
import { EyeOutlined, SearchOutlined, EditOutlined, PlusOutlined, DatabaseOutlined } from "@ant-design/icons";
import { getProductList } from "../../services/productService";
import { getCateList } from "../../services/cateService";
import ProductCreate from "./ProductCreate";
import ProductUpdate from "./ProductUpdate";
import ProductDetail from "./ProductDetail";
import ProductDelete from "./ProductDelete";
import ProductVariantList from "./ProductVariantList";
import "./Product.css";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [sort, setSort] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [openDetail, setOpenDetail] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleUpdate = (product) => {
        setSelectedProduct(product);
        setOpenUpdate(true);
    };

    const handleViewDetail = (product) => {
        setSelectedProduct(product);
        setOpenDetail(true);
    };

    const fetchAPI = async () => {
        try {
            const res = await getProductList();
            const data = res.data || res || [];
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await getCateList();
            setCategories(res.data || res || []);
        } catch (error) {
            console.error("Lỗi lấy danh sách danh mục", error);
        }
    };

    useEffect(() => {
        fetchAPI();
        fetchCategories();
    }, []);

    useEffect(() => {
        let result = [...products];
        if (searchValue.trim() !== "") {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchValue.toLowerCase())
            );
        }
        if (sort) {
            const [field, order] = sort.split(',');
            result.sort((a, b) => {
                let valA = a[field] ? a[field].toString().toLowerCase() : "";
                let valB = b[field] ? b[field].toString().toLowerCase() : "";

                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredProducts(result);
    }, [searchValue, sort, products]);

    const renderStatus = (status) => {
        const colorMap = {
            ACTIVE: { bg: "#d9f7e6", color: "#1f8f4e" },
            INACTIVE: { bg: "#f0f0f0", color: "#555" },
        };
        const style = colorMap[status] || colorMap.INACTIVE;
        return (
            <span style={{
                background: style.bg, color: style.color,
                padding: "6px 14px", borderRadius: 999, fontWeight: 600, fontSize: 12
            }}>
                {status}
            </span>
        );
    };
    const categoryMap = useMemo(() => {
        const map = {};
        categories.forEach(cate => {
            map[cate.categoryId] = cate.categoryName;
        });
        return map;
    }, [categories]);

    const columns = [
        {
            title: "STT",
            key: "stt",
            align: "center",
            width: 70,
            render: (text, record, index) => {
                return (currentPage - 1) * pageSize + index + 1;
            },
        },
        {
            title: "Sản phẩm",
            key: "product",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img
                        src={record.imageUrl || "https://via.placeholder.com/48"}
                        alt={record.name}
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                    />
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.name}</div>
                        <div style={{ color: "#777", fontSize: 13 }}>{record.brand}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Thương hiệu",
            dataIndex: "brand",
            key: "brand"
        },
        {
            title: "Danh mục",
            dataIndex: "categoryId", 
            key: "categoryName",
            render: (categoryId) => {
                return (
                    <span style={{ fontWeight: 500, color: "#4f46e5" }}>
                        {categoryMap[categoryId] || "Không xác định"}
                    </span>
                );
            }
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => renderStatus(status),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => handleViewDetail(record)}
                        style={{ border: "1px solid #6366f1", background: "white", color: "#6366f1", padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}
                    >
                        <EyeOutlined />
                    </button>
                    <Popover
                        content={<ProductVariantList 
                            productId={record.productId} 
                            productName={record.name}
                            productBrand={record.brand}
                            productImage={record.imageUrl} />}
                        trigger="click"
                        placement="bottomRight" 
                        destroyTooltipOnHide={true} 
                    >
                        <button style={{ border: "1px solid #8b5cf6", background: "white", color: "#8b5cf6", padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}>
                            <DatabaseOutlined />
                        </button>
                    </Popover>
                    <button
                        onClick={() => handleUpdate(record)}
                        style={{ border: "1px solid #16a34a", background: "white", color: "#16a34a", padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}
                    >
                        <EditOutlined />
                    </button>
                    <ProductDelete record={record} onReload={fetchAPI} />
                </div>
            ),
        },
    ];

    return (
        <div className="product-container">
            <div className="product-header">
                <h2>Quản lý sản phẩm</h2>
                <h5><Link to="/">Dashboard</Link> / Sản phẩm</h5>
            </div>

            <div className="product-bar">
                <div className="product-bar_left">
                    <Input
                        placeholder="Tìm theo tên hoặc brand..."
                        prefix={<SearchOutlined />}
                        className="product-search"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onPressEnter={() => setCurrentPage(1)}
                    />

                    <Select
                        defaultValue="Sắp xếp theo"
                        className="product-arrange"
                        onChange={(value) => {
                            setSort(value);
                            setCurrentPage(1);
                        }}
                        options={[
                            { value: "name,asc", label: "Tên A-Z" },
                            { value: "name,desc", label: "Tên Z-A" },
                            { value: "brand,asc", label: "Thương hiệu A-Z" },
                            { value: "brand,desc", label: "Thương hiệu Z-A" },
                            { value: "status,asc", label: "Trạng thái A-Z" },
                            { value: "status,desc", label: "Trạng thái Z-A" }
                        ]}
                    />
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="product-create"
                    onClick={() => setOpenCreate(true)}
                >
                    Tạo mới
                </Button>
            </div>

            <Table
                dataSource={filteredProducts}
                columns={columns}
                rowKey="productId"
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredProducts.length,
                }}
                onChange={(pagination) => {
                    setCurrentPage(pagination.current);
                    setPageSize(pagination.pageSize);
                }}
            />

            <ProductDetail open={openDetail} onClose={() => setOpenDetail(false)} product={selectedProduct} categoryMap={categoryMap} />
            <ProductUpdate open={openUpdate} onClose={() => setOpenUpdate(false)} product={selectedProduct} onReload={fetchAPI} />
            <ProductCreate
                open={openCreate}
                onClose={(created) => {
                    setOpenCreate(false);
                    if (created) fetchAPI();
                }}
            />
        </div>
    );
}

export default ProductList;