// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card, Skeleton } from "../components/SharedUI";
import {
  Stethoscope, Heart, Baby, Brain, Activity, Droplets,
  ShieldCheck, Zap, HeartPulse, User, Building, Users
} from "lucide-react";

export default function HomePage({ user, navigate }) {
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState("");
  const [specialties, setSP] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);

  useEffect(() => { api.specialties().then(setSP).catch(() => { }); }, []);

  // Debounced suggestion fetch
  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.clinics.search({ q, limit: 5 });
        setSuggestions(res.items || []);
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const icons = {
    "Médecine générale": <Stethoscope size={32} />,
    "Dentisterie": <Activity size={32} />,
    "Cardiologie": <Heart size={32} />,
    "Ophtalmologie": <Zap size={32} />,
    "Pédiatrie": <Baby size={32} />,
    "Gynécologie-obstétrique": <Users size={32} />,
    "Dermatologie": <Droplets size={32} />,
    "Neurologie": <Brain size={32} />,
    "Orthopédie et traumatologie": <Activity size={32} />,
    "Psychiatrie": <HeartPulse size={32} />,
    "Gastro-entérologie": <Activity size={32} />,
    "Oncologie": <ShieldCheck size={32} />
  };

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
          <div style={{ position: "relative", background: "rgba(255,255,255,0.95)", borderRadius: 14, padding: 8, display: "flex", gap: 8, maxWidth: 580, margin: "0 auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input value={q} 
                onChange={e => { setQ(e.target.value); setShowSug(true); }}
                onFocus={() => setShowSug(true)}
                onKeyDown={e => e.key === "Enter" && navigate(`/search?q=${encodeURIComponent(q)}`)}
                placeholder={t("home_hero_placeholder")}
                style={{ width: "100%", padding: "11px 16px", border: "none", outline: "none", fontSize: 14, background: "transparent", direction: i18n.language === 'ar' ? "rtl" : "ltr" }}
              />
              
              {/* Quick Search Suggestions */}
              {showSug && q.trim().length >= 2 && (suggestions.length > 0 || specialties.filter(s => s.namear.includes(q) || s.namefr.toLowerCase().includes(q.toLowerCase())).length > 0) && (
                <div style={{
                  position: "absolute", top: "calc(100% + 15px)", left: 0, right: 0,
                  background: "#fff", borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  zIndex: 100, padding: 8, textAlign: i18n.language === 'ar' ? "right" : "left",
                  maxHeight: 400, overflowY: "auto", border: "1px solid var(--border)"
                }}>
                  {/* Specialty Suggestions */}
                  {specialties.filter(s => s.namear.includes(q) || s.namefr.toLowerCase().includes(q.toLowerCase())).slice(0, 3).map(s => (
                    <div key={s.id} onClick={() => navigate(`/search?specialty=${s.id}`)}
                      style={{ padding: "10px 16px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "0.2s" }}
                      className="hover-sug"
                      onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--brand-light)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {icons[s.namefr] || <Stethoscope size={18} />}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{i18n.language === 'ar' ? s.namear : s.namefr}</span>
                    </div>
                  ))}
                  
                  {/* Doctor Suggestions */}
                  {suggestions.map(r => {
                    const isDoc = r.ResultType === 'DOCTOR';
                    return (
                      <div key={r.ResultId} onClick={() => navigate(isDoc ? `/doctor/${r.doctor_id}` : `/clinic/${r.clinicid}`)}
                        style={{ padding: "10px 16px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: isDoc ? "#eff6ff" : "#fef2f2", color: isDoc ? "#2563eb" : "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isDoc ? <User size={18} /> : <Building size={18} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{isDoc ? r.doctorname : r.clinicname}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{isDoc ? (i18n.language === 'ar' ? r.specialtyar : r.specialtyfr) : r.activitysector}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <Btn onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)} style={{ padding: "11px 24px", borderRadius: 10 }}>{t("home_hero_btn")}</Btn>
          </div>
        </div>
      </div>
      <svg viewBox="0 0 1200 50" style={{ width: "100%", display: "block", marginTop: -1 }}><path d="M0,25 C300,50 900,0 1200,25 L1200,50 L0,50 Z" fill="#f9fafb" /></svg>

      {/* Stats */}
      <div style={{ maxWidth: 860, margin: "-20px auto 40px", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>

          {/* Stat: Médecins — avec la photo */}
          <div style={{
            borderRadius: 16,
            border: "1px solid var(--border)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            overflow: "hidden",
            position: "relative",
            height: 130,
            backgroundImage: "url('/stats_doctors_custom.png')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.0) 100%)",
            }} />
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>1200+</div>
              <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{t("stats_doctors")}</div>
            </div>
          </div>

          {/* Stat: Cliniques — avec la photo */}
          <div style={{
            borderRadius: 16,
            border: "1px solid var(--border)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            overflow: "hidden",
            position: "relative",
            height: 130,
            backgroundImage: "url('/stats_clinics_custom.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.0) 100%)",
            }} />
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>800+</div>
              <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{t("stats_clinics")}</div>
            </div>
          </div>

          {/* Stat: patients — avec la photo */}
          <div style={{
            borderRadius: 16,
            border: "1px solid var(--border)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            overflow: "hidden",
            position: "relative",
            height: 130,
            backgroundImage: "url('/stats_patients_custom.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.0) 100%)",
            }} />
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>50000+</div>
              <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{t("stats_patients")}</div>
            </div>
          </div>

        </div>
      </div>

      {/* specialties */}
      <div style={{ maxWidth: 1100, margin: "0 auto 60px", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0c4a6e", margin: 0 }}>{t("specialties_title")}</h2>
          <button onClick={() => navigate("/search")} style={{ color: "#0891b2", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>{t("view_all")}</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))", gap: 10 }}>
          {specialties.length === 0 ? (
            Array(12).fill(0).map((_, i) => <Skeleton key={i} height={80} borderRadius={12} />)
          ) : (
            specialties.slice(0, 12).map(s => (
              <div key={s.id} onClick={() => navigate(`/search?specialty=${s.id}`)}
                style={{ background: "#fff", borderRadius: 12, padding: "14px 10px", textAlign: "center", cursor: "pointer", border: "1px solid var(--border)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(8,145,178,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ color: "var(--brand)", marginBottom: 8, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {icons[s.namefr] || <Stethoscope size={32} />}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", lineHeight: 1.3 }}>{s.namear}</div>
              </div>
            ))
          )}
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
