import LayoutDefault from "../layout/LayoutDefault";
import Dashboard from "../components/Dashboard";
import Product from "../pages/Product/Product";
import ProductList from "../pages/Product/ProductList";
import ProductCreate from "../pages/Product/ProductCreate";
import User from "../pages/User/index";
import UserList from "../pages/User/UserList";
import Permission from "../pages/Permission/index";
import PermissionList from "../pages/Permission/PermissionList";
import RoleList from "../pages/Role/RoleList";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Home from "../pages/Home";
import ForgotPassword from "../pages/Forgot-Password";
import OTP from "../pages/OTP";
import ResetPassword from "../pages/ResetPassword";
export const routes = [

    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/home",
        element: <Home />
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/otp",
        element: <OTP />
    },
    {
        path: "/resetpassword",
        element: <ResetPassword />
    },

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
                element: <Product />,
                children: [
                    {
                        index: true,
                        element: <ProductList />
                    },
                    {
                        path: "product-list",
                        element: <ProductList />
                    },
                    {
                        path: "product-create",
                        element: <ProductCreate />
                    },
                ]
            },
            {
                path: "user",
                element: <User />,
                children: [
                    {
                        index: true,
                        element: <UserList />
                    },
                    {
                        path: "user-list",
                        element: <UserList />
                    }
                ]
            },
            {
                path: "permission",
                element: <Permission />,
                children: [
                    {
                        path: "permission-list",
                        element: <PermissionList />
                    },
                ]
            },
            {
                path: "role",
                element: <RoleList />,
            }
        ]
    }
];