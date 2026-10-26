// frontend/src/pages/DoctorClinicsPage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Building2, User, Calendar, Sliders, CalendarDays } from "lucide-react";
import { Spinner, useToast } from "../components/SharedUI";
import DoctorClinicManager from "../components/DoctorClinicManager";
import DoctorAppointmentSettings from "../components/DoctorAppointmentSettings";
import { api as defaultApi } from "../api/client";

export default function DoctorClinicsPage({ user, navigate, isMobile, api, qs }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { show, Toast } = useToast();

  const activeApi = api || defaultApi;
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab state: 'clinics' | 'appointment_settings'
  const getInitialTab = () => {
    try {
      const search = qs ? (qs.startsWith("?") ? qs : "?" + qs) : window.location.search;
      const params = new URLSearchParams(search);
      const tabParam = params.get("tab");
      if (tabParam === "appointment_settings" || tabParam === "settings" || tabParam === "work_system") {
        return "appointment_settings";
      }
    } catch (_) {}
    return "clinics";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Listen to qs changes if updated via props or routing
  useEffect(() => {
    const search = qs ? (qs.startsWith("?") ? qs : "?" + qs) : window.location.search;
    const params = new URLSearchParams(search);
    const tabParam = params.get("tab");
    if (tabParam === "appointment_settings" || tabParam === "settings" || tabParam === "work_system") {
      setActiveTab("appointment_settings");
    } else if (tabParam === "clinics") {
      setActiveTab("clinics");
    }
  }, [qs]);

  useEffect(() => {
    let isMounted = true;
    if (user?.user_type === 1) {
      const fetchProfile = activeApi?.doctor?.profile || activeApi?.doctors?.get;
      if (fetchProfile) {
        fetchProfile(user?.profile?.id || user?.id)
          .then(res => {
            if (isMounted) {
              setDoctorProfile(res);
              setLoading(false);
            }
          })
          .catch(() => {
            if (isMounted) setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [user, activeApi]);

  // Authorization Guard
  if (!user) {
    setTimeout(() => navigate?.("/login"), 0);
    return null;
  }

  if (user.user_type !== 1) {
    setTimeout(() => navigate?.("/"), 0);
    return null;
  }

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    if (window.history.replaceState) {
      window.history.replaceState(null, "", `/clinics?tab=${tabKey}`);
    }
  };

  return (
    <div style={{
      maxWidth: 1240,
      margin: "0 auto",
      padding: isMobile ? "14px 12px 60px" : "24px 20px 80px",
      minHeight: "80vh",
      width: "100%",
      boxSizing: "border-box"
    }}>
      {Toast}

      {/* Page Header Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 14,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: "1.5px solid var(--border, #e2e8f0)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 20,
                background: "rgba(8, 145, 178, 0.1)",
                color: "var(--brand, #0891b2)",
                fontSize: 12,
                fontWeight: 800
              }}>
                <Building2 size={13} />
                {t("doctor_workspace_mgmt", "إدارة مقرات العمل")}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {doctorProfile?.fullname || user.profile?.fullname || user.username}
              </span>
            </div>

            <h1 style={{
              fontSize: isMobile ? 20 : 25,
              fontWeight: 900,
              color: "var(--heading-color, #0f172a)",
              margin: "4px 0 0",
              letterSpacing: "-0.01em"
            }}>
              {t("my_clinic_tab", "عيادتي ومقرات العمل")}
            </h1>
          </div>
        </div>

        {/* Action shortcuts */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => navigate?.("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              borderRadius: 12,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: "var(--card-bg, #ffffff)",
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--card-bg, #ffffff)"}
          >
            <User size={16} />
            {t("profile", "الملف الشخصي")}
          </button>

          <button
            type="button"
            onClick={() => navigate?.("/appointmanager")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(8, 145, 178, 0.25)",
              transition: "transform 0.15s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            <Calendar size={16} />
            {t("appt_mgr_title", "إدارة المواعيد")}
          </button>
        </div>
      </div>

      {/* ── Main Tab Navigation Bar ── */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 24,
        background: "var(--card-bg, #ffffff)",
        padding: "6px",
        borderRadius: 16,
        border: "1.5px solid var(--border, #e2e8f0)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        overflowX: "auto"
      }}>
        <button
          type="button"
          onClick={() => handleTabSelect("clinics")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 12,
            border: "none",
            background: activeTab === "clinics"
              ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)"
              : "transparent",
            color: activeTab === "clinics" ? "#ffffff" : "var(--text-secondary)",
            fontWeight: activeTab === "clinics" ? 800 : 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap"
          }}
        >
          <Building2 size={18} />
          <span>{t("my_clinic_tab", "عيادتي ومقرات العمل")}</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect("appointment_settings")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 12,
            border: "none",
            background: activeTab === "appointment_settings"
              ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)"
              : "transparent",
            color: activeTab === "appointment_settings" ? "#ffffff" : "var(--text-secondary)",
            fontWeight: activeTab === "appointment_settings" ? 800 : 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap"
          }}
        >
          <Sliders size={18} />
          <span>{t("appointment_settings_nav", "إعدادات المواعيد ونظام العمل")}</span>
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 8,
            background: activeTab === "appointment_settings" ? "rgba(255,255,255,0.24)" : "rgba(8, 145, 178, 0.12)",
            color: activeTab === "appointment_settings" ? "#ffffff" : "var(--brand, #0891b2)",
          }}>
            {isRtl ? "نظام التوقيت / القوائم والتذاكر" : "Créneaux / Tickets"}
          </span>
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <Spinner size={36} color="var(--brand)" />
          <p style={{ marginTop: 14, color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>
            {t("loading", "جاري التحميل...")}
          </p>
        </div>
      ) : activeTab === "clinics" ? (
        <DoctorClinicManager
          api={activeApi}
          doctor={doctorProfile || user?.profile}
          showToast={show}
          isMobile={isMobile}
          navigate={navigate}
          onSwitchToAppointmentSettings={() => handleTabSelect("appointment_settings")}
        />
      ) : (
        <DoctorAppointmentSettings
          doctor={doctorProfile || user?.profile}
          showToast={show}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
