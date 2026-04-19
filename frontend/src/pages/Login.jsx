// src/pages/Login.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Btn, Card, Input } from "../components/SharedUI";

export default function LoginPage({ onLogin, navigate }) {
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
    <div style={{ minHeight: "90vh", background: "linear-gradient(135deg,#ecfeff,#f0fdfa)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏥</div>
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
        <div style={{ marginTop: 16, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "11px 14px", fontSize: 12 }}>
          <strong style={{ color: "#ea580c" }}>🔑 {t("demo_account")}</strong>
          <div style={{ color: "#92400e", marginTop: 3 }}>{t("username")}: <code>Kaioran</code> | {t("password")}: <code>FJHajf552:</code></div>
        </div>
      </div>
    </div>
  );
}
