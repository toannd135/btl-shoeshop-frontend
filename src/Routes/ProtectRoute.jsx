import { Navigate } from "react-router-dom";
import { getAccessToken } from "../utils/tokenStore";
import { message } from "antd";
import { useEffect } from "react";

const parseJwt = (token) => {
  try {
    // Sửa lỗi atob thất bại với chuẩn Base64Url (thay thế ký tự đặc biệt)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT Parse Error:", e);
    return null;
  }
};

const ProtectRoute = ({ children, allowedRoles }) => {
  const token = getAccessToken();
  const decodedToken = token ? parseJwt(token) : null;

  if (!token || !decodedToken) {
    return <Navigate to="/login" replace />;
  }

  const userRole = decodedToken?.role;
  const isRoleMismatched =
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.some(role => {
        // Chuẩn hóa role (bỏ prefix ROLE_ nếu có) để so sánh linh hoạt
        const normalizedAllowed = role.startsWith("ROLE_") ? role.substring(5) : role;
        const normalizedUser = userRole?.startsWith("ROLE_") ? userRole.substring(5) : userRole;
        return normalizedAllowed === normalizedUser;
    });

  useEffect(() => {
    if (isRoleMismatched) {
      message.error("Bạn không có quyền truy cập trang quản trị!");
    }
  }, [isRoleMismatched]);

  if (isRoleMismatched) {
    // Điều hướng về trang chủ (không dùng /home vì route này không tồn tại)
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectRoute;