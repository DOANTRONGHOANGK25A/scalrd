import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { docJson } from "../utils/localStorage";
import { apiGet, apiDelete, apiPost, apiPut } from "../api/api";
import {
    FileTextOutlined,
    PlusOutlined,
    SettingOutlined,
    ShareAltOutlined,
    DeleteOutlined,
    HeartOutlined
} from "@ant-design/icons";
import "../styles/dashboard.css";

export default function Dashboard() {
    const nav = useNavigate();

    const phien = docJson("phien_nguoi_dung", null);
    const khoaChuLocal = localStorage.getItem("khoa_chu") || "";
    const khoaChu = khoaChuLocal || phien?.khoaChu || "";

    const tam = docJson("dang_ky_tam", {});
    const hoTen = tam.hoTen || "User";

    const [danhSachHoSo, setDanhSachHoSo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedHoSo, setSelectedHoSo] = useState(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!khoaChuLocal && phien?.khoaChu) {
            localStorage.setItem("khoa_chu", phien.khoaChu);
        }
        loadDanhSachHoSo();
    }, []);

    async function loadDanhSachHoSo() {
        if (!khoaChu) {
            setLoading(false);
            return;
        }
        try {
            const data = await apiGet(`/api/owner/pages?khoa_chu=${encodeURIComponent(khoaChu)}`);
            setDanhSachHoSo(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to load pages:', e);
        }
        setLoading(false);
    }


    function formatDate(dateStr) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    function getTemplateRoute(danhMuc) {
        return "/template-editor";
    }

    function openDeleteModal(hoSo) {
        setSelectedHoSo(hoSo);
        setShowDeleteModal(true);
    }

    async function confirmDelete() {
        if (!selectedHoSo) return;
        setDeleting(true);
        try {
            await apiDelete(`/api/owner/pages/${selectedHoSo.id}?khoa_sua=${selectedHoSo.khoa_sua}`);
            setDanhSachHoSo((prev) => prev.filter((h) => h.id !== selectedHoSo.id));
            setShowDeleteModal(false);
            setSelectedHoSo(null);
        } catch (e) {
            alert("Xóa thất bại: " + e.message);
        }
        setDeleting(false);
    }

    async function createNewPage() {
        if (!khoaChu) {
            alert('Bạn chưa có owner key (khoaChu). Hãy quét NFC và đăng ký trước.');
            nav('/dang-ky/1');
            return;
        }
        setCreating(true);
        try {
            const rs = await apiPost(`/api/owner/pages/create?khoa_chu=${encodeURIComponent(khoaChu)}`, {});

            localStorage.setItem('phien_nguoi_dung', JSON.stringify({
                khoaChu,
                pageId: rs.pageId,
                khoaSua: rs.khoaSua,
                tagId: null
            }));

            nav('/mau');
        } catch (e) {
            alert('Tạo trang mới thất bại: ' + e.message);
        }
        setCreating(false);
    }


    function handleEdit(p) {
        localStorage.setItem('phien_nguoi_dung', JSON.stringify({
            khoaChu,
            pageId: p.id,
            khoaSua: p.khoa_sua,
            tagId: p.tag_id || null
        }));

        if (!p.template_key) {
            nav('/mau');
            return;
        }
        nav(getTemplateRoute(p.danh_muc));
    }


    async function handleSmartShare(p) {
        const khoaSua = p?.khoa_sua;
        if (!khoaSua) return alert('Thiếu khoa_sua trong item');

        let tagId = p?.tag_id || null;

        try {
            if (!tagId) {
                const input = prompt('Nhập TAG-ID để gắn và chia sẻ (vd: 04:9B:61:92:D3:2A:81):');
                if (!input) return;

                const rs = await apiPut(
                    `/api/owner/pages/${p.id}/bind-tag?khoa_sua=${encodeURIComponent(khoaSua)}`,
                    { tagId: input }
                );
                tagId = rs?.tagId || input;
                await loadDanhSachHoSo();
            }

            if (p?.trang_thai !== 'PUBLISHED') {
                await apiPost(`/api/owner/pages/${p.id}/publish?khoa_sua=${encodeURIComponent(khoaSua)}`, {});
                await loadDanhSachHoSo();
            }

            const url = `${window.location.origin}/${tagId}`;
            try {
                await navigator.clipboard.writeText(url);
                alert('Đã copy link:\n' + url);
            } catch {
                alert('Link:\n' + url);
            }
            nav(`/${tagId}`);
        } catch (e) {
            alert('Share thất bại: ' + (e.message || e));
        }
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
                    onClick={() => nav("/dang-ky/1", { state: { fromDashboard: true } })}
                >
                    <SettingOutlined />
                </button>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-section-header">
                    <h2 className="dashboard-section-title">My Pages</h2>
                    <span className="dashboard-page-count">
                        {danhSachHoSo.length} {danhSachHoSo.length === 1 ? "page" : "pages"}
                    </span>
                </div>

                {!khoaChu && !loading ? (
                    <div className="dashboard-empty">
                        <div className="dashboard-empty-icon">
                            <FileTextOutlined />
                        </div>
                        <h3>Chưa có owner key</h3>
                        <p>Hãy quét NFC và đăng ký để tạo owner key (khoaChu), sau đó Dashboard mới hiển thị các trang.</p>
                        <button className="dashboard-empty-btn" onClick={() => nav("/dang-ky/1")}>
                            <PlusOutlined />
                            Đi đăng ký
                        </button>
                    </div>
                ) : loading ? (
                    <div className="dashboard-loading">
                        <div className="dashboard-spinner"></div>
                    </div>
                ) : danhSachHoSo.length > 0 ? (
                    <div className="dashboard-page-list">
                        {danhSachHoSo.map((hoSo) => (
                            <div className="dashboard-page-card" key={hoSo.id}>
                                <div className="dashboard-page-info">
                                    <div className="dashboard-page-icon">
                                        <HeartOutlined />
                                    </div>
                                    <div className="dashboard-page-details">
                                        <h3 className="dashboard-page-name">
                                            {/* giữ text y như bạn, chỉ đổi field */}
                                            {hoSo.template_ten || "My Page"}
                                        </h3>
                                        <span className="dashboard-page-meta">
                                            {(hoSo.template_ten || "No template")} • {formatDate(hoSo.cap_nhat_luc)}
                                        </span>
                                    </div>
                                </div>

                                <div className="dashboard-page-actions">
                                    <button className="dashboard-btn" onClick={() => handleSmartShare(hoSo)}>
                                        <ShareAltOutlined />
                                        Share
                                    </button>

                                    {hoSo.template_key ? (
                                        <button className="dashboard-btn" onClick={() => handleEdit(hoSo)}>
                                            <SettingOutlined />
                                            Edit
                                        </button>
                                    ) : (
                                        <button className="dashboard-btn" onClick={() => handleEdit(hoSo)}>
                                            <PlusOutlined />
                                            Choose Template
                                        </button>
                                    )}

                                    <button
                                        className="dashboard-btn dashboard-btn-delete"
                                        onClick={() => openDeleteModal(hoSo)}
                                    >
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
                            {creating ? "Creating..." : "Create First Page"}
                        </button>
                    </div>
                )}
            </div>

            {danhSachHoSo.length > 0 && (
                <div className="dashboard-fixed-btn">
                    <button className="dashboard-create-btn" onClick={createNewPage} disabled={creating}>
                        <PlusOutlined />
                        {creating ? "Creating..." : "Create New Page"}
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
                            <p>
                                Bạn có chắc chắn muốn xóa "{selectedHoSo?.template_ten || "My Page"}"?
                                Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className="dashboard-modal-footer">
                            <button
                                className="dashboard-modal-btn dashboard-modal-btn-cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="dashboard-modal-btn dashboard-modal-btn-delete"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Đang xóa..." : "Xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}