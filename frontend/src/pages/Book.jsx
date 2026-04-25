// src/pages/Book.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card, Spinner, DoctorImage, useToast } from "../components/SharedUI";

export default function BookPage({ clinicid, doctor_id, navigate, user }) {
  const { t, i18n } = useTranslation();
  const [doctor, setDoctor] = useState(null);
  const [family, setFamily] = useState([]);
  const [step, setStep] = useState(1);
  const [selPatient, setSelPatient] = useState(null);
  const [reason, setReason] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selSlot, setSlot] = useState("");
  const [loading, setL] = useState(false);
  const [slotsLoad, setSL] = useState(false);
  const [initLoad, setInitL] = useState(true);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const { show, Toast } = useToast();

  useEffect(() => {
    Promise.all([
      api.clinics.doctor(clinicid, doctor_id),
      api.patient.family().catch(() => []),
    ]).then(([d, fam]) => {
      setDoctor(d);
      setFamily(fam || []);
    }).catch(e => setError(e.message))
      .finally(() => setInitL(false));
  }, [clinicid, doctor_id]);

  const selfOption = { id: null, name: user?.profile?.fullname || user?.username || t("self"), isSelf: true };
  const allPatients = [selfOption, ...(family.map(f => ({ id: f.id, name: f.fullname, isSelf: false, gender: f.gender })))];
  const activePat = selPatient || selfOption;

  const fetchSlots = async (d) => {
    if (!doctor?.clinicsdoctor_id) return;
    setSL(true); setSlots([]); setSlot("");
    try {
      const s = await api.appointments.slots({ clinics_doctor_id: doctor.clinicsdoctor_id, date: d });
      setSlots(s.slots || []);
      if (!(s.slots || []).length) show(t("no_times_this_day"), "error");
    } catch (e) { show(e.message, "error"); }
    finally { setSL(false); }
  };

  const confirmBook = async () => {
    setL(true);
    try {
      const body = { clinics_doctor_id: doctor.clinicsdoctor_id, date, time: selSlot };
      if (reason) body.doctors_reason_id = reason.id;
      if (activePat.id) body.patient_id = activePat.id;
      await api.appointments.book(body);
      setStep(5);
    } catch (e) { show(e.message, "error"); }
    finally { setL(false); }
  };

  const STEPS = [
    { n: 1, label: t("step_patient"), icon: "👤" },
    { n: 2, label: t("step_reason"), icon: "🩺" },
    { n: 3, label: t("step_date"), icon: "📅" },
    { n: 4, label: t("step_confirm"), icon: "✅" },
    { n: 5, label: t("step_done"), icon: "🎉" },
  ];

  const getAvailableDates = () => {
    const schedule = doctor?.Schedule || {};
    const countdays = parseInt(schedule.countdays || 30);
    const weekBegin = parseInt(schedule.weekbeginday || 0);
    const workingdays = schedule.workingdays || "1111111";
    const dates = [];
    const stdWBD = (weekBegin + 1) % 7;
    for (let i = 0; i <= countdays; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const full = `${yyyy}-${mm}-${dd}`;
      const w = d.getDay();
      const relIndex = (w - stdWBD + 7) % 7;
      if (workingdays[relIndex] === "1" || !schedule.workingdays) {
        dates.push({
          full: full, day: d.getDate(),
          month: d.toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language, { month: "short" }),
          weekday: d.toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language, { weekday: "short" }),
        });
      }
    }
    return dates;
  };

  useEffect(() => {
    if (step === 3 && !date) {
      const avail = getAvailableDates();
      if (avail.length > 0) { setDate(avail[0].full); fetchSlots(avail[0].full); }
    }
  }, [step, doctor, date]);

  if (error) return (
    <div style={{ maxWidth: 600, margin: "60px auto", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>❌</div>
      <div style={{ color: "#dc2626", fontWeight: 600, marginBottom: 20 }}>{error}</div>
      <Btn onClick={() => navigate("/search")}>{t("back_to_search")}</Btn>
    </div>
  );
  if (initLoad || !doctor) return <div style={{ padding: 60 }}><Spinner /></div>;

  const Stepper = () => (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 36, position: "relative" }}>
      {STEPS.map((s, i) => (
        <div key={s.n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {i > 0 && (
            <div style={{
              position: "absolute", top: 18,
              left: i18n.language === 'ar' ? "50%" : "-50%",
              right: i18n.language === 'ar' ? "-50%" : "50%",
              height: 3, zIndex: 0, transition: "all 0.4s",
              background: (step > s.n || (step === 5 && s.n === 5)) ? "linear-gradient(to left, #059669, #10b981)" : step === s.n ? "linear-gradient(to left, #0891b2 60%, #e5e7eb 100%)" : "#e5e7eb"
            }} />
          )}
          <div style={{
            width: 38, height: 38, borderRadius: "50%", zIndex: 1, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: step > s.n ? 16 : 14, transition: "all 0.35s",
            background: (step > s.n || (step === 5 && s.n === 5)) ? "linear-gradient(135deg,#059669,#10b981)" : step === s.n ? "linear-gradient(135deg,#0891b2,#0e7490)" : "#e5e7eb",
            color: (step >= s.n) ? "#fff" : "#9ca3af",
            boxShadow: step === s.n ? "0 4px 16px rgba(8,145,178,0.4)" : (step > s.n || (step === 5 && s.n === 5)) ? "0 4px 12px rgba(5,150,105,0.3)" : "none",
            transform: step === s.n ? "scale(1.12)" : "scale(1)"
          }}>{(step > s.n) ? "✓" : s.icon}</div>
          <div style={{ fontSize: 10, fontWeight: 700, marginTop: 6, whiteSpace: "nowrap", color: step > s.n ? "#059669" : step === s.n ? "#0891b2" : "#9ca3af" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );

  const DoctorBanner = () => step < 5 && (
    <div style={{ background: "linear-gradient(135deg,#0c4a6e,#0891b2,#06b6d4)", borderRadius: 16, padding: "16px 22px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14, color: "#fff" }}>
      <DoctorImage photo={doctor.photoprofile} size={50} borderRadius={12} style={{ background: "rgba(255,255,255,0.18)", fontSize: 24 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 0.3 }}>{doctor.fullname}</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{i18n.language === 'ar' ? doctor.specialtyar : doctor.specialtyfr}</div>
      </div>
      {+doctor.pricing > 0 && <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 800 }}>💰 {doctor.pricing} DA</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px" }}>
      <button onClick={() => navigate(`/clinic/${clinicid}/doctor/${doctor_id}`)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#0891b2", fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>{t("back_to_doctor")}</button>
      <DoctorBanner /><Stepper />

      {step === 1 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>{t("patient_choice")}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>{t("patient_choice_desc")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {allPatients.map((p, i) => {
              const sel = activePat.id === p.id && activePat.isSelf === p.isSelf;
              return (
                <div key={i} onClick={() => setSelPatient(p)} style={{
                  padding: "14px 18px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                  border: sel ? "2.5px solid #0891b2" : "1.5px solid #e5e7eb",
                  background: sel ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : "#fafafa",
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: sel ? "0 4px 18px rgba(8,145,178,0.14)" : "none", transform: sel ? "scale(1.01)" : "scale(1)"
                }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? "linear-gradient(135deg,#0891b2,#0e7490)" : "linear-gradient(135deg,#f3f4f6,#e5e7eb)" }}>{p.isSelf ? "😊" : (p.gender === 1 ? "👩" : "👨")}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: sel ? "#0c4a6e" : "#374151" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{p.isSelf ? t("self") : t("family_member")}</div>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", transition: "all 0.2s", background: sel ? "#0891b2" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 900 }}>{sel ? "✓" : ""}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 24 }}><Btn onClick={() => setStep(2)} style={{ width: "100%", justifyContent: "center", padding: 14 }}>{t("next_reason")}</Btn></div>
        </Card>
      )}

      {step === 2 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>{t("step_reason")}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>{t("comment_optional")}</p>
          {(!doctor.reasons || doctor.reasons.length === 0) ? (
            <div style={{ padding: "28px", textAlign: "center", color: "#9ca3af", background: "#f9fafb", borderRadius: 12, marginBottom: 20 }}>📋 {t("no_reasons_defined")}</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
              {doctor.reasons.map(r => {
                const sel = reason?.id === r.id;
                return (
                  <div key={r.id} onClick={() => setReason(sel ? null : r)} style={{
                    padding: "14px 16px", borderRadius: 11, cursor: "pointer", transition: "all 0.2s",
                    border: sel ? "2.5px solid #0891b2" : "1.5px solid #e5e7eb", background: sel ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : "#fafafa", transform: sel ? "scale(1.02)" : "scale(1)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 700, color: sel ? "#0c4a6e" : "#374151", fontSize: 14 }}>{r.reason_name}</div>
                      {sel && <span style={{ color: "#0891b2", fontWeight: 900 }}>✓</span>}
                    </div>
                    {+r.reason_time > 0 && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>⏱ {r.reason_time} {t("minutes")}</div>}
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Btn variant="secondary" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center" }}>{t("prev")}</Btn>
            <Btn onClick={() => setStep(3)} style={{ flex: 2, justifyContent: "center" }}>{reason ? t("next_date") : t("skip_date")}</Btn>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>{t("step_date")}</h2>
          <div style={{ marginBottom: 26 }}>
            <label style={{ display: "block", marginBottom: 12, fontWeight: 700, fontSize: 14 }}>{t("avail_days")}</label>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
              {getAvailableDates().map(d => {
                const sel = date === d.full;
                return (
                  <div key={d.full} onClick={() => { setDate(d.full); fetchSlots(d.full); }} style={{
                    flexShrink: 0, width: 80, padding: "12px 8px", borderRadius: 14, textAlign: "center", cursor: "pointer",
                    border: sel ? "2.5px solid #0891b2" : "1.5px solid #e5e7eb", background: sel ? "#ecfeff" : "#fff", transform: sel ? "translateY(-2px)" : "none"
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: sel ? "#0891b2" : "#9ca3af" }}>{d.weekday}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: sel ? "#0c4a6e" : "#374151" }}>{d.day}</div>
                    <div style={{ fontSize: 11, color: sel ? "#0891b2" : "#9ca3af" }}>{d.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {date && (
            <div>
              <label style={{ display: "block", marginBottom: 10, fontWeight: 700 }}>{t("avail_times")}</label>
              {slotsLoad ? <Spinner /> : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px,1fr))", gap: 8 }}>
                  {slots.map(s => (
                    <div key={s} onClick={() => setSlot(s)} style={{
                      padding: "10px 4px", borderRadius: 10, textAlign: "center", cursor: "pointer", fontWeight: 700, fontSize: 13,
                      border: selSlot === s ? "2px solid #0891b2" : "1.5px solid #e5e7eb", background: selSlot === s ? "#0891b2" : "#fafafa", color: selSlot === s ? "#fff" : "#374151"
                    }}>{s}</div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Btn variant="secondary" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: "center" }}>{t("prev")}</Btn>
            <Btn onClick={() => setStep(4)} disabled={!selSlot || !date} style={{ flex: 2, justifyContent: "center" }}>{t("next_date")}</Btn>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>{t("review_confirm")}</h2>
          <div style={{ background: "#f0fdfa", border: "1px solid #a5f3fc", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
            {[
              ["👨‍⚕️", t("doctor"), doctor.fullname],
              ["🏥", t("specialty"), (i18n.language === 'ar' ? doctor.specialtyar : doctor.specialtyfr) || "—"],
              ["👤", t("patient"), `${activePat.name}${activePat.isSelf ? ` (${t("self")})` : ` — ${t("family_member")}`}`],
              ["🩺", t("step_reason"), reason?.reason_name || "—"],
              ["📅", t("date"), date],
              ["⏰", t("time"), selSlot],
              ...(+doctor.pricing > 0 ? [["💰", t("consultation_fee"), `${doctor.pricing} ${t("da")}`]] : []),
            ].map(([ic, lbl, val], idx, arr) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: idx < arr.length - 1 ? "1px solid rgba(8,145,178,0.12)" : "none" }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{ic}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{lbl}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0c4a6e" }}>{val}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "20px", marginBottom: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: "#0c4a6e", marginTop: 0 }}>{t("privacy_title")}</h3>
            <div style={{ fontSize: 12, color: "#475569", maxHeight: 100, overflowY: "auto", marginBottom: 15 }}>{t("privacy_desc")}</div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#0891b2" }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>{t("privacy_agree")}</span>
            </label>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="secondary" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: "center" }}>{t("prev")}</Btn>
            <Btn onClick={confirmBook} loading={loading} disabled={!agreed} style={{ flex: 2, justifyContent: "center" }}>{t("confirm_final")}</Btn>
          </div>
        </Card>
      )}

      {step === 5 && (
        <Card style={{ padding: "44px 28px", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#fff" }}>✅</div>
          <h2 style={{ color: "#059669", fontSize: 24, fontWeight: 900 }}>{t("success_title")}</h2>
          <p style={{ color: "#6b7280", marginBottom: 28 }}>{t("success_msg")} <strong>{doctor.fullname}</strong><br />{t("day")} <strong>{date}</strong> {t("at_time")} <strong>{selSlot}</strong></p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn variant="secondary" onClick={() => navigate("/")}>{t("home")}</Btn>
            <Btn onClick={() => navigate("/appointments")}>{t("view_my_appts")}</Btn>
          </div>
        </Card>
      )}
      <Toast />
    </div>
  );
}
