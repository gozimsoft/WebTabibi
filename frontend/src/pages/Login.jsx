// src/pages/Login.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Btn, Card, Input } from "../components/SharedUI";

export default function LoginPage({ onLogin, onGoogleLogin, navigate }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setL] = useState(false);
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
    try { await onLogin(form.username, form.password); navigate("/"); }
    catch (e) { setError(e.message); }
    finally { setL(false); }
  };

  return (
    <div style={{ minHeight: "90vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--heading-color)", margin: "0 0 6px" }}>{t("login_welcome")}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("login_subtitle")}</p>
        </div>
        <Card>
          {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 14px", marginBottom: 14, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
          
          <div ref={googleBtnRef} style={{ marginBottom: 16, width: "100%", display: "flex", justifyContent: "center", minHeight: 40 }}></div>
          
          <div style={{ display: "flex", alignItems: "center", margin: "16px 0", color: "var(--text-muted)" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
            <span style={{ margin: "0 10px", fontSize: 12 }}>أو</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
          </div>

          <form onSubmit={submit}>
            <Input label={t("username")} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder={t("username_placeholder")} required />
            <Input label={t("password")} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
            <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 12, marginTop: 6 }}>
              {loading ? t("logging_in") : t("login_btn")}
            </Btn>
          </form>
          <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--text-muted)" }}>
            {t("no_account")} <button onClick={() => navigate("/register")} style={{ color: "var(--brand)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>{t("register_now")}</button>
          </p>
        </Card>
      </div>
    </div>
  );
}
