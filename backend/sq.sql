
CREATE TABLE nguoi_dung (
    id SERIAL PRIMARY KEY,
    ho_ten TEXT,
    email TEXT UNIQUE NOT NULL,
    so_dien_thoai TEXT,
    gioi_tinh TEXT,
    ngay_sinh DATE,
    facebook TEXT,
    tiktok TEXT,
    instagram TEXT,
    whatsapp TEXT,
    linkedin TEXT,
    khoa_sua TEXT NOT NULL,
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mau_giao_dien (
    id SERIAL PRIMARY KEY,
    ma TEXT UNIQUE NOT NULL,
    ten TEXT NOT NULL,
    danh_muc TEXT NOT NULL,
    mo_ta TEXT,
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE ho_so (
    id SERIAL PRIMARY KEY,
    nguoi_dung_id INT NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
    mau_id INT REFERENCES mau_giao_dien (id),
    slug TEXT UNIQUE NOT NULL,
    ten_ho_so TEXT DEFAULT 'My Page',
    du_lieu JSONB NOT NULL DEFAULT '{}'::jsonb,
    cap_nhat_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


INSERT INTO mau_giao_dien (ma, ten, danh_muc, mo_ta) VALUES 
    ('classic_wedding', 'Classic Wedding', 'wedding', 'Elegant wedding invite'),
    ('modern_wedding', 'Modern Wedding', 'wedding', 'Minimal wedding invite'),
    ('pet_profile', 'Pet Profile', 'pet', 'Introduce your pet'),
    ('professional_cv', 'Professional CV', 'cv', 'Beautiful digital CV'),
    ('business_card', 'Digital Business Card', 'business', 'Simple digital card'),
    ('link_in_bio', 'Link in Bio', 'bio', 'All links in one place');