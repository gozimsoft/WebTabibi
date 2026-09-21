import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import {
  Check, X, Search, RefreshCw, Filter, Phone, Copy,
  Calendar, Building2, Stethoscope, Clock, CheckCircle,
  XCircle, AlertCircle, LayoutList, LayoutGrid, ArrowRight,
  UserCheck, Shield, ChevronLeft, ChevronRight, UserPlus
} from "lucide-react";
import { Btn, Spinner, useToast, SmartPaginationBar } from "../components/SharedUI";

export default function RequestsPage({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const { show, Toast } = useToast();
  const isRtl = i18n.language === "ar";
  const isClinic = user?.user_type === 2;
  const isDoctor = user?.user_type === 1;

  // Data states
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters & Controls state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PENDING | ACCEPTED | REJECTED
  const [directionFilter, setDirectionFilter] = useState("ALL"); // ALL | RECEIVED | SENT
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Load requests from backend
  const loadRequests = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await api.relations.getRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      show(e.message || t("error_loading_data", "Erreur lors du chargement des demandes"), "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, directionFilter]);

  // Respond to request (ACCEPT / REJECT)
  const handleRespond = async (id, action) => {
    setActionLoadingId(id);
    try {
      await api.relations.respond(id, { action });
      const actionMsg = action === "ACCEPT"
        ? (isRtl ? "تمت الموافقة على طلب الارتباط بنجاح" : "Demande d'affiliation acceptée")
        : (isRtl ? "تم رفض الطلب بنجاح" : "Demande d'affiliation refusée");
      show(actionMsg, "success");
      loadRequests(true);
    } catch (e) {
      show(e.message || t("error_updating_status", "Erreur lors de la mise à jour"), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    show(isRtl ? `تم نسخ ${label}` : `${label} copié`, "success");
  };

  // Helper to determine if a request was received (requires my action) or sent by me
  const isReceivedRequest = (r) => {
    const sender = (r.SenderType || "").toUpperCase();
    if (isClinic) return sender === "DOCTOR";
    if (isDoctor) return sender === "CLINIC";
    return false;
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === "PENDING").length;
    const pendingReceived = requests.filter(r => r.status === "PENDING" && isReceivedRequest(r)).length;
    const accepted = requests.filter(r => r.status === "ACCEPTED").length;
    const rejected = requests.filter(r => r.status === "REJECTED").length;
    return { total, pending, pendingReceived, accepted, rejected };
  }, [requests, isClinic, isDoctor]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // 1. Status Filter
      if (statusFilter !== "ALL" && r.status !== statusFilter) {
        return false;
      }

      // 2. Direction Filter
      const isReceived = isReceivedRequest(r);
      if (directionFilter === "RECEIVED" && !isReceived) return false;
      if (directionFilter === "SENT" && isReceived) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (r.targetname || "").toLowerCase();
        const specialty = (r.specialty_name || "").toLowerCase();
        const phone = (r.phone || "").toLowerCase();
        const address = (r.address || "").toLowerCase();
        if (!name.includes(q) && !specialty.includes(q) && !phone.includes(q) && !address.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [requests, statusFilter, directionFilter, searchQuery, isClinic, isDoctor]);

  // Paginated slice
  const totalItems = filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredRequests.slice(start, start + limit);
  }, [filteredRequests, page, limit]);

  // Auto-adjust page if out of bounds
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const glassCard = {
    background: "var(--card-bg, #ffffff)",
    borderRadius: 18,
    border: "1px solid var(--border, #e2e8f0)",
    boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg, #f8fafc)",
      padding: "24px 16px 80px",
      direction: isRtl ? "rtl" : "ltr"
    }}>
      <Toast />

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── TABIBI GOLD STANDARD HERO BANNER ── */}
        <div style={{
          background: "linear-gradient(135deg, rgb(14, 116, 144) 0%, rgb(8, 145, 178) 100%)",
          borderRadius: 24,
          padding: "28px 32px",
          color: "#ffffff",
          marginBottom: 24,
          boxShadow: "0 10px 30px -5px rgba(8, 145, 178, 0.25)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Decorative Corner Bubble */}
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
            {/* Title & Icon */}
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
                {isClinic ? <Building2 size={32} /> : <Stethoscope size={32} />}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900 }}>
                  {isRtl ? "طلبات الانضمام والارتباط المهني" : "Demandes d'adhésion & Affiliations"}
                </h1>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700 }}>
                    {isClinic ? (user?.profile?.clinicname || user?.username) : (user?.profile?.fullname || user?.username)}
                  </span>
                  <span>•</span>
                  <span>
                    {isClinic
                      ? (isRtl ? "إدارة طلبات انضمام الأطباء واعتمادهم بالعيادة" : "Gestion et validation des affiliations des médecins")
                      : (isRtl ? "متابعة طلبات الانضمام والعمل بالعيادات الشريكة" : "Suivi des demandes d'affiliation aux cliniques")}
                  </span>
                  {metrics.pendingReceived > 0 && (
                    <span style={{
                      background: "#fef3c7",
                      color: "#b45309",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 11
                    }}>
                      {metrics.pendingReceived} {isRtl ? "طلب بانتظار موافقتك" : "en attente de votre action"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {isClinic && (
                <button
                  onClick={() => navigate("/clinic/appointments")}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.3)"
                  }}
                >
                  <Calendar size={16} />
                  {isRtl ? "جدول مواعيد العيادة" : "Agenda de la clinique"}
                </button>
              )}

              {isClinic && (
                <button
                  onClick={() => navigate("/search")}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 14,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#ffffff",
                    color: "#0891b2",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
                  }}
                >
                  <UserPlus size={16} />
                  {isRtl ? "دعوة طبيب جديد" : "Inviter un médecin"}
                </button>
              )}

              <button
                onClick={() => loadRequests(true)}
                disabled={refreshing}
                title={isRtl ? "تحديث" : "Actualiser"}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  borderRadius: 12,
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s"
                }}
              >
                <RefreshCw size={16} className={refreshing ? "spin-animation" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI METRICS CARDS ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 20
        }}>
          {/* Total */}
          <div
            onClick={() => setStatusFilter("ALL")}
            style={{
              ...glassCard,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              border: statusFilter === "ALL" ? "2px solid #0891b2" : "1px solid var(--border, #e2e8f0)",
              transition: "all 0.15s"
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(8, 145, 178, 0.1)", color: "#0891b2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#0891b2", lineHeight: 1 }}>{metrics.total}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 700 }}>
                {isRtl ? "إجمالي الطلبات" : "Total des demandes"}
              </div>
            </div>
          </div>

          {/* Pending */}
          <div
            onClick={() => setStatusFilter("PENDING")}
            style={{
              ...glassCard,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              border: statusFilter === "PENDING" ? "2px solid #d97706" : "1px solid var(--border, #e2e8f0)",
              background: metrics.pending > 0 ? "#fffbeb" : "var(--card-bg, #ffffff)",
              transition: "all 0.15s"
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#b45309", lineHeight: 1 }}>{metrics.pending}</div>
              <div style={{ fontSize: 12, color: "#92400e", marginTop: 4, fontWeight: 700 }}>
                {isRtl ? "قيد الانتظار" : "En attente"}
              </div>
            </div>
          </div>

          {/* Accepted */}
          <div
            onClick={() => setStatusFilter("ACCEPTED")}
            style={{
              ...glassCard,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              border: statusFilter === "ACCEPTED" ? "2px solid #059669" : "1px solid var(--border, #e2e8f0)",
              transition: "all 0.15s"
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#065f46", lineHeight: 1 }}>{metrics.accepted}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 700 }}>
                {isRtl ? "مقبولة / نشطة" : "Acceptées / Actives"}
              </div>
            </div>
          </div>

          {/* Rejected */}
          <div
            onClick={() => setStatusFilter("REJECTED")}
            style={{
              ...glassCard,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              border: statusFilter === "REJECTED" ? "2px solid #dc2626" : "1px solid var(--border, #e2e8f0)",
              transition: "all 0.15s"
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <XCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#991b1b", lineHeight: 1 }}>{metrics.rejected}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 700 }}>
                {isRtl ? "مرفوضة" : "Refusées"}
              </div>
            </div>
          </div>
        </div>

        {/* ── TOOLBAR: SEARCH & FILTERS ── */}
        <div style={{
          ...glassCard,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14
        }}>
          {/* Left: Search input */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 280px", maxWidth: 420, position: "relative" }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", [isRtl ? "right" : "left"]: 12 }} />
            <input
              type="text"
              placeholder={isRtl ? (isClinic ? "بحث باسم الطبيب، التخصص، أو الهاتف..." : "بحث باسم العيادة، العنوان، أو الهاتف...") : "Rechercher par nom, spécialité, tél..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                paddingInlineStart: 36,
                paddingInlineEnd: searchQuery ? 32 : 12,
                borderRadius: 12,
                border: "1.5px solid var(--border, #cbd5e1)",
                fontSize: 13,
                fontWeight: 600,
                color: "#0f172a",
                background: "var(--bg, #f8fafc)",
                outline: "none"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  [isRtl ? "left" : "right"]: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 2
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right: Direction + Status Tabs + View Mode */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Direction Filter */}
            <select
              value={directionFilter}
              onChange={e => setDirectionFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1.5px solid var(--border, #cbd5e1)",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#334155",
                background: "var(--card-bg, #fff)",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="ALL">{isRtl ? "جميع الاتجاهات" : "Toutes directions"}</option>
              <option value="RECEIVED">{isRtl ? "الواردة (تتطلب الإجراء)" : "Reçues (à traiter)"}</option>
              <option value="SENT">{isRtl ? "الصادرة (دعوات مرسلة)" : "Envoyées (invitations)"}</option>
            </select>

            {/* Status Pills */}
            <div style={{
              display: "flex",
              background: "var(--bg, #f1f5f9)",
              padding: 3,
              borderRadius: 12,
              gap: 4
            }}>
              {[
                { key: "ALL", label: isRtl ? "الكل" : "Tous", count: metrics.total },
                { key: "PENDING", label: isRtl ? "قيد الانتظار" : "En attente", count: metrics.pending },
                { key: "ACCEPTED", label: isRtl ? "مقبول" : "Acceptés", count: metrics.accepted },
                { key: "REJECTED", label: isRtl ? "مرفوض" : "Refusés", count: metrics.rejected }
              ].map(tab => {
                const isActive = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 9,
                      border: "none",
                      background: isActive ? "#0891b2" : "transparent",
                      color: isActive ? "#ffffff" : "#475569",
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.15s"
                    }}
                  >
                    <span>{tab.label}</span>
                    <span style={{
                      fontSize: 10.5,
                      padding: "1px 6px",
                      borderRadius: 10,
                      background: isActive ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                      color: isActive ? "#ffffff" : "#64748b"
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* View Mode Switcher */}
            <div style={{
              display: "flex",
              background: "var(--bg, #f1f5f9)",
              padding: 3,
              borderRadius: 10,
              gap: 2
            }}>
              <button
                onClick={() => setViewMode("table")}
                title={isRtl ? "عرض جدول عالي الكثافة" : "Mode tableau haute densité"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: viewMode === "table" ? "#ffffff" : "transparent",
                  color: viewMode === "table" ? "#0891b2" : "#64748b",
                  boxShadow: viewMode === "table" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                }}
              >
                <LayoutList size={16} />
              </button>

              <button
                onClick={() => setViewMode("cards")}
                title={isRtl ? "عرض البطاقات الشبكية" : "Mode grille de cartes"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: viewMode === "cards" ? "#ffffff" : "transparent",
                  color: viewMode === "cards" ? "#0891b2" : "#64748b",
                  boxShadow: viewMode === "cards" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENT: TABLE OR CARDS ── */}
        {loading ? (
          <div style={{ ...glassCard, padding: 60, textAlign: "center" }}>
            <Spinner size={36} />
            <div style={{ marginTop: 12, fontSize: 14, color: "#64748b" }}>
              {isRtl ? "جارٍ تحميل طلبات الانضمام..." : "Chargement des demandes..."}
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ ...glassCard, padding: "60px 20px", textAlign: "center" }}>
            <UserCheck size={48} color="#94a3b8" style={{ marginBottom: 12, opacity: 0.6 }} />
            <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: "#334155" }}>
              {isRtl ? "لا توجد أي طلبات تطابق الفلتر الحالي" : "Aucune demande ne correspond à ces critères"}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              {searchQuery || statusFilter !== "ALL" || directionFilter !== "ALL"
                ? (isRtl ? "جرب تغيير معايير البحث أو اختيار تبويب 'الكل'." : "Essayez de modifier votre recherche ou filtre.")
                : (isRtl ? "لا توجد طلبات انضمام مسجلة حتى الآن." : "Aucune demande d'affiliation enregistrée pour le moment.")}
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* ── 1. HIGH-DENSITY SCALABLE DATA TABLE VIEW ── */
          <div style={{ ...glassCard, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13, textAlign: isRtl ? "right" : "left" }}>
                <thead>
                  <tr style={{ background: "var(--bg, #f8fafc)", color: "#64748b", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)", width: 45, textAlign: "center" }}>#</th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>
                      {isClinic ? (isRtl ? "الطبيب والتخصص" : "Médecin & Spécialité") : (isRtl ? "العيادة" : "Clinique")}
                    </th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>
                      {isRtl ? "الاتصال والعنوان" : "Contact & Adresse"}
                    </th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)", width: 160 }}>
                      {isRtl ? "طبيعة الطلب" : "Direction du flux"}
                    </th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)", textAlign: "center", width: 140 }}>
                      {isRtl ? "الحالة" : "Statut"}
                    </th>
                    <th style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border, #e2e8f0)", textAlign: "center", width: 200 }}>
                      {isRtl ? "الإجراء" : "Action"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((r, idx) => {
                    const globalIdx = (page - 1) * limit + idx + 1;
                    const isReceived = isReceivedRequest(r);
                    const isProcessing = actionLoadingId === r.id;

                    return (
                      <tr
                        key={r.id}
                        style={{
                          background: r.status === "PENDING" && isReceived ? "rgba(8, 145, 178, 0.03)" : (idx % 2 === 0 ? "transparent" : "var(--bg, #fbfcfe)"),
                          borderBottom: "1px solid var(--border, #e2e8f0)",
                          transition: "background 0.15s"
                        }}
                      >
                        {/* Index */}
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #e2e8f0)", textAlign: "center", fontWeight: 800, color: "#64748b" }}>
                          {globalIdx}
                        </td>

                        {/* Target Doctor/Clinic */}
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: "rgba(8, 145, 178, 0.1)",
                              color: "#0891b2",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 900,
                              fontSize: 14,
                              flexShrink: 0
                            }}>
                              {r.targetname ? r.targetname.charAt(0).toUpperCase() : (isClinic ? "D" : "C")}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
                                {r.targetname}
                              </div>
                              {r.specialty_name && (
                                <div style={{ fontSize: 11, color: "#0891b2", fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                                  <Stethoscope size={11} />
                                  <span>{r.specialty_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact & Address */}
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                          {r.phone ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#0f172a", fontWeight: 700 }}>
                              <Phone size={12} color="#0891b2" />
                              <a href={`tel:${r.phone}`} style={{ color: "#0891b2", textDecoration: "none" }} dir="ltr">
                                {r.phone}
                              </a>
                              <button
                                onClick={() => copyToClipboard(r.phone, isRtl ? "الهاتف" : "Téléphone")}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}
                                title={isRtl ? "نسخ" : "Copier"}
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>—</div>
                          )}
                          {r.address && (
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.address}>
                              {r.address}
                            </div>
                          )}
                        </td>

                        {/* Direction / Type */}
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #e2e8f0)", whiteSpace: "nowrap" }}>
                          {isReceived ? (
                            <span style={{
                              background: "#ecfeff",
                              color: "#0e7490",
                              padding: "4px 8px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 800,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0891b2" }} />
                              {isClinic
                                ? (isRtl ? "طلب وارد من الطبيب" : "Demande reçue du médecin")
                                : (isRtl ? "دعوة واردة من العيادة" : "Invitation reçue de la clinique")}
                            </span>
                          ) : (
                            <span style={{
                              background: "#f1f5f9",
                              color: "#475569",
                              padding: "4px 8px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8" }} />
                              {isClinic
                                ? (isRtl ? "دعوة صادرة من العيادة" : "Invitation émise par la clinique")
                                : (isRtl ? "طلب صادر من الطبيب" : "Demande émise par le médecin")}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 16px", textAlign: "center", borderBottom: "1px solid var(--border, #e2e8f0)", whiteSpace: "nowrap" }}>
                          {r.status === "PENDING" && (
                            <span style={{
                              background: "#fef3c7",
                              color: "#b45309",
                              fontWeight: 800,
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 20,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              border: "1px solid #fde68a"
                            }}>
                              <Clock size={12} />
                              {isRtl ? "قيد الانتظار" : "En attente"}
                            </span>
                          )}
                          {r.status === "ACCEPTED" && (
                            <span style={{
                              background: "#dcfce7",
                              color: "#15803d",
                              fontWeight: 800,
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 20,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              border: "1px solid #bbf7d0"
                            }}>
                              <CheckCircle size={12} />
                              {isRtl ? "مقبول / نشط" : "Accepté / Actif"}
                            </span>
                          )}
                          {r.status === "REJECTED" && (
                            <span style={{
                              background: "#fee2e2",
                              color: "#b91c1c",
                              fontWeight: 800,
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 20,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              border: "1px solid #fecaca"
                            }}>
                              <XCircle size={12} />
                              {isRtl ? "مرفوض" : "Refusé"}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 16px", textAlign: "center", borderBottom: "1px solid var(--border, #e2e8f0)", whiteSpace: "nowrap" }}>
                          {isProcessing ? (
                            <Spinner size={16} />
                          ) : r.status === "PENDING" && isReceived ? (
                            <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                              <button
                                onClick={() => handleRespond(r.id, "ACCEPT")}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  border: "none",
                                  background: "#059669",
                                  color: "#ffffff",
                                  fontSize: 12,
                                  fontWeight: 800,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  boxShadow: "0 2px 6px rgba(5, 150, 105, 0.2)"
                                }}
                              >
                                <Check size={14} />
                                {isRtl ? "موافقة" : "Accepter"}
                              </button>
                              <button
                                onClick={() => handleRespond(r.id, "REJECT")}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  border: "1px solid #fecaca",
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  fontSize: 12,
                                  fontWeight: 800,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                              >
                                <X size={14} />
                                {isRtl ? "رفض" : "Refuser"}
                              </button>
                            </div>
                          ) : r.status === "PENDING" && !isReceived ? (
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                              {isRtl ? "بانتظار رد الطرف الآخر" : "En attente de réponse"}
                            </span>
                          ) : r.status === "ACCEPTED" ? (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>
                                {isRtl ? "ارتباط سارٍ" : "Affiliation active"}
                              </span>
                              {isClinic && (
                                <button
                                  onClick={() => navigate("/clinic/appointments")}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    border: "1px solid var(--border, #cbd5e1)",
                                    background: "var(--bg, #f8fafc)",
                                    color: "#0891b2",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer"
                                  }}
                                  title={isRtl ? "فتح الأجندة" : "Voir l'agenda"}
                                >
                                  {isRtl ? "الأجندة →" : "Agenda →"}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ── 2. CARDS GRID VIEW ── */
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16
          }}>
            {paginatedRequests.map((r) => {
              const isReceived = isReceivedRequest(r);
              const isProcessing = actionLoadingId === r.id;

              return (
                <div
                  key={r.id}
                  style={{
                    ...glassCard,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 14,
                    border: r.status === "PENDING" && isReceived ? "1.5px solid #0891b2" : "1px solid var(--border, #e2e8f0)"
                  }}
                >
                  {/* Card Header */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: "rgba(8, 145, 178, 0.1)",
                          color: "#0891b2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          fontSize: 16
                        }}>
                          {r.targetname ? r.targetname.charAt(0).toUpperCase() : (isClinic ? "D" : "C")}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 900, color: "#0f172a" }}>
                            {r.targetname}
                          </div>
                          {r.specialty_name && (
                            <div style={{ fontSize: 12, color: "#0891b2", fontWeight: 700, marginTop: 2 }}>
                              {r.specialty_name}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      {r.status === "PENDING" && (
                        <span style={{
                          background: "#fef3c7", color: "#b45309", fontWeight: 800, fontSize: 11,
                          padding: "3px 8px", borderRadius: 12, border: "1px solid #fde68a"
                        }}>
                          {isRtl ? "قيد الانتظار" : "En attente"}
                        </span>
                      )}
                      {r.status === "ACCEPTED" && (
                        <span style={{
                          background: "#dcfce7", color: "#15803d", fontWeight: 800, fontSize: 11,
                          padding: "3px 8px", borderRadius: 12, border: "1px solid #bbf7d0"
                        }}>
                          {isRtl ? "مقبول" : "Accepté"}
                        </span>
                      )}
                      {r.status === "REJECTED" && (
                        <span style={{
                          background: "#fee2e2", color: "#b91c1c", fontWeight: 800, fontSize: 11,
                          padding: "3px 8px", borderRadius: 12, border: "1px solid #fecaca"
                        }}>
                          {isRtl ? "مرفوض" : "Refusé"}
                        </span>
                      )}
                    </div>

                    {/* Metadata details */}
                    <div style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "var(--bg, #f8fafc)",
                      fontSize: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#64748b" }}>{isRtl ? "نوع الإشعار:" : "Type :"}</span>
                        <span style={{ fontWeight: 700, color: isReceived ? "#0891b2" : "#475569" }}>
                          {isReceived
                            ? (isClinic ? (isRtl ? "طلب انضمام وارد" : "Demande reçue") : (isRtl ? "دعوة عمل واردة" : "Invitation reçue"))
                            : (isClinic ? (isRtl ? "دعوة مرسلة" : "Invitation émise") : (isRtl ? "طلب انضمام مرسل" : "Demande émise"))}
                        </span>
                      </div>

                      {r.phone && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b" }}>{isRtl ? "الهاتف:" : "Téléphone :"}</span>
                          <span style={{ fontWeight: 700, color: "#0891b2" }} dir="ltr">
                            {r.phone}
                          </span>
                        </div>
                      )}

                      {r.address && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b" }}>{isRtl ? "العنوان:" : "Adresse :"}</span>
                          <span style={{ fontWeight: 600, color: "#334155", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.address}>
                            {r.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div>
                    {isProcessing ? (
                      <div style={{ textAlign: "center", padding: 8 }}><Spinner size={18} /></div>
                    ) : r.status === "PENDING" && isReceived ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleRespond(r.id, "ACCEPT")}
                          style={{
                            flex: 1,
                            padding: "9px 12px",
                            borderRadius: 10,
                            border: "none",
                            background: "#059669",
                            color: "#ffffff",
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6
                          }}
                        >
                          <Check size={16} />
                          {isRtl ? "موافقة" : "Accepter"}
                        </button>
                        <button
                          onClick={() => handleRespond(r.id, "REJECT")}
                          style={{
                            flex: 1,
                            padding: "9px 12px",
                            borderRadius: 10,
                            border: "1px solid #fecaca",
                            background: "#fef2f2",
                            color: "#dc2626",
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6
                          }}
                        >
                          <X size={16} />
                          {isRtl ? "رفض" : "Refuser"}
                        </button>
                      </div>
                    ) : r.status === "PENDING" && !isReceived ? (
                      <div style={{ textAlign: "center", fontSize: 12, color: "#64748b", padding: "8px 0", fontWeight: 700 }}>
                        {isRtl ? "بانتظار موافقة الطرف الآخر" : "En attente de réponse du destinataire"}
                      </div>
                    ) : r.status === "ACCEPTED" ? (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#059669", fontWeight: 800, display: "flex", alignItems: "center", gap: 5 }}>
                          <CheckCircle size={14} />
                          {isRtl ? "تم الاعتماد بنجاح" : "Affiliation active"}
                        </span>
                        {isClinic && (
                          <button
                            onClick={() => navigate("/clinic/appointments")}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#0891b2",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              textDecoration: "underline"
                            }}
                          >
                            {isRtl ? "فتح الأجندة ←" : "Voir l'agenda →"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", padding: "6px 0" }}>
                        {isRtl ? "طلب ملغى أو مرفوض" : "Demande rejetée ou annulée"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION BAR ── */}
        <SmartPaginationBar
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalItems={totalItems}
          totalPages={totalPages}
          limitOptions={[10, 20, 50, 100]}
          isRtl={isRtl}
          t={t}
        />

      </div>
    </div>
  );
}
