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
  InputNumber,
  Divider,
  Space,
  Popconfirm,
  Empty,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  changePurchaseOrderItem,
  deletePurchaseOrderItem,
} from "../../services/purchaseOrderService";
import { getAllSuppliers } from "../../services/supplierService";
import {
  getProductList,
  getProductVariants,
} from "../../services/productService";
import { ORDER_STATUS_META, getEnumMeta } from "../../utils/enumLabels";
import "./PurchaseOrder.css";

const { TextArea } = AntInput;

function PurchaseOrder() {
  const [loading, setLoading] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);

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

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemSubmitting, setItemSubmitting] = useState(false);
  const [itemForm] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm();

  const supplierMap = useMemo(() => {
    const map = {};
    suppliers.forEach((item) => {
      map[item.supplierId] = item;
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

  const fetchAllVariants = async () => {
    try {
      const productRes = await getProductList();
      const products = Array.isArray(productRes?.data) ? productRes.data : [];

      const variantResults = await Promise.allSettled(
        products.map(async (product) => {
          const productId =
            product?.productId || product?.id || product?._id || null;

          if (!productId) return [];

          const res = await getProductVariants(productId);
          const variants = Array.isArray(res?.data) ? res.data : [];

          return variants.map((variant) => ({
            value:
              variant?.productVariantId ||
              variant?.variantId ||
              variant?.id ||
              null,
            label: [
              product?.name || product?.productName || "Sản phẩm",
              variant?.size ? `- Size ${variant.size}` : "",
            ]
              .filter(Boolean)
              .join(" "),
            raw: {
              ...variant,
              productName: product?.name || product?.productName || "Sản phẩm",
            },
          }));
        })
      );

      const flattened = variantResults
        .filter((item) => item.status === "fulfilled")
        .flatMap((item) => item.value || [])
        .filter((item) => item?.value);

      const uniqueMap = new Map();
      flattened.forEach((item) => {
        if (!uniqueMap.has(item.value)) {
          uniqueMap.set(item.value, item);
        }
      });

      setVariantOptions(Array.from(uniqueMap.values()));
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách biến thể");
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
    fetchAllVariants();
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
      const supplierName = supplierMap[item.supplierId]?.supplierName?.toLowerCase() || "";
      const status = item.status?.toLowerCase() || "";

      const matchKeyword =
        !keyword ||
        poId.includes(keyword) ||
        supplierId.includes(keyword) ||
        supplierName.includes(keyword) ||
        status.includes(keyword);

      const matchStatus = !filterStatus || item.status === filterStatus;

      return matchKeyword && matchStatus;
    });
  }, [purchaseOrders, searchText, supplierMap, filterStatus]);

  const renderStatusTag = (status) => {
    const meta = getEnumMeta(ORDER_STATUS_META, status);
    return <Tag color={meta.color}>{meta.label}</Tag>;
  };

  const getVariantDetailById = (variantId) => {
    return variantOptions.find((item) => item.value === variantId)?.raw || null;
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
      console.log("PO detail:", data);

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

  const reloadEditingPO = async (poId = editingPO?.poId) => {
    if (!poId) return;
    const res = await getPurchaseOrderById(poId);
    const data = res?.data || res;
    setEditingPO(data);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingPO(null);
    form.resetFields();
    setItemModalOpen(false);
    setEditingItem(null);
    itemForm.resetFields();
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
        await reloadEditingPO(editingPO.poId);
      } else {
        await createPurchaseOrder(values.supplierId, payload);
        message.success("Tạo phiếu nhập thành công");
        handleCloseModal();
      }

      fetchPurchaseOrders(pagination.page, pagination.size, sortValue);
    } catch (error) {
      console.error(error);
      if (error?.errorFields) return;
      message.error(error?.response?.data?.message || "Không thể lưu phiếu nhập");
    } finally {
      setSubmitting(false);
    }
  };

  const canEditItems = useMemo(() => {
    if (!editingPO?.status) return false;
    return !["DELIVERED", "CANCELLED"].includes(editingPO.status);
  }, [editingPO]);

  const supplierVariantsForEditingPO = useMemo(() => {
    if (!editingPO?.supplierId) return [];

    const supplier = supplierMap[editingPO.supplierId];
    const variants = supplier?.variants || [];

    return variants.map((item) => {
      const detail = getVariantDetailById(item.variantId);
      return {
        value: item.variantId,
        label: `${detail?.productName || "Sản phẩm"}${item.size ? ` - Size ${item.size}` : ""}`,
        raw: {
          ...item,
          productName: detail?.productName || "Sản phẩm",
        },
      };
    });
  }, [editingPO, supplierMap, variantOptions]);

  const handleOpenAddItem = () => {
    if (!editingPO?.poId) {
      message.warning("Hãy tạo hoặc lưu phiếu nhập trước");
      return;
    }

    setEditingItem(null);
    itemForm.resetFields();
    itemForm.setFieldsValue({
      variantId: undefined,
      quantity: 1,
    });
    setItemModalOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    itemForm.resetFields();
    itemForm.setFieldsValue({
      variantId: item.variantId,
      quantity: item.quantity,
    });
    setItemModalOpen(true);
  };

  const handleSubmitItem = async () => {
    try {
      const values = await itemForm.validateFields();
      setItemSubmitting(true);

      if (!editingPO?.poId) {
        message.error("Không tìm thấy phiếu nhập");
        return;
      }

      if (editingItem) {
        const delta = Number(values.quantity) - Number(editingItem.quantity);

        if (delta !== 0) {
          await changePurchaseOrderItem(editingPO.poId, {
            variantId: editingItem.variantId,
            quantity: delta,
          });
        }

        message.success("Cập nhật item thành công");
      } else {
        await changePurchaseOrderItem(editingPO.poId, {
          variantId: values.variantId,
          quantity: values.quantity,
        });
        message.success("Thêm item thành công");
      }

      setItemModalOpen(false);
      setEditingItem(null);
      itemForm.resetFields();

      await reloadEditingPO(editingPO.poId);
      fetchPurchaseOrders(pagination.page, pagination.size, sortValue);
    } catch (error) {
      console.error(error);
      if (error?.errorFields) return;
      message.error(error?.response?.data?.message || "Không thể lưu item");
    } finally {
      setItemSubmitting(false);
    }
  };

  const handleDeleteItem = async (variantId) => {
    try {
      await deletePurchaseOrderItem(editingPO.poId, variantId);
      message.success("Xóa item thành công");
      await reloadEditingPO(editingPO.poId);
      fetchPurchaseOrders(pagination.page, pagination.size, sortValue);
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Không thể xóa item");
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
      render: (supplierId) => supplierMap[supplierId]?.supplierName || supplierId,
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
      width: 100,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => handleOpenEdit(record)}
            className="purchase-order-view-btn"
            title="Xem / chỉnh sửa"
          >
            <EyeOutlined />
          </button>
        </div>
      ),
    },
  ];

  const itemColumns = [
    {
      title: "Sản phẩm",
      key: "variantName",
      render: (_, item) => {
        const detail = getVariantDetailById(item.variantId);
        return (
          <div className="po-item-name">
            {detail?.productName || item.variantId}
          </div>
        );
      },
    },
    {
      title: "Màu",
      dataIndex: "variantId",
      key: "color",
      width: 90,
      align: "center",
      render: (_, item) => {
        const detail = getVariantDetailById(item.variantId);
        return (
          <div className="po-item-color-cell">
            <span
              className="po-item-color-dot"
              style={{ backgroundColor: detail?.color || "#d1d5db" }}
              title={detail?.color || ""}
            />
          </div>
        );
      },
    },
    {
      title: "Size",
      dataIndex: "variantId",
      key: "size",
      width: 90,
      align: "center",
      render: (_, item) => {
        const detail = getVariantDetailById(item.variantId);
        return detail?.size ?? "-";
      },
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: 90,
      align: "center",
    },
    {
      title: "Giá nhập",
      dataIndex: "cost",
      key: "cost",
      width: 140,
      align: "center",
      render: (cost) =>
        cost !== null && cost !== undefined
          ? `${Number(cost).toLocaleString("vi-VN")} đ`
          : "-",
    },
    {
      title: "Hành động",
      key: "actions",
      width: 110,
      align: "center",
      render: (_, item) => (
        <Space>
          <Tooltip title="Sửa số lượng">
            <Button
              size="small"
              icon={<EditOutlined />}
              disabled={!canEditItems}
              onClick={() => handleOpenEditItem(item)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa item khỏi phiếu nhập?"
            onConfirm={() => handleDeleteItem(item.variantId)}
            okText="Xóa"
            cancelText="Hủy"
            disabled={!canEditItems}
          >
            <Tooltip title="Xóa">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={!canEditItems}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
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
        width={950}
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

        {editingPO && (
          <>
            <Divider />
            <div className="po-item-section">
              <div className="po-item-header">
                <h3>Danh sách item</h3>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleOpenAddItem}
                  disabled={!canEditItems}
                >
                  Thêm item
                </Button>
              </div>

              <Table
                dataSource={editingPO.items || []}
                columns={itemColumns}
                rowKey={(record) => record.variantId}
                pagination={false}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Phiếu nhập chưa có item nào"
                    />
                  ),
                }}
              />
            </div>
          </>
        )}
      </Modal>

      <Modal
        title={editingItem ? "Cập nhật item" : "Thêm item vào phiếu nhập"}
        open={itemModalOpen}
        onCancel={() => {
          setItemModalOpen(false);
          setEditingItem(null);
          itemForm.resetFields();
        }}
        onOk={handleSubmitItem}
        confirmLoading={itemSubmitting}
        okText={editingItem ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={itemForm} layout="vertical">
          <Form.Item
            label="Biến thể"
            name="variantId"
            rules={[{ required: true, message: "Vui lòng chọn biến thể" }]}
          >
            <Select
              showSearch
              disabled={!!editingItem}
              placeholder="Chọn biến thể từ nhà cung cấp"
              options={supplierVariantsForEditingPO}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber
              min={1}
              precision={0}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default PurchaseOrder;