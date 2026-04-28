// src/pages/Appointments.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Info, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Btn, Card, Spinner, DoctorImage, Badge, useToast } from "../components/SharedUI";

export default function AppointmentsPage({ navigate }) {
  const { t, i18n } = useTranslation();
  const [appts, setAppts] = useState([]);
  const [loading, setL] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [expandedId, setExpandedId] = useState(null);
  const { show, Toast } = useToast();
  const now = new Date();

  useEffect(() => {
    api.patient.appointments().then(setAppts).catch(() => { }).finally(() => setL(false));
  }, []);

  const cancel = async (id) => {
    if (!confirm(t("cancel_confirm"))) return;
    try {
      await api.appointments.cancel(id);
      setAppts(p => p.filter(a => a.id !== id));
      show(t("cancel_success"));
    } catch (e) { show(e.message, "error"); }
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
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", margin: 0 }}>{t("appointments_title")}</h1>
        <Btn onClick={() => navigate("/search")} style={{ padding: "9px 18px", fontSize: 13 }}>{t("book_new")}</Btn>
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

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
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
            return (
              <Card key={a.id} style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <DoctorImage photo={a.photoprofile} size={46} borderRadius={10} style={{ background: isPast ? "#f3f4f6" : undefined }} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "#0c4a6e", fontSize: 15 }}>{a.doctorname || t("doctor")}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>🏥 {a.clinicname || "—"}</div>
                        {a.ReasonName && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>🩺 {a.ReasonName}</div>}
                      </div>
                      <div style={{ textAlign: i18n.language === 'ar' ? "right" : "left" }}>
                        <div style={{ fontWeight: 800, color: "#0891b2", fontSize: 14 }}>
                          {d.toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language, { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                          ⏰ {d.toLocaleTimeString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language, { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          {isPast ? <Badge color="#6b7280">{t("past_badge")}</Badge> : <Badge color="#059669">{t("upcoming_badge")}</Badge>}
                        </div>
                      </div>
                    </div>
                    {!isPast && (
                      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        <Btn variant="secondary" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                          <Info size={14} /> {t("step_instructions") || "تعليمات"}
                          {expandedId === a.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Btn>
                        <Btn variant="danger" onClick={() => cancel(a.id)} style={{ padding: "6px 14px", fontSize: 12 }}>{t("cancel_btn")}</Btn>
                      </div>
                    )}
                  </div>
                </div>

                {/* EXPANDABLE INSTRUCTIONS */}
                {expandedId === a.id && !isPast && (
                  <div style={{ background: "#f8fafc", borderRadius: 16, padding: "20px", border: "1px solid var(--border)", marginTop: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0c4a6e", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                      <Info size={16} color="var(--brand)" /> 
                      {i18n.language === 'ar' ? "تعليمات الاستشارة" : "Consignes de consultation"}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {(i18n.language === 'ar' ? [
                          { title: "احضر مبكراً", desc: "يرجى الحضور قبل 10 إلى 15 دقيقة من موعدك لتجنب أي تأخير." },
                          { title: "أحضر مستنداتك الضرورية", desc: "يرجى إحضار بطاقة هويتك، بطاقة الشفاء (إن وجدت)، بالإضافة إلى فحوصاتك أو وصفاتك الطبية القديمة." },
                          { title: "جهّز معلوماتك الطبية", desc: "قم بتدوين الأعراض والأدوية التي تتناولها حالياً لتسهيل الاستشارة." },
                          { title: "احترم موعدك", desc: "في حال عدم قدرتك على الحضور، يرجى إلغاء أو تأجيل الموعد مسبقاً للسماح لمرضى آخرين بالاستفادة منه." },
                          { title: "احترم قواعد العيادة", desc: "يرجى احترام الهدوء ونظافة المكان وتعليمات الطاقم الطبي." },
                          { title: "النظافة والوقاية", desc: "حسب الوضع، قد يُطلب منك ارتداء كمامة أو الالتزام ببعض تدابير النظافة." },
                          { title: "المرافقة", desc: "إذا لزم الأمر، يمكنك اصطحاب مرافق، مع الالتزام بقواعد المؤسسة." },
                          { title: "الالتزام بالوقت", desc: "أي تأخير كبير قد يؤدي إلى تأجيل الموعد احتراماً للمرضى الآخرين." },
                          { title: "التواصل مع العيادة", desc: "لأي استفسار، يمكنك التواصل مع العيادة مباشرة عبر تطبيق Tabibi." }
                        ] : [
                          { title: "Présentez-vous à l’avance", desc: "Merci d’arriver 10 à 15 minutes avant l’heure de votre rendez-vous pour éviter tout retard." },
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
