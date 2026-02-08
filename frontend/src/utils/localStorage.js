export const DANG_KY_TAM_KEY = 'dang_ky_tam';
export const PHIEN_NGUOI_DUNG_KEY = 'phien_nguoi_dung';

export function docJson(key, macDinh) {
    try {
        return JSON.parse(localStorage.getItem(key) || '') || macDinh;
    } catch {
        return macDinh;
    }
}

export function ghiJson(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}
