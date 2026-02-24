import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../api/api";
import WelcomePage from "./WelcomePage";
import PublicPage from "./PublicPage";

function normalize(raw) {
    try {
        return decodeURIComponent(String(raw || "")).trim().toUpperCase();
    } catch {
        return String(raw || "").trim().toUpperCase();
    }
}

export default function TagGate() {
    const { tagId: rawTagId } = useParams();
    const tagId = normalize(rawTagId);

    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            localStorage.setItem("current_tag_id", tagId);

            try {
                const rs = await apiGet(`/api/public/tag/${encodeURIComponent(tagId)}`);
                setInfo(rs);
            } catch (e) {
                setInfo({ exists: false, error: e.message });
            } finally {
                setLoading(false);
            }
        })();
    }, [tagId]);

    if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

    if (!info?.exists) {
        return (
            <div style={{ padding: 24 }}>
                <h2>Tag chưa được đăng ký</h2>
                <p>{tagId}</p>
            </div>
        );
    }

    if (info.status === "UNONBOARDED") return <WelcomePage />;

    return <PublicPage tagId={tagId} />;
}
