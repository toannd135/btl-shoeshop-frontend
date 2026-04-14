import React, { useEffect, useState, useRef } from 'react';
import { FiMail, FiCalendar, FiPhone, FiImage } from 'react-icons/fi';
import './AccountContent.css';
import { getCurrentUser } from '../../utils/tokenStore';
import { getUserById, updateMyInfo } from '../../services/userService';
import { message } from 'antd';

function AccountInfo() {
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
        avatarImage: ""
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = getCurrentUser();
                const userId = currentUser?.userId;
                if (userId) {
                    const res = await getUserById(userId);
                    const user = res.data;
                    setFormData({
                        username: user.username || "",
                        fullName: user.fullName || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        gender: user.gender || "",
                        dateOfBirth: user.dateOfBirth || "",
                        avatarImage: user.avatarImage || ""
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin người dùng:", error);
                message.error("Không thể tải thông tin người dùng!");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                message.warning("Ảnh phải nhỏ hơn 2 MB!");
                return;
            }
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, avatarImage: previewUrl }));
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let finalAvatarUrl = formData.avatarImage;

            // Upload ảnh lên Cloudinary nếu có chọn file mới
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append("file", selectedFile);
                uploadData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
                const cloudinaryRes = await fetch(import.meta.env.VITE_CLOUDINARY_URL, {
                    method: "POST",
                    body: uploadData,
                });
                const cloudData = await cloudinaryRes.json();
                if (cloudData.secure_url) {
                    finalAvatarUrl = cloudData.secure_url;
                } else {
                    message.error("Lỗi khi tải ảnh lên Cloudinary!");
                    return;
                }
            }

            // Gọi API v2
            const payload = {
                fullName: formData.fullName,
                dateOfBirth: formData.dateOfBirth || null,
                gender: formData.gender || null,
                phone: formData.phone,
                avatarImage: finalAvatarUrl
            };
            await updateMyInfo(payload);

            message.success("Cập nhật thông tin thành công!");
            setSelectedFile(null);

            // Đồng bộ avatar vào localStorage để Header/Profile cập nhật
            const stored = getCurrentUser();
            if (stored) {
                localStorage.setItem("currentUser", JSON.stringify({ ...stored, avatarImage: finalAvatarUrl }));
                window.dispatchEvent(new Event("avatarUpdated"));
            }
        } catch (error) {
            const msg = error?.message || error?.detail || "Có lỗi xảy ra khi cập nhật thông tin!";
            message.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                Đang tải thông tin...
            </div>
        );
    }

    return (
        <div className="account-info-container">
            {/* Cột trái - Avatar */}
            <div className="avatar-section">
                <div className="avatar-wrapper" onClick={handleAvatarClick}>
                    <img
                        src={formData.avatarImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTp3E05PU096A0sYK811kyRs0MwZNqZNpGOQ&s"}
                        alt="User Avatar"
                    />
                    <div className="avatar-overlay">
                        <FiImage size={22} />
                        <span style={{ marginTop: 4 }}>Đổi ảnh</span>
                    </div>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                />
                <p style={{ marginTop: 10, fontSize: 12, color: '#999', textAlign: 'center' }}>
                    Tối đa 2MB<br />JPEG, PNG
                </p>
            </div>

            {/* Cột phải - Form */}
            <div className="form-section">
                <h2 className="tab-title">Thông tin tài khoản</h2>

                <div className="form-group">
                    <label>Tên tài khoản</label>
                    <div className="input-wrapper no-icon">
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            readOnly
                            disabled
                            style={{ backgroundColor: '#f5f5f5', color: '#aaa', cursor: 'not-allowed' }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <div className="input-wrapper">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly
                            disabled
                            style={{ backgroundColor: '#f5f5f5', color: '#aaa', cursor: 'not-allowed' }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Họ và tên</label>
                    <div className="input-wrapper no-icon">
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Nhập họ và tên đầy đủ"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Số điện thoại</label>
                    <div className="input-wrapper">
                        <FiPhone className="input-icon" />
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Ngày sinh</label>
                    <div className="input-wrapper">
                        <FiCalendar className="input-icon" />
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Giới tính</label>
                    <div className="input-wrapper no-icon">
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>
                </div>

                <button
                    className="btn-dark"
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.6 : 1 }}
                >
                    {isSubmitting ? "Đang lưu..." : "Cập nhật tài khoản"}
                </button>
            </div>
        </div>
    );
}

export default AccountInfo;