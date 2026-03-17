import React, { useState } from "react";
import ProductCard from "../ProductCard";
import "./ProductList.css";

// Tab THỜI TRANG
import anh1 from "../../images/ProductList1.png";
import anh2 from "../../images/ProductList2.png";
import anh3 from "../../images/ProductList3.png";
import anh4 from "../../images/ProductList4.png";
import anh5 from "../../images/ProductList5.png";
import anh6 from "../../images/ProductList6.png";
import anh7 from "../../images/ProductList7.png";
import anh8 from "../../images/ProductList8.png";
import anh9 from "../../images/ProductList9.png";
import anh10 from "../../images/ProductList10.png";

// Tab LUYỆN TẬP
import anh11 from "../../images/ProductList11.png";
import anh12 from "../../images/ProductList12.png";
import anh13 from "../../images/ProductList13.png";
import anh14 from "../../images/ProductList14.png";
import anh15 from "../../images/ProductList15.png";
import anh16 from "../../images/ProductList16.png";
import anh17 from "../../images/ProductList17.png";
import anh18 from "../../images/ProductList18.png";
import anh19 from "../../images/ProductList19.png";
import anh20 from "../../images/ProductList20.png";

// Tab CHẠY BỘ
import anh21 from "../../images/ProductList21.png";
import anh22 from "../../images/ProductList22.png";
import anh23 from "../../images/ProductList23.png";
import anh24 from "../../images/ProductList24.png";
import anh25 from "../../images/ProductList25.png";
import anh26 from "../../images/ProductList1.png";
import anh27 from "../../images/ProductList2.png";
import anh28 from "../../images/ProductList3.png";
import anh29 from "../../images/ProductList4.png";
import anh30 from "../../images/ProductList5.png";

const tabs = ["THỜI TRANG", "LUYỆN TẬP", "CHẠY BỘ"];

