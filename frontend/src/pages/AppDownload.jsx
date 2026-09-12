// src/pages/AppDownload.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Download, Apple, QrCode, CheckCircle2, ShieldCheck,
  Zap, Bell, Calendar, Search, Users, MessageSquare, Star, ArrowRight,
  Share2, Check, Sparkles, HelpCircle, ChevronDown, ChevronUp,
  Cpu, Award, ExternalLink, Activity, HeartPulse, RefreshCw
} from "lucide-react";
import { Btn, Card, Badge, useToast } from "../components/SharedUI";

// QR Code SVG generator component
const AppQRCode = ({ value = "https://tabibi.dz/app" }) => (
  <div style={{
    background: "#fff",
    padding: 12,
    borderRadius: 16,
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px solid #e2e8f0"
  }}>
    {/* Clean stylized SVG QR pattern */}
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="140" rx="10" fill="white" />
      {/* Top Left Corner */}
      <rect x="12" y="12" width="34" height="34" rx="6" stroke="#0c4a6e" strokeWidth="6" />
      <rect x="22" y="22" width="14" height="14" rx="2" fill="#0891b2" />
      {/* Top Right Corner */}
      <rect x="94" y="12" width="34" height="34" rx="6" stroke="#0c4a6e" strokeWidth="6" />
      <rect x="104" y="22" width="14" height="14" rx="2" fill="#0891b2" />
      {/* Bottom Left Corner */}
      <rect x="12" y="94" width="34" height="34" rx="6" stroke="#0c4a6e" strokeWidth="6" />
      <rect x="22" y="104" width="14" height="14" rx="2" fill="#0891b2" />
      {/* Center & Accent Elements */}
      <circle cx="70" cy="70" r="16" fill="#0891b2" />
      <path d="M65 70L69 74L76 66" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Pattern Matrix Dots */}
      <rect x="52" y="16" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="64" y="16" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="76" y="16" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="52" y="28" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="76" y="28" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="52" y="40" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="64" y="40" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="76" y="40" width="6" height="6" rx="2" fill="#0891b2" />
      
      <rect x="16" y="52" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="28" y="52" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="40" y="52" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="94" y="52" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="106" y="52" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="118" y="52" width="6" height="6" rx="2" fill="#0891b2" />

      <rect x="16" y="64" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="34" y="64" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="94" y="64" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="112" y="64" width="6" height="6" rx="2" fill="#0891b2" />

      <rect x="16" y="76" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="28" y="76" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="40" y="76" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="94" y="76" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="106" y="76" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="118" y="76" width="6" height="6" rx="2" fill="#0891b2" />

      <rect x="52" y="94" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="64" y="94" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="76" y="94" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="52" y="106" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="76" y="106" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="52" y="118" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="64" y="118" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="76" y="118" width="6" height="6" rx="2" fill="#0891b2" />

      <rect x="94" y="94" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="106" y="94" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="118" y="94" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="94" y="106" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="106" y="106" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="118" y="106" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="94" y="118" width="6" height="6" rx="2" fill="#0891b2" />
      <rect x="106" y="118" width="6" height="6" rx="2" fill="#0c4a6e" />
      <rect x="118" y="118" width="6" height="6" rx="2" fill="#0891b2" />
    </svg>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#0c4a6e", marginTop: 8, textAlign: "center" }}>
      tabibi.dz/app
    </div>
  </div>
);

// Google Play Icon
const GooglePlayLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3.6 2.3A1.8 1.8 0 0 0 3 3.6v16.8a1.8 1.8 0 0 0 .6 1.3l9.8-9.8L3.6 2.3z" fill="#00D3FF" />
    <path d="M16.8 15.3l-3.4-3.4-9.8 9.8c.4.3 1 .4 1.6.1l11.6-6.5z" fill="#FF3333" />
    <path d="M16.8 8.7L5.2 2.2C4.6 1.9 4 2 3.6 2.3l9.8 9.8 3.4-3.4z" fill="#00E676" />
    <path d="M20.6 10.7l-3.8-2.1-3.4 3.4 3.4 3.4 3.8-2.1c1.1-.6 1.1-2 0-2.6z" fill="#FFD400" />
  </svg>
);

// Android Robot Icon
const AndroidLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71a.495.495 0 0 0-.71 0l-1.48 1.48C13.62 2.24 12.83 2 12 2c-.83 0-1.62.24-2.31.63L8.21 1.15a.495.495 0 0 0-.71 0c-.2.2-.2.51 0 .71l1.3 1.3C7.14 4.19 6 5.96 6 8h12c0-2.04-1.14-3.81-2.47-4.84zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </svg>
);

