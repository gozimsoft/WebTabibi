// frontend/src/pages/PairDevice.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  Laptop, ShieldCheck, CheckCircle2, AlertCircle, 
  ArrowRight, ArrowLeft, RefreshCw, Building2, Check, Lock,
  QrCode, Camera, X, Upload, Unlink, Calendar, MapPin, ArrowDown
} from "lucide-react";
import jsQR from "jsqr";
import { Spinner, useToast } from "../components/SharedUI";

export default function PairDevicePage({ user, navigate, isMobile, api }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { show, Toast } = useToast();

  const urlParams = new URLSearchParams(window.location.search);
  const initialCode = urlParams.get("code") || "";
  const initialSession = urlParams.get("session") || "";

  const [code, setCode] = useState(initialCode);
  const [sessionId, setSessionId] = useState(initialSession);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [details, setDetails] = useState(null);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [clinicsList, setClinicsList] = useState([]);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Linked Clinics / Devices States
  const [linkedPairings, setLinkedPairings] = useState([]);
  const [loadingPairings, setLoadingPairings] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState(null);
  const [confirmUnlinkModal, setConfirmUnlinkModal] = useState(null);

  // QR Scanner States
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraFacing, setCameraFacing] = useState("environment");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const currentStreamRef = useRef(null);
  const animationFrameId = useRef(null);

  const token = localStorage.getItem("tabibi_token") || localStorage.getItem("token") || sessionStorage.getItem("token") || "";

  // Fetch doctor's currently linked devices & clinics from database
  const fetchLinkedPairings = async () => {
    if (!token || user?.user_type !== 1) return;
    setLoadingPairings(true);
    try {
      const res = await fetch("/api/sync/device/list", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.pairings)) {
        setLinkedPairings(json.data.pairings);
      }
    } catch (err) {
      console.error("Failed to fetch linked pairings:", err);
    } finally {
      setLoadingPairings(false);
    }
  };

  // Unlink / Disconnect a device from clinic
  const handleUnlink = async (pairing) => {
    if (!pairing?.id) return;
    setUnlinkingId(pairing.id);
    try {
      const res = await fetch("/api/sync/device/unlink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ pairing_id: pairing.id })
      });
      const json = await res.json();
      if (json.success) {
        show(t("pairing_unlinked_success", "تم فصل ارتباط العيادة بنجاح وإلغاء صلاحية المزامنة."), "success");
        setConfirmUnlinkModal(null);
        fetchLinkedPairings();
      } else {
        show(json.message || t("unlink_failed", "فشل فصل الارتباط، يرجى المحاولة مرة أخرى."), "error");
      }
    } catch (err) {
      show(t("network_error", "تعذر الاتصال بالخادم"), "error");
    } finally {
      setUnlinkingId(null);
    }
  };

  // Load doctor's active pairings on mount
  useEffect(() => {
    fetchLinkedPairings();
  }, [token, user]);

  // Load doctor's affiliated clinics (both owned and visiting)
  useEffect(() => {
    if (!token || user?.user_type !== 1) return;
    if (api?.doctor?.profile) {
      api.doctor.profile().then(res => {
        if (res?.data?.clinics && Array.isArray(res.data.clinics)) {
          const list = res.data.clinics.map(c => ({
            id: c.clinic_id || c.id,
            name: c.clinicname || c.name,
            is_owner: Boolean(c.is_owner)
          }));
          setClinicsList(list);
          if (list.length > 0) {
            setSelectedClinicId(prev => prev || list[0].id);
          }
        }
      }).catch(() => {});
    }
  }, [token, user]);

  // Fetch details if code is present
  useEffect(() => {
    if (!code || !token || user?.user_type !== 1) return;

    setLoadingDetails(true);
    setErrorMsg("");

    fetch(`/api/sync/device/details?code=${encodeURIComponent(code)}&session_id=${encodeURIComponent(sessionId)}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setDetails(json.data);
          if (json.data.clinics && Array.isArray(json.data.clinics) && json.data.clinics.length > 0) {
            setClinicsList(json.data.clinics);
            setSelectedClinicId(prev => prev || json.data.clinic_id || json.data.clinics[0].id);
          } else if (json.data.clinic_id) {
            setSelectedClinicId(prev => prev || json.data.clinic_id);
          }
        } else {
          setErrorMsg(json.message || t("pairing_code_invalid", "رمز الربط غير صالح أو انتهت صلاحيته"));
        }
      })
      .catch(err => {
        setErrorMsg(t("network_error", "تعذر الاتصال بالخادم"));
      })
      .finally(() => setLoadingDetails(false));
  }, [code, sessionId, token, user]);

  const handleApprove = async () => {
    if (!code.trim()) {
      show(t("code_required", "يرجى إدخال رمز الربط المكون من 6 أرقام"), "error");
      return;
    }

    setApproving(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/sync/device/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          code: code.trim(),
          session_id: sessionId,
          clinic_id: selectedClinicId || details?.clinic_id
        })
      });

      const json = await res.json();
      if (json.success) {
        setApproved(true);
        show(t("pairing_success_toast", "تمت الموافقة وربط جهاز العيادة بنجاح!"), "success");
        fetchLinkedPairings();
      } else {
        setErrorMsg(json.message || t("pairing_failed", "فشلت عملية الموافقة على الربط"));
        show(json.message || t("pairing_failed", "فشلت عملية الموافقة"), "error");
      }
    } catch (err) {
      setErrorMsg(t("network_error", "تعذر الاتصال بالخادم"));
    } finally {
      setApproving(false);
    }
  };

  // QR Scanning Handlers
  const handleScannedData = (raw) => {
    let foundCode = "";
    let foundSession = "";

    // 1. Try URL parsing
    if (raw.includes("code=")) {
      try {
        const parsedUrl = new URL(raw, window.location.origin);
        foundCode = parsedUrl.searchParams.get("code") || "";
        foundSession = parsedUrl.searchParams.get("session") || "";
      } catch (_) {
        const mCode = raw.match(/code=([0-9]{6})/);
        if (mCode) foundCode = mCode[1];
        const mSess = raw.match(/session=([a-zA-Z0-9_-]+)/);
        if (mSess) foundSession = mSess[1];
      }
    } else if (/^\d{6}$/.test(raw.trim())) {
      foundCode = raw.trim();
    } else {
      try {
        const json = JSON.parse(raw);
        if (json.code) foundCode = String(json.code);
        if (json.session || json.session_id) foundSession = String(json.session || json.session_id);
      } catch (_) {}
    }

    if (foundCode && foundCode.length === 6) {
      if (navigator.vibrate) {
        try { navigator.vibrate(100); } catch (_) {}
      }
      stopCamera();
      setCode(foundCode);
      if (foundSession) setSessionId(foundSession);
      show(t("qr_scanned_success", "تم مسح رمز QR بنجاح!"), "success");
    } else {
      show(t("invalid_qr_code", "رمز QR غير صالح لربط العيادة"), "error");
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });
        if (qr && qr.data) {
          handleScannedData(qr.data);
          return;
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // بدء تشغيل الكاميرا المباشرة لمسح رمز QR مع دعم متوافق لبيئة الأندرويد Capacitor
  const startCamera = async (facing = "environment") => {
    setCameraError("");
    setScannerOpen(true);
    setCameraLoading(true);
    try {
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(t => t.stop());
        currentStreamRef.current = null;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("MEDIA_DEVICES_NOT_SUPPORTED");
      }

      // محاولة فتح الكاميرا بالاتجاه المطلوب (الخلفية تلقائياً لمسح الرموز)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false
        });
      } catch (facingErr) {
        // بديل احتياطي في حال رفض قيد facingMode في بعض بيئات WebView للأندرويد
        console.warn("Facing constraint failed, falling back to simple video:", facingErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      currentStreamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.setAttribute("autoplay", "true");
          videoRef.current.muted = true;
          videoRef.current.play().then(() => {
            setCameraLoading(false);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = requestAnimationFrame(scanFrame);
          }).catch(err => {
            console.error("Video play error:", err);
            setCameraLoading(false);
          });
        }
      }, 120);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraLoading(false);
      setCameraError(t("camera_permission_denied", "تعذر فتح الكاميرا. يرجى التأكد من منح صلاحية الكاميرا للتطبيق في إعدادات الهاتف، أو رفع صورة QR مباشرة."));
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(t => t.stop());
      currentStreamRef.current = null;
    }
    setScannerOpen(false);
  };

  const toggleCameraFacing = () => {
    const next = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(next);
    startCamera(next);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(imageData.data, imageData.width, imageData.height);
        if (qr && qr.data) {
          handleScannedData(qr.data);
        } else {
          show(t("no_qr_found", "لم يتم العثور على رمز QR صالح في الصورة المحددة"), "error");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (currentStreamRef.current) currentStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Not logged in guard
  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 20px" }}>
        {Toast}
        <div style={{
          background: "var(--card-bg, #ffffff)",
          borderRadius: 20,
          padding: "36px 24px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
          border: "1px solid var(--border, #e2e8f0)"
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(8, 145, 178, 0.1)",
            color: "var(--brand, #0891b2)",
            display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            marginBottom: 20
          }}>
            <Laptop size={32} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 10px" }}>
            {t("pair_login_title", "ربط برنامج العيادة (Tabibi)")}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary, #64748b)", margin: "0 0 24px", lineHeight: 1.6 }}>
            {t("pair_login_desc", "يرجى تسجيل الدخول إلى حساب الطبيب الخاص بك على المنصة للموافقة على ربط جهاز الكمبيوتر.")}
          </p>
          <button
            type="button"
            onClick={() => navigate?.("/login?redirect=" + encodeURIComponent(window.location.pathname + window.location.search))}
            style={{
              width: "100%", padding: "14px",
              borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)",
              color: "#fff", fontWeight: 800, fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(8, 145, 178, 0.3)"
            }}
          >
            {t("login_to_continue", "تسجيل الدخول للمتابعة")}
          </button>
        </div>
      </div>
    );
  }

  // Not a doctor guard
  if (user.user_type !== 1) {
    return (
      <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 20px" }}>
        {Toast}
        <div style={{
          background: "var(--card-bg, #ffffff)",
          borderRadius: 20, padding: "36px 24px",
          textAlign: "center",
          border: "1px solid #fed7aa",
          boxShadow: "0 10px 25px rgba(0,0,0,0.04)"
        }}>
          <AlertCircle size={40} color="#d97706" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 10px" }}>
            {t("doctor_account_required", "حساب طبيب مطلوب")}
          </h3>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
            {t("doctor_account_required_desc", "عملية ربط العيادة تتطلب تسجيل الدخول بحساب طبيب ممارس.")}
          </p>
          <button
            type="button"
            onClick={() => navigate?.("/")}
            style={{
              padding: "10px 20px", borderRadius: 10,
              border: "1px solid #cbd5e1", background: "#fff",
              cursor: "pointer", fontWeight: 700
            }}
          >
            {t("return_home", "العودة للرئيسية")}
          </button>
        </div>
      </div>
    );
  }

  const isSelectedClinicPaired = linkedPairings.some(p => p.clinic_id === selectedClinicId && p.status === 'APPROVED');
  const activePairingForSelected = linkedPairings.find(p => p.clinic_id === selectedClinicId && p.status === 'APPROVED');

  const renderLinkedClinicsSection = () => (
    <div id="linked-clinics-section" style={{
      marginTop: 28,
      background: "var(--card-bg, #ffffff)",
      borderRadius: 24,
      padding: isMobile ? "24px 18px" : "30px 24px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      border: "1px solid var(--border, #e2e8f0)"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingBottom: 14,
        borderBottom: "1px solid #f1f5f9",
        flexWrap: "wrap",
        gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "#eff6ff", color: "#0284c7",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 900, color: "var(--heading-color, #0f172a)" }}>
              {t("linked_clinics_title", "الأماكن والعيادات المرتبط بها حالياً")}
            </h3>
            <span style={{ fontSize: 12, color: "var(--text-secondary, #64748b)" }}>
              {t("linked_clinics_subtitle", "قائمة بالعيادات المرتبطة ببرنامج العيادة المكتبي المصرح لها بالمزامنة")}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchLinkedPairings}
          disabled={loadingPairings}
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "7px 12px",
            cursor: "pointer",
            color: "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            transition: "all 0.15s ease"
          }}
        >
          <RefreshCw size={13} className={loadingPairings ? "animate-spin" : ""} />
          <span>{t("refresh", "تحديث")}</span>
        </button>
      </div>

      {/* Body: Loading / Empty / List */}
      {loadingPairings && linkedPairings.length === 0 ? (
        <div style={{ padding: "36px 16px", textAlign: "center", color: "#64748b" }}>
          <Spinner size={28} />
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 10 }}>
            {t("loading", "جارٍ التحميل...")}
          </div>
        </div>
      ) : linkedPairings.length === 0 ? (
        <div style={{
          padding: "36px 20px",
          textAlign: "center",
          background: "#f8fafc",
          borderRadius: 16,
          border: "1.5px dashed #cbd5e1"
        }}>
          <Laptop size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 14.5, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
            {t("no_linked_clinics", "لا توجد أجهزة أو عيادات مرتبطة حالياً.")}
          </div>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.6, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
            {t("no_linked_clinics_desc", "عند تأكيد عملية الربط من البرنامج المحلي، ستظهر العيادات والأجهزة المرتبطة هنا ويمكنك فصلها في أي وقت.")}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {linkedPairings.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1.5px solid #e2e8f0",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease"
              }}
            >
              {/* Header row */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "#ecfdf5", color: "#059669",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2
                  }}>
                    <Building2 size={18} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 14.5, fontWeight: 900, color: "#0f172a",
                      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"
                    }}>
                      <span>{item.clinic_name}</span>
                      <span style={{
                        padding: "2px 8px", borderRadius: 6,
                        background: "#dcfce7", color: "#15803d",
                        fontSize: 11, fontWeight: 800,
                        display: "inline-flex", alignItems: "center", gap: 4
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
                        {t("active_paired_status", "مرتبط ومفعّل")}
                      </span>
                      {item.is_owner ? (
                        <span style={{
                          padding: "2px 7px", borderRadius: 6,
                          background: "#e0f2fe", color: "#0369a1",
                          fontSize: 11, fontWeight: 800
                        }}>
                          {t("owner_clinic", "عيادتي - مالك")}
                        </span>
                      ) : (
                        <span style={{
                          padding: "2px 7px", borderRadius: 6,
                          background: "#f1f5f9", color: "#475569",
                          fontSize: 11, fontWeight: 700
                        }}>
                          {t("visiting_doctor", "طبيب ممارس")}
                        </span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div style={{
                      marginTop: 6,
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 12,
                      fontSize: 12,
                      color: "#64748b"
                    }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Laptop size={13} color="#0891b2" />
                        <span>{item.device_name || t("desktop_app_paired", "البرنامج المكتبي للعيادة")}</span>
                      </span>

                      {item.paired_at && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={13} color="#64748b" />
                          <span>
                            {t("paired_since", "تاريخ الربط")}: {new Date(item.paired_at).toLocaleDateString(isRtl ? "ar-EG" : "fr-FR", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </span>
                      )}

                      {item.wilaya && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={13} color="#64748b" />
                          <span>{item.wilaya} {item.address ? `— ${item.address}` : ""}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Unlink Action Button */}
                <button
                  type="button"
                  onClick={() => setConfirmUnlinkModal(item)}
                  disabled={unlinkingId === item.id}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 10,
                    border: "1px solid #fecdd3",
                    background: "#fff1f2",
                    color: "#e11d48",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#ffe4e6";
                    e.currentTarget.style.borderColor = "#fda4af";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#fff1f2";
                    e.currentTarget.style.borderColor = "#fecdd3";
                  }}
                >
                  <Unlink size={13} />
                  <span>{t("unlink_device_btn", "فصل الارتباط")}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUnlinkModal = () => {
    if (!confirmUnlinkModal) return null;
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(15, 23, 42, 0.72)",
        backdropFilter: "blur(6px)",
        zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16
      }}>
        <div style={{
          background: "var(--card-bg, #ffffff)",
          borderRadius: 22,
          maxWidth: 440,
          width: "100%",
          padding: "28px 24px",
          boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
          border: "1px solid var(--border, #e2e8f0)",
          textAlign: "center"
        }}>
          <div style={{
            width: 58, height: 58, borderRadius: "50%",
            background: "#fee2e2", color: "#dc2626",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16
          }}>
            <Unlink size={28} />
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: "0 0 10px" }}>
            {t("unlink_confirm_title", "تأكيد فصل الارتباط")}
          </h3>

          <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6, margin: "0 0 24px" }}>
            {t("unlink_confirm_desc", "هل أنت متأكد من رغبتك في فصل ارتباط هذا الجهاز بعيادة «{{name}}»؟ سيتوقف البرنامج المكتبي عن مزامنة المواعيد فورياً حتى تتم إعادة ربطه من جديد.", {
              name: confirmUnlinkModal.clinic_name
            })}
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              type="button"
              disabled={unlinkingId === confirmUnlinkModal.id}
              onClick={() => handleUnlink(confirmUnlinkModal)}
              style={{
                flex: 1, padding: "12px", borderRadius: 12,
                border: "none", background: "#dc2626", color: "#ffffff",
                fontWeight: 800, fontSize: 14, cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)"
              }}
            >
              {unlinkingId === confirmUnlinkModal.id ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{t("unlinking", "جارٍ فصل الارتباط...")}</span>
                </>
              ) : (
                <>
                  <Unlink size={16} />
                  <span>{t("confirm_unlink", "نعم، فصل الارتباط الآن")}</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={unlinkingId === confirmUnlinkModal.id}
              onClick={() => setConfirmUnlinkModal(null)}
              style={{
                padding: "12px 20px", borderRadius: 12,
                border: "1px solid #cbd5e1", background: "#f8fafc",
                color: "#475569", fontWeight: 700, fontSize: 14, cursor: "pointer"
              }}
            >
              {t("cancel", "إلغاء")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Success State
  if (approved) {
    return (
      <div style={{ maxWidth: 540, margin: "30px auto", padding: "0 16px" }}>
        {Toast}
        <div style={{
          background: "var(--card-bg, #ffffff)",
          borderRadius: 24, padding: isMobile ? "30px 20px" : "40px 24px",
          textAlign: "center",
          boxShadow: "0 12px 30px rgba(16, 185, 129, 0.12)",
          border: "1.5px solid #a7f3d0"
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#dcfce7", color: "#16a34a",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)"
          }}>
            <CheckCircle2 size={40} />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#065f46", margin: "0 0 10px" }}>
            {t("paired_success_title", "تم الربط بنجاح! 🎉")}
          </h2>

          <p style={{ fontSize: 14.5, color: "#334155", margin: "0 0 20px", lineHeight: 1.6 }}>
            {t("paired_success_desc", "تم اعتماد جهاز العيادة بنجاح. شاشة الكمبيوتر في العيادة مرتبطة الآن وجاهزة لمزامنة المواعيد وجدول العمل فورياً.")}
          </p>

          <div style={{
            padding: "12px", background: "#f0fdf4",
            borderRadius: 12, border: "1px solid #bbf7d0",
            marginBottom: 24, fontSize: 13, color: "#15803d", fontWeight: 700
          }}>
            {clinicsList.find(c => c.id === selectedClinicId)?.name || details?.clinic_name || user?.profile?.fullname || t("my_clinic", "عيادتك")}
          </div>

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate?.("/appointmanager")}
              style={{
                flex: 1, padding: "13px",
                borderRadius: 12, border: "none",
                background: "#16a34a", color: "#fff",
                fontWeight: 800, fontSize: 14.5, cursor: "pointer",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
              }}
            >
              {t("go_to_appointments", "الذهاب إلى جدول المواعيد")}
            </button>

            <button
              type="button"
              onClick={() => {
                setApproved(false);
                setCode("");
                setSessionId("");
                setDetails(null);
                fetchLinkedPairings();
              }}
              style={{
                padding: "13px 18px",
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                color: "#334155",
                fontWeight: 800, fontSize: 14, cursor: "pointer"
              }}
            >
              {t("pair_another_clinic", "ربط عيادة أخرى")}
            </button>
          </div>
        </div>

        {/* Linked Clinics Section */}
        {renderLinkedClinicsSection()}

        {/* Unlink Confirmation Modal */}
        {renderUnlinkModal()}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 540, margin: "30px auto", padding: "0 16px" }}>
      {Toast}

      <div style={{
        background: "var(--card-bg, #ffffff)",
        borderRadius: 24,
        padding: isMobile ? "28px 20px" : "36px 28px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        border: "1px solid var(--border, #e2e8f0)"
      }}>
        {/* Header Icon */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "rgba(8, 145, 178, 0.1)",
            color: "var(--brand, #0891b2)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 12
          }}>
            <Laptop size={30} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--heading-color, #0f172a)", margin: 0 }}>
            {t("pair_request_title", "طلب ربط برنامج العيادة")}
          </h2>
          <span style={{ fontSize: 13, color: "var(--text-secondary, #64748b)" }}>
            {t("tabibi_desktop_sync", "طبيبي — الربط المكتبي السريع")}
          </span>
        </div>

        {/* Doctor and Clinic Card */}
        <div style={{
          padding: "16px",
          borderRadius: 16,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          marginBottom: 20,
          display: "flex",
          alignItems: "flex-start",
          gap: 14
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#e0f2fe", color: "#0284c7",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <Building2 size={24} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 700, display: "block" }}>
              {t("target_doctor_clinic", "الطبيب والعيادة المصرح لها")}
            </span>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.profile?.fullname || user.username}
            </div>

            {clinicsList.length > 1 ? (
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0284c7", display: "block", marginBottom: 4 }}>
                  {t("choose_clinic_to_pair", "اختر مقر العيادة المطلوب ربط هذا الجهاز به:")}
                </label>
                <select
                  value={selectedClinicId}
                  onChange={e => setSelectedClinicId(e.target.value)}
                  style={{
                    width: "100%", padding: "7px 10px", borderRadius: 8,
                    border: isSelectedClinicPaired ? "1.5px solid #f59e0b" : "1.5px solid #0284c7", 
                    background: "#fff",
                    fontSize: 12.5, fontWeight: 700, color: "#0f172a",
                    cursor: "pointer"
                  }}
                >
                  {clinicsList.map(c => {
                    const isPaired = linkedPairings.some(p => p.clinic_id === c.id && p.status === 'APPROVED');
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.is_owner ? `(${t("owner_clinic", "عيادتي الخاصة - مالك")})` : `(${t("visiting_doctor", "طبيب ممارس")})`} {isPaired ? `⚠️ [${t("currently_paired", "مرتبط حالياً")}]` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: "#0d9488", fontWeight: 600, marginTop: 3 }}>
                {clinicsList[0]?.name || details?.clinic_name || t("main_clinic", "العيادة الرئيسية")}
                {clinicsList[0]?.is_owner ? ` (${t("owner_clinic", "مالك")})` : (clinicsList.length === 1 ? ` (${t("doctor_member", "طبيب ممارس")})` : "")}
                {isSelectedClinicPaired && (
                  <span style={{ display: "inline-block", marginInlineStart: 8, padding: "2px 8px", borderRadius: 6, background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 800 }}>
                    ⚠️ {t("currently_paired", "مرتبط حالياً")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* QR Scan Button */}
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => startCamera("environment")}
            style={{
              width: "100%",
              padding: "13px 18px",
              borderRadius: 14,
              border: "1.5px solid var(--brand, #0891b2)",
              background: "linear-gradient(135deg, rgba(8, 145, 178, 0.08), rgba(6, 182, 212, 0.15))",
              color: "var(--brand, #0891b2)",
              fontWeight: 800,
              fontSize: 14.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              boxShadow: "0 2px 8px rgba(8, 145, 178, 0.1)",
              transition: "all 0.2s ease"
            }}
          >
            <QrCode size={20} />
            <span>{t("scan_qr_code_btn", "مسح رمز QR بالكاميرا")}</span>
          </button>

          <div style={{
            display: "flex",
            alignItems: "center",
            margin: "16px 0 10px",
            color: "#94a3b8",
            fontSize: 12,
            fontWeight: 700
          }}>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            <span style={{ padding: "0 12px" }}>{t("or_enter_code_manually", "أو إدخال الرمز يدوياً")}</span>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          </div>
        </div>

        {/* 6-Digit Code Box */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "block", marginBottom: 8 }}>
            {t("pairing_code_label", "رمز الربط المعروض على شاشة الكمبيوتر:")}
          </label>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            direction: "ltr"
          }}>
            {(code || "------").split("").slice(0, 6).map((digit, idx) => (
              <span
                key={idx}
                style={{
                  width: 44, height: 50,
                  borderRadius: 12,
                  background: "#f1f5f9",
                  border: "2px solid #cbd5e1",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 900, color: "#0f172a",
                  letterSpacing: 0
                }}
              >
                {digit !== "-" ? digit : ""}
              </span>
            ))}
          </div>

          {!initialCode && (
            <div style={{ marginTop: 12 }}>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder={t("enter_6_digits", "أدخل الـ 6 أرقام")}
                style={{
                  textAlign: "center", width: "100%", maxWidth: 220,
                  padding: "10px", borderRadius: 10,
                  border: "1.5px solid var(--brand, #0891b2)",
                  fontSize: 16, fontWeight: 800, letterSpacing: 4
                }}
              />
            </div>
          )}
        </div>

        {/* Already Paired Warning Box */}
        {isSelectedClinicPaired && (
          <div style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "#fffbeb",
            border: "1.5px solid #fde68a",
            color: "#92400e",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 20,
            lineHeight: 1.55
          }}>
            <AlertCircle size={20} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: "#b45309", marginBottom: 3 }}>
                {t("already_paired_warning_title", "أنت مرتبط سابقاً بهذه العيادة")}
              </div>
              <div>
                {t("already_paired_warning_desc", "هذه العيادة مرتبطة بجهاز مكتبي نشط بالفعل منذ {{date}}. إذا كنت ترغب في ربط جهاز جديد لنفس العيادة، يمكنك فصل الارتباط القديم أولاً من القائمة أدناه.", {
                  date: activePairingForSelected?.paired_at ? new Date(activePairingForSelected.paired_at).toLocaleDateString(isRtl ? "ar-EG" : "fr-FR", { year: "numeric", month: "short", day: "numeric" }) : ""
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("linked-clinics-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  marginTop: 10,
                  background: "#d97706",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span>{t("go_to_linked_list", "الانتقال لقائمة العيادات المرتبطة")}</span>
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: "12px 14px", borderRadius: 12,
            background: "#fef2f2", border: "1px solid #fecaca",
            color: "#dc2626", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 20
          }}>
            <AlertCircle size={18} flexShrink={0} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleApprove}
          disabled={approving || !code || code.length !== 6 || isSelectedClinicPaired}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            border: "none",
            background: (code.length === 6 && !approving && !isSelectedClinicPaired)
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "#94a3b8",
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 800,
            cursor: (code.length === 6 && !approving && !isSelectedClinicPaired) ? "pointer" : "not-allowed",
            boxShadow: (code.length === 6 && !isSelectedClinicPaired) ? "0 4px 16px rgba(16, 185, 129, 0.35)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.2s ease"
          }}
        >
          {approving ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>{t("approving", "جارٍ تأكيد الربط...")}</span>
            </>
          ) : isSelectedClinicPaired ? (
            <>
              <AlertCircle size={20} />
              <span>{t("already_paired_btn", "العيادة مرتبطة بالفعل (افصل القديم أولاً)")}</span>
            </>
          ) : (
            <>
              <ShieldCheck size={20} />
              <span>{t("confirm_and_pair", "الموافقة وتأكيد الربط الآن")}</span>
            </>
          )}
        </button>

        <p style={{
          textAlign: "center", fontSize: 12,
          color: "#94a3b8", margin: "16px 0 0", lineHeight: 1.5
        }}>
          {t("pairing_security_note", "هذه العملية تمنح البرنامج المكتبي بالعيادة صلاحية مزامنة المواعيد وأوقات العمل.")}
        </p>
      </div>

      {/* Linked Clinics Section */}
      {renderLinkedClinicsSection()}

      {/* Unlink Confirmation Modal */}
      {renderUnlinkModal()}

      {/* QR Scanner Modal */}
      {scannerOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.82)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16
        }}>
          <div style={{
            background: "#0f172a",
            color: "#fff",
            borderRadius: 20,
            maxWidth: 440,
            width: "100%",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            position: "relative"
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
                <Camera size={18} color="#00d2df" />
                <span>{t("scan_clinic_qr", "مسح رمز QR للعيادة")}</span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: "pointer",
                  padding: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Viewfinder Area */}
            <div style={{ position: "relative", width: "100%", height: 320, background: "#000", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {cameraLoading && (
                <div style={{ position: "absolute", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <Spinner size={32} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{t("opening_camera", "جارٍ تشغيل الكاميرا...")}</span>
                </div>
              )}

              {cameraError && (
                <div style={{ position: "absolute", padding: 20, textAlign: "center", color: "#f87171", fontSize: 13, fontWeight: 600 }}>
                  <AlertCircle size={32} style={{ margin: "0 auto 8px" }} />
                  <p style={{ margin: "0 0 12px", lineHeight: 1.5 }}>{cameraError}</p>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => startCamera(cameraFacing)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "#0891b2", padding: "8px 14px", border: "none",
                        borderRadius: 8, cursor: "pointer", color: "#fff", fontSize: 12.5, fontWeight: 700
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>{t("retry", "إعادة المحاولة")}</span>
                    </button>
                    <label style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: "rgba(255,255,255,0.15)", padding: "8px 14px",
                      borderRadius: 8, cursor: "pointer", color: "#fff", fontSize: 12.5, fontWeight: 700
                    }}>
                      <Upload size={15} />
                      <span>{t("choose_qr_image", "اختيار صورة تحتوي على QR")}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>
              )}

              {/* Target Square Overlay */}
              {!cameraLoading && !cameraError && (
                <div style={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  border: "2.5px solid #00d2df",
                  borderRadius: 18,
                  boxShadow: "0 0 0 4000px rgba(0, 0, 0, 0.45)",
                  pointerEvents: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  <div style={{
                    width: "90%",
                    height: 2,
                    background: "#00d2df",
                    boxShadow: "0 0 10px #00d2df",
                    borderRadius: 2
                  }} />
                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#0a0f16",
              fontSize: 12.5
            }}>
              <label style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                color: "#94a3b8", cursor: "pointer", fontWeight: 700
              }}>
                <Upload size={15} />
                <span>{t("upload_qr_image", "رفع صورة QR")}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              </label>

              <button
                type="button"
                onClick={toggleCameraFacing}
                style={{
                  background: "none", border: "none",
                  color: "#00d2df", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  fontWeight: 700
                }}
              >
                <RefreshCw size={14} />
                <span>{t("switch_camera", "تبديل الكاميرا")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
