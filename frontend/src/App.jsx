// ============================================================
// Tabibi — v2 FIXED
// Fixes: navigation keys, booking (1899 date), OTP verification
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react";

//const BASE = "https://tabibi.dz/api";
const BASE = "http://localhost:8000/api";
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
      <span style={{ fontSize: 20 }}>{toast.type === "error" ? "❌" : "✅"}</span>
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, color: "inherit" }}>×</button>
    </div>
  ) : null;
  return { show, Toast };
}

const Stars = ({ rating = 0, interactive, onChange, size = 18 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} onClick={() => interactive && onChange?.(i)}
        style={{ fontSize: size, cursor: interactive ? "pointer" : "default", color: i <= rating ? "#f59e0b" : "#d1d5db", transition: "color 0.1s" }}>★</span>
    ))}
  </div>
);

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
      fontSize: size * 0.45, flexShrink: 0, ...style
    }}>👨‍⚕️</div>
  );
};

const Badge = ({ children, color = "#0891b2" }) => (
  <span style={{ background: color + "15", color, border: `1px solid ${color}30`, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{children}</span>
);

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 24,
    cursor: onClick ? "pointer" : "default", ...style
  }}>{children}</div>
);

const Input = ({ label, error, ...p }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</label>}
    <input {...p} style={{
      width: "100%", padding: "10px 14px", border: `1.5px solid ${error ? "#f87171" : "#e5e7eb"}`,
      borderRadius: 10, fontSize: 14, outline: "none", background: "#fafafa",
      boxSizing: "border-box", transition: "border 0.2s", ...p.style
    }}
      onFocus={e => e.target.style.borderColor = "#0891b2"}
      onBlur={e => e.target.style.borderColor = error ? "#f87171" : "#e5e7eb"}
    />
    {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠ {error}</div>}
  </div>
);

