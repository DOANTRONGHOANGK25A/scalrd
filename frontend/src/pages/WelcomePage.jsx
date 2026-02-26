import { useNavigate } from "react-router-dom";
import { StarFilled, SafetyCertificateFilled, ThunderboltFilled } from "@ant-design/icons";
import "../styles/welcome.css";

export default function WelcomePage() {
    const nav = useNavigate();

    const features = [
        {
            icon: <StarFilled />,
            bgColor: "#fef3c7",
            iconColor: "#f59e0b",
            title: "Beautiful templates",
            desc: "Wedding invites, CV, pet profiles, business cards...",
        },
        {
            icon: <SafetyCertificateFilled />,
            bgColor: "#dcfce7",
            iconColor: "#22c55e",
            title: "Privacy & Security",
            desc: "Your data is encrypted, you're in full control",
        },
        {
            icon: <ThunderboltFilled />,
            bgColor: "#e0e7ff",
            iconColor: "#6366f1",
            title: "Tap NFC to show",
            desc: "Share your info with just one tap",
        },
    ];

    return (
        <div className="welcome-page">
            <div className="welcome-inner">
                {/* Brand */}
                <div className="welcome-brand">Snapful</div>
                <div className="welcome-slogan">PERFECT IN EVERY PRODUCT</div>

                {/* Title */}
                <div className="welcome-title">Thank You! 🎁</div>
                <div className="welcome-subtitle">A heartfelt gift from Snapful</div>

                {/* Gift Card */}
                <div className="gift-card">
                    <div className="gift-card-visual">
                        <div className="gift-card-visual-inner">
                            <div className="gift-mockup-wrap">
                                <div className="gift-mockup">
                                    <div className="gift-mockup-avatar"></div>
                                    <div className="gift-mockup-line"></div>
                                    <div className="gift-mockup-line short"></div>
                                </div>
                                <div className="card-badge">
                                    <ThunderboltFilled />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="gift-card-content">
                        <div className="gift-card-title">More than just a gift</div>
                        <p className="gift-card-text">
                            Thank you for choosing Snapful! This is our special gift of appreciation for you.
                        </p>
                        <p className="gift-card-text">
                            This isn't just a product — it carries your unique story. Design your own profile and <span className="text-highlight">transform</span> this item into something that truly represents <strong>you.</strong>
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="features-list">
                    {features.map((f, i) => (
                        <div key={i} className="feature-item">
                            <div
                                className="feature-icon"
                                style={{ background: f.bgColor, color: f.iconColor }}
                            >
                                {f.icon}
                            </div>
                            <div className="feature-content">
                                <div className="feature-title">{f.title}</div>
                                <div className="feature-desc">{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Button */}
                <button className="welcome-btn" onClick={() => {
                    localStorage.removeItem("current_tag_id");
                    nav('/dang-ky/1');
                }}>
                    Create your personal page
                </button>

                {/* Terms */}
                <p className="welcome-terms">
                    By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}

