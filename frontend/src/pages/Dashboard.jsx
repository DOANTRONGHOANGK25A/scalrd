import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { docJson } from "../utils/localStorage";
import { apiGet, apiDelete, apiPost } from "../api/api";
import { FileTextOutlined, PlusOutlined, SettingOutlined, ShareAltOutlined, DeleteOutlined, HeartOutlined } from "@ant-design/icons";
import "../styles/dashboard.css";

export default function Dashboard() {
    const nav = useNavigate();
    const tam = docJson('dang_ky_tam', {});
    const hoTen = tam.hoTen || 'User';
    const phien = docJson('phien_nguoi_dung', null);

    const [danhSachHoSo, setDanhSachHoSo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedHoSo, setSelectedHoSo] = useState(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadDanhSachHoSo();
    }, []);

    async function loadDanhSachHoSo() {
        if (!phien) {
            setLoading(false);
            return;
        }

        if (!phien.nguoiDungId) {
            console.warn('Thiếu nguoiDungId trong phien, cần đăng ký lại');
            localStorage.removeItem('phien_nguoi_dung');
            nav('/dang-ky/1');
            return;
        }
        try {
            const data = await apiGet(`/api/nguoi-dung/${phien.nguoiDungId}/ho-so?khoa_sua=${phien.khoaSua}`);
            setDanhSachHoSo(data);
        } catch (e) {
            console.error('Failed to load ho so list:', e);
        }
        setLoading(false);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function getTemplateRoute(danhMuc) {
        const routes = {
            wedding: '/template/wedding',
            pet: '/template/pet',
            cv: '/template/cv',
            business: '/template/business',
            bio: '/template/bio'
        };
        return routes[danhMuc] || '/mau';
    }

    function openDeleteModal(hoSo) {
        setSelectedHoSo(hoSo);
        setShowDeleteModal(true);
    }

    async function confirmDelete() {
        if (!phien || !selectedHoSo) return;
        setDeleting(true);
        try {
            await apiDelete(`/api/ho-so/${selectedHoSo.id}?khoa_sua=${phien.khoaSua}`);
            setDanhSachHoSo(prev => prev.filter(h => h.id !== selectedHoSo.id));
            setShowDeleteModal(false);
            setSelectedHoSo(null);
        } catch (e) {
            alert('Xóa thất bại: ' + e.message);
        }
        setDeleting(false);
    }

    async function createNewPage() {
        if (!phien) return;
        setCreating(true);
        try {
            const newHoSo = await apiPost(`/api/nguoi-dung/${phien.nguoiDungId}/ho-so?khoa_sua=${phien.khoaSua}`, {
                tenHoSo: `My Page ${danhSachHoSo.length + 1}`
            });
            localStorage.setItem('current_ho_so_id', newHoSo.id);
            nav('/mau');
        } catch (e) {
            alert('Tạo trang mới thất bại: ' + e.message);
        }
        setCreating(false);
    }

    function handleEdit(hoSo) {
        localStorage.setItem('current_ho_so_id', hoSo.id);
        nav(getTemplateRoute(hoSo.mau_danh_muc));
    }

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-brand">Snapful</h1>
                    <span className="dashboard-welcome">Welcome, {hoTen}!</span>
                </div>
                <button
                    className="dashboard-settings-btn"
                    onClick={() => nav('/dang-ky/1', { state: { fromDashboard: true } })}
                >
                    <SettingOutlined />
                </button>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-section-header">
                    <h2 className="dashboard-section-title">My Pages</h2>
                    <span className="dashboard-page-count">
                        {danhSachHoSo.length} {danhSachHoSo.length === 1 ? 'page' : 'pages'}
                    </span>
                </div>

                {loading ? (
                    <div className="dashboard-loading">
                        <div className="dashboard-spinner"></div>
                    </div>
                ) : danhSachHoSo.length > 0 ? (
                    <div className="dashboard-page-list">
                        {danhSachHoSo.map(hoSo => (
                            <div className="dashboard-page-card" key={hoSo.id}>
                                <div className="dashboard-page-info">
                                    <div className="dashboard-page-icon">
                                        <HeartOutlined />
                                    </div>
                                    <div className="dashboard-page-details">
                                        <h3 className="dashboard-page-name">
                                            {hoSo.ten_ho_so || hoSo.mau_ten || 'My Page'}
                                        </h3>
                                        <span className="dashboard-page-meta">
                                            {hoSo.mau_ten || 'No template'} • {formatDate(hoSo.cap_nhat_luc)}
                                        </span>
                                    </div>
                                </div>
                                <div className="dashboard-page-actions">
                                    <button className="dashboard-btn">
                                        <ShareAltOutlined />
                                        Share
                                    </button>
                                    {hoSo.mau_id ? (
                                        <button className="dashboard-btn" onClick={() => handleEdit(hoSo)}>
                                            <SettingOutlined />
                                            Edit
                                        </button>
                                    ) : (
                                        <button className="dashboard-btn" onClick={() => {
                                            localStorage.setItem('current_ho_so_id', hoSo.id);
                                            nav('/mau');
                                        }}>
                                            <PlusOutlined />
                                            Choose Template
                                        </button>
                                    )}
                                    <button className="dashboard-btn dashboard-btn-delete" onClick={() => openDeleteModal(hoSo)}>
                                        <DeleteOutlined />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="dashboard-empty">
                        <div className="dashboard-empty-icon">
                            <FileTextOutlined />
                        </div>
                        <h3>No pages yet</h3>
                        <p>Create your first page by selecting a template</p>
                        <button className="dashboard-empty-btn" onClick={createNewPage} disabled={creating}>
                            <PlusOutlined />
                            {creating ? 'Creating...' : 'Create First Page'}
                        </button>
                    </div>
                )}
            </div>

            {danhSachHoSo.length > 0 && (
                <div className="dashboard-fixed-btn">
                    <button
                        className="dashboard-create-btn"
                        onClick={createNewPage}
                        disabled={creating}
                    >
                        <PlusOutlined />
                        {creating ? 'Creating...' : 'Create New Page'}
                    </button>
                </div>
            )}

            {showDeleteModal && (
                <div className="dashboard-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="dashboard-modal-header">
                            <h3>Xóa trang này?</h3>
                        </div>
                        <div className="dashboard-modal-body">
                            <p>Bạn có chắc chắn muốn xóa "{selectedHoSo?.ten_ho_so || selectedHoSo?.mau_ten || 'My Page'}"? Hành động này không thể hoàn tác.</p>
                        </div>
                        <div className="dashboard-modal-footer">
                            <button className="dashboard-modal-btn dashboard-modal-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Hủy
                            </button>
                            <button
                                className="dashboard-modal-btn dashboard-modal-btn-delete"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
