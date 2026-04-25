// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card, Spinner, Input, Badge, useToast } from "../components/SharedUI";
import OTPModal from "../components/OTPModal";

export default function ProfilePage({ user }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);
  const [saving, setSav] = useState(false);
  const [otp, setOtp] = useState(null); // null | 'email' | 'phone'
  const { show, Toast } = useToast();

  const fetch = () => api.patient.profile().then(setData).catch(e => show(e.message, "error")).finally(() => setL(false));
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    setSav(true);
    try {
      await api.patient.update(data);
      show(t("save_success"));
    } catch (e) { show(e.message, "error"); }
    finally { setSav(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", marginBottom: 20 }}>{t("profile")}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: "#0c4a6e", fontSize: 16 }}>{t("personal_info")}</h3>
          <Input label={t("fullname")} value={data?.fullname || ""} onChange={e => setData({ ...data, fullname: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label={t("birth_date")} type="date" value={data?.birthdate || ""} onChange={e => setData({ ...data, birthdate: e.target.value })} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>{t("blood_type")}</label>
              <select value={data?.bloodgroup || ""} onChange={e => setData({ ...data, bloodgroup: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, background: "#fafafa", boxSizing: "border-box" }}>
                <option value="">--</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <Input label={t("address")} value={data?.address || ""} onChange={e => setData({ ...data, address: e.target.value })} />
          <Btn onClick={save} loading={saving} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>{t("save_changes")}</Btn>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 16px", color: "#0c4a6e", fontSize: 16 }}>{t("id_verification")}</h3>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13 }}>
                <div style={{ color: "#64748b", fontSize: 11, marginBottom: 2 }}>{t("email_label")}</div>
                <div style={{ fontWeight: 700 }}>{user?.email}</div>
              </div>
              {user?.is_email_verified ? <Badge color="#059669">{t("email_verified")}</Badge> : <Btn variant="ghost" onClick={() => setOtp("email")} style={{ padding: "5px 12px", fontSize: 11 }}>{t("confirm_email_btn")}</Btn>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13 }}>
                <div style={{ color: "#64748b", fontSize: 11, marginBottom: 2 }}>{t("phone_label")}</div>
                <div style={{ fontWeight: 700 }}>{user?.phone || t("not_specified")}</div>
              </div>
              {user?.is_phone_verified ? <Badge color="#059669">{t("phone_verified")}</Badge> : <Btn variant="ghost" onClick={() => setOtp("phone")} style={{ padding: "5px 12px", fontSize: 11 }}>{t("confirm_phone_btn")}</Btn>}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{t("id_verification_desc")}</div>
        </Card>
      </div>

      {otp && <OTPModal type={otp} onClose={() => setOtp(null)} onSuccess={() => { window.location.reload(); }} show={show} />}
      <Toast />
    </div>
  );
}