const allProducts = [
    // ===== THỜI TRANG =====
    {
        id: 1, tab: "THỜI TRANG",
        image: anh1, brand: "UNDER ARMOUR",
        name: "Giày Chạy Bộ Nam Under Armour Hovr Sonic 6",
        price: 1845000, originalPrice: 3690000, discount: 50, color: "#ccc",
    },
    {
        id: 2, tab: "THỜI TRANG",
        image: anh2, brand: "UNDER ARMOUR",
        name: "Giày Chạy Bộ Nữ Under Armour Hovr Sonic 6",
        price: 1845000, originalPrice: 3690000, discount: 50, color: "#e63946",
    },
    {
        id: 3, tab: "THỜI TRANG",
        image: anh3, brand: "UNDER ARMOUR",
        name: "Giày Sneaker Unisex Under Armour Forge 96 Leather Reissue",
        price: 1600000, originalPrice: 3200000, discount: 50, color: "#f0f0f0",
    },
    {
        id: 4, tab: "THỜI TRANG",
        image: anh4, brand: "UNDER ARMOUR",
        name: "Giày Luyện Tập Nữ Under Armour Tribase Reign 6",
        price: 1690000, originalPrice: 3380000, discount: 50, color: "#222",
    },
    {
        id: 5, tab: "THỜI TRANG",
        image: anh5, brand: "UNDER ARMOUR",
        name: "Giày Chạy Bộ Unisex Under Armour Phantom 3 Se Black History Month",
        price: 2310000, originalPrice: 4620000, discount: 50, color: "#222",
    },
    {
        id: 6, tab: "THỜI TRANG",
        image: anh6, brand: "UNDER ARMOUR",
        name: "Giày Thời Trang Nam Under Armour Charged",
        price: 1500000, originalPrice: 3000000, discount: 50, color: "#6b4f3a",
    },
    {
        id: 7, tab: "THỜI TRANG",
        image: anh7, brand: "UNDER ARMOUR",
        name: "Giày Luyện Tập Nam Under Armour HOVR Rise 4",
        price: 1750000, originalPrice: 3500000, discount: 50, color: "#1d3557",
    },
    {
        id: 8, tab: "THỜI TRANG",
        image: anh8, brand: "UNDER ARMOUR",
        name: "Giày Chạy Bộ Nữ Under Armour Infinite Pro",
        price: 1900000, originalPrice: 3800000, discount: 50, color: "#f0ece0",
    },
    {
        id: 9, tab: "THỜI TRANG",
        image: anh9, brand: "UNDER ARMOUR",
        name: "Giày Chạy Bộ Nam Under Armour Flow Velociti Wind",
        price: 2100000, originalPrice: 4200000, discount: 50, color: "#a8d5a2",
    },
    {
        id: 10, tab: "THỜI TRANG",
        image: anh10, brand: "UNDER ARMOUR",
        name: "Giày Thời Trang Unisex Under Armour Charged Assert 9",
        price: 1400000, originalPrice: 2800000, discount: 50, color: "#1d3557",
    },

    // ===== LUYỆN TẬP =====
    {
        id: 11, tab: "LUYỆN TẬP",
        image: anh11, brand: "PUMA",
        name: "Giày Sneaker Unisex Puma Ca Pro Suede Fs Archive - Trắng",
        price: 1539000, originalPrice: 2790000, discount: 46, color: "#f0f0f0",
    },
    {
        id: 12, tab: "LUYỆN TẬP",
        image: anh12, brand: "NIKE",
        name: "Giày Đá Bóng Dành Cho Mọi Loại Sân Nam Nike Mercurial Vapor 16 Academy",
        price: 1445000, originalPrice: 2889000, discount: 50, color: "#e8e800",
    },
    {
        id: 13, tab: "LUYỆN TẬP",
        image: anh13, brand: "ADIDAS",
        name: "Giày Sneaker Nam Adidas Vl Court 3.0 - Xanh Dương",
        price: 850000, originalPrice: 1700000, discount: 50, color: "#1d6fa4",
    },
    {
        id: 14, tab: "LUYỆN TẬP",
        image: anh14, brand: "UNDER ARMOUR",
        name: "Giày Sneaker Unisex Under Armour Forge 96 Leather Reissue",
        price: 1600000, originalPrice: 3200000, discount: 50, color: "#f0f0f0",
    },
    {
        id: 15, tab: "LUYỆN TẬP",
        image: anh15, brand: "UNDER ARMOUR",
        name: "Giày Luyện Tập Nữ Under Armour Tribase Reign 6",
        price: 1690000, originalPrice: 3380000, discount: 50, color: "#222",
    },
    {
        id: 16, tab: "LUYỆN TẬP",
        image: anh16, brand: "UNDER ARMOUR",
        name: "Giày Sneaker Unisex Under Armour Fat Tire Venture Pro",
        price: 1750000, originalPrice: 3500000, discount: 50, color: "#6b4f3a",
    },
    {
        id: 17, tab: "LUYỆN TẬP",
        image: anh17, brand: "NIKE",
        name: "Giày Sneaker Bé Trai Nike Court Borough Low Recraft (Ps) - Trắng",
        price: 1200000, originalPrice: 2400000, discount: 50, color: "#f0f0f0",
    },
    {
        id: 18, tab: "LUYỆN TẬP",
        image: anh18, brand: "UNDER ARMOUR",
        name: "Giày Luyện Tập Nam Under Armour Flow Dynamic Intelliknit Black Hydro",
        price: 1825000, originalPrice: 3650000, discount: 50, color: "#1a1a2e",
    },
    {
        id: 19, tab: "LUYỆN TẬP",
        image: anh19, brand: "NIKE",
        name: "Giày Sneaker Nữ Nike Blazer Low Platform - Trắng",
        price: 1470000, originalPrice: 2940000, discount: 50, color: "#f0f0f0",
    },
    {
        id: 20, tab: "LUYỆN TẬP",
        image: anh20, brand: "UNDER ARMOUR",
        name: "Giày Sneaker Unisex Under Armour Hovr Apparition Irid",
        price: 1690000, originalPrice: 3380000, discount: 50, color: "#1d3557",
    },

    // ===== CHẠY BỘ =====
    {
        id: 21, tab: "CHẠY BỘ",
        image: anh21, brand: "ON RUNNING",
        name: "Giày Chạy Bộ Nam On Running Cloudeclipse - Xám",
        price: 2969000, originalPrice: 5390000, discount: 46, color: "#aaa",
    },
    {
        id: 22, tab: "CHẠY BỘ",
        image: anh22, brand: "MIZUNO",
        name: "Giày Chạy Bộ Nam Mizuno Wave Inspire 20 2E - Xanh Dương",
        price: 1695000, originalPrice: 3390000, discount: 50, color: "#1d6fa4",
    },
    {
        id: 23, tab: "CHẠY BỘ",
        image: anh23, brand: "NIKE",
        name: "Giày Chạy Bộ Nam Nike Air Zoom Pegasus 41 - Xám",
        price: 1945000, originalPrice: 3890000, discount: 50, color: "#aaa",
    },
    {
        id: 24, tab: "CHẠY BỘ",
        image: anh24, brand: "MIZUNO",
        name: "Giày Chạy Bộ Nữ Mizuno Wave Sky 8 - Trắng",
        price: 2145000, originalPrice: 4290000, discount: 50, color: "#f0f0f0",
    },
    {
        id: 25, tab: "CHẠY BỘ",
        image: anh25, brand: "MIZUNO",
        name: "Giày Chạy Bộ Nữ Mizuno Wave Skyrise 5 - Xanh Lá",
        price: 1495000, originalPrice: 2990000, discount: 50, color: "#4caf50",
    },
    {
        id: 26, tab: "CHẠY BỘ",
        image: anh26, brand: "ADIDAS",
        name: "Giày Chạy Bộ Nữ Adidas Duramo Speed - Xanh Dương",
        price: 1500000, originalPrice: 3000000, discount: 50, color: "#1d6fa4",
    },
    {
        id: 27, tab: "CHẠY BỘ",
        image: anh27, brand: "MIZUNO",
        name: "Giày Chạy Bộ Nữ Mizuno Wave Rider 28 - Xanh Dương",
        price: 1650000, originalPrice: 3300000, discount: 50, color: "#1d6fa4",
    },
    {
        id: 28, tab: "CHẠY BỘ",
        image: anh28, brand: "NIKE",
        name: "Giày Chạy Bộ Nam Nike Zoomx Streakfly - Trắng",
        price: 2580000, originalPrice: 5160000, discount: 50, color: "#f0f0f0",
    },
    {
        id: 29, tab: "CHẠY BỘ",
        image: anh29, brand: "ADIDAS",
        name: "Giày Chạy Bộ Nữ Adidas Adizero Sl2 - Nhiều Màu",
        price: 1500000, originalPrice: 3000000, discount: 50, color: "#00bcd4",
    },
    {
        id: 30, tab: "CHẠY BỘ",
        image: anh30, brand: "UNDER ARMOUR",
        name: "Giày Chạy Bộ Nam Under Armour Hovr Sonic 6",
        price: 1845000, originalPrice: 3690000, discount: 50, color: "#ccc",
    },
];

const ProductList = () => {
    const [activeTab, setActiveTab] = useState("THỜI TRANG");

    const filtered = allProducts.filter((p) => p.tab === activeTab);

    return (
        <section className="product-list-section">
            <h2 className="section-title">
                Mua sắm <span>theo nhu cầu</span>
            </h2>

            <div className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="product-grid">
                {filtered.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </section>
    );
};

export default ProductList;