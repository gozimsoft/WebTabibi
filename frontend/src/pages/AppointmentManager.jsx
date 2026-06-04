import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { 
  Calendar, Clock, User, Phone, CheckCircle, 
  XCircle, AlertCircle, RefreshCw, Filter, Search,
  Activity, ClipboardList
} from "lucide-react";
import { Btn, Spinner, useToast } from "../components/SharedUI";

export default function AppointmentManager({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const { show, Toast } = useToast();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, past
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchAppointments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      // If user is doctor (1), fetch from doctor endpoint. 
      // If clinic (2), this would theoretically fetch from a manager endpoint, but we focus on doctor here.
      let data = [];
      if (user?.user_type === 1) {
        const res = await api.doctor.getAppointments();
        // Assuming backend returns an array directly or inside 'appointments' key
        data = res.appointments || res || [];
      } else {
        // Fallback or placeholder for clinic
        show("واجهة العيادة قيد التطوير", "error");
      }
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      show(err.message || t("error_occurred"), "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("هل أنت متأكد من إلغاء هذا الموعد؟")) return;
    try {
      await api.appointments.cancel(id);
      show("تم إلغاء الموعد بنجاح", "success");
      fetchAppointments(true);
    } catch (err) {
      show(err.message || "حدث خطأ أثناء الإلغاء", "error");
    }
  };

  // ── Filters & Stats ──
  const now = new Date();
  const filtered = appointments.filter(a => {
    const d = new Date(a.apointementdate || a.date);
    const matchesFilter = filter === "all" || 
                         (filter === "upcoming" && d >= now) || 
                         (filter === "past" && d < now);
    
    const matchesSearch = !search || 
                          (a.patientname || a.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (a.phone || "").includes(search);
                          
    const matchesDate = !dateFilter || (a.apointementdate || a.date || "").startsWith(dateFilter);
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => new Date(a.apointementdate || a.date) >= now).length,
    past: appointments.filter(a => new Date(a.apointementdate || a.date) < now).length
  };

  // ── Styles ──
  const glassPanel = {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 8px 32px rgba(12, 74, 110, 0.05)",
    borderRadius: 24,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", padding: "32px 24px", paddingBottom: 100 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ ...glassPanel, padding: "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#0c4a6e", display: "flex", alignItems: "center", gap: 12 }}>
              <Calendar size={32} color="#0284c7" />
              إدارة المواعيد
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#475569", fontSize: 15 }}>
              مرحباً د. {user?.profile?.fullname || user?.username}، تابع مواعيدك ومرضاك من هنا.
            </p>
          </div>
          <Btn 
            onClick={() => fetchAppointments(true)} 
            disabled={refreshing || loading}
            style={{ borderRadius: 14, padding: "12px 24px", background: "#fff", color: "#0284c7", border: "1px solid #bae6fd", boxShadow: "0 4px 12px rgba(2, 132, 199, 0.1)" }}
          >
            <RefreshCw size={18} className={refreshing ? "spin-anim" : ""} /> تحديث البيانات
          </Btn>
        </div>

        {/* Stats Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 24 }}>
          {[
            { title: "إجمالي المواعيد", count: stats.total, icon: <Activity size={24}/>, color: "#0284c7", bg: "linear-gradient(135deg, #e0f2fe, #bae6fd)" },
            { title: "المواعيد القادمة", count: stats.upcoming, icon: <CheckCircle size={24}/>, color: "#059669", bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)" },
            { title: "المواعيد السابقة", count: stats.past, icon: <ClipboardList size={24}/>, color: "#64748b", bg: "linear-gradient(135deg, #f1f5f9, #e2e8f0)" }
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 24, display: "flex", alignItems: "center", gap: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.02)" }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b", marginTop: 8 }}>{s.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ ...glassPanel, padding: 20, marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "8px 12px", borderRadius: 14, border: "1px solid #e2e8f0", flex: "1 1 300px" }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="ابحث باسم المريض أو رقم الهاتف..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", width: "100%", fontSize: 14, background: "transparent" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "8px 12px", borderRadius: 14, border: "1px solid #e2e8f0" }}>
            <Filter size={18} color="#94a3b8" />
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ border: "none", outline: "none", fontSize: 14, background: "transparent", color: "#334155", fontWeight: 600 }}>
              <option value="all">كل المواعيد</option>
              <option value="upcoming">المواعيد القادمة</option>
              <option value="past">المواعيد السابقة</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "8px 12px", borderRadius: 14, border: "1px solid #e2e8f0" }}>
            <Calendar size={18} color="#94a3b8" />
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ border: "none", outline: "none", fontSize: 14, color: "#334155", background: "transparent" }} />
            {dateFilter && <XCircle size={16} color="#ef4444" style={{ cursor: "pointer" }} onClick={() => setDateFilter("")} />}
          </div>
        </div>

        {/* Appointments List */}
        {loading && !refreshing ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
            <Spinner size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <Calendar size={64} color="#cbd5e1" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#334155", margin: "0 0 8px 0" }}>لا توجد مواعيد</h3>
            <p style={{ color: "#64748b", margin: 0 }}>لم يتم العثور على أي مواعيد تطابق بحثك.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {filtered.map(appt => {
              const d = new Date(appt.apointementdate || appt.date);
              const isPast = d < now;
              return (
                <div key={appt.id} className="appt-card" style={{ 
                  background: "#fff", 
                  borderRadius: 20, 
                  padding: 24, 
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)", 
                  border: "1px solid rgba(0,0,0,0.04)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Status Indicator */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: isPast ? "#cbd5e1" : "var(--brand)" }} />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: isPast ? "#f1f5f9" : "#e0f2fe", color: isPast ? "#64748b" : "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>{appt.patientname || appt.patient_name || "مريض غير معروف"}</div>
                          {appt.phone && <div style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><Phone size={12} /> {appt.phone}</div>}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ display: "inline-block", background: isPast ? "#f1f5f9" : "#d1fae5", color: isPast ? "#64748b" : "#059669", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, border: `1px solid ${isPast ? "#e2e8f0" : "#a7f3d0"}` }}>
                        {isPast ? "سابق" : "قادم"}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 14, fontWeight: 700 }}>
                        <Calendar size={16} color="#0284c7" />
                        {d.toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 14, fontWeight: 700 }}>
                      <Clock size={16} color="#0284c7" />
                      {d.toLocaleTimeString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {appt.note && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #cbd5e1", fontSize: 13, color: "#64748b", display: "flex", alignItems: "flex-start", gap: 6 }}>
                        <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ lineHeight: 1.4 }}>{appt.note}</span>
                      </div>
                    )}
                  </div>

                  {!isPast && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <Btn variant="danger" style={{ flex: 1, padding: "10px", borderRadius: 12, fontSize: 13, fontWeight: 700 }} onClick={() => handleCancel(appt.id)}>
                        إلغاء الموعد
                      </Btn>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .spin-anim { animation: spin 1s linear infinite; }
        .appt-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06) !important; }
      `}</style>
      <Toast />
    </div>
  );
}
