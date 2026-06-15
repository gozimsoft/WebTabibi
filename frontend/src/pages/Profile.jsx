// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card, Spinner, Input, Badge, useToast } from "../components/SharedUI";
import OTPModal from "../components/OTPModal";
import { Lock, User } from "lucide-react";

export default function ProfilePage({ user }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);
  const [saving, setSav] = useState(false);
  const [otp, setOtp] = useState(null); // null | 'email' | 'phone'
  const { show, Toast } = useToast();

  // --- حالة قسم بيانات الدخول ---
  const [creds, setCreds] = useState({
    current_password: "",
    new_username: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [savingCreds, setSavingCreds] = useState(false);

  const fetch = () => api.patient.getProfile().then(setData).catch(e => show(e.message, "error")).finally(() => setL(false));
  useEffect(() => { fetch(); }, []);

  // --- حفظ المعلومات الشخصية ---
  const save = async () => {
    setSav(true);
    try {
      await api.patient.updateProfile(data);
      show(t("save_success"));
    } catch (e) { show(e.message, "error"); }
    finally { setSav(false); }
  };

  const saveCredentials = async () => {
    // التحقق المحلي: تطابق كلمتي المرور الجديدتين
    if (creds.new_password && creds.new_password !== creds.confirm_new_password) {
      show(t("passwords_no_match"), "error");
      return;
    }
    // التحقق المحلي: يجب تقديم شيء للتغيير
    if (!creds.new_username && !creds.new_password) {
      show(t("save_changes"), "error");
      return;
    }

    setSavingCreds(true);
    try {
      await api.patient.updateCredentials({
        new_username: creds.new_username || undefined,
        new_password: creds.new_password || undefined,
      });
      show(t("credentials_save_success"));
      // مسح الحقول بعد النجاح
      setCreds({ new_username: "", new_password: "", confirm_new_password: "" });
    } catch (e) { show(e.message, "error"); }
    finally { setSavingCreds(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", marginBottom: 20 }}>{t("profile")}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* --- قسم المعلومات الشخصية --- */}
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
          <Input label={t("nin_label") || "الرقم الوطني"} value={data?.nin || ""} onChange={e => setData({ ...data, nin: e.target.value })} />
          <Input label={t("address")} value={data?.address || ""} onChange={e => setData({ ...data, address: e.target.value })} />
          <Btn onClick={save} loading={saving} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>{t("save_changes")}</Btn>
        </Card>

        {/* --- قسم التحقق من الهوية --- */}
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

      {/* --- قسم بيانات الدخول (اسم المستخدم / كلمة المرور) --- */}
      <Card style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ background: "linear-gradient(135deg,#0891b2,#0c4a6e)", borderRadius: 10, padding: 8, display: "flex" }}>
            <Lock size={16} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#0c4a6e", fontSize: 16 }}>{t("login_credentials")}</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{t("login_credentials_desc")}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {/* --- عمود اسم المستخدم --- */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <User size={14} color="#0891b2" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{t("current_username")}: </span>
              <span style={{ fontSize: 13, color: "#0891b2", fontWeight: 800 }}>{user?.username || "—"}</span>
            </div>
            <Input
              label={t("new_username")}
              value={creds.new_username}
              onChange={e => setCreds({ ...creds, new_username: e.target.value })}
              placeholder={t("new_username_hint")}
            />
          </div>

          {/* --- عمود كلمة المرور --- */}
          <div>
            <Input
              label={t("new_password")}
              type="password"
              value={creds.new_password}
              onChange={e => setCreds({ ...creds, new_password: e.target.value })}
              placeholder={t("new_password_hint")}
            />
            <Input
              label={t("confirm_new_password")}
              type="password"
              value={creds.confirm_new_password}
              onChange={e => setCreds({ ...creds, confirm_new_password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* --- زر حفظ التغييرات --- */}
        <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Btn
            onClick={saveCredentials}
            loading={savingCreds}
            style={{ padding: "10px 28px", whiteSpace: "nowrap" }}
          >
            {t("save_changes")}
          </Btn>
        </div>
      </Card>

      {otp && <OTPModal type={otp} onClose={() => setOtp(null)} onSuccess={() => { window.location.reload(); }} show={show} />}
      <Toast />
    </div>
  );
}
