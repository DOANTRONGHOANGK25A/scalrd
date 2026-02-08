import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { docJson, ghiJson } from "../utils/localStorage";
import { Input, Button, Typography, Progress } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import "../styles/dangky.css";

const { Title, Text } = Typography;

export default function DangKyStep1() {
    const nav = useNavigate();
    const location = useLocation();
    const fromDashboard = location.state?.fromDashboard || false;
    const tam = docJson('dang_ky_tam', {});

    const [hoTen, setHoTen] = useState(tam.hoTen || '');
    const [soDienThoai, setSoDienThoai] = useState(tam.soDienThoai || '');
    const [email, setEmail] = useState(tam.email || '');

    useEffect(() => {
        ghiJson('dang_ky_tam', { hoTen, soDienThoai, email });
    }, [hoTen, soDienThoai, email]);

    const handleBack = () => {
        if (fromDashboard) {
            nav('/dashboard');
        } else {
            nav('/');
        }
    };

    return (
        <div className="dangky-page">
            {/* Header */}
            <div className="dangky-header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    className="dangky-back-btn"
                />
                <div>
                    <div>
                        <span className="dangky-brand">Snapful</span>
                        <Text type="secondary" className="dangky-brand-sub">SCard</Text>
                    </div>
                    <Text type="success" className="dangky-step">Step 1 of 3</Text>
                </div>
            </div>

            {/* Progress Bar */}
            <Progress
                percent={33}
                showInfo={false}
                strokeColor="#22c55e"
                trailColor="#e5e7eb"
                className="dangky-progress"
            />

            {/* Icon */}
            <div className="dangky-icon">
                <UserOutlined />
            </div>

            {/* Title */}
            <Title level={4} className="dangky-title">Basic Information</Title>
            <Text type="success" className="dangky-subtitle">Tell us a bit about yourself</Text>

            {/* Form */}
            <div className="dangky-form">
                <div className="dangky-form-group">
                    <Text strong className="dangky-label">
                        Full Name <Text type="danger">*</Text>
                    </Text>
                    <Input
                        size="large"
                        value={hoTen}
                        onChange={(e) => setHoTen(e.target.value)}
                        placeholder="Hoàng quá đz"
                        variant="borderless"
                        className="dangky-input"
                    />
                </div>

                <div className="dangky-form-group">
                    <Text strong className="dangky-label">
                        Email <Text type="danger">*</Text>
                    </Text>
                    <Input
                        size="large"
                        prefix={<MailOutlined />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tshoanq02@gmail.com"
                        variant="borderless"
                        className="dangky-input"
                    />
                </div>

                <div className="dangky-form-group">
                    <Text strong className="dangky-label">Phone Number</Text>
                    <Input
                        size="large"
                        prefix={<PhoneOutlined />}
                        value={soDienThoai}
                        onChange={(e) => setSoDienThoai(e.target.value)}
                        placeholder="14042327545"
                        variant="borderless"
                        className="dangky-input"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="primary"
                size="large"
                block
                className="dangky-submit-btn"
                onClick={() => nav('/dang-ky/2')}
                disabled={!hoTen.trim() || !email.trim()}
            >
                Continue <ArrowRightOutlined />
            </Button>
        </div>
    );
}
