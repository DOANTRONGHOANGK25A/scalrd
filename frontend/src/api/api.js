import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || "";

const http = axios.create({
    baseURL: apiBase,
});

function errMsg(e) {
    return e?.response?.data?.message || e.message || "Request error";
}

export async function apiGet(url, config) {
    try {
        const res = await http.get(url, config);
        return res.data;
    } catch (e) {
        throw new Error(errMsg(e));
    }
}

export async function apiPost(url, data, config) {
    try {
        const res = await http.post(url, data, config);
        return res.data;
    } catch (e) {
        throw new Error(errMsg(e));
    }
}

export async function apiPut(url, data, config) {
    try {
        const res = await http.put(url, data, config);
        return res.data;
    } catch (e) {
        throw new Error(errMsg(e));
    }
}

export async function apiDelete(url, config) {
    try {
        const res = await http.delete(url, config);
        return res.data;
    } catch (e) {
        throw new Error(errMsg(e));
    }
}
