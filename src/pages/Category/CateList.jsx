import { useEffect, useState, useMemo } from "react";
import { Card, Tag, Row, Col, Button, Input, Select } from "antd";
import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./Category.css";
import { getCateList } from "../../services/cateService"; 
import CateDetail from "./CateDetail";
import CateCreate from "./CateCreate";
import CateUpdate from "./CateUpdate";

function CateList() {
    const [categories, setCategories] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [sortOption, setSortOption] = useState("default");
    
    const [selectedCate, setSelectedCate] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);

    const fetchAPI = async () => {
        try {
            const res = await getCateList();
            setCategories(res.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách danh mục:", error);
        }
    };

    useEffect(() => {
        fetchAPI();
    }, []);

    const categoryMap = useMemo(() => {
        const map = {};
        categories.forEach(cate => {
            map[cate.categoryId] = cate.categoryName;
        });
        return map;
    }, [categories]);

    const parentCategories = useMemo(() => {
        return categories.filter(cate => cate.parentId === null);
    }, [categories]);

    const renderStatus = (status) => {
        const colorMap = {
            ACTIVE: { bg: "#d9f7e6", color: "#1f8f4e" },
            DELETED: { bg: "#fde2e2", color: "#c53030" },
            INACTIVE: { bg: "#f0f0f0", color: "#555" },
            SUSPENDED: { bg: "#e6f0ff", color: "#1d4ed8" },
        };
        const style = colorMap[status] || colorMap.INACTIVE;
        return (
            <Tag style={{ background: style.bg, color: style.color, padding: "6px 14px", borderRadius: 999, fontWeight: 600, fontSize: 12 }}>
                {status}
            </Tag>
        );
    };

    const handleViewDetail = (cate) => {
        setSelectedCate(cate);
        setOpenModal(true);
    };

    const handleEdit = (cate) => {
        setSelectedCate(cate);
        setOpenUpdateModal(true);
    };

    const processedCategories = useMemo(() => {
        let result = categories.filter(cate => 
            cate.parentId !== null && 
            cate.categoryName.toLowerCase().includes(searchValue.toLowerCase())
        );

        switch (sortOption) {
            case "name_asc":
                result.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
                break;
            case "name_desc":
                result.sort((a, b) => b.categoryName.localeCompare(a.categoryName));
                break;
            case "created_desc":
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "created_asc":
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "updated_desc":
                result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case "updated_asc":
                result.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
                break;
            default:
                break;
        }
        return result;
    }, [categories, searchValue, sortOption]);

    return (
        <div className="cate-container">
            <div className="cate-header">
                <h2>Quản lý danh mục</h2>
                <h5>
                    <Link to="/">Dashboard</Link> / Danh mục
                </h5>
            </div>

            <div className="cate-bar">
                <div className="cate-bar_left">
                    <Input
                        placeholder="Tìm theo tên danh mục"
                        prefix={<SearchOutlined />}
                        className="cate-search"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    
                    <Select
                        defaultValue="default"
                        className="cate-arrange"
                        onChange={(value) => setSortOption(value)}
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
                    className="cate-create"
                    onClick={() => setOpenCreateModal(true)}
                >
                    Tạo mới
                </Button>
            </div>

            <div className="cate-content">
                <Row gutter={[16, 16]}>
                    {processedCategories.map((cate) => {
                        const parentName = categoryMap[cate.parentId] || "Không xác định";

                        return (
                            <Col xs={24} sm={24} md={12} lg={8} key={cate.categoryId}>
                                <Card
                                    title={
                                        <div className="cate-card-title">
                                            <div className="cate-name">
                                                {cate.categoryName}
                                            </div>
                                        </div>
                                    }
                                    extra={renderStatus(cate.status)}
                                    hoverable
                                    style={{ height: "100%" }}
                                    bodyStyle={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}
                                >
                                    <div className="cate-main-info">
                                        <div className="cate-info">
                                            <strong style={{ color: '#1677ff' }}>{parentName}</strong>
                                        </div>
                                    </div>

                                    <div className="cate-footer" style={{ marginTop: 'auto' }}>
                                        <span className="view-detail" onClick={() => handleViewDetail(cate)}>
                                            Xem chi tiết
                                        </span>
                                        <Button icon={<EditOutlined />} onClick={() => handleEdit(cate)}>
                                            Edit
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </div>

            <CateDetail
                open={openModal}
                onClose={() => setOpenModal(false)}
                category={selectedCate}
                categoryMap={categoryMap}
            />
            
            <CateCreate
                open={openCreateModal}
                onClose={(created) => {
                    setOpenCreateModal(false);
                    if (created) fetchAPI();
                }}
                parentCategories={parentCategories}
            />
            
            <CateUpdate
                open={openUpdateModal}
                category={selectedCate}
                onClose={(updated) => {
                    setOpenUpdateModal(false);
                    if (updated) fetchAPI();
                }} 
                parentCategories={parentCategories}
            />
        </div>
    );
}

export default CateList;