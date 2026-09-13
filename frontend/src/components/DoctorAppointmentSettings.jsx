// src/components/DoctorAppointmentSettings.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar, Clock, Plus, Edit2, Trash2, Search,
  CheckCircle2, AlertCircle, Building2, ShieldCheck,
  Check, X, ChevronRight, Sliders, CalendarDays
} from "lucide-react";
import { api } from "../api/client";
import { Btn, Card, Spinner } from "./SharedUI";

// Days mapping: Index 0=Monday to 6=Sunday (matches Delphi ListWorkDays & Controller)
const WEEK_DAYS = [
  { index: 0, key: "day_monday", defaultAr: "الإثنين", defaultFr: "Lundi", defaultEn: "Monday" },
  { index: 1, key: "day_tuesday", defaultAr: "الثلاثاء", defaultFr: "Mardi", defaultEn: "Tuesday" },
  { index: 2, key: "day_wednesday", defaultAr: "الأربعاء", defaultFr: "Mercredi", defaultEn: "Wednesday" },
  { index: 3, key: "day_thursday", defaultAr: "الخميس", defaultFr: "Jeudi", defaultEn: "Thursday" },
  { index: 4, key: "day_friday", defaultAr: "الجمعة", defaultFr: "Vendredi", defaultEn: "Friday" },
  { index: 5, key: "day_saturday", defaultAr: "السبت", defaultFr: "Samedi", defaultEn: "Saturday" },
  { index: 6, key: "day_sunday", defaultAr: "الأحد", defaultFr: "Dimanche", defaultEn: "Sunday" },
];

