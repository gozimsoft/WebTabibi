// src/components/QuickAppointmentModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar, Clock, Building2, Stethoscope, FileText,
  CheckCircle, AlertCircle, X, ChevronRight, Zap
} from "lucide-react";
import { api } from "../api/client";
import { Btn, Spinner, DoctorImage } from "./SharedUI";

export default function QuickAppointmentModal({ doctor, onClose, onSuccess, showToast }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const currentLang = i18n.language === "ar" ? "ar-DZ" : i18n.language;

  const clinics = useMemo(() => doctor?.clinics || [], [doctor]);
  const reasons = useMemo(() => doctor?.reasons || [], [doctor]);

  const [selectedClinic, setSelectedClinic] = useState(
    clinics.length > 0 ? clinics[0] : null
  );
  const [selectedReasonId, setSelectedReasonId] = useState(
    reasons.length > 0 ? reasons[0].id : ""
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [note, setNote] = useState("");
  const [consentHealth, setConsentHealth] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  // Compute available dates based on doctor's schedule workingdays (0=Mon..6=Sun)
  const availableDates = useMemo(() => {
    const schedule = doctor?.Schedule || {};
    const countdays = parseInt(schedule.countdays || 21);
    const workingdays = schedule.workingdays || "1111111";

    const dates = [];
    for (let i = 0; i <= countdays; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const full = `${yyyy}-${mm}-${dd}`;

      const w = d.getDay(); // 0=Sun..6=Sat
      const dayIndex = (w + 6) % 7; // 0=Mon..6=Sun matching Delphi

      if (workingdays[dayIndex] === "1" || !schedule.workingdays) {
        dates.push({
          full,
          day: d.getDate(),
          month: d.toLocaleDateString(currentLang, { month: "short" }),
          weekday: d.toLocaleDateString(currentLang, { weekday: "short" }),
        });
      }
    }
    return dates;
  }, [doctor, currentLang]);

  // Set default selected date
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0].full);
    }
  }, [availableDates, selectedDate]);

  // Fetch slots whenever selectedDate or selectedClinic changes
  useEffect(() => {
    if (!selectedDate || !selectedClinic?.clinicsdoctor_id) {
      setSlots([]);
      return;
    }

    let active = true;
    setLoadingSlots(true);
    setSelectedSlot("");

    api.appointments.getSlots({
      clinics_doctor_id: selectedClinic.clinicsdoctor_id,
      date: selectedDate,
    })
      .then((res) => {
        if (!active) return;
        const rawSlots = res?.data?.slots || res?.slots || [];
        setSlots(rawSlots);
        if (rawSlots.length > 0) {
          setSelectedSlot(rawSlots[0]);
        }
      })
      .catch(() => {
        if (!active) return;
        setSlots([]);
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDate, selectedClinic]);

  // Submit appointment booking
  const handleConfirmBooking = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!selectedClinic?.clinicsdoctor_id) {
      return showToast(t("select_clinic_label", "يرجى تحديد العيادة"), "error");
    }
    if (!selectedDate) {
      return showToast(t("select_date_label", "يرجى تحديد تاريخ الموعد"), "error");
    }
    if (!selectedSlot) {
      return showToast(t("select_slot_label", "يرجى اختيار الوقت المتاح"), "error");
    }
    if (!consentHealth) {
      return showToast(
        t("consent_health_required", "يرجى الموافقة على معالجة البيانات الصحية لإتمام حجز الموعد وفقاً للقانون 18-07."),
        "error"
      );
    }

    setBooking(true);
    try {
      await api.appointments.book({
        clinics_doctor_id: selectedClinic.clinicsdoctor_id,
        date: selectedDate,
        time: selectedSlot,
        reason_id: selectedReasonId || undefined,
        note: note.trim() || undefined,
        consent_health: 1,
      });

      showToast(t("booking_success_msg", "تم حجز الموعد بنجاح!"), "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || t("error_booking", "حدث خطأ أثناء حجز الموعد"), "error");
    } finally {
      setBooking(false);
    }
  };

  const specialtyName = isRtl
    ? (doctor.specialtyar || doctor.specialtyfr || "")
    : (doctor.specialtyfr || doctor.specialtyar || "");

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 16
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: 24,
        width: "100%",
        maxWidth: 540,
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        overflow: "hidden",
        animation: "fadeIn 0.2s ease"
      }}>
        {/* Header with Doctor Summary */}
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, #0891b2, #0e7490)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.4)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              flexShrink: 0
            }}>
              <DoctorImage doctor={doctor} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(255,255,255,0.2)",
                padding: "2px 8px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
                marginBottom: 3
              }}>
                <Zap size={12} fill="#fef08a" color="#fef08a" />
                {t("quick_booking_modal_title", "حجز موعد سريع")}
              </div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>
                {doctor.fullname}
              </h3>
              {specialtyName && (
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                  {specialtyName}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#ffffff",
              width: 34,
              height: 34,
              borderRadius: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <form onSubmit={handleConfirmBooking}>
            {/* 1. Clinic Selector (if multiple) */}
            {clinics.length > 1 && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  <Building2 size={15} style={{ verticalAlign: "middle", marginInlineEnd: 6, color: "#0891b2" }} />
                  {t("select_clinic_label", "العيادة")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                  {clinics.map((c) => {
                    const isSelected = selectedClinic?.clinicsdoctor_id === c.clinicsdoctor_id;
                    return (
                      <button
                        key={c.clinicsdoctor_id}
                        type="button"
                        onClick={() => setSelectedClinic(c)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: isSelected ? "2px solid #0891b2" : "1.5px solid #e2e8f0",
                          background: isSelected ? "#ecfeff" : "#ffffff",
                          textAlign: isRtl ? "right" : "left",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? "#0891b2" : "#334155" }}>
                          {c.clinicname}
                        </div>
                        {c.address && (
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                            {c.address}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Reason Selector (if available) */}
            {reasons.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  <Stethoscope size={15} style={{ verticalAlign: "middle", marginInlineEnd: 6, color: "#0891b2" }} />
                  {t("select_reason_label", "سبب الاستشارة")}
                </label>
                <select
                  value={selectedReasonId}
                  onChange={(e) => setSelectedReasonId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 13,
                    background: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                    fontWeight: 600
                  }}
                >
                  {reasons.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.reason_name} {r.reason_time ? `(${r.reason_time} min)` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Date Selection Strip */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                <Calendar size={15} style={{ verticalAlign: "middle", marginInlineEnd: 6, color: "#0891b2" }} />
                {t("select_date_label", "تاريخ الموعد")}
              </label>

              <div style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 8,
                scrollbarWidth: "thin"
              }}>
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.full;
                  return (
                    <button
                      key={item.full}
                      type="button"
                      onClick={() => setSelectedDate(item.full)}
                      style={{
                        minWidth: 70,
                        padding: "10px 8px",
                        borderRadius: 14,
                        border: isSelected ? "2px solid #0891b2" : "1.5px solid #e2e8f0",
                        background: isSelected ? "linear-gradient(135deg, #0891b2, #0e7490)" : "#f8fafc",
                        color: isSelected ? "#ffffff" : "#334155",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 4px 12px rgba(8, 145, 178, 0.25)" : "none"
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, opacity: isSelected ? 0.9 : 0.7 }}>
                        {item.weekday}
                      </span>
                      <span style={{ fontSize: 18, fontWeight: 900, margin: "2px 0" }}>
                        {item.day}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, opacity: isSelected ? 0.9 : 0.7 }}>
                        {item.month}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Time Slots Grid */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                <Clock size={15} style={{ verticalAlign: "middle", marginInlineEnd: 6, color: "#0891b2" }} />
                {t("select_slot_label", "الوقت المتاح")}
              </label>

              {loadingSlots ? (
                <div style={{ padding: "24px 0", textAlign: "center" }}>
                  <Spinner size={22} />
                </div>
              ) : slots.length === 0 ? (
                <div style={{
                  padding: "16px",
                  background: "#fef2f2",
                  borderRadius: 12,
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontSize: 13,
                  textAlign: "center"
                }}>
                  <AlertCircle size={18} style={{ verticalAlign: "middle", marginInlineEnd: 6 }} />
                  {t("no_slots_available_day", "لا توجد فترات متاحة في هذا اليوم")}
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                  gap: 8,
                  maxHeight: 180,
                  overflowY: "auto",
                  padding: "4px"
                }}>
                  {slots.map((s) => {
                    const isSelected = selectedSlot === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSlot(s)}
                        style={{
                          padding: "8px 6px",
                          borderRadius: 10,
                          border: isSelected ? "2px solid #0891b2" : "1.5px solid #e2e8f0",
                          background: isSelected ? "#0891b2" : "#ffffff",
                          color: isSelected ? "#ffffff" : "#1e293b",
                          fontWeight: isSelected ? 900 : 700,
                          fontSize: 13,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          boxShadow: isSelected ? "0 2px 8px rgba(8, 145, 178, 0.2)" : "none"
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Optional Note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                <FileText size={15} style={{ verticalAlign: "middle", marginInlineEnd: 6, color: "#0891b2" }} />
                {t("note_optional", "ملاحظة أو أعراض (اختياري)")}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("note_placeholder", "سبب الموعد باختصار...")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1.5px solid #cbd5e1",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* 6. Health Data Consent Checkbox (Art. 8 & 9 Loi 18-07) */}
            <div style={{
              marginBottom: 20,
              padding: "12px 14px",
              background: "#f0fdfa",
              border: "1px solid #a5f3fc",
              borderRadius: 12
            }}>
              <label style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                cursor: "pointer",
                userSelect: "none"
              }}>
                <input
                  type="checkbox"
                  checked={consentHealth}
                  onChange={(e) => setConsentHealth(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: "#0891b2",
                    cursor: "pointer",
                    marginTop: 2,
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: 12, color: "#0f766e", lineHeight: 1.5 }}>
                  {t(
                    "consent_health_label",
                    "أوافق صراحة على معالجة واستخدام بياناتي الصحية وملاحظاتي الطبية لغرض حجز وتنظيم الاستشارة الطبية وفقاً للمادتين 8 و 9 من القانون 18-07."
                  )}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <Btn variant="secondary" type="button" onClick={onClose} style={{ padding: "10px 18px", fontSize: 13 }}>
                {t("cancel", "إلغاء")}
              </Btn>
              <Btn
                type="submit"
                disabled={booking || !selectedSlot || !consentHealth}
                style={{
                  padding: "10px 24px",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: (!consentHealth || !selectedSlot) ? "#94a3b8" : "linear-gradient(135deg, #0891b2, #0e7490)",
                  boxShadow: (!consentHealth || !selectedSlot) ? "none" : "0 4px 14px rgba(8, 145, 178, 0.3)"
                }}
              >
                {booking ? <Spinner size={16} /> : <Zap size={16} fill="#fff" />}
                {t("confirm_booking_btn", "تأكيد الحجز السريع")}
              </Btn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
