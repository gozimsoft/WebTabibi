// src/components/DoctorLeavesManager.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar, Clock, AlertTriangle, CheckCircle2,
  Trash2, Plus, X, Phone, User, CalendarDays,
  ShieldAlert, RefreshCw, ChevronRight, AlertCircle,
  HelpCircle, Eye, EyeOff
} from "lucide-react";
import { Btn, Card, Spinner, Input, Badge } from "./SharedUI";

export default function DoctorLeavesManager({
  api,
  selectedClinicId,
  clinics = [],
  showToast,
  isMobile,
  isRtl,
  onLeavesUpdated
}) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const todayStr = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    leave_type: "partial_hours", // 'partial_hours' | 'full_day' | 'shift'
    clinic_id: selectedClinicId || "all",
    date: todayStr,
    start_date: todayStr,
    end_date: todayStr,
    start_time: "10:00",
    end_time: "12:00",
    shift_type: "morning",
    reason: "",
    show_reason_to_patient: true,
  });

  // Conflict Modal State
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    conflicts: null,
    pendingPayload: null,
    selectedAction: "cancel", // 'cancel' | 'reschedule' | 'manual'
    processing: false
  });

  // Call List Modal for Secretary Manual Coordination
  const [callListModal, setCallListModal] = useState({
    isOpen: false,
    appointments: [],
    calledIds: new Set()
  });

  useEffect(() => {
    loadLeaves();
  }, [selectedClinicId]);

  const docApi = api?.doctor || api?.doctors || api;

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const params = { _t: Date.now() };
      if (selectedClinicId && selectedClinicId !== "all") {
        params.clinic_id = selectedClinicId;
      }
      const fetchFn = docApi?.getUnavailabilities;
      if (!fetchFn) {
        console.warn("getUnavailabilities API method not available");
        setLeaves([]);
        return;
      }
      const res = await fetchFn(params);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setLeaves(list);
      if (onLeavesUpdated) onLeavesUpdated(list);
    } catch (err) {
      if (showToast) showToast(err.message || "فشل تحميل قائمة الإجازات والطلعات", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const buildPayload = () => {
    let start_datetime = "";
    let end_datetime = "";

    if (form.leave_type === "partial_hours") {
      start_datetime = `${form.date} ${form.start_time}:00`;
      end_datetime = `${form.date} ${form.end_time}:00`;
    } else if (form.leave_type === "full_day") {
      start_datetime = `${form.start_date} 00:00:00`;
      end_datetime = `${form.end_date} 23:59:59`;
    } else if (form.leave_type === "shift") {
      start_datetime = `${form.date} 00:00:00`;
      end_datetime = `${form.date} 23:59:59`;
    }

    return {
      leave_type: form.leave_type,
      clinic_id: form.clinic_id === "all" ? null : form.clinic_id,
      start_datetime,
      end_datetime,
      shift_type: form.leave_type === "shift" ? form.shift_type : null,
      reason: form.reason.trim(),
      show_reason_to_patient: form.show_reason_to_patient ? 1 : 0
    };
  };

  const handleCheckAndSubmit = async (e) => {
    e.preventDefault();

    if (form.leave_type === "partial_hours") {
      if (form.start_time >= form.end_time) {
        return showToast ? showToast("وقت نهاية الطلعة يجب أن يكون بعد وقت البداية", "error") : alert("وقت غير صالح");
      }
    } else if (form.leave_type === "full_day") {
      if (form.start_date > form.end_date) {
        return showToast ? showToast("تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية", "error") : alert("تاريخ غير صالح");
      }
    }

    const payload = buildPayload();
    setSubmitting(true);

    try {
      // Step 1: Pre-check for conflicting appointments
      const checkFn = docApi?.checkUnavailabilityConflicts;
      const conflictCheck = checkFn ? await checkFn({
        clinic_id: payload.clinic_id,
        start_datetime: payload.start_datetime,
        end_datetime: payload.end_datetime,
        leave_type: payload.leave_type,
        shift_type: payload.shift_type
      }) : { has_conflicts: false, count: 0 };

      const conflictData = conflictCheck?.data || conflictCheck;

      if (conflictData?.has_conflicts && conflictData?.count > 0) {
        // Open conflict resolution modal
        setConflictModal({
          isOpen: true,
          conflicts: conflictData,
          pendingPayload: payload,
          selectedAction: "cancel",
          processing: false
        });
      } else {
        // No conflicts: directly save
        const addFn = docApi?.addUnavailability;
        let saveRes = null;
        if (addFn) {
          saveRes = await addFn({
            ...payload,
            resolution_action: "none"
          });
        }
        const createdItem = {
          id: saveRes?.id || (saveRes?.data?.id) || ('temp_' + Date.now()),
          doctor_id: '',
          clinic_id: payload.clinic_id,
          clinicsdoctor_id: null,
          leave_type: payload.leave_type,
          start_datetime: payload.start_datetime,
          end_datetime: payload.end_datetime,
          shift_type: payload.shift_type,
          reason: payload.reason,
          show_reason_to_patient: payload.show_reason_to_patient ? 1 : 0,
          is_past: false,
          clinicname: clinics.find(c => (c.clinic_id || c.id) === payload.clinic_id)?.name || clinics.find(c => (c.clinic_id || c.id) === payload.clinic_id)?.clinicname || null
        };
        setLeaves(prev => [createdItem, ...prev.filter(x => x.id !== createdItem.id)]);
        if (showToast) showToast(isRtl ? "تم تسجيل الغياب وإيقاف الحجوزات بنجاح" : "Absence enregistrée avec succès", "success");
        setShowAddForm(false);
        await loadLeaves();
      }
    } catch (err) {
      if (showToast) showToast(err.message || "حدث خطأ أثناء فحص وتأكيد الغياب", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteResolution = async () => {
    const { pendingPayload, selectedAction, conflicts } = conflictModal;
    if (!pendingPayload) return;

    setConflictModal(prev => ({ ...prev, processing: true }));
    try {
      const addFn = docApi?.addUnavailability;
      let saveRes = null;
      if (addFn) {
        saveRes = await addFn({
          ...pendingPayload,
          resolution_action: selectedAction
        });
      }
      const createdItem = {
        id: saveRes?.id || (saveRes?.data?.id) || ('temp_' + Date.now()),
        doctor_id: '',
        clinic_id: pendingPayload.clinic_id,
        clinicsdoctor_id: null,
        leave_type: pendingPayload.leave_type,
        start_datetime: pendingPayload.start_datetime,
        end_datetime: pendingPayload.end_datetime,
        shift_type: pendingPayload.shift_type,
        reason: pendingPayload.reason,
        show_reason_to_patient: pendingPayload.show_reason_to_patient ? 1 : 0,
        is_past: false,
        clinicname: clinics.find(c => (c.clinic_id || c.id) === pendingPayload.clinic_id)?.name || clinics.find(c => (c.clinic_id || c.id) === pendingPayload.clinic_id)?.clinicname || null
      };
      setLeaves(prev => [createdItem, ...prev.filter(x => x.id !== createdItem.id)]);

      if (selectedAction === "cancel") {
        if (showToast) showToast(isRtl ? `تم إلغاء ${conflicts?.count || 0} موعد وإرسال إشعارات اعتذار للمرضى بنجاح` : "Rendez-vous annulés et patients notifiés", "success");
        setConflictModal({ isOpen: false, conflicts: null, pendingPayload: null, selectedAction: "cancel", processing: false });
      } else if (selectedAction === "reschedule") {
        if (showToast) showToast(isRtl ? `تم ترحيل المواعيد إلى اليوم التالي وإشعار المرضى بنجاح` : "Rendez-vous reportés avec succès", "success");
        setConflictModal({ isOpen: false, conflicts: null, pendingPayload: null, selectedAction: "cancel", processing: false });
      } else if (selectedAction === "manual") {
        // Open Call List for secretary
        const appts = conflicts?.appointments || [];
        setConflictModal({ isOpen: false, conflicts: null, pendingPayload: null, selectedAction: "cancel", processing: false });
        setCallListModal({ isOpen: true, appointments: appts, calledIds: new Set() });
      }

      setShowAddForm(false);
      await loadLeaves();
    } catch (err) {
      if (showToast) showToast(err.message || "فشل تنفيذ معالجة التعارض", "error");
      setConflictModal(prev => ({ ...prev, processing: false }));
    }
  };

  const handleDeleteLeave = async (id) => {
    if (!window.confirm(isRtl ? "هل أنت متأكد من رغبتك في حذف هذا الغياب وإعادة فتح المواعيد؟" : "Supprimer ce congé et rouvrir les créneaux ?")) {
      return;
    }
    try {
      const delFn = docApi?.deleteUnavailability;
      if (delFn) {
        await delFn(id);
      }
      if (showToast) showToast(isRtl ? "تم حذف الغياب وإعادة إتاحة الأوقات للحجز" : "Congé supprimé avec succès", "success");
      loadLeaves();
    } catch (err) {
      if (showToast) showToast(err.message || "فشل حذف سجل الغياب", "error");
    }
  };

  const toggleCalled = (id) => {
    setCallListModal(prev => {
      const next = new Set(prev.calledIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, calledIds: next };
    });
  };

  const parseDateSafe = (dStr) => {
    if (!dStr) return new Date();
    return new Date(String(dStr).replace(" ", "T"));
  };

  const getLeaveTypeBadge = (type) => {
    switch (type) {
      case "partial_hours":
        return <Badge style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: 800 }}>⏱️ {isRtl ? "طلعة لساعات محددة" : "Heures spécifiques"}</Badge>;
      case "full_day":
        return <Badge style={{ background: "#fef3c7", color: "#92400e", fontWeight: 800 }}>📅 {isRtl ? "عطلة يوم/أيام كاملة" : "Journée(s) entière(s)"}</Badge>;
      case "shift":
        return <Badge style={{ background: "#f3e8ff", color: "#6b21a8", fontWeight: 800 }}>🌓 {isRtl ? "إلغاء فترة دوام" : "Pause de shift"}</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner & Action */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 14,
        background: "var(--card-bg)",
        padding: isMobile ? 16 : 22,
        borderRadius: 16,
        border: "1.5px solid var(--border)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <CalendarDays size={22} color="var(--brand)" />
            <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
              {isRtl ? "إدارة الإجازات والطلعات الطارئة" : "Congés et Absences Exceptionnelles"}
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            {isRtl
              ? "سجل العطل والمناسبات أو الطلعات المؤقتة خلال الدوام لحجب الحجز آلياً ومعالجة مواعيد المرضى المسجلين مسبقاً."
              : "Bloquez la prise de rendez-vous pour vos congés ou sorties exceptionnelles avec gestion automatique des RDV existants."}
          </p>
        </div>

        <Btn
          type="button"
          onClick={() => setShowAddForm(prev => !prev)}
          style={{
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 800,
            borderRadius: 10,
            background: showAddForm ? "var(--bg)" : "linear-gradient(135deg, var(--brand), #0284c7)",
            color: showAddForm ? "var(--heading-color)" : "#fff",
            border: showAddForm ? "1.5px solid var(--border)" : "none"
          }}
        >
          {showAddForm ? <X size={16} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} /> : <Plus size={16} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />}
          {showAddForm ? (isRtl ? "إلغاء الإضافة" : "Fermer") : (isRtl ? "تسجيل غياب أو طلعة جديدة" : "Nouveau congé / sortie")}
        </Btn>
      </div>

      {/* Add Leave Form Drawer / Card */}
      {showAddForm && (
        <Card style={{ padding: isMobile ? 18 : 26, borderRadius: 18, border: "2px solid var(--brand)", background: "var(--card-bg)" }}>
          <form onSubmit={handleCheckAndSubmit}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--brand)" }}>
              <Clock size={20} />
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "var(--heading-color)" }}>
                {isRtl ? "تحديد تفاصيل الغياب أو الطلعة" : "Détails de l'absence"}
              </h4>
            </div>

            {/* Type Selection */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "var(--heading-color)", marginBottom: 8 }}>
                {isRtl ? "نوع عدم التوفر:" : "Type d'indisponibilité :"}
              </label>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { id: "partial_hours", labelAr: "⏱️ طلعة لساعات محددة", labelFr: "Sortie (Heures précises)", descAr: "مثل: خروج طارئ من 10:00 إلى 12:30" },
                  { id: "full_day", labelAr: "📅 عطلة يوم / أيام كاملة", labelFr: "Journée(s) entière(s)", descAr: "مثل: مناسبة أو عطلة أسبوعية/سنوية" },
                  { id: "shift", labelAr: "🌓 إلغاء فترة دوام", labelFr: "Annulation de shift", descAr: "مثل: إلغاء الفترة الصباحية أو المسائية" },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleField("leave_type", item.id)}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: form.leave_type === item.id ? "2px solid var(--brand)" : "1.5px solid var(--border)",
                      background: form.leave_type === item.id ? "rgba(8, 145, 178, 0.08)" : "var(--bg)",
                      textAlign: isRtl ? "right" : "left",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--heading-color)", marginBottom: 4 }}>
                      {isRtl ? item.labelAr : item.labelFr}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      {item.descAr}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Clinic & Scope */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "نطاق المقر والعيادة:" : "Clinique concernée :"}
                </label>
                <select
                  value={form.clinic_id}
                  onChange={e => handleField("clinic_id", e.target.value)}
                  style={{
                    width: "100%",
                    height: 42,
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1.5px solid var(--border)",
                    background: "var(--bg)",
                    color: "var(--heading-color)",
                    fontSize: 13
                  }}
                >
                  <option value="all">{isRtl ? "🌐 كافة مقرات العمل وعياداتي" : "Toutes mes cliniques"}</option>
                  {clinics.map(c => (
                    <option key={c.clinic_id || c.id} value={c.clinic_id || c.id}>
                      {c.name || c.clinicname}
                    </option>
                  ))}
                </select>
              </div>

              {form.leave_type === "shift" && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                    {isRtl ? "فترة الدوام المطلوب إلغاؤها:" : "Shift concerné :"}
                  </label>
                  <select
                    value={form.shift_type}
                    onChange={e => handleField("shift_type", e.target.value)}
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--heading-color)",
                      fontSize: 13
                    }}
                  >
                    <option value="morning">{isRtl ? "الفترة الصباحية" : "Matin"}</option>
                    <option value="evening">{isRtl ? "الفترة المسائية" : "Soir"}</option>
                    <option value="full_day">{isRtl ? "كامل دوام اليوم" : "Toute la journée"}</option>
                  </select>
                </div>
              )}
            </div>

            {/* Date & Time fields according to type */}
            {form.leave_type === "partial_hours" && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                    {isRtl ? "تاريخ اليوم:" : "Date :"}
                  </label>
                  <Input
                    type="date"
                    value={form.date}
                    min={todayStr}
                    onChange={e => handleField("date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                    {isRtl ? "من الساعة:" : "De :"}
                  </label>
                  <Input
                    type="time"
                    value={form.start_time}
                    onChange={e => handleField("start_time", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                    {isRtl ? "إلى الساعة:" : "À :"}
                  </label>
                  <Input
                    type="time"
                    value={form.end_time}
                    onChange={e => handleField("end_time", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {form.leave_type === "full_day" && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                    {isRtl ? "من تاريخ (بداية العطلة):" : "Date de début :"}
                  </label>
                  <Input
                    type="date"
                    value={form.start_date}
                    min={todayStr}
                    onChange={e => {
                      handleField("start_date", e.target.value);
                      if (e.target.value > form.end_date) handleField("end_date", e.target.value);
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                    {isRtl ? "إلى غاية تاريخ (نهاية العطلة):" : "Date de fin :"}
                  </label>
                  <Input
                    type="date"
                    value={form.end_date}
                    min={form.start_date || todayStr}
                    onChange={e => handleField("end_date", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {form.leave_type === "shift" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "تاريخ اليوم المعني بالإلغاء:" : "Date concernée :"}
                </label>
                <Input
                  type="date"
                  value={form.date}
                  min={todayStr}
                  onChange={e => handleField("date", e.target.value)}
                  required
                />
              </div>
            )}

            {/* Reason & Visibility */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                {isRtl ? "سبب الغياب أو المناسبة (اختياري):" : "Motif de l'absence (optionnel) :"}
              </label>
              <Input
                type="text"
                placeholder={isRtl ? "مثال: ظرف طارئ، مؤتمر طبي، مناسبة عائلية، عطلة سنوية..." : "Ex: Urgence, formation, congé annuel..."}
                value={form.reason}
                onChange={e => handleField("reason", e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <input
                type="checkbox"
                id="show_reason"
                checked={form.show_reason_to_patient}
                onChange={e => handleField("show_reason_to_patient", e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--brand)" }}
              />
              <label htmlFor="show_reason" style={{ fontSize: 13, fontWeight: 700, color: "var(--heading-color)", cursor: "pointer" }}>
                {isRtl ? "إظهار سبب الغياب للمرضى في شاشة الحجز بالمنصة" : "Afficher ce motif aux patients lors de la réservation"}
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn type="button" onClick={() => setShowAddForm(false)} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--heading-color)" }}>
                {isRtl ? "إلغاء" : "Annuler"}
              </Btn>
              <Btn type="submit" loading={submitting} style={{ background: "linear-gradient(135deg, var(--brand), #0284c7)", color: "#fff", fontWeight: 800 }}>
                <CheckCircle2 size={16} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                {isRtl ? "فحص وحفظ الغياب" : "Vérifier et enregistrer"}
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Active & Upcoming Leaves Table */}
      <Card style={{ padding: isMobile ? 16 : 24, borderRadius: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "var(--heading-color)", display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={18} color="var(--brand)" />
            {isRtl ? "قائمة الإجازات والطلعات المسجلة:" : "Historique des absences et congés :"}
          </h4>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700 }}>
            {leaves.length} {isRtl ? "سجل" : "enregistrement(s)"}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}><Spinner size={32} /></div>
        ) : leaves.length === 0 ? (
          <div style={{
            padding: 36,
            textAlign: "center",
            background: "var(--bg)",
            borderRadius: 14,
            border: "1.5px dashed var(--border)"
          }}>
            <CalendarDays size={36} color="var(--text-secondary)" style={{ marginBottom: 10, opacity: 0.5 }} />
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--heading-color)", marginBottom: 4 }}>
              {isRtl ? "لا توجد إجازات أو طلعات مسجلة حالياً" : "Aucun congé ou absence enregistré"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {isRtl ? "أوقات العمل متاحة للمرضى كالمعتاد وفق جدول الدوام الرسمي." : "Les réservations sont ouvertes selon vos horaires normaux."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {leaves.map(item => {
              const startFmt = parseDateSafe(item.start_datetime).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
                hour: item.leave_type === "partial_hours" ? "2-digit" : undefined,
                minute: item.leave_type === "partial_hours" ? "2-digit" : undefined,
              });
              const endFmt = parseDateSafe(item.end_datetime).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
                hour: item.leave_type === "partial_hours" ? "2-digit" : undefined,
                minute: item.leave_type === "partial_hours" ? "2-digit" : undefined,
              });

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 14,
                    background: item.is_past ? "var(--bg)" : "var(--card-bg)",
                    border: "1.5px solid var(--border)",
                    borderRadius: 12,
                    opacity: item.is_past ? 0.65 : 1,
                    flexWrap: "wrap",
                    gap: 12
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: item.is_past ? "var(--border)" : "rgba(8, 145, 178, 0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.is_past ? "var(--text-secondary)" : "var(--brand)"
                    }}>
                      <Clock size={20} />
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        {getLeaveTypeBadge(item.leave_type)}
                        {item.clinicname ? (
                          <Badge style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                            🏢 {item.clinicname}
                          </Badge>
                        ) : (
                          <Badge style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                            🌐 {isRtl ? "كافة المقرات" : "Toutes les cliniques"}
                          </Badge>
                        )}
                        {item.is_past && (
                          <Badge style={{ background: "#f3f4f6", color: "#6b7280" }}>
                            {isRtl ? "منتهية" : "Passée"}
                          </Badge>
                        )}
                      </div>

                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--heading-color)", marginBottom: 2 }}>
                        {startFmt} {item.start_datetime !== item.end_datetime && `⟵ ${endFmt}`}
                      </div>

                      {item.reason && (
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>💬 {item.reason}</span>
                          {item.show_reason_to_patient ? (
                            <span title={isRtl ? "ظاهر للمرضى" : "Visible aux patients"} style={{ color: "#059669" }}><Eye size={12} /></span>
                          ) : (
                            <span title={isRtl ? "مخفي عن المرضى" : "Masqué aux patients"} style={{ color: "#9ca3af" }}><EyeOff size={12} /></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteLeave(item.id)}
                    title={isRtl ? "حذف الغياب وإعادة إتاحة الأوقات" : "Supprimer"}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: 8,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    <Trash2 size={16} />
                    {!isMobile && (isRtl ? "حذف" : "Supprimer")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ──────────────────────────────────────────────────────────
          CONFLICT RESOLUTION MODAL (نافذة معالجة التعارض التفاعلية)
          ────────────────────────────────────────────────────────── */}
      {conflictModal.isOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: "var(--card-bg)",
            borderRadius: 20,
            maxWidth: 620,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: isMobile ? 20 : 28,
            border: "2px solid #f59e0b",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "var(--heading-color)" }}>
                  {isRtl ? "تنبيه تعارض مواعيد محجوزة مسبقاً!" : "Conflit avec des rendez-vous existants !"}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: "#d97706", fontWeight: 700 }}>
                  {isRtl
                    ? `يوجد ${conflictModal.conflicts?.count || 0} مريض لديهم مواعيد مؤكدة في هذه الفترة.`
                    : `${conflictModal.conflicts?.count || 0} rendez-vous confirmés sont impactés.`}
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
              {isRtl
                ? "حدد الإجراء الذي تفضل تطبيقه لمعالجة مواعيد هؤلاء المرضى فور تسجيل الغياب:"
                : "Choisissez l'action à exécuter pour les rendez-vous impactés :"}
            </p>

            {/* List of Affected Patients Preview */}
            <div style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 12,
              maxHeight: 140,
              overflowY: "auto",
              marginBottom: 20,
              fontSize: 12
            }}>
              <div style={{ fontWeight: 800, color: "var(--heading-color)", marginBottom: 6 }}>
                {isRtl ? "قائمة المرضى المتأثرين:" : "Patients concernés :"}
              </div>
              {conflictModal.conflicts?.appointments?.map((a, i) => (
                <div key={a.id || i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed var(--border)" }}>
                  <span style={{ fontWeight: 700, color: "var(--heading-color)" }}>{i + 1}. {a.patientname}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{a.phone || "بدون هاتف"} — {a.apointementdate?.slice(11, 16) || a.shift_type}</span>
                </div>
              ))}
            </div>

            {/* The 3 Action Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                {
                  id: "cancel",
                  titleAr: "1. إلغاء المواعيد وإشعار المرضى تلقائياً (موصى به)",
                  titleFr: "1. Annuler et notifier les patients automatiquement",
                  descAr: "تحويل المواعيد إلى ملغاة، وإرسال إشعار اعتذار آلي لكل مريض في حسابه بالمنصة مع إمكانية حجز موعد جديد متى شاء.",
                  badge: isRtl ? "آلي وسريع" : "Automatique"
                },
                {
                  id: "reschedule",
                  titleAr: "2. ترحيل المواعيد آلياً إلى اليوم التالي",
                  titleFr: "2. Reporter automatiquement au jour suivant",
                  descAr: "نقل مواعيد المرضى تلقائياً إلى اليوم التالي لدوام الطبيب بنفس الأوقات تقريباً مع إشعارهم بالموعد البديل الجديد.",
                  badge: isRtl ? "جدولة بديلة" : "Report"
                },
                {
                  id: "manual",
                  titleAr: "3. تنسيق يدوي عبر السكرتيرة (قائمة الاتصال)",
                  titleFr: "3. Coordination manuelle par la secrétaire",
                  descAr: "حفظ الغياب لإيقاف الحجوزات الجديدة، مع فتح جدول يحتوي على أرقام هواتف المرضى لتتصل بهم السكرتيرة هاتفياً.",
                  badge: isRtl ? "اتصال يدوي" : "Manuel"
                }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setConflictModal(prev => ({ ...prev, selectedAction: opt.id }))}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    border: conflictModal.selectedAction === opt.id ? "2px solid var(--brand)" : "1.5px solid var(--border)",
                    background: conflictModal.selectedAction === opt.id ? "rgba(8, 145, 178, 0.08)" : "var(--bg)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12
                  }}
                >
                  <input
                    type="radio"
                    name="conflict_action"
                    checked={conflictModal.selectedAction === opt.id}
                    onChange={() => setConflictModal(prev => ({ ...prev, selectedAction: opt.id }))}
                    style={{ marginTop: 3, accentColor: "var(--brand)", width: 18, height: 18 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: "var(--heading-color)" }}>
                        {isRtl ? opt.titleAr : opt.titleFr}
                      </span>
                      <Badge style={{ fontSize: 10, background: conflictModal.selectedAction === opt.id ? "var(--brand)" : "var(--border)", color: conflictModal.selectedAction === opt.id ? "#fff" : "var(--text-secondary)" }}>
                        {opt.badge}
                      </Badge>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {opt.descAr}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn
                type="button"
                onClick={() => setConflictModal({ isOpen: false, conflicts: null, pendingPayload: null, selectedAction: "cancel", processing: false })}
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--heading-color)" }}
              >
                {isRtl ? "تراجع" : "Annuler"}
              </Btn>
              <Btn
                type="button"
                loading={conflictModal.processing}
                onClick={handleExecuteResolution}
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)", color: "#fff", fontWeight: 800 }}
              >
                {isRtl ? "تأكيد وتنفيذ الإجراء" : "Confirmer et exécuter"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          SECRETARY CALL LIST MODAL (قائمة الاتصال اليدوي بالمرضى)
          ────────────────────────────────────────────────────────── */}
      {callListModal.isOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: "var(--card-bg)",
            borderRadius: 20,
            maxWidth: 650,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: isMobile ? 20 : 28,
            border: "1.5px solid var(--border)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Phone size={22} color="var(--brand)" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "var(--heading-color)" }}>
                  {isRtl ? "قائمة اتصال السكرتيرة بالمرضى" : "Liste d'appels des patients"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCallListModal({ isOpen: false, appointments: [], calledIds: new Set() })}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
              {isRtl
                ? "تم حفظ الغياب بنجاح. يرجى الاتصال بالمرضى المدرجة أسماؤهم أدناه لتنسيق موعد بديل أو إبلاغهم:"
                : "Veuillez appeler les patients ci-dessous pour coordonner un nouveau rendez-vous :"}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {callListModal.appointments.map((a, idx) => {
                const isDone = callListModal.calledIds.has(a.id);
                return (
                  <div
                    key={a.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: isDone ? "rgba(16, 185, 129, 0.08)" : "var(--bg)",
                      border: isDone ? "1.5px solid #10b981" : "1.5px solid var(--border)",
                      borderRadius: 12
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "var(--heading-color)", marginBottom: 2 }}>
                        {idx + 1}. {a.patientname}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {a.apointementdate?.slice(0, 16)} — {a.phone || (isRtl ? "بدون هاتف" : "Pas de téléphone")}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {a.phone && (
                        <a
                          href={`tel:${a.phone}`}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "var(--brand)",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 800,
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 4
                          }}
                        >
                          <Phone size={13} />
                          {isRtl ? "اتصال" : "Appeler"}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleCalled(a.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          background: isDone ? "#10b981" : "var(--card-bg)",
                          color: isDone ? "#fff" : "var(--heading-color)",
                          border: isDone ? "none" : "1.5px solid var(--border)",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <CheckCircle2 size={13} />
                        {isDone ? (isRtl ? "تم الاتصال" : "Appelé") : (isRtl ? "تحديد كـ تم" : "Marquer")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn
                type="button"
                onClick={() => setCallListModal({ isOpen: false, appointments: [], calledIds: new Set() })}
                style={{ background: "var(--brand)", color: "#fff", fontWeight: 800 }}
              >
                {isRtl ? "إغلاق وإنهاء" : "Terminer"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