export default function DoctorAppointmentSettings({ doctor, showToast, isMobile }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State for Add / Edit (Matching Delphi DetailSettingApointement)
  const defaultForm = {
    clinic_id: "",
    timescale: 30,
    daytimestart: "08:00",
    daytimeend: "16:00",
    weekbeginday: 0,
    countdays: 30,
    isregistered: false,
    workingdays: "1111110", // 7 characters: Mon-Sun
  };

  const [formData, setFormData] = useState(defaultForm);

  const clinics = useMemo(() => {
    return doctor?.clinics || [];
  }, [doctor?.clinics]);

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.doctor.getAppointmentSettings();
      setSettings(res || []);
    } catch (err) {
      showToast(err.message || t("profile_loading_err"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Filtered List
  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return settings;
    const q = searchQuery.toLowerCase().trim();
    return settings.filter(s => {
      const clinic = (s.clinicname || "").toLowerCase();
      const scale = String(s.timescale || "");
      const start = (s.daytimestart_formatted || "").toLowerCase();
      const end = (s.daytimeend_formatted || "").toLowerCase();
      return clinic.includes(q) || scale.includes(q) || start.includes(q) || end.includes(q);
    });
  }, [settings, searchQuery]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ...defaultForm,
      clinic_id: clinics.length > 0 ? clinics[0].clinic_id : "",
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      clinic_id: item.clinic_id || (clinics.length > 0 ? clinics[0].clinic_id : ""),
      timescale: parseInt(item.timescale) || 30,
      daytimestart: item.daytimestart_formatted || "08:00",
      daytimeend: item.daytimeend_formatted || "16:00",
      weekbeginday: parseInt(item.weekbeginday) || 0,
      countdays: parseInt(item.countdays) || 30,
      isregistered: Boolean(parseInt(item.isregistered)),
      workingdays: item.workingdays && item.workingdays.length === 7 ? item.workingdays : "1111110",
    });
    setShowModal(true);
  };

  // Toggle Day in workingdays binary string
  const toggleWorkingDay = (dayIndex) => {
    const current = formData.workingdays.padEnd(7, "0").split("");
    current[dayIndex] = current[dayIndex] === "1" ? "0" : "1";
    setFormData({ ...formData, workingdays: current.join("") });
  };

  // Save (Create or Update)
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.clinic_id && clinics.length > 0) {
      return showToast(t("setting_clinic") + " مطلوب", "error");
    }

    if (!formData.daytimestart || !formData.daytimeend) {
      return showToast(t("setting_daytime_start") + " / " + t("setting_daytime_end") + " مطلوب", "error");
    }

    setSaving(true);
    try {
      if (editingItem?.id) {
        await api.doctor.updateAppointmentSetting(editingItem.id, formData);
      } else {
        await api.doctor.createAppointmentSetting(formData);
      }
      showToast(t("setting_save_success", "تم حفظ إعدادات المواعيد بنجاح"), "success");
      setShowModal(false);
      fetchSettings();
    } catch (err) {
      showToast(err.message || "حدث خطأ أثناء الحفظ", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm(t("confirm_delete_setting", "هل أنت متأكد من حذف إعداد المواعيد هذا؟"))) {
      return;
    }
    setDeletingId(id);
    try {
      await api.doctor.deleteAppointmentSetting(id);
      showToast(t("setting_delete_success", "تم حذف إعداد المواعيد بنجاح"), "success");
      setSettings(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      showToast(err.message || "فشل حذف الإعداد", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to render active days chips
  const renderWorkingDaysPills = (workingDaysStr) => {
    const chars = (workingDaysStr || "1111110").padEnd(7, "0").split("");
    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {WEEK_DAYS.map((day, idx) => {
          const isActive = chars[idx] === "1";
          const dayName = t(day.key, day.defaultAr);
          return (
            <span
              key={day.index}
              style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                padding: "2px 7px",
                borderRadius: 6,
                background: isActive ? "rgba(8, 145, 178, 0.12)" : "#f1f5f9",
                color: isActive ? "var(--brand, #0891b2)" : "#94a3b8",
                border: isActive ? "1px solid rgba(8, 145, 178, 0.3)" : "1px solid #e2e8f0",
                textDecoration: isActive ? "none" : "line-through",
              }}
              title={dayName}
            >
              {dayName.slice(0, 3)}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* ── Top Header & Actions ── */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 16
        }}>
          <div>
            <h3 style={{
              margin: "0 0 4px",
              color: "#0c4a6e",
              fontSize: 17,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <CalendarDays size={20} color="var(--brand, #0891b2)" />
              {t("appointment_settings_title", "إعدادات المواعيد وأوقات العمل")}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #64748b)" }}>
              {t("appointment_settings_desc", "ضبط مدة الحصص، أوقات العمل اليومية، والأيام المتاحة للحجز")}
            </p>
          </div>

          <Btn
            type="button"
            onClick={handleOpenAdd}
            style={{
              padding: "9px 20px",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(8, 145, 178, 0.25)"
            }}
          >
            <Plus size={18} />
            {t("add_setting_btn", "إضافة إعداد")}
          </Btn>
        </div>

        {/* Search Input (Matching SearchBox1 in Delphi) */}
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              [isRtl ? "right" : "left"]: 14,
              color: "#94a3b8"
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_settings", "بحث في الإعدادات...")}
            style={{
              width: "100%",
              padding: "10px 14px",
              [isRtl ? "paddingRight" : "paddingLeft"]: 38,
              background: "var(--bg, #fafafa)",
              border: "1.5px solid var(--border, #e2e8f0)",
              borderRadius: 12,
              fontSize: 13,
              color: "inherit",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>
      </Card>

      {/* ── Settings Content / Grid View ── */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center" }}>
          <Spinner size={24} />
        </div>
      ) : filteredSettings.length === 0 ? (
        <Card style={{
          padding: "36px 20px",
          textAlign: "center",
          background: "var(--bg, #fafafa)",
          border: "1.5px dashed var(--border, #cbd5e1)",
          borderRadius: 16
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "rgba(8, 145, 178, 0.08)",
            color: "var(--brand, #0891b2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px"
          }}>
            <Sliders size={28} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0c4a6e" }}>
            {t("no_settings_found", "لا توجد إعدادات مواعيد مضافة بعد")}
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, maxWidth: 420, margin: "6px auto 16px" }}>
            {t("no_settings_hint", "قم بإضافة إعدادات أوقات العمل لتفعيل نظام حجز المواعيد لمرضاك")}
          </div>
          <Btn
            type="button"
            variant="outline"
            onClick={handleOpenAdd}
            style={{ margin: "0 auto", padding: "8px 18px", fontSize: 13 }}
          >
            <Plus size={16} /> {t("add_setting_btn", "إضافة إعداد")}
          </Btn>
        </Card>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(360px, 1fr))",
          gap: 16
        }}>
          {filteredSettings.map((item, idx) => (
            <Card
              key={item.id || idx}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "20px",
                border: "1.5px solid var(--border, #e2e8f0)",
                borderRadius: 16,
                transition: "all 0.2s ease"
              }}
            >
              {/* Card Header: Clinic & Badge */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "rgba(8, 145, 178, 0.1)",
                      color: "var(--brand, #0891b2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#0c4a6e" }}>
                        {item.clinicname || t("setting_clinic", "العيادة")}
                      </div>
                      {item.clinic_address && (
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {item.clinic_address}
                        </div>
                      )}
                    </div>
                  </div>

                  {Boolean(parseInt(item.isregistered)) && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 20,
                      background: "#fef3c7",
                      color: "#b45309",
                      border: "1px solid #fde68a",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <ShieldCheck size={12} />
                      {t("setting_registered_only", "المسجلين فقط")}
                    </span>
                  )}
                </div>

                {/* Key Metrics Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  background: "var(--bg, #f8fafc)",
                  padding: "12px",
                  borderRadius: 12,
                  marginBottom: 14
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>
                      {t("setting_time_scale", "مدة الموعد")}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--brand, #0891b2)", display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={14} />
                      {item.timescale} {t("minutes_unit", "دقيقة")}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>
                      {t("setting_daytime_start", "ساعات الدوام")}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#334155" }}>
                      {item.daytimestart_formatted || "08:00"} - {item.daytimeend_formatted || "16:00"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>
                      {t("setting_available_days", "الأيام المتاحة للحجز")}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#334155" }}>
                      {item.countdays || 30} {t("days_unit", "يوم")}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>
                      {t("setting_week_begin_day", "بداية الأسبوع")}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#334155" }}>
                      {t(WEEK_DAYS[item.weekbeginday || 0]?.key, WEEK_DAYS[item.weekbeginday || 0]?.defaultAr)}
                    </div>
                  </div>
                </div>

                {/* Working days pills */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                    {t("setting_work_days", "أيام العمل الأسبوعية")}:
                  </div>
                  {renderWorkingDaysPills(item.workingdays)}
                </div>
              </div>

              {/* Action Buttons (Matching Delphi BtnEdit / BtnDelete) */}
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                borderTop: "1px solid var(--border, #f1f5f9)",
                paddingTop: 12
              }}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand, #0891b2)"; e.currentTarget.style.color = "var(--brand, #0891b2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#334155"; }}
                >
                  <Edit2 size={14} />
                  {t("edit_setting_btn", "تعديل")}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 10,
                    border: "1px solid #fee2e2",
                    background: "#fef2f2",
                    color: "#ef4444",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                >
                  {deletingId === item.id ? <Spinner size={12} /> : <Trash2 size={14} />}
                  {t("delete_setting_btn", "حذف")}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Modal: DetailSettingApointement ── */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)",
            width: "100%",
            maxWidth: 580,
            borderRadius: 20,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1.5px solid var(--border, #e2e8f0)",
            overflow: "hidden",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "18px 22px",
              background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                  {editingItem ? t("edit_setting_btn", "تعديل إعداد المواعيد") : t("modal_appointment_setting_title", "إعدادات المواعيد")}
                </h4>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                  {t("modal_appointment_setting_subtitle", "تحديد ساعات العمل، مدة الكشف، والأيام المتاحة")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.18)",
                  border: "none",
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} style={{ overflowY: "auto", padding: "20px 22px", flex: 1 }}>
              {/* Clinic Selection */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {t("setting_clinic", "العيادة المرتبطة")} *
                </label>
                <select
                  value={formData.clinic_id}
                  onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid var(--border, #cbd5e1)",
                    background: "var(--bg, #fafafa)",
                    fontSize: 13,
                    color: "inherit",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  {clinics.length === 0 ? (
                    <option value="">{t("select_clinic_optional", "عيادة الطبيب الرئيسية")}</option>
                  ) : (
                    clinics.map(c => (
                      <option key={c.clinic_id || c.clinicsdoctor_id} value={c.clinic_id}>
                        {c.clinicname}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* TimeScale (EdTimeScale) */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
                    {t("setting_time_scale", "مدة الموعد (بالدقائق)")} *
                  </label>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--brand, #0891b2)" }}>
                    {formData.timescale} {t("minutes_unit", "دقيقة")}
                  </span>
                </div>
                <input
                  type="number"
                  min={5}
                  max={180}
                  step={5}
                  value={formData.timescale}
                  onChange={(e) => setFormData({ ...formData, timescale: Math.max(5, parseInt(e.target.value) || 5) })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid var(--border, #cbd5e1)",
                    background: "var(--bg, #fafafa)",
                    fontSize: 14,
                    color: "inherit",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                {/* Presets */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {[10, 15, 20, 30, 45, 60].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFormData({ ...formData, timescale: mins })}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: formData.timescale === mins ? 800 : 600,
                        border: formData.timescale === mins ? "1.5px solid var(--brand, #0891b2)" : "1px solid #e2e8f0",
                        background: formData.timescale === mins ? "rgba(8, 145, 178, 0.12)" : "#f8fafc",
                        color: formData.timescale === mins ? "var(--brand, #0891b2)" : "#64748b",
                        cursor: "pointer"
                      }}
                    >
                      {mins} {t("minutes_unit", "دقيقة")}
                    </button>
                  ))}
                </div>
              </div>

              {/* DaytimeStart & DaytimeEnd (PaDaytimeStart / DtpDaytimeStart / DtpDaytimeEnd) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                    {t("setting_daytime_start", "بداية الدوام")} *
                  </label>
                  <input
                    type="time"
                    value={formData.daytimestart}
                    onChange={(e) => setFormData({ ...formData, daytimestart: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border, #cbd5e1)",
                      background: "var(--bg, #fafafa)",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                    {t("setting_daytime_end", "نهاية الدوام")} *
                  </label>
                  <input
                    type="time"
                    value={formData.daytimeend}
                    onChange={(e) => setFormData({ ...formData, daytimeend: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border, #cbd5e1)",
                      background: "var(--bg, #fafafa)",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* WeekBeginDay & CountDays (Panel3: EdWeekBeginDay & EdCountDays) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                    {t("setting_week_begin_day", "يوم بداية الأسبوع")}
                  </label>
                  <select
                    value={formData.weekbeginday}
                    onChange={(e) => setFormData({ ...formData, weekbeginday: parseInt(e.target.value) || 0 })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border, #cbd5e1)",
                      background: "var(--bg, #fafafa)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    {WEEK_DAYS.map(d => (
                      <option key={d.index} value={d.index}>
                        {t(d.key, d.defaultAr)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                    {t("setting_available_days", "الأيام المتاحة للحجز")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={formData.countdays}
                    onChange={(e) => setFormData({ ...formData, countdays: Math.max(1, parseInt(e.target.value) || 1) })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border, #cbd5e1)",
                      background: "var(--bg, #fafafa)",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* WorkDays (ListWorkDays in Delphi CheckListBox) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {t("setting_work_days", "أيام العمل الأسبوعية")} (حدد أيام العمل):
                </label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: 8,
                  background: "var(--bg, #f8fafc)",
                  padding: "12px",
                  borderRadius: 12,
                  border: "1.5px solid var(--border, #e2e8f0)"
                }}>
                  {WEEK_DAYS.map((day) => {
                    const isChecked = formData.workingdays[day.index] === "1";
                    return (
                      <div
                        key={day.index}
                        onClick={() => toggleWorkingDay(day.index)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: isChecked ? "rgba(8, 145, 178, 0.1)" : "#ffffff",
                          border: isChecked ? "1.5px solid var(--brand, #0891b2)" : "1px solid #e2e8f0",
                          cursor: "pointer",
                          userSelect: "none",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          border: isChecked ? "none" : "1.5px solid #cbd5e1",
                          background: isChecked ? "var(--brand, #0891b2)" : "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          flexShrink: 0
                        }}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span style={{
                          fontSize: 12,
                          fontWeight: isChecked ? 700 : 500,
                          color: isChecked ? "var(--brand, #0891b2)" : "#475569"
                        }}>
                          {t(day.key, day.defaultAr)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Registered Only (ChIsRegistered) */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 12,
                background: "var(--bg, #f8fafc)",
                border: "1.5px solid var(--border, #e2e8f0)",
                marginBottom: 20,
                cursor: "pointer"
              }}
                onClick={() => setFormData({ ...formData, isregistered: !formData.isregistered })}
              >
                <input
                  type="checkbox"
                  id="ch_isregistered"
                  checked={formData.isregistered}
                  onChange={(e) => setFormData({ ...formData, isregistered: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--brand, #0891b2)" }}
                />
                <label htmlFor="ch_isregistered" style={{ fontSize: 13, fontWeight: 700, color: "#334155", cursor: "pointer" }}>
                  {t("setting_registered_only", "حصر الحجز على المرضى المسجلين فقط")}
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#64748b",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {t("cancel", "إلغاء")}
                </button>
                <Btn
                  type="submit"
                  loading={saving}
                  style={{ padding: "10px 24px", fontSize: 13, fontWeight: 700 }}
                >
                  <Check size={16} />
                  {t("save", "حفظ")}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
