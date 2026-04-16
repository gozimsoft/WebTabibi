// ============================================================
// Tabibi — نظام حجز المواعيد الطبية
// Full React SPA — All pages in one file
// Design: Refined Medical — clean teal/white with Arabic support
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react";

// ── API Layer ─────────────────────────────────────────────────
const BASE = "http://localhost:8000/api";
const getToken = () => localStorage.getItem("tabibi_token");

async function req(method, path, body, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
  const r = await fetch(`${BASE}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json();
  if (!d.success) throw new Error(d.message || "Erreur serveur");
  return d.data ?? d;
}

const api = {
  auth: {
    register: b  => req("POST","/auth/register", b, false),
    login:    b  => req("POST","/auth/login",    b, false),
    logout:   () => req("POST","/auth/logout"),
    me:       () => req("GET", "/auth/me"),
  },
  patient: {
    profile:    ()  => req("GET","/patients/profile"),
    update:     b   => req("PUT","/patients/profile", b),
    appointments: () => req("GET","/patients/appointments"),
  },
  clinics: {
    search:   p    => req("GET",`/clinics?${new URLSearchParams(p)}`),
    one:      id   => req("GET",`/clinics/${id}`),
    doctor:   (c,d)=> req("GET",`/clinics/${c}/doctors/${d}`),
  },
  specialties: () => req("GET","/specialties"),
  appointments: {
    slots:  p  => req("GET",`/appointments/available-slots?${new URLSearchParams(p)}`),
    book:   b  => req("POST","/appointments", b),
    cancel: id => req("DELETE",`/appointments/${id}`),
  },
  chat: {
    threads:    ()      => req("GET", "/chat/threads"),
    create:     b       => req("POST","/chat/threads", b),
    messages:   id      => req("GET", `/chat/threads/${id}`),
    send:       (id, b) => req("POST",`/chat/threads/${id}/messages`, b),
  },
  ratings: {
    add:    b  => req("POST","/ratings", b),
    doctor: id => req("GET",`/ratings/doctor/${id}`),
  },
};

// ── Router (simple hash-based) ────────────────────────────────
function useRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const handler = () => setRoute(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = useCallback(path => { window.location.hash = path; }, []);
  return { route, navigate };
}

// ── Auth State ────────────────────────────────────────────────
function useAuth() {
  const [user, setUser]   = useState(null);
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
    try { await api.auth.logout(); } catch {}
    localStorage.removeItem("tabibi_token");
    setUser(null);
  };

  return { user, loading, login, register, logout, setUser };
}

// ── Shared UI Components ──────────────────────────────────────
const Spinner = ({ size = 24 }) => (
  <div style={{ display:"flex", justifyContent:"center", padding:20 }}>
    <div style={{
      width: size, height: size,
      border: `3px solid #e2f4f4`,
      borderTopColor: "#0891b2",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite"
    }} />
  </div>
);

const Toast = ({ msg, type, onClose }) => (
  msg ? <div style={{
    position:"fixed", bottom:24, right:24, zIndex:9999,
    background: type==="error" ? "#fee2e2" : "#d1fae5",
    color: type==="error" ? "#991b1b" : "#065f46",
    border: `1px solid ${type==="error"?"#fca5a5":"#6ee7b7"}`,
    borderRadius:12, padding:"12px 20px",
    fontWeight:600, fontSize:14, boxShadow:"0 8px 25px rgba(0,0,0,0.12)",
    display:"flex", gap:12, alignItems:"center", maxWidth:380
  }}>
    <span style={{fontSize:18}}>{type==="error"?"❌":"✅"}</span>
    <span style={{flex:1}}>{msg}</span>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
  </div> : null
);

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };
  return { toast, show };
}

const Stars = ({ rating, interactive, onChange, size = 20 }) => (
  <div style={{ display:"flex", gap:3 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i}
        onClick={() => interactive && onChange?.(i)}
        style={{
          fontSize: size, cursor: interactive ? "pointer" : "default",
          color: i <= rating ? "#f59e0b" : "#d1d5db",
          transition:"color 0.15s"
        }}>★</span>
    ))}
  </div>
);

const Badge = ({ children, color = "#0891b2" }) => (
  <span style={{
    background: color + "15", color, border: `1px solid ${color}30`,
    borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600
  }}>{children}</span>
);

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background:"#fff", borderRadius:16,
    border:"1px solid #e5e7eb",
    boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
    padding:24, transition:"all 0.2s",
    cursor: onClick ? "pointer" : "default",
    ...(onClick ? { ":hover": { boxShadow:"0 6px 20px rgba(0,0,0,0.1)" } } : {}),
    ...style
  }}>{children}</div>
);

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:"block", marginBottom:6, fontSize:14, fontWeight:600, color:"#374151" }}>{label}</label>}
    <input {...props} style={{
      width:"100%", padding:"10px 14px",
      border:"1.5px solid #e5e7eb", borderRadius:10,
      fontSize:14, outline:"none", background:"#fafafa",
      transition:"border 0.2s", boxSizing:"border-box",
      ...props.style
    }}
    onFocus={e => e.target.style.borderColor="#0891b2"}
    onBlur={e => e.target.style.borderColor="#e5e7eb"}
    />
  </div>
);

const Select = ({ label, options = [], ...props }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:"block", marginBottom:6, fontSize:14, fontWeight:600, color:"#374151" }}>{label}</label>}
    <select {...props} style={{
      width:"100%", padding:"10px 14px",
      border:"1.5px solid #e5e7eb", borderRadius:10,
      fontSize:14, outline:"none", background:"#fafafa",
      boxSizing:"border-box", cursor:"pointer",
      ...props.style
    }}>
      <option value="">— Sélectionner —</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Btn = ({ children, variant="primary", style={}, loading, ...props }) => {
  const base = {
    padding:"10px 24px", borderRadius:10, fontWeight:700,
    fontSize:14, border:"none", cursor: loading ? "not-allowed" : "pointer",
    transition:"all 0.2s", display:"inline-flex", alignItems:"center", gap:8,
    opacity: loading ? 0.7 : 1
  };
  const variants = {
    primary:   { background:"linear-gradient(135deg,#0891b2,#0e7490)", color:"#fff", boxShadow:"0 4px 12px rgba(8,145,178,0.3)" },
    secondary: { background:"#f3f4f6", color:"#374151", border:"1px solid #e5e7eb" },
    danger:    { background:"#fee2e2", color:"#dc2626", border:"1px solid #fca5a5" },
    ghost:     { background:"transparent", color:"#0891b2" },
  };
  return (
    <button {...props} style={{ ...base, ...variants[variant], ...style }}>
      {loading && <Spinner size={14} />}{children}
    </button>
  );
};

