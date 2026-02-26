import { useEffect, useState } from "react";
import { Card, Tag, Row, Col, Button, Input, Select } from "antd";
import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./Permission.css";
import { getPermissionList, getPermissionPage } from "../../services/permissionService";
import PermissionDetail from "./PermissionDetail";
import PermissionCreate from "./PermissonCreate";
import PermissionUpdate from "./PermissionUpdate";

function PermissionList() {
    const [permissions, setPermissions] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const handleViewDetail = (permission) => {
        setSelectedPermission(permission);
        setOpenModal(true);
    };
    const handleEdit = (permission) => {
        setSelectedPermission(permission);
        setOpenUpdateModal(true);
    };
    const fetchSearchAPI = async (params = {}) => {
        const res = await getPermissionPage(params);
        setPermissions(res.data.permissions || []);
    }
    const fetchAPI = async () => {
        const res = await getPermissionList();
        setPermissions(res.data.permissions || []);
    };

    useEffect(() => {
        fetchAPI();
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
        <div className="per-container">
            <div className="per-header">
                <h2>Quản lý quyền hạn</h2>
                <h5>
                    <Link to="/">Dashboard</Link> / Quyền hạn
                </h5>
            </div>

            <div className="per-bar">
                <div className="per-bar_left">
                    <Input
                        placeholder="Tìm theo tên hoặc endpoint"
                        prefix={<SearchOutlined />}
                        className="per-search"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onPressEnter={() => {
                            if (!searchValue.trim()) {
                                fetchAPI();
                            } else {
                                fetchSearchAPI({
                                    name: searchValue,
                                    apiPath: searchValue,
                                    module: searchValue,
                                    method: searchValue
                                });
                            }
                        }}
                    />

                    <Select
                        defaultValue="default"
                        className="per-arrange"
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
                                case "created_asc":
                                    sortParam = "createdAt,asc";
                                    break;
                                case "created_desc":
                                    sortParam = "createdAt,desc";
                                    break;
                                case "updated_asc":
                                    sortParam = "updatedAt,asc";
                                    break;
                                case "updated_desc":
                                    sortParam = "updatedAt,desc";
                                    break;
                                default:
                                    return;
                            }

                            fetchSearchAPI({
                                name: searchValue,
                                apiPath: searchValue,
                                module: searchValue,
                                method: searchValue,
                                sort: sortParam
                            });
                        }}
                        options={[
                            { value: "default", label: "Sắp xếp theo" },
                            { value: "name_asc", label: "Tên A-Z" },
                            { value: "name_desc", label: "Tên Z-A" },
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
                    className="per-create"
                    onClick={() => setOpenCreateModal(true)}
                >
                    Tạo mới
                </Button>
            </div>

            <div className="per-content">
                <Row gutter={[16, 16]}>
                    {permissions.map((permission) => (
                        <Col
                            xs={24}
                            sm={24}
                            md={12}
                            lg={8}
                            key={permission.permissionId}
                        >
                            <Card
                                title={
                                    <div className="per-card-title">
                                        <div className="per-name">
                                            {permission.name}
                                        </div>

                                        <span className={`method-badge ${permission.method?.toLowerCase()}`}>
                                            {permission.method}
                                        </span>
                                    </div>
                                }
                                extra={renderStatus(permission.status)}
                                hoverable
                                style={{ height: "100%" }}
                                bodyStyle={{
                                    padding: 16,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 14
                                }}
                            >

                                <div className="per-main-info">
                                    <div className="per-api">
                                        {permission.apiPath}
                                    </div>

                                    <div className="per-module">
                                        {permission.module}
                                    </div>
                                </div>

                                <div className="per-footer">
                                    <span className="view-detail" onClick={() => handleViewDetail(permission)}>
                                        Xem chi tiết
                                    </span>
                                    <Button icon={<EditOutlined />} onClick={() => handleEdit(permission)}>
                                        Edit
                                    </Button>
                                </div>

                            </Card>

                        </Col>
                    ))}
                </Row>
            </div>
            <PermissionDetail
                open={openModal}
                onClose={() => setOpenModal(false)}
                permission={selectedPermission}
            />
            <PermissionCreate
                open={openCreateModal}
                onClose={(created) => {
                    setOpenCreateModal(false);
                    if (created) {
                        fetchAPI();
                    }
                }}
            />
            <PermissionUpdate
                open={openUpdateModal}
                permission={selectedPermission}
                onClose={(updated) => {
                    setOpenUpdateModal(false);
                    if (updated) {
                        fetchAPI();
                    }
                }} />
        </div>
    );
}

export default PermissionList;
