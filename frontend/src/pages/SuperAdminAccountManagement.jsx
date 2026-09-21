import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck, Shield, User, Stethoscope, Building2,
  Search, Filter, RefreshCw, Eye, Edit3, Snowflake,
  PlayCircle, LogOut, Key, Trash2, X, Check, Copy,
  AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Clock, Calendar, Smartphone, Mail, Globe, MapPin, Award,
  Users, Activity, Lock, AlertCircle, Info, Hash,
  Maximize2, Minimize2
} from "lucide-react";
import { Card, Btn, Input, Badge, Spinner, useToast } from "../components/SharedUI.jsx";
import { api as defaultApi } from "../api/client.js";

// Role configuration
export const ROLE_CONFIG = {
  0: { labelKey: "superadmin_role_patient", defaultLabel: "Patient", color: "#0891b2", bg: "#ecfeff", icon: User },
  1: { labelKey: "superadmin_role_doctor", defaultLabel: "Médecin", color: "#059669", bg: "#d1fae5", icon: Stethoscope },
  2: { labelKey: "superadmin_role_clinic", defaultLabel: "Clinique", color: "#7c3aed", bg: "#ede9fe", icon: Building2 },
  3: { labelKey: "superadmin_role_superadmin", defaultLabel: "SuperAdmin", color: "#dc2626", bg: "#fee2e2", icon: ShieldCheck },
  4: { labelKey: "superadmin_role_admin", defaultLabel: "Admin", color: "#d97706", bg: "#fef3c7", icon: Shield },
};

