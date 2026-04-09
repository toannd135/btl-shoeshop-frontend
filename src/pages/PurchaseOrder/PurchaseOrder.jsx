import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  message,
  Modal,
  Form,
  DatePicker,
  Input as AntInput,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
} from "../../services/purchaseOrderService";
import { getAllSuppliers } from "../../services/supplierService";
import { ORDER_STATUS_META, getEnumMeta } from "../../utils/enumLabels";
import "./PurchaseOrder.css";

const { TextArea } = AntInput;

function PurchaseOrder() {
  const [loading, setLoading] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [sortValue, setSortValue] = useState("createdAt_desc");
  const [filterStatus, setFilterStatus] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
  });

  const [openModal, setOpenModal] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  const supplierMap = useMemo(() => {
    const map = {};
    suppliers.forEach((item) => {
      map[item.supplierId] = item.supplierName;
    });
    return map;
  }, [suppliers]);

  const fetchSuppliers = async () => {
    try {
      const res = await getAllSuppliers();
      const data = Array.isArray(res) ? res : res?.data || [];
      setSuppliers(data);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách nhà cung cấp");
    }
  };

  const fetchPurchaseOrders = async (
    page = pagination.page,
    size = pagination.size,
    sort = sortValue
  ) => {
    try {
      setLoading(true);

      const [sortBy, direction] = sort.split("_");

      const res = await getPurchaseOrders({
        page,
        size,
        sortBy,
        direction,
      });

      const data = res?.data || res || {};
      const items = Array.isArray(data?.items) ? data.items : [];

      setPurchaseOrders(items);
      setPagination({
        page: data?.page || page,
        size: data?.pageSize || size,
        total: data?.total || 0,
      });
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchPurchaseOrders(1, pagination.size, sortValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortValue]);

  const filteredData = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return purchaseOrders.filter((item) => {
      const poId = item.poId?.toLowerCase() || "";
      const supplierId = item.supplierId?.toLowerCase() || "";
      const supplierName = supplierMap[item.supplierId]?.toLowerCase() || "";
      const status = item.status?.toLowerCase() || "";
      const note = item.note?.toLowerCase() || "";

      const matchKeyword =
        !keyword ||
        poId.includes(keyword) ||
        supplierId.includes(keyword) ||
        supplierName.includes(keyword) ||
        status.includes(keyword) ||
        note.includes(keyword);

      const matchStatus = !filterStatus || item.status === filterStatus;

      return matchKeyword && matchStatus;
    });
  }, [purchaseOrders, searchText, supplierMap, filterStatus]);

  const renderStatusTag = (status) => {
    const meta = getEnumMeta(ORDER_STATUS_META, status);
    return <Tag color={meta.color}>{meta.label}</Tag>;
  };

  const handleOpenCreate = () => {
    setEditingPO(null);
    form.resetFields();
    form.setFieldsValue({
      status: "PENDING",
      supplierId: undefined,
      note: "",
      expectedDeliveryDate: null,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = async (record) => {
    try {
      setLoading(true);

      const res = await getPurchaseOrderById(record.poId);
      const data = res?.data || res || record;

      setEditingPO(data);

      form.setFieldsValue({
        supplierId: data.supplierId,
        note: data.note || "",
        status: data.status,
        expectedDeliveryDate: data.expectedDeliveryDate
          ? dayjs(data.expectedDeliveryDate)
          : null,
      });

      setOpenModal(true);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải chi tiết phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingPO(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        note: values.note || null,
        status: values.status,
        expectedDeliveryDate: values.expectedDeliveryDate
          ? values.expectedDeliveryDate.format("YYYY-MM-DDTHH:mm:ss")
          : null,
      };

      if (editingPO) {
        await updatePurchaseOrder(editingPO.poId, payload);
        message.success("Cập nhật phiếu nhập thành công");
      } else {
        await createPurchaseOrder(values.supplierId, payload);
        message.success("Tạo phiếu nhập thành công");
      }

      handleCloseModal();
      fetchPurchaseOrders(pagination.page, pagination.size, sortValue);
    } catch (error) {
      console.error(error);
      if (error?.errorFields) return;
      message.error("Không thể lưu phiếu nhập");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "poId",
      key: "poId",
      render: (id) => <span style={{ fontWeight: 600 }}>#{id?.split("-")[0]}</span>,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierId",
      key: "supplierId",
      render: (supplierId) => supplierMap[supplierId] || supplierId,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => renderStatusTag(status),
    },
    {
      title: "Ngày dự kiến",
      dataIndex: "expectedDeliveryDate",
      key: "expectedDeliveryDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm:ss") : "--"),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? new Date(date).toLocaleString("vi-VN") : "--"),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => (date ? new Date(date).toLocaleString("vi-VN") : "--"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => handleOpenEdit(record)}
            style={{
              border: "1px solid #6366f1",
              background: "white",
              color: "#6366f1",
              padding: "4px 8px",
              borderRadius: 6,
              cursor: "pointer",
            }}
            title="Xem / chỉnh sửa"
          >
            <EyeOutlined />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="purchase-order-container">
      <div className="purchase-order-header">
        <h2>Quản lý phiếu nhập</h2>
        <h5>
          <Link to="/admin">Dashboard</Link> / Phiếu nhập
        </h5>
      </div>

      <div className="purchase-order-bar">
        <div className="purchase-order-bar-left">
          <Input
            placeholder="Tìm mã phiếu, nhà cung cấp, trạng thái..."
            prefix={<SearchOutlined />}
            className="purchase-order-search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Select
            placeholder="Lọc trạng thái"
            allowClear
            className="purchase-order-arrange"
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            options={[
              { value: "PENDING", label: "Chờ xác nhận" },
              { value: "CONFIRMED", label: "Đã xác nhận" },
              { value: "SHIPPING", label: "Đang giao / Đang xử lý" },
              { value: "DELIVERED", label: "Đã giao / Đã nhập kho" },
              { value: "CANCELLED", label: "Đã hủy" },
              { value: "RETURNED", label: "Trả hàng" },
            ]}
          />

          <Select
            className="purchase-order-arrange"
            value={sortValue}
            onChange={setSortValue}
            options={[
              { value: "createdAt_desc", label: "Mới nhất" },
              { value: "createdAt_asc", label: "Cũ nhất" },
              { value: "updatedAt_desc", label: "Cập nhật mới nhất" },
              { value: "updatedAt_asc", label: "Cập nhật cũ nhất" },
            ]}
          />
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="purchase-order-create-btn"
          onClick={handleOpenCreate}
        >
          Tạo phiếu nhập
        </Button>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="poId"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.size,
          total: pagination.total,
          showSizeChanger: true,
        }}
        onChange={(paginationInfo) => {
          fetchPurchaseOrders(
            paginationInfo.current,
            paginationInfo.pageSize,
            sortValue
          );
        }}
      />

      <Modal
        title={editingPO ? "Cập nhật phiếu nhập" : "Tạo phiếu nhập"}
        open={openModal}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editingPO ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {!editingPO && (
            <Form.Item
              label="Nhà cung cấp"
              name="supplierId"
              rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
            >
              <Select
                placeholder="Chọn nhà cung cấp"
                options={suppliers.map((item) => ({
                  value: item.supplierId,
                  label: item.supplierName,
                }))}
              />
            </Form.Item>
          )}

          {editingPO && (
            <Form.Item label="Nhà cung cấp" name="supplierId">
              <Select
                disabled
                options={suppliers.map((item) => ({
                  value: item.supplierId,
                  label: item.supplierName,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={4} placeholder="Nhập ghi chú phiếu nhập" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              options={[
                { value: "PENDING", label: "Chờ xác nhận" },
                { value: "CONFIRMED", label: "Đã xác nhận" },
                { value: "SHIPPING", label: "Đang giao / Đang xử lý" },
                { value: "DELIVERED", label: "Đã giao / Đã nhập kho" },
                { value: "CANCELLED", label: "Đã hủy" },
                { value: "RETURNED", label: "Trả hàng" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Ngày dự kiến nhận hàng"
            name="expectedDeliveryDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày dự kiến nhận hàng" }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm:ss"
              style={{ width: "100%" }}
              placeholder="Chọn ngày dự kiến nhận hàng"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default PurchaseOrder;