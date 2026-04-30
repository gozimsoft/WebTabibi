// src/pages/Search.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card, Spinner, DoctorImage, Stars, Badge, useToast } from "../components/SharedUI";
import { MapPin, Phone, Building, Globe, Activity, Heart, Shield } from "lucide-react";


export default function SearchPage({ navigate, qs }) {
  const { t, i18n } = useTranslation();
  const params = new URLSearchParams(qs);
  const [q, setQ] = useState(params.get("q") || "");
  const [sp, setSP] = useState(params.get("specialty") || "");
  const [results, setR] = useState([]);
  const [spList, setSPL] = useState([]);
  const [loading, setL] = useState(false);
  const [total, setT] = useState(0);
  const { show, Toast } = useToast();

  useEffect(() => { api.specialties().then(setSPL).catch(() => { }); }, []);

  const doSearch = useCallback(async (qv, spv) => {
    setL(true);
    try {
      const d = await api.clinics.search({ q: qv, specialty: spv, limit: 24 });
      setR(d.items || []); setT(d.total || 0);
    } catch (e) { show(e.message, "error"); setR([]); }
    finally { setL(false); }
  }, [show]);

  useEffect(() => { doSearch(q, sp); }, [sp]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0c4a6e", marginBottom: 6 }}>{t("search_title")}</h1>
      <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 13 }}>{t("search_subtitle")}</p>

      <Card style={{ marginBottom: 20, padding: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch(q, sp)}
            placeholder={t("search_placeholder")}
            style={{ flex: 2, minWidth: 180, padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none", direction: i18n.language === 'ar' ? "rtl" : "ltr", boxSizing: "border-box" }}
          />
          <select value={sp} onChange={e => setSP(e.target.value)}
            style={{ flex: 1, minWidth: 150, padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, background: "#fafafa", boxSizing: "border-box" }}>
            <option value="">{t("all_specialties")}</option>
            {spList.map(s => <option key={s.id} value={s.id}>{i18n.language === 'ar' ? s.namear : s.namefr}</option>)}
          </select>
          <Btn onClick={() => doSearch(q, sp)} style={{ padding: "10px 24px", whiteSpace: "nowrap" }}>{t("search_btn")}</Btn>
        </div>
      </Card>

      {loading ? <Spinner /> : (
        <>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
            {total > 0 ? `${total} ${t("results_count")}` : t("no_results")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 14 }}>
            {results.map(r => {
              const type = (r.ResultType || "").toUpperCase();
              const isDoctor = type === 'DOCTOR';

              // Extreme Robust Field Normalization
              const name = isDoctor ? r.doctorname : (r.clinicname || r.name || r.ClinicName || r.title);
              const photo = isDoctor ? r.photoprofile : (r.logo || r.image || r.ClinicLogo || r.photoprofile);
              const phone = r.phone || r.Phone || r.telephone || r.clinic_phone || r.ClinicPhone || r.mobile;
              const email = r.email || r.Email || r.clinic_email || r.ClinicEmail || r.mail;
              const website = r.website || r.Website || r.clinic_website || r.ClinicWebsite || r.url;
              const fax = r.fax || r.Fax || r.clinic_fax;
              const address = isDoctor ? r.ClinicAddress : (r.address || r.ClinicAddress || r.clinic_address || r.location);
              const avgRating = r.AvgRating || r.avg_rating || r.rating || r.avgRating || r.clinic_avg_rating || 0;
              const ratingCount = r.RatingCount || r.rating_count || r.reviews_count || r.ratingCount || 0;
              const specialty = isDoctor ? (i18n.language === 'ar' ? r.specialtyar : r.specialtyfr) : (r.activitysector || t("medical_center"));

              return (
                <div key={type + r.ResultId}
                  onClick={() => navigate(isDoctor ? `/doctor/${r.doctor_id}` : `/clinic/${r.clinicid}`)}
                  style={{
                    background: "#fff",
                    borderRadius: 22,
                    border: "1px solid var(--border)",
                    borderLeft: isDoctor ? "1px solid var(--border)" : "5px solid #0092a2",
                    padding: 16,
                    cursor: "pointer",
                    transition: "0.3s",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    boxShadow: "rgba(0, 0, 0, 0.03) 0px 2px 10px",
                    transform: "translateY(0px)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = `0 6px 20px ${isDoctor ? "rgba(8,145,178,0.12)" : "rgba(0,146,162,0.12)"}`;
                    e.currentTarget.style.borderColor = "#0092a2";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "rgba(0, 0, 0, 0.03) 0px 2px 10px";
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -15, position: "relative", zIndex: 1 }}>
                    <Badge color={isDoctor ? "#0891b2" : "#0092a2"}>
                      {isDoctor ? t("doctor") : (
                         +r.typeclinic === 0 ? t("type_0", "Médecin") : 
                         +r.typeclinic === 1 ? t("type_1", "Clinique") : 
                         +r.typeclinic === 2 ? t("type_2", "Hôpital") : 
                         (r.typeclinic || t("clinic"))
                      )}
                    </Badge>
                  </div>

                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ position: "relative" }}>
                      <DoctorImage
                        photo={photo}
                        size={56}
                        borderRadius={12}
                        fallbackIcon={isDoctor ? null : Building}
                      />
                      {!isDoctor && +r.emergency === 1 && (
                        <div style={{ position: "absolute", bottom: -4, right: -4, background: "#ef4444", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #fff", fontSize: 10 }}>
                          🚨
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#0c4a6e", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {name}
                      </div>
                      <Badge color={isDoctor ? "#0891b2" : "#6366f1"}>
                        {specialty}
                      </Badge>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {/* Primary Contact (Phone) */}
                    <div style={{ fontSize: 13, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                      {isDoctor ? <Building size={14} color="#64748b" /> : <Phone size={14} color="#0092a2" />}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: isDoctor ? 400 : 600 }}>
                        {isDoctor ? r.clinicname : (phone || t("no_phone") || "N/A")}
                      </span>
                    </div>

                    {!isDoctor ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#f8fafc", padding: "10px 12px", borderRadius: 14, border: "1px solid #f1f5f9" }}>
                        {email && (
                          <div style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                            <Mail size={12} color="#0092a2" /> {email}
                          </div>
                        )}
                        {website && (
                          <div style={{ fontSize: 11, color: "#0092a2", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                            <Globe size={12} /> {website.replace(/^https?:\/\//, '')}
                          </div>
                        )}
                        {fax && (
                          <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                            <Phone size={12} color="#94a3b8" style={{ transform: "rotate(270deg)" }} /> <span style={{ opacity: 0.7 }}>Fax:</span> {fax}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <MapPin size={12} color="#0092a2" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ lineHeight: 1.4 }}>{address || t("no_address") || "Adresse non fournie"}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "flex-start", gap: 6 }}>
                        <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ lineHeight: 1.4 }}>{address?.slice(0, 70)}</span>
                      </div>
                    )}

                    {!isDoctor && (
                      <div style={{ display: "flex", gap: 12, marginTop: 4, alignItems: "center" }}>
                        <div style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={12} color="#0092a2" /> {r.experience || 7} {i18n.language === 'ar' ? "سنوات" : "ans"}
                        </div>
                        <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          <CreditCard size={12} /> {r.pricing || 1000} {t("da") || "دج"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: 10, marginTop: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Stars rating={Math.round(+avgRating)} size={13} color={isDoctor ? "#0A85A4" : "#f59e0b"} />
                      <span style={{ fontSize: 11, color: "#6b7280" }}>({ratingCount})</span>
                      {!isDoctor && (
                        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
                          {+r.ambulances === 1 && <span title={t("ambulance")}>🚑</span>}
                          {+r.hospitalization === 1 && <span title={t("hospitalization")}>🏥</span>}
                        </div>
                      )}
                    </div>
                    {isDoctor && +r.pricing > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0A85A4" }}>
                        {r.pricing} {t("da")}
                      </span>
                    )}
                    {!isDoctor && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#0092a2" }}>
                        {t("view_details") || "Voir détails"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {results.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#9ca3af" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t("no_results")}</div>
            </div>
          )}
        </>
      )}
      <Toast />
    </div>
  );
}
