import React from "react";
import "./productHighlight.css";

import shoe1 from "../../images/banner_group_1_hover.png";
import shoe2 from "../../images/banner_group_2_hover.png";
import shoe3 from "../../images/banner_group_3_hover.png";
import { Link } from "react-router-dom";
const products = [
    {
        name: "Nike Air Max 95 By You",
        sub: "Sneakers 2023 phiên bản giới hạn",
        price: "3,290,000đ",
        oldPrice: "5,899,000đ",
        image: shoe1
    },
    {
        name: "Giày Nike Jordan Zion",
        sub: "Sneakers 2023 phiên bản giới hạn",
        price: "1,340,000đ",
        oldPrice: "3,290,000đ",
        image: shoe2
    },
    {
        name: "Nike Huarache Premium",
        sub: "Sneakers 2023 phiên bản giới hạn",
        price: "2,890,000đ",
        oldPrice: "4,039,000đ",
        image: shoe3
    }
];

const ProductHighlight = () => {
    return (
        <section className="highlight-section">
            <div className="highlight-container">
                {products.map((item, index) => (
                    <Link
                        to={`/product`}
                        className="highlight-card"
                        key={index}
                    >
                        <div className="highlight-content">
                            <h3>{item.name}</h3>
                            <p>{item.sub}</p>

                            <div className="price">
                                <span className="new-price">{item.price}</span>
                                <span className="old-price">{item.oldPrice}</span>
                            </div>

                            <button className="detail-btn">
                                XEM CHI TIẾT &gt;
                            </button>
                        </div>

                        <div className="highlight-image">
                            <img src={item.image} alt={item.name} />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ProductHighlight;