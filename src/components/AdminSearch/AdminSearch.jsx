import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeText(text = "") {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function AdminSearch() {
    const navigate = useNavigate();
    const [value, setValue] = useState("");

    const adminPages = [
        { label: "Trang chủ", path: "/admin", keywords: ["dashboard", "home", "trang chu"] },
        { label: "Người dùng", path: "/admin/user", keywords: ["user", "nguoi dung", "tai khoan"] },
        { label: "Phân quyền", path: "/admin/permission", keywords: ["permission", "phan quyen", "quyen"] },
        { label: "Vai trò", path: "/admin/role", keywords: ["role", "vai tro", "nhom quyen"] },
        { label: "Danh mục", path: "/admin/category", keywords: ["category", "danh muc", "loai"] },
        { label: "Sản phẩm", path: "/admin/product", keywords: ["product", "san pham", "hang hoa"] },
        { label: "Mã giảm giá", path: "/admin/coupon", keywords: ["coupon", "voucher", "ma giam gia", "giam gia"] },
        { label: "Đơn hàng", path: "/admin/order", keywords: ["order", "don hang", "hoa don"] },
        { label: "Kho hàng", path: "/admin/inventory-transaction", keywords: ["inventory", "kho", "phieu kho", "giao dich kho"] },
    ];

    const options = useMemo(() => {
        const keyword = normalizeText(value.trim());

        if (!keyword) {
            return adminPages.map((item) => ({
                value: item.label,
                label: (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <span>{item.label}</span>
                        <span style={{ color: "#999", fontSize: 12 }}>{item.path}</span>
                    </div>
                ),
                path: item.path,
            }));
        }

        return adminPages
            .filter((item) => {
                const labelMatch = normalizeText(item.label).includes(keyword);
                const keywordMatch = item.keywords.some((k) =>
                    normalizeText(k).includes(keyword)
                );
                return labelMatch || keywordMatch;
            })
            .map((item) => ({
                value: item.label,
                label: (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <span>{item.label}</span>
                        <span style={{ color: "#999", fontSize: 12 }}>{item.path}</span>
                    </div>
                ),
                path: item.path,
            }));
    }, [value]);

    const handleSelect = (_, option) => {
        setValue("");
        navigate(option.path);
    };

    const handlePressEnter = () => {
        if (!options.length) return;
        setValue("");
        navigate(options[0].path);
    };

    return (
        <AutoComplete
            value={value}
            options={options}
            style={{ width: "100%" }}
            onSelect={handleSelect}
            onSearch={setValue}
        >
            <Input
                size="large"
                prefix={<SearchOutlined />}
                placeholder="Tìm trang admin..."
                onPressEnter={handlePressEnter}
                allowClear
            />
        </AutoComplete>
    );
}

export default AdminSearch;