import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Checkbox, Select, Pagination, Button, Tag, Typography, message, Divider, Empty } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { getProductList, getProductVariants } from "../../services/productService";
import { getCateList } from "../../services/cateService";
import { getCouponList } from "../../services/couponService";
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const ProductsPage = () => {
    // --- 1. STATES LƯU TRỮ DỮ LIỆU TỪ API ---
    const [allProducts, setAllProducts] = useState([]); // Chứa TẤT CẢ sản phẩm gốc
    const [categories, setCategories] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [dynamicBrands, setDynamicBrands] = useState([]);
    const [showAllBrands, setShowAllBrands] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const DISPLAY_LIMIT = 5;

    // --- 2. STATES CHO BỘ LỌC, SẮP XẾP & PHÂN TRANG ---
    const [filters, setFilters] = useState({
        price: [],
        brands: [],
        categories: [],
        gender: []
    });
    const [sortOption, setSortOption] = useState('default');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12; // Hiển thị 12 sản phẩm / 1 trang (3 dòng)

    // Cấu hình dữ liệu cứng cho các bộ lọc
    const priceRanges = [
        { label: 'Giá dưới 1.000.000đ', value: '0-1000000' },
        { label: '1.000.000đ - 2.000.000đ', value: '1000000-2000000' },
        { label: '2.000.000đ - 3.000.000đ', value: '2000000-3000000' },
        { label: '3.000.000đ - 5.000.000đ', value: '3000000-5000000' },
        { label: '5.000.000đ - 7.000.000đ', value: '5000000-7000000' },
        { label: 'Giá trên 10.000.000đ', value: '10000000-999999999' }
    ];

    const genders = [
        { label: 'Nam', value: 'MALE' },
        { label: 'Nữ', value: 'FEMALE' },
        { label: 'Khác', value: 'OTHER' }
    ];

    // --- 3. GỌI API ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, cateRes, coupRes] = await Promise.all([
                    getProductList(),
                    getCateList(),
                    getCouponList()
                ]);

                const rawProducts = prodRes?.data || prodRes || [];
                setCategories(cateRes?.data || cateRes || []);
                setCoupons(coupRes?.data || coupRes || []);

                const brands = [...new Set(rawProducts.map(p => p.brand).filter(Boolean))];
                setDynamicBrands(brands);

                // Fetch variants gộp vào product
                const productsWithVariants = await Promise.all(
                    rawProducts.map(async (product) => {
                        try {
                            const variantRes = await getProductVariants(product.productId);
                            const variants = variantRes?.data || variantRes || [];
                            let minPrice = 0;
                            let colors = [];
                            if (variants.length > 0) {
                                minPrice = Math.min(...variants.map(v => v.basePrice));
                                colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
                            }
                            return { ...product, minPrice, colors };
                        } catch (err) {
                            return { ...product, minPrice: 0, colors: [] };
                        }
                    })
                );
                // Lưu vào allProducts (danh sách gốc không bao giờ bị thay đổi)
                setAllProducts(productsWithVariants);

            } catch (error) {
                message.error("Lỗi khi tải dữ liệu từ API!");
            }
        };
        fetchData();
    }, []);

    // --- 4. LOGIC LỌC & SẮP XẾP (Chạy tự động mỗi khi filter, sort, hoặc data thay đổi) ---
    const processedProducts = useMemo(() => {
        let result = [...allProducts];

        // Lọc theo khoảng giá
        if (filters.price.length > 0) {
            result = result.filter(p => {
                return filters.price.some(range => {
                    const [min, max] = range.split('-');
                    return p.minPrice >= Number(min) && p.minPrice <= Number(max);
                });
            });
        }

        // Lọc theo Hãng
        if (filters.brands.length > 0) {
            result = result.filter(p => filters.brands.includes(p.brand));
        }

        // Lọc theo Loại sản phẩm
        if (filters.categories.length > 0) {
            result = result.filter(p => filters.categories.includes(p.categoryId));
        }

        // Lọc theo Giới tính
        if (filters.gender.length > 0) {
            result = result.filter(p => filters.gender.includes(p.gender));
        }

        // Sắp xếp
        switch (sortOption) {
            case 'price_asc':
                result.sort((a, b) => a.minPrice - b.minPrice);
                break;
            case 'price_desc':
                result.sort((a, b) => b.minPrice - a.minPrice);
                break;
            case 'name_asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name_desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            default:
                break; // Mặc định giữ nguyên gốc
        }

        return result;
    }, [allProducts, filters, sortOption]);

    // Khi bộ lọc hoặc sắp xếp thay đổi -> tự động đưa người dùng về trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortOption]);

    // Cắt mảng sản phẩm theo trang hiện tại để hiển thị
    const currentProducts = processedProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // --- 5. CÁC HÀM TIỆN ÍCH UI ---
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success(`Đã sao chép mã: ${text}`);
    };

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getBestCoupon = (price) => {
        if (!coupons || coupons.length === 0) return null;

        const validCoupons = coupons.filter(c =>
            price >= Number(c.minOrderValue) &&
            new Date(c.expiresAt) > new Date()
        );

        if (validCoupons.length === 0) return null;

        let bestCoupon = null;
        let bestDiscount = 0;

        validCoupons.forEach(c => {
            let discount = 0;

            if (c.discountType === "PERCENTAGE") {
                discount = price * (Number(c.discountValue) / 100);

                if (c.maxDiscount) {
                    discount = Math.min(discount, Number(c.maxDiscount));
                }
            } else {
                discount = Number(c.discountValue);
            }

            if (discount > bestDiscount) {
                bestDiscount = discount;
                bestCoupon = c;
            }
        });

        if (!bestCoupon) return null;

        return {
            coupon: bestCoupon,
            discount: bestDiscount,
            finalPrice: price - bestDiscount
        };
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 15px' }}>
            <Text type="secondary" style={{ marginBottom: 30, display: 'block' }}>
                <Link to="/">Trang chủ</Link> / Tất cả sản phẩm
            </Text>

            {/* VOUCHER SECTION */}
            <div style={{ marginBottom: 50 }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
                    Voucher <span style={{ color: '#ff4d4f', fontWeight: 'normal' }}>giảm giá</span>
                </Title>
                <Row gutter={[20, 20]}>
                    {coupons.map((coupon) => (
                        <Col span={6} xs={24} sm={12} lg={6} key={coupon.couponId}>
                            <Card
                                hoverable
                                style={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: '#f0f0f0' }}
                                bodyStyle={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}
                            >
                                <div style={{ flex: 1 }}>
                                    <Tag color="volcano" style={{ marginBottom: 12, fontWeight: 'bold' }}>{coupon.code}</Tag>
                                    <Title level={4} style={{ marginTop: 0 }}>{coupon.code}</Title>
                                    <Paragraph type="secondary" style={{ fontSize: 13 }}>
                                        {coupon.discountType === 'PERCENTAGE'
                                            ? `Giảm ${coupon.discountValue}%`
                                            : `Giảm ${formatPrice(coupon.discountValue)}`}{" "}
                                        cho đơn tối thiểu {formatPrice(coupon.minOrderValue)}.
                                    </Paragraph>
                                </div>
                                <div>
                                    <Divider dashed style={{ margin: '12px 0' }} />
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 10 }}>
                                        HSD: {new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}
                                    </Text>
                                    <Button
                                        type="primary"
                                        icon={<CopyOutlined />}
                                        block
                                        style={{ background: '#222', borderColor: '#222' }}
                                        onClick={() => copyToClipboard(coupon.code)}
                                    >
                                        Sao chép mã
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* MAIN CONTENT: Sidebar + Products */}
            <Row gutter={40}>

                {/* SIDEBAR BỘ LỌC */}
                <Col span={6}>
                    {/* Lọc: Khoảng Giá */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={5}>Mức giá</Title>
                        <Checkbox.Group
                            options={priceRanges}
                            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                            onChange={(checkedValues) => setFilters({ ...filters, price: checkedValues })}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <Title level={5}>Hãng sản xuất</Title>
                        <Checkbox.Group
                            options={showAllBrands ? dynamicBrands : dynamicBrands.slice(0, DISPLAY_LIMIT)}
                            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                            onChange={(checkedValues) => setFilters({ ...filters, brands: checkedValues })}
                        />
                        {dynamicBrands.length > DISPLAY_LIMIT && (
                            <Button
                                type="link"
                                style={{ padding: 0, marginTop: 10, fontSize: 13, color: '#1890ff' }}
                                onClick={() => setShowAllBrands(!showAllBrands)}
                            >
                                {showAllBrands ? 'Thu gọn' : `Xem thêm (${dynamicBrands.length - DISPLAY_LIMIT})`}
                            </Button>
                        )}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <Title level={5}>Loại sản phẩm</Title>
                        <Checkbox.Group
                            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                            onChange={(checkedValues) => setFilters({ ...filters, categories: checkedValues })}
                        >
                            {(showAllCategories ? categories : categories.slice(0, DISPLAY_LIMIT)).map(cate => (
                                <Checkbox key={cate.categoryId} value={cate.categoryId}>{cate.categoryName}</Checkbox>
                            ))}

                        </Checkbox.Group>
                        {categories.length > DISPLAY_LIMIT && (
                            <Button
                                type="link"
                                style={{ padding: 0, marginTop: 10, fontSize: 13, color: '#1890ff' }}
                                onClick={() => setShowAllCategories(!showAllCategories)}
                            >
                                {showAllCategories ? 'Thu gọn' : `Xem thêm (${categories.length - DISPLAY_LIMIT})`}
                            </Button>
                        )}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <Title level={5}>Giới tính</Title>
                        <Checkbox.Group
                            options={genders}
                            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                            onChange={(checkedValues) => setFilters({ ...filters, gender: checkedValues })}
                        />
                    </div>
                </Col>

                {/* KHU VỰC HIỂN THỊ SẢN PHẨM */}
                <Col span={18}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Title level={3} style={{ margin: 0 }}>Tất cả sản phẩm</Title>
                        <div>
                            <Text type="secondary" style={{ marginRight: 8 }}>Sắp xếp:</Text>
                            <Select
                                value={sortOption}
                                onChange={(value) => setSortOption(value)}
                                style={{ width: 180 }}
                            >
                                <Select.Option value="default">Mặc định</Select.Option>
                                <Select.Option value="price_asc">Giá: Thấp đến Cao</Select.Option>
                                <Select.Option value="price_desc">Giá: Cao đến Thấp</Select.Option>
                                <Select.Option value="name_asc">Tên: A - Z</Select.Option>
                                <Select.Option value="name_desc">Tên: Z - A</Select.Option>
                                <Select.Option value="newest">Thời gian: Mới nhất</Select.Option>
                                <Select.Option value="oldest">Thời gian: Cũ nhất</Select.Option>
                            </Select>
                        </div>
                    </div>

                    {/* PRODUCT GRID */}
                    {currentProducts.length > 0 ? (
                        <Row gutter={[16, 24]}>
                            {currentProducts.map(product => {
                                const discountInfo = getBestCoupon(product.minPrice);
                                return (
                                    <Col span={6} key={product.productId}>
                                        <Link to={`/productDetail/${product.productId}`}>
                                            <Card
                                                hoverable
                                                cover={
                                                    // Bỏ padding, thêm overflow hidden để ảnh không bị tràn góc bo
                                                    <div style={{ background: '#f6f6f6', aspectRatio: '1/1', overflow: 'hidden', position: "relative" }}>
                                                        {discountInfo && (
                                                            <div style={{
                                                                position: "absolute",
                                                                top: 8,
                                                                left: 8,
                                                                background: "#ff4d4f",
                                                                color: "white",
                                                                padding: "2px 6px",
                                                                fontSize: 12,
                                                                fontWeight: 600,
                                                                borderRadius: 4,
                                                                zIndex: 2
                                                            }}>
                                                                {discountInfo.coupon.discountType === "PERCENTAGE"
                                                                    ? `-${discountInfo.coupon.discountValue}%`
                                                                    : `-${formatPrice(discountInfo.coupon.discountValue)}`
                                                                }
                                                            </div>
                                                        )}
                                                        <img
                                                            alt={product.name}
                                                            src={product.imageUrl}
                                                            // Đổi objectFit thành cover và set 100% để ảnh lấp đầy khung
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                }
                                                // Giảm padding tổng thể để box trông gọn hơn
                                                bodyStyle={{ padding: '8px 10px' }}
                                            >
                                                {/* Brand: Thêm display block và ép margin bottom nhỏ lại */}
                                                <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                                                    {product.brand}
                                                </Text>

                                                {/* Tên SP: Bỏ margin top, ép margin bottom xuống còn 6px */}
                                                <Paragraph ellipsis={{ rows: 2 }} style={{ margin: "2px 0 4px 0", fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>
                                                    {product.name}
                                                </Paragraph>

                                                {/* Bọc Giá và Màu chung 1 div flex để chúng nằm ngang hàng nhau */}
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "1fr auto",
                                                        gridTemplateRows: "auto auto",
                                                        columnGap: 8,
                                                        rowGap: 1,
                                                        alignItems: "center",
                                                        marginTop: -2
                                                    }}
                                                >

                                                    {/* GIÁ SAU KHI GIẢM */}
                                                    <div style={{ color: "#f53d2d", fontWeight: "bold", fontSize: 14 }}>
                                                        {discountInfo
                                                            ? formatPrice(discountInfo.finalPrice)
                                                            : (product.minPrice > 0 ? formatPrice(product.minPrice) : "Đang cập nhật")}
                                                    </div>

                                                    {/* MÀU HÀNG 1 */}
                                                    <div
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns: "repeat(4, 14px)",
                                                            gap: 4
                                                        }}
                                                    >
                                                        {product.colors?.slice(0, 4).map((colorStr, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{
                                                                    width: 14,
                                                                    height: 14,
                                                                    borderRadius: "50%",
                                                                    border: "1px solid #ddd",
                                                                    backgroundColor: colorStr
                                                                }}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* GIÁ CŨ */}
                                                    {discountInfo && (
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                textDecoration: "line-through",
                                                                color: "#999"
                                                            }}
                                                        >
                                                            {formatPrice(product.minPrice)}
                                                        </div>
                                                    )}

                                                    {/* MÀU HÀNG 2 */}
                                                    <div
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns: "repeat(4, 14px)",
                                                            gap: 4
                                                        }}
                                                    >
                                                        {product.colors?.slice(4, 8).map((colorStr, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{
                                                                    width: 14,
                                                                    height: 14,
                                                                    borderRadius: "50%",
                                                                    border: "1px solid #ddd",
                                                                    backgroundColor: colorStr
                                                                }}
                                                            />
                                                        ))}
                                                    </div>

                                                </div>
                                            </Card>
                                        </Link>
                                    </Col>
                                )
                            })}
                        </Row>
                    ) : (
                        <div style={{ padding: '50px 0', textAlign: 'center' }}>
                            <Empty description="Không tìm thấy sản phẩm nào phù hợp" />
                        </div>
                    )}

                    {/* PHÂN TRANG: Tự động tính tổng dựa trên số sản phẩm sau khi lọc */}
                    {processedProducts.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: 40 }}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={processedProducts.length}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default ProductsPage;