// src/pages/Appointments.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card, Spinner, DoctorImage, Badge, useToast } from "../components/SharedUI";

export default function AppointmentsPage({ navigate }) {
  const { t, i18n } = useTranslation();
  const [appts, setAppts] = useState([]);
  const [loading, setL] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const { show, Toast } = useToast();
  const now = new Date();

  useEffect(() => {
    api.patient.appointments().then(setAppts).catch(() => { }).finally(() => setL(false));
  }, []);

  const cancel = async (id) => {
    if (!confirm(t("cancel_confirm"))) return;
    try {
      await api.appointments.cancel(id);
      setAppts(p => p.filter(a => a.ID !== id));
      show(t("cancel_success"));
    } catch (e) { show(e.message, "error"); }
  };

  const filtered = appts.filter(a => {
    const d = new Date(a.AppointementDate);
    if (filter === "upcoming") return d >= now;
    if (filter === "past") return d < now;
    return true;
  });

  const cnt = (f) => appts.filter(a => {
    const d = new Date(a.AppointementDate);
    if (f === "upcoming") return d >= now;
    if (f === "past") return d < now;
    return true;
  }).length;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", margin: 0 }}>{t("appointments_title")}</h1>
        <Btn onClick={() => navigate("/search")} style={{ padding: "9px 18px", fontSize: 13 }}>{t("book_new")}</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[[ "all", t("all") ], [ "upcoming", t("upcoming") ], [ "past", t("past") ]].map(([ v, l ]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            borderColor: filter === v ? "#0891b2" : "#e5e7eb",
            background: filter === v ? "#ecfeff" : "#fff",
            color: filter === v ? "#0891b2" : "#6b7280"
          }}>{l} ({cnt(v)})</button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 16 }}>
            {filter === "upcoming" ? t("no_upcoming") : t("no_results")}
          </div>
          <Btn onClick={() => navigate("/search")}>{t("search_btn")}</Btn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(a => {
            const isPast = new Date(a.AppointementDate) < now;
            const d = new Date(a.AppointementDate);
            return (
              <Card key={a.ID} style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <DoctorImage photo={a.PhotoProfile} size={46} borderRadius={10} style={{ background: isPast ? "#f3f4f6" : undefined }} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "#0c4a6e", fontSize: 15 }}>{a.DoctorName || t("doctor")}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>🏥 {a.ClinicName || "—"}</div>
                        {a.ReasonName && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>🩺 {a.ReasonName}</div>}
                      </div>
                      <div style={{ textAlign: i18n.language === 'ar' ? "right" : "left" }}>
                        <div style={{ fontWeight: 800, color: "#0891b2", fontSize: 14 }}>
                          {d.toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language, { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                          ⏰ {d.toLocaleTimeString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language, { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          {isPast ? <Badge color="#6b7280">{t("past_badge")}</Badge> : <Badge color="#059669">{t("upcoming_badge")}</Badge>}
                        </div>
                      </div>
                    </div>
                    {!isPast && (
                      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        <Btn variant="danger" onClick={() => cancel(a.ID)} style={{ padding: "6px 14px", fontSize: 12 }}>{t("cancel_btn")}</Btn>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Toast />
    </div>
  );
}
