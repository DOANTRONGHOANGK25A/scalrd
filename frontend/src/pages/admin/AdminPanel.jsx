import { useEffect, useState } from "react";
import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || "";

function adminAxios() {
    const token = localStorage.getItem("admin_token") || "";
    return axios.create({
        baseURL: apiBase,
        headers: { Authorization: `Bearer ${token}` },
    });
}

export default function AdminPanel() {
    const [templates, setTemplates] = useState([]);
    const [tags, setTags] = useState([]);
    const [importText, setImportText] = useState(""); // mỗi dòng 1 tag

    async function loadAll() {
        const ax = adminAxios();
        const t = await ax.get("/api/admin/templates");
        const g = await ax.get("/api/admin/tags");
        setTemplates(t.data);
        setTags(g.data);
    }

    useEffect(() => {
        loadAll().catch((e) => alert(e.message));
    }, []);

    async function importTags() {
        const lines = importText.split("\n").map(s => s.trim()).filter(Boolean);
        const ax = adminAxios();
        await ax.post("/api/admin/tags/import", { tags: lines });
        setImportText("");
        await loadAll();
    }

    return (
        <div style={{ maxWidth: 1100, margin: "30px auto", padding: 20 }}>
            <h2>Admin Panel</h2>

            <h3>Templates</h3>
            <pre style={{ background: "#f3f4f6", padding: 12, borderRadius: 10, overflow: "auto" }}>
                {JSON.stringify(templates, null, 2)}
            </pre>

            <h3>NFC Tags</h3>
            <pre style={{ background: "#f3f4f6", padding: 12, borderRadius: 10, overflow: "auto" }}>
                {JSON.stringify(tags, null, 2)}
            </pre>

            <h3>Import tags (mỗi dòng 1 tag)</h3>
            <textarea rows={5} style={{ width: "100%" }} value={importText} onChange={(e) => setImportText(e.target.value)} />
            <button onClick={importTags} style={{ marginTop: 10 }}>Import</button>
        </div>
    );
}
