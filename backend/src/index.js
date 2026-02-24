import "dotenv/config";
import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import { query } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// Utils
// =========================
export function normalizeTagId(raw) {
    return decodeURIComponent(String(raw || ""))
        .trim()
        .toUpperCase();
}

function escapeHtml(s) {
    const str = String(s ?? "");
    return str.replace(/[&<>"']/g, (ch) => {
        switch (ch) {
            case "&": return "&amp;";
            case "<": return "&lt;";
            case ">": return "&gt;";
            case '"': return "&quot;";
            case "'": return "&#39;";
            default: return ch;
        }
    });
}

function renderTemplate(entryHtml, vars) {
    const html = String(entryHtml || "");
    return html.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => {
        const v = vars?.[key];
        return escapeHtml(v ?? "");
    });
}

// =========================
// Admin auth (demo token in-memory)
// =========================
const adminSessions = new Map();
function newAdminToken() {
    return "adm_" + nanoid(24);
}
function requireAdmin(req, res, next) {
    const auth = String(req.headers.authorization || "");
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const exp = adminSessions.get(token);
    if (!exp || exp < Date.now()) return res.status(401).json({ message: "Unauthorized" });
    next();
}

// =========================
// Helpers
// =========================
async function getTemplateByKey(templateKey) {
    const t = await query("SELECT * FROM templates WHERE ma=$1", [templateKey]);
    return t.rows[0] || null;
}

async function upsertNguoiDung(body) {
    const khoaChu = nanoid(20);

    const {
        hoTen, email, soDienThoai,
        gioiTinh, ngaySinh,
        facebook, tiktok, instagram, whatsapp, linkedin
    } = body || {};

    if (!hoTen) return { ok: false, code: 400, message: "Thiếu họ tên" };
    if (!email) return { ok: false, code: 400, message: "Thiếu email" };

    const rs = await query(
        `INSERT INTO nguoi_dung
      (khoa_chu, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh,
       facebook, tiktok, instagram, whatsapp, linkedin)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (email) DO UPDATE SET
       ho_ten=EXCLUDED.ho_ten,
       so_dien_thoai=EXCLUDED.so_dien_thoai,
       gioi_tinh=EXCLUDED.gioi_tinh,
       ngay_sinh=EXCLUDED.ngay_sinh,
       facebook=EXCLUDED.facebook,
       tiktok=EXCLUDED.tiktok,
       instagram=EXCLUDED.instagram,
       whatsapp=EXCLUDED.whatsapp,
       linkedin=EXCLUDED.linkedin
     RETURNING *`,
        [
            khoaChu,
            hoTen,
            email,
            soDienThoai || null,
            gioiTinh || null,
            ngaySinh || null,
            facebook || null,
            tiktok || null,
            instagram || null,
            whatsapp || null,
            linkedin || null,
        ]
    );

    return { ok: true, user: rs.rows[0] };
}

function buildVars({ tagId, userRow, duLieu }) {
    return {
        tagId: tagId || "",
        hoTen: userRow.ho_ten,
        email: userRow.email,
        soDienThoai: userRow.so_dien_thoai || "",
        gioiTinh: userRow.gioi_tinh || "",
        ngaySinh: userRow.ngay_sinh ? String(userRow.ngay_sinh) : "",
        facebook: userRow.facebook || "",
        tiktok: userRow.tiktok || "",
        instagram: userRow.instagram || "",
        whatsapp: userRow.whatsapp || "",
        linkedin: userRow.linkedin || "",
        ...(duLieu || {}),
    };
}

async function assertKhoaSua(pageId, khoaSua) {
    const rs = await query("SELECT khoa_sua FROM pages WHERE id=$1", [pageId]);
    const row = rs.rows[0];
    return !!row && row.khoa_sua === khoaSua;
}

// =========================
// Public APIs (no auth)
// =========================
app.get("/api/public/tag/:tagId", async (req, res) => {
    const tagId = normalizeTagId(req.params.tagId);
    const rs = await query("SELECT tag_id, trang_thai, page_id FROM nfc_tags WHERE tag_id=$1", [tagId]);
    if (!rs.rows[0]) return res.json({ exists: false });
    return res.json({
        exists: true,
        status: rs.rows[0].trang_thai,
        pageId: rs.rows[0].page_id ?? null,
        tagId,
    });
});

app.get("/api/public/templates", async (req, res) => {
    const rs = await query("SELECT id, ma, ten, danh_muc, mo_ta FROM templates ORDER BY id ASC");
    res.json(rs.rows);
});

app.get("/api/public/page-by-tag/:tagId", async (req, res) => {
    const tagId = normalizeTagId(req.params.tagId);
    const rs = await query(
        `SELECT p.html_document
     FROM nfc_tags t
     JOIN pages p ON p.id=t.page_id
     WHERE t.tag_id=$1 AND t.trang_thai='ONBOARDED'
       AND p.trang_thai='PUBLISHED'`,
        [tagId]
    );
    if (!rs.rows[0]) return res.status(404).send("Not found");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(rs.rows[0].html_document);
});

