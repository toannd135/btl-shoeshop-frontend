import { Menu } from "antd";
import { DashboardOutlined, ProductOutlined, UserOutlined, AuditOutlined, BarsOutlined } from "@ant-design/icons";
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