export default function SuperAdminAccountManagement({ navigate, user, qs, api: injectedApi }) {
  const { t, i18n } = useTranslation();
  const api = injectedApi || defaultApi;
  const { show, Toast } = useToast();
  const isAr = i18n.language === "ar";
  const isRtl = isAr;
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 850 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Verify SuperAdmin access
  useEffect(() => {
    if (user && Number(user.user_type) !== 3) {
      navigate("/");
    }
  }, [user, navigate]);

  // Filters & Pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Data state
  const [accounts, setAccounts] = useState([]);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [globalStats, setGlobalStats] = useState(null);

  // Modals state
  const [inspectModal, setInspectModal] = useState(null); // Account details
  const [inspectLoading, setInspectLoading] = useState(false);
  const [editModal, setEditModal] = useState(null); // Edit form: { id, username, email, phone }
  const [editErrors, setEditErrors] = useState({});
  const [freezeModal, setFreezeModal] = useState(null); // { id, name, isFrozen }
  const [freezeReason, setFreezeReason] = useState("");
  const [invalidateModal, setInvalidateModal] = useState(null); // { id, name, count }
  const [resetModal, setResetModal] = useState(null); // { id, name, email }
  const [anonymizeModal, setAnonymizeModal] = useState(null); // { id, name }
  const [anonymizeConfirmInput, setAnonymizeConfirmInput] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load Accounts list
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (debouncedSearch.trim()) params.q = debouncedSearch.trim();
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (periodFilter !== "all") params.period = periodFilter;

      const res = await api.superadmin.listAccounts(params);
      setAccounts(res.items || []);
      setTotalAccounts(res.total || 0);
      setTotalPages(res.total_pages || 1);
      if (res.stats) setGlobalStats(res.stats);
    } catch (err) {
      show(err.message || t("error_loading", "Erreur de chargement"), "error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, roleFilter, statusFilter, periodFilter, api, show, t]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(isAr ? "ar-DZ" : (i18n.language === "fr" ? "fr-FR" : "en-US"), {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  // Copy helper
  const copyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    show(t("admin_copy_success", { label, defaultValue: `Copié : ${label}` }), "success");
  };

  // Copy state for interactive row ID badge
  const [copiedId, setCopiedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Full width display toggle (persisted in localStorage)
  const [isFullWidth, setIsFullWidth] = useState(() => {
    try {
      return localStorage.getItem("tabibi_accounts_full_width") === "true";
    } catch {
      return false;
    }
  });

  const toggleFullWidth = () => {
    setIsFullWidth(prev => {
      const next = !prev;
      try {
        localStorage.setItem("tabibi_accounts_full_width", String(next));
      } catch {}
      return next;
    });
  };

  // Hovered row tracking for seamless sticky column styling
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleCopyId = (id) => {
    copyText(id, "ID");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Inspect account full details
  const openInspectModal = async (accId) => {
    setInspectLoading(true);
    setInspectModal({ id: accId });
    try {
      const res = await api.superadmin.getAccount(accId);
      setInspectModal(res);
    } catch (err) {
      show(err.message || "Erreur", "error");
      setInspectModal(null);
    } finally {
      setInspectLoading(false);
    }
  };

  // Toggle freeze/unfreeze
  const handleToggleFreeze = async () => {
    if (!freezeModal) return;
    const { id, isFrozen } = freezeModal;
    setActionLoading(`freeze_${id}`);
    try {
      const res = await api.superadmin.toggleStatus(id, {
        is_frozen: !isFrozen,
        freeze_reason: !isFrozen ? freezeReason : ""
      });
      show(res.message || t("success_update", "Statut mis à jour avec succès"), "success");
      setFreezeModal(null);
      setFreezeReason("");
      fetchAccounts();
      if (inspectModal && inspectModal.account?.id === id) {
        openInspectModal(id);
      }
    } catch (err) {
      show(err.message || "Erreur", "error");
    } finally {
      setActionLoading("");
    }
  };

  // Invalidate active sessions
  const handleInvalidateSessions = async () => {
    if (!invalidateModal) return;
    const { id } = invalidateModal;
    setActionLoading(`invalidate_${id}`);
    try {
      const res = await api.superadmin.invalidateSessions(id);
      show(res.message || t("sessions_invalidated", "Sessions invalidées avec succès"), "success");
      setInvalidateModal(null);
      fetchAccounts();
      if (inspectModal && inspectModal.account?.id === id) {
        openInspectModal(id);
      }
    } catch (err) {
      show(err.message || "Erreur", "error");
    } finally {
      setActionLoading("");
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!resetModal) return;
    const { id } = resetModal;
    setActionLoading(`reset_${id}`);
    try {
      const res = await api.superadmin.resetPassword(id);
      show(res.message || t("password_reset_success", "Mot de passe réinitialisé avec succès"), "success");
      setResetModal(null);
      fetchAccounts();
    } catch (err) {
      show(err.message || "Erreur", "error");
    } finally {
      setActionLoading("");
    }
  };

  // Anonymize account (Phase 02D)
  const handleAnonymize = async () => {
    if (!anonymizeModal) return;
    const { id } = anonymizeModal;
    setActionLoading(`anonymize_${id}`);
    try {
      const res = await api.superadmin.anonymize(id);
      show(res.message || t("account_anonymized", "Compte anonymisé avec succès"), "success");
      setAnonymizeModal(null);
      setAnonymizeConfirmInput("");
      fetchAccounts();
      if (inspectModal && inspectModal.account?.id === id) {
        setInspectModal(null);
      }
    } catch (err) {
      show(err.message || "Erreur", "error");
    } finally {
      setActionLoading("");
    }
  };

  // Save edit form
  const handleSaveEdit = async () => {
    if (!editModal) return;
    const { id, username, email, phone } = editModal;
    setActionLoading(`edit_${id}`);
    setEditErrors({});
    try {
      const res = await api.superadmin.updateAccount(id, { username, email, phone });
      show(res.message || t("saved_success", "Modifications enregistrées"), "success");
      setEditModal(null);
      fetchAccounts();
      if (inspectModal && inspectModal.account?.id === id) {
        openInspectModal(id);
      }
    } catch (err) {
      setEditErrors({ form: err.message });
      show(err.message || "Erreur", "error");
    } finally {
      setActionLoading("");
    }
  };

  // Status Badge Component
  const renderStatusBadge = (acc) => {
    if (acc.is_anonymized || acc.status === "deleted" || acc.status === "anonymized") {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
          borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5",
          whiteSpace: "nowrap"
        }}>
          <Trash2 size={12} /> {t("superadmin_status_anonymized", "Anonymisé")}
        </span>
      );
    }
    if (acc.is_frozen || acc.status === "frozen") {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
          borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#ffedd5", color: "#c2410c", border: "1px solid #fdba74",
          whiteSpace: "nowrap"
        }}>
          <Snowflake size={12} /> {t("superadmin_status_frozen", "Gelé")}
        </span>
      );
    }
    if (acc.status === "pending") {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
          borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a",
          whiteSpace: "nowrap"
        }}>
          <Clock size={12} /> {t("superadmin_stat_pending", "En attente")}
        </span>
      );
    }
    if (acc.is_active || acc.status === "active") {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
          borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7",
          whiteSpace: "nowrap"
        }}>
          <Check size={12} /> {t("superadmin_status_active", "Actif")}
        </span>
      );
    }
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
        borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1",
        whiteSpace: "nowrap"
      }}>
        <Clock size={12} /> {t("superadmin_status_inactive", "Inactif")}
      </span>
    );
  };

  // Role Badge Component
  const renderRoleBadge = (roleId) => {
    const rNum = Number(roleId);
    const config = ROLE_CONFIG[rNum] || { defaultLabel: `Rôle ${roleId ?? ""}`, color: "#64748b", bg: "#f1f5f9", icon: User };
    const Icon = config.icon;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
        borderRadius: 8, fontSize: 12, fontWeight: 800, background: config.bg, color: config.color,
        whiteSpace: "nowrap"
      }}>
        <Icon size={14} /> {config.labelKey ? t(config.labelKey, config.defaultLabel) : config.defaultLabel}
      </span>
    );
  };

  return (
    <div style={{
      maxWidth: isFullWidth ? "100%" : 1200,
      margin: "0 auto",
      padding: isMobile ? "16px 12px 60px" : (isFullWidth ? "20px 32px 60px" : "24px 24px 60px"),
      minHeight: "85vh",
      direction: isRtl ? "rtl" : "ltr",
      transition: "max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
    }}>
      <Toast />

      {/* ── HEADER BANNER ── */}
      <div className="no-print" style={{
        background: "linear-gradient(135deg, rgb(14, 116, 144) 0%, rgb(8, 145, 178) 100%)",
        borderRadius: 24,
        padding: isMobile ? "20px 18px" : "28px 32px",
        color: "#ffffff",
        boxShadow: "rgba(8, 145, 178, 0.25) 0px 10px 30px -5px",
        marginBottom: 24,
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
              <ShieldCheck size={32} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900, letterSpacing: "-0.02em" }}>
                  {t("superadmin_account_management_title", "Gestion des comptes")}
                </h1>
                <span style={{
                  background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20,
                  fontSize: 12, fontWeight: 800, backdropFilter: "blur(4px)"
                }}>
                  {totalAccounts.toLocaleString()} {t("superadmin_all_accounts", "comptes")}
                </span>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.9, fontWeight: 500 }}>
                {t("superadmin_account_management_subtitle", "SuperAdmin : Contrôle centralisé et sécurisé de tous les comptes TABIBI")}
              </p>
            </div>
          </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/* Full Width / Standard Width Toggle */}
          <button
            onClick={toggleFullWidth}
            title={isFullWidth ? t("superadmin_standard_width", "Largeur standard (1200px)") : t("superadmin_full_width", "Plein écran")}
            style={{
              padding: "10px 16px", borderRadius: 12,
              background: isFullWidth ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.18)",
              border: isFullWidth ? "1.5px solid rgba(255,255,255,0.6)" : "1px solid rgba(255,255,255,0.3)",
              color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              boxShadow: isFullWidth ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = isFullWidth ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.28)"}
            onMouseLeave={e => e.currentTarget.style.background = isFullWidth ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.18)"}
          >
            {isFullWidth ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullWidth ? t("superadmin_standard_width", "Largeur standard") : t("superadmin_full_width", "Plein écran")}
          </button>

          <button
            onClick={() => navigate("/admin")}
            style={{
              padding: "10px 18px", borderRadius: 12, background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
          >
            <Shield size={16} />
            {t("admin_panel", "لوحة الإدارة")}
          </button>
          <button
            onClick={fetchAccounts}
            disabled={loading}
            style={{
              padding: "10px 18px", borderRadius: 12, background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
          >
            <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            {t("refresh", "Actualiser")}
          </button>
        </div>
      </div>
    </div>

      {/* ── STATS SUMMARY CARDS ROW ── */}
      {globalStats && (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, minmax(0, 1fr))",
          gap: 16,
          marginBottom: 24
        }}>
          {/* 1. Doctors Card */}
          <div
            onClick={() => { setRoleFilter(roleFilter === "1" ? "all" : "1"); setPage(1); }}
            style={{
              background: "var(--card-bg, #ffffff)",
              borderRadius: 16,
              padding: "18px 20px",
              border: roleFilter === "1" ? "2px solid #059669" : "1px solid var(--border, #e2e8f0)",
              boxShadow: roleFilter === "1" ? "0 8px 20px -4px rgba(5, 150, 105, 0.25)" : "0 2px 8px rgba(0,0,0,0.03)",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 24px -4px rgba(5, 150, 105, 0.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = roleFilter === "1" ? "0 8px 20px -4px rgba(5, 150, 105, 0.25)" : "0 2px 8px rgba(0,0,0,0.03)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", gap: 6 }}>
                  <Stethoscope size={16} /> {t("superadmin_stat_doctors", "Médecins")}
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#064e3b", marginTop: 4, lineHeight: 1 }}>
                  {globalStats.doctors.total.toLocaleString()}
                </div>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: "#ecfdf5",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#059669"
              }}>
                <Stethoscope size={22} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid var(--border, #f1f5f9)" }}>
              <span
                onClick={(e) => { e.stopPropagation(); setRoleFilter("1"); setStatusFilter("active"); setPage(1); }}
                style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                  background: statusFilter === "active" && roleFilter === "1" ? "#059669" : "#d1fae5",
                  color: statusFilter === "active" && roleFilter === "1" ? "#ffffff" : "#065f46",
                  display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s"
                }}
                title={t("superadmin_stat_approved", "Approuvés / Actifs")}
              >
                <Check size={11} /> {globalStats.doctors.approved.toLocaleString()} {t("superadmin_stat_approved", "Approuvés")}
              </span>
              {globalStats.doctors.pending > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); setRoleFilter("1"); setStatusFilter("pending"); setPage(1); }}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                    background: statusFilter === "pending" && roleFilter === "1" ? "#d97706" : "#fef3c7",
                    color: statusFilter === "pending" && roleFilter === "1" ? "#ffffff" : "#92400e",
                    display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s"
                  }}
                  title={t("superadmin_stat_pending", "En attente")}
                >
                  <Clock size={11} /> {globalStats.doctors.pending} {t("superadmin_stat_pending", "En attente")}
                </span>
              )}
              {globalStats.doctors.frozen > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); setRoleFilter("1"); setStatusFilter("frozen"); setPage(1); }}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                    background: statusFilter === "frozen" && roleFilter === "1" ? "#ea580c" : "#ffedd5",
                    color: statusFilter === "frozen" && roleFilter === "1" ? "#ffffff" : "#c2410c",
                    display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s"
                  }}
                  title={t("superadmin_stat_frozen", "Gelés")}
                >
                  <Snowflake size={11} /> {globalStats.doctors.frozen} {t("superadmin_stat_frozen", "Gelés")}
                </span>
              )}
            </div>
          </div>

          {/* 2. Patients Card */}
          <div
            onClick={() => { setRoleFilter(roleFilter === "0" ? "all" : "0"); setPage(1); }}
            style={{
              background: "var(--card-bg, #ffffff)",
              borderRadius: 16,
              padding: "18px 20px",
              border: roleFilter === "0" ? "2px solid #0891b2" : "1px solid var(--border, #e2e8f0)",
              boxShadow: roleFilter === "0" ? "0 8px 20px -4px rgba(8, 145, 178, 0.25)" : "0 2px 8px rgba(0,0,0,0.03)",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 24px -4px rgba(8, 145, 178, 0.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = roleFilter === "0" ? "0 8px 20px -4px rgba(8, 145, 178, 0.25)" : "0 2px 8px rgba(0,0,0,0.03)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0891b2", display: "flex", alignItems: "center", gap: 6 }}>
                  <User size={16} /> {t("superadmin_stat_patients", "Patients")}
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "var(--brand-dark, #0e7490)", marginTop: 4, lineHeight: 1 }}>
                  {globalStats.patients.total.toLocaleString()}
                </div>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: "#cffafe",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#0891b2"
              }}>
                <User size={22} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid var(--border, #f1f5f9)" }}>
              <span
                onClick={(e) => { e.stopPropagation(); setRoleFilter("0"); setStatusFilter("active"); setPage(1); }}
                style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                  background: statusFilter === "active" && roleFilter === "0" ? "#0891b2" : "#d1fae5",
                  color: statusFilter === "active" && roleFilter === "0" ? "#ffffff" : "#065f46",
                  display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s"
                }}
              >
                <Check size={11} /> {globalStats.patients.active} {t("superadmin_stat_active", "Actifs")}
              </span>
              {globalStats.patients.inactive > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); setRoleFilter("0"); setStatusFilter("inactive"); setPage(1); }}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                    background: statusFilter === "inactive" && roleFilter === "0" ? "#d97706" : "#fef3c7",
                    color: statusFilter === "inactive" && roleFilter === "0" ? "#ffffff" : "#92400e",
                    display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s"
                  }}
                  title={t("superadmin_stat_inactive", "Inactifs")}
                >
                  <AlertCircle size={11} /> {globalStats.patients.inactive} {t("superadmin_stat_inactive", "Inactifs")}
                </span>
              )}
              {globalStats.patients.frozen > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); setRoleFilter("0"); setStatusFilter("frozen"); setPage(1); }}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                    background: statusFilter === "frozen" && roleFilter === "0" ? "#ea580c" : "#ffedd5",
                    color: statusFilter === "frozen" && roleFilter === "0" ? "#ffffff" : "#c2410c",
                    display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s"
                  }}
                >
                  <Snowflake size={11} /> {globalStats.patients.frozen} {t("superadmin_stat_frozen", "Gelés")}
                </span>
              )}
              {globalStats.patients.deleted > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); setRoleFilter("0"); setStatusFilter("anonymized"); setPage(1); }}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                    background: statusFilter === "anonymized" && roleFilter === "0" ? "#dc2626" : "#fee2e2",
                    color: statusFilter === "anonymized" && roleFilter === "0" ? "#ffffff" : "#b91c1c",
                    display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s"
                  }}
                >
                  <Trash2 size={11} /> {globalStats.patients.deleted} {t("superadmin_stat_deleted", "Supprimés")}
                </span>
              )}
            </div>
          </div>

          {/* 3. Clinics Card */}
          <div
            onClick={() => { setRoleFilter(roleFilter === "2" ? "all" : "2"); setPage(1); }}
            style={{
              background: "var(--card-bg, #ffffff)",
              borderRadius: 16,
              padding: "18px 20px",
              border: roleFilter === "2" ? "2px solid #7c3aed" : "1px solid var(--border, #e2e8f0)",
              boxShadow: roleFilter === "2" ? "0 8px 20px -4px rgba(124, 58, 237, 0.25)" : "0 2px 8px rgba(0,0,0,0.03)",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 24px -4px rgba(124, 58, 237, 0.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = roleFilter === "2" ? "0 8px 20px -4px rgba(124, 58, 237, 0.25)" : "0 2px 8px rgba(0,0,0,0.03)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", display: "flex", alignItems: "center", gap: 6 }}>
                  <Building2 size={16} /> {t("superadmin_stat_clinics", "Cliniques")}
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#4c1d95", marginTop: 4, lineHeight: 1 }}>
                  {globalStats.clinics.total.toLocaleString()}
                </div>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: "#ede9fe",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed"
              }}>
                <Building2 size={22} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid var(--border, #f1f5f9)" }}>
              <span
                onClick={(e) => { e.stopPropagation(); setRoleFilter("2"); setStatusFilter("active"); setPage(1); }}
                style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                  background: statusFilter === "active" && roleFilter === "2" ? "#7c3aed" : "#d1fae5",
                  color: statusFilter === "active" && roleFilter === "2" ? "#ffffff" : "#065f46",
                  display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s"
                }}
              >
                <Check size={11} /> {globalStats.clinics.approved} {t("superadmin_stat_approved", "Approuvées")}
              </span>
              {globalStats.clinics.pending > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); setRoleFilter("2"); setStatusFilter("pending"); setPage(1); }}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                    background: statusFilter === "pending" && roleFilter === "2" ? "#d97706" : "#fef3c7",
                    color: statusFilter === "pending" && roleFilter === "2" ? "#ffffff" : "#92400e",
                    display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s"
                  }}
                >
                  <Clock size={11} /> {globalStats.clinics.pending} {t("superadmin_stat_pending", "En attente")}
                </span>
              )}
              {globalStats.clinics.frozen > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); setRoleFilter("2"); setStatusFilter("frozen"); setPage(1); }}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                    background: statusFilter === "frozen" && roleFilter === "2" ? "#ea580c" : "#ffedd5",
                    color: statusFilter === "frozen" && roleFilter === "2" ? "#ffffff" : "#c2410c",
                    display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s"
                  }}
                >
                  <Snowflake size={11} /> {globalStats.clinics.frozen} {t("superadmin_stat_frozen", "Gelées")}
                </span>
              )}
            </div>
          </div>

          {/* 4. Sessions & Platform Activity Card */}
          <div
            onClick={() => {
              if (statusFilter === "active" && roleFilter === "all") {
                setStatusFilter("all");
              } else {
                setRoleFilter("all");
                setStatusFilter("active");
              }
              setPage(1);
            }}
            style={{
              background: "var(--card-bg, #ffffff)",
              borderRadius: 16,
              padding: "18px 20px",
              border: statusFilter === "active" && roleFilter === "all" ? "2px solid #0d9488" : "1px solid var(--border, #e2e8f0)",
              boxShadow: statusFilter === "active" && roleFilter === "all" ? "0 8px 20px -4px rgba(13, 148, 136, 0.25)" : "0 2px 8px rgba(0,0,0,0.03)",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 24px -4px rgba(13, 148, 136, 0.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = statusFilter === "active" && roleFilter === "all" ? "0 8px 20px -4px rgba(13, 148, 136, 0.25)" : "0 2px 8px rgba(0,0,0,0.03)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0d9488", display: "flex", alignItems: "center", gap: 6 }}>
                  <Activity size={16} /> {t("superadmin_stat_sessions", "Sessions & Connexions")}
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#134e4a", marginTop: 4, lineHeight: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  {globalStats.sessions.total_active.toLocaleString()}
                  <span style={{ position: "relative", display: "flex", width: 10, height: 10 }}>
                    <span style={{
                      position: "absolute", width: "100%", height: "100%",
                      borderRadius: "50%", background: "#10b981", opacity: 0.75,
                      animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
                    }} />
                    <span style={{ position: "relative", borderRadius: "50%", width: 10, height: 10, background: "#059669" }} />
                  </span>
                </div>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: "#f0fdfa",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#0d9488"
              }}>
                <Activity size={22} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid var(--border, #f1f5f9)" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                background: "#ccfbf1", color: "#115e59", display: "inline-flex", alignItems: "center", gap: 4
              }}>
                <Users size={11} /> {globalStats.sessions.users_active} {t("superadmin_stat_active_users", "Connectés")}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                background: "#f1f5f9", color: "#475569", display: "inline-flex", alignItems: "center", gap: 4
              }}
              title={t("superadmin_stat_total_users", "Total comptes")}
              >
                <Users size={11} /> {globalStats.total_users?.toLocaleString()} {t("superadmin_stat_total_users", "Comptes")}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                background: "#fef3c7", color: "#92400e", display: "inline-flex", alignItems: "center", gap: 4
              }}>
                <Shield size={11} /> {globalStats.admins.superadmin + globalStats.admins.staff} {t("superadmin_stat_admins", "Admins")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER & SEARCH TOOLBAR (COMPACT SINGLE LINE) ── */}
      <div style={{
        background: "var(--card-bg, #ffffff)", borderRadius: 14, border: "1px solid var(--border, #e2e8f0)",
        padding: "10px 14px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap"
      }}>
        {/* Search bar */}
        <div style={{ position: "relative", flex: "2 1 220px", minWidth: 180 }}>
          <Search size={15} style={{
            position: "absolute", top: "50%", transform: "translateY(-50%)",
            [isRtl ? "right" : "left"]: 12, color: "#94a3b8", pointerEvents: "none"
          }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("superadmin_search_placeholder", "Rechercher par nom, username, email, téléphone...")}
            style={{
              width: "100%", height: 38,
              padding: "0 12px",
              [isRtl ? "paddingRight" : "paddingLeft"]: 34,
              [isRtl ? "paddingLeft" : "paddingRight"]: search ? 30 : 12,
              border: "1.5px solid var(--border, #e2e8f0)", borderRadius: 10,
              fontSize: 13, outline: "none", background: "var(--bg, #f8fafc)",
              color: "var(--text-main, #0f172a)", boxSizing: "border-box",
              transition: "border-color 0.15s"
            }}
            onFocus={e => e.target.style.borderColor = "var(--brand, #0891b2)"}
            onBlur={e => e.target.style.borderColor = "var(--border, #e2e8f0)"}
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setDebouncedSearch(""); setPage(1); }}
              style={{
                position: "absolute", top: "50%", transform: "translateY(-50%)",
                [isRtl ? "left" : "right"]: 10, background: "none", border: "none",
                cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: 0
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <div style={{ flex: "1 1 130px", minWidth: 125 }}>
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            title={t("superadmin_filter_role", "Rôle")}
            style={{
              width: "100%", height: 38, padding: "0 10px", borderRadius: 10,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: roleFilter !== "all" ? "#ecfeff" : "var(--bg, #f8fafc)",
              color: roleFilter !== "all" ? "#0891b2" : "var(--text-main, #0f172a)",
              fontSize: 12.5, fontWeight: 700, outline: "none", cursor: "pointer",
              boxSizing: "border-box"
            }}
          >
            <option value="all">{t("admin_subtab_all", "Tous les rôles")}</option>
            <option value="0">{t("superadmin_role_patient", "Patient")}</option>
            <option value="1">{t("superadmin_role_doctor", "Médecin")}</option>
            <option value="2">{t("superadmin_role_clinic", "Clinique")}</option>
            <option value="3">{t("superadmin_role_superadmin", "SuperAdmin")}</option>
            <option value="4">{t("superadmin_role_admin", "Admin")}</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ flex: "1 1 130px", minWidth: 125 }}>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            title={t("superadmin_filter_status", "Statut")}
            style={{
              width: "100%", height: 38, padding: "0 10px", borderRadius: 10,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: statusFilter !== "all" ? "#f0fdf4" : "var(--bg, #f8fafc)",
              color: statusFilter !== "all" ? "#15803d" : "var(--text-main, #0f172a)",
              fontSize: 12.5, fontWeight: 700, outline: "none", cursor: "pointer",
              boxSizing: "border-box"
            }}
          >
            <option value="all">{t("admin_support_filter_all", "Tous les statuts")}</option>
            <option value="active">{t("superadmin_status_active", "Actif")}</option>
            <option value="inactive">{t("superadmin_status_inactive", "Inactif")}</option>
            <option value="pending">{t("superadmin_stat_pending", "En attente")}</option>
            <option value="frozen">{t("superadmin_status_frozen", "Gelé")}</option>
            <option value="anonymized">{t("superadmin_status_anonymized", "Anonymisé / Supprimé")}</option>
          </select>
        </div>

        {/* Period Filter */}
        <div style={{ flex: "1 1 130px", minWidth: 125 }}>
          <select
            value={periodFilter}
            onChange={e => { setPeriodFilter(e.target.value); setPage(1); }}
            title={t("superadmin_filter_period", "Période de création")}
            style={{
              width: "100%", height: 38, padding: "0 10px", borderRadius: 10,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: periodFilter !== "all" ? "#faf5ff" : "var(--bg, #f8fafc)",
              color: periodFilter !== "all" ? "#7e22ce" : "var(--text-main, #0f172a)",
              fontSize: 12.5, fontWeight: 700, outline: "none", cursor: "pointer",
              boxSizing: "border-box"
            }}
          >
            <option value="all">{t("admin_subtab_all", "Toute la période")}</option>
            <option value="today">{t("period_today", "Aujourd'hui")}</option>
            <option value="week">{t("period_week", "7 derniers jours")}</option>
            <option value="month">{t("period_month", "30 derniers jours")}</option>
            <option value="year">{t("period_year", "Cette année")}</option>
          </select>
        </div>

        {/* Inline Reset Button */}
        {(debouncedSearch || roleFilter !== "all" || statusFilter !== "all" || periodFilter !== "all") && (
          <button
            onClick={() => {
              setSearch(""); setDebouncedSearch("");
              setRoleFilter("all"); setStatusFilter("all"); setPeriodFilter("all");
              setPage(1);
            }}
            title={t("reset_filters", "Réinitialiser les filtres")}
            style={{
              height: 38, padding: "0 12px", borderRadius: 10,
              border: "1px solid #fecaca", background: "#fff1f2", color: "#dc2626",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 5,
              whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff1f2"}
          >
            <X size={14} />
            <span>{t("reset_filters", "Réinitialiser")}</span>
          </button>
        )}
      </div>

      {/* ── ACCOUNTS TABLE ── */}
      <div style={{
        background: "var(--card-bg, #ffffff)", borderRadius: 16, border: "1px solid var(--border, #e2e8f0)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)", overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: "80px 20px", textAlign: "center" }}>
            <Spinner size={36} />
            <div style={{ marginTop: 14, fontSize: 14, color: "#64748b", fontWeight: 600 }}>
              {t("loading_accounts", "Chargement des comptes...")}
            </div>
          </div>
        ) : accounts.length === 0 ? (
          <div style={{ padding: "80px 20px", textAlign: "center" }}>
            <Users size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#334155" }}>
              {t("no_accounts_found", "Aucun compte trouvé")}
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
              {t("no_accounts_found_desc", "Essayez d'ajuster votre recherche ou vos critères de filtrage.")}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", position: "relative" }}>
            <table style={{ width: "100%", minWidth: 1180, borderCollapse: "separate", borderSpacing: 0, textAlign: isRtl ? "right" : "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg, #f8fafc)", color: "#64748b", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
                  <th style={{ padding: "12px 16px", width: 75, minWidth: 75, whiteSpace: "nowrap", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>{t("id_number", "# ID")}</th>
                  <th style={{ padding: "12px 16px", width: 220, minWidth: 200, whiteSpace: "nowrap", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>{t("account", "Compte / Profil")}</th>
                  <th style={{ padding: "12px 16px", width: 130, minWidth: 120, whiteSpace: "nowrap", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>{t("role", "Rôle")}</th>
                  <th style={{ padding: "12px 16px", width: 130, minWidth: 120, whiteSpace: "nowrap", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>{t("status", "Statut")}</th>
                  <th style={{ padding: "12px 16px", width: 180, minWidth: 160, whiteSpace: "nowrap", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>{t("contact", "Contact")}</th>
                  <th style={{ padding: "12px 16px", width: 140, minWidth: 130, textAlign: "center", whiteSpace: "nowrap", borderBottom: "1.5px solid var(--border, #e2e8f0)" }}>{t("superadmin_active_sessions", "Sessions")}</th>
                  <th style={{ padding: "12px 16px", width: 140, minWidth: 130, borderBottom: "1.5px solid var(--border, #e2e8f0)", whiteSpace: "nowrap" }}>{t("superadmin_created_at", "Créé le")}</th>
                  <th style={{ padding: "12px 16px", width: 140, minWidth: 130, borderBottom: "1.5px solid var(--border, #e2e8f0)", whiteSpace: "nowrap" }}>{t("superadmin_last_activity", "Dernière activité")}</th>
                  <th style={{
                    padding: "12px 16px",
                    width: 220,
                    minWidth: 220,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    borderBottom: "1.5px solid var(--border, #e2e8f0)",
                    position: "sticky",
                    [isRtl ? "left" : "right"]: 0,
                    zIndex: 10,
                    background: "var(--bg, #f8fafc)",
                    boxShadow: isRtl ? "4px 0 8px -2px rgba(0,0,0,0.06)" : "-4px 0 8px -2px rgba(0,0,0,0.06)"
                  }}>{t("actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc, idx) => {
                  const isSelf = Number(acc.id) === Number(user?.id);
                  const isTargetSuperAdmin = Number(acc.usertype ?? acc.user_type) === 3;
                  return (
                    <tr
                      key={acc.id}
                      style={{
                        background: hoveredRow === acc.id ? "var(--bg, #f1f5f9)" : (idx % 2 === 0 ? "transparent" : "var(--bg, #fbfcfe)"),
                        transition: "background 0.15s"
                      }}
                      onMouseEnter={() => setHoveredRow(acc.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* ID */}
                      <td style={{ padding: "14px 16px", width: 75, minWidth: 75, whiteSpace: "nowrap", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyId(acc.id);
                          }}
                          onMouseEnter={() => setHoveredId(acc.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          title={`${acc.id} (${t("click_to_copy_id", "Cliquer pour copier l'ID")})`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: 8,
                            background: copiedId === acc.id ? "#dcfce7" : (hoveredId === acc.id ? "#f1f5f9" : "var(--bg, #f8fafc)"),
                            color: copiedId === acc.id ? "#15803d" : "#475569",
                            fontWeight: 800,
                            fontSize: 12,
                            fontFamily: "monospace",
                            border: copiedId === acc.id ? "1.5px solid #86efac" : (hoveredId === acc.id ? "1.5px solid #cbd5e1" : "1px solid var(--border, #e2e8f0)"),
                            boxShadow: hoveredId === acc.id ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                            transition: "all 0.15s ease",
                            position: "relative",
                            userSelect: "none"
                          }}
                        >
                          <span>#{(page - 1) * limit + idx + 1}</span>
                          {copiedId === acc.id ? (
                            <Check size={12} color="#16a34a" />
                          ) : (
                            <Copy size={11} style={{ opacity: hoveredId === acc.id ? 0.9 : 0.4, transition: "opacity 0.15s" }} />
                          )}

                          {/* Floating Hover Tooltip */}
                          {hoveredId === acc.id && (
                            <div style={{
                              position: "absolute",
                              bottom: "calc(100% + 6px)",
                              [isRtl ? "right" : "left"]: 0,
                              zIndex: 100,
                              background: "#0f172a",
                              color: "#f8fafc",
                              padding: "6px 10px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontFamily: "monospace",
                              whiteSpace: "nowrap",
                              boxShadow: "0 10px 25px -4px rgba(0,0,0,0.4)",
                              pointerEvents: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: 8
                            }}>
                              <span>{acc.id}</span>
                              <span style={{
                                color: copiedId === acc.id ? "#4ade80" : "#38bdf8",
                                fontSize: 10,
                                fontFamily: "sans-serif",
                                fontWeight: 700,
                                background: "rgba(255,255,255,0.1)",
                                padding: "1px 6px",
                                borderRadius: 4
                              }}>
                                {copiedId === acc.id ? t("id_copied", "ID copié !") : t("click_to_copy_id", "Cliquer pour copier")}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* User Display */}
                      <td style={{ padding: "14px 16px", width: 220, minWidth: 200, borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: ROLE_CONFIG[Number(acc.usertype ?? acc.user_type)]?.bg || "#f1f5f9",
                            color: ROLE_CONFIG[Number(acc.usertype ?? acc.user_type)]?.color || "#64748b",
                            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0
                          }}>
                            {acc.display_name ? acc.display_name.charAt(0).toUpperCase() : acc.username.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ overflow: "hidden" }}>
                            <div style={{ fontWeight: 800, color: "var(--text-main, #0f172a)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }} title={acc.display_name || acc.username}>
                              {acc.display_name || acc.username}
                              {isSelf && (
                                <span style={{ fontSize: 10, background: "#ecfeff", color: "#0891b2", border: "1px solid #cffafe", borderRadius: 6, padding: "1px 6px", fontWeight: 800, flexShrink: 0 }}>
                                  {t("you", "Vous")}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginTop: 2, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }} title={`@${acc.username}`}>
                              @{acc.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: "14px 16px", width: 130, minWidth: 120, borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                        {renderRoleBadge(acc.usertype ?? acc.user_type)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px", width: 130, minWidth: 120, borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                        {renderStatusBadge(acc)}
                      </td>

                      {/* Contact */}
                      <td style={{ padding: "14px 16px", width: 180, minWidth: 160, maxWidth: 200, borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: "100%" }}>
                          {acc.email && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#334155" }}>
                              <Mail size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
                              <span style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={acc.email}>
                                {acc.email}
                              </span>
                              <button onClick={() => copyText(acc.email, "Email")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "inline-flex" }} title="Copier">
                                <Copy size={11} />
                              </button>
                            </div>
                          )}
                          {acc.phone && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#334155" }}>
                              <Smartphone size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
                              <span dir="ltr" style={{ fontWeight: 600 }}>{acc.phone}</span>
                              <button onClick={() => copyText(acc.phone, "Téléphone")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "inline-flex" }} title="Copier">
                                <Copy size={11} />
                              </button>
                            </div>
                          )}
                          {!acc.email && !acc.phone && <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>}
                        </div>
                      </td>

                      {/* Active Sessions */}
                      <td style={{ padding: "14px 16px", width: 140, minWidth: 130, textAlign: "center", whiteSpace: "nowrap", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: acc.active_sessions_count > 0 ? "#10b981" : "#cbd5e1"
                          }} />
                          <span style={{ fontWeight: 700, color: acc.active_sessions_count > 0 ? "#065f46" : "#64748b" }}>
                            {acc.active_sessions_count}
                          </span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td style={{ padding: "14px 16px", width: 140, minWidth: 130, color: "#64748b", fontSize: 12, whiteSpace: "nowrap", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                        {formatDate(acc.created_at)}
                      </td>

                      {/* Last Activity */}
                      <td style={{ padding: "14px 16px", width: 140, minWidth: 130, color: "#64748b", fontSize: 12, whiteSpace: "nowrap", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                        {acc.last_activity ? (
                          <span style={{ color: "#0c4a6e", fontWeight: 600 }}>{formatDate(acc.last_activity)}</span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>{t("superadmin_no_activity", "Aucune")}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{
                        padding: "12px 14px",
                        textAlign: "center",
                        width: 220,
                        minWidth: 220,
                        position: "sticky",
                        [isRtl ? "left" : "right"]: 0,
                        zIndex: 5,
                        background: hoveredRow === acc.id ? "var(--bg, #f1f5f9)" : (idx % 2 === 0 ? "var(--card-bg, #ffffff)" : "var(--bg, #fbfcfe)"),
                        boxShadow: isRtl ? "4px 0 8px -2px rgba(0,0,0,0.06)" : "-4px 0 8px -2px rgba(0,0,0,0.06)",
                        borderBottom: "1px solid var(--border, #e2e8f0)",
                        transition: "background 0.15s"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "nowrap" }}>
                          {/* Inspect / View Profile */}
                          <button
                            onClick={() => openInspectModal(acc.id)}
                            title={t("superadmin_inspect_account", "Consulter la fiche")}
                            style={{
                              width: 32, height: 32, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                              borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
                              background: "var(--card-bg, #ffffff)", color: "var(--brand, #0891b2)", cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--brand, #0891b2)"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border, #e2e8f0)"}
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit info */}
                          <button
                            onClick={() => {
                              setEditModal({ id: acc.id, username: acc.username, email: acc.email || "", phone: acc.phone || "" });
                              setEditErrors({});
                            }}
                            title={t("superadmin_edit_info", "Modifier informations")}
                            style={{
                              width: 32, height: 32, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                              borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
                              background: "var(--card-bg, #ffffff)", color: "#475569", cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "#64748b"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border, #e2e8f0)"}
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Freeze / Unfreeze */}
                          <button
                            onClick={() => {
                              setFreezeModal({
                                id: acc.id,
                                name: acc.display_name || acc.username,
                                isFrozen: !!acc.is_frozen
                              });
                              setFreezeReason(acc.freeze_reason || "");
                            }}
                            disabled={isSelf}
                            title={isSelf ? t("cannot_freeze_self", "Impossible de geler votre propre compte") : (acc.is_frozen ? t("superadmin_unfreeze_account", "Dégeler") : t("superadmin_freeze_account", "Geler"))}
                            style={{
                              width: 32, height: 32, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                              borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
                              background: acc.is_frozen ? "#ffedd5" : "var(--card-bg, #ffffff)",
                              color: isSelf ? "#cbd5e1" : (acc.is_frozen ? "#c2410c" : "#ea580c"),
                              cursor: isSelf ? "not-allowed" : "pointer",
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={e => !isSelf && (e.currentTarget.style.borderColor = "#ea580c")}
                            onMouseLeave={e => !isSelf && (e.currentTarget.style.borderColor = "var(--border, #e2e8f0)" )}
                          >
                            {acc.is_frozen ? <PlayCircle size={15} /> : <Snowflake size={15} />}
                          </button>

                          {/* Invalidate Sessions */}
                          <button
                            onClick={() => setInvalidateModal({ id: acc.id, name: acc.display_name || acc.username, count: acc.active_sessions_count })}
                            title={t("superadmin_invalidate_sessions", "Invalider les sessions")}
                            style={{
                              width: 32, height: 32, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                              borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
                              background: "var(--card-bg, #ffffff)", color: "#b91c1c", cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "#b91c1c"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border, #e2e8f0)"}
                          >
                            <LogOut size={15} />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => setResetModal({ id: acc.id, name: acc.display_name || acc.username, email: acc.email })}
                            title={t("superadmin_reset_password", "Réinitialiser mot de passe")}
                            style={{
                              width: 32, height: 32, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                              borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
                              background: "var(--card-bg, #ffffff)", color: "#6366f1", cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border, #e2e8f0)"}
                          >
                            <Key size={15} />
                          </button>

                          {/* Anonymize (Patients only & not self) */}
                          {Number(acc.usertype ?? acc.user_type) === 0 && !acc.is_anonymized && (
                            <button
                              onClick={() => {
                                setAnonymizeModal({ id: acc.id, name: acc.display_name || acc.username });
                                setAnonymizeConfirmInput("");
                              }}
                              title={t("superadmin_anonymize_account", "Anonymiser / Supprimer")}
                              style={{
                                width: 32, height: 32, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                                borderRadius: 8, border: "1px solid #fecaca",
                                background: "#fff1f2", color: "#dc2626", cursor: "pointer",
                                transition: "all 0.15s"
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = "#dc2626"}
                              onMouseLeave={e => e.currentTarget.style.borderColor = "#fecaca"}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PAGINATION BAR ── */}
        {totalAccounts > 0 && (
          <div style={{
            padding: "16px 20px", borderTop: "1px solid var(--border, #e2e8f0)",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#64748b" }}>
              <span>
                {t("showing_items", {
                  from: Math.min(((page - 1) * limit) + 1, totalAccounts),
                  to: Math.min(page * limit, totalAccounts),
                  total: totalAccounts,
                  defaultValue: `Affichage ${Math.min(((page - 1) * limit) + 1, totalAccounts)} à ${Math.min(page * limit, totalAccounts)} sur ${totalAccounts}`
                })}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>{t("per_page", "Par page :")}</span>
                <select
                  value={limit}
                  onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                  style={{
                    padding: "4px 8px", borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
                    background: "var(--bg, #f8fafc)", fontSize: 12, outline: "none"
                  }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* First Page */}
              <button
                onClick={() => setPage(1)}
                disabled={page <= 1}
                style={{
                  padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
                  background: page <= 1 ? "var(--bg, #f8fafc)" : "var(--card-bg, #ffffff)",
                  color: page <= 1 ? "#cbd5e1" : "var(--text-main, #0f172a)",
                  cursor: page <= 1 ? "not-allowed" : "pointer"
                }}
              >
                {isRtl ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
              </button>

              {/* Prev Page */}
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page <= 1}
                style={{
                  padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
                  background: page <= 1 ? "var(--bg, #f8fafc)" : "var(--card-bg, #ffffff)",
                  color: page <= 1 ? "#cbd5e1" : "var(--text-main, #0f172a)",
                  cursor: page <= 1 ? "not-allowed" : "pointer"
                }}
              >
                {isRtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              </button>

              <span style={{ fontSize: 13, fontWeight: 700, padding: "0 8px", color: "var(--text-main, #0f172a)" }}>
                {page} / {totalPages}
              </span>

              {/* Next Page */}
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                style={{
                  padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
                  background: page >= totalPages ? "var(--bg, #f8fafc)" : "var(--card-bg, #ffffff)",
                  color: page >= totalPages ? "#cbd5e1" : "var(--text-main, #0f172a)",
                  cursor: page >= totalPages ? "not-allowed" : "pointer"
                }}
              >
                {isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              </button>

              {/* Last Page */}
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                style={{
                  padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
                  background: page >= totalPages ? "var(--bg, #f8fafc)" : "var(--card-bg, #ffffff)",
                  color: page >= totalPages ? "#cbd5e1" : "var(--text-main, #0f172a)",
                  cursor: page >= totalPages ? "not-allowed" : "pointer"
                }}
              >
                {isRtl ? <ChevronsLeft size={15} /> : <ChevronsRight size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ── MODAL: INSPECT ACCOUNT DETAILS ── */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {inspectModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)", borderRadius: 20, width: "100%", maxWidth: 650,
            maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            border: "1px solid var(--border, #e2e8f0)", padding: 28, position: "relative"
          }}>
            <button
              onClick={() => setInspectModal(null)}
              style={{
                position: "absolute", top: 20, [isRtl ? "left" : "right"]: 20,
                background: "none", border: "none", cursor: "pointer", color: "#94a3b8"
              }}
            >
              <X size={22} />
            </button>

            {inspectLoading || !inspectModal.account ? (
              <div style={{ padding: 40, textAlign: "center" }}><Spinner size={32} /></div>
            ) : (
              <div>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, borderBottom: "1px solid var(--border, #e2e8f0)", paddingBottom: 16 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 14,
                    background: ROLE_CONFIG[Number(inspectModal.account.usertype)]?.bg || "#f1f5f9",
                    color: ROLE_CONFIG[Number(inspectModal.account.usertype)]?.color || "#64748b",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20
                  }}>
                    {inspectModal.account.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "var(--text-main, #0f172a)" }}>
                        {inspectModal.profile?.fullname || inspectModal.profile?.clinicname || inspectModal.account.username}
                      </h2>
                      {renderRoleBadge(inspectModal.account.usertype)}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                      ID: #{inspectModal.account.id} • UUID: {inspectModal.account.uuid || "—"}
                    </div>
                  </div>
                </div>

                {/* Account Details Grid */}
                <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "#0c4a6e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t("account_credentials", "Informations de compte")}
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ background: "var(--bg, #f8fafc)", padding: "10px 14px", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{t("username", "Nom d'utilisateur")}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main, #0f172a)", marginTop: 2 }}>
                      @{inspectModal.account.username}
                    </div>
                  </div>
                  <div style={{ background: "var(--bg, #f8fafc)", padding: "10px 14px", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{t("status", "Statut")}</div>
                    <div style={{ marginTop: 2 }}>
                      {renderStatusBadge(inspectModal.account)}
                    </div>
                  </div>
                  <div style={{ background: "var(--bg, #f8fafc)", padding: "10px 14px", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{t("email", "Email")}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main, #0f172a)", marginTop: 2, wordBreak: "break-all" }}>
                      {inspectModal.account.email || "—"}
                    </div>
                  </div>
                  <div style={{ background: "var(--bg, #f8fafc)", padding: "10px 14px", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{t("phone", "Téléphone")}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main, #0f172a)", marginTop: 2 }}>
                      <span dir="ltr">{inspectModal.account.phone || "—"}</span>
                    </div>
                  </div>
                  <div style={{ background: "var(--bg, #f8fafc)", padding: "10px 14px", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{t("superadmin_created_at", "Date de création")}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginTop: 2 }}>
                      {formatDate(inspectModal.account.created_at)}
                    </div>
                  </div>
                  <div style={{ background: "var(--bg, #f8fafc)", padding: "10px 14px", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{t("superadmin_last_activity", "Dernière activité")}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginTop: 2 }}>
                      {inspectModal.account.last_activity ? formatDate(inspectModal.account.last_activity) : t("superadmin_no_activity", "Aucune")}
                    </div>
                  </div>
                </div>

                {/* Profile Details (if patient, doctor, clinic) */}
                {inspectModal.profile && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "#0c4a6e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {t("profile_data", "Profil métier")}
                    </h4>
                    <div style={{ background: "var(--bg, #f8fafc)", padding: 14, borderRadius: 12, border: "1px solid var(--border, #e2e8f0)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {inspectModal.profile.speciality && (
                        <div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{t("specialty", "Spécialité")}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0c4a6e" }}>{inspectModal.profile.speciality}</div>
                        </div>
                      )}
                      {inspectModal.profile.nin && (
                        <div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>NIN / N° Enregistrement</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{inspectModal.profile.nin}</div>
                        </div>
                      )}
                      {inspectModal.profile.clinicname && (
                        <div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{t("clinic", "Clinique")}</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{inspectModal.profile.clinicname}</div>
                        </div>
                      )}
                      {inspectModal.profile.address && (
                        <div style={{ gridColumn: "span 2" }}>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{t("address", "Adresse")}</div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{inspectModal.profile.address}</div>
                        </div>
                      )}
                      {inspectModal.profile.birthdate && (
                        <div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Date de naissance</div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{inspectModal.profile.birthdate}</div>
                        </div>
                      )}
                      {inspectModal.profile.bloodgroup && (
                        <div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Groupe sanguin</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>{inspectModal.profile.bloodgroup}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Freeze Info (if frozen) */}
                {inspectModal.account.is_frozen && (
                  <div style={{ background: "#fff7ed", border: "1.5px solid #ffedd5", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#c2410c", fontWeight: 800, fontSize: 13 }}>
                      <Snowflake size={16} /> {t("account_frozen_notice", "Ce compte est actuellement gelé / suspendu")}
                    </div>
                    {inspectModal.account.freeze_reason && (
                      <div style={{ fontSize: 12, color: "#9a3412", marginTop: 4 }}>
                        <strong>{t("reason", "Motif :")}</strong> {inspectModal.account.freeze_reason}
                      </div>
                    )}
                    {inspectModal.account.frozen_at && (
                      <div style={{ fontSize: 11, color: "#c2410c", marginTop: 2 }}>
                        {t("frozen_since", "Gelé le :")} {formatDate(inspectModal.account.frozen_at)}
                      </div>
                    )}
                  </div>
                )}

                {/* Active Sessions List */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#0c4a6e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {t("active_sessions_title", "Sessions actives")} ({inspectModal.sessions?.length || 0})
                    </h4>
                    {inspectModal.sessions?.length > 0 && (
                      <button
                        onClick={() => setInvalidateModal({
                          id: inspectModal.account.id,
                          name: inspectModal.account.username,
                          count: inspectModal.sessions.length
                        })}
                        style={{ background: "none", border: "none", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        {t("revoke_all_sessions", "Tout déconnecter")} ✕
                      </button>
                    )}
                  </div>

                  {(!inspectModal.sessions || inspectModal.sessions.length === 0) ? (
                    <div style={{ padding: 14, background: "var(--bg, #f8fafc)", borderRadius: 10, fontSize: 12, color: "#64748b", textAlign: "center" }}>
                      {t("no_active_sessions", "Aucune session active enregistrée pour ce compte.")}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {inspectModal.sessions.map(s => (
                        <div key={s.id} style={{
                          padding: "10px 14px", background: "var(--bg, #f8fafc)", borderRadius: 10,
                          border: "1px solid var(--border, #e2e8f0)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: "#1e293b" }}>
                              IP : {s.ip_address || "Inconnue"}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.user_agent}>
                              {s.user_agent || "Agent inconnu"}
                            </div>
                          </div>
                          <div style={{ textAlign: isRtl ? "left" : "right", fontSize: 11, color: "#64748b" }}>
                            <div>{t("login_at", "Connexion :")} {formatDate(s.created_at)}</div>
                            <div style={{ color: "#059669", fontWeight: 700 }}>
                              {t("last_activity", "Actif :")} {formatDate(s.last_activity)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div style={{ display: "flex", gap: 10, borderTop: "1px solid var(--border, #e2e8f0)", paddingTop: 16 }}>
                  <Btn variant="secondary" onClick={() => setInspectModal(null)} style={{ flex: 1, justifyContent: "center" }}>
                    {t("close", "Fermer")}
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() => {
                      setEditModal({
                        id: inspectModal.account.id,
                        username: inspectModal.account.username,
                        email: inspectModal.account.email || "",
                        phone: inspectModal.account.phone || ""
                      });
                      setEditErrors({});
                    }}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <Edit3 size={14} /> {t("edit", "Modifier")}
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ── MODAL: EDIT ADMINISTRATIVE INFO ── */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {editModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)", borderRadius: 20, width: "100%", maxWidth: 460,
            padding: 26, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid var(--border, #e2e8f0)"
          }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 900, color: "#0c4a6e", display: "flex", alignItems: "center", gap: 8 }}>
              <Edit3 size={20} color="var(--brand, #0891b2)" /> {t("superadmin_edit_info", "Modifier les informations administratives")}
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#64748b" }}>
              ID: #{editModal.id}
            </p>

            {editErrors.form && (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 14, fontWeight: 600 }}>
                ⚠ {editErrors.form}
              </div>
            )}

            <Input
              label={t("username", "Nom d'utilisateur")}
              value={editModal.username}
              onChange={e => setEditModal({ ...editModal, username: e.target.value })}
              required
            />

            <Input
              label={t("email", "Adresse e-mail")}
              type="email"
              value={editModal.email}
              onChange={e => setEditModal({ ...editModal, email: e.target.value })}
            />

            <Input
              label={t("phone", "Numéro de téléphone")}
              type="tel"
              value={editModal.phone}
              onChange={e => setEditModal({ ...editModal, phone: e.target.value })}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <Btn variant="secondary" onClick={() => setEditModal(null)} style={{ flex: 1, justifyContent: "center" }}>
                {t("cancel", "Annuler")}
              </Btn>
              <Btn
                onClick={handleSaveEdit}
                loading={actionLoading === `edit_${editModal.id}`}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Check size={16} /> {t("save", "Enregistrer")}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ── MODAL: FREEZE / UNFREEZE ── */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {freezeModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)", borderRadius: 20, width: "100%", maxWidth: 480,
            padding: 26, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid var(--border, #e2e8f0)"
          }}>
            <h3 style={{
              margin: "0 0 10px", fontSize: 17, fontWeight: 900,
              color: freezeModal.isFrozen ? "#059669" : "#ea580c",
              display: "flex", alignItems: "center", gap: 8
            }}>
              {freezeModal.isFrozen ? <PlayCircle size={22} /> : <Snowflake size={22} />}
              {freezeModal.isFrozen ? t("superadmin_unfreeze_account", "Dégeler le compte") : t("superadmin_freeze_confirm_title", "Confirmation du gel de compte")}
            </h3>

            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
              {freezeModal.isFrozen ? (
                t("unfreeze_confirm_desc", "L'accès à ce compte sera rétabli. L'utilisateur pourra à nouveau se connecter normalement.")
              ) : (
                t("superadmin_freeze_confirm_desc", "L'utilisateur ne pourra plus se connecter et toutes ses sessions actives seront révoquées immédiatement.")
              )}
            </p>

            <div style={{ padding: "10px 14px", background: "var(--bg, #f8fafc)", borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 700, color: "#0c4a6e" }}>
              {freezeModal.name} (ID: #{freezeModal.id})
            </div>

            {!freezeModal.isFrozen && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                  {t("freeze_reason_label", "Motif du gel (archivé pour l'audit) :")}
                </label>
                <textarea
                  value={freezeReason}
                  onChange={e => setFreezeReason(e.target.value)}
                  rows={3}
                  placeholder={t("freeze_reason_placeholder", "Exemple : Non-conformité aux conditions générales, demande de l'utilisateur...")}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 10,
                    border: "1.5px solid var(--border, #e2e8f0)", fontSize: 13,
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setFreezeModal(null)} style={{ flex: 1, justifyContent: "center" }}>
                {t("cancel", "Annuler")}
              </Btn>
              <Btn
                onClick={handleToggleFreeze}
                loading={actionLoading === `freeze_${freezeModal.id}`}
                style={{
                  flex: 1, justifyContent: "center",
                  background: freezeModal.isFrozen ? "linear-gradient(135deg, #059669, #047857)" : "linear-gradient(135deg, #ea580c, #c2410c)",
                  color: "#fff", border: "none"
                }}
              >
                {freezeModal.isFrozen ? <PlayCircle size={16} /> : <Snowflake size={16} />}
                {freezeModal.isFrozen ? t("confirm_unfreeze", "Confirmer le dégel") : t("confirm_freeze", "Confirmer le gel")}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ── MODAL: INVALIDATE SESSIONS ── */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {invalidateModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)", borderRadius: 20, width: "100%", maxWidth: 450,
            padding: 26, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid var(--border, #e2e8f0)"
          }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 900, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
              <LogOut size={22} color="#dc2626" /> {t("superadmin_invalidate_sessions", "Invalider les sessions actives")}
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
              {t("invalidate_sessions_warning", "Toutes les connexions actives de cet utilisateur seront révoquées immédiatement. Il devra se reconnecter avec ses identifiants.")}
            </p>
            <div style={{ padding: "10px 14px", background: "var(--bg, #f8fafc)", borderRadius: 10, marginBottom: 18, fontSize: 13 }}>
              <strong>{invalidateModal.name}</strong> • {invalidateModal.count} {t("active_sessions", "session(s) active(s)")}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setInvalidateModal(null)} style={{ flex: 1, justifyContent: "center" }}>
                {t("cancel", "Annuler")}
              </Btn>
              <Btn
                variant="danger"
                onClick={handleInvalidateSessions}
                loading={actionLoading === `invalidate_${invalidateModal.id}`}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <LogOut size={16} /> {t("revoke", "Déconnecter tout")}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ── MODAL: RESET PASSWORD ── */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {resetModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)", borderRadius: 20, width: "100%", maxWidth: 470,
            padding: 26, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid var(--border, #e2e8f0)"
          }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 900, color: "#4f46e5", display: "flex", alignItems: "center", gap: 8 }}>
              <Key size={22} color="#4f46e5" /> {t("superadmin_reset_confirm_title", "Réinitialiser le mot de passe")}
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
              {t("superadmin_reset_confirm_desc", "Un nouveau mot de passe sécurisé et aléatoire sera généré sur le serveur et envoyé par email au titulaire du compte. Toutes les sessions actives seront fermées. Par mesure de sécurité, le mot de passe n'est jamais affiché.")}
            </p>
            <div style={{ padding: "10px 14px", background: "var(--bg, #f8fafc)", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
              <div><strong>{resetModal.name}</strong></div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{resetModal.email || t("no_email_warning", "⚠ Aucun email associé — un mot de passe temporaire sera configuré")}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setResetModal(null)} style={{ flex: 1, justifyContent: "center" }}>
                {t("cancel", "Annuler")}
              </Btn>
              <Btn
                onClick={handleResetPassword}
                loading={actionLoading === `reset_${resetModal.id}`}
                style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg, #4f46e5, #4338ca)", color: "#fff", border: "none" }}
              >
                <Key size={16} /> {t("confirm_reset", "Confirmer la réinitialisation")}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ── MODAL: ANONYMIZE / DELETE (PHASE 02D) ── */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {anonymizeModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)", borderRadius: 20, width: "100%", maxWidth: 480,
            padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", border: "2px solid #ef4444"
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 900, color: "#b91c1c" }}>
              {t("superadmin_anonymize_confirm_title", "Action irréversible : Anonymisation du compte")}
            </h3>

            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
              {t("superadmin_anonymize_confirm_desc", "Conformément à la loi 18-07 et au RGPD, toutes les données personnelles identifiables seront définitivement effacées ou anonymisées. Cette action est irréversible.")}
            </p>

            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "#991b1b", fontWeight: 700 }}>
              {anonymizeModal.name} (ID: #{anonymizeModal.id})
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                {t("superadmin_type_confirm", "Veuillez taper CONFIRMER pour débloquer le bouton :")}
              </label>
              <input
                type="text"
                value={anonymizeConfirmInput}
                onChange={e => setAnonymizeConfirmInput(e.target.value)}
                placeholder="CONFIRMER"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: "1.5px solid #f87171", fontSize: 14, outline: "none",
                  fontWeight: 700, boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => { setAnonymizeModal(null); setAnonymizeConfirmInput(""); }} style={{ flex: 1, justifyContent: "center" }}>
                {t("cancel", "Annuler")}
              </Btn>
              <Btn
                variant="danger"
                onClick={handleAnonymize}
                disabled={anonymizeConfirmInput.trim().toUpperCase() !== "CONFIRMER" && anonymizeConfirmInput.trim() !== "تأكيد" && anonymizeConfirmInput.trim().toUpperCase() !== "CONFIRM"}
                loading={actionLoading === `anonymize_${anonymizeModal.id}`}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Trash2 size={16} /> {t("delete_permanently", "Supprimer / Anonymiser")}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
