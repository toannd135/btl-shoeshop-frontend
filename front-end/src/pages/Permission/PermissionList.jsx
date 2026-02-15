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
        <div className="per-container">
            <div className="per-header">
                <h2>Quản lý quyền hạn</h2>
                <h5>
                    <Link to="/">Dashboard</Link> / Quản lý phân quyền / Quyền hạn
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

                            if (value === "name_asc") {
                                sortParam = "name,asc";
                            } else if (value === "name_desc") {
                                sortParam = "name,desc";
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
                                    <Button icon={<EditOutlined />} onClick={()=> handleEdit(permission)}>
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
