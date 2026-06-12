// src/pages/Register.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Btn, Card, Input } from "../components/SharedUI";

export default function RegisterPage({ onRegister, onGoogleLogin, navigate }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: "", password: "", email: "", fullname: "", phone: "", gender: 0, nin: "" });
  const [error, setError] = useState("");
  const [loading, setL] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const googleBtnRef = React.useRef(null);
  const initialized = React.useRef(false);

  React.useEffect(() => {
    let timer;
    const initGoogle = () => {
      if (initialized.current) {
        clearInterval(timer);
        return;
      }
      if (window.google && window.google.accounts && googleBtnRef.current) {
        initialized.current = true;
        clearInterval(timer);
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "875672071653-qjfc4ktsic21kato8i1s7ujp1q7dubi9.apps.googleusercontent.com",
          callback: async (res) => {
            try {
              setError(""); setL(true);
              await onGoogleLogin(res.credential);
              navigate("/");
            } catch(e) {
              setError(e.message);
              setL(false);
            }
          }
        });
        window.google.accounts.id.renderButton(
          googleBtnRef.current,
          { theme: "outline", size: "large", type: "standard", text: "continue_with", width: "100%" }
        );
      }
    };
    timer = setInterval(initGoogle, 100);
    initGoogle();
    return () => clearInterval(timer);
  }, [onGoogleLogin, navigate]);

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
          <div style={{ fontSize: 44, marginBottom: 8 }}>🤝</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--heading-color)", margin: "0 0 6px" }}>{t("register_title")}</h1>
        </div>
        <Card>
          {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 14px", marginBottom: 14, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
          
          <div ref={googleBtnRef} style={{ marginBottom: 16, width: "100%", display: "flex", justifyContent: "center", minHeight: 40 }}></div>
          
          <div style={{ display: "flex", alignItems: "center", margin: "16px 0", color: "var(--text-muted)" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
            <span style={{ margin: "0 10px", fontSize: 12 }}>أو بالطريقة العادية</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
          </div>

          <form onSubmit={submit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label={`${t("fullname")} *`} value={form.fullname} onChange={e => f("fullname", e.target.value)} placeholder="محمد أمين" required />
              <Input label={`${t("username")} *`} value={form.username} onChange={e => f("username", e.target.value)} placeholder="mohammedamine" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label={`${t("email")} *`} type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="exemple@gmail.com" required />
              <Input label={t("nin_label") || "الرقم الوطني"} type="text" value={form.nin} onChange={e => f("nin", e.target.value)} placeholder="الرقم الوطني (NIN)" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label={t("phone")} type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="0699123456" />
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{t("gender")}</label>
                <select value={form.gender} onChange={e => f("gender", +e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--input-bg)", color: "var(--text-main)", boxSizing: "border-box" }}>
                  <option value={0}>{t("male")}</option><option value={1}>{t("female")}</option>
                </select>
              </div>
            </div>
            <Input label={`${t("password")} *`} type="password" value={form.password} onChange={e => f("password", e.target.value)} placeholder={t("password_hint")} required />
            <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 12, marginTop: 6 }}>
              {loading ? t("creating_account") : t("create_account_btn")}
            </Btn>
          </form>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
            {t("have_account")} <button onClick={() => navigate("/login")} style={{ color: "var(--brand)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>{t("login")}</button>
          </p>
        </Card>
      </div>
    </div>
  );
}
