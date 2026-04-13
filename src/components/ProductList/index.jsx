import React, { useState, useEffect } from "react";
import ProductCard from "../ProductCard";
import { getTopProducts, getProductVariants } from "../../services/productService";
import { getCateList } from "../../services/cateService"; // Gọi thêm API lấy danh mục
import "./ProductList.css";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopProductsAndDetails = async () => {
            try {
                const [resTop, resCate] = await Promise.all([
                    getTopProducts(),
                    getCateList()
                ]);

                const topData = resTop.data || resTop || [];
                const categories = resCate.data || resCate || [];
                const cateMap = {};
                categories.forEach(c => {
                    cateMap[c.categoryId] = c.categoryName;
                });

                const productsWithDetails = await Promise.all(
                    topData.map(async (p) => {
                        let basePrice = 0;
                        try {
                            const varRes = await getProductVariants(p.productId || p.id);
                            const variants = varRes.data || varRes.content || varRes || [];
                            const activeVariants = variants.filter(v => v.status === "ACTIVE" || v.status === "AVAILABLE");
                            if (activeVariants.length > 0) {
                                const minVar = activeVariants.reduce((min, v) => 
                                    Number(v.basePrice) < Number(min.basePrice) ? v : min
                                );
                                basePrice = Number(minVar.basePrice);
                            }
                        } catch (err) {
                            console.error("Lỗi lấy giá cho SP:", p.productId);
                        }

                        return {
                            id: p.productId,
                            name: p.name,
                            brand: p.brand || "THƯƠNG HIỆU",
                            image: p.imageUrl || "https://placehold.co/300x300?text=No+Image",
                            price: basePrice, 
                            originalPrice: basePrice,
                            category: cateMap[p.categoryId] || "NỔI BẬT" 
                        };
                    })
                );

                console.log("Danh sách SP cuối cùng thu được:", productsWithDetails);
                const finalProducts = productsWithDetails; 
                setProducts(finalProducts);
                const uniqueTabs = Array.from(new Set(finalProducts.map(p => p.category)));
                if (uniqueTabs.length > 0) {
                    setTabs(uniqueTabs);
                    setActiveTab(uniqueTabs[0]); 
                } else {
                    setTabs(["NỔI BẬT"]);
                    setActiveTab("NỔI BẬT");
                }
                
            } catch (error) {
                console.error("Lỗi khi tải top products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopProductsAndDetails();
    }, []);

    const filtered = products.filter((p) => p.category === activeTab || tabs.length === 0);

    return (
        <section className="product-list-section">
            <h2 className="section-title">
                Mua sắm <span>theo nhu cầu</span>
            </h2>

            {loading ? (
                <p style={{ textAlign: "center", padding: "20px" }}>Đang kết nối dữ liệu sản phẩm...</p>
            ) : (
                <>
                    {/* CHỈ HIỂN THỊ THÀNH TAB KHI CÓ TỪ 2 DANH MỤC TRỞ LÊN */}
                    {tabs.length > 1 && (
                        <div className="tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="product-grid">
                        {filtered.length > 0 ? (
                            filtered.map((product) => (
                                <ProductCard key={product.productId} {...product} />
                            ))
                        ) : (
                            <p style={{ textAlign: "center", width: "100%" }}>Chưa có sản phẩm nào ở mục này.</p>
                        )}
                    </div>
                </>
            )}
        </section>
    );
};

export default ProductList;