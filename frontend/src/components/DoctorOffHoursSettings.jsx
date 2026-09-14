// src/components/DoctorOffHoursSettings.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Clock, Plus, Edit2, Trash2, Search,
  AlertCircle, Building2,
  CalendarDays, Moon, Sun, Coffee
} from "lucide-react";
import { api } from "../api/client";
import { Btn, Card, Spinner } from "./SharedUI";

// Days mapping: Index 0=Monday to 6=Sunday (matches Delphi & Controller)
const WEEK_DAYS = [
  { index: 0, key: "day_monday", defaultAr: "الإثنين", defaultFr: "Lundi", defaultEn: "Monday" },
  { index: 1, key: "day_tuesday", defaultAr: "الثلاثاء", defaultFr: "Mardi", defaultEn: "Tuesday" },
  { index: 2, key: "day_wednesday", defaultAr: "الأربعاء", defaultFr: "Mercredi", defaultEn: "Wednesday" },
  { index: 3, key: "day_thursday", defaultAr: "الخميس", defaultFr: "Jeudi", defaultEn: "Thursday" },
  { index: 4, key: "day_friday", defaultAr: "الجمعة", defaultFr: "Vendredi", defaultEn: "Friday" },
  { index: 5, key: "day_saturday", defaultAr: "السبت", defaultFr: "Samedi", defaultEn: "Saturday" },
  { index: 6, key: "day_sunday", defaultAr: "الأحد", defaultFr: "Dimanche", defaultEn: "Sunday" },
];

