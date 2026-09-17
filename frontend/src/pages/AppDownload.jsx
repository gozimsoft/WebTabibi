// src/pages/AppDownload.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Apple, ShieldCheck, Users, Star,
  Share2, Check, Moon, Sun, ArrowLeft, ArrowRight
} from "lucide-react";
import { useToast } from "../components/SharedUI";

// ── Floating Background Medical Watermark SVGs ──
const StethoscopeIcon = ({ size = 80, opacity = 0.14, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ position: "absolute", pointerEvents: "none", opacity, ...style }}>
    <circle cx="56" cy="18" r="8" stroke="white" strokeWidth="3" fill="none" />
    <path d="M48 18 C48 18 36 18 36 34 C36 50 48 54 48 66 C48 72 42 76 36 76 C30 76 24 72 24 66" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="24" cy="66" r="5" fill="white" fillOpacity="0.4" />
    <path d="M56 26 L56 38" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const PillIcon = ({ size = 60, opacity = 0.16, style = {} }) => (
  <svg width={size} height={size * 0.48} viewBox="0 0 60 29" fill="none" style={{ position: "absolute", pointerEvents: "none", opacity, ...style }}>
    <rect x="1.5" y="1.5" width="57" height="26" rx="13" stroke="white" strokeWidth="2.5" fill="none" />
    <line x1="30" y1="1.5" x2="30" y2="27.5" stroke="white" strokeWidth="2.5" />
  </svg>
);

const CrescentIcon = ({ size = 32, opacity = 0.15, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ position: "absolute", pointerEvents: "none", opacity, ...style }}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="white" />
  </svg>
);

const SyringeIcon = ({ size = 100, opacity = 0.14, style = {} }) => (
  <svg width={size} height={size * 0.32} viewBox="0 0 100 32" fill="none" style={{ position: "absolute", pointerEvents: "none", opacity, ...style }}>
    <rect x="18" y="9" width="62" height="14" rx="3.5" stroke="white" strokeWidth="2.5" fill="none" />
    <line x1="80" y1="16" x2="98" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18 16 L3 9 L3 23 Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
    <line x1="18" y1="3" x2="18" y2="29" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Google Play Icon
const GooglePlayLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M3.6 2.3A1.8 1.8 0 0 0 3 3.6v16.8a1.8 1.8 0 0 0 .6 1.3l9.8-9.8L3.6 2.3z" fill="#00D3FF" />
    <path d="M16.8 15.3l-3.4-3.4-9.8 9.8c.4.3 1 .4 1.6.1l11.6-6.5z" fill="#FF3333" />
    <path d="M16.8 8.7L5.2 2.2C4.6 1.9 4 2 3.6 2.3l9.8 9.8 3.4-3.4z" fill="#00E676" />
    <path d="M20.6 10.7l-3.8-2.1-3.4 3.4 3.4 3.4 3.8-2.1c1.1-.6 1.1-2 0-2.6z" fill="#FFD400" />
  </svg>
);

// Android Robot Icon
const AndroidLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71a.495.495 0 0 0-.71 0l-1.48 1.48C13.62 2.24 12.83 2 12 2c-.83 0-1.62.24-2.31.63L8.21 1.15a.495.495 0 0 0-.71 0c-.2.2-.2.51 0 .71l1.3 1.3C7.14 4.19 6 5.96 6 8h12c0-2.04-1.14-3.81-2.47-4.84zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </svg>
);

