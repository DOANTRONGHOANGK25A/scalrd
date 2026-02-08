import express from 'express';
import { nanoid } from 'nanoid';
import { query } from './db.js';
import cors from 'cors';

const app = express();
app.use(cors());

app.use(express.json());



app.post("/api/dang-ky", async (req, res) => {
    const {
        hoTen, email, soDienThoai,
        gioiTinh, ngaySinh,
        facebook, tiktok, instagram, whatsapp, linkedin
    } = req.body || {};

    if (!email) {
        return res.status(400).json({ error: "Thiếu email" });
    }
    const u1 = await query('SELECT * FROM nguoi_dung WHERE email=$1', [email]);
    let nguoi_dung = u1.rows[0];
    if (!nguoi_dung) {
        const khoaSua = nanoid(10);
        const ins = await query(
            `INSERT INTO nguoi_dung 
            (ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, facebook, tiktok, instagram, whatsapp, linkedin, khoa_sua) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [hoTen || null, email, soDienThoai || null, gioiTinh || null, ngaySinh || null,
            facebook || null, tiktok || null, instagram || null, whatsapp || null, linkedin || null, khoaSua]
        );
        nguoi_dung = ins.rows[0];
    }
    else {
        const upd = await query(
            `UPDATE nguoi_dung SET 
            ho_ten=$1, so_dien_thoai=$2, gioi_tinh=$3, ngay_sinh=$4,
            facebook=$5, tiktok=$6, instagram=$7, whatsapp=$8, linkedin=$9
            WHERE email=$10 RETURNING *`,
            [hoTen || null, soDienThoai || null, gioiTinh || null, ngaySinh || null,
            facebook || null, tiktok || null, instagram || null, whatsapp || null, linkedin || null, email]
        );
        nguoi_dung = upd.rows[0];
    }

    res.json({ nguoiDungId: nguoi_dung.id, khoaSua: nguoi_dung.khoa_sua });
});

app.get("/api/mau", async (req, res) => {

    const rs = await query('SELECT * FROM mau_giao_dien ORDER BY id ASC');
    res.json(rs.rows);

});

function layKhoaSua(req) {
    return String(req.query.khoa_sua || '');
}

async function kiemTraKhoaSua(hoSoId, khoaSua) {
    const rs = await query(
        'SELECT nguoi_dung.khoa_sua FROM ho_so JOIN nguoi_dung ON ho_so.nguoi_dung_id = nguoi_dung.id WHERE ho_so.id=$1',
        [hoSoId]
    );
    const row = rs.rows[0];
    return row && row.khoa_sua === khoaSua;
}


app.put("/api/ho-so/:hoSoId/chon-mau", async (req, res) => {

    const hoSoId = Number(req.params.hoSoId);
    const khoaSua = layKhoaSua(req);
    const { mauId } = req.body || {};

    if (!Number.isFinite(hoSoId)) return res.status(400).json({ error: "Ho so ID khong hop le" });
    if (!Number.isFinite(Number(mauId))) return res.status(400).json({ error: "Thieu mau ID" });

    const ok = await kiemTraKhoaSua(hoSoId, khoaSua);
    if (!ok) return res.status(403).json({ error: "Khoa sua khong hop le" });

    const rs = await query(
        "UPDATE ho_so SET mau_id=$1 ,cap_nhat_luc=NOW() WHERE id=$2 RETURNING *",
        [mauId, hoSoId]
    );
    res.json(rs.rows[0]);
});


app.put('/api/ho-so/:hoSoId/du-lieu', async (req, res) => {

    const hoSoId = Number(req.params.hoSoId);
    const khoaSua = layKhoaSua(req);
    const { duLieu } = req.body || {};

    const ok = await kiemTraKhoaSua(hoSoId, khoaSua);
    if (!ok) return res.status(403).json({ error: "Khoa sua khong hop le" });
    const rs = await query(
        "UPDATE ho_so SET du_lieu=$1 ,cap_nhat_luc=NOW() WHERE id=$2 RETURNING *",
        [duLieu || null, hoSoId]
    );
    res.json(rs.rows[0]);
});

app.get('/api/ho-so/:hoSoId', async (req, res) => {
    const hoSoId = Number(req.params.hoSoId);
    const khoaSua = layKhoaSua(req);

    const ok = await kiemTraKhoaSua(hoSoId, khoaSua);
    if (!ok) return res.status(403).json({ error: "Khoa sua khong hop le" });
    const rs = await query(
        `SELECT ho_so.*, 
            nguoi_dung.ho_ten, nguoi_dung.email, nguoi_dung.so_dien_thoai,
            nguoi_dung.facebook, nguoi_dung.tiktok, nguoi_dung.instagram, 
            nguoi_dung.whatsapp, nguoi_dung.linkedin,
            mau_giao_dien.ma AS mau_ma, 
            mau_giao_dien.ten AS mau_ten, 
            mau_giao_dien.danh_muc AS mau_danh_muc
         FROM ho_so
         JOIN nguoi_dung ON nguoi_dung.id = ho_so.nguoi_dung_id
         LEFT JOIN mau_giao_dien ON mau_giao_dien.id = ho_so.mau_id
         WHERE ho_so.id = $1`,
        [hoSoId]
    );
    res.json(rs.rows[0] || null);

});

// GET /api/trang/:slug
app.get('/api/trang/:slug', async (req, res) => {
    const slug = String(req.params.slug || '');
    const rs = await query(
        `SELECT ho_so.slug, ho_so.du_lieu,
            nguoi_dung.ho_ten, nguoi_dung.email, nguoi_dung.so_dien_thoai,
            nguoi_dung.facebook, nguoi_dung.tiktok, nguoi_dung.instagram, 
            nguoi_dung.whatsapp, nguoi_dung.linkedin,
            mau_giao_dien.ma AS mau_ma, 
            mau_giao_dien.ten AS mau_ten, 
            mau_giao_dien.danh_muc AS mau_danh_muc
         FROM ho_so
         JOIN nguoi_dung ON nguoi_dung.id = ho_so.nguoi_dung_id
         LEFT JOIN mau_giao_dien ON mau_giao_dien.id = ho_so.mau_id
         WHERE ho_so.slug = $1`,
        [slug]
    );
    if (!rs.rows[0]) return res.status(404).json({ message: 'Khong tim thay' });
    res.json(rs.rows[0]);
});

// DELETE /api/ho-so/:hoSoId/xoa-mau - Reset template selection
app.delete('/api/ho-so/:hoSoId/xoa-mau', async (req, res) => {
    const hoSoId = Number(req.params.hoSoId);
    const khoaSua = layKhoaSua(req);

    const ok = await kiemTraKhoaSua(hoSoId, khoaSua);
    if (!ok) return res.status(403).json({ error: "Khoa sua khong hop le" });

    const rs = await query(
        "UPDATE ho_so SET mau_id = NULL, du_lieu = '{}'::jsonb, cap_nhat_luc = NOW() WHERE id = $1 RETURNING *",
        [hoSoId]
    );
    res.json({ success: true, hoSo: rs.rows[0] });
});

// Helper: verify khoaSua by nguoiDungId
async function kiemTraKhoaSuaNguoiDung(nguoiDungId, khoaSua) {
    const rs = await query('SELECT khoa_sua FROM nguoi_dung WHERE id=$1', [nguoiDungId]);
    const row = rs.rows[0];
    return row && row.khoa_sua === khoaSua;
}

// GET /api/nguoi-dung/:nguoiDungId/ho-so - lay ca
app.get('/api/nguoi-dung/:nguoiDungId/ho-so', async (req, res) => {
    const nguoiDungId = Number(req.params.nguoiDungId);
    const khoaSua = layKhoaSua(req);

    const ok = await kiemTraKhoaSuaNguoiDung(nguoiDungId, khoaSua);
    if (!ok) return res.status(403).json({ error: "Khoa sua khong hop le" });

    const rs = await query(
        `SELECT ho_so.*, 
            mau_giao_dien.ma AS mau_ma, 
            mau_giao_dien.ten AS mau_ten, 
            mau_giao_dien.danh_muc AS mau_danh_muc
         FROM ho_so
         LEFT JOIN mau_giao_dien ON mau_giao_dien.id = ho_so.mau_id
         WHERE ho_so.nguoi_dung_id = $1
         ORDER BY ho_so.cap_nhat_luc DESC`,
        [nguoiDungId]
    );
    res.json(rs.rows);
});

// POST /api/nguoi-dung/:nguoiDungId/ho-so - 
app.post('/api/nguoi-dung/:nguoiDungId/ho-so', async (req, res) => {
    const nguoiDungId = Number(req.params.nguoiDungId);
    const khoaSua = layKhoaSua(req);
    const { tenHoSo } = req.body || {};

    const ok = await kiemTraKhoaSuaNguoiDung(nguoiDungId, khoaSua);
    if (!ok) return res.status(403).json({ error: "Khoa sua khong hop le" });

    const slug = "u" + nanoid(8);
    const rs = await query(
        `INSERT INTO ho_so (nguoi_dung_id, slug, ten_ho_so) VALUES ($1, $2, $3) RETURNING *`,
        [nguoiDungId, slug, tenHoSo || 'My Page']
    );
    res.json(rs.rows[0]);
});

// DELETE /api/ho-so/:hoSoId 
app.delete('/api/ho-so/:hoSoId', async (req, res) => {
    const hoSoId = Number(req.params.hoSoId);
    const khoaSua = layKhoaSua(req);

    const ok = await kiemTraKhoaSua(hoSoId, khoaSua);
    if (!ok) return res.status(403).json({ error: "Khoa sua khong hop le" });

    await query('DELETE FROM ho_so WHERE id = $1', [hoSoId]);
    res.json({ success: true });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});