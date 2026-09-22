// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card, Spinner, Input, PasswordInput, Badge, useToast } from "../components/SharedUI";
import OTPModal from "../components/OTPModal";
import AvatarCropModal from "../components/AvatarCropModal";
import { AccountSecurityPill, AccountSecurityCard } from "../components/AccountSecuritySummary";
import { Lock, User, Camera, MapPin } from "lucide-react";

export default function ProfilePage({ user }) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);
  const [saving, setSav] = useState(false);
  const [otp, setOtp] = useState(null); // null | 'email' | 'phone'
  const { show, Toast } = useToast();

  // --- حالة رفع وقص الصورة الشخصية ---
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [uploadingPhoto, setUPhoto] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const fileInput = useRef(null);

  // --- حالة الولايات والبلديات ---
  const [wilayasList, setWilayasList] = useState([]);
  const [baladiyasList, setBaladiyasList] = useState([]);
  const [loadingBaladiyas, setLoadingBaladiyas] = useState(false);
  const [showSecurityCard, setShowSecurityCard] = useState(false);

  // --- حالة قسم بيانات الدخول ---
  const [creds, setCreds] = useState({
    current_password: "",
    new_username: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [savingCreds, setSavingCreds] = useState(false);

  const fetch = () =>
    api.patient
      .getProfile()
      .then(p => {
        setData(p);
        if (p?.wilaya_id) {
          api.baladiyas(p.wilaya_id).then(b => setBaladiyasList(b || [])).catch(() => {});
        }
      })
      .catch(e => show(e.message, "error"))
      .finally(() => setL(false));

  useEffect(() => {
    fetch();
    api.wilayas().then(w => setWilayasList(w || [])).catch(() => {});
  }, []);

  const handleWilayaChange = async (wilayaId) => {
    setData(prev => ({
      ...prev,
      wilaya_id: wilayaId,
      baladiya_id: "",
      postcode: ""
    }));
    if (wilayaId) {
      setLoadingBaladiyas(true);
      try {
        const b = await api.baladiyas(wilayaId);
        setBaladiyasList(b || []);
      } catch (err) {
        console.error("Error loading baladiyas:", err);
      } finally {
        setLoadingBaladiyas(false);
      }
    } else {
      setBaladiyasList([]);
    }
  };

  const handleBaladiyaChange = (baladiyaId) => {
    const selected = baladiyasList.find(b => b.id === baladiyaId);
    setData(prev => ({
      ...prev,
      baladiya_id: baladiyaId,
      postcode: selected?.postcode || prev?.postcode || ""
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) {
      show(t("invalid_image_type", "الملف المحدد ليس صورة صالحة"), "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      show(t("file_too_large", "الملف يتجاوز الحد الأقصى المسموح به (5 ميغابايت)"), "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async (croppedBlob) => {
    setUPhoto(true);
    try {
      const fd = new FormData();
      fd.append("photo", croppedBlob, "avatar.jpg");
      await api.patient.uploadPhoto(fd);
      show(t("photo_upload_success", "تم تحديث الصورة بنجاح"), "success");
      setCropModalOpen(false);
      setCropImageSrc(null);
      fetch();
    } catch (err) {
      show(err.message, "error");
    } finally {
      setUPhoto(false);
    }
  };

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
    // التحقق المحلي: عند تغيير كلمة المرور
    if (creds.new_password) {
      if (!creds.current_password) {
        show(t("current_password_required"), "error");
        return;
      }
      if (creds.new_password.length < 6) {
        show(t("password_min_hint", "كلمة المرور يجب أن تكون 6 أحرف على الأقل"), "error");
        return;
      }
      if (creds.new_password !== creds.confirm_new_password) {
        show(t("passwords_no_match"), "error");
        return;
      }
    }
    // التحقق المحلي: يجب تقديم شيء للتغيير
    if (!creds.new_username && !creds.new_password) {
      show(t("enter_new_credentials_error", "يرجى إدخال اسم مستخدم أو كلمة مرور جديدة"), "error");
      return;
    }

    setSavingCreds(true);
    try {
      await api.patient.updateCredentials({
        current_password: creds.current_password || undefined,
        new_username: creds.new_username || undefined,
        new_password: creds.new_password || undefined,
      });
      show(t("credentials_save_success"));
      // مسح الحقول بعد النجاح
      setCreds({ current_password: "", new_username: "", new_password: "", confirm_new_password: "" });
    } catch (e) { show(e.message, "error"); }
    finally { setSavingCreds(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
      <input
        type="file"
        ref={fileInput}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
      />

      {/* Header with Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
        <div
          onClick={() => fileInput.current?.click()}
          onMouseEnter={() => setIsHoveringAvatar(true)}
          onMouseLeave={() => setIsHoveringAvatar(false)}
          title={t("change_photo", "تغيير الصورة")}
          style={{
            width: 76,
            height: 76,
            borderRadius: 18,
            background: "linear-gradient(135deg,var(--brand,#0891b2),#0c4a6e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
            transform: isHoveringAvatar ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.18s ease-in-out",
            boxShadow: "0 8px 20px rgba(8,145,178,0.2)",
          }}
        >
          {uploadingPhoto ? (
            <Spinner size={24} />
          ) : data?.photoprofile ? (
            <img
              src={`data:image/jpeg;base64,${data.photoprofile}`}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            (data?.fullname || user?.username || "P")[0].toUpperCase()
          )}
          {!uploadingPhoto && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(15, 23, 42, 0.55)",
                backdropFilter: "blur(2px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: isHoveringAvatar ? 1 : 0,
                transition: "opacity 0.2s ease-in-out",
                color: "#ffffff",
              }}
            >
              <Camera size={26} />
            </div>
          )}
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", margin: "0 0 4px" }}>
            {data?.fullname || user?.username || t("profile")}
          </h1>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{data?.email || user?.email}</div>
          <AccountSecurityPill
            form={data}
            verStatus={{
              email_verified: Boolean(user?.is_email_verified || data?.emailvalidation == 1),
              phone_verified: Boolean(user?.is_phone_verified || data?.phonevalidation == 1),
              has_email: Boolean(data?.email || user?.email),
              has_phone: Boolean(data?.phone || user?.phone)
            }}
            consentData={null}
            isOpen={showSecurityCard}
            onClick={() => setShowSecurityCard(prev => !prev)}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* --- قسم المعلومات الشخصية --- */}
        <Card>
          <h3 style={{ margin: "0 0 16px", color: "#0c4a6e", fontSize: 16 }}>{t("personal_info")}</h3>
          <Input label={t("fullname")} value={data?.fullname || ""} onChange={e => setData({ ...data, fullname: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label={t("birth_date")} type="date" value={data?.birthdate || ""} onChange={e => setData({ ...data, birthdate: e.target.value })} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>{t("blood_type")}</label>
              <select value={data?.bloodgroup || data?.bloodtype || ""} onChange={e => setData({ ...data, bloodtype: e.target.value, bloodgroup: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, background: "#fafafa", boxSizing: "border-box" }}>
                <option value="">--</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <Input label={t("nin_label") || "الرقم الوطني"} value={data?.nin || ""} onChange={e => setData({ ...data, nin: e.target.value })} />

          {/* Geographic & Address Section */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ color: "#0c4a6e", marginBottom: 12, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={15} color="var(--brand, #0891b2)" /> {t("location_address", "الموقع والعنوان")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {/* Wilaya Selection */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                  {t("wilaya", "الولاية")}
                </label>
                <select
                  value={data?.wilaya_id || ""}
                  onChange={e => handleWilayaChange(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, background: "#fafafa", boxSizing: "border-box" }}
                >
                  <option value="">-- {t("select_wilaya", "اختر الولاية")} --</option>
                  {wilayasList.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.num ? `${w.num} - ` : ""}{i18n.language === 'ar' ? (w.namear || w.namefr) : (w.namefr || w.namear)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Commune (Baladiya) Selection */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                  {t("commune", "البلدية")} {loadingBaladiyas && <Spinner size={12} />}
                </label>
                <select
                  value={data?.baladiya_id || ""}
                  onChange={e => handleBaladiyaChange(e.target.value)}
                  disabled={!data?.wilaya_id || loadingBaladiyas}
                  style={{
                    width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
                    borderRadius: 10, fontSize: 14, background: (!data?.wilaya_id || loadingBaladiyas) ? "#f1f5f9" : "#fafafa",
                    boxSizing: "border-box", cursor: (!data?.wilaya_id || loadingBaladiyas) ? "not-allowed" : "default"
                  }}
                >
                  <option value="">
                    {!data?.wilaya_id ? `-- ${t("select_wilaya_first", "يرجى اختيار الولاية أولاً")} --` : `-- ${t("select_commune", "اختر البلدية")} --`}
                  </option>
                  {baladiyasList.map(b => (
                    <option key={b.id} value={b.id}>
                      {i18n.language === 'ar' ? (b.namear || b.namefr) : (b.namefr || b.namear)}{b.postcode ? ` (${b.postcode})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Code Postal */}
              <Input
                label={t("postcode", "الرمز البريدي")}
                value={data?.postcode || ""}
                onChange={e => setData({ ...data, postcode: e.target.value })}
                placeholder="ex: 16000"
              />

              {/* Detailed Street Address */}
              <Input
                label={t("address_details", "العنوان التفصيلي (الشارع، رقم المبنى...)")}
                value={data?.address || ""}
                onChange={e => setData({ ...data, address: e.target.value })}
                placeholder={t("address_placeholder", "Wilaya, Commune, Rue...")}
              />
            </div>
          </div>

          <Btn onClick={save} loading={saving} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>{t("save_changes")}</Btn>
        </Card>

        {/* --- ملخص أمان الحساب والتحقق من الهوية --- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {showSecurityCard && (
            <AccountSecurityCard
              form={data}
              verStatus={{
                email_verified: Boolean(user?.is_email_verified || data?.emailvalidation == 1),
                phone_verified: Boolean(user?.is_phone_verified || data?.phonevalidation == 1),
                has_email: Boolean(data?.email || user?.email),
                has_phone: Boolean(data?.phone || user?.phone)
              }}
              consentData={null}
              onVerifyEmail={(!user?.is_email_verified && !data?.emailvalidation) ? () => setOtp("email") : null}
              onManagePassword={() => {
                const el = document.getElementById("profile-credentials-card");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              onClose={() => setShowSecurityCard(false)}
              isMobile={false}
            />
          )}

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
          </Card>
        </div>
      </div>

      {/* --- قسم بيانات الدخول (اسم المستخدم وكلمة المرور) --- */}
      <Card id="profile-credentials-card" style={{ marginTop: 20 }}>
        <h3 style={{ margin: "0 0 16px", color: "#0c4a6e", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Lock size={16} /> {t("credentials_settings", "بيانات الدخول")}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {/* تغيير اسم المستخدم */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <User size={14} color="#0891b2" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{t("current_username", "اسم المستخدم الحالي:")} </span>
              <span style={{ fontSize: 13, color: "#0891b2", fontWeight: 700 }}>{user?.username || "—"}</span>
            </div>
            <Input
              label={t("new_username")}
              value={creds.new_username}
              onChange={e => setCreds({ ...creds, new_username: e.target.value })}
              placeholder={t("username_hint")}
            />
          </div>

          {/* تغيير كلمة المرور */}
          <div>
            <PasswordInput
              label={t("current_password", "كلمة المرور الحالية")}
              value={creds.current_password}
              onChange={e => setCreds({ ...creds, current_password: e.target.value })}
              placeholder="••••••••"
            />
            <PasswordInput
              label={t("new_password")}
              value={creds.new_password}
              onChange={e => setCreds({ ...creds, new_password: e.target.value })}
              placeholder={t("new_password_hint")}
              showStrength={true}
            />
            <PasswordInput
              label={t("confirm_new_password")}
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

      {/* Avatar Crop Modal */}
      <AvatarCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => {
          setCropModalOpen(false);
          setCropImageSrc(null);
        }}
        onSave={handleCropSave}
      />

      {otp && <OTPModal type={otp} onClose={() => setOtp(null)} onSuccess={() => { window.location.reload(); }} show={show} />}
      <Toast />
    </div>
  );
}
