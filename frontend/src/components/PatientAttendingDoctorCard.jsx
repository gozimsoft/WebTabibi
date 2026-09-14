// src/components/PatientAttendingDoctorCard.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Stethoscope, UserCheck, Calendar, Clock, MapPin, Phone,
  ChevronDown, ChevronUp, Zap, Plus, Search, Trash2, RefreshCw,
  Award, Building2, CheckCircle, AlertCircle, X, History, User
} from "lucide-react";
import { api } from "../api/client";
import { Card, Btn, Spinner, DoctorImage, VerifiedBadge } from "./SharedUI";
import QuickAppointmentModal from "./QuickAppointmentModal";

const STATUS_CONFIG = {
  0: { labelFr: "Confirmé", labelAr: "مؤكد", labelEn: "Confirmed", bg: "#e0f2fe", color: "#0369a1" },
  1: { labelFr: "Annulé", labelAr: "ملغي", labelEn: "Cancelled", bg: "#fee2e2", color: "#991b1b" },
  2: { labelFr: "Terminé", labelAr: "مكتمل", labelEn: "Completed", bg: "#d1fae5", color: "#065f46" },
};

export default function PatientAttendingDoctorCard({ showToast, isMobile }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const currentLang = i18n.language === "ar" ? "ar-DZ" : i18n.language;

  const [doctor, setDoctor] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Modals
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [removing, setRemoving] = useState(false);

  // Fetch Attending Doctor
  const fetchAttendingDoctor = async () => {
    setLoading(true);
    try {
      const res = await api.patient.getAttendingDoctor();
      const doc = res?.data !== undefined ? res.data : res;
      setDoctor(doc || null);
      if (doc?.id) {
        fetchHistory();
      }
    } catch (err) {
      // silent or fallback
    } finally {
      setLoading(false);
    }
  };

  // Fetch History with Attending Doctor
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.patient.getAttendingDoctorHistory();
      const items = Array.isArray(res) ? res : (res?.data || []);
      setHistory(items);
    } catch (err) {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAttendingDoctor();
  }, []);

  // Search Doctors for Selection
  const handleSearchDoctors = async (q) => {
    setSearching(true);
    try {
      const res = await api.patient.searchDoctors(q);
      const items = Array.isArray(res) ? res : (res?.data || []);
      setSearchResults(items);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (showSearchModal) {
      handleSearchDoctors(searchQuery);
    }
  }, [showSearchModal, searchQuery]);

  // Assign Doctor
  const handleAssignDoctor = async (docId) => {
    setAssigningId(docId);
    try {
      await api.patient.setAttendingDoctor(docId);
      showToast(t("doctor_assigned_success", "تم تعيين الطبيب المعالج بنجاح!"), "success");
      setShowSearchModal(false);
      fetchAttendingDoctor();
    } catch (err) {
      showToast(err.message || t("error_assigning", "حدث خطأ أثناء التعيين"), "error");
    } finally {
      setAssigningId(null);
    }
  };

  // Remove Doctor
  const handleRemoveDoctor = async () => {
    if (!window.confirm(t("confirm_remove_attending_doctor", "هل أنت متأكد من إلغاء تعيين الطبيب المعالج؟"))) {
      return;
    }

    setRemoving(true);
    try {
      await api.patient.removeAttendingDoctor();
      showToast(t("doctor_removed_success", "تم إلغاء تعيين الطبيب المعالج بنجاح!"), "success");
      setDoctor(null);
      setHistory([]);
    } catch (err) {
      showToast(err.message || t("error_removing", "حدث خطأ أثناء الإلغاء"), "error");
    } finally {
      setRemoving(false);
    }
  };

  const specialtyName = isRtl
    ? (doctor?.specialtyar || doctor?.specialtyfr || "")
    : (doctor?.specialtyfr || doctor?.specialtyar || "");

  const primaryClinic = doctor?.clinics?.[0];

  if (loading) {
    return (
      <Card style={{ marginBottom: 20, padding: 24, textAlign: "center" }}>
        <Spinner size={22} />
      </Card>
    );
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* ── State 1: No Attending Doctor Assigned ── */}
      {!doctor ? (
        <Card style={{
          border: "1.5px dashed #0284c7",
          background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
          padding: 24,
          borderRadius: 20,
          boxShadow: "0 4px 16px rgba(2, 132, 199, 0.06)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: "linear-gradient(135deg, #0284c7, #0369a1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 6px 16px rgba(2, 132, 199, 0.25)"
              }}>
                <Stethoscope size={28} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "#0c4a6e" }}>
                    {t("attending_doctor_title", "طبيبي المعالج")}
                  </h3>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 12,
                    background: "#e0f2fe",
                    color: "#0369a1"
                  }}>
                    {t("no_attending_doctor", "غير محدد")}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#0369a1", maxWidth: 500, lineHeight: 1.4 }}>
                  {t(
                    "no_attending_doctor_desc",
                    "عيّن طبيباً معالجاً لتسهيل حجز المواعيد السريعة ومتابعة ملفك الصحي بكل سهولة."
                  )}
                </p>
              </div>
            </div>

            <Btn
              type="button"
              onClick={() => setShowSearchModal(true)}
              style={{
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg, #0284c7, #0369a1)",
                boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)"
              }}
            >
              <Plus size={16} />
              {t("choose_attending_doctor", "تحديد طبيب معالج")}
            </Btn>
          </div>
        </Card>
      ) : (
        /* ── State 2: Attending Doctor Assigned ── */
        <Card style={{
          border: "1.5px solid #bae6fd",
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 8px 24px rgba(2, 132, 199, 0.08)",
          overflow: "hidden"
        }}>
          {/* Card Top Banner */}
          <div style={{
            background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
            padding: "14px 20px",
            borderBottom: "1px solid #e0f2fe",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#0284c7",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <UserCheck size={16} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#0c4a6e" }}>
                {t("attending_doctor_title", "طبيبي المعالج")}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(2, 132, 199, 0.12)",
                color: "#0284c7",
                padding: "2px 8px",
                borderRadius: 10
              }}>
                {t("assigned_status", "معتمد")}
              </span>
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#0284c7",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 6
                }}
              >
                {t("change_attending_doctor", "تغيير")}
              </button>
              <span style={{ color: "#cbd5e1" }}>•</span>
              <button
                type="button"
                disabled={removing}
                onClick={handleRemoveDoctor}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#e11d48",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                {removing ? <Spinner size={12} /> : <Trash2 size={13} />}
                {t("remove_attending_doctor", "إلغاء التعيين")}
              </button>
            </div>
          </div>

          {/* Doctor Details Body */}
          <div style={{ padding: "20px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16
            }}>
              {/* Doctor Avatar & Identity */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "2.5px solid #e0f2fe",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  flexShrink: 0
                }}>
                  <DoctorImage doctor={doctor} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#0c4a6e" }}>
                      {doctor.fullname}
                    </h3>
                    <VerifiedBadge verified={true} />
                  </div>

                  {specialtyName && (
                    <div style={{
                      display: "inline-block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#0284c7",
                      marginTop: 2
                    }}>
                      {specialtyName}
                    </div>
                  )}

                  {/* Clinic / Address info */}
                  {primaryClinic && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "#64748b",
                      marginTop: 4
                    }}>
                      <Building2 size={13} color="#94a3b8" />
                      <span style={{ fontWeight: 600 }}>{primaryClinic.clinicname}</span>
                      {primaryClinic.address && <span>• {primaryClinic.address}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Quick Book & History Toggle */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                width: isMobile ? "100%" : "auto"
              }}>
                {/* Quick Booking Button */}
                <Btn
                  type="button"
                  onClick={() => setShowQuickBook(true)}
                  style={{
                    flex: isMobile ? 1 : "initial",
                    padding: "11px 22px",
                    fontSize: 14,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: "linear-gradient(135deg, #0284c7, #0369a1)",
                    boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)"
                  }}
                >
                  <Zap size={16} fill="#fef08a" color="#fef08a" />
                  {t("quick_booking_btn", "حجز موعد سريع")}
                </Btn>

                {/* History Toggle */}
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #e2e8f0",
                    background: showHistory ? "#f8fafc" : "#ffffff",
                    color: "#334155",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s"
                  }}
                >
                  <History size={16} color="#0284c7" />
                  {t("attending_doctor_history_title", "سجل الزيارات")}
                  {history.length > 0 && (
                    <span style={{
                      background: "#0284c7",
                      color: "#ffffff",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: 10
                    }}>
                      {history.length}
                    </span>
                  )}
                  {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* ── Consultation History Section (Collapsible) ── */}
            {showHistory && (
              <div style={{
                marginTop: 20,
                borderTop: "1.5px solid #f1f5f9",
                paddingTop: 16,
                animation: "fadeIn 0.2s ease"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12
                }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={15} color="#0284c7" />
                    {t("attending_doctor_history_title", "سجل الاستشارات والمواعيد مع الطبيب")}
                  </h4>
                  <button
                    type="button"
                    onClick={fetchHistory}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <RefreshCw size={12} className={loadingHistory ? "spin" : ""} />
                    {t("refresh", "تحديث")}
                  </button>
                </div>

                {loadingHistory ? (
                  <div style={{ padding: "20px 0", textAlign: "center" }}>
                    <Spinner size={18} />
                  </div>
                ) : history.length === 0 ? (
                  <div style={{
                    padding: "24px 16px",
                    background: "#f8fafc",
                    borderRadius: 12,
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: 13
                  }}>
                    {t("no_consultations_with_doctor", "لا توجد استشارات سابقة مسجلة مع هذا الطبيب حتى الآن.")}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {history.map((item) => {
                      const statusCfg = STATUS_CONFIG[Number(item.status)] || STATUS_CONFIG[0];
                      const statusLabel = isRtl
                        ? statusCfg.labelAr
                        : (i18n.language === "fr" ? statusCfg.labelFr : statusCfg.labelEn);

                      const apptDate = new Date(item.apointementdate);
                      const dateStr = !isNaN(apptDate.getTime())
                        ? apptDate.toLocaleDateString(currentLang, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })
                        : item.apointementdate;

                      const timeStr = !isNaN(apptDate.getTime())
                        ? apptDate.toLocaleTimeString(currentLang, { hour: "2-digit", minute: "2-digit" })
                        : "";

                      return (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "#f8fafc",
                            border: "1px solid #f1f5f9",
                            fontSize: 13
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                              <span>{dateStr}</span>
                              {timeStr && <span style={{ color: "#0284c7" }}>• {timeStr}</span>}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                              {item.reason_name && <span style={{ fontWeight: 600 }}>{item.reason_name}</span>}
                              {item.clinicname && <span> — {item.clinicname}</span>}
                              {item.note && <span style={{ fontStyle: "italic" }}> ({item.note})</span>}
                            </div>
                          </div>

                          <span style={{
                            padding: "3px 8px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            background: statusCfg.bg,
                            color: statusCfg.color
                          }}>
                            {statusLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── Modal 1: Quick Appointment Booking ── */}
      {showQuickBook && doctor && (
        <QuickAppointmentModal
          doctor={doctor}
          onClose={() => setShowQuickBook(false)}
          onSuccess={() => {
            fetchHistory();
          }}
          showToast={showToast}
        />
      )}

      {/* ── Modal 2: Search & Select Attending Doctor ── */}
      {showSearchModal && (
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
            maxWidth: 520,
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            overflow: "hidden",
            animation: "fadeIn 0.2s ease"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "18px 22px",
              background: "linear-gradient(135deg, #0284c7, #0c4a6e)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Stethoscope size={22} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>
                  {t("select_doctor_modal_title", "اختيار الطبيب المعالج")}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
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
                <X size={16} />
              </button>
            </div>

            {/* Search input */}
            <div style={{ padding: "16px 20px 10px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ position: "relative" }}>
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
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_doctor_placeholder", "بحث باسم الطبيب أو التخصص...")}
                  style={{
                    width: "100%",
                    padding: isRtl ? "10px 38px 10px 12px" : "10px 12px 10px 38px",
                    borderRadius: 12,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Search Results List */}
            <div style={{ padding: "12px 20px 20px", overflowY: "auto", flex: 1 }}>
              {searching ? (
                <div style={{ padding: "30px 0", textAlign: "center" }}>
                  <Spinner size={22} />
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: "30px 0", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                  {t("no_doctors_found", "لم يتم العثور على أطباء مطابقين للبحث.")}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {searchResults.map((d) => {
                    const isSelected = doctor?.id === d.id;
                    const isAssigning = assigningId === d.id;
                    const spec = isRtl ? (d.specialtyar || d.specialtyfr) : (d.specialtyfr || d.specialtyar);

                    return (
                      <div
                        key={d.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: 12,
                          borderRadius: 14,
                          border: isSelected ? "2px solid #0284c7" : "1px solid #e2e8f0",
                          background: isSelected ? "#f0f9ff" : "#ffffff",
                          transition: "all 0.15s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                            <DoctorImage doctor={d} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#0c4a6e" }}>
                              {d.fullname}
                            </div>
                            {spec && <div style={{ fontSize: 12, color: "#0284c7", fontWeight: 600 }}>{spec}</div>}
                            {d.primary_clinic && (
                              <div style={{ fontSize: 11, color: "#64748b" }}>
                                {d.primary_clinic}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          {isSelected ? (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: "#0284c7",
                              background: "#e0f2fe",
                              padding: "4px 8px",
                              borderRadius: 8
                            }}>
                              {t("current_attending_doctor", "طبيبك الحالي")}
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={isAssigning}
                              onClick={() => handleAssignDoctor(d.id)}
                              style={{
                                padding: "8px 14px",
                                fontSize: 12,
                                fontWeight: 800,
                                borderRadius: 10,
                                border: "none",
                                background: "#0284c7",
                                color: "#ffffff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "all 0.15s"
                              }}
                            >
                              {isAssigning ? <Spinner size={12} /> : <UserCheck size={14} />}
                              {t("assign_doctor_btn", "تعيين")}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
