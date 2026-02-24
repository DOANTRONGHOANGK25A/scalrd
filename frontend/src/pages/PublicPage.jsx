export default function PublicPage({ tagId }) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    const src = `${apiBase}/api/public/page-by-tag/${encodeURIComponent(tagId)}`;

    return (
        <iframe
            title="Public Page"
            src={src}
            style={{ width: "100vw", height: "100vh", border: "none" }}
        />
    );
}
