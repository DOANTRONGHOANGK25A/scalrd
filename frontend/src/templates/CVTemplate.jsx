import { useState, useEffect } from "react";
import { apiGet, apiPut } from "../api/api.js";
import { docJson } from "../utils/localStorage.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, CheckOutlined, UserOutlined, BulbOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import './stylestemplates/CVTemplate.css';

export default function CVTemplate() {
    const nav = useNavigate();
    const phien = docJson('phien_nguoi_dung', null);

    const pageId = phien?.pageId;
    const khoaSua = phien?.khoaSua;

    const [fullName, setFullName] = useState('Hoàng');
    const [jobTitle, setJobTitle] = useState('Job Title');
    const [aboutMe, setAboutMe] = useState('Write a brief summary about yourself, your skills, and what makes you unique. Click to edit.');
    const [experience, setExperience] = useState('List your work experience here. Include company names, positions, and key achievements. Click to edit.');
    const [skills, setSkills] = useState('Add your skills separated by commas. Click to edit.');
    const [education, setEducation] = useState('Add your educational background here. Include degrees, institutions, and graduation years. Click to edit.');
    const [loading, setLoading] = useState(true);

    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        async function loadData() {
            if (!pageId || !khoaSua) {
                setLoading(false);
                return;
            }
            try {
                const data = await apiGet(`/api/owner/pages/${pageId}/draft?khoa_sua=${khoaSua}`);
                if (data && data.duLieu) {
                    const d = data.duLieu;
                    if (d.fullName) setFullName(d.fullName);
                    if (d.jobTitle) setJobTitle(d.jobTitle);
                    if (d.aboutMe) setAboutMe(d.aboutMe);
                    if (d.experience) setExperience(d.experience);
                    if (d.skills) setSkills(d.skills);
                    if (d.education) setEducation(d.education);
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const fieldConfig = {
        fullName: { label: 'Full Name', value: fullName, setter: setFullName },
        jobTitle: { label: 'Job Title', value: jobTitle, setter: setJobTitle },
        aboutMe: { label: 'About Me', value: aboutMe, setter: setAboutMe, multiline: true },
        experience: { label: 'Experience', value: experience, setter: setExperience, multiline: true },
        skills: { label: 'Skills', value: skills, setter: setSkills, multiline: true },
        education: { label: 'Education', value: education, setter: setEducation, multiline: true },
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
        if (!pageId || !khoaSua) return alert('Chưa đăng ký xong');
        const duLieu = { fullName, jobTitle, aboutMe, experience, skills, education };
        try {
            await apiPut(`/api/owner/pages/${pageId}/save?khoa_sua=${khoaSua}`, { duLieu });
            nav('/dashboard');
        } catch (e) {
            alert(e.message);
        }
    }

    if (loading) {
        return (
            <div className="cv-loading">
                <div className="cv-spinner"></div>
            </div>
        );
    }

    return (
        <div className="cv-container">
            {/* Header */}
            <div className="cv-header">
                <div className="cv-header-left">
                    <ArrowLeftOutlined className="cv-back-icon" onClick={() => nav('/dashboard')} />
                    <div>
                        <span className="cv-brand">Snapful</span>
                        <span className="cv-title">Professional CV ✏️</span>
                    </div>
                </div>
                <button className="cv-save-btn" onClick={luu}>
                    <SaveOutlined />
                    Save
                </button>
            </div>

            {/* Edit Hint */}
            <div className="cv-edit-hint">
                👆 Tap on any element to edit it
            </div>

            {/* Main Content */}
            <div className="cv-content">
                {/* Hero Section */}
                <div className="cv-hero">
                    <div className="cv-avatar">
                        {fullName ? fullName.charAt(0).toUpperCase() : 'H'}
                    </div>
                    <div
                        className={`cv-editable ${editingField === 'fullName' ? 'active' : ''}`}
                        onClick={() => openEditor('fullName')}
                    >
                        <h1 className="cv-name">{fullName || 'Your Name'}</h1>
                    </div>
                    <div
                        className={`cv-editable ${editingField === 'jobTitle' ? 'active' : ''}`}
                        onClick={() => openEditor('jobTitle')}
                    >
                        <p className="cv-job-title">{jobTitle || 'Job Title'}</p>
                    </div>
                    <div className="cv-social-icons">
                        <span className="cv-social-icon">📧</span>
                        <span className="cv-social-icon">🔗</span>
                    </div>
                </div>

                {/* Sections */}
                <div className="cv-sections">
                    {/* About Me */}
                    <div
                        className={`cv-section ${editingField === 'aboutMe' ? 'active' : ''}`}
                        onClick={() => openEditor('aboutMe')}
                    >
                        <div className="cv-section-header">
                            <UserOutlined className="cv-section-icon cv-icon-blue" />
                            <span>About Me</span>
                        </div>
                        <p className="cv-section-text">{aboutMe || 'Click to add...'}</p>
                    </div>

                    {/* Experience */}
                    <div
                        className={`cv-section ${editingField === 'experience' ? 'active' : ''}`}
                        onClick={() => openEditor('experience')}
                    >
                        <div className="cv-section-header">
                            <TrophyOutlined className="cv-section-icon cv-icon-orange" />
                            <span>Experience</span>
                        </div>
                        <p className="cv-section-text">{experience || 'Click to add...'}</p>
                    </div>

                    {/* Skills */}
                    <div
                        className={`cv-section ${editingField === 'skills' ? 'active' : ''}`}
                        onClick={() => openEditor('skills')}
                    >
                        <div className="cv-section-header">
                            <BulbOutlined className="cv-section-icon cv-icon-yellow" />
                            <span>Skills</span>
                        </div>
                        <p className="cv-section-text">{skills || 'Click to add...'}</p>
                    </div>

                    {/* Education */}
                    <div
                        className={`cv-section ${editingField === 'education' ? 'active' : ''}`}
                        onClick={() => openEditor('education')}
                    >
                        <div className="cv-section-header">
                            <BookOutlined className="cv-section-icon cv-icon-green" />
                            <span>Education</span>
                        </div>
                        <p className="cv-section-text">{education || 'Click to add...'}</p>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingField && (
                <div className="cv-modal-overlay" onClick={closeEditor}>
                    <div className="cv-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cv-modal-header">
                            {fieldConfig[editingField]?.label}
                        </div>
                        <div className="cv-modal-body">
                            {fieldConfig[editingField]?.multiline ? (
                                <textarea
                                    className="cv-textarea"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    rows={4}
                                    autoFocus
                                />
                            ) : (
                                <input
                                    className="cv-input"
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="cv-modal-footer">
                            <button className="cv-btn cv-btn-cancel" onClick={closeEditor}>
                                Cancel
                            </button>
                            <button className="cv-btn cv-btn-danger" onClick={clearField}>
                                <DeleteOutlined />
                            </button>
                            <button className="cv-btn cv-btn-primary" onClick={applyEdit}>
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
