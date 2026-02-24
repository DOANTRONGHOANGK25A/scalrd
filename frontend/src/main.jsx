import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import "./styles/app.css";

import DangKyStep1 from "./pages/DangKyStep1.jsx";
import DangKyStep2 from "./pages/DangKyStep2.jsx";
import DangKyStep3 from "./pages/DangKyStep3.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import TemplateGallery from "./pages/TemplateGallery.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";
import TagGate from "./pages/TagGate.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminPanel from "./pages/admin/AdminPanel.jsx";

// Templates
import WeddingTemplate from "./templates/WeddingTemplate.jsx";
import PetTemplate from "./templates/PetTemplate.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#22c55e',
                    borderRadius: 10,
                },
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminPanel />} />

                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/dang-ky/1" element={<DangKyStep1 />} />
                    <Route path="/dang-ky/2" element={<DangKyStep2 />} />
                    <Route path="/dang-ky/3" element={<DangKyStep3 />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/mau" element={<TemplateGallery />} />

                    {/* Template Editor Routes */}
                    <Route path="/template/wedding" element={<WeddingTemplate />} />
                    <Route path="/template/pet" element={<PetTemplate />} />


                    <Route path="/:tagId" element={<TagGate />} />



                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    </React.StrictMode>
);
