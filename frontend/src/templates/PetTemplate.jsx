import { useState, useEffect } from "react";
import { apiGet, apiPut } from "../api/api.js";
import { docJson } from "../utils/localStorage.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, CheckOutlined, HeartFilled, StarFilled } from '@ant-design/icons';
import './stylestemplates/PetTemplate.css';

export default function PetTemplate() {
    const nav = useNavigate();
    const phien = docJson('phien_nguoi_dung', null);
    // Lấy hoSoId từ current_ho_so_id (khi edit từ Dashboard) hoặc từ phien (khi đăng ký mới)
    const storedHoSoId = localStorage.getItem('current_ho_so_id');
    const hoSoId = storedHoSoId ? Number(storedHoSoId) : phien?.hoSoId;

    const [petName, setPetName] = useState('Pet Name');
    const [species, setSpecies] = useState('Species');
    const [aboutMe, setAboutMe] = useState('A lovable furry friend with lots of personality! Click to describe your pet.');
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
                    if (d.petName) setPetName(d.petName);
                    if (d.species) setSpecies(d.species);
                    if (d.aboutMe) setAboutMe(d.aboutMe);
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const fieldConfig = {
        petName: { label: 'Pet Name', value: petName, setter: setPetName },
        species: { label: 'Species', value: species, setter: setSpecies },
        aboutMe: { label: 'About Me', value: aboutMe, setter: setAboutMe, multiline: true },
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
        const duLieu = { petName, species, aboutMe };
        try {
            await apiPut(`/api/ho-so/${hoSoId}/du-lieu?khoa_sua=${phien.khoaSua}`, { duLieu });
            nav('/dashboard');
        } catch (e) {
            alert(e.message);
        }
    }

    if (loading) {
        return (
            <div className="pet-loading">
                <div className="pet-spinner"></div>
            </div>
        );
    }

    return (
        <div className="pet-container">

            <div className="pet-header">
                <div className="pet-header-left">
                    <ArrowLeftOutlined className="pet-back-icon" onClick={() => nav('/dashboard')} />
                    <div>
                        <span className="pet-brand">Snapful</span>
                        <span className="pet-title">Pet Profile ✏️</span>
                    </div>
                </div>
                <button className="pet-save-btn" onClick={luu}>
                    <SaveOutlined />
                    Save
                </button>
            </div>


            <div className="pet-edit-hint">
                👆 Tap on any element to edit it
            </div>


            <div className="pet-content">

                <div className="pet-photo-section">
                    <div className="pet-photo-area">
                        <div className="pet-dog-emoji">🐕</div>
                        <p className="pet-photo-text">Click to add photo</p>
                    </div>
                </div>


                <div className="pet-edit-button">
                    ✏️
                </div>


                <div className="pet-info-card">
                    <div
                        className={`pet-name-field ${editingField === 'petName' ? 'active' : ''}`}
                        onClick={() => openEditor('petName')}
                    >
                        <h1 className="pet-name">{petName || 'Pet Name'}</h1>
                    </div>

                    <div
                        className={`pet-species-tag ${editingField === 'species' ? 'active' : ''}`}
                        onClick={() => openEditor('species')}
                    >
                        {species || 'Species'}
                    </div>


                    <div
                        className={`pet-about-section ${editingField === 'aboutMe' ? 'active' : ''}`}
                        onClick={() => openEditor('aboutMe')}
                    >
                        <div className="pet-about-header">
                            <StarFilled className="pet-about-icon" />
                            <span>About Me</span>
                        </div>
                        <p className="pet-about-text">
                            {aboutMe || 'Click to add description...'}
                        </p>
                    </div>


                    <div className="pet-traits">
                        <div className="pet-trait pet-trait-pink">
                            <HeartFilled />
                            <span>Cuddles</span>
                        </div>
                        <div className="pet-trait pet-trait-green">
                            <span>🎾</span>
                            <span>Playful</span>
                        </div>
                        <div className="pet-trait pet-trait-yellow">
                            <span>🍖</span>
                            <span>Foodie</span>
                        </div>
                    </div>
                </div>
            </div>


            {editingField && (
                <div className="pet-modal-overlay" onClick={closeEditor}>
                    <div className="pet-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pet-modal-header">
                            {fieldConfig[editingField]?.label}
                        </div>
                        <div className="pet-modal-body">
                            {fieldConfig[editingField]?.multiline ? (
                                <textarea
                                    className="pet-textarea"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    rows={3}
                                    autoFocus
                                />
                            ) : (
                                <input
                                    className="pet-input"
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="pet-modal-footer">
                            <button className="pet-btn pet-btn-cancel" onClick={closeEditor}>
                                Cancel
                            </button>
                            <button className="pet-btn pet-btn-danger" onClick={clearField}>
                                <DeleteOutlined />
                            </button>
                            <button className="pet-btn pet-btn-primary" onClick={applyEdit}>
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
