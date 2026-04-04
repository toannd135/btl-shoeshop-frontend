import React, { useState, useEffect } from 'react';
import './Account.css';
import { useLocation } from 'react-router-dom';
import AccountInfo from './AccountInfo';
import ChangePassword from './ChangePassword';
import OrderHistory from "./OrderHistory";
import AddressList from "./AddressList";

function AccountPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('info');
  const [highlightOrderId, setHighlightOrderId] = useState(null);

  useEffect(() => {
    if (location.state) {
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab); 
      }
      if (location.state.orderId) {
        setHighlightOrderId(location.state.orderId); 
      }
    }
  }, [location.state]);

  const getTabName = () => {
    switch (activeTab) {
      case 'info': return 'Thông tin tài khoản';
      case 'password': return 'Đổi mật khẩu';
      case 'orders': return 'Đơn hàng';
      case 'addresses': return 'Danh sách địa chỉ';
      default: return 'Tài khoản';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return <AccountInfo />;
      case 'password':
        return <ChangePassword />; 
      case 'orders':
        return <OrderHistory highlightOrderId={highlightOrderId} />; 
      case 'addresses':
        return <AddressList/>
      default:
        return null;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="breadcrumb">
        <span className="breadcrumb-link">Trang chủ</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link">Tài khoản</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{getTabName()}</span>
      </div>

      <div className="account-container">
        <div className="account-sidebar">
          <ul className="account-menu">
            <li 
              className={activeTab === 'info' ? 'active' : ''} 
              onClick={() => setActiveTab('info')}
            >
              Thông tin tài khoản
            </li>
            <li 
              className={activeTab === 'password' ? 'active' : ''} 
              onClick={() => setActiveTab('password')}
            >
              Đổi mật khẩu
            </li>
            <li 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => setActiveTab('orders')}
            >
              Đơn hàng
            </li>
            <li 
              className={activeTab === 'addresses' ? 'active' : ''} 
              onClick={() => setActiveTab('addresses')}
            >
              Danh sách địa chỉ
            </li>
          </ul>
        </div>

        <div className="account-main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AccountPage;