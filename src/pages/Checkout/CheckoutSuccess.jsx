import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './CheckoutSuccess.css';

const CheckoutSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra xem có param trả về từ VNPAY trên URL không (nếu FE nhận redirect trực tiếp)
  const searchParams = new URLSearchParams(location.search);
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  
  const isVNPayFailed = vnpResponseCode && vnpResponseCode !== '00';

  return (
    <div className="success-page-container">
      <div className="success-card">
        {isVNPayFailed ? (
          <>
            <div className="icon-wrapper failed">
              <i className="fas fa-times-circle"></i>
            </div>
            <h2>Thanh toán thất bại!</h2>
            <p>Rất tiếc, quá trình thanh toán cho đơn hàng <strong>#{orderId?.split('-')[0]}</strong> không thành công.</p>
            <p>Vui lòng kiểm tra lại số dư hoặc thử phương thức thanh toán khác.</p>
          </>
        ) : (
          <>
            <div className="icon-wrapper success">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Đặt hàng thành công!</h2>
            <p>Cảm ơn bạn đã mua sắm tại <strong>EGA Sneaker</strong>.</p>
            <p>Mã đơn hàng của bạn là: <strong>#{orderId?.split('-')[0]}</strong></p>
            <p className="sub-text">Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng và tiến hành giao hàng.</p>
          </>
        )}

        <div className="action-buttons">
          <button className="btn-view-order" onClick={() => navigate(`/account/orders/${orderId}`)}>
            Xem đơn hàng
          </button>
          <button className="btn-continue" onClick={() => navigate('/')}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;