// ── Layout ────────────────────────────────────────────────────
function Navbar({ user, navigate, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      background:"#fff", borderBottom:"1px solid #e5e7eb",
      padding:"0 24px", height:64, display:"flex",
      alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:100,
      boxShadow:"0 1px 8px rgba(0,0,0,0.06)"
    }}>
      {/* Logo */}
      <div onClick={() => navigate("/")} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:38, height:38, borderRadius:10,
          background:"linear-gradient(135deg,#0891b2,#0e7490)",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#fff", fontSize:20, fontWeight:900
        }}>🏥</div>
        <div>
          <div style={{ fontWeight:900, fontSize:18, color:"#0e7490", lineHeight:1.1 }}>طبيبي</div>
          <div style={{ fontSize:10, color:"#6b7280", letterSpacing:1, textTransform:"uppercase" }}>Tabibi</div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <button onClick={() => navigate("/search")} style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 14px", borderRadius:8, color:"#374151", fontWeight:600, fontSize:14, transition:"all 0.15s" }}
          onMouseEnter={e => e.target.style.background="#f3f4f6"}
          onMouseLeave={e => e.target.style.background="none"}>
          🔍 بحث
        </button>
        {user ? (
          <div style={{ position:"relative" }}>
            <button onClick={() => setOpen(!open)} style={{
              display:"flex", alignItems:"center", gap:8,
              background:"linear-gradient(135deg,#ecfdf5,#d1fae5)",
              border:"1px solid #6ee7b7", borderRadius:30,
              padding:"6px 14px 6px 8px", cursor:"pointer", transition:"all 0.2s"
            }}>
              <div style={{
                width:30, height:30, borderRadius:"50%",
                background:"linear-gradient(135deg,#0891b2,#0e7490)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#fff", fontWeight:700, fontSize:14
              }}>
                {(user.profile?.FullName || user.username || "U")[0].toUpperCase()}
              </div>
              <span style={{ fontWeight:600, fontSize:13, color:"#065f46" }}>
                {user.profile?.FullName?.split(' ')[0] || user.username}
              </span>
              <span style={{ fontSize:10 }}>▼</span>
            </button>
            {open && (
              <div style={{
                position:"absolute", right:0, top:44, background:"#fff",
                border:"1px solid #e5e7eb", borderRadius:12,
                boxShadow:"0 8px 30px rgba(0,0,0,0.12)", minWidth:180,
                overflow:"hidden", zIndex:200
              }}>
                {[
                  { icon:"👤", label:"ملفي الشخصي", path:"/profile" },
                  { icon:"📅", label:"مواعيدي", path:"/appointments" },
                  { icon:"💬", label:"رسائلي", path:"/chat" },
                ].map(item => (
                  <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); }} style={{
                    width:"100%", padding:"12px 16px", background:"none", border:"none",
                    cursor:"pointer", textAlign:"right", display:"flex", alignItems:"center",
                    gap:10, fontSize:14, color:"#374151", transition:"background 0.15s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background="#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background="none"}>
                    <span>{item.icon}</span><span style={{ fontWeight:600 }}>{item.label}</span>
                  </button>
                ))}
                <div style={{ borderTop:"1px solid #e5e7eb" }} />
                <button onClick={() => { onLogout(); setOpen(false); }} style={{
                  width:"100%", padding:"12px 16px", background:"none", border:"none",
                  cursor:"pointer", textAlign:"right", display:"flex", alignItems:"center",
                  gap:10, fontSize:14, color:"#dc2626", transition:"background 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.background="#fef2f2"}
                onMouseLeave={e => e.currentTarget.style.background="none"}>
                  <span>🚪</span><span style={{ fontWeight:600 }}>تسجيل خروج</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="secondary" onClick={() => navigate("/login")} style={{ padding:"8px 18px" }}>دخول</Btn>
            <Btn variant="primary" onClick={() => navigate("/register")} style={{ padding:"8px 18px" }}>تسجيل</Btn>
          </div>
        )}
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 1: HOME
// ═══════════════════════════════════════════════════════════════
function HomePage({ user, navigate }) {
  const [q, setQ]               = useState("");
  const [specialties, setSP]    = useState([]);
  const [stats]                 = useState({ doctors:1200, clinics:800, patients:50000 });

  useEffect(() => {
    api.specialties().then(setSP).catch(() => {});
  }, []);

  const specialtyIcons = {
    "Médecine générale":"🩺","Dentisterie":"🦷","Cardiologie":"❤️",
    "Ophtalmologie":"👁️","Pédiatrie":"👶","Gynécologie-obstétrique":"🤰",
    "Dermatologie":"🧴","Neurologie":"🧠","Orthopédie et traumatologie":"🦴",
    "Psychiatrie":"🧘"
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb" }}>
      {/* Hero */}
      <div style={{
        background:"linear-gradient(135deg, #0c4a6e 0%, #0891b2 50%, #06b6d4 100%)",
        padding:"80px 24px 100px", textAlign:"center", position:"relative",
        overflow:"hidden"
      }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:14, letterSpacing:3, textTransform:"uppercase", color:"#7dd3fc", marginBottom:16, fontWeight:600 }}>
            منصة حجز المواعيد الطبية في الجزائر
          </div>
          <h1 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:900, color:"#fff", margin:"0 0 16px", lineHeight:1.15, fontFamily:"Georgia, serif" }}>
            صحتك أولويتنا<br/>
            <span style={{ color:"#7dd3fc" }}>طبيبك على بُعد نقرة</span>
          </h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,0.8)", maxWidth:500, margin:"0 auto 40px" }}>
            ابحث عن طبيبك، احجز موعدك، وتابع صحتك — كل ذلك في مكان واحد
          </p>
          {/* Search bar */}
          <div style={{
            background:"rgba(255,255,255,0.95)", borderRadius:16,
            padding:8, display:"flex", gap:8, maxWidth:600,
            margin:"0 auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)"
          }}>
            <input
              value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key==="Enter" && navigate(`/search?q=${encodeURIComponent(q)}`)}
              placeholder="ابحث عن طبيب، تخصص، عيادة..."
              style={{
                flex:1, padding:"12px 16px", border:"none", outline:"none",
                fontSize:15, background:"transparent", borderRadius:10,
                direction:"rtl"
              }}
            />
            <Btn onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)}
              style={{ padding:"12px 28px", borderRadius:10, fontSize:15 }}>
              بحث 🔍
            </Btn>
          </div>
        </div>
      </div>

      {/* Wave */}
      <div style={{ marginTop:-2 }}>
        <svg viewBox="0 0 1200 60" style={{ width:"100%", display:"block" }}>
          <path d="M0,30 C300,60 900,0 1200,30 L1200,60 L0,60 Z" fill="#f9fafb"/>
        </svg>
      </div>

      {/* Stats */}
      <div style={{ maxWidth:900, margin:"-30px auto 0", padding:"0 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {[
            { n:stats.doctors, label:"طبيب مسجّل", icon:"👨‍⚕️" },
            { n:stats.clinics, label:"عيادة وطنية", icon:"🏥" },
            { n:stats.patients, label:"مريض موثوق", icon:"👥" },
          ].map(s => (
            <Card key={s.label} style={{ textAlign:"center", padding:"20px 16px" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:28, fontWeight:900, color:"#0891b2" }}>{s.n.toLocaleString()}+</div>
              <div style={{ fontSize:13, color:"#6b7280", fontWeight:600 }}>{s.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div style={{ maxWidth:1100, margin:"48px auto", padding:"0 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ fontSize:24, fontWeight:800, color:"#0c4a6e", margin:0 }}>التخصصات الطبية</h2>
          <button onClick={() => navigate("/search")} style={{ color:"#0891b2", fontWeight:700, background:"none", border:"none", cursor:"pointer", fontSize:14 }}>عرض الكل ←</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px,1fr))", gap:12 }}>
          {specialties.slice(0,10).map(s => (
            <div key={s.ID} onClick={() => navigate(`/search?specialty=${s.ID}`)}
              style={{
                background:"#fff", borderRadius:12, padding:"16px 12px",
                textAlign:"center", cursor:"pointer", border:"1px solid #e5e7eb",
                transition:"all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#0891b2"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(8,145,178,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
            >
              <div style={{ fontSize:28, marginBottom:8 }}>{specialtyIcons[s.NameFr] || "🩺"}</div>
              <div style={{ fontSize:11, fontWeight:700, color:"#374151", lineHeight:1.3 }}>{s.NameAr}</div>
              <div style={{ fontSize:10, color:"#9ca3af", marginTop:2 }}>{s.NameFr}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background:"linear-gradient(135deg,#ecfeff,#e0f7fa)", padding:"60px 24px", margin:"0 0 60px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:28, fontWeight:900, color:"#0c4a6e", marginBottom:8 }}>كيف يعمل طبيبي؟</h2>
          <p style={{ color:"#6b7280", marginBottom:40 }}>في 3 خطوات بسيطة احصل على موعدك</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {[
              { step:"1", icon:"🔍", title:"ابحث عن طبيب", desc:"اختر التخصص أو ابحث باسم الطبيب أو العيادة" },
              { step:"2", icon:"📅", title:"احجز موعدك", desc:"اختر الوقت المناسب من جدول مواعيد الطبيب" },
              { step:"3", icon:"✅", title:"تأكيد فوري", desc:"ستصلك رسالة تأكيد على بريدك الإلكتروني" },
            ].map(s => (
              <div key={s.step} style={{ textAlign:"center", padding:24 }}>
                <div style={{
                  width:56, height:56, borderRadius:"50%",
                  background:"linear-gradient(135deg,#0891b2,#0e7490)",
                  color:"#fff", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:22, fontWeight:900,
                  margin:"0 auto 16px", boxShadow:"0 8px 20px rgba(8,145,178,0.3)"
                }}>{s.step}</div>
                <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:800, color:"#0c4a6e", marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          {!user && (
            <Btn onClick={() => navigate("/register")} style={{ marginTop:32, padding:"14px 40px", fontSize:16 }}>
              ابدأ الآن — مجاناً 🚀
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 2: LOGIN
// ═══════════════════════════════════════════════════════════════
function LoginPage({ onLogin, navigate }) {
  const [form, setForm] = useState({ username:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await onLogin(form.username, form.password);
      navigate("/");
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#ecfeff,#f0fdfa)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🏥</div>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#0c4a6e", margin:"0 0 8px" }}>مرحباً بعودتك</h1>
          <p style={{ color:"#6b7280", fontSize:14 }}>سجّل دخولك إلى حسابك في طبيبي</p>
        </div>
        <Card>
          {error && (
            <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#dc2626", fontSize:14, fontWeight:600 }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={submit}>
            <Input label="اسم المستخدم" value={form.username} onChange={e => setForm({...form, username:e.target.value})} placeholder="أدخل اسم المستخدم" required />
            <Input label="كلمة المرور" type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="••••••••" required />
            <Btn type="submit" loading={loading} style={{ width:"100%", justifyContent:"center", padding:"13px", marginTop:8 }}>
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </Btn>
          </form>
          <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:"#6b7280" }}>
            ليس لديك حساب؟{" "}
            <button onClick={() => navigate("/register")} style={{ color:"#0891b2", fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>
              سجّل الآن
            </button>
          </p>
        </Card>

        <div style={{ marginTop:20, background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12, padding:"12px 16px", fontSize:13 }}>
          <strong style={{ color:"#ea580c" }}>🔑 حساب تجريبي:</strong>
          <div style={{ color:"#92400e", marginTop:4 }}>
            المستخدم: <code>Kaioran</code> | كلمة المرور: <code>FJHajf552:</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 3: REGISTER
// ═══════════════════════════════════════════════════════════════
function RegisterPage({ onRegister, navigate }) {
  const [form, setForm] = useState({ username:"", password:"", email:"", fullname:"", phone:"", gender:0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await onRegister(form);
      navigate("/");
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const f = (k,v) => setForm(p => ({...p, [k]:v}));

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#ecfeff,#f0fdfa)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🤝</div>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#0c4a6e", margin:"0 0 8px" }}>إنشاء حساب جديد</h1>
          <p style={{ color:"#6b7280", fontSize:14 }}>انضم إلى طبيبي وابدأ في حجز مواعيدك</p>
        </div>
        <Card>
          {error && (
            <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#dc2626", fontSize:14, fontWeight:600 }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={submit}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="الاسم الكامل *" value={form.fullname} onChange={e => f("fullname",e.target.value)} placeholder="محمد أمين" required />
              <Input label="اسم المستخدم *" value={form.username} onChange={e => f("username",e.target.value)} placeholder="mohammedamine" required />
            </div>
            <Input label="البريد الإلكتروني *" type="email" value={form.email} onChange={e => f("email",e.target.value)} placeholder="exemple@gmail.com" required />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="الهاتف" type="tel" value={form.phone} onChange={e => f("phone",e.target.value)} placeholder="0699123456" />
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", marginBottom:6, fontSize:14, fontWeight:600, color:"#374151" }}>الجنس</label>
                <select value={form.gender} onChange={e => f("gender",+e.target.value)} style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, background:"#fafafa", boxSizing:"border-box" }}>
                  <option value={0}>ذكر</option>
                  <option value={1}>أنثى</option>
                </select>
              </div>
            </div>
            <Input label="كلمة المرور *" type="password" value={form.password} onChange={e => f("password",e.target.value)} placeholder="8 أحرف على الأقل" required />
            <Btn type="submit" loading={loading} style={{ width:"100%", justifyContent:"center", padding:"13px", marginTop:8 }}>
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب 🚀"}
            </Btn>
          </form>
          <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:"#6b7280" }}>
            لديك حساب؟{" "}
            <button onClick={() => navigate("/login")} style={{ color:"#0891b2", fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>
              سجّل الدخول
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 4: SEARCH
// ═══════════════════════════════════════════════════════════════
function SearchPage({ navigate }) {
  const urlQ = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const [q, setQ]           = useState(urlQ.get("q") || "");
  const [specialty, setSP]  = useState(urlQ.get("specialty") || "");
  const [results, setR]     = useState([]);
  const [specialties, setSPList] = useState([]);
  const [loading, setL]     = useState(false);
  const [total, setTotal]   = useState(0);

  useEffect(() => { api.specialties().then(setSPList).catch(()=>{}); }, []);

  const search = useCallback(async () => {
    setL(true);
    try {
      const d = await api.clinics.search({ q, specialty, limit:24 });
      setR(d.items || []);
      setTotal(d.total || 0);
    } catch { setR([]); }
    finally { setL(false); }
  }, [q, specialty]);

  useEffect(() => { search(); }, [specialty]);

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>
      <h1 style={{ fontSize:26, fontWeight:900, color:"#0c4a6e", marginBottom:8 }}>🔍 البحث عن طبيب</h1>
      <p style={{ color:"#6b7280", marginBottom:24 }}>ابحث من بين آلاف الأطباء في جميع أنحاء الجزائر</p>

      {/* Search bar */}
      <Card style={{ marginBottom:24, padding:16 }}>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <div style={{ flex:2, minWidth:200, position:"relative" }}>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key==="Enter" && search()}
              placeholder="اسم الطبيب أو العيادة أو التخصص..."
              style={{ width:"100%", padding:"11px 16px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box", direction:"rtl" }}
            />
          </div>
          <select value={specialty} onChange={e => setSP(e.target.value)}
            style={{ flex:1, minWidth:160, padding:"11px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, background:"#fafafa" }}>
            <option value="">كل التخصصات</option>
            {specialties.map(s => <option key={s.ID} value={s.ID}>{s.NameAr} — {s.NameFr}</option>)}
          </select>
          <Btn onClick={search} style={{ padding:"11px 28px", whiteSpace:"nowrap" }}>بحث</Btn>
        </div>
      </Card>

      {/* Results */}
      {loading ? <Spinner /> : (
        <>
          <div style={{ fontSize:14, color:"#6b7280", marginBottom:16 }}>
            {total > 0 ? `${total} نتيجة` : "لا توجد نتائج"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px,1fr))", gap:16 }}>
            {results.map(r => (
              <div key={r.ClinicsDoctor_id} onClick={() => navigate(`/clinic/${r.ClinicId}/doctor/${r.DoctorId}`)}
                style={{
                  background:"#fff", borderRadius:14, border:"1px solid #e5e7eb",
                  padding:20, cursor:"pointer", transition:"all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 25px rgba(8,145,178,0.12)"; e.currentTarget.style.borderColor="#0891b2"; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.transform="none"; }}
              >
                <div style={{ display:"flex", gap:14, marginBottom:14 }}>
                  <div style={{
                    width:52, height:52, borderRadius:12,
                    background:"linear-gradient(135deg,#e0f7fa,#b2ebf2)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:22, fontWeight:900, color:"#0891b2", flexShrink:0
                  }}>👨‍⚕️</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:16, color:"#0c4a6e", marginBottom:4 }}>{r.DoctorName}</div>
                    <Badge color="#0891b2">{r.SpecialtyAr}</Badge>
                  </div>
                </div>
                <div style={{ fontSize:13, color:"#6b7280", marginBottom:8 }}>
                  🏥 <strong style={{ color:"#374151" }}>{r.ClinicName}</strong>
                </div>
                {r.ClinicAddress && <div style={{ fontSize:12, color:"#9ca3af", marginBottom:8 }}>📍 {r.ClinicAddress}</div>}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #f3f4f6", paddingTop:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Stars rating={Math.round(+r.AvgRating)} size={14} />
                    <span style={{ fontSize:12, color:"#6b7280" }}>({r.RatingCount})</span>
                  </div>
                  {r.Pricing > 0 && <span style={{ fontSize:13, fontWeight:700, color:"#059669" }}>{r.Pricing} DA</span>}
                  {r.Experience > 0 && <span style={{ fontSize:11, color:"#9ca3af" }}>{r.Experience} سنة خبرة</span>}
                </div>
              </div>
            ))}
          </div>
          {results.length === 0 && !loading && (
            <div style={{ textAlign:"center", padding:"80px 24px", color:"#9ca3af" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
              <div style={{ fontSize:16, fontWeight:600 }}>لا توجد نتائج</div>
              <div style={{ fontSize:13, marginTop:8 }}>جرّب البحث بكلمات مختلفة</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 5: CLINIC / DOCTOR DETAIL
// ═══════════════════════════════════════════════════════════════
function DoctorDetailPage({ clinicId, doctorId, navigate, user }) {
  const [data, setData]     = useState(null);
  const [ratings, setR]     = useState(null);
  const [loading, setL]     = useState(true);
  const [tab, setTab]       = useState("info");
  const { toast, show }     = useToast();

  useEffect(() => {
    Promise.all([
      api.clinics.doctor(clinicId, doctorId),
      api.ratings.getForDoctor(doctorId),
    ]).then(([d, r]) => { setData(d); setR(r); })
      .catch(() => {})
      .finally(() => setL(false));
  }, [clinicId, doctorId]);

  if (loading) return <div style={{ padding:60 }}><Spinner /></div>;
  if (!data)   return <div style={{ padding:60, textAlign:"center", color:"#9ca3af" }}>طبيب غير موجود</div>;

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 24px" }}>
      <button onClick={() => navigate("/search")} style={{ background:"none", border:"none", cursor:"pointer", color:"#0891b2", fontWeight:600, marginBottom:20, display:"flex", alignItems:"center", gap:6 }}>
        ← رجوع للبحث
      </button>

      {/* Doctor header */}
      <Card style={{ marginBottom:24 }}>
        <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
          <div style={{
            width:100, height:100, borderRadius:20,
            background:"linear-gradient(135deg,#0891b2,#0e7490)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:42, color:"#fff", flexShrink:0
          }}>👨‍⚕️</div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
              <Badge color="#0891b2">{data.SpecialtyAr}</Badge>
              {data.Degrees && <Badge color="#7c3aed">{data.Degrees}</Badge>}
              {data.Cnas  && <Badge color="#059669">CNAS ✓</Badge>}
              {data.Casnos && <Badge color="#0891b2">CASNOS ✓</Badge>}
            </div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0c4a6e", margin:"0 0 8px" }}>{data.FullName}</h1>
            <div style={{ fontSize:13, color:"#6b7280", marginBottom:8 }}>🏥 {data.ClinicName || clinicId}</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Stars rating={Math.round(+data.AvgRating)} size={16} />
                <span style={{ fontSize:13, color:"#374151", fontWeight:700 }}>{(+data.AvgRating).toFixed(1)}</span>
                <span style={{ fontSize:12, color:"#9ca3af" }}>({data.RatingCount} تقييم)</span>
              </div>
              {data.Experience > 0 && <span style={{ fontSize:13, color:"#6b7280" }}>⏱ {data.Experience} سنة خبرة</span>}
              {data.Pricing > 0 && <span style={{ fontSize:13, fontWeight:700, color:"#059669" }}>💰 {data.Pricing} DA</span>}
            </div>
          </div>
          {user ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10, justifyContent:"center" }}>
              <Btn onClick={() => navigate(`/book/${clinicId}/${doctorId}`)} style={{ padding:"12px 28px" }}>
                📅 حجز موعد
              </Btn>
              <Btn variant="secondary" onClick={() => navigate("/chat")} style={{ padding:"10px 28px" }}>
                💬 تواصل
              </Btn>
            </div>
          ) : (
            <Btn onClick={() => navigate("/login")}>تسجيل دخول للحجز</Btn>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:"2px solid #e5e7eb" }}>
        {[["info","معلومات"],["reasons","أسباب الزيارة"],["ratings","التقييمات"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding:"10px 20px", background:"none", border:"none", cursor:"pointer",
            fontWeight:700, fontSize:14, color: tab===k ? "#0891b2" : "#6b7280",
            borderBottom: tab===k ? "3px solid #0891b2" : "3px solid transparent",
            marginBottom:-2, transition:"all 0.15s"
          }}>{l}</button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === "info" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {data.Presentation && (
            <Card style={{ gridColumn:"1/-1" }}>
              <h3 style={{ color:"#0c4a6e", margin:"0 0 12px" }}>📋 عن الطبيب</h3>
              <p style={{ color:"#374151", lineHeight:1.8, margin:0 }}>{data.Presentation}</p>
            </Card>
          )}
          {data.Education && (
            <Card>
              <h3 style={{ color:"#0c4a6e", margin:"0 0 12px" }}>🎓 التعليم</h3>
              <p style={{ color:"#374151", lineHeight:1.8, margin:0 }}>{data.Education}</p>
            </Card>
          )}
          <Card>
            <h3 style={{ color:"#0c4a6e", margin:"0 0 12px" }}>📞 معلومات التواصل</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {data.Phone && <div style={{ fontSize:14 }}>📱 <strong>هاتف:</strong> {data.Phone}</div>}
              {data.Email && <div style={{ fontSize:14 }}>✉️ <strong>بريد:</strong> {data.Email}</div>}
              {data.BaladiyaName && <div style={{ fontSize:14 }}>📍 <strong>الموقع:</strong> {data.BaladiyaName}</div>}
              {data.SpeakingLanguage && <div style={{ fontSize:14 }}>🗣 <strong>اللغات:</strong> {data.SpeakingLanguage}</div>}
              {data.PayementMethods && <div style={{ fontSize:14 }}>💳 <strong>الدفع:</strong> {data.PayementMethods}</div>}
            </div>
          </Card>
          {data.Schedule && (
            <Card style={{ gridColumn:"1/-1" }}>
              <h3 style={{ color:"#0c4a6e", margin:"0 0 12px" }}>🗓 جدول العمل</h3>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"].map((d,i) => {
                  const wd = data.Schedule.WorkingDays || "1111011";
                  const works = wd[i] === "1";
                  return (
                    <div key={i} style={{
                      padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600,
                      background: works ? "#d1fae5" : "#f3f4f6",
                      color: works ? "#065f46" : "#9ca3af",
                      border: `1px solid ${works ? "#6ee7b7" : "#e5e7eb"}`
                    }}>{d}</div>
                  );
                })}
              </div>
              <div style={{ marginTop:12, fontSize:13, color:"#6b7280" }}>
                ⏰ {new Date(data.Schedule.DaytimeStart).toLocaleTimeString('fr-DZ',{hour:'2-digit',minute:'2-digit'})} — {new Date(data.Schedule.DaytimeEnd).toLocaleTimeString('fr-DZ',{hour:'2-digit',minute:'2-digit'})}
                &nbsp;|&nbsp; كل {data.Schedule.TimeScale} دقيقة
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Reasons */}
      {tab === "reasons" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:12 }}>
          {(data.Reasons || []).map(r => (
            <Card key={r.ID} style={{ padding:"16px 18px" }}>
              <div style={{ fontWeight:700, color:"#0c4a6e", marginBottom:4 }}>{r.reason_name}</div>
              {r.reason_time > 0 && <div style={{ fontSize:12, color:"#9ca3af" }}>⏱ {r.reason_time} دقيقة</div>}
            </Card>
          ))}
          {(!data.Reasons || data.Reasons.length === 0) && (
            <p style={{ color:"#9ca3af" }}>لا توجد أسباب محددة</p>
          )}
        </div>
      )}

      {/* Tab: Ratings */}
      {tab === "ratings" && ratings && (
        <div>
          <Card style={{ marginBottom:20, textAlign:"center" }}>
            <div style={{ fontSize:48, fontWeight:900, color:"#0891b2" }}>{ratings.average}</div>
            <Stars rating={Math.round(ratings.average)} size={24} />
            <div style={{ color:"#6b7280", marginTop:8 }}>بناءً على {ratings.total} تقييم</div>
          </Card>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {(ratings.ratings || []).map(r => (
              <Card key={r.ID} style={{ padding:"16px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontWeight:700, color:"#374151", marginBottom:4 }}>{r.PatientName}</div>
                    <Stars rating={r.Rating} size={14} />
                  </div>
                </div>
                {r.Comment && <p style={{ color:"#6b7280", marginTop:10, fontSize:14, lineHeight:1.6 }}>{r.Comment}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
      <Toast {...(toast||{msg:""})} onClose={() => {}} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 6: BOOK APPOINTMENT (3-step wizard)
// ═══════════════════════════════════════════════════════════════
function BookPage({ clinicId, doctorId, navigate, user }) {
  const [doctor, setDoctor]   = useState(null);
  const [step, setStep]       = useState(1);
  const [reason, setReason]   = useState(null);
  const [date, setDate]       = useState("");
  const [slots, setSlots]     = useState([]);
  const [selSlot, setSlot]    = useState("");
  const [note, setNote]       = useState("");
  const [loading, setL]       = useState(false);
  const [slotsLoading, setSL] = useState(false);
  const { toast, show }       = useToast();

  useEffect(() => {
    api.clinics.doctor(clinicId, doctorId).then(setDoctor).catch(() => {});
  }, []);

  const fetchSlots = async (d) => {
    if (!doctor) return;
    setSL(true);
    const cd = doctor.ClinicsDoctor_id;
    try {
      const s = await api.appointments.slots({ clinics_doctor_id: cd, date: d });
      setSlots(s.slots || []);
    } catch { setSlots([]); }
    finally { setSL(false); }
  };

  const confirm = async () => {
    if (!reason || !date || !selSlot) { show("اختر سبب الزيارة، التاريخ والوقت", "error"); return; }
    setL(true);
    try {
      await api.appointments.book({
        clinics_doctor_id: doctor.ClinicsDoctor_id,
        doctors_reason_id: reason.ID,
        date, time: selSlot, note
      });
      show("تم تأكيد الموعد! سيصلك بريد إلكتروني للتأكيد ✅");
      setTimeout(() => navigate("/appointments"), 2000);
    } catch(e) { show(e.message, "error"); }
    finally { setL(false); }
  };

  if (!doctor) return <div style={{ padding:60 }}><Spinner /></div>;

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"32px 24px" }}>
      <button onClick={() => navigate(`/clinic/${clinicId}/doctor/${doctorId}`)} style={{ background:"none", border:"none", cursor:"pointer", color:"#0891b2", fontWeight:600, marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>
        ← رجوع
      </button>
      <h1 style={{ fontSize:24, fontWeight:900, color:"#0c4a6e", marginBottom:4 }}>📅 حجز موعد</h1>
      <div style={{ fontSize:14, color:"#6b7280", marginBottom:28 }}>الطبيب: <strong style={{ color:"#0891b2" }}>{doctor.FullName}</strong> — {doctor.ClinicName}</div>

      {/* Step indicator */}
      <div style={{ display:"flex", gap:0, marginBottom:32 }}>
        {[["1","سبب الزيارة"],["2","التاريخ والوقت"],["3","تأكيد"]].map(([n,l],i) => (
          <div key={n} style={{ flex:1, textAlign:"center", position:"relative" }}>
            <div style={{
              width:36, height:36, borderRadius:"50%", margin:"0 auto 8px",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:800, fontSize:16,
              background: step > i+1 ? "#059669" : step === i+1 ? "#0891b2" : "#e5e7eb",
              color: step >= i+1 ? "#fff" : "#9ca3af",
              transition:"all 0.3s"
            }}>{step > i+1 ? "✓" : n}</div>
            <div style={{ fontSize:12, fontWeight:600, color: step >= i+1 ? "#0c4a6e" : "#9ca3af" }}>{l}</div>
            {i < 2 && <div style={{ position:"absolute", top:18, left:"60%", right:"-40%", height:2, background: step > i+1 ? "#059669" : "#e5e7eb", zIndex:-1 }} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Reason */}
      {step === 1 && (
        <Card>
          <h2 style={{ color:"#0c4a6e", margin:"0 0 20px", fontSize:18 }}>اختر سبب الزيارة</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {(doctor.Reasons || []).map(r => (
              <div key={r.ID} onClick={() => { setReason(r); setStep(2); }}
                style={{
                  padding:"14px 16px", borderRadius:10, cursor:"pointer", transition:"all 0.15s",
                  border: reason?.ID===r.ID ? "2px solid #0891b2" : "1.5px solid #e5e7eb",
                  background: reason?.ID===r.ID ? "#ecfeff" : "#fafafa"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor="#0891b2"}
                onMouseLeave={e => { if (reason?.ID!==r.ID) e.currentTarget.style.borderColor="#e5e7eb"; }}
              >
                <div style={{ fontWeight:700, color:"#0c4a6e", fontSize:14 }}>{r.reason_name}</div>
                {r.reason_time > 0 && <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>⏱ {r.reason_time} دقيقة</div>}
              </div>
            ))}
          </div>
          {(!doctor.Reasons || doctor.Reasons.length === 0) && (
            <div style={{ color:"#9ca3af", textAlign:"center", padding:24 }}>لا توجد أسباب محددة لهذا الطبيب</div>
          )}
        </Card>
      )}

      {/* STEP 2: Date & Time */}
      {step === 2 && (
        <Card>
          <h2 style={{ color:"#0c4a6e", margin:"0 0 20px", fontSize:18 }}>اختر التاريخ والوقت</h2>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", marginBottom:8, fontWeight:600, fontSize:14, color:"#374151" }}>التاريخ</label>
            <input type="date" min={minDate} value={date}
              onChange={e => { setDate(e.target.value); setSlot(""); fetchSlots(e.target.value); }}
              style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, boxSizing:"border-box" }}
            />
          </div>
          {date && (
            <div>
              <label style={{ display:"block", marginBottom:12, fontWeight:600, fontSize:14, color:"#374151" }}>الأوقات المتاحة</label>
              {slotsLoading ? <Spinner /> : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(90px,1fr))", gap:8 }}>
                  {slots.map(s => (
                    <div key={s} onClick={() => setSlot(s)}
                      style={{
                        padding:"10px 8px", borderRadius:10, textAlign:"center", cursor:"pointer",
                        fontWeight:700, fontSize:14, transition:"all 0.15s",
                        border: selSlot===s ? "2px solid #0891b2" : "1.5px solid #e5e7eb",
                        background: selSlot===s ? "#0891b2" : "#fafafa",
                        color: selSlot===s ? "#fff" : "#374151"
                      }}
                    >{s}</div>
                  ))}
                  {slots.length === 0 && <div style={{ color:"#9ca3af", gridColumn:"1/-1" }}>لا توجد أوقات متاحة في هذا اليوم</div>}
                </div>
              )}
            </div>
          )}
          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            <Btn variant="secondary" onClick={() => setStep(1)}>← رجوع</Btn>
            <Btn onClick={() => selSlot && setStep(3)} style={{ flex:1, justifyContent:"center" }} disabled={!selSlot}>
              التالي →
            </Btn>
          </div>
        </Card>
      )}

      {/* STEP 3: Confirm */}
      {step === 3 && (
        <Card>
          <h2 style={{ color:"#0c4a6e", margin:"0 0 20px", fontSize:18 }}>تأكيد الموعد</h2>
          <div style={{ background:"#f0fdfa", borderRadius:12, padding:20, marginBottom:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"8px 16px", fontSize:14 }}>
              <span style={{ color:"#6b7280" }}>👨‍⚕️ الطبيب:</span>
              <strong style={{ color:"#0c4a6e" }}>{doctor.FullName}</strong>
              <span style={{ color:"#6b7280" }}>🏥 العيادة:</span>
              <strong style={{ color:"#0c4a6e" }}>{doctor.ClinicName}</strong>
              <span style={{ color:"#6b7280" }}>🩺 السبب:</span>
              <strong style={{ color:"#0c4a6e" }}>{reason?.reason_name}</strong>
              <span style={{ color:"#6b7280" }}>📅 التاريخ:</span>
              <strong style={{ color:"#0891b2" }}>{date}</strong>
              <span style={{ color:"#6b7280" }}>⏰ الوقت:</span>
              <strong style={{ color:"#0891b2" }}>{selSlot}</strong>
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", marginBottom:8, fontWeight:600, fontSize:14, color:"#374151" }}>ملاحظة (اختياري)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              rows={3} placeholder="أضف ملاحظة للطبيب..."
              style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, resize:"vertical", boxSizing:"border-box" }}
            />
          </div>
          <div style={{ background:"#fef9c3", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#854d0e" }}>
            ℹ️ سيتم إرسال تأكيد على بريدك الإلكتروني بعد إتمام الحجز
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="secondary" onClick={() => setStep(2)}>← رجوع</Btn>
            <Btn onClick={confirm} loading={loading} style={{ flex:1, justifyContent:"center" }}>
              ✅ تأكيد الحجز
            </Btn>
          </div>
        </Card>
      )}
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => {}} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 7: MY APPOINTMENTS
// ═══════════════════════════════════════════════════════════════
function AppointmentsPage({ navigate }) {
  const [appts, setAppts]   = useState([]);
  const [loading, setL]     = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast, show }     = useToast();

  useEffect(() => {
    api.patient.appointments().then(setAppts).catch(() => {}).finally(() => setL(false));
  }, []);

  const cancel = async (id) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الموعد؟")) return;
    try {
      await api.appointments.cancel(id);
      setAppts(p => p.filter(a => a.ID !== id));
      show("تم إلغاء الموعد");
    } catch(e) { show(e.message, "error"); }
  };

  const now    = new Date();
  const filtered = appts.filter(a => {
    const d = new Date(a.AppointementDate);
    if (filter === "upcoming") return d >= now;
    if (filter === "past")     return d < now;
    return true;
  });

  if (loading) return <div style={{ padding:60 }}><Spinner /></div>;

  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"32px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:900, color:"#0c4a6e", margin:0 }}>📅 مواعيدي</h1>
        <Btn onClick={() => navigate("/search")} style={{ padding:"10px 20px" }}>+ حجز موعد جديد</Btn>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {[["all","الكل"],["upcoming","القادمة"],["past","الماضية"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding:"8px 18px", borderRadius:20, border:"1.5px solid",
            fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.15s",
            borderColor: filter===v ? "#0891b2" : "#e5e7eb",
            background: filter===v ? "#ecfeff" : "#fff",
            color: filter===v ? "#0891b2" : "#6b7280"
          }}>{l} {v==="all"?appts.length:v==="upcoming"?appts.filter(a=>new Date(a.AppointementDate)>=now).length:appts.filter(a=>new Date(a.AppointementDate)<now).length}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 24px" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
          <div style={{ fontSize:16, fontWeight:600, color:"#374151" }}>لا توجد مواعيد</div>
          <Btn onClick={() => navigate("/search")} style={{ marginTop:20 }}>ابحث عن طبيب</Btn>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(a => {
            const isPast = new Date(a.AppointementDate) < now;
            const d = new Date(a.AppointementDate);
            return (
              <Card key={a.ID} style={{ padding:"16px 20px" }}>
                <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                  <div style={{
                    width:48, height:48, borderRadius:10, flexShrink:0,
                    background: isPast ? "#f3f4f6" : "linear-gradient(135deg,#ecfeff,#cffafe)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:22
                  }}>
                    {isPast ? "📁" : "📅"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
                      <div>
                        <div style={{ fontWeight:800, color:"#0c4a6e", fontSize:16 }}>
                          {a.DoctorName || "طبيب"}
                        </div>
                        <div style={{ fontSize:13, color:"#6b7280", marginTop:2 }}>
                          🏥 {a.ClinicName}
                        </div>
                        {a.ReasonName && <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>🩺 {a.ReasonName}</div>}
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:800, color:"#0891b2", fontSize:15 }}>
                          {d.toLocaleDateString("fr-DZ")}
                        </div>
                        <div style={{ fontSize:13, color:"#6b7280", marginTop:2 }}>
                          {d.toLocaleTimeString("fr-DZ",{hour:"2-digit",minute:"2-digit"})}
                        </div>
                        <div style={{ marginTop:6 }}>
                          {isPast ? (
                            <Badge color="#6b7280">منتهي</Badge>
                          ) : (
                            <Badge color="#059669">قادم ✓</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isPast && (
                      <div style={{ marginTop:12, display:"flex", gap:8 }}>
                        <Btn variant="danger" onClick={() => cancel(a.ID)} style={{ padding:"6px 16px", fontSize:12 }}>
                          ❌ إلغاء
                        </Btn>
                        {a.DoctorId && <Btn variant="secondary" onClick={() => navigate(`/clinic/${a.ClinicId || ""}/doctor/${a.DoctorId}`)} style={{ padding:"6px 16px", fontSize:12 }}>تفاصيل</Btn>}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => {}} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 8: PROFILE
// ═══════════════════════════════════════════════════════════════
function ProfilePage({ user, navigate }) {
  const [form, setForm] = useState(null);
  const [loading, setL] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show } = useToast();

  useEffect(() => {
    api.patient.profile().then(d => { setForm(d); setL(false); }).catch(() => setL(false));
  }, []);

  const save = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patient.update(form);
      show("تم حفظ التغييرات بنجاح ✅");
    } catch(e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const f = (k,v) => setForm(p => ({...p, [k]:v}));

  if (loading) return <div style={{ padding:60 }}><Spinner /></div>;
  if (!form)   return <div style={{ padding:60, textAlign:"center", color:"#9ca3af" }}>تعذر تحميل البيانات</div>;

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"32px 24px" }}>
      <div style={{ display:"flex", gap:20, alignItems:"center", marginBottom:32 }}>
        <div style={{
          width:80, height:80, borderRadius:20,
          background:"linear-gradient(135deg,#0891b2,#0e7490)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:36, color:"#fff", fontWeight:900
        }}>
          {(form.FullName||"U")[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, color:"#0c4a6e", margin:"0 0 4px" }}>{form.FullName}</h1>
          <div style={{ fontSize:14, color:"#6b7280" }}>{form.Email}</div>
          <div style={{ marginTop:8 }}>
            <Badge color={form.EmailValidation ? "#059669" : "#f59e0b"}>
              {form.EmailValidation ? "✓ بريد مؤكد" : "⚠ بريد غير مؤكد"}
            </Badge>
          </div>
        </div>
      </div>

      <form onSubmit={save}>
        <Card style={{ marginBottom:16 }}>
          <h3 style={{ color:"#0c4a6e", margin:"0 0 20px", fontSize:16, fontWeight:800 }}>👤 المعلومات الشخصية</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="الاسم الكامل" value={form.FullName||""} onChange={e => f("FullName",e.target.value)} />
            <Input label="رقم الهاتف" value={form.Phone||""} onChange={e => f("Phone",e.target.value)} />
            <Input label="البريد الإلكتروني" type="email" value={form.Email||""} onChange={e => f("Email",e.target.value)} />
            <Input label="تاريخ الميلاد" type="date" value={(form.BirthDate||"").split("T")[0]} onChange={e => f("BirthDate",e.target.value)} />
            <Input label="العنوان" value={form.Address||""} onChange={e => f("Address",e.target.value)} />
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", marginBottom:6, fontSize:14, fontWeight:600, color:"#374151" }}>الجنس</label>
              <select value={form.Gender??0} onChange={e => f("Gender",+e.target.value)} style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, background:"#fafafa", boxSizing:"border-box" }}>
                <option value={0}>ذكر</option>
                <option value={1}>أنثى</option>
              </select>
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom:16 }}>
          <h3 style={{ color:"#0c4a6e", margin:"0 0 20px", fontSize:16, fontWeight:800 }}>🏥 المعلومات الطبية</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", marginBottom:6, fontSize:14, fontWeight:600, color:"#374151" }}>فصيلة الدم</label>
              <select value={form.BloodType||""} onChange={e => f("BloodType",e.target.value)} style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, background:"#fafafa", boxSizing:"border-box" }}>
                <option value="">غير محدد</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <Input label="لغة التواصل" value={form.SpeakingLanguage||""} onChange={e => f("SpeakingLanguage",e.target.value)} />
          </div>
        </Card>

        <Card style={{ marginBottom:24 }}>
          <h3 style={{ color:"#0c4a6e", margin:"0 0 20px", fontSize:16, fontWeight:800 }}>🆘 جهة الطوارئ</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="هاتف الطوارئ" value={form.EmergancyPhone||""} onChange={e => f("EmergancyPhone",e.target.value)} />
            <Input label="بريد الطوارئ" type="email" value={form.EmergancyEmail||""} onChange={e => f("EmergancyEmail",e.target.value)} />
          </div>
          <div style={{ marginBottom:0 }}>
            <label style={{ display:"block", marginBottom:6, fontSize:14, fontWeight:600, color:"#374151" }}>ملاحظات طوارئ</label>
            <textarea value={form.EmergancyNote||""} onChange={e => f("EmergancyNote",e.target.value)} rows={2}
              style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, resize:"vertical", boxSizing:"border-box" }} />
          </div>
        </Card>

        <Btn type="submit" loading={saving} style={{ width:"100%", justifyContent:"center", padding:"13px", fontSize:15 }}>
          💾 حفظ التغييرات
        </Btn>
      </form>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => {}} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 9: CHAT
// ═══════════════════════════════════════════════════════════════
function ChatPage({ user }) {
  const [threads, setThreads]   = useState([]);
  const [selThread, setSel]     = useState(null);
  const [messages, setMsgs]     = useState([]);
  const [newMsg, setNewMsg]     = useState("");
  const [loading, setL]         = useState(true);
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    api.chat.threads().then(setThreads).catch(() => {}).finally(() => setL(false));
  }, []);

  useEffect(() => {
    if (!selThread) return;
    api.chat.messages(selThread.ID).then(setMsgs).catch(() => {});
  }, [selThread]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = async () => {
    if (!newMsg.trim() || !selThread) return;
    setSending(true);
    try {
      await api.chat.send(selThread.ID, { content: newMsg });
      setNewMsg("");
      const msgs = await api.chat.messages(selThread.ID);
      setMsgs(msgs);
    } catch {}
    finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth:1000, margin:"0 auto", padding:"32px 24px" }}>
      <h1 style={{ fontSize:24, fontWeight:900, color:"#0c4a6e", marginBottom:24 }}>💬 الرسائل</h1>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:16, height:600 }}>
        {/* Thread list */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e5e7eb", overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 18px", borderBottom:"1px solid #f3f4f6", fontWeight:800, color:"#374151", fontSize:14 }}>
            المحادثات ({threads.length})
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            {loading && <Spinner />}
            {threads.map(t => (
              <div key={t.ID} onClick={() => setSel(t)}
                style={{
                  padding:"14px 18px", cursor:"pointer", borderBottom:"1px solid #f9fafb",
                  background: selThread?.ID===t.ID ? "#ecfeff" : "transparent",
                  transition:"background 0.15s"
                }}
                onMouseEnter={e => { if (selThread?.ID!==t.ID) e.currentTarget.style.background="#f9fafb"; }}
                onMouseLeave={e => { if (selThread?.ID!==t.ID) e.currentTarget.style.background="transparent"; }}
              >
                <div style={{ fontWeight:700, color:"#0c4a6e", fontSize:14, marginBottom:4 }}>👨‍⚕️ {t.DoctorName}</div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>{t.SpecialtyFr}</div>
                {t.LastMessage && (
                  <div style={{ fontSize:12, color:"#6b7280", marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {t.LastMessage}
                  </div>
                )}
              </div>
            ))}
            {!loading && threads.length === 0 && (
              <div style={{ padding:24, textAlign:"center", color:"#9ca3af", fontSize:13 }}>
                لا توجد محادثات بعد
              </div>
            )}
          </div>
        </div>

        {/* Messages panel */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e5e7eb", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {selThread ? (
            <>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid #f3f4f6", fontWeight:800, color:"#0c4a6e", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>👨‍⚕️</span>
                <div>
                  <div>{selThread.DoctorName}</div>
                  <div style={{ fontSize:12, color:"#9ca3af", fontWeight:400 }}>{selThread.SpecialtyFr}</div>
                </div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:20, display:"flex", flexDirection:"column", gap:12 }}>
                {messages.map(m => (
                  <div key={m.ID} style={{ display:"flex", justifyContent: m.IsDoctor ? "flex-start" : "flex-end" }}>
                    <div style={{
                      maxWidth:"70%", padding:"10px 14px", borderRadius:14, fontSize:14, lineHeight:1.5,
                      background: m.IsDoctor ? "#f3f4f6" : "linear-gradient(135deg,#0891b2,#0e7490)",
                      color: m.IsDoctor ? "#374151" : "#fff",
                      borderBottomRightRadius: !m.IsDoctor ? 4 : 14,
                      borderBottomLeftRadius:  m.IsDoctor  ? 4 : 14,
                    }}>
                      {m.ContentMessage}
                      <div style={{ fontSize:10, opacity:0.6, marginTop:4, textAlign:"right" }}>
                        {m.DateSend ? new Date(m.DateSend).toLocaleTimeString("fr-DZ",{hour:"2-digit",minute:"2-digit"}) : ""}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding:"12px 16px", borderTop:"1px solid #f3f4f6", display:"flex", gap:10 }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && !e.shiftKey && send()}
                  placeholder="اكتب رسالتك..."
                  style={{ flex:1, padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, outline:"none" }}
                />
                <Btn onClick={send} loading={sending} style={{ padding:"10px 20px" }}>إرسال ↗</Btn>
              </div>
            </>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"#9ca3af" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>💬</div>
              <div style={{ fontWeight:600 }}>اختر محادثة لعرض الرسائل</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const { route, navigate } = useRoute();
  const { user, loading, login, register, logout } = useAuth();

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f9fafb" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🏥</div>
        <Spinner size={36} />
        <div style={{ marginTop:16, color:"#6b7280", fontWeight:600 }}>جاري التحميل...</div>
      </div>
    </div>
  );

  // Route matching
  const renderPage = () => {
    // /clinic/:cId/doctor/:dId
    const doctorMatch = route.match(/^\/clinic\/([^/]+)\/doctor\/([^/]+)/);
    if (doctorMatch) return <DoctorDetailPage clinicId={doctorMatch[1]} doctorId={doctorMatch[2]} navigate={navigate} user={user} />;

    // /book/:cId/:dId
    const bookMatch = route.match(/^\/book\/([^/]+)\/([^/]+)/);
    if (bookMatch) {
      if (!user) { navigate("/login"); return null; }
      return <BookPage clinicId={bookMatch[1]} doctorId={bookMatch[2]} navigate={navigate} user={user} />;
    }

    switch (route.split("?")[0]) {
      case "/":           return <HomePage user={user} navigate={navigate} />;
      case "/login":      return user ? navigate("/") || null : <LoginPage onLogin={login} navigate={navigate} />;
      case "/register":   return user ? navigate("/") || null : <RegisterPage onRegister={register} navigate={navigate} />;
      case "/search":     return <SearchPage navigate={navigate} />;
      case "/profile":    return user ? <ProfilePage user={user} navigate={navigate} /> : navigate("/login") || null;
      case "/appointments":return user ? <AppointmentsPage navigate={navigate} /> : navigate("/login") || null;
      case "/chat":       return user ? <ChatPage user={user} /> : navigate("/login") || null;
      default:            return (
        <div style={{ textAlign:"center", padding:"80px 24px" }}>
          <div style={{ fontSize:64, marginBottom:16 }}>🔍</div>
          <h1 style={{ color:"#0c4a6e", fontWeight:900 }}>404 — الصفحة غير موجودة</h1>
          <Btn onClick={() => navigate("/")} style={{ marginTop:24 }}>العودة للرئيسية</Btn>
        </div>
      );
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", minHeight:"100vh", background:"#f9fafb" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f3f4f6; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        body { margin: 0; padding: 0; }
        input, select, textarea, button { font-family: inherit; }
      `}</style>
      <Navbar user={user} navigate={navigate} onLogout={logout} />
      {renderPage()}
      {/* Footer */}
      <footer style={{ background:"#0c4a6e", color:"rgba(255,255,255,0.7)", textAlign:"center", padding:"24px", marginTop:60, fontSize:13 }}>
        <div style={{ fontWeight:700, color:"#fff", marginBottom:4 }}>طبيبي — Tabibi</div>
        منصة حجز المواعيد الطبية في الجزائر © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
