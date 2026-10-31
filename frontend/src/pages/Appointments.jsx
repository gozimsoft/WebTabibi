// src/pages/Appointments.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { 
  Info, ChevronDown, ChevronUp, Calendar as CalendarIcon, Clock, 
  Stethoscope, Building, Search, Hash, Activity, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Sun, Moon, HelpCircle
} from "lucide-react";
import { Btn, Card, Spinner, ListSkeleton, DoctorImage, Badge, useToast } from "../components/SharedUI";
import GoogleCalendarButton from "../components/GoogleCalendarButton";

function LiveQueueTracker({ appointment, isAr }) {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = useCallback(async () => {
    const clinicId = appointment.clinic_id || appointment.clinicid;
    if (!clinicId) return;
    const dateStr = appointment.apointementdate ? appointment.apointementdate.slice(0, 10) : '';
    setLoading(true);
    try {
      const res = await api.appointments.getLiveQueueStatus({
        clinic_id: clinicId,
        date: dateStr,
        shift_type: appointment.shift_type || 'morning'
      });
      setLiveData(res);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Failed to fetch live queue status:", e);
    } finally {
      setLoading(false);
    }
  }, [appointment.clinic_id, appointment.clinicid, appointment.apointementdate, appointment.shift_type]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 20000); // Auto-refresh every 20 seconds
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const currentNum = liveData?.current_serving ? Number(liveData.current_serving.token_number) : null;
  const myNum = appointment.token_number ? Number(appointment.token_number) : null;
  const isMyTurn = (currentNum && myNum && currentNum === myNum) || appointment.queue_status === 'in_consultation';
  const remaining = currentNum && myNum && myNum > currentNum ? myNum - currentNum : null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      borderRadius: 16,
      padding: "18px 20px",
      border: "1.5px solid #c4b5fd",
      marginTop: 16,
      textAlign: isAr ? "right" : "left"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.25)",
            animation: "pulse 2s infinite"
          }} />
          <span style={{ fontWeight: 800, fontSize: 14, color: "#5b21b6", display: "flex", alignItems: "center", gap: 6 }}>
            <Activity size={16} />
            {isAr ? "متابعة الدور المباشر في العيادة" : "Suivi en direct de la file d'attente"}
          </span>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          style={{
            background: "#ffffff",
            border: "1px solid #ddd6fe",
            color: "#6d28d9",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <RefreshCw size={12} className={loading ? "spin-icon" : ""} />
          {loading ? (isAr ? "تحديث..." : "Actualisation...") : (isAr ? "تحديث الآن" : "Actualiser")}
        </button>
      </div>

      {/* Grid of Token Status */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: 12,
        marginBottom: 14
      }}>
        {/* Patient's Token */}
        <div style={{
          background: "#ffffff",
          borderRadius: 12,
          padding: "12px 14px",
          border: "2px solid #7c3aed",
          boxShadow: "0 2px 8px rgba(124, 58, 237, 0.08)"
        }}>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700 }}>
            {isAr ? "رقم تذكرتك" : "Votre Ticket"}
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#7c3aed", lineHeight: 1.1, marginTop: 4 }}>
            #{appointment.token_number}
          </div>
          <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, marginTop: 4 }}>
            {appointment.shift_type === 'evening' ? (isAr ? "فترة مسائية" : "Soir") : (isAr ? "فترة صباحية" : "Matin")}
          </div>
        </div>

        {/* Current Serving */}
        <div style={{
          background: "#ffffff",
          borderRadius: 12,
          padding: "12px 14px",
          border: "1.5px solid #e2e8f0"
        }}>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700 }}>
            {isAr ? "يُفحص حالياً" : "En consultation"}
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: currentNum ? "#059669" : "#94a3b8", lineHeight: 1.1, marginTop: 4 }}>
            {currentNum ? `#${currentNum}` : "—"}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginTop: 4 }}>
            {currentNum ? (isAr ? "داخل قاعة الكشف" : "Dans le cabinet") : (isAr ? "في الانتظار" : "En attente")}
          </div>
        </div>

        {/* Next Called */}
        <div style={{
          background: "#ffffff",
          borderRadius: 12,
          padding: "12px 14px",
          border: "1.5px solid #e2e8f0"
        }}>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700 }}>
            {isAr ? "الدور القادم" : "Suivant appelé"}
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: liveData?.next_waiting?.token_number ? "#2563eb" : "#94a3b8", lineHeight: 1.1, marginTop: 4 }}>
            {liveData?.next_waiting?.token_number ? `#${liveData.next_waiting.token_number}` : "—"}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginTop: 4 }}>
            {isAr ? "المريض التالي" : "Prochain patient"}
          </div>
        </div>
      </div>

      {/* Dynamic Status Notification Alert */}
      {isMyTurn ? (
        <div style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: 12,
          fontWeight: 800,
          fontSize: 13.5,
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
        }}>
          <Sparkles size={20} />
          <div>
            {isAr 
              ? "🎉 حان دورك الآن! يرجى التوجه فوراً والدخول إلى قاعة الكشف الطبي."
              : "🎉 C'est votre tour ! Veuillez vous diriger vers le cabinet de consultation."}
          </div>
        </div>
      ) : appointment.queue_status === 'completed' ? (
        <div style={{
          background: "#ecfdf5",
          color: "#065f46",
          padding: "10px 14px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          border: "1px solid #a7f3d0",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          {isAr ? "اكتملت استشارتك الطبية بنجاح. نتمنى لك دوام الصحة والعافية." : "Votre consultation est terminée avec succès."}
        </div>
      ) : appointment.queue_status === 'absent' ? (
        <div style={{
          background: "#fff1f2",
          color: "#9f1239",
          padding: "10px 14px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          border: "1px solid #fecdd3",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <AlertCircle size={16} />
          {isAr ? "تم تسجيل غياب لهذا الموعد. يرجى مراجعة موظف الاستقبال في العيادة." : "Absence signalée pour ce rendez-vous. Veuillez voir la réception."}
        </div>
      ) : remaining !== null && remaining > 0 ? (
        <div style={{
          background: "#ffffff",
          color: "#5b21b6",
          padding: "10px 14px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          border: "1px solid #ddd6fe",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} color="#7c3aed" />
            <span>
              {isAr ? (
                <>
                  باقي على دورك: <strong style={{ fontSize: 16, color: "#7c3aed" }}>{remaining}</strong> {remaining === 1 ? 'مريض' : remaining === 2 ? 'مريضان' : 'مرضى'}
                </>
              ) : (
                <>
                  Encore <strong style={{ fontSize: 16, color: "#7c3aed" }}>{remaining}</strong> patient(s) avant votre tour
                </>
              )}
            </span>
          </div>
          {appointment.estimated_time && (
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {isAr ? "الوقت التقديري:" : "Heure estimée :"} <strong style={{ color: "#0c4a6e" }}>{appointment.estimated_time.slice(0, 5)}</strong>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: "#ffffff",
          color: "#475569",
          padding: "10px 14px",
          borderRadius: 10,
          fontSize: 12.5,
          fontWeight: 600,
          border: "1px solid #e2e8f0"
        }}>
          {isAr
            ? "العيادة تستعد لاستقبال المرضى. يرجى التواجد بقاعة الانتظار ومتابعة التحديثات."
            : "Le cabinet se prépare. Veuillez patienter dans la salle d'attente."}
        </div>
      )}

      {/* Footer stats */}
      <div style={{
        marginTop: 10,
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11.5,
        color: "#6b7280",
        fontWeight: 600,
        flexWrap: "wrap",
        gap: 6
      }}>
        <div>
          {isAr ? "في الانتظار حالياً:" : "En attente :"} <strong>{liveData?.waiting_count || 0}</strong>
          {" • "}
          {isAr ? "تم فحصهم اليوم:" : "Consultés :"} <strong>{liveData?.completed_count || 0}</strong>
        </div>
        {lastUpdated && (
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            {isAr ? "آخر تحديث:" : "Mis à jour à :"} {lastUpdated.toLocaleTimeString(isAr ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppointmentsPage({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [appts, setAppts] = useState([]);
  const [loading, setL] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [expandedId, setExpandedId] = useState(null);
  const [activeTrackerId, setActiveTrackerId] = useState(null);
  const { show, Toast } = useToast();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  useEffect(() => {
    api.patient.appointments().then(data => {
      setAppts(data || []);
      // Automatically open live tracker for today's active queue appointment if any
      const todayQueueAppt = (data || []).find(a => 
        a.token_number && 
        a.apointementdate && 
        a.apointementdate.slice(0, 10) === todayStr &&
        a.status !== 2
      );
      if (todayQueueAppt) {
        setActiveTrackerId(todayQueueAppt.id);
      }
    }).catch(() => { }).finally(() => setL(false));
  }, [todayStr]);

  const cancel = async (id) => {
    const confirmMsg = t("cancel_confirm") || (isAr ? "هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟" : "Êtes-vous sûr de vouloir annuler ce rendez-vous ?");
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.appointments.cancel(id);
      setAppts(p => p.filter(a => a.id !== id));
      show(t("cancel_success") || (isAr ? "تم إلغاء الموعد بنجاح" : "Rendez-vous annulé avec succès"));
    } catch (e) {
      show(e.message || (isAr ? "فشل إلغاء الموعد" : "Échec de l'annulation"), "error");
    }
  };

  const filtered = appts.filter(a => {
    const d = new Date(a.apointementdate);
    if (filter === "upcoming") return d >= now;
    if (filter === "past") return d < now;
    return true;
  });

  const cnt = (f) => appts.filter(a => {
    const d = new Date(a.apointementdate);
    if (f === "upcoming") return d >= now;
    if (f === "past") return d < now;
    return true;
  }).length;

  return (
    <div className="tabibi-fullwidth-container" style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", margin: 0 }}>{t("appointments_title")}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/aide?article=retrouver-et-gerer-ses-rendez-vous")}
            style={{
              background: "rgba(0, 146, 162, 0.08)",
              border: "1px solid rgba(0, 146, 162, 0.25)",
              color: "var(--brand, #0092a2)",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0, 146, 162, 0.16)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0, 146, 162, 0.08)"}
          >
            <HelpCircle size={14} />
            <span>{t("help_link_manage_appts", "Comment gérer mes rendez-vous ?")}</span>
          </button>
          <Btn onClick={() => navigate("/search")} style={{ padding: "9px 18px", fontSize: 13 }}>{t("book_new")}</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[[ "all", t("all") ], [ "upcoming", t("upcoming") ], [ "past", t("past") ]].map(([ v, l ]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            borderColor: filter === v ? "#0891b2" : "#e5e7eb",
            background: filter === v ? "#ecfeff" : "#fff",
            color: filter === v ? "#0891b2" : "#6b7280"
          }}>{l} ({cnt(v)})</button>
        ))}
      </div>

      {loading ? <ListSkeleton count={3} /> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ marginBottom: 12 }}><Search size={44} color="#cbd5e1" /></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 16 }}>
            {filter === "upcoming" ? t("no_upcoming") : t("no_results")}
          </div>
          <Btn onClick={() => navigate("/search")}>{t("search_btn")}</Btn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(a => {
            const isPast = new Date(a.apointementdate) < now;
            const d = new Date(a.apointementdate);
            const isToday = a.apointementdate && a.apointementdate.slice(0, 10) === todayStr;
            const isQueue = Boolean(a.token_number);

            return (
              <Card key={a.id} style={{
                padding: "18px 20px",
                border: isQueue && !isPast ? "1.5px solid #ddd6fe" : undefined,
                background: isQueue && !isPast ? "#ffffff" : undefined
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <DoctorImage photo={a.photoprofile} size={48} borderRadius={12} style={{ background: isPast ? "#f3f4f6" : undefined }} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "#0c4a6e", fontSize: 15 }}>{a.doctorname || t("doctor")}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}><Building size={12} /> {a.clinicname || "—"}</div>
                        {a.ReasonName && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}><Stethoscope size={12} /> {a.ReasonName}</div>}

                        {/* Queue Badges (Ticket Number & Shift) */}
                        {isQueue && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              background: "#7c3aed",
                              color: "#ffffff",
                              padding: "3px 10px",
                              borderRadius: 14,
                              fontSize: 12,
                              fontWeight: 800
                            }}>
                              <Hash size={13} /> {isAr ? `تذكرة رقم #${a.token_number}` : `Ticket #${a.token_number}`}
                            </span>

                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              background: a.shift_type === 'evening' ? "#fef3c7" : "#e0f2fe",
                              color: a.shift_type === 'evening' ? "#92400e" : "#075985",
                              padding: "3px 8px",
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 700
                            }}>
                              {a.shift_type === 'evening' ? (
                                <><Moon size={11} /> {isAr ? "فترة مسائية" : "Soir"}</>
                              ) : (
                                <><Sun size={11} /> {isAr ? "فترة صباحية" : "Matin"}</>
                              )}
                            </span>

                            {a.is_emergency ? (
                              <span style={{ background: "#fee2e2", color: "#991b1b", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 800 }}>
                                {isAr ? "طوارئ" : "Urgence"}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: isAr ? "right" : "left" }}>
                        <div style={{ fontWeight: 800, color: "#0891b2", fontSize: 14 }}>
                          {d.toLocaleDateString(isAr ? 'ar-DZ' : i18n.language, { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={12} />
                          {isQueue && a.estimated_time ? (
                            <span>
                              {a.estimated_time.slice(0, 5)} <span style={{ fontSize: 11, color: "#94a3b8" }}>({isAr ? "تقديري" : "estimé"})</span>
                            </span>
                          ) : (
                            d.toLocaleTimeString(isAr ? 'ar-DZ' : i18n.language, { hour: "2-digit", minute: "2-digit" })
                          )}
                        </div>
                        {!isPast && (
                          <div style={{ marginTop: 8, display: "flex", justifyContent: isAr ? "flex-start" : "flex-end" }}>
                            <GoogleCalendarButton 
                              appointment={{
                                ...a,
                                patientname: user?.profile?.fullname || user?.username || a.patient_name || a.patientname
                              }} 
                              iconOnly={true}
                              style={{ background: "#f3f4f6", color: "#0092a2" }}
                            />
                          </div>
                        )}
                        <div style={{ marginTop: 6 }}>
                          {isPast ? <Badge color="#6b7280">{t("past_badge")}</Badge> : <Badge color="#059669">{t("upcoming_badge")}</Badge>}
                        </div>
                      </div>
                    </div>

                    {!isPast && (
                      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {isQueue && (
                          <Btn 
                            variant="primary"
                            onClick={() => setActiveTrackerId(activeTrackerId === a.id ? null : a.id)} 
                            style={{ 
                              padding: "6px 14px", 
                              fontSize: 12, 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 6,
                              background: activeTrackerId === a.id ? "#6d28d9" : "#7c3aed"
                            }}
                          >
                            <Activity size={14} /> 
                            {activeTrackerId === a.id 
                              ? (isAr ? "إخفاء الدور المباشر" : "Masquer le direct") 
                              : (isAr ? "متابعة الدور المباشر" : "Suivre en direct")}
                          </Btn>
                        )}
                        <Btn variant="secondary" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                          <Info size={14} /> {t("step_instructions") || "تعليمات"}
                          {expandedId === a.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Btn>
                        <Btn variant="danger" onClick={() => cancel(a.id)} style={{ padding: "6px 14px", fontSize: 12 }}>{t("cancel_btn")}</Btn>
                      </div>
                    )}
                  </div>
                </div>

                {/* LIVE QUEUE TURN TRACKER */}
                {isQueue && !isPast && activeTrackerId === a.id && (
                  <LiveQueueTracker appointment={a} isAr={isAr} />
                )}

                {/* EXPANDABLE INSTRUCTIONS */}
                {expandedId === a.id && !isPast && (
                  <div style={{ background: "#f8fafc", borderRadius: 16, padding: "20px", border: "1px solid #0891b2", marginTop: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0c4a6e", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                      <Info size={16} color="var(--brand)" /> 
                      {isAr ? "تعليمات الاستشارة" : "Consignes de consultation"}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {(isAr ? [
                          { title: "احضر مبكراً", desc: isQueue ? `رقم تذكرتك هو (#${a.token_number}). يرجى الحضور قبل وقت موعدك التقديري بـ 15 دقيقة للتسجيل لدى الاستقبال.` : "يرجى الحضور قبل 10 إلى 15 دقيقة من موعدك لتجنب أي تأخير." },
                          { title: "أحضر مستنداتك الضرورية", desc: "يرجى إحضار بطاقة هويتك، بطاقة الشفاء (إن وجدت)، بالإضافة إلى فحوصاتك أو وصفاتك الطبية القديمة." },
                          { title: "جهّز معلوماتك الطبية", desc: "قم بتدوين الأعراض والأدوية التي تتناولها حالياً لتسهيل الاستشارة." },
                          { title: "احترم موعدك", desc: "في حال عدم قدرتك على الحضور، يرجى إلغاء أو تأجيل الموعد مسبقاً للسماح لمرضى آخرين بالاستفادة منه." },
                          { title: "احترم قواعد العيادة", desc: "يرجى احترام الهدوء ونظافة المكان وتعليمات الطاقم الطبي." },
                          { title: "النظافة والوقاية", desc: "حسب الوضع، قد يُطلب منك ارتداء كمامة أو الالتزام ببعض تدابير النظافة." },
                          { title: "المرافقة", desc: "إذا لزم الأمر، يمكنك اصطحاب مرافق، مع الالتزام بقواعد المؤسسة." },
                          { title: "الالتزام بالوقت", desc: "أي تأخير كبير قد يؤدي إلى تجاوز رقمك في قائمة الانتظار." },
                          { title: "التواصل مع العيادة", desc: "لأي استفسار، يمكنك التواصل مع العيادة مباشرة عبر تطبيق Tabibi." }
                        ] : [
                          { title: "Présentez-vous à l’avance", desc: isQueue ? `Votre ticket est le (#${a.token_number}). Merci d'arriver 15 minutes avant l'heure estimée.` : "Merci d’arriver 10 à 15 minutes avant l’heure de votre rendez-vous pour éviter tout retard." },
                          { title: "Apportez vos documents nécessaires", desc: "Veuillez vous munir de votre pièce d’identité, de votre carte CNAS/CASNOS (si applicable), ainsi que de vos anciens examens ou ordonnances." },
                          { title: "Préparez vos informations médicales", desc: "Notez vos symptômes et la liste des médicaments que vous prenez actuellement afin de faciliter la consultation." },
                          { title: "Respectez votre rendez-vous", desc: "En cas d’empêchement, merci d’annuler ou reporter votre rendez-vous à l’avance pour permettre à d’autres patients d’en bénéficier." },
                          { title: "Respectez les règles de la clinique", desc: "Merci de respecter le calme, la propreté des lieux et les consignes du personnel médical." },
                          { title: "Hygiène et prévention", desc: "Selon la situation, il peut être demandé de porter un masque ou de respecter certaines mesures d’hygiène." },
                          { title: "Accompagnement", desc: "Si nécessaire, vous pouvez être accompagné d’un proche, en respectant les règles de l’établissement." },
                          { title: "Ponctualité et organisation", desc: "Tout retard important peut entraîner un report du rendez-vous afin de respecter les autres patients." },
                          { title: "Communication avec le cabinet", desc: "En cas de question, vous pouvez contacter la clinique directement via l’application Tabibi." }
                        ]
                      ).map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--brand-light)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, paddingTop: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{item.title}</div>
                            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      <Toast />
    </div>
  );
}

