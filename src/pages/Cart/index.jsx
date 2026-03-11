import React, { useEffect, useState } from "react";
import "./Cart.css";
import { getMyCart } from "../../services/cartService";
import { Link } from "react-router-dom";

function Cart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const res = await getMyCart();
    setItems(res.data?.items || []);
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
            <div className="option-item">
              <span className="icon">🎟️</span> Mã giảm giá
              <span className="action-text">Chọn ›</span>
            </div>
          </div>

          <div className="summary-row">
            <span className="summary-label">TỔNG CỘNG</span>
            <span className="summary-total">{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>

          <button className="checkout-btn">
            <Link to="/checkout">THANH TOÁN →</Link>
          </button>
          <div className="checkout-note">
            Nhập mã giảm giá ở trang thanh toán
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;