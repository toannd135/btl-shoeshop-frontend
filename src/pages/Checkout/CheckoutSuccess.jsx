import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './CheckoutSuccess.css';
import { verifyVNPayPayment } from "../../services/paymentService";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const shortOrderCode = params.get('vnp_TxnRef'); // Lấy mã giao dịch ngắn gọn (VD: 14581864)
  const orderInfo = params.get('vnp_OrderInfo'); // Lấy chuỗi mô tả (Thanh toan don hang: [UUID] Ma: ...)

  // Dùng Regex để "móc" cái UUID thật của đơn hàng ra dùng cho nút "Xem đơn hàng"
  const realOrderId = orderInfo ? orderInfo.match(/[a-f0-9\-]{36}/i)?.[0] : null;
  // Thêm state để quản lý trạng thái: Đang xử lý, Thành công, hoặc Thất bại
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const searchParams = location.search;

      // 1. ĐƠN HÀNG COD (Không có param VNPAY trên URL)
      // Nếu không có query param nào, mặc định là thanh toán COD thành công
      if (!searchParams) {
        setPaymentStatus('success');
        return;
      }

      // 2. ĐƠN HÀNG VNPAY (Có param trên URL)
      try {
        // Gửi toàn bộ chuỗi tham số VNPAY về cho Backend kiểm tra chữ ký và cập nhật DB
        const response = await verifyVNPayPayment(searchParams);

        // Dựa vào status code Backend trả về (200 là OK, khác 200 là lỗi)
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
  }, [location.search]);

  return (
    <div className="success-page-container">
      <div className="success-card">

        {/* MÀN HÌNH CHỜ XỬ LÝ API */}
        {paymentStatus === 'processing' && (
          <>
            <div className="icon-wrapper" style={{ color: '#f39c12', borderColor: '#f39c12' }}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <h2>Đang xác minh giao dịch...</h2>
            <p>Vui lòng không đóng trình duyệt trong lúc này.</p>
          </>
        )}

        {/* MÀN HÌNH THẤT BẠI */}
        {paymentStatus === 'failed' && (
          <>
            <div className="icon-wrapper failed">
              <i className="fas fa-times-circle"></i>
            </div>
            <h2>Thanh toán thất bại!</h2>
            <p>Rất tiếc, quá trình thanh toán cho đơn hàng <strong>#{shortOrderCode}</strong> không thành công.</p>
            <p className="sub-text" style={{ color: 'red' }}>{errorMessage}</p>
            <p>Vui lòng kiểm tra lại số dư hoặc thử phương thức thanh toán khác.</p>
          </>
        )}

        {/* MÀN HÌNH THÀNH CÔNG */}
        {paymentStatus === 'success' && (
          <>
            <div className="icon-wrapper success">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Đặt hàng thành công!</h2>
            <p>Cảm ơn bạn đã mua sắm tại <strong>EGA Sneaker</strong>.</p>
            <p>Mã đơn hàng của bạn là: <strong>#{shortOrderCode}</strong></p>
            <p className="sub-text">Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng và tiến hành giao hàng.</p>
          </>
        )}

        {/* NÚT ĐIỀU HƯỚNG (Chỉ hiện khi đã xử lý xong) */}
        {paymentStatus !== 'processing' && (
          <div className="action-buttons">
            <button className="btn-view-order" onClick={() => navigate(`/account/orders/${orderId}`)}>
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