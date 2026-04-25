// src/pages/Search.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Card, Spinner, DoctorImage, Stars, Badge, useToast } from "../components/SharedUI";

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
            {results.map(r => (
              <div key={r.clinicsdoctor_id}
                onClick={() => navigate(`/clinic/${r.clinicid}/doctor/${r.doctor_id}`)}
                style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 18, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(8,145,178,0.12)"; e.currentTarget.style.borderColor = "#0891b2"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <DoctorImage photo={r.photoprofile} size={48} borderRadius={10} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0c4a6e", marginBottom: 4 }}>{r.doctorname}</div>
                    <Badge color="#0891b2">{i18n.language === 'ar' ? r.specialtyar : r.specialtyfr}</Badge>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>🏥 {r.clinicname}</div>
                {r.ClinicAddress && <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>📍 {r.ClinicAddress.slice(0, 60)}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Stars rating={Math.round(+r.AvgRating)} size={13} color="#0A85A4" />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>({r.RatingCount})</span>
                  </div>
                  {+r.pricing > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: "#0A85A4" }}>{r.pricing} {t("da")}</span>}
                  {+r.experience > 0 && <span style={{ fontSize: 11, color: "#9ca3af" }}>{r.experience} {t("experience")}</span>}
                </div>
              </div>
            ))}
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
