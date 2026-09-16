// src/pages/AppDownload.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Apple, CheckCircle2, ShieldCheck,
  Zap, Bell, Calendar, Search, Users, MessageSquare, Star,
  Share2, Check, Sparkles, HelpCircle, ChevronDown, ChevronUp,
  Cpu, Award, Activity, HeartPulse, RefreshCw, Smartphone,
  MapPin, Clock, FileCheck, Stethoscope, Building2, QrCode
} from "lucide-react";
import { Btn, Card, Badge, useToast } from "../components/SharedUI";

// ── Medical Background Floating Watermark Icons (Identical to HomePage) ──
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
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
  const [copied, setCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const isRtl = i18n.language === "ar";
  const baseUrl = import.meta.env.BASE_URL || "/";

  // App download URLs
  const LOCAL_APK_URL = `${baseUrl}tabibi.apk`;
  const FALLBACK_APK_URL = "https://stellarsoft.dz/download/Tabibi.apk";
  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=dz.tabibi.app";
  const APP_STORE_URL = "https://apps.apple.com/app/tabibi/id";

  // Official uploaded pictures
  const APP_QR_CODE = `${baseUrl}app_qr_code.jpg`;
  const APP_PREVIEW_IMG = `${baseUrl}app_mobile_preview.jpg`;

  const copyShareLink = () => {
    const url = "https://stellarsoft.dz/download/Tabibi.apk";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        show(t("app_link_copied", "تم نسخ رابط التطبيق بنجاح!"), "success");
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
    show(t("app_download_started", "جارٍ تحميل تطبيق طبيبي (APK)..."), "info");
    const link = document.createElement("a");
    link.href = LOCAL_APK_URL;
    link.setAttribute("download", "Tabibi.apk");
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Key Features
  const features = [
    {
      icon: <Zap size={24} color="var(--brand)" />,
      title: t("app_feat_1_title", "حجز فوري في ثوانٍ"),
      desc: t("app_feat_1_desc", "اطّلع على المواعيد المتاحة لحظياً واحجز بضغطة زر دون انتظار رد الهاتف أو إضاعة الوقت.")
    },
    {
      icon: <Bell size={24} color="var(--brand)" />,
      title: t("app_feat_2_title", "تنبيهات وتذكير ذكي"),
      desc: t("app_feat_2_desc", "إشعارات مسبقة تذكرك بمواعيدك وتخطرك بأي تحديث من الطبيب أو العيادة أولاً بأول.")
    },
    {
      icon: <Activity size={24} color="var(--brand)" />,
      title: t("app_feat_3_title", "تغطية 58 ولاية"),
      desc: t("app_feat_3_desc", "شبكة طبية واسعة تضم آلاف الأطباء والعيادات في مختلف التخصصات بكافة ربوع الوطن.")
    },
    {
      icon: <MessageSquare size={24} color="var(--brand)" />,
      title: t("app_feat_4_title", "تواصل مباشر مع الطبيب"),
      desc: t("app_feat_4_desc", "نظام محادثة مدمج للاستفسار عن المواعيد والتحاليل في بيئة آمنة وسرية.")
    },
    {
      icon: <Users size={24} color="var(--brand)" />,
      title: t("app_feat_5_title", "إدارة مواعيد العائلة"),
      desc: t("app_feat_5_desc", "ملف عائلي موحد يتيح لك حجز مواعيد للأبناء والوالدين وإدارتها بكل سهولة من هاتفك.")
    },
    {
      icon: <ShieldCheck size={24} color="var(--brand)" />,
      title: t("app_feat_6_title", "خصوصية وأمان تام"),
      desc: t("app_feat_6_desc", "حماية مشددة لبياناتك الطبية وسجلاتك الصحية وفق أحكام القانون الجزائري 18-07.")
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
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-main)", overflowX: "hidden" }}>
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ── HERO SECTION (Strictly coherent with Tabibi Brand) ──
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        background: "var(--brand)",
        position: "relative",
        overflow: "hidden",
        padding: "50px 20px 100px",
        color: "#fff"
      }}>
        {/* Ambient Medical Watermark SVGs */}
        <StethoscopeIcon size={120} opacity={0.16} style={{ top: -20, left: -20, transform: "rotate(-15deg)" }} />
        <StethoscopeIcon size={70} opacity={0.14} style={{ top: "45%", right: "8%", transform: "rotate(20deg)" }} />
        <StethoscopeIcon size={90} opacity={0.15} style={{ bottom: "20%", left: "12%", transform: "rotate(45deg)" }} />

        <PillIcon size={50} opacity={0.18} style={{ top: "15%", right: "22%", transform: "rotate(-25deg)" }} />
        <PillIcon size={40} opacity={0.15} style={{ bottom: "35%", right: "16%", transform: "rotate(40deg)" }} />
        <PillIcon size={65} opacity={0.17} style={{ top: "65%", left: "6%", transform: "rotate(-10deg)" }} />

        <CrescentIcon size={34} opacity={0.15} style={{ top: "12%", left: "30%", transform: "rotate(-10deg)" }} />
        <CrescentIcon size={24} opacity={0.14} style={{ bottom: "40%", left: "40%", transform: "rotate(20deg)" }} />
        <CrescentIcon size={40} opacity={0.16} style={{ top: "50%", left: "26%", transform: "rotate(15deg)" }} />

        <SyringeIcon size={110} opacity={0.15} style={{ top: "8%", right: "35%", transform: "rotate(-30deg)" }} />
        <SyringeIcon size={80} opacity={0.14} style={{ bottom: "25%", right: "32%", transform: "rotate(15deg)" }} />

        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 40,
          alignItems: "center"
        }}>
          {/* Left Column: Text, Value Proposition & Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Luminous Brand Pulse Tag Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 30,
              padding: "6px 18px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 20,
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ width: 8, height: 8, background: "#7ffff4", borderRadius: "50%", boxShadow: "0 0 10px #7ffff4" }} />
              <span>{t("app_hero_tag", "التطبيق الطبي الأول في الجزائر")}</span>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: "clamp(28px, 4.2vw, 46px)",
              fontWeight: 900,
              lineHeight: 1.22,
              margin: "0 0 16px",
              color: "#fff"
            }}>
              {t("app_hero_title_1", "صحتك وصحة عائلتك...")} <br />
              <span style={{ color: "#7ffff4", textShadow: "0 2px 14px rgba(0,0,0,0.15)" }}>
                {t("app_hero_title_2", "بين يديك في تطبيق واحد")}
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.9)",
              maxWidth: 540,
              margin: "0 0 32px"
            }}>
              {t("app_hero_desc", "حمّل تطبيق طبيبي الآن واستمتع بتجربة صحية متكاملة: ابحث عن أفضل الأطباء في 58 ولاية، احجز موعدك فورياً بدون انتظار، وتلقَ تنبيهات ذكية وتواصل مع طبيبك بأمان.")}
            </p>

            {/* Action Buttons Container */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
              {/* Primary: Direct APK Download Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadApk}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "2px solid rgba(255,255,255,0.4)",
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
                    background: "rgba(255,255,255,0.22)",
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
                  <span>v1.2.0 • 14.8 Mo</span>
                </div>
              </motion.button>

              {/* Secondary Row: Stores */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Google Play */}
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(15, 23, 42, 0.75)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.25)",
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
                    background: "rgba(15, 23, 42, 0.75)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.25)",
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
                  <Apple size={22} color="#fff" />
                  <div style={{ textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ fontSize: 10, opacity: 0.75 }}>Download on</div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>App Store</div>
                  </div>
                </motion.a>
              </div>
            </div>

            {/* Trust and Safety Badges */}
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 28, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Star size={17} color="#facc15" fill="#facc15" />
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>4.9 / 5</span>
                <span style={{ fontSize: 11.5, opacity: 0.85 }}>({t("app_rating_count", "أكثر من 10k تقييم")})</span>
              </div>
              <div style={{ height: 14, width: 1, background: "rgba(255,255,255,0.3)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={17} color="#7ffff4" />
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{t("app_verified_safe", "آمن ومجاني 100%")}</span>
              </div>
              <div style={{ height: 14, width: 1, background: "rgba(255,255,255,0.3)" }} />
              <button
                onClick={copyShareLink}
                style={{
                  background: "none",
                  border: "none",
                  color: "#7ffff4",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: 0
                }}
              >
                {copied ? <Check size={15} color="#4ade80" /> : <Share2 size={15} />}
                <span>{copied ? t("copied", "تم النسخ!") : t("share_app", "مشاركة الرابط")}</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Real Smartphone Preview + Official QR Code Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
              position: "relative"
            }}
          >
            {/* Real Smartphone Mockup Container */}
            <div style={{
              width: 280,
              height: 560,
              background: "#0f172a",
              borderRadius: 44,
              padding: "9px",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0
            }}>
              {/* Dynamic Island / Speaker Notch */}
              <div style={{
                position: "absolute",
                top: 15,
                left: "50%",
                transform: "translateX(-50%)",
                width: 86,
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

              {/* Phone Screen: Authentic Screenshot Provided by User */}
              <div style={{
                flex: 1,
                borderRadius: 36,
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
                width: 100,
                height: 4,
                background: "rgba(255,255,255,0.5)",
                borderRadius: 4,
                margin: "7px auto 2px"
              }} />

              {/* Floating Highlight Badge 1 */}
              <div style={{
                position: "absolute",
                top: 80,
                [isRtl ? "right" : "left"]: -20,
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                color: "#0c4a6e",
                borderRadius: 14,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 800,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                zIndex: 12,
                border: "1px solid #e2e8f0"
              }}>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <span>4.9 ★ (10k+ avis)</span>
              </div>

              {/* Floating Highlight Badge 2 */}
              <div style={{
                position: "absolute",
                bottom: 80,
                [isRtl ? "left" : "right"]: -18,
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                color: "#0891b2",
                borderRadius: 14,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 800,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                zIndex: 12,
                border: "1px solid #e2e8f0"
              }}>
                <Users size={16} color="#0891b2" />
                <span>31K+ Patients</span>
              </div>
            </div>

            {/* Official QR Code Card (Picture 1 Provided by User) */}
            <div style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(16px)",
              borderRadius: 24,
              padding: 20,
              textAlign: "center",
              boxShadow: "0 15px 40px rgba(0,0,0,0.18)",
              color: "#0c4a6e",
              maxWidth: 195,
              border: "1px solid rgba(255,255,255,0.8)",
              flexShrink: 0
            }}>
              <div style={{
                background: "#fff",
                borderRadius: 16,
                padding: 8,
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
                display: "inline-block"
              }}>
                <img
                  src={APP_QR_CODE}
                  alt="Tabibi Official QR Code"
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 10,
                    display: "block"
                  }}
                />
              </div>

              <div style={{ fontSize: 13, fontWeight: 900, marginTop: 12, color: "#0c4a6e" }}>
                {t("app_scan_qr_title", "امسح للتحميل فوراً")}
              </div>
              <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>
                {t("app_scan_qr_desc", "وجّه كاميرا الهاتف نحو الرمز لفتح صفحة التثبيت")}
              </div>
              <div style={{
                marginTop: 10,
                fontSize: 10,
                fontWeight: 800,
                color: "var(--brand)",
                background: "rgba(8,145,178,0.1)",
                padding: "4px 8px",
                borderRadius: 20,
                display: "inline-block"
              }}>
                tabibi.dz/app
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Signature Wave Curve Separator (Exact Match to HomePage) ── */}
        <div style={{
          position: "absolute",
          bottom: -2,
          left: "-1%",
          width: "102%",
          zIndex: 3,
          height: 60,
          overflow: "visible"
        }}>
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: "100%" }}
          >
            <path d="M-10,100 Q0,0 150,0 L1290,0 Q1440,0 1450,100 Z" fill="var(--bg)" />
          </svg>
        </div>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ── SECTION: 3 KEY PILLARS (Matching HomePage Stats Style)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{ maxWidth: 1200, margin: "20px auto 70px", padding: "0 20px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {[
            {
              num: "31K+",
              label: t("stats_patients", "مرضى ومستفيدين"),
              desc: t("app_pillar_1_desc", "متابعة طبية فورية وحجز مواعيد لجميع أفراد العائلة بكل سلاسة من هاتفك."),
              icon: <Users size={22} />,
              color: "#0891b2"
            },
            {
              num: "18K+",
              label: t("stats_doctors", "طبيب وممارس صحي"),
              desc: t("app_pillar_2_desc", "نخبة الأطباء المتخصصين والعيادات المعتمدة في مختلف التخصصات الطبية."),
              icon: <Stethoscope size={22} />,
              color: "#0891b2"
            },
            {
              num: "58",
              label: t("app_pillar_3_title", "ولاية مغطاة بالكامل"),
              desc: t("app_pillar_3_desc", "تغطية وطنية شاملة لتجد أقرب طبيب أو عيادة إليك أينما كنت في الجزائر."),
              icon: <MapPin size={22} />,
              color: "#0891b2"
            }
          ].map((item, idx) => (
            <Card
              key={idx}
              style={{
                padding: "24px 22px",
                border: "1px solid var(--border)",
                borderRadius: 20,
                background: "var(--card-bg)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                transition: "all 0.25s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--brand-light)",
                  color: "var(--brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "var(--brand)", lineHeight: 1.1 }}>
                    {item.num}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-main)" }}>
                    {item.label}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ── SECTION: HOW IT WORKS (3 Simple Steps) ───────────
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
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
              icon: <Download size={26} color="var(--brand)" />,
              title: t("app_step_1_title", "حمّل التطبيق وسجّل حسابك"),
              desc: t("app_step_1_desc", "حمّل ملف الـ APK المباشر أو من المتاجر وأنشئ حسابك المجاني في دقيقة واحدة.")
            },
            {
              step: "02",
              icon: <Search size={26} color="var(--brand)" />,
              title: t("app_step_2_title", "ابحث واختر الموعد المناسب"),
              desc: t("app_step_2_desc", "حدّد ولايتك وتخصص الطبيب أو العيادة، واختر اليوم والساعة المناسبة لجدولك.")
            },
            {
              step: "03",
              icon: <CheckCircle2 size={26} color="var(--brand)" />,
              title: t("app_step_3_title", "تأكيد وتنبيه مباشر"),
              desc: t("app_step_3_desc", "استلم تأكيد حجزك فورياً مع تذكيرات ذكية قبل الموعد لتصل إلى العيادة دون انتظار.")
            }
          ].map((item, idx) => (
            <Card key={idx} style={{ padding: 28, position: "relative", overflow: "hidden", border: "1px solid var(--border)", borderRadius: 20 }}>
              <div style={{
                position: "absolute",
                top: 10,
                [isRtl ? "left" : "right"]: 16,
                fontSize: 46,
                fontWeight: 900,
                color: "var(--brand)",
                opacity: 0.12,
                lineHeight: 1
              }}>
                {item.step}
              </div>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "var(--brand-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-main)", margin: "0 0 8px" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ── SECTION: KEY APP FEATURES GRID ──────────────────
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
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
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--brand-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14
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


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ── SECTION: TECHNICAL SPECS & APK INSTALL GUIDE ────
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{ maxWidth: 1200, margin: "80px auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 30 }}>
          {/* Technical Specs Card */}
          <Card style={{ padding: 30, border: "1px solid var(--border)", borderRadius: 22 }}>
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

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: t("app_spec_name", "اسم التطبيق"), value: "طبيبي — Tabibi DZ" },
                { label: t("app_spec_version", "الإصدار الحالي"), value: "v1.2.0 (أحدث إصدار)" },
                { label: t("app_spec_size", "حجم الملف"), value: "14.8 Mo (خفيف وسريع)" },
                { label: t("app_spec_os", "متطلبات النظام"), value: "Android 7.0+ / iOS PWA" },
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
          <Card style={{ padding: 30, border: "1px solid var(--border)", borderRadius: 22, background: "linear-gradient(180deg, var(--card-bg) 0%, var(--bg) 100%)" }}>
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

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.5 }}>{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: "rgba(8,145,178,0.08)",
              borderRadius: 14,
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


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ── SECTION: FAQ ACCORDION ──────────────────────────
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
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
              <Card key={idx} style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border)", borderRadius: 16 }}>
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


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ── SECTION: BOTTOM CTA BANNER ──────────────────────
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        background: "var(--brand)",
        padding: "60px 20px",
        textAlign: "center",
        color: "#fff",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Ambient SVGs */}
        <StethoscopeIcon size={80} opacity={0.12} style={{ top: -10, left: 20 }} />
        <PillIcon size={50} opacity={0.14} style={{ bottom: 10, right: 30 }} />

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
