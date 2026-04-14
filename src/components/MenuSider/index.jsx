import { Menu } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    TagsOutlined,
    ShoppingOutlined,
    GiftOutlined,
    FileTextOutlined,
    InboxOutlined,
    ShopOutlined,
    ContainerOutlined,
    MessageOutlined,
    StarOutlined
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../utils/tokenStore";

function MenuSider() {
    const location = useLocation();
    const user = getCurrentUser();

    // Chuẩn hóa role code (bỏ prefix ROLE_ nếu có)
    const userRole = user?.roleCode?.startsWith("ROLE_")
        ? user.roleCode.substring(5)
        : (user?.roleCode || "");

    const menuItems = [
        {
            label: <Link to="/admin">Trang chủ</Link>,
            icon: <DashboardOutlined />,
            key: "/admin",
            roles: ["SUPER_ADMIN", "MANAGER"]
        },
        {
            label: <Link to="/admin/user">Người dùng</Link>,
            icon: <UserOutlined />,
            key: "/admin/user",
            roles: ["SUPER_ADMIN", "ADMIN"]
        },
        {
            label: <Link to="/admin/permission">Phân quyền</Link>,
            icon: <SafetyCertificateOutlined />,
            key: "/admin/permission",
            roles: ["SUPER_ADMIN", "ADMIN"]
        },
        {
            label: <Link to="/admin/role">Vai trò</Link>,
            icon: <TeamOutlined />,
            key: "/admin/role",
            roles: ["SUPER_ADMIN", "ADMIN"]
        },
        {
            label: <Link to="/admin/category">Danh mục</Link>,
            icon: <TagsOutlined />,
            key: "/admin/category",
            roles: ["SUPER_ADMIN", "MANAGER"]
        },
        {
            label: <Link to="/admin/product">Sản phẩm</Link>,
            icon: <ShoppingOutlined />,
            key: "/admin/product",
            roles: ["SUPER_ADMIN", "MANAGER"]
        },
        {
            label: <Link to="/admin/coupon">Mã giảm giá</Link>,
            icon: <GiftOutlined />,
            key: "/admin/coupon",
            roles: ["SUPER_ADMIN", "MANAGER"]
        },
        {
            label: <Link to="/admin/order">Đơn hàng</Link>,
            icon: <FileTextOutlined />,
            key: "/admin/order",
            roles: ["SUPER_ADMIN", "MANAGER"]
        },
        {
            label: <Link to="/admin/inventory-transaction">Kho hàng</Link>,
            icon: <InboxOutlined />,
            key: "/admin/inventory-transaction",
            roles: ["SUPER_ADMIN", "MANAGER"]
        },
        {
            label: <Link to="/admin/purchase-orders">Phiếu nhập</Link>,
            icon: <ContainerOutlined />,
            key: "/admin/purchase-orders",
            roles: ["SUPER_ADMIN", "MANAGER"]
        },
        {
            label: <Link to="/admin/supplier">Nhà cung cấp</Link>,
            icon: <ShopOutlined />,
            key: "/admin/supplier",
            roles: ["SUPER_ADMIN", "MANAGER"]
        },
        {
            label: <Link to="/admin/chat">Tin nhắn</Link>,
            icon: <MessageOutlined />,
            key: "/admin/chat",
            roles: ["SUPER_ADMIN", "SELLER"]
        },
        {
            label: <Link to="/admin/reviews">Đánh giá</Link>,
            icon: <StarOutlined />,
            key: "/admin/reviews",
            roles: ["SUPER_ADMIN", "MANAGER"]
        }
    ];

    // Lọc menu dựa trên role của user
    const filteredItems = menuItems.filter(item =>
        !item.roles || item.roles.includes(userRole)
    );

    return (
        <Menu
            theme="light"
            mode="inline"
            items={filteredItems}
            selectedKeys={[location.pathname]}
        />
    );
}

export default MenuSider;