// =========================
// Onboarding theo TAG (scan NFC)
// =========================
app.post("/api/onboard/:tagId/init", async (req, res) => {
    const tagId = normalizeTagId(req.params.tagId);

    const tag = await query("SELECT * FROM nfc_tags WHERE tag_id=$1", [tagId]);
    if (!tag.rows[0]) return res.status(404).json({ message: "Tag chưa được đăng ký trong hệ thống" });
    if (tag.rows[0].trang_thai === "ONBOARDED") return res.status(409).json({ message: "Tag đã onboard" });

    const u = await upsertNguoiDung(req.body);
    if (!u.ok) return res.status(u.code).json({ message: u.message });
    const user = u.user;

    const existed = await query("SELECT id, khoa_sua FROM pages WHERE tag_id=$1", [tagId]);
    if (existed.rows[0]) {
        return res.json({
            nguoiDungId: user.id,
            khoaChu: user.khoa_chu,
            pageId: existed.rows[0].id,
            khoaSua: existed.rows[0].khoa_sua,
            tagId
        });
    }

    const khoaSua = nanoid(16);
    const p = await query(
        `INSERT INTO pages(nguoi_dung_id, template_id, tag_id, trang_thai, khoa_sua, du_lieu, html_document)
     VALUES ($1, NULL, $2, 'DRAFT', $3, '{}'::jsonb, '')
     RETURNING id`,
        [user.id, tagId, khoaSua]
    );

    return res.json({
        nguoiDungId: user.id,
        khoaChu: user.khoa_chu,
        pageId: p.rows[0].id,
        khoaSua,
        tagId
    });
});

// =========================
// Register without NFC tag
// =========================
app.post("/api/register", async (req, res) => {
    const u = await upsertNguoiDung(req.body);
    if (!u.ok) return res.status(u.code).json({ message: u.message });
    const user = u.user;

    const khoaSua = nanoid(16);
    const p = await query(
        `INSERT INTO pages(nguoi_dung_id, template_id, tag_id, trang_thai, khoa_sua, du_lieu, html_document)
     VALUES ($1, NULL, NULL, 'DRAFT', $2, '{}'::jsonb, '')
     RETURNING id`,
        [user.id, khoaSua]
    );

    return res.json({
        nguoiDungId: user.id,
        khoaChu: user.khoa_chu,
        pageId: p.rows[0].id,
        khoaSua,
        tagId: null
    });
});

// =========================
// Owner APIs (Dashboard)
// =========================
app.get("/api/owner/pages", async (req, res) => {
    const khoaChu = String(req.query.khoa_chu || "");
    const u = await query("SELECT id FROM nguoi_dung WHERE khoa_chu=$1", [khoaChu]);
    if (!u.rows[0]) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const rs = await query(
        `SELECT p.id, p.tag_id, p.trang_thai, p.cap_nhat_luc, p.phat_hanh_luc,
            p.khoa_sua, t.ma AS template_key, t.ten AS template_ten, t.danh_muc
     FROM pages p
     LEFT JOIN templates t ON t.id=p.template_id
     WHERE p.nguoi_dung_id=$1
     ORDER BY p.cap_nhat_luc DESC`,
        [u.rows[0].id]
    );
    res.json(rs.rows);
});

app.post("/api/owner/pages/create", async (req, res) => {
    const khoaChu = String(req.query.khoa_chu || "");
    const u = await query("SELECT * FROM nguoi_dung WHERE khoa_chu=$1", [khoaChu]);
    if (!u.rows[0]) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const templateKey = String(req.body?.templateKey || "").trim();
    let tpl = null;
    if (templateKey) {
        tpl = await getTemplateByKey(templateKey);
        if (!tpl) return res.status(404).json({ message: "Không tìm thấy template" });
    }

    const khoaSua = nanoid(16);
    const p = await query(
        `INSERT INTO pages(nguoi_dung_id, template_id, tag_id, trang_thai, khoa_sua, du_lieu, html_document)
     VALUES ($1,$2,NULL,'DRAFT',$3,'{}'::jsonb,'')
     RETURNING id`,
        [u.rows[0].id, tpl ? tpl.id : null, khoaSua]
    );

    if (tpl) {
        const vars = buildVars({ tagId: "", userRow: u.rows[0], duLieu: {} });
        const html = renderTemplate(tpl.entry_html, vars);
        await query("UPDATE pages SET html_document=$1, cap_nhat_luc=NOW() WHERE id=$2", [html, p.rows[0].id]);
    }

    res.json({ pageId: p.rows[0].id, khoaSua, templateKey: templateKey || null });
});

