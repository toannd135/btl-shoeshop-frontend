import React, { useEffect, useState, useRef } from 'react';
import { FiMail, FiCalendar, FiMapPin, FiPhone, FiImage } from 'react-icons/fi';
import './AccountContent.css';
import { getCurrentUser } from '../../utils/tokenStore';
import { getUserById, updateUser } from '../../services/userService';

function AccountInfo(){
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
        avatarImage: ""
    })
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = getCurrentUser();
                const userId = currentUser.userId;
                if (userId) {
                    const res = await getUserById(userId);
                    const user = res.data;
                    console.log(user);
                    setFormData(prevState => ({
                        ...prevState,
                        username: user.username || "",
                        fullName: user.fullName || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        gender: user.gender || "",
                        dateOfBirth: user.dateOfBirth || "",
                        avatarImage: user.avatarImage || ""
                    }))
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin người dùng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(file){
            if (file.size > 1024 * 1024) {
                alert("Ảnh phải nhỏ hơn 1 MB");
                return;
            }
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setFormData({ ...formData, avatarImage: previewUrl });
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const currentUser = getCurrentUser();
            const userId = currentUser.userId;
            let finalAvatarUrl = formData.avatarImage;
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append("file", selectedFile);
                const preset = import.meta.env.VITE_CLOUDINARY_PRESET;
                const cloudinary = import.meta.env.VITE_CLOUDINARY_URL;
                uploadData.append("upload_preset", preset); 

                const cloudinaryRes = await fetch(
                    cloudinary,
                    {
                        method: "POST",
                        body: uploadData,
                    }
                );

                const cloudData = await cloudinaryRes.json();
                
                if (cloudData.secure_url) {
                    finalAvatarUrl = cloudData.secure_url;
                } else {
                    alert("Lỗi khi upload ảnh lên Cloudinary!");
                    setIsSubmitting(false);
                    return; 
                }
            }
            const updateData = {
                fullName: formData.fullName,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                phone: formData.phone,
                avatarImage: finalAvatarUrl
            };
            const res = await updateUser(userId, updateData);
            if(res){
                alert("Successfully updated!");
                setSelectedFile(null);
            }
        } catch (error){
            alert(error.message || "Có lỗi xảy ra khi cập nhật thông tin!");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="account-info-container">
            <div className="avatar-section">
                <div className="avatar-wrapper">
                    <img
                        src={formData.avatarImage}
                        alt="User Avatar"
                    />
                    <div className="avatar-overlay">
                        <FiImage size={24} />
                        <span>Đổi ảnh đại diện</span>
                    </div>
                </div>
                <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }} 
                />
            </div>
            <div className="form-section">
                
                <div className="form-group">
                    <label>Tên tài khoản</label>
                    <div className="input-wrapper no-icon">
                        <input 
                            type="text" 
                            name="username"
                            value={formData.username}
                            readOnly
                            style={{ backgroundColor: '#f9f9f9' }} 
                            disabled
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
                            style={{ backgroundColor: '#f9f9f9' }} 
                            disabled
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

                <div className="form-group">
                    <label>Số điện thoại</label>
                    <div className="input-wrapper">
                        <FiPhone className="input-icon" />
                        <input 
                            type="text" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange} 
                        />
                    </div>
                </div>

                <button 
                    className="btn-dark" 
                    onClick={handleUpdate}
                >
                    Cập nhật tài khoản
                </button>
            </div>
        </div>
    );
};

export default AccountInfo;