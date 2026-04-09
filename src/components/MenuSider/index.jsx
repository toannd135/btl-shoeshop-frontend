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
    ContainerOutlined
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

function MenuSider() {
    const location = useLocation();

    const items = [
        {
            label: <Link to="/admin">Trang chủ</Link>,
            icon: <DashboardOutlined />,
            key: "/admin",
        },
        {
            label: <Link to="/admin/user">Người dùng</Link>,
            icon: <UserOutlined />,
            key: "/admin/user",
        },
        {
            label: <Link to="/admin/permission">Phân quyền</Link>,
            icon: <SafetyCertificateOutlined />,
            key: "/admin/permission",
        },
        {
            label: <Link to="/admin/role">Vai trò</Link>,
            icon: <TeamOutlined />,
            key: "/admin/role",
        },
        {
            label: <Link to="/admin/category">Danh mục</Link>,
            icon: <TagsOutlined />,
            key: "/admin/category",
        },
        {
            label: <Link to="/admin/product">Sản phẩm</Link>,
            icon: <ShoppingOutlined />,
            key: "/admin/product",
        },
        {
            label: <Link to="/admin/coupon">Mã giảm giá</Link>,
            icon: <GiftOutlined />,
            key: "/admin/coupon",
        },
        {
            label: <Link to="/admin/order">Đơn hàng</Link>,
            icon: <FileTextOutlined />,
            key: "/admin/order",
        },
        {
            label: <Link to="/admin/inventory-transaction">Kho hàng</Link>,
            icon: <InboxOutlined />,
            key: "/admin/inventory-transaction",
        },
        {
            label: <Link to="/admin/purchase-orders">Phiếu nhập</Link>,
            icon: <ContainerOutlined />,
            key: "/admin/purchase-orders",
        },
        {
            label: <Link to="/admin/supplier">Nhà cung cấp</Link>,
            icon: <ShopOutlined />,
            key: "/admin/supplier",
        }

    ];

    return (
        <Menu
            theme="light"
            mode="inline"
            items={items}
            selectedKeys={[location.pathname]}
        />
    );
}

export default MenuSider;