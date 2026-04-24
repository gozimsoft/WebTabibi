          {(form.FullName || "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0c4a6e", margin: "0 0 4px" }}>{form.FullName}</h1>
          <div style={{ fontSize: 13, color: "#6b7280" }}>{form.Email}</div>
          <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge color={verStatus?.email_verified ? "#059669" : "#f59e0b"}>
              {verStatus?.email_verified ? <Check size={12} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 4 }} /> : <AlertCircle size={12} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 4 }} />}
              {verStatus?.email_verified ? t("email_verified") : t("email_unverified")}
            </Badge>
            <Badge color={verStatus?.phone_verified ? "#059669" : "#f59e0b"}>
              {verStatus?.phone_verified ? <Check size={12} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 4 }} /> : <AlertCircle size={12} style={{ [i18n.language === 'ar' ? "marginLeft" : "marginRight"]: 4 }} />}
              {verStatus?.phone_verified ? t("phone_verified") : t("phone_unverified")}
            </Badge>
          </div>
        </div>
      </div>

      {/* Verification section */}
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
        {/* Personal Info */}
        <Card style={{ marginBottom: 14 }}>
          <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><User size={18} /> {t("personal_info")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 0 : 10 }}>
            <Input label={t("fullname")} value={form.FullName || ""} onChange={e => f("FullName", e.target.value)} />
            <Input label={t("phone")} type="tel" value={form.Phone || ""} onChange={e => f("Phone", e.target.value)} />
            <Input label={t("email")} type="email" value={form.Email || ""} onChange={e => f("Email", e.target.value)} />
            <Input label={t("birth_date")} type="date" value={(form.BirthDate || "").substring(0, 10)} onChange={e => f("BirthDate", e.target.value)} />
            <Input label={t("address")} value={form.Address || ""} onChange={e => f("Address", e.target.value)} style={{ gridColumn: isMobile ? "auto" : "1/-1" }} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{t("gender")}</label>
              <select value={form.Gender ?? 0} onChange={e => f("Gender", +e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--bg)", boxSizing: "border-box" }}>
                <option value={0}>{t("male")}</option><option value={1}>{t("female")}</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{t("blood_type")}</label>
              <select value={form.BloodType || ""} onChange={e => f("BloodType", e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--bg)", boxSizing: "border-box" }}>
                <option value="">{t("not_specified")}</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Emergency */}
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ color: "#0c4a6e", margin: "0 0 18px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><Shield size={18} /> {t("emergency_info")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label={t("emergency_phone")} value={form.EmergancyPhone || ""} onChange={e => f("EmergancyPhone", e.target.value)} />
            <Input label={t("emergency_email")} type="email" value={form.EmergancyEmail || ""} onChange={e => f("EmergancyEmail", e.target.value)} />
          </div>
          <div style={{ marginBottom: 0 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{t("emergency_notes")}</label>
            <textarea value={form.EmergancyNote || ""} onChange={e => f("EmergancyNote", e.target.value)} rows={2}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
          </div>
        </Card>

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
              <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>{t("no_chats")}</div>
            )}
          </div>
        </div>
        {/* Messages */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", height: isMobile ? 480 : "auto" }}>
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
