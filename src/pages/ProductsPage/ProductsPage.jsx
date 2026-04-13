import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Checkbox, Select, Pagination, Button, Tag, Typography, message, Divider, Empty } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { getProductList, getProductVariants } from "../../services/productService";
import { getCateList } from "../../services/cateService";
import { getCouponList } from "../../services/couponService";
import { Link, useSearchParams } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const ProductsPage = () => {
    
    const [searchParams] = useSearchParams();
    const brandFilter = searchParams.get('brand');
    const categoryFilter = searchParams.get('categoryId');
    const genderFilter = searchParams.get('gender');

    // --- 1. STATES LƯU TRỮ DỮ LIỆU TỪ API ---
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [coupons, setCoupons] = useState([]);

    // States cho các danh sách filter động
    const [dynamicBrands, setDynamicBrands] = useState([]);
    const [dynamicColors, setDynamicColors] = useState([]); // THÊM MỚI
    const [dynamicSizes, setDynamicSizes] = useState([]);   // THÊM MỚI

    // Toggles hiển thị "Xem thêm"
    const [showAllBrands, setShowAllBrands] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllColors, setShowAllColors] = useState(false); // THÊM MỚI
    const [showAllSizes, setShowAllSizes] = useState(false);   // THÊM MỚI

    const DISPLAY_LIMIT = 5;

    // --- 2. STATES CHO BỘ LỌC, SẮP XẾP & PHÂN TRANG ---
    const [filters, setFilters] = useState({
        price: [],
        brands: [],
        categories: [],
        gender: [],
        colors: [], // THÊM MỚI
        sizes: []   // THÊM MỚI
    });

    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            categories: categoryFilter ? [categoryFilter] : [],
            brands: brandFilter ? [brandFilter] : [],
            gender: genderFilter ? [genderFilter] : []
        }));
        setCurrentPage(1);
    }, [categoryFilter, brandFilter, genderFilter]);

    const [sortOption, setSortOption] = useState('default');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

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

                const productsWithVariants = await Promise.all(
                    rawProducts.map(async (product) => {
                        try {
                            const variantRes = await getProductVariants(product.productId);
                            const variants = variantRes?.data || variantRes || [];
                            let minPrice = 0;
                            let colors = [];
                            let sizes = []; // THÊM MỚI

                            if (variants.length > 0) {
                                minPrice = Math.min(...variants.map(v => v.basePrice));
                                colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
                                sizes = [...new Set(variants.map(v => v.size).filter(Boolean))]; // Lấy tất cả size của SP này
                            }
                            // Gắn cả sizes vào product object
                            return { ...product, minPrice, colors, sizes };
                        } catch (err) {
                            return { ...product, minPrice: 0, colors: [], sizes: [] };
                        }
                    })
                );

                setAllProducts(productsWithVariants);

                // THÊM MỚI: Tính toán danh sách Màu Sắc và Kích Thước DUY NHẤT trên toàn bộ cửa hàng
                const globalColors = [...new Set(productsWithVariants.flatMap(p => p.colors))];
                const globalSizes = [...new Set(productsWithVariants.flatMap(p => p.sizes))].sort((a, b) => Number(a) - Number(b)); // Sắp xếp size tăng dần
                setDynamicColors(globalColors);
                setDynamicSizes(globalSizes);

            } catch (error) {
                message.error("Lỗi khi tải dữ liệu từ API!");
            }
        };
        fetchData();
    }, []);

    const expandedCategoryIds = useMemo(() => {
        if (!filters.categories || filters.categories.length === 0) return [];

        const selectedIds = [...filters.categories];
        const allMatchedIds = new Set(selectedIds);

        selectedIds.forEach((selectedId) => {
            categories.forEach((cate) => {
                const parentId = cate.parentId;

                if (Array.isArray(parentId)) {
                    if (parentId.includes(selectedId)) {
                        allMatchedIds.add(cate.categoryId);
                    }
                } else if (parentId === selectedId) {
                    allMatchedIds.add(cate.categoryId);
                }
            });
        });

        return [...allMatchedIds];
    }, [filters.categories, categories]);

    // --- 4. LOGIC LỌC & SẮP XẾP ---
    const processedProducts = useMemo(() => {
        let result = [...allProducts];

        // Lọc Giá
        if (filters.price.length > 0) {
            result = result.filter(p => {
                return filters.price.some(range => {
                    const [min, max] = range.split('-');
                    return p.minPrice >= Number(min) && p.minPrice <= Number(max);
                });
            });
        }

        // Lọc Hãng
        if (filters.brands.length > 0) {
            result = result.filter(p => filters.brands.includes(p.brand));
        }

        // Lọc Loại
        if (expandedCategoryIds.length > 0) {
            result = result.filter((p) => expandedCategoryIds.includes(p.categoryId));
        }

        // Lọc Giới tính
        if (filters.gender.length > 0) {
            result = result.filter(p => filters.gender.includes(p.gender));
        }

        // THÊM MỚI: Lọc Màu sắc (Chỉ cần SP có chứa ít nhất 1 màu trong mảng filter)
        if (filters.colors.length > 0) {
            result = result.filter(p => p.colors && p.colors.some(c => filters.colors.includes(c)));
        }

        // THÊM MỚI: Lọc Kích thước (Chỉ cần SP có chứa ít nhất 1 size trong mảng filter)
        if (filters.sizes.length > 0) {
            result = result.filter(p => p.sizes && p.sizes.some(s => filters.sizes.includes(s)));
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
                break;
        }

        return result;
    }, [allProducts, filters, sortOption]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortOption]);

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
                <Link to="/">Trang chủ</Link> / <Link to="/productsPage">Tất cả sản phẩm</Link>
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
                            options={showAllBrands ? dynamicBrands.map(b => ({ label: b, value: b })) : dynamicBrands.slice(0, DISPLAY_LIMIT).map(b => ({ label: b, value: b }))}
                            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                            onChange={(checkedValues) => setFilters({ ...filters, brands: checkedValues })}
                        />
                        {dynamicBrands.length > DISPLAY_LIMIT && (
                            <Button type="link" style={{ padding: 0, marginTop: 10, fontSize: 13, color: '#1890ff' }} onClick={() => setShowAllBrands(!showAllBrands)}>
                                {showAllBrands ? 'Thu gọn' : `Xem thêm (${dynamicBrands.length - DISPLAY_LIMIT})`}
                            </Button>
                        )}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <Title level={5}>Loại sản phẩm</Title>
                        <Checkbox.Group
                            value={filters.categories}
                            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                            onChange={(checkedValues) =>
                                setFilters((prev) => ({ ...prev, categories: checkedValues }))
                            }
                        >
                            {(showAllCategories ? categories : categories.slice(0, DISPLAY_LIMIT)).map(cate => (
                                <Checkbox key={cate.categoryId} value={cate.categoryId}>{cate.categoryName}</Checkbox>
                            ))}
                        </Checkbox.Group>
                        {categories.length > DISPLAY_LIMIT && (
                            <Button type="link" style={{ padding: 0, marginTop: 10, fontSize: 13, color: '#1890ff' }} onClick={() => setShowAllCategories(!showAllCategories)}>
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

                    {/* Bộ lọc Màu sắc */}
                    {dynamicColors.length > 0 && (
                        <div style={{ marginBottom: 28, borderTop: '1px solid #f0f0f0', paddingTop: 18 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 14
                                }}
                            >
                                <Title level={5} style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                                    Màu sắc
                                </Title>
                                <span style={{ color: '#9ca3af', fontSize: 18, lineHeight: 1 }}>–</span>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(5, 36px)',
                                    gap: 12
                                }}
                            >
                                {(showAllColors ? dynamicColors : dynamicColors.slice(0, 10)).map((color) => {
                                    const checked = filters.colors.includes(color);
                                    const isWhite =
                                        color?.toLowerCase?.() === '#ffffff' ||
                                        color?.toLowerCase?.() === '#fff' ||
                                        color?.toLowerCase?.() === 'white';

                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            title={color}
                                            onClick={() =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    colors: checked
                                                        ? prev.colors.filter((item) => item !== color)
                                                        : [...prev.colors, color]
                                                }))
                                            }
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                background: color,
                                                border: checked
                                                    ? '2px solid #111'
                                                    : isWhite
                                                        ? '1px solid #d1d5db'
                                                        : '1px solid #e5e7eb',
                                                boxShadow: checked ? '0 0 0 3px #e5e7eb' : 'none',
                                                cursor: 'pointer',
                                                padding: 0
                                            }}
                                        />
                                    );
                                })}
                            </div>

                            {dynamicColors.length > 10 && (
                                <Button
                                    type="link"
                                    style={{ padding: 0, marginTop: 14, fontSize: 13, color: '#1890ff' }}
                                    onClick={() => setShowAllColors(!showAllColors)}
                                >
                                    {showAllColors ? 'Thu gọn' : `Xem thêm (${dynamicColors.length - 10})`}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Bộ lọc Kích thước */}
                    {dynamicSizes.length > 0 && (
                        <div style={{ marginBottom: 28, borderTop: '1px solid #f0f0f0', paddingTop: 18 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 14
                                }}
                            >
                                <Title level={5} style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                                    Kích thước
                                </Title>
                                <span style={{ color: '#9ca3af', fontSize: 18, lineHeight: 1 }}>–</span>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(5, minmax(44px, 1fr))',
                                    gap: 8
                                }}
                            >
                                {(showAllSizes ? dynamicSizes : dynamicSizes.slice(0, 20)).map((size) => {
                                    const checked = filters.sizes.includes(size);

                                    return (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    sizes: checked
                                                        ? prev.sizes.filter((item) => item !== size)
                                                        : [...prev.sizes, size]
                                                }))
                                            }
                                            style={{
                                                minWidth: 42,
                                                height: 34,
                                                padding: '0 8px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 4,
                                                border: checked ? '1px solid #111' : '1px solid #dcdfe4',
                                                background: checked ? '#f5f5f5' : '#fff',
                                                color: '#111',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>

                            {dynamicSizes.length > 20 && (
                                <Button
                                    type="link"
                                    style={{ padding: 0, marginTop: 14, fontSize: 13, color: '#1890ff' }}
                                    onClick={() => setShowAllSizes(!showAllSizes)}
                                >
                                    {showAllSizes ? 'Thu gọn' : `Xem thêm (${dynamicSizes.length - 20})`}
                                </Button>
                            )}
                        </div>
                    )}
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
                                                    <div style={{ background: '#f6f6f6', aspectRatio: '1/1', overflow: 'hidden', position: "relative" }}>
                                                        {discountInfo && (
                                                            <div style={{
                                                                position: "absolute", top: 8, left: 8, background: "#ff4d4f",
                                                                color: "white", padding: "2px 6px", fontSize: 12,
                                                                fontWeight: 600, borderRadius: 4, zIndex: 2
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
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                }
                                                bodyStyle={{ padding: '8px 10px' }}
                                            >
                                                <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                                                    {product.brand}
                                                </Text>

                                                <Paragraph ellipsis={{ rows: 2 }} style={{ margin: "2px 0 4px 0", fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>
                                                    {product.name}
                                                </Paragraph>

                                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gridTemplateRows: "auto auto", columnGap: 8, rowGap: 1, alignItems: "center", marginTop: -2 }}>
                                                    {/* GIÁ SAU KHI GIẢM */}
                                                    <div style={{ color: "#f53d2d", fontWeight: "bold", fontSize: 14 }}>
                                                        {discountInfo
                                                            ? formatPrice(discountInfo.finalPrice)
                                                            : (product.minPrice > 0 ? formatPrice(product.minPrice) : "Đang cập nhật")}
                                                    </div>

                                                    {/* MÀU HÀNG 1 */}
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 14px)", gap: 4 }}>
                                                        {product.colors?.slice(0, 4).map((colorStr, idx) => (
                                                            <div key={idx} style={{
                                                                width: 14, height: 14, borderRadius: "50%",
                                                                border: "1px solid #ddd", backgroundColor: colorStr
                                                            }} />
                                                        ))}
                                                    </div>

                                                    {/* GIÁ CŨ */}
                                                    {discountInfo && (
                                                        <div style={{ fontSize: 12, textDecoration: "line-through", color: "#999" }}>
                                                            {formatPrice(product.minPrice)}
                                                        </div>
                                                    )}

                                                    {/* MÀU HÀNG 2 */}
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 14px)", gap: 4 }}>
                                                        {product.colors?.slice(4, 8).map((colorStr, idx) => (
                                                            <div key={idx} style={{
                                                                width: 14, height: 14, borderRadius: "50%",
                                                                border: "1px solid #ddd", backgroundColor: colorStr
                                                            }} />
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