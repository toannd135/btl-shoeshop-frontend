import { Menu } from "antd";
import { AppstoreOutlined, DashboardOutlined, BookOutlined, UserOutlined, AuditOutlined, BarsOutlined } from "@ant-design/icons";
import { Link, useLocation } from 'react-router-dom';


function MenuSider() {
    const location = useLocation();
    const items = [
        {
            label: <Link to="/admin">Trang chủ</Link>,
            icon: <DashboardOutlined />,
            key: '/admin',
        },
        {
            label: <Link to="/admin/user">Người dùng</Link>,
            icon: <UserOutlined />,
            key: "/admin/user",
        },
        {
            label: <Link to="/admin/permission">Phân quyền</Link>,
            icon: <AuditOutlined />,
            key: "/admin/permission",
        },
        {
            label: <Link to="/admin/role">Vai trò</Link>,
            icon: <BarsOutlined />,
            key: "/admin/role",
        },
        {
            label: <Link to="/admin/category">Danh mục</Link>,
            icon: <BookOutlined />,
            key: "/admin/category"
        },
        {
            label: <Link to="/admin/product">Sản phẩm</Link>,
            icon: <AppstoreOutlined />,
            key: "/admin/product"
        },
        {
            label: <Link to="/admin/coupon">Mã giảm giá</Link>,
            icon: <AppstoreOutlined />,
            key: "/admin/coupon"
        },
        {
            label: <Link to="/admin/order">Đơn hàng</Link>,
            icon: <AppstoreOutlined />,
            key: "/admin/order"
        }
    ];
    return (
        <>

            <Menu
                theme="light"
                mode="inline"
                items={items}
                selectedKeys={[location.pathname]}
                defaultOpenKeys={["Dashboard"]} />

        </>
    )
}

export default MenuSider;