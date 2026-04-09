import React, { useState, useEffect } from "react";
import { getMyCart } from "../../services/cartService";
import { checkoutOrder } from "../../services/checkoutService";
import { getCurrentUser } from "../../utils/tokenStore";
import { createPayment } from "../../services/paymentService";
import { estimateShipping } from "../../services/shippingService";
import { getCouponList } from "../../services/couponService";
import { getAllAddresses } from "../../services/addressService"; // <-- Thêm import này
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  // --- STATE MỚI CHO ĐỊA CHỈ ---
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressMode, setAddressMode] = useState("new"); // 'saved' hoặc 'new'
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  // -----------------------------

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

  // Fetch tỉnh thành
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_PROVINCES_P);
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Lỗi fetch tỉnh thành:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch phường xã khi province thay đổi
  useEffect(() => {
    const fetchWards = async () => {
      if (formData.province) {
        try {
          const response = await fetch(import.meta.env.VITE_PROVINCES_W);
          const data = await response.json();
          if (Array.isArray(data)) {
            const filteredWards = data.filter(w => w.province_code == formData.province);
            setWards(filteredWards);
          } else {
            setWards(data.wards || []);
          }
        } catch (error) {
          console.error("Lỗi fetch phường xã:", error);
        }
      } else {
        setWards([]);
      }
    };
    fetchWards();
  }, [formData.province]);

  // Tính phí ship
  const fetchShippingFee = async () => {
    try {
      const payload = {
        toProvinceCode: formData.province,
        totalWeightInGrams: 1000
      }
      const response = await estimateShipping(payload);
      setShippingFee(response.data.shippingFee);
    } catch (error) {
      console.error("Lỗi tính phí ship", error);
    }
  };

  useEffect(() => {
    if (formData.province) { // Chỉ cần province là có thể tính phí ship
      fetchShippingFee();
    }
  }, [formData.province]);

  // Khởi tạo data ban đầu (Cart, User, Addresses)
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
    fetchSavedAddresses(); // Fetch địa chỉ đã lưu
  }, []);

  // --- LOGIC FETCH ĐỊA CHỈ ĐÃ LƯU ---
  const fetchSavedAddresses = async () => {
    try {
      const response = await getAllAddresses();
      const addresses = response?.data?.addresses || [];
      setSavedAddresses(addresses);

      if (addresses.length > 0) {
        setAddressMode("saved");
      }
    } catch (error) {
      console.error("Lỗi fetch địa chỉ:", error);
    }
  };

  // Tự động chọn địa chỉ mặc định khi cả provinces và addresses đã load xong
  useEffect(() => {
    if (provinces.length > 0 && savedAddresses.length > 0 && addressMode === "saved" && !selectedAddressId) {
      const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
      handleSelectSavedAddress(defaultAddr);
    }
  }, [provinces, savedAddresses, addressMode]);

  // Hàm xử lý khi click chọn 1 địa chỉ có sẵn
  const handleSelectSavedAddress = (address) => {
    setSelectedAddressId(address.addressId);

    // Tìm mã code của tỉnh dựa trên tên tỉnh (address.city)
    const prov = provinces.find(p => p.name === address.city);
    const provCode = prov ? prov.code : "";

    setFormData(prev => ({
      ...prev,
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      address: address.street,
      province: provCode,
      ward: address.ward
    }));
  };
  // ------------------------------------

  const fetchCart = async () => {
    try {
      const response = await getMyCart();
      const items = response?.data?.items || response?.items || [];
      setCartItems(items);
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

  const handleApplyCoupon = async () => {
    // ... (Giữ nguyên logic của bạn) ...
    const codeInput = formData.couponCode?.trim();
    if (!codeInput) {
      alert("Vui lòng nhập mã giảm giá!");
      return;
    }
    try {
      const response = await getCouponList();
      const coupons = response.data || response || [];
      const validCoupon = coupons.find(c => c.code === codeInput);
      if (!validCoupon) {
        setDiscountAmount(0); alert("Mã giảm giá không tồn tại!"); return;
      }
      if (validCoupon.status !== "ACTIVE") {
        setDiscountAmount(0); alert("Mã giảm giá đã hết hạn hoặc không hoạt động!"); return;
      }
      if (validCoupon.minOrderValue && subTotal < validCoupon.minOrderValue) {
        setDiscountAmount(0); alert(`Đơn hàng chưa đạt mức tối thiểu!`); return;
      }
      let calculatedDiscount = 0;
      if (validCoupon.discountType === "FIXED_AMOUNT") calculatedDiscount = validCoupon.discountValue;
      else if (validCoupon.discountType === "PERCENTAGE") {
        calculatedDiscount = subTotal * (validCoupon.discountValue / 100);
        if (validCoupon.maxDiscount && calculatedDiscount > validCoupon.maxDiscount) calculatedDiscount = validCoupon.maxDiscount;
      } else if (validCoupon.discountType === "FREE_SHIPPING") {
        calculatedDiscount = shippingFee;
        if (validCoupon.maxDiscount && calculatedDiscount > validCoupon.maxDiscount) calculatedDiscount = validCoupon.maxDiscount;
      }
      setDiscountAmount(calculatedDiscount);
      alert(`Áp dụng mã thành công! Bạn được giảm ${calculatedDiscount.toLocaleString('vi-VN')}₫`);
    } catch (error) {
      console.error("Lỗi áp dụng mã:", error);
      alert("Có lỗi xảy ra khi kiểm tra mã giảm giá!");
    }
  };

  const handlePlaceOrder = async () => {
  if (!formData.receiverName || !formData.receiverPhone || !formData.address || !formData.province) {
    alert("Vui lòng điền đầy đủ thông tin nhận hàng và chọn Tỉnh/Thành phố!");
    return;
  }

  setIsProcessing(true);

  try {
    const selectedProvinceObj = provinces.find(p => p.code == formData.province);
    const provinceDisplayName = selectedProvinceObj ? selectedProvinceObj.name : "";
    const wardDisplayName = formData.ward || "";

    const fullShippingAddress = [
      formData.address,
      wardDisplayName,
      provinceDisplayName
    ].filter(part => part && part.trim() !== "").join(", ");

    const checkoutPayload = {
      receiverName: formData.receiverName,
      receiverPhone: formData.receiverPhone,
      shippingAddress: fullShippingAddress,
      provinceCode: formData.province,
      note: formData.note,
      couponCode: formData.couponCode || null
    };

    const orderResult = await checkoutOrder(checkoutPayload);
    const orderData = orderResult?.data || orderResult;
    const orderId = orderData?.orderId;

    if (!orderId) {
      throw new Error("Không tạo được đơn hàng, vui lòng thử lại!");
    }

    if (paymentMethod === "COD") {
      navigate(`/checkout/success/${orderId}`, {
        state: {
          paymentMethod: "COD",
          orderId: orderId
        }
      });
      return;
    }

    const paymentPayload = {
      orderId,
      paymentMethod: "VNPAY",
      bankCode: "NCB"
    };

    const paymentResponse = await createPayment(paymentPayload);
    const paymentData = paymentResponse?.data || paymentResponse;

    if (paymentData?.paymentUrl) {
      window.location.href = paymentData.paymentUrl;
    } else {
      throw new Error("Không tạo được link thanh toán VNPAY");
    }

  } catch (error) {
    console.error(error);
    alert(error?.response?.data?.message || error.message || "Có lỗi xảy ra khi đặt hàng!");
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* CỘT 1: THÔNG TIN NHẬN HÀNG */}
        <div className="checkout-col checkout-info">
          <h1 className="shop-name"></h1>

          <div className="section-header">
            <h2>Thông tin nhận hàng</h2>
          </div>

          {/* CHỌN CHẾ ĐỘ ĐỊA CHỈ CÓ SẴN HOẶC MỚI */}
          {savedAddresses.length > 0 && (
            <div className="address-mode-toggle">
              <label className={`radio-label ${addressMode === 'saved' ? 'active' : ''}`}>
                <input
                  type="radio"
                  checked={addressMode === 'saved'}
                  onChange={() => setAddressMode('saved')}
                />
                Chọn địa chỉ có sẵn
              </label>
              <label className={`radio-label ${addressMode === 'new' ? 'active' : ''}`}>
                <input
                  type="radio"
                  checked={addressMode === 'new'}
                  onChange={() => {
                    setAddressMode('new');
                    setSelectedAddressId(null);
                    setFormData(prev => ({ ...prev, receiverName: '', receiverPhone: '', address: '', province: '', ward: '' }));
                  }}
                />
                Nhập địa chỉ mới
              </label>
            </div>
          )}

          {addressMode === "saved" ? (
            /* HIỂN THỊ DANH SÁCH ĐỊA CHỈ ĐÃ LƯU */
            <div className="saved-addresses-list">
              {savedAddresses.map(addr => (
                <div
                  key={addr.addressId}
                  className={`saved-address-card ${selectedAddressId === addr.addressId ? 'selected' : ''}`}
                  onClick={() => handleSelectSavedAddress(addr)}
                >
                  <div className="address-card-header">
                    <strong>{addr.receiverName}</strong> - {addr.receiverPhone}
                    {addr.isDefault && <span className="default-badge">Mặc định</span>}
                  </div>
                  <div className="address-card-body">
                    {addr.street}, {addr.ward}, {addr.city}
                  </div>
                </div>
              ))}
              <textarea
                name="note"
                placeholder="Ghi chú (tùy chọn)"
                value={formData.note}
                onChange={handleInputChange}
                rows="3"
                className="input-field mt-3"
              ></textarea>
            </div>
          ) : (
            /* HIỂN THỊ FORM NHẬP MỚI (NHƯ CŨ) */
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
                <select
                  name="province"
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, province: e.target.value, ward: "" }));
                  }}
                  value={formData.province}
                  className="input-field"
                >
                  <option value="">Tỉnh thành</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
                <select
                  name="ward"
                  onChange={handleInputChange}
                  value={formData.ward}
                  className="input-field"
                  disabled={!formData.province}
                >
                  <option value="">Phường xã</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.name}>{w.name}</option>
                  ))}
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
          )}
        </div>

        {/* CỘT 2: VẬN CHUYỂN & THANH TOÁN (Giữ nguyên) */}
        <div className="checkout-col checkout-methods-col">
          {/* ... (Đoạn này giống hệt code gốc của bạn) ... */}
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

        {/* CỘT 3: TÓM TẮT ĐƠN HÀNG (Giữ nguyên) */}
        <div className="checkout-col checkout-summary">
          {/* ... (Đoạn này giống hệt code gốc của bạn) ... */}
          <h2 className="summary-title">Đơn hàng ({cartItems.length} sản phẩm)</h2>

          <div className="product-list">
            {cartItems.map((item, index) => {
              const price = item.variant?.basePrice || item.variant?.price || 0;
              const imageUrl = item.variant?.imageUrl || "https://via.placeholder.com/50";
              const productName = item.variant?.productName || item.variant?.product?.name || "Tên sản phẩm";
              const variantInfo = `${item.variant?.color || ''} / ${item.variant?.size || ''}`;

              return (
                <div className="product-item" key={item.cartItemId || index}>
                  <div className="product-info-wrap">
                    <div className="product-image-wrapper">
                      <div className="product-image">
                        <img src={imageUrl} alt={productName} />
                      </div>
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
            <button type="button" className="btn-apply" onClick={handleApplyCoupon}>Áp dụng</button>
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
            {discountAmount > 0 && (
              <div className="price-row" style={{ color: '#e74c3c' }}>
                <span>Giảm giá</span>
                <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
          </div>

          <div className="total-row">
            <span>Tổng cộng</span>
            <span className="total-price">
              {Math.max(0, subTotal + shippingFee - discountAmount).toLocaleString('vi-VN')}₫
            </span>
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