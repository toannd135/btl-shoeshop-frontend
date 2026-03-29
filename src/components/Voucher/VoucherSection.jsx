import React, { useState, useEffect } from "react";
import VoucherCard from "./VoucherCard";
import "./voucher.css";
import { message } from "antd"; 
import { getCouponList } from "../../services/couponService"; 

const VoucherSection = () => {

    const [coupons, setCoupons] = useState([]);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await getCouponList();
                const dataList = res.data?.content || res.data?.data || res.data || res || [];
                setCoupons(dataList);
            } catch (error) {
                console.error("Lỗi lấy danh sách coupon:", error);
            }
        };

        fetchCoupons();
    }, []);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code)
            .then(() => {
                message.success(`Đã sao chép mã: ${code}`);
            })
            .catch(() => {
                message.error("Trình duyệt của bạn không hỗ trợ sao chép tự động!");
            });
    };

    return (
        <section className="voucher-section">
            <h2 className="voucher-heading">
                Voucher <span>giảm giá</span>
            </h2>

            <div className="voucher-list">
                {coupons.length > 0 ? (
                    coupons.map((item, index) => {
                        const isExpired = item.quantity !== undefined ? item.quantity <= 0 : item.expired;

                        return (
                            <VoucherCard
                                key={item.id || index}
                                code={item.code}
                                description={item.description || `Giảm giá siêu hời với mã ${item.code}`} 
                                expired={isExpired}
                                onCopy={handleCopy}
                            />
                        );
                    })
                ) : (
                    <p>Đang tải ưu đãi...</p> 
                )}
            </div>
        </section>
    );
};

export default VoucherSection;