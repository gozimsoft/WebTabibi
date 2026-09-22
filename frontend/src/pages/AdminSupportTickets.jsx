import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  HelpCircle, Plus, Send, Clock, CheckCircle, AlertCircle,
  Activity, Lock, Shield, User, Stethoscope, Building2,
  Search, Filter, ArrowLeft, ArrowRight, MessageSquare,
  ChevronDown, RefreshCw, Phone, Mail, FileText, Check,
  ChevronLeft, ChevronRight, List, Grid, RotateCw, X, Eye
} from "lucide-react";
import { Card, Btn, Input, Badge, Spinner, useToast, SmartPaginationBar } from "../components/SharedUI.jsx";

function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

// ── Categories Configuration ──
export const SUPPORT_CATEGORIES = [
  { key: "reclamation", labelKey: "admin_support_cat_reclamation", defaultLabel: "Réclamation", color: "#dc2626", bg: "#fee2e2" },
  { key: "info", labelKey: "admin_support_cat_info", defaultLabel: "Demande d'information", color: "#0891b2", bg: "#ecfeff" },
  { key: "technical", labelKey: "admin_support_cat_technical", defaultLabel: "Problème technique", color: "#d97706", bg: "#fef3c7" },
  { key: "account", labelKey: "admin_support_cat_account", defaultLabel: "Compte / Profil", color: "#4f46e5", bg: "#e0e7ff" },
  { key: "appointment", labelKey: "admin_support_cat_appointment", defaultLabel: "Rendez-vous / Service TABIBI", color: "#0891b2", bg: "#cffafe" },
  { key: "subscription", labelKey: "admin_support_cat_subscription", defaultLabel: "Abonnement / Paiement", color: "#059669", bg: "#d1fae5" },
  { key: "administrative", labelKey: "admin_support_cat_administrative", defaultLabel: "Demande administrative", color: "#7c3aed", bg: "#ede9fe" },
  { key: "report", labelKey: "admin_support_cat_report", defaultLabel: "Signalement", color: "#b91c1c", bg: "#fecaca" },
  { key: "special", labelKey: "admin_support_cat_special", defaultLabel: "Demande spéciale", color: "#be185d", bg: "#fce7f3" },
  { key: "other", labelKey: "admin_support_cat_other", defaultLabel: "Autre", color: "#475569", bg: "#f1f5f9" }
];

// ── Status Configuration ──
export const STATUS_CONFIG = {
  OPEN: { labelKey: "admin_support_status_open", defaultLabel: "Ouvert", bg: "#cffafe", color: "#0e7490", icon: Clock },
  IN_PROGRESS: { labelKey: "admin_support_status_in_progress", defaultLabel: "En cours", bg: "#fef3c7", color: "#92400e", icon: Activity },
  PENDING: { labelKey: "admin_support_status_pending", defaultLabel: "En attente", bg: "#f3e8ff", color: "#6b21a8", icon: HelpCircle },
  RESOLVED: { labelKey: "admin_support_status_resolved", defaultLabel: "Résolu", bg: "#d1fae5", color: "#065f46", icon: CheckCircle },
  CLOSED: { labelKey: "admin_support_status_closed", defaultLabel: "Fermé", bg: "#e2e8f0", color: "#475569", border: "#cbd5e1", icon: Lock },
};

