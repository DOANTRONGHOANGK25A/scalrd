import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Layout, Table, Tag, Button, Card, Typography, Space, Input,
    Tabs, Statistic, Row, Col, Badge, Divider, message, Tooltip,
    Avatar,
} from "antd";
import {
    AppstoreOutlined, TagsOutlined, LogoutOutlined, ReloadOutlined,
    ImportOutlined, FileTextOutlined, CheckCircleOutlined,
    ClockCircleOutlined, UserOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const apiBase = import.meta.env.VITE_API_BASE_URL || "";

function adminAxios() {
    const token = localStorage.getItem("admin_token") || "";
    return axios.create({
        baseURL: apiBase,
        headers: { Authorization: `Bearer ${token}` },
    });
}

/* ───────── helpers ───────── */
function fmtDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

/* ───────── columns ───────── */
const templateColumns = [
    { title: "#", dataIndex: "id", key: "id", width: 60, render: (v) => <Text type="secondary">#{v}</Text> },
    {
        title: "Tên Template", dataIndex: "ten", key: "ten",
        render: (v, r) => (
            <Space>
                <Avatar shape="square" size="small"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 11 }}>
                    {v?.[0]?.toUpperCase() || "T"}
                </Avatar>
                <div>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{v}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{r.ma}</Text>
                </div>
            </Space>
        ),
    },
    {
        title: "Danh mục", dataIndex: "danh_muc", key: "danh_muc",
        render: (v) => {
            const colorMap = { wedding: "magenta", pet: "green", business: "blue" };
            return <Tag color={colorMap[v] || "default"} style={{ borderRadius: 6 }}>{v}</Tag>;
        },
    },
    { title: "Mô tả", dataIndex: "mo_ta", key: "mo_ta", ellipsis: true, render: (v) => v || <Text type="secondary">—</Text> },
    {
        title: "Tạo lúc", dataIndex: "tao_luc", key: "tao_luc", width: 150,
        render: (v) => <Text type="secondary" style={{ fontSize: 12 }}>{fmtDate(v)}</Text>,
    },
];

const tagColumns = [
    {
        title: "Tag ID", dataIndex: "tag_id", key: "tag_id",
        render: (v) => (
            <Tooltip title={v}>
                <Text code style={{ fontSize: 12 }}>{v?.length > 20 ? v.slice(0, 20) + "…" : v}</Text>
            </Tooltip>
        ),
    },
    {
        title: "Trạng thái", dataIndex: "trang_thai", key: "trang_thai", width: 140,
        render: (v) => v === "ONBOARDED"
            ? <Badge status="success" text={<Text style={{ color: "#16a34a", fontWeight: 500 }}>ONBOARDED</Text>} />
            : <Badge status="warning" text={<Text style={{ color: "#d97706", fontWeight: 500 }}>UNONBOARDED</Text>} />,
    },
    {
        title: "Page ID", dataIndex: "page_id", key: "page_id", width: 100,
        render: (v) => v ? <Tag color="blue">#{v}</Tag> : <Text type="secondary">—</Text>,
    },
    {
        title: "Tạo lúc", dataIndex: "tao_luc", key: "tao_luc", width: 150,
        render: (v) => <Text type="secondary" style={{ fontSize: 12 }}>{fmtDate(v)}</Text>,
    },
];

