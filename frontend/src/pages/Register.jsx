// src/pages/Register.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Btn, Card, Input } from "../components/SharedUI";

export default function RegisterPage({ onRegister, navigate }) {
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
    <div style={{ minHeight: "90vh", background: "linear-gradient(135deg,#ecfeff,#f0fdfa)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🤝</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", margin: "0 0 6px" }}>{t("register_title")}</h1>
        </div>
        <Card>
          {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 14px", marginBottom: 14, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label={`${t("fullname")} *`} value={form.fullname} onChange={e => f("fullname", e.target.value)} placeholder="محمد أمين" required />
              <Input label={`${t("username")} *`} value={form.username} onChange={e => f("username", e.target.value)} placeholder="mohammedamine" required />
            </div>
            <Input label={`${t("email")} *`} type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="exemple@gmail.com" required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label={t("phone")} type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="0699123456" />
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{t("gender")}</label>
                <select value={form.gender} onChange={e => f("gender", +e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, background: "#fafafa", boxSizing: "border-box" }}>
                  <option value={0}>{t("male")}</option><option value={1}>{t("female")}</option>
                </select>
              </div>
            </div>
            <Input label={`${t("password")} *`} type="password" value={form.password} onChange={e => f("password", e.target.value)} placeholder={t("password_hint")} required />
            <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 12, marginTop: 6 }}>
              {loading ? t("creating_account") : t("create_account_btn")}
            </Btn>
          </form>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6b7280" }}>
            {t("have_account")} <button onClick={() => navigate("/login")} style={{ color: "#0891b2", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>{t("login")}</button>
          </p>
        </Card>
      </div>
    </div>
  );
}
