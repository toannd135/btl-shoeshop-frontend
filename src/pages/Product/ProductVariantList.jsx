import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Space } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { getProductVariants, deleteProductVariant, getVariantImages } from "../../services/productService";
import ProductVariantCreate from "./ProductVariantCreate";
import ProductVariantUpdate from "./ProductVariantUpdate";


function ProductVariantList({ productId, productName, productBrand, productImage }) {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);

    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);

    const fetchVariants = async () => {
        setLoading(true);
        try {
            const res = await getProductVariants(productId);
            const variantsData = res.data || res || [];
            const variantsWithImages = await Promise.all(
                variantsData.map(async (variant) => {
                    try {
                        const imageRes = await getVariantImages(productId, variant.productVariantId);
                        const images = imageRes.data || imageRes || [];
                        const primaryImg = images.find(img => img.isPrimary) || images[0];
                        return {
                            ...variant,
                            imageURL: primaryImg ? primaryImg.imageURL : null
                        };
                    } catch (err) {
                        return { ...variant, imageURL: null };
                    }
                })
            );
            setVariants(variantsWithImages);
        } catch (error) {
            console.error("Lỗi khi tải biến thể:", error);
            message.error("Không thể tải danh sách biến thể");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchVariants();
        }
    }, [productId]);

    const handleDelete = async (variantId) => {
        try {
            await deleteProductVariant(productId, variantId);
            message.success("Xóa biến thể thành công");
            fetchVariants();
        } catch (error) {
            message.error("Xóa thất bại");
        }
    };
    const renderStatus = (status) => {
        const colorMap = {
            ACTIVE: { bg: "#d9f7e6", color: "#1f8f4e" },
            DELETED: { bg: "#fde2e2", color: "#c53030" },
            INACTIVE: { bg: "#f0f0f0", color: "#555" },
            SUSPENDED: { bg: "#e6f0ff", color: "#1d4ed8" },
        };

        const style = colorMap[status] || colorMap.INACTIVE;

        return (
            <span
                style={{
                    background: style.bg,
                    color: style.color,
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 12,
                }}
            >
                {status}
            </span>
        );
    };
    const columns = [
        {
            title: "Hình ảnh",
            dataIndex: "imageURL", 
            key: "imageURL",
            width: 80,
            align: "center",
            render: (url) => (
                <img
                    src={url || "https://placehold.co/40x40?text=No+Image"} 
                    alt="variant"
                    style={{ 
                        width: 40, 
                        height: 40, 
                        objectFit: "cover", 
                        borderRadius: 4, 
                        border: "1px solid #f0f0f0" 
                    }}
                />
            )
        },
        {
            title: "Màu",
            dataIndex: "color",
            key: "color",
            width: 60, 
            align: "center", 
            render: (color) => (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <span
                        className="product-swatch"
                        style={{ 
                            backgroundColor: color || '#ccc', 
                            display: 'inline-block', 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            border: '1px solid #aaa', 
                            boxShadow: 'inset 0 0 2px rgba(0,0,0,0.1)'
                        }}
                        title={color} 
                    ></span>
                </div>
            )
        },
        {
            title: "SKU",
            dataIndex: "sku",
            key: "sku",
            width: 120,
            render: (sku) => <span style={{ whiteSpace: "nowrap" }}>{sku}</span>,
            align: "center"
        },
        {
            title: "Kích thước",
            dataIndex: "size",
            key: "size",
            width: 100,
            align: "center"
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            render: (qty) => <span style={{ whiteSpace: "nowrap" }}>{qty}</span>,
            align: "center"
        },
        {
            title: "Giá cơ bản",
            dataIndex: "basePrice",
            key: "basePrice",
            width: 110,
            render: (price) => <span style={{ whiteSpace: "nowrap" }}>{Number(price).toLocaleString('vi-VN')} ₫</span>,
            align: "center"
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 100,
            align: "center",
            render: (status) => renderStatus(status)
        },
        {
            title: "Hành động",
            key: "actions",
            width: 100,
            align: "center",
            render: (_, record) => (
                <Space size="small" style={{ whiteSpace: "nowrap" }}>
                    <Button
                        size="small"
                        icon={<EditOutlined style={{ color: '#4f46e5' }} />}
                        onClick={() => {
                            setSelectedVariant(record);
                            setOpenUpdate(true);
                        }}
                        style={{ borderColor: '#e0e7ff', backgroundColor: '#e0e7ff' }}
                    />
                    <Popconfirm title="Xóa biến thể này?" onConfirm={() => handleDelete(record.productVariantId)}>
                        <Button size="small" icon={<DeleteOutlined style={{ color: '#ef4444' }} />} style={{ borderColor: '#fee2e2', backgroundColor: '#fee2e2' }} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ width: 780, padding: "4px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <img
                        src={productImage || "https://via.placeholder.com/60"}
                        alt={productName}
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #eee",
                            backgroundColor: "#f9fafb"
                        }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                            {productName}
                        </h3>
                        <span style={{ fontSize: "14px", color: "#4b5563" }}>
                            {productBrand}
                        </span>
                    </div>
                </div>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => setOpenCreate(true)}
                    style={{ marginTop: 8 }}
                >
                    Thêm biến thể
                </Button>
            </div>

            <Table
                dataSource={variants}
                columns={columns}
                rowKey="productVariantId"
                pagination={false} 
                loading={loading}
                size="small"
                scroll={{ y: 300 }} 
            />

            {openCreate && (
                <ProductVariantCreate
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    productId={productId}
                    onReload={fetchVariants}
                />
            )}

            {openUpdate && selectedVariant && (
                <ProductVariantUpdate
                    open={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedVariant(null);
                    }}
                    productId={productId}
                    variant={selectedVariant}
                    onReload={fetchVariants}
                />
            )}
        </div>
    );
}

export default ProductVariantList;