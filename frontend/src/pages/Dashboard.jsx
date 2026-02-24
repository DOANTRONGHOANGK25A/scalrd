import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { docJson } from "../utils/localStorage";
import { apiGet, apiDelete, apiPost } from "../api/api";
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

    // Ưu tiên lấy khoaChu từ localStorage (Mức B)
    const phien = docJson("phien_nguoi_dung", null);
    const khoaChuLocal = localStorage.getItem("khoa_chu") || "";
    const khoaChu = khoaChuLocal || phien?.khoaChu || "";

    // (giữ lại cách lấy tên như bạn đang làm)
    const tam = docJson("dang_ky_tam", {});
    const hoTen = tam.hoTen || "User";

    const [danhSachHoSo, setDanhSachHoSo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedHoSo, setSelectedHoSo] = useState(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        // nếu phien có khoaChu mà localStorage chưa có thì sync lại
        if (!khoaChuLocal && phien?.khoaChu) {
            localStorage.setItem("khoa_chu", phien.khoaChu);
        }
        loadDanhSachHoSo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadDanhSachHoSo() {
        if (!khoaChu) {
            // Chưa có owner key => user chưa đăng ký hoặc xóa localStorage
            setLoading(false);
            return;
        }

        try {
            const data = await apiGet(`/api/owner/pages?khoa_chu=${encodeURIComponent(khoaChu)}`);
            setDanhSachHoSo(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to load pages:", e);
        }
        setLoading(false);
    }

    function formatDate(dateStr) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    function getTemplateRoute(danhMuc) {
        const routes = {
            wedding: "/template/wedding",
            pet: "/template/pet",
            cv: "/template/cv",
            business: "/template/business",
            bio: "/template/bio"
        };
        return routes[danhMuc] || "/mau";
    }

    function openDeleteModal(hoSo) {
        setSelectedHoSo(hoSo);
        setShowDeleteModal(true);
    }

    // Mức B: delete theo pageId + khoa_sua (cần backend có DELETE /api/owner/pages/:pageId)
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

    // Mức B: tạo page mới theo owner key
    // LƯU Ý: để UI y như cũ (tạo page rồi đi /mau chọn template),
    // backend nên cho phép create page không cần templateKey (template_id NULL).
    async function createNewPage() {
        if (!khoaChu) {
            alert("Bạn chưa có owner key (khoaChu). Hãy quét NFC và đăng ký trước.");
            nav("/dang-ky/1");
            return;
        }

        setCreating(true);
        try {
            // Backend Mức B (khuyến nghị): templateKey có thể bỏ trống => tạo DRAFT chưa chọn template
            const rs = await apiPost(`/api/owner/pages/create?khoa_chu=${encodeURIComponent(khoaChu)}`, {
                // templateKey: ""  // có thể bỏ
            });

            // Lưu phiên để gallery/editor dùng
            localStorage.setItem(
                "phien_nguoi_dung",
                JSON.stringify({
                    khoaChu,
                    pageId: rs.pageId,
                    khoaSua: rs.khoaSua,
                    tagId: null
                })
            );

            nav("/mau");
        } catch (e) {
            alert("Tạo trang mới thất bại: " + e.message);
        }
        setCreating(false);
    }

    function savePhienAndGoto(hoSo, route) {
        localStorage.setItem(
            "phien_nguoi_dung",
            JSON.stringify({
                khoaChu,
                pageId: hoSo.id,
                khoaSua: hoSo.khoa_sua,
                tagId: hoSo.tag_id || null
            })
        );
        nav(route);
    }

    function handleEdit(hoSo) {
        // Nếu chưa có template => đi chọn template
        if (!hoSo.template_key) {
            savePhienAndGoto(hoSo, "/mau");
            return;
        }
        savePhienAndGoto(hoSo, getTemplateRoute(hoSo.danh_muc));
    }

    function handleShare(hoSo) {
        // Share chỉ meaningful khi đã publish và có tag_id
        if (hoSo.trang_thai === "PUBLISHED" && hoSo.tag_id) {
            nav(`/${encodeURIComponent(hoSo.tag_id)}`);
        } else {
            alert("Trang chưa publish hoặc chưa bind tag nên chưa share được.");
        }
    }

    // =========================
    // UI giữ nguyên như bạn
    // =========================
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
                                    <button className="dashboard-btn" onClick={() => handleShare(hoSo)}>
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