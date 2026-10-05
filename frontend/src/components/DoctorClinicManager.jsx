// src/components/DoctorClinicManager.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2, Laptop, MapPin, Phone, Mail, Globe, Clock,
  Calendar, CheckCircle2, AlertCircle, Save, Plus,
  Trash2, Upload, AlertTriangle, ShieldCheck, Stethoscope,
  Info, Sparkles, Navigation, CreditCard, ExternalLink,
  ChevronRight, ArrowRight, UserCheck, Layers, Eye,
  Users, UserPlus, Search, UserMinus, Check, X, Send, RefreshCw
} from "lucide-react";
import { Btn, Card, Spinner, Input, Badge } from "./SharedUI";

const WEEK_DAYS = [
  { index: 0, labelAr: "الإثنين", labelFr: "Lundi" },
  { index: 1, labelAr: "الثلاثاء", labelFr: "Mardi" },
  { index: 2, labelAr: "الأربعاء", labelFr: "Mercredi" },
  { index: 3, labelAr: "الخميس", labelFr: "Jeudi" },
  { index: 4, labelAr: "الجمعة", labelFr: "Vendredi" },
  { index: 5, labelAr: "السبت", labelFr: "Samedi" },
  { index: 6, labelAr: "الأحد", labelFr: "Dimanche" },
];

