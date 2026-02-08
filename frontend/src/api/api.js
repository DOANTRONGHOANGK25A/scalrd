
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message;
        return Promise.reject(new Error(message));
    }
)

export async function apiGet(path) {
    const res = await api.get(path);
    return res.data;
}

export async function apiPost(path, body) {
    const res = await api.post(path, body);
    return res.data;
}

export async function apiPut(path, body) {
    const res = await api.put(path, body);
    return res.data;
}

export async function apiDelete(path) {
    const res = await api.delete(path);
    return res.data;
}
