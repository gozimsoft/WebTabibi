import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Calendar, MessageSquare, User, LogOut,
  ChevronDown, Menu, X, Bell, LayoutDashboard,
  Settings, CreditCard, Heart, MapPin, Clock, Star,
  ShieldCheck, Phone, Mail, Languages, Info, ArrowLeft, ArrowRight,
  Eye, Baby, Bone, Brain, Smile, Sparkles, Stethoscope, HeartPulse,
  Flame, Award, Users, Home, ClipboardList, Activity,
  Lock, Shield, CheckCircle, AlertCircle, ThumbsUp,
  UserPlus, Building, Check, AlertTriangle, Send,
  FileText, HelpCircle, History, Briefcase, Plus, Trash2, Microscope, Syringe, Download
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { App as CapacitorApp } from '@capacitor/app';
import LanguageSwitcher from "./components/LanguageSwitcher";
import ContactPage from "./pages/Contact";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── API & UTILS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BASE = "https://tabibi.dz/api";
//const BASE = "http://localhost:8000/api";
const getToken = () => localStorage.getItem("tabibi_token");

async function req(method, path, body, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
  try {
    const r = await fetch(`${BASE}${path}`, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json();
    if (!d.success) throw new Error(d.message || "Erreur serveur");
    return d.data ?? d;
  } catch (e) {
    if (e instanceof TypeError) throw new Error("Impossible de contacter le serveur. Vérifiez que le server  ");
    throw e;
  }
}

async function reqFile(method, path, body) {
  const headers = {};
  if (getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
  try {
    const r = await fetch(`${BASE}${path}`, {
      method, headers, body
    });
    const d = await r.json();
    if (!d.success) throw new Error(d.message || "Erreur serveur");
    return d.data ?? d;
  } catch (e) {
    throw e;
  }
}

const api = {
  auth: {
    register: b => req("POST", "/auth/register", b, false),
    login: b => req("POST", "/auth/login", b, false),
    logout: () => req("POST", "/auth/logout"),
    me: () => req("GET", "/auth/me"),
  },
  patient: {
    profile: () => req("GET", "/patients/profile"),
    update: b => req("PUT", "/patients/profile", b),
    appointments: () => req("GET", "/patients/appointments"),
    family: () => req("GET", "/patients/family"),
  },
  doctor: {
    profile: () => req("GET", "/doctors/profile"),
    update: b => req("PUT", "/doctors/profile", b),
    uploadPhoto: fd => reqFile("POST", "/doctors/photo", fd),
  },
  clinics: {
    search: p => req("GET", `/clinics?${new URLSearchParams(p)}`),
    one: id => req("GET", `/clinics/${id}`),
    doctor: (c, d) => req("GET", `/clinics/${c}/doctors/${d}`),
    profile: () => req("GET", "/clinics/profile"),
    update: b => req("PUT", "/clinics/profile", b),
    uploadLogo: fd => reqFile("POST", "/clinics/logo", fd),
  },
  doctors: {
    get: id => req("GET", `/doctors/${id}`),
  },
  specialties: () => req("GET", "/specialties"),
  wilayas: () => req("GET", "/wilayas"),
  appointments: {
    slots: p => req("GET", `/appointments/available-slots?${new URLSearchParams(p)}`, null, false),
    book: b => req("POST", "/appointments", b),
    cancel: id => req("DELETE", `/appointments/${id}`),
  },
  verify: {
    send: b => req("POST", "/verify/send", b),
    confirm: b => req("POST", "/verify/confirm", b),
    status: () => req("GET", "/verify/status"),
  },
  chat: {
    threads: () => req("GET", "/chat/threads"),
    create: b => req("POST", "/chat/threads", b),
    messages: id => req("GET", `/chat/threads/${id}`),
    send: (id, b) => req("POST", `/chat/threads/${id}/messages`, b),
  },
  ratings: {
    add: b => req("POST", "/ratings", b),
    doctor: id => req("GET", `/ratings/doctor/${id}`),
  },
  relations: {
    request: b => req("POST", "/relations/request", b),
    getRequests: () => req("GET", "/relations/requests"),
    check: id => req("GET", `/relations/check/${id}`),
    respond: (id, b) => req("POST", `/relations/requests/${id}/respond`, b),
  },
  register: {
    clinic: b => req("POST", "/register/clinic", b, false),
    doctor: b => req("POST", "/register/doctor", b, false),
    status: p => req("GET", `/register/status?${new URLSearchParams(p)}`, null, false),
  },
  admin: {
    stats: () => req("GET", "/admin/stats"),
    clinics: p => req("GET", `/admin/clinics?${new URLSearchParams(p)}`),
    doctors: p => req("GET", `/admin/doctors?${new URLSearchParams(p)}`),
    approveClinic: id => req("POST", `/admin/clinics/${id}/approve`, {}),
    rejectClinic: (id, reason) => req("POST", `/admin/clinics/${id}/reject`, { reason }),
    approveDoctor: id => req("POST", `/admin/doctors/${id}/approve`, {}),
    rejectDoctor: (id, reason) => req("POST", `/admin/doctors/${id}/reject`, { reason }),
  },
  tickets: {
    create: b => req("POST", "/tickets", b),
    list: () => req("GET", "/tickets"),
    get: id => req("GET", `/tickets/${id}`),
    reply: (id, b) => req("POST", `/tickets/${id}/reply`, b),
    close: id => req("POST", `/tickets/${id}/close`, {}),
  },
};

// ── Router ────────────────────────────────────────────────────
function useRoute() {
  const parse = () => {
    const h = window.location.hash.slice(1) || "/";
    const [path, qs] = h.split("?");
    return { path: path || "/", qs: qs || "" };
  };
  const [loc, setLoc] = useState(parse);

  useEffect(() => {
    const h = () => setLoc(parse());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const navigate = useCallback((path) => {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { route: loc.path, qs: loc.qs, navigate };
}

// ── Auth ──────────────────────────────────────────────────────
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.auth.me()
      .then(d => setUser(d))
      .catch(() => localStorage.removeItem("tabibi_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (un, pw) => {
    const d = await api.auth.login({ username: un, password: pw });
    localStorage.setItem("tabibi_token", d.token);
    setUser(d);
    return d;
  };
  const register = async b => {
    const d = await api.auth.register(b);
    localStorage.setItem("tabibi_token", d.token);
    setUser(d);
    return d;
  };
  const logout = async () => {
    try { await api.auth.logout(); } catch { }
    localStorage.removeItem("tabibi_token");
    setUser(null);
  };
  return { user, loading, login, register, logout };
}

// ── Responsive Hook ───────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

// ── Shared UI ─────────────────────────────────────────────────
const Spinner = ({ size = 24 }) => (
  <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
    <div style={{ width: size, height: size, border: `3px solid #e2f4f4`, borderTopColor: "#0891b2", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
  </div>
);

// Custom Hook for Toast Notifications
function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };
  const Toast = () => toast ? (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: toast.type === "error" ? "#fee2e2" : "#d1fae5",
      color: toast.type === "error" ? "#991b1b" : "#065f46",
      border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#6ee7b7"}`,
      borderRadius: 12, padding: "12px 20px", fontWeight: 600, fontSize: 14,
      boxShadow: "0 8px 30px rgba(0,0,0,0.15)", display: "flex", gap: 12, alignItems: "center", maxWidth: 380
    }}>
      <span style={{ fontSize: 20, display: "flex" }}>{toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}</span>
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, color: "inherit" }}>×</button>
    </div>
  ) : null;
  return { show, Toast };
}

// rating Stars
const Stars = ({ rating = 0, interactive, onChange, size = 18 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} onClick={() => interactive && onChange?.(i)}
        style={{ fontSize: size, cursor: interactive ? "pointer" : "default", color: i <= rating ? "#f59e0b" : "#d1d5db", transition: "color 0.1s" }}>★</span>
    ))}
  </div>
);

// Doctor Image Placeholder / Avatar
const DoctorImage = ({ photo, size = 50, borderRadius = 12, style = {}, fallbackIcon: Icon = User }) => {
  if (photo) {
    return (
      <img
        src={`data:image/jpeg;base64,${photo}`}
        alt="Profile"
        style={{ width: size, height: size, borderRadius, objectFit: "cover", flexShrink: 0, ...style }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius,
      background: "linear-gradient(135deg,#ecfeff,#cffafe)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, ...style
    }}>
      <Icon size={size * 0.5} color="var(--brand)" />
    </div>
  );
};

// Decorative Badge
const Badge = ({ children, color = "#0891b2" }) => (
  <span style={{ background: color + "15", color, border: `1px solid ${color}30`, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{children}</span>
);

// Wrapper Card
const Card = ({ children, style = {}, onClick }) => {
  const isMobile = useIsMobile();
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 20, border: "1px solid var(--border)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.04)", padding: isMobile ? 16 : 24,
      cursor: onClick ? "pointer" : "default", ...style
    }}>{children}</div>
  );
};

// Custom Form Input
const Input = ({ label, error, ...p }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</label>}
    <input {...p} style={{
      width: "100%", padding: "10px 14px", border: `1.5px solid ${error ? "#f87171" : "var(--border)"}`,
      borderRadius: 10, fontSize: 14, outline: "none", background: "#fff",
      boxSizing: "border-box", transition: "border 0.2s", ...p.style
    }}
      onFocus={e => e.target.style.borderColor = "#0891b2"}
      onBlur={e => e.target.style.borderColor = error ? "#f87171" : "var(--border)"}
    />
    {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle size={14} /> {error}</div>}
  </div>
);

const Select = ({ label, error, children, ...p }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</label>}
    <select {...p} style={{
      width: "100%", padding: "10px 14px", border: `1.5px solid ${error ? "#f87171" : "var(--border)"}`,
      borderRadius: 10, fontSize: 14, outline: "none", background: "#fff",
      boxSizing: "border-box", transition: "border 0.2s", ...p.style
    }}>
      {children}
    </select>
    {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle size={14} /> {error}</div>}
  </div>
);

