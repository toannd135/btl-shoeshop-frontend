import { useEffect, useState } from "react";
import { getRoleList, getRolePage } from "../../services/roleService";
import { Card, Tag, Row, Col, Button, Input, Select } from "antd";
import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import RoleDetail from "./RoleDetail";
import { Link } from "react-router-dom";
import "./Role.css";
import RoleCreate from "./RoleCreate";
import RoleUpdate from "./RoleUpdate";
function RoleList() {
    const [roles, setRoles] = useState([]);
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
    const fetchSearchAPI = async (params = {}) => {
        const res = await getRolePage(params);
        setRoles(res.data.roles || []);
    }
    useEffect(() => {
        fetchAPI();
    }, []);
    const renderStatus = (status) => {
        const colorMap = {
            ACTIVE: "green",
            INACTIVE: "default",
            SUSPENDED: "blue",
            DELETED: "red"
        };

        return (
            <Tag
                color={colorMap[status]}
                style={{
                    borderRadius: 20,
                    padding: "2px 12px",
                    fontWeight: 500
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
                        <Link to="/">Dashboard</Link> / Quản lý vai trò / Vai trò
                    </h5>

                </div>
                <div className="role-bar">
                    <div className="role-bar_left">
                        <Input
                            placeholder="Tìm theo tên hoặc code"
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
                                        code: searchValue
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

                                if (value === "name_asc") {
                                    sortParam = "name,asc";
                                } else if (value === "name_desc") {
                                    sortParam = "name,desc";
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