/* ───────── main component ───────── */
export default function AdminPanel() {
    const nav = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [tags, setTags] = useState([]);
    const [importText, setImportText] = useState("");
    const [loadingData, setLoadingData] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    async function loadAll() {
        setLoadingData(true);
        try {
            const ax = adminAxios();
            const [t, g] = await Promise.all([
                ax.get("/api/admin/templates"),
                ax.get("/api/admin/tags"),
            ]);
            setTemplates(t.data);
            setTags(g.data);
        } catch (e) {
            messageApi.error(e.message || "Lỗi tải dữ liệu!");
        } finally {
            setLoadingData(false);
        }
    }

    useEffect(() => { loadAll(); }, []);

    async function importTags() {
        const lines = importText.split("\n").map(s => s.trim()).filter(Boolean);
        if (!lines.length) { messageApi.warning("Vui lòng nhập ít nhất 1 tag!"); return; }
        setImportLoading(true);
        try {
            const ax = adminAxios();
            await ax.post("/api/admin/tags/import", { tags: lines });
            setImportText("");
            await loadAll();
            messageApi.success(`Đã import ${lines.length} tag thành công!`);
        } catch (e) {
            messageApi.error(e.message || "Import thất bại!");
        } finally {
            setImportLoading(false);
        }
    }

    function logout() {
        localStorage.removeItem("admin_token");
        nav("/admin/login");
    }

    const onboardedCount = tags.filter(t => t.trang_thai === "ONBOARDED").length;
    const unonboardedCount = tags.length - onboardedCount;

    const tabItems = [
        {
            key: "templates",
            label: (
                <Space>
                    <AppstoreOutlined />
                    <span>Templates</span>
                    <Tag color="purple" style={{ borderRadius: 10, fontSize: 11 }}>{templates.length}</Tag>
                </Space>
            ),
            children: (
                <Card
                    bordered={false}
                    style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    styles={{ body: { padding: 0 } }}
                >
                    <Table
                        dataSource={templates}
                        columns={templateColumns}
                        rowKey="id"
                        loading={loadingData}
                        pagination={{ pageSize: 8, showTotal: (t) => `Tổng ${t} template` }}
                        rowClassName={() => "admin-table-row"}
                        style={{ borderRadius: 16, overflow: "hidden" }}
                    />
                </Card>
            ),
        },
        {
            key: "tags",
            label: (
                <Space>
                    <TagsOutlined />
                    <span>NFC Tags</span>
                    <Tag color="blue" style={{ borderRadius: 10, fontSize: 11 }}>{tags.length}</Tag>
                </Space>
            ),
            children: (
                <Space direction="vertical" size={20} style={{ width: "100%" }}>
                    <Card
                        bordered={false}
                        style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                        styles={{ body: { padding: 0 } }}
                    >
                        <Table
                            dataSource={tags}
                            columns={tagColumns}
                            rowKey="tag_id"
                            loading={loadingData}
                            pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} tag` }}
                            rowClassName={() => "admin-table-row"}
                            style={{ borderRadius: 16, overflow: "hidden" }}
                        />
                    </Card>

                    {/* Import section */}
                    <Card
                        bordered={false}
                        style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                        title={
                            <Space>
                                <ImportOutlined style={{ color: "#6366f1" }} />
                                <span style={{ fontWeight: 600 }}>Import Tags mới</span>
                            </Space>
                        }
                    >
                        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
                            Nhập mỗi Tag ID trên một dòng riêng biệt.
                        </Text>
                        <TextArea
                            rows={5}
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder={"TAG_UID_001\nTAG_UID_002\nTAG_UID_003"}
                            style={{ borderRadius: 10, fontFamily: "monospace", fontSize: 13 }}
                        />
                        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                type="primary"
                                icon={<ImportOutlined />}
                                loading={importLoading}
                                onClick={importTags}
                                style={{
                                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                    border: "none",
                                    borderRadius: 10,
                                    height: 40,
                                    paddingInline: 24,
                                    fontWeight: 600,
                                }}
                            >
                                Import Tags
                            </Button>
                        </div>
                    </Card>
                </Space>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh", background: "#f1f5f9" }}>
            {contextHolder}

            {/* ── Header ── */}
            <Header style={{
                background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)",
                padding: "0 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
                position: "sticky",
                top: 0,
                zIndex: 100,
                height: 64,
            }}>
                <Space size={12}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <FileTextOutlined style={{ color: "#fff", fontSize: 16 }} />
                    </div>
                    <div>
                        <Title level={5} style={{ color: "#fff", margin: 0, lineHeight: 1.2 }}>
                            Admin Panel
                        </Title>
                        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                            Hệ thống quản trị NFC
                        </Text>
                    </div>
                </Space>

                <Space size={12}>
                    <Tooltip title="Làm mới dữ liệu">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadAll}
                            loading={loadingData}
                            style={{
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                color: "#fff",
                                borderRadius: 8,
                            }}
                        />
                    </Tooltip>
                    <Button
                        icon={<LogoutOutlined />}
                        onClick={logout}
                        style={{
                            background: "rgba(239,68,68,0.15)",
                            border: "1px solid rgba(239,68,68,0.35)",
                            color: "#fca5a5",
                            borderRadius: 8,
                        }}
                    >
                        Đăng xuất
                    </Button>
                </Space>
            </Header>

            {/* ── Content ── */}
            <Content style={{ padding: "28px 32px", maxWidth: 1200, width: "100%", margin: "0 auto" }}>

                {/* Stats row */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {[
                        {
                            title: "Tổng Templates",
                            value: templates.length,
                            icon: <AppstoreOutlined />,
                            color: "#6366f1",
                            bg: "#ede9fe",
                        },
                        {
                            title: "Tổng NFC Tags",
                            value: tags.length,
                            icon: <TagsOutlined />,
                            color: "#0ea5e9",
                            bg: "#e0f2fe",
                        },
                        {
                            title: "Đã Onboard",
                            value: onboardedCount,
                            icon: <CheckCircleOutlined />,
                            color: "#16a34a",
                            bg: "#dcfce7",
                        },
                        {
                            title: "Chưa Onboard",
                            value: unonboardedCount,
                            icon: <ClockCircleOutlined />,
                            color: "#d97706",
                            bg: "#fef3c7",
                        },
                    ].map((s) => (
                        <Col xs={12} sm={12} md={6} key={s.title}>
                            <Card
                                bordered={false}
                                style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                                styles={{ body: { padding: "20px 24px" } }}
                            >
                                <Space>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        background: s.bg,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 20, color: s.color,
                                    }}>
                                        {s.icon}
                                    </div>
                                    <Statistic
                                        title={<Text type="secondary" style={{ fontSize: 12 }}>{s.title}</Text>}
                                        value={s.value}
                                        valueStyle={{ fontSize: 24, fontWeight: 700, color: s.color }}
                                    />
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Main tabs */}
                <Card
                    bordered={false}
                    style={{ borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", overflow: "hidden" }}
                    styles={{ body: { padding: "8px 24px 24px" } }}
                >
                    <Tabs
                        defaultActiveKey="templates"
                        items={tabItems}
                        size="large"
                        tabBarStyle={{ marginBottom: 20 }}
                    />
                </Card>
            </Content>
        </Layout>
    );
}
