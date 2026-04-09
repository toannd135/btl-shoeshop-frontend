import { useEffect, useMemo, useState } from "react";
import { Table, Input, Select, Button, Tag, Modal, Form, message } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
    getAllSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from "../../services/supplierService";
import "./Supplier.css";

function Supplier() {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);

    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);

    const [openModal, setOpenModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form] = Form.useForm();

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const res = await getAllSuppliers();
            setSuppliers(res.data || []);
        } catch (error) {
            console.error(error);
            message.error("Không thể tải danh sách nhà cung cấp");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const filteredSuppliers = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();

        return suppliers.filter((item) => {
            const supplierName = item.supplierName?.toLowerCase() || "";
            const phone = item.phone?.toLowerCase() || "";
            const email = item.email?.toLowerCase() || "";
            const address = item.address?.toLowerCase() || "";

            const matchKeyword =
                !keyword ||
                supplierName.includes(keyword) ||
                phone.includes(keyword) ||
                email.includes(keyword) ||
                address.includes(keyword);

            const matchStatus = !filterStatus || item.status === filterStatus;

            return matchKeyword && matchStatus;
        });
    }, [suppliers, searchText, filterStatus]);

    const renderStatusTag = (status) => {
        const colorMap = {
            ENABLED: "green",
            DISABLED: "red",
        };

        const labelMap = {
            ENABLED: "Đang hoạt động",
            DISABLED: "Ngưng hoạt động",
        };

        return <Tag color={colorMap[status] || "default"}>{labelMap[status] || status}</Tag>;
    };

    const handleOpenCreate = () => {
        setEditingSupplier(null);
        form.resetFields();
        form.setFieldsValue({
            status: "ENABLED",
        });
        setOpenModal(true);
    };

    const handleOpenEdit = (record) => {
        setEditingSupplier(record);
        form.setFieldsValue({
            supplierName: record.supplierName,
            address: record.address,
            email: record.email,
            phone: record.phone,
            status: record.status,
        });
        setOpenModal(true);
    };

    const handleDeleteSupplier = (record) => {
        Modal.confirm({
            title: "Xóa nhà cung cấp",
            content: `Bạn có chắc muốn xóa nhà cung cấp "${record.supplierName}" không?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await deleteSupplier(record.supplierId);
                    message.success("Xóa nhà cung cấp thành công");
                    fetchSuppliers();
                } catch (error) {
                    console.error(error);
                    message.error("Không thể xóa nhà cung cấp");
                }
            },
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            if (editingSupplier) {
                await updateSupplier(editingSupplier.supplierId, values);
                message.success("Cập nhật nhà cung cấp thành công");
            } else {
                await createSupplier(values);
                message.success("Tạo nhà cung cấp thành công");
            }

            setOpenModal(false);
            form.resetFields();
            fetchSuppliers();
        } catch (error) {
            console.error(error);
            if (error?.errorFields) return;
            message.error("Không thể lưu nhà cung cấp");
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: "Tên nhà cung cấp",
            dataIndex: "supplierName",
            key: "supplierName",
            render: (name) => <span style={{ fontWeight: 600 }}>{name}</span>,
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
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => renderStatusTag(status),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => handleOpenEdit(record)}
                        style={{
                            border: "1px solid #16a34a",
                            background: "white",
                            color: "#16a34a",
                            padding: "4px 8px",
                            borderRadius: 6,
                            cursor: "pointer",
                        }}
                        title="Chỉnh sửa"
                    >
                        <EditOutlined />
                    </button>

                    <button
                        onClick={() => handleDeleteSupplier(record)}
                        style={{
                            border: "1px solid #dc2626",
                            background: "white",
                            color: "#dc2626",
                            padding: "4px 8px",
                            borderRadius: 6,
                            cursor: "pointer",
                        }}
                        title="Xóa"
                    >
                        <DeleteOutlined />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="supplier-container">
            <div className="supplier-header">
                <h2>Quản lý nhà cung cấp</h2>
                <h5>
                    <Link to="/admin">Dashboard</Link> / Nhà cung cấp
                </h5>
            </div>

            <div className="supplier-bar">
                <div className="supplier-bar-left">
                    <Input
                        placeholder="Tìm tên, SĐT, email, địa chỉ..."
                        prefix={<SearchOutlined />}
                        className="supplier-search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                    <Select
                        placeholder="Lọc trạng thái"
                        allowClear
                        className="supplier-arrange"
                        value={filterStatus}
                        onChange={(value) => setFilterStatus(value)}
                        options={[
                            { value: "ENABLED", label: "Đang hoạt động" },
                            { value: "DISABLED", label: "Ngưng hoạt động" },
                        ]}
                    />
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="supplier-create-btn"
                    onClick={handleOpenCreate}
                >
                    Tạo nhà cung cấp
                </Button>
            </div>

            <Table
                dataSource={filteredSuppliers}
                columns={columns}
                rowKey="supplierId"
                loading={loading}
            />

            <Modal
                title={editingSupplier ? "Cập nhật nhà cung cấp" : "Tạo nhà cung cấp"}
                open={openModal}
                onCancel={() => setOpenModal(false)}
                onOk={handleSubmit}
                confirmLoading={submitting}
                okText={editingSupplier ? "Cập nhật" : "Tạo mới"}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên nhà cung cấp"
                        name="supplierName"
                        rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Vui lòng nhập email" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Trạng thái" name="status">
                        <Select
                            options={[
                                { value: "ENABLED", label: "Đang hoạt động" },
                                { value: "DISABLED", label: "Ngưng hoạt động" },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Supplier;