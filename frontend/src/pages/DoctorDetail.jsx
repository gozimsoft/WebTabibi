// src/pages/DoctorDetail.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card, Spinner, DoctorImage, Stars, Badge, useToast } from "../components/SharedUI";

export default function DoctorDetailPage({ clinicId, doctorId, navigate, user }) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [ratings, setR] = useState(null);
  const [loading, setL] = useState(true);
  const [tab, setTab] = useState("info");
  const [myRating, setMR] = useState(0);
  const [myComment, setMC] = useState("");
  const [saving, setSav] = useState(false);
  const { show, Toast } = useToast();

  useEffect(() => {
    setL(true);
    Promise.all([
      api.clinics.doctor(clinicId, doctorId),
      api.ratings.doctor(doctorId),
    ]).then(([d, r]) => { setData(d); setR(r); })
      .catch(e => show(e.message, "error"))
      .finally(() => setL(false));
  }, [clinicId, doctorId, show]);

  const submitRating = async () => {
    if (!user) { navigate("/login"); return; }
    if (myRating < 1) { show(t("otp_error_len") || "Select rating", "error"); return; }
    setSav(true);
    try {
      await api.ratings.add({ doctor_id: doctorId, rating: myRating, comment: myComment, hide_patient: false });
      const r = await api.ratings.doctor(doctorId);
      setR(r); setMR(0); setMC("");
      show(t("save_success"));
    } catch (e) { show(e.message, "error"); }
    finally { setSav(false); }
  };

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;
  if (!data) return (
    <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>😔</div>
      <div style={{ fontWeight: 600, marginBottom: 16 }}>{t("doctor_not_found")}</div>
      <Btn onClick={() => navigate("/search")}>{t("back_to_search")}</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
      <button onClick={() => navigate("/search")} style={{ background: "none", border: "none", cursor: "pointer", color: "#0891b2", fontWeight: 600, marginBottom: 18, display: "flex", alignItems: "center", gap: 5, fontSize: 14 }}>
        {t("back_to_search")}
      </button>

      {/* Doctor header */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <DoctorImage photo={data.PhotoProfile} size={90} borderRadius={16} style={{ fontSize: 38 }} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <Badge color="#0891b2">{i18n.language === 'ar' ? data.SpecialtyAr : data.SpecialtyFr}</Badge>
              {data.Degrees && <Badge color="#7c3aed">{data.Degrees}</Badge>}
              {+data.Cnas === 1 && <Badge color="#059669">CNAS ✓</Badge>}
              {+data.Casnos === 1 && <Badge color="#0891b2">CASNOS ✓</Badge>}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", margin: "0 0 6px" }}>{data.FullName}</h1>
            {data.BaladiyaName && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>📍 {data.BaladiyaName}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Stars rating={Math.round(+(data.AvgRating || 0))} size={15} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{(+(data.AvgRating || 0)).toFixed(1)}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>({data.RatingCount || 0})</span>
              </div>
              {+data.Experience > 0 && <span style={{ fontSize: 12, color: "#6b7280" }}>⏱ {data.Experience} {t("experience")}</span>}
              {+data.Pricing > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>💰 {data.Pricing} {t("da")}</span>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            {user ? (
              <Btn onClick={() => navigate(`/book/${clinicId}/${doctorId}`)} style={{ padding: "11px 24px" }}>{t("book_appointment")}</Btn>
            ) : (
              <Btn onClick={() => navigate("/login")}>{t("login_to_book")}</Btn>
            )}
            <Btn variant="secondary" onClick={() => { navigate("/chat"); }} style={{ padding: "9px 24px", fontSize: 13 }}>{t("contact")}</Btn>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 20 }}>
        {[["info", t("tab_info")], ["reasons", t("tab_reasons")], ["schedule", t("tab_schedule")], ["ratings", t("tab_ratings")]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "9px 18px", background: "none", border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 13, color: tab === k ? "#0891b2" : "#6b7280",
            borderBottom: tab === k ? "3px solid #0891b2" : "3px solid transparent",
            marginBottom: -2, transition: "all 0.15s"
          }}>{l}</button>
        ))}
      </div>

      {/* INFO */}
      {tab === "info" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {data.Presentation && (
            <Card style={{ gridColumn: "1/-1", padding: "18px 20px" }}>
              <h3 style={{ color: "#0c4a6e", margin: "0 0 10px", fontSize: 15 }}>{t("about_doctor")}</h3>
              <p style={{ color: "#374151", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{data.Presentation}</p>
            </Card>
          )}
          {data.Education && (
            <Card style={{ padding: "18px 20px" }}>
              <h3 style={{ color: "#0c4a6e", margin: "0 0 10px", fontSize: 15 }}>{t("education")}</h3>
              <p style={{ color: "#374151", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{data.Education}</p>
            </Card>
          )}
          <Card style={{ padding: "18px 20px" }}>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 12px", fontSize: 15 }}>{t("contact_info")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13 }}>
              {data.Phone && <div>📱 <strong>{t("phone_label")}</strong> {data.Phone}</div>}
              {data.Email && <div>✉️ <strong>{t("email_label")}</strong> {data.Email}</div>}
              {data.SpeakingLanguage && <div>🗣 <strong>{t("languages")}</strong> {data.SpeakingLanguage}</div>}
              {data.PayementMethods && <div>💳 <strong>{t("payment")}</strong> {data.PayementMethods}</div>}
            </div>
          </Card>
        </div>
      )}

      {/* REASONS */}
      {tab === "reasons" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 10 }}>
          {(data.Reasons || []).map(r => (
            <Card key={r.ID} style={{ padding: "14px 16px" }}>
              <div style={{ fontWeight: 700, color: "#0c4a6e", fontSize: 14, marginBottom: 4 }}>{r.reason_name}</div>
              {+r.reason_time > 0 && <div style={{ fontSize: 11, color: "#9ca3af" }}>⏱ {r.reason_time} {t("minutes")}</div>}
            </Card>
          ))}
          {(!data.Reasons || data.Reasons.length === 0) && <p style={{ color: "#9ca3af" }}>{t("no_reasons_defined")}</p>}
        </div>
      )}

      {/* SCHEDULE */}
      {tab === "schedule" && (
        data.Schedule ? (
          <Card>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span>🗓️</span> {t("schedule_days_title")}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
              {(() => {
                const daysKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
                const weekBegin = parseInt(data.Schedule.WeekBeginDay || 0);
                const workingDays = data.Schedule.WorkingDays || "1111111";
                const orderedDays = [];
                for (let i = 0; i < 7; i++) {
                  const idx = (weekBegin + i) % 7;
                  orderedDays.push({ name: t(daysKeys[idx]), works: workingDays[i] === "1" });
                }
                return orderedDays.map((d, i) => (
                  <div key={i} style={{
                    padding: "12px", borderRadius: 12, textAlign: "center",
                    background: d.works ? "#ecfeff" : "#f9fafb",
                    border: `1.5px solid ${d.works ? "#0891b2" : "#e5e7eb"}`,
                    opacity: d.works ? 1 : 0.6, transition: "all 0.2s"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: d.works ? "#0891b2" : "#9ca3af", marginBottom: 4 }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: d.works ? "#0e7490" : "#d1d5db" }}>{d.works ? t("available") : t("closed")}</div>
                  </div>
                ));
              })()}
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px", border: "1px dashed #cbd5e1" }}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⏰</span>
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>{t("from")}</strong> {(data.Schedule.DaytimeStart || "").match(/\d{2}:\d{2}/)?.[0] || "08:00"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⌛</span>
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>{t("to")}</strong> {(data.Schedule.DaytimeEnd || "").match(/\d{2}:\d{2}/)?.[0] || "17:00"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⏱️</span>
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>{t("appt_duration")}</strong> {data.Schedule.TimeScale} {t("minutes")}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🗓️</div>
            <h3 style={{ margin: "0 0 8px", color: "#0c4a6e" }}>{t("no_schedule")}</h3>
            <p style={{ margin: 0, fontSize: 14 }}>{t("no_schedule_desc")}</p>
          </div>
        )
      )}

      {/* RATINGS */}
      {tab === "ratings" && (
        <div>
          {ratings && (
            <Card style={{ marginBottom: 16, textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#0891b2" }}>{ratings.average}</div>
              <Stars rating={Math.round(ratings.average)} size={22} />
              <div style={{ color: "#6b7280", marginTop: 6, fontSize: 13 }}>{t("based_on")} {ratings.total} {t("ratings_count")}</div>
            </Card>
          )}
          {user && (
            <Card style={{ marginBottom: 16, padding: "18px 20px" }}>
              <h3 style={{ color: "#0c4a6e", margin: "0 0 14px", fontSize: 15 }}>{t("add_rating")}</h3>
              <div style={{ marginBottom: 12 }}><Stars rating={myRating} interactive onChange={setMR} size={24} /></div>
              <textarea value={myComment} onChange={e => setMC(e.target.value)} rows={3}
                placeholder={t("comment_optional")}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
              <Btn onClick={submitRating} loading={saving} disabled={myRating < 1} style={{ padding: "9px 22px" }}>{t("submit_rating")}</Btn>
            </Card>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(ratings?.ratings || []).map(r => (
              <Card key={r.ID} style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#374151", marginBottom: 4, fontSize: 14 }}>{r.PatientName}</div>
                    <Stars rating={r.Rating} size={13} />
                  </div>
                </div>
                {r.Comment && <p style={{ color: "#6b7280", marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>{r.Comment}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
      <Toast />
    </div>
  );
}
