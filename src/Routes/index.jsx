import LayoutDefault from "../layout/LayoutDefault";
import Dashboard from "../components/Dashboard";
import UserList from "../pages/User/UserList";
import PermissionList from "../pages/Permission/PermissionList";
import RoleList from "../pages/Role/RoleList";
import Login from "../pages/Login/index";
import Register from "../pages/Register/index";
import ProtectRoute from "../Routes/ProtectRoute";
import CateList from "../pages/Category/CateList";
import ProductList from "../pages/Product/ProductList";
import ProductVariant from "../pages/ProductVariant";
import OAuth2RedirectHandler from "../pages/Login/OAuth2RedirectHandler";
export const routes = [
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/oauth2/redirect",
        element: <OAuth2RedirectHandler/>
    },
    {
        path: "/register",
        element: <Register/>
    },
    {
        path: "/productVariant/:id",
        element: <ProductVariant/>
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
            },
            {
                path: "category",
                element: <CateList/>
            },
            {
                path: "product",
                element: <ProductList/>
            }
        ]
    }
]