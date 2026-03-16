import React from 'react';
import './AccountContent.css';

const ChangePassword = () => {
    return (
        <div className="change-password-container">
            <h2 className="tab-title">Đổi mật khẩu</h2>
            <div className="form-section" style={{ maxWidth: '600px', marginTop: '30px' }}>
                <div className="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <div className="input-wrapper no-icon">
                        <input type="password" placeholder="Nhập mật khẩu hiện tại" />
                    </div>
                </div>

                <div className="form-group">
                    <label>Mật khẩu mới</label>
                    <div className="input-wrapper no-icon">
                        <input type="password" placeholder="Nhập mật khẩu mới" />
                    </div>
                </div>

                <div className="form-group">
                    <label>Xác nhận mật khẩu</label>
                    <div className="input-wrapper no-icon">
                        <input type="password" placeholder="Xác nhận mật khẩu mới" />
                    </div>
                </div>

                <button className="btn-dark">Cập nhật mật khẩu</button>
            </div>
        </div>
    );
};

export default ChangePassword;