// ── Priority Configuration ──
export const PRIORITY_CONFIG = {
  LOW: { labelKey: "priority_low", defaultLabel: "Basse", bg: "#f1f5f9", color: "#475569" },
  MEDIUM: { labelKey: "priority_medium", defaultLabel: "Moyenne", bg: "#cffafe", color: "#0891b2" },
  HIGH: { labelKey: "priority_high", defaultLabel: "Haute", bg: "#ffedd5", color: "#c2410c" },
  URGENT: { labelKey: "priority_urgent", defaultLabel: "Urgente", bg: "#fee2e2", color: "#b91c1c" },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── REUSABLE: SupportPaginationBar
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const SupportPaginationBar = SmartPaginationBar;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── USER-FACING: AdminSupportUserTicketsPage
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function AdminSupportUserTicketsPage({ navigate, user, qs, api, fullWidth: propFullWidth, toggleFullWidth: propToggleFullWidth }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const isMobile = useIsMobile();
  const { show, Toast } = useToast();

  // Full-width mode state (persisted & synced)
  const [localFullWidth, setLocalFullWidth] = useState(() => {
    try { return localStorage.getItem("tabibi_fullwidth") === "true"; } catch { return false; }
  });

  const fullWidth = propFullWidth !== undefined ? propFullWidth : localFullWidth;

  const toggleFullWidth = () => {
    if (propToggleFullWidth) {
      propToggleFullWidth();
    } else {
      const next = !localFullWidth;
      setLocalFullWidth(next);
      try { localStorage.setItem("tabibi_fullwidth", String(next)); } catch {}
      if (next) document.documentElement.setAttribute("data-fullwidth", "true");
      else document.documentElement.removeAttribute("data-fullwidth");
      window.dispatchEvent(new CustomEvent('tabibi:fullwidth_change', { detail: next }));
    }
  };

  useEffect(() => {
    const handleEvent = (e) => setLocalFullWidth(Boolean(e.detail));
    window.addEventListener('tabibi:fullwidth_change', handleEvent);
    return () => window.removeEventListener('tabibi:fullwidth_change', handleEvent);
  }, []);

  // View mode state (Compact Table vs 4 Cards)
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem("tabibi_support_view") || "list";
    } catch {
      return "list";
    }
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("tabibi_support_view", mode);
    } catch {}
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all"); // all | active | resolved | closed
  const [sortAsc, setSortAsc] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const userListTopRef = useRef(null);

  const [activeTicketId, setActiveTicketId] = useState(null);
  const [activeTicketData, setActiveTicketData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New ticket form state
  const [newCat, setNewCat] = useState("reclamation");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef(null);

  // Load user tickets
  const loadTickets = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.adminSupport.listMyTickets({ page, limit });
      if (Array.isArray(res)) {
        setTickets(res);
        setTotalItems(res.length);
        setTotalPages(Math.max(1, Math.ceil(res.length / limit)));
      } else if (res && typeof res === "object") {
        setTickets(Array.isArray(res.items) ? res.items : []);
        setTotalItems(res.total || 0);
        setTotalPages(res.total_pages || 1);
      } else {
        setTickets([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (e) {
      if (!silent) show(e.message, "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [page, limit]);

  // Load specific ticket conversation
  const openTicket = async (id) => {
    setActiveTicketId(id);
    setLoadingDetail(true);
    try {
      const res = await api.adminSupport.getMyTicket(id);
      setActiveTicketData(res);
      // Mark read in list
      setTickets(prev => prev.map(tk => tk.id === id ? { ...tk, unread_count: 0 } : tk));
    } catch (e) {
      show(e.message, "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Auto-scroll conversation
  useEffect(() => {
    if (activeTicketData?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTicketData?.messages]);

  // Submit new ticket
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.adminSupport.createTicket({
        category: newCat,
        subject: newSubject.trim(),
        message: newMessage.trim()
      });
      show(t("ticket_created_success", "تم إنشاء التذكرة بنجاح"), "success");
      setShowNewModal(false);
      setNewSubject("");
      setNewMessage("");
      setNewCat("reclamation");
      await loadTickets(true);
      if (res?.data?.id) {
        openTicket(res.data.id);
      }
    } catch (e) {
      show(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Reply
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicketId) return;
    setSendingReply(true);
    try {
      await api.adminSupport.replyMyTicket(activeTicketId, { message: replyText.trim() });
      setReplyText("");
      // Refresh active ticket
      const res = await api.adminSupport.getMyTicket(activeTicketId);
      setActiveTicketData(res);
      loadTickets(true);
    } catch (e) {
      show(e.message, "error");
    } finally {
      setSendingReply(false);
    }
  };

  const getCatConfig = (catKey) => SUPPORT_CATEGORIES.find(c => c.key === catKey) || SUPPORT_CATEGORIES[SUPPORT_CATEGORIES.length - 1];
  const getStatusConfig = (stKey) => STATUS_CONFIG[stKey] || STATUS_CONFIG.OPEN;

  // Compute status counts for overview
  const counts = useMemo(() => {
    const res = { all: tickets.length, open: 0, in_progress: 0, resolved: 0, closed: 0, active: 0 };
    tickets.forEach(tk => {
      const st = tk.status || 'OPEN';
      if (st === 'OPEN') res.open++;
      else if (st === 'IN_PROGRESS' || st === 'PENDING') res.in_progress++;
      else if (st === 'RESOLVED') res.resolved++;
      else if (st === 'CLOSED') res.closed++;
    });
    res.active = res.open + res.in_progress;
    return res;
  }, [tickets]);

  // Client-side search and filtering
  const filteredTickets = useMemo(() => {
    return tickets.filter(tk => {
      const st = tk.status || 'OPEN';
      if (statusTab === 'active' && st !== 'OPEN' && st !== 'IN_PROGRESS' && st !== 'PENDING') return false;
      if (statusTab === 'resolved' && st !== 'RESOLVED') return false;
      if (statusTab === 'closed' && st !== 'CLOSED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const num = (tk.ticket_number || '').toLowerCase();
        const subj = (tk.subject || '').toLowerCase();
        const cat = (tk.category || '').toLowerCase();
        const msg = (tk.last_message || '').toLowerCase();
        if (!num.includes(q) && !subj.includes(q) && !cat.includes(q) && !msg.includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const da = new Date(a.updated_at || a.created_at).getTime();
      const db = new Date(b.updated_at || b.created_at).getTime();
      return sortAsc ? da - db : db - da;
    });
  }, [tickets, statusTab, searchQuery, sortAsc]);

  if (user?.user_type === 3 || user?.user_type === 4) {
    return (
      <div className="tabibi-fullwidth-container" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px", transition: "max-width 0.25s ease" }}>
        <AdminSupportBackoffice user={user} api={api} />
      </div>
    );
  }

  return (
    <div className="tabibi-fullwidth-container" style={{
      maxWidth: fullWidth ? "100%" : 1240,
      margin: "0 auto",
      padding: isMobile ? "16px 14px" : (fullWidth ? "20px 32px" : "28px 24px"),
      transition: "max-width 0.25s ease, padding 0.25s ease"
    }}>
      <Toast />

      {/* ── HEADER BANNER ── */}
      <div className="no-print" style={{
        background: "linear-gradient(135deg, rgb(14, 116, 144) 0%, rgb(8, 145, 178) 100%)",
        borderRadius: 24,
        padding: isMobile ? "20px 18px" : "28px 32px",
        color: "rgb(255, 255, 255)",
        marginBottom: 20,
        boxShadow: "rgba(8, 145, 178, 0.25) 0px 10px 30px -5px",
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
          gap: 16,
          position: "relative",
          zIndex: 2
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgb(255, 255, 255)"
            }}>
              <Shield size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 25, fontWeight: 900 }}>
                {t("admin_support_title", "الدعم الإداري والشكاوى")}
              </h1>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700 }}>TABIBI Support</span>
                <span>•</span>
                <span>{t("admin_support_subtitle", "تواصل مباشر وآمن مع إدارة منصة طبيبي")}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => setShowNewModal(true)}
              style={{
                padding: "9px 18px",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
                transition: "0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgb(255, 255, 255)",
                color: "rgb(8, 145, 178)",
                boxShadow: "rgba(0, 0, 0, 0.12) 0px 4px 14px"
              }}
            >
              <Plus size={16} />
              {t("admin_support_new_btn", "Nouvelle demande")}
            </button>

            <button
              onClick={() => loadTickets(true)}
              disabled={loading}
              title={t("refresh", "Actualiser")}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "rgb(255, 255, 255)",
                borderRadius: 10,
                padding: "9px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "0.15s"
              }}
            >
              <RefreshCw size={15} className={loading ? "spin-animation" : ""} />
            </button>

            {/* Full Width Toggle Button */}
            <button
              onClick={toggleFullWidth}
              title={fullWidth ? t("standard_width_mode", "Largeur standard") : t("full_width_mode", "Plein écran (tableaux & statistiques)")}
              style={{
                background: fullWidth ? "rgba(255, 255, 255, 0.32)" : "rgba(255, 255, 255, 0.15)",
                border: fullWidth ? "1.5px solid rgba(255, 255, 255, 0.6)" : "1px solid rgba(255, 255, 255, 0.25)",
                color: "rgb(255, 255, 255)",
                borderRadius: 10,
                padding: "9px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                transition: "0.2s"
              }}
            >
              {fullWidth ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14h6v6" /><path d="M20 10h-6V4" /><path d="M14 10l7-7" /><path d="M3 21l7-7" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" />
                </svg>
              )}
              <span style={{ display: isMobile ? "none" : "inline" }}>
                {fullWidth ? t("standard_width_mode", "Largeur standard") : t("full_width_mode", "Plein écran")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      {activeTicketId && activeTicketData ? (
        /* ── DETAIL VIEW ── */
        <Card style={{ borderRadius: 20, padding: "24px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          {/* Header of Ticket */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <button
                onClick={() => { setActiveTicketId(null); setActiveTicketData(null); loadTickets(true); }}
                style={{
                  background: "none", border: "none", color: "#64748b", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: "4px 0", marginBottom: 8
                }}
              >
                {isRtl ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
                {t("back", "Retour à la liste")}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0e7490", background: "#cffafe", padding: "2px 8px", borderRadius: 8 }}>
                  #{activeTicketData.ticket.ticket_number}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 8,
                  background: getCatConfig(activeTicketData.ticket.category).bg,
                  color: getCatConfig(activeTicketData.ticket.category).color
                }}>
                  {t(getCatConfig(activeTicketData.ticket.category).labelKey, getCatConfig(activeTicketData.ticket.category).defaultLabel)}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 800, padding: "2px 10px", borderRadius: 8,
                  background: getStatusConfig(activeTicketData.ticket.status).bg,
                  color: getStatusConfig(activeTicketData.ticket.status).color,
                  display: "inline-flex", alignItems: "center", gap: 4
                }}>
                  {React.createElement(getStatusConfig(activeTicketData.ticket.status).icon, { size: 12 })}
                  {t(getStatusConfig(activeTicketData.ticket.status).labelKey, getStatusConfig(activeTicketData.ticket.status).defaultLabel)}
                </span>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--brand-dark, #0e7490)", marginTop: 8, marginBottom: 4 }}>
                {activeTicketData.ticket.subject}
              </h2>
              <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                {new Date(activeTicketData.ticket.created_at).toLocaleString(isRtl ? "ar-DZ" : i18n.language)}
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 280, maxHeight: 480, overflowY: "auto", padding: "12px 8px", marginBottom: 20 }}>
            {activeTicketData.messages?.map((msg, idx) => {
              const isAdmin = msg.sender_type === "admin" || msg.sender_type === "support";
              return (
                <div
                  key={msg.id || idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isAdmin ? "flex-start" : "flex-end",
                    maxWidth: "85%",
                    alignSelf: isAdmin ? "flex-start" : "flex-end"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 11.5, color: "#64748b" }}>
                    {isAdmin ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#0891b2", fontWeight: 800 }}>
                        <Shield size={12} color="#0891b2" /> {t("admin_support_admin_badge", "Administration TABIBI")}
                      </span>
                    ) : (
                      <span style={{ fontWeight: 700 }}>
                        {t("admin_support_user_badge", "Vous")}
                      </span>
                    )}
                    <span>•</span>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  <div style={{
                    padding: "12px 16px",
                    borderRadius: 16,
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    background: isAdmin ? "#f0fdfa" : "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                    color: isAdmin ? "#0e7490" : "#ffffff",
                    border: isAdmin ? "1px solid #ccfbf1" : "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Form */}
          {activeTicketData.ticket.status === "CLOSED" ? (
            <div style={{ padding: "14px 18px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontSize: 13, textAlign: "center" }}>
              <Lock size={15} style={{ verticalAlign: "middle", marginInlineEnd: 6 }} />
              {t("admin_support_ticket_closed_notice", "Cette demande est clôturée. Vous ne pouvez plus y répondre.")}
            </div>
          ) : (
            <form onSubmit={handleReply} style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={t("admin_support_reply_placeholder", "Écrivez votre réponse ici...")}
                  rows={3}
                  style={{
                    flex: 1, padding: "12px 14px", borderRadius: 12,
                    border: "1.5px solid var(--border)", outline: "none",
                    fontFamily: "inherit", fontSize: 13.5, resize: "none"
                  }}
                />
                <Btn
                  type="submit"
                  loading={sendingReply}
                  disabled={!replyText.trim()}
                  style={{ alignSelf: "flex-end", padding: "12px 20px", borderRadius: 12 }}
                >
                  <Send size={15} style={{ marginInlineEnd: 6 }} /> {t("admin_support_reply_btn", "Envoyer")}
                </Btn>
              </div>
            </form>
          )}
        </Card>
      ) : (
        /* ── LIST / TABLE / CARDS VIEW ── */
        <div>
          <div ref={userListTopRef} />

          {/* 1. Stats Chips Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 16
          }}>
            {[
              { key: "all", label: t("admin_support_stat_all", "Total des tickets"), count: counts.all, color: "#0e7490", bg: "#f0fdfa", border: "#ccfbf1", icon: Shield },
              { key: "active", label: t("admin_support_stat_active", "En cours & Ouverts"), count: counts.active, color: "#d97706", bg: "#fffbeb", border: "#fef3c7", icon: Activity },
              { key: "resolved", label: t("admin_support_stat_resolved", "Résolus"), count: counts.resolved, color: "#059669", bg: "#f0fdf4", border: "#dcfce7", icon: CheckCircle },
              { key: "closed", label: t("admin_support_stat_closed", "Fermés"), count: counts.closed, color: "#475569", bg: "#f8fafc", border: "#e2e8f0", icon: Lock },
            ].map(item => {
              const IconComp = item.icon;
              const isSelected = statusTab === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => setStatusTab(item.key)}
                  style={{
                    background: isSelected ? item.bg : "var(--card-bg, #ffffff)",
                    border: isSelected ? `2px solid ${item.color}` : "1px solid var(--border, #e2e8f0)",
                    borderRadius: 14,
                    padding: "12px 16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.03)"
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = item.color;
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = "var(--border, #e2e8f0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: item.bg, color: item.color,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <IconComp size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{item.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: item.color }}>{item.count}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Controls Toolbar: Search, Sort, View Switcher & Actions */}
          <div style={{
            background: "var(--card-bg, #ffffff)",
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: 14,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12
          }}>
            {/* Search Input */}
            <div style={{
              position: "relative",
              flex: "1 1 260px",
              maxWidth: isMobile ? "100%" : 420
            }}>
              <Search size={16} color="#94a3b8" style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                [isRtl ? "right" : "left"]: 12,
                pointerEvents: "none"
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t("admin_support_user_search_placeholder", "Rechercher par n° de ticket, sujet ou message...")}
                style={{
                  width: "100%",
                  padding: isRtl ? "8px 36px 8px 32px" : "8px 32px 8px 36px",
                  borderRadius: 10,
                  border: "1.5px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: 13,
                  color: "#1e293b",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => { e.target.style.borderColor = "var(--brand)"; e.target.style.background = "#fff"; }}
                onBlur={e => { e.target.style.borderColor = "#cbd5e1"; e.target.style.background = "#f8fafc"; }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    [isRtl ? "left" : "right"]: 10,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    color: "#94a3b8"
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Right toolbar items */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* Sort Button */}
              <button
                type="button"
                onClick={() => setSortAsc(!sortAsc)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#475569",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
                title={sortAsc ? t("sort_date_asc") : t("sort_date_desc")}
              >
                <RotateCw size={13} color="var(--brand)" />
                <span>{sortAsc ? t("sort_date_asc") : t("sort_date_desc")}</span>
              </button>

              {/* View Switcher: List vs Cards */}
              <div style={{
                display: "inline-flex",
                background: "#f1f5f9",
                padding: 3,
                borderRadius: 10,
                border: "1px solid #e2e8f0"
              }}>
                <button
                  type="button"
                  onClick={() => handleSetViewMode("list")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 7,
                    border: "none",
                    background: viewMode === "list" ? "var(--brand)" : "transparent",
                    color: viewMode === "list" ? "#ffffff" : "#64748b",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <List size={14} />
                  <span>{t("view_mode_list", "Vue compacte")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetViewMode("cards")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 7,
                    border: "none",
                    background: viewMode === "cards" ? "var(--brand)" : "transparent",
                    color: viewMode === "cards" ? "#ffffff" : "#64748b",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: viewMode === "cards" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Grid size={14} />
                  <span>{t("view_mode_cards", "Vue cartes")}</span>
                </button>
              </div>

              {/* Full Width Toggle Button */}
              <button
                type="button"
                onClick={toggleFullWidth}
                title={fullWidth ? t("standard_width_mode", "Largeur standard") : t("full_width_mode", "Plein écran")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: fullWidth ? "1.5px solid var(--brand, #0891b2)" : "1px solid #e2e8f0",
                  background: fullWidth ? "rgba(8,145,178,0.12)" : "#ffffff",
                  color: fullWidth ? "var(--brand, #0891b2)" : "#475569",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {fullWidth ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14h6v6" /><path d="M20 10h-6V4" /><path d="M14 10l7-7" /><path d="M3 21l7-7" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" />
                  </svg>
                )}
                <span>{fullWidth ? t("standard_width_mode", "Largeur standard") : t("full_width_mode", "Plein écran")}</span>
              </button>
            </div>
          </div>

          {/* 3. Status Filter Pills */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
            flexWrap: "wrap"
          }}>
            {[
              { key: "all", label: t("admin_support_filter_all", "Tous les statuts"), count: counts.all },
              { key: "active", label: t("admin_support_stat_active", "En cours & Ouverts"), count: counts.active },
              { key: "resolved", label: t("admin_support_status_resolved", "Résolus"), count: counts.resolved },
              { key: "closed", label: t("admin_support_status_closed", "Fermés"), count: counts.closed }
            ].map(tab => {
              const active = statusTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusTab(tab.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: active ? "1.5px solid var(--brand)" : "1px solid #e2e8f0",
                    background: active ? "var(--brand)" : "#ffffff",
                    color: active ? "#ffffff" : "#475569",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                    boxShadow: active ? "0 2px 8px rgba(8,145,178,0.2)" : "none"
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: 11,
                    background: active ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                    color: active ? "#ffffff" : "#64748b",
                    padding: "1px 6px",
                    borderRadius: 10,
                    fontWeight: 800
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 4. Content Area: Loading / Empty / Table / Cards */}
          {loading ? (
            <div style={{ padding: 60, textAlign: "center" }}><Spinner /></div>
          ) : filteredTickets.length === 0 ? (
            <Card style={{ padding: "50px 24px", textAlign: "center", borderRadius: 20 }}>
              <HelpCircle size={48} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: "#334155" }}>
                {searchQuery || statusTab !== "all"
                  ? t("admin_support_no_match", "Aucun ticket ne correspond à vos critères de recherche.")
                  : t("admin_support_no_tickets", "Aucun ticket administratif pour le moment")}
              </h3>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: "#64748b", maxWidth: 460, marginInline: "auto" }}>
                {searchQuery || statusTab !== "all"
                  ? t("try_adjusting_filters", "Essayez de modifier vos termes de recherche ou vos filtres.")
                  : t("admin_support_no_tickets_desc", "Vous pouvez soumettre une demande ou une réclamation auprès de l'administration à tout moment.")}
              </p>
              {searchQuery || statusTab !== "all" ? (
                <Btn onClick={() => { setSearchQuery(""); setStatusTab("all"); }} style={{ margin: "0 auto" }}>
                  <RotateCw size={15} /> {t("reset_filters", "Réinitialiser les filtres")}
                </Btn>
              ) : (
                <Btn onClick={() => setShowNewModal(true)} style={{ margin: "0 auto" }}>
                  <Plus size={16} /> {t("admin_support_new_btn", "Nouvelle demande")}
                </Btn>
              )}
            </Card>
          ) : viewMode === "list" ? (
            /* ── VIEW MODE 1: COMPACT HIGH-DENSITY TABLE ── */
            <Card style={{ padding: 0, overflow: "hidden", borderRadius: 16, border: "1px solid var(--border, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontWeight: 800, fontSize: 12 }}>
                      <th style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{t("admin_support_ticket_number", "N° Ticket")}</th>
                      <th style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{t("admin_support_category", "Catégorie")}</th>
                      <th style={{ padding: "12px 16px" }}>{t("admin_support_subject", "Objet & Message")}</th>
                      <th style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{t("col_status", "Statut")}</th>
                      <th style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{t("col_date", "Date")}</th>
                      <th style={{ padding: "12px 16px", textAlign: "center", whiteSpace: "nowrap" }}>{t("col_actions", "Action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((tk, idx) => {
                      const cat = getCatConfig(tk.category);
                      const st = getStatusConfig(tk.status);
                      const hasUnread = parseInt(tk.unread_count) > 0;
                      const isClosed = tk.status === 'CLOSED';

                      return (
                        <tr
                          key={tk.id}
                          onClick={() => openTicket(tk.id)}
                          style={{
                            borderBottom: idx < filteredTickets.length - 1 ? "1px solid #f1f5f9" : "none",
                            background: hasUnread ? "#f0fdfa" : (idx % 2 === 0 ? "#ffffff" : "#fcfcfd"),
                            cursor: "pointer",
                            transition: "background 0.15s ease"
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                          onMouseLeave={e => e.currentTarget.style.background = hasUnread ? "#f0fdfa" : (idx % 2 === 0 ? "#ffffff" : "#fcfcfd")}
                        >
                          {/* Ticket Number */}
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                            <span style={{
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: isClosed ? "#64748b" : "#0e7490",
                              background: isClosed ? "#e2e8f0" : "#cffafe",
                              padding: "3px 8px",
                              borderRadius: 6
                            }}>
                              #{tk.ticket_number}
                            </span>
                            {hasUnread && (
                              <span style={{
                                background: "#ef4444", color: "#fff",
                                fontSize: 9.5, fontWeight: 800,
                                padding: "1px 5px", borderRadius: 8,
                                marginInlineStart: 6
                              }}>
                                ●
                              </span>
                            )}
                          </td>

                          {/* Category Badge */}
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                            <span style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: isClosed ? "#f1f5f9" : cat.bg,
                              color: isClosed ? "#64748b" : cat.color,
                              display: "inline-block"
                            }}>
                              {t(cat.labelKey, cat.defaultLabel)}
                            </span>
                          </td>

                          {/* Subject & Message excerpt */}
                          <td style={{ padding: "12px 16px", maxWidth: 360 }}>
                            <div style={{ fontWeight: 800, color: isClosed ? "#64748b" : "#0c4a6e", marginBottom: 2 }}>
                              {tk.subject}
                            </div>
                            {tk.last_message && (
                              <div style={{
                                fontSize: 12,
                                color: isClosed ? "#94a3b8" : "#64748b",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}>
                                {tk.last_sender_type === "admin" || tk.last_sender_type === "support" ? (
                                  <strong style={{ color: isClosed ? "#64748b" : "#0891b2" }}>{t("admin_support_admin_badge", "Administration")}: </strong>
                                ) : (
                                  <strong style={{ color: "#475569" }}>{t("admin_support_user_badge", "Vous")}: </strong>
                                )}
                                {tk.last_message}
                              </div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                            <span style={{
                              fontSize: 11.5,
                              fontWeight: 800,
                              padding: "3px 9px",
                              borderRadius: 8,
                              background: isClosed ? "#e2e8f0" : st.bg,
                              color: isClosed ? "#475569" : st.color,
                              border: isClosed ? "1px solid #cbd5e1" : "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5
                            }}>
                              {React.createElement(st.icon, { size: 12 })}
                              {t(st.labelKey, st.defaultLabel)}
                            </span>
                          </td>

                          {/* Date */}
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap", color: "#64748b", fontSize: 12 }}>
                            {new Date(tk.updated_at || tk.created_at).toLocaleDateString(isRtl ? "ar-DZ" : i18n.language, { day: "2-digit", month: "short", year: "numeric" })}
                          </td>

                          {/* Action */}
                          <td style={{ padding: "12px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <Btn
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); openTicket(tk.id); }}
                              style={{ padding: "5px 12px", fontSize: 12, borderRadius: 8, color: "var(--brand)" }}
                            >
                              <Eye size={13} />
                              <span style={{ marginInlineStart: 4 }}>{t("admin_support_open_ticket", "Consulter")}</span>
                            </Btn>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            /* ── VIEW MODE 2: CARDS GRID (4 CARDS PER ROW ON DESKTOP) ── */
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))",
              gap: isMobile ? 12 : 16
            }}>
              {filteredTickets.map(tk => {
                const cat = getCatConfig(tk.category);
                const st = getStatusConfig(tk.status);
                const hasUnread = parseInt(tk.unread_count) > 0;
                const isClosed = tk.status === 'CLOSED';

                return (
                  <Card
                    key={tk.id}
                    onClick={() => openTicket(tk.id)}
                    style={{
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: isClosed ? "1px solid #cbd5e1" : (hasUnread ? "1.5px solid var(--brand, #0891b2)" : "1px solid #e2e8f0"),
                      boxShadow: hasUnread ? "0 4px 16px rgba(8, 145, 178, 0.15)" : "0 2px 8px rgba(0,0,0,0.03)",
                      borderRadius: 16,
                      overflow: "hidden",
                      cursor: "pointer",
                      opacity: isClosed ? 0.8 : 1,
                      filter: isClosed ? "grayscale(30%)" : "none"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.08)";
                      if (!isClosed) e.currentTarget.style.borderColor = "var(--brand)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = hasUnread ? "0 4px 16px rgba(8, 145, 178, 0.15)" : "0 2px 8px rgba(0,0,0,0.03)";
                      if (!isClosed) e.currentTarget.style.borderColor = hasUnread ? "var(--brand, #0891b2)" : "#e2e8f0";
                    }}
                  >
                    {/* Top Header Band */}
                    <div style={{
                      background: isClosed ? "#f1f5f9" : "linear-gradient(135deg, #0891b2, #0e7490)",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: isClosed ? "#475569" : "#ffffff",
                      fontSize: 12,
                      fontWeight: 800
                    }}>
                      <span>#{tk.ticket_number}</span>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: "2px 7px",
                        borderRadius: 6,
                        background: isClosed ? "#e2e8f0" : "rgba(255,255,255,0.22)",
                        color: isClosed ? "#475569" : "#ffffff",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4
                      }}>
                        {React.createElement(st.icon, { size: 10 })}
                        {t(st.labelKey, st.defaultLabel)}
                      </span>
                    </div>

                    {/* Card Interior */}
                    <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        {/* Category & Unread Badge */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 8 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: isClosed ? "#f1f5f9" : cat.bg,
                            color: isClosed ? "#64748b" : cat.color,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {t(cat.labelKey, cat.defaultLabel)}
                          </span>

                          {hasUnread && (
                            <span style={{
                              background: "#ef4444", color: "#fff",
                              fontSize: 10, fontWeight: 800,
                              padding: "1px 6px", borderRadius: 8
                            }}>
                              {t("unread", "Nouveau")}
                            </span>
                          )}
                        </div>

                        {/* Subject */}
                        <div style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: isClosed ? "#64748b" : "#0c4a6e",
                          marginBottom: 8,
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }} title={tk.subject}>
                          {tk.subject}
                        </div>

                        {/* Last message preview */}
                        {tk.last_message && (
                          <div style={{
                            fontSize: 12,
                            color: isClosed ? "#94a3b8" : "#475569",
                            background: isClosed ? "#f8fafc" : "#f0fdfa",
                            border: isClosed ? "1px solid #e2e8f0" : "1px solid #ccfbf1",
                            padding: "8px 10px",
                            borderRadius: 8,
                            lineHeight: 1.4,
                            marginBottom: 10,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}>
                            {tk.last_sender_type === "admin" || tk.last_sender_type === "support" ? (
                              <strong style={{ color: isClosed ? "#64748b" : "#0891b2" }}>{t("admin_support_admin_badge", "Administration")}: </strong>
                            ) : null}
                            {tk.last_message}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Date & CTA */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: 8,
                        borderTop: "1px solid #f1f5f9",
                        marginTop: 4
                      }}>
                        <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                          {new Date(tk.updated_at || tk.created_at).toLocaleDateString(isRtl ? "ar-DZ" : i18n.language, { day: "2-digit", month: "short" })}
                        </span>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--brand)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}>
                          {t("admin_support_open_ticket", "Consulter")} →
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ── Scalable Pagination Bar for User Tickets ── */}
          <SupportPaginationBar
            page={page}
            setPage={(p) => {
              const nextP = typeof p === "function" ? p(page) : p;
              setPage(nextP);
              userListTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            limit={limit}
            setLimit={setLimit}
            totalItems={totalItems}
            totalPages={totalPages}
            limitOptions={[5, 10, 20, 50]}
            isRtl={isRtl}
            t={t}
          />
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showNewModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)", zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)", borderRadius: 20,
            padding: "28px 24px", maxWidth: 540, width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={20} color="#0891b2" />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "var(--brand-dark, #0e7490)" }}>
                  {t("admin_support_new_btn", "Nouvelle demande à l'administration")}
                </h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}>
              {/* Category Select */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {t("admin_support_category", "Catégorie")} *
                </label>
                <select
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12,
                    border: "1.5px solid var(--border)", outline: "none",
                    fontFamily: "inherit", fontSize: 13.5, background: "#fff"
                  }}
                  required
                >
                  {SUPPORT_CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>
                      {t(c.labelKey, c.defaultLabel)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {t("admin_support_subject", "Sujet")} *
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder={t("admin_support_subject_placeholder", "Résumé concis de votre demande...")}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12,
                    border: "1.5px solid var(--border)", outline: "none",
                    fontFamily: "inherit", fontSize: 13.5, boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              {/* Description Textarea */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {t("admin_support_description", "Description détaillée")} *
                </label>
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={t("admin_support_desc_placeholder", "Expliquez précisément votre situation, question ou réclamation...")}
                  rows={5}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 12,
                    border: "1.5px solid var(--border)", outline: "none",
                    fontFamily: "inherit", fontSize: 13.5, resize: "vertical", boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <Btn variant="secondary" type="button" onClick={() => setShowNewModal(false)}>
                  {t("cancel", "Annuler")}
                </Btn>
                <Btn type="submit" loading={submitting}>
                  <Send size={15} style={{ marginInlineEnd: 6 }} /> {t("admin_support_send_btn", "Envoyer à l'administration")}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── BACKOFFICE: AdminSupportBackoffice (Inside /admin)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function AdminSupportBackoffice({ user, api }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { show, Toast } = useToast();

  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({ TOTAL: 0, OPEN: 0, IN_PROGRESS: 0, PENDING: 0, RESOLVED: 0, CLOSED: 0, UNREAD_MESSAGES: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [catFilter, setCatFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const adminListTopRef = useRef(null);

  // Detail Modal
  const [inspectTicket, setInspectTicket] = useState(null); // id
  const [inspectData, setInspectData] = useState(null); // full ticket details
  const [loadingInspect, setLoadingInspect] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("PENDING");
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadAdminTickets = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.adminSupport.adminList({
        status: statusFilter,
        category: catFilter,
        search: search.trim(),
        page: page,
        limit: limit
      });
      setTickets(res?.items || []);
      setTotalPages(res?.total_pages || 1);
      setTotalItems(res?.total || 0);
      if (res?.counts) setCounts(res.counts);
    } catch (e) {
      if (!silent) show(e.message, "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminTickets();
  }, [statusFilter, catFilter, page, limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadAdminTickets();
  };

  const openInspection = async (id) => {
    setInspectTicket(id);
    setLoadingInspect(true);
    try {
      const res = await api.adminSupport.adminGet(id);
      setInspectData(res);
      setReplyStatus(res?.ticket?.status === "OPEN" ? "IN_PROGRESS" : res?.ticket?.status || "PENDING");
      // Update unread count locally
      setTickets(prev => prev.map(t => t.id === id ? { ...t, unread_count: 0 } : t));
    } catch (e) {
      show(e.message, "error");
    } finally {
      setLoadingInspect(false);
    }
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !inspectTicket) return;
    setSendingReply(true);
    try {
      await api.adminSupport.adminReply(inspectTicket, {
        message: replyText.trim(),
        status: replyStatus
      });
      show(t("reply_sent_success", "تم إرسال الرد وتحديث الحالة بنجاح"), "success");
      setReplyText("");
      const refreshed = await api.adminSupport.adminGet(inspectTicket);
      setInspectData(refreshed);
      loadAdminTickets(true);
    } catch (e) {
      show(e.message, "error");
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newSt) => {
    if (!inspectTicket) return;
    setUpdatingStatus(true);
    try {
      await api.adminSupport.adminUpdateStatus(inspectTicket, { status: newSt });
      show(t("status_updated_success", "تم تحديث حالة التذكرة بنجاح"), "success");
      const refreshed = await api.adminSupport.adminGet(inspectTicket);
      setInspectData(refreshed);
      loadAdminTickets(true);
    } catch (e) {
      show(e.message, "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPr) => {
    if (!inspectTicket) return;
    try {
      await api.adminSupport.adminUpdateStatus(inspectTicket, { priority: newPr });
      show(t("priority_updated_success", "تم تحديث أولوية التذكرة"), "success");
      const refreshed = await api.adminSupport.adminGet(inspectTicket);
      setInspectData(refreshed);
      loadAdminTickets(true);
    } catch (e) {
      show(e.message, "error");
    }
  };

  const getCatConfig = (catKey) => SUPPORT_CATEGORIES.find(c => c.key === catKey) || SUPPORT_CATEGORIES[SUPPORT_CATEGORIES.length - 1];
  const getStatusConfig = (stKey) => STATUS_CONFIG[stKey] || STATUS_CONFIG.OPEN;
  const getPriorityConfig = (prKey) => PRIORITY_CONFIG[prKey] || PRIORITY_CONFIG.MEDIUM;

  const getUserTypeBadge = (uType) => {
    if (uType === 1) return { label: t("doctor", "Médecin"), bg: "#eff6ff", color: "#1d4ed8", icon: Stethoscope };
    if (uType === 2) return { label: t("clinic", "Clinique"), bg: "#f0fdf4", color: "#15803d", icon: Building2 };
    return { label: t("patient", "Patient"), bg: "#f1f5f9", color: "#475569", icon: User };
  };

  return (
    <div>
      <Toast />

      {/* Stats Quick Counter */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { key: "ALL", label: t("admin_support_filter_all", "Tous"), count: counts.TOTAL, bg: "#f1f5f9", color: "#334155" },
          { key: "OPEN", label: t("admin_support_status_open", "Ouvert"), count: counts.OPEN, bg: "#cffafe", color: "#0e7490" },
          { key: "IN_PROGRESS", label: t("admin_support_status_in_progress", "En cours"), count: counts.IN_PROGRESS, bg: "#fef3c7", color: "#92400e" },
          { key: "PENDING", label: t("admin_support_status_pending", "En attente"), count: counts.PENDING, bg: "#f3e8ff", color: "#6b21a8" },
          { key: "RESOLVED", label: t("admin_support_status_resolved", "Résolu"), count: counts.RESOLVED, bg: "#d1fae5", color: "#065f46" },
          { key: "CLOSED", label: t("admin_support_status_closed", "Fermé"), count: counts.CLOSED, bg: "#f8fafc", color: "#64748b" }
        ].map(item => (
          <div
            key={item.key}
            onClick={() => { setStatusFilter(item.key); setPage(1); }}
            style={{
              background: statusFilter === item.key ? item.bg : "var(--card-bg, #ffffff)",
              border: statusFilter === item.key ? `2px solid ${item.color}` : "1px solid var(--border, #e2e8f0)",
              borderRadius: 14, padding: "12px 14px", cursor: "pointer", textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)", transition: "all 0.15s ease"
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: item.color }}>{item.count}</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: 260, display: "flex", gap: 8 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("admin_support_search_placeholder", "Rechercher par n° de ticket, sujet ou utilisateur...")}
            style={{
              flex: 1, padding: "9px 14px", borderRadius: 10,
              border: "1px solid var(--border, #cbd5e1)", outline: "none", fontSize: 13
            }}
          />
          <Btn type="submit" variant="secondary" style={{ padding: "9px 14px" }}>
            <Search size={14} />
          </Btn>
        </form>

        {/* Category Filter */}
        <select
          value={catFilter}
          onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          style={{
            padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border, #cbd5e1)",
            background: "#fff", fontSize: 13, outline: "none"
          }}
        >
          <option value="">{t("admin_support_filter_all_cats", "Toutes les catégories")}</option>
          {SUPPORT_CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>{t(c.labelKey, c.defaultLabel)}</option>
          ))}
        </select>

        <button
          onClick={() => { setSearch(""); setCatFilter(""); setStatusFilter("ALL"); setPage(1); }}
          title={t("reset", "Réinitialiser")}
          style={{
            background: "none", border: "1px solid var(--border, #cbd5e1)", borderRadius: 10,
            padding: "9px 12px", cursor: "pointer", color: "#64748b"
          }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Tickets List */}
      <div ref={adminListTopRef} />
      {loading ? (
        <div style={{ padding: 60, textAlign: "center" }}><Spinner /></div>
      ) : tickets.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center", borderRadius: 16 }}>
          <HelpCircle size={36} color="#94a3b8" style={{ margin: "0 auto 10px" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "#475569" }}>
            {t("admin_no_matching_requests", "Aucun ticket ne correspond aux critères")}
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tickets.map(item => {
            const cat = getCatConfig(item.category);
            const st = getStatusConfig(item.status);
            const pr = getPriorityConfig(item.priority);
            const uBadge = getUserTypeBadge(parseInt(item.user_type));
            const hasUnread = parseInt(item.unread_count) > 0;
            const isClosed = item.status === 'CLOSED';

            return (
              <div
                key={item.id}
                onClick={() => openInspection(item.id)}
                style={{
                  background: isClosed ? "#f8fafc" : "var(--card-bg, #ffffff)",
                  borderRadius: 14,
                  padding: "16px 20px",
                  border: isClosed ? "1px solid #cbd5e1" : (hasUnread ? "1.5px solid var(--brand, #0891b2)" : "1px solid var(--border, #e2e8f0)"),
                  boxShadow: isClosed ? "none" : "0 2px 8px rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  transition: "all 0.15s ease",
                  opacity: isClosed ? 0.78 : 1,
                  filter: isClosed ? "grayscale(40%)" : "none"
                }}
                onMouseEnter={e => e.currentTarget.style.background = isClosed ? "#f1f5f9" : "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = isClosed ? "#f8fafc" : "var(--card-bg, #ffffff)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 12.5, fontWeight: 800,
                      color: isClosed ? "#64748b" : "#0e7490",
                      background: isClosed ? "#e2e8f0" : "#cffafe",
                      padding: "2px 8px", borderRadius: 6
                    }}>
                      #{item.ticket_number}
                    </span>

                    {/* Requester pill */}
                    <span style={{
                      fontSize: 11.5, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                      background: isClosed ? "#f1f5f9" : uBadge.bg,
                      color: isClosed ? "#64748b" : uBadge.color,
                      display: "inline-flex", alignItems: "center", gap: 4
                    }}>
                      {React.createElement(uBadge.icon, { size: 11 })}
                      {item.requester_name || item.requester_username} ({uBadge.label})
                    </span>

                    <span style={{
                      fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                      background: isClosed ? "#f1f5f9" : cat.bg,
                      color: isClosed ? "#64748b" : cat.color
                    }}>
                      {t(cat.labelKey, cat.defaultLabel)}
                    </span>

                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                      background: isClosed ? "#f1f5f9" : pr.bg,
                      color: isClosed ? "#64748b" : pr.color
                    }}>
                      {t(pr.labelKey, pr.defaultLabel)}
                    </span>

                    {hasUnread && (
                      <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 10 }}>
                        {t("new_message", "Nouveau")}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 11.5, fontWeight: 800, padding: "2px 9px", borderRadius: 8,
                      background: isClosed ? "#e2e8f0" : st.bg,
                      color: isClosed ? "#475569" : st.color,
                      border: isClosed ? "1px solid #cbd5e1" : "none",
                      display: "inline-flex", alignItems: "center", gap: 4
                    }}>
                      {React.createElement(st.icon, { size: 11 })}
                      {t(st.labelKey, st.defaultLabel)}
                    </span>
                    <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                      {new Date(item.updated_at || item.created_at).toLocaleDateString(isRtl ? "ar-DZ" : i18n.language)}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 15, fontWeight: 800, color: isClosed ? "#64748b" : "var(--brand-dark, #0e7490)" }}>
                  {item.subject}
                </div>

                {item.last_message && (
                  <div style={{ fontSize: 12, color: isClosed ? "#94a3b8" : "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.last_sender_type === "user" ? (
                      <strong style={{ color: isClosed ? "#64748b" : "#d97706" }}>{item.requester_name || item.requester_username}: </strong>
                    ) : (
                      <strong style={{ color: isClosed ? "#64748b" : "#0891b2" }}>Support: </strong>
                    )}
                    {item.last_message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Scalable Pagination Bar for Admin Tickets ── */}
      <SupportPaginationBar
        page={page}
        setPage={(p) => {
          const nextP = typeof p === "function" ? p(page) : p;
          setPage(nextP);
          adminListTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        limit={limit}
        setLimit={setLimit}
        totalItems={totalItems}
        totalPages={totalPages}
        limitOptions={[10, 20, 50, 100]}
        isRtl={isRtl}
        t={t}
      />

      {/* ── INSPECT & REPLY MODAL ── */}
      {inspectTicket && inspectData && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(3px)", zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)", borderRadius: 20,
            padding: "24px 28px", maxWidth: 720, width: "100%", maxHeight: "92vh",
            display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0e7490", background: "#cffafe", padding: "2px 8px", borderRadius: 6 }}>
                    #{inspectData.ticket.ticket_number}
                  </span>
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                    background: getCatConfig(inspectData.ticket.category).bg,
                    color: getCatConfig(inspectData.ticket.category).color
                  }}>
                    {t(getCatConfig(inspectData.ticket.category).labelKey, getCatConfig(inspectData.ticket.category).defaultLabel)}
                  </span>
                  <span style={{
                    fontSize: 11.5, fontWeight: 800, padding: "2px 9px", borderRadius: 8,
                    background: getStatusConfig(inspectData.ticket.status).bg,
                    color: getStatusConfig(inspectData.ticket.status).color
                  }}>
                    {t(getStatusConfig(inspectData.ticket.status).labelKey, getStatusConfig(inspectData.ticket.status).defaultLabel)}
                  </span>
                </div>
                <h3 style={{ margin: "4px 0 2px", fontSize: 17, fontWeight: 900, color: "var(--brand-dark, #0e7490)" }}>
                  {inspectData.ticket.subject}
                </h3>
              </div>
              <button
                onClick={() => { setInspectTicket(null); setInspectData(null); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8" }}
              >
                ✕
              </button>
            </div>

            {/* Requester Identity Box */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: "#475569" }}>
              <div>
                <strong>{t("requester", "Demandeur")}: </strong>
                <span>{inspectData.ticket.requester_name || inspectData.ticket.requester_username}</span>
              </div>
              {inspectData.ticket.requester_email && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Mail size={12} color="#64748b" />
                  <span>{inspectData.ticket.requester_email}</span>
                </div>
              )}
              {inspectData.ticket.requester_phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone size={12} color="#64748b" />
                  <span dir="ltr">{inspectData.ticket.requester_phone}</span>
                </div>
              )}
            </div>

            {/* Status & Priority Controls */}
            <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>{t("status", "Statut")}:</span>
                <select
                  value={inspectData.ticket.status}
                  onChange={e => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  style={{
                    padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    border: "1px solid var(--border)", background: "#fff"
                  }}
                >
                  <option value="OPEN">{t("admin_support_status_open", "Ouvert")}</option>
                  <option value="IN_PROGRESS">{t("admin_support_status_in_progress", "En cours")}</option>
                  <option value="PENDING">{t("admin_support_status_pending", "En attente")}</option>
                  <option value="RESOLVED">{t("admin_support_status_resolved", "Résolu")}</option>
                  <option value="CLOSED">{t("admin_support_status_closed", "Fermé")}</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>{t("priority", "Priorité")}:</span>
                <select
                  value={inspectData.ticket.priority}
                  onChange={e => handlePriorityChange(e.target.value)}
                  style={{
                    padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    border: "1px solid var(--border)", background: "#fff"
                  }}
                >
                  <option value="LOW">{t("priority_low", "Basse")}</option>
                  <option value="MEDIUM">{t("priority_medium", "Moyenne")}</option>
                  <option value="HIGH">{t("priority_high", "Haute")}</option>
                  <option value="URGENT">{t("priority_urgent", "Urgente")}</option>
                </select>
              </div>
            </div>

            {/* Conversation Feed */}
            <div style={{
              flex: 1, minHeight: 220, maxHeight: 340, overflowY: "auto",
              display: "flex", flexDirection: "column", gap: 12,
              padding: "10px 4px", borderTop: "1px solid var(--border)", marginBottom: 14
            }}>
              {inspectData.messages?.map((msg, idx) => {
                const isAdmin = msg.sender_type === "admin" || msg.sender_type === "support";
                return (
                  <div
                    key={msg.id || idx}
                    style={{
                      display: "flex", flexDirection: "column",
                      alignItems: isAdmin ? "flex-end" : "flex-start",
                      maxWidth: "85%", alignSelf: isAdmin ? "flex-end" : "flex-start"
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>
                      {isAdmin ? (
                        <strong style={{ color: "#0891b2" }}>{t("admin_support_admin_badge", "Administration")} ({msg.sender_type})</strong>
                      ) : (
                        <strong style={{ color: "#d97706" }}>{inspectData.ticket.requester_name || inspectData.ticket.requester_username}</strong>
                      )}
                      {" • "}
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <div style={{
                      padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.5,
                      background: isAdmin ? "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" : "#f1f5f9",
                      color: isAdmin ? "#fff" : "#1e293b",
                      whiteSpace: "pre-wrap", wordBreak: "break-word"
                    }}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Reply Form */}
            <form onSubmit={handleAdminReply} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={t("admin_support_reply_placeholder", "Écrivez votre réponse ici...")}
                  rows={2}
                  style={{
                    flex: 1, padding: "10px 12px", borderRadius: 10,
                    border: "1.5px solid var(--border)", outline: "none", fontSize: 13, resize: "none"
                  }}
                />
                <Btn type="submit" loading={sendingReply} disabled={!replyText.trim()} style={{ padding: "10px 18px" }}>
                  <Send size={14} style={{ marginInlineEnd: 4 }} /> {t("reply", "Répondre")}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
