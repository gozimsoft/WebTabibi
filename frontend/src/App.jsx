// src/App.jsx
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/AuthContext";
import { useRoute } from "./hooks/useRoute";

// Components
import Navbar from "./components/Navbar";
import { Spinner, Btn } from "./components/SharedUI";

// Pages
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import SearchPage from "./pages/Search";
import DoctorDetailPage from "./pages/DoctorDetail";
import BookPage from "./pages/Book";
import AppointmentsPage from "./pages/Appointments";
import ProfilePage from "./pages/Profile";
import ChatPage from "./pages/Chat";

export default function App() {
  const { t, i18n } = useTranslation();
  const { user, loading, login, register, logout } = useAuth();
  const { route, qs, navigate } = useRoute();

  // Set direction and font based on language
  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.body.style.fontFamily = i18n.language === "ar" ? "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" : "'Inter', system-ui, sans-serif";
  }, [i18n.language]);

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner size={40} /></div>;

  const renderPage = () => {
    // Auth guards
    const needsAuth = ["/profile", "/appointments", "/chat", "/book"].some(p => route.startsWith(p));
    if (needsAuth && !user) return <LoginPage onLogin={login} navigate={navigate} />;

    // Routes
    if (route === "/") return <HomePage user={user} navigate={navigate} />;
    if (route === "/login") return <LoginPage onLogin={login} navigate={navigate} />;
    if (route === "/register") return <RegisterPage onRegister={register} navigate={navigate} />;
    if (route === "/search") return <SearchPage navigate={navigate} qs={qs} />;
    if (route === "/profile") return <ProfilePage user={user} />;
    if (route === "/appointments") return <AppointmentsPage navigate={navigate} />;
    if (route === "/chat") return <ChatPage user={user} />;
    
    // Dynamic Routes
    const clinicDoctorMatch = route.match(/^\/clinic\/([^/]+)\/doctor\/([^/]+)\/?$/);
    if (clinicDoctorMatch) return <DoctorDetailPage clinicId={clinicDoctorMatch[1]} doctorId={clinicDoctorMatch[2]} navigate={navigate} user={user} />;

    const bookMatch = route.match(/^\/book\/([^/]+)\/([^/]+)\/?$/);
    if (bookMatch) return <BookPage clinicId={bookMatch[1]} doctorId={bookMatch[2]} navigate={navigate} user={user} />;

    // 404
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🛸</div>
        <h1 style={{ color: "#0c4a6e" }}>{t("page_not_found")}</h1>
        <p style={{ color: "#6b7280", marginBottom: 30 }}>{t("page_not_found_desc") || "The page you are looking for does not exist."}</p>
        <Btn onClick={() => navigate("/")}>{t("home")}</Btn>
      </div>
    );
  };

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <Navbar user={user} navigate={navigate} onLogout={logout} />
      <main>{renderPage()}</main>
      
      {/* Global Footer */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e5e7eb", padding: "40px 24px", marginTop: 40 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 30 }}>
          <div>
            <div style={{ fontWeight: 900, color: "#0891b2", fontSize: 18, marginBottom: 12 }}>🏥 {t("app_name")}</div>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{t("footer_description")}</p>
          </div>
          <div>
            <h4 style={{ fontSize: 14, color: "#374151", marginBottom: 16 }}>{t("quick_links")}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <span onClick={() => navigate("/search")} style={{ cursor: "pointer", color: "#6b7280" }}>{t("search")}</span>
              <span onClick={() => navigate("/register")} style={{ cursor: "pointer", color: "#6b7280" }}>{t("register")}</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, color: "#374151", marginBottom: 16 }}>{t("contact")}</h4>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
              Email: contact@tabibi.dz<br />
              Phone: +213 699 00 00 00
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", borderTop: "1px solid #f3f4f6", marginTop: 30, paddingTop: 20, fontSize: 12, color: "#9ca3af" }}>
          &copy; {new Date().getFullYear()} Tabibi.dz - All rights reserved.
        </div>
      </footer>

      {/* Global CSS */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        * { box-sizing: border-box; }
        body { margin: 0; background: #f9fafb; -webkit-font-smoothing: antialiased; }
        main { min-height: 70vh; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #0891b240; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #0891b260; }
      `}</style>
    </div>
  );
}
