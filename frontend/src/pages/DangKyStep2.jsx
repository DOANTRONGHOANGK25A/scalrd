import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { docJson, ghiJson } from "../utils/localStorage";
import { Input, Button, Typography } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, TeamOutlined } from "@ant-design/icons";
import "../styles/dangky.css";

const { Title, Text } = Typography;

export default function DangKyStep2() {
    const nav = useNavigate();
    const tam = docJson('dang_ky_tam', {});

    const [gioiTinh, setGioiTinh] = useState(tam.gioiTinh || '');
    const [ngaySinh, setNgaySinh] = useState(tam.ngaySinh || '');

    useEffect(() => {
        ghiJson('dang_ky_tam', { ...tam, gioiTinh, ngaySinh });
    }, [gioiTinh, ngaySinh]);

    return (
        <div className="dangky-page">
            {/* Header */}
            <div className="dangky-header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => nav('/dang-ky/1')}
                    className="dangky-back-btn"
                />

                <div>
                    <div>
                        <span className="dangky-brand">Snapful</span>
                        <Text type="secondary" className="dangky-brand-sub">SCard</Text>
                    </div>
                    <Text type="success" className="dangky-step">Step 2 of 3</Text>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="dangky-progress-container">
                <div className="dangky-progress-segment active"></div>
                <div className="dangky-progress-segment active"></div>
                <div className="dangky-progress-segment"></div>
            </div>

            {/* Icon */}
            <div className="dangky-icon">
                <TeamOutlined />
            </div>

            {/* Title */}
            <Title level={4} className="dangky-title">Additional Info</Title>
            <Text type="success" className="dangky-subtitle">Optional, you can skip this</Text>

            {/* Form */}
            <div className="dangky-form">
                <div className="dangky-form-group">
                    <Text strong className="dangky-label">Gender</Text>
                    <div className="dangky-gender-group">
                        {['male', 'female', 'other'].map((g) => (
                            <Button
                                key={g}
                                type={gioiTinh === g ? 'primary' : 'default'}
                                className={`dangky-gender-btn ${gioiTinh === g ? 'active' : ''}`}
                                onClick={() => setGioiTinh(g)}
                            >
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="dangky-form-group">
                    <Text strong className="dangky-label">Date of Birth</Text>
                    <Input
                        type="date"
                        size="large"
                        value={ngaySinh}
                        onChange={(e) => setNgaySinh(e.target.value)}
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
                onClick={() => nav('/dang-ky/3')}
            >
                Continue <ArrowRightOutlined />
            </Button>
        </div>
    );
}