// Modern Button Component
const Btn = ({ children, variant = "primary", style = {}, loading: ld, disabled, ...p }) => {
  const variants = {
    primary: { background: "linear-gradient(135deg,#0891b2,#0e7490)", color: "#fff", boxShadow: "0 4px 12px rgba(8,145,178,0.25)" },
    secondary: { background: "#f3f4f6", color: "#374151", border: "1px solid var(--border)" },
    danger: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" },
    ghost: { background: "transparent", color: "#0891b2", border: "1px solid #0891b2" },
    success: { background: "linear-gradient(135deg,#059669,#047857)", color: "#fff" },
  };
  return (
    <button {...p} disabled={ld || disabled} style={{
      padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none",
      cursor: (ld || disabled) ? "not-allowed" : "pointer", transition: "all 0.2s",
      display: "inline-flex", alignItems: "center", gap: 8, opacity: (ld || disabled) ? 0.7 : 1,
      ...variants[variant], ...style
    }}>
      {ld && <Spinner size={14} />}{children}
    </button>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── MODALS & NAVBAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── OTP Verification Modal ────────────────────────────────────
function OTPModal({ type, onClose, onSuccess, show: showToast }) {
  const { t } = useTranslation();
  const [step, setStep] = useState("send"); // send | verify
  const [code, setCode] = useState("");
  const [devCode, setDev] = useState("");
  const [loading, setL] = useState(false);
  const [target, setTarget] = useState("");

  const sendOTP = async () => {
    setL(true);
    try {
      const d = await api.verify.send({ type });
      setTarget(d.target || "");
      if (d.dev_code) setDev(d.dev_code);
      setStep("verify");
      showToast(`${t("otp_sent_msg")} ${d.target || type}`);
    } catch (e) { showToast(e.message, "error"); }
    finally { setL(false); }
  };

  const confirmOTP = async () => {
    if (code.length !== 6) { showToast("الرمز يجب أن يكون 6 أرقام", "error"); return; }
    setL(true);
    try {
      await api.verify.confirm({ type, code });
      showToast(type === "email" ? `✅ ${t("otp_success_email")}` : `✅ ${t("otp_success_phone")}`);
      onSuccess();
      onClose();
    } catch (e) { showToast(e.message, "error"); }
    finally { setL(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--bg)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#0c4a6e", fontSize: 20, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}>
            {type === "email" ? <Mail size={20} /> : <Phone size={20} />}
            {type === "email" ? t("otp_email_title") : t("otp_phone_title")}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9ca3af" }}>×</button>
        </div>

        {step === "send" ? (
          <>
            <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: 24 }}>
              {type === "email" ? t("otp_email_desc") : t("otp_phone_desc")}
            </p>
            <Btn onClick={sendOTP} loading={loading} style={{ width: "100%", justifyContent: "center", padding: 13 }}>
              {t("otp_send_btn")}
            </Btn>
          </>
        ) : (
          <>
            <p style={{ color: "#6b7280", marginBottom: 16 }}>
              أدخل الرمز المرسل إلى <strong style={{ color: "#0891b2" }}>{target}</strong>
            </p>
            {devCode && (
              <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: "12px 16px", marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#854d0e", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} /> وضع التطوير — الرمز:</div>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 8, color: "#0891b2" }}>{devCode}</div>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <input
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                maxLength={6}
                style={{
                  width: "100%", padding: "14px", textAlign: "center",
                  fontSize: 24, fontWeight: 900, letterSpacing: 10,
                  border: "2px solid #0891b2", borderRadius: 12, outline: "none",
                  boxSizing: "border-box", background: "#ecfeff"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => { setStep("send"); setCode(""); }} style={{ flex: 1, justifyContent: "center" }}>
                {t("otp_resend")}
              </Btn>
              <Btn onClick={confirmOTP} loading={loading} style={{ flex: 2, justifyContent: "center" }} disabled={code.length !== 6}>
                {t("otp_confirm")}
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar({ user, navigate, onLogout }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const name = user?.profile?.fullname?.split(" ")[0] || user?.profile?.clinicname?.split(" ")[0] || user?.username || "U";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: t("search"), icon: <Search size={18} />, path: "/search" },
    ...(user?.user_type !== 1 && user?.user_type !== 2 ? [{ label: t("my_appointments"), icon: <Calendar size={18} />, path: "/appointments", private: true }] : []),
    { label: t("messages"), icon: <MessageSquare size={18} />, path: "/tickets", private: true },
    ...(user?.user_type === 1 || user?.user_type === 2 ? [{ label: "طلبات الانضمام", icon: <Check size={18} />, path: "/requests", private: true }] : [])
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: scrolled ? "rgba(255, 255, 255, 0.95)" : "#fff",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: "1px solid var(--border)",
      transition: "all 0.3s ease",
      height: isMobile ? 64 : 80,
      display: "flex", alignItems: "center"
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", width: "100%",
        padding: isMobile ? "0 16px" : "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* logo Section */}
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexDirection: i18n.language === 'ar' ? 'row' : 'row' }}>
          <div style={{
            width: isMobile ? 36 : 42, height: isMobile ? 36 : 42, background: "var(--brand)",
            borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="logo" style={{ width: "70%", height: "70%", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </div>
          {!isMobile && (
            <div style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--brand)", lineHeight: 1 }}>{t("app_name")}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 700 }}>TABIBI</div>
            </div>
          )}
        </div>

        {/* Desktop Links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LanguageSwitcher />
            <div style={{ borderLeft: "1px solid var(--border)", height: 24, margin: "0 12px" }} />
            {navLinks.map(link => {
              if (link.private && !user) return null;
              return (
                <button key={link.path} onClick={() => navigate(link.path)} style={{
                  background: "none", border: "none", cursor: "pointer", padding: "10px 16px",
                  borderRadius: 12, color: "var(--text-secondary)", fontWeight: 700, fontSize: 14,
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--brand-light)"; e.currentTarget.style.color = "var(--brand)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                  <span style={{ opacity: 0.8, display: "flex" }}>{link.icon}</span>
                  {link.label}
                </button>
              );
            })}
          </div>
        )}

        {/* User Actions */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <div style={{ position: "relative" }}>
              <button onClick={() => setOpen(!open)} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: 50, padding: isMobile ? 4 : (i18n.language === 'ar' ? "6px 6px 6px 14px" : "6px 14px 6px 6px"), cursor: "pointer",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--brand), var(--brand-dark))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 14,
                }}>
                  {name[0].toUpperCase()}
                </div>
                {!isMobile && <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{name}</span>}
                {!isMobile && <ChevronDown size={14} style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />}
              </button>

              {open && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: -1 }} onClick={() => setOpen(false)} />
                  <div style={{
                    position: "absolute",
                    left: i18n.language === 'ar' ? 0 : 'auto',
                    right: i18n.language === 'ar' ? 'auto' : 0,
                    top: "calc(100% + 12px)",
                    background: "#fff", border: "1px solid var(--border)",
                    borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    minWidth: 220, overflow: "hidden", zIndex: 1001,
                  }}>
                    <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>{user.profile?.fullname || user.profile?.clinicname || user.username}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div>
                    </div>
                    {[
                      user.user_type === 3 && { icon: <Shield size={16} />, label: "لوحة الإدارة", path: "/admin" },
                      { icon: <User size={16} />, label: t("profile"), path: "/profile" },
                      (user?.user_type !== 1 && user?.user_type !== 2) ? { icon: <Calendar size={16} />, label: t("my_appointments"), path: "/appointments" } : null,
                      { icon: <MessageSquare size={16} />, label: "الرسائل", path: "/tickets" },
                      { icon: <Mail size={16} />, label: t("contact_title"), path: "/contact" },
                    ].filter(Boolean).map(item => (
                      <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); }} style={{
                        width: "100%", padding: "12px 16px", background: "none", border: "none",
                        cursor: "pointer", textAlign: i18n.language === 'ar' ? "right" : "left", display: "flex", alignItems: "center",
                        gap: 12, fontSize: 14, color: "var(--text-secondary)"
                      }}>
                        {item.icon} {item.label}
                      </button>
                    ))}
                    <button onClick={() => { onLogout(); setOpen(false); }} style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", color: "#dc2626", textAlign: i18n.language === 'ar' ? "right" : "left", display: "flex", alignItems: "center", gap: 12 }}>
                      <LogOut size={16} /> {t("logout")}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : !isMobile && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate("/login")} style={{ padding: "10px 22px", background: "transparent", border: "1.5px solid var(--brand)", borderRadius: "var(--radius-sm)", color: "var(--brand)", fontWeight: 700 }}>{t("login")}</button>
              <button onClick={() => navigate("/register")} style={{ padding: "10px 22px", background: "var(--brand)", border: "none", borderRadius: "var(--radius-sm)", color: "#fff", fontWeight: 700 }}>{t("register")}</button>
            </div>
          )}

          {isMobile && (
            <button onClick={() => setMobileMenu(!mobileMenu)} style={{ background: "none", border: "none", color: "var(--brand)", display: "flex" }}>
              {mobileMenu ? <X size={28} /> : <Menu size={28} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenu && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, bottom: 0,
          background: "#fff", zIndex: 999,
          padding: 20, display: "flex", flexDirection: "column", gap: 12,
          animation: "fadeIn 0.2s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 800, color: "#0c4a6e" }}>{t("menu")}</span>
            <LanguageSwitcher />
          </div>
          <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 10 }} />
          {navLinks.map(link => {
            if (link.private && !user) return null;
            return (
              <button key={link.path} onClick={() => { navigate(link.path); setMobileMenu(false); }} style={{
                background: "var(--bg)", border: "1px solid var(--border)", padding: "14px 16px", borderRadius: 12,
                textAlign: i18n.language === 'ar' ? "right" : "left", fontWeight: 700, color: "var(--text-primary)",
                display: "flex", alignItems: "center", gap: 12
              }}>
                {link.icon} {link.label}
              </button>
            );
          })}
          {!user && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
              <button onClick={() => { navigate("/login"); setMobileMenu(false); }} style={{ padding: 16, background: "var(--brand)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700 }}>{t("login")}</button>
              <button onClick={() => { navigate("/register"); setMobileMenu(false); }} style={{ padding: 16, background: "var(--bg)", color: "var(--brand)", border: "1px solid var(--brand)", borderRadius: 12, fontWeight: 700 }}>{t("register")}</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── DECORATIVE MEDICAL ELEMENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StethoscopeIcon = ({ size = 80, opacity = 0.13, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ position: "absolute", pointerEvents: "none", opacity, ...style }}>
    <circle cx="56" cy="18" r="8" stroke="white" strokeWidth="3" fill="none" />
    <path d="M48 18 C48 18 36 18 36 34 C36 50 48 54 48 66 C48 72 42 76 36 76 C30 76 24 72 24 66" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="24" cy="66" r="5" fill="white" fillOpacity="0.4" />
    <path d="M56 26 L56 38" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const PillIcon = ({ size = 60, opacity = 0.11, style = {} }) => (
  <svg width={size} height={size * 0.48} viewBox="0 0 60 29" fill="none" style={{ position: "absolute", pointerEvents: "none", opacity, ...style }}>
    <rect x="1.5" y="1.5" width="57" height="26" rx="13" stroke="white" strokeWidth="2.5" fill="none" />
    <line x1="30" y1="1.5" x2="30" y2="27.5" stroke="white" strokeWidth="2.5" />
  </svg>
);


const CrescentIcon = ({ size = 32, opacity = 0.15, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ position: "absolute", pointerEvents: "none", opacity, ...style }}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="white" />
  </svg>
);

const SyringeIcon = ({ size = 100, opacity = 0.15, style = {} }) => (
  <svg width={size} height={size * 0.32} viewBox="0 0 100 32" fill="none" style={{ position: "absolute", pointerEvents: "none", opacity, ...style }}>
    <rect x="18" y="9" width="62" height="14" rx="3.5" stroke="white" strokeWidth="2.5" fill="none" />
    <line x1="80" y1="16" x2="98" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18 16 L3 9 L3 23 Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
    <line x1="18" y1="3" x2="18" y2="29" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: HOME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function HomePage({ user, navigate }) {
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [specialties, setSP] = useState([]);
  const [hoveredSpec, setHoveredSpec] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    api.specialties().then(setSP).catch(() => { });
  }, []);

  const getIcon = (namefr) => {
    const map = {
      "Médecine générale": <Stethoscope size={22} />,
      "Dentisterie": <Activity size={22} />,
      "Cardiologie": <HeartPulse size={22} />,
      "Ophtalmologie": <Eye size={22} />,
      "Pédiatrie": <Baby size={22} />,
      "Gynécologie-obstétrique": <Users size={22} />,
      "Dermatologie": <Sparkles size={22} />,
      "Neurologie": <Brain size={22} />,
      "Orthopédie et traumatologie": <Bone size={22} />,
      "Psychiatrie": <Smile size={22} />,
      "Gastro-entérologie": <Activity size={22} />,
      "Oncologie": <Award size={22} />,
    };
    return map[namefr] || <Stethoscope size={22} />;
  };

  const handleSearch = (query = q) => {
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", width: "100%", overflowX: "hidden" }}>
      {/* ── SECTION: HERO ── */}
      <section style={{ background: "transparent", position: "relative", overflow: "hidden" }}>
        {/* Teal bg */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "var(--brand)" }} />

        {/* ── MEDICAL ICONS ── */}
        <StethoscopeIcon size={isMobile ? 80 : 120} opacity={0.16} style={{ top: -20, left: -20, transform: "rotate(-15deg)" }} />
        <StethoscopeIcon size={isMobile ? 50 : 70} opacity={0.14} style={{ top: "40%", right: "5%", transform: "rotate(20deg)" }} />
        <StethoscopeIcon size={isMobile ? 60 : 90} opacity={0.15} style={{ bottom: "25%", left: "15%", transform: "rotate(45deg)" }} />

        <PillIcon size={isMobile ? 30 : 50} opacity={0.18} style={{ top: "15%", right: "20%", transform: "rotate(-25deg)" }} />
        <PillIcon size={isMobile ? 25 : 40} opacity={0.15} style={{ bottom: "35%", right: "15%", transform: "rotate(40deg)" }} />
        <PillIcon size={isMobile ? 40 : 65} opacity={0.17} style={{ top: "60%", left: "5%", transform: "rotate(-10deg)" }} />

        <CrescentIcon size={isMobile ? 24 : 34} opacity={0.15} style={{ top: "12%", left: "32%", transform: "rotate(-10deg)" }} />
        <CrescentIcon size={isMobile ? 18 : 24} opacity={0.14} style={{ bottom: "45%", left: "42%", transform: "rotate(20deg)" }} />
        <CrescentIcon size={isMobile ? 30 : 40} opacity={0.16} style={{ top: "50%", left: "28%", transform: "rotate(15deg)" }} />

        <SyringeIcon size={isMobile ? 80 : 110} opacity={0.15} style={{ top: "8%", right: "32%", transform: "rotate(-30deg)" }} />
        <SyringeIcon size={isMobile ? 60 : 80} opacity={0.14} style={{ bottom: "20%", right: "30%", transform: "rotate(15deg)" }} />

        <div style={{
          maxWidth: 1200, margin: "0 auto", width: "100%",
          padding: isMobile ? "24px 16px 60px" : "80px 24px 100px",
          textAlign: "center", position: "relative", zIndex: 2,
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.13)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 30, padding: "5px 18px",
            color: "#fff", fontSize: isMobile ? 11 : 13, fontWeight: 600, marginBottom: 20,
          }}>
            <div style={{ width: 7, height: 7, background: "#7ffff4", borderRadius: "50%" }} />
            {t("footer_description")}
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: isMobile ? "28px" : "clamp(30px, 4vw, 48px)", fontWeight: 900,
            color: "#fff", lineHeight: 1.1, marginBottom: 14,
          }}>
            {t("home_hero_title")}
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 18, color: "rgba(255,255,255,0.65)", fontWeight: 500, marginBottom: 32, padding: "0 10px" }}>
            {t("home_hero_desc")}
          </p>

          {/* Search bar */}
          <div style={{
            maxWidth: 800, margin: "0 auto",
            background: "#fff", borderRadius: 16, padding: isMobile ? 8 : 10,
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: focused ? "0 0 0 4px rgba(255,255,255,0.35)" : "0 8px 40px rgba(0,0,0,0.18)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            {!isMobile && <Search size={20} style={{ flexShrink: 0, [i18n.language === 'ar' ? 'marginRight' : 'marginLeft']: 12, color: "#94a3b8" }} />}
            <input type="text" value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder={isMobile ? t("search") + "..." : t("home_hero_placeholder")}
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: 14, color: "#333", background: "transparent",
                textAlign: i18n.language === 'ar' ? "right" : "left",
                direction: i18n.language === 'ar' ? "rtl" : "ltr",
                padding: isMobile ? "12px 14px" : "14px 10px",
              }}
            />
            <button
              onClick={() => handleSearch()}
              style={{
                background: "var(--brand)", border: "none", borderRadius: 10,
                color: "#fff", fontSize: 14, fontWeight: 700,
                padding: isMobile ? "10px 16px" : "10px 28px", whiteSpace: "nowrap", flexShrink: 0,
                cursor: "pointer"
              }}
            >{t("search")}</button>
          </div>

          {/* Quick tags */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            {[t("Médecine générale"), t("Cardiologie"), t("Dentisterie")].map(tag => (
              <button key={tag} onClick={() => { setQ(tag); handleSearch(tag); }} style={{
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 20, padding: "4px 12px", color: "rgba(255,255,255,0.85)",
                fontSize: 12, fontWeight: 600, cursor: "pointer"
              }}>{tag}</button>
            ))}
          </div>
        </div>

        {/* ── BOTTOM SHAPE ── */}
        <div style={{ position: "absolute", bottom: -2, left: "-1%", width: "102%", zIndex: 3, height: isMobile ? 40 : 82, overflow: "visible" }}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: "100%" }}>
            <path d="M-10,100 Q0,0 150,0 L1290,0 Q1440,0 1450,100 Z" fill="var(--bg)" />
          </svg>
        </div>
      </section>

      {/* ── SECTION: STATS (NUMBERS) ── */}
      <div style={{ maxWidth: 1200, margin: isMobile ? "-20px auto 40px" : "-60px auto 70px", padding: isMobile ? "0 16px" : "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: isMobile ? 14 : 20 }}>
          {[
            {
              num: "+50,000", label: t("stats_patients"),
              icon: <Users size={20} />,
              img: `${import.meta.env.BASE_URL}stats_patients_custom.png`,
              color: "#059669",
            },
            {
              num: "+800", label: t("stats_clinics"),
              icon: <Building size={20} />,
              img: `${import.meta.env.BASE_URL}stats_clinics_custom.jpg`,
              color: "#7c3aed",
            },
            {
              num: "+1,200", label: t("stats_doctors"),
              icon: <Stethoscope size={20} />,
              img: `${import.meta.env.BASE_URL}stats_doctors_custom.png`,
              color: "#0891b2",
            },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 22,
              overflow: "hidden",
              border: "1px solid var(--border)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              height: isMobile ? "auto" : 260,
              cursor: "pointer",
              transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative"
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.10)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.06)";
              }}
            >
              {/* Top Image Section */}
              <div style={{
                height: isMobile ? 155 : 185,
                width: "100%",
                position: "relative",
                flexShrink: 0
              }}>
                {/* Image with opacity */}
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${s.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                  opacity: 0.5
                }} />
                {/* Wave Separator */}
                <svg viewBox="0 0 1440 320" style={{
                  position: "absolute",
                  bottom: -2, left: 0,
                  width: "100%", height: 44,
                  zIndex: 2
                }} preserveAspectRatio="none">
                  <path fill="#fff" d="M0,192L80,181.3C160,171,320,149,480,160C640,171,800,213,960,213.3C1120,213,1280,171,1360,149.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                </svg>

                {/* Floating Icon — positioned INSIDE the photo */}
                <div style={{
                  width: 46, height: 46,
                  background: s.color,
                  color: "#fff",
                  borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 10,
                  boxShadow: `0 6px 18px ${s.color}66`,
                  border: "3px solid #fff"
                }}>
                  {s.icon}
                </div>
              </div>

              {/* Bottom Content — minimal padding */}
              <div style={{
                padding: "8px 16px 12px",
                textAlign: "center",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{
                  fontSize: 30,
                  fontWeight: 950,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: 5,
                  letterSpacing: "-0.5px"
                }}>
                  {s.num}
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  opacity: 0.7
                }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION: specialties ── */}
      <section style={{ background: "transparent", padding: "80px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28, position: "relative" }}>
            {/* Decoration */}
            <div style={{ position: "absolute", top: -40, right: -60, opacity: 0.05, color: "var(--brand)", transform: "rotate(10deg)" }}>
              <Activity size={isMobile ? 100 : 180} />
            </div>
            <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "var(--text-primary)" }}>{t("specialties_title")}</h2>
            <button onClick={() => navigate("/search")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--brand)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>{t("view_all")} <ArrowLeft size={14} style={{ transform: i18n.language === 'ar' ? 'none' : 'rotate(180deg)' }} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 10 : 14 }}>
            {specialties.slice(0, 8).map((s, i) => (
              <div key={s.id}
                onClick={() => navigate(`/search?specialty=${s.id}`)}
                onMouseEnter={() => setHoveredSpec(i)}
                onMouseLeave={() => setHoveredSpec(null)}
                style={{
                  background: "#fff",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                  border: hoveredSpec === i ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  transform: hoveredSpec === i ? "translateY(-2px)" : "none",
                  boxShadow: hoveredSpec === i ? "0 8px 24px rgba(0,146,162,0.12)" : "none",
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 13,
                  background: hoveredSpec === i ? "var(--brand)" : "var(--brand-light)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "background 0.2s",
                }}>
                  <div style={{ filter: hoveredSpec === i ? "brightness(0) invert(1)" : "none", transition: "filter 0.2s", display: "flex" }}>
                    {getIcon(s.namefr)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{i18n.language === 'ar' ? s.namear : s.namefr}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>{i18n.language === 'ar' ? s.namefr : s.namear}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── SECTION: HOW IT WORKS (STEPS) ── */}
      <section style={{ background: "transparent", padding: "80px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px" }}>
          <div style={{ position: "relative" }}>
            {/* Decoration */}
            <div style={{ position: "absolute", top: -20, left: -100, opacity: 0.05, color: "var(--brand)", transform: "rotate(-15deg)" }}>
              <Stethoscope size={220} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 32 }}>
              {t("how_it_works")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20 }}>
            {[
              {
                n: "01",
                title: t("search_doctor"),
                desc: t("search_doctor_desc"),
                color: "#0891b2",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                ),
              },
              {
                n: "02",
                title: t("book_instantly"),
                desc: t("book_instantly_desc"),
                color: "#7c3aed",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                ),
              },

              {
                n: "03",
                title: t("attend_consult"),
                desc: t("attend_consult_desc"),
                color: "#059669",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
              },
            ].map((s, i) => (
              <div key={i} style={{
                background: "#fff",
                borderRadius: 24,
                padding: "32px 28px",
                minHeight: 180,
                position: "relative",
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                direction: i18n.language === 'ar' ? "rtl" : "ltr",
                zIndex: 1
              }}>
                {/* Big number bg (Opposite to icon side) */}
                <div style={{
                  position: "absolute",
                  top: 10,
                  left: i18n.language === 'ar' ? 24 : 'auto',
                  right: i18n.language === 'ar' ? 'auto' : 24,
                  fontSize: 70,
                  fontWeight: 950,
                  color: "var(--brand)",
                  opacity: 0.3,
                  lineHeight: 1,
                  userSelect: "none",
                  zIndex: 0
                }}>{s.n}</div>

                {/* Rising Wave Background */}
                <svg style={{
                  position: "absolute",
                  bottom: -10, left: 0, width: "100%", height: 100,
                  opacity: 0.18, zIndex: 0, pointerEvents: "none",
                  transform: i18n.language === 'ar' ? "scaleX(-1)" : "scaleX(1)"
                }} viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <path fill="var(--brand)" d="M0,160C120,180,240,220,360,200C480,180,600,120,720,100C840,80,960,100,1080,120C1200,140,1320,80,1440,60L1440,320L0,320Z"></path>
                </svg>

                {/* Top: Icon (Opposite side to number) */}
                <div style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  zIndex: 1
                }}>
                  <div style={{
                    width: 52, height: 52,
                    background: "var(--brand)",
                    borderRadius: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 20px rgba(0,146,162,0.2)"
                  }}>
                    {s.icon}
                  </div>
                </div>

                {/* Bottom: Content Side */}
                <div style={{
                  textAlign: i18n.language === 'ar' ? "right" : "left",
                  zIndex: 1,
                  paddingTop: 20
                }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 500, opacity: 0.85 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: DOCTOR CTA (JOIN US) ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px 64px" : "0 24px 64px" }}>
        <div style={{
          background: "var(--brand)", borderRadius: "var(--radius-xl)",
          padding: "52px 56px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32,
          position: "relative", overflow: "hidden", flexWrap: "wrap",
        }}>
          {/* Decorative */}
          <div style={{
            position: "absolute", top: -60, left: -60,
            width: 220, height: 220, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -40, right: 80,
            width: 140, height: 140, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", pointerEvents: "none",
          }} />

          <div style={{ position: "relative", textAlign: i18n.language === 'ar' ? "right" : "left" }}>
            <div style={{
              display: "inline-block", background: "rgba(255,255,255,0.15)",
              borderRadius: 20, padding: "3px 12px", fontSize: 12,
              color: "#fff", fontWeight: 600, marginBottom: 12,
            }}>{t("for_doctors")}</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
              {t("are_you_doctor")}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              {t("doctor_cta_desc")}
            </p>
          </div>

          <div style={{
            display: "flex",
            gap: 12,
            flexShrink: 0,
            position: "relative",
            flexDirection: isMobile ? "column" : "row",
            width: isMobile ? "100%" : "auto"
          }}>
            <button onClick={() => navigate("/register-doctor")} style={{
              background: "#fff", border: "none",
              borderRadius: 10, padding: "12px 28px",
              color: "var(--brand)", fontSize: 14, fontWeight: 800,
              transition: "all 0.2s", cursor: "pointer",
              width: isMobile ? "100%" : "auto",
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center"
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <Stethoscope size={18} /> انضم كطبيب
            </button>
            <button onClick={() => navigate("/register-clinic")} style={{
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              borderRadius: 10, padding: "12px 28px",
              color: "#fff", fontSize: 14, fontWeight: 800,
              transition: "all 0.2s", cursor: "pointer",
              width: isMobile ? "100%" : "auto",
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              <Building size={18} /> سجل عيادتك
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: LOGIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LoginPage({ onLogin, navigate }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setL] = useState(false);

  const submit = async e => {
    e.preventDefault(); setError(""); setL(true);
    try { await onLogin(form.username, form.password); navigate("/"); }
    catch (e) { setError(e.message); }
    finally { setL(false); }
  };

  return (
    <div style={{ minHeight: "90vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building size={32} color="var(--brand)" />
            </div>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0c4a6e", margin: "0 0 6px" }}>{t("login_welcome")}</h1>
          <p style={{ color: "#6b7280", fontSize: 13 }}>{t("login_subtitle")}</p>
        </div>
        <Card>
          {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 14px", marginBottom: 14, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <Input label={t("username")} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder={t("username_placeholder")} required />
            <Input label={t("password")} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
            <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 12, marginTop: 6 }}>
              {loading ? t("logging_in") : t("login_btn")}
            </Btn>
          </form>
          <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#6b7280" }}>
            {t("no_account")} <button onClick={() => navigate("/register")} style={{ color: "#0891b2", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>{t("register_now")}</button>
          </p>
        </Card>
        <div style={{ marginTop: 16, background: "rgba(249, 250, 251, 0.5)", border: "1px solid #fed7aa", borderRadius: 10, padding: "11px 14px", fontSize: 12 }}>
          <strong style={{ color: "#ea580c", display: "flex", alignItems: "center", gap: 6 }}><Lock size={14} /> {t("demo_account")}</strong>
          <div style={{ color: "#92400e", marginTop: 3 }}>المستخدم: <code>Kaioran</code> | كلمة المرور: <code>FJHajf552:</code></div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: REGISTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RegisterPage({ onRegister, navigate }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: "", password: "", email: "", fullname: "", phone: "", gender: 0 });
  const [error, setError] = useState("");
  const [loading, setL] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async e => {
    e.preventDefault(); setError(""); setL(true);
    try { await onRegister(form); navigate("/"); }
    catch (e) { setError(e.message); }
    finally { setL(false); }
  };

  return (
    <div style={{ minHeight: "90vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserPlus size={32} color="var(--brand)" />
            </div>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", margin: "0 0 6px" }}>{t("register_title")}</h1>
        </div>
        <Card>
          {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 14px", marginBottom: 14, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label={t("fullname") + " *"} value={form.fullname} onChange={e => f("fullname", e.target.value)} placeholder="محمد أمين" required />
              <Input label={t("username") + " *"} value={form.username} onChange={e => f("username", e.target.value)} placeholder="mohammedamine" required />
            </div>
            <Input label={t("email") + " *"} type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="exemple@gmail.com" required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label={t("phone")} type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="0699123456" />
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{t("gender")}</label>
                <select value={form.gender} onChange={e => f("gender", +e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--bg)", boxSizing: "border-box" }}>
                  <option value={0}>{t("male")}</option><option value={1}>{t("female")}</option>
                </select>
              </div>
            </div>
            <Input label={t("password") + " *"} type="password" value={form.password} onChange={e => f("password", e.target.value)} placeholder={t("password_hint")} required />
            <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 12, marginTop: 6 }}>
              {loading ? t("creating_account") : t("create_account_btn")}
            </Btn>
          </form>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6b7280" }}>
            {t("have_account")} <button onClick={() => navigate("/login")} style={{ color: "#0891b2", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>{t("login_btn")}</button>
          </p>
        </Card>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: SEARCH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SearchPage({ navigate, qs, user }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const params = new URLSearchParams(qs);
  const [q, setQ] = useState(params.get("q") || "");
  const [sp, setSP] = useState(params.get("specialty") || "");
  const [wi, setWI] = useState(params.get("wilaya") || "");
  const [results, setR] = useState([]);
  const [spList, setSPL] = useState([]);
  const [wiList, setWIL] = useState([]);
  const [loading, setL] = useState(false);
  const [total, setT] = useState(0);
  const { show, Toast } = useToast();

  useEffect(() => {
    Promise.all([
      api.specialties(),
      api.wilayas()
    ]).then(([s, w]) => { setSPL(s); setWIL(w); }).catch(() => { });
  }, []);

  const doSearch = useCallback(async (qv, spv, wiv) => {
    setL(true);
    try {
      const d = await api.clinics.search({ q: qv, specialty: spv, wilaya_id: wiv, limit: 24 });
      setR(d.items || []); setT(d.total || 0);
    } catch (e) { show(e.message, "error"); setR([]); }
    finally { setL(false); }
  }, []);

  useEffect(() => { doSearch(q, sp, wi); }, [sp, wi]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px 16px" : "28px 24px" }}>
      <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0c4a6e", marginBottom: 6, textAlign: i18n.language === 'ar' ? "right" : "left" }}>{t("search_title")}</h1>
      <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 13, textAlign: i18n.language === 'ar' ? "right" : "left" }}>{t("search_subtitle")}</p>

      <Card style={{ marginBottom: 20, padding: isMobile ? 12 : 14, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch(q, sp, wi)}
            placeholder={t("search_placeholder")}
            style={{ flex: 2, padding: "12px 14px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 10, flex: 1 }}>
            <select value={wi} onChange={e => setWI(e.target.value)}
              style={{ flex: 1, padding: "12px 8px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, background: "var(--bg)", boxSizing: "border-box" }}>
              <option value="">{t("all_wilayas")}</option>
              {wiList.map(w => <option key={w.id} value={w.id}>{i18n.language === 'ar' ? w.namear : w.namefr}</option>)}
            </select>
            <select value={sp} onChange={e => setSP(e.target.value)}
              style={{ flex: 1, padding: "12px 8px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, background: "var(--bg)", boxSizing: "border-box" }}>
              <option value="">{t("all_specialties")}</option>
              {spList.map(s => <option key={s.id} value={s.id}>{i18n.language === 'ar' ? s.namear : s.namefr}</option>)}
            </select>
          </div>
          <Btn onClick={() => doSearch(q, sp, wi)} style={{ padding: "12px 24px", justifyContent: "center" }}>{t("search_btn")}</Btn>
        </div>
      </Card>

      {loading ? <Spinner /> : (
        <>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
            {total > 0 ? `${total} ${t("results")}` : t("no_results")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px,1fr))", gap: 16 }}>
            {(user?.user_type === 1 ? results.filter(r => r.ResultType === 'CLINIC') : results).map(r => (
              <div key={r.ResultId + r.ResultType}
                onClick={() => r.ResultType === 'CLINIC' ? navigate(`/clinic/${r.clinicid}`) : navigate(`/doctor/${r.doctor_id}`)}
                style={{
                  background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: isMobile ? 12 : 16,
                  cursor: "pointer", transition: "all 0.3s",
                  display: "flex", flexDirection: "column", gap: 8,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--brand)";
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,146,162,0.12)";
                  e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {r.ResultType === 'CLINIC' ? (
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <DoctorImage photo={r.photoprofile} size={80} borderRadius={20} fallbackIcon={Building} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--brand)", background: "var(--brand-light)", padding: "3px 12px", borderRadius: 20, display: 'inline-block', marginBottom: 6 }}>عيادة</div>
                      <h3 style={{ fontSize: 19, fontWeight: 900, color: "#0c4a6e", margin: "0 0 4px" }}>{r.clinicname}</h3>
                      <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={12} /> {r.ClinicAddress}
                      </div>
                      {user?.user_type === 1 && (
                        <div style={{ marginTop: 8 }}>
                          {r.relationstatus === 'ACCEPTED' ? (
                            <Badge color="#059669">مرتبط بالعيادة</Badge>
                          ) : r.relationstatus === 'PENDING' ? (
                            <Badge color="#f59e0b">بانتظار الموافقة</Badge>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <DoctorImage photo={r.photoprofile} size={120} borderRadius={24} />
                        {+r.AvgRating >= 4.5 && (
                          <div style={{
                            position: "absolute", top: -8, right: -8, background: "#f59e0b",
                            color: "#fff", borderRadius: "50%", width: 28, height: 28,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "3px solid #fff", boxShadow: "0 3px 8px rgba(0,0,0,0.15)"
                          }}>
                            <Award size={15} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--brand)", background: "var(--brand-light)", padding: "3px 12px", borderRadius: 20 }}>{i18n.language === 'ar' ? r.specialtyar : r.specialtyfr}</span>
                          {+r.experience > 0 && (
                            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                              <Clock size={12} /> {r.experience} {t("years")}
                            </div>
                          )}
                        </div>
                        <h3 style={{ fontSize: 19, fontWeight: 900, color: "#0c4a6e", margin: "0 0 4px" }}>{r.doctorname}</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div onClick={(e) => { e.stopPropagation(); navigate(`/clinic/${r.clinicid}`); }}
                            style={{ fontSize: 13, color: "#334155", display: "flex", alignItems: "center", gap: 6, fontWeight: 700, cursor: "pointer", transition: "color 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "var(--brand)"}
                            onMouseLeave={e => e.currentTarget.style.color = "#334155"}
                          >
                            <Building size={14} color="var(--brand)" /> {r.clinicname}
                          </div>
                          {r.ClinicAddress && (
                            <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                              <MapPin size={12} /> {r.ClinicAddress.split(",")[0]}
                            </div>
                          )}
                          {user?.user_type === 2 && (
                            <div style={{ marginTop: 8 }}>
                              {r.relationstatus === 'ACCEPTED' ? (
                                <Badge color="#059669">مرتبط بالعيادة</Badge>
                              ) : r.relationstatus === 'PENDING' ? (
                                <Badge color="#f59e0b">بانتظار الموافقة</Badge>
                              ) : (
                                <Btn onClick={(e) => {
                                  e.stopPropagation();
                                  api.relations.request({ target_id: r.doctor_id })
                                    .then(() => show("تم إرسال دعوة الانضمام للطبيب", "success"))
                                    .catch(err => show(err.message, "error"));
                                }} style={{ alignSelf: "flex-start", padding: "6px 12px", fontSize: 12 }}>
                                  <Plus size={14} style={{ marginLeft: 4 }} /> دعوة للعيادة
                                </Btn>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff9eb", padding: "5px 10px", borderRadius: 10 }}>
                          <Stars rating={Math.round(+r.AvgRating)} size={13} />
                          <span style={{ fontSize: 13, fontWeight: 900, color: "#b45309" }}>{(+r.AvgRating || 0).toFixed(1)}</span>
                        </div>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>({r.RatingCount} {t("reviews")})</span>
                      </div>

                      <div style={{ textAlign: i18n.language === 'ar' ? "left" : "right" }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{t("consultation_price") || "سعر الكشف"}</div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: "#059669" }}>
                          {+r.pricing > 0 ? `${r.pricing} ${t("currency")}` : t("not_specified")}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {results.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#9ca3af" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <Search size={44} color="#94a3b8" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>لا توجد نتائج</div>
            </div>
          )}
        </>
      )}
      <Toast />
    </div>
  );
}

// ── PAGE: CLINIC DETAILS ──────────────────────────────────────────
function ClinicDetailsPage({ navigate, clinicid, user }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [clinic, setClinic] = useState(null);
  const [loading, setL] = useState(true);
  const [relStatus, setRelStatus] = useState(null);
  const [requesting, setReq] = useState(false);
  const { show, Toast } = useToast();

  const sendJoinRequest = async () => {
    setReq(true);
    try {
      await api.relations.request({ target_id: clinicid });
      show("تم إرسال طلب الانضمام بنجاح", "success");
      setRelStatus('PENDING');
    } catch (e) {
      show(e.message, "error");
    } finally {
      setReq(false);
    }
  };

  useEffect(() => {
    setL(true);
    const p = [api.clinics.one(clinicid)];
    if (user?.user_type === 1) p.push(api.relations.check(clinicid));

    Promise.all(p).then(([c, rel]) => {
      setClinic(c);
      if (rel) setRelStatus(rel.status);
    })
      .catch(e => show(e.message, "error"))
      .finally(() => setL(false));
  }, [clinicid]);

  if (loading) return <div style={{ padding: 100 }}><Spinner /></div>;
  if (!clinic) return <div style={{ padding: 100, textAlign: "center" }}>clinique non trouvée</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "16px" : "28px 24px" }}>
      <Toast />
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "var(--brand)", fontWeight: 700, marginBottom: 20 }}>
        <ArrowRight size={18} style={{ transform: i18n.language === 'ar' ? 'none' : 'rotate(180deg)' }} /> {t("back")}
      </button>

      <Card style={{ padding: isMobile ? 20 : 32, marginBottom: 24, background: "linear-gradient(135deg, #fff, #f8fafc)" }}>
        <div style={{ display: "flex", gap: 24, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "flex-start" }}>
          <DoctorImage photo={clinic.logo} size={120} borderRadius={24} fallbackIcon={Building} style={{ border: "4px solid #fff", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }} />
          <div style={{ flex: 1, textAlign: isMobile ? "center" : "right" }}>
            <h1 style={{ fontSize: 32, fontWeight: 950, color: "#0c4a6e", marginBottom: 12 }}>{clinic.clinicname}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", justifyContent: isMobile ? "center" : "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569", fontSize: 14 }}>
                <MapPin size={16} color="var(--brand)" /> {clinic.address}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569", fontSize: 14 }}>
                <Phone size={16} color="var(--brand)" /> {clinic.phone}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569", fontSize: 14 }}>
                <Mail size={16} color="var(--brand)" /> {clinic.email}
              </div>
            </div>
            {clinic.notes && <p style={{ marginTop: 20, color: "#64748b", lineHeight: 1.6 }}>{clinic.notes}</p>}

            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: isMobile ? "center" : "flex-end" }}>
              {user?.user_type === 1 && (
                <>
                  {relStatus === 'ACCEPTED' ? (
                    <Badge color="#059669">مرتبط بالعيادة</Badge>
                  ) : relStatus === 'PENDING' ? (
                    <Badge color="#f59e0b">بانتظار الموافقة</Badge>
                  ) : (
                    <Btn onClick={sendJoinRequest} loading={requesting}>
                      <Plus size={18} /> طلب انضمام للعيادة
                    </Btn>
                  )}
                </>
              )}
              {user?.user_type === 0 && (
                <Btn variant="secondary" onClick={() => navigate(`/tickets/new?clinic_id=${clinicid}`)}>
                  <MessageSquare size={18} /> {t("contact") || "تواصل"}
                </Btn>
              )}
            </div>
          </div>
        </div>
      </Card>

      {user?.user_type !== 1 && (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0c4a6e", marginBottom: 20, textAlign: "right" }}>الأطباء المتوفرون ({clinic.doctors?.length || 0})</h2>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            {clinic.doctors?.map(d => (
              <div key={d.doctor_id}
                onClick={() => navigate(`/clinic/${clinicid}/doctor/${d.doctor_id}`)}
                style={{
                  background: "#fff", borderRadius: 20, padding: 16, border: "1px solid var(--border)", cursor: "pointer",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
              >
                <DoctorImage photo={d.photoprofile} size={70} borderRadius={16} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0c4a6e", marginBottom: 2 }}>{d.doctorname}</div>
                  <div style={{ fontSize: 13, color: "var(--brand)", fontWeight: 700 }}>{i18n.language === 'ar' ? d.specialtyar : d.specialtyfr}</div>
                </div>
                <ArrowLeft size={18} color="var(--border)" style={{ transform: i18n.language === 'ar' ? 'none' : 'rotate(180deg)' }} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: DOCTOR DETAIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DoctorDetailPage({ clinicid: initialClinicId, doctor_id, navigate, user }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [selectedClinicId, setSelectedClinicId] = useState(initialClinicId || null);
  const [ratings, setR] = useState(null);
  const [relStatus, setRelStatus] = useState(null);
  const [loading, setL] = useState(true);
  const [tab, setTab] = useState("info");
  const [myRating, setMR] = useState(0);
  const [myComment, setMC] = useState("");
  const [saving, setSav] = useState(false);
  const { show, Toast } = useToast();

  useEffect(() => {
    setL(true);
    const load = async () => {
      try {
        const promises = [
          selectedClinicId ? api.clinics.doctor(selectedClinicId, doctor_id) : api.doctors.get(doctor_id),
          api.ratings.doctor(doctor_id),
        ];
        if (user && (user.user_type === 1 || user.user_type === 2)) {
          promises.push(api.relations.check(user.user_type === 2 ? doctor_id : (selectedClinicId || initialClinicId)));
        }

        const [d, r, rel] = await Promise.all(promises);
        setData(d);
        setR(r);
        if (rel) setRelStatus(rel.status);

        if (!selectedClinicId && d.OtherClinics?.length === 1) {
          setSelectedClinicId(d.OtherClinics[0].id);
        }
      } catch (e) {
        show(e.message, "error");
      } finally {
        setL(false);
      }
    };
    load();
  }, [selectedClinicId, doctor_id, initialClinicId]);

  const submitRating = async () => {
    if (!user) { navigate("/login"); return; }
    if (myRating < 1) { show(t("choose_rating"), "error"); return; }
    setSav(true);
    try {
      await api.ratings.add({ doctor_id: doctor_id, rating: myRating, comment: myComment, hide_patient: false });
      const r = await api.ratings.getForDoctor(doctor_id);
      setR(r); setMR(0); setMC("");
      show(t("rating_added_success"));
    } catch (e) { show(e.message, "error"); }
    finally { setSav(false); }
  };

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;
  if (!data) return (
    <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <AlertCircle size={44} color="#94a3b8" />
      </div>
      <div style={{ fontWeight: 600, marginBottom: 16 }}>{t("doctor_not_found")}</div>
      <Btn onClick={() => navigate("/search")}>{t("back_to_search")}</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px 16px" : "28px 24px" }}>
      <button onClick={() => navigate("/search")} style={{ background: "none", border: "none", cursor: "pointer", color: "#0891b2", fontWeight: 600, marginBottom: 18, display: "flex", alignItems: "center", gap: 5, fontSize: 14 }}>
        {i18n.language === 'ar' ? "←" : "→"} {t("back_to_search")}
      </button>

      {/* Doctor header */}
      <Card style={{ marginBottom: 20, padding: isMobile ? "20px" : "28px" }}>
        <div style={{ display: "flex", gap: isMobile ? 20 : 32, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "flex-start" }}>
          <DoctorImage photo={data.photoprofile} size={isMobile ? 140 : 200} borderRadius={isMobile ? 24 : 32} />
          <div style={{ flex: 1, minWidth: 180, textAlign: isMobile ? "center" : "left" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8, justifyContent: isMobile ? "center" : "flex-start" }}>
              <Badge color="#0891b2">{i18n.language === 'ar' ? data.specialtyar : data.specialtyfr}</Badge>
              {data.degrees && <Badge color="#7c3aed">{data.degrees}</Badge>}
              {+data.Cnas === 1 && <Badge color="#059669"><Check size={12} style={{ marginLeft: 4 }} /> CNAS</Badge>}
              {+data.casnos === 1 && <Badge color="#0891b2"><Check size={12} style={{ marginLeft: 4 }} /> casnos</Badge>}
            </div>
            <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, color: "#0c4a6e", margin: "0 0 8px" }}>{data.fullname}</h1>

            {selectedClinicId ? (
              <div style={{ fontSize: 13, color: "#0891b2", fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 5, justifyContent: isMobile ? "center" : "flex-start" }}>
                🏥 {data.clinicname || data.OtherClinics?.find(c => c.id === selectedClinicId)?.clinicname}
                {data.OtherClinics?.length > 1 && (
                  <button onClick={() => setSelectedClinicId(null)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>
                    ({t("change")})
                  </button>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600, marginBottom: 12, textAlign: isMobile ? "center" : "left" }}>
                ⚠️ {t("select_clinic_to_book")}
              </div>
            )}

            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 6, justifyContent: isMobile ? "center" : "flex-start" }}>
              <MapPin size={14} style={{ marginTop: 2, flexShrink: 0, color: "#0891b2" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {data.BaladiyaName && <div style={{ fontWeight: 600, color: "#374151" }}>{data.BaladiyaName}</div>}
                {(data.address || data.ClinicAddress) && <div>{data.address || data.ClinicAddress}</div>}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Stars rating={Math.round(+(data.AvgRating || 0))} size={15} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{(+(data.AvgRating || 0)).toFixed(1)}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>({data.RatingCount || 0} {t("reviews")})</span>
              </div>
              {+data.experience > 0 && <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {data.experience} {t("years_experience")}</span>}
              {+data.pricing > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", gap: 4 }}><CreditCard size={13} /> {data.pricing} {t("currency")}</span>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: isMobile ? "100%" : "auto" }}>
            {user ? (
              user.user_type === 2 ? (
                <>
                  {relStatus === 'ACCEPTED' ? (
                    <Badge color="#059669" style={{ padding: 12, justifyContent: "center" }}>مرتبط بالعيادة</Badge>
                  ) : relStatus === 'PENDING' ? (
                    <Badge color="#f59e0b" style={{ padding: 12, justifyContent: "center" }}>بانتظار الموافقة</Badge>
                  ) : (
                    <Btn onClick={() => {
                      api.relations.request({ target_id: doctor_id })
                        .then(() => {
                          show("تم إرسال دعوة الانضمام للطبيب", "success");
                          setRelStatus('PENDING');
                        })
                        .catch(err => show(err.message, "error"));
                    }} style={{ padding: "12px 24px", justifyContent: "center" }}>
                      <Plus size={18} style={{ [i18n.language === 'ar' ? 'marginLeft' : 'marginRight']: 6 }} /> دعوة للعيادة
                    </Btn>
                  )}
                </>
              ) : user.user_type === 1 ? null : (
                <>
                  <Btn
                    onClick={() => navigate(`/book/${selectedClinicId}/${doctor_id}`)}
                    disabled={!selectedClinicId}
                    style={{ padding: "12px 24px", justifyContent: "center" }}
                  >
                    <Calendar size={18} /> {t("book_appointment")}
                  </Btn>
                  <Btn
                    variant="secondary"
                    onClick={() => navigate(`/book/${selectedClinicId}/${doctor_id}?relative=1`)}
                    disabled={!selectedClinicId}
                    style={{ padding: "10px 24px", fontSize: 13, background: "#f0f9ff", borderColor: "#bae6fd", color: "#0369a1", justifyContent: "center" }}
                  >
                    <Users size={16} /> {t("book_for_relative")}
                  </Btn>
                </>
              )
            ) : (
              <Btn onClick={() => navigate("/login")} style={{ justifyContent: "center" }}>{t("login_to_book")}</Btn>
            )}
            <Btn variant="secondary" onClick={() => { navigate(`/tickets/new?doctor_id=${doctor_id}`); }} style={{ padding: "10px 24px", fontSize: 13, justifyContent: "center" }}><MessageSquare size={16} /> {t("contact")}</Btn>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border)", marginBottom: 20 }}>
        {[["info", t("tab_info")], ["reasons", t("tab_reasons")], ["clinics", "العيادات"], ["schedule", t("tab_schedule")], ["ratings", t("tab_ratings")]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "9px 18px", background: "none", border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 13, color: tab === k ? "#0891b2" : "#6b7280",
            borderBottom: tab === k ? "3px solid #0891b2" : "3px solid transparent",
            marginBottom: -2, transition: "all 0.15s"
          }}>{l}</button>
        ))}
      </div>


      {/* INFO */}
      {tab === "info" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {data.Education && (
            <Card style={{ flex: "1 1 250px", padding: "18px 20px" }}>
              <h3 style={{ color: "#0c4a6e", margin: "0 0 10px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Award size={18} /> {t("education")}</h3>
              <p style={{ color: "#374151", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{data.Education}</p>
            </Card>
          )}
          <Card style={{ flex: "1 1 250px", padding: "18px 20px" }}>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 12px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Phone size={18} /> {t("contact_info")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13 }}>
              {data.phone && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={14} /> <strong>{t("phone")}:</strong> {data.phone}</div>}
              {data.email && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} /> <strong>{t("email")}:</strong> {data.email}</div>}
              {data.speakinglanguage && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Languages size={14} /> <strong>{t("languages")}</strong> {data.speakinglanguage}</div>}
              {data.PayementMethods && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><CreditCard size={14} /> <strong>{t("payment")}</strong> {data.PayementMethods}</div>}
            </div>
          </Card>
          {data.Presentation && (
            <Card style={{ flex: "2 1 350px", padding: "18px 20px" }}>
              <h3 style={{ color: "#0c4a6e", margin: "0 0 10px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><FileText size={18} /> {t("about_doctor")}</h3>
              <p style={{ color: "#374151", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{data.Presentation}</p>
            </Card>
          )}
        </div>
      )}

      {/* reasons */}
      {tab === "reasons" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 10 }}>
          {(data.reasons || []).map(r => (
            <Card key={r.id} style={{ padding: "14px 16px" }}>
              <div style={{ fontWeight: 700, color: "#0c4a6e", fontSize: 14, marginBottom: 4 }}>{r.reason_name}</div>
              {+r.reason_time > 0 && <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 6 }}><Clock size={11} /> {r.reason_time} {t("minutes")}</div>}
            </Card>
          ))}
          {(!data.reasons || data.reasons.length === 0) && <p style={{ color: "#9ca3af" }}>{t("no_reasons")}</p>}
        </div>
      )}

      {/* clinics */}
      {tab === "clinics" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          {data.OtherClinics?.map(c => {
            const isSelected = selectedClinicId === c.id;
            return (
              <div key={c.id}
                onClick={() => {
                  if (user?.user_type === 0) {
                    setSelectedClinicId(c.id);
                    setTab("schedule");
                  } else {
                    navigate(`/clinic/${c.id}`);
                  }
                }}
                style={{
                  background: isSelected ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : "#fff",
                  borderRadius: 20, padding: 16, border: isSelected ? "2.5px solid #0891b2" : "1.5px solid var(--border)",
                  cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16,
                  boxShadow: isSelected ? "0 8px 24px rgba(8,145,178,0.15)" : "0 4px 12px rgba(0,0,0,0.03)",
                  transform: isSelected ? "scale(1.02)" : "none"
                }}
                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.transform = "translateY(-3px)"; } }}
                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; } }}
              >
                <div style={{ width: 50, height: 50, borderRadius: 12, background: isSelected ? "var(--brand)" : "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building size={24} color={isSelected ? "#fff" : "var(--brand)"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0c4a6e", marginBottom: 2 }}>{c.clinicname}</div>
                  <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} /> {c.address}</div>
                </div>
                {isSelected ? <CheckCircle size={22} color="#0891b2" /> : <ArrowLeft size={18} color="var(--border)" style={{ transform: i18n.language === 'ar' ? 'none' : 'rotate(180deg)' }} />}
              </div>
            );
          })}
          {(!data.OtherClinics || data.OtherClinics.length === 0) && (
            <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: 40, color: "#9ca3af" }}>لا توجد عيادات مرتبطة</div>
          )}
        </div>
      )}

      {/* SCHEDULE */}
      {tab === "schedule" && (
        data.Schedule ? (
          <Card>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <Calendar size={18} /> {t("working_hours_title")}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
              {(() => {
                const days = [t("Monday"), t("Tuesday"), t("Wednesday"), t("Thursday"), t("Friday"), t("Saturday"), t("Sunday")];
                const weekBegin = parseInt(data.Schedule.weekbeginday || 0);
                const workingdays = data.Schedule.workingdays || "1111111";

                // Reorder days to start from weekBegin
                const orderedDays = [];
                for (let i = 0; i < 7; i++) {
                  const idx = (weekBegin + i) % 7;
                  orderedDays.push({
                    name: days[idx],
                    works: workingdays[i] === "1"
                  });
                }

                return orderedDays.map((d, i) => (
                  <div key={i} style={{
                    padding: "12px", borderRadius: 12, textAlign: "center",
                    background: d.works ? "#ecfeff" : "#f9fafb",
                    border: `1.5px solid ${d.works ? "#0891b2" : "var(--border)"}`,
                    opacity: d.works ? 1 : 0.6,
                    transition: "all 0.2s"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: d.works ? "#0891b2" : "#9ca3af", marginBottom: 4 }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: d.works ? "#0e7490" : "#d1d5db" }}>{d.works ? t("available") : t("not_available")}</div>
                  </div>
                ));
              })()}
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: "16px", border: "1px dashed var(--border)" }}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={18} color="#0891b2" />
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>{t("from")}:</strong> {(data.Schedule.daytimestart || "").match(/\d{2}:\d{2}/)?.[0] || "08:00"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <History size={18} color="#0891b2" />
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>{t("to")}:</strong> {(data.Schedule.daytimeend || "").match(/\d{2}:\d{2}/)?.[0] || "17:00"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={18} color="#0891b2" />
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>{t("appointment_duration")}:</strong> {data.Schedule.timescale} {t("minutes")}
                  </span>
                </div>

              </div>
            </div>
          </Card>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <Calendar size={44} color="#cbd5e1" />
            </div>
            <h3 style={{ margin: "0 0 8px", color: "#0c4a6e" }}>{t("no_schedule_title")}</h3>
            <p style={{ margin: 0, fontSize: 14 }}>{t("no_schedule_desc")}</p>
          </div>
        )
      )}

      {/* RATINGS */}
      {tab === "ratings" && (
        <div>
          {ratings && (
            <Card style={{ marginBottom: 16, textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#0891b2" }}>{ratings.average}</div>
              <Stars rating={Math.round(ratings.average)} size={22} />
              <div style={{ color: "#6b7280", marginTop: 6, fontSize: 13 }}>{t("based_on")} {ratings.total} {t("reviews")}</div>
            </Card>
          )}
          {user && (
            <Card style={{ marginBottom: 16, padding: "18px 20px" }}>
              <h3 style={{ color: "#0c4a6e", margin: "0 0 14px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Plus size={18} /> {t("add_rating")}</h3>
              <div style={{ marginBottom: 12 }}><Stars rating={myRating} interactive onChange={setMR} size={24} /></div>
              <textarea value={myComment} onChange={e => setMC(e.target.value)} rows={3}
                placeholder={t("add_comment_placeholder")}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
              <Btn onClick={submitRating} loading={saving} disabled={myRating < 1} style={{ padding: "9px 22px" }}>{t("send_rating")}</Btn>
            </Card>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(ratings?.ratings || []).map(r => (
              <Card key={r.id} style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#374151", marginBottom: 4, fontSize: 14 }}>{r.patientname}</div>
                    <Stars rating={r.rating} size={13} />
                  </div>
                </div>
                {r.comment && <p style={{ color: "#6b7280", marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>{r.comment}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
      <Toast />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: BOOK APPOINTMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BookPage({ clinicid, doctor_id, navigate, user }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [doctor, setDoctor] = useState(null);
  const [family, setFamily] = useState([]);
  const [step, setStep] = useState(1);
  const [selPatient, setSelPatient] = useState(null);   // {id,name,isSelf,gender}
  const [reason, setReason] = useState(null);   // optional
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selSlot, setSlot] = useState("");
  const [loading, setL] = useState(false);
  const [slotsLoad, setSL] = useState(false);
  const [initLoad, setInitL] = useState(true);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const { show, Toast } = useToast();

  useEffect(() => {
    Promise.all([
      api.clinics.doctor(clinicid, doctor_id),
      api.patient.family().catch(() => []),
    ]).then(([d, fam]) => {
      setDoctor(d);
      setFamily(fam || []);
    }).catch(e => setError(e.message))
      .finally(() => setInitL(false));
  }, [clinicid, doctor_id]);

  const selfOption = { id: null, name: user?.profile?.fullname || user?.username || "أنا", isSelf: true };
  const allPatients = [selfOption, ...(family.map(f => ({ id: f.id, name: f.fullname, isSelf: false, gender: f.gender })))];
  const activePat = selPatient || selfOption;

  const fetchSlots = async (d) => {
    if (!doctor?.clinicsdoctor_id) return;
    setSL(true); setSlots([]); setSlot("");
    try {
      const s = await api.appointments.slots({ clinics_doctor_id: doctor.clinicsdoctor_id, date: d });
      setSlots(s.slots || []);
      if (!(s.slots || []).length) show("لا توجد أوقات متاحة في هذا اليوم — جرب تاريخًا آخر", "error");
    } catch (e) { show(e.message, "error"); }
    finally { setSL(false); }
  };

  const confirmBook = async () => {
    setL(true);
    try {
      const body = { clinics_doctor_id: doctor.clinicsdoctor_id, date, time: selSlot };
      if (reason) body.doctors_reason_id = reason.id;
      if (activePat.id) body.patient_id = activePat.id;
      await api.appointments.book(body);
      setStep(6);
    } catch (e) { show(e.message, "error"); }
    finally { setL(false); }
  };

  const STEPS = [
    { n: 1, label: t("step_patient"), icon: <User size={16} /> },
    { n: 2, label: t("step_reason"), icon: <Stethoscope size={16} /> },
    { n: 3, label: t("step_date"), icon: <Calendar size={16} /> },
    { n: 4, label: t("step_instructions"), icon: <ClipboardList size={16} /> },
    { n: 5, label: t("step_confirm"), icon: <CheckCircle size={16} /> },
    { n: 6, label: t("step_done"), icon: <Award size={16} /> },
  ];

  const minDate = new Date().toISOString().split("T")[0];

  const getAvailableDates = () => {
    const schedule = doctor?.Schedule || {};
    const countdays = parseInt(schedule.countdays || 30);
    const weekBegin = parseInt(schedule.weekbeginday || 0); // 0=Mon...6=Sun
    const workingdays = schedule.workingdays || "1111111";

    const dates = [];
    // Map user's weekbeginday to Standard (0=Sun...6=Sat)
    const stdWBD = (weekBegin + 1) % 7;

    for (let i = 0; i <= countdays; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const full = `${yyyy}-${mm}-${dd}`;

      const w = d.getDay(); // 0=Sun...6=Sat
      const relIndex = (w - stdWBD + 7) % 7;

      if (workingdays[relIndex] === "1" || !schedule.workingdays) {
        dates.push({
          full: full,
          day: d.getDate(),
          month: d.toLocaleDateString("ar-DZ", { month: "short" }),
          weekday: d.toLocaleDateString("ar-DZ", { weekday: "short" }),
        });
      }
    }
    return dates;
  };

  // Auto-select first date if none selected and step is 3
  useEffect(() => {
    if (step === 3 && !date) {
      const avail = getAvailableDates();
      if (avail.length > 0) {
        setDate(avail[0].full);
        fetchSlots(avail[0].full);
      }
    }
  }, [step, doctor]);

  // ─── Error / Loading guards ─────────────────────────────────
  if (error) return (
    <div style={{ maxWidth: 600, margin: "60px auto", padding: 24, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <AlertCircle size={44} color="#dc2626" />
      </div>
      <div style={{ color: "#dc2626", fontWeight: 600, marginBottom: 20 }}>{error}</div>
      <Btn onClick={() => navigate("/search")}>{t("back_to_search")}</Btn>
    </div>
  );
  if (initLoad || !doctor) return <div style={{ padding: 60 }}><Spinner /></div>;

  // ─── Stepper bar ───────────────────────────────────────────
  const Stepper = () => (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 36, position: "relative" }}>
      {STEPS.map((s, i) => (
        <div key={s.n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {i > 0 && (
            <div style={{
              position: "absolute", top: 18, right: "-50%", left: "50%",
              height: 3, zIndex: 0, transition: "all 0.4s",
              background: (step > s.n || (step === 6 && s.n === 6))
                ? "linear-gradient(to left, #059669, #10b981)"
                : step === s.n
                  ? "linear-gradient(to left, #0891b2 60%, var(--border) 100%)"
                  : "var(--border)"
            }} />
          )}
          <div style={{
            width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: "50%", zIndex: 1, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: step > s.n ? 16 : 14,
            transition: "all 0.35s",
            background: (step > s.n || (step === 6 && s.n === 6)) ? "linear-gradient(135deg,#059669,#10b981)"
              : step === s.n ? "linear-gradient(135deg,#0891b2,#0e7490)"
                : "var(--border)",
            color: (step >= s.n) ? "#fff" : "#9ca3af",
            boxShadow: step === s.n ? "0 4px 16px rgba(8,145,178,0.4)"
              : (step > s.n || (step === 6 && s.n === 6)) ? "0 4px 12px rgba(5,150,105,0.3)" : "none",
            transform: step === s.n ? "scale(1.12)" : "scale(1)"
          }}>
            {(step > s.n) ? <Check size={isMobile ? 14 : 18} /> : React.cloneElement(s.icon, { size: isMobile ? 14 : 16 })}
          </div>
          <div style={{
            fontSize: isMobile ? 9 : 10, fontWeight: 700, marginTop: 6, whiteSpace: "nowrap",
            color: step > s.n ? "#059669" : step === s.n ? "#0891b2" : "#9ca3af",
            display: isMobile && step !== s.n ? "none" : "block"
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Doctor mini header ─────────────────────────────────────
  const DoctorBanner = () => step < 6 && (
    <div style={{
      background: "linear-gradient(135deg,#0c4a6e,#0891b2,#06b6d4)",
      borderRadius: 16, padding: "16px 22px", marginBottom: 24,
      display: "flex", alignItems: "center", gap: 14, color: "#fff"
    }}>
      <DoctorImage photo={doctor.photoprofile} size={50} borderRadius={12} style={{ background: "rgba(255,255,255,0.18)", fontSize: 24 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 0.3 }}>{doctor.fullname}</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{doctor.specialtyar || doctor.specialtyfr}</div>
      </div>
      {+doctor.pricing > 0 && (
        <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
          <CreditCard size={14} /> {doctor.pricing} DA
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
      {/* Back button */}
      <button onClick={() => navigate(`/clinic/${clinicid}/doctor/${doctor_id}`)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#0891b2", fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
        {i18n.language === 'ar' ? "←" : "→"} {t("back_to_doctor")}
      </button>

      <DoctorBanner />
      <Stepper />

      {/* ══════════ STEP 1 — Patient ══════════ */}
      {step === 1 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}><User size={22} /> {t("patient_choice")}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>{t("patient_choice_desc")}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {allPatients.map((p, i) => {
              const sel = activePat.id === p.id && activePat.isSelf === p.isSelf;
              return (
                <div key={i} onClick={() => setSelPatient(p)}
                  style={{
                    padding: "14px 18px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                    border: sel ? "2.5px solid #0891b2" : "1.5px solid var(--border)",
                    background: sel ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : "#fff",
                    display: "flex", alignItems: "center", gap: 14,
                    boxShadow: sel ? "0 4px 18px rgba(8,145,178,0.14)" : "none",
                    transform: sel ? "scale(1.01)" : "scale(1)"
                  }}
                  onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = "#0891b2"; e.currentTarget.style.background = "#f0fdff"; } }}
                  onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "#fafafa"; } }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: "50%", flexShrink: 0, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
                    background: sel ? "linear-gradient(135deg,#0891b2,#0e7490)" : "linear-gradient(135deg,#f3f4f6,var(--border))"
                  }}>
                    {p.isSelf ? <User size={22} color={sel ? "#fff" : "#9ca3af"} /> : (p.gender === 1 ? <User size={22} color={sel ? "#fff" : "#9ca3af"} /> : <User size={22} color={sel ? "#fff" : "#9ca3af"} />)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: sel ? "#0c4a6e" : "#374151" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                      {p.isSelf ? t("self") : t("family_member")}
                    </div>
                  </div>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", transition: "all 0.2s",
                    background: sel ? "#0891b2" : "var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 13, fontWeight: 900
                  }}>{sel ? <Check size={14} /> : ""}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 24 }}>
            <Btn onClick={() => setStep(2)} style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15, borderRadius: 12 }}>
              {t("next_reason")}
            </Btn>
          </div>
        </Card>
      )}

      {/* ══════════ STEP 2 — Reason ══════════ */}
      {step === 2 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}><Stethoscope size={22} /> {t("step_reason")}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>
            {t("reason_choice_desc") || "اختر سبب زيارتك إن وجد — اختياري، يمكنك التخطي"}
          </p>
          {(!doctor.reasons || doctor.reasons.length === 0) ? (
            <div style={{ padding: "28px", textAlign: "center", color: "#9ca3af", background: "var(--bg)", borderRadius: 12, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <FileText size={36} color="#cbd5e1" />
              </div>
              <p style={{ margin: 0 }}>{t("no_reasons_defined")}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 4 }}>
              {doctor.reasons.map(r => {
                const sel = reason?.id === r.id;
                return (
                  <div key={r.id} onClick={() => setReason(sel ? null : r)}
                    style={{
                      padding: "14px 16px", borderRadius: 11, cursor: "pointer", transition: "all 0.2s",
                      border: sel ? "2.5px solid #0891b2" : "1.5px solid var(--border)",
                      background: sel ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : "#fff",
                      boxShadow: sel ? "0 4px 14px rgba(8,145,178,0.14)" : "none",
                      transform: sel ? "scale(1.02)" : "scale(1)"
                    }}
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = "#0891b2"; e.currentTarget.style.background = "#f0fdff"; } }}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "#fafafa"; } }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 700, color: sel ? "#0c4a6e" : "#374151", fontSize: 14 }}>{r.reason_name}</div>
                      {sel && <span style={{ color: "#0891b2", fontSize: 16, fontWeight: 900 }}>✓</span>}
                    </div>
                    {+r.reason_time > 0 && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}><Clock size={11} /> {r.reason_time} {t("minutes")}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {reason && (
            <div style={{ background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: 10, padding: "10px 16px", marginTop: 12, fontSize: 13, color: "#0e7490", display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle size={14} /> {t("selected")} <strong>{reason.reason_name}</strong>
              <button onClick={() => setReason(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, marginRight: "auto", lineHeight: 1 }}>×</button>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Btn variant="secondary" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center", borderRadius: 10 }}>{t("prev")}</Btn>
            <Btn onClick={() => setStep(3)} style={{ flex: 2, justifyContent: "center", padding: 13, borderRadius: 10, fontSize: 14 }}>
              {t("next")}
            </Btn>
          </div>
        </Card>
      )}

      {/* ══════════ STEP 3 — Date & Time ══════════ */}
      {step === 3 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}><Calendar size={19} /> {t("step_date")}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>{t("select_date_time_desc") || "اختر التاريخ والوقت المناسب لك"}</p>

          {/* Date selection grid */}
          <div style={{ marginBottom: 26 }}>
            <label style={{ display: "block", marginBottom: 12, fontWeight: 700, fontSize: 14, color: "#0c4a6e" }}>{t("avail_days")}</label>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
              {getAvailableDates().map(d => {
                const sel = date === d.full;
                return (
                  <div key={d.full} onClick={() => { setDate(d.full); fetchSlots(d.full); }}
                    style={{
                      flexShrink: 0, width: 80, padding: "12px 8px", borderRadius: 14, textAlign: "center", cursor: "pointer",
                      border: sel ? "2.5px solid #0891b2" : "1.5px solid var(--border)",
                      background: sel ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : "#fff",
                      transition: "all 0.2s",
                      boxShadow: sel ? "0 4px 12px rgba(8,145,178,0.15)" : "none",
                      transform: sel ? "translateY(-2px)" : "none"
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: sel ? "#0891b2" : "#9ca3af", marginBottom: 4 }}>{d.weekday}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: sel ? "#0c4a6e" : "#374151" }}>{d.day}</div>
                    <div style={{ fontSize: 11, color: sel ? "#0891b2" : "#9ca3af" }}>{d.month}</div>
                  </div>
                );
              })}
            </div>
            {getAvailableDates().length === 0 && (
              <div style={{ padding: 20, textAlign: "center", background: "#fef2f2", borderRadius: 12, color: "#991b1b", fontSize: 13 }}>
                ⚠️ {t("no_working_days_avail") || "لا توجد أيام عمل متاحة حالياً. يرجى مراجعة جدول عمل الطبيب."}
              </div>
            )}
          </div>

          {/* Time slots grid */}
          {date && (
            <div>
              <label style={{ display: "block", marginBottom: 10, fontWeight: 700, fontSize: 13, color: "#374151" }}>{t("avail_times")}</label>
              {slotsLoad ? <div style={{ padding: "20px 0" }}><Spinner /></div> : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px,1fr))", gap: 8 }}>
                    {slots.map(s => (
                      <div key={s} onClick={() => setSlot(s)}
                        style={{
                          padding: "10px 4px", borderRadius: 10, textAlign: "center", cursor: "pointer",
                          fontWeight: 700, fontSize: 13, transition: "all 0.18s",
                          border: selSlot === s ? "2px solid #0891b2" : "1.5px solid var(--border)",
                          background: selSlot === s ? "linear-gradient(135deg,#0891b2,#0e7490)" : "#fff",
                          color: selSlot === s ? "#fff" : "#374151",
                          boxShadow: selSlot === s ? "0 4px 14px rgba(8,145,178,0.3)" : "none",
                          transform: selSlot === s ? "scale(1.06)" : "scale(1)"
                        }}>
                        {s}
                      </div>
                    ))}
                  </div>
                  {slots.length === 0 && (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", background: "var(--bg)", borderRadius: 12, marginTop: 4 }}>
                      <div style={{ fontSize: 34, marginBottom: 8 }}>📭</div>
                      <div style={{ fontWeight: 600 }}>{t("no_times_avail")}</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>{t("no_times_avail_desc")}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <div style={{ textAlign: "center", padding: "28px 0", color: "#9ca3af", background: "var(--bg)", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <Calendar size={34} color="#cbd5e1" />
            </div>
            <div>{t("select_date_first")}</div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Btn variant="secondary" onClick={() => { setStep(2); setDate(""); setSlots([]); setSlot(""); }} style={{ flex: 1, justifyContent: "center", borderRadius: 10 }}>{t("prev")}</Btn>
            <Btn onClick={() => setStep(4)} disabled={!selSlot || !date} style={{ flex: 2, justifyContent: "center", padding: 13, borderRadius: 10, fontSize: 14 }}>
              {t("next")}
            </Btn>
          </div>
        </Card>
      )}

      {/* ══════════ STEP 4 — Instructions ══════════ */}
      {step === 4 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}>
            <ClipboardList size={22} /> {t("step_instructions")}
          </h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>{t("instructions_desc")}</p>

          <div style={{ background: "#f8fafc", borderRadius: 16, padding: "24px", border: "1px solid var(--border)", marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0c4a6e", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Info size={18} color="var(--brand)" /> {t("instructions_title")}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--brand-light)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{i}</div>
                  <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.5 }}>{t(`instruction_${i}`)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="secondary" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: "center", borderRadius: 10 }}>{t("prev")}</Btn>
            <Btn onClick={() => setStep(5)} style={{ flex: 2, justifyContent: "center", padding: 13, borderRadius: 10, fontSize: 14 }}>
              {t("next")}
            </Btn>
          </div>
        </Card>
      )}

      {/* ══════════ STEP 5 — Confirmation Summary ══════════ */}
      {step === 5 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>{t("review_confirm")}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>{t("review_confirm_desc")}</p>

          <div style={{
            background: "linear-gradient(135deg,#f0fdfa,#ecfeff)",
            border: "1px solid #a5f3fc", borderRadius: 14, padding: "20px 22px", marginBottom: 20
          }}>
            {[
              [<Stethoscope size={18} />, t("doctor"), doctor.fullname],
              [<Building size={18} />, t("specialty"), (i18n.language === 'ar' ? doctor.specialtyar : doctor.specialtyfr) || "—"],
              [<User size={18} />, t("patient"), `${activePat.name}${activePat.isSelf ? ` (${t("self")})` : ` — ${t("family_member")}`}`],
              [<Stethoscope size={18} />, t("step_reason"), (reason?.reason_name || reason?.Reason || reason?.reasons || reason?.motif) || "—"],
              [<Calendar size={18} />, t("date"), date],
              [<Clock size={18} />, t("time"), selSlot],
              ...(+doctor.pricing > 0 ? [[<CreditCard size={18} />, t("consultation_fee"), `${doctor.pricing} ${t("currency")}`]] : []),
            ].map(([ic, lbl, val], idx, arr) => (
              <div key={lbl} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "10px 0",
                borderBottom: idx < arr.length - 1 ? "1px solid rgba(8,145,178,0.12)" : "none"
              }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>{ic}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 2 }}>{lbl}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0c4a6e" }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 10, padding: "11px 16px", marginBottom: 22, fontSize: 13, color: "#854d0e", display: "flex", gap: 8, alignItems: "center" }}>
            <Info size={16} />
            <span>{t("confirmation_email_msg")}</span>
          </div>

          <div style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 14, padding: "20px", marginBottom: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: "#0c4a6e", marginTop: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><FileText size={16} /> {t("privacy_title")}</h3>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, maxHeight: 100, overflowY: "auto", paddingRight: 10, marginBottom: 15, textAlign: "justify" }}>
              {t("privacy_desc")}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "#0891b2", cursor: "pointer" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: agreed ? "#0c4a6e" : "#64748b" }}>{t("privacy_agree")}</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="secondary" onClick={() => setStep(4)} style={{ flex: 1, justifyContent: "center", borderRadius: 10 }}>{t("prev")}</Btn>
            <Btn onClick={confirmBook} loading={loading} disabled={!agreed} style={{ flex: 2, justifyContent: "center", padding: 14, borderRadius: 10, fontSize: 15 }}>
              <Award size={18} style={{ marginLeft: 8 }} /> {t("confirm_final")}
            </Btn>
          </div>
        </Card>
      )}

      {/* ══════════ STEP 6 — Success ══════════ */}
      {step === 6 && (
        <Card style={{ padding: "44px 28px", textAlign: "center" }}>
          {/* Animated success icon */}
          <div style={{
            width: 90, height: 90, borderRadius: "50%", margin: "0 auto 24px",
            background: "linear-gradient(135deg,#059669,#10b981)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 36px rgba(5,150,105,0.35)",
            animation: "popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards"
          }}><Check size={44} color="#fff" /></div>

          <h2 style={{ color: "#059669", fontSize: 24, fontWeight: 900, margin: "0 0 10px" }}>
            {t("success_title")}
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
            {t("success_msg")}{" "}
            <strong style={{ color: "#0c4a6e" }}>{doctor.fullname}</strong>
            <br />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, justifyContent: "center" }}>
              <Calendar size={16} color="#6b7280" />
              <span>{t("day")} <strong style={{ color: "#0891b2" }}>{new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : (i18n.language === 'fr' ? 'fr-FR' : 'en-US'), { weekday: 'long' })} {date}</strong> {t("at_time")} <strong style={{ color: "#0891b2" }}>{selSlot}</strong></span>
            </div>
          </p>

          {/* Mini summary badge */}
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12,
            padding: "14px 20px", marginBottom: 28, textAlign: i18n.language === 'ar' ? "right" : "left"
          }}>
            <div style={{ fontSize: 13, color: "#166534", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <User size={14} /><span><strong>{t("patient")}:</strong> {activePat.name}</span>
            </div>
            {reason && (
              <div style={{ fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                <Stethoscope size={14} /><span><strong>{t("step_reason")}:</strong> {reason?.reason_name || reason?.Reason || reason?.reasons || reason?.motif}</span>
              </div>
            )}
          </div>

          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "11px 16px", marginBottom: 28, fontSize: 13, color: "#1e40af", display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
            <Mail size={14} /><span>{t("email_sent_msg")}</span>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="secondary" onClick={() => navigate("/")} style={{ padding: "11px 26px", borderRadius: 10 }}>
              <Home size={16} style={{ marginLeft: 8 }} /> {t("home")}
            </Btn>
            <Btn onClick={() => navigate("/appointments")} style={{ padding: "11px 26px", borderRadius: 10 }}>
              <Calendar size={16} style={{ marginLeft: 8 }} /> {t("view_my_appts")}
            </Btn>
          </div>
        </Card>
      )}

      <Toast />
    </div>
  );
}


// ── PAGE: MY APPOINTMENTS ─────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: APPOINTMENTS (MY BOOKINGS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AppointmentsPage({ navigate }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [appts, setAppts] = useState([]);
  const [loading, setL] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const { show, Toast } = useToast();
  const now = new Date();

  useEffect(() => {
    api.patient.appointments().then(setAppts).catch(() => { }).finally(() => setL(false));
  }, []);

  const cancel = async (id) => {
    if (!confirm(t("cancel_confirm"))) return;
    try {
      await api.appointments.cancel(id);
      // Instead of filtering out, let's refresh to see it in "Cancelled" tab
      const updated = await api.patient.appointments();
      setAppts(updated);
      show(t("cancel_success"));
    } catch (e) { show(e.message, "error"); }
  };

  const filtered = appts.filter(a => {
    const d = new Date(a.apointementdate);
    if (filter === "upcoming") return (a.status != 1) && d >= now;
    if (filter === "past") return (a.status != 1) && d < now;
    if (filter === "cancelled") return (a.status == 1);
    return true;
  });

  const cnt = (f) => appts.filter(a => {
    const d = new Date(a.apointementdate);
    if (f === "upcoming") return (a.status != 1) && d >= now;
    if (f === "past") return (a.status != 1) && d < now;
    if (f === "cancelled") return (a.status == 1);
    return true;
  }).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px 16px" : "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10, flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
        <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0c4a6e", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <Calendar size={isMobile ? 20 : 24} /> {t("appointments_title")}
        </h1>
        <Btn onClick={() => navigate("/search")} style={{ padding: "9px 18px", fontSize: 13 }}>{t("book_new")}</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[["all", t("all")], ["upcoming", t("upcoming")], ["past", t("past")], ["cancelled", t("cancelled")]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            borderColor: filter === v ? "#0891b2" : "var(--border)",
            background: filter === v ? "#ecfeff" : "var(--bg)",
            color: filter === v ? "#0891b2" : "#6b7280"
          }}>{l} ({cnt(v)})</button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <FileText size={44} color="#cbd5e1" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 16 }}>
            {filter === "upcoming" ? t("no_upcoming") : t("no_results")}
          </div>
          <Btn onClick={() => navigate("/search")}>{t("search")}</Btn>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: isMobile ? 12 : 20
        }}>
          {filtered.map(a => {
            const isPast = new Date(a.apointementdate) < now;
            const d = new Date(a.apointementdate);
            return (
              <Card key={a.id} style={{
                padding: 0,
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: "1px solid var(--border)",
                position: "relative",
                overflow: "hidden"
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "var(--brand)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}>
                {/* Appointment Info Band */}
                <div style={{
                  background: isPast ? "#94a3b8" : "linear-gradient(135deg, rgb(8, 145, 178), rgb(14, 116, 144))",
                  padding: "10px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={14} color="rgba(255,255,255,0.9)" />
                    <span>{d.toLocaleDateString(i18n.language === 'ar' ? "ar-DZ" : "fr-FR", { weekday: 'short' })} {d.toLocaleDateString(i18n.language === 'ar' ? "ar-DZ" : "fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                  </div>
                  <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={14} color="rgba(255,255,255,0.9)" />
                    <span>{d.toLocaleTimeString(i18n.language === 'ar' ? "ar-DZ" : "fr-DZ", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>

                <div style={{ padding: "12px" }}>
                  {/* Header: Photo on the right, Info on the left */}
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <DoctorImage photo={a.photoprofile} size={110} borderRadius={18} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontWeight: 800, color: "#0c4a6e", fontSize: 16, marginBottom: 2 }}>{a.doctorname || t("doctor")}</div>
                        <div>
                          {(a.status == 1) ?
                            <Badge color="#ef4444" style={{ padding: "3px 8px", fontSize: 10 }}>{t("cancelled_badge")}</Badge> :
                            (a.status == 2) ?
                              <Badge color="#0ea5e9" style={{ padding: "3px 8px", fontSize: 10 }}>{t("diagnosed_badge")}</Badge> :
                              isPast ?
                                <Badge color="#94a3b8" style={{ padding: "3px 8px", fontSize: 10 }}>{t("past_badge")}</Badge> :
                                <Badge color="#059669" style={{ padding: "3px 8px", fontSize: 10 }}>{t("upcoming_badge")}</Badge>
                          }
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Building size={12} color="var(--brand)" /> {a.clinicname || "—"}
                      </div>
                      {(a.Reason || a.reasons || a.reason_name || a.ReasonName || a.motif) && (
                        <div style={{ fontSize: 13, color: "#334155", display: "flex", alignItems: "center", gap: 6, marginTop: 4, background: "#f0fdfa", padding: "4px 8px", borderRadius: 6, border: "1px solid #ccfbf1" }}>
                          <Stethoscope size={13} color="var(--brand)" />
                          <span style={{ fontWeight: 700 }}>{t("step_reason")}:</span> {
                            typeof (a.Reason || a.reasons || a.reason_name || a.ReasonName || a.motif) === 'object'
                              ? (a.Reason?.reason_name || a.Reason?.ReasonName || a.reasons?.[0]?.reason_name || "—")
                              : (a.Reason || a.reasons || a.reason_name || a.ReasonName || a.motif)
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {!isPast && (a.status != 1 && a.status != 2) && (
                      <>
                        <Btn variant="danger" onClick={() => cancel(a.id)} style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: 12, borderRadius: 8 }}>
                          <Trash2 size={13} style={{ marginLeft: i18n.language === 'ar' ? 0 : 6, marginRight: i18n.language === 'ar' ? 6 : 0 }} /> {t("cancel_btn")}
                        </Btn>
                        <Btn variant="ghost" onClick={() => navigate("/chat")} style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: 12, borderRadius: 8 }}>
                          <MessageSquare size={13} style={{ marginLeft: i18n.language === 'ar' ? 0 : 6, marginRight: i18n.language === 'ar' ? 6 : 0 }} /> {t("contact")}
                        </Btn>
                      </>
                    )}
                    {isPast && (
                      <>
                        <Btn variant="secondary" onClick={() => navigate(`/clinic/${a.clinicid}/doctor/${a.doctor_id}`)} style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: 12, borderRadius: 8 }}>
                          {t("book_new")}
                        </Btn>
                        <Btn variant="ghost" onClick={() => navigate("/chat")} style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: 12, borderRadius: 8 }}>
                          <MessageSquare size={13} style={{ marginLeft: i18n.language === 'ar' ? 0 : 6, marginRight: i18n.language === 'ar' ? 6 : 0 }} /> {t("contact")}
                        </Btn>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Toast />
    </div>
  );
}




// ── PAGE: ABOUT ──────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: ABOUT (COMPANY INFO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AboutPage({ navigate }) {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#0c4a6e", marginBottom: 16 }}>{t("about_title")}</h1>
        <p style={{ fontSize: 18, color: "#6b7280", maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
          {t("about_desc")}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 60 }}>
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 64, height: 64, background: "var(--brand-light)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Activity size={32} color="var(--brand)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0c4a6e", marginBottom: 12 }}>{t("mission_title")}</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{t("mission_desc")}</p>
        </Card>

        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 64, height: 64, background: "var(--brand-light)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <ShieldCheck size={32} color="var(--brand)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0c4a6e", marginBottom: 12 }}>{t("values_title")}</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{t("values_desc")}</p>
        </Card>

        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 64, height: 64, background: "var(--brand-light)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <HeartPulse size={32} color="var(--brand)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0c4a6e", marginBottom: 12 }}>{t("vision_title")}</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{t("vision_desc")}</p>
        </Card>
      </div>

      <div style={{ background: "var(--bg)", borderRadius: 24, border: "1px solid var(--border)", padding: 48, textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0c4a6e", marginBottom: 20 }}>{t("learn_more_prompt")}</h2>
        <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 32 }}>{t("learn_more_subtitle")}</p>
        <Btn onClick={() => navigate("/contact")} style={{ padding: "14px 36px" }}>{t("start_journey_btn")}</Btn>
      </div>
    </div>
  );
}

// ── PAGE: CONTACT ─────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


// ── PAGE: REGISTER CLINIC ─────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: REGISTER CLINIC (FOR doctors)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RegisterClinicPage({ navigate }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { show, Toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ clinic_name: '', email: '', phone: '', password: '', address: '', notes: '' });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.clinic_name.trim()) e.clinic_name = 'اسم العيادة مطلوب';
    if (!form.email.trim()) e.email = 'البريد الإلكتروني مطلوب';
    if (!form.phone.trim()) e.phone = 'رقم الهاتف مطلوب';
    if (form.password.length < 6) e.password = 'كلمة المرور 6 أحرف على الأقل';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.register.clinic(form);
      setDone(true);
    } catch (e) { show(e.message, 'error'); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: isMobile ? 28 : 48, maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#059669,#047857)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="#fff" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0c4a6e', marginBottom: 12 }}>تم إرسال الطلب بنجاح!</h2>
        <p style={{ color: '#6b7280', lineHeight: 1.8, marginBottom: 28, fontSize: 15 }}>
          تم إرسال طلب تسجيل العيادة بنجاح، سيتم مراجعته من طرف الإدارة وستصلك رسالة عند الموافقة.
        </p>
        <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 12, padding: '14px 20px', marginBottom: 28, textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: '#0f766e', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} /> تفاصيل الطلب
          </div>
          <div style={{ fontSize: 14, color: '#134e4a' }}>العيادة: <strong>{form.clinic_name}</strong></div>
          <div style={{ fontSize: 14, color: '#134e4a' }}>البريد: <strong>{form.email}</strong></div>
        </div>
        <Btn onClick={() => navigate('/')} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>العودة إلى الرئيسية</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px' : '28px 24px' }}>
      <Toast />
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Building size={36} color="var(--brand)" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0c4a6e', marginBottom: 8 }}>تسجيل عيادة جديدة</h1>
        <p style={{ color: '#6b7280', fontSize: 15 }}>أرسل طلبك وسيتم مراجعته من طرف الإدارة خلال 24-48 ساعة</p>
      </div>

      <Card style={{ padding: isMobile ? 20 : 36 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 0 : 20 }}>
          <Input label="اسم العيادة *" placeholder="عيادة الرحمة" value={form.clinic_name} onChange={e => set('clinic_name', e.target.value)} error={errors.clinic_name} />
          <Input label="رقم الهاتف *" placeholder="0550000000" value={form.phone} onChange={e => set('phone', e.target.value)} error={errors.phone} />
        </div>
        <Input label="البريد الإلكتروني *" type="email" placeholder="clinic@example.com" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} />
        <Input label="كلمة المرور *" type="password" placeholder="6 أحرف على الأقل" value={form.password} onChange={e => set('password', e.target.value)} error={errors.password} />
        <Input label="العنوان" placeholder="شارع، مدينة، ولاية" value={form.address} onChange={e => set('address', e.target.value)} />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#374151' }}>معلومات إضافية</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="أي تفاصيل إضافية عن العيادة..."
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>
        <div style={{ background: '#f0fdfa', borderRadius: 12, border: '1px solid #ccfbf1', padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f766e', fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
            <Shield size={16} /> لماذا تنضم إلى طبيبي؟
          </div>
          <ul style={{ margin: 0, paddingRight: 20, fontSize: 13, color: '#134e4a', lineHeight: 2 }}>
            <li>إدارة المواعيد والحجوزات بسهولة تامة</li>
            <li>الوصول لآلاف المرضى في الجزائر</li>
            <li>لوحة تحكم متكاملة للعيادة</li>
            <li>دعم فني متواصل</li>
          </ul>
        </div>
        <Btn onClick={submit} loading={loading} style={{ width: '100%', justifyContent: 'center', padding: 15, fontSize: 16 }}>
          <Send size={18} /> إرسال طلب التسجيل
        </Btn>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 14 }}>
          سيتم مراجعة طلبك من قبل فريق الإدارة وإشعارك بالنتيجة
        </p>
      </Card>
    </div>
  );
}

// ── PAGE: REGISTER DOCTOR ─────────────────────────────────────
function RegisterDoctorPage({ navigate }) {
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation();
  const { show, Toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ fullname: '', speciality: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [specs, setSpecs] = useState([]);

  useEffect(() => {
    api.specialties().then(setSpecs).catch(() => { });
  }, []);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.fullname.trim()) e.fullname = 'الاسم الكامل مطلوب';
    if (!form.speciality.trim()) e.speciality = 'التخصص مطلوب';
    if (!form.email.trim()) e.email = 'البريد الإلكتروني مطلوب';
    if (!form.phone.trim()) e.phone = 'رقم الهاتف مطلوب';
    if (form.password.length < 6) e.password = 'كلمة المرور 6 أحرف على الأقل';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.register.doctor(form);
      setDone(true);
    } catch (e) { show(e.message, 'error'); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: isMobile ? 28 : 48, maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#059669,#047857)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="#fff" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0c4a6e', marginBottom: 12 }}>تم إرسال الطلب بنجاح!</h2>
        <p style={{ color: '#6b7280', lineHeight: 1.8, marginBottom: 28, fontSize: 15 }}>
          تم إرسال طلب تسجيل الطبيب بنجاح، بانتظار موافقة الإدارة. سيتم إشعارك عند قبول طلبك.
        </p>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 20px', marginBottom: 28, textAlign: 'right' }}>
          <div style={{ fontSize: 14, color: '#1e40af' }}>الطبيب: <strong>{form.fullname}</strong></div>
          <div style={{ fontSize: 14, color: '#1e40af' }}>التخصص: <strong>{form.speciality}</strong></div>
          <div style={{ fontSize: 14, color: '#1e40af' }}>البريد: <strong>{form.email}</strong></div>
        </div>
        <Btn onClick={() => navigate('/')} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>العودة إلى الرئيسية</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px' : '28px 24px' }}>
      <Toast />
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Stethoscope size={36} color="#2563eb" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0c4a6e', marginBottom: 8 }}>تسجيل طبيب جديد</h1>
        <p style={{ color: '#6b7280', fontSize: 15 }}>أرسل طلبك وسيتم مراجعته من طرف الإدارة</p>
      </div>
      <Card style={{ padding: isMobile ? 20 : 36 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 0 : 20 }}>
          <Input label="الاسم الكامل *" placeholder="د. محمد أمين" value={form.fullname} onChange={e => set('fullname', e.target.value)} error={errors.fullname} />
          <Select label="التخصص *" value={form.speciality} onChange={e => set('speciality', e.target.value)} error={errors.speciality}>
            <option value="">اختر التخصص...</option>
            {specs.map(s => (
              <option key={s.id} value={i18n.language === 'ar' ? s.namear : s.namefr}>
                {i18n.language === 'ar' ? s.namear : s.namefr}
              </option>
            ))}
          </Select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 0 : 20 }}>
          <Input label="البريد الإلكتروني *" type="email" placeholder="doctor@example.com" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} />
          <Input label="رقم الهاتف *" placeholder="0550000000" value={form.phone} onChange={e => set('phone', e.target.value)} error={errors.phone} />
        </div>
        <Input label="كلمة المرور *" type="password" placeholder="6 أحرف على الأقل" value={form.password} onChange={e => set('password', e.target.value)} error={errors.password} />
        <div style={{ background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e40af', fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
            <AlertCircle size={16} /> ملاحظة مهمة
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#1e3a8a', lineHeight: 1.8 }}>
            بعد الموافقة على طلبك ستتمكن من تسجيل الدخول باستخدام بريدك الإلكتروني وكلمة المرور المُدخلة.
          </p>
        </div>
        <Btn onClick={submit} loading={loading} style={{ width: '100%', justifyContent: 'center', padding: 15, fontSize: 16 }}>
          <Send size={18} /> إرسال طلب التسجيل
        </Btn>
      </Card>
    </div>
  );
}

// ── PAGE: ADMIN DASHBOARD ─────────────────────────────────────
function AdminDashboardPage({ navigate, user }) {
  const isMobile = useIsMobile();
  const { show, Toast } = useToast();
  const [tab, setTab] = useState('overview'); // overview | clinics | doctors
  const [subTab, setSubTab] = useState('PENDING');
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectModal, setRejectModal] = useState(null); // { id, type }
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (tab === 'overview') {
      setLoading(true);
      api.admin.stats().then(setStats).catch(e => show(e.message, 'error')).finally(() => setLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'clinics' || tab === 'doctors') {
      setLoading(true);
      setItems([]);
      const fn = tab === 'clinics' ? api.admin.clinics : api.admin.doctors;
      fn({ status: subTab }).then(d => setItems(d.items || [])).catch(e => show(e.message, 'error')).finally(() => setLoading(false));
    }
  }, [tab, subTab]);

  const doApprove = async (id) => {
    setActionLoading(id);
    try {
      const fn = tab === 'clinics' ? api.admin.approveClinic : api.admin.approveDoctor;
      await fn(id);
      show('✅ تمت الموافقة بنجاح');
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) { show(e.message, 'error'); }
    finally { setActionLoading(''); }
  };

  const doReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    try {
      const fn = tab === 'clinics' ? api.admin.rejectClinic : api.admin.rejectDoctor;
      await fn(rejectModal.id, rejectReason);
      show('تم الرفض');
      setItems(prev => prev.filter(i => i.id !== rejectModal.id));
      setRejectModal(null); setRejectReason('');
    } catch (e) { show(e.message, 'error'); }
    finally { setActionLoading(''); }
  };

  // ── Stat Card
  const StatCard = ({ label, value, icon, color, bg }) => (
    <div style={{ background: '#fff', borderRadius: 18, padding: '20px 24px', border: '1px solid #f0f0f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: bg || '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color || 'var(--brand)', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#0c4a6e', lineHeight: 1 }}>{value ?? '…'}</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );

  // ── Tab Bar
  const tabs = [
    { key: 'overview', label: 'لوحة الإحصائيات', icon: <Activity size={16} /> },
    { key: 'clinics', label: 'طلبات العيادات', icon: <Building size={16} /> },
    { key: 'doctors', label: 'طلبات الأطباء', icon: <Stethoscope size={16} /> },
  ];

  const statusTabs = ['PENDING', 'APPROVED', 'REJECTED'];
  const statusLabel = { PENDING: 'قيد المراجعة', APPROVED: 'مقبولة', REJECTED: 'مرفوضة' };
  const statusColor = { PENDING: '#d97706', APPROVED: '#059669', REJECTED: '#dc2626' };
  const statusBg = { PENDING: '#fef3c7', APPROVED: '#d1fae5', REJECTED: '#fee2e2' };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '12px' : '24px 24px' }}>
      <Toast />

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 440, width: '100%' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0c4a6e', fontWeight: 900 }}>سبب الرفض (اختياري)</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4}
              placeholder="أدخل سبب الرفض للإشعار..." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }} />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <Btn variant="secondary" onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{ flex: 1, justifyContent: 'center' }}>إلغاء</Btn>
              <Btn variant="danger" onClick={doReject} loading={!!actionLoading} style={{ flex: 1, justifyContent: 'center' }}>تأكيد الرفض</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0c4a6e,#0891b2)', borderRadius: 20, padding: isMobile ? '20px 18px' : '28px 32px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 24, fontWeight: 900 }}>لوحة تحكم الإدارة</h1>
              <div style={{ fontSize: 13, opacity: 0.8 }}>مرحباً، {user?.username || 'Admin'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            background: tab === t.key ? 'var(--brand)' : '#fff',
            color: tab === t.key ? '#fff' : '#4b5563',
            boxShadow: tab === t.key ? '0 4px 12px rgba(8,145,178,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
          }}>{t.icon}{t.label}</button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ───── */}
      {tab === 'overview' && (
        <div>
          {loading ? <Spinner size={36} /> : stats && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                <StatCard label="إجمالي العيادات" value={stats.total_clinics} icon={<Building size={22} />} color="#7c3aed" bg="#f5f3ff" />
                <StatCard label="إجمالي الأطباء" value={stats.total_doctors} icon={<Stethoscope size={22} />} color="#0891b2" bg="#ecfeff" />
                <StatCard label="إجمالي المرضى" value={stats.total_patients} icon={<Users size={22} />} color="#059669" bg="#f0fdf4" />
                <StatCard label="إجمالي المواعيد" value={stats.total_appointments} icon={<Calendar size={22} />} color="#d97706" bg="#fffbeb" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
                <StatCard label="مواعيد اليوم" value={stats.today_appointments} icon={<Clock size={22} />} color="#0891b2" bg="#ecfeff" />
                <StatCard label="مواعيد هذا الشهر" value={stats.month_appointments} icon={<Activity size={22} />} color="#7c3aed" bg="#f5f3ff" />
                <div style={{ display: 'grid', gap: 14 }}>
                  <div onClick={() => { setTab('clinics'); setSubTab('PENDING'); }}
                    style={{ background: '#fef3c7', borderRadius: 14, padding: '14px 18px', border: '2px solid #fde68a', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#92400e' }}>{stats.pending_clinics}</div>
                    <div style={{ fontSize: 13, color: '#78350f', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={14} /> عيادات قيد المراجعة
                    </div>
                  </div>
                  <div onClick={() => { setTab('doctors'); setSubTab('PENDING'); }}
                    style={{ background: '#fee2e2', borderRadius: 14, padding: '14px 18px', border: '2px solid #fca5a5', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#991b1b' }}>{stats.pending_doctors}</div>
                    <div style={{ fontSize: 13, color: '#7f1d1d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={14} /> أطباء قيد المراجعة
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── clinics / doctors TAB ───── */}
      {(tab === 'clinics' || tab === 'doctors') && (
        <div>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {statusTabs.map(s => (
              <button key={s} onClick={() => setSubTab(s)} style={{
                padding: '8px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                background: subTab === s ? statusBg[s] : '#fff',
                color: subTab === s ? statusColor[s] : '#9ca3af',
                boxShadow: subTab === s ? `0 0 0 2px ${statusColor[s]}40` : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.18s',
              }}>{statusLabel[s]}</button>
            ))}
          </div>

          {loading ? <Spinner size={32} /> : (
            items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                <CheckCircle size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                <p style={{ fontWeight: 700, fontSize: 16 }}>لا توجد طلبات في هذه الفئة</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {items.map(item => (
                  <div key={item.id} style={{ background: '#fff', borderRadius: 16, padding: isMobile ? '16px' : '20px 24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: '#0c4a6e' }}>
                            {tab === 'clinics' ? item.clinicname : item.fullname}
                          </span>
                          <span style={{ background: statusBg[item.status], color: statusColor[item.status], borderRadius: 20, padding: '2px 12px', fontSize: 12, fontWeight: 700 }}>
                            {statusLabel[item.status]}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '4px 24px' }}>
                          {tab === 'doctors' && <div style={{ fontSize: 13, color: '#6b7280' }}><strong>التخصص:</strong> {item.speciality}</div>}
                          <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={13} /> {item.email}</div>
                          <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} /> {item.phone}</div>
                          {item.address && <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {item.address}</div>}
                          <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> {new Date(item.createdat).toLocaleDateString('ar-DZ')}</div>
                        </div>
                        {item.rejectedreason && (
                          <div style={{ marginTop: 8, background: '#fee2e2', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#991b1b' }}>
                            <strong>سبب الرفض:</strong> {item.rejectedreason}
                          </div>
                        )}
                      </div>

                      {subTab === 'PENDING' && (
                        <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}>
                          <button onClick={() => doApprove(item.id)} disabled={actionLoading === item.id}
                            style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: actionLoading === item.id ? 0.6 : 1 }}>
                            <Check size={15} /> قبول
                          </button>
                          <button onClick={() => setRejectModal({ id: item.id, type: tab })} disabled={!!actionLoading}
                            style={{ padding: '8px 18px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <X size={15} /> رفض
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── PAGE: LEARN MORE ──────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: LEARN MORE (HOW TO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LearnMorePage({ navigate }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px 16px" : "28px 24px" }}>
      <div style={{ marginBottom: 50 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: "#0c4a6e", marginBottom: 24, textAlign: "center" }}>{t("about_tabibi_title")}</h1>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "start", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: 17, color: "#6b7280", marginBottom: 16, lineHeight: 1.6 }}>{t("about_tabibi_desc1")}</p>
          <p style={{ fontSize: 17, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{t("about_tabibi_desc2")}</p>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0c4a6e", marginBottom: 12 }}>{t("how_it_works_title")}</h2>
        <p style={{ fontSize: 16, color: "#6b7280" }}>{t("how_it_works_subtitle")}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40, marginBottom: 60 }}>
        {[
          { icon: <Search size={28} />, title: t("step1_title"), desc: t("step1_desc") },
          { icon: <Calendar size={28} />, title: t("step2_title"), desc: t("step2_desc") },
          { icon: <CheckCircle size={28} />, title: t("step3_title"), desc: t("step3_desc") },
          { icon: <MessageSquare size={28} />, title: t("step4_title"), desc: t("step4_desc") }
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ width: 56, height: 56, background: "var(--brand)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0c4a6e", marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Btn onClick={() => navigate("/search")} style={{ padding: "12px 32px" }}>{t("start_search_btn")}</Btn>
        <Btn variant="secondary" onClick={() => navigate("/")} style={{ padding: "12px 32px" }}>{t("back_to_home")}</Btn>
      </div>
    </div>
  );
}

// ── PAGE: LAW 18-07 ──────────────────────────────────────────
function Law1807Page({ navigate }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const isMobile = useIsMobile();

  const sections = [
    {
      title: isAr ? "النطاق والأهداف" : "Portée et Objectifs",
      icon: <Info size={20} />,
      content: isAr
        ? "يطبّق القانون على معالجة البيانات ذات الطابع الشخصي التي تقوم بها جهات عمومية أو خاصة عندما تتم المعالجة على التراب الوطني أو عندما يكون مسؤول المعالجة مقيّداً في الجزائر، بما يصون الخصوصية والحريات الأساسية."
        : "La loi s'applique au traitement des données à caractère personnel effectué par des entités publiques ou privées lorsque le traitement est effectué sur le territoire national ou lorsque le responsable du traitement est établi en Algérie."
    },
    {
      title: isAr ? "مبادئ المعالجة" : "Principes du Traitement",
      icon: <CheckCircle size={20} />,
      content: isAr
        ? "يجب جمع البيانات لأغراض محددة وصريحة ومشروعة، وعدم معالجتها بطريقة غير متوافقة مع تلك الأغراض. من المبادئ: المشروعية والنزاهة والشفافية وتحديد مدة الاحتفاظ والدقة والسلامة والسرية وتقليل البيانات."
        : "Les données doivent être collectées pour des finalités déterminées, explicites et légitimes. Les principes incluent : la licéité, la loyauté, la transparence, la limitation de la durée de conservation, l'exactitude, l'intégrité et la confidentialité."
    },
    {
      title: isAr ? "حقوق الأشخاص المعنيين" : "Droits des Personnes Concernées",
      icon: <User size={20} />,
      content: isAr
        ? "يعترف القانون بحقوق منها الإعلام والاطلاع والتصحيح والمسح أو الاعتراض وفق الشروط المنصوص عليها. يجب أن تُمارس الطلبات وفق الآليات التي يحددها مسؤول المعالجة."
        : "La loi reconnaît des droits tels que l'information, l'accès, la rectification, l'effacement ou l'opposition. Les demandes doivent être exercées selon les mécanismes définis par le responsable du traitement."
    },
    {
      title: isAr ? "الأمن، التحويلات والجزاءات" : "Sécurité, Transferts et Sanctions",
      icon: <AlertCircle size={20} />,
      content: isAr
        ? "على مسؤول المعالجة اتخاذ تدابير تقنية وتنظيمية ملائمة. تُنظّم عمليات نقل البيانات خارج التراب الوطني. قد تُوقَع جزاءات في حال مخالفة الالتزامات القانونية."
        : "Le responsable du traitement doit prendre des mesures techniques et organisationnelles appropriées. Les transferts de données hors du territoire national sont réglementés. Des sanctions peuvent être appliquées en cas de violation."
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px 16px" : "28px 24px" }}>
      <button onClick={() => navigate("/privacy")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
        {isAr ? "← العودة إلى الخصوصية" : "← Retour à la confidentialité"}
      </button>

      <div style={{ background: "linear-gradient(135deg, #0c4a6e, #0891b2)", borderRadius: 24, padding: "40px", color: "#fff", marginBottom: 32, boxShadow: "0 10px 30px rgba(8,145,178,0.15)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 800, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
            {isAr ? "نص قانوني" : "Texte Légal"}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, lineHeight: 1.3 }}>
            {isAr ? "القانون 18-07 المتعلق بحماية الأشخاص الطبيعيين في معالجة البيانات ذات الطابع الشخصي" : "Loi 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel"}
          </h1>
          <p style={{ fontSize: 16, opacity: 0.9, fontWeight: 500 }}>
            {isAr ? "ملخص منظم للإطلاع فقط — النص المعتمد هو ما ينشر في الجريدة الرسمية." : "Résumé organisé pour information uniquement — Le texte officiel est celui publié au Journal Officiel."}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 20, marginBottom: 40 }}>
        {sections.map((s, i) => (
          <Card key={i} style={{ padding: "28px", display: "flex", gap: 20, alignItems: "flex-start", transition: "transform 0.2s" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--brand-light)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0c4a6e", marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, textAlign: "justify", margin: 0 }}>{s.content}</p>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1.5px dashed var(--border)", borderRadius: 20, padding: "30px", textAlign: "center" }}>
        <h4 style={{ margin: "0 0 8px", color: "#0c4a6e", fontWeight: 800 }}>{isAr ? "للاطلاع على النص الرسمي والمراجع المحدثة:" : "Pour consulter le texte officiel et les références :"}</h4>
        <div style={{ marginBottom: 20 }}>
          <a href="https://anpdp.dz/ar/storage/2025/08/18-07-Edited.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: 18, fontWeight: 900, color: "var(--brand)", textDecoration: "none" }}>
            {isAr ? "الهيئة الوطنية لحماية البيانات ذات الطابع الشخصي (ANPDP)" : "Autorité Nationale de Protection des Données à Caractère Personnel (ANPDP)"}
          </a>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn onClick={() => window.open("https://anpdp.dz/ar/storage/2025/08/18-07-Edited.pdf", "_blank")} style={{ padding: "12px 30px", gap: 10 }}>
            <FileText size={18} />
            {isAr ? "عرض النص الكامل (PDF)" : "Voir le texte complet (PDF)"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── PAGE: PDF VIEWER ──────────────────────────────────────────
function LawPDFViewerPage({ navigate }) {
  const { t, i18n } = useTranslation();
  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 24px" }}>
      <button onClick={() => navigate("/law-18-07")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
        {i18n.language === 'ar' ? "← العودة إلى ملخص القانون" : "← Retour au résumé de la loi"}
      </button>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e" }}>{i18n.language === 'ar' ? "النص الكامل للقانون 18-07" : "Texte complet de la Loi 18-07"}</h1>
      </div>
      <Card style={{ padding: 0, height: "80vh", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <FileText size={80} color="#cbd5e1" style={{ marginBottom: 20 }} />
          <h2 style={{ color: "#64748b" }}>{i18n.language === 'ar' ? "عرض ملف PDF" : "Affichage du fichier PDF"}</h2>
          <p style={{ color: "#94a3b8", maxWidth: 400, margin: "10px auto" }}>
            {i18n.language === 'ar'
              ? "سيتم هنا دمج عارض PDF لعرض الجريدة الرسمية رقم 34 المؤرخة في 10 جوان 2018."
              : "Un lecteur PDF sera intégré ici pour afficher le Journal Officiel n° 34 du 10 juin 2018."}
          </p>
          <div style={{ marginTop: 30 }}>
            <Btn onClick={() => window.open("https://anpdp.dz/ar/storage/2025/08/18-07-Edited.pdf", "_blank")}>
              {i18n.language === 'ar' ? "فتح في نافذة جديدة" : "Ouvrir dans une nouvelle fenêtre"}
            </Btn>
          </div>
        </div>
        {/* Placeholder for real PDF viewer: <iframe src="path/to/law.pdf" width="100%" height="100%" style={{ border: "none" }} /> */}
      </Card>
    </div>
  );
}

// ── PAGE: PRIVACY POLICY ──────────────────────────────────────
function PrivacyPolicyPage({ navigate }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const sections = [
    { title: t("privacy_section1_title"), content: t("privacy_section1_desc") },
    { title: t("privacy_section2_title"), content: t("privacy_section2_desc") },
    { title: t("privacy_section3_title"), content: t("privacy_section3_desc") },
    { title: t("privacy_section4_title"), content: t("privacy_section4_desc") },
    { title: t("privacy_section5_title"), content: t("privacy_section5_desc") },
    { title: t("privacy_section6_title"), content: t("privacy_section6_desc") },
    { title: t("privacy_section7_title"), content: t("privacy_section7_desc") },
    { title: t("privacy_section8_title"), content: t("privacy_section8_desc") },
    { title: t("privacy_section9_title"), content: t("privacy_section9_desc") }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px 16px" : "28px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0c4a6e", marginBottom: 12 }}>{t("privacy_policy_title")}</h1>
        <p style={{ color: "#64748b" }}>
          {i18n.language === 'ar' ? (
            <>نحن نلتزم بحماية خصوصيتك وبياناتك الشخصية وفقاً للقانون <span onClick={() => navigate("/law-18-07")} style={{ color: "var(--brand)", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}>18-07</span> الجزائري.</>
          ) : (
            <>La protection de vos données personnelles est une priorité. Nous nous engageons à les traiter dans le respect de la <span onClick={() => navigate("/law-18-07")} style={{ color: "var(--brand)", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}>loi n° 18-07</span> relative à la protection des données à caractère personnel en Algérie.</>
          )}
        </p>
      </div>
      <Card style={{ padding: "40px" }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 32, borderBottom: i < sections.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: i < sections.length - 1 ? 24 : 0 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--brand)", marginBottom: 14 }}>{s.title}</h3>
            <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.8, textAlign: "justify" }}>{s.content}</p>
          </div>
        ))}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Btn onClick={() => navigate("/")}>{t("back_to_home")}</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── PAGE: TERMS OF USE ────────────────────────────────────────
function TermsOfUsePage({ navigate }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const terms = [
    { title: t("term1_title"), content: t("term1_desc") },
    { title: t("term2_title"), content: t("term2_desc") },
    { title: t("term3_title"), content: t("term3_desc") },
    { title: t("term4_title"), content: t("term4_desc") },
    { title: t("term5_title"), content: t("term5_desc") },
    { title: t("term6_title"), content: t("term6_desc") },
    { title: t("term7_title"), content: t("term7_desc") },
    { title: t("term8_title"), content: t("term8_desc") },
    { title: t("term9_title"), content: t("term9_desc") }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px 16px" : "28px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0c4a6e", marginBottom: 12 }}>{t("terms_title")}</h1>
        <p style={{ color: "#64748b" }}>{t("terms_subtitle")}</p>
      </div>
      <Card style={{ padding: "40px" }}>
        {terms.map((item, i) => (
          <div key={i} style={{ marginBottom: 32, borderBottom: i < terms.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: i < terms.length - 1 ? 24 : 0 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--brand)", marginBottom: 14 }}>{item.title}</h3>
            <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.8, textAlign: "justify" }}>{item.content}</p>
          </div>
        ))}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Btn onClick={() => navigate("/")}>{t("back_to_home")}</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── PAGE: REQUESTS ──────────────────────────────────────────────
function RequestsPage({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [requests, setRequests] = useState([]);
  const [loading, setL] = useState(true);
  const { show, Toast } = useToast();

  const load = async () => {
    try {
      setL(true);
      const reqs = await api.relations.getRequests();
      setRequests(reqs);
    } catch (e) {
      show(e.message, "error");
    } finally {
      setL(false);
    }
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, action) => {
    try {
      await api.relations.respond(id, { action });
      show(action === 'ACCEPT' ? "تمت الموافقة على الطلب" : "تم رفض الطلب", "success");
      load();
    } catch (e) {
      show(e.message, "error");
    }
  };

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", marginBottom: 20 }}>طلبات الانضمام</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {requests.map(r => (
          <Card key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>
                {(r.SenderType?.toUpperCase() === (user.user_type === 1 ? 'DOCTOR' : 'CLINIC')) ? "طلب انضمام إلى:" : "دعوة من:"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0c4a6e" }}>{r.targetname}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                تاريخ الطلب: {new Date(r.createdat).toLocaleDateString(i18n.language)}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {r.status === 'PENDING' ? (
                r.SenderType?.toUpperCase() !== (user.user_type === 1 ? 'DOCTOR' : 'CLINIC') ? (
                  <>
                    <Btn onClick={() => respond(r.id, 'ACCEPT')} style={{ background: "#059669", borderColor: "#059669" }}>
                      <Check size={16} style={{ [i18n.language === 'ar' ? 'marginLeft' : 'marginRight']: 6 }} /> موافقة
                    </Btn>
                    <Btn onClick={() => respond(r.id, 'REJECT')} style={{ background: "#ef4444", borderColor: "#ef4444" }}>
                      <X size={16} style={{ [i18n.language === 'ar' ? 'marginLeft' : 'marginRight']: 6 }} /> رفض
                    </Btn>
                  </>
                ) : (
                  <Badge color="#f59e0b">قيد الانتظار</Badge>
                )
              ) : (
                <Badge color={r.status === 'ACCEPTED' ? "#059669" : "#ef4444"}>
                  {r.status === 'ACCEPTED' ? "مقبول" : "مرفوض"}
                </Badge>
              )}
            </div>
          </Card>
        ))}

        {requests.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            لا توجد طلبات انضمام حالياً
          </div>
        )}
      </div>
      <Toast />
    </div>
  );
}

// ── PAGE: tickets ──────────────────────────────────────────────
function TicketsPage({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [tickets, setTickets] = useState([]);
  const [loading, setL] = useState(true);
  const { show, Toast } = useToast();

  const load = async () => {
    try {
      setL(true);
      const data = await api.tickets.list();
      setTickets(data);
    } catch (e) { show(e.message, "error"); }
    finally { setL(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", margin: 0 }}>الرسائل والمحادثات</h1>
        {user.user_type === 0 && (
          <Btn onClick={() => navigate("/tickets/new")}>
            <Plus size={18} /> رسالة جديدة
          </Btn>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {tickets.map(t => (
          <Card key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0c4a6e" }}>{t.subject}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                {user.user_type === 0 ? (
                  t.doctorname ? `محادثة مع الطبيب: ${t.doctorname}` : (t.clinicname ? `محادثة مع العيادة: ${t.clinicname}` : "رسالة عامة")
                ) : (
                  `من المريض: ${t.patientname}`
                )}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                آخر تحديث: {new Date(t.updated_at).toLocaleString(i18n.language)}
              </div>
            </div>
            <Badge color={t.status === 'CLOSED' ? "#64748b" : (t.status === 'OPEN' ? "#0ea5e9" : "#f59e0b")}>
              {t.status === 'OPEN' ? "مفتوحة" : (t.status === 'PENDING' ? "بانتظار ردك" : "مغلقة")}
            </Badge>
          </Card>
        ))}

        {tickets.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            لا توجد رسائل حالياً
          </div>
        )}
      </div>
      <Toast />
    </div>
  );
}

function TicketConversationPage({ ticketId, navigate, user }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const { show, Toast } = useToast();
  const scrollRef = useRef();

  const load = async () => {
    try {
      const d = await api.tickets.get(ticketId);
      setData(d);
    } catch (e) { show(e.message, "error"); }
    finally { setL(false); }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [data]);

  const onSend = async (e) => {
    e?.preventDefault();
    if (!msg.trim() || sending) return;
    setSending(true);
    try {
      await api.tickets.reply(ticketId, { message: msg });
      setMsg("");
      load();
    } catch (e) { show(e.message, "error"); }
    finally { setSending(false); }
  };

  const onCloseTicket = async () => {
    if (!window.confirm("هل أنت متأكد من إغلاق هذه التذكرة؟")) return;
    try {
      await api.tickets.close(ticketId);
      show("تم إغلاق التذكرة", "success");
      load();
    } catch (e) { show(e.message, "error"); }
  };

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;
  if (!data) return <div style={{ padding: 60, textAlign: "center" }}>Ticket not found</div>;

  const { ticket, messages } = data;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px", height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <button onClick={() => navigate("/tickets")} style={{ background: "none", border: "none", color: "var(--brand)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <ArrowRight size={18} /> العودة للرسائل
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0c4a6e", margin: 0 }}>{ticket.subject}</h1>
        </div>
        {user.user_type !== 0 && ticket.status !== 'CLOSED' && (
          <Btn variant="danger" onClick={onCloseTicket}>إنهاء المحادثة</Btn>
        )}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#fff", borderRadius: 20, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {messages.map(m => {
          const isMe = (user.user_type === 0 && m.sender_type === 'patient') ||
            (user.user_type === 1 && m.sender_type === 'doctor') ||
            (user.user_type === 2 && m.sender_type === 'clinic');
          return (
            <div key={m.id} style={{
              alignSelf: isMe ? "flex-start" : "flex-end",
              maxWidth: "80%",
              padding: "12px 16px",
              borderRadius: 16,
              background: isMe ? "var(--brand)" : "#f1f5f9",
              color: isMe ? "#fff" : "#1e293b",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              position: "relative"
            }}>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.message}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: "left" }}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
      </div>

      {ticket.status !== 'CLOSED' ? (
        <form onSubmit={onSend} style={{ display: "flex", gap: 10 }}>
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="اكتب ردك هنا..."
            style={{ flex: 1, padding: "14px 20px", borderRadius: 12, border: "1.5px solid var(--border)", outline: "none" }}
          />
          <Btn type="submit" loading={sending} disabled={!msg.trim()}>إرسال</Btn>
        </form>
      ) : (
        <div style={{ textAlign: "center", padding: 15, background: "#f1f5f9", borderRadius: 12, color: "#64748b", fontWeight: 700 }}>
          هذه المحادثة مغلقة
        </div>
      )}
      <Toast />
    </div>
  );
}

function NewTicketPage({ navigate, user, qs }) {
  const { show, Toast } = useToast();
  const [loading, setL] = useState(false);
  const [subject, setSub] = useState("");
  const [message, setMsg] = useState("");

  const params = new URLSearchParams(qs);
  const doctor_id = params.get("doctor_id");
  const clinicid = params.get("clinic_id");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setL(true);
    try {
      await api.tickets.create({ subject, message, doctor_id: doctor_id, clinic_id: clinicid });
      show("تم إنشاء التذكرة بنجاح", "success");
      setTimeout(() => navigate("/tickets"), 1500);
    } catch (e) { show(e.message, "error"); }
    finally { setL(false); }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", marginBottom: 24 }}>إرسال رسالة جديدة</h1>
      <Card>
        <form onSubmit={onSubmit}>
          <Input label="عنوان الرسالة (الموضوع)" value={subject} onChange={e => setSub(e.target.value)} placeholder="مثال: استفسار عن موعد" required />
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>محتوى الرسالة</label>
            <textarea
              value={message}
              onChange={e => setMsg(e.target.value)}
              placeholder="اكتب تفاصيل استفسارك هنا..."
              required
              style={{ width: "100%", height: 150, padding: 14, borderRadius: 12, border: "1.5px solid var(--border)", outline: "none", resize: "none", boxSizing: "border-box" }}
            />
          </div>
          <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center" }}>إرسال الآن</Btn>
        </form>
      </Card>
      <Toast />
    </div>
  );
}

// ── PAGE: PROFILE ─────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: PROFILE (ACCOUNT SETTINGS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProfilePage({ user }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  const [form, setForm] = useState(null);
  const [loading, setL] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUPhoto] = useState(false);
  const [verStatus, setVS] = useState(null);
  const [otpModal, setOTP] = useState(null);
  const fileInput = useRef(null);
  const { show, Toast } = useToast();

  const load = async () => {
    try {
      let p;
      if (user?.user_type === 1) p = await api.doctor.profile();
      else if (user?.user_type === 2) p = await api.clinics.profile();
      else p = await api.patient.profile();

      let vs = null;
      if (user?.user_type === 0) vs = await api.verify.status().catch(() => null);

      setForm(p); setVS(vs);
    } catch (e) { show(e.message, "error"); }
    finally { setL(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (user?.user_type === 1) await api.doctor.update(form);
      else if (user?.user_type === 2) await api.clinics.update(form);
      else await api.patient.update(form);
      show(t("save_success"));
    }
    catch (e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUPhoto(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      if (user?.user_type === 2) await api.clinics.uploadLogo(fd);
      else await api.doctor.uploadPhoto(fd);
      show("تم تحديث الصورة بنجاح");
      load();
    } catch (err) { show(err.message, "error"); }
    finally { setUPhoto(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;
  if (!form) return <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>{t("profile_loading_err")}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
      <input type="file" ref={fileInput} onChange={handlePhotoUpload} accept="image/*" style={{ display: "none" }} />
      {/* Header */}
      <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 28 }}>
        <div
          onClick={() => (user?.user_type === 1 || user?.user_type === 2) && fileInput.current?.click()}
          style={{ width: 72, height: 72, borderRadius: 16, background: "linear-gradient(135deg,#0891b2,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", fontWeight: 900, cursor: (user?.user_type === 1 || user?.user_type === 2) ? "pointer" : "default", position: "relative", overflow: "hidden" }}>
          {uploadingPhoto ? <Spinner size={24} /> : (
            (form.photoprofile || form.logo) ? (
              <img src={`data:image/jpeg;base64,${form.photoprofile || form.logo}`} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (form.fullname || form.clinicname || "U")[0].toUpperCase()
            )
          )}
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0c4a6e", margin: "0 0 4px" }}>{form.fullname || form.clinicname}</h1>
          <div style={{ fontSize: 13, color: "#6b7280" }}>{form.email}</div>
          {verStatus && (
            <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge color={verStatus.email_verified ? "#059669" : "#f59e0b"}>
                {verStatus.email_verified ? <Check size={12} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 4 }} /> : <AlertCircle size={12} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 4 }} />}
                {verStatus.email_verified ? t("email_verified") : t("email_unverified")}
              </Badge>
              <Badge color={verStatus.phone_verified ? "#059669" : "#f59e0b"}>
                {verStatus.phone_verified ? <Check size={12} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 4 }} /> : <AlertCircle size={12} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 4 }} />}
                {verStatus.phone_verified ? t("phone_verified") : t("phone_unverified")}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Verification section for patient */}
      {verStatus && (!verStatus.email_verified || !verStatus.phone_verified) && (
        <Card style={{ marginBottom: 20, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <h3 style={{ color: "#92400e", margin: "0 0 14px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Lock size={18} /> {t("id_verification")}</h3>
          <p style={{ color: "#78350f", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
            {t("id_verification_desc")}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!verStatus.email_verified && verStatus.has_email && (
              <Btn variant="ghost" onClick={() => setOTP("email")} style={{ fontSize: 13, padding: "8px 18px" }}>
                <Mail size={14} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 8 }} /> {t("confirm_email_btn")}
              </Btn>
            )}
            {!verStatus.phone_verified && verStatus.has_phone && (
              <Btn variant="ghost" onClick={() => setOTP("phone")} style={{ fontSize: 13, padding: "8px 18px" }}>
                <Phone size={14} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 8 }} /> {t("confirm_phone_btn")}
              </Btn>
            )}
            {!verStatus.has_email && (
              <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> {t("add_email_first")}</div>
            )}
          </div>
        </Card>
      )}

      <form onSubmit={save}>
        {/* Account Info (Doctor & Clinic) */}
        {(user?.user_type === 1 || user?.user_type === 2) && (
          <Card style={{ marginBottom: 14 }}>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><Lock size={18} /> بيانات الدخول</h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 0 : 10 }}>
              <Input label="اسم المستخدم" value={form.username || ""} onChange={e => f("username", e.target.value)} />
              <Input label="تغيير كلمة المرور" type="password" placeholder="اتركه فارغاً إذا لم ترد تغييره" value={form.password || ""} onChange={e => f("password", e.target.value)} />
            </div>
          </Card>
        )}

        {/* Personal Info */}
        <Card style={{ marginBottom: 14 }}>
          <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><User size={18} /> {user?.user_type === 2 ? "معلومات العيادة" : t("personal_info")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 0 : 10 }}>
            <Input label={user?.user_type === 2 ? "اسم العيادة" : t("fullname")} value={form.fullname || form.clinicname || ""} onChange={e => f(user?.user_type === 2 ? "clinicname" : "fullname", e.target.value)} />
            <Input label={t("phone")} type="tel" value={form.phone || ""} onChange={e => f("phone", e.target.value)} />
            <Input label={t("email")} type="email" value={form.email || ""} onChange={e => f("email", e.target.value)} />
            {user?.user_type === 2 && (
              <Input label="العنوان" value={form.address || ""} onChange={e => f("address", e.target.value)} />
            )}

            {user?.user_type === 0 && (
              <>
                <Input label={t("birth_date")} type="date" value={(form.birthdate || "").substring(0, 10)} onChange={e => f("birthdate", e.target.value)} />
                <Input label={t("address")} value={form.address || ""} onChange={e => f("address", e.target.value)} style={{ gridColumn: isMobile ? "auto" : "1/-1" }} />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{t("gender")}</label>
                  <select value={form.gender ?? 0} onChange={e => f("gender", +e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--bg)", boxSizing: "border-box" }}>
                    <option value={0}>{t("male")}</option><option value={1}>{t("female")}</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{t("blood_type")}</label>
                  <select value={form.bloodtype || ""} onChange={e => f("bloodtype", e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--bg)", boxSizing: "border-box" }}>
                    <option value="">{t("not_specified")}</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </>
            )}

            {user?.user_type === 1 && (
              <>
                <Input label="رقم الهاتف الثابت" value={form.fix || ""} onChange={e => f("fix", e.target.value)} />
                <Input label="اللغات المتحدث بها" value={form.speakinglanguage || ""} onChange={e => f("speakinglanguage", e.target.value)} />
                <Input label="تسعيرة الكشف الأساسية" type="number" value={form.pricing || ""} onChange={e => f("pricing", e.target.value)} />
                <Input label="الرمز البريدي" value={form.postcode || ""} onChange={e => f("postcode", e.target.value)} />
              </>
            )}
          </div>
        </Card>

        {user?.user_type === 1 && (
          <Card style={{ marginBottom: 14 }}>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><Briefcase size={18} /> المعلومات المهنية</h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 0 : 10 }}>
              <Input label="رقم casnos" value={form.casnos || ""} onChange={e => f("casnos", e.target.value)} />
              <Input label="رقم rpps" value={form.rpps || ""} onChange={e => f("rpps", e.target.value)} />
              <Input label="رقم التسجيل الطبي" value={form.numregister || ""} onChange={e => f("numregister", e.target.value)} />
              <Input label="الشهادات العلمية" value={form.degrees || ""} onChange={e => f("degrees", e.target.value)} />
              <Input label="الألقاب الأكاديمية" value={form.academytitles || ""} onChange={e => f("academytitles", e.target.value)} />
            </div>
          </Card>
        )}

        {/* Emergency (Patient Only) */}
        {user?.user_type === 0 && (
          <Card style={{ marginBottom: 20 }}>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><Shield size={18} /> {t("emergency_info")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label={t("emergency_phone")} value={form.emergancyphone || ""} onChange={e => f("emergancyphone", e.target.value)} />
              <Input label={t("emergency_email")} type="email" value={form.emergancyemail || ""} onChange={e => f("emergancyemail", e.target.value)} />
            </div>
            <div style={{ marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{t("emergency_notes")}</label>
              <textarea value={form.emergancynote || ""} onChange={e => f("emergancynote", e.target.value)} rows={2}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
            </div>
          </Card>
        )}

        {user?.user_type === 2 && (
          <Card style={{ marginBottom: 14 }}>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><FileText size={18} /> ملاحظات العيادة</h3>
            <textarea value={form.notes || ""} onChange={e => f("notes", e.target.value)} rows={4}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: 'inherit' }} />
          </Card>
        )}

        <Btn type="submit" loading={saving} style={{ width: "100%", justifyContent: "center", padding: 12, fontSize: 15 }}>
          <FileText size={18} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 8 }} /> {t("save_changes")}
        </Btn>
      </form>

      {/* OTP Modal */}
      {otpModal && (
        <OTPModal type={otpModal} show={show}
          onClose={() => setOTP(null)}
          onSuccess={() => { load(); }} />
      )}
      <Toast />
    </div>
  );
}

// ── PAGE: CHAT ────────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: MESSAGING (CHAT)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ChatPage({ user }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [threads, setThreads] = useState([]);
  const [sel, setSel] = useState(null);
  const [messages, setMsgs] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setL] = useState(true);
  const [sending, setSending] = useState(false);
  const { show, Toast } = useToast();
  const bottomRef = useRef(null);

  useEffect(() => {
    api.chat.threads().then(setThreads).catch(() => { }).finally(() => setL(false));
  }, []);

  useEffect(() => {
    if (!sel) return;
    api.chat.messages(sel.id).then(setMsgs).catch(() => { });
  }, [sel]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!newMsg.trim() || !sel) return;
    setSending(true);
    try {
      await api.chat.send(sel.id, { content: newMsg });
      setNewMsg("");
      const msgs = await api.chat.messages(sel.id);
      setMsgs(msgs);
    } catch (e) { show(e.message, "error"); }
    finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: isMobile ? "16px 12px 64px" : "28px 24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}><MessageSquare size={24} /> {t("chat_title")}</h1>
      <div style={{ display: isMobile ? "flex" : "grid", flexDirection: isMobile ? "column" : "row", gridTemplateColumns: isMobile ? "none" : "280px 1fr", gap: 14, height: isMobile ? "auto" : 580 }}>
        {/* Threads */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column", height: isMobile ? 180 : "auto" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6", fontWeight: 800, color: "#374151", fontSize: 13 }}>
            {t("conversations")} ({threads.length})
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && <Spinner />}
            {threads.map(t => (
              <div key={t.id} onClick={() => setSel(t)}
                style={{
                  padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f9fafb",
                  background: sel?.id === t.id ? "#ecfeff" : "transparent", transition: "background 0.15s"
                }}
                onMouseEnter={e => { if (sel?.id !== t.id) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={e => { if (sel?.id !== t.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ fontWeight: 700, color: "#0c4a6e", fontSize: 13, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}><Stethoscope size={14} /> {t.doctorname}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.specialtyfr}</div>
                {t.LastMessage && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.LastMessage}</div>}
              </div>
            ))}
            {!loading && threads.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>{t("no_chats")}</div>
            )}
          </div>
        </div>
        {/* messages */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", height: isMobile ? 480 : "auto" }}>
          {sel ? (
            <>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", fontWeight: 800, color: "#0c4a6e", display: "flex", alignItems: "center", gap: 8 }}>
                <span><Stethoscope size={18} /></span>
                <div>
                  <div style={{ fontSize: 14 }}>{sel.doctorname}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>{sel.specialtyfr}</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map(m => (
                  <div key={m.id} style={{ display: "flex", justifyContent: m.IsDoctor ? "flex-start" : "flex-end" }}>
                    <div style={{
                      maxWidth: "72%", padding: "9px 13px", borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                      background: m.IsDoctor ? "#f3f4f6" : "linear-gradient(135deg,#0891b2,#0e7490)",
                      color: m.IsDoctor ? "#374151" : "#fff",
                      borderBottomRightRadius: !m.IsDoctor ? 3 : 12,
                      borderBottomLeftRadius: m.IsDoctor ? 3 : 12,
                    }}>
                      {m.ContentMessage}
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: "right" }}>
                        {m.DateSend ? new Date(m.DateSend).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
                    {t("start_chat")}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 8 }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder={t("type_msg")}
                  style={{ flex: 1, padding: "9px 13px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, outline: "none" }}
                />
                <Btn onClick={send} loading={sending} style={{ padding: "9px 18px", fontSize: 13 }}>{t("send")}</Btn>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
              <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t("select_chat")}</div>
            </div>
          )}
        </div>
      </div>
      <Toast />
    </div>
  );
}

// ── BACKGROUND DECORATION ────────────────────────────────────
const BackgroundDecoration = () => (
  <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", opacity: 0.04 }}>
    <div style={{ position: "absolute", top: "10%", left: "5%", transform: "rotate(-15deg)", color: "var(--brand)" }}>
      <Stethoscope size={300} />
    </div>
    <div style={{ position: "absolute", bottom: "15%", right: "5%", transform: "rotate(25deg)", color: "var(--brand)" }}>
      <HeartPulse size={250} />
    </div>
    <div style={{ position: "absolute", top: "40%", right: "12%", transform: "rotate(-10deg)", color: "var(--brand)" }}>
      <Activity size={180} />
    </div>
    <div style={{ position: "absolute", bottom: "30%", left: "8%", transform: "rotate(40deg)", color: "var(--brand)" }}>
      <Microscope size={220} />
    </div>
    <div style={{ position: "absolute", top: "5%", right: "25%", transform: "rotate(15deg)", color: "var(--brand)" }}>
      <Syringe size={140} />
    </div>
    {/* Extra scattered icons */}
    <div style={{ position: "absolute", top: "60%", left: "30%", transform: "rotate(-20deg)", color: "var(--brand)" }}>
      <ClipboardList size={120} />
    </div>
    <div style={{ position: "absolute", bottom: "5%", left: "45%", transform: "rotate(10deg)", color: "var(--brand)" }}>
      <Stethoscope size={100} />
    </div>
    <div style={{ position: "absolute", top: "25%", left: "40%", transform: "rotate(45deg)", color: "var(--brand)" }}>
      <History size={110} />
    </div>
    <div style={{ position: "absolute", bottom: "45%", right: "35%", transform: "rotate(-30deg)", color: "var(--brand)" }}>
      <Heart size={90} />
    </div>
    <div style={{ position: "absolute", top: "75%", right: "20%", transform: "rotate(20deg)", color: "var(--brand)" }}>
      <Users size={130} />
    </div>
  </div>
);

// ── FOOTER ───────────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── GLOBAL LAYOUT: FOOTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Footer({ navigate }) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  return (
    <footer style={{
      background: "#fff",
      borderTop: "1px solid var(--border)",
      position: isMobile ? "relative" : "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      boxShadow: isMobile ? "none" : "0 -4px 20px rgba(0,0,0,0.03)"
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px" : "18px 40px",
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: "center", justifyContent: "space-between", gap: isMobile ? 16 : 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Tabibi" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span style={{ fontSize: 16, fontWeight: 900, color: "var(--brand)" }}>{t("app_name")}</span>
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, [i18n.language === 'ar' ? "marginRight" : "marginLeft"]: 8 }}>
            {t("footer_copy")}
          </span>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 16 : 28, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: t("footer_privacy"), path: "/privacy" },
            { label: t("footer_terms"), path: "/terms" },
            { label: "انضم كطبيب", path: "/register-doctor" },
            { label: t("footer_learn_more"), path: "/learn-more" }
          ].map(link => (
            <button
              key={link.label}
              onClick={() => link.path.startsWith("/") ? navigate(link.path) : null}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "var(--text-secondary)", fontWeight: 600,
                transition: "color 0.2s", padding: 0
              }}
              onMouseEnter={e => e.target.style.color = "var(--brand)"}
              onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}
            >{link.label}</button>
          ))}
        </div>
      </div>
    </footer>
  );
}

function ExitModal({ onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000,
      padding: 20
    }}>
      <Card style={{ maxWidth: 400, width: "100%", textAlign: "center", padding: "32px 24px" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "#fee2e2",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", color: "#dc2626"
        }}>
          <LogOut size={32} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0c4a6e", marginBottom: 12 }}>{t("exit_app_title")}</h2>
        <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 28, lineHeight: 1.5 }}>
          {t("exit_app_desc")}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: "center" }}>
            {t("cancel")}
          </Btn>
          <Btn variant="danger" onClick={onConfirm} style={{ flex: 1, justifyContent: "center" }}>
            {t("exit")}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── MAIN APPLICATION ENTRY (ROUTER)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const { t, i18n } = useTranslation();
  const { route, qs, navigate } = useRoute();
  const { user, loading, login, register, logout } = useAuth();
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    const backHandler = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // In hash-based routing, the root is usually "" or "/"
      if (window.location.hash === "" || window.location.hash === "#/" || window.location.hash === "#") {
        setShowExitModal(true);
      } else {
        window.history.back();
      }
    });

    return () => {
      backHandler.then(h => h.remove());
    };
  }, []);


  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(0,146,162,0.1)" }}>
            <Building size={40} color="var(--brand)" />
          </div>
        </div>
        <Spinner size={34} />
        <div style={{ marginTop: 14, color: "#6b7280", fontWeight: 600, fontSize: 14 }}>{t("loading")}</div>
      </div>
    </div>
  );

  // ── Routing ────────────────────────────────────────────────
  const renderPage = () => {
    // /doctor/:id
    const dm2 = route.match(/^\/doctor\/([^?#/]+)/);
    if (dm2) return <DoctorDetailPage key={route} doctor_id={dm2[1]} navigate={navigate} user={user} />;

    // /clinic/:cId/doctor/:dId  — MUST check before switch
    const dm = route.match(/^\/clinic\/([^?#/]+)\/doctor\/([^?#/]+)/);
    if (dm) return <DoctorDetailPage key={route} clinicid={dm[1]} doctor_id={dm[2]} navigate={navigate} user={user} />;

    // /clinic/:id
    const cm = route.match(/^\/clinic\/([^?#/]+)$/);
    if (cm) return <ClinicDetailsPage key={route} clinicid={cm[1]} navigate={navigate} user={user} />;

    // /book/:cId/:dId
    const bm = route.match(/^\/book\/([^?#/]+)\/([^?#/]+)/);
    if (bm) {
      if (!user) { setTimeout(() => navigate("/login"), 0); return null; }
      return <BookPage key={route} clinicid={bm[1]} doctor_id={bm[2]} navigate={navigate} user={user} />;
    }

    switch (route) {
      case "/":
        return <HomePage key="home" user={user} navigate={navigate} />;
      case "/login":
        if (user) { setTimeout(() => navigate("/"), 0); return null; }
        return <LoginPage key="login" onLogin={login} navigate={navigate} />;
      case "/register":
        if (user) { setTimeout(() => navigate("/"), 0); return null; }
        return <RegisterPage key="register" onRegister={register} navigate={navigate} />;
      case "/search":
        return <SearchPage key={route + qs} navigate={navigate} qs={qs} user={user} />;
      case "/about":
        return <AboutPage navigate={navigate} />;
      case "/contact":
        return <ContactPage navigate={navigate} />;
      case "/register-clinic":
        return <RegisterClinicPage navigate={navigate} />;
      case "/register-doctor":
        return <RegisterDoctorPage navigate={navigate} />;
      case "/admin":
        if (!user || user.user_type !== 3) { setTimeout(() => navigate("/"), 0); return null; }
        return <AdminDashboardPage navigate={navigate} user={user} />;
      case "/learn-more":
        return <LearnMorePage navigate={navigate} />;
      case "/privacy":
        return <PrivacyPolicyPage navigate={navigate} />;
      case "/law-18-07":
        return <Law1807Page navigate={navigate} />;
      case "/law-pdf":
        return <LawPDFViewerPage navigate={navigate} />;
      case "/terms":
        return <TermsOfUsePage navigate={navigate} />;
      case "/appointments":
        if (!user) { setTimeout(() => navigate("/login"), 0); return null; }
        return <AppointmentsPage key="appts" navigate={navigate} />;
      case "/profile":
        if (!user) { setTimeout(() => navigate("/login"), 0); return null; }
        return <ProfilePage key="profile" user={user} />;
      case "/requests":
        if (!user || (user.user_type !== 1 && user.user_type !== 2)) { setTimeout(() => navigate("/"), 0); return null; }
        return <RequestsPage key="requests" navigate={navigate} user={user} />;
      case "/tickets":
        if (!user) { setTimeout(() => navigate("/login"), 0); return null; }
        return <TicketsPage key="tickets" navigate={navigate} user={user} />;
      case "/tickets/new":
        if (!user || user.user_type !== 0) { setTimeout(() => navigate("/"), 0); return null; }
        return <NewTicketPage key="new_ticket" navigate={navigate} user={user} qs={qs} />;
      default:
        if (route.startsWith("/tickets/")) {
          if (!user) { setTimeout(() => navigate("/login"), 0); return null; }
          const tid = route.split("/")[2];
          return <TicketConversationPage key={tid} ticketId={tid} navigate={navigate} user={user} />;
        }
        return (
          <div key="404" style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                <Search size={48} color="#94a3b8" />
              </div>
            </div>
            <h1 style={{ color: "#0c4a6e", fontWeight: 900 }}>{t("page_not_found")}</h1>
            <Btn onClick={() => navigate("/")} style={{ marginTop: 20 }}>{t("back_to_home")}</Btn>
          </div>
        );
    }
  };

  return (
    <div style={{
      fontFamily: i18n.language === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif",
      minHeight: "100vh",
      background: "var(--bg)",
      width: "100%",
      overflowX: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>

      <style>{`
        * { box-sizing:border-box; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes popIn {
          0%   { transform:scale(0); opacity:0; }
          70%  { transform:scale(1.15); opacity:1; }
          100% { transform:scale(1); }
        }
        body { margin:0; padding:0; }
        input,select,textarea,button { font-family:inherit; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#f3f4f6; }
        ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:3px; }
      `}</style>
      <Navbar user={user} navigate={navigate} onLogout={logout} />
      <BackgroundDecoration />
      <div style={{ flex: 1, paddingBottom: 80, position: "relative", zIndex: 1 }}>
        {renderPage()}
      </div>
      <Footer navigate={navigate} />

      {showExitModal && (
        <ExitModal
          onConfirm={() => CapacitorApp.exitApp()}
          onCancel={() => setShowExitModal(false)}
        />
      )}
    </div>
  );
}
