import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Calendar, MessageSquare, User, LogOut,
  ChevronDown, Menu, X, Bell, LayoutDashboard,
  Settings, CreditCard, Heart, MapPin, Clock, Star,
  ShieldCheck, Phone, Mail, Languages, Info, ArrowLeft, ArrowRight,
  Eye, Baby, Bone, Brain, Smile, Sparkles, Stethoscope, HeartPulse,
  Flame, Award, Users, Home, ClipboardList, Activity,
  Lock, Shield, CheckCircle, AlertCircle, ThumbsUp,
  UserPlus, Building, Check, AlertTriangle, Send,
  FileText, HelpCircle, History, Briefcase, Plus, Trash2, Microscope, Syringe
} from "lucide-react";

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
    if (e instanceof TypeError) throw new Error("Impossible de contacter le serveur. Vérifiez que le api  ");
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
  clinics: {
    search: p => req("GET", `/clinics?${new URLSearchParams(p)}`),
    one: id => req("GET", `/clinics/${id}`),
    doctor: (c, d) => req("GET", `/clinics/${c}/doctors/${d}`),
  },
  specialties: () => req("GET", "/specialties"),
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

// Rating Stars
const Stars = ({ rating = 0, interactive, onChange, size = 18 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} onClick={() => interactive && onChange?.(i)}
        style={{ fontSize: size, cursor: interactive ? "pointer" : "default", color: i <= rating ? "#f59e0b" : "#d1d5db", transition: "color 0.1s" }}>★</span>
    ))}
  </div>
);

