import { Dropdown, message } from "antd";
import "./Profile.css";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
// Nhớ import thêm clearCurrentUser để đồng bộ logic đăng xuất với Header
import { clearAccessToken, getCurrentUser, clearCurrentUser } from "../../utils/tokenStore";
import { useEffect, useState } from "react";

function Profile() {
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

    const fetchUserFromMemory = () => {
        const user = getCurrentUser();
        setUserProfile(user);
    };

    // Đã thêm [] để tránh component bị render lại liên tục (infinite loop)
    useEffect(() => {
        fetchUserFromMemory();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.log("Logout API failed, clearing client anyway");
        }

        clearAccessToken();
        clearCurrentUser(); // Đồng bộ với Header
        window.dispatchEvent(new Event("logoutSuccess")); // Cập nhật state toàn cục nếu cần
        message.success("Đăng xuất thành công");
        navigate("/login");
    };

    // Khởi tạo menu giống hệt Header.js nhưng thay "Trang quản trị" thành "Trang chủ"
    const userMenuItems = [
        {
            key: 'account',
            label: (
                <Link to="/account" style={{ fontWeight: 500, padding: '5px 10px' }}>
                    Tài khoản
                </Link>
            )
        },
        {
            key: 'home',
            label: (
                <Link to="/" style={{ fontWeight: 500, padding: '5px 10px' }}>
                    Trang chủ
                </Link>
            )
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: (
                <div onClick={handleLogout} style={{ fontWeight: 500, color: 'red', padding: '5px 10px' }}>
                    Đăng xuất
                </div>
            ),
        },
    ];

    return (
        <>
            <Dropdown 
                menu={{ items: userMenuItems }} 
                trigger={["click"]} 
                placement="bottomRight"
            >
                {/* Thay đổi button thành div tương tự Header để UI gọn gàng hơn */}
                <div className="profile__btn" style={{ cursor: 'pointer' }} title={userProfile?.username}>
                    <div className="profile__avatar">
                        <img
                            // Lấy avatar từ thông tin user, nếu không có thì dùng ảnh mặc định
                            src={userProfile?.avatarImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTp3E05PU096A0sYK811kyRs0MwZNqZNpGOQ&s"}
                            alt="avatar"
                        />
                    </div>
                </div>
            </Dropdown>
        </>
    )
}

export default Profile;