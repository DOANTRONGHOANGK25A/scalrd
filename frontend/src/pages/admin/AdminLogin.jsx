import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../api/api";

export default function AdminLogin() {
    const nav = useNavigate();
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("admin123");
    const [loading, setLoading] = useState(false);

    async function login() {
        setLoading(true);
        try {
            const rs = await apiPost("/api/admin/login", { username, password });
            localStorage.setItem("admin_token", rs.token);
            nav("/admin");
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 420, margin: "60px auto", padding: 20 }}>
            <h2>Admin Login</h2>
            <p style={{ opacity: 0.7 }}>Portal kín (không xuất hiện trên public UI)</p>

            <div style={{ marginTop: 12 }}>
                <div>Username</div>
                <input style={{ width: "100%" }} value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div style={{ marginTop: 12 }}>
                <div>Password</div>
                <input style={{ width: "100%" }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button style={{ width: "100%", marginTop: 16 }} onClick={login} disabled={loading}>
                {loading ? "..." : "Login"}
            </button>
        </div>
    );
}
