import { useEffect, useState } from "react";
import { getUserList, getUserPage } from "../../services/userService";
import { Table, Input, Select } from "antd";
import { Link } from "react-router-dom";
import UserUpdate from "./UserUpdate";
import UserDelete from "./UserDelete";
import { EyeOutlined, SearchOutlined, EditOutlined } from "@ant-design/icons";
import UserDetail from "./UserDetail";
import "./User.css";

function UserList() {
    const [users, setUsers] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openUpdate, setOpenUpdate] = useState(false);

    const handleUpdate = (user) => {
        setSelectedUser(user);
        setOpenUpdate(true);
    };

    const handleViewDetail = (user) => {
        setSelectedUser(user);
        setOpenDetail(true);
    };


    const fetchAPI = async () => {
        const res = await getUserList();
        setUsers(res.data.users || []);
    };

    const fetchSearchAPI = async (params = {}) => {
        const res = await getUserPage(params);
        setUsers(res.data.users || []);
    };

    useEffect(() => {
        fetchAPI();
    }, []);

    const handleReload = () => {
        fetchAPI();
    };

    const renderStatus = (status) => {
        const colorMap = {
            ACTIVE: { bg: "#d9f7e6", color: "#1f8f4e" },
            DELETED: { bg: "#fde2e2", color: "#c53030" },
            INACTIVE: { bg: "#f0f0f0", color: "#555" },
            SUSPENDED: { bg: "#e6f0ff", color: "#1d4ed8" },
        };

        const style = colorMap[status] || colorMap.INACTIVE;

        return (
            <span
                style={{
                    background: style.bg,
                    color: style.color,
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 12,
                }}
            >
                {status}
            </span>
        );
    };

    const renderRole = (role) => (
        <span
            style={{
                background: "#e6f0ff",
                color: "#1d4ed8",
                padding: "6px 14px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 12,
            }}
        >
            {role?.name?.toUpperCase() || "USER"}
        </span>
    );

    const columns = [
        {
            title: "Người dùng",
            key: "username",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img
                        src={record.avatarImage}
                        alt={record.username}
                        style={{
                            width: 48,
                            height: 48,
                            objectFit: "cover",
                            borderRadius: "50%",
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 600 }}>
                            {record.username}
                        </div>
                        <div style={{ color: "#777", fontSize: 13 }}>
                            {record.fullName}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => renderStatus(status),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (email) => (
                <a
                    href={`mailto:${email}`}
                    style={{ textDecoration: "underline", color: "#1d4ed8" }}
                >
                    {email}
                </a>
            ),
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role) => renderRole(role),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => handleViewDetail(record)}
                        style={{
                            border: "1px solid #6366f1",
                            background: "white",
                            color: "#6366f1",
                            padding: "4px 10px",
                            borderRadius: 6,
                            cursor: "pointer"
                        }}
                    >
                        <EyeOutlined />
                    </button>
                    <button
                        onClick={() => handleUpdate(record)}
                        style={{
                            border: "1px solid #16a34a",
                            background: "white",
                            color: "#16a34a",
                            padding: "4px 10px",
                            borderRadius: 6,
                            cursor: "pointer"
                        }}
                    >
                        <EditOutlined />
                    </button>
                    <UserDelete record={record} onReload={handleReload} />
                </div>
            ),
        },
    ];


    return (
        <>
            <div className="user-container">
                <div className="user-header">
                    <h2>Quản lý người dùng</h2>
                    <h5>
                        <Link to="/">Dashboard</Link> / Quản lý người dùng / Người dùng
                    </h5>
                </div>

                <div className="user-bar">
                    <div className="user-bar_left">
                        <Input
                            placeholder="Tìm theo username hoặc email"
                            prefix={<SearchOutlined />}
                            className="user-search"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onPressEnter={() => {
                                if (!searchValue.trim()) {
                                    fetchAPI();
                                } else {
                                    fetchSearchAPI({
                                        username: searchValue,
                                        email: searchValue,
                                    });
                                }
                            }}
                        />

                        <Select
                            defaultValue="default"
                            className="user-arrange"
                            onChange={(value) => {
                                if (value === "default") {
                                    fetchAPI();
                                    return;
                                }

                                let sortParam;

                                if (value === "name_asc") {
                                    sortParam = "username,asc";
                                } else if (value === "name_desc") {
                                    sortParam = "username,desc";
                                }

                                fetchSearchAPI({
                                    username: searchValue,
                                    email: searchValue,
                                    sort: sortParam,
                                });
                            }}
                            options={[
                                { value: "default", label: "Sắp xếp theo" },
                                { value: "name_asc", label: "Tên A-Z" },
                                { value: "name_desc", label: "Tên Z-A" },
                            ]}
                        />
                    </div>
                </div>
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="userId"
                />
                <UserDetail
                    open={openDetail}
                    onClose={() => setOpenDetail(false)}
                    user={selectedUser}
                />
                <UserUpdate
                    open={openUpdate}
                    onClose={() => setOpenUpdate(false)}
                    user={selectedUser}
                    onReload={handleReload}
                />

            </div>

        </>
    );
}

export default UserList;