export default function DoctorOffHoursSettings({ doctor, showToast, isMobile }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [offHours, setOffHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State for Add / Edit
  const defaultForm = {
    clinic_id: "",
    day: 0,
    timebegin: "12:00",
    timeend: "14:00",
  };

  const [formData, setFormData] = useState(defaultForm);

  const clinics = useMemo(() => {
    return doctor?.clinics || [];
  }, [doctor]);

  // Fetch Off-Hours List
  const fetchOffHours = async () => {
    setLoading(true);
    try {
      const res = await api.doctor.getOffHours();
      setOffHours(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      showToast(err.message || t("error_loading_off_hours", "فشل في تحميل فترات خارج العمل"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffHours();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ...defaultForm,
      clinic_id: clinics.length > 0 ? (clinics[0].clinic_id || clinics[0].id) : "",
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      clinic_id: item.clinic_id || "",
      day: parseInt(item.day) || 0,
      timebegin: item.timebegin_formatted || "12:00",
      timeend: item.timeend_formatted || "14:00",
    });
    setShowModal(true);
  };

  // Save (Create or Update)
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.clinic_id && clinics.length > 0) {
      return showToast(t("setting_clinic_required", "يجب اختيار العيادة"), "error");
    }

    if (!formData.timebegin || !formData.timeend) {
      return showToast(t("setting_times_required", "يجب تحديد وقت البداية ووقت النهاية"), "error");
    }

    if (formData.timebegin >= formData.timeend) {
      return showToast(t("setting_time_end_after_start", "وقت النهاية يجب أن يكون بعد وقت البداية"), "error");
    }

    setSaving(true);
    try {
      if (editingItem?.id) {
        await api.doctor.updateOffHour(editingItem.id, formData);
        showToast(t("off_hour_update_success", "تم تحديث فترة خارج العمل بنجاح"), "success");
      } else {
        await api.doctor.createOffHour(formData);
        showToast(t("off_hour_create_success", "تمت إضافة فترة خارج العمل بنجاح"), "success");
      }
      setShowModal(false);
      fetchOffHours();
    } catch (err) {
      showToast(err.message || t("error_saving", "حدث خطأ أثناء الحفظ"), "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm(t("confirm_delete_off_hour", "هل أنت متأكد من حذف فترة خارج العمل هذه؟"))) {
      return;
    }

    setDeletingId(id);
    try {
      await api.doctor.deleteOffHour(id);
      showToast(t("off_hour_delete_success", "تم حذف فترة خارج العمل بنجاح"), "success");
      fetchOffHours();
    } catch (err) {
      showToast(err.message || t("error_deleting", "حدث خطأ أثناء الحذف"), "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return offHours.filter((item) => {
      const dayObj = WEEK_DAYS[item.day];
      const dayName = t(dayObj?.key, dayObj?.defaultAr || "");
      const clinicName = item.clinicname || "";
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        dayName.toLowerCase().includes(query) ||
        clinicName.toLowerCase().includes(query) ||
        (item.timebegin_formatted || "").includes(query) ||
        (item.timeend_formatted || "").includes(query)
      );
    });
  }, [offHours, searchQuery, t]);

  const getDayName = (dayIndex) => {
    const dayObj = WEEK_DAYS[dayIndex];
    return t(dayObj?.key, dayObj?.defaultAr || "");
  };

  return (
    <div>
      {/* Header card */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16
        }}>
          <div>
            <h3 style={{
              color: "#0c4a6e",
              margin: "0 0 6px",
              fontSize: 17,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <Moon size={20} color="var(--brand, #0891b2)" />
              {t("off_hours_title", "أوقات خارج العمل وفترات الاستراحة")}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #64748b)" }}>
              {t(
                "off_hours_desc",
                "تحديد الفترات الزمنية خارج أوقات العمل أو فترات الراحة التي يتم استبعادها تلقائياً من مواعيد الحجز المتاحة للمرضى"
              )}
            </p>
          </div>

          <Btn
            type="button"
            onClick={handleOpenAdd}
            style={{
              padding: "9px 18px",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, var(--brand, #0891b2), #0c4a6e)",
              boxShadow: "0 2px 8px rgba(8, 145, 178, 0.25)"
            }}
          >
            <Plus size={16} />
            {t("add_off_hour_btn", "إضافة فترة خارج العمل")}
          </Btn>
        </div>

        {/* Search Bar */}
        {offHours.length > 0 && (
          <div style={{ position: "relative", maxWidth: 360, marginBottom: 16 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                [isRtl ? "right" : "left"]: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8"
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_off_hours_placeholder", "بحث باليوم أو العيادة أو الوقت...")}
              style={{
                width: "100%",
                padding: isRtl ? "8px 36px 8px 12px" : "8px 12px 8px 36px",
                borderRadius: 10,
                border: "1.5px solid var(--border, #e2e8f0)",
                fontSize: 13,
                background: "var(--input-bg, #ffffff)",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
        )}

        {/* Content list */}
        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <Spinner size={24} />
            <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
              {t("loading_off_hours", "جاري تحميل أوقات خارج العمل...")}
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "var(--bg, #f8fafc)",
            borderRadius: 16,
            border: "1.5px dashed var(--border, #cbd5e1)"
          }}>
            <Coffee size={40} style={{ color: "#94a3b8", marginBottom: 12 }} />
            <h4 style={{ margin: "0 0 6px", color: "#334155", fontSize: 15, fontWeight: 700 }}>
              {searchQuery
                ? t("no_off_hours_found", "لا توجد نتائج مطابقة لبحثك")
                : t("no_off_hours_yet", "لم يتم تحديد أي فترات خارج العمل بعد")}
            </h4>
            <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: 13, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
              {searchQuery
                ? t("try_another_search", "جرب البحث بكلمات أخرى أو مسح شريط البحث.")
                : t(
                  "off_hours_empty_hint",
                  "يمكنك تحديد فترات استراحة (مثلاً: استراحة الغداء من 12:00 إلى 14:00) لمنع المرضى من حجز مواعيد خلالها."
                )}
            </p>
            {!searchQuery && (
              <Btn
                type="button"
                onClick={handleOpenAdd}
                style={{ padding: "8px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={15} />
                {t("add_first_off_hour", "إضافة أول فترة")}
              </Btn>
            )}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16
          }}>
            {filteredItems.map((item) => {
              const dayName = getDayName(item.day);
              const isDeleting = deletingId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: 14,
                    border: "1.5px solid var(--border, #e2e8f0)",
                    padding: 16,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div>
                    {/* Card Header: Day badge & Clinic */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 12
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(8, 145, 178, 0.08)",
                        color: "var(--brand, #0891b2)",
                        padding: "4px 10px",
                        borderRadius: 8,
                        fontWeight: 800,
                        fontSize: 13
                      }}>
                        <CalendarDays size={15} />
                        {dayName}
                      </div>

                      {item.clinicname && (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "#f1f5f9",
                          color: "#475569",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}>
                          <Building2 size={12} />
                          {item.clinicname}
                        </span>
                      )}
                    </div>

                    {/* Time Window */}
                    <div style={{
                      background: "var(--bg, #f8fafc)",
                      padding: "12px",
                      borderRadius: 10,
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "#fee2e2",
                          color: "#dc2626",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <Clock size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                            {t("off_hour_range", "فترة خارج العمل")}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                            {item.timebegin_formatted || "12:00"} — {item.timeend_formatted || "14:00"}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 20,
                        background: "#fef2f2",
                        color: "#b91c1c",
                        border: "1px solid #fecaca"
                      }}>
                        {t("closed_label", "مغلق")}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    borderTop: "1px solid var(--border, #f1f5f9)",
                    paddingTop: 10
                  }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      style={{
                        padding: "6px 12px",
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid var(--border, #cbd5e1)",
                        background: "#ffffff",
                        color: "#334155",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s ease"
                      }}
                    >
                      <Edit2 size={13} color="var(--brand, #0891b2)" />
                      {t("edit", "تعديل")}
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDelete(item.id)}
                      style={{
                        padding: "6px 12px",
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #fecaca",
                        background: "#fff1f2",
                        color: "#e11d48",
                        fontWeight: 700,
                        cursor: isDeleting ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s ease",
                        opacity: isDeleting ? 0.6 : 1
                      }}
                    >
                      {isDeleting ? <Spinner size={13} /> : <Trash2 size={13} />}
                      {t("delete", "حذف")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Modal Add / Edit (Matching Delphi DetailDoctorsOffHourUnit) ── */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 20,
            width: "100%",
            maxWidth: 480,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
            animation: "fadeIn 0.2s ease"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, var(--brand, #0891b2), #0c4a6e)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                    {editingItem
                      ? t("edit_off_hour_title", "تعديل فترة خارج العمل")
                      : t("add_off_hour_title", "إضافة فترة خارج العمل")}
                  </h3>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>
                    {t("off_hour_modal_subtitle", "استبعاد فترات الراحة والأوقات غير المتاحة")}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#ffffff",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: "20px" }}>
              {/* Clinic Selection */}
              {clinics.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    {t("setting_clinic", "العيادة")} <span style={{ color: "#e11d48" }}>*</span>
                  </label>
                  <select
                    value={formData.clinic_id}
                    onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border, #cbd5e1)",
                      fontSize: 13,
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    {clinics.map((c) => (
                      <option key={c.clinic_id || c.id} value={c.clinic_id || c.id}>
                        {c.clinicname || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Day Selection (Monday to Sunday) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                  {t("select_day", "يوم الأسبوع")} <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))",
                  gap: 6
                }}>
                  {WEEK_DAYS.map((day) => {
                    const isSelected = formData.day === day.index;
                    return (
                      <button
                        key={day.index}
                        type="button"
                        onClick={() => setFormData({ ...formData, day: day.index })}
                        style={{
                          padding: "8px 6px",
                          borderRadius: 8,
                          border: isSelected ? "1.5px solid var(--brand, #0891b2)" : "1px solid #cbd5e1",
                          background: isSelected ? "rgba(8, 145, 178, 0.12)" : "#ffffff",
                          color: isSelected ? "var(--brand, #0891b2)" : "#475569",
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: 12,
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {t(day.key, day.defaultAr)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Begin and Time End (Matching Delphi DtpTimeBegin & DtpTimeEnd) */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16
              }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    {t("time_begin", "وقت البداية")} <span style={{ color: "#e11d48" }}>*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.timebegin}
                    onChange={(e) => setFormData({ ...formData, timebegin: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border, #cbd5e1)",
                      fontSize: 14,
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    {t("time_end", "وقت النهاية")} <span style={{ color: "#e11d48" }}>*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.timeend}
                    onChange={(e) => setFormData({ ...formData, timeend: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border, #cbd5e1)",
                      fontSize: 14,
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Presets Hint */}
              <div style={{
                display: "flex",
                gap: 8,
                marginBottom: 20,
                alignItems: "center",
                flexWrap: "wrap"
              }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                  {t("quick_presets", "خيارات سريعة:")}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, timebegin: "12:00", timeend: "14:00" })}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: 11,
                    color: "#334155",
                    cursor: "pointer"
                  }}
                >
                  {t("lunch_break", "استراحة غداء (12:00 - 14:00)")}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, timebegin: "12:30", timeend: "13:30" })}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: 11,
                    color: "#334155",
                    cursor: "pointer"
                  }}
                >
                  {t("one_hour_break", "ساعة راحة (12:30 - 13:30)")}
                </button>
              </div>

              {/* Modal Actions */}
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                borderTop: "1px solid #e2e8f0",
                paddingTop: 16
              }}>
                <Btn
                  variant="secondary"
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "8px 16px", fontSize: 13 }}
                >
                  {t("cancel", "إلغاء")}
                </Btn>

                <Btn
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "8px 20px",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  {saving && <Spinner size={14} />}
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
