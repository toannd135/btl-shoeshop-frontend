import React, { useState, useEffect } from "react";
import { Row, Col, Card, Avatar, Typography, Tag, Space, Table, List } from "antd";
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    UsergroupAddOutlined,
    StarOutlined,
    ShoppingCartOutlined,
    DollarCircleOutlined,
    BarChartOutlined
} from "@ant-design/icons";
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

import {
    getRevenueReport,
    getCustomerOverviewReport,
    getTopSpendersReport,
    getTopSellingProducts
} from "../../services/reportService";

const { Title, Text } = Typography;

const COLORS = ['#8b5cf6', '#4338ca', '#9ca3af'];

function Dashboard() {
    const [revenueData, setRevenueData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [customerOverview, setCustomerOverview] = useState({});
    const [topSpenders, setTopSpenders] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [revenueRes, productsRes, customerRes, spendersRes] = await Promise.all([
                    getRevenueReport(),
                    getTopSellingProducts(),
                    getCustomerOverviewReport(),
                    
                ]);
                setRevenueData(revenueRes.data || []);
                setTopProducts(productsRes.data || []);

                setCustomerOverview(customerRes.data || {
                    totalCustomers: 0,
                    newCustomersThisMonth: 0,
                    customersWithOrders: 0
                });
                // setTopSpenders(spendersRes.data || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const totalRevenueCalc = revenueData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);

    const pieData = [
        { name: 'Khách mới', value: customerOverview.newCustomersThisMonth || 0 },
        { name: 'Đã mua hàng', value: customerOverview.customersWithOrders || 0 },
        { name: 'Khác', value: (customerOverview.totalCustomers - customerOverview.newCustomersThisMonth - customerOverview.customersWithOrders) || 0 }
    ];

    const renderTrendTag = (growthValue, suffix = '') => {
        if (growthValue === undefined || growthValue === null) return null;

        const isPositive = growthValue >= 0;
        return (
            <Tag
                color={isPositive ? "success" : "error"}
                style={{ borderRadius: 12, border: 'none', padding: '0 8px' }}
            >
                {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(growthValue)}{suffix}
            </Tag>
        );
    };

    const columnsSpenders = [
        {
            title: 'Hạng',
            key: 'rank',
            width: 60,
            render: (text, record, index) => {
                if (index === 0) return <span style={{ fontSize: 20 }}>🥇</span>;
                if (index === 1) return <span style={{ fontSize: 20 }}>🥈</span>;
                if (index === 2) return <span style={{ fontSize: 20 }}>🥉</span>;
                return <Text type="secondary" style={{ marginLeft: 8, fontWeight: 'bold' }}>{index + 1}</Text>;
            },
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => {
                const initials = record.fullName ? record.fullName.substring(0, 2).toUpperCase() : "NA";
                return (
                    <Space size="middle">
                        <Avatar style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', fontWeight: 'bold' }}>
                            {initials}
                        </Avatar>
                        <div>
                            <Text strong style={{ display: 'block', fontSize: 15 }}>{record.fullName || "Khách ẩn danh"}</Text>
                            <Text type="secondary" style={{ fontSize: 13 }}>{record.totalOrders || 0} đơn hàng</Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            align: 'right',
            // Đã xóa dấu $ ở Khách VIP
            render: (val) => <Text strong style={{ color: '#4f46e5', fontSize: 15 }}>{val?.toLocaleString()}</Text>,
        },
    ];

    return (
        <div style={{ padding: '24px', backgroundColor: '#f4f7fb', minHeight: '100vh' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Space align="center" size="middle">
                    <BarChartOutlined style={{ fontSize: 28, color: '#333' }} />
                    <Title level={2} style={{ margin: 0 }}>Thống kê tổng quan</Title>
                    <Tag color="#7c3aed" style={{ borderRadius: 12, padding: '0 10px', fontWeight: 'bold' }}>LIVE</Tag>
                </Space>
                <Text type="secondary" style={{ fontSize: 16 }}>Năm {currentYear}</Text>
            </div>

            <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading} style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" strong style={{ fontSize: 12 }}>TỔNG KHÁCH HÀNG</Text>
                            <Avatar shape="square" size="small" style={{ backgroundColor: '#f3f4f6', color: '#374151' }} icon={<UsergroupAddOutlined />} />
                        </div>
                        <Title level={2} style={{ color: '#4f46e5', marginTop: 10, marginBottom: 10 }}>
                            {customerOverview.totalCustomers?.toLocaleString()}
                        </Title>
                        <Space>
                            {renderTrendTag(customerOverview.totalCustomersGrowth, '%')}
                            <Text type="secondary" style={{ fontSize: 12 }}>tháng này</Text>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading} style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" strong style={{ fontSize: 12 }}>KHÁCH HÀNG MỚI</Text>
                            <Avatar shape="square" size="small" style={{ backgroundColor: '#fdf4ff', color: '#c026d3' }} icon={<StarOutlined />} />
                        </div>
                        <Title level={2} style={{ color: '#8b5cf6', marginTop: 10, marginBottom: 10 }}>
                            {customerOverview.newCustomersThisMonth?.toLocaleString()}
                        </Title>
                        <Space>
                            {renderTrendTag(customerOverview.newCustomersGrowth)}
                            <Text type="secondary" style={{ fontSize: 12 }}>so tháng trước</Text>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading} style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" strong style={{ fontSize: 12 }}>ĐÃ MUA HÀNG</Text>
                            <Avatar shape="square" size="small" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }} icon={<ShoppingCartOutlined />} />
                        </div>
                        <Title level={2} style={{ color: '#0ea5e9', marginTop: 10, marginBottom: 10 }}>
                            {customerOverview.customersWithOrders?.toLocaleString()}
                        </Title>
                        <Space>
                            {renderTrendTag(customerOverview.ordersGrowth, '%')}
                            <Text type="secondary" style={{ fontSize: 12 }}>tháng này</Text>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading} style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" strong style={{ fontSize: 12 }}>TỔNG DOANH THU</Text>
                            <Avatar shape="square" size="small" style={{ backgroundColor: '#fef3c7', color: '#d97706' }} icon={<DollarCircleOutlined />} />
                        </div>
                        <Title level={2} style={{ color: '#ea580c', marginTop: 10, marginBottom: 10 }}>
                            {totalRevenueCalc?.toLocaleString()}
                        </Title>
                        <Space>
                            {renderTrendTag(customerOverview.revenueGrowth, '%')}
                            <Text type="secondary" style={{ fontSize: 12 }}>so tháng trước</Text>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
                <Col xs={24} lg={14}>
                    <Card
                        loading={loading}
                        style={{ height: "450px", borderRadius: 16, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
                        headStyle={{ borderBottom: 'none', paddingTop: 16 }}
                        title={<Text type="secondary" strong>DOANH THU THEO THÁNG</Text>}
                        extra={<Tag color="#eef2ff" style={{ color: '#4f46e5', borderRadius: 12, fontWeight: 'bold' }}>NĂM {currentYear}</Tag>}
                    >
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="reportDate" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Doanh thu']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="totalRevenue"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card
                        loading={loading}
                        style={{ height: "450px", borderRadius: 16, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflowY: 'auto' }}
                        headStyle={{ borderBottom: 'none', paddingTop: 16 }}
                        title={<Text type="secondary" strong>TOP SẢN PHẨM BÁN CHẠY</Text>}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={topProducts}
                            renderItem={(item, index) => (
                                <List.Item style={{ borderBottom: 'none', padding: '12px 0' }}>
                                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                                            <Text type="secondary" strong style={{ minWidth: '20px', flexShrink: 0, textAlign: 'center' }}>{index + 1}</Text>
                                            <Avatar src={item.imageUrl} shape="square" size={40} style={{ backgroundColor: '#f3f4f6', flexShrink: 0 }} />
                                            <div style={{ minWidth: 0 }}>
                                                <Text strong style={{ display: 'block', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.productName}
                                                </Text>
                                                {/* Hiển thị số lượng bán (totalSold) từ DTO của bạn */}
                                                <Text type="secondary" style={{ fontSize: 13 }}>
                                                    Đã bán: <Text strong style={{ color: '#ea580c' }}>{item.totalSold}</Text> chiếc
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
                <Col xs={24} lg={8}>
                    <Card
                        loading={loading}
                        style={{ height: "450px", borderRadius: 16, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
                        headStyle={{ borderBottom: 'none', paddingTop: 16 }}
                        title={<Text type="secondary" strong>PHÂN LOẠI KHÁCH HÀNG</Text>}
                    >
                        <div style={{ position: 'relative', height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <Title level={3} style={{ margin: 0 }}>{customerOverview.totalCustomers?.toLocaleString()}</Title>
                                <Text type="secondary" style={{ fontSize: 12 }}>khách</Text>
                            </div>
                        </div>

                        <div style={{ marginTop: 20 }}>
                            {pieData.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Space>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS[idx] }}></div>
                                        <Text type="secondary">{item.name}</Text>
                                    </Space>
                                    <Text strong style={{ color: COLORS[idx] }}>
                                        {customerOverview.totalCustomers
                                            ? Math.round((item.value / customerOverview.totalCustomers) * 100)
                                            : 0}%
                                    </Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>

                {/* <Col xs={24} lg={16}>
                    <Card
                        loading={loading}
                        style={{ height: "450px", borderRadius: 16, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}
                        headStyle={{ borderBottom: 'none', paddingTop: 16 }}
                        title={<Text type="secondary" strong>KHÁCH VIP — CHI TIÊU NHIỀU NHẤT</Text>}
                        extra={<Tag color="#eef2ff" style={{ color: '#4f46e5', borderRadius: 12, fontWeight: 'bold' }}>TOP 5</Tag>}
                    >
                        <Table
                            columns={columnsSpenders}
                            dataSource={topSpenders}
                            rowKey={(record) => record.customerId || record.id || Math.random()}
                            pagination={false}
                            showHeader={false}
                            size="middle"
                        />
                    </Card>
                </Col> */}
            </Row>

        </div>
    );
}

export default Dashboard;