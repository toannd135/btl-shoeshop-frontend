import { Menu } from "antd";
import { DashboardOutlined, ProductOutlined, UserOutlined, AuditOutlined } from "@ant-design/icons";
import { Link, useLocation } from 'react-router-dom';


function MenuSider() {
    const location = useLocation();
    const items = [
        {
            label: "Dashboard",
            icon: <DashboardOutlined />,
            key: 'Dashboard',
            children: [
                {
                    label: <Link to="/">Trang chủ</Link>,
                    key: '/',
                }
            ]
        },
        {
            label: <Link to="/product">Sản phẩm</Link>,
            icon: <ProductOutlined />,
            key: "product",
            children: [
                {
                    label: <Link to="/product/product-list">Danh sách sản phẩm</Link>,
                    key: '/product/product-list'
                },
                {
                    label: <Link to="/product/product-create">Thêm sản phẩm</Link>,
                    key: '/product/product-create'
                },
            ]
        },
        {
            label: <Link to="/user">Người dùng</Link>,
            icon: <UserOutlined />,
            key: "user",
            children: [
                {
                    label: <Link to="/user/user-list">Danh sach</Link>,
                    key: "/user/user-list"
                }
            ]
        },
        {
            label: <Link to="/permission">Permission</Link>,
            icon: <AuditOutlined />,
            key: "permission",
            children: [
                {
                    label: <Link to="/permission/permission-list">Permission-list</Link>,
                    key: "/permission/permission-list"
                },
            ]
        },
        {
            label: <Link to="/role">Vai trò</Link>,
            key: "role",
        }
    ]
    return (
        <>

            <Menu
                theme="dark"
                mode="inline"
                items={items}
                selectedKeys={[location.pathname]}
                defaultOpenKeys={["Dashboard"]} />

        </>
    )
}

export default MenuSider;