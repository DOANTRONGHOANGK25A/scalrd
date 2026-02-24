import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPut } from '../api/api.js';
import { docJson } from "../utils/localStorage";
import { ArrowLeftOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons';
import "../styles/gallery.css";
import "../styles/app.css";

const categoryIcons = {
    all: '✨',
    wedding: '🤍',
    pet: '🐾',
    cv: '📄',
    business: '🏢',
    bio: '👤'
};

const categoryLabels = {
    all: 'All',
    wedding: 'Wedding',
    pet: 'Pet',
    cv: 'CV / Resume',
    business: 'Business',
    bio: 'Link in Bio'
};

export default function TemplateGallery() {
    const nav = useNavigate();
    const [dsMau, setDsMau] = useState([]);
    const [danhMuc, setDanhMuc] = useState('all');
    const [previewMau, setPreviewMau] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const phien = docJson('phien_nguoi_dung', null);

    useEffect(() => {
        apiGet("/api/public/templates").then(setDsMau).catch(e => alert(e.message));
    }, []);


    const dsLoc = useMemo(() => {
        if (danhMuc === 'all') return dsMau;
        return dsMau.filter((mau) => mau.danh_muc === danhMuc);
    }, [dsMau, danhMuc]);

    function moXemTruoc(mau) {
        setPreviewMau(mau);
        setShowPreview(true);
    }

    function dongXemTruoc() {
        setShowPreview(false);
        setPreviewMau(null);
    }

    async function chonMau(mau) {
        const phien = docJson("phien_nguoi_dung", null);
        await apiPut(
            `/api/owner/pages/${phien.pageId}/select-template?khoa_sua=${phien.khoaSua}`,
            { templateKey: mau.ma }
        );

        const routes = { wedding: "/template/wedding", pet: "/template/pet" };
        nav(routes[mau.danh_muc] || "/dashboard");
    }


    const categories = ['all', 'wedding', 'pet', 'cv', 'business', 'bio'];

    return (
        <div className="gallery-page">
            {/* Header */}
            <div className="gallery-header">
                <div className="gallery-header-left">
                    <button className="gallery-back-btn" onClick={() => nav(-1)}>
                        <ArrowLeftOutlined />
                    </button>
                    <div>
                        <h1 className="gallery-brand">Snapful</h1>
                        <span className="gallery-count">{dsMau.length} templates available</span>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="gallery-category-wrapper">
                <div className="gallery-category-list">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`gallery-category-btn ${danhMuc === cat ? 'active' : ''}`}
                            onClick={() => setDanhMuc(cat)}
                        >
                            <span>{categoryIcons[cat]}</span>
                            <span>{categoryLabels[cat]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            <div className="gallery-content">
                {dsLoc.length === 0 ? (
                    <div className="gallery-empty">
                        Không có template nào trong danh mục này
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {dsLoc.map(mau => (
                            <div key={mau.id} className="template-card">
                                <div className="template-thumbnail">
                                    <div className="template-category-icon">
                                        {categoryIcons[mau.danh_muc] || '📄'}
                                    </div>
                                    <div className="template-preview-box"></div>
                                </div>
                                <div className="template-info">
                                    <h3 className="template-name">{mau.ten}</h3>
                                    <p className="template-desc">{mau.mo_ta}</p>
                                    <button className="template-preview-btn" onClick={() => moXemTruoc(mau)}>
                                        <EyeOutlined />
                                        Preview & Select
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {showPreview && previewMau && (
                <div className="preview-modal-overlay" onClick={dongXemTruoc}>
                    <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="preview-modal-header">
                            <h3>{previewMau.ten}</h3>
                            <span>Preview Mode</span>
                        </div>
                        <div className="preview-modal-body">
                            <div className="preview-modal-content">
                                {/* Wedding Preview */}
                                {previewMau.danh_muc === 'wedding' && (
                                    <div className="preview-wedding-card">
                                        <div className="wedding-icon">🏠</div>
                                        <p className="wedding-hello">HELLO EVERYBODY!</p>
                                        <h1 className="wedding-title">✦ We're Getting Married! ✦</h1>
                                        <p className="wedding-quote">
                                            We Believe, with All Our Heart, That Love is Not Just
                                            a Feeling but a Joyful Celebration of Life and Togetherness.
                                        </p>
                                        <div className="wedding-flower">🌸</div>
                                        <div className="wedding-couple-icon">👫</div>
                                        <h2 className="wedding-groom">William</h2>
                                        <p className="wedding-and">&</p>
                                        <h2 className="wedding-bride">Emma</h2>
                                        <p className="wedding-footer-quote">
                                            "The future seems so bright and clear when I picture it with you near."
                                        </p>
                                        <div className="wedding-photo-placeholder"></div>
                                    </div>
                                )}

                                {/* Other Previews - Placeholder */}
                                {previewMau.danh_muc === 'pet' && (
                                    <div className="preview-placeholder">
                                        <div className="preview-placeholder-icon">🐾</div>
                                        <h2>Pet Template</h2>
                                        <p>Preview </p>
                                    </div>
                                )}
                                {previewMau.danh_muc === 'cv' && (
                                    <div className="preview-placeholder">
                                        <div className="preview-placeholder-icon">📄</div>
                                        <h2>CV Template</h2>
                                        <p>Preview </p>
                                    </div>
                                )}
                                {previewMau.danh_muc === 'business' && (
                                    <div className="preview-placeholder">
                                        <div className="preview-placeholder-icon">🏢</div>
                                        <h2>Business Template</h2>
                                        <p>Preview </p>
                                    </div>
                                )}
                                {previewMau.danh_muc === 'bio' && (
                                    <div className="preview-placeholder">
                                        <div className="preview-placeholder-icon">👤</div>
                                        <h2>Bio Template</h2>
                                        <p>Preview </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="preview-modal-footer">
                            <button className="btn-back" onClick={dongXemTruoc}>Back</button>
                            <button className="btn-select" onClick={() => chonMau(previewMau)}>
                                <CheckOutlined />
                                Use This Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
