// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card } from "../components/SharedUI";

export default function HomePage({ user, navigate }) {
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState("");
  const [specialties, setSP] = useState([]);
  useEffect(() => { api.specialties().then(setSP).catch(() => { }); }, []);

  const icons = { "Médecine générale": "🩺", "Dentisterie": "🦷", "Cardiologie": "❤️", "Ophtalmologie": "👁️", "Pédiatrie": "👶", "Gynécologie-obstétrique": "🤰", "Dermatologie": "🧴", "Neurologie": "🧠", "Orthopédie et traumatologie": "🦴", "Psychiatrie": "🧘", "Gastro-entérologie": "🫀", "Oncologie": "🎗️" };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0c4a6e,#0891b2,#06b6d4)", padding: "80px 24px 100px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "#7dd3fc", marginBottom: 12, fontWeight: 600 }}>{t("footer_description")}</p>
          <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
            {t("home_hero_title")}<br /><span style={{ color: "#7dd3fc" }}>{t("home_hero_subtitle")}</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", maxWidth: 460, margin: "0 auto 36px" }}>{t("home_hero_desc")}</p>
          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 14, padding: 8, display: "flex", gap: 8, maxWidth: 580, margin: "0 auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && navigate(`/search?q=${encodeURIComponent(q)}`)}
              placeholder={t("home_hero_placeholder")}
              style={{ flex: 1, padding: "11px 16px", border: "none", outline: "none", fontSize: 14, background: "transparent", direction: i18n.language === 'ar' ? "rtl" : "ltr" }}
            />
            <Btn onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)} style={{ padding: "11px 24px", borderRadius: 10 }}>{t("home_hero_btn")}</Btn>
          </div>
        </div>
      </div>
      <svg viewBox="0 0 1200 50" style={{ width: "100%", display: "block", marginTop: -1 }}><path d="M0,25 C300,50 900,0 1200,25 L1200,50 L0,50 Z" fill="#f9fafb" /></svg>

      {/* Stats */}
      <div style={{ maxWidth: 860, margin: "-20px auto 40px", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[[ "👨‍⚕️", "1200+", t("stats_doctors")], ["🏥", "800+", t("stats_clinics")], ["👥", "50000+", t("stats_patients")]].map(([ic, n, l]) => (
            <Card key={l} style={{ textAlign: "center", padding: "18px 12px" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{ic}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#0891b2" }}>{n}</div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{l}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div style={{ maxWidth: 1100, margin: "0 auto 60px", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0c4a6e", margin: 0 }}>{t("specialties_title")}</h2>
          <button onClick={() => navigate("/search")} style={{ color: "#0891b2", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>{t("view_all")}</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))", gap: 10 }}>
          {specialties.slice(0, 12).map(s => (
            <div key={s.ID} onClick={() => navigate(`/search?specialty=${s.ID}`)}
              style={{ background: "#fff", borderRadius: 12, padding: "14px 10px", textAlign: "center", cursor: "pointer", border: "1px solid #e5e7eb", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0891b2"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(8,145,178,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>{icons[s.NameFr] || "🩺"}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", lineHeight: 1.3 }}>{s.NameAr}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!user && (
        <div style={{ background: "linear-gradient(135deg,#ecfeff,#e0f7fa)", padding: "48px 24px", textAlign: "center", marginBottom: 0 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", marginBottom: 8 }}>{t("cta_title")}</h2>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>{t("cta_desc")}</p>
          <Btn onClick={() => navigate("/register")} style={{ padding: "13px 36px", fontSize: 15 }}>{t("cta_btn")}</Btn>
        </div>
      )}
    </div>
  );
}
