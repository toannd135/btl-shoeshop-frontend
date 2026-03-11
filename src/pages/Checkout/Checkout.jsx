import React, { useState, useEffect } from "react";
import { getMyCart } from "../../services/cartService";
import { checkoutOrder } from "../../services/checkoutService";
import { getCurrentUser } from "../../utils/tokenStore";
import "./Checkout.css";
import { useNavigate } from "react-router-dom";
import { createPayment } from "../../services/paymentService";
import { estimateShipping } from "../../services/shippingService";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    receiverName: "",
    receiverPhone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    note: "",
    couponCode: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const fetchShippingFee = async () => {
    try {
      const payload = {
        toProvinceCode: formData.province,
        toDistrictCode: formData.district,
        totalWeightInGrams: 1000
      }
      const response = await estimateShipping(payload);
      setShippingFee(response.data.shippingFee);
      // setShippingFee(formData.province === 'Hà Nội' ? 20000 : 40000);
    } catch (error) {
      console.error("Lỗi tính phí ship", error);
    }
  };
  useEffect(() => {
    if (formData.province && formData.district) {
      fetchShippingFee();
    }
  }, [formData.province, formData.district]);



  useEffect(() => {
    fetchCart();
    const user = getCurrentUser();
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        receiverName: user.fullName,
        receiverPhone: user.phone
      }));
    }
  }, []);

  const fetchCart = async () => {
    try {
      const response = await getMyCart();
      console.log(response);
      // Phụ thuộc vào cấu trúc trả về, giả sử response.data.items hoặc response.items
      const items = response?.data?.items || response?.items || [];

      setCartItems(items);

      // Tính subtotal dựa trên dữ liệu thực tế
      const total = items.reduce((acc, item) => {
        const price = item.variant?.basePrice || item.variant?.price || 0;
        return acc + (price * item.quantity);
      }, 0);
      setSubTotal(total);

    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlaceOrder = async () => {
    // Thêm validate bắt buộc chọn tỉnh/thành để tính phí ship
    if (!formData.receiverName || !formData.receiverPhone || !formData.address || !formData.province) {
      alert("Vui lòng điền đầy đủ thông tin nhận hàng và chọn Tỉnh/Thành phố!");
      return;
    }

    setIsProcessing(true); // Disable nút bấm để tránh click 2 lần

    try {
      const fullShippingAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`;
      const checkoutPayload = {
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        shippingAddress: fullShippingAddress,
        provinceCode: formData.province,
        note: formData.note,
        couponCode: formData.couponCode || null
      };

      // 1. GỌI API TẠO ĐƠN HÀNG
      const orderResult = await checkoutOrder(checkoutPayload);
      const orderId = orderResult?.orderId || orderResult?.data?.orderId;

      if (!orderId) {
        throw new Error("Không tạo được đơn hàng, vui lòng thử lại!");
      }

      // 2. GỌI API THANH TOÁN
      // Lưu ý: Nếu bạn chọn Cách 1 (Sửa API ở Frontend) trong câu trả lời trước,
      // file paymentService.js của bạn phải biến object này thành chuỗi query parameters.
      // Nếu bạn chọn Cách 2 (Sửa @RequestBody ở Backend) thì cứ truyền data như thế này.
      const paymentPayload = {
        orderId: orderId,
        paymentMethod: paymentMethod,
        bankCode: "NCB"
      };

      const paymentResponse = await createPayment(paymentPayload);
      const paymentData = paymentResponse.data || paymentResponse; // Tuỳ vào cấu hình axios response của bạn

      // 3. CHUYỂN HƯỚNG THEO PHƯƠNG THỨC THANH TOÁN
      if (paymentMethod === 'VNPAY' && paymentData.paymentUrl) {
        // Redirect qua cổng thanh toán VNPay
        window.location.href = paymentData.paymentUrl;
      } else {
        // Nếu là COD, chuyển thẳng sang trang thông báo thành công
        navigate(`/checkout/success/${orderId}`);
      }

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || "Có lỗi xảy ra khi đặt hàng!");
    } finally {
      setIsProcessing(false);
    }
  };

  const finalTotal = subTotal + shippingFee;

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* CỘT 1: THÔNG TIN NHẬN HÀNG */}
        <div className="checkout-col checkout-info">
          <h1 className="shop-name">EGA Sneaker</h1>

          <div className="section-header">
            <h2>Thông tin nhận hàng</h2>
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="input-field"
            />

            <input
              type="text"
              name="receiverName"
              placeholder="Họ và tên"
              value={formData.receiverName}
              onChange={handleInputChange}
              className="input-field"
            />

            <div className="input-group">
              <span className="input-group-addon">VN ▾</span>
              <input
                type="text"
                name="receiverPhone"
                placeholder="Số điện thoại"
                value={formData.receiverPhone}
                onChange={handleInputChange}
                className="input-field no-border"
              />
            </div>

            <input
              type="text"
              name="address"
              placeholder="Địa chỉ"
              value={formData.address}
              onChange={handleInputChange}
              className="input-field"
            />

            <div className="form-row-col">
              <select name="province" onChange={handleInputChange} value={formData.province} className="input-field">
                <option value="">Tỉnh thành</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Bà Rịa-Vũng Tàu">Bà Rịa-Vũng Tàu</option>
              </select>
              <select name="district" onChange={handleInputChange} value={formData.district} className="input-field">
                <option value="">Quận huyện</option>
                <option value="Quận 1">Quận 1</option>
                <option value="Huyện Đất Đỏ">Huyện Đất Đỏ</option>
              </select>
              <select name="ward" onChange={handleInputChange} value={formData.ward} className="input-field">
                <option value="">Phường xã</option>
                <option value="Phường Bến Nghé">Phường Bến Nghé</option>
                <option value="Xã Phước Hội">Xã Phước Hội</option>
              </select>
            </div>

            <textarea
              name="note"
              placeholder="Ghi chú (tùy chọn)"
              value={formData.note}
              onChange={handleInputChange}
              rows="3"
              className="input-field"
            ></textarea>
          </div>
        </div>

        {/* CỘT 2: VẬN CHUYỂN & THANH TOÁN */}
        <div className="checkout-col checkout-methods-col">
          <div className="method-section">
            <h2>Vận chuyển</h2>
            <div className="method-box active">
              <label>
                <input type="radio" checked readOnly />
                <span>Giao hàng tận nơi</span>
              </label>
              <span>{shippingFee.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          <div className="method-section">
            <h2>Thanh toán</h2>
            <div className="method-list">
              <label className={`method-item ${paymentMethod === 'VNPAY' ? 'active-item' : ''}`}>
                <div>
                  <input
                    type="radio"
                    name="payment"
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={() => setPaymentMethod('VNPAY')}
                  />
                  <span>Chuyển khoản</span>
                </div>
              </label>
              <label className={`method-item ${paymentMethod === 'COD' ? 'active-item' : ''}`}>
                <div>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <span>Thu hộ (COD)</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* CỘT 3: TÓM TẮT ĐƠN HÀNG */}
        <div className="checkout-col checkout-summary">
          <h2 className="summary-title">Đơn hàng ({cartItems.length} sản phẩm)</h2>

          <div className="product-list">
            {/* Render danh sách sản phẩm fetch được */}
            {cartItems.map((item, index) => {
              const price = item.variant?.basePrice || item.variant?.price || 0;
              const imageUrl = item.variant?.imageUrl || "https://via.placeholder.com/50";
              const productName = item.variant?.productName || item.variant?.product?.name || "Tên sản phẩm";
              const variantInfo = `${item.variant?.color || ''} / ${item.variant?.size || ''}`;

              return (
                <div className="product-item" key={item.cartItemId || index}>
                  <div className="product-info-wrap">
                    <div className="product-image">
                      <img src={imageUrl} alt={productName} />
                      <span className="product-qty">{item.quantity}</span>
                    </div>
                    <div className="product-desc">
                      <p className="product-name" title={productName}>{productName}</p>
                      <p className="product-variant">{variantInfo}</p>
                    </div>
                  </div>
                  <div className="product-price">{(price * item.quantity).toLocaleString('vi-VN')}₫</div>
                </div>
              );
            })}

            {cartItems.length === 0 && (
              <p style={{ textAlign: "center", color: "#888", padding: "20px 0" }}>Giỏ hàng của bạn đang trống.</p>
            )}
          </div>

          <div className="discount-section">
            <input
              type="text"
              name="couponCode"
              placeholder="Nhập mã giảm giá"
              value={formData.couponCode}
              onChange={handleInputChange}
              className="input-field discount-input"
            />
            <button className="btn-apply">Áp dụng</button>
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Tạm tính</span>
              <span>{subTotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="price-row">
              <span>Phí vận chuyển</span>
              <span>{shippingFee.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          <div className="total-row">
            <span>Tổng cộng</span>
            <span className="total-price">{finalTotal.toLocaleString('vi-VN')}₫</span>
          </div>

          <div className="checkout-actions">
            <a href="/cart" className="back-to-cart">
              &lt; Quay về giỏ hàng
            </a>
            <button
              onClick={handlePlaceOrder}
              className="btn-submit"
              disabled={cartItems.length === 0 || isProcessing}
            >
              {isProcessing ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;