app.put("/api/owner/pages/:pageId/bind-tag", async (req, res) => {
    const pageId = Number(req.params.pageId);
    const khoaSua = String(req.query.khoa_sua || "");
    if (!(await assertKhoaSua(pageId, khoaSua))) return res.status(403).json({ message: "Khóa sửa không hợp lệ" });

    const tagId = normalizeTagId(req.body?.tagId || "");
    if (!tagId) return res.status(400).json({ message: "Thiếu tagId" });

    const tag = await query("SELECT * FROM nfc_tags WHERE tag_id=$1", [tagId]);
    if (!tag.rows[0]) return res.status(404).json({ message: "Tag chưa được đăng ký trong hệ thống" });
    if (tag.rows[0].trang_thai === "ONBOARDED") return res.status(409).json({ message: "Tag đã onboard" });

    await query("UPDATE pages SET tag_id=$1, cap_nhat_luc=NOW() WHERE id=$2", [tagId, pageId]);

    const rs = await query(
        `SELECT p.du_lieu, t.entry_html, u.*
     FROM pages p
     JOIN nguoi_dung u ON u.id=p.nguoi_dung_id
     LEFT JOIN templates t ON t.id=p.template_id
     WHERE p.id=$1`,
        [pageId]
    );
    const row = rs.rows[0];
    if (row?.entry_html) {
        const vars = buildVars({ tagId, userRow: row, duLieu: row.du_lieu });
        const html = renderTemplate(row.entry_html, vars);
        await query("UPDATE pages SET html_document=$1, cap_nhat_luc=NOW() WHERE id=$2", [html, pageId]);
    }

    res.json({ ok: true, tagId });
});

app.put("/api/owner/pages/:pageId/select-template", async (req, res) => {
    const pageId = Number(req.params.pageId);
    const khoaSua = String(req.query.khoa_sua || "");
    if (!(await assertKhoaSua(pageId, khoaSua))) return res.status(403).json({ message: "Khóa sửa không hợp lệ" });

    const templateKey = String(req.body?.templateKey || "").trim();
    const tpl = await getTemplateByKey(templateKey);
    if (!tpl) return res.status(404).json({ message: "Không tìm thấy template" });

    await query("UPDATE pages SET template_id=$1, cap_nhat_luc=NOW() WHERE id=$2", [tpl.id, pageId]);

    const rs = await query(
        `SELECT p.tag_id, p.du_lieu, u.*
     FROM pages p
     JOIN nguoi_dung u ON u.id=p.nguoi_dung_id
     WHERE p.id=$1`,
        [pageId]
    );
    const row = rs.rows[0];
    const vars = buildVars({ tagId: row.tag_id || "", userRow: row, duLieu: row.du_lieu });
    const html = renderTemplate(tpl.entry_html, vars);
    await query("UPDATE pages SET html_document=$1, cap_nhat_luc=NOW() WHERE id=$2", [html, pageId]);

    res.json({ ok: true });
});

app.get("/api/owner/pages/:pageId/draft", async (req, res) => {
    const pageId = Number(req.params.pageId);
    const khoaSua = String(req.query.khoa_sua || "");
    if (!(await assertKhoaSua(pageId, khoaSua))) return res.status(403).json({ message: "Khóa sửa không hợp lệ" });

    const rs = await query(
        `SELECT p.id, p.tag_id, p.trang_thai, p.du_lieu, t.ma AS template_key, t.danh_muc
     FROM pages p
     LEFT JOIN templates t ON t.id=p.template_id
     WHERE p.id=$1`,
        [pageId]
    );
    if (!rs.rows[0]) return res.status(404).json({ message: "Không tìm thấy page" });

    res.json({
        pageId,
        tagId: rs.rows[0].tag_id || null,
        trangThai: rs.rows[0].trang_thai,
        templateKey: rs.rows[0].template_key || null,
        danhMuc: rs.rows[0].danh_muc || null,
        duLieu: rs.rows[0].du_lieu || {},
    });
});

app.put("/api/owner/pages/:pageId/save", async (req, res) => {
    const pageId = Number(req.params.pageId);
    const khoaSua = String(req.query.khoa_sua || "");
    if (!(await assertKhoaSua(pageId, khoaSua))) return res.status(403).json({ message: "Khóa sửa không hợp lệ" });

    const duLieu = req.body?.duLieu || {};
    if (typeof duLieu !== "object") return res.status(400).json({ message: "duLieu không hợp lệ" });

    await query("UPDATE pages SET du_lieu = du_lieu || $1::jsonb, cap_nhat_luc=NOW() WHERE id=$2",
        [JSON.stringify(duLieu), pageId]
    );

    const rs = await query(
        `SELECT p.tag_id, p.du_lieu, t.entry_html, u.*
     FROM pages p
     JOIN nguoi_dung u ON u.id=p.nguoi_dung_id
     LEFT JOIN templates t ON t.id=p.template_id
     WHERE p.id=$1`,
        [pageId]
    );
    const row = rs.rows[0];
    if (row?.entry_html) {
        const vars = buildVars({ tagId: row.tag_id || "", userRow: row, duLieu: row.du_lieu });
        const html = renderTemplate(row.entry_html, vars);
        await query("UPDATE pages SET html_document=$1, cap_nhat_luc=NOW() WHERE id=$2", [html, pageId]);
    }

    res.json({ ok: true });
});

