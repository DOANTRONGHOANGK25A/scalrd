import { useState, useEffect } from "react";
import { apiGet, apiPut } from "../api/api.js";
import { docJson } from "../utils/localStorage.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import './stylestemplates/WeddingTemplate.css';

export default function WeddingTemplate() {
    const nav = useNavigate();
    const phien = docJson('phien_nguoi_dung', null);

    const storedHoSoId = localStorage.getItem('current_ho_so_id');
    const hoSoId = storedHoSoId ? Number(storedHoSoId) : phien?.hoSoId;

    const [groomName, setGroomName] = useState('William');
    const [brideName, setBrideName] = useState('Emma');
    const [message, setMessage] = useState("The future seems so bright and clear when I picture it with you near.");
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
                    if (d.groomName) setGroomName(d.groomName);
                    if (d.brideName) setBrideName(d.brideName);
                    if (d.message) setMessage(d.message);
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const fieldConfig = {
        groomName: { label: 'Groom Name', value: groomName, setter: setGroomName },
        brideName: { label: 'Bride Name', value: brideName, setter: setBrideName },
        message: { label: 'Quote / Message', value: message, setter: setMessage, multiline: true },
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
        const duLieu = { groomName, brideName, message };
        try {
            await apiPut(`/api/ho-so/${hoSoId}/du-lieu?khoa_sua=${phien.khoaSua}`, { duLieu });
            nav('/dashboard');
        } catch (e) {
            alert(e.message);
        }
    }

    if (loading) {
        return (
            <div className="wedding-loading">
                <div className="wedding-spinner"></div>
            </div>
        );
    }

    return (
        <div className="wedding-container">
            <div className="wedding-header">
                <div className="wedding-header-left">
                    <ArrowLeftOutlined className="wedding-back-icon" onClick={() => nav('/dashboard')} />
                    <div>
                        <span className="wedding-brand">Snapful</span>
                        <span className="wedding-title">Classic Wedding ✏️</span>
                    </div>
                </div>
                <button className="wedding-save-btn" onClick={luu}>
                    <SaveOutlined />
                    Save
                </button>
            </div>

            <div className="wedding-edit-hint">
                👆 Tap on any element to edit it
            </div>

            <div className="wedding-content">
                <div className="wedding-card">
                    <div className="wedding-house-icon">🏠</div>

                    <p className="wedding-hello-text">
                        HELLO EVERYBODY!
                    </p>

                    <h1 className="wedding-main-title">
                        ✦ We're Getting Married! ✦
                    </h1>

                    <p className="wedding-static-quote">
                        We Believe, with All Our Heart, That Love is Not Just
                        a Feeling but a Joyful Celebration of Life and Togetherness.
                    </p>

                    <div className="wedding-flower">🌸</div>

                    <div className="wedding-couple-icon">
                        👫
                    </div>

                    <div
                        onClick={() => openEditor('groomName')}
                        className={`wedding-editable-field ${editingField === 'groomName' ? 'active' : ''}`}
                    >
                        <h2 className="wedding-groom-name">
                            {groomName || 'Groom Name'}
                        </h2>
                    </div>

                    <p className="wedding-and-symbol">&</p>

                    <div
                        onClick={() => openEditor('brideName')}
                        className={`wedding-editable-field ${editingField === 'brideName' ? 'active' : ''}`}
                    >
                        <h2 className="wedding-bride-name">
                            {brideName || 'Bride Name'}
                        </h2>
                    </div>

                    <div
                        onClick={() => openEditor('message')}
                        className={`wedding-editable-message ${editingField === 'message' ? 'active' : ''}`}
                    >
                        <p className="wedding-message-text">
                            "{message || 'Tap to add your message...'}"
                        </p>
                    </div>


                    <div className="wedding-photo-placeholder" />
                </div>
            </div>

            {/* Edit Modal */}
            {editingField && (
                <div className="wedding-modal-overlay" onClick={closeEditor}>
                    <div className="wedding-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="wedding-modal-header">
                            {fieldConfig[editingField]?.label}
                        </div>
                        <div className="wedding-modal-body">
                            {fieldConfig[editingField]?.multiline ? (
                                <textarea
                                    className="wedding-textarea"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    rows={3}
                                    autoFocus
                                />
                            ) : (
                                <input
                                    className="wedding-input"
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="wedding-modal-footer">
                            <button className="wedding-btn wedding-btn-cancel" onClick={closeEditor}>
                                Cancel
                            </button>
                            <button className="wedding-btn wedding-btn-danger" onClick={clearField}>
                                <DeleteOutlined />
                            </button>
                            <button className="wedding-btn wedding-btn-primary" onClick={applyEdit}>
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
