import React from "react";

const VoucherCard = ({ code, description, expired, onCopy }) => {
    return (
        <div className="voucher-card">
            <span className="voucher-tag">{code}</span>

            <h3 className="voucher-title">{code}</h3>
            <p className="voucher-desc">{description}</p>

            <button
                className={`voucher-btn ${expired ? "disabled" : ""}`}
                onClick={() => onCopy(code)}
                disabled={expired}
            >
                {expired ? "Hết ưu đãi" : "Sao chép mã"}
            </button>
        </div>
    );
};

export default VoucherCard;