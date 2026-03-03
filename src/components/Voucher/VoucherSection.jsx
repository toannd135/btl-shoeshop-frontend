import React from "react";
import VoucherCard from "./VoucherCard";
import "./voucher.css";

const voucherData = [
    {
        code: "EGA50",
        description: "Giảm 15% cho đơn hàng tối thiểu 500k",
        expired: true
    },
    {
        code: "EGAT10",
        description: "Giảm 10% cho đơn hàng tối thiểu 500k",
        expired: false
    },
    {
        code: "FREESHIP",
        description: "Miễn phí vận chuyển",
        expired: false
    },
    {
        code: "EGA500K",
        description: "Giảm 500k cho đơn hàng từ 2 triệu",
        expired: false
    }
];

const VoucherSection = () => {

    // Hiện tại chỉ console log
    const handleCopy = (code) => {
        console.log("Click voucher:", code);
    };

    return (
        <section className="voucher-section">
            <h2 className="voucher-heading">
                Voucher <span>giảm giá</span>
            </h2>

            <div className="voucher-list">
                {voucherData.map((item, index) => (
                    <VoucherCard
                        key={index}
                        code={item.code}
                        description={item.description}
                        expired={item.expired}
                        onCopy={handleCopy}
                    />
                ))}
            </div>
        </section>
    );
};

export default VoucherSection;