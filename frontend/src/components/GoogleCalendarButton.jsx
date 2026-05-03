import React from "react";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Btn } from "./SharedUI";

/**
 * GoogleCalendarButton Component
 * @param {Object} appointment - Appointment data { doctorname, clinicname, apointementdate, ReasonName }
 * @param {string} variant - Btn variant (primary, secondary, etc.)
 * @param {Object} style - Custom styles for the button
 */
export default function GoogleCalendarButton({ appointment, variant = "primary", style = {}, iconOnly = false }) {
  const { t } = useTranslation();
  const { doctorname, clinicname, apointementdate, ReasonName, patientname } = appointment;

  const addToCalendar = (e) => {
    e.stopPropagation();
    const start = new Date(apointementdate);
    const end = new Date(start.getTime() + 30 * 60000);

    const formatGCalDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const startTime = formatGCalDate(start);
    const endTime = formatGCalDate(end);

    const title = encodeURIComponent(`${t("app_name")} : ${doctorname || t("doctor")}`);
    const details = encodeURIComponent(
      `${t("review_confirm")}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${t("patient")}: ${patientname || t("self")}\n` +
      `${t("doctor")}: ${doctorname || "—"}\n` +
      `${t("clinic")}: ${clinicname || "—"}\n` +
      `${t("step_reason")}: ${ReasonName || "—"}\n` +
      `${t("date")}: ${start.toLocaleDateString()}\n` +
      `${t("time")}: ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `${t("view_my_appts")}: ${window.location.origin}/appointments\n\n` +
      `Généré par Tabibi App.`
    );
    const location = encodeURIComponent(clinicname || "");
    const dates = `${startTime}/${endTime}`;

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(url, "_blank");
  };

  if (iconOnly) {
    return (
      <button 
        onClick={addToCalendar}
        title={t("add_to_google_calendar")}
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          borderRadius: "8px",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          ...style
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.35)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <Calendar size={18} color="#fff" />
      </button>
    );
  }

  return (
    <Btn 
      variant={variant} 
      onClick={addToCalendar} 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 12, 
        padding: "12px 24px",
        borderRadius: "14px",
        background: variant === "primary" ? "linear-gradient(135deg, #0092a2, #007585)" : "#fff",
        border: variant === "ghost" ? "2px solid #0092a2" : "none",
        color: variant === "ghost" ? "#0092a2" : "#fff",
        fontWeight: "900",
        fontSize: "14px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: variant === "primary" ? "0 8px 20px rgba(0, 146, 162, 0.25)" : "0 4px 12px rgba(0,0,0,0.05)",
        ...style 
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
        if (variant === "primary") e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 146, 162, 0.35)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        if (variant === "primary") e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 146, 162, 0.25)";
      }}
    >
      <div style={{ 
        background: variant === "primary" ? "rgba(255,255,255,0.2)" : "rgba(0,146,162,0.1)", 
        borderRadius: "8px", 
        padding: "6px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center"
      }}>
        <Calendar size={18} color={variant === "primary" ? "#fff" : "#0092a2"} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
        <span style={{ fontSize: "13px" }}>{t("add_to_google_calendar")}</span>
        <span style={{ fontSize: "10px", opacity: 0.8, fontWeight: 600 }}>Google Calendar</span>
      </div>
    </Btn>
  );
}
