import { useState, useEffect } from "react";
import { apiGet, apiPut } from "../api/api.js";
import { docJson } from "../utils/localStorage.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, CheckOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import './stylestemplates/BusinessTemplate.css';

export default function BusinessTemplate() {
    const nav = useNavigate();
    const phien = docJson('phien_nguoi_dung', null);
    // Lấy hoSoId từ current_ho_so_id (khi edit từ Dashboard) hoặc từ phien (khi đăng ký mới)
    const storedHoSoId = localStorage.getItem('current_ho_so_id');
    const hoSoId = storedHoSoId ? Number(storedHoSoId) : phien?.hoSoId;
    const userData = docJson('dang_ky_tam', {});

    const fullName = userData.hoTen || 'Your Name';
    const email = userData.email || 'your@email.com';
    const phone = userData.soDienThoai || '0123456789';

    const [companyName, setCompanyName] = useState('Company Name');
    const [position, setPosition] = useState('Position');
    const [loading, setLoading] = useState(true);

    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        async function loadData() {
            if (!phien || !hoSoId) {
                setLoading(false);
                return;
            }
            try {
                const data = await apiGet(`/api/ho-so/${hoSoId}?khoa_sua=${phien.khoaSua}`);
                if (data && data.du_lieu) {
                    const d = data.du_lieu;
                    if (d.companyName) setCompanyName(d.companyName);
                    if (d.position) setPosition(d.position);
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const fieldConfig = {
        companyName: { label: 'Company Name', value: companyName, setter: setCompanyName },
        position: { label: 'Position', value: position, setter: setPosition },
    };

    function openEditor(fieldName) {
        setEditingField(fieldName);
        setEditValue(fieldConfig[fieldName].value);
    }

    function closeEditor() {
        setEditingField(null);
        setEditValue('');
    }

    function applyEdit() {
        if (editingField && fieldConfig[editingField]) {
            fieldConfig[editingField].setter(editValue);
        }
        closeEditor();
    }

    function clearField() {
        if (editingField && fieldConfig[editingField]) {
            fieldConfig[editingField].setter('');
        }
        closeEditor();
    }

    async function luu() {
        if (!phien || !hoSoId) return alert('Chưa đăng ký xong');
        const duLieu = { companyName, position };
        try {
            await apiPut(`/api/ho-so/${hoSoId}/du-lieu?khoa_sua=${phien.khoaSua}`, { duLieu });
            nav('/dashboard');
        } catch (e) {
            alert(e.message);
        }
    }

    if (loading) {
        return (
            <div className="business-loading">
                <div className="business-spinner"></div>
            </div>
        );
    }

    return (
        <div className="business-container">
            <div className="business-header">
                <div className="business-header-left">
                    <ArrowLeftOutlined className="business-back-icon" onClick={() => nav('/dashboard')} />
                    <div>
                        <span className="business-brand">Snapful</span>
                        <span className="business-title">Digital Business Card ✏️</span>
                    </div>
                </div>
                <button className="business-save-btn" onClick={luu}>
                    <SaveOutlined />
                    Save
                </button>
            </div>

            <div className="business-edit-hint">
                👆 Tap on any element to edit it
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="business-card">
                    <div className="business-company-icon">🏢</div>

                    <div onClick={() => openEditor('companyName')} className="business-editable">
                        <h1 className="business-company-name">{companyName || 'Company Name'}</h1>
                    </div>

                    <p className="business-slogan">Your company slogan here</p>

                    <div className="business-profile-section">
                        <div className="business-avatar">
                            {fullName ? fullName.charAt(0).toUpperCase() : 'H'}
                        </div>
                        <h2 className="business-fullname">{fullName}</h2>

                        <div onClick={() => openEditor('position')} className="business-editable">
                            <p className="business-position">{position || 'Position'}</p>
                        </div>
                    </div>


                    <div className="business-contact-list">
                        <div className="business-contact-item">
                            <div className="business-contact-icon"><MailOutlined /></div>
                            <div className="business-contact-info">
                                <span className="business-contact-label">Email</span>
                                <span className="business-contact-value">{email}</span>
                            </div>
                        </div>
                        <div className="business-contact-item">
                            <div className="business-contact-icon"><PhoneOutlined /></div>
                            <div className="business-contact-info">
                                <span className="business-contact-label">Phone</span>
                                <span className="business-contact-value">{phone}</span>
                            </div>
                        </div>
                    </div>

                    <p className="business-footer">Made with Snapful</p>
                </div>
            </div>

            {editingField && (
                <div className="business-modal-overlay" onClick={closeEditor}>
                    <div className="business-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="business-modal-header">
                            {fieldConfig[editingField]?.label}
                        </div>
                        <div className="business-modal-body">
                            <input
                                className="business-input"
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="business-modal-footer">
                            <button className="business-btn business-btn-cancel" onClick={closeEditor}>
                                Cancel
                            </button>
                            <button className="business-btn business-btn-danger" onClick={clearField}>
                                <DeleteOutlined />
                            </button>
                            <button className="business-btn business-btn-primary" onClick={applyEdit}>
                                <CheckOutlined />
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
