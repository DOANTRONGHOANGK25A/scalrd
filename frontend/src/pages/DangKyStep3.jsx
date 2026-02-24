import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { docJson, ghiJson } from "../utils/localStorage";
import { apiPost } from "../api/api";
import { Input, Button, Typography } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, LinkOutlined } from "@ant-design/icons";
import "../styles/dangky.css";

const { Title, Text } = Typography;

export default function DangKyStep3() {
    const nav = useNavigate();
    const tam = docJson('dang_ky_tam', {});

    const [facebook, setFacebook] = useState(tam.facebook || '');
    const [tiktok, setTiktok] = useState(tam.tiktok || '');
    const [instagram, setInstagram] = useState(tam.instagram || '');
    const [whatsapp, setWhatsapp] = useState(tam.whatsapp || '');
    const [linkedin, setLinkedin] = useState(tam.linkedin || '');

    useEffect(() => {
        ghiJson('dang_ky_tam', { ...tam, facebook, tiktok, instagram, whatsapp, linkedin });
    }, [facebook, tiktok, instagram, whatsapp, linkedin]);

    async function hoantat() {
        const tagId = localStorage.getItem("current_tag_id");
        if (!tagId) {
            alert("Bạn cần quét NFC để bắt đầu (mở /{tagId}).");
            nav("/");
            return;
        }

        const payload = docJson("dang_ky_tam", {});
        const rs = await apiPost(`/api/onboard/${encodeURIComponent(tagId)}/init`, payload);

        ghiJson("phien_nguoi_dung", {
            tagId: rs.tagId,
            pageId: rs.pageId,
            nguoiDungId: rs.nguoiDungId,
            khoaSua: rs.khoaSua,
            khoaChu: rs.khoaChu,
        });

        localStorage.setItem("khoa_chu", rs.khoaChu);

        nav("/mau");
    }


    return (
        <div className="dangky-page">
            {/* Header */}
            <div className="dangky-header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => nav('/dang-ky/2')}
                    className="dangky-back-btn"
                />
                <div>
                    <div>
                        <span className="dangky-brand">Snapful</span>
                        <Text type="secondary" className="dangky-brand-sub">SCard</Text>
                    </div>
                    <Text type="success" className="dangky-step">Step 3 of 3</Text>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="dangky-progress-container">
                <div className="dangky-progress-segment active"></div>
                <div className="dangky-progress-segment active"></div>
                <div className="dangky-progress-segment active"></div>
            </div>

            {/* Icon */}
            <div className="dangky-icon">
                <LinkOutlined />
            </div>

            {/* Title */}
            <Title level={4} className="dangky-title">Social Links</Title>
            <Text type="success" className="dangky-subtitle">Connect your accounts</Text>

            {/* Form */}
            <div className="dangky-form" style={{ paddingBottom: 80 }}>
                <div className="dangky-form-group">
                    <Text strong className="dangky-label">Facebook</Text>
                    <Input
                        size="large"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="facebook.com/username"
                        variant="borderless"
                        className="dangky-input"
                    />
                </div>

                <div className="dangky-form-group">
                    <Text strong className="dangky-label">TikTok</Text>
                    <Input
                        size="large"
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                        placeholder="@username"
                        variant="borderless"
                        className="dangky-input"
                    />
                </div>

                <div className="dangky-form-group">
                    <Text strong className="dangky-label">Instagram</Text>
                    <Input
                        size="large"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@username"
                        variant="borderless"
                        className="dangky-input"
                    />
                </div>

                <div className="dangky-form-group">
                    <Text strong className="dangky-label">WhatsApp</Text>
                    <Input
                        size="large"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+84 123 456 789"
                        variant="borderless"
                        className="dangky-input"
                    />
                </div>

                <div className="dangky-form-group">
                    <Text strong className="dangky-label">LinkedIn</Text>
                    <Input
                        size="large"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin.com/in/username"
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
                onClick={hoantat}
            >
                Complete Registration <ArrowRightOutlined />
            </Button>
        </div>
    );
}