// Doctor Image Placeholder / Avatar
const DoctorImage = ({ photo, size = 50, borderRadius = 12, style = {} }) => {
  if (photo) {
    return (
      <img
        src={`data:image/jpeg;base64,${photo}`}
        alt="Doctor"
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
      <User size={size * 0.5} color="var(--brand)" />
    </div>
  );
};

// Decorative Badge
const Badge = ({ children, color = "#0891b2" }) => (
  <span style={{ background: color + "15", color, border: `1px solid ${color}30`, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{children}</span>
);

// Wrapper Card
const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 24,
    cursor: onClick ? "pointer" : "default", ...style
  }}>{children}</div>
);

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
      showToast(`تم إرسال رمز OTP إلى ${d.target || type}`);
    } catch (e) { showToast(e.message, "error"); }
    finally { setL(false); }
  };

  const confirmOTP = async () => {
    if (code.length !== 6) { showToast("الرمز يجب أن يكون 6 أرقام", "error"); return; }
    setL(true);
    try {
      await api.verify.confirm({ type, code });
      showToast(type === "email" ? "✅ تم تأكيد البريد الإلكتروني" : "✅ تم تأكيد رقم الهاتف");
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
            {type === "email" ? "تأكيد البريد" : "تأكيد الهاتف"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9ca3af" }}>×</button>
        </div>

        {step === "send" ? (
          <>
            <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: 24 }}>
              {type === "email"
                ? "سيتم إرسال رمز مكون من 6 أرقام إلى بريدك الإلكتروني. صالح لمدة 10 دقائق."
                : "سيتم إرسال رمز مكون من 6 أرقام إلى رقم هاتفك. (وضع تطوير: سيظهر الرمز في الشاشة)"}
            </p>
            <Btn onClick={sendOTP} loading={loading} style={{ width: "100%", justifyContent: "center", padding: 13 }}>
              إرسال رمز التحقق
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
                إعادة الإرسال
              </Btn>
              <Btn onClick={confirmOTP} loading={loading} style={{ flex: 2, justifyContent: "center" }} disabled={code.length !== 6}>
                تأكيد الرمز <Check size={16} style={{ marginRight: 8 }} />
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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const name = user?.profile?.FullName?.split(" ")[0] || user?.username || "U";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "البحث", icon: <Search size={18} />, path: "/search" },
    { label: "مواعيدي", icon: <Calendar size={18} />, path: "/appointments", private: true },
    { label: "الرسائل", icon: <MessageSquare size={18} />, path: "/chat", private: true },
    { label: "حول", icon: <Info size={18} />, path: "/about" },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: scrolled ? "rgba(255, 255, 255, 0.9)" : "#fff",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: scrolled ? "0 4px 20px rgba(0, 146, 162, 0.1)" : "none",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 24px", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo Section */}
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "transform 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Tabibi" style={{ width: 40, height: 40, objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--brand)", lineHeight: 1, letterSpacing: -0.5 }}>طبيبي</div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 3, fontWeight: 700, marginTop: 2 }}>TABIBI</div>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

        {/* User Actions */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <div style={{ position: "relative" }}>
              <button onClick={() => setOpen(!open)} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: 50, padding: "6px 14px 6px 6px", cursor: "pointer",
                transition: "all 0.2s", boxShadow: open ? "0 0 0 2px var(--brand-light)" : "none"
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--brand)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = open ? "var(--brand)" : "var(--border)"}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--brand), var(--brand-dark))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 14,
                  boxShadow: "0 2px 8px rgba(0, 146, 162, 0.2)"
                }}>
                  {name[0].toUpperCase()}
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{name}</span>
                <ChevronDown size={14} style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {open && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: -1 }} onClick={() => setOpen(false)} />
                  <div style={{
                    position: "absolute", left: 0, top: "calc(100% + 12px)",
                    background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    minWidth: 220, overflow: "hidden", zIndex: 1001,
                    animation: "fadeIn 0.2s ease"
                  }}>
                    <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.profile?.FullName || user.username}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{user.email}</div>
                    </div>
                    {[
                      { icon: <User size={16} />, label: "ملفي الشخصي", path: "/profile" },
                      { icon: <Calendar size={16} />, label: "مواعيدي", path: "/appointments" },
                      { icon: <MessageSquare size={16} />, label: "رسائلي", path: "/chat" },
                    ].map(item => (
                      <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); }} style={{
                        width: "100%", padding: "12px 16px", background: "none", border: "none",
                        cursor: "pointer", textAlign: "right", display: "flex", alignItems: "center",
                        gap: 12, fontSize: 14, color: "var(--text-secondary)", transition: "all 0.15s"
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--brand-light)"; e.currentTarget.style.color = "var(--brand)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                        <span style={{ opacity: 0.7, display: "flex" }}>{item.icon}</span>
                        <span style={{ fontWeight: 600 }}>{item.label}</span>
                      </button>
                    ))}
                    <div style={{ borderTop: "1px solid var(--border)" }} />
                    <button onClick={() => { onLogout(); setOpen(false); }} style={{
                      width: "100%", padding: "14px 16px", background: "none", border: "none",
                      cursor: "pointer", textAlign: "right", display: "flex", alignItems: "center",
                      gap: 12, fontSize: 14, color: "#dc2626", transition: "all 0.15s"
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fff1f2"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <LogOut size={16} />
                      <span style={{ fontWeight: 700 }}>تسجيل خروج</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate("/login")} style={{
                padding: "10px 22px", background: "transparent",
                border: "1.5px solid var(--brand)", borderRadius: "var(--radius-sm)",
                color: "var(--brand)", fontSize: 14, fontWeight: 700, transition: "all 0.2s", cursor: "pointer"
              }}
                onMouseEnter={e => { e.target.style.background = "var(--brand-light)" }}
                onMouseLeave={e => { e.target.style.background = "transparent" }}>دخول</button>
              <button onClick={() => navigate("/register")} style={{
                padding: "10px 22px", background: "var(--brand)",
                border: "none", borderRadius: "var(--radius-sm)",
                color: "#fff", fontSize: 14, fontWeight: 700, transition: "all 0.2s", cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 146, 162, 0.2)"
              }}
                onMouseEnter={e => { e.target.style.background = "var(--brand-dark)" }}
                onMouseLeave={e => { e.target.style.background = "var(--brand)" }}>إنشاء حساب</button>
            </div>
          )}
        </div>
      </div>
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
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [specialties, setSP] = useState([]);
  const [hoveredSpec, setHoveredSpec] = useState(null);

  useEffect(() => {
    api.specialties().then(setSP).catch(() => { });
  }, []);

  const getIcon = (nameFr) => {
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
    return map[nameFr] || <Stethoscope size={22} />;
  };

  const handleSearch = (query = q) => {
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── SECTION: HERO ── */}
      <section style={{ background: "transparent", position: "relative", overflow: "hidden" }}>
        {/* Teal bg */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "var(--brand)" }} />

        {/* ── MEDICAL ICONS ── */}
        <StethoscopeIcon size={120} opacity={0.16} style={{ top: -20, left: -20, transform: "rotate(-15deg)" }} />
        <StethoscopeIcon size={70} opacity={0.14} style={{ top: "40%", right: "5%", transform: "rotate(20deg)" }} />
        <StethoscopeIcon size={90} opacity={0.15} style={{ bottom: "25%", left: "15%", transform: "rotate(45deg)" }} />

        <PillIcon size={50} opacity={0.18} style={{ top: "15%", right: "20%", transform: "rotate(-25deg)" }} />
        <PillIcon size={40} opacity={0.15} style={{ bottom: "35%", right: "15%", transform: "rotate(40deg)" }} />
        <PillIcon size={65} opacity={0.17} style={{ top: "60%", left: "5%", transform: "rotate(-10deg)" }} />

        <CrescentIcon size={34} opacity={0.15} style={{ top: "12%", left: "32%", transform: "rotate(-10deg)" }} />
        <CrescentIcon size={24} opacity={0.14} style={{ bottom: "45%", left: "42%", transform: "rotate(20deg)" }} />
        <CrescentIcon size={40} opacity={0.16} style={{ top: "50%", left: "28%", transform: "rotate(15deg)" }} />

        <SyringeIcon size={110} opacity={0.15} style={{ top: "8%", right: "32%", transform: "rotate(-30deg)" }} />
        <SyringeIcon size={80} opacity={0.14} style={{ bottom: "20%", right: "30%", transform: "rotate(15deg)" }} />

        {/* Soft glow circles */}
        <div style={{ position: "absolute", top: -100, left: -100, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: 20, right: -80, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "88px 40px 116px",
          textAlign: "center", position: "relative", zIndex: 2,
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.13)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 30, padding: "5px 18px",
            color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 28,
          }}>
            <div style={{ width: 7, height: 7, background: "#7ffff4", borderRadius: "50%" }} />
            المنصة الأولى لحجز المواعيد في الجزائر
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 900,
            color: "#fff", lineHeight: 1.1, marginBottom: 14,
          }}>
            طبيبك يرافقك أينما تذهب
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.65)", fontWeight: 500, marginBottom: 44 }}>
            ابحث، احجز، وتابع — كل شيء في مكان واحد
          </p>

          {/* Search bar */}
          <div style={{
            maxWidth: 600, margin: "0 auto",
            background: "#fff", borderRadius: 14, padding: 6,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: focused ? "0 0 0 3px rgba(255,255,255,0.3)" : "0 8px 40px rgba(0,0,0,0.15)",
            transition: "all 0.2s",
          }}>
            <button
              onClick={() => handleSearch()}
              style={{
                background: "var(--brand)", border: "none", borderRadius: 10,
                color: "#fff", fontSize: 15, fontWeight: 700,
                padding: "10px 28px", whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.2s",
                cursor: "pointer"
              }}
              onMouseEnter={e => e.target.style.background = "var(--brand-dark)"}
              onMouseLeave={e => e.target.style.background = "var(--brand)"}
            >بحث</button>
            <input type="text" value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="تخصص، طبيب، عيادة، ولاية..."
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: 14, color: "#333", background: "transparent",
                textAlign: "right", direction: "rtl", padding: "4px 8px",
              }}
            />
            <Search size={18} style={{ flexShrink: 0, marginLeft: 6, color: "#c5c9d0" }} />
          </div>

          {/* Quick tags */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            {["طب عام", "أمراض قلب", "طب أسنان", "أطفال", "جلدية"].map(tag => (
              <button key={tag} onClick={() => { setQ(tag); handleSearch(tag); }} style={{
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 20, padding: "4px 14px", color: "rgba(255,255,255,0.85)",
                fontSize: 13, fontWeight: 600, transition: "all 0.2s", cursor: "pointer"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.22)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)" }}
              >{tag}</button>
            ))}
          </div>
        </div>

        {/* ── BOTTOM SHAPE ── */}
        <div style={{ position: "absolute", bottom: -2, left: "-1%", width: "102%", zIndex: 3, height: 82, overflow: "visible" }}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: "100%" }}>
            {/* Shadow Path - Follows the curve but blurred */}
            <path d="M-10,100 Q0,0 150,0 L1290,0 Q1440,0 1450,100"
              fill="none" stroke="black" strokeWidth="12"
              style={{ filter: "blur(12px)", opacity: 0.12 }} />
            {/* Main White Mask */}
            <path d="M-10,100 Q0,0 150,0 L1290,0 Q1440,0 1450,100 Z" fill="var(--bg)" />
          </svg>
        </div>
      </section>

      {/* ── SECTION: STATS (NUMBERS) ── */}
      <div style={{ maxWidth: 900, margin: "-32px auto 60px", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {[
            {
              num: "+1,200", label: "طبيب",
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ),
            },
            {
              num: "+800", label: "عيادة",
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
            },
            {
              num: "+50,000", label: "مريض موثوق",
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
            },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#fff",
              padding: "28px 24px",
              textAlign: "center",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 4px 24px rgba(0,146,162,0.06)",
            }}>
              <div style={{
                width: 48, height: 48, background: "var(--brand-light)",
                borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: "var(--brand)", lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION: SPECIALTIES ── */}
      <section style={{ background: "transparent", padding: "80px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28, position: "relative" }}>
            {/* Decoration */}
            <div style={{ position: "absolute", top: -40, right: -60, opacity: 0.05, color: "var(--brand)", transform: "rotate(10deg)" }}>
              <Activity size={180} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>التخصصات الطبية</h2>
            <button onClick={() => navigate("/search")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--brand)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>عرض الكل <ArrowLeft size={14} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {specialties.slice(0, 8).map((s, i) => (
              <div key={s.ID}
                onClick={() => navigate(`/search?specialty=${s.ID}`)}
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
                    {getIcon(s.NameFr)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{s.NameAr}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>{s.NameFr}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: HOW IT WORKS (STEPS) ── */}
      <section style={{ background: "transparent", padding: "80px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ position: "relative" }}>
            {/* Decoration */}
            <div style={{ position: "absolute", top: -20, left: -100, opacity: 0.05, color: "var(--brand)", transform: "rotate(-15deg)" }}>
              <Stethoscope size={220} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 32 }}>
              كيف يعمل طبيبي؟
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              {
                n: "01",
                title: "ابحث عن طبيبك",
                desc: "حسب التخصص أو الاسم أو الولاية",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                ),
              },
              {
                n: "02",
                title: "احجز في ثوانٍ",
                desc: "اختر الوقت المناسب بدون انتظار ولا اتصال",
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
                title: "احضر واستشر",
                desc: "استقبل تأكيداً فورياً وتذكيراً قبل موعدك",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
              },
            ].map((s, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: "var(--radius-lg)",
                padding: "32px 28px", position: "relative", overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
              }}>
                {/* Big number bg */}
                <div style={{
                  position: "absolute", top: -10, left: 16,
                  fontSize: 80, fontWeight: 900, color: "var(--brand)",
                  opacity: 0.2, lineHeight: 1, userSelect: "none",
                }}>{s.n}</div>

                <div style={{
                  width: 52, height: 52, background: "var(--brand)",
                  borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 500 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: DOCTOR CTA (JOIN US) ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 64px" }}>
        <div style={{
          background: "var(--brand)", borderRadius: "var(--radius-xl)",
          padding: "52px 56px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32,
          position: "relative", overflow: "hidden",
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

          <div style={{ position: "relative" }}>
            <div style={{
              display: "inline-block", background: "rgba(255,255,255,0.15)",
              borderRadius: 20, padding: "3px 12px", fontSize: 12,
              color: "#fff", fontWeight: 600, marginBottom: 12,
            }}>للأطباء والعيادات</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
              أنت طبيب؟ انضم إلى طبيبي
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              أدر مواعيدك وعيادتك بشكل أذكى وأسرع
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexShrink: 0, position: "relative" }}>
            <button onClick={() => navigate("/learn-more")} style={{
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              borderRadius: 10, padding: "12px 28px",
              color: "#fff", fontSize: 14, fontWeight: 700,
              transition: "all 0.2s", cursor: "pointer"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >اعرف أكثر</button>
            <button onClick={() => navigate("/register-clinic")} style={{
              background: "var(--bg)", border: "none",
              borderRadius: 10, padding: "12px 28px",
              color: "var(--brand)", fontSize: 14, fontWeight: 800,
              transition: "all 0.2s", cursor: "pointer"
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >سجّل عيادتك</button>
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
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0c4a6e", margin: "0 0 6px" }}>مرحباً بعودتك</h1>
          <p style={{ color: "#6b7280", fontSize: 13 }}>سجّل دخولك إلى حسابك في طبيبي</p>
        </div>
        <Card>
          {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 14px", marginBottom: 14, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <Input label="اسم المستخدم" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="أدخل اسم المستخدم" required />
            <Input label="كلمة المرور" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
            <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 12, marginTop: 6 }}>
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </Btn>
          </form>
          <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#6b7280" }}>
            ليس لديك حساب؟ <button onClick={() => navigate("/register")} style={{ color: "#0891b2", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>سجّل الآن</button>
          </p>
        </Card>
        <div style={{ marginTop: 16, background: "rgba(249, 250, 251, 0.5)", border: "1px solid #fed7aa", borderRadius: 10, padding: "11px 14px", fontSize: 12 }}>
          <strong style={{ color: "#ea580c", display: "flex", alignItems: "center", gap: 6 }}><Lock size={14} /> حساب تجريبي:</strong>
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
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", margin: "0 0 6px" }}>إنشاء حساب جديد</h1>
        </div>
        <Card>
          {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 14px", marginBottom: 14, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="الاسم الكامل *" value={form.fullname} onChange={e => f("fullname", e.target.value)} placeholder="محمد أمين" required />
              <Input label="اسم المستخدم *" value={form.username} onChange={e => f("username", e.target.value)} placeholder="mohammedamine" required />
            </div>
            <Input label="البريد الإلكتروني *" type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="exemple@gmail.com" required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="الهاتف" type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="0699123456" />
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>الجنس</label>
                <select value={form.gender} onChange={e => f("gender", +e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--bg)", boxSizing: "border-box" }}>
                  <option value={0}>ذكر</option><option value={1}>أنثى</option>
                </select>
              </div>
            </div>
            <Input label="كلمة المرور *" type="password" value={form.password} onChange={e => f("password", e.target.value)} placeholder="8 أحرف على الأقل" required />
            <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 12, marginTop: 6 }}>
              {loading ? "جاري الإنشاء..." : <>إنشاء الحساب <Plus size={18} style={{ marginRight: 8 }} /></>}
            </Btn>
          </form>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6b7280" }}>
            لديك حساب؟ <button onClick={() => navigate("/login")} style={{ color: "#0891b2", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>سجّل الدخول</button>
          </p>
        </Card>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: SEARCH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SearchPage({ navigate, qs }) {
  const params = new URLSearchParams(qs);
  const [q, setQ] = useState(params.get("q") || "");
  const [sp, setSP] = useState(params.get("specialty") || "");
  const [results, setR] = useState([]);
  const [spList, setSPL] = useState([]);
  const [loading, setL] = useState(false);
  const [total, setT] = useState(0);
  const { show, Toast } = useToast();

  useEffect(() => { api.specialties().then(setSPL).catch(() => { }); }, []);

  const doSearch = useCallback(async (qv, spv) => {
    setL(true);
    try {
      const d = await api.clinics.search({ q: qv, specialty: spv, limit: 24 });
      setR(d.items || []); setT(d.total || 0);
    } catch (e) { show(e.message, "error"); setR([]); }
    finally { setL(false); }
  }, []);

  useEffect(() => { doSearch(q, sp); }, [sp]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", marginBottom: 6 }}>البحث عن طبيب</h1>
      <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 13 }}>ابحث من بين آلاف الأطباء في جميع أنحاء الجزائر</p>

      <Card style={{ marginBottom: 20, padding: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch(q, sp)}
            placeholder="اسم الطبيب أو العيادة أو التخصص..."
            style={{ flex: 2, minWidth: 180, padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", direction: "rtl", boxSizing: "border-box" }}
          />
          <select value={sp} onChange={e => setSP(e.target.value)}
            style={{ flex: 1, minWidth: 150, padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, background: "var(--bg)", boxSizing: "border-box" }}>
            <option value="">كل التخصصات</option>
            {spList.map(s => <option key={s.ID} value={s.ID}>{s.NameAr} — {s.NameFr}</option>)}
          </select>
          <Btn onClick={() => doSearch(q, sp)} style={{ padding: "10px 24px", whiteSpace: "nowrap" }}>بحث</Btn>
        </div>
      </Card>

      {loading ? <Spinner /> : (
        <>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
            {total > 0 ? `${total} نتيجة` : "لا توجد نتائج"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 14 }}>
            {results.map(r => (
              <div key={r.ClinicsDoctor_id}
                onClick={() => navigate(`/clinic/${r.ClinicId}/doctor/${r.DoctorId}`)}
                style={{
                  background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 12,
                  cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex", flexDirection: "column", gap: 8,
                  position: "relative", overflow: "hidden",
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
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <DoctorImage photo={r.PhotoProfile} size={120} borderRadius={24} />
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
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--brand)", background: "var(--brand-light)", padding: "3px 12px", borderRadius: 20 }}>{r.SpecialtyAr}</span>
                      {+r.Experience > 0 && (
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={12} /> {r.Experience} سنة
                        </div>
                      )}
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 900, color: "#0c4a6e", margin: "0 0 4px" }}>{r.DoctorName}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ fontSize: 13, color: "#334155", display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                        <Building size={14} color="var(--brand)" /> {r.ClinicName}
                      </div>
                      {r.ClinicAddress && (
                        <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                          <MapPin size={12} /> {r.ClinicAddress.split(",")[0]}
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
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>({r.RatingCount} تقييم)</span>
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>سعر الكشف</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#059669" }}>
                      {+r.Pricing > 0 ? `${r.Pricing} DA` : "غير محدد"}
                    </div>
                  </div>
                </div>
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: DOCTOR DETAIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DoctorDetailPage({ clinicId, doctorId, navigate, user }) {
  const [data, setData] = useState(null);
  const [ratings, setR] = useState(null);
  const [loading, setL] = useState(true);
  const [tab, setTab] = useState("info");
  const [myRating, setMR] = useState(0);
  const [myComment, setMC] = useState("");
  const [saving, setSav] = useState(false);
  const { show, Toast } = useToast();

  useEffect(() => {
    setL(true);
    Promise.all([
      api.clinics.doctor(clinicId, doctorId),
      api.ratings.doctor(doctorId),
    ]).then(([d, r]) => { setData(d); setR(r); })
      .catch(e => show(e.message, "error"))
      .finally(() => setL(false));
  }, [clinicId, doctorId]);

  const submitRating = async () => {
    if (!user) { navigate("/login"); return; }
    if (myRating < 1) { show("اختر عدد النجوم", "error"); return; }
    setSav(true);
    try {
      await api.ratings.add({ doctor_id: doctorId, rating: myRating, comment: myComment, hide_patient: false });
      const r = await api.ratings.getForDoctor(doctorId);
      setR(r); setMR(0); setMC("");
      show("تم إضافة تقييمك ✅");
    } catch (e) { show(e.message, "error"); }
    finally { setSav(false); }
  };

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;
  if (!data) return (
    <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <AlertCircle size={44} color="#94a3b8" />
      </div>
      <div style={{ fontWeight: 600, marginBottom: 16 }}>طبيب غير موجود</div>
      <Btn onClick={() => navigate("/search")}>رجوع للبحث</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
      <button onClick={() => navigate("/search")} style={{ background: "none", border: "none", cursor: "pointer", color: "#0891b2", fontWeight: 600, marginBottom: 18, display: "flex", alignItems: "center", gap: 5, fontSize: 14 }}>
        ← رجوع للبحث
      </button>

      {/* Doctor header */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
          <DoctorImage photo={data.PhotoProfile} size={200} borderRadius={32} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <Badge color="#0891b2">{data.SpecialtyAr || data.SpecialtyFr}</Badge>
              {data.Degrees && <Badge color="#7c3aed">{data.Degrees}</Badge>}
              {+data.Cnas === 1 && <Badge color="#059669"><Check size={12} style={{ marginLeft: 4 }} /> CNAS</Badge>}
              {+data.Casnos === 1 && <Badge color="#0891b2"><Check size={12} style={{ marginLeft: 4 }} /> CASNOS</Badge>}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0c4a6e", margin: "0 0 8px" }}>{data.FullName}</h1>
            {data.BaladiyaName && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><MapPin size={13} /> {data.BaladiyaName}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Stars rating={Math.round(+(data.AvgRating || 0))} size={15} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{(+(data.AvgRating || 0)).toFixed(1)}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>({data.RatingCount || 0} تقييم)</span>
              </div>
              {+data.Experience > 0 && <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {data.Experience} سنة خبرة</span>}
              {+data.Pricing > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", gap: 4 }}><CreditCard size={13} /> {data.Pricing} DA</span>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            {user ? (
              <Btn onClick={() => navigate(`/book/${clinicId}/${doctorId}`)} style={{ padding: "11px 24px" }}><Calendar size={18} /> حجز موعد</Btn>
            ) : (
              <Btn onClick={() => navigate("/login")}>تسجيل دخول للحجز</Btn>
            )}
            <Btn variant="secondary" onClick={() => { navigate("/chat"); }} style={{ padding: "9px 24px", fontSize: 13 }}><MessageSquare size={16} /> تواصل</Btn>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border)", marginBottom: 20 }}>
        {[["info", "معلومات"], ["reasons", "أسباب الزيارة"], ["schedule", "جدول العمل"], ["ratings", "التقييمات"]].map(([k, l]) => (
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {data.Presentation && (
            <Card style={{ gridColumn: "1/-1", padding: "18px 20px" }}>
              <h3 style={{ color: "#0c4a6e", margin: "0 0 10px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><FileText size={18} /> عن الطبيب</h3>
              <p style={{ color: "#374151", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{data.Presentation}</p>
            </Card>
          )}
          {data.Education && (
            <Card style={{ padding: "18px 20px" }}>
              <h3 style={{ color: "#0c4a6e", margin: "0 0 10px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Award size={18} /> التعليم</h3>
              <p style={{ color: "#374151", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{data.Education}</p>
            </Card>
          )}
          <Card style={{ padding: "18px 20px" }}>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 12px", fontSize: 15 }}>📞 معلومات التواصل</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13 }}>
              {data.Phone && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={14} /> <strong>هاتف:</strong> {data.Phone}</div>}
              {data.Email && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} /> <strong>بريد:</strong> {data.Email}</div>}
              {data.SpeakingLanguage && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Languages size={14} /> <strong>اللغات:</strong> {data.SpeakingLanguage}</div>}
              {data.PayementMethods && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><CreditCard size={14} /> <strong>الدفع:</strong> {data.PayementMethods}</div>}
            </div>
          </Card>
        </div>
      )}

      {/* REASONS */}
      {tab === "reasons" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 10 }}>
          {(data.Reasons || []).map(r => (
            <Card key={r.ID} style={{ padding: "14px 16px" }}>
              <div style={{ fontWeight: 700, color: "#0c4a6e", fontSize: 14, marginBottom: 4 }}>{r.reason_name}</div>
              {+r.reason_time > 0 && <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 6 }}><Clock size={11} /> {r.reason_time} دقيقة</div>}
            </Card>
          ))}
          {(!data.Reasons || data.Reasons.length === 0) && <p style={{ color: "#9ca3af" }}>لا توجد أسباب محددة</p>}
        </div>
      )}

      {/* SCHEDULE */}
      {tab === "schedule" && (
        data.Schedule ? (
          <Card>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <Calendar size={18} /> أيام وساعات العمل
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
              {(() => {
                const daysAr = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];
                const weekBegin = parseInt(data.Schedule.WeekBeginDay || 0);
                const workingDays = data.Schedule.WorkingDays || "1111111";

                // Reorder days to start from weekBegin
                const orderedDays = [];
                for (let i = 0; i < 7; i++) {
                  const idx = (weekBegin + i) % 7;
                  orderedDays.push({
                    name: daysAr[idx],
                    works: workingDays[i] === "1"
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
                    <div style={{ fontSize: 11, color: d.works ? "#0e7490" : "#d1d5db" }}>{d.works ? "متاح للعمل" : "عطلة"}</div>
                  </div>
                ));
              })()}
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: "16px", border: "1px dashed var(--border)" }}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={18} color="#0891b2" />
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>من:</strong> {(data.Schedule.DaytimeStart || "").match(/\d{2}:\d{2}/)?.[0] || "08:00"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <History size={18} color="#0891b2" />
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>إلى:</strong> {(data.Schedule.DaytimeEnd || "").match(/\d{2}:\d{2}/)?.[0] || "17:00"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={18} color="#0891b2" />
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>مدة الموعد:</strong> {data.Schedule.TimeScale} دقيقة
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
            <h3 style={{ margin: "0 0 8px", color: "#0c4a6e" }}>لم يتم تحديد المواعيد بعد</h3>
            <p style={{ margin: 0, fontSize: 14 }}>يرجى التواصل مع العيادة مباشرة أو المحاولة لاحقاً.</p>
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
              <div style={{ color: "#6b7280", marginTop: 6, fontSize: 13 }}>بناءً على {ratings.total} تقييم</div>
            </Card>
          )}
          {user && (
            <Card style={{ marginBottom: 16, padding: "18px 20px" }}>
              <h3 style={{ color: "#0c4a6e", margin: "0 0 14px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Plus size={18} /> أضف تقييمك</h3>
              <div style={{ marginBottom: 12 }}><Stars rating={myRating} interactive onChange={setMR} size={24} /></div>
              <textarea value={myComment} onChange={e => setMC(e.target.value)} rows={3}
                placeholder="أضف تعليقك (اختياري)..."
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
              <Btn onClick={submitRating} loading={saving} disabled={myRating < 1} style={{ padding: "9px 22px" }}>إرسال التقييم</Btn>
            </Card>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(ratings?.ratings || []).map(r => (
              <Card key={r.ID} style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#374151", marginBottom: 4, fontSize: 14 }}>{r.PatientName}</div>
                    <Stars rating={r.Rating} size={13} />
                  </div>
                </div>
                {r.Comment && <p style={{ color: "#6b7280", marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>{r.Comment}</p>}
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
function BookPage({ clinicId, doctorId, navigate, user }) {
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
      api.clinics.doctor(clinicId, doctorId),
      api.patient.family().catch(() => []),
    ]).then(([d, fam]) => {
      setDoctor(d);
      setFamily(fam || []);
    }).catch(e => setError(e.message))
      .finally(() => setInitL(false));
  }, [clinicId, doctorId]);

  const selfOption = { id: null, name: user?.profile?.FullName || user?.username || "أنا", isSelf: true };
  const allPatients = [selfOption, ...(family.map(f => ({ id: f.ID, name: f.FullName, isSelf: false, gender: f.Gender })))];
  const activePat = selPatient || selfOption;

  const fetchSlots = async (d) => {
    if (!doctor?.ClinicsDoctor_id) return;
    setSL(true); setSlots([]); setSlot("");
    try {
      const s = await api.appointments.slots({ clinics_doctor_id: doctor.ClinicsDoctor_id, date: d });
      setSlots(s.slots || []);
      if (!(s.slots || []).length) show("لا توجد أوقات متاحة في هذا اليوم — جرب تاريخًا آخر", "error");
    } catch (e) { show(e.message, "error"); }
    finally { setSL(false); }
  };

  const confirmBook = async () => {
    setL(true);
    try {
      const body = { clinics_doctor_id: doctor.ClinicsDoctor_id, date, time: selSlot };
      if (reason) body.doctors_reason_id = reason.ID;
      if (activePat.id) body.patient_id = activePat.id;
      await api.appointments.book(body);
      setStep(5);
    } catch (e) { show(e.message, "error"); }
    finally { setL(false); }
  };

  const STEPS = [
    { n: 1, label: "المريض", icon: <User size={16} /> },
    { n: 2, label: "السبب", icon: <Stethoscope size={16} /> },
    { n: 3, label: "الموعد", icon: <Calendar size={16} /> },
    { n: 4, label: "التأكيد", icon: <CheckCircle size={16} /> },
    { n: 5, label: "تم", icon: <Award size={16} /> },
  ];

  const minDate = new Date().toISOString().split("T")[0];

  const getAvailableDates = () => {
    const schedule = doctor?.Schedule || {};
    const countDays = parseInt(schedule.CountDays || 30);
    const weekBegin = parseInt(schedule.WeekBeginDay || 0); // 0=Mon...6=Sun
    const workingDays = schedule.WorkingDays || "1111111";

    const dates = [];
    // Map user's WeekBeginDay to Standard (0=Sun...6=Sat)
    const stdWBD = (weekBegin + 1) % 7;

    for (let i = 0; i <= countDays; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const full = `${yyyy}-${mm}-${dd}`;

      const w = d.getDay(); // 0=Sun...6=Sat
      const relIndex = (w - stdWBD + 7) % 7;

      if (workingDays[relIndex] === "1" || !schedule.WorkingDays) {
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
      <Btn onClick={() => navigate("/search")}>رجوع للبحث</Btn>
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
              background: (step > s.n || (step === 5 && s.n === 5))
                ? "linear-gradient(to left, #059669, #10b981)"
                : step === s.n
                  ? "linear-gradient(to left, #0891b2 60%, var(--border) 100%)"
                  : "var(--border)"
            }} />
          )}
          <div style={{
            width: 38, height: 38, borderRadius: "50%", zIndex: 1, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: step > s.n ? 16 : 14,
            transition: "all 0.35s",
            background: (step > s.n || (step === 5 && s.n === 5)) ? "linear-gradient(135deg,#059669,#10b981)"
              : step === s.n ? "linear-gradient(135deg,#0891b2,#0e7490)"
                : "var(--border)",
            color: (step >= s.n) ? "#fff" : "#9ca3af",
            boxShadow: step === s.n ? "0 4px 16px rgba(8,145,178,0.4)"
              : (step > s.n || (step === 5 && s.n === 5)) ? "0 4px 12px rgba(5,150,105,0.3)" : "none",
            transform: step === s.n ? "scale(1.12)" : "scale(1)"
          }}>
            {(step > s.n) ? <Check size={18} /> : s.icon}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, marginTop: 6, whiteSpace: "nowrap",
            color: step > s.n ? "#059669" : step === s.n ? "#0891b2" : "#9ca3af"
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Doctor mini header ─────────────────────────────────────
  const DoctorBanner = () => step < 5 && (
    <div style={{
      background: "linear-gradient(135deg,#0c4a6e,#0891b2,#06b6d4)",
      borderRadius: 16, padding: "16px 22px", marginBottom: 24,
      display: "flex", alignItems: "center", gap: 14, color: "#fff"
    }}>
      <DoctorImage photo={doctor.PhotoProfile} size={50} borderRadius={12} style={{ background: "rgba(255,255,255,0.18)", fontSize: 24 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 0.3 }}>{doctor.FullName}</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{doctor.SpecialtyAr || doctor.SpecialtyFr}</div>
      </div>
      {+doctor.Pricing > 0 && (
        <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
          <CreditCard size={14} /> {doctor.Pricing} DA
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
      {/* Back button */}
      <button onClick={() => navigate(`/clinic/${clinicId}/doctor/${doctorId}`)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#0891b2", fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
        ← رجوع لتفاصيل الطبيب
      </button>

      <DoctorBanner />
      <Stepper />

      {/* ══════════ STEP 1 — Patient ══════════ */}
      {step === 1 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}><User size={22} /> اختيار المريض</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>اختر المريض الذي سيتلقى هذه الزيارة الطبية</p>

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
                      {p.isSelf ? "المستخدم الحالي (أنا)" : "فرد من العائلة"}
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
              التالي — اختيار سبب الزيارة →
            </Btn>
          </div>
        </Card>
      )}

      {/* ══════════ STEP 2 — Reason ══════════ */}
      {step === 2 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}><Stethoscope size={22} /> سبب الزيارة</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>
            اختر سبب زيارتك إن وجد — <span style={{ color: "#0891b2", fontWeight: 700 }}>اختياري، يمكنك التخطي</span>
          </p>
          {(!doctor.Reasons || doctor.Reasons.length === 0) ? (
            <div style={{ padding: "28px", textAlign: "center", color: "#9ca3af", background: "var(--bg)", borderRadius: 12, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <FileText size={36} color="#cbd5e1" />
              </div>
              <p style={{ margin: 0 }}>لا توجد أسباب زيارة محددة لهذا الطبيب</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
              {doctor.Reasons.map(r => {
                const sel = reason?.ID === r.ID;
                return (
                  <div key={r.ID} onClick={() => setReason(sel ? null : r)}
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
                    {+r.reason_time > 0 && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}><Clock size={11} /> {r.reason_time} دقيقة</div>}
                  </div>
                );
              })}
            </div>
          )}

          {reason && (
            <div style={{ background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: 10, padding: "10px 16px", marginTop: 12, fontSize: 13, color: "#0e7490", display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle size={14} /> تم اختيار: <strong>{reason.reason_name}</strong>
              <button onClick={() => setReason(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, marginRight: "auto", lineHeight: 1 }}>×</button>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Btn variant="secondary" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center", borderRadius: 10 }}>← رجوع</Btn>
            <Btn onClick={() => setStep(3)} style={{ flex: 2, justifyContent: "center", padding: 13, borderRadius: 10, fontSize: 14 }}>
              {reason ? "التالي → اختيار الموعد" : "تخطي → اختيار الموعد"}
            </Btn>
          </div>
        </Card>
      )}

      {/* ══════════ STEP 3 — Date & Time ══════════ */}
      {step === 3 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>📅 اختيار الموعد</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>اختر التاريخ والوقت المناسب لك</p>

          {/* Date selection grid */}
          <div style={{ marginBottom: 26 }}>
            <label style={{ display: "block", marginBottom: 12, fontWeight: 700, fontSize: 14, color: "#0c4a6e" }}>📅 الأيام المتاحة للحجز</label>
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
                ⚠️ لا توجد أيام عمل متاحة حالياً. يرجى مراجعة جدول عمل الطبيب.
              </div>
            )}
          </div>

          {/* Time slots grid */}
          {date && (
            <div>
              <label style={{ display: "block", marginBottom: 10, fontWeight: 700, fontSize: 13, color: "#374151" }}>⏰ الأوقات المتاحة</label>
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
                      <div style={{ fontWeight: 600 }}>لا توجد أوقات متاحة</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>جرّب تاريخًا آخر</div>
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
            <div>اختر تاريخاً أولاً لعرض الأوقات المتاحة</div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Btn variant="secondary" onClick={() => { setStep(2); setDate(""); setSlots([]); setSlot(""); }} style={{ flex: 1, justifyContent: "center", borderRadius: 10 }}>← رجوع</Btn>
            <Btn onClick={() => setStep(4)} disabled={!selSlot || !date} style={{ flex: 2, justifyContent: "center", padding: 13, borderRadius: 10, fontSize: 14 }}>
              التالي → مراجعة التفاصيل
            </Btn>
          </div>
        </Card>
      )}

      {/* ══════════ STEP 4 — Confirmation Summary ══════════ */}
      {step === 4 && (
        <Card style={{ padding: "26px 28px" }}>
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>مراجعة وتأكيد الحجز</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>تحقق من التفاصيل قبل إتمام الحجز النهائي</p>

          <div style={{
            background: "linear-gradient(135deg,#f0fdfa,#ecfeff)",
            border: "1px solid #a5f3fc", borderRadius: 14, padding: "20px 22px", marginBottom: 20
          }}>
            {[
              [<Stethoscope size={18} />, "الطبيب", doctor.FullName],
              [<Building size={18} />, "التخصص", doctor.SpecialtyAr || doctor.SpecialtyFr || "—"],
              [<User size={18} />, "المريض", `${activePat.name}${activePat.isSelf ? " (أنا)" : " — فرد عائلة"}`],
              [<Stethoscope size={18} />, "سبب الزيارة", reason?.reason_name || "—  (غير محدد)"],
              [<Calendar size={18} />, "التاريخ", date],
              [<Clock size={18} />, "الوقت", selSlot],
              ...(+doctor.Pricing > 0 ? [[<CreditCard size={18} />, "رسوم الاستشارة", `${doctor.Pricing} دج`]] : []),
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
            <span>سيتم إرسال تأكيد الموعد على بريدك الإلكتروني فور إتمام الحجز</span>
          </div>

          <div style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 14, padding: "20px", marginBottom: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: "#0c4a6e", marginTop: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><FileText size={16} /> اتفاقية الخصوصية والموافقة</h3>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, maxHeight: 100, overflowY: "auto", paddingRight: 10, marginBottom: 15, textAlign: "justify" }}>
              بإتمام هذا الحجز، فإنك توافق على أن يتم حفظ بياناتك الشخصية والطبية المقدمة في قاعدة بياناتنا بشكل آمن.
              يتم استخدام هذه البيانات فقط لتسهيل عملية حجز المواعيد وتقديم الرعاية الصحية اللازمة من قبل الطبيب والعيادة المعنية.
              نحن نلتزم بحماية خصوصيتك ولن يتم مشاركة بياناتك مع أي طرف ثالث غير مصرح له.
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "#0891b2", cursor: "pointer" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: agreed ? "#0c4a6e" : "#64748b" }}>أوافق على الشروط والأحكام وسياسة الخصوصية</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="secondary" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: "center", borderRadius: 10 }}>← رجوع</Btn>
            <Btn onClick={confirmBook} loading={loading} disabled={!agreed} style={{ flex: 2, justifyContent: "center", padding: 14, borderRadius: 10, fontSize: 15 }}>
              <Award size={18} style={{ marginLeft: 8 }} /> تأكيد الحجز نهائيًا
            </Btn>
          </div>
        </Card>
      )}

      {/* ══════════ STEP 5 — Success ══════════ */}
      {step === 5 && (
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
            تم تأكيد حجزك بنجاح!
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
            تم تسجيل موعدك مع{" "}
            <strong style={{ color: "#0c4a6e" }}>{doctor.FullName}</strong>
            <br />
            📅 يوم <strong style={{ color: "#0891b2" }}>{date}</strong> الساعة{" "}
            <strong style={{ color: "#0891b2" }}>{selSlot}</strong>
          </p>

          {/* Mini summary badge */}
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12,
            padding: "14px 20px", marginBottom: 28, textAlign: "right"
          }}>
            <div style={{ fontSize: 13, color: "#166534", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <User size={14} /><span><strong>المريض:</strong> {activePat.name}</span>
            </div>
            {reason && (
              <div style={{ fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                <Stethoscope size={14} /><span><strong>السبب:</strong> {reason.reason_name}</span>
              </div>
            )}
          </div>

          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "11px 16px", marginBottom: 28, fontSize: 13, color: "#1e40af", display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
            <Mail size={14} /><span>تم إرسال تأكيد بالبريد الإلكتروني — تحقق من صندوق الوارد</span>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="secondary" onClick={() => navigate("/")} style={{ padding: "11px 26px", borderRadius: 10 }}>
              <Home size={16} style={{ marginLeft: 8 }} /> الصفحة الرئيسية
            </Btn>
            <Btn onClick={() => navigate("/appointments")} style={{ padding: "11px 26px", borderRadius: 10 }}>
              <Calendar size={16} style={{ marginLeft: 8 }} /> عرض مواعيدي
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
  const [appts, setAppts] = useState([]);
  const [loading, setL] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const { show, Toast } = useToast();
  const now = new Date();

  useEffect(() => {
    api.patient.appointments().then(setAppts).catch(() => { }).finally(() => setL(false));
  }, []);

  const cancel = async (id) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الموعد؟")) return;
    try {
      await api.appointments.cancel(id);
      setAppts(p => p.filter(a => a.ID !== id));
      show("تم إلغاء الموعد بنجاح");
    } catch (e) { show(e.message, "error"); }
  };

  const filtered = appts.filter(a => {
    const d = new Date(a.AppointementDate);
    if (filter === "upcoming") return d >= now;
    if (filter === "past") return d < now;
    return true;
  });

  const cnt = (f) => appts.filter(a => {
    const d = new Date(a.AppointementDate);
    if (f === "upcoming") return d >= now;
    if (f === "past") return d < now;
    return true;
  }).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", margin: 0, display: "flex", alignItems: "center", gap: 10 }}><Calendar size={24} /> مواعيدي</h1>
        <Btn onClick={() => navigate("/search")} style={{ padding: "9px 18px", fontSize: 13 }}>+ حجز موعد جديد</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[["all", "الكل"], ["upcoming", "القادمة"], ["past", "الماضية"]].map(([v, l]) => (
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
            {filter === "upcoming" ? "لا توجد مواعيد قادمة" : "لا توجد مواعيد"}
          </div>
          <Btn onClick={() => navigate("/search")}>ابحث عن طبيب</Btn>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20
        }}>
          {filtered.map(a => {
            const isPast = new Date(a.AppointementDate) < now;
            const d = new Date(a.AppointementDate);
            return (
              <Card key={a.ID} style={{
                padding: "12px",
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
                {/* Header: Photo on the right, Info on the left */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
                  <DoctorImage photo={a.PhotoProfile} size={120} borderRadius={20} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 800, color: "#0c4a6e", fontSize: 15, marginBottom: 2 }}>{a.DoctorName || "طبيب"}</div>
                      <div>
                        {isPast ?
                          <Badge color="#94a3b8" style={{ padding: "3px 8px", fontSize: 10 }}>منتهي</Badge> :
                          <Badge color="#059669" style={{ padding: "3px 8px", fontSize: 10 }}>قادم</Badge>
                        }
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <Building size={12} color="var(--brand)" /> {a.ClinicName || "—"}
                    </div>
                    {a.ReasonName && (
                      <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                        <Stethoscope size={12} color="var(--brand)" /> {a.ReasonName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#f1f5f9", margin: "10px 0" }} />

                {/* Time & Date Block */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Calendar size={16} color="#0891b2" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>التاريخ</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#334155" }}>
                        {d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Clock size={16} color="#0891b2" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>الوقت</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#334155" }}>
                        {d.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!isPast && (
                  <Btn variant="danger" onClick={() => cancel(a.ID)} style={{ width: "100%", justifyContent: "center", padding: "8px", fontSize: 12, borderRadius: 8 }}>
                    <Trash2 size={13} style={{ marginLeft: 6 }} /> إلغاء الحجز
                  </Btn>
                )}
                {isPast && (
                  <Btn variant="secondary" onClick={() => navigate(`/clinic/${a.ClinicID}/doctor/${a.DoctorID}`)} style={{ width: "100%", justifyContent: "center", padding: "8px", fontSize: 12, borderRadius: 8 }}>
                    حجز موعد جديد
                  </Btn>
                )}
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
  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#0c4a6e", marginBottom: 16 }}>حول طبيبي</h1>
        <p style={{ fontSize: 18, color: "#6b7280", maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
          نحن نهدف إلى تبسيط الرعاية الصحية في الجزائر من خلال التكنولوجيا والابتكار.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 60 }}>
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 64, height: 64, background: "var(--brand-light)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Activity size={32} color="var(--brand)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0c4a6e", marginBottom: 12 }}>مهمتنا</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>توفير وصول سريع وسهل للرعاية الصحية لكل المواطنين الجزائريين في كل الولايات.</p>
        </Card>

        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 64, height: 64, background: "var(--brand-light)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <ShieldCheck size={32} color="var(--brand)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0c4a6e", marginBottom: 12 }}>قيمنا</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>الخصوصية، الثقة، والشفافية هي الركائز الأساسية التي نبني عليها منصتنا.</p>
        </Card>

        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 64, height: 64, background: "var(--brand-light)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <HeartPulse size={32} color="var(--brand)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0c4a6e", marginBottom: 12 }}>رؤيتنا</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>أن نكون الوجهة الأولى والرائدة في مجال الصحة الرقمية في منطقتنا.</p>
        </Card>
      </div>

      <div style={{ background: "var(--bg)", borderRadius: 24, border: "1px solid var(--border)", padding: 48, textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0c4a6e", marginBottom: 20 }}>هل تريد معرفة المزيد؟</h2>
        <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 32 }}>فريقنا مستعد للإجابة على جميع استفساراتكم واقتراحاتكم.</p>
        <Btn onClick={() => navigate("/contact")} style={{ padding: "14px 36px" }}>ابدأ رحلتك معنا الآن</Btn>
      </div>
    </div>
  );
}

// ── PAGE: CONTACT ─────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ContactPage({ navigate }) {
  const [sent, setSent] = useState(false);
  const [loading, setL] = useState(false);

  const submit = e => {
    e.preventDefault();
    setL(true);
    setTimeout(() => { setL(false); setSent(true); }, 1500);
  };

  if (sent) return (
    <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: 24 }}>
      <div style={{ width: 80, height: 80, background: "#f0fdf4", color: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <CheckCircle size={48} />
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0c4a6e", marginBottom: 16 }}>تم إرسال رسالتك بنجاح!</h1>
      <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 32, lineHeight: 1.6 }}>
        شكراً لتواصلك معنا. سيقوم فريقنا بمراجعة طلبك والاتصال بك في أقرب وقت ممكن لبحث سبل التعاون.
      </p>
      <Btn onClick={() => navigate("/")}>العودة للرئيسية</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0c4a6e", marginBottom: 12 }}>تواصل معنا</h1>
        <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 550, margin: "0 auto" }}>
          هل أنت طبيب أو صاحب عيادة؟ نحن هنا لمساعدتك على التحول الرقمي وتطوير خدماتك.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
        <Card style={{ padding: 32 }}>
          <form onSubmit={submit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Input label="الاسم الكامل" placeholder="أحمد محمد" required />
              <Input label="التخصص" placeholder="طب عام" required />
            </div>
            <Input label="اسم العيادة (اختياري)" placeholder="عيادة الشفاء" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Input label="رقم الهاتف" placeholder="05XXXXXXXX" required />
              <Input label="البريد الإلكتروني" type="email" placeholder="doctor@example.com" required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>رسالتك</label>
              <textarea placeholder="كيف يمكننا مساعدتك؟" required style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid var(--border)", minHeight: 120, fontSize: 14 }} />
            </div>
            <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 14 }}>إرسال الرسالة</Btn>
          </form>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { icon: <Mail color="var(--brand)" />, title: "البريد الإلكتروني", content: "contact@tabibi.dz" },
            { icon: <Phone color="var(--brand)" />, title: "الهاتف", content: "021 XX XX XX" },
            { icon: <MapPin color="var(--brand)" />, title: "المقر الرئيسي", content: "الجزائر العاصمة، الجزائر" }
          ].map((item, i) => (
            <Card key={i} style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, background: "var(--brand-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 15, color: "#0c4a6e", fontWeight: 800 }}>{item.content}</div>
              </div>
            </Card>
          ))}
          <div style={{ marginTop: 10, padding: 20, background: "#fff7ed", borderRadius: 16, border: "1px solid #fed7aa" }}>
            <h4 style={{ margin: "0 0 8px", color: "#9a3412", display: "flex", alignItems: "center", gap: 8 }}><Info size={18} /> ملاحظة</h4>
            <p style={{ margin: 0, fontSize: 13, color: "#9a3412", lineHeight: 1.6 }}>
              سيقوم فريق الدعم الفني بالرد على استفساراتكم في غضون 24 ساعة عمل.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PAGE: REGISTER CLINIC ─────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: REGISTER CLINIC (FOR DOCTORS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RegisterClinicPage({ navigate }) {
  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building size={36} color="var(--brand)" />
          </div>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0c4a6e", marginBottom: 12 }}>سجّل عيادتك في طبيبي</h1>
        <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 550, margin: "0 auto" }}>
          انضم إلى أكبر شبكة طبية في الجزائر وزد من ظهور عيادتك وتنظيم مواعيدك.
        </p>
      </div>

      <Card style={{ padding: 36 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <Input label="اسم العيادة" placeholder="عيادة الشفاء" />
          <Input label="اسم الطبيب المسؤول" placeholder="د. أحمد محمد" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <Input label="رقم الهاتف المهني" placeholder="05XXXXXXXX" />
          <Input label="التخصص الأساسي" placeholder="طب عام" />
        </div>
        <Input label="العنوان الكامل" placeholder="الولاية، البلدية، الشارع..." />

        <div style={{ marginTop: 24, padding: 20, background: "#f0fdfa", borderRadius: 12, border: "1px solid #ccfbf1", marginBottom: 28 }}>
          <h4 style={{ margin: "0 0 10px", color: "#0f766e", display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={18} /> لماذا تنضم إلينا؟
          </h4>
          <ul style={{ margin: 0, paddingRight: 20, fontSize: 13, color: "#134e4a", lineHeight: 1.8 }}>
            <li>نظام إدارة مواعيد ذكي يعمل على مدار الساعة.</li>
            <li>ملف تعريفي كامل للعيادة مع الصور والتخصصات.</li>
            <li>التواصل المباشر مع المرضى عبر نظام الدردشة الآمن.</li>
            <li>إحصائيات وتقارير دورية حول نشاط عيادتك.</li>
          </ul>
        </div>

        <Btn style={{ width: "100%", justifyContent: "center", padding: 16, fontSize: 16 }}>إرسال طلب الانضمام</Btn>
        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 16 }}>سيتصل بك فريقنا في غضون 24 ساعة للتحقق من البيانات وتفعيل الحساب.</p>
      </Card>
    </div>
  );
}

// ── PAGE: LEARN MORE ──────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: LEARN MORE (HOW TO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LearnMorePage({ navigate }) {
  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: "#0c4a6e", marginBottom: 14 }}>كيف يعمل طبيبي؟</h1>
        <p style={{ fontSize: 17, color: "#6b7280" }}>بضع خطوات بسيطة تفصلك عن موعدك الطبي القادم</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40, marginBottom: 60 }}>
        {[
          { icon: <Search size={28} />, title: "1. ابحث عن الطبيب", desc: "استخدم محرك البحث المتقدم للعثور على الأطباء حسب التخصص، الموقع، أو الاسم. اطلع على تقييمات المرضى الحقيقيين." },
          { icon: <Calendar size={28} />, title: "2. اختر الموعد المناسب", desc: "شاهد الأوقات المتاحة في الوقت الفعلي واحجز موعدك فوراً دون الحاجة للاتصال الهاتفي أو الانتظار." },
          { icon: <CheckCircle size={28} />, title: "3. تأكيد الحجز", desc: "ستصلك رسالة تأكيد فورية وتذكيرات قبل الموعد لضمان عدم نسيان زيارتك الطبية." },
          { icon: <MessageSquare size={28} />, title: "4. تواصل واستشر", desc: "يمكنك التواصل مع العيادة مسبقاً للاستفسار عن أي تفاصيل عبر نظام الدردشة المدمج." }
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
        <Btn onClick={() => navigate("/search")} style={{ padding: "12px 32px" }}>ابدأ البحث الآن</Btn>
        <Btn variant="secondary" onClick={() => navigate("/")} style={{ padding: "12px 32px" }}>العودة للرئيسية</Btn>
      </div>
    </div>
  );
}

// ── PAGE: PRIVACY POLICY ──────────────────────────────────────
function PrivacyPolicyPage({ navigate }) {
  const sections = [
    {
      title: "1. جمع البيانات الشخصية",
      content: "نقوم بجمع البيانات التي تقدمها لنا مباشرة، مثل الاسم، رقم الهاتف، والبريد الإلكتروني، بالإضافة إلى المعلومات الضرورية لحجز الموعد الطبي. نلتزم بالقانون رقم 18-07 المتعلق بحماية الأشخاص الطبيعيين تجاه معالجة المعطيات ذات الطابع الشخصي في الجزائر."
    },
    {
      title: "2. استخدام البيانات",
      content: "تُستخدم بياناتك فقط لغرض تسهيل حجز المواعيد الطبية، إرسال تذكيرات، والتواصل معك بخصوص خدماتنا. لا يتم مشاركة بياناتك الطبية إلا مع الطبيب أو العيادة التي اخترت الحجز عندها."
    },
    {
      title: "3. حقوق المستخدم",
      content: "لك الحق في الوصول إلى بياناتك الشخصية، تصحيحها، أو طلب حذفها في أي وقت من خلال إعدادات حسابك أو الاتصال بنا مباشرة."
    },
    {
      title: "4. أمن المعلومات",
      content: "نحن نطبق إجراءات أمنية تقنية وإدارية صارمة لحماية بياناتك من الوصول غير المصرح به أو الإفصاح أو التغيير."
    }
  ];

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0c4a6e", marginBottom: 12 }}>سياسة الخصوصية</h1>
        <p style={{ color: "#64748b" }}>نحن نلتزم بحماية خصوصيتك وبياناتك الشخصية وفقاً للقوانين الجزائرية المعمول بها.</p>
      </div>
      <Card style={{ padding: "40px" }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 32, borderBottom: i < sections.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: i < sections.length - 1 ? 24 : 0 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--brand)", marginBottom: 14 }}>{s.title}</h3>
            <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.8, textAlign: "justify" }}>{s.content}</p>
          </div>
        ))}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Btn onClick={() => navigate("/")}>العودة للرئيسية</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── PAGE: TERMS OF USE ────────────────────────────────────────
function TermsOfUsePage({ navigate }) {
  const terms = [
    {
      title: "1. قبول الشروط",
      content: "باستخدامك لمنصة طبيبي، فإنك توافق على الالتزام بشروط الاستخدام هذه. إذا كنت لا توافق على أي جزء منها، يرجى التوقف عن استخدام المنصة."
    },
    {
      title: "2. طبيعة الخدمة",
      content: "طبيبي هي منصة وسيطة تسهل عملية البحث وحجز المواعيد الطبية. نحن لا نقدم استشارات طبية، والمسؤولية عن التشخيص والعلاج تقع بالكامل على عاتق الطبيب المختص."
    },
    {
      title: "3. مسؤولية المستخدم",
      content: "أنت مسؤول عن تقديم معلومات صحيحة ودقيقة عند التسجيل أو الحجز. كما يتوجب عليك احترام المواعيد المحجوزة وإبلاغ العيادة في حال الرغبة في الإلغاء."
    },
    {
      title: "4. حدود المسؤولية",
      content: "تبذل المنصة قصارى جهدها لضمان دقة المعلومات وتوفر الخدمة، ولكنها لا تضمن عدم انقطاع الخدمة أو خلوها من الأخطاء التقنية الخارجة عن إرادتنا."
    }
  ];

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0c4a6e", marginBottom: 12 }}>شروط الاستخدام</h1>
        <p style={{ color: "#64748b" }}>يرجى قراءة شروط الاستخدام بعناية قبل البدء في استخدام خدماتنا.</p>
      </div>
      <Card style={{ padding: "40px" }}>
        {terms.map((t, i) => (
          <div key={i} style={{ marginBottom: 32, borderBottom: i < terms.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: i < terms.length - 1 ? 24 : 0 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--brand)", marginBottom: 14 }}>{t.title}</h3>
            <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.8, textAlign: "justify" }}>{t.content}</p>
          </div>
        ))}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Btn onClick={() => navigate("/")}>أوافق وأرغب في الاستمرار</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── PAGE: PROFILE ─────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── PAGE: PROFILE (ACCOUNT SETTINGS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProfilePage() {
  const [form, setForm] = useState(null);
  const [loading, setL] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verStatus, setVS] = useState(null);
  const [otpModal, setOTP] = useState(null); // "email" | "phone" | null
  const { show, Toast } = useToast();

  const load = async () => {
    try {
      const [p, vs] = await Promise.all([api.patient.profile(), api.verify.status().catch(() => null)]);
      setForm(p); setVS(vs);
    } catch (e) { show(e.message, "error"); }
    finally { setL(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try { await api.patient.update(form); show("تم حفظ التغييرات بنجاح ✅"); }
    catch (e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;
  if (!form) return <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>تعذر تحميل البيانات</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, borderRadius: 16, background: "linear-gradient(135deg,#0891b2,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", fontWeight: 900 }}>
          {(form.FullName || "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0c4a6e", margin: "0 0 4px" }}>{form.FullName}</h1>
          <div style={{ fontSize: 13, color: "#6b7280" }}>{form.Email}</div>
          <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge color={verStatus?.email_verified ? "#059669" : "#f59e0b"}>
              {verStatus?.email_verified ? <Check size={12} style={{ marginLeft: 4 }} /> : <AlertCircle size={12} style={{ marginLeft: 4 }} />}
              {verStatus?.email_verified ? "بريد مؤكد" : "بريد غير مؤكد"}
            </Badge>
            <Badge color={verStatus?.phone_verified ? "#059669" : "#f59e0b"}>
              {verStatus?.phone_verified ? <Check size={12} style={{ marginLeft: 4 }} /> : <AlertCircle size={12} style={{ marginLeft: 4 }} />}
              {verStatus?.phone_verified ? "هاتف مؤكد" : "هاتف غير مؤكد"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Verification section */}
      {verStatus && (!verStatus.email_verified || !verStatus.phone_verified) && (
        <Card style={{ marginBottom: 20, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <h3 style={{ color: "#92400e", margin: "0 0 14px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Lock size={18} /> تأكيد الهوية</h3>
          <p style={{ color: "#78350f", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
            أكّد بريدك الإلكتروني ورقم هاتفك لتحسين أمان حسابك وضمان استلام إشعارات المواعيد.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!verStatus.email_verified && verStatus.has_email && (
              <Btn variant="ghost" onClick={() => setOTP("email")} style={{ fontSize: 13, padding: "8px 18px" }}>
                <Mail size={14} style={{ marginLeft: 8 }} /> تأكيد البريد الإلكتروني
              </Btn>
            )}
            {!verStatus.phone_verified && verStatus.has_phone && (
              <Btn variant="ghost" onClick={() => setOTP("phone")} style={{ fontSize: 13, padding: "8px 18px" }}>
                <Phone size={14} style={{ marginLeft: 8 }} /> تأكيد رقم الهاتف
              </Btn>
            )}
            {!verStatus.has_email && (
              <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> أضف بريدك الإلكتروني أولاً لتتمكن من تأكيده</div>
            )}
          </div>
        </Card>
      )}

      <form onSubmit={save}>
        {/* Personal Info */}
        <Card style={{ marginBottom: 14 }}>
          <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><User size={18} /> المعلومات الشخصية</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="الاسم الكامل" value={form.FullName || ""} onChange={e => f("FullName", e.target.value)} />
            <Input label="رقم الهاتف" type="tel" value={form.Phone || ""} onChange={e => f("Phone", e.target.value)} />
            <Input label="البريد الإلكتروني" type="email" value={form.Email || ""} onChange={e => f("Email", e.target.value)} />
            <Input label="تاريخ الميلاد" type="date" value={(form.BirthDate || "").split("T")[0] || ""} onChange={e => f("BirthDate", e.target.value)} />
            <Input label="العنوان" value={form.Address || ""} onChange={e => f("Address", e.target.value)} style={{ gridColumn: "1/-1" }} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>الجنس</label>
              <select value={form.Gender ?? 0} onChange={e => f("Gender", +e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--bg)", boxSizing: "border-box" }}>
                <option value={0}>ذكر</option><option value={1}>أنثى</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>فصيلة الدم</label>
              <select value={form.BloodType || ""} onChange={e => f("BloodType", e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--bg)", boxSizing: "border-box" }}>
                <option value="">غير محدد</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Emergency */}
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><Shield size={18} /> جهة الطوارئ</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="هاتف الطوارئ" value={form.EmergancyPhone || ""} onChange={e => f("EmergancyPhone", e.target.value)} />
            <Input label="بريد الطوارئ" type="email" value={form.EmergancyEmail || ""} onChange={e => f("EmergancyEmail", e.target.value)} />
          </div>
          <div style={{ marginBottom: 0 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>ملاحظات طوارئ</label>
            <textarea value={form.EmergancyNote || ""} onChange={e => f("EmergancyNote", e.target.value)} rows={2}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
          </div>
        </Card>

        <Btn type="submit" loading={saving} style={{ width: "100%", justifyContent: "center", padding: 12, fontSize: 15 }}>
          <FileText size={18} style={{ marginLeft: 8 }} /> حفظ التغييرات
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
    api.chat.messages(sel.ID).then(setMsgs).catch(() => { });
  }, [sel]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!newMsg.trim() || !sel) return;
    setSending(true);
    try {
      await api.chat.send(sel.ID, { content: newMsg });
      setNewMsg("");
      const msgs = await api.chat.messages(sel.ID);
      setMsgs(msgs);
    } catch (e) { show(e.message, "error"); }
    finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}><MessageSquare size={24} /> الرسائل</h1>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14, height: 580 }}>
        {/* Threads */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6", fontWeight: 800, color: "#374151", fontSize: 13 }}>
            المحادثات ({threads.length})
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && <Spinner />}
            {threads.map(t => (
              <div key={t.ID} onClick={() => setSel(t)}
                style={{
                  padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f9fafb",
                  background: sel?.ID === t.ID ? "#ecfeff" : "transparent", transition: "background 0.15s"
                }}
                onMouseEnter={e => { if (sel?.ID !== t.ID) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={e => { if (sel?.ID !== t.ID) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ fontWeight: 700, color: "#0c4a6e", fontSize: 13, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}><Stethoscope size={14} /> {t.DoctorName}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.SpecialtyFr}</div>
                {t.LastMessage && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.LastMessage}</div>}
              </div>
            ))}
            {!loading && threads.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>لا توجد محادثات</div>
            )}
          </div>
        </div>
        {/* Messages */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {sel ? (
            <>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", fontWeight: 800, color: "#0c4a6e", display: "flex", alignItems: "center", gap: 8 }}>
                <span><Stethoscope size={18} /></span>
                <div>
                  <div style={{ fontSize: 14 }}>{sel.DoctorName}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>{sel.SpecialtyFr}</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map(m => (
                  <div key={m.ID} style={{ display: "flex", justifyContent: m.IsDoctor ? "flex-start" : "flex-end" }}>
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
                    ابدأ المحادثة...
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 8 }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="اكتب رسالتك... (Enter للإرسال)"
                  style={{ flex: 1, padding: "9px 13px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, outline: "none" }}
                />
                <Btn onClick={send} loading={sending} style={{ padding: "9px 18px", fontSize: 13 }}>إرسال</Btn>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
              <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>اختر محادثة من القائمة</div>
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
  return (
    <footer style={{
      background: "#fff",
      borderTop: "1px solid var(--border)",
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      boxShadow: "0 -4px 20px rgba(0,0,0,0.03)"
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "18px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Tabibi" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span style={{ fontSize: 16, fontWeight: 900, color: "var(--brand)" }}>طبيبي</span>
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, marginRight: 8 }}>
            © 2026 — جميع الحقوق محفوظة
          </span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {[
            { label: "سياسة الخصوصية", path: "/privacy" },
            { label: "شروط الاستخدام", path: "/terms" },
            { label: "حول المنصة", path: "/learn-more" }
          ].map(link => (
            <button
              key={link.label}
              onClick={() => link.path.startsWith("/") ? navigate(link.path) : null}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, color: "var(--text-secondary)", fontWeight: 600,
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

// ── ROOT APP ──────────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── MAIN APPLICATION ENTRY (ROUTER)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const { route, qs, navigate } = useRoute();
  const { user, loading, login, register, logout } = useAuth();

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(0,146,162,0.1)" }}>
            <Building size={40} color="var(--brand)" />
          </div>
        </div>
        <Spinner size={34} />
        <div style={{ marginTop: 14, color: "#6b7280", fontWeight: 600, fontSize: 14 }}>جاري التحميل...</div>
      </div>
    </div>
  );

  // ── Routing ────────────────────────────────────────────────
  const renderPage = () => {
    // /clinic/:cId/doctor/:dId  — MUST check before switch
    const dm = route.match(/^\/clinic\/([^?#/]+)\/doctor\/([^?#/]+)/);
    if (dm) return <DoctorDetailPage key={route} clinicId={dm[1]} doctorId={dm[2]} navigate={navigate} user={user} />;

    // /book/:cId/:dId
    const bm = route.match(/^\/book\/([^?#/]+)\/([^?#/]+)/);
    if (bm) {
      if (!user) { setTimeout(() => navigate("/login"), 0); return null; }
      return <BookPage key={route} clinicId={bm[1]} doctorId={bm[2]} navigate={navigate} user={user} />;
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
        return <SearchPage key={route + qs} navigate={navigate} qs={qs} />;
      case "/about":
        return <AboutPage navigate={navigate} />;
      case "/contact":
        return <ContactPage navigate={navigate} />;
      case "/register-clinic":
        return <RegisterClinicPage navigate={navigate} />;
      case "/learn-more":
        return <LearnMorePage navigate={navigate} />;
      case "/privacy":
        return <PrivacyPolicyPage navigate={navigate} />;
      case "/terms":
        return <TermsOfUsePage navigate={navigate} />;
      case "/appointments":
        if (!user) { setTimeout(() => navigate("/login"), 0); return null; }
        return <AppointmentsPage key="appts" navigate={navigate} />;
      case "/profile":
        if (!user) { setTimeout(() => navigate("/login"), 0); return null; }
        return <ProfilePage key="profile" />;
      case "/chat":
        if (!user) { setTimeout(() => navigate("/login"), 0); return null; }
        return <ChatPage key="chat" user={user} />;
      default:
        return (
          <div key="404" style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                <Search size={48} color="#94a3b8" />
              </div>
            </div>
            <h1 style={{ color: "#0c4a6e", fontWeight: 900 }}>404 — الصفحة غير موجودة</h1>
            <Btn onClick={() => navigate("/")} style={{ marginTop: 20 }}>الصفحة الرئيسية</Btn>
          </div>
        );
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif", minHeight: "100vh", background: "var(--bg)" }}>
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
      <div style={{ paddingBottom: 80, position: "relative", zIndex: 1 }}>
        {renderPage()}
      </div>
      <Footer navigate={navigate} />
    </div>
  );
}
