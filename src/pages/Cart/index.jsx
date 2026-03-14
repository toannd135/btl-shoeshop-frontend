import React, { useEffect, useState } from "react";
import "./Cart.css";
import { getMyCart } from "../../services/cartService";
import { Link } from "react-router-dom";
import { getCouponList } from "../../services/couponService";

const formatMoneyK = (value) => {
  if (!value) return "0đ";
  if (value >= 1000) return (value / 1000) + "k";
  return value + "đ";
};

const getCouponDescription = (coupon) => {
  const type = coupon.discountType;
  let desc = "";
  if (type === "PERCENTAGE") {
    desc = `Giảm ${coupon.discountValue}%`;
  } else if (type === "FIXED_AMOUNT") {
    desc = `Giảm ${formatMoneyK(coupon.discountValue)}`;
  } else if (type === "FREE_SHIPPING") {
    desc = "Miễn phí vận chuyển";
  }

  if (coupon.minOrderValue && coupon.minOrderValue > 0) {
    desc += ` cho đơn hàng tối thiểu ${formatMoneyK(coupon.minOrderValue)}.`;
  } else {
    desc += ".";
  }

  if (coupon.maxDiscount && coupon.maxDiscount > 0 && type !== "FIXED_AMOUNT") {
    desc += ` Mã giảm tối đa ${formatMoneyK(coupon.maxDiscount)}`;
  }
  return desc;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

function Cart() {
  const [items, setItems] = useState([]);

  const [coupons, setCoupons] = useState([]);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    loadCart();
    loadCoupons();
  }, []);

  const loadCart = async () => {
    const res = await getMyCart();
    setItems(res.data?.items || []);
  };

  const loadCoupons = async () => {
    try {
      const res = await getCouponList();
      if (res && res.data) {
        setCoupons(res.data);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách mã giảm giá:", error);
    }
  };

  const changeQty = (index, type) => {
    const newItems = [...items];
    if (type === "inc") newItems[index].quantity++;
    if (type === "dec" && newItems[index].quantity > 1) newItems[index].quantity--;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + ((item.variant?.price || 0) * item.quantity),
    0
  );

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
    setShowAllCoupons(false);
    setSelectedCoupon(null);
  };

  return (
    <div className="cart-container">
      <h1 className="cart-title">Giỏ hàng</h1>

      <div className="cart-content">
        <div className="cart-left">

          {/* Thanh tiến trình nhận thưởng */}
          <div className="cart-reward-bar">
            <div className="reward-text-row">
              <span className="reward-msg">Chúc mừng bạn đã đạt tất cả phần thưởng</span>
              <div className="reward-coupon">
                Đã nhận : <strong>Mã giảm giá 150k</strong>
                <button className="btn-copy">❐ copy</button>
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "100%" }}></div>
              <div className="progress-step completed" style={{ left: "20%" }}>✓</div>
              <div className="progress-step completed" style={{ left: "60%" }}>✓</div>
              <div className="progress-step completed" style={{ left: "100%" }}>✓</div>
            </div>
          </div>

          <div className="cart-header">
            <div className="col-product">Sản phẩm</div>
            <div className="col-price">Đơn giá</div>
            <div className="col-qty">Số lượng</div>
            <div className="col-subtotal">Tạm tính</div>
            <div className="col-action"></div>
          </div>

          {items.map((item, index) => (
            <div className="cart-row" key={item.cartItemId || index}>
              <div className="cart-product">
                {/* Đã sửa lỗi đường dẫn ảnh tại đây */}
                <img
                  src={item.variant?.imageUrl || "https://via.placeholder.com/80"}
                  alt="product"
                />
                <div className="product-info">
                  <div className="cart-name">
                    {item.variant?.productName || item.variant?.sku || "Sản phẩm"}
                  </div>
                  <div className="cart-variant">
                    {item.variant?.color} / US {item.variant?.size}
                  </div>
                </div>
              </div>

              <div className="cart-price-col">
                <div className="price-current">
                  {item.variant?.price?.toLocaleString('vi-VN')}đ
                </div>
              </div>

              <div className="cart-qty-col">
                <div className="qty-box">
                  <button onClick={() => changeQty(index, "dec")}>−</button>
                  <input type="text" value={item.quantity} readOnly />
                  <button onClick={() => changeQty(index, "inc")}>+</button>
                </div>
              </div>

              <div className="cart-subtotal-col">
                {((item.variant?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
              </div>

              <div className="cart-action-col">
                <button className="btn-remove" onClick={() => removeItem(index)}>✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-right">
          <div className="order-options">
            <div className="option-item">
              <span className="icon">🧾</span> Xuất hóa đơn
              <span className="action-text">Thay đổi ›</span>
            </div>
            <div className="option-item">
              <span className="icon">🕒</span> Hẹn giờ nhận hàng
              <span className="action-text">Thay đổi ›</span>
            </div>
            <div className="option-item">
              <span className="icon">📝</span> Ghi chú đơn hàng
              <span className="action-text">Thay đổi ›</span>
            </div>
            <div className="option-item" onClick={() => setShowAllCoupons(true)} style={{ cursor: 'pointer' }}>
              <span className="icon">🎟️</span> Mã giảm giá
              <span className="action-text">Chọn ›</span>
            </div>
          </div>

          <div className="summary-row">
            <span className="summary-label">TỔNG CỘNG</span>
            <span className="summary-total">{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>

          <button className="checkout-btn">
            <Link to="/checkout" style={{ color: 'white', textDecoration: 'none' }}>THANH TOÁN →</Link>
          </button>
          <div className="checkout-note">
            Nhập mã giảm giá ở trang thanh toán
          </div>
        </div>
      </div>
      {showAllCoupons && (
        <div className="coupon-drawer-overlay" onClick={() => setShowAllCoupons(false)}>
          <div className="coupon-drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <button className="back-btn" onClick={() => setShowAllCoupons(false)}>←</button>
              <h3>Chọn mã giảm giá</h3>
            </div>
            <div className="drawer-body">
              {coupons.map(coupon => (
                <div
                  className="drawer-coupon-card"
                  key={coupon.couponId}
                  onClick={() => setSelectedCoupon(coupon)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-left">
                    <span className="card-badge">{coupon.code}</span>
                    <h4 className="card-code">{coupon.code}</h4>
                    <p className="card-desc">{getCouponDescription(coupon)}</p>
                    <span className="card-date">HSD: {formatDate(coupon.expiresAt)}</span>
                    <button className="card-action-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(coupon.code);
                    }}>
                      Dùng ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedCoupon && (
        <div className="coupon-modal-overlay" onClick={() => setSelectedCoupon(null)}>
          <div className="coupon-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCoupon(null)}>✕</button>
            <h2 className="modal-title">{selectedCoupon.code}</h2>
            <p className="modal-desc">{getCouponDescription(selectedCoupon)}</p>

            <div className="coupon-code-box">
              <span className="code-text">{selectedCoupon.code}</span>
            </div>

            <div className="coupon-conditions">
              <p>- Đồng giá 2 triệu cho nhóm sản phẩm Set combo</p>
              <p>- Tổng giá trị sản phẩm từ 5 triệu trở lên</p>
            </div>

            <button className="copy-btn" onClick={() => handleCopyCode(selectedCoupon.code)}>
              Sao chép mã
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;