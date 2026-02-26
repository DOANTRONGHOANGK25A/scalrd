import { useState, useEffect, useRef, useCallback } from "react";
import { apiGet, apiPut } from "../api/api.js";
import { docJson } from "../utils/localStorage.js";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeftOutlined,
    SaveOutlined,
    DeleteOutlined,
    CheckOutlined,
    EditOutlined,
} from "@ant-design/icons";
import "../styles/TemplateEditor.css";

export default function TemplateEditor() {
    const nav = useNavigate();
    const phien = docJson("phien_nguoi_dung", null);
    const pageId = phien?.pageId;
    const khoaSua = phien?.khoaSua;

    const [htmlDoc, setHtmlDoc] = useState("");
    const [duLieu, setDuLieu] = useState({});
    const [loading, setLoading] = useState(true);
    const [templateName, setTemplateName] = useState("");

    // Edit modal state
    const [editingField, setEditingField] = useState(null);
    const [editLabel, setEditLabel] = useState("");
    const [editValue, setEditValue] = useState("");
    const [isMultiline, setIsMultiline] = useState(false);

    const previewRef = useRef(null);

    // ─── Load data ───
    useEffect(() => {
        async function loadData() {
            if (!pageId || !khoaSua) {
                setLoading(false);
                return;
            }
            try {
                const data = await apiGet(
                    `/api/owner/pages/${pageId}/draft?khoa_sua=${khoaSua}`
                );
                if (data) {
                    setHtmlDoc(data.htmlDocument || "");
                    setDuLieu(data.duLieu || {});
                    setTemplateName(data.templateKey || "Template");
                }
            } catch (e) {
                console.error("Failed to load draft:", e);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    // ─── Attach click listeners to [data-field] elements ───
    const attachFieldListeners = useCallback(() => {
        const container = previewRef.current;
        if (!container) return;

        const editables = container.querySelectorAll("[data-field]");
        editables.forEach((el) => {
            el.addEventListener("click", handleFieldClick);
        });

        return () => {
            editables.forEach((el) => {
                el.removeEventListener("click", handleFieldClick);
            });
        };
    }, [duLieu]);

    useEffect(() => {
        if (!loading && htmlDoc) {
            // Small delay to ensure DOM is rendered
            const timer = setTimeout(() => {
                const cleanup = attachFieldListeners();
                return () => cleanup && cleanup();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [loading, htmlDoc, attachFieldListeners]);

    function handleFieldClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const el = e.currentTarget;
        const fieldName = el.getAttribute("data-field");
        const label = el.getAttribute("data-label") || fieldName;
        const multi = el.getAttribute("data-multiline") === "true";

        setEditingField(fieldName);
        setEditLabel(label);
        setEditValue(duLieu[fieldName] ?? el.textContent ?? "");
        setIsMultiline(multi);
    }

    // ─── Fallback: open editor for a duLieu key ───
    function openFieldEditor(key) {
        setEditingField(key);
        setEditLabel(key);
        setEditValue(duLieu[key] ?? "");
        setIsMultiline(String(duLieu[key] ?? "").length > 50);
    }

    function closeEditor() {
        setEditingField(null);
        setEditValue("");
        setEditLabel("");
    }

    function applyEdit() {
        if (!editingField) return;
        setDuLieu((prev) => ({ ...prev, [editingField]: editValue }));
        closeEditor();
    }

    function clearField() {
        if (!editingField) return;
        setDuLieu((prev) => ({ ...prev, [editingField]: "" }));
        closeEditor();
    }

    // ─── Save to backend ───
    async function luu() {
        if (!pageId || !khoaSua) return alert("Chưa đăng ký xong");
        try {
            const rs = await apiPut(
                `/api/owner/pages/${pageId}/save?khoa_sua=${khoaSua}`,
                { duLieu }
            );
            // Update preview with re-rendered HTML from backend
            if (rs.htmlDocument) {
                setHtmlDoc(rs.htmlDocument);
            }
            nav("/dashboard");
        } catch (e) {
            alert(e.message);
        }
    }

    // ─── Check if HTML has any data-field elements ───
    function hasDataFields() {
        return htmlDoc.includes("data-field");
    }

    // ─── Render ───
    if (loading) {
        return (
            <div className="te-loading">
                <div className="te-spinner"></div>
            </div>
        );
    }

    const duLieuKeys = Object.keys(duLieu).filter(
        (k) => typeof duLieu[k] === "string" || typeof duLieu[k] === "number"
    );

    return (
        <div className="te-page">
            {/* Header */}
            <div className="te-header">
                <div className="te-header-left">
                    <ArrowLeftOutlined
                        className="te-back-icon"
                        onClick={() => nav("/dashboard")}
                    />
                    <div>
                        <span className="te-brand">Snapful</span>
                        <span className="te-title">
                            {templateName || "Editor"} ✏️
                        </span>
                    </div>
                </div>
                <button className="te-save-btn" onClick={luu}>
                    <SaveOutlined />
                    Save
                </button>
            </div>

            {/* Edit hint */}
            <div className="te-edit-hint">
                👆 Tap on any element to edit it
            </div>

            {/* Preview area */}
            <div className="te-preview-wrapper">
                {htmlDoc ? (
                    <div
                        className="te-preview-content"
                        ref={previewRef}
                        dangerouslySetInnerHTML={{ __html: htmlDoc }}
                    />
                ) : (
                    <div className="te-empty">
                        <div className="te-empty-icon">📄</div>
                        <p>Chưa có HTML preview</p>
                        <p style={{ fontSize: 13, color: "#555" }}>
                            Template chưa có entry_html hoặc chưa select template
                        </p>
                    </div>
                )}

                {/* Fallback: show editable fields list if HTML has no data-field */}
                {!hasDataFields() && duLieuKeys.length > 0 && (
                    <div className="te-fields-section">
                        <div className="te-fields-title">
                            <EditOutlined /> Editable Fields
                        </div>
                        {duLieuKeys.map((key) => (
                            <div
                                key={key}
                                className="te-field-item"
                                onClick={() => openFieldEditor(key)}
                            >
                                <span className="te-field-key">{key}</span>
                                <span className="te-field-value">
                                    {duLieu[key] || "(empty)"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingField && (
                <div className="te-modal-overlay" onClick={closeEditor}>
                    <div
                        className="te-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="te-modal-header">{editLabel}</div>
                        <div className="te-modal-body">
                            {isMultiline ? (
                                <textarea
                                    className="te-textarea"
                                    value={editValue}
                                    onChange={(e) =>
                                        setEditValue(e.target.value)
                                    }
                                    rows={3}
                                    autoFocus
                                />
                            ) : (
                                <input
                                    className="te-input"
                                    type="text"
                                    value={editValue}
                                    onChange={(e) =>
                                        setEditValue(e.target.value)
                                    }
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="te-modal-footer">
                            <button
                                className="te-btn te-btn-cancel"
                                onClick={closeEditor}
                            >
                                Cancel
                            </button>
                            <button
                                className="te-btn te-btn-danger"
                                onClick={clearField}
                            >
                                <DeleteOutlined />
                            </button>
                            <button
                                className="te-btn te-btn-primary"
                                onClick={applyEdit}
                            >
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