export default function AppDownloadPage({ navigate }) {
  const { t, i18n } = useTranslation();
  const { show, Toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const isRtl = i18n.language === "ar";
  const baseUrl = import.meta.env.BASE_URL || "/";

  // App download URLs
  const LOCAL_APK_URL = `${baseUrl}tabibi.apk`;
  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=dz.tabibi.app";
  const APP_STORE_URL = "https://apps.apple.com/app/tabibi/id";

  // Official screenshot inside phone frame
  const APP_PREVIEW_IMG = `${baseUrl}app_mobile_preview.jpg`;

  const copyShareLink = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        show(t("app_link_copied", "Lien de l'application copié avec succès !"), "success");
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        setCopied(true);
        show(url, "info");
      });
    } else {
      setCopied(true);
      show(url, "info");
    }
  };

  const handleDownloadApk = () => {
    show(t("app_download_started", "Téléchargement de Tabibi (APK) en cours..."), "info");
    const link = document.createElement("a");
    link.href = LOCAL_APK_URL;
    link.setAttribute("download", "Tabibi.apk");
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const langs = [
    { code: "ar", label: "العربية", flag: "🇩🇿" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇺🇸" }
  ];
  const currentLang = langs.find(l => l.code === i18n.language) || langs[1];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--brand, #0891b2)",
      color: "#fff",
      position: "relative",
      overflowX: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      {/* Ambient Medical Watermark SVGs */}
      <StethoscopeIcon size={130} opacity={0.15} style={{ top: -20, left: -20, transform: "rotate(-15deg)" }} />
      <StethoscopeIcon size={80} opacity={0.14} style={{ top: "45%", right: "4%", transform: "rotate(20deg)" }} />
      <StethoscopeIcon size={95} opacity={0.13} style={{ bottom: "8%", left: "5%", transform: "rotate(45deg)" }} />

      <PillIcon size={55} opacity={0.17} style={{ top: "12%", right: "18%", transform: "rotate(-25deg)" }} />
      <PillIcon size={42} opacity={0.14} style={{ bottom: "28%", right: "8%", transform: "rotate(40deg)" }} />
      <PillIcon size={65} opacity={0.16} style={{ top: "68%", left: "3%", transform: "rotate(-10deg)" }} />

      <CrescentIcon size={34} opacity={0.15} style={{ top: "10%", left: "28%", transform: "rotate(-10deg)" }} />
      <CrescentIcon size={24} opacity={0.13} style={{ bottom: "35%", left: "38%", transform: "rotate(20deg)" }} />
      <CrescentIcon size={40} opacity={0.16} style={{ top: "52%", left: "20%", transform: "rotate(15deg)" }} />

      <SyringeIcon size={120} opacity={0.15} style={{ top: "6%", right: "26%", transform: "rotate(-30deg)" }} />
      <SyringeIcon size={85} opacity={0.13} style={{ bottom: "16%", right: "22%", transform: "rotate(15deg)" }} />

      {/* ── Discreet Top Brand Bar (Replaces cluttered Navbar with clean Mobile Header) ── */}
      <header style={{
        position: "relative",
        zIndex: 10,
        padding: "16px 20px",
        maxWidth: 1200,
        width: "100%",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Logo and Home Link */}
        <div
          onClick={() => navigate ? navigate("/") : (window.location.hash = "#/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
            padding: "6px 14px",
            borderRadius: 30,
            border: "1px solid rgba(255,255,255,0.22)",
            transition: "all 0.2s ease"
          }}
        >
          <img src={`${baseUrl}logo.png`} alt="Tabibi Logo" style={{ width: 26, height: 26, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: 0.5 }}>Tabibi</span>
        </div>

        {/* Language Switcher Pill */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            style={{
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>{currentLang.flag}</span>
            <span>{currentLang.code.toUpperCase()}</span>
            <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
          </button>

          {langMenuOpen && (
            <div style={{
              position: "absolute",
              top: 40,
              [isRtl ? "left" : "right"]: 0,
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(16px)",
              borderRadius: 14,
              padding: 6,
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.2)",
              zIndex: 100,
              minWidth: 130
            }}>
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    i18n.changeLanguage(l.code);
                    setLangMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    background: i18n.language === l.code ? "rgba(8,145,178,0.5)" : "transparent",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: isRtl ? "right" : "left"
                  }}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Main Hero Section (Responsive 2-column or stacked mobile) ── */}
      <main style={{
        maxWidth: 1200,
        width: "100%",
        margin: "0 auto",
        padding: "16px 20px 40px",
        position: "relative",
        zIndex: 2,
        flex: 1,
        display: "flex",
        alignItems: "center"
      }}>
        <div className="tabibi-app-grid" style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "clamp(24px, 4vw, 48px)",
          alignItems: "center"
        }}>
          {/* Column 1: Value Proposition & Downloads */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: 580 }}
          >
            {/* Tag Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 30,
              padding: "6px 16px",
              color: "#fff",
              fontSize: "clamp(11.5px, 3.2vw, 13px)",
              fontWeight: 700,
              marginBottom: 16,
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ width: 8, height: 8, background: "#7ffff4", borderRadius: "50%", boxShadow: "0 0 10px #7ffff4", flexShrink: 0 }} />
              <span>{t("app_hero_tag", "L'application médicale N°1 en Algérie")}</span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(24px, 6.2vw, 46px)",
              fontWeight: 900,
              lineHeight: 1.22,
              margin: "0 0 16px",
              color: "#fff"
            }}>
              {t("app_hero_title_1", "Votre santé et celle de votre famille...")} <br />
              <span style={{ color: "#7ffff4", textShadow: "0 2px 14px rgba(0,0,0,0.15)" }}>
                {t("app_hero_title_2", "À portée de main en une seule application")}
              </span>
            </h1>

            {/* Description Paragraph */}
            <p style={{
              fontSize: "clamp(14px, 3.8vw, 16px)",
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.92)",
              margin: "0 0 28px"
            }}>
              {t("app_hero_desc", "Téléchargez l'application Tabibi dès maintenant et profitez d'une expérience médicale complète : trouvez les meilleurs médecins dans 58 wilayas, réservez instantanément sans attente, recevez des rappels intelligents et échangez en toute sécurité.")}
            </p>

            {/* Action Buttons Container */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 500 }}>
              {/* Primary: Direct APK Button */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleDownloadApk}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderRadius: 16,
                  padding: "13px 18px",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  boxShadow: "0 10px 25px rgba(16,185,129,0.35)",
                  transition: "all 0.2s ease",
                  gap: 8
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    flexShrink: 0
                  }}>
                    <AndroidLogo />
                  </div>
                  <div style={{ textAlign: isRtl ? "right" : "left", minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, opacity: 0.9, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t("app_direct_download_tag", "Installation directe pour Android")}
                    </div>
                    <div style={{ fontSize: "clamp(14px, 4vw, 17px)", fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t("app_direct_apk_btn", "Téléchargement direct APK")}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.25)",
                  borderRadius: 10,
                  padding: "5px 10px",
                  fontSize: 11.5,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexShrink: 0
                }}>
                  <Download size={15} />
                  <span>v1.2.0 • 14.8 Mo</span>
                </div>
              </motion.button>

              {/* Secondary Row: Google Play & App Store */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {/* Google Play */}
                <motion.a
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(15, 23, 42, 0.78)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 14,
                    padding: "10px 14px",
                    color: "#fff",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    minWidth: 0
                  }}
                >
                  <GooglePlayLogo />
                  <div style={{ textAlign: isRtl ? "right" : "left", minWidth: 0 }}>
                    <div style={{ fontSize: 9.5, opacity: 0.75, lineHeight: 1.1 }}>GET IT ON</div>
                    <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Google Play</div>
                  </div>
                </motion.a>

                {/* App Store (iOS) */}
                <motion.a
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(15, 23, 42, 0.78)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 14,
                    padding: "10px 14px",
                    color: "#fff",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    minWidth: 0
                  }}
                >
                  <Apple size={20} color="#fff" style={{ flexShrink: 0 }} />
                  <div style={{ textAlign: isRtl ? "right" : "left", minWidth: 0 }}>
                    <div style={{ fontSize: 9.5, opacity: 0.75, lineHeight: 1.1 }}>Download on</div>
                    <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>App Store</div>
                  </div>
                </motion.a>
              </div>
            </div>

            {/* Trust and Rating Indicators Row */}
            <div style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginTop: 22,
              flexWrap: "wrap",
              fontSize: "clamp(11.5px, 3.2vw, 13px)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Star size={16} color="#facc15" fill="#facc15" />
                <span style={{ fontWeight: 800 }}>4.9 / 5</span>
                <span style={{ fontSize: 11, opacity: 0.85 }}>({t("app_rating_count", "Plus de 10k avis")})</span>
              </div>
              <div style={{ height: 12, width: 1, background: "rgba(255,255,255,0.3)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <ShieldCheck size={16} color="#7ffff4" />
                <span style={{ fontWeight: 700 }}>{t("app_verified_safe", "100% Sûr et Gratuit")}</span>
              </div>
              <div style={{ height: 12, width: 1, background: "rgba(255,255,255,0.3)" }} />
              <button
                onClick={copyShareLink}
                style={{
                  background: "none",
                  border: "none",
                  color: "#7ffff4",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "inherit",
                  padding: 0
                }}
              >
                {copied ? <Check size={14} color="#4ade80" /> : <Share2 size={14} />}
                <span>{copied ? t("copied", "Copié !") : t("share_app", "Partager le lien")}</span>
              </button>
            </div>
          </motion.div>

          {/* Column 2: Responsive Smartphone Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              padding: "16px 12px"
            }}
          >
            {/* Smartphone Mockup Container */}
            <div style={{
              width: "clamp(260px, 72vw, 320px)",
              height: "clamp(520px, 144vw, 640px)",
              background: "#0f172a",
              borderRadius: "clamp(38px, 9vw, 48px)",
              padding: "clamp(7px, 2vw, 10px)",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.22)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0
            }}>
              {/* Dynamic Island Notch */}
              <div style={{
                position: "absolute",
                top: 14,
                left: "50%",
                transform: "translateX(-50%)",
                width: 90,
                height: 18,
                background: "#000",
                borderRadius: 20,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1e293b" }} />
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#0891b2" }} />
              </div>

              {/* Phone Screen: Authentic Screenshot */}
              <div style={{
                flex: 1,
                borderRadius: "clamp(30px, 7vw, 38px)",
                overflow: "hidden",
                position: "relative",
                background: "#0891b2"
              }}>
                <img
                  src={APP_PREVIEW_IMG}
                  alt="Application Mobile Tabibi"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                />
              </div>

              {/* Bottom Home Indicator Bar */}
              <div style={{
                width: 96,
                height: 4,
                background: "rgba(255,255,255,0.5)",
                borderRadius: 4,
                margin: "7px auto 2px"
              }} />

              {/* Floating Highlight Badge 1 (Top Left / Right) */}
              <div style={{
                position: "absolute",
                top: 60,
                [isRtl ? "right" : "left"]: -12,
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(12px)",
                color: "#0c4a6e",
                borderRadius: 14,
                padding: "7px 12px",
                fontSize: "clamp(11px, 3vw, 12.5px)",
                fontWeight: 800,
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                zIndex: 12,
                border: "1px solid rgba(255,255,255,0.8)"
              }}>
                <Star size={15} color="#f59e0b" fill="#f59e0b" />
                <span>4.9 ★ (10k+ avis)</span>
              </div>

              {/* Floating Highlight Badge 2 (Bottom Right / Left) */}
              <div style={{
                position: "absolute",
                bottom: 80,
                [isRtl ? "left" : "right"]: -12,
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(12px)",
                color: "#0891b2",
                borderRadius: 14,
                padding: "7px 12px",
                fontSize: "clamp(11px, 3vw, 12.5px)",
                fontWeight: 800,
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                zIndex: 12,
                border: "1px solid rgba(255,255,255,0.8)"
              }}>
                <Users size={15} color="#0891b2" />
                <span>31K+ Patients</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Toast />

      {/* Embedded CSS for perfect responsive behaviors */}
      <style>{`
        @media (max-width: 850px) {
          .tabibi-app-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .tabibi-app-grid > div:first-child {
            margin: 0 auto;
          }
          .tabibi-app-grid p {
            margin-left: auto;
            margin-right: auto;
          }
          .tabibi-app-grid button,
          .tabibi-app-grid div[style*="flex-direction: column"] {
            margin-left: auto;
            margin-right: auto;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
