import { useEffect, useState } from "react";
import { getUserList, getUserPage } from "../../services/userService";
import { Table, Input, Select, Button } from "antd";
import { Link } from "react-router-dom";
import UserUpdate from "./UserUpdate";
import UserDelete from "./UserDelete";
import { EyeOutlined, SearchOutlined, EditOutlined } from "@ant-design/icons";
import UserDetail from "./UserDetail";
import { PlusOutlined } from "@ant-design/icons";
import UserCreate from "./UserCreate";
import "./User.css";

function UserList() {
    const [users, setUsers] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState("");
    const handleUpdate = (user) => {
        setSelectedUser(user);
        setOpenUpdate(true);
    };

    const handleViewDetail = (user) => {
        setSelectedUser(user);
        setOpenDetail(true);
    };

    const fetchSearchAPI = async (params = {}) => {
        const res = await getUserPage(params);
        setUsers(res.data.users || []);
        setTotal(res.data.total);
    };

    useEffect(() => {
        const params = {
            page: currentPage ,
            size: pageSize,
        };
        if (sort) {
            params.sort = sort;
        }
        if (searchValue && searchValue.trim() !== "") {
            params.username = searchValue.trim();
            params.email = searchValue.trim();
        }
        fetchSearchAPI(params);
    }, [currentPage, pageSize, searchValue, sort]);

    const handleReload = () => {
        fetchSearchAPI({
            page: currentPage ,
            size: pageSize
        });
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
                        <Link to="/">Dashboard</Link> / Người dùng
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
                                setCurrentPage(1);
                            }}
                        />

                        <Select
                            defaultValue="Sắp xếp theo"
                            className="user-arrange"
                            onChange={(value) => {
                                setSort(value);
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: "username,asc", label: "Username A-Z" },
                                { value: "username,desc", label: "Username Z-A" },

                                { value: "email,asc", label: "Email A-Z" },
                                { value: "email,desc", label: "Email Z-A" },

                                { value: "gender,asc", label: "Giới tính A-Z" },
                                { value: "gender,desc", label: "Giới tính Z-A" },

                                { value: "dateOfBirth,asc", label: "Ngày sinh tăng dần" },
                                { value: "dateOfBirth,desc", label: "Ngày sinh giảm dần" },

                                { value: "createdAt,asc", label: "Ngày khởi tạo sớm nhất" },
                                { value: "createdAt,desc", label: "Ngày khởi tạo mới nhất" },

                                { value: "updatedAt,asc", label: "Cập nhật cũ nhất" },
                                { value: "updatedAt,desc", label: "Cập nhật lần gần nhất" },
                            ]}
                        />
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="user-create"
                        onClick={() => setOpenCreate(true)}
                    >
                        Tạo mới
                    </Button>
                </div>
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="userId"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                    }}
                    onChange={(pagination) => {
                        setCurrentPage(pagination.current);
                        setPageSize(pagination.pageSize);
                    }}
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
                <UserCreate
                    open={openCreate}
                    onClose={(created) => {
                        setOpenCreate(false);
                        if (created) {
                            fetchSearchAPI({
                                page: currentPage ,
                                size: pageSize,
                                username: searchValue,
                                email: searchValue
                            });
                        }
                    }}
                />
            </div>

        </>
    );
}

export default UserList;