export default function AppDownloadPage({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const { show, Toast } = useToast();
  const [activeScreenTab, setActiveScreenTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const isRtl = i18n.language === "ar";

  // App download URLs (can be updated via environment or settings)
  const APK_DOWNLOAD_URL = "https://stellarsoft.dz/download/tabibi.apk";
  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=dz.tabibi.app";
  const APP_STORE_URL = "https://apps.apple.com/app/tabibi/id";

  const copyShareLink = () => {
    const url = window.location.origin + window.location.pathname + "#/app";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      show(t("app_link_copied", "تم نسخ رابط التطبيق بنجاح!"), "success");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadApk = () => {
    show(t("app_download_started", "جارٍ تحميل تطبيق طبيبي (APK)..."), "info");
    const link = document.createElement("a");
    link.href = APK_DOWNLOAD_URL;
    link.setAttribute("download", "Tabibi.apk");
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Screenshots data for interactive showcase
  const appScreens = [
    {
      id: "search",
      title: t("app_screen_1_title", "البحث والاستكشاف"),
      subtitle: t("app_screen_1_desc", "ابحث عن الأطباء والعيادات حسب الولاية، البلدية، والتخصص الطبي بسهولة فائقة."),
      icon: <Search size={20} />,
      badge: "58 ولاية",
      renderScreen: () => (
        <div style={{ padding: "16px 14px", height: "100%", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Mock Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b" }}>مرحباً بك في</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#0c4a6e" }}>طبيبي Tabibi</div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 900 }}>DZ</div>
          </div>
          {/* Mock Search Bar */}
          <div style={{ background: "#fff", padding: "8px 12px", borderRadius: 12, border: "1px solid #cbd5e1", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <Search size={14} color="#0891b2" />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>ابحث عن تخصص، طبيب أو ولاية...</span>
          </div>
          {/* Specialties Pills */}
          <div style={{ display: "flex", gap: 6, overflowX: "hidden" }}>
            {["طب عام", "طب الأسنان", "قلب وشرايين", "أطفال"].map((sp, idx) => (
              <span key={idx} style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: idx === 0 ? "var(--brand)" : "#e2e8f0", color: idx === 0 ? "#fff" : "#334155", whiteSpace: "nowrap" }}>
                {sp}
              </span>
            ))}
          </div>
          {/* Doctor Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {[
              { name: "د. بن علي محمد", spec: "أخصائي أمراض القلب", place: "الجزائر العاصمة", rate: "4.9", slots: "متاح اليوم" },
              { name: "د. بلقاسم سارة", spec: "أخصائية طب الأطفال", place: "وهران", rate: "4.8", slots: "متاح غداً" },
              { name: "عيادة الشفاء المركزية", spec: "عيادة طبية متكاملة", place: "قسنطينة", rate: "5.0", slots: "متاح الآن" }
            ].map((d, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 10, border: "1px solid #e2e8f0", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0891b2,#0c4a6e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>
                  {d.name.split(" ")[1]?.[0] || "د"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: "#0891b2", fontWeight: 600 }}>{d.spec}</div>
                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>📍 {d.place} • <span style={{ color: "#16a34a", fontWeight: 700 }}>{d.slots}</span></div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#f59e0b", display: "flex", alignItems: "center", gap: 2 }}>
                  ★ {d.rate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "booking",
      title: t("app_screen_2_title", "الحجز الفوري للمواعيد"),
      subtitle: t("app_screen_2_desc", "اختر اليوم والوقت المناسب بلمسة واحدة دون الحاجة للاتصال أو الانتظار."),
      icon: <Calendar size={20} />,
      badge: "تأكيد فوري",
      renderScreen: () => (
        <div style={{ padding: "16px 14px", height: "100%", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #e2e8f0", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0891b2,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900 }}>د.ب</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0c4a6e" }}>د. بن علي محمد</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>أخصائي أمراض القلب • حيدرة</div>
            </div>
          </div>
          {/* Calendar Picker Mock */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>سبتمبر 2026</span>
              <span style={{ color: "#0891b2" }}>مواعيد متاحة</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {[
                { day: "الأحد 13", slots: "4" },
                { day: "الاثنين 14", slots: "6", active: true },
                { day: "الثلاثاء 15", slots: "3" },
                { day: "الأربعاء 16", slots: "5" },
                { day: "الخميس 17", slots: "2" }
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: "6px 2px",
                  textAlign: "center",
                  borderRadius: 8,
                  background: item.active ? "var(--brand)" : "#f1f5f9",
                  color: item.active ? "#fff" : "#334155",
                  fontSize: 9,
                  fontWeight: 700
                }}>
                  <div>{item.day.split(" ")[0]}</div>
                  <div style={{ fontSize: 11, fontWeight: 900 }}>{item.day.split(" ")[1]}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Slots */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 6 }}>الفترات المتاحة</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"].map((s, i) => (
                <div key={i} style={{
                  padding: "6px",
                  textAlign: "center",
                  borderRadius: 6,
                  border: i === 1 ? "1.5px solid var(--brand)" : "1px solid #e2e8f0",
                  background: i === 1 ? "#ecfeff" : "#fff",
                  color: i === 1 ? "var(--brand)" : "#334155",
                  fontSize: 10,
                  fontWeight: 800
                }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
          {/* Confirm Button */}
          <div style={{ marginTop: "auto", background: "var(--brand)", color: "#fff", padding: "10px", borderRadius: 10, textAlign: "center", fontWeight: 800, fontSize: 12 }}>
            تأكيد حجز الموعد ✓
          </div>
        </div>
      )
    },
    {
      id: "notifications",
      title: t("app_screen_3_title", "التنبيهات والمحادثة"),
      subtitle: t("app_screen_3_desc", "تنبيهات قبل موعدك الطبي وتواصل مباشر وسري مع طبيبك المتابع."),
      icon: <Bell size={20} />,
      badge: "تنبيهات حية",
      renderScreen: () => (
        <div style={{ padding: "16px 14px", height: "100%", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#0c4a6e", marginBottom: 4 }}>الإشعارات والتذكيرات</div>
          {/* Notification Card */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 10, borderLeft: "4px solid #0891b2", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Bell size={13} color="#0891b2" />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#0c4a6e" }}>تذكير بالموعد القادم</span>
              <span style={{ fontSize: 9, color: "#94a3b8", marginRight: "auto" }}>منذ 10 د</span>
            </div>
            <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.4 }}>
              لديك موعد غداً عند الساعة <strong>09:30 صباحاً</strong> مع د. بن علي محمد.
            </div>
          </div>
          {/* Chat Mock */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 10, border: "1px solid #e2e8f0", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#0c4a6e", borderBottom: "1px solid #f1f5f9", paddingBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <MessageSquare size={12} color="#0891b2" />
              <span>محادثة: د. بلقاسم سارة</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflowY: "hidden" }}>
              <div style={{ alignSelf: "flex-start", background: "#f1f5f9", padding: "6px 10px", borderRadius: 8, fontSize: 10, color: "#334155", maxWidth: "80%" }}>
                السلام عليكم دكتورة، هل التحاليل جاهزة؟
              </div>
              <div style={{ alignSelf: "flex-end", background: "var(--brand)", color: "#fff", padding: "6px 10px", borderRadius: 8, fontSize: 10, maxWidth: "85%" }}>
                وعليكم السلام، نعم كل النتائج ممتازة، نلتقي في الموعد المحدد.
              </div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "6px 8px", fontSize: 10, color: "#94a3b8", border: "1px solid #e2e8f0" }}>
              اكتب استفسارك هنا...
            </div>
          </div>
        </div>
      )
    },
    {
      id: "family",
      title: t("app_screen_4_title", "الملف العائلي الموحد"),
      subtitle: t("app_screen_4_desc", "أضف أفراد عائلتك (الأبناء، الوالدين، الزوج) واحجز لهم مواعيد بسهولة من حساب واحد."),
      icon: <Users size={20} />,
      badge: "حساب واحد",
      renderScreen: () => (
        <div style={{ padding: "16px 14px", height: "100%", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#0c4a6e" }}>الملف الصحي والعائلة</div>
          <div style={{ background: "linear-gradient(135deg,#0c4a6e,#0891b2)", borderRadius: 14, padding: 12, color: "#fff" }}>
            <div style={{ fontSize: 10, opacity: 0.8 }}>الحساب الرئيسي</div>
            <div style={{ fontSize: 14, fontWeight: 900, marginTop: 2 }}>أحمد عمار (المستخدم)</div>
            <div style={{ fontSize: 10, opacity: 0.9, marginTop: 4 }}>3 أفراد عائلة مسجلين • 2 مواعيد قادمة</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#334155", marginTop: 4 }}>أفراد العائلة</div>
          {[
            { name: "أمين عمار (الابن)", age: "8 سنوات", icon: "👶", bg: "#f0fdf4", color: "#16a34a" },
            { name: "مريم عمار (الابنة)", age: "4 سنوات", icon: "👧", bg: "#fdf2f8", color: "#db2777" },
            { name: "فاطمة الزهراء (الزوجة)", age: "32 سنة", icon: "👩", bg: "#f0f9ff", color: "#0284c7" }
          ].map((m, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>{m.name}</div>
                  <div style={{ fontSize: 9, color: "#64748b" }}>{m.age}</div>
                </div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: m.bg, color: m.color }}>حجز موعد</span>
            </div>
          ))}
        </div>
      )
    }
  ];

  // Key Features
  const features = [
    {
      icon: <Zap size={26} color="#0891b2" />,
      title: t("app_feat_1_title", "حجز فوري في ثوانٍ"),
      desc: t("app_feat_1_desc", "اطّلع على المواعيد المتاحة لحظياً واحجز بضغطة زر دون انتظار رد الهاتف أو إضاعة الوقت.")
    },
    {
      icon: <Bell size={26} color="#0891b2" />,
      title: t("app_feat_2_title", "تنبيهات وتذكير ذكي"),
      desc: t("app_feat_2_desc", "إشعارات مسبقة تذكرك بمواعيدك وتخطرك بأي تحديث من الطبيب أو العيادة أولاً بأول.")
    },
    {
      icon: <Activity size={26} color="#0891b2" />,
      title: t("app_feat_3_title", "تغطية 58 ولاية"),
      desc: t("app_feat_3_desc", "شبكة طبية واسعة تضم آلاف الأطباء والعيادات في مختلف التخصصات بكافة ربوع الوطن.")
    },
    {
      icon: <MessageSquare size={26} color="#0891b2" />,
      title: t("app_feat_4_title", "تواصل مباشر مع الطبيب"),
      desc: t("app_feat_4_desc", "نظام محادثة مدمج للاستفسار عن المواعيد والتحاليل في بيئة آمنة وسرية.")
    },
    {
      icon: <Users size={26} color="#0891b2" />,
      title: t("app_feat_5_title", "إدارة مواعيد العائلة"),
      desc: t("app_feat_5_desc", "ملف عائلي موحد يتيح لك حجز مواعيد للأبناء والوالدين وإدارتها بكل سهولة من هاتفك.")
    },
    {
      icon: <ShieldCheck size={26} color="#0891b2" />,
      title: t("app_feat_6_title", "خصوصية وأمان تام"),
      desc: t("app_feat_6_desc", "حماية مشددة لبياناتك الطبية وسجلاتك الصحية وفق أحكام القانون الجزائري 18-07.")
    },
    {
      icon: <RefreshCw size={26} color="#0891b2" />,
      title: t("app_feat_7_title", "مزامنة فورية مع العيادة"),
      desc: t("app_feat_7_desc", "تكامل مباشر مع نظام العيادة لضمان دقة جدول المواعيد وعدم حدوث أي تعارض.")
    },
    {
      icon: <Award size={26} color="#0891b2" />,
      title: t("app_feat_8_title", "أطباء وعيادات معتمدة"),
      desc: t("app_feat_8_desc", "تحقق وتدقيق من تراخيص العيادات والأطباء لضمان أعلى مستويات الرعاية الصحية الموثوقة.")
    }
  ];

  // FAQs
  const faqs = [
    {
      q: t("app_faq_1_q", "هل تطبيق طبيبي مجاني للمرضى؟"),
      a: t("app_faq_1_a", "نعم، تطبيق طبيبي مجاني 100% لجميع المرضى. يمكنك تحميل التطبيق، إنشاء حساب، والبحث عن الأطباء وحجز المواعيد دون أي رسوم.")
    },
    {
      q: t("app_faq_2_q", "كيف أقوم بتثبيت ملف الـ APK المباشر على هاتفي الأندرويد؟"),
      a: t("app_faq_2_a", "بعد الضغط على زر 'تحميل مباشر APK' واكتمال التنزيل، افتح الملف المُحمّل. إذا ظهرت لك رسالة أمان تفيد بطلب السماح بالتثبيت من مصادر غير معروفة، اضغط على 'الإعدادات' ثم فعّل خيار 'السماح من هذا المصدر'، ثم اضغط 'تثبيت'. التطبيق آمن ومفحوص بالكامل.")
    },
    {
      q: t("app_faq_3_q", "هل يمكنني تسجيل الدخول بنفس حسابي المسجل على الموقع؟"),
      a: t("app_faq_3_a", "نعم بالتأكيد! بياناتك ومواعيدك وسجل عائلتك متزامنة تلقائياً. يمكنك استخدام نفس اسم المستخدم أو البريد الإلكتروني وكلمة المرور.")
    },
    {
      q: t("app_faq_4_q", "هل يتوفر التطبيق لنظام الآيفون (iOS)؟"),
      a: t("app_faq_4_a", "تطبيق الآيفون متاح أيضاً عبر متجر App Store، بالإضافة إلى إمكانية تثبيت منصة طبيبي كتطبيق ويب تقدمي (PWA) عبر متصفح Safari بالضغط على زر 'مشاركة' ثم 'إضافة إلى الشاشة الرئيسية'.")
    },
    {
      q: t("app_faq_5_q", "كيف أتحقق من تأكيد موعدي الطبي من التطبيق؟"),
      a: t("app_faq_5_a", "بمجرد اختيار الوقت والضغط على 'تأكيد الحجز'، ستظهر بطاقة الموعد فوراً في تبويب 'مواعيدي' مع تفاصيل العيادة والطبيب، كما ستصلك إشعارات تذكيرية قبل الموعد.")
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-main)" }}>
      {/* ── HERO SECTION ── */}
      <div style={{
        background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 55%, #0e7490 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "60px 20px 80px",
        color: "#fff"
      }}>
        {/* Ambient background glows */}
        <div style={{
          position: "absolute",
          top: "-10%",
          left: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-10%",
          right: "5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,116,144,0.3) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none"
        }} />

        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 40,
          alignItems: "center"
        }}>
          {/* Left Text & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Tag Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "6px 16px",
              borderRadius: 30,
              fontSize: 13,
              fontWeight: 700,
              color: "#e0f2fe",
              marginBottom: 20
            }}>
              <Sparkles size={16} color="#38bdf8" />
              <span>{t("app_hero_tag", "التطبيق الطبي الأول في الجزائر 🇩🇿")}</span>
            </div>

            <h1 style={{
              fontSize: "clamp(30px, 4.5vw, 48px)",
              fontWeight: 900,
              lineHeight: 1.25,
              margin: "0 0 16px",
              color: "#fff"
            }}>
              {t("app_hero_title_1", "صحتك وصحة عائلتك...")} <br />
              <span style={{ color: "#7dd3fc" }}>{t("app_hero_title_2", "بين يديك في تطبيق واحد")}</span>
            </h1>

            <p style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.9)",
              maxWidth: 540,
              margin: "0 0 32px"
            }}>
              {t("app_hero_desc", "حمّل تطبيق طبيبي الآن واستمتع بتجربة صحية متكاملة: ابحث عن أفضل الأطباء في 58 ولاية، احجز موعدك فورياً بدون انتظار، وتلقَ تنبيهات ذكية وتواصل مع طبيبك بأمان.")}
            </p>

            {/* DOWNLOAD ACTION BUTTONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
              {/* Button 1: Direct APK Download (Highlight) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadApk}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderRadius: 16,
                  padding: "14px 22px",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  boxShadow: "0 10px 25px rgba(16,185,129,0.35)",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff"
                  }}>
                    <AndroidLogo />
                  </div>
                  <div style={{ textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 600 }}>{t("app_direct_download_tag", "تثبيت فوري مباشر للأندرويد")}</div>
                    <div style={{ fontSize: 17, fontWeight: 900 }}>{t("app_direct_apk_btn", "تحميل مباشر APK")}</div>
                  </div>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.25)",
                  borderRadius: 10,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  <Download size={16} />
                  <span>v1.2.0 • 18 MB</span>
                </div>
              </motion.button>

              {/* Stores Row: Google Play & App Store */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Google Play */}
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 14,
                    padding: "12px 16px",
                    color: "#fff",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
                  }}
                >
                  <GooglePlayLogo />
                  <div style={{ textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ fontSize: 10, opacity: 0.75 }}>GET IT ON</div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>Google Play</div>
                  </div>
                </motion.a>

                {/* App Store (iOS) */}
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 14,
                    padding: "12px 16px",
                    color: "#fff",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
                  }}
                >
                  <Apple size={24} color="#fff" />
                  <div style={{ textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ fontSize: 10, opacity: 0.75 }}>Download on</div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>App Store</div>
                  </div>
                </motion.a>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 28, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Star size={18} color="#facc15" fill="#facc15" />
                <span style={{ fontWeight: 800, fontSize: 14 }}>4.9 / 5</span>
                <span style={{ fontSize: 12, opacity: 0.8 }}>({t("app_rating_count", "أكثر من 10k تقييم")})</span>
              </div>
              <div style={{ height: 16, width: 1, background: "rgba(255,255,255,0.3)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={18} color="#4ade80" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{t("app_verified_safe", "آمن ومجاني 100%")}</span>
              </div>
              <div style={{ height: 16, width: 1, background: "rgba(255,255,255,0.3)" }} />
              <button
                onClick={copyShareLink}
                style={{
                  background: "none",
                  border: "none",
                  color: "#7dd3fc",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: 0
                }}
              >
                {copied ? <Check size={16} color="#4ade80" /> : <Share2 size={16} />}
                <span>{copied ? t("copied", "تم النسخ!") : t("share_app", "مشاركة الرابط")}</span>
              </button>
            </div>
          </motion.div>

          {/* Right Phone Mockup & QR Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, flexWrap: "wrap" }}
          >
            {/* Stylized Modern Smartphone Mockup */}
            <div style={{
              width: 290,
              height: 580,
              background: "#0f172a",
              borderRadius: 44,
              padding: "10px",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.15)",
              position: "relative",
              display: "flex",
              flexDirection: "column"
            }}>
              {/* Dynamic Island / Speaker Notch */}
              <div style={{
                position: "absolute",
                top: 18,
                left: "50%",
                transform: "translateX(-50%)",
                width: 90,
                height: 20,
                background: "#000",
                borderRadius: 20,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1e293b" }} />
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0891b2" }} />
              </div>

              {/* Phone Screen Container */}
              <div style={{
                flex: 1,
                background: "#f8fafc",
                borderRadius: 36,
                overflow: "hidden",
                paddingTop: 36,
                display: "flex",
                flexDirection: "column",
                position: "relative"
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScreenTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    style={{ height: "100%" }}
                  >
                    {appScreens[activeScreenTab].renderScreen()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div style={{
                width: 110,
                height: 4,
                background: "rgba(255,255,255,0.5)",
                borderRadius: 4,
                margin: "8px auto 2px"
              }} />
            </div>

            {/* QR Code Quick Scan Float Card */}
            <div style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(12px)",
              borderRadius: 24,
              padding: 20,
              textAlign: "center",
              boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
              color: "#0c4a6e",
              maxWidth: 190
            }}>
              <AppQRCode />
              <div style={{ fontSize: 12, fontWeight: 800, marginTop: 12, color: "#0c4a6e" }}>
                {t("app_scan_qr_title", "امسح للتحميل فوراً")}
              </div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
                {t("app_scan_qr_desc", "وجّه كاميرا الهاتف نحو الرمز لفتح صفحة التثبيت")}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── INTERACTIVE SCREEN SHOWCASE SWITCHER ── */}
      <div style={{ maxWidth: 1200, margin: "-30px auto 60px", padding: "0 20px", position: "relative", zIndex: 2 }}>
        <Card style={{ padding: "20px 24px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--brand)", margin: 0 }}>
                {t("app_explore_screens_title", "استكشف واجهات ومزايا تطبيق طبيبي")}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
                {t("app_explore_screens_desc", "اختر شاشة للاطلاع على تجربة الاستخدام السلسة داخل التطبيق")}
              </p>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", background: "var(--brand-light)", padding: "6px 14px", borderRadius: 20 }}>
              {appScreens[activeScreenTab].badge}
            </div>
          </div>

          {/* Screen Tab Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {appScreens.map((screen, idx) => (
              <button
                key={screen.id}
                onClick={() => setActiveScreenTab(idx)}
                style={{
                  background: activeScreenTab === idx ? "var(--brand-light)" : "var(--bg)",
                  border: `2px solid ${activeScreenTab === idx ? "var(--brand)" : "var(--border)"}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  textAlign: isRtl ? "right" : "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: activeScreenTab === idx ? "var(--brand)" : "var(--card-bg)",
                  color: activeScreenTab === idx ? "#fff" : "var(--brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {screen.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: activeScreenTab === idx ? "var(--brand)" : "var(--text-main)" }}>
                    {screen.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>
                    {screen.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 3 EASY STEPS (HOW IT WORKS) ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto 80px", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Badge color="var(--brand)">{t("app_how_it_works_badge", "سهل وسريع")}</Badge>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 900, color: "var(--text-main)", margin: "10px 0" }}>
            {t("app_how_it_works_title", "ابدأ مع طبيبي في 3 خطوات بسيطة")}
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto" }}>
            {t("app_how_it_works_subtitle", "كل ما تحتاجه للوصول إلى رعايتك الصحية بكل راحة وسرعة")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            {
              step: "01",
              icon: <Download size={28} color="var(--brand)" />,
              title: t("app_step_1_title", "حمّل التطبيق وسجّل حسابك"),
              desc: t("app_step_1_desc", "حمّل ملف الـ APK المباشر أو من المتاجر وأنشئ حسابك المجاني في دقيقة واحدة.")
            },
            {
              step: "02",
              icon: <Search size={28} color="var(--brand)" />,
              title: t("app_step_2_title", "ابحث واختر الموعد المناسب"),
              desc: t("app_step_2_desc", "حدّد ولايتك وتخصص الطبيب أو العيادة، واختر اليوم والساعة المناسبة لجدولك.")
            },
            {
              step: "03",
              icon: <CheckCircle2 size={28} color="var(--brand)" />,
              title: t("app_step_3_title", "تأكيد وتنبيه مباشر"),
              desc: t("app_step_3_desc", "استلم تأكيد حجزك فورياً مع تذكيرات ذكية قبل الموعد لتصل إلى العيادة دون انتظار.")
            }
          ].map((item, idx) => (
            <Card key={idx} style={{ padding: 30, position: "relative", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{
                position: "absolute",
                top: 12,
                [isRtl ? "left" : "right"]: 16,
                fontSize: 48,
                fontWeight: 900,
                color: "var(--brand)",
                opacity: 0.12,
                lineHeight: 1
              }}>
                {item.step}
              </div>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "var(--brand-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: "0 0 10px" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── KEY FEATURES GRID ── */}
      <div style={{ background: "var(--card-bg)", padding: "70px 20px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Badge color="var(--brand)">{t("app_features_badge", "مميزات حصرية")}</Badge>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 900, color: "var(--text-main)", margin: "10px 0" }}>
              {t("app_features_title", "لماذا يفضل المرضى والأطباء تطبيق طبيبي؟")}
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 620, margin: "0 auto" }}>
              {t("app_features_subtitle", "ميزات متطورة مصممة خصيصاً لتلبية احتياجات الرعاية الصحية في الجزائر.")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {features.map((feat, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--bg)",
                  borderRadius: 18,
                  padding: "24px 20px",
                  border: "1px solid var(--border)",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--brand-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16
                }}>
                  {feat.icon}
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", margin: "0 0 8px" }}>
                  {feat.title}
                </h4>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TECHNICAL SPECS & APK GUIDE ── */}
      <div style={{ maxWidth: 1200, margin: "80px auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 30 }}>
          {/* Technical Specs Card */}
          <Card style={{ padding: 30, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)" }}>
                <Cpu size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                  {t("app_specs_title", "معلومات ومواصفات التطبيق")}
                </h3>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Tabibi Mobile Technical Details</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: t("app_spec_name", "اسم التطبيق"), value: "طبيبي — Tabibi DZ" },
                { label: t("app_spec_version", "الإصدار الحالي"), value: "v1.2.0 (أحدث إصدار)" },
                { label: t("app_spec_size", "حجم الملف"), value: "18.5 ميغابايت (خفيف وسريع)" },
                { label: t("app_spec_os", "متطلبات النظام"), value: "Android 7.0+ / iOS 14.0+" },
                { label: t("app_spec_languages", "اللغات المدعومة"), value: "العربية، Français، English" },
                { label: t("app_spec_price", "الترخيص والسعر"), value: "مجاني 100% للمرضى" },
                { label: t("app_spec_dev", "المطور"), value: "فريق تطوير طبيبي (Tabibi Team)" }
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 10,
                  borderBottom: "1px solid var(--border)"
                }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <Btn onClick={handleDownloadApk} style={{ width: "100%", justifyContent: "center", padding: 13 }}>
                <Download size={18} />
                <span>{t("app_direct_apk_btn", "تحميل مباشر APK")}</span>
              </Btn>
            </div>
          </Card>

          {/* APK Install Guide Card */}
          <Card style={{ padding: 30, border: "1px solid var(--border)", background: "linear-gradient(180deg, var(--card-bg) 0%, var(--bg) 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                  {t("app_install_guide_title", "دليل تثبيت ملف APK على أندرويد")}
                </h3>
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>خطوات بسيطة وآمنة تماماً</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                {
                  num: "1",
                  title: t("app_guide_1_title", "1. تحميل الملف"),
                  desc: t("app_guide_1_desc", "اضغط على زر 'تحميل مباشر APK' وسيبدأ تنزيل الملف فوراً على هاتفك.")
                },
                {
                  num: "2",
                  title: t("app_guide_2_title", "2. فتح الملف والسماح بالتثبيت"),
                  desc: t("app_guide_2_desc", "افتح ملف Tabibi.apk من قائمة التحميلات. إذا طلب النظام الإذن، اختر 'السماح بتثبيت التطبيقات من هذا المصدر'.")
                },
                {
                  num: "3",
                  title: t("app_guide_3_title", "3. التثبيت والبدء"),
                  desc: t("app_guide_3_desc", "اضغط على 'تثبيت'، ثم افتح تطبيق طبيبي وسجل دخولك لتتمتع بجميع الخدمات.")
                }
              ].map((g, idx) => (
                <div key={idx} style={{ display: "flex", gap: 14 }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--brand)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 900,
                    flexShrink: 0
                  }}>
                    {g.num}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-main)" }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.5 }}>{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: "rgba(8,145,178,0.08)",
              borderRadius: 12,
              padding: 14,
              marginTop: 20,
              border: "1px solid rgba(8,145,178,0.2)",
              display: "flex",
              alignItems: "flex-start",
              gap: 10
            }}>
              <CheckCircle2 size={18} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600, lineHeight: 1.5 }}>
                {t("app_safety_note", "ملف الـ APK معتمد وموقّع رقمياً من فريق طبيبي الرسمي وهو آمن تماماً وخالٍ من أي برمجيات ضارة.")}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── FAQ ACCORDION ── */}
      <div style={{ maxWidth: 900, margin: "0 auto 80px", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Badge color="var(--brand)">{t("app_faq_badge", "الأسئلة الشائعة")}</Badge>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, color: "var(--text-main)", margin: "10px 0" }}>
            {t("app_faq_title", "استفسارات شائعة حول تطبيق طبيبي")}
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <Card key={idx} style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border)" }}>
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  style={{
                    width: "100%",
                    padding: "18px 22px",
                    background: "none",
                    border: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    textAlign: isRtl ? "right" : "left",
                    color: "var(--text-main)",
                    fontWeight: 800,
                    fontSize: 15
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <HelpCircle size={18} color="var(--brand)" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={20} color="var(--brand)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </button>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      padding: "0 22px 20px 22px",
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                      borderTop: "1px solid var(--border)",
                      background: "var(--bg)"
                    }}
                  >
                    {faq.a}
                  </motion.div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM CTA BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)",
        padding: "60px 20px",
        textAlign: "center",
        color: "#fff",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, margin: "0 0 14px" }}>
            {t("app_bottom_cta_title", "جاهز لتجربة رعاية صحية أسهل وأسرع؟")}
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 540, margin: "0 auto 30px" }}>
            {t("app_bottom_cta_desc", "حمّل تطبيق طبيبي الآن مجاناً وانضم لآلاف المرضى والأطباء في جميع أنحاء الجزائر.")}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Btn onClick={handleDownloadApk} style={{ padding: "14px 28px", fontSize: 15, background: "#10b981", border: "none" }}>
              <Download size={20} />
              <span>{t("app_direct_apk_btn", "تحميل مباشر APK")}</span>
            </Btn>
            <Btn variant="secondary" onClick={() => window.open(PLAY_STORE_URL, "_blank")} style={{ padding: "14px 28px", fontSize: 15, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
              <GooglePlayLogo />
              <span>Google Play</span>
            </Btn>
            <Btn variant="secondary" onClick={() => window.open(APP_STORE_URL, "_blank")} style={{ padding: "14px 28px", fontSize: 15, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
              <Apple size={20} />
              <span>App Store</span>
            </Btn>
          </div>
        </div>
      </div>

      <Toast />
    </div>
  );
}
