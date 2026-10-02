// src/components/DoctorClinicManager.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2, MapPin, Phone, Mail, Globe, Clock,
  Calendar, CheckCircle2, AlertCircle, Save, Plus,
  Trash2, Upload, AlertTriangle, ShieldCheck, Stethoscope,
  Info, Sparkles, Navigation
} from "lucide-react";
import { Btn, Card, Spinner, Input } from "./SharedUI";

const WEEK_DAYS = [
  { index: 0, labelAr: "الإثنين", labelFr: "Lundi" },
  { index: 1, labelAr: "الثلاثاء", labelFr: "Mardi" },
  { index: 2, labelAr: "الأربعاء", labelFr: "Mercredi" },
  { index: 3, labelAr: "الخميس", labelFr: "Jeudi" },
  { index: 4, labelAr: "الجمعة", labelFr: "Vendredi" },
  { index: 5, labelAr: "السبت", labelFr: "Samedi" },
  { index: 6, labelAr: "الأحد", labelFr: "Dimanche" },
];

export default function DoctorClinicManager({ api, showToast, isMobile }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("info"); // 'info' | 'schedule' | 'off_hours'

  // Wilayas and Baladiyas
  const [wilayasList, setWilayasList] = useState([]);
  const [baladiyasList, setBaladiyasList] = useState([]);
  const [loadingBaladiyas, setLoadingBaladiyas] = useState(false);

  // Form state
  const [form, setForm] = useState({
    clinicname: "",
    phone: "",
    fax: "",
    email: "",
    website: "",
    address: "",
    wilaya_id: "",
    baladiya_id: "",
    postcode: "",
    latitude: 0,
    longitude: 0,
    services: "",
    aboutclinic: "",
    emergency: false,
    ambulances: false,
    hospitalization: false,
    logo: ""
  });

  // Schedule state
  const [schedule, setSchedule] = useState({
    timescale: 20,
    daytimestart: "08:00",
    daytimeend: "17:00",
    weekbeginday: 0,
    workingdays: "1,2,3,4,5",
    isregistered: true
  });

  // Off-hours state
  const [offHours, setOffHours] = useState([]);
  const [newOffHour, setNewOffHour] = useState({ day: 0, timebegin: "12:00", timeend: "13:00" });

  const [saving, setSaving] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // Load clinic data
  const loadClinic = async () => {
    try {
      setLoading(true);
      const res = await api.doctors.getMyClinic();
      if (res) {
        setClinic(res);
        setForm({
          clinicname: res.clinicname || "",
          phone: res.phone || "",
          fax: res.fax || "",
          email: res.email || "",
          website: res.website || "",
          address: res.address || "",
          wilaya_id: res.wilaya_id || "",
          baladiya_id: res.baladiya_id || "",
          postcode: res.postcode || "",
          latitude: res.latitude || 0,
          longitude: res.longitude || 0,
          services: res.services || "",
          aboutclinic: res.aboutclinic || "",
          emergency: Boolean(res.emergency),
          ambulances: Boolean(res.ambulances),
          hospitalization: Boolean(res.hospitalization),
          logo: res.logo ? (res.logo.startsWith("data:") ? res.logo : `data:image/jpeg;base64,${res.logo}`) : ""
        });

        if (res.appointment_settings) {
          const s = res.appointment_settings;
          const formatTime = (t) => {
            if (!t) return "08:00";
            if (t.includes(" ")) return t.split(" ")[1].substring(0, 5);
            return t.substring(0, 5);
          };
          setSchedule({
            timescale: s.timescale || 20,
            daytimestart: formatTime(s.daytimestart),
            daytimeend: formatTime(s.daytimeend),
            weekbeginday: s.weekbeginday ?? 0,
            workingdays: s.workingdays || "1,2,3,4,5",
            isregistered: Boolean(s.isregistered)
          });
        }

        if (Array.isArray(res.off_hours)) {
          setOffHours(res.off_hours);
        }
      } else {
        setClinic(null);
      }
    } catch (e) {
      showToast?.(e.message || "حدث خطأ أثناء تحميل بيانات العيادة", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinic();
    api.wilayas?.().then(w => setWilayasList(w || [])).catch(() => {});
  }, []);

  const handleWilayaChange = async (wilayaId) => {
    setForm(p => ({ ...p, wilaya_id: wilayaId, baladiya_id: "" }));
    if (wilayaId && api.baladiyas) {
      setLoadingBaladiyas(true);
      try {
        const b = await api.baladiyas(wilayaId);
        setBaladiyasList(b || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBaladiyas(false);
      }
    } else {
      setBaladiyasList([]);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast?.(isRtl ? "المتصفح لا يدعم تحديد الموقع الجغرافي" : "Géolocalisation non supportée", "error");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6))
        }));
        setDetectingGps(false);
        showToast?.(isRtl ? "تم التقاط إحداثيات الموقع بنجاح" : "Position GPS détectée avec succès", "success");
      },
      (err) => {
        setDetectingGps(false);
        showToast?.(err.message || (isRtl ? "تعذر تحديد الموقع الجغرافي" : "Erreur de géolocalisation"), "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast?.(isRtl ? "يرجى اختيار ملف صورة صالح" : "Veuillez choisir une image valide", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast?.(isRtl ? "حجم الصورة يجب ألا يتجاوز 2 ميجابايت" : "L'image ne doit pas dépasser 2 Mo", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm(f => ({ ...f, logo: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Create Clinic Submit
  const handleCreateClinic = async (e) => {
    e?.preventDefault();
    if (!form.clinicname.trim() || !form.phone.trim() || !form.address.trim()) {
      showToast?.(isRtl ? "يرجى ملء جميع الحقول المطلوبة (اسم العيادة، الهاتف، والعنوان)" : "Veuillez remplir les champs obligatoires", "error");
      return;
    }

    setSaving(true);
    try {
      await api.doctors.createClinic(form);
      showToast?.(isRtl ? "تم تفعيل عيادتك بنجاح وأصبحت جاهزة لاستقبال المرضى وحجز المواعيد" : "Votre clinique est activée avec succès", "success");
      await loadClinic();
    } catch (err) {
      showToast?.(err.message || "حدث خطأ أثناء إنشاء العيادة", "error");
    } finally {
      setSaving(false);
    }
  };

  // Update Clinic Info Submit
  const handleUpdateClinicInfo = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await api.doctors.updateMyClinic(form);
      showToast?.(isRtl ? "تم تحديث بيانات العيادة بنجاح" : "Données de la clinique mises à jour", "success");
      await loadClinic();
    } catch (err) {
      showToast?.(err.message || "حدث خطأ أثناء تحديث بيانات العيادة", "error");
    } finally {
      setSaving(false);
    }
  };

  // Update Schedule & Off-hours
  const handleUpdateSettings = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await api.doctors.updateClinicSettings({
        appointment_settings: schedule,
        off_hours: offHours
      });
      showToast?.(isRtl ? "تم حفظ أوقات العمل والعطل بنجاح" : "Horaires et congés enregistrés", "success");
      await loadClinic();
    } catch (err) {
      showToast?.(err.message || "حدث خطأ أثناء حفظ الإعدادات", "error");
    } finally {
      setSaving(false);
    }
  };

  const addOffHour = () => {
    if (!newOffHour.timebegin || !newOffHour.timeend) {
      showToast?.(isRtl ? "يرجى تحديد وقت البداية والنهاية" : "Veuillez définir les heures", "error");
      return;
    }
    setOffHours(prev => [...prev, { ...newOffHour, id: 'temp_' + Date.now() }]);
    setNewOffHour({ day: 0, timebegin: "12:00", timeend: "13:00" });
  };

  const removeOffHour = (index) => {
    setOffHours(prev => prev.filter((_, i) => i !== index));
  };

  const toggleDay = (dayIndex) => {
    const days = (schedule.workingdays || "").split(",").filter(Boolean).map(Number);
    let nextDays;
    if (days.includes(dayIndex)) {
      nextDays = days.filter(d => d !== dayIndex);
    } else {
      nextDays = [...days, dayIndex].sort((a, b) => a - b);
    }
    setSchedule(s => ({ ...s, workingdays: nextDays.join(",") }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <Spinner size={36} color="var(--brand)" />
        <p style={{ marginTop: 12, color: "var(--text-secondary)", fontSize: 14 }}>
          {isRtl ? "جاري تحميل بيانات العيادة..." : "Chargement des données de la clinique..."}
        </p>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // VIEW 1: NO CLINIC YET -> CREATE CLINIC FORM
  // ──────────────────────────────────────────────────────────
  if (!clinic) {
    return (
      <div style={{ maxWidth: 840, margin: "0 auto", padding: isMobile ? 12 : 24 }}>
        <Card style={{ padding: isMobile ? 20 : 36, borderRadius: 20 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: "linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(2, 132, 199, 0.25))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--brand)"
            }}>
              <Building2 size={36} />
            </div>
            <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: "var(--heading-color)", margin: "0 0 8px" }}>
              {isRtl ? "أنشئ عيادتك الطبية الخاصة" : "Créez votre propre clinique"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>
              {isRtl
                ? "بصفتك طبيباً معتمداً على منصة طبيبي، يمكنك إنشاء عيادتك وإدارتها والتحكم في مواعيدها مباشرة من هذا الحساب دون الحاجة لإنشاء حسابات أخرى."
                : "En tant que praticien sur Tabibi, créez et gérez votre clinique et vos rendez-vous directement depuis votre compte."}
            </p>
          </div>

          <form onSubmit={handleCreateClinic}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "اسم العيادة *" : "Nom de la clinique *"}
                </label>
                <Input
                  placeholder={isRtl ? "مثال: عيادة النور التخصصية" : "Ex: Clinique Ennour"}
                  value={form.clinicname}
                  onChange={e => setForm(f => ({ ...f, clinicname: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "رقم الهاتف المهني *" : "Téléphone professionnel *"}
                </label>
                <Input
                  placeholder="0550000000"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "الفاكس / الهاتف الثابت" : "Fixe / Fax"}
                </label>
                <Input
                  placeholder="033000000"
                  value={form.fax}
                  onChange={e => setForm(f => ({ ...f, fax: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "البريد الإلكتروني للعيادة" : "Email de la clinique"}
                </label>
                <Input
                  type="email"
                  placeholder="clinic@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                {isRtl ? "العنوان بالتفصيل *" : "Adresse complète *"}
              </label>
              <Input
                placeholder={isRtl ? "حي السلام، عمارة 04، الطابق الأول" : "Cité Es-Salam, Bâtiment 04"}
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                required
              />
            </div>

            {/* GPS coordinates */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--heading-color)", display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={16} color="var(--brand)" /> {isRtl ? "الموقع الجغرافي للعيادة (GPS)" : "Position GPS"}
                </span>
                <Btn
                  type="button"
                  variant="secondary"
                  onClick={detectLocation}
                  loading={detectingGps}
                  style={{ padding: "6px 14px", fontSize: 12 }}
                >
                  <Navigation size={14} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                  {isRtl ? "تحديد موقعي الآن" : "Détecter ma position"}
                </Btn>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Latitude</span>
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude || ""}
                    onChange={e => setForm(f => ({ ...f, latitude: parseFloat(e.target.value) || 0 }))}
                    placeholder="36.7525"
                  />
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Longitude</span>
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude || ""}
                    onChange={e => setForm(f => ({ ...f, longitude: parseFloat(e.target.value) || 0 }))}
                    placeholder="3.0420"
                  />
                </div>
              </div>
            </div>

            {/* Services & About */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                {isRtl ? "الخدمات الطبية المتوفرة" : "Services médicaux disponibles"}
              </label>
              <Input
                placeholder={isRtl ? "مثال: تخطيط قلب، فحص دوري، تصوير إيكو، تحاليل سريعة" : "Ex: ECG, Échographie, Bilan"}
                value={form.services}
                onChange={e => setForm(f => ({ ...f, services: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                {isRtl ? "نبذة تعريفية عن العيادة" : "À propos de la clinique"}
              </label>
              <textarea
                rows={3}
                value={form.aboutclinic}
                onChange={e => setForm(f => ({ ...f, aboutclinic: e.target.value }))}
                placeholder={isRtl ? "اكتب نبذة موجزة توضح تخصصات العيادة، مواعيد العمل، والأجهزة المتوفرة..." : "Présentation de la clinique..."}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid var(--border)",
                  background: "var(--card-bg)",
                  color: "var(--heading-color)",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Logo */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 8 }}>
                {isRtl ? "شعار العيادة (اختياري)" : "Logo de la clinique (optionnel)"}
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {form.logo ? (
                  <div style={{ position: "relative", width: 70, height: 70, borderRadius: 16, overflow: "hidden", border: "2px solid var(--border)" }}>
                    <img src={form.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, logo: "" }))}
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        background: "rgba(239, 68, 68, 0.9)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1.5px dashed var(--border)",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "var(--text-secondary)"
                  }}>
                    <Upload size={16} />
                    {isRtl ? "اختر صورة الشعار" : "Sélectionner un logo"}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            </div>

            <Btn type="submit" loading={saving} style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15, borderRadius: 12 }}>
              <Plus size={18} style={{ [isRtl ? "marginLeft" : "marginRight"]: 8 }} />
              {isRtl ? "إنشاء وتفعيل العيادة الآن" : "Créer et activer la clinique"}
            </Btn>
          </form>
        </Card>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // VIEW 2: CLINIC EXISTS -> MANAGE CLINIC (DETAILS, SCHEDULE, OFF-HOURS)
  // ──────────────────────────────────────────────────────────
  const isPending = clinic.status === "PENDING";
  const isApproved = clinic.status === "APPROVED";
  const isRejected = clinic.status === "REJECTED";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? 8 : 16 }}>
      {/* 1. Status Banner */}
      {isPending && (
        <div style={{
          background: "rgba(245, 158, 11, 0.1)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: 16,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 14,
          alignItems: "center"
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706", flexShrink: 0 }}>
            <Clock size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#b45309", marginBottom: 3 }}>
              {isRtl ? "العيادة قيد مراجعة الإدارة" : "Clinique en attente de validation"}
            </div>
            <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>
              {isRtl
                ? "تم استلام بيانات عيادتك وهي حالياً في انتظار الاعتماد من طرف الإدارة. يمكنك تعديل وتحديث بياناتها في أي وقت، وسيتم إشعارك فور تفعيلها لتظهر لجميع المرضى على المنصة."
                : "Votre clinique est en cours de révision par l'administration. Elle sera visible aux patients dès son approbation."}
            </div>
          </div>
        </div>
      )}

      {isApproved && (
        <div style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: 16,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 14,
          alignItems: "center"
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", flexShrink: 0 }}>
            <CheckCircle2 size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#065f46", marginBottom: 3 }}>
              {isRtl ? "العيادة معتمدة ومفعلة" : "Clinique approuvée et active"}
            </div>
            <div style={{ fontSize: 13, color: "#047857", lineHeight: 1.5 }}>
              {isRtl
                ? "عيادتك معتمدة وتظهر للمرضى في محرك البحث وتستقبل المواعيد. أي تعديلات تجريها هنا ستنعكس فورياً على الموقع وعلى برنامج Tabibi المكتبي عند المزامنة."
                : "Votre clinique est active et reçoit les rendez-vous. Les modifications sont synchronisées avec l'application Tabibi."}
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: 16,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 14,
          alignItems: "center"
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", flexShrink: 0 }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#991b1b", marginBottom: 3 }}>
              {isRtl ? "تم رفض اعتماد العيادة" : "Clinique refusée"}
            </div>
            <div style={{ fontSize: 13, color: "#b91c1c", lineHeight: 1.5 }}>
              {clinic.rejectedreason || (isRtl ? "يرجى التحقق من صحة البيانات وإعادة التحديث ليتم مراجعتها مجدداً." : "Veuillez vérifier vos données.")}
            </div>
          </div>
        </div>
      )}

      {/* 2. Sub-tabs Navigation */}
      <div style={{
        display: "flex",
        gap: 8,
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 6,
        marginBottom: 20,
        overflowX: "auto"
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab("info")}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            background: activeSubTab === "info" ? "var(--brand)" : "transparent",
            color: activeSubTab === "info" ? "#fff" : "var(--text-secondary)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s"
          }}
        >
          <Building2 size={16} />
          {isRtl ? "بيانات العيادة" : "Informations"}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("schedule")}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            background: activeSubTab === "schedule" ? "var(--brand)" : "transparent",
            color: activeSubTab === "schedule" ? "#fff" : "var(--text-secondary)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s"
          }}
        >
          <Clock size={16} />
          {isRtl ? "أوقات الدوام والمواعيد" : "Horaires & RDV"}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("off_hours")}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            background: activeSubTab === "off_hours" ? "var(--brand)" : "transparent",
            color: activeSubTab === "off_hours" ? "#fff" : "var(--text-secondary)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s"
          }}
        >
          <Calendar size={16} />
          {isRtl ? "أوقات الاستراحة والعطل" : "Pauses & Congés"}
        </button>
      </div>

      {/* 3. Sub-tab Content: CLINIC INFO */}
      {activeSubTab === "info" && (
        <Card style={{ padding: isMobile ? 18 : 28, borderRadius: 18 }}>
          <form onSubmit={handleUpdateClinicInfo}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "اسم العيادة" : "Nom de la clinique"}
                </label>
                <Input
                  value={form.clinicname}
                  onChange={e => setForm(f => ({ ...f, clinicname: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "الهاتف المهني" : "Téléphone professionnel"}
                </label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "الفاكس / الهاتف الثابت" : "Fixe / Fax"}
                </label>
                <Input
                  value={form.fax}
                  onChange={e => setForm(f => ({ ...f, fax: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "البريد الإلكتروني للعيادة" : "Email de la clinique"}
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                {isRtl ? "العنوان بالتفصيل" : "Adresse complète"}
              </label>
              <Input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                required
              />
            </div>

            {/* GPS coordinates */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--heading-color)", display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={16} color="var(--brand)" /> {isRtl ? "الموقع الجغرافي للعيادة (GPS)" : "Position GPS"}
                </span>
                <Btn
                  type="button"
                  variant="secondary"
                  onClick={detectLocation}
                  loading={detectingGps}
                  style={{ padding: "6px 14px", fontSize: 12 }}
                >
                  <Navigation size={14} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                  {isRtl ? "تحديث إحداثيات موقعي" : "Mettre à jour ma position"}
                </Btn>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Latitude</span>
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude || ""}
                    onChange={e => setForm(f => ({ ...f, latitude: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Longitude</span>
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude || ""}
                    onChange={e => setForm(f => ({ ...f, longitude: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                {isRtl ? "الخدمات الطبية المتوفرة" : "Services disponibles"}
              </label>
              <Input
                value={form.services}
                onChange={e => setForm(f => ({ ...f, services: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                {isRtl ? "نبذة تعريفية عن العيادة" : "À propos de la clinique"}
              </label>
              <textarea
                rows={3}
                value={form.aboutclinic}
                onChange={e => setForm(f => ({ ...f, aboutclinic: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid var(--border)",
                  background: "var(--card-bg)",
                  color: "var(--heading-color)",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Logo */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 8 }}>
                {isRtl ? "شعار العيادة" : "Logo de la clinique"}
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {form.logo ? (
                  <div style={{ position: "relative", width: 70, height: 70, borderRadius: 16, overflow: "hidden", border: "2px solid var(--border)" }}>
                    <img src={form.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, logo: "" }))}
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        background: "rgba(239, 68, 68, 0.9)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1.5px dashed var(--border)",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "var(--text-secondary)"
                  }}>
                    <Upload size={16} />
                    {isRtl ? "تغيير الشعار" : "Changer le logo"}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            </div>

            <Btn type="submit" loading={saving} style={{ padding: "12px 28px", fontSize: 15, borderRadius: 10 }}>
              <Save size={18} style={{ [isRtl ? "marginLeft" : "marginRight"]: 8 }} />
              {isRtl ? "حفظ تعديلات العيادة" : "Enregistrer les modifications"}
            </Btn>
          </form>
        </Card>
      )}

      {/* 4. Sub-tab Content: SCHEDULE */}
      {activeSubTab === "schedule" && (
        <Card style={{ padding: isMobile ? 18 : 28, borderRadius: 18 }}>
          <form onSubmit={handleUpdateSettings}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--heading-color)", margin: "0 0 6px" }}>
                {isRtl ? "أيام العمل الأسبوعية في هذه العيادة" : "Jours de travail dans cette clinique"}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 14px" }}>
                {isRtl ? "حدد الأيام التي تستقبل فيها المرضى في عيادتك:" : "Sélectionnez les jours d'ouverture:"}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {WEEK_DAYS.map(d => {
                  const days = (schedule.workingdays || "").split(",").filter(Boolean).map(Number);
                  const active = days.includes(d.index);
                  return (
                    <button
                      key={d.index}
                      type="button"
                      onClick={() => toggleDay(d.index)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 10,
                        border: active ? "1.5px solid var(--brand)" : "1.5px solid var(--border)",
                        background: active ? "var(--brand-light, rgba(14, 165, 233, 0.1))" : "var(--bg)",
                        color: active ? "var(--brand)" : "var(--text-secondary)",
                        fontWeight: active ? 800 : 600,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      {active && <CheckCircle2 size={14} />}
                      {isRtl ? d.labelAr : d.labelFr}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "وقت بدء العمل" : "Heure de début"}
                </label>
                <Input
                  type="time"
                  value={schedule.daytimestart}
                  onChange={e => setSchedule(s => ({ ...s, daytimestart: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                  {isRtl ? "وقت انتهاء العمل" : "Heure de fin"}
                </label>
                <Input
                  type="time"
                  value={schedule.daytimeend}
                  onChange={e => setSchedule(s => ({ ...s, daytimeend: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                {isRtl ? "مدة الموعد (بالدقائق)" : "Durée du rendez-vous (minutes)"}
              </label>
              <select
                value={schedule.timescale}
                onChange={e => setSchedule(s => ({ ...s, timescale: parseInt(e.target.value, 10) }))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid var(--border)",
                  background: "var(--card-bg)",
                  color: "var(--heading-color)",
                  fontSize: 14,
                  outline: "none"
                }}
              >
                <option value={10}>10 {isRtl ? "دقائق" : "minutes"}</option>
                <option value={15}>15 {isRtl ? "دقيقة" : "minutes"}</option>
                <option value={20}>20 {isRtl ? "دقيقة" : "minutes"}</option>
                <option value={30}>30 {isRtl ? "دقيقة" : "minutes"}</option>
                <option value={45}>45 {isRtl ? "دقيقة" : "minutes"}</option>
                <option value={60}>60 {isRtl ? "دقيقة (ساعة كاملة)" : "minutes"}</option>
              </select>
            </div>

            <Btn type="submit" loading={saving} style={{ padding: "12px 28px", fontSize: 15, borderRadius: 10 }}>
              <Save size={18} style={{ [isRtl ? "marginLeft" : "marginRight"]: 8 }} />
              {isRtl ? "حفظ أوقات العمل" : "Enregistrer les horaires"}
            </Btn>
          </form>
        </Card>
      )}

      {/* 5. Sub-tab Content: OFF-HOURS & BREAKS */}
      {activeSubTab === "off_hours" && (
        <Card style={{ padding: isMobile ? 18 : 28, borderRadius: 18 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--heading-color)", margin: "0 0 6px" }}>
              {isRtl ? "فترات الاستراحة والعطل الخاصة بهذه العيادة" : "Pauses et indisponibilités"}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
              {isRtl ? "حدد فترات الاستراحة اليومية (مثل استراحة الغداء) لعدم إتاحة الحجز خلالها:" : "Définissez vos temps de pause réguliers:"}
            </p>

            {/* Add Off-hour Bar */}
            <div style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 16,
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr auto",
              gap: 12,
              alignItems: "center",
              marginBottom: 20
            }}>
              <div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                  {isRtl ? "اليوم" : "Jour"}
                </span>
                <select
                  value={newOffHour.day}
                  onChange={e => setNewOffHour(o => ({ ...o, day: parseInt(e.target.value, 10) }))}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card-bg)",
                    color: "var(--heading-color)",
                    fontSize: 13
                  }}
                >
                  {WEEK_DAYS.map(d => (
                    <option key={d.index} value={d.index}>
                      {isRtl ? d.labelAr : d.labelFr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                  {isRtl ? "من الساعة" : "De"}
                </span>
                <Input
                  type="time"
                  value={newOffHour.timebegin}
                  onChange={e => setNewOffHour(o => ({ ...o, timebegin: e.target.value }))}
                />
              </div>

              <div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                  {isRtl ? "إلى الساعة" : "À"}
                </span>
                <Input
                  type="time"
                  value={newOffHour.timeend}
                  onChange={e => setNewOffHour(o => ({ ...o, timeend: e.target.value }))}
                />
              </div>

              <div style={{ alignSelf: "end" }}>
                <Btn type="button" onClick={addOffHour} style={{ padding: "10px 16px", fontSize: 13, height: 42 }}>
                  <Plus size={16} />
                  {isRtl ? "إضافة فترة" : "Ajouter"}
                </Btn>
              </div>
            </div>

            {/* Off-hours List */}
            {offHours.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: 13 }}>
                {isRtl ? "لا توجد فترات استراحة مضافة حتى الآن." : "Aucune période de pause définie."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {offHours.map((oh, index) => {
                  const dayObj = WEEK_DAYS.find(d => d.index === parseInt(oh.day, 10));
                  return (
                    <div
                      key={oh.id || index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 16px",
                        background: "var(--bg)",
                        borderRadius: 10,
                        border: "1px solid var(--border)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Clock size={16} color="var(--brand)" />
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--heading-color)" }}>
                          {isRtl ? dayObj?.labelAr : dayObj?.labelFr}:
                        </span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                          {oh.timebegin} ⟵ {oh.timeend}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOffHour(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: 4,
                          borderRadius: 6
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <Btn type="button" onClick={handleUpdateSettings} loading={saving} style={{ padding: "12px 28px", fontSize: 15, borderRadius: 10 }}>
              <Save size={18} style={{ [isRtl ? "marginLeft" : "marginRight"]: 8 }} />
              {isRtl ? "حفظ فترات الاستراحة" : "Enregistrer les pauses"}
            </Btn>
          </div>
        </Card>
      )}
    </div>
  );
}