const Btn = ({ children, variant = "primary", style = {}, loading: ld, disabled, ...p }) => {
  const variants = {
    primary: { background: "linear-gradient(135deg,#0891b2,#0e7490)", color: "#fff", boxShadow: "0 4px 12px rgba(8,145,178,0.25)" },
    secondary: { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" },
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
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#0c4a6e", fontSize: 20, fontWeight: 900 }}>
            {type === "email" ? "✉️ تأكيد البريد" : "📱 تأكيد الهاتف"}
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
                <div style={{ fontSize: 12, color: "#854d0e", marginBottom: 4 }}>⚠️ وضع التطوير — الرمز:</div>
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
                تأكيد الرمز ✓
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
  const name = user?.profile?.FullName?.split(" ")[0] || user?.username || "U";

  return (
    <nav style={{
      background: "#fff", borderBottom: "1px solid #e5e7eb",
      padding: "0 24px", height: 64, display: "flex",
      alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 500, boxShadow: "0 1px 8px rgba(0,0,0,0.06)"
    }}>
      <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0891b2,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 }}>🏥</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#0e7490", lineHeight: 1.1 }}>طبيبي</div>
          <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase" }}>Tabibi</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {[["🔍 بحث", "/search"], ["📅 مواعيدي", "/appointments"], ["💬 رسائل", "/chat"]].map(([l, p]) => (
          <button key={p} onClick={() => navigate(p)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "8px 12px",
            borderRadius: 8, color: "#374151", fontWeight: 600, fontSize: 13, transition: "all 0.15s",
            display: (!user && p !== "/search") ? "none" : "block"
          }}
            onMouseEnter={e => e.target.style.background = "#f3f4f6"}
            onMouseLeave={e => e.target.style.background = "none"}>{l}</button>
        ))}
        {user ? (
          <div style={{ position: "relative" }}>
            <button onClick={() => setOpen(!open)} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
              border: "1px solid #6ee7b7", borderRadius: 30, padding: "6px 14px 6px 8px", cursor: "pointer"
            }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0891b2,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                {name[0].toUpperCase()}
              </div>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#065f46" }}>{name}</span>
              <span style={{ fontSize: 9, color: "#065f46" }}>▼</span>
            </button>
            {open && (
              <div style={{ position: "absolute", right: 0, top: 46, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", minWidth: 180, overflow: "hidden", zIndex: 600 }}>
                {[
                  ["👤", "ملفي الشخصي", "/profile"],
                  ["📅", "مواعيدي", "/appointments"],
                  ["💬", "رسائلي", "/chat"],
                ].map(([ic, lb, pt]) => (
                  <button key={pt} onClick={() => { navigate(pt); setOpen(false); }} style={{
                    width: "100%", padding: "11px 16px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "right", display: "flex", alignItems: "center",
                    gap: 10, fontSize: 14, color: "#374151", transition: "background 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <span>{ic}</span><span style={{ fontWeight: 600 }}>{lb}</span>
                  </button>
                ))}
                <div style={{ borderTop: "1px solid #f3f4f6" }} />
                <button onClick={() => { onLogout(); setOpen(false); }} style={{
                  width: "100%", padding: "11px 16px", background: "none", border: "none",
                  cursor: "pointer", textAlign: "right", display: "flex", alignItems: "center",
                  gap: 10, fontSize: 14, color: "#dc2626"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <span>🚪</span><span style={{ fontWeight: 600 }}>تسجيل خروج</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={() => navigate("/login")} style={{ padding: "8px 18px" }}>دخول</Btn>
            <Btn variant="primary" onClick={() => navigate("/register")} style={{ padding: "8px 18px" }}>تسجيل</Btn>
          </div>
        )}
      </div>
    </nav>
  );
}

// ── PAGE: HOME ────────────────────────────────────────────────
function HomePage({ user, navigate }) {
  const [q, setQ] = useState("");
  const [specialties, setSP] = useState([]);
  useEffect(() => { api.specialties().then(setSP).catch(() => { }); }, []);

  const icons = { "Médecine générale": "🩺", "Dentisterie": "🦷", "Cardiologie": "❤️", "Ophtalmologie": "👁️", "Pédiatrie": "👶", "Gynécologie-obstétrique": "🤰", "Dermatologie": "🧴", "Neurologie": "🧠", "Orthopédie et traumatologie": "🦴", "Psychiatrie": "🧘", "Gastro-entérologie": "🫀", "Oncologie": "🎗️" };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0c4a6e,#0891b2,#06b6d4)", padding: "80px 24px 100px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "#7dd3fc", marginBottom: 12, fontWeight: 600 }}>منصة حجز المواعيد الطبية في الجزائر</p>
          <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
            صحتك أولويتنا<br /><span style={{ color: "#7dd3fc" }}>طبيبك على بُعد نقرة</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", maxWidth: 460, margin: "0 auto 36px" }}>ابحث عن طبيبك، احجز موعدك، وتابع صحتك</p>
          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 14, padding: 8, display: "flex", gap: 8, maxWidth: 580, margin: "0 auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && navigate(`/search?q=${encodeURIComponent(q)}`)}
              placeholder="ابحث عن طبيب، تخصص، عيادة..."
              style={{ flex: 1, padding: "11px 16px", border: "none", outline: "none", fontSize: 14, background: "transparent", direction: "rtl" }}
            />
            <Btn onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)} style={{ padding: "11px 24px", borderRadius: 10 }}>بحث 🔍</Btn>
          </div>
        </div>
      </div>
      <svg viewBox="0 0 1200 50" style={{ width: "100%", display: "block", marginTop: -1 }}><path d="M0,25 C300,50 900,0 1200,25 L1200,50 L0,50 Z" fill="#f9fafb" /></svg>

      {/* Stats */}
      <div style={{ maxWidth: 860, margin: "-20px auto 40px", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[["👨‍⚕️", "1200+", "طبيب"], ["🏥", "800+", "عيادة"], ["👥", "50000+", "مريض"]].map(([ic, n, l]) => (
            <Card key={l} style={{ textAlign: "center", padding: "18px 12px" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{ic}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#0891b2" }}>{n}</div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{l}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div style={{ maxWidth: 1100, margin: "0 auto 60px", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0c4a6e", margin: 0 }}>التخصصات الطبية</h2>
          <button onClick={() => navigate("/search")} style={{ color: "#0891b2", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>عرض الكل ←</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))", gap: 10 }}>
          {specialties.slice(0, 12).map(s => (
            <div key={s.ID} onClick={() => navigate(`/search?specialty=${s.ID}`)}
              style={{ background: "#fff", borderRadius: 12, padding: "14px 10px", textAlign: "center", cursor: "pointer", border: "1px solid #e5e7eb", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0891b2"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(8,145,178,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>{icons[s.NameFr] || "🩺"}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", lineHeight: 1.3 }}>{s.NameAr}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!user && (
        <div style={{ background: "linear-gradient(135deg,#ecfeff,#e0f7fa)", padding: "48px 24px", textAlign: "center", marginBottom: 0 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", marginBottom: 8 }}>ابدأ مجاناً اليوم</h2>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>انضم إلى آلاف المرضى الذين يثقون في طبيبي</p>
          <Btn onClick={() => navigate("/register")} style={{ padding: "13px 36px", fontSize: 15 }}>إنشاء حساب مجاني 🚀</Btn>
        </div>
      )}
    </div>
  );
}

// ── PAGE: LOGIN ───────────────────────────────────────────────
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
    <div style={{ minHeight: "90vh", background: "linear-gradient(135deg,#ecfeff,#f0fdfa)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏥</div>
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
        <div style={{ marginTop: 16, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "11px 14px", fontSize: 12 }}>
          <strong style={{ color: "#ea580c" }}>🔑 حساب تجريبي:</strong>
          <div style={{ color: "#92400e", marginTop: 3 }}>المستخدم: <code>Kaioran</code> | كلمة المرور: <code>FJHajf552:</code></div>
        </div>
      </div>
    </div>
  );
}

// ── PAGE: REGISTER ────────────────────────────────────────────
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
    <div style={{ minHeight: "90vh", background: "linear-gradient(135deg,#ecfeff,#f0fdfa)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🤝</div>
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
                <select value={form.gender} onChange={e => f("gender", +e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, background: "#fafafa", boxSizing: "border-box" }}>
                  <option value={0}>ذكر</option><option value={1}>أنثى</option>
                </select>
              </div>
            </div>
            <Input label="كلمة المرور *" type="password" value={form.password} onChange={e => f("password", e.target.value)} placeholder="8 أحرف على الأقل" required />
            <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 12, marginTop: 6 }}>
              {loading ? "جاري الإنشاء..." : "إنشاء الحساب 🚀"}
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

// ── PAGE: SEARCH ──────────────────────────────────────────────
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
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", marginBottom: 6 }}>🔍 البحث عن طبيب</h1>
      <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 13 }}>ابحث من بين آلاف الأطباء في جميع أنحاء الجزائر</p>

      <Card style={{ marginBottom: 20, padding: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch(q, sp)}
            placeholder="اسم الطبيب أو العيادة أو التخصص..."
            style={{ flex: 2, minWidth: 180, padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none", direction: "rtl", boxSizing: "border-box" }}
          />
          <select value={sp} onChange={e => setSP(e.target.value)}
            style={{ flex: 1, minWidth: 150, padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, background: "#fafafa", boxSizing: "border-box" }}>
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
                style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 18, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(8,145,178,0.12)"; e.currentTarget.style.borderColor = "#0891b2"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <DoctorImage photo={r.PhotoProfile} size={48} borderRadius={10} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0c4a6e", marginBottom: 4 }}>{r.DoctorName}</div>
                    <Badge color="#0891b2">{r.SpecialtyAr}</Badge>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>🏥 {r.ClinicName}</div>
                {r.ClinicAddress && <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>📍 {r.ClinicAddress.slice(0, 60)}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Stars rating={Math.round(+r.AvgRating)} size={13} />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>({r.RatingCount})</span>
                  </div>
                  {+r.Pricing > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>{r.Pricing} DA</span>}
                  {+r.Experience > 0 && <span style={{ fontSize: 11, color: "#9ca3af" }}>{r.Experience} سنة خبرة</span>}
                </div>
              </div>
            ))}
          </div>
          {results.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#9ca3af" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>لا توجد نتائج</div>
            </div>
          )}
        </>
      )}
      <Toast />
    </div>
  );
}

// ── PAGE: DOCTOR DETAIL ───────────────────────────────────────
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
      <div style={{ fontSize: 44, marginBottom: 12 }}>😔</div>
      <div style={{ fontWeight: 600, marginBottom: 16 }}>طبيب غير موجود</div>
      <Btn onClick={() => navigate("/search")}>رجوع للبحث</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
      <button onClick={() => navigate("/search")} style={{ background: "none", border: "none", cursor: "pointer", color: "#0891b2", fontWeight: 600, marginBottom: 18, display: "flex", alignItems: "center", gap: 5, fontSize: 14 }}>
        ← رجوع للبحث
      </button>

      {/* Doctor header */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <DoctorImage photo={data.PhotoProfile} size={90} borderRadius={16} style={{ fontSize: 38 }} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <Badge color="#0891b2">{data.SpecialtyAr || data.SpecialtyFr}</Badge>
              {data.Degrees && <Badge color="#7c3aed">{data.Degrees}</Badge>}
              {+data.Cnas === 1 && <Badge color="#059669">CNAS ✓</Badge>}
              {+data.Casnos === 1 && <Badge color="#0891b2">CASNOS ✓</Badge>}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", margin: "0 0 6px" }}>{data.FullName}</h1>
            {data.BaladiyaName && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>📍 {data.BaladiyaName}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Stars rating={Math.round(+(data.AvgRating || 0))} size={15} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{(+(data.AvgRating || 0)).toFixed(1)}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>({data.RatingCount || 0} تقييم)</span>
              </div>
              {+data.Experience > 0 && <span style={{ fontSize: 12, color: "#6b7280" }}>⏱ {data.Experience} سنة خبرة</span>}
              {+data.Pricing > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>💰 {data.Pricing} DA</span>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            {user ? (
              <Btn onClick={() => navigate(`/book/${clinicId}/${doctorId}`)} style={{ padding: "11px 24px" }}>📅 حجز موعد</Btn>
            ) : (
              <Btn onClick={() => navigate("/login")}>تسجيل دخول للحجز</Btn>
            )}
            <Btn variant="secondary" onClick={() => { navigate("/chat"); }} style={{ padding: "9px 24px", fontSize: 13 }}>💬 تواصل</Btn>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 20 }}>
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
              <h3 style={{ color: "#0c4a6e", margin: "0 0 10px", fontSize: 15 }}>📋 عن الطبيب</h3>
              <p style={{ color: "#374151", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{data.Presentation}</p>
            </Card>
          )}
          {data.Education && (
            <Card style={{ padding: "18px 20px" }}>
              <h3 style={{ color: "#0c4a6e", margin: "0 0 10px", fontSize: 15 }}>🎓 التعليم</h3>
              <p style={{ color: "#374151", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{data.Education}</p>
            </Card>
          )}
          <Card style={{ padding: "18px 20px" }}>
            <h3 style={{ color: "#0c4a6e", margin: "0 0 12px", fontSize: 15 }}>📞 معلومات التواصل</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13 }}>
              {data.Phone && <div>📱 <strong>هاتف:</strong> {data.Phone}</div>}
              {data.Email && <div>✉️ <strong>بريد:</strong> {data.Email}</div>}
              {data.SpeakingLanguage && <div>🗣 <strong>اللغات:</strong> {data.SpeakingLanguage}</div>}
              {data.PayementMethods && <div>💳 <strong>الدفع:</strong> {data.PayementMethods}</div>}
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
              {+r.reason_time > 0 && <div style={{ fontSize: 11, color: "#9ca3af" }}>⏱ {r.reason_time} دقيقة</div>}
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
              <span>🗓️</span> أيام وساعات العمل
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
                    border: `1.5px solid ${d.works ? "#0891b2" : "#e5e7eb"}`,
                    opacity: d.works ? 1 : 0.6,
                    transition: "all 0.2s"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: d.works ? "#0891b2" : "#9ca3af", marginBottom: 4 }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: d.works ? "#0e7490" : "#d1d5db" }}>{d.works ? "متاح للعمل" : "عطلة"}</div>
                  </div>
                ));
              })()}
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px", border: "1px dashed #cbd5e1" }}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⏰</span>
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>من:</strong> {(data.Schedule.DaytimeStart || "").match(/\d{2}:\d{2}/)?.[0] || "08:00"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⌛</span>
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>إلى:</strong> {(data.Schedule.DaytimeEnd || "").match(/\d{2}:\d{2}/)?.[0] || "17:00"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⏱️</span>
                  <span style={{ fontSize: 14, color: "#334155" }}>
                    <strong>مدة الموعد:</strong> {data.Schedule.TimeScale} دقيقة
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🗓️</div>
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
              <h3 style={{ color: "#0c4a6e", margin: "0 0 14px", fontSize: 15 }}>✍️ أضف تقييمك</h3>
              <div style={{ marginBottom: 12 }}><Stars rating={myRating} interactive onChange={setMR} size={24} /></div>
              <textarea value={myComment} onChange={e => setMC(e.target.value)} rows={3}
                placeholder="أضف تعليقك (اختياري)..."
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
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

// ── PAGE: BOOK APPOINTMENT (5-step wizard) ───────────────────
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
    { n: 1, label: "المريض", icon: "👤" },
    { n: 2, label: "السبب", icon: "🩺" },
    { n: 3, label: "الموعد", icon: "📅" },
    { n: 4, label: "التأكيد", icon: "✅" },
    { n: 5, label: "تم ✓", icon: "🎉" },
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
      <div style={{ fontSize: 44, marginBottom: 12 }}>❌</div>
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
                  ? "linear-gradient(to left, #0891b2 60%, #e5e7eb 100%)"
                  : "#e5e7eb"
            }} />
          )}
          <div style={{
            width: 38, height: 38, borderRadius: "50%", zIndex: 1, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: step > s.n ? 16 : 14,
            transition: "all 0.35s",
            background: (step > s.n || (step === 5 && s.n === 5)) ? "linear-gradient(135deg,#059669,#10b981)"
              : step === s.n ? "linear-gradient(135deg,#0891b2,#0e7490)"
                : "#e5e7eb",
            color: (step >= s.n) ? "#fff" : "#9ca3af",
            boxShadow: step === s.n ? "0 4px 16px rgba(8,145,178,0.4)"
              : (step > s.n || (step === 5 && s.n === 5)) ? "0 4px 12px rgba(5,150,105,0.3)" : "none",
            transform: step === s.n ? "scale(1.12)" : "scale(1)"
          }}>
            {(step > s.n) ? "✓" : s.icon}
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
        <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 800 }}>
          💰 {doctor.Pricing} DA
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px" }}>
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
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>👤 اختيار المريض</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>اختر المريض الذي سيتلقى هذه الزيارة الطبية</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {allPatients.map((p, i) => {
              const sel = activePat.id === p.id && activePat.isSelf === p.isSelf;
              return (
                <div key={i} onClick={() => setSelPatient(p)}
                  style={{
                    padding: "14px 18px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                    border: sel ? "2.5px solid #0891b2" : "1.5px solid #e5e7eb",
                    background: sel ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : "#fafafa",
                    display: "flex", alignItems: "center", gap: 14,
                    boxShadow: sel ? "0 4px 18px rgba(8,145,178,0.14)" : "none",
                    transform: sel ? "scale(1.01)" : "scale(1)"
                  }}
                  onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = "#0891b2"; e.currentTarget.style.background = "#f0fdff"; } }}
                  onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fafafa"; } }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: "50%", flexShrink: 0, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
                    background: sel ? "linear-gradient(135deg,#0891b2,#0e7490)" : "linear-gradient(135deg,#f3f4f6,#e5e7eb)"
                  }}>
                    {p.isSelf ? "😊" : (p.gender === 1 ? "👩" : "👨")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: sel ? "#0c4a6e" : "#374151" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                      {p.isSelf ? "المستخدم الحالي (أنا)" : "فرد من العائلة"}
                    </div>
                  </div>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", transition: "all 0.2s",
                    background: sel ? "#0891b2" : "#e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 13, fontWeight: 900
                  }}>{sel ? "✓" : ""}</div>
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
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>🩺 سبب الزيارة</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>
            اختر سبب زيارتك إن وجد — <span style={{ color: "#0891b2", fontWeight: 700 }}>اختياري، يمكنك التخطي</span>
          </p>

          {(!doctor.Reasons || doctor.Reasons.length === 0) ? (
            <div style={{ padding: "28px", textAlign: "center", color: "#9ca3af", background: "#f9fafb", borderRadius: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
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
                      border: sel ? "2.5px solid #0891b2" : "1.5px solid #e5e7eb",
                      background: sel ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : "#fafafa",
                      boxShadow: sel ? "0 4px 14px rgba(8,145,178,0.14)" : "none",
                      transform: sel ? "scale(1.02)" : "scale(1)"
                    }}
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = "#0891b2"; e.currentTarget.style.background = "#f0fdff"; } }}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fafafa"; } }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 700, color: sel ? "#0c4a6e" : "#374151", fontSize: 14 }}>{r.reason_name}</div>
                      {sel && <span style={{ color: "#0891b2", fontSize: 16, fontWeight: 900 }}>✓</span>}
                    </div>
                    {+r.reason_time > 0 && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>⏱ {r.reason_time} دقيقة</div>}
                  </div>
                );
              })}
            </div>
          )}

          {reason && (
            <div style={{ background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: 10, padding: "10px 16px", marginTop: 12, fontSize: 13, color: "#0e7490", display: "flex", alignItems: "center", gap: 10 }}>
              ✅ تم اختيار: <strong>{reason.reason_name}</strong>
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
                      border: sel ? "2.5px solid #0891b2" : "1.5px solid #e5e7eb",
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
                          border: selSlot === s ? "2px solid #0891b2" : "1.5px solid #e5e7eb",
                          background: selSlot === s ? "linear-gradient(135deg,#0891b2,#0e7490)" : "#fafafa",
                          color: selSlot === s ? "#fff" : "#374151",
                          boxShadow: selSlot === s ? "0 4px 14px rgba(8,145,178,0.3)" : "none",
                          transform: selSlot === s ? "scale(1.06)" : "scale(1)"
                        }}>
                        {s}
                      </div>
                    ))}
                  </div>
                  {slots.length === 0 && (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", background: "#f9fafb", borderRadius: 12, marginTop: 4 }}>
                      <div style={{ fontSize: 34, marginBottom: 8 }}>📭</div>
                      <div style={{ fontWeight: 600 }}>لا توجد أوقات متاحة</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>جرّب تاريخًا آخر</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {!date && (
            <div style={{ textAlign: "center", padding: "28px 0", color: "#9ca3af", background: "#f9fafb", borderRadius: 12 }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>📅</div>
              <div>اختر تاريخاً أولاً لعرض الأوقات المتاحة</div>
            </div>
          )}

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
          <h2 style={{ color: "#0c4a6e", margin: "0 0 5px", fontSize: 19, fontWeight: 900 }}>✅ مراجعة وتأكيد الحجز</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 22px" }}>تحقق من التفاصيل قبل إتمام الحجز النهائي</p>

          <div style={{
            background: "linear-gradient(135deg,#f0fdfa,#ecfeff)",
            border: "1px solid #a5f3fc", borderRadius: 14, padding: "20px 22px", marginBottom: 20
          }}>
            {[
              ["👨‍⚕️", "الطبيب", doctor.FullName],
              ["🏥", "التخصص", doctor.SpecialtyAr || doctor.SpecialtyFr || "—"],
              ["👤", "المريض", `${activePat.name}${activePat.isSelf ? " (أنا)" : " — فرد عائلة"}`],
              ["🩺", "سبب الزيارة", reason?.reason_name || "—  (غير محدد)"],
              ["📅", "التاريخ", date],
              ["⏰", "الوقت", selSlot],
              ...(+doctor.Pricing > 0 ? [["💰", "رسوم الاستشارة", `${doctor.Pricing} دج`]] : []),
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
            <span style={{ fontSize: 16 }}>💡</span>
            <span>سيتم إرسال تأكيد الموعد على بريدك الإلكتروني فور إتمام الحجز</span>
          </div>

          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "20px", marginBottom: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: "#0c4a6e", marginTop: 0, marginBottom: 12 }}>📄 اتفاقية الخصوصية والموافقة</h3>
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
              🎉 تأكيد الحجز نهائيًا
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
            fontSize: 40, boxShadow: "0 12px 36px rgba(5,150,105,0.35)",
            animation: "popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards"
          }}>✅</div>

          <h2 style={{ color: "#059669", fontSize: 24, fontWeight: 900, margin: "0 0 10px" }}>
            تم تأكيد حجزك بنجاح! 🎉
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
            <div style={{ fontSize: 13, color: "#166534", marginBottom: 4, display: "flex", gap: 8 }}>
              <span>👤</span><span><strong>المريض:</strong> {activePat.name}</span>
            </div>
            {reason && (
              <div style={{ fontSize: 13, color: "#166534", display: "flex", gap: 8 }}>
                <span>🩺</span><span><strong>السبب:</strong> {reason.reason_name}</span>
              </div>
            )}
          </div>

          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "11px 16px", marginBottom: 28, fontSize: 13, color: "#1e40af", display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
            <span>📧</span><span>تم إرسال تأكيد بالبريد الإلكتروني — تحقق من صندوق الوارد</span>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="secondary" onClick={() => navigate("/")} style={{ padding: "11px 26px", borderRadius: 10 }}>
              🏠 الصفحة الرئيسية
            </Btn>
            <Btn onClick={() => navigate("/appointments")} style={{ padding: "11px 26px", borderRadius: 10 }}>
              📅 عرض مواعيدي
            </Btn>
          </div>
        </Card>
      )}

      <Toast />
    </div>
  );
}


