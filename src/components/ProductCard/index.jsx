import React from "react";
import "./ProductCard.css";

const ProductCard = ({ image, brand, name, price, originalPrice, discount, color }) => {
    return (
        <div className="product-card">
            {discount && <span className="badge">-{discount}%</span>}
            <div className="product-image">
                <img src={image} alt={name} />
            </div>
            <div className="product-info">
                <p className="product-brand">{brand}</p>
                <p className="product-name">{name}</p>
                <div className="product-bottom">
                    <div className="product-price">
                        <span className="price-sale">{price.toLocaleString("vi-VN")}₫</span>
                        <span className="price-original">{originalPrice.toLocaleString("vi-VN")}₫</span>
                    </div>
                    {color && (
                        <span
                            className="product-color"
                            style={{ backgroundColor: color }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;