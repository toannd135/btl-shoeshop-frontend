import { useEffect, useState } from "react";
import { getUserList } from "../../services/userService";
import { Tag, Table } from "antd";
import { Link } from "react-router-dom";
import UserUpdate from "./UserUpdate";
import UserDelete from "./UserDelete";


function UserList() {
    const [users, setUsers] = useState([]);
    
    const fetchAPIUser = async () => {
        const res = await getUserList();
        setUsers(res.data.users || []);
    };
    useEffect(() => {
        fetchAPIUser();
    }, []);
    const handleReload = () => {
        fetchAPIUser();
    }
    const STATUS_COLOR = {
        ACTIVE: "green",
        INACTIVE: "default",
        SUSPENDED: "red",
        DELETED: "volcano",
    };
    const columns = [
        {
            title: "Người dùng",
            key: "username",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img src={record.avatarImage} alt={record.username}
                        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 5 }}
                    />
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.username}</div>
                        <div style={{ color: "#888", fontSize: 12 }}>{record.fullName}</div>
                    </div>
                </div>
            )
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
            render: (status) => (
                <Tag color={STATUS_COLOR[status] || "default"}>
                    {status}
                </Tag>
            )
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone"
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email"
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role) => (
                <Tag color="blue">
                    {role?.name || "N/A"}
                </Tag>
            )
        }
        ,
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 12 }}>
                    <UserUpdate
                        record={record} onReload={handleReload} style={{ cursor: "pointer" }} />
                    <UserDelete record={record} onReload={handleReload} style={{ color: "red", cursor: "pointer" }} />
                </div>
            )
        }

    ]
    
    return (
        <>
            <div style={{ marginBottom: 24, marginTop: 30 }}>
                <h1>User</h1>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div style={{ color: "#1677ff" }}>
                        <Link to="/">Dashboard</Link> / Pages / Users
                    </div>

                </div>
            </div>
            <Table dataSource={users} columns={columns} rowKey="userId" />
        </>
    );
}

export default UserList;
