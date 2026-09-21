import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import {
  Calendar, Clock, User, Phone, CheckCircle,
  XCircle, AlertCircle, RefreshCw, Search,
  Plus, X, FileText, Printer, Stethoscope,
  Building2, Check, ArrowRight, UserCheck, ChevronLeft, ChevronRight, Copy,
  Maximize2, Minimize2
} from "lucide-react";
import { Btn, Spinner, useToast, SmartPaginationBar } from "../components/SharedUI";

export default function ClinicAppointmentManager({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const { show, Toast } = useToast();
  const isRtl = i18n.language === "ar";

  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Filter states
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Full width display toggle (persisted in localStorage)
  const [isFullWidth, setIsFullWidth] = useState(() => {
    try {
      return localStorage.getItem("tabibi_clinic_fullwidth") === "true";
    } catch {
      return false;
    }
  });

  const toggleFullWidth = () => {
    setIsFullWidth(prev => {
      const next = !prev;
      try {
        localStorage.setItem("tabibi_clinic_fullwidth", String(next));
      } catch {}
      return next;
    });
  };

  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPrintDoctorModal, setShowPrintDoctorModal] = useState(false);
  const [printingDoctor, setPrintingDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newForm, setNewForm] = useState({
    clinics_doctor_id: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    patientname: "",
    phone: "",
    note: "",
    reason_id: ""
  });

  // Action loading state
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // 1. Fetch affiliated doctors & clinic profile
  const fetchDoctors = async () => {
    try {
      const res = await api.clinicAppointments.getDoctors();
      if (res.clinic) setClinic(res.clinic);
      if (res.doctors) {
        setDoctors(res.doctors);
        if (res.doctors.length > 0 && !newForm.clinics_doctor_id) {
          setNewForm(f => ({ ...f, clinics_doctor_id: res.doctors[0].clinicsdoctor_id }));
        }
      }
    } catch (err) {
      show(err.message || t("error_loading_data", "Erreur lors du chargement des données"), "error");
    }
  };

  // 2. Fetch appointments
  const fetchAppointments = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const params = {
        from: selectedDate,
        to: selectedDate
      };
      if (selectedDoctorId !== "all") {
        params.doctor_id = selectedDoctorId;
      }
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      const res = await api.clinicAppointments.getAppointments(params);
      setAppointments(res.appointments || []);
    } catch (err) {
      show(err.message || t("error_loading_data", "Erreur lors du chargement des rendez-vous"), "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDoctorId, selectedDate, statusFilter]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  // Date navigation helpers
  const handleShiftDate = (days) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().slice(0, 10));
  };

  const setDateToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  // Status update handler
  const handleStatusChange = async (appointmentId, newStatus, note = null) => {
    setActionLoadingId(appointmentId);
    try {
      await api.clinicAppointments.updateStatus(appointmentId, { status: newStatus, note });
      show(t("status_updated_success", "Statut du rendez-vous mis à jour"), "success");
      fetchAppointments(true);
      fetchDoctors(); // refresh counts
    } catch (err) {
      show(err.message || t("error_updating_status", "Erreur lors de la mise à jour"), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel appointment with confirmation
  const handleCancelAppointment = (appt) => {
    const reason = window.prompt(t("cancel_reason_prompt", "Motif de l'annulation (optionnel) :"));
    if (reason === null) return; // User pressed cancel in prompt
    handleStatusChange(appt.id, 1, reason ? `Annulé par la clinique : ${reason}` : null);
  };

  // Book appointment at counter
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!newForm.clinics_doctor_id) {
      show(t("select_doctor_required", "Veuillez sélectionner un médecin"), "error");
      return;
    }
    if (!newForm.patientname.trim()) {
      show(t("patient_name_required", "Le nom du patient est requis"), "error");
      return;
    }

    setSubmitting(true);
    try {
      await api.clinicAppointments.book(newForm);
      show(t("booking_success", "Rendez-vous enregistré avec succès au guichet"), "success");
      setShowNewModal(false);
      setNewForm(prev => ({
        ...prev,
        patientname: "",
        phone: "",
        note: ""
      }));
      fetchAppointments(true);
      fetchDoctors();
    } catch (err) {
      show(err.message || t("error_booking", "Erreur lors de l'enregistrement du rendez-vous"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    show(`${label} ${t("copied_to_clipboard", "copié dans le presse-papiers")}`, "info");
  };

  // Compute stats counters for today
  const statsCounters = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => Number(a.status) === 2).length;
    const arrived = appointments.filter(a => Number(a.status) === 4).length;
    const completed = appointments.filter(a => Number(a.status) === 3).length;
    const cancelled = appointments.filter(a => Number(a.status) === 1).length;
    const pending = appointments.filter(a => Number(a.status) === 0).length;
    return { total, confirmed, arrived, completed, cancelled, pending };
  }, [appointments]);

  // Reset pagination on filter or date change
  useEffect(() => {
    setPage(1);
  }, [selectedDoctorId, selectedDate, statusFilter, searchQuery]);

  // Total and paginated appointments
  const totalAppointments = appointments.length;
  const totalPages = Math.max(1, Math.ceil(totalAppointments / limit));
  const paginatedAppointments = useMemo(() => {
    const start = (page - 1) * limit;
    return appointments.slice(start, start + limit);
  }, [appointments, page, limit]);

  // Ensure page is within valid range if count drops
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // Format date display
  const formattedDateTitle = useMemo(() => {
    const d = new Date(selectedDate);
    const isToday = selectedDate === new Date().toISOString().slice(0, 10);
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const localeStr = isRtl ? "ar-DZ" : (i18n.language === "fr" ? "fr-FR" : "en-US");
    const formatted = d.toLocaleDateString(localeStr, options);
    return isToday ? `${formatted} (${t("today", "Aujourd'hui")})` : formatted;
  }, [selectedDate, isRtl, i18n.language, t]);

  // Memoized selected doctor object for print sheet and filtering
  const selectedDoctorObj = useMemo(() => {
    if (selectedDoctorId === "all") return null;
    return doctors.find(d => String(d.doctor_id) === String(selectedDoctorId)) || null;
  }, [selectedDoctorId, doctors]);

  // Clean afterprint listener to reset temporary printing target
  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintingDoctor(null);
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  // Determine active doctor for print (strictly single doctor at a time)
  const activePrintDoctor = useMemo(() => {
    if (printingDoctor) return printingDoctor;
    if (selectedDoctorObj) return selectedDoctorObj;
    return doctors.length > 0 ? doctors[0] : null;
  }, [printingDoctor, selectedDoctorObj, doctors]);

  // Target doctor appointments for printout (single doctor at a time)
  const targetDoctorAppts = useMemo(() => {
    if (!activePrintDoctor) return [];
    return appointments.filter(a => {
      const matchDocId = a.doctor_id && activePrintDoctor.doctor_id && String(a.doctor_id) === String(activePrintDoctor.doctor_id);
      const matchClinicDocId = a.clinics_doctor_id && activePrintDoctor.clinicsdoctor_id && String(a.clinics_doctor_id) === String(activePrintDoctor.clinicsdoctor_id);
      return matchDocId || matchClinicDocId;
    });
  }, [appointments, activePrintDoctor]);

  // Print trigger handler
  const handleTriggerPrint = (doc = null) => {
    const target = doc || selectedDoctorObj;
    if (!target) {
      setShowPrintDoctorModal(true);
      return;
    }
    setPrintingDoctor(target);
    setShowPrintDoctorModal(false);
    setTimeout(() => {
      window.print();
    }, 120);
  };

  const glassCard = {
    background: "var(--card-bg, #ffffff)",
    borderRadius: 20,
    border: "1px solid var(--border, #e2e8f0)",
    boxShadow: "0 4px 20px -2px rgba(0,0,0,0.04)"
  };

  return (
    <div className="clinic-agenda-wrapper" style={{
      minHeight: "100vh",
      background: "var(--bg, #f8fafc)",
      padding: isFullWidth ? "20px 24px 80px" : "24px 16px 80px",
      direction: isRtl ? "rtl" : "ltr",
      transition: "padding 0.25s ease"
    }}>
      <style>{`
        @media screen {
          .print-only {
            display: none !important;
          }
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm 10mm 10mm 10mm;
          }

          /* Hide global navigation, footer and interactive chrome */
          nav, footer, .no-print, [data-no-print="true"] {
            display: none !important;
          }

          body, html {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 10pt !important;
          }

          .clinic-agenda-wrapper {
            background: transparent !important;
            padding: 0 !important;
            min-height: auto !important;
          }

          .clinic-agenda-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-only {
            display: block !important;
          }

          .clinic-print-sheet {
            display: block !important;
            width: 100% !important;
          }

          .clinic-print-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          .clinic-print-table th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 800 !important;
            border: 1px solid #cbd5e1 !important;
            padding: 7px 8px !important;
            font-size: 9.5pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .clinic-print-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 7px 8px !important;
            font-size: 9pt !important;
            color: #0f172a !important;
          }

          .clinic-print-table tr {
            page-break-inside: avoid !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <Toast />

      <div className="clinic-agenda-container" style={{
        maxWidth: isFullWidth ? "100%" : 1240,
        margin: "0 auto",
        transition: "max-width 0.25s ease"
      }}>

        {/* ── HEADER BANNER ── */}
        <div className="no-print" style={{
          background: "linear-gradient(135deg, #0e7490 0%, #0891b2 100%)",
          borderRadius: 24,
          padding: "28px 32px",
          color: "#ffffff",
          marginBottom: 24,
          boxShadow: "0 10px 30px -5px rgba(8, 145, 178, 0.25)",
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
                color: "#ffffff"
              }}>
                <Building2 size={32} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900 }}>
                  {t("clinic_agenda_title", "Agenda Centralisé de la Clinique")}
                </h1>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>{clinic?.clinicname || user?.username}</span>
                  <span>•</span>
                  <span>{t("clinic_reception_desk", "Gestion du secrétariat, accueil et prise de RDV au guichet")}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Btn
                variant="primary"
                onClick={() => setShowNewModal(true)}
                style={{
                  background: "#ffffff",
                  color: "#0891b2",
                  fontWeight: 800,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  fontSize: 14
                }}
              >
                <Plus size={18} />
                {t("new_walkin_appointment", "Nouveau RDV au guichet")}
              </Btn>

              {/* Full Width / Standard Width Toggle */}
              <button
                onClick={toggleFullWidth}
                title={isFullWidth ? (isRtl ? "عرض قياسي (1240px)" : "Largeur standard (1240px)") : (isRtl ? "عرض كامل الشاشة" : "Plein écran")}
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: isFullWidth ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.18)",
                  border: isFullWidth ? "1.5px solid rgba(255,255,255,0.6)" : "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: isFullWidth ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                  transition: "all 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = isFullWidth ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.28)"}
                onMouseLeave={e => e.currentTarget.style.background = isFullWidth ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.18)"}
              >
                {isFullWidth ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                <span>
                  {isFullWidth
                    ? (isRtl ? "عرض قياسي" : "Largeur standard")
                    : (isRtl ? "شاشة عريضة" : "Plein écran")}
                </span>
              </button>

              <button
                onClick={() => fetchAppointments(true)}
                disabled={refreshing}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#ffffff",
                  borderRadius: 12,
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s"
                }}
                title={t("refresh", "Actualiser")}
              >
                <RefreshCw size={16} className={refreshing ? "spin-animation" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* ── DOCTORS SELECTOR TABS ── */}
        <div className="no-print" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--brand-dark, #0e7490)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Stethoscope size={18} color="#0891b2" />
              {t("select_doctor_filter", "Filtrer par médecin affilié")}
              <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                ({doctors.length} {t("affiliated_doctors", "médecins affiliés")})
              </span>
            </h2>
            <button
              onClick={() => navigate("/requests")}
              style={{
                background: "none",
                border: "none",
                color: "#0891b2",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              {t("manage_affiliations", "Gérer les affiliations des médecins →")}
            </button>
          </div>

          <div style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 6,
            scrollbarWidth: "thin"
          }}>
            {/* All Doctors Pill */}
            <button
              onClick={() => setSelectedDoctorId("all")}
              style={{
                padding: "12px 18px",
                borderRadius: 16,
                border: selectedDoctorId === "all" ? "2px solid #0891b2" : "1px solid var(--border, #e2e8f0)",
                background: selectedDoctorId === "all" ? "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" : "var(--card-bg, #ffffff)",
                color: selectedDoctorId === "all" ? "#ffffff" : "#334155",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
                boxShadow: selectedDoctorId === "all" ? "0 4px 14px rgba(8, 145, 178, 0.25)" : "0 2px 6px rgba(0,0,0,0.02)",
                transition: "all 0.2s"
              }}
            >
              <Building2 size={16} color={selectedDoctorId === "all" ? "#ffffff" : "#0891b2"} />
              <span>{t("all_clinic_doctors", "Tous les médecins de la clinique")}</span>
            </button>

            {/* Individual Doctor Pills */}
            {doctors.map(doc => {
              const isSelected = selectedDoctorId === doc.doctor_id;
              return (
                <button
                  key={doc.doctor_id}
                  onClick={() => setSelectedDoctorId(doc.doctor_id)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 16,
                    border: isSelected ? "2px solid #0891b2" : "1px solid var(--border, #e2e8f0)",
                    background: isSelected ? "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" : "var(--card-bg, #ffffff)",
                    color: isSelected ? "#ffffff" : "#334155",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexShrink: 0,
                    boxShadow: isSelected ? "0 4px 14px rgba(8, 145, 178, 0.25)" : "0 2px 6px rgba(0,0,0,0.02)",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: isSelected ? "rgba(255, 255, 255, 0.25)" : "rgba(8, 145, 178, 0.08)",
                    color: isSelected ? "#ffffff" : "#0891b2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 900
                  }}>
                    {doc.doctor_name ? doc.doctor_name.charAt(0).toUpperCase() : "D"}
                  </div>
                  <div style={{ textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ lineHeight: 1.2, fontWeight: isSelected ? 800 : 700, color: isSelected ? "#ffffff" : "#0f172a" }}>
                      {doc.doctor_name}
                    </div>
                    <div style={{ fontSize: 10, color: isSelected ? "rgba(255, 255, 255, 0.85)" : "#64748b", fontWeight: 600 }}>
                      {doc.specialty_name || t("general_medicine", "Médecine")}
                    </div>
                  </div>
                  {doc.today_appts_count > 0 && (
                    <span style={{
                      background: isSelected ? "#ffffff" : "rgba(8, 145, 178, 0.12)",
                      color: "#0891b2",
                      fontSize: 11,
                      fontWeight: 900,
                      padding: "2px 7px",
                      borderRadius: 12,
                      marginInlineStart: 4
                    }}>
                      {doc.today_appts_count}
                    </span>
                  )}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerPrint(doc);
                    }}
                    style={{
                      background: isSelected ? "rgba(255, 255, 255, 0.25)" : "rgba(8, 145, 178, 0.1)",
                      color: isSelected ? "#ffffff" : "#0891b2",
                      padding: "4px 8px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 800,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginInlineStart: 6,
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                    title={t("print_landscape_btn", "Imprimer la feuille (Paysage)")}
                  >
                    <Printer size={13} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STATS SUMMARY METRICS ── */}
        <div className="no-print" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
          marginBottom: 24
        }}>
          {/* Total */}
          <div style={{ ...glassCard, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(8, 145, 178, 0.1)", color: "#0891b2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#0891b2", lineHeight: 1 }}>{statsCounters.total}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 700 }}>{t("total_appointments", "Total RDV")}</div>
            </div>
          </div>

          {/* Confirmed */}
          <div style={{ ...glassCard, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#065f46", lineHeight: 1 }}>{statsCounters.confirmed}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 700 }}>{t("confirmed", "Confirmés")}</div>
            </div>
          </div>

          {/* In Waiting Room (Arrived) */}
          <div style={{
            ...glassCard,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            border: statsCounters.arrived > 0 ? "1.5px solid #0891b2" : "1px solid var(--border, #e2e8f0)",
            background: statsCounters.arrived > 0 ? "#f0fdfa" : "var(--card-bg, #ffffff)"
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ccfbf1", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#115e59", lineHeight: 1 }}>{statsCounters.arrived}</div>
              <div style={{ fontSize: 12, color: "#0d9488", marginTop: 4, fontWeight: 700 }}>{t("in_waiting_room", "En salle d'attente")}</div>
            </div>
          </div>

          {/* Completed */}
          <div style={{ ...glassCard, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#334155", lineHeight: 1 }}>{statsCounters.completed}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 700 }}>{t("completed", "Terminés")}</div>
            </div>
          </div>

          {/* Cancelled */}
          <div style={{ ...glassCard, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <XCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#991b1b", lineHeight: 1 }}>{statsCounters.cancelled}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 700 }}>{t("cancelled", "Annulés")}</div>
            </div>
          </div>
        </div>

        {/* ── CONTROLS & DATE NAVIGATION ── */}
        <div className="no-print" style={{
          ...glassCard,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}>
          {/* Left: Date Shifter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => handleShiftDate(-1)}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border, #e2e8f0)",
                background: "var(--card-bg, #fff)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569"
              }}
              title={t("prev_day", "Jour précédent")}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={setDateToday}
              style={{
                padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border, #e2e8f0)",
                background: selectedDate === new Date().toISOString().slice(0, 10) ? "#0891b2" : "var(--card-bg, #fff)",
                color: selectedDate === new Date().toISOString().slice(0, 10) ? "#fff" : "#334155",
                fontWeight: 700, fontSize: 13, cursor: "pointer"
              }}
            >
              {t("today", "Aujourd'hui")}
            </button>

            <button
              onClick={() => handleShiftDate(1)}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border, #e2e8f0)",
                background: "var(--card-bg, #fff)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569"
              }}
              title={t("next_day", "Jour suivant")}
            >
              <ChevronRight size={18} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginInlineStart: 8 }}>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  padding: "7px 12px", borderRadius: 10, border: "1.5px solid var(--border, #cbd5e1)",
                  fontSize: 13, fontWeight: 700, color: "#0f172a", background: "var(--bg, #f8fafc)", outline: "none"
                }}
              />
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--brand-dark, #0e7490)", marginInlineStart: 8 }}>
              {formattedDateTitle}
            </div>
          </div>

          {/* Right: Search & Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Status select */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px", borderRadius: 10, border: "1.5px solid var(--border, #cbd5e1)",
                fontSize: 13, fontWeight: 700, color: "#334155", background: "var(--card-bg, #fff)", outline: "none"
              }}
            >
              <option value="all">{t("all_statuses", "Tous les statuts")}</option>
              <option value="2">{t("confirmed", "Confirmé (2)")}</option>
              <option value="4">{t("in_waiting_room", "En salle d'attente (4)")}</option>
              <option value="0">{t("pending", "En attente (0)")}</option>
              <option value="3">{t("completed", "Terminé (3)")}</option>
              <option value="1">{t("cancelled", "Annulé (1)")}</option>
            </select>

            {/* Quick Search form */}
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <input
                type="text"
                placeholder={t("search_patient_placeholder", "Patient ou téléphone...")}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: "8px 12px", paddingInlineStart: 32, borderRadius: 10,
                  border: "1.5px solid var(--border, #cbd5e1)", fontSize: 13,
                  background: "var(--bg, #f8fafc)", outline: "none", width: 180
                }}
              />
              <Search size={14} color="#94a3b8" style={{ position: "absolute", [isRtl ? "right" : "left"]: 10 }} />
            </form>
          </div>
        </div>

        {/* ── APPOINTMENTS LIST / TABLE (SCREEN ONLY) ── */}
        <div className="clinic-table-card no-print" style={{ ...glassCard, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <Spinner size={36} />
              <div style={{ marginTop: 12, fontSize: 14, color: "#64748b" }}>{t("loading_appointments", "Chargement des rendez-vous...")}</div>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <Calendar size={48} color="#94a3b8" style={{ marginBottom: 12, opacity: 0.6 }} />
              <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: "#334155" }}>
                {t("no_appointments_day", "Aucun rendez-vous pour cette sélection")}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                {t("no_appointments_hint", "Vous pouvez ajouter un patient sur place en cliquant sur '+ Nouveau RDV au guichet'.")}
              </p>
              <Btn
                variant="primary"
                onClick={() => setShowNewModal(true)}
                style={{ marginTop: 18, fontSize: 13 }}
              >
                <Plus size={16} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                {t("new_walkin_appointment", "Nouveau RDV au guichet")}
              </Btn>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13, textAlign: isRtl ? "right" : "left" }}>
                <thead>
                  <tr style={{ background: "var(--bg, #f8fafc)", color: "#64748b", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)", width: 45, textAlign: "center" }}>#</th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)", width: 85 }}>{t("time", "Heure")}</th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>{t("patient", "Patient")}</th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>{t("doctor", "Médecin assigné")}</th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>{t("reason_or_note", "Motif / Remarque")}</th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)", textAlign: "center", width: 140 }}>{t("status", "Statut")}</th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)", textAlign: "center", width: 220 }}>{t("secretary_actions", "Action Secrétariat")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.map((appt, idx) => {
                    const globalIdx = (page - 1) * limit + idx + 1;
                    const timePart = appt.apointementdate ? appt.apointementdate.substring(11, 16) : "--:--";
                    const statusNum = Number(appt.status);
                    const isProcessing = actionLoadingId === appt.id;

                    return (
                      <tr
                        key={appt.id}
                        style={{
                          background: statusNum === 4 ? "rgba(8, 145, 178, 0.04)" : (idx % 2 === 0 ? "transparent" : "var(--bg, #fbfcfe)"),
                          borderBottom: "1px solid var(--border, #e2e8f0)",
                          transition: "background 0.15s"
                        }}
                      >
                        {/* 0. Index # */}
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #e2e8f0)", textAlign: "center", fontWeight: 800, color: "#64748b" }}>
                          {globalIdx}
                        </td>

                        {/* 1. Time */}
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #e2e8f0)", whiteSpace: "nowrap" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 900, color: "var(--brand-dark, #0e7490)", fontSize: 14 }}>
                            <Clock size={15} color="#0891b2" />
                            <span>{timePart}</span>
                          </div>
                        </td>

                        {/* 2. Patient */}
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>
                            {appt.patientname || t("anonymous_patient", "Patient sans nom")}
                          </div>
                          {appt.phone ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", marginTop: 2 }}>
                              <Phone size={11} />
                              <a href={`tel:${appt.phone}`} style={{ color: "#0891b2", textDecoration: "none", fontWeight: 600 }} dir="ltr">
                                {appt.phone}
                              </a>
                              <button
                                onClick={() => copyToClipboard(appt.phone, "Téléphone")}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}
                                title={t("copy", "Copier")}
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>—</div>
                          )}
                        </td>

                        {/* 3. Doctor */}
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                          <div style={{ fontWeight: 700, color: "var(--brand-dark, #0e7490)", display: "flex", alignItems: "center", gap: 6 }}>
                            <Stethoscope size={14} color="#0891b2" />
                            <span>{appt.doctorname}</span>
                          </div>
                          {appt.specialty_name && (
                            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginTop: 2 }}>
                              {appt.specialty_name}
                            </div>
                          )}
                        </td>

                        {/* 4. Reason / Note */}
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #e2e8f0)", maxWidth: 260 }}>
                          {appt.reason_name && (
                            <span style={{
                              display: "inline-block",
                              background: "#f1f5f9",
                              color: "#334155",
                              padding: "2px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: appt.note ? 4 : 0
                            }}>
                              {appt.reason_name}
                            </span>
                          )}
                          {appt.note && (
                            <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={appt.note}>
                              {appt.note}
                            </div>
                          )}
                          {!appt.reason_name && !appt.note && <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>

                        {/* 5. Status Badge */}
                        <td style={{ padding: "14px 16px", textAlign: "center", borderBottom: "1px solid var(--border, #e2e8f0)", whiteSpace: "nowrap" }}>
                          {statusNum === 4 && (
                            <span style={{
                              background: "#ccfbf1",
                              color: "#0f766e",
                              fontWeight: 800,
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 20,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              border: "1px solid #99f6e4"
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0d9488" }} />
                              {t("in_waiting_room", "En salle d'attente")}
                            </span>
                          )}
                          {statusNum === 2 && (
                            <span style={{
                              background: "#dcfce7",
                              color: "#15803d",
                              fontWeight: 800,
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 20,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5
                            }}>
                              <CheckCircle size={12} />
                              {t("confirmed", "Confirmé")}
                            </span>
                          )}
                          {statusNum === 0 && (
                            <span style={{
                              background: "#fef3c7",
                              color: "#b45309",
                              fontWeight: 800,
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 20,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5
                            }}>
                              <Clock size={12} />
                              {t("pending", "En attente")}
                            </span>
                          )}
                          {statusNum === 3 && (
                            <span style={{
                              background: "#f1f5f9",
                              color: "#475569",
                              fontWeight: 800,
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 20,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5
                            }}>
                              <Check size={12} />
                              {t("completed", "Terminé")}
                            </span>
                          )}
                          {statusNum === 1 && (
                            <span style={{
                              background: "#fee2e2",
                              color: "#b91c1c",
                              fontWeight: 800,
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 20,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5
                            }}>
                              <XCircle size={12} />
                              {t("cancelled", "Annulé")}
                            </span>
                          )}
                        </td>

                        {/* 6. Action Buttons */}
                        <td style={{ padding: "14px 16px", textAlign: "center", borderBottom: "1px solid var(--border, #e2e8f0)", whiteSpace: "nowrap" }}>
                          {isProcessing ? (
                            <Spinner size={16} />
                          ) : (
                            <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                              {/* If not yet arrived, show "Arrived" button */}
                              {statusNum !== 4 && statusNum !== 3 && statusNum !== 1 && (
                                <button
                                  onClick={() => handleStatusChange(appt.id, 4)}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #0d9488",
                                    background: "#f0fdfa",
                                    color: "#0f766e",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    transition: "all 0.15s"
                                  }}
                                  title={t("mark_arrived_desc", "Pointer la présence du patient en salle d'attente")}
                                >
                                  <UserCheck size={13} />
                                  {t("mark_arrived", "Arrivé")}
                                </button>
                              )}

                              {/* If in waiting room, show "Complete" button */}
                              {statusNum === 4 && (
                                <button
                                  onClick={() => handleStatusChange(appt.id, 3)}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #10b981",
                                    background: "#ecfdf5",
                                    color: "#047857",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4
                                  }}
                                >
                                  <Check size={13} />
                                  {t("mark_completed", "Terminer")}
                                </button>
                              )}

                              {/* If pending (0), button to confirm (2) */}
                              {statusNum === 0 && (
                                <button
                                  onClick={() => handleStatusChange(appt.id, 2)}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #059669",
                                    background: "#ecfdf5",
                                    color: "#065f46",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4
                                  }}
                                >
                                  <CheckCircle size={13} />
                                  {t("confirm_action", "Confirmer")}
                                </button>
                              )}

                              {/* Cancel button */}
                              {statusNum !== 1 && statusNum !== 3 && (
                                <button
                                  onClick={() => handleCancelAppointment(appt)}
                                  style={{
                                    padding: "6px 8px",
                                    borderRadius: 8,
                                    border: "1px solid var(--border, #e2e8f0)",
                                    background: "transparent",
                                    color: "#dc2626",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                  title={t("cancel_appointment", "Annuler le RDV")}
                                >
                                  <XCircle size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── PAGINATION BAR ── */}
        <SmartPaginationBar
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalItems={totalAppointments}
          totalPages={totalPages}
          limitOptions={[10, 20, 50, 100]}
          isRtl={isRtl}
          t={t}
        />

        {/* ── DEDICATED PRINT VACATION SHEET (PRINT-ONLY, LANDSCAPE A4, SINGLE DOCTOR ONLY) ── */}
        <div className="clinic-print-sheet print-only">
          {/* Print Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2.5px solid #0891b2",
            paddingBottom: 10,
            marginBottom: 12
          }}>
            {/* Left: Clinic Info */}
            <div style={{ maxWidth: 300 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#0e7490", lineHeight: 1.2 }}>
                {clinic?.clinicname || user?.username || "Clinique Tabibi"}
              </div>
              {(clinic?.address || clinic?.phone) && (
                <div style={{ fontSize: 10.5, color: "#475569", marginTop: 3 }}>
                  {clinic?.address && <span>{clinic.address}</span>}
                  {clinic?.address && clinic?.phone && <span> • </span>}
                  {clinic?.phone && <span>Tél : {clinic.phone}</span>}
                </div>
              )}
            </div>

            {/* Center: Title & Single Doctor Name */}
            <div style={{ textAlign: "center", flex: 1, padding: "0 12px" }}>
              <h1 style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {t("daily_schedule_title", "Feuille de vacation journalière — Rendez-vous")}
              </h1>
              <div style={{ fontSize: 13.5, color: "#0e7490", fontWeight: 900 }}>
                👨‍⚕️ {t("doctor", "Médecin")} : {activePrintDoctor?.doctor_name || "—"} {activePrintDoctor?.specialty_name ? `(${activePrintDoctor.specialty_name})` : ""}
              </div>
              <div style={{ fontSize: 11.5, color: "#334155", fontWeight: 700, marginTop: 2 }}>
                📅 {formattedDateTitle} • {t("total_printed_appts", "Total")} : <strong>{targetDoctorAppts.length} {t("appointments", "RDV")}</strong>
              </div>
            </div>

            {/* Right: Platform logo & timestamp */}
            <div style={{ textAlign: isRtl ? "left" : "right", minWidth: 180 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#0891b2" }}>
                طبيبي — TABIBI
              </div>
              <div style={{ fontSize: 9.5, color: "#64748b", marginTop: 2 }}>
                {t("printed_on", "Imprimé le")} : {new Date().toLocaleString(isRtl ? "ar-DZ" : (i18n.language === "fr" ? "fr-FR" : "en-US"))}
              </div>
              <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1, fontWeight: 600 }}>
                Format : Paysage (A4)
              </div>
            </div>
          </div>

          {/* Detailed Landscape Table for This Doctor */}
          {targetDoctorAppts.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: 8, margin: "20px 0" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                {t("no_appointments_for_doctor", "Aucun rendez-vous enregistré pour ce médecin à cette date.")}
              </p>
            </div>
          ) : (
            <table className="clinic-print-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", textAlign: isRtl ? "right" : "left" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", color: "#0f172a", fontSize: "9pt", fontWeight: 800 }}>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 8px", width: 35, textAlign: "center" }}>#</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 8px", width: 65, textAlign: "center" }}>{t("time", "Heure")}</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 10px", width: 170 }}>{t("patient", "Patient")}</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 10px", width: 110 }}>{t("phone", "Téléphone")}</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 10px" }}>{t("reason_or_note", "Motif / Remarque")}</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 8px", width: 100, textAlign: "center" }}>{t("status", "Statut")}</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 10px", width: 180 }}>{t("observations_notes", "Observations & Notes")}</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 8px", width: 90, textAlign: "center" }}>{t("signature_or_check", "Émargement")}</th>
                </tr>
              </thead>
              <tbody>
                {targetDoctorAppts.map((appt, idx) => {
                  const timePart = appt.apointementdate ? appt.apointementdate.substring(11, 16) : "--:--";
                  const statusNum = Number(appt.status);

                  let statusLabel = t("pending", "En attente");
                  if (statusNum === 2) statusLabel = t("confirmed", "Confirmé");
                  else if (statusNum === 4) statusLabel = t("in_waiting_room", "En salle d'attente");
                  else if (statusNum === 3) statusLabel = t("completed", "Terminé");
                  else if (statusNum === 1) statusLabel = t("cancelled", "Annulé");

                  return (
                    <tr key={appt.id} style={{ pageBreakInside: "avoid" }}>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", textAlign: "center", fontWeight: 700, color: "#64748b" }}>
                        {idx + 1}
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", textAlign: "center", fontWeight: 900, color: "#0e7490" }}>
                        {timePart}
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 10px", fontWeight: 800, color: "#0f172a" }}>
                        {appt.patientname || t("anonymous_patient", "Patient sans nom")}
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 10px", color: "#334155", fontWeight: 600 }} dir="ltr">
                        {appt.phone || "—"}
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 10px", color: "#334155" }}>
                        {appt.reason_name && <strong style={{ display: "inline-block", marginInlineEnd: 4 }}>[{appt.reason_name}]</strong>}
                        {appt.note || (!appt.reason_name ? "—" : "")}
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", textAlign: "center", fontWeight: 700, fontSize: "8.5pt" }}>
                        {statusLabel}
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 10px" }}>
                        &nbsp;
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", textAlign: "center" }}>
                        &nbsp;
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Print Footer with Stamp Area */}
          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "9pt", color: "#475569", pageBreakInside: "avoid" }}>
            <div>
              <div>
                <strong>{t("total_printed_appts", "Total des rendez-vous")} :</strong> {targetDoctorAppts.length}
              </div>
              <div style={{ marginTop: 3, fontSize: "8.5pt", color: "#94a3b8" }}>
                Plateforme Médicale Tabibi • {window.location.origin}
              </div>
            </div>

            <div style={{
              textAlign: "center",
              border: "1px dashed #94a3b8",
              borderRadius: 6,
              padding: "10px 24px",
              minWidth: 200
            }}>
              <div style={{ fontWeight: 800, fontSize: "8.5pt", color: "#334155", marginBottom: 30 }}>
                {t("reception_stamp", "Visa et cachet de l'accueil médical")}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── MODAL: CHOISIR LE MÉDECIN À IMPRIMER (PAYSAGE) ── */}
      {showPrintDoctorModal && (
        <div className="no-print" style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)",
            borderRadius: 24,
            maxWidth: 580,
            width: "100%",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.25)",
            overflow: "hidden",
            animation: "modalAppear 0.2s ease-out"
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #0e7490, #0891b2)",
              padding: "20px 24px",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Printer size={22} />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                  {t("select_doctor_to_print", "Sélectionner le médecin à imprimer")}
                </h3>
              </div>
              <button
                onClick={() => setShowPrintDoctorModal(false)}
                style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 13, color: "#475569", marginBottom: 18, lineHeight: 1.5 }}>
                {t("select_doctor_print_desc", "L'impression s'effectue au format Paysage pour un seul médecin à la fois. Choisissez le médecin concerné :")}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
                {doctors.map(doc => {
                  const count = appointments.filter(a =>
                    String(a.doctor_id) === String(doc.doctor_id) ||
                    (a.clinics_doctor_id && doc.clinicsdoctor_id && String(a.clinics_doctor_id) === String(doc.clinicsdoctor_id))
                  ).length;

                  return (
                    <div
                      key={doc.doctor_id}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 16,
                        border: "1.5px solid var(--border, #e2e8f0)",
                        background: "var(--bg, #f8fafc)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 14,
                        transition: "all 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: "rgba(8, 145, 178, 0.12)",
                          color: "#0891b2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 15,
                          fontWeight: 900
                        }}>
                          {doc.doctor_name ? doc.doctor_name.charAt(0).toUpperCase() : "D"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>
                            {doc.doctor_name}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                            {doc.specialty_name || t("general_medicine", "Médecine")} • <strong style={{ color: "#0891b2" }}>{count} {t("appointments", "RDV")}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => {
                            setSelectedDoctorId(doc.doctor_id);
                            setShowPrintDoctorModal(false);
                          }}
                          style={{
                            background: "#ffffff",
                            border: "1px solid var(--border, #cbd5e1)",
                            color: "#475569",
                            borderRadius: 10,
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {t("view", "Voir")}
                        </button>
                        <Btn
                          variant="primary"
                          onClick={() => handleTriggerPrint(doc)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 14px",
                            fontSize: 12,
                            fontWeight: 800
                          }}
                        >
                          <Printer size={14} />
                          {t("print_landscape_btn", "Imprimer (Paysage)")}
                        </Btn>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <Btn variant="secondary" onClick={() => setShowPrintDoctorModal(false)}>
                  {t("close", "Fermer")}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: NOUVEAU RENDEZ-VOUS AU GUICHET ── */}
      {showNewModal && (
        <div className="no-print" style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)",
            borderRadius: 24,
            maxWidth: 540,
            width: "100%",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.25)",
            overflow: "hidden",
            animation: "modalAppear 0.2s ease-out"
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #0e7490, #0891b2)",
              padding: "20px 24px",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Plus size={20} />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                  {t("new_walkin_modal_title", "Prise de rendez-vous au guichet")}
                </h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleBookSubmit} style={{ padding: 24 }}>
              {/* 1. Doctor select */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {t("doctor_assign", "Médecin consulté")} *
                </label>
                <select
                  value={newForm.clinics_doctor_id}
                  onChange={e => setNewForm({ ...newForm, clinics_doctor_id: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1.5px solid var(--border, #cbd5e1)",
                    fontSize: 14,
                    color: "#0f172a",
                    background: "var(--bg, #f8fafc)",
                    outline: "none"
                  }}
                >
                  {doctors.map(d => (
                    <option key={d.clinicsdoctor_id} value={d.clinicsdoctor_id}>
                      {d.doctor_name} ({d.specialty_name || "Médecine"})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Date & Time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                    {t("date", "Date")} *
                  </label>
                  <input
                    type="date"
                    value={newForm.date}
                    onChange={e => setNewForm({ ...newForm, date: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border, #cbd5e1)",
                      fontSize: 14,
                      color: "#0f172a",
                      background: "var(--bg, #f8fafc)",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                    {t("time", "Heure")} *
                  </label>
                  <input
                    type="time"
                    value={newForm.time}
                    onChange={e => setNewForm({ ...newForm, time: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border, #cbd5e1)",
                      fontSize: 14,
                      color: "#0f172a",
                      background: "var(--bg, #f8fafc)",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* 3. Patient Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {t("patient_fullname", "Nom et prénom du patient")} *
                </label>
                <input
                  type="text"
                  placeholder={t("patient_name_placeholder", "Ex: Mohamed Benali")}
                  value={newForm.patientname}
                  onChange={e => setNewForm({ ...newForm, patientname: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1.5px solid var(--border, #cbd5e1)",
                    fontSize: 14,
                    color: "#0f172a",
                    background: "var(--bg, #f8fafc)",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* 4. Phone */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {t("phone_number", "Numéro de téléphone")}
                </label>
                <input
                  type="tel"
                  placeholder="06XXXXXXXX"
                  value={newForm.phone}
                  onChange={e => setNewForm({ ...newForm, phone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1.5px solid var(--border, #cbd5e1)",
                    fontSize: 14,
                    color: "#0f172a",
                    background: "var(--bg, #f8fafc)",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  dir="ltr"
                />
              </div>

              {/* 5. Note / Reason */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {t("consultation_note", "Motif / Remarque pour le médecin")}
                </label>
                <textarea
                  rows={3}
                  placeholder={t("note_placeholder", "Précisez si urgence, contrôle, première visite...")}
                  value={newForm.note}
                  onChange={e => setNewForm({ ...newForm, note: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1.5px solid var(--border, #cbd5e1)",
                    fontSize: 13,
                    color: "#0f172a",
                    background: "var(--bg, #f8fafc)",
                    outline: "none",
                    boxSizing: "border-box",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Btn
                  variant="secondary"
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  disabled={submitting}
                >
                  {t("cancel", "Annuler")}
                </Btn>
                <Btn
                  variant="primary"
                  type="submit"
                  loading={submitting}
                  style={{
                    background: "linear-gradient(135deg, #0e7490, #0891b2)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Check size={16} />
                  {t("confirm_and_book", "Enregistrer le rendez-vous")}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
