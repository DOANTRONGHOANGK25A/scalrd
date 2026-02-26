# 📬 Hướng Dẫn Test API Bằng Postman

> **Base URL:** `http://localhost:4000`
>
> Đảm bảo backend đang chạy (`npm run dev` hoặc `node src/index.js`) trước khi test.

---

## Mục Lục

1. [Health Check](#1-health-check)
2. [Public APIs (Không cần đăng nhập)](#2-public-apis)
3. [Onboarding theo NFC Tag](#3-onboarding-theo-nfc-tag)
4. [Đăng ký không cần NFC Tag](#4-đăng-ký-không-cần-nfc-tag)
5. [Owner APIs (Dashboard)](#5-owner-apis-dashboard)
6. [Admin APIs](#6-admin-apis)

---

## 1. Health Check

Kiểm tra server có đang chạy hay không.

| Mục | Giá trị |
|-----|---------|
| **Method** | `GET` |
| **URL** | `http://localhost:4000/health` |
| **Body** | Không cần |

**Kết quả mong đợi:**
```json
{ "ok": true }
```

**Cách hoạt động:** Đơn giản trả về `{ ok: true }` để xác nhận server đang sống.


## 2. Public APIs

### 2.1. Kiểm tra NFC Tag

Kiểm tra một NFC tag có tồn tại trong hệ thống không, và trạng thái của nó.

| Mục | Giá trị |
|-----|---------|
| **Method** | `GET` |
| **URL** | `http://localhost:4000/api/public/tag/{tagId}` |
| **Ví dụ URL** | `http://localhost:4000/api/public/tag/ABC123` |
| **Body** | Không cần |


**Kết quả mong đợi (tag tồn tại):**
```json
{
  "exists": true,
  "status": "UNONBOARDED",
  "pageId": null,
  "tagId": "ABC123"
}
```

**Kết quả nếu tag không tồn tại:**
```json
{ "exists": false }
```

**Cách hoạt động:**
1. Nhận `tagId` từ URL, chuẩn hóa (trim + viết HOA).
2. Tìm trong bảng `nfc_tags` theo `tag_id`.
3. Nếu không tìm thấy → trả `{ exists: false }`.
4. Nếu tìm thấy → trả trạng thái (`UNONBOARDED` / `ONBOARDED`) và `page_id` nếu có.

---

### 2.2. Lấy danh sách Templates (công khai)

Lấy tất cả templates có trong hệ thống (dùng để hiển thị cho user chọn).

| Mục | Giá trị |
|-----|---------|
| **Method** | `GET` |
| **URL** | `http://localhost:4000/api/public/templates` |
| **Body** | Không cần |

**Kết quả mong đợi:**
```json
[
  {
    "id": 1,
    "ma": "name-card",
    "ten": "Name Card",
    "danh_muc": "ca_nhan",
    "mo_ta": "Template danh thiếp cá nhân"
  }
]
```

**Cách hoạt động:** Truy vấn toàn bộ bảng `templates`, chỉ trả về các cột cần thiết (không trả `entry_html` để giảm dung lượng).

---

### 2.3. Xem trang HTML theo NFC Tag

Xem nội dung HTML đã publish của một NFC tag (đây là trang web mà người dùng cuối sẽ thấy khi quét NFC).

| Mục | Giá trị |
|-----|---------|
| **Method** | `GET` |
| **URL** | `http://localhost:4000/api/public/page-by-tag/{tagId}` |
| **Ví dụ URL** | `http://localhost:4000/api/public/page-by-tag/ABC123` |
| **Body** | Không cần |

**Kết quả mong đợi:** Trả về nội dung HTML thuần (Content-Type: text/html).

**Kết quả lỗi (404):** `"Not found"` – nếu tag chưa onboard hoặc page chưa publish.

**Cách hoạt động:**
1. JOIN bảng `nfc_tags` với `pages`.
2. Chỉ trả về khi tag có `trang_thai = 'ONBOARDED'` VÀ page có `trang_thai = 'PUBLISHED'`.
3. Trả nội dung HTML đã render sẵn.

---

## 3. Onboarding Theo NFC Tag

Đăng ký thông tin người dùng + tạo trang (page) gắn với NFC tag.

| Mục | Giá trị |
|-----|---------|
| **Method** | `POST` |
| **URL** | `http://localhost:4000/api/onboard/{tagId}/init` |
| **Ví dụ URL** | `http://localhost:4000/api/onboard/ABC123/init` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | Xem bên dưới |

**Body mẫu:**
```json
{
  "hoTen": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "soDienThoai": "0912345678",
  "gioiTinh": "Nam",
  "ngaySinh": "1990-01-15",
  "facebook": "https://facebook.com/nguyenvana",
  "tiktok": "",
  "instagram": "",
  "whatsapp": "",
  "linkedin": ""
}
```

> ⚠️ **Bắt buộc:** `hoTen` và `email`. Các trường khác là tùy chọn.

**Kết quả thành công:**
```json
{
  "nguoiDungId": 1,
  "khoaChu": "abc123xyz...",
  "pageId": 5,
  "khoaSua": "def456...",
  "tagId": "ABC123"
}
```

**Các lỗi có thể gặp:**

| Status | Message | Nguyên nhân |
|--------|---------|-------------|
| 404 | `"Tag chưa được đăng ký trong hệ thống"` | Tag không tồn tại trong DB |
| 409 | `"Tag đã onboard"` | Tag đã được gắn cho người khác |
| 400 | `"Thiếu họ tên"` hoặc `"Thiếu email"` | Thiếu thông tin bắt buộc |

**Cách hoạt động:**
1. Chuẩn hóa `tagId` (viết HOA, trim).
2. Kiểm tra tag có tồn tại trong bảng `nfc_tags` không → lỗi 404 nếu không.
3. Kiểm tra tag đã onboard chưa → lỗi 409 nếu rồi.
4. Tạo/cập nhật người dùng trong bảng `nguoi_dung` (dùng `INSERT ... ON CONFLICT (email) DO UPDATE` = nếu email đã tồn tại thì cập nhật thông tin mới).
5. Kiểm tra đã có page nào gắn với tag chưa:
   - **Có rồi** → trả lại thông tin page cũ.
   - **Chưa có** → tạo page mới với `trang_thai = 'DRAFT'`, tạo `khoa_sua` ngẫu nhiên.
6. Trả về: `nguoiDungId`, `khoaChu` (khóa nhận dạng user), `pageId`, `khoaSua` (khóa để chỉnh sửa page), `tagId`.

> 💡 **`khoaChu`** = khóa chủ sở hữu, dùng để xem danh sách page của mình.
> 💡 **`khoaSua`** = khóa sửa, dùng để chỉnh sửa/publish một page cụ thể. Ai có khóa này mới được sửa page.

---

## 4. Đăng Ký Không Cần NFC Tag

Đăng ký người dùng và tạo page mà không cần NFC tag (có thể gắn tag sau).

| Mục | Giá trị |
|-----|---------|
| **Method** | `POST` |
| **URL** | `http://localhost:4000/api/register` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | Giống phần Onboarding (xem mục 3) |

**Kết quả thành công:**
```json
{
  "nguoiDungId": 1,
  "khoaChu": "abc123xyz...",
  "pageId": 6,
  "khoaSua": "def456...",
  "tagId": null
}
```

> Lưu ý: `tagId` sẽ là `null` vì chưa gắn NFC tag.

**Cách hoạt động:** Giống Onboarding nhưng bỏ qua phần kiểm tra NFC tag. Page được tạo với `tag_id = NULL`.

---

## 5. Owner APIs (Dashboard)

> Các API này dùng `khoa_chu` hoặc `khoa_sua` để xác thực quyền, **không cần Bearer token**.

### 5.1. Xem danh sách Pages của mình

| Mục | Giá trị |
|-----|---------|
| **Method** | `GET` |
| **URL** | `http://localhost:4000/api/owner/pages?khoa_chu={khoaChu}` |
| **Ví dụ URL** | `http://localhost:4000/api/owner/pages?khoa_chu=abc123xyz` |
| **Body** | Không cần |

**Kết quả mong đợi:**
```json
[
  {
    "id": 5,
    "tag_id": "ABC123",
    "trang_thai": "DRAFT",
    "cap_nhat_luc": "2026-02-26T...",
    "phat_hanh_luc": null,
    "khoa_sua": "def456...",
    "template_key": "name-card",
    "template_ten": "Name Card",
    "danh_muc": "ca_nhan"
  }
]
```

**Cách hoạt động:**
1. Tìm `nguoi_dung` theo `khoa_chu`.
2. Truy vấn tất cả pages của user đó, JOIN với bảng `templates` để lấy tên template.
3. Sắp xếp theo `cap_nhat_luc` giảm dần (mới nhất trước).

---

### 5.2. Tạo Page mới

| Mục | Giá trị |
|-----|---------|
| **Method** | `POST` |
| **URL** | `http://localhost:4000/api/owner/pages/create?khoa_chu={khoaChu}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | Xem bên dưới |

**Body mẫu (có template):**
```json
{
  "templateKey": "name-card"
}
```

**Body mẫu (không có template):**
```json
{}
```

**Kết quả thành công:**
```json
{
  "pageId": 7,
  "khoaSua": "xyz789...",
  "templateKey": "name-card"
}
```

**Cách hoạt động:**
1. Xác minh user qua `khoa_chu`.
2. Nếu có `templateKey` → tìm template trong DB. Nếu không tìm thấy → lỗi 404.
3. Tạo page mới với `trang_thai = 'DRAFT'`, `tag_id = NULL`.
4. Nếu có template → render HTML từ template với thông tin user và lưu vào `html_document`.

---

### 5.3. Gắn NFC Tag vào Page

| Mục | Giá trị |
|-----|---------|
| **Method** | `PUT` |
| **URL** | `http://localhost:4000/api/owner/pages/{pageId}/bind-tag?khoa_sua={khoaSua}` |
| **Ví dụ URL** | `http://localhost:4000/api/owner/pages/5/bind-tag?khoa_sua=def456` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | Xem bên dưới |

**Body:**
```json
{
  "tagId": "ABC123"
}
```

**Kết quả thành công:**
```json
{ "ok": true, "tagId": "ABC123" }
```

**Các lỗi có thể gặp:**

| Status | Message | Nguyên nhân |
|--------|---------|-------------|
| 403 | `"Khóa sửa không hợp lệ"` | `khoa_sua` sai |
| 400 | `"Thiếu tagId"` | Không gửi tagId |
| 404 | `"Tag chưa được đăng ký trong hệ thống"` | Tag không tồn tại |
| 409 | `"Tag đã onboard"` | Tag đã được sử dụng |

**Cách hoạt động:**
1. Kiểm tra `khoa_sua` → xác minh quyền sửa page.
2. Kiểm tra tag tồn tại và chưa bị dùng.
3. Cập nhật `tag_id` cho page.
4. Nếu page có template → render lại HTML (vì `tagId` đã thay đổi, cần cập nhật trong template).

---

### 5.4. Chọn Template cho Page

| Mục | Giá trị |
|-----|---------|
| **Method** | `PUT` |
| **URL** | `http://localhost:4000/api/owner/pages/{pageId}/select-template?khoa_sua={khoaSua}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | Xem bên dưới |

**Body:**
```json
{
  "templateKey": "name-card"
}
```

**Kết quả thành công:**
```json
{ "ok": true }
```

**Cách hoạt động:**
1. Xác minh `khoa_sua`.
2. Tìm template theo `templateKey` (cột `ma` trong bảng `templates`).
3. Cập nhật `template_id` cho page.
4. Render HTML mới từ template + thông tin user + `du_lieu` hiện có → lưu vào `html_document`.

---

### 5.5. Xem bản nháp (Draft) của Page

| Mục | Giá trị |
|-----|---------|
| **Method** | `GET` |
| **URL** | `http://localhost:4000/api/owner/pages/{pageId}/draft?khoa_sua={khoaSua}` |
| **Ví dụ URL** | `http://localhost:4000/api/owner/pages/5/draft?khoa_sua=def456` |
| **Body** | Không cần |

**Kết quả mong đợi:**
```json
{
  "pageId": 5,
  "tagId": "ABC123",
  "trangThai": "DRAFT",
  "templateKey": "name-card",
  "danhMuc": "ca_nhan",
  "duLieu": { "chucVu": "Developer" }
}
```

**Cách hoạt động:** Trả thông tin page gồm: tag đã gắn, trạng thái, template đang dùng, và dữ liệu tùy chỉnh (`du_lieu`).

---

### 5.6. Lưu dữ liệu tùy chỉnh cho Page

| Mục | Giá trị |
|-----|---------|
| **Method** | `PUT` |
| **URL** | `http://localhost:4000/api/owner/pages/{pageId}/save?khoa_sua={khoaSua}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | Xem bên dưới |

**Body mẫu:**
```json
{
  "duLieu": {
    "chucVu": "Senior Developer",
    "congTy": "ABC Corp",
    "diaChi": "123 Đường XYZ"
  }
}
```

**Kết quả thành công:**
```json
{ "ok": true }
```

**Cách hoạt động:**
1. Xác minh `khoa_sua`.
2. **Merge** `duLieu` mới vào `du_lieu` cũ trong DB (dùng `||` operator của JSONB → chỉ ghi đè key trùng, giữ lại key cũ).
3. Nếu có template → render lại HTML với dữ liệu mới nhất.

> 💡 Đây là **merge** chứ không phải **replace**. Ví dụ: nếu `du_lieu` cũ là `{"a":1}` và bạn gửi `{"b":2}`, kết quả sẽ là `{"a":1, "b":2}`.

---

### 5.7. Publish (Phát hành) Page

| Mục | Giá trị |
|-----|---------|
| **Method** | `POST` |
| **URL** | `http://localhost:4000/api/owner/pages/{pageId}/publish?khoa_sua={khoaSua}` |
| **Body** | Không cần |

**Kết quả thành công:**
```json
{ "ok": true, "tagId": "ABC123" }
```

**Các lỗi có thể gặp:**

| Status | Message | Nguyên nhân |
|--------|---------|-------------|
| 400 | `"Chưa chọn template"` | Page chưa có template |
| 400 | `"Chưa bind tag"` | Page chưa gắn NFC tag |
| 400 | `"HTMLDocument trống"` | Nội dung HTML trống |

**Cách hoạt động:**
1. Kiểm tra page phải có: `template_id`, `tag_id`, `html_document` không trống.
2. Cập nhật `trang_thai` page → `'PUBLISHED'`, ghi thời gian publish.
3. Cập nhật NFC tag → `trang_thai = 'ONBOARDED'`, gắn `page_id`.
4. Sau publish, quét NFC tag sẽ hiện ra trang web của user.

---

### 5.8. Xóa Page

| Mục | Giá trị |
|-----|---------|
| **Method** | `DELETE` |
| **URL** | `http://localhost:4000/api/owner/pages/{pageId}?khoa_sua={khoaSua}` |
| **Ví dụ URL** | `http://localhost:4000/api/owner/pages/5?khoa_sua=def456` |
| **Body** | Không cần |

**Kết quả thành công:**
```json
{ "ok": true }
```

**Cách hoạt động:**
1. Xác minh `khoa_sua`.
2. Nếu page có gắn NFC tag → **unbind tag** (đặt tag về `UNONBOARDED`, xóa `page_id`).
3. Xóa record page khỏi DB.

---

## 6. Admin APIs

> ⚠️ Các API admin (trừ login) **yêu cầu Bearer token** trong Header.

### 6.1. Đăng nhập Admin

| Mục | Giá trị |
|-----|---------|
| **Method** | `POST` |
| **URL** | `http://localhost:4000/api/admin/login` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | Xem bên dưới |

**Body:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**Kết quả thành công:**
```json
{
  "token": "adm_xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Cách hoạt động:**
1. Tìm admin trong bảng `admin_users` theo `username`.
2. So sánh `password` (lưu ý: so sánh plaintext, không mã hóa).
3. Nếu đúng → tạo token ngẫu nhiên (prefix `adm_` + 24 ký tự), lưu vào bộ nhớ (Map) với thời hạn 24 giờ.
4. Trả token cho client.

> 🔑 **Lưu token này!** Bạn cần dùng nó cho tất cả API admin khác.

**Cách thiết lập token trong Postman cho các API admin:**
1. Vào tab **Authorization** (hoặc **Auth**).
2. Chọn **Type** = `Bearer Token`.
3. Dán token vào ô **Token**.
4. Hoặc thêm thủ công vào **Headers**: `Authorization: Bearer adm_xxxxxxxx...`

---

### 6.2. Xem tất cả Templates (Admin)

| Mục | Giá trị |
|-----|---------|
| **Method** | `GET` |
| **URL** | `http://localhost:4000/api/admin/templates` |
| **Headers** | `Authorization: Bearer {token_từ_login}` |
| **Body** | Không cần |

**Kết quả mong đợi:**
```json
[
  {
    "id": 1,
    "ma": "name-card",
    "ten": "Name Card",
    "danh_muc": "ca_nhan",
    "mo_ta": "...",
    "entry_html": "<html>...</html>"
  }
]
```

**Cách hoạt động:** Trả toàn bộ templates kèm `entry_html` (khác với API public chỉ trả metadata).

---

### 6.3. Cập nhật Template

| Mục | Giá trị |
|-----|---------|
| **Method** | `PUT` |
| **URL** | `http://localhost:4000/api/admin/templates/{id}` |
| **Ví dụ URL** | `http://localhost:4000/api/admin/templates/1` |
| **Headers** | `Authorization: Bearer {token}`, `Content-Type: application/json` |
| **Body (JSON)** | Xem bên dưới |

**Body mẫu (cập nhật một số trường):**
```json
{
  "ten": "Name Card Pro",
  "mo_ta": "Template danh thiếp nâng cấp"
}
```

> 💡 Bạn chỉ cần gửi trường muốn thay đổi. Các trường không gửi sẽ giữ nguyên (nhờ `COALESCE`).

**Kết quả thành công:** Trả về toàn bộ thông tin template sau khi cập nhật.

**Cách hoạt động:**
- Dùng `COALESCE($1, ten)` = nếu giá trị mới là `NULL` thì giữ giá trị cũ.
- Cho phép cập nhật từng phần (partial update).

---

### 6.4. Xem tất cả NFC Tags

| Mục | Giá trị |
|-----|---------|
| **Method** | `GET` |
| **URL** | `http://localhost:4000/api/admin/tags` |
| **Headers** | `Authorization: Bearer {token}` |
| **Body** | Không cần |

**Kết quả mong đợi:**
```json
[
  {
    "tag_id": "ABC123",
    "trang_thai": "UNONBOARDED",
    "page_id": null,
    "onboarded_at": null,
    "tao_luc": "2026-02-25T..."
  }
]
```

**Cách hoạt động:** Trả toàn bộ NFC tags, sắp xếp theo `tao_luc` giảm dần.

---

### 6.5. Import NFC Tags (thêm hàng loạt)

| Mục | Giá trị |
|-----|---------|
| **Method** | `POST` |
| **URL** | `http://localhost:4000/api/admin/tags/import` |
| **Headers** | `Authorization: Bearer {token}`, `Content-Type: application/json` |
| **Body (JSON)** | Xem bên dưới |

**Body mẫu:**
```json
{
  "tags": ["ABC123", "DEF456", "GHI789", "abc123"]
}
```

**Kết quả thành công:**
```json
{ "ok": true, "inserted": 3 }
```

> Lưu ý: `"abc123"` sẽ được chuẩn hóa thành `"ABC123"` (viết HOA) → trùng với tag đầu tiên → `ON CONFLICT DO NOTHING` → không insert thêm. Nên `inserted = 3`.

**Cách hoạt động:**
1. Duyệt từng tag trong mảng `tags`.
2. Chuẩn hóa (viết HOA, trim).
3. Insert vào `nfc_tags` với `trang_thai = 'UNONBOARDED'`.
4. Nếu tag đã tồn tại → bỏ qua (`ON CONFLICT DO NOTHING`).
5. Đếm số tag thực sự được insert mới.

---

## 🔄 Luồng Test Hoàn Chỉnh (Theo Thứ Tự)

Đây là kịch bản test từ đầu đến cuối:

### Kịch bản A: Onboarding qua NFC Tag

```
1. POST /api/admin/login          → Lấy token admin
2. POST /api/admin/tags/import    → Tạo tag "TAG001" (cần token)
3. GET  /api/public/tag/TAG001    → Xác nhận tag tồn tại, status = UNONBOARDED
4. POST /api/onboard/TAG001/init  → Đăng ký user + tạo page gắn tag
   → Lưu lại: khoaChu, khoaSua, pageId
5. GET  /api/owner/pages?khoa_chu=...        → Xem danh sách pages
6. PUT  /api/owner/pages/{id}/select-template?khoa_sua=...  → Chọn template
7. PUT  /api/owner/pages/{id}/save?khoa_sua=...             → Lưu dữ liệu tùy chỉnh
8. GET  /api/owner/pages/{id}/draft?khoa_sua=...            → Xem bản nháp
9. POST /api/owner/pages/{id}/publish?khoa_sua=...          → Phát hành
10. GET /api/public/page-by-tag/TAG001   → Xem trang web đã publish
```

### Kịch bản B: Đăng ký không qua NFC

```
1. POST /api/admin/login          → Lấy token admin
2. POST /api/admin/tags/import    → Tạo tag "TAG002" (cần token)
3. POST /api/register             → Đăng ký user (không cần tag)
   → Lưu lại: khoaChu, khoaSua, pageId
4. POST /api/owner/pages/create?khoa_chu=...  → Tạo page mới (có thể chọn template)
5. PUT  /api/owner/pages/{id}/bind-tag?khoa_sua=...  → Gắn tag TAG002 vào page
6. PUT  /api/owner/pages/{id}/save?khoa_sua=...      → Lưu dữ liệu
7. POST /api/owner/pages/{id}/publish?khoa_sua=...   → Phát hành
8. GET  /api/public/page-by-tag/TAG002  → Xem trang web
```

---

## 📝 Ghi Chú Quan Trọng

| Thuật ngữ | Ý nghĩa |
|-----------|---------|
| `khoaChu` (khóa chủ) | Mã nhận dạng chủ sở hữu, dùng để xem danh sách page của mình |
| `khoaSua` (khóa sửa) | Mã để chỉnh sửa một page cụ thể, ai có mã này mới được sửa |
| `tagId` | Mã NFC tag (luôn viết HOA) |
| `pageId` | ID của trang web (số nguyên) |
| `trang_thai` | Trạng thái: `DRAFT` (nháp) hoặc `PUBLISHED` (đã phát hành) |
| `du_lieu` / `duLieu` | Dữ liệu tùy chỉnh của page (JSON) |
| `UNONBOARDED` | Tag chưa được gắn cho ai |
| `ONBOARDED` | Tag đã được gắn và đang hoạt động |
