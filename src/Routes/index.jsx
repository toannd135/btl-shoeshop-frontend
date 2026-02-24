import LayoutDefault from "../layout/LayoutDefault";
import Dashboard from "../components/Dashboard";
import ProductList from "../pages/Product/ProductList";
import UserList from "../pages/User/UserList";
import PermissionList from "../pages/Permission/PermissionList";
import RoleList from "../pages/Role/RoleList";
export const routes = [
    {
        path: "/",
        element: <LayoutDefault />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: "product",
                element: <ProductList />,
            },
            {
                path: "user",
                element: <UserList/>,
            },
            {
                path: "permission",
                element: <PermissionList/>,
            },
            {
                path: "role",
                element: <RoleList/>,
            }
        ]
    }
]