import React from "react";
import { motion } from "framer-motion";
import { Download, Database, Monitor, Info, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

// صفحة تحميل وتثبيت برنامج طبيبي وسيرفر طبيبي (تصميم أنيق بدون صور مع دعم كامل للغات و LTR/RTL)
export default function InstallPage({ navigate }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const PROGRAM_LINK = "https://stellarsoft.dz/download/Tabibi.exe";
  const SQL_SERVER_LINK = "https://stellarsoft.dz/download/server_sql.msi";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div 
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b1120 0%, #111827 50%, #0f172a 100%)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "50px 20px 80px",
        position: "relative",
        overflow: "hidden",
        fontFamily: isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif"
      }}
    >
      {/* Background Ambient Orbs */}
      <div style={{
        position: "absolute", top: "-12%", left: isRtl ? "auto" : "-6%", right: isRtl ? "-6%" : "auto",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(14, 165, 233, 0.14) 0%, rgba(15, 23, 42, 0) 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: isRtl ? "auto" : "-6%", left: isRtl ? "-6%" : "auto",
        width: "550px", height: "550px",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0) 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0
      }} />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ zIndex: 1, maxWidth: "920px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {/* Navigation & Official Portal Badge */}
        <motion.div variants={itemVariants} style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
          {navigate && (
            <button
              onClick={() => navigate("/")}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                padding: "8px 14px", borderRadius: "20px", color: "#94a3b8", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              <span>{t("back_to_home", "Accueil")}</span>
            </button>
          )}

          <div style={{
            background: "rgba(14, 165, 233, 0.1)", border: "1px solid rgba(14, 165, 233, 0.3)",
            padding: "8px 20px", borderRadius: "30px", backdropFilter: "blur(10px)",
            display: "inline-flex", alignItems: "center", gap: "8px",
            color: "#38bdf8", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px"
          }}>
            <Monitor size={15} />
            <span>{t("install_portal_badge", "Portail officiel de téléchargement")}</span>
          </div>
        </motion.div>

        {/* Hero Title & Subtitle */}
        <motion.h1 variants={itemVariants} style={{
          fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: "900", marginBottom: "16px",
          background: "linear-gradient(to right, #ffffff 30%, #94a3b8 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          lineHeight: "1.25", textAlign: "center"
        }}>
          {t("install_hero_title", "Téléchargez le système intégré Tabibi")}
        </motion.h1>

        <motion.p variants={itemVariants} style={{
          fontSize: "clamp(15px, 1.8vw, 17px)", color: "#94a3b8", marginBottom: "48px",
          maxWidth: "720px", margin: "0 auto 48px", lineHeight: "1.7", textAlign: "center"
        }}>
          {t("install_hero_desc", "Obtenez la dernière version du logiciel Tabibi pour la gestion de cabinets et cliniques, ainsi que le système de gestion de base de données nécessaire pour faire fonctionner le système avec efficacité et sécurité.")}
        </motion.p>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2 Cartes de téléchargement : Logiciel Tabibi & SERVEUR TABIBI
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          width: "100%",
          marginBottom: "36px"
        }}>
          {/* Carte 1 : Logiciel Tabibi */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6 }}
            style={{
              background: "rgba(30, 41, 59, 0.72)",
              border: "1px solid rgba(14, 165, 233, 0.35)",
              borderRadius: "24px",
              padding: "36px 30px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              transition: "box-shadow 0.3s ease, border-color 0.3s ease"
            }}
          >
            {/* Top decorative gradient line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "4px",
              background: "linear-gradient(90deg, #0ea5e9, #38bdf8)"
            }} />

            <div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px"
              }}>
                <div style={{
                  width: "68px", height: "68px", borderRadius: "20px",
                  background: "rgba(14, 165, 233, 0.12)", border: "1px solid rgba(14, 165, 233, 0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8"
                }}>
                  <Monitor size={36} />
                </div>
                <span style={{
                  fontSize: "12px", color: "#38bdf8", background: "rgba(14, 165, 233, 0.1)",
                  padding: "5px 14px", borderRadius: "12px", fontWeight: "600", border: "1px solid rgba(14, 165, 233, 0.25)"
                }}>
                  Windows • 64-bit
                </span>
              </div>

              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px", color: "#ffffff" }}>
                {t("install_app_title", "Logiciel Tabibi")}
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "32px", lineHeight: "1.6" }}>
                {t("install_app_desc", "Version officielle du logiciel de gestion de cliniques (Tabibi.exe). Compatible avec toutes les versions récentes de Windows.")}
              </p>
            </div>

            <motion.a
              href={PROGRAM_LINK}
              download
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%", padding: "16px", borderRadius: "16px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                color: "#ffffff", textDecoration: "none", fontWeight: "700", fontSize: "16px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                boxShadow: "0 10px 25px rgba(14, 165, 233, 0.35)", border: "none", cursor: "pointer"
              }}
            >
              <Download size={20} />
              <span>{t("install_download_app_btn", "Télécharger le logiciel")}</span>
            </motion.a>
          </motion.div>

          {/* Carte 2 : SERVEUR TABIBI */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6 }}
            style={{
              background: "rgba(30, 41, 59, 0.72)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "24px",
              padding: "36px 30px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              transition: "box-shadow 0.3s ease, border-color 0.3s ease"
            }}
          >
            {/* Top decorative gradient line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "4px",
              background: "linear-gradient(90deg, #10b981, #34d399)"
            }} />

            <div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px"
              }}>
                <div style={{
                  width: "68px", height: "68px", borderRadius: "20px",
                  background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399"
                }}>
                  <Database size={36} />
                </div>
                <span style={{
                  fontSize: "12px", color: "#34d399", background: "rgba(16, 185, 129, 0.1)",
                  padding: "5px 14px", borderRadius: "12px", fontWeight: "600", border: "1px solid rgba(16, 185, 129, 0.25)"
                }}>
                  SERVEUR TABIBI • MSI
                </span>
              </div>

              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px", color: "#ffffff" }}>
                {t("install_db_title", "SERVEUR TABIBI")}
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "32px", lineHeight: "1.6" }}>
                {t("install_db_desc", "Serveur Tabibi requis pour exécuter le logiciel et conserver les données de votre clinique avec un haut niveau de sécurité et de fiabilité.")}
              </p>
            </div>

            <motion.a
              href={SQL_SERVER_LINK}
              download
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%", padding: "16px", borderRadius: "16px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff", textDecoration: "none", fontWeight: "700", fontSize: "16px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.35)", border: "none", cursor: "pointer"
              }}
            >
              <Download size={20} />
              <span>{t("install_download_db_btn", "Télécharger SERVEUR TABIBI")}</span>
            </motion.a>
          </motion.div>
        </div>
        
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Instructions d'installation
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <motion.div variants={itemVariants} style={{
          padding: "26px 30px", background: "rgba(255,255,255,0.03)",
          borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "flex-start", gap: "18px",
          textAlign: isRtl ? "right" : "left",
          direction: isRtl ? "rtl" : "ltr",
          maxWidth: "920px", width: "100%",
          backdropFilter: "blur(12px)"
        }}>
          <Info size={26} color="#38bdf8" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.8", width: "100%" }}>
            <strong style={{ color: "#f8fafc", fontSize: "16px", display: "block", marginBottom: "8px" }}>
              {t("install_instructions_title", "Instructions d'installation :")}
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38bdf8", flexShrink: 0 }} />
                <span>{t("install_step_1", "1. Téléchargez d'abord le SERVEUR TABIBI et installez-le.")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
                <span>{t("install_step_2", "2. Une fois l'installation du SERVEUR TABIBI terminée, téléchargez et installez le logiciel Tabibi.")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#94a3b8", flexShrink: 0 }} />
                <span>{t("install_step_3", "3. En cas de question ou de difficulté lors de l'installation, veuillez contacter le support technique.")}</span>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
