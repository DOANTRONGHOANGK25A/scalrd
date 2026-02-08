import { useState, useEffect } from "react";
import { apiGet, apiPut } from "../api/api.js";
import { docJson } from "../utils/localStorage.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import './stylestemplates/BioTemplate.css';

export default function BioTemplate() {
    const nav = useNavigate();
    const phien = docJson('phien_nguoi_dung', null);
    // Lấy hoSoId từ current_ho_so_id (khi edit từ Dashboard) hoặc từ phien (khi đăng ký mới)
    const storedHoSoId = localStorage.getItem('current_ho_so_id');
    const hoSoId = storedHoSoId ? Number(storedHoSoId) : phien?.hoSoId;
    const userData = docJson('dang_ky_tam', {});

    const fullName = userData.hoTen || 'Your Name';

    const [bio, setBio] = useState('Add your bio here. Tell people about yourself and what you do. Click to edit.');
    const [link1, setLink1] = useState('Add Link 1');
    const [link2, setLink2] = useState('Add Link 2');
    const [link3, setLink3] = useState('Add Link 3');
    const [link4, setLink4] = useState('Add Link 4');
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
                    if (d.bio) setBio(d.bio);
                    if (d.link1) setLink1(d.link1);
                    if (d.link2) setLink2(d.link2);
                    if (d.link3) setLink3(d.link3);
                    if (d.link4) setLink4(d.link4);
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const fieldConfig = {
        bio: { label: 'Bio', value: bio, setter: setBio, multiline: true },
        link1: { label: 'Link 1', value: link1, setter: setLink1 },
        link2: { label: 'Link 2', value: link2, setter: setLink2 },
        link3: { label: 'Link 3', value: link3, setter: setLink3 },
        link4: { label: 'Link 4', value: link4, setter: setLink4 },
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
        const duLieu = { bio, link1, link2, link3, link4 };
        try {
            await apiPut(`/api/ho-so/${hoSoId}/du-lieu?khoa_sua=${phien.khoaSua}`, { duLieu });
            nav('/dashboard');
        } catch (e) {
            alert(e.message);
        }
    }

    if (loading) {
        return (
            <div className="bio-loading">
                <div className="bio-spinner"></div>
            </div>
        );
    }

    return (
        <div className="bio-container">
            <div className="bio-header">
                <div className="bio-header-left">
                    <ArrowLeftOutlined className="bio-back-icon" onClick={() => nav('/dashboard')} />
                    <div>
                        <span className="bio-brand">Snapful</span>
                        <span className="bio-title">Link in Bio ✏️</span>
                    </div>
                </div>
                <button className="bio-save-btn" onClick={luu}>
                    <SaveOutlined />
                    Save
                </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="bio-card">
                    <div className="bio-avatar">
                        {fullName ? fullName.charAt(0).toUpperCase() : 'H'}
                    </div>
                    <h2 className="bio-name">{fullName}</h2>

                    <div onClick={() => openEditor('bio')} className="bio-editable">
                        <p className="bio-text">{bio || 'Click to add bio'}</p>
                    </div>

                    <div className="bio-links">
                        <div onClick={() => openEditor('link1')} className="bio-link-item">
                            <PlusOutlined className="bio-link-icon" />
                            <span>{link1 || 'Add Link 1'}</span>
                        </div>
                        <div onClick={() => openEditor('link2')} className="bio-link-item">
                            <PlusOutlined className="bio-link-icon" />
                            <span>{link2 || 'Add Link 2'}</span>
                        </div>
                        <div onClick={() => openEditor('link3')} className="bio-link-item">
                            <PlusOutlined className="bio-link-icon" />
                            <span>{link3 || 'Add Link 3'}</span>
                        </div>
                        <div onClick={() => openEditor('link4')} className="bio-link-item">
                            <PlusOutlined className="bio-link-icon" />
                            <span>{link4 || 'Add Link 4'}</span>
                        </div>
                    </div>

                    <p className="bio-footer">Made with Snapful</p>
                </div>
            </div>

            {editingField && (
                <div className="bio-modal-overlay" onClick={closeEditor}>
                    <div className="bio-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bio-modal-header">
                            {fieldConfig[editingField]?.label}
                        </div>
                        <div className="bio-modal-body">
                            {fieldConfig[editingField]?.multiline ? (
                                <textarea
                                    className="bio-textarea"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    rows={3}
                                    autoFocus
                                />
                            ) : (
                                <input
                                    className="bio-input"
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="bio-modal-footer">
                            <button className="bio-btn bio-btn-cancel" onClick={closeEditor}>
                                Cancel
                            </button>
                            <button className="bio-btn bio-btn-danger" onClick={clearField}>
                                <DeleteOutlined />
                            </button>
                            <button className="bio-btn bio-btn-primary" onClick={applyEdit}>
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
