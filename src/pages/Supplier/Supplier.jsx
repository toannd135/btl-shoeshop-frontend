import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Modal,
  Form,
  InputNumber,
  message,
  Space,
  Typography,
  Divider,
  Popconfirm,
  Empty,
  Tooltip
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addSupplierVariant,
  updateSupplierVariant,
  deleteSupplierVariant,
} from "../../services/supplierService";

import {
  getProductList,
  getProductVariants,
} from "../../services/productService";

import "./Supplier.css";

const { Text } = Typography;

function Supplier() {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);

  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [submittingSupplier, setSubmittingSupplier] = useState(false);

  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [submittingVariant, setSubmittingVariant] = useState(false);

  const [variantOptions, setVariantOptions] = useState([]);
  const [loadingVariantOptions, setLoadingVariantOptions] = useState(false);

  const [supplierForm] = Form.useForm();
  const [variantForm] = Form.useForm();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await getAllSuppliers();
      setSuppliers(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVariants = async () => {
    try {
      setLoadingVariantOptions(true);

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
              product?.productName || product?.name || "Sản phẩm",
              variant?.sku ? `- SKU: ${variant.sku}` : "",
              variant?.color ? `- Màu: ${variant.color}` : "",
              variant?.size !== undefined && variant?.size !== null
                ? `- Size: ${variant.size}`
                : "",
            ]
              .filter(Boolean)
              .join(" "),
            raw: {
              ...variant,
              productName: product?.productName || product?.name || "Sản phẩm",
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
      message.error("Không thể tải danh sách biến thể sản phẩm");
    } finally {
      setLoadingVariantOptions(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchAllVariants();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return suppliers.filter((item) => {
      const supplierName = item?.supplierName?.toLowerCase() || "";
      const phone = item?.phone?.toLowerCase() || "";
      const email = item?.email?.toLowerCase() || "";
      const address = item?.address?.toLowerCase() || "";

      const matchKeyword =
        !keyword ||
        supplierName.includes(keyword) ||
        phone.includes(keyword) ||
        email.includes(keyword) ||
        address.includes(keyword);

      const matchStatus = !filterStatus || item?.status === filterStatus;

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

    return (
      <Tag color={colorMap[status] || "default"}>
        {labelMap[status] || status || "Không xác định"}
      </Tag>
    );
  };

  const handleOpenCreateSupplier = () => {
    setEditingSupplier(null);
    supplierForm.resetFields();
    supplierForm.setFieldsValue({
      status: "ENABLED",
    });
    setOpenSupplierModal(true);
  };

  const handleOpenEditSupplier = (record) => {
    setEditingSupplier(record);
    supplierForm.setFieldsValue({
      supplierName: record?.supplierName,
      address: record?.address,
      email: record?.email,
      phone: record?.phone,
      status: record?.status || "ENABLED",
    });
    setOpenSupplierModal(true);
  };

  const handleDeleteSupplier = (record) => {
    Modal.confirm({
      title: "Xóa nhà cung cấp",
      content: `Bạn có chắc muốn xóa nhà cung cấp "${record?.supplierName}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteSupplier(record?.supplierId);
          message.success("Xóa nhà cung cấp thành công");
          fetchSuppliers();
        } catch (error) {
          console.error(error);
          message.error("Không thể xóa nhà cung cấp");
        }
      },
    });
  };

  const handleSubmitSupplier = async () => {
    try {
      const values = await supplierForm.validateFields();
      setSubmittingSupplier(true);

      if (editingSupplier) {
        await updateSupplier(editingSupplier.supplierId, values);
        message.success("Cập nhật nhà cung cấp thành công");
      } else {
        await createSupplier(values);
        message.success("Tạo nhà cung cấp thành công");
      }

      setOpenSupplierModal(false);
      supplierForm.resetFields();
      fetchSuppliers();
    } catch (error) {
      console.error(error);
      if (error?.errorFields) return;
      message.error("Không thể lưu nhà cung cấp");
    } finally {
      setSubmittingSupplier(false);
    }
  };

  const handleOpenAddVariant = (supplier) => {
    setSelectedSupplier(supplier);
    setEditingVariant(null);

    variantForm.resetFields();
    variantForm.setFieldsValue({
      cost: null,
      note: "",
      variantId: undefined,
    });

    setOpenVariantModal(true);
  };

  const handleOpenEditVariant = (supplier, variant) => {
    setSelectedSupplier(supplier);
    setEditingVariant(variant);

    variantForm.resetFields();
    variantForm.setFieldsValue({
      variantId: variant?.variantId,
      cost: variant?.cost ?? null,
      note: variant?.note || "",
    });

    setOpenVariantModal(true);
  };

  const handleDeleteVariant = async (supplierId, variantId) => {
    try {
      await deleteSupplierVariant(supplierId, variantId);
      message.success("Xóa biến thể khỏi nhà cung cấp thành công");
      fetchSuppliers();
    } catch (error) {
      console.error(error);
      message.error("Không thể xóa biến thể");
    }
  };

  const handleSubmitVariant = async () => {
    try {
      const values = await variantForm.validateFields();

      if (!selectedSupplier?.supplierId) {
        message.error("Chưa xác định nhà cung cấp");
        return;
      }

      setSubmittingVariant(true);

      if (editingVariant) {
        await updateSupplierVariant(
          selectedSupplier.supplierId,
          editingVariant.variantId,
          {
            cost: values.cost,
            note: values.note,
          }
        );
        message.success("Cập nhật biến thể nhà cung cấp thành công");
      } else {
        await addSupplierVariant(selectedSupplier.supplierId, {
          variantId: values.variantId,
          cost: values.cost,
          note: values.note,
        });
        message.success("Thêm biến thể cho nhà cung cấp thành công");
      }

      setOpenVariantModal(false);
      variantForm.resetFields();
      fetchSuppliers();
    } catch (error) {
      console.error(error);
      if (error?.errorFields) return;
      message.error("Không thể lưu biến thể");
    } finally {
      setSubmittingVariant(false);
    }
  };

  const supplierColumns = [
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierName",
      key: "supplierName",
      render: (name) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <div className="supplier-email-cell">{email}</div>,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => <div className="supplier-address-cell">{address}</div>,
    },
    {
      title: "Số sản phẩm",
      key: "variantCount",
      width: 110,
      align: "center",
      render: (_, record) => (
        <span className="supplier-variant-count">
          {record?.variants?.length || 0}
        </span>
      ),
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
      width: 150,
      render: (_, record) => (
        <div className="supplier-action-group">
          <Tooltip title="Quản lý variant">
            <Button
              className="supplier-icon-btn"
              icon={<AppstoreAddOutlined />}
              onClick={() => handleOpenAddVariant(record)}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              className="supplier-icon-btn"
              icon={<EditOutlined />}
              onClick={() => handleOpenEditSupplier(record)}
            />
          </Tooltip>

          <Tooltip title="Xóa">
            <Button
              danger
              className="supplier-icon-btn"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSupplier(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const renderVariantTable = (supplier) => {
    const variants = Array.isArray(supplier?.variants) ? supplier.variants : [];

    if (!variants.length) {
      return (
        <div style={{ padding: 12 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nhà cung cấp này chưa có biến thể nào"
          >
            <Button type="primary" onClick={() => handleOpenAddVariant(supplier)}>
              Thêm biến thể
            </Button>
          </Empty>
        </div>
      );
    }

    const columns = [
      {
        title: "Tên sản phẩm",
        key: "variantName",
        render: (_, variant) => {
          const detail = getVariantDetailById(variant?.variantId);
          return (
            <div className="supplier-variant-name">
              {detail?.productName || variant?.variantId || "-"}
            </div>
          );
        },
      },
      {
        title: "Màu sắc",
        dataIndex: "color",
        key: "color",
        width: 120,
        align: "center",
        render: (color) => (
          <div className="variant-color-cell">
            <span
              className="variant-color-dot"
              style={{ backgroundColor: color || "#d1d5db" }}
              title={color || ""}
            />
          </div>
        ),
      },
      {
        title: "Size",
        dataIndex: "size",
        key: "size",
        width: 100,
        align: "center",
        render: (size) => (size ?? "-"),
      },
      {
        title: "Giá nhập",
        dataIndex: "cost",
        key: "cost",
        width: 160,
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
        render: (_, variant) => (
          <div className="variant-action-group">
            <Tooltip title="Sửa">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleOpenEditVariant(supplier, variant)}
              />
            </Tooltip>

            <Popconfirm
              title="Xóa biến thể"
              description="Bạn có chắc muốn xóa biến thể này khỏi nhà cung cấp?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() =>
                handleDeleteVariant(supplier?.supplierId, variant?.variantId)
              }
            >
              <Tooltip title="Xóa">
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return (
      <div className="supplier-variant-table">
        <div className="supplier-variant-header">
          <span>Danh sách biến thể đang cung cấp</span>
          <Button type="primary" onClick={() => handleOpenAddVariant(supplier)}>
            Thêm biến thể
          </Button>
        </div>

        <Table
          dataSource={variants}
          columns={columns}
          rowKey={(record) => record.variantId}
          pagination={false}
          size="small"
        />
      </div>
    );
  };

  const usedVariantIdsOfSelectedSupplier = useMemo(() => {
    if (!selectedSupplier?.variants) return [];

    return selectedSupplier.variants
      .map((item) => item?.variantId)
      .filter(Boolean);
  }, [selectedSupplier]);

  const selectableVariantOptions = useMemo(() => {
    if (editingVariant) return variantOptions;

    return variantOptions.filter(
      (item) => !usedVariantIdsOfSelectedSupplier.includes(item.value)
    );
  }, [variantOptions, usedVariantIdsOfSelectedSupplier, editingVariant]);

  const getVariantDetailById = (variantId) => {
    return variantOptions.find((item) => item.value === variantId)?.raw || null;
  };

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
            allowClear
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
          onClick={handleOpenCreateSupplier}
        >
          Tạo nhà cung cấp
        </Button>
      </div>

      <Table
        dataSource={filteredSuppliers}
        columns={supplierColumns}
        rowKey="supplierId"
        loading={loading}
        expandable={{
          expandedRowRender: (record) => renderVariantTable(record),
          rowExpandable: () => true,
        }}
      />

      <Modal
        title={editingSupplier ? "Cập nhật nhà cung cấp" : "Tạo nhà cung cấp"}
        open={openSupplierModal}
        onCancel={() => setOpenSupplierModal(false)}
        onOk={handleSubmitSupplier}
        confirmLoading={submittingSupplier}
        okText={editingSupplier ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={supplierForm} layout="vertical">
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
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
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

      <Modal
        title={
          editingVariant
            ? `Cập nhật biến thể - ${selectedSupplier?.supplierName || ""}`
            : `Thêm biến thể - ${selectedSupplier?.supplierName || ""}`
        }
        open={openVariantModal}
        onCancel={() => setOpenVariantModal(false)}
        onOk={handleSubmitVariant}
        confirmLoading={submittingVariant}
        okText={editingVariant ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={variantForm} layout="vertical">
          <Form.Item
            label="Biến thể sản phẩm"
            name="variantId"
            rules={
              editingVariant
                ? []
                : [{ required: true, message: "Vui lòng chọn biến thể" }]
            }
          >
            <Select
              showSearch
              disabled={!!editingVariant}
              loading={loadingVariantOptions}
              placeholder="Chọn biến thể sản phẩm"
              options={selectableVariantOptions}
              optionFilterProp="label"
              notFoundContent="Không có biến thể phù hợp"
            />
          </Form.Item>

          <Form.Item
            label="Giá nhập"
            name="cost"
            rules={[{ required: true, message: "Vui lòng nhập giá nhập" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={0}
              placeholder="Nhập giá nhập"
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có" />
          </Form.Item>

          {!!editingVariant && (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <div style={{ fontSize: 13, color: "#666" }}>
                {(() => {
                  const detail = getVariantDetailById(editingVariant?.variantId);

                  return (
                    <div style={{ fontSize: 13, color: "#666" }}>
                      <div>
                        <strong>Tên sản phẩm:</strong> {detail?.productName || "-"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong>Màu:</strong>
                        <span
                          className="variant-color-dot"
                          style={{ backgroundColor: editingVariant?.color || "#d1d5db" }}
                        />
                      </div>
                      <div>
                        <strong>Size:</strong> {editingVariant?.size ?? "-"}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default Supplier;