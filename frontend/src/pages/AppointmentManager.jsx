import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import {
  Calendar, Clock, User, Phone, CheckCircle,
  XCircle, AlertCircle, RefreshCw, Filter, Search,
  Activity, ClipboardList, Plus, X, FileText,
  LayoutList, CalendarDays, ChevronLeft, ChevronRight, MapPin,
  Maximize, Minimize, ArrowUpDown, Check
} from "lucide-react";
import { Btn, Spinner, useToast } from "../components/SharedUI";

// ── New Appointment Modal ────────────────────────────────────────────────────
function NewAppointmentModal({ onClose, onSuccess, show: visible }) {
  const { t } = useTranslation();
  const { show } = useToast();
  const [saving, setSaving] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [allReasons, setAllReasons] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  const [form, setForm] = useState({
    clinics_doctor_id: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    patientname: "",
    phone: "",
    note: "",
    doctors_reason_id: "",
  });

  useEffect(() => {
    if (!visible) return;
    setLoadingClinics(true);
    api.doctor.getProfile()
      .then(res => {
        const docClinics = res.clinics || [];
        setClinics(docClinics.map(c => ({ id: c.clinicsdoctor_id, name: c.clinicname, clinic_id: c.clinic_id })));
        setAllReasons(res.reasons || []);
        if (docClinics.length > 0) {
          setForm(f => ({ ...f, clinics_doctor_id: docClinics[0].clinicsdoctor_id, doctors_reason_id: "" }));
        }
      })
      .catch(() => { })
      .finally(() => setLoadingClinics(false));
  }, [visible]);

  const field = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientname.trim()) return show(t("appt_mgr_patient_name_req"), "error");
    if (!form.clinics_doctor_id) return show(t("appt_mgr_select_clinic_req"), "error");
    setSaving(true);
    try {
      await api.doctor.addAppointment(form);
      show(t("appt_mgr_save_success"), "success");
      onSuccess();
      onClose();
    } catch (err) {
      show(err.message || t("appt_mgr_save_error"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  const inp = {
    width: "100%", padding: "10px 14px", borderRadius: 12,
    border: "1.5px solid var(--border, #e2e8f0)", outline: "none", fontSize: 14,
    fontFamily: "inherit", boxSizing: "border-box", color: "var(--text-main, #1e293b)",
    background: "var(--input-bg, #fff)",
    transition: "border-color 0.2s",
  };
  const lbl = { fontSize: 13, fontWeight: 700, color: "var(--text-secondary, #475569)", marginBottom: 6, display: "block" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: "var(--card-bg, #fff)", borderRadius: 24, padding: 32, width: "100%",
        maxWidth: 480, boxShadow: "var(--shadow-lg, 0 24px 60px rgba(0,0,0,0.18))",
        border: "1px solid var(--border, transparent)",
        position: "relative", animation: "slideUp 0.25s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,var(--brand, #0891b2),var(--brand-dark, #0e7490))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plus size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "var(--text-main, #0f172a)" }}>{t("appt_mgr_new_appointment")}</h2>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary, #64748b)" }}>{t("appt_mgr_new_appt_subtitle")}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "var(--input-bg, #f1f5f9)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} color="var(--text-secondary, #64748b)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Clinic */}
          <div>
            <label style={lbl}>{t("appt_mgr_clinic_location")}</label>
            {loadingClinics ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", color: "var(--text-secondary, #64748b)", fontSize: 13 }}>
                <Spinner size={16} /> {t("loading")}
              </div>
            ) : clinics.length === 0 ? (
              <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{t("appt_mgr_no_clinic_associated")}</p>
            ) : (
              <select
                value={form.clinics_doctor_id}
                onChange={e => {
                  field("clinics_doctor_id", e.target.value);
                  field("doctors_reason_id", "");
                }}
                style={inp}
                required
              >
                {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          {/* Reason */}
          <div>
            <label style={lbl}><FileText size={13} style={{ marginLeft: 4 }} /> {t("appt_mgr_visit_reason")}</label>
            <select
              value={form.doctors_reason_id}
              onChange={e => field("doctors_reason_id", e.target.value)}
              style={inp}
            >
              <option value="">{t("appt_mgr_unspecified")}</option>
              {(() => {
                const selectedClinic = clinics.find(c => String(c.id) === String(form.clinics_doctor_id));
                const targetClinicId = selectedClinic?.clinic_id;
                // Show reasons matching the selected clinic, or all reasons if no match found
                const filtered = targetClinicId
                  ? allReasons.filter(r => String(r.clinic_id) === String(targetClinicId))
                  : allReasons;
                // Fallback: if filtered is empty, show all reasons
                const toShow = filtered.length > 0 ? filtered : allReasons;
                return toShow.map(r => (
                  <option key={r.id} value={r.id}>{r.reason_name}</option>
                ));
              })()}
            </select>
          </div>

          {/* Patient Name */}
          <div>
            <label style={lbl}><User size={13} style={{ marginLeft: 4 }} /> {t("appt_mgr_patient_name")}</label>
            <input
              type="text"
              placeholder={t("appt_mgr_patient_name_placeholder")}
              value={form.patientname}
              onChange={e => field("patientname", e.target.value)}
              style={inp}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label style={lbl}><Phone size={13} style={{ marginLeft: 4 }} /> {t("appt_mgr_phone_number")}</label>
            <input
              type="tel"
              placeholder="05XXXXXXXX"
              value={form.phone}
              onChange={e => field("phone", e.target.value)}
              style={inp}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}><Calendar size={13} style={{ marginLeft: 4 }} /> {t("appt_mgr_date_label")}</label>
              <input type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={e => field("date", e.target.value)} style={inp} required />
            </div>
            <div>
              <label style={lbl}><Clock size={13} style={{ marginLeft: 4 }} /> {t("appt_mgr_time_label")}</label>
              <input type="time" min={form.date === new Date().toISOString().slice(0, 10) ? `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}` : undefined} value={form.time} onChange={e => field("time", e.target.value)} style={inp} required />
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={lbl}><FileText size={13} style={{ marginLeft: 4 }} /> {t("appt_mgr_note")}</label>
            <textarea
              placeholder={t("appt_mgr_note_placeholder")}
              value={form.note}
              onChange={e => field("note", e.target.value)}
              rows={3}
              style={{ ...inp, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1.5px solid var(--border, #e2e8f0)", background: "var(--input-bg, #fff)", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "var(--text-secondary, #64748b)" }}>
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={saving || loadingClinics || clinics.length === 0}
              style={{
                flex: 2, padding: "12px", borderRadius: 14, border: "none",
                background: saving ? "var(--text-muted, #94a3b8)" : "linear-gradient(135deg,var(--brand, #0891b2),var(--brand-dark, #0e7490))",
                color: "#fff", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.2s",
              }}
            >
              {saving ? <><Spinner size={16} /> {t("appt_mgr_saving")}</> : <><Plus size={16} /> {t("appt_mgr_register_btn")}</>}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Weekly Schedule View ─────────────────────────────────────────────────────
function WeeklyScheduleView({ appointments, settings, weekStart, setWeekStart, STATUS_COLORS, STATUS_LABELS, onUpdateStatus, onAddNew }) {
  const { t, i18n } = useTranslation();
  const DAYS_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  const timescale = parseInt(settings?.timescale || 30);
  const extractTime = (dt, fallback) => {
    const m = (dt || "").match(/(\d{2}:\d{2})/);
    return m ? m[1] : fallback;
  };
  const startTime = extractTime(settings?.daytimestart, "08:00");
  const endTime = extractTime(settings?.daytimeend, "18:00");
  const workingStr = settings?.workingdays || "1111111";

  const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const toStr = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  const slots = [];
  for (let m = toMins(startTime); m < toMins(endTime); m += timescale) slots.push(toStr(m));

  // Build 7-day array from weekStart (Monday)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + i);
    return d;
  });

  const fmt = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = fmt(new Date());

  // Index appointments by matching local slot (taking timezone into account)
  const bySlot = {};
  appointments.forEach(a => {
    const d = new Date(a.apointementdate || a.date);
    if (isNaN(d.getTime())) return;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const localDate = `${year}-${month}-${day}`;

    const apptMins = d.getHours() * 60 + d.getMinutes();
    const startMins = toMins(startTime);

    let slotTime = startTime;
    if (apptMins >= startMins) {
      const k = Math.floor((apptMins - startMins) / timescale);
      const slotMins = startMins + k * timescale;
      slotTime = toStr(slotMins);
    }

    const key = `${localDate}__${slotTime}`;
    if (!bySlot[key]) bySlot[key] = [];
    bySlot[key].push(a);
  });

  const prevWeek = () => { const d = new Date(weekStart + "T00:00:00"); d.setDate(d.getDate() - 7); setWeekStart(fmt(d)); };
  const nextWeek = () => { const d = new Date(weekStart + "T00:00:00"); d.setDate(d.getDate() + 7); setWeekStart(fmt(d)); };
  const goToday = () => {
    const d = new Date(); const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    setWeekStart(fmt(d));
  };

  const COL_W = 130; // px per day column
  const ROW_H = 52;  // px per time slot

  const currentLang = i18n.language === 'ar' ? 'ar-DZ' : i18n.language;
  const isRtl = i18n.language === 'ar';

  return (
    <div style={{ background: "var(--card-bg, #fff)", borderRadius: 24, overflow: "hidden", boxShadow: "var(--shadow, 0 4px 20px rgba(0,0,0,0.06))", border: "1px solid var(--border, transparent)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,var(--brand, #0891b2),var(--brand-dark, #0e7490))", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button onClick={prevWeek} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>
            {weekDays[0].toLocaleDateString(currentLang, { day: "numeric", month: "long" })} — {weekDays[6].toLocaleDateString(currentLang, { day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
            {timescale} {t("appt_mgr_minute_visit")} &nbsp;·&nbsp; {startTime} — {endTime}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={goToday} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "5px 12px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{t("appt_mgr_today")}</button>
          <button onClick={nextWeek} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "70vh" }}>
        <div style={{ minWidth: 80 + COL_W * 7 }}>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: `80px repeat(7, ${COL_W}px)`, borderBottom: "2px solid var(--border, #e2e8f0)", position: "sticky", top: 0, background: "var(--card-bg, #fff)", zIndex: 10 }}>
            <div style={{ padding: "10px 8px", fontSize: 11, color: "var(--text-muted, #94a3b8)", fontWeight: 600, borderRight: "1px solid var(--border, #f1f5f9)", textAlign: "center" }}>{t("appt_mgr_time_header")}</div>
            {weekDays.map((d, i) => {
              const ds = fmt(d);
              const isToday = ds === today;
              const jsDay = d.getDay(); // 0=Sun..6=Sat
              const dayIndex = (jsDay + 6) % 7; // 0=Mon..6=Sun matching Delphi workingdays
              const isWorking = workingStr[dayIndex] === "1";
              return (
                <div key={i} style={{ padding: "10px 6px", textAlign: "center", borderRight: "1px solid var(--border, #f1f5f9)", background: isToday ? "var(--brand-light, #ecfeff)" : !isWorking ? "var(--input-bg, #fafafa)" : "var(--card-bg, #fff)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? "var(--brand, #0891b2)" : "var(--text-secondary, #64748b)" }}>{t(DAYS_KEYS[jsDay])}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: isToday ? "var(--brand, #0891b2)" : "var(--text-main, #334155)", marginTop: 2 }}>{d.getDate()}</div>
                  {isToday && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand, #0891b2)", margin: "4px auto 0" }} />}
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          {slots.map((slot, si) => (
            <div key={si} style={{ display: "grid", gridTemplateColumns: `80px repeat(7, ${COL_W}px)`, borderBottom: "1px solid var(--border, #f1f5f9)", minHeight: ROW_H }}>
              {/* Time label */}
              <div style={{ padding: "4px 8px", fontSize: 11, fontWeight: 700, color: "var(--text-muted, #94a3b8)", borderRight: "1px solid var(--border, #f1f5f9)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--input-bg, #fafafa)" }}>
                {slot}
              </div>
              {weekDays.map((d, di) => {
                const ds = fmt(d);
                const key = `${ds}__${slot}`;
                const appts = bySlot[key] || [];
                const jsDay = d.getDay();
                const dayIndex = (jsDay + 6) % 7;
                const isWorking = workingStr[dayIndex] === "1";
                const isToday = ds === today;
                return (
                  <div key={di} style={{ borderRight: "1px solid var(--border, #f1f5f9)", padding: "3px 4px", minHeight: ROW_H, background: isToday ? "var(--brand-light, #f8fbff)" : !isWorking ? "var(--input-bg, #fafafa)" : "var(--card-bg, #fff)", position: "relative" }}>
                    {appts.map((appt, ai) => {
                      // فحص ما إذا كان الموعد في الماضي أو تم تأكيد إتمامه (مستخدم)
                      const apptDateStr = String(appt.apointementdate || appt.date || "").trim().replace(" ", "T");
                      const apptDateObj = new Date(apptDateStr);
                      const isPastTime = !isNaN(apptDateObj.getTime()) && apptDateObj < new Date();
                      const isCompleted = Number(appt.status) === 2;
                      const isCancelled = Number(appt.status) === 1;
                      const isPending = Number(appt.status) === 0;
                      // إذا انقضى وقت الموعد دون اتخاذ أي إجراء (المريض لم يحضر: غائب)
                      const isAbsent = isPending && isPastTime;
                      const isUsed = isCompleted || isAbsent;

                      // تحديد الألوان: ملغي (أحمر)، مستخدم/مكتمل/غائب (رمادي)، موعد قادم قيد الانتظار (أصفر)
                      const sc = isCancelled
                        ? (STATUS_COLORS[1] || STATUS_COLORS[0])
                        : isUsed
                        ? (STATUS_COLORS[2] || { bg: "var(--status-completed-bg, #f1f5f9)", color: "var(--status-completed-text, #475569)", border: "var(--status-completed-border, #cbd5e1)" })
                        : (STATUS_COLORS[0] || STATUS_COLORS[0]);

                      const statusText = isCompleted
                        ? STATUS_LABELS[2]
                        : isCancelled
                        ? STATUS_LABELS[1]
                        : isAbsent
                        ? (t("appt_mgr_absent") || "ABSENT")
                        : STATUS_LABELS[0];

                      // تلميح الماوس (Tooltip) يحتوي على اسم المريض، سبب الموعد، والحالة
                      const tooltipLines = [
                        appt.patientname || t("appt_mgr_unknown_patient"),
                        appt.reason_name ? `${t("appt_mgr_visit_reason") || "السبب"}: ${appt.reason_name}` : null,
                        statusText,
                        appt.note ? `${t("appt_mgr_note") || "ملاحظة"}: ${appt.note}` : null
                      ].filter(Boolean);
                      const tooltip = tooltipLines.join("\n");

                      return (
                        <div key={ai} title={tooltip}
                          style={{
                            background: sc.bg,
                            border: `1px solid ${sc.border}`,
                            borderRadius: 8,
                            padding: "3px 6px",
                            marginBottom: 2,
                            cursor: "default",
                            opacity: isUsed ? 0.9 : 1,
                            transition: "all 0.2s ease"
                          }}>
                          <div style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: sc.color,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis"
                          }}>
                            {appt.patientname || t("appt_mgr_unknown_patient")}
                          </div>
                          {appt.reason_name && (
                            <div style={{
                              fontSize: 9,
                              color: isUsed ? "var(--text-muted, #94a3b8)" : "var(--text-secondary, #64748b)",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis"
                            }}>
                              {appt.reason_name}
                            </div>
                          )}
                          {isPending && (
                            isPastTime ? (
                              // إذا انقضى الوقت دون إجراء: استبدال الزرين بزر تحذيري أصفر بنص ABSENT مع بقاء الإطار رمادياً
                              <div style={{ marginTop: 3 }}>
                                <button
                                  type="button"
                                  title={t("appt_mgr_absent_desc") || "Patient absent — rendez-vous passé sans action"}
                                  style={{
                                    width: "100%",
                                    padding: "2px 4px",
                                    borderRadius: 5,
                                    border: "1px solid var(--status-booked-border, #fde68a)",
                                    background: "var(--status-booked-bg, #fef3c7)",
                                    color: "var(--status-booked-text, #92400e)",
                                    fontWeight: 800,
                                    fontSize: 9,
                                    cursor: "default",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    letterSpacing: "0.5px"
                                  }}
                                >
                                  {t("appt_mgr_absent") || "ABSENT"}
                                </button>
                              </div>
                            ) : (
                              // الموعد القادم: زرا الإتمام (أخضر) والإلغاء (أحمر)
                              <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
                                <button
                                  onClick={() => onUpdateStatus(appt.id, 2)}
                                  title={t("appt_mgr_complete_visit")}
                                  style={{
                                    flex: 1,
                                    padding: "2px 3px",
                                    borderRadius: 5,
                                    border: "none",
                                    background: "#d1fae5",
                                    color: "#065f46",
                                    fontWeight: 700,
                                    fontSize: 9,
                                    cursor: "pointer"
                                  }}
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => onUpdateStatus(appt.id, 1)}
                                  title={t("appt_mgr_cancel_appt")}
                                  style={{
                                    flex: 1,
                                    padding: "2px 3px",
                                    borderRadius: 5,
                                    border: "none",
                                    background: "#fee2e2",
                                    color: "#991b1b",
                                    fontWeight: 700,
                                    fontSize: 9,
                                    cursor: "pointer"
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer: legend + add button */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border, #f1f5f9)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {Object.entries(STATUS_LABELS).map(([k, label]) => {
            const sc = STATUS_COLORS[k] || {};
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-secondary, #64748b)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: sc.bg, border: `1px solid ${sc.border}` }} />
                {label}
              </div>
            );
          })}
        </div>
        <button onClick={onAddNew} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,var(--brand, #0891b2),var(--brand-dark, #0e7490))", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
          <Plus size={13} /> {t("appt_mgr_new_appointment")}
        </button>
      </div>
    </div>
  );
}


// ── Main Component ───────────────────────────────────────────────────────────
export default function AppointmentManager({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { show, Toast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getCurrentMonday = (baseDate = new Date()) => {
    const d = new Date(baseDate);
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };

  const formatDateYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getWeekRange = (mondayDate) => {
    const sunday = new Date(mondayDate);
    sunday.setDate(mondayDate.getDate() + 6);
    return {
      from: formatDateYMD(mondayDate),
      to: formatDateYMD(sunday),
      start: formatDateYMD(mondayDate)
    };
  };

  const defaultWeek = getWeekRange(getCurrentMonday());

  const [filter, setFilter] = useState("booked");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(defaultWeek.from);
  const [dateTo, setDateTo] = useState(defaultWeek.to);
  const [quickFilter, setQuickFilter] = useState("this_week"); // this_week by default
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("tabibi_appt_view_mode");
    return saved === "list" || saved === "calendar" ? saved : "calendar";
  });
  const [calWeek, setCalWeek] = useState(defaultWeek.start);
  const [scheduleSettings, setScheduleSettings] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState("all");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [doctorFullName, setDoctorFullName] = useState(() => user?.profile?.fullname || user?.fullname || "");
  const [showStats, setShowStats] = useState(() => {
    const saved = localStorage.getItem("appt_show_stats");
    return saved !== null ? saved === "true" : false;
  });
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem("tabibi_appt_sort_by") || "date_asc";
  });

  const toggleFullscreen = () => {
    const el = document.getElementById("appt-manager-fullscreen-container");
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Error enabling fullscreen:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error("Error exiting fullscreen:", err));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const applyQuickFilter = (key) => {
    const today = new Date();
    setQuickFilter(key);
    if (key === "today") {
      const todayStr = formatDateYMD(today);
      setDateFrom(todayStr); setDateTo(todayStr);
      setCalWeek(defaultWeek.start);
    } else if (key === "this_week") {
      const w = getWeekRange(getCurrentMonday());
      setDateFrom(w.from); setDateTo(w.to);
      setCalWeek(w.start);
    } else if (key === "week") {
      const nextMon = getCurrentMonday();
      nextMon.setDate(nextMon.getDate() + 7);
      const w = getWeekRange(nextMon);
      setDateFrom(w.from); setDateTo(w.to);
      setCalWeek(w.start);
    } else if (key === "month") {
      const end = new Date(today); end.setMonth(today.getMonth() + 1);
      setDateFrom(formatDateYMD(today)); setDateTo(formatDateYMD(end));
    } else if (key === "3months") {
      const end = new Date(today); end.setMonth(today.getMonth() + 3);
      setDateFrom(formatDateYMD(today)); setDateTo(formatDateYMD(end));
    } else {
      setDateFrom(""); setDateTo("");
      setCalWeek(defaultWeek.start);
    }
  };

  const lastSignatureRef = useRef("");

  const areAppointmentsEqual = (prev, next) => {
    if (prev === next) return true;
    if (!prev || !next || prev.length !== next.length) return false;
    for (let i = 0; i < prev.length; i++) {
      const a = prev[i];
      const b = next[i];
      if (
        a.id !== b.id ||
        a.status !== b.status ||
        a.apointementdate !== b.apointementdate ||
        a.patientname !== b.patientname ||
        a.phone !== b.phone ||
        a.clinic_id !== b.clinic_id ||
        a.updatedat !== b.updatedat
      ) {
        return false;
      }
    }
    return true;
  };

  const fetchAppointments = async (isRefresh = false, clinicId = selectedClinicId, silent = false) => {
    if (user?.user_type !== 1) return;
    if (!silent) {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
    }
    try {
      const params = clinicId !== "all" ? { clinic_id: clinicId } : {};
      const res = await api.doctor.getForManager(params);
      const data = res.appointments || [];
      if (res.settings) {
        setScheduleSettings(prev => {
          if (JSON.stringify(prev) === JSON.stringify(res.settings)) return prev;
          return res.settings;
        });
      }
      const incoming = Array.isArray(data) ? data : [];
      setAppointments(prev => {
        if (areAppointmentsEqual(prev, incoming)) {
          return prev;
        }
        return incoming;
      });
    } catch (err) {
      if (!silent) show(err.message || t("error_occurred"), "error");
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (user?.user_type !== 1) return;
    if (user?.profile?.fullname || user?.fullname) {
      setDoctorFullName(user?.profile?.fullname || user?.fullname);
    }
    api.doctor.getProfile()
      .then(res => {
        if (res?.fullname) setDoctorFullName(res.fullname);
        const docClinics = res.clinics || [];
        setClinics(docClinics.map(c => ({ id: c.clinicsdoctor_id, name: c.clinicname, clinic_id: c.clinic_id })));
        if (docClinics.length > 0) {
          setSelectedClinicId(docClinics[0].clinic_id);
        } else {
          fetchAppointments(false, "all");
        }
      })
      .catch(() => {
        fetchAppointments(false, "all");
      });
  }, [user]);

  useEffect(() => {
    if (selectedClinicId) {
      fetchAppointments(false, selectedClinicId);
    }
  }, [selectedClinicId]);

  // ── مزامنة ذكية شبه فورية في الخلفية (Real-Time Auto-Sync)
  useEffect(() => {
    if (user?.user_type !== 1) return;

    // فحص سريع عبر توقيع الـ API (حجم البيانات أقل من 150 بايت واستجابة فورية)
    const checkAndSync = async () => {
      try {
        const res = await api.doctor.syncCheck({ clinic_id: selectedClinicId });
        if (res && res.signature) {
          if (lastSignatureRef.current && lastSignatureRef.current !== res.signature) {
            // هناك حجز جديد، إلغاء، أو تغيير في المواعيد أو الإشعارات
            fetchAppointments(false, selectedClinicId, true);
          }
          lastSignatureRef.current = res.signature;
        } else {
          fetchAppointments(false, selectedClinicId, true);
        }
      } catch {
        fetchAppointments(false, selectedClinicId, true);
      }
    };

    let timer = null;
    const scheduleNext = () => {
      // 4 ثوانٍ عند بقاء الصفحة نشطة و15 ثانية عند مغادرة النافذة لتوفير موارد الخادم
      const delay = document.hidden ? 15000 : 4000;
      timer = setTimeout(async () => {
        await checkAndSync();
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    // استجابة فورية (0 مللي ثانية) للأحداث المحلية داخل المتصفح أو بين التبويبات
    const onImmediateSync = () => {
      fetchAppointments(false, selectedClinicId, true);
    };

    const onWake = () => {
      if (!document.hidden) {
        checkAndSync();
      }
    };

    window.addEventListener("tabibi:appointment_sync", onImmediateSync);
    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);

    let bc = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('tabibi_sync');
        bc.onmessage = (msg) => {
          if (msg.data?.type === 'appointment_updated') {
            onImmediateSync();
          }
        };
      }
    } catch (e) {}

    const onStorage = (e) => {
      if (e.key === 'tabibi_sync_tick') {
        onImmediateSync();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("tabibi:appointment_sync", onImmediateSync);
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, [selectedClinicId, user]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.doctor.updateAppointmentStatus(id, status);
      show(t("appt_mgr_status_update_success"), "success");
      fetchAppointments(true);
    } catch (err) {
      show(err.message || t("appt_mgr_error"), "error");
    }
  };

  const STATUS_LABELS = {
    0: t("appt_mgr_status_booked"),
    1: t("appt_mgr_status_cancelled"),
    2: t("appt_mgr_status_completed")
  };
  const STATUS_COLORS = {
    0: { bg: "var(--status-booked-bg, #fef3c7)", color: "var(--status-booked-text, #92400e)", border: "var(--status-booked-border, #fde68a)" },   // أصفر — بانتظار الزيارة
    1: { bg: "var(--status-cancelled-bg, #fee2e2)", color: "var(--status-cancelled-text, #991b1b)", border: "var(--status-cancelled-border, #fca5a5)" },   // أحمر — ملغي
    2: { bg: "var(--status-completed-bg, #f1f5f9)", color: "var(--status-completed-text, #475569)", border: "var(--status-completed-border, #cbd5e1)" },   // رمادي — مكتمل / مستخدم
  };

  const now = new Date();
  const clinicFilter = (a) => selectedClinicId === "all" || String(a.clinic_id) === String(selectedClinicId);
  const filtered = appointments.filter(a => {
    const matchesFilter = filter === "all" ||
      (filter === "booked" && Number(a.status) === 0) ||
      (filter === "done" && Number(a.status) === 2) ||
      (filter === "cancelled" && Number(a.status) === 1);
    const matchesSearch = !search ||
      (a.patientname || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.phone || "").includes(search);
    const apptDate = (a.apointementdate || a.date || "").slice(0, 10);
    const matchesFrom = !dateFrom || apptDate >= dateFrom;
    const matchesTo = !dateTo || apptDate <= dateTo;
    return matchesFilter && matchesSearch && matchesFrom && matchesTo && clinicFilter(a);
  });

  // ترتيب قائمة المواعيد المصفاة في وضع العرض كقائمة
  const sortedFiltered = [...filtered].sort((a, b) => {
    if (sortBy === "date_asc") {
      const da = new Date(String(a.apointementdate || a.date || "").trim().replace(" ", "T")).getTime() || 0;
      const db = new Date(String(b.apointementdate || b.date || "").trim().replace(" ", "T")).getTime() || 0;
      return da - db;
    }
    if (sortBy === "date_desc") {
      const da = new Date(String(a.apointementdate || a.date || "").trim().replace(" ", "T")).getTime() || 0;
      const db = new Date(String(b.apointementdate || b.date || "").trim().replace(" ", "T")).getTime() || 0;
      return db - da;
    }
    if (sortBy === "name_asc") {
      return (a.patientname || "").localeCompare(b.patientname || "", i18n.language === "ar" ? "ar" : "fr");
    }
    if (sortBy === "status") {
      return Number(a.status) - Number(b.status);
    }
    return 0;
  });

  // قائمة المواعيد المخصصة لجدول التقويم الأسبوعي (الحفاظ على المواعيد المنتهية أو المكتملة بلون رمادي دون إخفائها)
  const calendarAppointments = appointments.filter(a => {
    const matchesClinic = clinicFilter(a);
    const matchesSearch = !search ||
      (a.patientname || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.phone || "").includes(search);
    const matchesFilter = filter === "all" ||
      (filter === "booked" && (Number(a.status) === 0 || Number(a.status) === 2)) ||
      (filter === "done" && Number(a.status) === 2) ||
      (filter === "cancelled" && Number(a.status) === 1);
    return matchesClinic && matchesSearch && matchesFilter;
  });

  const stats = {
    total: appointments.filter(clinicFilter).length,
    booked: appointments.filter(a => clinicFilter(a) && Number(a.status) === 0).length,
    done: appointments.filter(a => clinicFilter(a) && Number(a.status) === 2).length,
    cancelled: appointments.filter(a => clinicFilter(a) && Number(a.status) === 1).length,
  };

  const glassPanel = {
    background: "var(--glass-bg, rgba(255,255,255,0.75))",
    backdropFilter: "var(--glass-blur, blur(12px))",
    WebkitBackdropFilter: "var(--glass-blur, blur(12px))",
    border: "1px solid var(--glass-border, rgba(255,255,255,0.5))",
    boxShadow: "var(--shadow, 0 8px 32px rgba(12,74,110,0.05))",
    borderRadius: 24,
  };

  const rawDoctorName = doctorFullName || user?.profile?.fullname || user?.fullname || user?.username || "";
  const cleanDoctorName = (rawDoctorName || "").replace(/^(دكتور|الدكتور|د[\.\/]|Dr\.?)\s+/i, "").trim() || rawDoctorName;

  if (user?.user_type === 2) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", direction: i18n.language === "ar" ? "rtl" : "ltr" }}>
        <div style={{ ...glassPanel, maxWidth: 520, width: "100%", padding: "40px 32px", textAlign: "center" }}>
          <div style={{ width: 68, height: 68, borderRadius: 22, background: "rgba(8,145,178,0.1)", color: "var(--brand, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Calendar size={34} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-main)", marginBottom: 12 }}>
            {t("appt_mgr_clinic_dev", "L'interface de la clinique est en cours de développement")}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary, #64748b)", lineHeight: 1.7, marginBottom: 28 }}>
            {i18n.language === "ar"
              ? "لوحة إدارة المواعيد الحالية مخصصة للأطباء. بصفتك عيادة، يمكنك حالياً إدارة الأطباء المرتبطين بعيادتك ومتابعة طلبات الانضمام عبر صفحة طلبات الانضمام."
              : "Le gestionnaire de rendez-vous actuel est dédié aux médecins. En tant que clinique, vous pouvez gérer les médecins rattachés et les demandes d'adhésion via la page dédiée."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="primary" onClick={() => navigate("/requests")}>
              {t("join_requests", "طلبات الانضمام")}
            </Btn>
            <Btn variant="secondary" onClick={() => navigate("/")}>
              {t("home", "الرئيسية")}
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #f8fafc)", padding: "32px 24px", paddingBottom: 100 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Fullscreen Wrapper */}
        <div id="appt-manager-fullscreen-container" style={{ display: "flex", flexDirection: "column" }}>

          {/* ── HEADER BANNER ── */}
          <div className="no-print" style={{
            background: "linear-gradient(135deg, rgb(14, 116, 144) 0%, rgb(8, 145, 178) 100%)",
            borderRadius: 24,
            padding: "28px 32px",
            color: "rgb(255, 255, 255)",
            marginBottom: 24,
            boxShadow: "rgba(8, 145, 178, 0.25) 0px 10px 30px -5px",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: -40,
              [isRtl ? "left" : "right"]: -40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              pointerEvents: "none"
            }} />

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 20,
              position: "relative",
              zIndex: 2
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  background: "rgba(255, 255, 255, 0.18)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgb(255, 255, 255)"
                }}>
                  <Calendar size={32} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900 }}>
                    {t("appt_mgr_title", "Gestionnaire de Rendez-vous")}
                  </h1>
                  <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                    <span>
                      {cleanDoctorName
                        ? t("appt_mgr_subtitle", {
                            name: cleanDoctorName,
                            defaultValue: `مرحباً د. ${cleanDoctorName}، تابع مواعيدك ومرضاك من هنا.`
                          })
                        : t("appt_mgr_subtitle_generic", "تابع مواعيدك ومرضاك من هنا.")}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 14,
                    border: "none",
                    cursor: "pointer",
                    transition: "0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgb(255, 255, 255)",
                    color: "rgb(8, 145, 178)",
                    boxShadow: "rgba(0, 0, 0, 0.12) 0px 4px 14px"
                  }}
                >
                  <Plus size={18} />
                  {t("appt_mgr_new_appointment", "Nouveau RDV")}
                </button>

                <button
                  onClick={() => fetchAppointments(true)}
                  disabled={refreshing || loading}
                  title={t("refresh", "Actualiser")}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    color: "rgb(255, 255, 255)",
                    borderRadius: 12,
                    padding: "10px 14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "0.15s"
                  }}
                >
                  <RefreshCw size={16} className={refreshing ? "spin-anim" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* Merged Header & Filters Card */}
          <div style={{ ...glassPanel, padding: "20px 24px", marginBottom: 24, direction: i18n.language === "ar" ? "rtl" : "ltr" }}>
            {/* Header section with Title and main Actions */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              paddingBottom: 16,
              marginBottom: 16,
              borderBottom: "1px solid var(--border, rgba(0,0,0,0.05))"
            }}>
              {/* Left: Title & Page Indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "var(--brand-light, #ecfeff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand, #0891b2)"
                }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "var(--heading-color, #0c4a6e)", display: "block" }}>
                    {t("appt_mgr_title")}
                  </span>
                </div>
              </div>

              {/* Right: Toggle Stats & Main Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {/* Toggle Stats Button */}
                <button
                  onClick={() => {
                    const newVal = !showStats;
                    setShowStats(newVal);
                    localStorage.setItem("appt_show_stats", String(newVal));
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    borderRadius: 12,
                    border: showStats ? "1px solid var(--brand, #0891b2)" : "1px solid var(--border, #cffafe)",
                    background: showStats ? "linear-gradient(135deg, #f0fdfa, #ecfeff)" : "var(--card-bg, #fff)",
                    color: "var(--brand, #0891b2)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: showStats ? "none" : "rgba(8, 145, 178, 0.05) 0px 2px 6px"
                  }}
                >
                  <Activity size={16} />
                  {showStats ? t("appt_mgr_hide_stats") : t("appt_mgr_show_stats")}
                </button>

              </div>
            </div>

            {/* Stats Panel (conditionally rendered inside header/filters wrapper when showStats is true) */}
            {showStats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--border, rgba(0,0,0,0.05))" }}>
                {[
                  { title: t("appt_mgr_total_appointments"), count: stats.total, icon: <Activity size={20} />, color: "var(--stat-total-text, #0891b2)", bg: "var(--stat-total-bg, linear-gradient(135deg,#cffafe,#a5f3fc))" },
                  { title: t("appt_mgr_pending"), count: stats.booked, icon: <Clock size={20} />, color: "var(--stat-booked-text, #92400e)", bg: "var(--stat-booked-bg, linear-gradient(135deg,#fef9c3,#fde68a))" },
                  { title: t("appt_mgr_completed"), count: stats.done, icon: <CheckCircle size={20} />, color: "var(--stat-done-text, #059669)", bg: "var(--stat-done-bg, linear-gradient(135deg,#d1fae5,#a7f3d0))" },
                  { title: t("appt_mgr_cancelled"), count: stats.cancelled, icon: <XCircle size={20} />, color: "var(--stat-cancelled-text, #991b1b)", bg: "var(--stat-cancelled-bg, linear-gradient(135deg,#fee2e2,#fca5a5))" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "var(--card-bg, #fff)", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow, 0 2px 8px rgba(0,0,0,0.02))", border: "1px solid var(--border, rgba(0,0,0,0.01))" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-main, #0f172a)", lineHeight: 1 }}>{s.count}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary, #64748b)", marginTop: 4 }}>{s.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Row 1 — Quick filter buttons & View Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
              {/* Quick filter buttons */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { key: "", label: t("appt_mgr_all") },
                  { key: "this_week", label: t("appt_mgr_this_week") },
                  { key: "today", label: t("appt_mgr_today") },
                  { key: "week", label: t("appt_mgr_next_week") },
                  { key: "month", label: t("appt_mgr_next_month") },
                  { key: "3months", label: t("appt_mgr_next_3months") },
                ].map(({ key, label }) => {
                  const active = quickFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => applyQuickFilter(key)}
                      style={{
                        padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                        border: active ? "none" : "1.5px solid var(--border, #e2e8f0)",
                        background: active ? "linear-gradient(135deg,var(--brand, #0891b2),var(--brand-dark, #0e7490))" : "var(--card-bg, #fff)",
                        color: active ? "#fff" : "var(--text-secondary, #475569)",
                        cursor: "pointer",
                        boxShadow: active ? "var(--shadow-brand, 0 4px 12px rgba(8,145,178,0.25))" : "none",
                        transition: "all 0.18s",
                      }}
                    >{label}</button>
                  );
                })}
              </div>

              {/* View Toggle & Full Screen */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", background: "var(--input-bg, #f1f5f9)", borderRadius: 12, padding: 4, gap: 2 }}>
                  {[{ key: "list", Icon: LayoutList, label: t("appt_mgr_list") }, { key: "calendar", Icon: CalendarDays, label: t("appt_mgr_calendar") }].map(({ key, Icon, label }) => (
                    <button key={key} onClick={() => { setViewMode(key); localStorage.setItem("tabibi_appt_view_mode", key); }} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                      borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                      background: viewMode === key ? "var(--card-bg, #fff)" : "transparent",
                      color: viewMode === key ? "var(--brand, #0891b2)" : "var(--text-secondary, #64748b)",
                      boxShadow: viewMode === key ? "var(--shadow, 0 2px 8px rgba(0,0,0,0.08))" : "none",
                      transition: "all 0.18s",
                    }}><Icon size={16} />{label}</button>
                  ))}
                </div>

                <button
                  onClick={toggleFullscreen}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 38, height: 38, borderRadius: 12, border: "1.5px solid var(--border, #e2e8f0)",
                    background: "var(--card-bg, #fff)", color: "var(--text-secondary, #64748b)", cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  title={isFullscreen ? t("appt_mgr_exit_fullscreen") : t("appt_mgr_enter_fullscreen")}
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>

            {/* Row 2 — Search + Status + Date range */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              {/* Clinic Filter */}
              {clinics.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: selectedClinicId !== "all" ? "var(--brand-light, #ecfeff)" : "var(--input-bg, #f8fafc)", padding: "9px 14px", borderRadius: 14, border: selectedClinicId !== "all" ? "1px solid var(--brand, #cffafe)" : "1px solid var(--border, #e2e8f0)" }}>
                  <MapPin size={16} color={selectedClinicId !== "all" ? "var(--brand, #0891b2)" : "var(--text-muted, #94a3b8)"} />
                  <select
                    value={selectedClinicId}
                    onChange={e => setSelectedClinicId(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", color: "var(--text-main, #334155)", fontWeight: 700, cursor: "pointer" }}
                  >
                    <option value="all">{t("appt_mgr_all_clinics")}</option>
                    {clinics.map(c => (
                      <option key={c.id} value={c.clinic_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--input-bg, #f8fafc)", padding: "9px 14px", borderRadius: 14, border: "1px solid var(--border, #e2e8f0)", flex: "1 1 240px" }}>
                <Search size={16} color="var(--text-muted, #94a3b8)" />
                <input
                  type="text"
                  placeholder={t("appt_mgr_search_placeholder")}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: "none", outline: "none", width: "100%", fontSize: 13, background: "transparent", color: "var(--text-main, #334155)" }}
                />
                {search && <XCircle size={15} color="var(--text-muted, #94a3b8)" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => setSearch("")} />}
              </div>

              {/* Status filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--input-bg, #f8fafc)", padding: "9px 14px", borderRadius: 14, border: "1px solid var(--border, #e2e8f0)" }}>
                <Filter size={16} color="var(--text-muted, #94a3b8)" />
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", color: "var(--text-main, #334155)", fontWeight: 700, cursor: "pointer" }}
                >
                  <option value="all">{t("appt_mgr_all_status")}</option>
                  <option value="booked">{t("appt_mgr_pending")}</option>
                  <option value="done">{t("appt_mgr_completed")}</option>
                  <option value="cancelled">{t("appt_mgr_cancelled")}</option>
                </select>
              </div>

              {/* Sort Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--input-bg, #f8fafc)", padding: "9px 14px", borderRadius: 14, border: "1px solid var(--border, #e2e8f0)" }}>
                <ArrowUpDown size={15} color="var(--brand, #0891b2)" />
                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); localStorage.setItem("tabibi_appt_sort_by", e.target.value); }}
                  style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", color: "var(--text-main, #334155)", fontWeight: 700, cursor: "pointer" }}
                  title={t("appt_mgr_sort_by")}
                >
                  <option value="date_asc">{t("appt_mgr_sort_date_asc")}</option>
                  <option value="date_desc">{t("appt_mgr_sort_date_desc")}</option>
                  <option value="name_asc">{t("appt_mgr_sort_name_asc")}</option>
                  <option value="status">{t("appt_mgr_sort_status")}</option>
                </select>
              </div>
            </div>

            {/* Row 3 — Dates on one side and the rest on the other side */}
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              {/* Date range */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--input-bg, #f8fafc)", padding: "7px 12px", borderRadius: 12, border: "1px solid var(--border, #e2e8f0)", flexShrink: 0 }}>
                <Calendar size={15} color="var(--brand, #0891b2)" />
                <span style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", fontWeight: 600 }}>{t("appt_mgr_from")}</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setQuickFilter(""); }}
                  style={{ border: "none", outline: "none", fontSize: 12.5, color: "var(--text-main, #334155)", background: "transparent", cursor: "pointer" }}
                />
                <span style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", fontWeight: 600 }}>{t("appt_mgr_to")}</span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={e => { setDateTo(e.target.value); setQuickFilter(""); }}
                  style={{ border: "none", outline: "none", fontSize: 12.5, color: "var(--text-main, #334155)", background: "transparent", cursor: "pointer" }}
                />
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(""); setDateTo(""); setQuickFilter(""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
                    title={t("appt_mgr_clear_filter")}
                  >
                    <XCircle size={15} color="#ef4444" />
                  </button>
                )}
              </div>

              {/* Active filters summary */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", fontWeight: 600 }}>{t("appt_mgr_results")}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--brand, #0891b2)", background: "var(--brand-light, #ecfeff)", padding: "4px 10px", borderRadius: 20 }}>
                  {filtered.length} {t("appt_mgr_appointments_count")}
                </span>
                {selectedClinicId !== "all" && (
                  <span style={{ fontSize: 12, color: "var(--brand, #0891b2)", background: "var(--brand-light, #ecfeff)", padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={11} />
                    {clinics.find(c => String(c.clinic_id) === String(selectedClinicId))?.name || t("clinic")}
                  </span>
                )}
                {(dateFrom || dateTo) && (
                  <span style={{ fontSize: 12, color: "var(--text-secondary, #64748b)", background: "var(--input-bg, #f1f5f9)", padding: "4px 10px", borderRadius: 20 }}>
                    {dateFrom && dateTo ? `${dateFrom} ← ${dateTo}` : dateFrom ? `${t("from")} ${dateFrom}` : `${t("to")} ${dateTo}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading && !refreshing ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><Spinner size={40} /></div>
          ) : viewMode === "calendar" ? (
            <WeeklyScheduleView
              appointments={calendarAppointments}
              settings={scheduleSettings}
              weekStart={calWeek}
              setWeekStart={setCalWeek}
              STATUS_LABELS={STATUS_LABELS}
              STATUS_COLORS={STATUS_COLORS}
              onUpdateStatus={handleUpdateStatus}
              onAddNew={() => setShowModal(true)}
            />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--card-bg, #fff)", borderRadius: 24, boxShadow: "var(--shadow, 0 4px 20px rgba(0,0,0,0.02))", border: "1px solid var(--border, transparent)" }}>
              <Calendar size={64} color="var(--text-muted, #cbd5e1)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-main, #334155)", margin: "0 0 8px 0" }}>{t("appt_mgr_no_appointments")}</h3>
              <p style={{ color: "var(--text-secondary, #64748b)", margin: "0 0 20px 0" }}>{t("appt_mgr_no_appointments_desc")}</p>
              <button onClick={() => setShowModal(true)} style={{ padding: "12px 24px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,var(--brand, #0891b2),var(--brand-dark, #0e7490))", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Plus size={16} /> {t("appt_mgr_register_first_appt")}
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {sortedFiltered.map(appt => {
                const apptDateStr = String(appt.apointementdate || appt.date || "").trim().replace(" ", "T");
                const d = new Date(apptDateStr);
                const isPastTime = !isNaN(d.getTime()) && d < new Date();
                const isCompleted = Number(appt.status) === 2;
                const isCancelled = Number(appt.status) === 1;
                const isPending = Number(appt.status) === 0;
                const isAbsent = isPending && isPastTime;
                const isPast = isCompleted || isCancelled || isAbsent;

                const statusStyle = isAbsent
                  ? { bg: "var(--status-booked-bg, #fef3c7)", color: "var(--status-booked-text, #92400e)", border: "var(--status-booked-border, #fde68a)" }
                  : (STATUS_COLORS[appt.status] || STATUS_COLORS[0]);

                const statusLabelText = isAbsent
                  ? (t("appt_mgr_absent") || "ABSENT")
                  : (STATUS_LABELS[appt.status] ?? "—");

                const formattedDate = d.toLocaleDateString(i18n.language === "ar" ? "ar-DZ" : i18n.language, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
                const formattedTime = d.toLocaleTimeString(i18n.language === "ar" ? "ar-DZ" : i18n.language, { hour: "2-digit", minute: "2-digit" });

                return (
                  <div
                    key={appt.id}
                    className="appt-card"
                    style={{
                      background: "var(--card-bg, #fff)",
                      borderRadius: 14,
                      padding: "12px 14px",
                      boxShadow: "var(--shadow, 0 2px 8px rgba(0,0,0,0.03))",
                      border: "1px solid var(--border, rgba(0,0,0,0.06))",
                      transition: "all 0.2s ease",
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: isPast ? "var(--border, #cbd5e1)" : "linear-gradient(90deg,var(--brand, #0891b2),var(--brand-dark, #0e7490))" }} />

                    <div>
                      {/* Top row: Avatar + Patient info + Status Badge */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            background: isPast ? "var(--input-bg, #f1f5f9)" : "var(--brand-light, #ecfeff)",
                            color: isPast ? "var(--text-secondary, #64748b)" : "var(--brand, #0891b2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <User size={16} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{ fontWeight: 800, fontSize: 13.5, color: "var(--text-main, #0f172a)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              title={appt.patientname || t("appt_mgr_unknown_patient")}
                            >
                              {appt.patientname || t("appt_mgr_unknown_patient")}
                            </div>
                            {appt.phone && (
                              <div style={{ fontSize: 11, color: "var(--text-secondary, #64748b)", display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                                <Phone size={10} style={{ flexShrink: 0 }} />
                                <span style={{ direction: "ltr" }}>{appt.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <span style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                          borderRadius: 12,
                          padding: "2px 7px",
                          fontSize: 10,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                          flexShrink: 0
                        }}>
                          {statusLabelText}
                        </span>
                      </div>

                      {/* Compact Details Box */}
                      <div style={{ background: "var(--input-bg, #f8fafc)", borderRadius: 9, padding: "7px 10px", marginBottom: 8, border: "1px solid var(--border, #f1f5f9)" }}>
                        {/* Date and Time on a unified row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--text-main, #334155)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, overflow: "hidden" }}>
                            <Calendar size={12} color="var(--brand, #0891b2)" style={{ flexShrink: 0 }} />
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {formattedDate}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--brand, #0891b2)", background: "var(--brand-light, #ecfeff)", padding: "1px 6px", borderRadius: 5, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                            <Clock size={10} />
                            <span>{formattedTime}</span>
                          </div>
                        </div>

                        {/* Reason */}
                        {appt.reason_name && (
                          <div
                            style={{ marginTop: 5, paddingTop: 5, borderTop: "1px dashed var(--border, #e2e8f0)", fontSize: 11, color: "var(--text-secondary, #64748b)", display: "flex", alignItems: "center", gap: 5 }}
                            title={appt.reason_name}
                          >
                            <FileText size={11} style={{ flexShrink: 0 }} />
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{appt.reason_name}</span>
                          </div>
                        )}

                        {/* Note */}
                        {appt.note && (
                          <div
                            style={{ marginTop: 4, fontSize: 10.5, color: "var(--text-secondary, #64748b)", display: "flex", alignItems: "center", gap: 4 }}
                            title={appt.note}
                          >
                            <AlertCircle size={10} style={{ flexShrink: 0 }} />
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{appt.note}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions / Status */}
                    {isPending ? (
                      isAbsent ? (
                        <div style={{
                          width: "100%",
                          padding: "5px 8px",
                          borderRadius: 8,
                          border: "1px solid var(--status-booked-border, #fde68a)",
                          background: "var(--status-booked-bg, #fef3c7)",
                          color: "var(--status-booked-text, #92400e)",
                          fontWeight: 800,
                          fontSize: 11,
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          letterSpacing: "0.5px"
                        }}>
                          {t("appt_mgr_absent") || "ABSENT"}
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 2)}
                            title={t("appt_mgr_complete_visit")}
                            style={{ flex: 1, padding: "5px 6px", borderRadius: 7, border: "none", background: "#d1fae5", color: "#065f46", fontWeight: 700, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, transition: "background 0.15s" }}
                          >
                            <Check size={12} /> <span style={{ whiteSpace: "nowrap" }}>{t("appt_mgr_complete_visit")}</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 1)}
                            title={t("appt_mgr_cancel_appt")}
                            style={{ flex: 1, padding: "5px 6px", borderRadius: 7, border: "none", background: "#fee2e2", color: "#991b1b", fontWeight: 700, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, transition: "background 0.15s" }}
                          >
                            <X size={12} /> <span style={{ whiteSpace: "nowrap" }}>{t("appt_mgr_cancel_appt")}</span>
                          </button>
                        </div>
                      )
                    ) : (
                      <div style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "var(--input-bg, #f8fafc)",
                        border: "1px solid var(--border, #f1f5f9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: statusStyle.color
                      }}>
                        {isCompleted ? <Check size={11} /> : <X size={11} />}
                        <span>{statusLabelText}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <NewAppointmentModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => fetchAppointments(true)}
      />

      <style>{`
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .appt-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06) !important; }
        .cal-day:hover { background: var(--brand-light, #f0f9ff) !important; cursor: pointer; }
        .cal-day.has-appt:hover { background: var(--brand-light, #e0f2fe) !important; }
        .cal-appt-pill { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        #appt-manager-fullscreen-container:fullscreen {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
          padding: 32px 24px !important;
          overflow-y: auto !important;
          width: 100% !important;
          height: 100% !important;
          box-sizing: border-box !important;
        }
        [data-theme="dark"] #appt-manager-fullscreen-container:fullscreen {
          background: var(--bg) !important;
        }
        [data-theme="dark"] .appt-card:hover {
          box-shadow: 0 12px 28px rgba(0,0,0,0.4) !important;
          border-color: var(--brand) !important;
        }
        [data-theme="dark"] select option {
          background: var(--input-bg) !important;
          color: var(--text-main) !important;
        }
        [data-theme="dark"] {
          --status-booked-bg: rgba(245, 158, 11, 0.15);
          --status-booked-text: #fbbf24;
          --status-booked-border: rgba(245, 158, 11, 0.3);

          --status-cancelled-bg: rgba(239, 68, 68, 0.15);
          --status-cancelled-text: #f87171;
          --status-cancelled-border: rgba(239, 68, 68, 0.3);

          --status-completed-bg: rgba(148, 163, 184, 0.15);
          --status-completed-text: #94a3b8;
          --status-completed-border: rgba(148, 163, 184, 0.3);

          --stat-total-bg: rgba(2, 132, 199, 0.15);
          --stat-total-text: #38bdf8;
          --stat-booked-bg: rgba(245, 158, 11, 0.15);
          --stat-booked-text: #fbbf24;
          --stat-done-bg: rgba(148, 163, 184, 0.15);
          --stat-done-text: #94a3b8;
          --stat-cancelled-bg: rgba(239, 68, 68, 0.15);
          --stat-cancelled-text: #f87171;

          --appt-manager-bg: linear-gradient(135deg, #0a0f16 0%, #030712 100%);
        }
      `}</style>
      <Toast />
    </div>
  );
}
