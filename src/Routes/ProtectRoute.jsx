import { Navigate } from "react-router-dom";
import { getAccessToken } from "../utils/tokenStore";
import { message } from "antd";
import { useEffect } from "react";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const ProtectRoute = ({ children, allowedRoles }) => {
  const token = getAccessToken();
  const decodedToken = token ? parseJwt(token) : null;

  if (!token || !decodedToken) {
    return <Navigate to="/login" replace />;
  }

  const isRoleMismatched =
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(decodedToken.role);

  useEffect(() => {
    if (isRoleMismatched) {
      message.error("Bạn không có quyền truy cập trang quản trị!");
    }
  }, [isRoleMismatched]);

  if (isRoleMismatched) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default ProtectRoute;