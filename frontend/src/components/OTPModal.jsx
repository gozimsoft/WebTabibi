// src/components/OTPModal.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn } from "./SharedUI";

export default function OTPModal({ type, onClose, onSuccess, show: showToast }) {
  const { t, i18n } = useTranslation();
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
      showToast(`${t("otp_sent_msg")} ${d.target || type}`);
    } catch (e) { showToast(e.message, "error"); }
    finally { setL(false); }
  };

  const confirmOTP = async () => {
    if (code.length !== 6) { showToast(t("otp_error_len"), "error"); return; }
    setL(true);
    try {
      await api.verify.confirm({ type, code });
      showToast(type === "email" ? t("otp_success_email") : t("otp_success_phone"));
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
            {type === "email" ? t("otp_email_title") : t("otp_phone_title")}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9ca3af" }}>×</button>
        </div>

        {step === "send" ? (
          <>
            <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: 24 }}>
              {type === "email" ? t("otp_email_desc") : t("otp_phone_desc")}
            </p>
            <Btn onClick={sendOTP} loading={loading} style={{ width: "100%", justifyContent: "center", padding: 13 }}>
              {t("otp_send_btn")}
            </Btn>
          </>
        ) : (
          <>
            <p style={{ color: "#6b7280", marginBottom: 16 }}>
              {i18n.language === 'ar' ? 'أدخل الرمز المرسل إلى ' : i18n.language === 'fr' ? 'Entrez le code envoyé à ' : 'Enter the code sent to '} <strong style={{ color: "#0891b2" }}>{target}</strong>
            </p>
            {devCode && (
              <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: "12px 16px", marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#854d0e", marginBottom: 4 }}>{i18n.language === 'ar' ? '⚠️ وضع التطوير — الرمز:' : i18n.language === 'fr' ? '⚠️ Mode Dev — Code:' : '⚠️ Dev Mode — Code:'}</div>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 8, color: "#0891b2" }}>{devCode}</div>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <input
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t("otp_placeholder")}
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
                {t("otp_resend")}
              </Btn>
              <Btn onClick={confirmOTP} loading={loading} style={{ flex: 2, justifyContent: "center" }} disabled={code.length !== 6}>
                {t("otp_confirm")}
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
