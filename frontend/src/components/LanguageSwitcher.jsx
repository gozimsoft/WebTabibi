// src/components/LanguageSwitcher.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const langs = [
    { code: "ar", label: "العربية", flag: "🇩🇿" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇺🇸" },
  ];

  const current = langs.find((l) => l.code === i18n.language) || langs[0];

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#f3f4f6", border: "1px solid #e5e7eb",
          borderRadius: 8, padding: "8px 12px", cursor: "pointer",
          fontSize: 16, fontWeight: 600,
        }}
      >
        <span>{current.flag}</span>
        <span style={{ display: "none" }}>{current.label}</span>
        <span style={{ fontSize: 12 }}>▼</span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute", top: 40,
            right: i18n.language === 'ar' ? 'auto' : 0,
            left: i18n.language === 'ar' ? 0 : 'auto',
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000, minWidth: 120, overflow: "hidden",
          }}
        >
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                i18n.changeLanguage(l.code);
                setOpen(false);
              }}
              style={{
                width: "100%", padding: "10px 14px",
                background: i18n.language === l.code ? "#f0fdfa" : "none",
                border: "none", textAlign: i18n.language === 'ar' ? "right" : "left",
                cursor: "pointer", fontSize: 13,
                fontWeight: i18n.language === l.code ? 700 : 500,
                color: i18n.language === l.code ? "#0891b2" : "#374151",
                display: "flex", gap: 8,
              }}
            >
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
