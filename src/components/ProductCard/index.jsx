import React from "react";
import "./ProductCard.css";
import { Link } from "react-router-dom";

const ProductCard = ({ id, image, brand, name, price, originalPrice, discount, colors }) => {
    return (
        <Link
            to={`/productDetail/${id}`}
            className="product-card"
        >
            {discount && (
                <div className="flash-badge">-{discount}%</div>
            )}

            <img
                src={image}
                alt={name}
                className="flash-product-img"
                onError={(e) => { e.target.style.display = "none"; }}
            />

            <h4>{brand?.toUpperCase() ?? ""}</h4>

            <p>{name}</p>

            <span className="price">
                {price?.toLocaleString("vi-VN")}đ
            </span>

            {originalPrice && originalPrice > price && (
                <span className="original-price">
                    {originalPrice?.toLocaleString("vi-VN")}đ
                </span>
            )}

            {colors?.length > 0 && (
                <div className="color-dots">
                    {colors.slice(0, 6).map((colorStr, idx) => (
                        <div
                            key={idx}
                            className="color-dot"
                            style={{ backgroundColor: colorStr }}
                        />
                    ))}
                </div>
            )}
        </Link>
    );
};

export default ProductCard;