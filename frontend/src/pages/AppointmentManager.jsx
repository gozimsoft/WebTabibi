import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import {
  Calendar, Clock, User, Phone, CheckCircle,
  XCircle, AlertCircle, RefreshCw, Filter, Search,
  Activity, ClipboardList, Plus, X, FileText,
  LayoutList, CalendarDays, ChevronLeft, ChevronRight, MapPin
} from "lucide-react";
import { Btn, Spinner, useToast } from "../components/SharedUI";

// ── New Appointment Modal ────────────────────────────────────────────────────
function NewAppointmentModal({ onClose, onSuccess, show: visible }) {
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
      .catch(() => {})
      .finally(() => setLoadingClinics(false));
  }, [visible]);

  const field = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientname.trim()) return show("اسم المريض مطلوب", "error");
    if (!form.clinics_doctor_id) return show("الرجاء اختيار العيادة", "error");
    setSaving(true);
    try {
      await api.doctor.addAppointment(form);
      show("تم تسجيل الموعد بنجاح ✓", "success");
      onSuccess();
      onClose();
    } catch (err) {
      show(err.message || "حدث خطأ أثناء التسجيل", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  const inp = {
    width: "100%", padding: "10px 14px", borderRadius: 12,
    border: "1.5px solid #e2e8f0", outline: "none", fontSize: 14,
    fontFamily: "inherit", boxSizing: "border-box", color: "#1e293b",
    transition: "border-color 0.2s",
  };
  const lbl = { fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: 32, width: "100%",
        maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        position: "relative", animation: "slideUp 0.25s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#0ea5e9,#0284c7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plus size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#0f172a" }}>موعد جديد</h2>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>تسجيل مريض بدون حساب</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Clinic */}
          <div>
            <label style={lbl}>العيادة / الموقع</label>
            {loadingClinics ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", color: "#64748b", fontSize: 13 }}>
                <Spinner size={16} /> جاري التحميل...
              </div>
            ) : clinics.length === 0 ? (
              <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>لا توجد عيادة مرتبطة بحسابك</p>
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
            <label style={lbl}><FileText size={13} style={{ marginLeft: 4 }} /> سبب الزيارة (اختياري)</label>
            <select
              value={form.doctors_reason_id}
              onChange={e => field("doctors_reason_id", e.target.value)}
              style={inp}
            >
              <option value="">-- بدون تحديد --</option>
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
            <label style={lbl}><User size={13} style={{ marginLeft: 4 }} /> اسم المريض *</label>
            <input
              type="text"
              placeholder="أدخل اسم المريض الكامل"
              value={form.patientname}
              onChange={e => field("patientname", e.target.value)}
              style={inp}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label style={lbl}><Phone size={13} style={{ marginLeft: 4 }} /> رقم الهاتف</label>
            <input
              type="tel"
              placeholder="05XXXXXXXX"
              value={form.phone}
              onChange={e => field("phone", e.target.value)}
              style={inp}
            />
          </div>

          {/* Date & Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}><Calendar size={13} style={{ marginLeft: 4 }} /> التاريخ *</label>
              <input type="date" value={form.date} onChange={e => field("date", e.target.value)} style={inp} required />
            </div>
            <div>
              <label style={lbl}><Clock size={13} style={{ marginLeft: 4 }} /> الوقت *</label>
              <input type="time" value={form.time} onChange={e => field("time", e.target.value)} style={inp} required />
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={lbl}><FileText size={13} style={{ marginLeft: 4 }} /> ملاحظة (اختياري)</label>
            <textarea
              placeholder="سبب الزيارة أو أي ملاحظة..."
              value={form.note}
              onChange={e => field("note", e.target.value)}
              rows={3}
              style={{ ...inp, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#64748b" }}>
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving || loadingClinics || clinics.length === 0}
              style={{
                flex: 2, padding: "12px", borderRadius: 14, border: "none",
                background: saving ? "#94a3b8" : "linear-gradient(135deg,#0ea5e9,#0284c7)",
                color: "#fff", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.2s",
              }}
            >
              {saving ? <><Spinner size={16} /> جاري الحفظ...</> : <><Plus size={16} /> تسجيل الموعد</>}
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
  const DAYS_AR = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

  const timescale  = parseInt(settings?.timescale  || 30);
  const extractTime = (dt, fallback) => {
    const m = (dt || "").match(/(\d{2}:\d{2})/);
    return m ? m[1] : fallback;
  };
  const startTime  = extractTime(settings?.daytimestart, "08:00");
  const endTime    = extractTime(settings?.daytimeend, "18:00");
  const workingStr = settings?.workingdays   || "1111111";

  const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const toStr  = (m) => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;

  const slots = [];
  for (let m = toMins(startTime); m < toMins(endTime); m += timescale) slots.push(toStr(m));

  // Build 7-day array from weekStart (Monday)
  const weekDays = Array.from({length: 7}, (_, i) => {
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

  // Index appointments by "YYYY-MM-DD__HH:MM"
  const bySlot = {};
  appointments.forEach(a => {
    const dt = a.apointementdate || a.date || "";
    const key = `${dt.slice(0,10)}__${dt.slice(11,16)}`;
    if (!bySlot[key]) bySlot[key] = [];
    bySlot[key].push(a);
  });

  const prevWeek = () => { const d = new Date(weekStart+"T00:00:00"); d.setDate(d.getDate()-7); setWeekStart(fmt(d)); };
  const nextWeek = () => { const d = new Date(weekStart+"T00:00:00"); d.setDate(d.getDate()+7); setWeekStart(fmt(d)); };
  const goToday  = () => {
    const d = new Date(); const day = d.getDay();
    d.setDate(d.getDate() - day + (day===0 ? -6 : 1));
    setWeekStart(fmt(d));
  };

  const COL_W = 130; // px per day column
  const ROW_H = 52;  // px per time slot

  return (
    <div style={{background:"#fff", borderRadius:24, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0ea5e9,#0284c7)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12}}>
        <button onClick={prevWeek} style={{background:"rgba(255,255,255,0.2)", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff"}}>
          <ChevronRight size={20} />
        </button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:16, fontWeight:900, color:"#fff"}}>
            {weekDays[0].toLocaleDateString("ar-DZ",{day:"numeric",month:"long"})} — {weekDays[6].toLocaleDateString("ar-DZ",{day:"numeric",month:"long",year:"numeric"})}
          </div>
          <div style={{fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:2}}>
            {timescale} دقيقة/زيارة &nbsp;·&nbsp; {startTime} — {endTime}
          </div>
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <button onClick={goToday} style={{background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8, padding:"5px 12px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer"}}>اليوم</button>
          <button onClick={nextWeek} style={{background:"rgba(255,255,255,0.2)", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff"}}>
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <div style={{overflowX:"auto", overflowY:"auto", maxHeight:"70vh"}}>
        <div style={{minWidth: 80 + COL_W * 7}}>

          {/* Day headers */}
          <div style={{display:"grid", gridTemplateColumns:`80px repeat(7, ${COL_W}px)`, borderBottom:"2px solid #e2e8f0", position:"sticky", top:0, background:"#fff", zIndex:10}}>
            <div style={{padding:"10px 8px", fontSize:11, color:"#94a3b8", fontWeight:600, borderRight:"1px solid #f1f5f9", textAlign:"center"}}>الوقت</div>
            {weekDays.map((d, i) => {
              const ds = fmt(d);
              const isToday = ds === today;
              const jsDay = d.getDay(); // 0=Sun
              const isWorking = workingStr[jsDay] === "1";
              return (
                <div key={i} style={{padding:"10px 6px", textAlign:"center", borderRight:"1px solid #f1f5f9", background: isToday ? "#f0f9ff" : !isWorking ? "#fafafa" : "#fff"}}>
                  <div style={{fontSize:11, fontWeight:700, color: isToday ? "#0284c7" : "#64748b"}}>{DAYS_AR[jsDay]}</div>
                  <div style={{fontSize:18, fontWeight:900, color: isToday ? "#0284c7" : "#334155", marginTop:2}}>{d.getDate()}</div>
                  {isToday && <div style={{width:6, height:6, borderRadius:"50%", background:"#0284c7", margin:"4px auto 0"}}/>}
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          {slots.map((slot, si) => (
            <div key={si} style={{display:"grid", gridTemplateColumns:`80px repeat(7, ${COL_W}px)`, borderBottom:"1px solid #f1f5f9", minHeight: ROW_H}}>
              {/* Time label */}
              <div style={{padding:"4px 8px", fontSize:11, fontWeight:700, color:"#94a3b8", borderRight:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", background:"#fafafa"}}>
                {slot}
              </div>
              {weekDays.map((d, di) => {
                const ds = fmt(d);
                const key = `${ds}__${slot}`;
                const appts = bySlot[key] || [];
                const jsDay = d.getDay();
                const isWorking = workingStr[jsDay] === "1";
                const isToday = ds === today;
                return (
                  <div key={di} style={{borderRight:"1px solid #f1f5f9", padding:"3px 4px", minHeight: ROW_H, background: isToday ? "#f8fbff" : !isWorking ? "#fafafa" : "#fff", position:"relative"}}>
                    {appts.map((appt, ai) => {
                      const sc = STATUS_COLORS[appt.status] || STATUS_COLORS[0];
                      return (
                        <div key={ai} title={`${appt.patientname || "مريض"}\n${STATUS_LABELS[appt.status]}`}
                          style={{background: sc.bg, border:`1px solid ${sc.border}`, borderRadius:8, padding:"3px 6px", marginBottom:2, cursor:"default"}}>
                          <div style={{fontSize:10, fontWeight:800, color: sc.color, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis"}}>{appt.patientname || "مريض"}</div>
                          {appt.reason_name && <div style={{fontSize:9, color:"#64748b", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis"}}>{appt.reason_name}</div>}
                          {appt.status === 0 && (
                            <div style={{display:"flex", gap:3, marginTop:3}}>
                              <button onClick={() => onUpdateStatus(appt.id, 2)} style={{flex:1, padding:"2px 3px", borderRadius:5, border:"none", background:"#d1fae5", color:"#065f46", fontWeight:700, fontSize:9, cursor:"pointer"}}>✓</button>
                              <button onClick={() => onUpdateStatus(appt.id, 1)} style={{flex:1, padding:"2px 3px", borderRadius:5, border:"none", background:"#fee2e2", color:"#991b1b", fontWeight:700, fontSize:9, cursor:"pointer"}}>✕</button>
                            </div>
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
      <div style={{padding:"12px 20px", borderTop:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10}}>
        <div style={{display:"flex", gap:12}}>
          {Object.entries(STATUS_LABELS).map(([k, label]) => {
            const sc = STATUS_COLORS[k] || {};
            return (
              <div key={k} style={{display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#64748b"}}>
                <div style={{width:10, height:10, borderRadius:3, background: sc.bg, border:`1px solid ${sc.border}`}}/>
                {label}
              </div>
            );
          })}
        </div>
        <button onClick={onAddNew} style={{display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer"}}>
          <Plus size={13}/> موعد جديد
        </button>
      </div>
    </div>
  );
}


// ── Main Component ───────────────────────────────────────────────────────────
export default function AppointmentManager({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const { show, Toast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quickFilter, setQuickFilter] = useState(""); // today | week | month | 3months
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // list | calendar
  const [calWeek, setCalWeek] = useState(() => {
    const d = new Date();
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // start from Monday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  });
  const [scheduleSettings, setScheduleSettings] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState("all");

  const applyQuickFilter = (key) => {
    const today = new Date();
    const fmt = (d) => d.toISOString().slice(0, 10);
    setQuickFilter(key);
    if (key === "today") {
      setDateFrom(fmt(today)); setDateTo(fmt(today));
    } else if (key === "week") {
      const end = new Date(today); end.setDate(today.getDate() + 7);
      setDateFrom(fmt(today)); setDateTo(fmt(end));
    } else if (key === "month") {
      const end = new Date(today); end.setMonth(today.getMonth() + 1);
      setDateFrom(fmt(today)); setDateTo(fmt(end));
    } else if (key === "3months") {
      const end = new Date(today); end.setMonth(today.getMonth() + 3);
      setDateFrom(fmt(today)); setDateTo(fmt(end));
    } else {
      setDateFrom(""); setDateTo("");
    }
  };

  const fetchAppointments = async (isRefresh = false, clinicId = selectedClinicId) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      let data = [];
      if (user?.user_type === 1) {
        const params = clinicId !== "all" ? { clinic_id: clinicId } : {};
        const res = await api.doctor.getForManager(params);
        data = res.appointments || [];
        if (res.settings) setScheduleSettings(res.settings);
      } else {
        show("واجهة العيادة قيد التطوير", "error");
      }
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      show(err.message || t("error_occurred"), "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    api.doctor.getProfile()
      .then(res => {
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
  }, []);

  useEffect(() => {
    if (selectedClinicId) {
      fetchAppointments(false, selectedClinicId);
    }
  }, [selectedClinicId]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.doctor.updateAppointmentStatus(id, status);
      show("تم تحديث الحالة بنجاح", "success");
      fetchAppointments(true);
    } catch (err) {
      show(err.message || "حدث خطأ", "error");
    }
  };

  const STATUS_LABELS = { 0: "محجوز", 1: "ملغي", 2: "مكتمل" };
  const STATUS_COLORS = {
    0: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },   // أصفر — بانتظار الزيارة
    1: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },   // أحمر — ملغي
    2: { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },   // أخضر — مكتمل
  };

  const now = new Date();
  const clinicFilter = (a) => selectedClinicId === "all" || String(a.clinic_id) === String(selectedClinicId);
  const filtered = appointments.filter(a => {
    const matchesFilter = filter === "all" ||
      (filter === "booked"   && Number(a.status) === 0) ||
      (filter === "done"     && Number(a.status) === 2) ||
      (filter === "cancelled"&& Number(a.status) === 1);
    const matchesSearch = !search ||
      (a.patientname || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.phone || "").includes(search);
    const apptDate = (a.apointementdate || a.date || "").slice(0, 10);
    const matchesFrom = !dateFrom || apptDate >= dateFrom;
    const matchesTo   = !dateTo   || apptDate <= dateTo;
    return matchesFilter && matchesSearch && matchesFrom && matchesTo && clinicFilter(a);
  });

  const stats = {
    total:     appointments.filter(clinicFilter).length,
    booked:    appointments.filter(a => clinicFilter(a) && Number(a.status) === 0).length,
    done:      appointments.filter(a => clinicFilter(a) && Number(a.status) === 2).length,
    cancelled: appointments.filter(a => clinicFilter(a) && Number(a.status) === 1).length,
  };

  const glassPanel = {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.5)",
    boxShadow: "0 8px 32px rgba(12,74,110,0.05)",
    borderRadius: 24,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)", padding: "32px 24px", paddingBottom: 100 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ ...glassPanel, padding: "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#0c4a6e", display: "flex", alignItems: "center", gap: 12 }}>
              <Calendar size={32} color="#0284c7" /> إدارة المواعيد
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#475569", fontSize: 15 }}>
              مرحباً د. {user?.profile?.fullname || user?.username}، تابع مواعيدك ومرضاك من هنا.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {/* View toggle */}
            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 12, padding: 4, gap: 2 }}>
              {[{ key: "list", Icon: LayoutList, label: "قائمة" }, { key: "calendar", Icon: CalendarDays, label: "تقويم" }].map(({ key, Icon, label }) => (
                <button key={key} onClick={() => setViewMode(key)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                  borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                  background: viewMode === key ? "#fff" : "transparent",
                  color: viewMode === key ? "#0284c7" : "#64748b",
                  boxShadow: viewMode === key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.18s",
                }}><Icon size={16} />{label}</button>
              ))}
            </div>

            <button onClick={() => setShowModal(true)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 20px", borderRadius: 14, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
              color: "#fff", fontWeight: 800, fontSize: 14,
              boxShadow: "0 4px 16px rgba(2,132,199,0.3)", transition: "transform 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            ><Plus size={18} /> موعد جديد</button>

            <Btn onClick={() => fetchAppointments(true)} disabled={refreshing || loading}
              style={{ borderRadius: 14, padding: "11px 18px", background: "#fff", color: "#0284c7", border: "1px solid #bae6fd" }}
            ><RefreshCw size={18} className={refreshing ? "spin-anim" : ""} /> تحديث</Btn>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, marginBottom: 24 }}>
          {[
            { title: "إجمالي المواعيد",  count: stats.total,     icon: <Activity size={24} />,      color: "#0284c7", bg: "linear-gradient(135deg,#e0f2fe,#bae6fd)" },
            { title: "محجوزة (قيد الانتظار)", count: stats.booked, icon: <Clock size={24} />,         color: "#92400e", bg: "linear-gradient(135deg,#fef9c3,#fde68a)" },
            { title: "مكتملة",            count: stats.done,      icon: <CheckCircle size={24} />,  color: "#059669", bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)" },
            { title: "ملغاة",             count: stats.cancelled, icon: <XCircle size={24} />,      color: "#991b1b", bg: "linear-gradient(135deg,#fee2e2,#fca5a5)" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 24, display: "flex", alignItems: "center", gap: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.02)" }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b", marginTop: 8 }}>{s.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ ...glassPanel, padding: "20px 24px", marginBottom: 24 }}>

          {/* Row 1 — Quick filter buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {[
              { key: "",        label: "الكل" },
              { key: "today",   label: "اليوم" },
              { key: "week",    label: "الأسبوع القادم" },
              { key: "month",   label: "الشهر القادم" },
              { key: "3months", label: "3 أشهر القادمة" },
            ].map(({ key, label }) => {
              const active = quickFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => applyQuickFilter(key)}
                  style={{
                    padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                    border: active ? "none" : "1.5px solid #e2e8f0",
                    background: active ? "linear-gradient(135deg,#0ea5e9,#0284c7)" : "#fff",
                    color: active ? "#fff" : "#475569",
                    cursor: "pointer",
                    boxShadow: active ? "0 4px 12px rgba(2,132,199,0.25)" : "none",
                    transition: "all 0.18s",
                  }}
                >{label}</button>
              );
            })}
          </div>

          {/* Row 2 — Search + Status + Date range */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {/* Clinic Filter */}
            {clinics.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: selectedClinicId !== "all" ? "#f0f9ff" : "#f8fafc", padding: "9px 14px", borderRadius: 14, border: selectedClinicId !== "all" ? "1px solid #bae6fd" : "1px solid #e2e8f0" }}>
                <MapPin size={16} color={selectedClinicId !== "all" ? "#0284c7" : "#94a3b8"} />
                <select
                  value={selectedClinicId}
                  onChange={e => setSelectedClinicId(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", color: "#334155", fontWeight: 700, cursor: "pointer" }}
                >
                  <option value="all">كل العيادات</option>
                  {clinics.map(c => (
                    <option key={c.id} value={c.clinic_id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", padding: "9px 14px", borderRadius: 14, border: "1px solid #e2e8f0", flex: "1 1 240px" }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="ابحث باسم المريض أو رقم الهاتف..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ border: "none", outline: "none", width: "100%", fontSize: 13, background: "transparent", color: "#334155" }}
              />
              {search && <XCircle size={15} color="#94a3b8" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => setSearch("")} />}
            </div>

            {/* Status filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", padding: "9px 14px", borderRadius: 14, border: "1px solid #e2e8f0" }}>
              <Filter size={16} color="#94a3b8" />
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", color: "#334155", fontWeight: 700, cursor: "pointer" }}
              >
                <option value="all">كل الحالات</option>
                <option value="booked">محجوزة (قيد الانتظار)</option>
                <option value="done">مكتملة</option>
                <option value="cancelled">ملغاة</option>
              </select>
            </div>

            {/* Date range */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", padding: "9px 14px", borderRadius: 14, border: "1px solid #e2e8f0", flexWrap: "wrap" }}>
              <Calendar size={16} color="#94a3b8" />
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>من</span>
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setQuickFilter(""); }}
                style={{ border: "none", outline: "none", fontSize: 13, color: "#334155", background: "transparent", cursor: "pointer" }}
              />
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>إلى</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={e => { setDateTo(e.target.value); setQuickFilter(""); }}
                style={{ border: "none", outline: "none", fontSize: 13, color: "#334155", background: "transparent", cursor: "pointer" }}
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); setQuickFilter(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
                  title="مسح الفلتر"
                >
                  <XCircle size={15} color="#ef4444" />
                </button>
              )}
            </div>
          </div>

          {/* Active filters summary */}
          {(dateFrom || dateTo || search || filter !== "all" || selectedClinicId !== "all") && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>النتائج:</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#0284c7", background: "#e0f2fe", padding: "3px 10px", borderRadius: 20 }}>
                {filtered.length} موعد
              </span>
              {selectedClinicId !== "all" && (
                <span style={{ fontSize: 12, color: "#0284c7", background: "#e0f2fe", padding: "3px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={11} />
                  {clinics.find(c => String(c.clinic_id) === String(selectedClinicId))?.name || "عيادة"}
                </span>
              )}
              {(dateFrom || dateTo) && (
                <span style={{ fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "3px 10px", borderRadius: 20 }}>
                  {dateFrom && dateTo ? `${dateFrom} ← ${dateTo}` : dateFrom ? `من ${dateFrom}` : `حتى ${dateTo}`}
                </span>
              )}
            </div>
          )}
        </div>

        {loading && !refreshing ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><Spinner size={40} /></div>
        ) : viewMode === "calendar" ? (
          <WeeklyScheduleView
            appointments={filtered}
            settings={scheduleSettings}
            weekStart={calWeek}
            setWeekStart={setCalWeek}
            STATUS_LABELS={STATUS_LABELS}
            STATUS_COLORS={STATUS_COLORS}
            onUpdateStatus={handleUpdateStatus}
            onAddNew={() => setShowModal(true)}
          />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <Calendar size={64} color="#cbd5e1" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#334155", margin: "0 0 8px 0" }}>لا توجد مواعيد</h3>
            <p style={{ color: "#64748b", margin: "0 0 20px 0" }}>لم يتم العثور على أي مواعيد تطابق بحثك.</p>
            <button onClick={() => setShowModal(true)} style={{ padding: "12px 24px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Plus size={16} /> سجّل أول موعد
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 }}>
            {filtered.map(appt => {
              const d = new Date(appt.apointementdate || appt.date);
              const isPast = Number(appt.status) !== 0; // completed(2) or cancelled(1)
              const statusStyle = STATUS_COLORS[appt.status] || STATUS_COLORS[0];
              return (
                <div key={appt.id} className="appt-card" style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.04)", transition: "transform 0.2s,box-shadow 0.2s", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: isPast ? "#cbd5e1" : "linear-gradient(90deg,#0ea5e9,#0284c7)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: isPast ? "#f1f5f9" : "#e0f2fe", color: isPast ? "#64748b" : "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={20} /></div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{appt.patientname || "مريض غير معروف"}</div>
                        {appt.phone && <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><Phone size={11} /> {appt.phone}</div>}
                      </div>
                    </div>
                    <span style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 800 }}>{STATUS_LABELS[appt.status] ?? "—"}</span>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 14, border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                      <Calendar size={14} color="#0284c7" />
                      {d.toLocaleDateString(i18n.language === "ar" ? "ar-DZ" : i18n.language, { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 13, fontWeight: 700 }}>
                      <Clock size={14} color="#0284c7" />
                      {d.toLocaleTimeString(i18n.language === "ar" ? "ar-DZ" : i18n.language, { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {appt.reason_name && <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #e2e8f0", fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}><FileText size={12} /> {appt.reason_name}</div>}
                    {appt.note && <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", display: "flex", alignItems: "flex-start", gap: 6 }}><AlertCircle size={12} style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ lineHeight: 1.4 }}>{appt.note}</span></div>}
                  </div>
                  {appt.status === 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => handleUpdateStatus(appt.id, 2)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: "#d1fae5", color: "#065f46", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>✓ إتمام الزيارة</button>
                      <button onClick={() => handleUpdateStatus(appt.id, 1)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: "#fee2e2", color: "#991b1b", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>✕ إلغاء</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
        .appt-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.07) !important; }
        .cal-day:hover { background: #f0f9ff !important; cursor: pointer; }
        .cal-day.has-appt:hover { background: #e0f2fe !important; }
        .cal-appt-pill { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>
      <Toast />
    </div>
  );
}
