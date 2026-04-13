import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiUser, FiPhone } from 'react-icons/fi';
import { Tag, message } from 'antd';
import { getAllAddresses, createAddress, updateAddress, deleteAddress } from "../../services/addressService";
import './AccountContent.css';

const AddressList = () => {
    const [showForm, setShowForm] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // State quản lý danh sách địa giới hành chính
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');

    // State quản lý form
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        receiverName: '',
        receiverPhone: '',
        city: '',
        ward: '',
        street: '',
        isDefault: false
    });

    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            const response = await getAllAddresses();
            setAddresses(response?.data?.addresses || []);
        } catch (error) {
            console.error("Lỗi fetch danh sách địa chỉ:", error);
            message.error("Không thể tải danh sách địa chỉ!");
            setAddresses([]); 
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGIC FETCH TỈNH NHƯ CHECKOUT ---
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
        fetchAddresses(); // Tải danh sách địa chỉ khi vào trang
    }, []);

    // --- LOGIC FETCH PHƯỜNG/XÃ NHƯ CHECKOUT ---
    useEffect(() => {
        const fetchWards = async () => {
            if (selectedProvinceCode) {
                try {
                    const response = await fetch(import.meta.env.VITE_PROVINCES_W);
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        // Lọc ra các phường/xã có province_code trùng với mã tỉnh đang chọn
                        const filteredWards = data.filter(w => w.province_code == selectedProvinceCode);
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
    }, [selectedProvinceCode]);

    // --- XỬ LÝ NHẬP LIỆU FORM ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Custom handler cho Select Tỉnh/Thành
    const handleProvinceChange = (e) => {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        
        setSelectedProvinceCode(code); // Trigger useEffect gọi Phường/Xã
        setFormData(prev => ({ ...prev, city: name, ward: '' })); // Lưu tên Tỉnh để gửi lên Backend, reset Phường
    };

    const handleWardChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({ ...prev, ward: name }));
    };

    // --- XỬ LÝ THÊM/SỬA/XÓA VỚI BACKEND ---
    const handleSubmitForm = async () => {
        if (!formData.receiverName || !formData.receiverPhone || !formData.city || !formData.ward || !formData.street) {
            message.warning("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        try {
            if (editingId) {
                await updateAddress(editingId, formData);
                message.success("Cập nhật địa chỉ thành công!");
            } else {
                await createAddress(formData);
                message.success("Thêm địa chỉ thành công!");
            }
            setShowForm(false);
            setEditingId(null);
            resetForm();
            fetchAddresses(); 
        } catch (error) {
            console.error("Lỗi lưu địa chỉ:", error);
            message.error("Có lỗi xảy ra khi lưu địa chỉ!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
            try {
                await deleteAddress(id);
                message.success("Đã xóa địa chỉ!");
                fetchAddresses();
            } catch (error) {
                console.error("Lỗi xóa địa chỉ:", error);
                message.error("Xóa thất bại!");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            receiverName: '',
            receiverPhone: '',
            city: '',
            ward: '',
            street: '',
            isDefault: false
        });
        setSelectedProvinceCode('');
        setWards([]);
    };

    const handleOpenForm = (address = null) => {
        if (address) {
            setEditingId(address.addressId);
            setFormData({
                receiverName: address.receiverName,
                receiverPhone: address.receiverPhone,
                city: address.city,
                ward: address.ward,
                street: address.street,
                isDefault: address.isDefault
            });

            // Tìm code của tỉnh hiện tại để gán cho selectedProvinceCode -> tự trigger cái useEffect lấy Phường/Xã
            const existingProvince = provinces.find(p => p.name === address.city);
            if (existingProvince) {
                setSelectedProvinceCode(existingProvince.code);
            }
        } else {
            setEditingId(null);
            resetForm();
        }
        setShowForm(true);
    };

    // --- GIAO DIỆN FORM THÊM/SỬA ĐỊA CHỈ ---
    const renderForm = () => (
        <div className="address-form-wrapper">
            <h3 className="tab-title" style={{ fontSize: '20px', marginBottom: '20px' }}>
                {editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>
            
            <div className="form-section" style={{ maxWidth: '100%' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Họ và tên</label>
                        <div className="input-wrapper">
                            <FiUser className="input-icon" />
                            <input type="text" name="receiverName" value={formData.receiverName} onChange={handleInputChange} placeholder="Nhập họ và tên" />
                        </div>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Số điện thoại</label>
                        <div className="input-wrapper">
                            <FiPhone className="input-icon" />
                            <input type="text" name="receiverPhone" value={formData.receiverPhone} onChange={handleInputChange} placeholder="Nhập số điện thoại" />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Tỉnh/Thành phố</label>
                        <div className="input-wrapper no-icon">
                            <select value={selectedProvinceCode} onChange={handleProvinceChange}>
                                <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                                {provinces.map((prov) => (
                                    <option key={prov.code} value={prov.code}>{prov.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Phường/Xã</label>
                        <div className="input-wrapper no-icon">
                            <select value={formData.ward} onChange={handleWardChange} disabled={!selectedProvinceCode}>
                                <option value="" disabled>Chọn Phường/Xã</option>
                                {wards.map((w) => (
                                    <option key={w.code} value={w.name}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Địa chỉ cụ thể (Số nhà, đường...)</label>
                    <div className="input-wrapper">
                        <textarea rows="3" name="street" value={formData.street} onChange={handleInputChange} placeholder="Nhập địa chỉ cụ thể"></textarea>
                    </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    <label htmlFor="isDefault" style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}>Đặt làm địa chỉ mặc định</label>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                    <button className="btn-dark" style={{ width: '150px' }} onClick={handleSubmitForm}>
                        Lưu địa chỉ
                    </button>
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
                <button className="btn-dark" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleOpenForm()}>
                    <FiPlus size={18} /> Thêm địa chỉ mới
                </button>
            </div>

            <div className="address-list">
                {isLoading ? <p>Đang tải dữ liệu...</p> : addresses.map((addr) => (
                    <div key={addr.addressId} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                        <div className="address-info">
                            <div className="address-header">
                                <h4 className="address-name">{addr.receiverName}</h4>
                                <span className="address-separator">|</span>
                                <span className="address-phone">{addr.receiverPhone}</span>
                            </div>
                            <div className="address-body">
                                <p>{addr.street}</p>
                                <p>{addr.ward}, {addr.city}</p>
                            </div>
                            {addr.isDefault && (
                                <Tag color="green" style={{ marginTop: '10px', borderRadius: '4px' }}>
                                    Mặc định
                                </Tag>
                            )}
                        </div>
                        <div className="address-actions">
                            <button className="action-btn edit-btn" onClick={() => handleOpenForm(addr)}>
                                <FiEdit2 size={16} /> Sửa
                            </button>
                            {!addr.isDefault && (
                                <button className="action-btn delete-btn" onClick={() => handleDelete(addr.addressId)}>
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