import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './AccountContent.css';
import { changeMyPassword } from '../../services/userService';
import { message } from 'antd';

const PasswordInput = ({ label, name, field, value, show, onChange, onToggleShow }) => (
    <div className="form-group">
        <label>{label}</label>
        <div className="input-wrapper" style={{ position: 'relative' }}>
            <FiLock className="input-icon" />
            <input
                type={show ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={`Nhập ${label.toLowerCase()}`}
                style={{ paddingRight: 48 }}
            />
            <span
                onClick={() => onToggleShow(field)}
                style={{
                    position: 'absolute',
                    right: 16,
                    cursor: 'pointer',
                    color: '#888',
                    display: 'flex',
                    alignItems: 'center',
                    userSelect: 'none'
                }}
            >
                {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </span>
        </div>
    </div>
);

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [showPw, setShowPw] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleShow = (field) => {
        setShowPw(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleUpdate = async () => {
        const { currentPassword, newPassword, confirmNewPassword } = formData;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            message.warning("Vui lòng điền đầy đủ tất cả các trường!");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            message.warning("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        if (newPassword.length < 8) {
            message.warning("Mật khẩu mới phải có ít nhất 8 ký tự!");
            return;
        }

        setIsSubmitting(true);
        try {
            await changeMyPassword({ currentPassword, newPassword, confirmNewPassword });
            message.success("Đổi mật khẩu thành công!");
            setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            // Hiển thị lỗi validation từ backend
            if (typeof error === 'string') {
                message.error(error);
            } else if (error?.errors?.length > 0) {
                error.errors.forEach(e => message.error(e.defaultMessage || e.message));
            } else {
                const msg = error?.message || error?.detail || "Có lỗi xảy ra, vui lòng thử lại!";
                message.error(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="change-password-container">
            <h2 className="tab-title">Đổi mật khẩu</h2>
            <p className="tab-subtitle">
                Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu với người khác.
            </p>

            <div className="form-section" style={{ maxWidth: 560 }}>
                <PasswordInput 
                    label="Mật khẩu hiện tại" 
                    name="currentPassword" 
                    field="current" 
                    value={formData.currentPassword}
                    show={showPw.current}
                    onChange={handleInputChange}
                    onToggleShow={toggleShow}
                />
                <PasswordInput 
                    label="Mật khẩu mới" 
                    name="newPassword" 
                    field="new" 
                    value={formData.newPassword}
                    show={showPw.new}
                    onChange={handleInputChange}
                    onToggleShow={toggleShow}
                />
                <PasswordInput 
                    label="Xác nhận mật khẩu mới" 
                    name="confirmNewPassword" 
                    field="confirm" 
                    value={formData.confirmNewPassword}
                    show={showPw.confirm}
                    onChange={handleInputChange}
                    onToggleShow={toggleShow}
                />

                <button
                    className="btn-dark"
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.6 : 1 }}
                >
                    {isSubmitting ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
            </div>
        </div>
    );
};

export default ChangePassword;