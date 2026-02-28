import LayoutDefault from "../layout/LayoutDefault";
import Dashboard from "../components/Dashboard";
import ProductList from "../pages/Product/ProductList";
import UserList from "../pages/User/UserList";
import PermissionList from "../pages/Permission/PermissionList";
import RoleList from "../pages/Role/RoleList";
import Login from "../pages/Login/index";
import Register from "../pages/Register/index";
import ProtectRoute from "../Routes/ProtectRoute";
export const routes = [
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register/>
    },
    {
        path: "/",
        element: (
            <ProtectRoute allowedRoles={['ROLE_ADMIN']}>
                <LayoutDefault/>
            </ProtectRoute>
        ),
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