export default function DoctorClinicManager({ api, doctor, showToast, isMobile, navigate }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [switchingClinic, setSwitchingClinic] = useState(false);
  const [clinicData, setClinicData] = useState(null);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sub-tabs: 'info' | 'pricing' | 'schedule' | 'reasons' | 'off_hours'
  const [activeSubTab, setActiveSubTab] = useState("pricing");

  // Wilayas & Baladiyas
  const [wilayasList, setWilayasList] = useState([]);
  const [baladiyasList, setBaladiyasList] = useState([]);
  const [loadingBaladiyas, setLoadingBaladiyas] = useState(false);

  // Form state for clinic info
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
    logo: "",
    pricing: ""
  });

  // Pricing State
  const [pricingInput, setPricingInput] = useState("");
  const [savingPricing, setSavingPricing] = useState(false);
  const [privateClinicDetails, setPrivateClinicDetails] = useState(null);

  // Schedule state
  const [schedule, setSchedule] = useState({
    timescale: 20,
    daytimestart: "08:00",
    daytimeend: "17:00",
    weekbeginday: 0,
    workingdays: "1,2,3,4,5",
    isregistered: true
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Off-hours state
  const [offHours, setOffHours] = useState([]);
  const [newOffHour, setNewOffHour] = useState({ day: 0, timebegin: "12:00", timeend: "13:00" });
  const [savingOffHours, setSavingOffHours] = useState(false);

  // Reasons state
  const [reasons, setReasons] = useState([]);
  const [standardReasons, setStandardReasons] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [newReason, setNewReason] = useState({
    reason_name: "",
    reason_time: 20,
    reason_color: 0,
    reason_id: null
  });
  const [addingReason, setAddingReason] = useState(false);
  const [deletingReasonId, setDeletingReasonId] = useState(null);

  const [savingInfo, setSavingInfo] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // ─── CLINIC DOCTORS & REQUESTS STATE (FOR PRIVATE CLINIC) ───
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [loadingClinicDoctors, setLoadingClinicDoctors] = useState(false);
  const [clinicRequests, setClinicRequests] = useState([]);
  const [loadingClinicRequests, setLoadingClinicRequests] = useState(false);

  // Search doctors to invite
  const [searchDoctorQuery, setSearchDoctorQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingDoctors, setSearchingDoctors] = useState(false);
  const [invitingDoctorId, setInvitingDoctorId] = useState(null);

  // Action states
  const [removingDoctorId, setRemovingDoctorId] = useState(null);
  const [respondingRequestId, setRespondingRequestId] = useState(null);
  const [requestsSubTab, setRequestsSubTab] = useState("incoming"); // 'incoming' | 'outgoing' | 'invite'

  const loadClinicDoctors = async (clinicId) => {
    if (!clinicId || !api.doctors?.getClinicDoctors) return;
    setLoadingClinicDoctors(true);
    try {
      const res = await api.doctors.getClinicDoctors(clinicId);
      setClinicDoctors(Array.isArray(res?.doctors) ? res.doctors : []);
    } catch (err) {
      console.error("Error loading clinic doctors:", err);
    } finally {
      setLoadingClinicDoctors(false);
    }
  };

  const loadClinicRequests = async (clinicId) => {
    if (!clinicId || !api.relations?.getRequests) return;
    setLoadingClinicRequests(true);
    try {
      const res = await api.relations.getRequests(clinicId);
      setClinicRequests(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading clinic requests:", err);
    } finally {
      setLoadingClinicRequests(false);
    }
  };

  const handleRemoveDoctor = async (doctorId, doctorName) => {
    if (!window.confirm(isRtl 
      ? `هل أنت متأكد من فك ارتباط وإزالة د. ${doctorName || ''} من طاقم عيادتك؟`
      : `Êtes-vous sûr de retirer Dr. ${doctorName || ''} de votre clinique ?`)) {
      return;
    }
    setRemovingDoctorId(doctorId);
    try {
      await api.doctors.removeDoctorFromClinic(selectedClinicId, doctorId);
      showToast?.(isRtl ? "تمت إزالة الطبيب من العيادة بنجاح" : "Médecin retiré avec succès", "success");
      await loadClinicDoctors(selectedClinicId);
    } catch (err) {
      showToast?.(err.message || (isRtl ? "فشل إزالة الطبيب" : "Erreur"), "error");
    } finally {
      setRemovingDoctorId(null);
    }
  };

  const handleSearchDoctors = async (query = "") => {
    if (!selectedClinicId || !api.doctors?.searchDoctorsForClinic) return;
    setSearchingDoctors(true);
    try {
      const res = await api.doctors.searchDoctorsForClinic(selectedClinicId, query);
      setSearchResults(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error searching doctors:", err);
    } finally {
      setSearchingDoctors(false);
    }
  };

  const handleInviteDoctor = async (targetDoctorId) => {
    if (!selectedClinicId || !targetDoctorId || !api.relations?.request) return;
    setInvitingDoctorId(targetDoctorId);
    try {
      await api.relations.request({
        clinic_id: selectedClinicId,
        target_id: targetDoctorId
      });
      showToast?.(isRtl ? "تم إرسال دعوة الانضمام إلى الطبيب بنجاح" : "Invitation envoyée avec succès", "success");
      await Promise.all([
        loadClinicRequests(selectedClinicId),
        handleSearchDoctors(searchDoctorQuery)
      ]);
    } catch (err) {
      showToast?.(err.message || (isRtl ? "فشل إرسال الدعوة" : "Erreur"), "error");
    } finally {
      setInvitingDoctorId(null);
    }
  };

  const handleRespondClinicRequest = async (requestId, action) => {
    if (!api.relations?.respond) return;
    setRespondingRequestId(requestId);
    try {
      await api.relations.respond(requestId, { action });
      showToast?.(
        action === "accept" || action === "accepted"
          ? (isRtl ? "تمت الموافقة على انضمام الطبيب للعيادة بنجاح" : "Demande acceptée")
          : (isRtl ? "تم رفض الطلب بنجاح" : "Demande refusée"),
        "success"
      );
      await Promise.all([
        loadClinicRequests(selectedClinicId),
        loadClinicDoctors(selectedClinicId)
      ]);
    } catch (err) {
      showToast?.(err.message || (isRtl ? "فشل تحديث حالة الطلب" : "Erreur"), "error");
    } finally {
      setRespondingRequestId(null);
    }
  };

  const pendingRequestsCount = useMemo(() => {
    return clinicRequests.filter(r => r.status === "PENDING" && (r.SenderType || "").toUpperCase() === "DOCTOR").length;
  }, [clinicRequests]);

  // Load clinic data (optionally for a specific clinic ID)
  const loadClinic = async (targetId = null, isSwitching = false) => {
    try {
      if (isSwitching) setSwitchingClinic(true);
      else setLoading(true);

      const res = await api.doctors.getMyClinic(targetId);
      if (res && (res.id || (Array.isArray(res.affiliated_clinics) && res.affiliated_clinics.length > 0))) {
        setClinicData(res);
        const activeId = res.id || targetId || (res.affiliated_clinics?.[0]?.id ?? null);
        setSelectedClinicId(activeId);

        // Populate Form
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
          latitude: res.latitude ? parseFloat(res.latitude) : 0,
          longitude: res.longitude ? parseFloat(res.longitude) : 0,
          services: res.services || "",
          aboutclinic: res.aboutclinic || "",
          emergency: Boolean(res.emergency),
          ambulances: Boolean(res.ambulances),
          hospitalization: Boolean(res.hospitalization),
          logo: res.logo ? (res.logo.startsWith("data:") ? res.logo : `data:image/jpeg;base64,${res.logo}`) : "",
          pricing: (res.pricing !== null && res.pricing !== undefined) ? res.pricing : ""
        });

        if (res.has_private_clinic && res.is_owner) {
          setPrivateClinicDetails({
            id: res.id,
            clinicname: res.clinicname,
            address: res.address
          });
        }

        // Load doctors and requests if this clinic is owned by doctor
        if (res.is_owner && activeId) {
          loadClinicDoctors(activeId);
          loadClinicRequests(activeId);
        } else {
          setActiveSubTab(prev => (prev === "doctors" || prev === "requests" ? "pricing" : prev));
        }

        // Set Pricing
        const activePrice = (res.pricing !== null && res.pricing !== undefined) ? res.pricing : "";
        setPricingInput(activePrice);

        // Schedule
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
        } else {
          setSchedule({
            timescale: 20,
            daytimestart: "08:00",
            daytimeend: "17:00",
            weekbeginday: 0,
            workingdays: "1,2,3,4,5",
            isregistered: true
          });
        }

        // Off-hours
        setOffHours(Array.isArray(res.off_hours) ? res.off_hours : []);

        // Reasons
        setReasons(Array.isArray(res.reasons) ? res.reasons : []);
      } else {
        setClinicData(res || null);
        setSelectedClinicId(null);
      }
    } catch (e) {
      showToast?.(e.message || (isRtl ? "حدث خطأ أثناء تحميل بيانات العيادة" : "Erreur de chargement"), "error");
    } finally {
      setLoading(false);
      setSwitchingClinic(false);
    }
  };

  useEffect(() => {
    loadClinic();
    api.wilayas?.().then(w => setWilayasList(w || [])).catch(() => {});
    if (doctor?.specialtie_id && api.reasons) {
      api.reasons(doctor.specialtie_id).then(r => setStandardReasons(r || [])).catch(() => {});
    }
  }, [doctor?.specialtie_id]);

  const handleSelectWorkplace = (clinicId) => {
    if (clinicId === selectedClinicId) return;
    loadClinic(clinicId, true);
  };

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

  // 1. Create Private Clinic Submit
  const handleCreateClinic = async (e) => {
    e?.preventDefault();
    if (!form.clinicname.trim() || !form.phone.trim() || !form.address.trim()) {
      showToast?.(isRtl ? "يرجى ملء جميع الحقول المطلوبة (اسم العيادة، الهاتف، والعنوان)" : "Veuillez remplir les champs obligatoires", "error");
      return;
    }

    setSavingInfo(true);
    try {
      await api.doctors.createClinic(form);
      showToast?.(isRtl ? "تم تفعيل عيادتك الخاصة بنجاح" : "Votre clinique a été créée avec succès", "success");
      setShowCreateModal(false);
      await loadClinic();
    } catch (err) {
      showToast?.(err.message || (isRtl ? "حدث خطأ أثناء إنشاء العيادة" : "Erreur"), "error");
    } finally {
      setSavingInfo(false);
    }
  };

  // 2. Update Clinic Info (For owned clinic)
  const handleUpdateClinicInfo = async (e) => {
    e?.preventDefault();
    setSavingInfo(true);
    try {
      await api.doctors.updateMyClinic(form);
      showToast?.(isRtl ? "تم حفظ بيانات وموقع العيادة بنجاح" : "Données de la clinique mises à jour", "success");
      await loadClinic(selectedClinicId);
    } catch (err) {
      showToast?.(err.message || (isRtl ? "حدث خطأ أثناء تحديث بيانات العيادة" : "Erreur"), "error");
    } finally {
      setSavingInfo(false);
    }
  };

  // 3. Save Active Clinic Pricing
  const handleSaveActivePricing = async (e) => {
    e?.preventDefault();
    if (!selectedClinicId) return;
    setSavingPricing(true);
    try {
      const parsed = (pricingInput !== "" && pricingInput !== null && pricingInput !== undefined)
        ? parseFloat(pricingInput)
        : null;
      await api.doctors.updateClinicPricing(selectedClinicId, parsed);
      showToast?.(isRtl ? "تم حفظ تسعيرة الكشف لهذا المقر بنجاح" : "Tarif enregistré avec succès", "success");
      await loadClinic(selectedClinicId);
    } catch (err) {
      showToast?.(err.message || (isRtl ? "فشل في حفظ التسعيرة" : "Erreur"), "error");
    } finally {
      setSavingPricing(false);
    }
  };



  // 4. Save Schedule (Working days, hours, timescale)
  const handleSaveSchedule = async (e) => {
    e?.preventDefault();
    if (!selectedClinicId) return;
    setSavingSchedule(true);
    try {
      await api.doctors.updateClinicSettings({
        clinic_id: selectedClinicId,
        appointment_settings: schedule,
        off_hours: offHours
      });
      showToast?.(isRtl ? "تم حفظ أوقات العمل والمواعيد لهذا المقر بنجاح" : "Horaires enregistrés avec succès", "success");
      await loadClinic(selectedClinicId);
    } catch (err) {
      showToast?.(err.message || (isRtl ? "حدث خطأ أثناء حفظ أوقات العمل" : "Erreur"), "error");
    } finally {
      setSavingSchedule(false);
    }
  };

  // 5. Add & Delete Consultation Reasons
  const handleAddReason = async (e) => {
    e?.preventDefault();
    if (!selectedClinicId) return;
    if (!newReason.reason_name.trim()) {
      showToast?.(isRtl ? "يرجى إدخال أو اختيار سبب الاستشارة" : "Veuillez entrer le motif", "error");
      return;
    }
    setAddingReason(true);
    try {
      await api.doctors.addReason({
        clinic_id: selectedClinicId,
        reason_name: newReason.reason_name.trim(),
        reason_time: parseInt(newReason.reason_time, 10) || 20,
        reason_color: parseInt(newReason.reason_color, 10) || 0,
        reason_id: newReason.reason_id || null
      });
      showToast?.(isRtl ? "تمت إضافة سبب الاستشارة بنجاح" : "Motif ajouté avec succès", "success");
      setNewReason({ reason_name: "", reason_time: 20, reason_color: 0, reason_id: null });
      await loadClinic(selectedClinicId);
    } catch (err) {
      showToast?.(err.message || (isRtl ? "فشل في إضافة سبب الاستشارة" : "Erreur"), "error");
    } finally {
      setAddingReason(false);
    }
  };

  const handleDeleteReason = async (reasonId) => {
    if (!window.confirm(isRtl ? "هل أنت متأكد من حذف سبب الاستشارة هذا؟" : "Confirmer la suppression ?")) return;
    setDeletingReasonId(reasonId);
    try {
      await api.doctors.deleteReason(reasonId);
      showToast?.(isRtl ? "تم حذف سبب الاستشارة بنجاح" : "Motif supprimé", "success");
      await loadClinic(selectedClinicId);
    } catch (err) {
      showToast?.(err.message || (isRtl ? "فشل في حذف سبب الاستشارة" : "Erreur"), "error");
    } finally {
      setDeletingReasonId(null);
    }
  };

  // 6. Off-hours
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

  const handleSaveOffHours = async () => {
    if (!selectedClinicId) return;
    setSavingOffHours(true);
    try {
      await api.doctors.updateClinicSettings({
        clinic_id: selectedClinicId,
        appointment_settings: schedule,
        off_hours: offHours
      });
      showToast?.(isRtl ? "تم حفظ فترات الاستراحة بنجاح" : "Pauses enregistrées", "success");
      await loadClinic(selectedClinicId);
    } catch (err) {
      showToast?.(err.message || (isRtl ? "حدث خطأ أثناء حفظ فترات الاستراحة" : "Erreur"), "error");
    } finally {
      setSavingOffHours(false);
    }
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
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <Spinner size={38} color="var(--brand)" />
        <p style={{ marginTop: 14, color: "var(--text-secondary)", fontSize: 15, fontWeight: 600 }}>
          {isRtl ? "جاري تحميل مقرات العمل وإعدادات المواعيد..." : "Chargement de vos lieux de travail..."}
        </p>
      </div>
    );
  }

  // Determine list of all workplaces available to this doctor
  const hasPrivateClinic = Boolean(clinicData?.has_private_clinic || privateClinicDetails);
  const privId = privateClinicDetails?.id || clinicData?.private_clinic_id;
  const privName = privateClinicDetails?.clinicname || (clinicData?.is_owner ? clinicData?.clinicname : (isRtl ? "عيادتي الطبية الخاصة" : "Ma clinique privée"));
  const privAddress = privateClinicDetails?.address || (clinicData?.is_owner ? clinicData?.address : "");

  const affiliatedList = Array.isArray(clinicData?.affiliated_clinics)
    ? clinicData.affiliated_clinics.filter(c => c.id !== privId && !c.is_owner)
    : [];

  // If doctor has neither a private clinic nor any affiliated clinics, show welcome view
  const hasNoWorkplaces = !hasPrivateClinic && affiliatedList.length === 0;

  if (hasNoWorkplaces || showCreateModal) {
    return (
      <div style={{ width: "100%", margin: "0 auto" }}>
        <Card style={{ padding: isMobile ? 20 : 36, borderRadius: 22, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: "linear-gradient(135deg, rgba(8, 145, 178, 0.15), rgba(12, 74, 110, 0.25))",
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
            <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 580, margin: "0 auto", lineHeight: 1.6 }}>
              {isRtl
                ? "بصفتك طبيباً معتمداً على المنصة، يمكنك إنشاء عيادتك الخاصة وتحديد موقعها الجغرافي (GPS) وتسعيرة الكشف وأوقات العمل واستقبال المواعيد مباشرة."
                : "Créez votre clinique privée, définissez ses coordonnées GPS, son tarif de consultation et ses horaires."}
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

            {/* Base Consultation Pricing */}
            <div style={{
              background: "linear-gradient(135deg, rgba(8, 145, 178, 0.06), rgba(12, 74, 110, 0.09))",
              border: "1.5px solid rgba(8, 145, 178, 0.25)",
              borderRadius: 14,
              padding: 16,
              marginBottom: 20
            }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                {isRtl ? "تسعيرة الكشف الأساسية في هذه العيادة (دج) *" : "Tarif de consultation de base (DA) *"}
              </label>
              <Input
                type="number"
                min="0"
                step="50"
                value={form.pricing}
                onChange={e => setForm(f => ({ ...f, pricing: e.target.value }))}
                placeholder={isRtl ? "مثال: 2500 دج" : "Ex: 2500 DA"}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                {isRtl ? "التسعيرة المعتمدة للكشف الطبي في عيادتك الخاصة بالدينار الجزائري وتظهر للمرضى عند الحجز." : "Tarif affiché aux patients lors de la réservation."}
              </span>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {showCreateModal && (
                <Btn
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, justifyContent: "center", padding: 14, fontSize: 15, borderRadius: 12 }}
                >
                  {isRtl ? "إلغاء والعودة" : "Annuler"}
                </Btn>
              )}
              <Btn
                type="submit"
                loading={savingInfo}
                style={{ flex: 2, justifyContent: "center", padding: 14, fontSize: 15, borderRadius: 12 }}
              >
                <Plus size={18} style={{ [isRtl ? "marginLeft" : "marginRight"]: 8 }} />
                {isRtl ? "إنشاء وتفعيل العيادة الآن" : "Créer et activer la clinique"}
              </Btn>
            </div>
          </form>

          {hasNoWorkplaces && (
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px dashed var(--border)", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                {isRtl ? "هل تعمل في عيادة أو مركز طبي موجود بالفعل وتريد الانضمام إليه؟" : "Vous travaillez déjà dans une clinique partenaire ?"}
              </p>
              <Btn
                variant="secondary"
                onClick={() => navigate?.("/requests")}
                style={{ padding: "8px 18px", fontSize: 13, borderRadius: 10 }}
              >
                <Stethoscope size={15} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                {isRtl ? "إرسال طلب انضمام لعيادة شريكة" : "Rejoindre une clinique"}
              </Btn>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Active Clinic Details
  const isOwner = Boolean(clinicData?.is_owner);
  const activeName = clinicData?.clinicname || (isRtl ? "مقر العمل المحدد" : "Lieu sélectionné");
  const isPending = clinicData?.status === "PENDING";
  const isApproved = clinicData?.status === "APPROVED";
  const isRejected = clinicData?.status === "REJECTED";

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      
      {/* ──────────────────────────────────────────────────────────
          WORKPLACE SELECTOR (محدد مقر العمل)
          ────────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--card-bg, #ffffff)",
        borderRadius: 20,
        border: "1.5px solid var(--border, #e2e8f0)",
        padding: isMobile ? 14 : 20,
        marginBottom: 20,
        boxShadow: "0 6px 20px rgba(0,0,0,0.03)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Building2 size={20} color="var(--brand)" />
              <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
                {isRtl ? "اختر مقر العمل للتحكم في إعداداته" : "Sélectionnez votre lieu d'exercice"}
              </h3>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
              {isRtl
                ? "حدد المقر الذي تريد ضبط تسعيرة الكشف فيه، وأوقات العمل، وأسباب الاستشارة، والموقع الجغرافي:"
                : "Choisissez le lieu pour régler vos tarifs, horaires et motifs de consultation :"}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {!hasPrivateClinic && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(8, 145, 178, 0.25)"
                }}
              >
                <Plus size={14} />
                {isRtl ? "إنشاء عيادتي الخاصة" : "Créer ma clinique"}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate?.("/requests")}
              style={{
                background: "var(--bg)",
                color: "var(--heading-color)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Stethoscope size={14} color="var(--brand)" />
              {isRtl ? "طلب انضمام لعيادة" : "Rejoindre une clinique"}
            </button>
          </div>
        </div>

        {/* Workplaces Carousel / Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12
        }}>
          {/* Private Clinic Card (if doctor has one) */}
          {hasPrivateClinic && privId && (
            <div
              onClick={() => handleSelectWorkplace(privId)}
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                cursor: "pointer",
                border: selectedClinicId === privId
                  ? "2px solid var(--brand, #0891b2)"
                  : "1.5px solid var(--border, #e2e8f0)",
                background: selectedClinicId === privId
                  ? "linear-gradient(135deg, rgba(8, 145, 178, 0.08), rgba(12, 74, 110, 0.03))"
                  : "var(--bg, #f8fafc)",
                transition: "all 0.2s",
                position: "relative"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{
                  background: "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 6
                }}>
                  {isRtl ? "عيادتي الخاصة (المالك)" : "Clinique Privée (Propriétaire)"}
                </span>
                {selectedClinicId === privId && (
                  <CheckCircle2 size={16} color="var(--brand)" />
                )}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--heading-color)", marginBottom: 4 }}>
                {privName}
              </div>
              {privAddress && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={11} /> {privAddress}
                </div>
              )}
            </div>
          )}

          {/* Affiliated Clinics Cards */}
          {affiliatedList.map(aff => {
            const isSelected = selectedClinicId === aff.id;
            return (
              <div
                key={aff.id}
                onClick={() => handleSelectWorkplace(aff.id)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  cursor: "pointer",
                  border: isSelected
                    ? "2px solid var(--brand, #0891b2)"
                    : "1.5px solid var(--border, #e2e8f0)",
                  background: isSelected
                    ? "linear-gradient(135deg, rgba(8, 145, 178, 0.08), rgba(12, 74, 110, 0.03))"
                    : "var(--bg, #f8fafc)",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{
                    background: "rgba(100, 116, 139, 0.15)",
                    color: "var(--heading-color)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 6
                  }}>
                    {isRtl ? "عيادة شريكة (ممارس)" : "Clinique partenaire"}
                  </span>
                  {isSelected && <CheckCircle2 size={16} color="var(--brand)" />}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--heading-color)", marginBottom: 4 }}>
                  {aff.clinicname}
                </div>
                {aff.address && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={11} /> {aff.address}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {switchingClinic && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <Spinner size={32} color="var(--brand)" />
          <p style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: 13 }}>
            {isRtl ? "جاري تحميل بيانات هذا المقر..." : "Chargement du lieu..."}
          </p>
        </div>
      )}

      {!switchingClinic && clinicData && (
        <>
          {/* Active Workplace Header & Approval Notice */}
          <div style={{
            background: "linear-gradient(135deg, rgba(8, 145, 178, 0.07), rgba(12, 74, 110, 0.12))",
            border: "1.5px solid rgba(8, 145, 178, 0.25)",
            borderRadius: 18,
            padding: "16px 22px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "var(--brand, #0891b2)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Building2 size={24} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
                    {activeName}
                  </h2>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: isOwner ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "rgba(100, 116, 139, 0.18)",
                    color: isOwner ? "#fff" : "var(--heading-color)"
                  }}>
                    {isOwner ? (isRtl ? "عيادتك الخاصة" : "Votre clinique") : (isRtl ? "عيادة شريكة" : "Clinique partenaire")}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={12} /> {clinicData.address || (isRtl ? "لا يوجد عنوان مدون" : "Adresse non spécifiée")}
                </div>
              </div>
            </div>

            {isOwner && (
              <div>
                {isPending && (
                  <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#b45309", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Clock size={14} /> {isRtl ? "قيد المراجعة" : "En attente"}
                  </span>
                )}
                {isApproved && (
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#065f46", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={14} /> {isRtl ? "معتمدة ونشطة" : "Active"}
                  </span>
                )}
                {isRejected && (
                  <span style={{ background: "rgba(239, 68, 68, 0.15)", color: "#dc2626", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={14} /> {isRtl ? "مرفوضة" : "Rejetée"}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────
              SUB-TABS FOR THIS SELECTED WORKPLACE
              ────────────────────────────────────────────────────────── */}
          <div style={{
            display: "flex",
            gap: 8,
            background: "var(--card-bg, #ffffff)",
            border: "1.5px solid var(--border, #e2e8f0)",
            borderRadius: 16,
            padding: 6,
            marginBottom: 20,
            overflowX: "auto"
          }}>
            {isOwner ? (
              <>

<button
                  type="button"
                  onClick={() => setActiveSubTab("info")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "info" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "info" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <Building2 size={16} />
                  {isRtl ? "معلومات العيادة والموقع" : "Infos & GPS"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab("doctors");
                    loadClinicDoctors(selectedClinicId);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "doctors" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "doctors" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <Users size={16} />
                  {isRtl ? "أطباء العيادة" : "Médecins"}
                  {clinicDoctors.length > 0 && (
                    <span style={{
                      background: activeSubTab === "doctors" ? "rgba(255,255,255,0.25)" : "rgba(8, 145, 178, 0.15)",
                      color: activeSubTab === "doctors" ? "#fff" : "var(--brand, #0891b2)",
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: 11,
                      fontWeight: 800
                    }}>
                      {clinicDoctors.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab("requests");
                    loadClinicRequests(selectedClinicId);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "requests" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "requests" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <UserPlus size={16} />
                  {isRtl ? "طلبات الانضمام" : "Demandes"}
                  {pendingRequestsCount > 0 && (
                    <span style={{
                      background: "#ef4444",
                      color: "#fff",
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: 11,
                      fontWeight: 800
                    }}>
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("pricing")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "pricing" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "pricing" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <CreditCard size={16} />
                  {isRtl ? "تسعيرة كشفي" : "Mon Tarif"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("schedule")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "schedule" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "schedule" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <Clock size={16} />
                  {isRtl ? "أوقات دوامي والمواعيد" : "Mes Horaires"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("reasons")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "reasons" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "reasons" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <Stethoscope size={16} />
                  {isRtl ? "أسباب استشارتي" : "Motifs"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("off_hours")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "off_hours" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "off_hours" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <Calendar size={16} />
                  {isRtl ? "الاستراحة والعطل" : "Pauses"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("pricing")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "pricing" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "pricing" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <CreditCard size={16} />
                  {isRtl ? "تسعيرة الكشف" : "Tarif de consultation"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("schedule")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "schedule" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "schedule" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <Clock size={16} />
                  {isRtl ? "أوقات العمل والمواعيد" : "Horaires & RDV"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("reasons")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "reasons" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "reasons" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <Stethoscope size={16} />
                  {isRtl ? "أسباب الاستشارة" : "Motifs de consultation"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("off_hours")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "off_hours" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "off_hours" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <Calendar size={16} />
                  {isRtl ? "أوقات الاستراحة والعطل" : "Pauses & Congés"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("info")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "info" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "info" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <Building2 size={16} />
                  {isRtl ? "معلومات العيادة" : "Infos de la clinique"}
                </button>
              </>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────
              TAB: CLINIC DOCTORS (طاقم أطباء العيادة - للمالك)
              ────────────────────────────────────────────────────────── */}
          {activeSubTab === "doctors" && isOwner && (
            <Card style={{ padding: isMobile ? 18 : 28, borderRadius: 18 }}>
              {/* Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: "1px solid var(--border)"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <Users size={22} color="var(--brand)" />
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
                      {isRtl ? `طاقم الأطباء الممارسين في ${activeName}` : `Médecins exerçant dans ${activeName}`}
                    </h3>
                    <span style={{
                      background: "linear-gradient(135deg, rgba(8, 145, 178, 0.15), rgba(12, 74, 110, 0.08))",
                      color: "var(--brand, #0891b2)",
                      padding: "2px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 800
                    }}>
                      {clinicDoctors.length} {isRtl ? "طبيب" : "médecin(s)"}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                    {isRtl
                      ? "إدارة الأطباء المنضمين لعيادتك الخاصة، متابعة تخصصاتهم، وفك الارتباط عند الحاجة:"
                      : "Gérez l'équipe médicale de votre clinique privée et visualisez leurs spécialités et tarifs :"}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubTab("requests");
                      setRequestsSubTab("invite");
                      handleSearchDoctors();
                    }}
                    style={{
                      background: "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "9px 16px",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      boxShadow: "0 2px 10px rgba(8, 145, 178, 0.25)"
                    }}
                  >
                    <UserPlus size={16} />
                    {isRtl ? "دعوة طبيب جديد" : "Inviter un médecin"}
                  </button>

                  <button
                    type="button"
                    onClick={() => loadClinicDoctors(selectedClinicId)}
                    disabled={loadingClinicDoctors}
                    style={{
                      background: "var(--bg)",
                      color: "var(--heading-color)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "9px 12px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                    title={isRtl ? "تحديث القائمة" : "Actualiser"}
                  >
                    {loadingClinicDoctors ? <Spinner size={14} color="var(--brand)" /> : <RefreshCw size={15} />}
                  </button>
                </div>
              </div>

              {/* Doctors List / Grid */}
              {loadingClinicDoctors ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <Spinner size={32} color="var(--brand)" />
                  <p style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: 13 }}>
                    {isRtl ? "جاري تحميل قائمة الأطباء..." : "Chargement des médecins..."}
                  </p>
                </div>
              ) : clinicDoctors.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  background: "var(--bg)",
                  borderRadius: 16,
                  border: "1.5px dashed var(--border)"
                }}>
                  <div style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "rgba(8, 145, 178, 0.1)",
                    color: "var(--brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px"
                  }}>
                    <Users size={26} />
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--heading-color)", margin: "0 0 6px" }}>
                    {isRtl ? "لا يوجد أطباء منضمون بعد" : "Aucun médecin partenaire pour le moment"}
                  </h4>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 440, margin: "0 auto 18px", lineHeight: 1.6 }}>
                    {isRtl
                      ? "أنت الطبيب الوحيد المسجل في هذه العيادة حالياً. يمكنك دعوة أطباء ممارسين لمشاركتك العمل واستقبال المرضى."
                      : "Vous êtes le seul médecin enregistré. Invitez des confrères pour collaborer au sein de votre clinique."}
                  </p>
                  <Btn
                    type="button"
                    onClick={() => {
                      setActiveSubTab("requests");
                      setRequestsSubTab("invite");
                      handleSearchDoctors();
                    }}
                    style={{ padding: "10px 22px", fontSize: 13, borderRadius: 10 }}
                  >
                    <UserPlus size={16} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                    {isRtl ? "البحث عن أطباء ودعوتهم الآن" : "Rechercher et inviter des médecins"}
                  </Btn>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(310px, 1fr))",
                  gap: 16
                }}>
                  {clinicDoctors.map((doc) => {
                    const isDocOwner = Boolean(doc.is_owner);
                    const isCurrentDoctor = String(doc.doctor_id) === String(doctor?.id);

                    return (
                      <div
                        key={doc.doctor_id || doc.relation_id}
                        style={{
                          background: "var(--bg)",
                          borderRadius: 16,
                          border: isDocOwner ? "2px solid rgba(8, 145, 178, 0.35)" : "1.5px solid var(--border)",
                          padding: 18,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: 14,
                          position: "relative",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{
                                width: 46,
                                height: 46,
                                borderRadius: "50%",
                                background: isDocOwner
                                  ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)"
                                  : "linear-gradient(135deg, #64748b, #475569)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                                fontWeight: 800,
                                flexShrink: 0
                              }}>
                                {doc.fullname ? doc.fullname.trim().charAt(0).toUpperCase() : "D"}
                              </div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 15, fontWeight: 900, color: "var(--heading-color)" }}>
                                    د. {doc.fullname}
                                  </span>
                                  {isCurrentDoctor && (
                                    <span style={{
                                      fontSize: 10,
                                      fontWeight: 800,
                                      padding: "1px 6px",
                                      borderRadius: 6,
                                      background: "rgba(16, 185, 129, 0.15)",
                                      color: "#059669"
                                    }}>
                                      {isRtl ? "أنت" : "Vous"}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--brand, #0891b2)", fontWeight: 700, marginTop: 2 }}>
                                  {doc.specialty_name || (isRtl ? "طبيب عام" : "Médecin Généraliste")}
                                </div>
                              </div>
                            </div>

                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 8,
                              background: isDocOwner ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "rgba(100, 116, 139, 0.12)",
                              color: isDocOwner ? "#fff" : "var(--text-secondary)",
                              flexShrink: 0
                            }}>
                              {isDocOwner ? (isRtl ? "المالك" : "Propriétaire") : (isRtl ? "طبيب شريك" : "Associé")}
                            </span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                            {doc.phone && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Phone size={13} color="var(--brand)" />
                                <span>{doc.phone}</span>
                              </div>
                            )}
                            {doc.email && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Mail size={13} color="var(--brand)" />
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.email}</span>
                              </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                              <CreditCard size={13} color="var(--brand)" />
                              <span style={{ fontWeight: 600 }}>
                                {isRtl ? "تسعيرة الكشف في العيادة:" : "Tarif dans la clinique :"}
                              </span>
                              <strong style={{ color: "var(--heading-color)" }}>
                                {doc.clinic_pricing ? `${doc.clinic_pricing} دج` : (doc.default_pricing ? `${doc.default_pricing} دج (افتراضي)` : (isRtl ? "غير محدد" : "Non défini"))}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{
                          paddingTop: 12,
                          borderTop: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            color: "#059669"
                          }}>
                            <CheckCircle2 size={13} />
                            {isRtl ? "ممارس نشط" : "Actif"}
                          </span>

                          {!isDocOwner && !isCurrentDoctor && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDoctor(doc.doctor_id, doc.fullname)}
                              disabled={removingDoctorId === doc.doctor_id}
                              style={{
                                background: "none",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#dc2626",
                                borderRadius: 8,
                                padding: "5px 12px",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                transition: "all 0.2s"
                              }}
                            >
                              {removingDoctorId === doc.doctor_id ? (
                                <Spinner size={12} color="#dc2626" />
                              ) : (
                                <UserMinus size={13} />
                              )}
                              {isRtl ? "فك الارتباط / إزالة" : "Retirer"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB: CLINIC JOIN REQUESTS (طلبات ودعوات الانضمام - للمالك)
              ────────────────────────────────────────────────────────── */}
          {activeSubTab === "requests" && isOwner && (
            <Card style={{ padding: isMobile ? 18 : 28, borderRadius: 18 }}>
              {/* Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid var(--border)"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <UserPlus size={22} color="var(--brand)" />
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
                      {isRtl ? `إدارة طلبات ودعوات الانضمام لـ ${activeName}` : `Demandes & Invitations pour ${activeName}`}
                    </h3>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                    {isRtl
                      ? "التحكم في الأطباء الراغبين في الانضمام لعيادتك والبحث عن أطباء وإرسال دعوات إليهم باسم العيادة:"
                      : "Acceptez les demandes de confrères ou envoyez des invitations au nom de la clinique :"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadClinicRequests(selectedClinicId)}
                  disabled={loadingClinicRequests}
                  style={{
                    background: "var(--bg)",
                    color: "var(--heading-color)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  {loadingClinicRequests ? <Spinner size={13} color="var(--brand)" /> : <RefreshCw size={14} />}
                  {isRtl ? "تحديث الطلبات" : "Actualiser"}
                </button>
              </div>

              {/* Secondary Sub-Tabs: Incoming | Outgoing | Search & Invite */}
              <div style={{
                display: "flex",
                gap: 8,
                marginBottom: 22,
                background: "var(--bg)",
                padding: 6,
                borderRadius: 12,
                border: "1px solid var(--border)"
              }}>
                <button
                  type="button"
                  onClick={() => setRequestsSubTab("incoming")}
                  style={{
                    flex: 1,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: requestsSubTab === "incoming" ? "var(--brand, #0891b2)" : "transparent",
                    color: requestsSubTab === "incoming" ? "#fff" : "var(--heading-color)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.2s"
                  }}
                >
                  <Users size={15} />
                  {isRtl ? "الطلبات الواردة" : "Demandes reçues"}
                  {pendingRequestsCount > 0 && (
                    <span style={{
                      background: requestsSubTab === "incoming" ? "#fff" : "#ef4444",
                      color: requestsSubTab === "incoming" ? "#ef4444" : "#fff",
                      borderRadius: 10,
                      padding: "1px 6px",
                      fontSize: 11,
                      fontWeight: 800
                    }}>
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRequestsSubTab("outgoing")}
                  style={{
                    flex: 1,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: requestsSubTab === "outgoing" ? "var(--brand, #0891b2)" : "transparent",
                    color: requestsSubTab === "outgoing" ? "#fff" : "var(--heading-color)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.2s"
                  }}
                >
                  <Send size={15} />
                  {isRtl ? "الدعوات الصادرة" : "Invitations envoyées"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequestsSubTab("invite");
                    if (searchResults.length === 0) {
                      handleSearchDoctors();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: requestsSubTab === "invite" ? "var(--brand, #0891b2)" : "transparent",
                    color: requestsSubTab === "invite" ? "#fff" : "var(--heading-color)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.2s"
                  }}
                >
                  <Search size={15} />
                  {isRtl ? "بحث ودعوة طبيب" : "Rechercher et inviter"}
                </button>
              </div>

              {/* CONTENT FOR SUB-TAB 1: INCOMING REQUESTS */}
              {requestsSubTab === "incoming" && (
                <div>
                  {loadingClinicRequests ? (
                    <div style={{ textAlign: "center", padding: "30px 10px" }}>
                      <Spinner size={28} color="var(--brand)" />
                    </div>
                  ) : (
                    (() => {
                      const incoming = clinicRequests.filter(r => (r.SenderType || "").toUpperCase() === "DOCTOR");
                      if (incoming.length === 0) {
                        return (
                          <div style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            background: "var(--bg)",
                            borderRadius: 14,
                            border: "1.5px dashed var(--border)"
                          }}>
                            <Users size={32} color="var(--text-muted)" style={{ margin: "0 auto 10px", display: "block" }} />
                            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--heading-color)", marginBottom: 4 }}>
                              {isRtl ? "لا توجد طلبات انضمام واردة حالياً" : "Aucune demande reçue"}
                            </div>
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                              {isRtl
                                ? "عندما يقدم أي طبيب طلباً للانضمام إلى عيادتك الخاصة، سيظهر هنا لتتمكن من قبوله أو رفضه."
                                : "Les demandes de confrères souhaitant rejoindre votre clinique apparaîtront ici."}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {incoming.map(req => {
                            const isPendingReq = req.status === "PENDING";
                            const isAcceptedReq = req.status === "ACCEPTED" || req.status === "APPROVED";
                            const isRejectedReq = req.status === "REJECTED";

                            return (
                              <div
                                key={req.id}
                                style={{
                                  padding: "16px 20px",
                                  background: "var(--bg)",
                                  borderRadius: 14,
                                  border: isPendingReq ? "1.5px solid rgba(8, 145, 178, 0.4)" : "1px solid var(--border)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: 14
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                  <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 16,
                                    fontWeight: 800
                                  }}>
                                    {req.targetname ? req.targetname.trim().charAt(0).toUpperCase() : "D"}
                                  </div>
                                  <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                      <span style={{ fontSize: 15, fontWeight: 900, color: "var(--heading-color)" }}>
                                        د. {req.targetname}
                                      </span>
                                      {isPendingReq && (
                                        <span style={{
                                          fontSize: 11,
                                          fontWeight: 800,
                                          padding: "2px 7px",
                                          borderRadius: 6,
                                          background: "rgba(245, 158, 11, 0.15)",
                                          color: "#b45309"
                                        }}>
                                          {isRtl ? "طلب جديد معلق" : "Nouveau"}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--brand)", fontWeight: 700, marginTop: 2 }}>
                                      {req.specialty_name || (isRtl ? "طبيب عام" : "Médecin Généraliste")}
                                    </div>
                                    {req.phone && (
                                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                                        <Phone size={11} /> {req.phone}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {isPendingReq ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleRespondClinicRequest(req.id, "accept")}
                                        disabled={respondingRequestId === req.id}
                                        style={{
                                          background: "#10b981",
                                          color: "#fff",
                                          border: "none",
                                          borderRadius: 10,
                                          padding: "8px 16px",
                                          fontSize: 13,
                                          fontWeight: 800,
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 6,
                                          boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)"
                                        }}
                                      >
                                        {respondingRequestId === req.id ? (
                                          <Spinner size={13} color="#fff" />
                                        ) : (
                                          <Check size={15} />
                                        )}
                                        {isRtl ? "قبول وانضمام" : "Accepter"}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleRespondClinicRequest(req.id, "reject")}
                                        disabled={respondingRequestId === req.id}
                                        style={{
                                          background: "transparent",
                                          color: "#ef4444",
                                          border: "1.5px solid rgba(239, 68, 68, 0.3)",
                                          borderRadius: 10,
                                          padding: "8px 14px",
                                          fontSize: 13,
                                          fontWeight: 700,
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 6
                                        }}
                                      >
                                        <X size={15} />
                                        {isRtl ? "رفض" : "Refuser"}
                                      </button>
                                    </>
                                  ) : isAcceptedReq ? (
                                    <span style={{
                                      padding: "6px 12px",
                                      borderRadius: 8,
                                      background: "rgba(16, 185, 129, 0.15)",
                                      color: "#059669",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5
                                    }}>
                                      <CheckCircle2 size={14} />
                                      {isRtl ? "تمت الموافقة وهو عضو الآن" : "Accepté"}
                                    </span>
                                  ) : isRejectedReq ? (
                                    <span style={{
                                      padding: "6px 12px",
                                      borderRadius: 8,
                                      background: "rgba(239, 68, 68, 0.12)",
                                      color: "#dc2626",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5
                                    }}>
                                      <X size={14} />
                                      {isRtl ? "تم الرفض" : "Refusé"}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* CONTENT FOR SUB-TAB 2: OUTGOING INVITATIONS */}
              {requestsSubTab === "outgoing" && (
                <div>
                  {loadingClinicRequests ? (
                    <div style={{ textAlign: "center", padding: "30px 10px" }}>
                      <Spinner size={28} color="var(--brand)" />
                    </div>
                  ) : (
                    (() => {
                      const outgoing = clinicRequests.filter(r => (r.SenderType || "").toUpperCase() === "CLINIC");
                      if (outgoing.length === 0) {
                        return (
                          <div style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            background: "var(--bg)",
                            borderRadius: 14,
                            border: "1.5px dashed var(--border)"
                          }}>
                            <Send size={32} color="var(--text-muted)" style={{ margin: "0 auto 10px", display: "block" }} />
                            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--heading-color)", marginBottom: 4 }}>
                              {isRtl ? "لم يتم إرسال أي دعوات بعد" : "Aucune invitation envoyée"}
                            </div>
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
                              {isRtl
                                ? "يمكنك البحث عن الأطباء المعتمدين في المنصة وإرسال دعوات انضمام رسمية إليهم لمشاركتك العيادة."
                                : "Recherchez des médecins sur la plateforme pour leur envoyer des invitations."}
                            </p>
                            <Btn
                              type="button"
                              onClick={() => {
                                setRequestsSubTab("invite");
                                handleSearchDoctors();
                              }}
                              style={{ padding: "8px 18px", fontSize: 12, borderRadius: 8 }}
                            >
                              <Search size={14} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                              {isRtl ? "البحث عن أطباء الآن" : "Rechercher des médecins"}
                            </Btn>
                          </div>
                        );
                      }

                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {outgoing.map(req => {
                            const isPendingReq = req.status === "PENDING";
                            const isAcceptedReq = req.status === "ACCEPTED" || req.status === "APPROVED";
                            const isRejectedReq = req.status === "REJECTED";

                            return (
                              <div
                                key={req.id}
                                style={{
                                  padding: "16px 20px",
                                  background: "var(--bg)",
                                  borderRadius: 14,
                                  border: "1px solid var(--border)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: 14
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                  <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 16,
                                    fontWeight: 800
                                  }}>
                                    {req.targetname ? req.targetname.trim().charAt(0).toUpperCase() : "D"}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: "var(--heading-color)" }}>
                                      د. {req.targetname}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--brand)", fontWeight: 700, marginTop: 2 }}>
                                      {req.specialty_name || (isRtl ? "طبيب عام" : "Médecin Généraliste")}
                                    </div>
                                    {req.phone && (
                                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                                        <Phone size={11} /> {req.phone}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {isPendingReq ? (
                                    <>
                                      <span style={{
                                        padding: "6px 12px",
                                        borderRadius: 8,
                                        background: "rgba(245, 158, 11, 0.15)",
                                        color: "#b45309",
                                        fontSize: 12,
                                        fontWeight: 800,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 5
                                      }}>
                                        <Clock size={13} />
                                        {isRtl ? "بانتظار موافقة الطبيب" : "En attente de réponse"}
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() => handleRespondClinicRequest(req.id, "reject")}
                                        disabled={respondingRequestId === req.id}
                                        style={{
                                          background: "none",
                                          border: "1px solid rgba(239, 68, 68, 0.3)",
                                          color: "#dc2626",
                                          borderRadius: 8,
                                          padding: "6px 12px",
                                          fontSize: 11,
                                          fontWeight: 700,
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4
                                        }}
                                      >
                                        <X size={13} />
                                        {isRtl ? "إلغاء الدعوة" : "Annuler"}
                                      </button>
                                    </>
                                  ) : isAcceptedReq ? (
                                    <span style={{
                                      padding: "6px 12px",
                                      borderRadius: 8,
                                      background: "rgba(16, 185, 129, 0.15)",
                                      color: "#059669",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5
                                    }}>
                                      <CheckCircle2 size={14} />
                                      {isRtl ? "وافق الطبيب وانضم للعيادة" : "Acceptée"}
                                    </span>
                                  ) : isRejectedReq ? (
                                    <span style={{
                                      padding: "6px 12px",
                                      borderRadius: 8,
                                      background: "rgba(239, 68, 68, 0.12)",
                                      color: "#dc2626",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5
                                    }}>
                                      <X size={14} />
                                      {isRtl ? "اعتذر الطبيب أو تم الإلغاء" : "Déclinée"}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* CONTENT FOR SUB-TAB 3: SEARCH & INVITE DOCTORS */}
              {requestsSubTab === "invite" && (
                <div>
                  {/* Search Bar */}
                  <div style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 20
                  }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <Search size={16} color="var(--text-muted)" style={{ position: "absolute", [isRtl ? "right" : "left"]: 12, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        type="text"
                        placeholder={isRtl ? "ابحث باسم الطبيب، التخصص، أو الهاتف..." : "Rechercher par nom, spécialité..."}
                        value={searchDoctorQuery}
                        onChange={e => setSearchDoctorQuery(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleSearchDoctors(searchDoctorQuery);
                        }}
                        style={{
                          width: "100%",
                          padding: isRtl ? "10px 38px 10px 14px" : "10px 14px 10px 38px",
                          borderRadius: 10,
                          border: "1.5px solid var(--border)",
                          background: "var(--card-bg)",
                          color: "var(--heading-color)",
                          fontSize: 14,
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSearchDoctors(searchDoctorQuery)}
                      disabled={searchingDoctors}
                      style={{
                        background: "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        padding: "0 20px",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      {searchingDoctors ? <Spinner size={14} color="#fff" /> : <Search size={15} />}
                      {isRtl ? "بحث" : "Rechercher"}
                    </button>
                  </div>

                  {/* Results */}
                  {searchingDoctors ? (
                    <div style={{ textAlign: "center", padding: "30px 10px" }}>
                      <Spinner size={28} color="var(--brand)" />
                      <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                        {isRtl ? "جاري البحث عن الأطباء المعتمدين..." : "Recherche en cours..."}
                      </p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      background: "var(--bg)",
                      borderRadius: 14,
                      border: "1.5px dashed var(--border)"
                    }}>
                      <Search size={32} color="var(--text-muted)" style={{ margin: "0 auto 10px", display: "block" }} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--heading-color)", marginBottom: 4 }}>
                        {isRtl ? "لم يتم العثور على أطباء مطابقين" : "Aucun médecin trouvé"}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                        {isRtl ? "جرب البحث باسم آخر أو إفراغ خانة البحث لعرض جميع الأطباء المتاحين." : "Essayez avec d'autres termes de recherche."}
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 14
                    }}>
                      {searchResults.map(doc => {
                        const isInviting = invitingDoctorId === doc.id;

                        return (
                          <div
                            key={doc.id}
                            style={{
                              background: "var(--bg)",
                              borderRadius: 14,
                              border: "1px solid var(--border)",
                              padding: 16,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              gap: 12
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 16,
                                fontWeight: 800,
                                flexShrink: 0
                              }}>
                                {doc.fullname ? doc.fullname.trim().charAt(0).toUpperCase() : "D"}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--heading-color)" }}>
                                  د. {doc.fullname}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--brand)", fontWeight: 700 }}>
                                  {doc.specialty_name || (isRtl ? "طبيب عام" : "Généraliste")}
                                </div>
                                {doc.phone && (
                                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                                    {doc.phone}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={{
                              paddingTop: 10,
                              borderTop: "1px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end"
                            }}>
                              {doc.is_member ? (
                                <span style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  padding: "4px 10px",
                                  borderRadius: 8,
                                  background: "rgba(16, 185, 129, 0.15)",
                                  color: "#059669",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4
                                }}>
                                  <CheckCircle2 size={12} />
                                  {isRtl ? "عضو بالعيادة" : "Déjà membre"}
                                </span>
                              ) : doc.is_pending ? (
                                <span style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  padding: "4px 10px",
                                  borderRadius: 8,
                                  background: "rgba(245, 158, 11, 0.15)",
                                  color: "#b45309",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4
                                }}>
                                  <Clock size={12} />
                                  {isRtl ? "دعوة معلقة" : "Invitation envoyée"}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleInviteDoctor(doc.id)}
                                  disabled={isInviting}
                                  style={{
                                    background: "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "7px 14px",
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    boxShadow: "0 2px 6px rgba(8, 145, 178, 0.2)"
                                  }}
                                >
                                  {isInviting ? (
                                    <Spinner size={12} color="#fff" />
                                  ) : (
                                    <Send size={13} />
                                  )}
                                  {isRtl ? "إرسال دعوة انضمام" : "Inviter à la clinique"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 1: PRICING (تسعيرة الكشف)
              ────────────────────────────────────────────────────────── */}
          {activeSubTab === "pricing" && (
            <Card style={{ padding: isMobile ? 18 : 28, borderRadius: 18 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <CreditCard size={22} color="var(--brand)" />
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
                    {isRtl ? `تسعيرة الكشف في ${activeName}` : `Tarif dans ${activeName}`}
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  {isRtl
                    ? "حدد السعر الذي تعتمده للكشف الطبي العام في هذا المقر بالدينار الجزائري. سيظهر هذا السعر لمرضاك أثناء اختيارهم لهذا المقر وحجز الموعد."
                    : "Fixez le tarif de consultation applicable par défaut aux rendez-vous dans ce lieu d'exercice."}
                </p>
              </div>

              <form onSubmit={handleSaveActivePricing} style={{ maxWidth: 420 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                    {isRtl ? "سعر الكشف الطبي (دج)" : "Tarif de consultation (DA)"}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    placeholder={isRtl ? "مثال: 2500 دج" : "Ex: 2500 DA"}
                    value={pricingInput}
                    onChange={e => setPricingInput(e.target.value)}
                  />
                </div>
                <Btn type="submit" loading={savingPricing} style={{ padding: "10px 24px", fontSize: 14, borderRadius: 10 }}>
                  <Save size={16} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                  {isRtl ? "حفظ التسعيرة لهذا المقر" : "Enregistrer le tarif"}
                </Btn>
              </form>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 2: SCHEDULE (أوقات الدوام والمواعيد)
              ────────────────────────────────────────────────────────── */}
          {activeSubTab === "schedule" && (
            <Card style={{ padding: isMobile ? 18 : 28, borderRadius: 18 }}>
              <form onSubmit={handleSaveSchedule}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Clock size={22} color="var(--brand)" />
                    <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
                      {isRtl ? `أيام وساعات العمل في ${activeName}` : `Horaires dans ${activeName}`}
                    </h3>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                    {isRtl ? "حدد الأيام وساعات العمل التي تستقبل فيها المرضى في هذا المقر تحديداً:" : "Sélectionnez vos jours et plages d'ouverture pour ce lieu :"}
                  </p>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 8 }}>
                    {isRtl ? "الأيام المتاحة للحجز:" : "Jours d'ouverture :"}
                  </label>
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
                            padding: "9px 16px",
                            borderRadius: 10,
                            border: active ? "1.5px solid var(--brand)" : "1.5px solid var(--border)",
                            background: active ? "rgba(8, 145, 178, 0.12)" : "var(--bg)",
                            color: active ? "var(--brand)" : "var(--text-secondary)",
                            fontWeight: active ? 800 : 600,
                            fontSize: 13,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "all 0.15s"
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

                <div style={{ marginBottom: 24, maxWidth: 360 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                    {isRtl ? "مدة الموعد لكل مريض" : "Durée par consultation"}
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

                <Btn type="submit" loading={savingSchedule} style={{ padding: "12px 28px", fontSize: 14, borderRadius: 10 }}>
                  <Save size={17} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                  {isRtl ? "حفظ أوقات العمل لهذا المقر" : "Enregistrer les horaires"}
                </Btn>
              </form>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 3: REASONS (أسباب الاستشارة)
              ────────────────────────────────────────────────────────── */}
          {activeSubTab === "reasons" && (
            <Card style={{ padding: isMobile ? 18 : 28, borderRadius: 18 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Stethoscope size={22} color="var(--brand)" />
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
                    {isRtl ? `أسباب ومبررات الاستشارة في ${activeName}` : `Motifs de consultation dans ${activeName}`}
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  {isRtl
                    ? "حدد أسباب الاستشارة المتاحة لمرضاك في هذا المقر (مثل: كشف عام، متابعة، فحص دوري، استشارة مستعجلة). لكل سبب مدته المحددة."
                    : "Gérez les motifs proposés aux patients pour les rendez-vous pris dans cette clinique."}
                </p>
              </div>

              {/* Add Reason Form */}
              <form onSubmit={handleAddReason} style={{
                background: "var(--bg)",
                border: "1.5px solid var(--border)",
                borderRadius: 14,
                padding: 16,
                marginBottom: 24
              }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--heading-color)", marginBottom: 12 }}>
                  {isRtl ? "إضافة سبب استشارة جديد لهذا المقر:" : "Ajouter un motif de consultation :"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr auto", gap: 12, alignItems: "end" }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 4 }}>
                      {isRtl ? "اسم سبب الاستشارة *" : "Nom du motif *"}
                    </label>
                    <Input
                      placeholder={isRtl ? "مثال: فحص دوري، متابعة علاج، تخطيط قلب" : "Ex: Consultation générale"}
                      value={newReason.reason_name}
                      onChange={e => setNewReason(r => ({ ...r, reason_name: e.target.value, reason_id: null }))}
                      required
                      containerStyle={{ marginBottom: 0 }}
                      style={{ height: 42 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 4 }}>
                      {isRtl ? "المدة المقدرة (بالدقائق)" : "Durée (min)"}
                    </label>
                    <select
                      value={newReason.reason_time}
                      onChange={e => setNewReason(r => ({ ...r, reason_time: parseInt(e.target.value, 10) }))}
                      style={{
                        width: "100%",
                        height: 42,
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid var(--border)",
                        background: "var(--card-bg)",
                        color: "var(--heading-color)",
                        fontSize: 13,
                        boxSizing: "border-box"
                      }}
                    >
                      <option value={10}>10 {isRtl ? "د" : "min"}</option>
                      <option value={15}>15 {isRtl ? "د" : "min"}</option>
                      <option value={20}>20 {isRtl ? "د" : "min"}</option>
                      <option value={30}>30 {isRtl ? "د" : "min"}</option>
                      <option value={45}>45 {isRtl ? "د" : "min"}</option>
                      <option value={60}>60 {isRtl ? "د" : "min"}</option>
                    </select>
                  </div>

                  <div>
                    <Btn type="submit" loading={addingReason} style={{ padding: "10px 18px", fontSize: 13, height: 42, display: "flex", alignItems: "center", gap: 6 }}>
                      <Plus size={16} />
                      {isRtl ? "إضافة" : "Ajouter"}
                    </Btn>
                  </div>
                </div>

                {/* Quick Suggestions from specialty */}
                {standardReasons.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {isRtl ? "أسباب شائعة للتخصص:" : "Suggestions :"}
                    </span>
                    {standardReasons.slice(0, 5).map(sr => (
                      <button
                        key={sr.id}
                        type="button"
                        onClick={() => setNewReason(r => ({
                          ...r,
                          reason_name: isRtl ? (sr.namear || sr.name) : (sr.namefr || sr.name),
                          reason_id: sr.id
                        }))}
                        style={{
                          background: "var(--card-bg)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          padding: "3px 9px",
                          fontSize: 11,
                          color: "var(--brand)",
                          cursor: "pointer",
                          fontWeight: 600
                        }}
                      >
                        + {isRtl ? (sr.namear || sr.name) : (sr.namefr || sr.name)}
                      </button>
                    ))}
                  </div>
                )}
              </form>

              {/* Reasons List */}
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--heading-color)", marginBottom: 12 }}>
                {isRtl ? `أسباب الاستشارة المعتمدة في هذا المقر (${reasons.length}):` : `Motifs configurés (${reasons.length}) :`}
              </div>

              {reasons.length === 0 ? (
                <div style={{ textAlign: "center", padding: "36px 12px", background: "var(--bg)", borderRadius: 12, color: "var(--text-muted)", fontSize: 13 }}>
                  <Stethoscope size={28} style={{ opacity: 0.4, margin: "0 auto 8px", display: "block" }} />
                  {isRtl ? "لم تقم بإضافة أسباب استشارة لهذا المقر بعد. أضف سبباً واحداً على الأقل ليتمكن المرضى من اختياره عند الحجز." : "Aucun motif défini pour ce lieu."}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                  {reasons.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "var(--bg)",
                        borderRadius: 12,
                        border: "1px solid var(--border)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)" }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--heading-color)" }}>
                            {r.reason_name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={11} /> {r.reason_time || 20} {isRtl ? "دقيقة" : "min"}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteReason(r.id)}
                        disabled={deletingReasonId === r.id}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: 6,
                          borderRadius: 6,
                          opacity: deletingReasonId === r.id ? 0.4 : 1
                        }}
                        title={isRtl ? "حذف" : "Supprimer"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 4: OFF-HOURS & BREAKS (أوقات الاستراحة والعطل)
              ────────────────────────────────────────────────────────── */}
          {activeSubTab === "off_hours" && (
            <Card style={{ padding: isMobile ? 18 : 28, borderRadius: 18 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Calendar size={22} color="var(--brand)" />
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
                    {isRtl ? `فترات الاستراحة والعطل في ${activeName}` : `Pauses et congés dans ${activeName}`}
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  {isRtl ? "حدد فترات الاستراحة اليومية المتكررة (مثل استراحة الغداء أو الصلاة) لإيقاف حجز المواعيد خلالها في هذا المقر:" : "Définissez les pauses durant lesquelles la prise de RDV est bloquée :"}
                </p>
              </div>

              {/* Add Off-hour Bar */}
              <form onSubmit={e => { e.preventDefault(); addOffHour(); }} style={{
                background: "var(--bg)",
                border: "1.5px solid var(--border)",
                borderRadius: 14,
                padding: 16,
                marginBottom: 24
              }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--heading-color)", marginBottom: 12 }}>
                  {isRtl ? "إضافة فترة استراحة جديدة لهذا المقر:" : "Ajouter une période de pause :"}
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr auto",
                  gap: 12,
                  alignItems: "end"
                }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 4 }}>
                      {isRtl ? "اليوم" : "Jour"}
                    </label>
                    <select
                      value={newOffHour.day}
                      onChange={e => setNewOffHour(o => ({ ...o, day: parseInt(e.target.value, 10) }))}
                      style={{
                        width: "100%",
                        height: 42,
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid var(--border)",
                        background: "var(--card-bg)",
                        color: "var(--heading-color)",
                        fontSize: 13,
                        boxSizing: "border-box"
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
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 4 }}>
                      {isRtl ? "من الساعة" : "De"}
                    </label>
                    <Input
                      type="time"
                      value={newOffHour.timebegin}
                      onChange={e => setNewOffHour(o => ({ ...o, timebegin: e.target.value }))}
                      containerStyle={{ marginBottom: 0 }}
                      style={{ height: 42 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--heading-color)", marginBottom: 4 }}>
                      {isRtl ? "إلى الساعة" : "À"}
                    </label>
                    <Input
                      type="time"
                      value={newOffHour.timeend}
                      onChange={e => setNewOffHour(o => ({ ...o, timeend: e.target.value }))}
                      containerStyle={{ marginBottom: 0 }}
                      style={{ height: 42 }}
                    />
                  </div>

                  <div>
                    <Btn type="submit" style={{ padding: "10px 18px", fontSize: 13, height: 42, display: "flex", alignItems: "center", gap: 6 }}>
                      <Plus size={16} />
                      {isRtl ? "إضافة" : "Ajouter"}
                    </Btn>
                  </div>
                </div>
              </form>

              {/* Off-hours List */}
              {offHours.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: 13, background: "var(--bg)", borderRadius: 12, marginBottom: 20 }}>
                  {isRtl ? "لا توجد فترات استراحة مضافة لهذا المقر." : "Aucune période de pause définie pour ce lieu."}
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

              <Btn type="button" onClick={handleSaveOffHours} loading={savingOffHours} style={{ padding: "12px 28px", fontSize: 14, borderRadius: 10 }}>
                <Save size={17} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                {isRtl ? "حفظ فترات الاستراحة لهذا المقر" : "Enregistrer les pauses"}
              </Btn>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 5: CLINIC INFO & GPS (بيانات المقر والموقع)
              ────────────────────────────────────────────────────────── */}
          {activeSubTab === "info" && (
            <Card style={{ padding: isMobile ? 18 : 28, borderRadius: 18 }}>
              {isOwner ? (
                /* Editable form for owned clinic */
                <form onSubmit={handleUpdateClinicInfo}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <Building2 size={22} color="var(--brand)" />
                      <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
                        {isRtl ? "تعديل بيانات وموقع عيادتك الخاصة (GPS)" : "Modifier les informations et GPS de votre clinique"}
                      </h3>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                      {isRtl ? "يمكنك تحديث بيانات الاتصال والعنوان وتحديد إحداثيات GPS بدقة:" : "Mettez à jour les coordonnées et la position GPS de votre clinique :"}
                    </p>
                  </div>

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

                  {/* GPS Coordinates & Interactive Map */}
                  <div style={{
                    background: "var(--bg)",
                    border: "1.5px solid var(--border)",
                    borderRadius: 14,
                    padding: 18,
                    marginBottom: 18
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--heading-color)", display: "flex", alignItems: "center", gap: 8 }}>
                        <MapPin size={18} color="var(--brand)" /> {isRtl ? "الإحداثيات الجغرافية وتحديد الموقع للعيادة (GPS)" : "Position GPS de la clinique"}
                      </span>
                      <Btn
                        type="button"
                        variant="secondary"
                        onClick={detectLocation}
                        loading={detectingGps}
                        style={{ padding: "7px 14px", fontSize: 12 }}
                      >
                        <Navigation size={14} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                        {isRtl ? "تحديث إحداثيات موقعي الآن" : "Détecter ma position"}
                      </Btn>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Latitude (خط العرض)</span>
                        <Input
                          type="number"
                          step="any"
                          value={form.latitude || ""}
                          onChange={e => setForm(f => ({ ...f, latitude: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Longitude (خط الطول)</span>
                        <Input
                          type="number"
                          step="any"
                          value={form.longitude || ""}
                          onChange={e => setForm(f => ({ ...f, longitude: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    {form.latitude && form.longitude ? (
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--card-bg)", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)" }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          📍 {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--brand)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            textDecoration: "none"
                          }}
                        >
                          <ExternalLink size={13} />
                          {isRtl ? "عرض الموقع على خرائط Google" : "Ouvrir dans Google Maps"}
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--heading-color)", marginBottom: 6 }}>
                      {isRtl ? "الخدمات الطبية المتوفرة" : "Services disponibles"}
                    </label>
                    <Input
                      value={form.services}
                      onChange={e => setForm(f => ({ ...f, services: e.target.value }))}
                      placeholder={isRtl ? "مثال: تخطيط قلب، فحص دوري، إيكو" : "Ex: ECG, Échographie"}
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

                  <Btn type="submit" loading={savingInfo} style={{ padding: "12px 28px", fontSize: 14, borderRadius: 10 }}>
                    <Save size={17} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
                    {isRtl ? "حفظ تعديلات العيادة والموقع" : "Enregistrer les modifications"}
                  </Btn>
                </form>
              ) : (
                /* Information display for affiliated clinic */
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <Building2 size={22} color="var(--brand)" />
                      <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--heading-color)", margin: 0 }}>
                        {isRtl ? `بيانات وموقع ${activeName}` : `Informations sur ${activeName}`}
                      </h3>
                    </div>
                    <div style={{
                      background: "rgba(8, 145, 178, 0.08)",
                      border: "1px solid rgba(8, 145, 178, 0.2)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "var(--heading-color)",
                      lineHeight: 1.6
                    }}>
                      ℹ️ {isRtl
                        ? "هذا المقر عبارة عن عيادة أو مركز طبي شريك أنت منضم إليه كطبيب ممارس. البيانات الأساسية للعيادة تُدار من طرف إدارتها، بينما يمكنك التحكم الكامل في تسعيرتك ومواعيدك وأسباب استشارتك الخاصة بهذا المقر."
                        : "Cette clinique partenaire est gérée par son administration. Vous pouvez configurer vos propres tarifs, horaires et motifs dans les onglets ci-dessus."}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 18 }}>
                    <div style={{ background: "var(--bg)", padding: 14, borderRadius: 12, border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>
                        {isRtl ? "العنوان:" : "Adresse :"}
                      </span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--heading-color)", display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={15} color="var(--brand)" />
                        {clinicData.address || (isRtl ? "غير محدد" : "Non spécifiée")}
                      </div>
                    </div>

                    <div style={{ background: "var(--bg)", padding: 14, borderRadius: 12, border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>
                        {isRtl ? "رقم الهاتف المهني:" : "Téléphone :"}
                      </span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--heading-color)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={15} color="var(--brand)" />
                        {clinicData.phone || (isRtl ? "غير محدد" : "Non spécifié")}
                      </div>
                    </div>
                  </div>

                  {/* GPS & Location Preview */}
                  <div style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: 18,
                    marginBottom: 16
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--heading-color)", display: "flex", alignItems: "center", gap: 8 }}>
                        <MapPin size={18} color="var(--brand)" /> {isRtl ? "الموقع الجغرافي للعيادة (GPS)" : "Position GPS"}
                      </span>
                      {clinicData.latitude && clinicData.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${clinicData.latitude},${clinicData.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--brand)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            textDecoration: "none"
                          }}
                        >
                          <ExternalLink size={13} />
                          {isRtl ? "فتح في خرائط Google" : "Google Maps"}
                        </a>
                      )}
                    </div>

                    {clinicData.latitude && clinicData.longitude ? (
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        📍 {isRtl ? `خط العرض: ${clinicData.latitude} | خط الطول: ${clinicData.longitude}` : `Lat: ${clinicData.latitude} | Lng: ${clinicData.longitude}`}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {isRtl ? "لم يتم تحديد إحداثيات GPS من قبل إدارة هذه العيادة بعد." : "Coordonnées GPS non renseignées par la clinique."}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
