
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