// ── PAGE: MY APPOINTMENTS ─────────────────────────────────────
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
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", margin: 0 }}>📅 مواعيدي</h1>
        <Btn onClick={() => navigate("/search")} style={{ padding: "9px 18px", fontSize: 13 }}>+ حجز موعد جديد</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[["all", "الكل"], ["upcoming", "القادمة"], ["past", "الماضية"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            borderColor: filter === v ? "#0891b2" : "#e5e7eb",
            background: filter === v ? "#ecfeff" : "#fff",
            color: filter === v ? "#0891b2" : "#6b7280"
          }}>{l} ({cnt(v)})</button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 16 }}>
            {filter === "upcoming" ? "لا توجد مواعيد قادمة" : "لا توجد مواعيد"}
          </div>
          <Btn onClick={() => navigate("/search")}>ابحث عن طبيب</Btn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(a => {
            const isPast = new Date(a.AppointementDate) < now;
            const d = new Date(a.AppointementDate);
            return (
              <Card key={a.ID} style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <DoctorImage photo={a.PhotoProfile} size={46} borderRadius={10} style={{ background: isPast ? "#f3f4f6" : undefined }} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "#0c4a6e", fontSize: 15 }}>{a.DoctorName || "طبيب"}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>🏥 {a.ClinicName || "—"}</div>
                        {a.ReasonName && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>🩺 {a.ReasonName}</div>}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 800, color: "#0891b2", fontSize: 14 }}>
                          {d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                          ⏰ {d.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          {isPast ? <Badge color="#6b7280">منتهي</Badge> : <Badge color="#059669">✓ قادم</Badge>}
                        </div>
                      </div>
                    </div>
                    {!isPast && (
                      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        <Btn variant="danger" onClick={() => cancel(a.ID)} style={{ padding: "6px 14px", fontSize: 12 }}>❌ إلغاء</Btn>
                      </div>
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

// ── PAGE: PROFILE ─────────────────────────────────────────────
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
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 24px" }}>
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
              {verStatus?.email_verified ? "✓ بريد مؤكد" : "⚠ بريد غير مؤكد"}
            </Badge>
            <Badge color={verStatus?.phone_verified ? "#059669" : "#f59e0b"}>
              {verStatus?.phone_verified ? "✓ هاتف مؤكد" : "⚠ هاتف غير مؤكد"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Verification section */}
      {verStatus && (!verStatus.email_verified || !verStatus.phone_verified) && (
        <Card style={{ marginBottom: 20, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <h3 style={{ color: "#92400e", margin: "0 0 14px", fontSize: 15 }}>🔐 تأكيد الهوية</h3>
          <p style={{ color: "#78350f", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
            أكّد بريدك الإلكتروني ورقم هاتفك لتحسين أمان حسابك وضمان استلام إشعارات المواعيد.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!verStatus.email_verified && verStatus.has_email && (
              <Btn variant="ghost" onClick={() => setOTP("email")} style={{ fontSize: 13, padding: "8px 18px" }}>
                ✉️ تأكيد البريد الإلكتروني
              </Btn>
            )}
            {!verStatus.phone_verified && verStatus.has_phone && (
              <Btn variant="ghost" onClick={() => setOTP("phone")} style={{ fontSize: 13, padding: "8px 18px" }}>
                📱 تأكيد رقم الهاتف
              </Btn>
            )}
            {!verStatus.has_email && (
              <div style={{ fontSize: 12, color: "#9ca3af" }}>⚠ أضف بريدك الإلكتروني أولاً لتتمكن من تأكيده</div>
            )}
          </div>
        </Card>
      )}

      <form onSubmit={save}>
        {/* Personal Info */}
        <Card style={{ marginBottom: 14 }}>
          <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800 }}>👤 المعلومات الشخصية</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="الاسم الكامل" value={form.FullName || ""} onChange={e => f("FullName", e.target.value)} />
            <Input label="رقم الهاتف" type="tel" value={form.Phone || ""} onChange={e => f("Phone", e.target.value)} />
            <Input label="البريد الإلكتروني" type="email" value={form.Email || ""} onChange={e => f("Email", e.target.value)} />
            <Input label="تاريخ الميلاد" type="date" value={(form.BirthDate || "").split("T")[0] || ""} onChange={e => f("BirthDate", e.target.value)} />
            <Input label="العنوان" value={form.Address || ""} onChange={e => f("Address", e.target.value)} style={{ gridColumn: "1/-1" }} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>الجنس</label>
              <select value={form.Gender ?? 0} onChange={e => f("Gender", +e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, background: "#fafafa", boxSizing: "border-box" }}>
                <option value={0}>ذكر</option><option value={1}>أنثى</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>فصيلة الدم</label>
              <select value={form.BloodType || ""} onChange={e => f("BloodType", e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, background: "#fafafa", boxSizing: "border-box" }}>
                <option value="">غير محدد</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Emergency */}
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800 }}>🆘 جهة الطوارئ</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="هاتف الطوارئ" value={form.EmergancyPhone || ""} onChange={e => f("EmergancyPhone", e.target.value)} />
            <Input label="بريد الطوارئ" type="email" value={form.EmergancyEmail || ""} onChange={e => f("EmergancyEmail", e.target.value)} />
          </div>
          <div style={{ marginBottom: 0 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>ملاحظات طوارئ</label>
            <textarea value={form.EmergancyNote || ""} onChange={e => f("EmergancyNote", e.target.value)} rows={2}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
          </div>
        </Card>

        <Btn type="submit" loading={saving} style={{ width: "100%", justifyContent: "center", padding: 12, fontSize: 15 }}>
          💾 حفظ التغييرات
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
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", marginBottom: 20 }}>💬 الرسائل</h1>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14, height: 580 }}>
        {/* Threads */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
                <div style={{ fontWeight: 700, color: "#0c4a6e", fontSize: 13, marginBottom: 3 }}>👨‍⚕️ {t.DoctorName}</div>
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
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {sel ? (
            <>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", fontWeight: 800, color: "#0c4a6e", display: "flex", alignItems: "center", gap: 8 }}>
                <span>👨‍⚕️</span>
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
                  style={{ flex: 1, padding: "9px 13px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none" }}
                />
                <Btn onClick={send} loading={sending} style={{ padding: "9px 18px", fontSize: 13 }}>إرسال</Btn>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>💬</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>اختر محادثة من القائمة</div>
            </div>
          )}
        </div>
      </div>
      <Toast />
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────
export default function App() {
  const { route, qs, navigate } = useRoute();
  const { user, loading, login, register, logout } = useAuth();

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdfa" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>🏥</div>
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
            <div style={{ fontSize: 60, marginBottom: 14 }}>🔍</div>
            <h1 style={{ color: "#0c4a6e", fontWeight: 900 }}>404 — الصفحة غير موجودة</h1>
            <Btn onClick={() => navigate("/")} style={{ marginTop: 20 }}>الصفحة الرئيسية</Btn>
          </div>
        );
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif", minHeight: "100vh", background: "#f9fafb" }}>
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
      {/* KEY on wrapper forces remount on every route change */}
      <div key={route + qs}>
        {renderPage()}
      </div>
      <footer style={{ background: "#0c4a6e", color: "rgba(255,255,255,0.7)", textAlign: "center", padding: "20px", marginTop: 48, fontSize: 12 }}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 3 }}>طبيبي — Tabibi</div>
        منصة حجز المواعيد الطبية في الجزائر © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
