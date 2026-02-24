DROP TABLE IF EXISTS nfc_tags CASCADE;

DROP TABLE IF EXISTS pages CASCADE;

DROP TABLE IF EXISTS templates CASCADE;

DROP TABLE IF EXISTS nguoi_dung CASCADE;

DROP TABLE IF EXISTS admin_users CASCADE;

-- 1) Admin (demo)
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO
    admin_users (username, password)
VALUES ('admin', 'admin123');

-- 2) Người dùng (Step 1-3) + khoaChu để dashboard truy cập
CREATE TABLE nguoi_dung (
    id SERIAL PRIMARY KEY,
    khoa_chu TEXT NOT NULL UNIQUE, -- owner key (secret)
    ho_ten TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    so_dien_thoai TEXT,
    gioi_tinh TEXT, -- male/female/other
    ngay_sinh DATE,
    facebook TEXT,
    tiktok TEXT,
    instagram TEXT,
    whatsapp TEXT,
    linkedin TEXT,
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Templates (HTML lưu DB)
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    ma TEXT NOT NULL UNIQUE, -- templateKey: wedding-day / pet-clinic
    ten TEXT NOT NULL,
    danh_muc TEXT NOT NULL, -- wedding / pet ...
    mo_ta TEXT,
    entry_html TEXT NOT NULL, -- HTML template lưu DB
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4) Pages (đa hồ sơ)
--   - 1 user có nhiều pages
--   - tag_id có thể NULL (page tạo từ dashboard chưa bind tag)
--   - tag_id nếu có thì phải UNIQUE
CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    nguoi_dung_id INT NOT NULL REFERENCES nguoi_dung (id) ON DELETE RESTRICT,
    template_id INT REFERENCES templates (id),
    tag_id TEXT,
    trang_thai TEXT NOT NULL CHECK (
        trang_thai IN ('DRAFT', 'PUBLISHED')
    ) DEFAULT 'DRAFT',
    khoa_sua TEXT NOT NULL, -- edit key (secret)
    du_lieu JSONB NOT NULL DEFAULT '{}'::jsonb, -- field của template (text-only)
    html_document TEXT NOT NULL DEFAULT '',
    cap_nhat_luc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    phat_hanh_luc TIMESTAMPTZ
);

CREATE UNIQUE INDEX pages_tag_uq ON pages (tag_id)
WHERE
    tag_id IS NOT NULL;

-- 5) NFC Tags (status theo yêu cầu sếp)
CREATE TABLE nfc_tags (
    tag_id TEXT PRIMARY KEY,
    trang_thai TEXT NOT NULL CHECK (
        trang_thai IN ('UNONBOARDED', 'ONBOARDED')
    ) DEFAULT 'UNONBOARDED',
    page_id INT REFERENCES pages (id), -- page đã publish gắn tag này
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    onboarded_at TIMESTAMPTZ
);

-- =========================
-- SEED templates (2 mẫu tối thiểu)
-- =========================
INSERT INTO templates(ma, ten, danh_muc, mo_ta, entry_html) VALUES
(
  'wedding-day',
  'Classic Wedding',
  'wedding',
  'Elegant wedding invite',
  $HTML$
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Wedding</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto;

margin:0;

background:#fff7f7;}
    .wrap{max-width:520px;

margin:0 auto;

padding:18px;

} .card{background:white;

border-radius:18px;

padding:18px;

box-shadow:0 10px 30px rgba(0,0,0,.08);

} .hello{opacity:.75;

font - weight:600;

letter-spacing:.06em}
    h1{margin:.2rem 0 1rem 0}
    .couple{display:flex;

flex - direction:column;

align - items:center;

gap:6px;

margin:18px 0;

} .name{font-size:34px;

font-weight:800} .and{opacity:.7} .quote{margin-top:10px;

font - style:italic;

opacity:.85} .contact{margin-top:14px;

font-size:14px;

opacity:.8;

line-height:1.5} .tag{font-size:12px;

opacity:.6;

margin-top:10px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="hello">HELLO EVERYBODY!</div>
      <h1>✦ We're Getting Married! ✦</h1>

      <div class="couple">
        <div class="name">{{groomName}}</div>
        <div class="and">&</div>
        <div class="name">{{brideName}}</div>
      </div>

      <div class="quote">"{{message}}"</div>

      <div class="contact">
        <div><b>Owner:</b> {{hoTen}}</div>
        <div><b>Email:</b> {{email}}</div>
        <div><b>Phone:</b> {{soDienThoai}}</div>
        <div><b>Facebook:</b> {{facebook}}</div>
        <div><b>Instagram:</b> {{instagram}}</div>
      </div>

      <div class="tag">TAG: {{tagId}}</div>
    </div>
  </div>
</body>
</html>
$HTML$
),
(
  'pet-clinic',
  'Pet Profile',
  'pet',
  'Introduce your pet',
  $HTML$
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Pet</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto; margin:0; background:#f0fff4;}
    .wrap{max-width:520px;margin:0 auto;padding:18px;}
    .card{background:white;border-radius:18px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.08);}
    h1{margin:0}
    .badge{display:inline-block;padding:6px 10px;border-radius:999px;background:#dcfce7;margin:10px 0;font-weight:700}
    .about{margin-top:10px;opacity:.85;line-height:1.6}
    .contact{margin-top:14px;font-size:14px;opacity:.8;line-height:1.5}
    .tag{font-size:12px;opacity:.6;margin-top:10px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>🐾 {{petName}}</h1>
      <div class="badge">{{species}}</div>
      <div class="about">{{aboutMe}}</div>

      <div class="contact">
        <div><b>Owner:</b> {{hoTen}}</div>
        <div><b>Email:</b> {{email}}</div>
        <div><b>Phone:</b> {{soDienThoai}}</div>
      </div>

      <div class="tag">TAG: {{tagId}}</div>
    </div>
  </div>
</body>
</html>
$HTML$
);

-- =========================
-- SEED NFC tags UNONBOARDED
-- =========================
INSERT INTO nfc_tags(tag_id, trang_thai) VALUES
('04:9B:61:92:D3:2A:81','UNONBOARDED'),
('04:AA:BB:CC:DD:EE:01','UNONBOARDED'),
('04:AA:BB:CC:DD:EE:02','UNONBOARDED')
ON CONFLICT (tag_id) DO NOTHING;