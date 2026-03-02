import { Menu } from "antd";
import { AppstoreOutlined, DashboardOutlined, BookOutlined, UserOutlined, AuditOutlined, BarsOutlined } from "@ant-design/icons";
import { Link, useLocation } from 'react-router-dom';


function MenuSider() {
    const location = useLocation();
    const items = [
        {
            label: <Link to="/">Trang chủ</Link>,
            icon: <DashboardOutlined />,
            key: '/',
        },
        {
            label: <Link to="/user">Người dùng</Link>,
            icon: <UserOutlined />,
            key: "/user",
        },
        {
            label: <Link to="/permission">Phân quyền</Link>,
            icon: <AuditOutlined />,
            key: "/permission",
        },
        {
            label: <Link to="/role">Vai trò</Link>,
            icon: <BarsOutlined />,
            key: "/role",
        },
        {
            label: <Link to="/category">Danh mục</Link>,
            icon: <BookOutlined />,
            key: "/category"
        },
        {
            label: <Link to="/product">Sản phẩm</Link>,
            icon: <AppstoreOutlined />,
            key: "/product"
        }
    ]
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