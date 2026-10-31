// src/components/QuickEmergencyLeaveModal.jsx
import React, { useState } from "react";
import { Clock, AlertTriangle, CheckCircle2, X, AlertCircle } from "lucide-react";
import { Btn, useToast } from "./SharedUI";
import { api } from "../api/client";

export default function QuickEmergencyLeaveModal({ show, onClose, onSuccess, clinicId }) {
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState("2_hours"); // '2_hours' | 'rest_of_day' | 'custom'
  const [customStart, setCustomStart] = useState(() => new Date().toTimeString().slice(0, 5));
  const [customEnd, setCustomEnd] = useState("14:00");
  const [reason, setReason] = useState("ظرف طارئ مستعجل");
  const [showReason, setShowReason] = useState(true);

  // Conflicts handling state
  const [conflicts, setConflicts] = useState(null);
  const [selectedAction, setSelectedAction] = useState("cancel");
  const [pendingPayload, setPendingPayload] = useState(null);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const nowTime = now.toTimeString().slice(0, 5);

    let start_datetime = "";
    let end_datetime = "";

    if (option === "2_hours") {
      start_datetime = `${today} ${nowTime}:00`;
      const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      end_datetime = `${today} ${later.toTimeString().slice(0, 5)}:00`;
    } else if (option === "rest_of_day") {
      start_datetime = `${today} ${nowTime}:00`;
      end_datetime = `${today} 23:59:59`;
    } else {
      start_datetime = `${today} ${customStart}:00`;
      end_datetime = `${today} ${customEnd}:00`;
    }

    const payload = {
      clinic_id: clinicId && clinicId !== "all" ? clinicId : null,
      leave_type: "partial_hours",
      start_datetime,
      end_datetime,
      reason,
      show_reason_to_patient: showReason ? 1 : 0
    };

    try {
      const check = await api.doctor.checkUnavailabilityConflicts(payload);
      const data = check?.data || check;
      if (data?.has_conflicts && data?.count > 0) {
        setConflicts(data);
        setPendingPayload(payload);
      } else {
        await api.doctor.addUnavailability({ ...payload, resolution_action: "none" });
        showToast("تم تسجيل الطلعة الطارئة بنجاح وحجب المواعيد", "success");
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || "حدث خطأ أثناء تسجيل الطلعة", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveConflicts = async () => {
    setLoading(true);
    try {
      await api.doctor.addUnavailability({
        ...pendingPayload,
        resolution_action: selectedAction
      });
      showToast("تم تسجيل الطلعة ومعالجة المواعيد المتضاربة بنجاح", "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || "فشل تنفيذ الإجراء", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.55)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 16
    }}>
      <div style={{
        background: "var(--card-bg, #fff)",
        borderRadius: 22,
        maxWidth: 520,
        width: "100%",
        padding: 24,
        border: "1.5px solid var(--border)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Clock size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "var(--text-main, #0f172a)" }}>
                تسجيل خروج طارئ اليوم
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary, #64748b)" }}>
                إيقاف حجز المواعيد فجأة لساعات محددة أثناء الدوام
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--input-bg, #f1f5f9)",
              border: "none",
              borderRadius: 10,
              width: 34, height: 34,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-secondary)"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {!conflicts ? (
          <form onSubmit={handleSubmit}>
            {/* Quick Option Selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>
                مدة المغادرة أو التوقف:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { id: "2_hours", label: "⏱️ ساعتان من الآن" },
                  { id: "rest_of_day", label: "🛑 بقية دوام اليوم" },
                  { id: "custom", label: "✏️ ساعات مخصصة" },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOption(item.id)}
                    style={{
                      padding: "10px 8px",
                      borderRadius: 10,
                      border: option === item.id ? "2px solid #ef4444" : "1.5px solid var(--border)",
                      background: option === item.id ? "rgba(239, 68, 68, 0.08)" : "var(--input-bg, #f8fafc)",
                      fontSize: 12,
                      fontWeight: 800,
                      color: option === item.id ? "#ef4444" : "var(--text-main)",
                      cursor: "pointer"
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Hours inputs if selected */}
            {option === "custom" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                    من الساعة:
                  </label>
                  <input
                    type="time"
                    value={customStart}
                    onChange={e => setCustomStart(e.target.value)}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 10,
                      border: "1.5px solid var(--border)", background: "var(--input-bg)",
                      color: "var(--text-main)", fontSize: 13, boxSizing: "border-box"
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                    إلى الساعة:
                  </label>
                  <input
                    type="time"
                    value={customEnd}
                    onChange={e => setCustomEnd(e.target.value)}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 10,
                      border: "1.5px solid var(--border)", background: "var(--input-bg)",
                      color: "var(--text-main)", fontSize: 13, boxSizing: "border-box"
                    }}
                    required
                  />
                </div>
              </div>
            )}

            {/* Reason */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
                سبب الطلعة (اختياري):
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="مثال: ظرف طارئ، خروج مستعجل..."
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: 10,
                  border: "1.5px solid var(--border)", background: "var(--input-bg)",
                  color: "var(--text-main)", fontSize: 13, boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <input
                type="checkbox"
                id="show_reason_quick"
                checked={showReason}
                onChange={e => setShowReason(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#ef4444" }}
              />
              <label htmlFor="show_reason_quick" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", cursor: "pointer" }}>
                إظهار السبب للمرضى في شاشة الحجز
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn type="button" onClick={onClose} style={{ background: "var(--input-bg)", border: "1.5px solid var(--border)", color: "var(--text-main)" }}>
                إلغاء
              </Btn>
              <Btn type="submit" loading={loading} style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", fontWeight: 800 }}>
                تأكيد وحجب المواعيد
              </Btn>
            </div>
          </form>
        ) : (
          /* Conflict prompt */
          <div>
            <div style={{
              background: "#fef3c7",
              border: "1.5px solid #f59e0b",
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <AlertTriangle size={24} color="#d97706" />
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: "#92400e" }}>
                  يوجد {conflicts.count} مريض لديهم مواعيد في هذه الفترة!
                </div>
                <div style={{ fontSize: 11, color: "#b45309" }}>
                  اختر الإجراء المناسب لمواعيدهم:
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                { id: "cancel", label: "1. إلغاء المواعيد وإشعار المرضى تلقائياً" },
                { id: "reschedule", label: "2. ترحيل المواعيد إلى الغد آلياً" },
                { id: "manual", label: "3. إبقاء المواعيد للاتصال بهم يدوياً" }
              ].map(act => (
                <label
                  key={act.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: selectedAction === act.id ? "2px solid var(--brand, #0891b2)" : "1.5px solid var(--border)",
                    background: selectedAction === act.id ? "rgba(8, 145, 178, 0.08)" : "var(--input-bg)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-main)"
                  }}
                >
                  <input
                    type="radio"
                    name="quick_action"
                    checked={selectedAction === act.id}
                    onChange={() => setSelectedAction(act.id)}
                    style={{ accentColor: "var(--brand)" }}
                  />
                  <span>{act.label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn type="button" onClick={() => setConflicts(null)} style={{ background: "var(--input-bg)", border: "1.5px solid var(--border)", color: "var(--text-main)" }}>
                تراجع
              </Btn>
              <Btn type="button" loading={loading} onClick={handleResolveConflicts} style={{ background: "linear-gradient(135deg, #d97706, #b45309)", color: "#fff", fontWeight: 800 }}>
                تأكيد الإجراء
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
