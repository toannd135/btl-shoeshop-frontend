import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiUser, FiPhone } from 'react-icons/fi';
import { Tag } from 'antd';
import './AccountContent.css';

const AddressList = () => {
    // State để chuyển đổi giữa màn hình Danh sách và màn hình Form
    const [showForm, setShowForm] = useState(false);

    // Mock data để hiển thị cho đẹp
    const mockAddresses = [
        {
            id: 1,
            name: "Trung Lê Minh",
            phone: "0921134431",
            city: "Hà Nội",
            district: "Quận Hoàn Kiếm",
            ward: "Phường Hàng Bài",
            specificAddress: "Số 12, Đường Đinh Tiên Hoàng",
            isDefault: true
        },
        {
            id: 2,
            name: "Trung Lê Minh",
            phone: "0921134431",
            city: "Quảng Ninh",
            district: "Thành phố Hạ Long",
            ward: "Phường Hoành Bồ",
            specificAddress: "Tổ 3, Khu 4",
            isDefault: false
        }
    ];

    // --- GIAO DIỆN FORM THÊM/SỬA ĐỊA CHỈ ---
    const renderForm = () => (
        <div className="address-form-wrapper">
            <h3 className="tab-title" style={{ fontSize: '20px', marginBottom: '20px' }}>Thêm địa chỉ mới</h3>
            
            <div className="form-section" style={{ maxWidth: '100%' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Họ và tên</label>
                        <div className="input-wrapper">
                            <FiUser className="input-icon" />
                            <input type="text" placeholder="Nhập họ và tên" />
                        </div>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Số điện thoại</label>
                        <div className="input-wrapper">
                            <FiPhone className="input-icon" />
                            <input type="text" placeholder="Nhập số điện thoại" />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Tỉnh/Thành phố</label>
                        <div className="input-wrapper no-icon">
                            <select defaultValue="">
                                <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                                <option value="HN">Hà Nội</option>
                                <option value="HCM">Hồ Chí Minh</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Quận/Huyện</label>
                        <div className="input-wrapper no-icon">
                            <select defaultValue="">
                                <option value="" disabled>Chọn Quận/Huyện</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Phường/Xã</label>
                        <div className="input-wrapper no-icon">
                            <select defaultValue="">
                                <option value="" disabled>Chọn Phường/Xã</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Địa chỉ cụ thể (Số nhà, đường...)</label>
                    <div className="input-wrapper">
                        <FiMapPin className="input-icon" style={{ top: '15px' }} />
                        <textarea rows="3" placeholder="Nhập địa chỉ cụ thể"></textarea>
                    </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="isDefault" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    <label htmlFor="isDefault" style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}>Đặt làm địa chỉ mặc định</label>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                    <button className="btn-dark" style={{ width: '150px' }}>Lưu địa chỉ</button>
                    <button className="btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
                </div>
            </div>
        </div>
    );

    // --- GIAO DIỆN DANH SÁCH ĐỊA CHỈ ---
    const renderList = () => (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                    <h2 className="tab-title">Địa chỉ của tôi</h2>
                    <p className="tab-subtitle" style={{ margin: 0 }}>Quản lý thông tin giao hàng để thanh toán nhanh hơn.</p>
                </div>
                <button className="btn-dark" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowForm(true)}>
                    <FiPlus size={18} /> Thêm địa chỉ mới
                </button>
            </div>

            <div className="address-list">
                {mockAddresses.map((addr) => (
                    <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                        <div className="address-info">
                            <div className="address-header">
                                <h4 className="address-name">{addr.name}</h4>
                                <span className="address-separator">|</span>
                                <span className="address-phone">{addr.phone}</span>
                            </div>
                            <div className="address-body">
                                <p>{addr.specificAddress}</p>
                                <p>{addr.ward}, {addr.district}, {addr.city}</p>
                            </div>
                            {addr.isDefault && (
                                <Tag color="green" style={{ marginTop: '10px', borderRadius: '4px' }}>
                                    Mặc định
                                </Tag>
                            )}
                        </div>
                        <div className="address-actions">
                            <button className="action-btn edit-btn">
                                <FiEdit2 size={16} /> Sửa
                            </button>
                            {!addr.isDefault && (
                                <button className="action-btn delete-btn">
                                    <FiTrash2 size={16} /> Xóa
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    return (
        <div className="address-container">
            {showForm ? renderForm() : renderList()}
        </div>
    );
};

export default AddressList;