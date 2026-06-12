// src/pages/Book.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card, Spinner, DoctorImage, useToast } from "../components/SharedUI";
import GoogleCalendarButton from "../components/GoogleCalendarButton";
import { MapPin, Phone, User, Building, HeartPulse, Calendar as CalendarIcon, CheckCircle, Award, Stethoscope, Clock, CreditCard, UserPlus } from "lucide-react";
import analytics from "../utils/analytics";


export default function BookPage({ clinicid, doctor_id, navigate, user }) {
  const { t, i18n } = useTranslation();
  const [doctor, setDoctor] = useState(null);
  const [family, setFamily] = useState([]);
  const [clinicList, setClinicList] = useState([]);
  const needsClinicSelect = !clinicid || clinicid === "0" || +clinicid === 0;
  const [selectedClinicId, setSelectedClinicId] = useState(needsClinicSelect ? null : clinicid);
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
  const completedRef = useRef(false);

  // Analytics: Step Viewed
  useEffect(() => {
    const stepObj = STEPS.find(s => s.n === step);
    analytics.track("booking_step_viewed", {
      step_index: step,
      step_name: stepObj?.label,
      doctor_id: doctor_id,
      clinic_id: selectedClinicId,
      specialty: doctor ? (i18n.language === 'ar' ? doctor.specialtyar : doctor.specialtyfr) : null
    });
  }, [step, doctor]);

  // Analytics: Abandonment Tracking
  useEffect(() => {
    return () => {
      if (!completedRef.current && step < 6) {
        analytics.track("booking_abandoned", {
          last_step_index: step,
          last_step_name: STEPS.find(s => s.n === step)?.label,
          doctor_id: doctor_id,
          clinic_id: selectedClinicId
        });
      }
    };
  }, [step, doctor_id, selectedClinicId]);

  const trackNext = (currentStepName) => {
    analytics.track("booking_step_next_clicked", {
      from_step: currentStepName,
      step_index: step,
      doctor_id: doctor_id
    });
  };


  useEffect(() => {
    const load = async () => {
      try {
        const fam = await api.patient.family().catch(() => []);
        setFamily(fam || []);
        if (needsClinicSelect) {
          const doc = await api.doctors.get(doctor_id);
          const clinics = doc.OtherClinics || [];
          setClinicList(clinics);
          if (clinics.length === 1) {
            setSelectedClinicId(clinics[0].id);
            const d = await api.clinics.doctor(clinics[0].id, doctor_id);
            setDoctor(d);
          }
        } else {
          const d = await api.clinics.doctor(clinicid, doctor_id);
          setDoctor(d);
          const doc = await api.doctors.get(doctor_id).catch(() => null);
          if (doc?.OtherClinics) setClinicList(doc.OtherClinics);
        }
      } catch (e) { setError(e.message); }
      finally { setInitL(false); }
    };
    load();
  }, [clinicid, doctor_id]);

  const selfOption = { id: null, name: user?.profile?.fullname || user?.username || t("self"), isSelf: true };
  const allPatients = [selfOption, ...(family.map(f => ({ id: f.id, name: f.fullname, isSelf: false, gender: f.gender })))];
  const activePat = selPatient || selfOption;

  const fetchSlots = async (d) => {
    if (!doctor?.clinicsdoctor_id) return;
    setSL(true); setSlots([]); setSlot("");
    try {
      const s = await api.appointments.slots({ clinics_doctor_id: doctor.clinicsdoctor_id, date: d });
      let availableSlots = s.slots || [];
      
      const now = new Date();
      const isToday = d === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (isToday) {
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        availableSlots = availableSlots.filter(slot => slot > currentTimeStr);
      }

      setSlots(availableSlots);
      if (!availableSlots.length) show(t("no_times_this_day"), "error");
    } catch (e) { show(e.message, "error"); }
    finally { setSL(false); }
  };

  const handleClinicSelect = async (cid) => {
    setSelectedClinicId(cid);
    setL(true);
    try {
      const d = await api.clinics.doctor(cid, doctor_id);
      setDoctor(d);
    } catch (e) { show(e.message, "error"); }
    finally { setL(false); }
  };

  const confirmBook = async () => {
    setL(true);
    analytics.track("booking_confirm_clicked", { doctor_id, date, time: selSlot });
    try {
      const body = { clinics_doctor_id: doctor.clinicsdoctor_id, date, time: selSlot };
      if (reason) body.doctors_reason_id = reason.id;
      if (activePat.id) body.patient_id = activePat.id;
      await api.appointments.book(body);
      completedRef.current = true;
      analytics.track("booking_completed", {
        doctor_id,
        clinic_id: selectedClinicId,
        specialty: i18n.language === 'ar' ? doctor.specialtyar : doctor.specialtyfr
      });
      setStep(6);
    } catch (e) {
      analytics.track("booking_error", { error: e.message });
      show(e.message, "error");
    }
    finally { setL(false); }
  };

  const STEPS = [
    { n: 1, label: t("step_patient"), icon: <UserPlus size={18} /> },
    { n: 2, label: t("step_clinic") || "العيادة", icon: <Building size={18} /> },
    { n: 3, label: t("step_reason"), icon: <HeartPulse size={18} /> },
    { n: 4, label: t("step_date"), icon: <CalendarIcon size={18} /> },
    { n: 5, label: t("step_confirm"), icon: <CheckCircle size={18} /> },
    { n: 6, label: t("step_done"), icon: <Award size={18} /> },
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
    if (step === 4 && !date) {
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
  if (initLoad) return <div style={{ padding: 60 }}><Spinner /></div>;


  const Stepper = () => (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 36, position: "relative" }}>
      {STEPS.map((s, i) => (
        <div key={s.n} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {i > 0 && (
            <div style={{
              position: "absolute", top: 18,
              left: i18n.language === 'ar' ? "50%" : "-50%",
              right: i18n.language === 'ar' ? "-50%" : "50%",
              height: 3, zIndex: 0, transition: "all 0.4s",
              background: (step > s.n || (step === 6 && s.n === 6)) ? "linear-gradient(to left, #059669, #10b981)" : step === s.n ? "linear-gradient(to left, #0891b2 60%, #e5e7eb 100%)" : "#e5e7eb"
            }} />
          )}
          <div style={{
            width: 38, height: 38, borderRadius: "50%", zIndex: 1, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: step > s.n ? 16 : 14, transition: "all 0.35s",
            background: (step > s.n || (step === 6 && s.n === 6)) ? "linear-gradient(135deg,#059669,#10b981)" : step === s.n ? "linear-gradient(135deg,#0891b2,#0e7490)" : "#e5e7eb",
            color: (step >= s.n) ? "#fff" : "#9ca3af",
            boxShadow: step === s.n ? "0 4px 16px rgba(8,145,178,0.4)" : (step > s.n || (step === 6 && s.n === 6)) ? "0 4px 12px rgba(5,150,105,0.3)" : "none",
            transform: step === s.n ? "scale(1.12)" : "scale(1)"
          }}>{(step > s.n) ? "✓" : s.icon}</div>
          <div style={{ fontSize: 10, fontWeight: 700, marginTop: 6, textAlign: "center", lineHeight: 1.2, wordBreak: "break-word", color: step > s.n ? "#059669" : step === s.n ? "#0891b2" : "#9ca3af" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );

  const DoctorBanner = () => (doctor && step < 6) && (
    <div style={{ background: "linear-gradient(135deg,#0c4a6e,#0891b2,#06b6d4)", borderRadius: 16, padding: "16px 22px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14, color: "#fff" }}>
      <DoctorImage photo={doctor.photoprofile} size={50} borderRadius={12} style={{ background: "rgba(255,255,255,0.18)", fontSize: 24 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 0.3 }}>{doctor.fullname}</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{i18n.language === 'ar' ? doctor.specialtyar : doctor.specialtyfr}</div>
      </div>
      {+doctor.pricing > 0 && <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 800 }}>💰 {doctor.pricing} DA</div>}
    </div>
  );

  const Confetti = () => (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000, overflow: "hidden" }}>
      {Array(50).fill(0).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: -20,
          left: `${Math.random() * 100}%`,
          width: Math.random() * 8 + 4,
          height: Math.random() * 12 + 6,
          background: ["#0891b2", "#10b981", "#fbbf24", "#ef4444", "#3b82f6"][Math.floor(Math.random() * 5)],
          borderRadius: 2,
          transform: `rotate(${Math.random() * 360}deg)`,
          animation: `fall ${Math.random() * 2 + 2}s linear forwards`,
          animationDelay: `${Math.random() * 3}s`
        }} />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(720deg); }
        }
      `}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px" }}>
      <button onClick={() => navigate(selectedClinicId ? `/clinic/${selectedClinicId}/doctor/${doctor_id}` : `/doctor/${doctor_id}`)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#0891b2", fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>{t("back_to_doctor")}</button>

      <DoctorBanner /><Stepper />

      {step === 1 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>{t("patient_choice")}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 14px" }}>{t("patient_choice_desc")}</p>
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
                  <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? "linear-gradient(135deg,#0891b2,#0e7490)" : "linear-gradient(135deg,#f3f4f6,#e5e7eb)" }}>
                    <User size={24} color={sel ? "#fff" : "#9ca3af"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: sel ? "#0c4a6e" : "#374151" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{p.isSelf ? t("self") : t("family_member")}</div>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", transition: "all 0.2s", background: sel ? "#0891b2" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 900 }}>{sel ? "✓" : ""}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 24 }}><Btn onClick={() => { trackNext("patient_choice"); setStep(2); }} label={t("next") || "التالي"} style={{ width: "100%", justifyContent: "center" }} /></div>
        </Card>
      )}

      {step === 2 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>{t("step_clinic") || "اختيار العيادة"}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 14px" }}>{t("select_clinic_desc") || "اختر العيادة التي تريد الحجز فيها"}</p>
          {loading ? <Spinner /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
              {clinicList.map(c => {
                const sel = String(selectedClinicId) === String(c.id);
                return (
                  <div key={c.id} onClick={() => handleClinicSelect(c.id)} style={{
                    padding: "16px 18px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                    border: sel ? "2.5px solid #0891b2" : "1.5px solid #e5e7eb",
                    background: sel ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : "#fafafa",
                    display: "flex", alignItems: "flex-start", gap: 14,
                    boxShadow: sel ? "0 4px 18px rgba(8,145,178,0.14)" : "none"
                  }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: sel ? "linear-gradient(135deg,#0891b2,#0e7490)" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Building size={20} color={sel ? "#fff" : "#9ca3af"} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: sel ? "#0c4a6e" : "#374151", marginBottom: 4 }}>{c.clinicname}</div>
                      {c.address && <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} />{c.address}</div>}
                      {c.phone && <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}><Phone size={12} />{c.phone}</div>}
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: sel ? "#0891b2" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{sel ? "✓" : ""}</div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Btn variant="secondary" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center" }}>{t("prev")}</Btn>
            <Btn variant="primary" onClick={() => { trackNext("clinic_choice"); setStep(3); }} disabled={!selectedClinicId || !doctor} style={{ flex: 2, justifyContent: "center" }}>{t("next") || "التالي"}</Btn>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>{t("step_reason")}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 14px" }}>{t("comment_optional")}</p>
          {(!doctor.reasons || doctor.reasons.length === 0) ? (
            <div style={{ padding: "28px", textAlign: "center", color: "#9ca3af", background: "#f9fafb", borderRadius: 12, marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Stethoscope size={32} color="#cbd5e1" />
              {t("no_reasons_defined")}
            </div>
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
            <Btn variant="secondary" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: "center" }}>{t("prev")}</Btn>
            <Btn variant="primary" onClick={() => { trackNext("reason_choice"); setStep(4); }} style={{ flex: 2, justifyContent: "center" }}>{reason ? t("next_date") : t("skip_date")}</Btn>
          </div>
        </Card>
      )}

      {step === 4 && (
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
            <Btn variant="secondary" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: "center" }}>{t("prev")}</Btn>
            <Btn variant="primary" onClick={() => { trackNext("date_choice"); setStep(5); }} disabled={!selSlot || !date} style={{ flex: 2, justifyContent: "center" }}>{t("next_date")}</Btn>
          </div>
        </Card>
      )}

      {step === 5 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>{t("review_confirm")}</h2>
          <div style={{ background: "#f0fdfa", border: "1px solid #a5f3fc", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
            {[
              [<User size={18} />, t("doctor"), doctor.fullname],
              [<Stethoscope size={18} />, t("specialty"), (i18n.language === 'ar' ? doctor.specialtyar : doctor.specialtyfr) || "—"],
              [<UserPlus size={18} />, t("patient"), `${activePat.name}${activePat.isSelf ? ` (${t("self")})` : ` — ${t("family_member")}`}`],
              [<HeartPulse size={18} />, t("step_reason"), reason?.reason_name || "—"],
              [<CalendarIcon size={18} />, t("date"), date],
              [<Clock size={18} />, t("time"), selSlot],
              ...(+doctor.pricing > 0 ? [[<CreditCard size={18} />, t("consultation_fee"), `${doctor.pricing} ${t("da")}`]] : []),
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
            <Btn variant="secondary" onClick={() => setStep(4)} style={{ flex: 1, justifyContent: "center" }}>{t("prev")}</Btn>
            <Btn variant="primary" onClick={confirmBook} loading={loading} disabled={!agreed} style={{ flex: 2, justifyContent: "center" }}>{t("confirm_final")}</Btn>
          </div>
        </Card>
      )}

      {step === 6 && (
        <div style={{ position: "relative" }}>
          <Confetti />
          <Card style={{ padding: "40px 24px", textAlign: "center", overflow: "hidden" }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%", background: "#f0fdf4",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
              boxShadow: "0 10px 30px rgba(16,185,129,0.2)", animation: "bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
            }}>
              <CheckCircle size={54} color="#10b981" />
            </div>

            <h2 style={{ color: "#059669", margin: "0 0 12px", fontSize: 26, fontWeight: 900 }}>{t("congrats")}</h2>
            <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 30 }}>{t("success_msg")} <strong>{doctor.fullname}</strong></p>

            {/* Appointment Ticket */}
            <div style={{
              background: "var(--bg)", borderRadius: 20, padding: "24px", marginBottom: 30,
              border: "2px dashed var(--border)", position: "relative", textAlign: i18n.language === 'ar' ? "right" : "left"
            }}>
              <div style={{ position: "absolute", top: "50%", left: -10, width: 20, height: 20, borderRadius: "50%", background: "var(--card-bg)", transform: "translateY(-50%)" }} />
              <div style={{ position: "absolute", top: "50%", right: -10, width: 20, height: 20, borderRadius: "50%", background: "var(--card-bg)", transform: "translateY(-50%)" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{t("date")}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#0c4a6e" }}>{date}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{t("at_time")}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#0c4a6e" }}>{selSlot}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{t("patient")}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{activePat.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{t("clinic")}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{doctor.clinicname}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <GoogleCalendarButton
                appointment={{ doctorname: doctor.fullname, clinicname: doctor.clinicname, apointementdate: `${date}T${selSlot}:00`, ReasonName: reason?.reason_name, patientname: activePat.name }}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 8, width: "100%" }}>
                <Btn variant="secondary" onClick={() => navigate("/")} style={{ flex: 1, justifyContent: "center" }}>{t("home")}</Btn>
                <Btn onClick={() => navigate("/appointments")} style={{ flex: 1, justifyContent: "center" }}>{t("view_my_appts")}</Btn>
              </div>
            </div>
          </Card>
          <style>{`
            @keyframes bounceIn {
              from { transform: scale(0.5); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
      <Toast />
    </div>
  );
}
