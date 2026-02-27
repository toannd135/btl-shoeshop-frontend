import { useEffect, useState } from "react";
import { getRoleList, getRolePage } from "../../services/roleService";
import { Card, Tag, Row, Col, Button, Input, Select } from "antd";
import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import RoleDetail from "./RoleDetail";
import { Link } from "react-router-dom";
import "./Role.css";
import RoleCreate from "./RoleCreate";
import RoleUpdate from "./RoleUpdate";
import { getPermissionList } from "../../services/permissionService";
function RoleList() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchValue, setSearchValue] = useState("");

    const handleViewDetail = (role) => {
        setSelectedRole(role);
        setOpenModal(true);
    };
    const handleEdit = (role) => {
        setSelectedRole(role);
        setOpenUpdateModal(true);
    };

    const fetchAPI = async () => {
        const res = await getRoleList();
        setRoles(res.data.roles || []);
    };
    const fetchPermissions = async () => {
        const res = await getPermissionList();
        setPermissions(res.data.permissions || []);
    };

    const fetchSearchAPI = async (params = {}) => {
        const res = await getRolePage(params);
        setRoles(res.data.roles || []);
    }
    useEffect(() => {
        fetchAPI();
        fetchPermissions();
    }, []);
    const renderStatus = (status) => {
       const colorMap = {
            ACTIVE: { bg: "#d9f7e6", color: "#1f8f4e" },
            DELETED: { bg: "#fde2e2", color: "#c53030" },
            INACTIVE: { bg: "#f0f0f0", color: "#555" },
            SUSPENDED: { bg: "#e6f0ff", color: "#1d4ed8" },
        };

        const style = colorMap[status] || colorMap.INACTIVE;
        return (
            <Tag
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
            </Tag>
        );
    };
    return (
        <>
            <div className="role-container">
                <div className="role-header">
                    <h2>Quản lý vai trò</h2>
                    <h5>
                        <Link to="/">Dashboard</Link>/ Vai trò
                    </h5>

                </div>
                <div className="role-bar">
                    <div className="role-bar_left">
                        <Input
                            placeholder="Tìm kiếm theo name va code..."
                            prefix={<SearchOutlined />}
                            className="role-search"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onPressEnter={() => {
                                if (!searchValue.trim()) {
                                    fetchAPI();
                                } else {
                                    fetchSearchAPI({
                                        name: searchValue,
                                        code: searchValue,
                                    });
                                }
                            }}
                        />

                        <Select
                            defaultValue="default"
                            className="role-arrange"
                            onChange={(value) => {
                                if (value === "default") {
                                    fetchAPI();
                                    return;
                                }

                                let sortParam;

                                switch (value) {
                                    case "name_asc":
                                        sortParam = "name,asc";
                                        break;
                                    case "name_desc":
                                        sortParam = "name,desc";
                                        break;
                                    case "code_asc":
                                        sortParam = "code,asc";
                                        break;
                                    case "code_desc":
                                        sortParam = "code,desc";
                                        break;
                                    case "created_desc":
                                        sortParam = "createdAt,desc";
                                        break;
                                    case "created_asc":
                                        sortParam = "createdAt,asc";
                                        break;
                                    case "updated_desc":
                                        sortParam = "updatedAt,desc";
                                        break;
                                    case "updated_asc":
                                        sortParam = "updatedAt,asc";
                                        break;
                                    default:
                                        return;
                                }

                                fetchSearchAPI({
                                    name: searchValue,
                                    code: searchValue,
                                    sort: sortParam
                                });
                            }}
                            options={[
                                { value: "default", label: "Sắp xếp theo" },
                                { value: "name_asc", label: "Tên A-Z" },
                                { value: "name_desc", label: "Tên Z-A" },
                                { value: "code_asc", label: "Code A-Z" },
                                { value: "code_desc", label: "Code Z-A" },
                                { value: "created_desc", label: "Mới tạo gần đây" },
                                { value: "created_asc", label: "Cũ nhất" },
                                { value: "updated_desc", label: "Vừa cập nhật" },
                                { value: "updated_asc", label: "Cập nhật lâu nhất" },
                            ]}
                        />

                    </div>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="role-create"
                        onClick={() => setOpenCreateModal(true)}
                    >
                        Tạo mới
                    </Button>

                </div>

                <div className="role-content">
                    <Row gutter={[16, 16]}>
                        {roles.map((role) => (
                            <Col xs={24} sm={24} md={12} lg={8} key={role.roleId}>
                                <Card
                                    title={role.name}
                                    extra={renderStatus(role.status)}
                                    hoverable
                                    style={{ height: "100%" }}
                                    bodyStyle={{
                                        padding: 16,
                                        display: "flex",
                                        flexDirection: "column",
                                        height: 150
                                    }}
                                >
                                    <div
                                        style={{
                                            background: "#f3f3f3",
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            fontSize: 13,
                                            color: "#555",
                                            width: "100%",
                                            marginBottom: 12
                                        }}
                                    >
                                        {role.code}
                                    </div>

                                    <div style={{
                                        marginTop: "auto",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <span className="view-detail" onClick={() => handleViewDetail(role)}>
                                            Xem chi tiết
                                        </span>
                                        <Button icon={<EditOutlined />} onClick={() => handleEdit(role)}>
                                            Edit
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
                <RoleDetail
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    role={selectedRole}
                    permissions={permissions}
                />
                <RoleCreate
                    open={openCreateModal}
                    onClose={(created) => {
                        setOpenCreateModal(false);
                        if (created) {
                            fetchAPI();
                        }
                    }}
                />
                <RoleUpdate
                    open={openUpdateModal}
                    role={selectedRole}
                    permissions={permissions}
                    onClose={(updated) => {
                        setOpenUpdateModal(false);
                        if (updated) {
                            fetchAPI();
                        }
                    }} />
            </div >
        </>
    )
}

export default RoleList;