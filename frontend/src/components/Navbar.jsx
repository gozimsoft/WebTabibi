// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Btn } from "./SharedUI";

// Two keyframes defined once — no classes, applied via inline style
const ANIM_STYLE = {
  right:  { animation: "nb-rot-r 1s ease-in-out" },
  left:   { animation: "nb-rot-l 1s ease-in-out" },
  flip:   { animation: "nb-flip-y 1s ease-in-out" },
  pulse:  { animation: "nb-pulse 1s ease-in-out" },
  bounce: { animation: "nb-bounce 1s ease-in-out" },
};

export default function Navbar({ user, navigate, onLogout }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [logoAnim, setLogoAnim] = useState({});
  const [textAnim, setTextAnim] = useState({});
  const menuRef = useRef(null);
  const name = user?.profile?.fullname?.split(" ")[0] || user?.username || "U";

  useEffect(() => {
    let timeoutId;
    const trigger = () => {
      const keys = Object.keys(ANIM_STYLE);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setLogoAnim(ANIM_STYLE[randomKey]);
      setTimeout(() => setLogoAnim({}), 1100);
      
      // Random delay between 5 and 30 seconds
      const nextDelay = Math.floor(Math.random() * (30000 - 5000 + 1)) + 5000;
      timeoutId = setTimeout(trigger, nextDelay);
    };
    
    timeoutId = setTimeout(trigger, 800);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("touchstart", onClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
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
      {/* Keyframes injected once — no class system */}
      <style>{`
        @keyframes nb-rot-r {
          0%   { transform: rotate(0deg)   scale(1);   }
          50%  { transform: rotate(180deg) scale(1.15);}
          100% { transform: rotate(360deg) scale(1);   }
        }
        @keyframes nb-rot-l {
          0%   { transform: rotate(0deg)    scale(1);   }
          50%  { transform: rotate(-180deg) scale(1.15);}
          100% { transform: rotate(-360deg) scale(1);   }
        }
        @keyframes nb-flip-v {
          0%   { transform: scaleY(1);  color: #0e7490; }
          50%  { transform: scaleY(-1); color: #0891b2; }
          100% { transform: scaleY(1);  color: #0e7490; }
        }
        @keyframes nb-flip-y {
          0%   { transform: rotateY(0deg);   }
          50%  { transform: rotateY(180deg) scale(1.2); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes nb-pulse {
          0%   { transform: scale(1);   }
          50%  { transform: scale(1.2); }
          100% { transform: scale(1);   }
        }
        @keyframes nb-bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>

      {/* logo */}
      <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,146,162,0.15)",
          ...logoAnim  // inline animation applied here
        }}>
          <img
            src={`${import.meta.env.BASE_URL}logo.png?v=10`}
            alt="logo"
            style={{ width: 30, height: 30, objectFit: "contain" }}
          />
        </div>
        <div style={{ perspective: "400px" }}>
          <div
            onMouseEnter={() => setTextAnim({ animation: "nb-flip-v 0.5s ease-in-out" })}
            onMouseLeave={() => setTimeout(() => setTextAnim({}), 500)}
            style={{
              fontWeight: 900, fontSize: 18, color: "#0e7490", lineHeight: 1.1,
              display: "inline-block",
              ...textAnim
            }}
          >
            {t("app_name")}
          </div>
          <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase" }}>Tabibi</div>
        </div>
      </div>

      {/* Nav items */}
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
                    cursor: "pointer", textAlign: i18n.language === 'ar' ? "right" : "left",
                    display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151", transition: "background 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <span>{ic}</span><span style={{ fontWeight: 600 }}>{lb}</span>
                  </button>
                ))}
                <div style={{ borderTop: "1px solid #f3f4f6" }} />
                <button onClick={() => { onLogout(); setOpen(false); }} style={{
                  width: "100%", padding: "11px 16px", background: "none", border: "none",
                  cursor: "pointer", textAlign: i18n.language === 'ar' ? "right" : "left",
                  display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#dc2626"
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
