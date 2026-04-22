// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Btn } from "./SharedUI";

export default function Navbar({ user, navigate, onLogout }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const name = user?.profile?.FullName?.split(" ")[0] || user?.username || "U";

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const navItems = [
    [t("search"), "/search", "🔍"],
    [t("my_appointments"), "/appointments", "📅"],
    [t("messages"), "/chat", "💬"],
  ];

  return (
    <nav style={{
      background: "#fff", borderBottom: "1px solid #e5e7eb",
      padding: "0 24px", height: 64, display: "flex",
      alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 500, boxShadow: "0 1px 8px rgba(0,0,0,0.06)"
    }}>
      <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0891b2,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 }}>🏥</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#0e7490", lineHeight: 1.1 }}>{t("app_name")}</div>
          <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase" }}>Tabibi</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <LanguageSwitcher />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {navItems.map(([l, p, ic]) => (
            <button key={p} onClick={() => navigate(p)} style={{
              background: "none", border: "none", cursor: "pointer", padding: "8px 12px",
              borderRadius: 8, color: "#374151", fontWeight: 600, fontSize: 13, transition: "all 0.15s",
              display: (!user && p !== "/search") ? "none" : "block"
            }}
              onMouseEnter={e => e.target.style.background = "#f3f4f6"}
              onMouseLeave={e => e.target.style.background = "none"}>
              <span style={{ marginLeft: i18n.language === 'ar' ? 4 : 0, marginRight: i18n.language !== 'ar' ? 4 : 0 }}>{ic}</span>
              {l}
            </button>
          ))}
        </div>
        {user ? (
          <div ref={menuRef} style={{ position: "relative" }}>
            <button onClick={() => setOpen(!open)} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
              border: "1px solid #6ee7b7", borderRadius: 30, padding: "6px 14px 6px 8px", cursor: "pointer"
            }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0891b2,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                {name[0].toUpperCase()}
              </div>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#065f46" }}>{name}</span>
              <span style={{ fontSize: 9, color: "#065f46" }}>▼</span>
            </button>
            {open && (
              <div style={{ position: "absolute", right: i18n.language === 'ar' ? 0 : 'auto', left: i18n.language === 'ar' ? 'auto' : 0, top: 46, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", minWidth: 180, overflow: "hidden", zIndex: 600 }}>
                {[
                  ["👤", t("profile"), "/profile"],
                  ["📅", t("my_appointments"), "/appointments"],
                  ["💬", t("messages"), "/chat"],
                ].map(([ic, lb, pt]) => (
                  <button key={pt} onClick={() => { navigate(pt); setOpen(false); }} style={{
                    width: "100%", padding: "11px 16px", background: "none", border: "none",
                    cursor: "pointer", textAlign: i18n.language === 'ar' ? "right" : "left", display: "flex", alignItems: "center",
                    gap: 10, fontSize: 14, color: "#374151", transition: "background 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <span>{ic}</span><span style={{ fontWeight: 600 }}>{lb}</span>
                  </button>
                ))}
                <div style={{ borderTop: "1px solid #f3f4f6" }} />
                <button onClick={() => { onLogout(); setOpen(false); }} style={{
                  width: "100%", padding: "11px 16px", background: "none", border: "none",
                  cursor: "pointer", textAlign: i18n.language === 'ar' ? "right" : "left", display: "flex", alignItems: "center",
                  gap: 10, fontSize: 14, color: "#dc2626"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <span>🚪</span><span style={{ fontWeight: 600 }}>{t("logout")}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={() => navigate("/login")} style={{ padding: "8px 18px" }}>{t("login")}</Btn>
            <Btn variant="primary" onClick={() => navigate("/register")} style={{ padding: "8px 18px" }}>{t("register")}</Btn>
          </div>
        )}
      </div>
    </nav>
  );
}
