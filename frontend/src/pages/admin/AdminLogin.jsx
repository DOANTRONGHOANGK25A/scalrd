import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../api/api";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AdminLogin() {
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    async function login(values) {
        setLoading(true);
        try {
            const rs = await apiPost("/api/admin/login", {
                username: values.username,
                password: values.password,
            });
            localStorage.setItem("admin_token", rs.token);
            messageApi.success("Đăng nhập thành công!");
            setTimeout(() => nav("/admin"), 600);
        } catch (e) {
            messageApi.error(e.message || "Sai tài khoản hoặc mật khẩu!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
        }}>
            {contextHolder}

            {/* Ambient glow circles */}
            <div style={{
                position: "fixed", top: "10%", left: "15%",
                width: 300, height: 300, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "fixed", bottom: "15%", right: "10%",
                width: 250, height: 250, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            <Card
                style={{
                    width: "100%",
                    maxWidth: 420,
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
                }}
                styles={{ body: { padding: "40px 36px" } }}
            >
                {/* Logo / Icon */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
                        marginBottom: 16,
                    }}>
                        <SafetyCertificateOutlined style={{ fontSize: 28, color: "#fff" }} />
                    </div>
                    <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700 }}>
                        Admin Portal
                    </Title>
                    <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4, display: "block" }}>
                        Khu vực quản trị hệ thống
                    </Text>
                </div>

                <Form
                    layout="vertical"
                    initialValues={{ username: "admin", password: "admin123" }}
                    onFinish={login}
                    requiredMark={false}
                >
                    <Form.Item
                        label={<span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Tên đăng nhập</span>}
                        name="username"
                        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.4)" }} />}
                            placeholder="username"
                            size="large"
                            style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: 10,
                                color: "#fff",
                                height: 48,
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Mật khẩu</span>}
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.4)" }} />}
                            placeholder="password"
                            size="large"
                            style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: 10,
                                color: "#fff",
                                height: 48,
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            block
                            style={{
                                height: 50,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                border: "none",
                                fontSize: 16,
                                fontWeight: 600,
                                boxShadow: "0 8px 20px rgba(99,102,241,0.4)",
                                letterSpacing: "0.5px",
                            }}
                        >
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{
                    textAlign: "center",
                    marginTop: 24,
                    paddingTop: 20,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                }}>
                    <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                        🔒 Kết nối bảo mật · Chỉ dành cho quản trị viên
                    </Text>
                </div>
            </Card>
        </div>
    );
}
