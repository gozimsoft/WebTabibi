import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Database, Monitor, CheckCircle, Info } from "lucide-react";

export default function InstallPage({ navigate }) {
  const [copied, setCopied] = useState(false);

  const PROGRAM_LINK = "https://stellarsoft.dz/download/Tabibi.exe";
  const SQL_SERVER_LINK = "https://stellarsoft.dz/download/server_sql.msi";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      color: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Ornaments */}
      <div style={{
        position: "absolute", top: "-10%", left: "-5%", width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(15,23,42,0) 70%)",
        borderRadius: "50%", zIndex: 0
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-5%", width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(15,23,42,0) 70%)",
        borderRadius: "50%", zIndex: 0
      }} />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ zIndex: 1, maxWidth: "800px", width: "100%", textAlign: "center" }}
      >
        <motion.div variants={itemVariants} style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
          <div style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            padding: "8px 24px", borderRadius: "30px", backdropFilter: "blur(10px)",
            display: "inline-flex", alignItems: "center", gap: "8px",
            color: "#38bdf8", fontWeight: "600", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px"
          }}>
            <Monitor size={16} />
            <span>بوابة التحميل الرسمية</span>
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} style={{
          fontSize: "clamp(32px, 5vw, 56px)", fontWeight: "900", marginBottom: "24px",
          background: "linear-gradient(to right, #ffffff, #94a3b8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          lineHeight: "1.2"
        }}>
          حمّل نظام طبيبي المتكامل
        </motion.h1>

        <motion.p variants={itemVariants} style={{
          fontSize: "clamp(16px, 2vw, 20px)", color: "#94a3b8", marginBottom: "60px",
          maxWidth: "600px", margin: "0 auto 60px", lineHeight: "1.6"
        }}>
          احصل على أحدث نسخة من برنامج طبيبي لإدارة العيادات، بالإضافة إلى نظام إدارة قواعد البيانات اللازم لتشغيل النظام بكفاءة وأمان.
        </motion.p>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px",
          width: "100%", padding: "0 10px"
        }}>
          {/* Main App Download Card */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} style={{
            background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(14, 165, 233, 0.3)",
            borderRadius: "24px", padding: "40px 30px",
            backdropFilter: "blur(12px)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            display: "flex", flexDirection: "column", alignItems: "center", position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "4px",
              background: "linear-gradient(90deg, #0ea5e9, #38bdf8)"
            }} />
            <div style={{
              width: "80px", height: "80px", borderRadius: "20px",
              background: "rgba(14, 165, 233, 0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "24px", color: "#38bdf8"
            }}>
              <Monitor size={40} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px", color: "#fff" }}>
              برنامج طبيبي
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "30px", lineHeight: "1.5" }}>
              النسخة الرسمية من نظام إدارة العيادات (Tabibi.exe). متوافق مع جميع أنظمة ويندوز الحديثة.
            </p>
            <motion.a
              href={PROGRAM_LINK}
              download
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: "100%", padding: "16px", borderRadius: "16px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                color: "#fff", textDecoration: "none", fontWeight: "700", fontSize: "16px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                boxShadow: "0 10px 25px rgba(14, 165, 233, 0.3)", border: "none", cursor: "pointer"
              }}
            >
              <Download size={20} />
              تحميل البرنامج
            </motion.a>
          </motion.div>

          {/* SQL Server Download Card */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} style={{
            background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "24px", padding: "40px 30px",
            backdropFilter: "blur(12px)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            display: "flex", flexDirection: "column", alignItems: "center", position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "4px",
              background: "linear-gradient(90deg, #10b981, #34d399)"
            }} />
            <div style={{
              width: "80px", height: "80px", borderRadius: "20px",
              background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "24px", color: "#34d399"
            }}>
              <Database size={40} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px", color: "#fff" }}>
              نظام قواعد البيانات
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "30px", lineHeight: "1.5" }}>
              خادم قواعد البيانات My Sql المطلوب لتشغيل البرنامج وحفظ البيانات بأمان وموثوقية عالية.
            </p>
            <motion.a
              href={SQL_SERVER_LINK}
              download
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: "100%", padding: "16px", borderRadius: "16px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff", textDecoration: "none", fontWeight: "700", fontSize: "16px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)", border: "none", cursor: "pointer"
              }}
            >
              <Download size={20} />
              تحميل My Sql
            </motion.a>
          </motion.div>
        </div>
        
        <motion.div variants={itemVariants} style={{
          marginTop: "60px", padding: "20px", background: "rgba(255,255,255,0.03)",
          borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)",
          display: "inline-flex", alignItems: "flex-start", gap: "16px", textAlign: "right"
        }}>
          <Info size={24} color="#94a3b8" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6" }}>
            <strong>تعليمات التثبيت:</strong><br />
            1. قم بتحميل نظام قواعد البيانات (My Sql) وتثبيته أولاً.<br />
            2. بعد اكتمال تثبيت قواعد البيانات، قم بتحميل برنامج طبيبي وتثبيته.<br />
            3. في حال وجود استفسار أو مشكلة في التثبيت، يرجى التواصل مع الدعم الفني.
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
