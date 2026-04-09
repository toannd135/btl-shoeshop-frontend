import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './CheckoutSuccess.css';
import { verifyVNPayPayment } from "../../services/paymentService";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: pathOrderId } = useParams();

  const params = new URLSearchParams(location.search);
  const state = location.state || {};

  const vnpTxnRef = params.get('vnp_TxnRef');
  const orderInfo = params.get('vnp_OrderInfo');

  const realOrderIdFromVnp = orderInfo
    ? orderInfo.match(/[a-f0-9\-]{36}/i)?.[0]
    : null;

  const realOrderId = state.orderId || pathOrderId || realOrderIdFromVnp || null;
  const shortOrderCode = state.shortOrderCode || vnpTxnRef || (realOrderId ? realOrderId.slice(0, 8).toUpperCase() : "");

  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (state.paymentMethod === 'COD' || !location.search) {
        setPaymentStatus('success');
        return;
      }

      try {
        const response = await verifyVNPayPayment(location.search);

        if (response && response.statusCode === 200) {
          setPaymentStatus('success');
        } else {
          setPaymentStatus('failed');
          setErrorMessage(response?.message || 'Giao dịch không thành công hoặc đã bị hủy.');
        }
      } catch (error) {
        console.error("Lỗi khi xác minh thanh toán VNPAY:", error);
        setPaymentStatus('failed');
        setErrorMessage('Có lỗi xảy ra khi kết nối tới hệ thống xác minh.');
      }
    };

    verifyPayment();
  }, [location.search, state.paymentMethod]);

  return (
    <div className="success-page-container">
      <div className="success-card">

        {paymentStatus === 'processing' && (
          <>
            <div className="icon-wrapper" style={{ color: '#f39c12', borderColor: '#f39c12' }}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <h2>Đang xác minh giao dịch...</h2>
            <p>Vui lòng không đóng trình duyệt trong lúc này.</p>
          </>
        )}

        {paymentStatus === 'failed' && (
          <>
            <div className="icon-wrapper failed">
              <i className="fas fa-times-circle"></i>
            </div>
            <h2>Thanh toán thất bại!</h2>
            <p>
              Rất tiếc, quá trình thanh toán cho đơn hàng
              <strong> #{shortOrderCode || "---"}</strong> không thành công.
            </p>
            <p className="sub-text" style={{ color: 'red' }}>{errorMessage}</p>
            <p>Vui lòng kiểm tra lại số dư hoặc thử phương thức thanh toán khác.</p>
          </>
        )}

        {paymentStatus === 'success' && (
          <>
            <div className="icon-wrapper success">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Đặt hàng thành công!</h2>
            <p>Cảm ơn bạn đã mua sắm tại <strong>EGA Sneaker</strong>.</p>
            <p>Mã đơn hàng của bạn là: <strong>#{shortOrderCode || "---"}</strong></p>
            <p className="sub-text">
              Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng và tiến hành giao hàng.
            </p>
          </>
        )}

        {paymentStatus !== 'processing' && (
          <div className="action-buttons">
            <button
              className="btn-view-order"
              onClick={() => {
                navigate('/account', {
                  state: {
                    activeTab: 'orders',
                    orderId: realOrderId
                  }
                });
              }}
            >
              Xem đơn hàng
            </button>
            <button className="btn-continue" onClick={() => navigate('/')}>
              Tiếp tục mua sắm
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutSuccess;