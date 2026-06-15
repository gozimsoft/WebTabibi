// src/pages/Login.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Btn, Card, Input, useToast } from "../components/SharedUI";
import { api } from "../api/client";

export default function LoginPage({ onLogin, onGoogleLogin, navigate }) {
  const { t } = useTranslation();
  const { show, Toast } = useToast();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setL] = useState(false);
  const googleBtnRef = React.useRef(null);
  const initialized = React.useRef(false);

  // Forgot Password State
  const [resetStep, setResetStep] = useState(0); // 0: hidden, 1: email, 2: otp & new password
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  // Email Verification State (حالة تأكيد الحساب بالإيميل)
  const [showOtp, setShowOtp] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");
  const [otpCode, setOtpCode] = useState("");

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
    try {
      await onLogin(form.username, form.password);
      navigate("/");
    }
    catch (e) {
      if (e.requires_verification) {
        setEmailToVerify(e.email);
        setShowOtp(true);
        setError("");
      } else {
        setError(e.message);
      }
    }
    finally { setL(false); }
  };

  const verifyCode = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError(localStorage.getItem("tabibi_lang") === "ar" ? "يرجى إدخال رمز التحقق المكون من 6 أرقام" : "Veuillez entrer le code à 6 chiffres");
      return;
    }
    setL(true); setError("");
    try {
      await api.auth.verifyAccountEmail({ email: emailToVerify, code: otpCode });
      show(localStorage.getItem("tabibi_lang") === "ar" ? "تم تأكيد البريد الإلكتروني بنجاح! جاري تسجيل الدخول..." : "E-mail vérifié avec succès ! Connexion en cours...");
      await onLogin(form.username, form.password);
      navigate("/");
    } catch(e) {
      setError(e.message);
    } finally {
      setL(false);
    }
  };

  const resendCode = async () => {
    setError(""); setL(true);
    try {
      await onLogin(form.username, form.password);
    } catch (e) {
      if (e.requires_verification) {
        show(localStorage.getItem("tabibi_lang") === "ar" ? "تم إعادة إرسال رمز التحقق بنجاح!" : "Code de vérification renvoyé avec succès !");
      } else {
        setError(e.message);
        setShowOtp(false);
      }
    } finally {
      setL(false);
    }
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault(); setResetError(""); setResetLoading(true);
    try {
      await api.auth.forgotPassword({ email: resetEmail });
      show(localStorage.getItem("tabibi_lang") === "ar" ? "تم إرسال الرمز بنجاح!" : "Code envoyé avec succès!");
      setResetStep(2);
    } catch (e) { setResetError(e.message); }
    finally { setResetLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); setResetError(""); setResetLoading(true);
    try {
      await api.auth.resetPassword({ email: resetEmail, otp: resetOtp, password: newPassword });
      show(localStorage.getItem("tabibi_lang") === "ar" ? "تم تغيير كلمة المرور بنجاح!" : "Mot de passe modifié avec succès!");
      setResetStep(0);
      setForm({ ...form, password: "" });
    } catch (e) { setResetError(e.message); }
    finally { setResetLoading(false); }
  };

  return (
    <div style={{ minHeight: "90vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Toast />
      
      {resetStep > 0 && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20
        }}>
          <Card style={{ width: "100%", maxWidth: 400, position: "relative" }}>
            <button onClick={() => setResetStep(0)} style={{
              position: "absolute", top: 15, right: 15, background: "none", border: "none",
              fontSize: 24, cursor: "pointer", color: "var(--text-muted)"
            }}>×</button>
            
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>
              {localStorage.getItem("tabibi_lang") === "ar" ? "استعادة كلمة المرور" : "Réinitialiser le mot de passe"}
            </h2>
            
            {resetError && <div style={{ background: "#fee2e2", padding: "10px", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 15 }}>⚠️ {resetError}</div>}
            
            {resetStep === 1 ? (
              <form onSubmit={handleSendResetEmail}>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 15, lineHeight: 1.6 }}>
                  {localStorage.getItem("tabibi_lang") === "ar" 
                    ? "أدخل بريدك الإلكتروني المسجل وسنرسل لك رمزاً للتحقق." 
                    : "Entrez votre email et nous vous enverrons un code."}
                </p>
                <Input 
                  label={localStorage.getItem("tabibi_lang") === "ar" ? "البريد الإلكتروني" : "Email"} 
                  type="email" 
                  value={resetEmail} 
                  onChange={e => setResetEmail(e.target.value)} 
                  required 
                />
                <Btn type="submit" loading={resetLoading} style={{ width: "100%", justifyContent: "center" }}>
                  {localStorage.getItem("tabibi_lang") === "ar" ? "إرسال الرمز" : "Envoyer le code"}
                </Btn>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 15, lineHeight: 1.6 }}>
                  {localStorage.getItem("tabibi_lang") === "ar" 
                    ? "أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك." 
                    : "Entrez le code à 6 chiffres envoyé à votre email."}
                </p>
                <Input 
                  label={localStorage.getItem("tabibi_lang") === "ar" ? "رمز التحقق (OTP)" : "Code OTP"} 
                  value={resetOtp} 
                  onChange={e => setResetOtp(e.target.value)} 
                  placeholder="123456"
                  required 
                />
                <Input 
                  label={localStorage.getItem("tabibi_lang") === "ar" ? "كلمة المرور الجديدة" : "Nouveau mot de passe"} 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                />
                <Btn type="submit" loading={resetLoading} style={{ width: "100%", justifyContent: "center" }}>
                  {localStorage.getItem("tabibi_lang") === "ar" ? "تأكيد التغيير" : "Confirmer"}
                </Btn>
              </form>
            )}
          </Card>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--heading-color)", margin: "0 0 6px" }}>{t("login_welcome")}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("login_subtitle")}</p>
        </div>
        <Card>
          {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 14px", marginBottom: 14, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
          
          {!showOtp ? (
            <>
              <div ref={googleBtnRef} style={{ marginBottom: 16, width: "100%", display: "flex", justifyContent: "center", minHeight: 40 }}></div>
              
              <div style={{ display: "flex", alignItems: "center", margin: "16px 0", color: "var(--text-muted)" }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
                <span style={{ margin: "0 10px", fontSize: 12 }}>أو</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
              </div>

              <form onSubmit={submit}>
                <Input 
                  label={localStorage.getItem("tabibi_lang") === "ar" ? "اسم المستخدم، البريد الإلكتروني، أو الهاتف" : "Nom d'utilisateur, Email, ou Téléphone"} 
                  value={form.username} 
                  onChange={e => setForm({ ...form, username: e.target.value })} 
                  placeholder={localStorage.getItem("tabibi_lang") === "ar" ? "اسم المستخدم، الإيميل، أو 05..." : "Utilisateur, Email, ou Téléphone..."} 
                  required 
                />
                <Input label={t("password")} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
                
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-8px", marginBottom: "16px" }}>
                  <button 
                    type="button" 
                    onClick={() => { setResetStep(1); setResetEmail(""); setResetOtp(""); setNewPassword(""); setResetError(""); }} 
                    style={{ background: "none", border: "none", color: "var(--brand)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                  >
                    {localStorage.getItem("tabibi_lang") === "ar" ? "نسيت كلمة المرور؟" : "Mot de passe oublié ?"}
                  </button>
                </div>

                <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 12 }}>
                  {loading ? t("logging_in") : t("login_btn")}
                </Btn>
              </form>
              <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--text-muted)" }}>
                {t("no_account")} <button onClick={() => navigate("/register")} style={{ color: "var(--brand)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>{t("register_now")}</button>
              </p>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <h3 style={{ marginBottom: 16, color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}>
                {localStorage.getItem("tabibi_lang") === "ar" ? "تأكيد البريد الإلكتروني" : "Confirmation de l'adresse e-mail"}
              </h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: 20, fontSize: 14, lineHeight: 1.5 }}>
                {localStorage.getItem("tabibi_lang") === "ar" 
                  ? `لقد أرسلنا رمز تحقق إلى بريدك الإلكتروني ${emailToVerify}. يرجى إدخاله لتفعيل الحساب.` 
                  : `Nous avons envoyé un code de vérification à votre e-mail ${emailToVerify}. Veuillez le saisir pour activer le compte.`}
              </p>
              <input 
                type="text" 
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                maxLength={6}
                style={{
                  width: "100%", padding: "14px", textAlign: "center",
                  fontSize: 24, fontWeight: 900, letterSpacing: 10,
                  border: "2px solid var(--brand)", borderRadius: 12, outline: "none",
                  boxSizing: "border-box", background: "var(--input-bg)", color: "var(--text-main)",
                  marginBottom: 20, direction: "ltr"
                }}
              />
              <Btn onClick={verifyCode} loading={loading} style={{ width: "100%", justifyContent: "center", padding: 12, marginBottom: 12 }}>
                {loading 
                  ? (localStorage.getItem("tabibi_lang") === "ar" ? "جاري التحقق..." : "Vérification...") 
                  : (localStorage.getItem("tabibi_lang") === "ar" ? "تأكيد الحساب" : "Confirmer le compte")}
              </Btn>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <button 
                  type="button"
                  onClick={resendCode} 
                  style={{ background: "none", border: "none", color: "var(--brand)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                >
                  {localStorage.getItem("tabibi_lang") === "ar" ? "إعادة إرسال الرمز" : "Renvoyer le code"}
                </button>
                <button 
                  type="button"
                  onClick={() => { setShowOtp(false); setError(""); setOtpCode(""); }} 
                  style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                >
                  {localStorage.getItem("tabibi_lang") === "ar" ? "العودة لتسجيل الدخول" : "Retour à la connexion"}
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