app.post("/api/owner/pages/:pageId/publish", async (req, res) => {
    const pageId = Number(req.params.pageId);
    const khoaSua = String(req.query.khoa_sua || "");
    if (!(await assertKhoaSua(pageId, khoaSua))) return res.status(403).json({ message: "Khóa sửa không hợp lệ" });

    const rs = await query("SELECT id, tag_id, template_id, html_document FROM pages WHERE id=$1", [pageId]);
    const p = rs.rows[0];
    if (!p) return res.status(404).json({ message: "Không tìm thấy page" });
    if (!p.template_id) return res.status(400).json({ message: "Chưa chọn template" });
    if (!p.tag_id) return res.status(400).json({ message: "Chưa bind tag" });
    if (!String(p.html_document || "").trim()) return res.status(400).json({ message: "HTMLDocument trống" });

    await query("UPDATE pages SET trang_thai='PUBLISHED', phat_hanh_luc=NOW(), cap_nhat_luc=NOW() WHERE id=$1", [pageId]);
    await query("UPDATE nfc_tags SET trang_thai='ONBOARDED', page_id=$1, onboarded_at=NOW() WHERE tag_id=$2", [pageId, p.tag_id]);

    res.json({ ok: true, tagId: p.tag_id });
});

app.delete("/api/owner/pages/:pageId", async (req, res) => {
    const pageId = Number(req.params.pageId);
    const khoaSua = String(req.query.khoa_sua || "");
    if (!(await assertKhoaSua(pageId, khoaSua))) return res.status(403).json({ message: "Khóa sửa không hợp lệ" });

    // unbind tag if any
    const pg = await query("SELECT tag_id FROM pages WHERE id=$1", [pageId]);
    if (pg.rows[0]?.tag_id) {
        await query("UPDATE nfc_tags SET trang_thai='UNONBOARDED', page_id=NULL, onboarded_at=NULL WHERE tag_id=$1", [pg.rows[0].tag_id]);
    }
    await query("DELETE FROM pages WHERE id=$1", [pageId]);
    res.json({ ok: true });
});

// =========================
// Admin APIs
// =========================
app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body || {};
    const rs = await query("SELECT * FROM admin_users WHERE username=$1", [String(username || "")]);
    const u = rs.rows[0];
    if (!u || u.password !== String(password || "")) {
        return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }
    const token = newAdminToken();
    adminSessions.set(token, Date.now() + 24 * 60 * 60 * 1000);
    res.json({ token });
});

app.get("/api/admin/templates", requireAdmin, async (req, res) => {
    const rs = await query("SELECT * FROM templates ORDER BY id ASC");
    res.json(rs.rows);
});

app.put("/api/admin/templates/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { ten, danh_muc, mo_ta, entry_html } = req.body || {};
    const rs = await query(
        `UPDATE templates SET ten=COALESCE($1,ten), danh_muc=COALESCE($2,danh_muc),
         mo_ta=COALESCE($3,mo_ta), entry_html=COALESCE($4,entry_html)
         WHERE id=$5 RETURNING *`,
        [ten || null, danh_muc || null, mo_ta || null, entry_html || null, id]
    );
    if (!rs.rows[0]) return res.status(404).json({ message: "Không tìm thấy template" });
    res.json(rs.rows[0]);
});

app.get("/api/admin/tags", requireAdmin, async (req, res) => {
    const rs = await query("SELECT * FROM nfc_tags ORDER BY tao_luc DESC");
    res.json(rs.rows);
});

app.post("/api/admin/tags/import", requireAdmin, async (req, res) => {
    const tags = Array.isArray(req.body?.tags) ? req.body.tags : [];
    let inserted = 0;

    for (const raw of tags) {
        const tagId = normalizeTagId(raw);
        if (!tagId) continue;
        const r = await query(
            "INSERT INTO nfc_tags(tag_id, trang_thai) VALUES ($1,'UNONBOARDED') ON CONFLICT (tag_id) DO NOTHING",
            [tagId]
        );
        inserted += r.rowCount || 0;
    }

    res.json({ ok: true, inserted });
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 4000, () => {
    console.log("Backend running on port", process.env.PORT || 4000);
});
