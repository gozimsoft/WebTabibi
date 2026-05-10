import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Calendar as CalendarIcon, Clock, User, Phone, 
  Filter, Search, ChevronLeft, ChevronRight, 
  MoreHorizontal, CheckCircle, XCircle, Clock4,
  LayoutDashboard, List, Activity, Info, CalendarDays,
  Download, Plus, RefreshCw, Stethoscope, Ruler, Weight, Droplets, Heart
} from "lucide-react";
import { Btn, Card, Spinner, ListSkeleton, Badge, useToast, DoctorImage } from "../components/SharedUI";

// Reuse API from window if needed or pass via props. 
// For consistency, we'll assume 'api' is available in the parent or we'll define a local one if needed.
// Given App.jsx structure, the 'api' object is likely not exported. 
// But the USER said "use EXISTING backend APIs". I've extended 'api' in App.jsx.

export default function AppointmentManager({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const { show, Toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0 });
  const [viewMode, setViewMode] = useState("list"); // list, calendar
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [clinicId, setClinicId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppt, setNewAppt] = useState({ patientname: "", phone: "", date: new Date().toISOString().split('T')[0], time: "09:00", note: "", doctor_id: "" });

  // Status mapping
  const STATUS = {
    PENDING: 0,
    CANCELLED: 1,
    COMPLETED: 2,
    CONFIRMED: 3, 
  };

  useEffect(() => {
    // Determine clinic_id from user profile
    if (user?.user_type === 1 && user?.profile?.clinics?.length > 0) {
      setClinicId(user.profile.clinics[0].id || user.profile.clinics[0].clinic_id);
    } else if (user?.user_type === 2) {
      setClinicId(user.profile?.id);
    }
  }, [user]);

  useEffect(() => {
    if (clinicId) {
      fetchData();
      if (user?.user_type === 2) fetchDoctors();
    }
  }, [clinicId]);

  const fetchDoctors = async () => {
    try {
      const getToken = () => localStorage.getItem("tabibi_token");
      const res = await fetch(`/api/clinics/${clinicId}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      }).then(r => r.json());
      if (res.success) {
        setDoctors(res.data.doctors || []);
        if (res.data.doctors?.length > 0) {
          setNewAppt(prev => ({ ...prev, doctor_id: res.data.doctors[0].doctor_id }));
        }
      }
    } catch (e) { console.error("Error fetching doctors", e); }
  };

  const fetchData = async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const getToken = () => localStorage.getItem("tabibi_token");
      const res = await fetch(`/api/apointements/sync?clinic_id=${clinicId}&limit=1000`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      }).then(r => r.json());

      if (!res.success) throw new Error(res.message);
      
      const appts = res.data.appointments || [];
      setAppointments(appts);
      
      const s = {
        total: appts.length,
        pending: appts.filter(a => a.status === 0).length,
        confirmed: appts.filter(a => a.status === 3 || a.status === 0).length,
        cancelled: appts.filter(a => a.status === 1).length,
      };
      setStats(s);
    } catch (e) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const getToken = () => localStorage.getItem("tabibi_token");
      const appt = appointments.find(a => a.id === id);
      if (!appt) return;

      const body = {
        clinic_id: clinicId,
        appointments: [
          {
            ...appt,
            status: newStatus,
            updatedat: new Date().toISOString()
          }
        ]
      };

      const res = await fetch(`/api/apointements/sync`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
      }).then(r => r.json());

      if (!res.success) throw new Error(res.message);

      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      show(i18n.language === 'ar' ? "تم تحديث الحالة" : "Statut mis à jour");
      setSelectedAppt(null);
    } catch (e) {
      show(e.message, "error");
    }
  };

  const handleSaveNewAppt = async () => {
    if (!clinicId) {
      return show(i18n.language === 'ar' ? "خطأ في تحديد العيادة" : "Erreur: Clinic ID manquant", "error");
    }
    if (!newAppt.patientname || !newAppt.date || !newAppt.time) {
      return show(i18n.language === 'ar' ? "يرجى ملء الحقول المطلوبة" : "Veuillez remplir les champs obligatoires", "error");
    }

    setIsSaving(true);
    try {
      const getToken = () => localStorage.getItem("tabibi_token");
      const apptDate = `${newAppt.date} ${newAppt.time}:00`;
      
      // Generate a simple UUID-like string
      const id = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      ).toUpperCase();

      const body = {
        clinic_id: clinicId,
        appointments: [
          {
            id,
            patientname: newAppt.patientname,
            phone: newAppt.phone,
            apointementdate: apptDate,
            note: newAppt.note,
            status: 3, // Directly confirm
            updatedat: new Date().toISOString()
          }
        ]
      };

      const res = await fetch(`/api/apointements/sync`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
      }).then(r => r.json());

      if (!res.success) throw new Error(res.message);

      show(i18n.language === 'ar' ? "تم تسجيل الموعد بنجاح" : "Rendez-vous enregistré avec succès");
      setShowAddModal(false);
      setNewAppt({ patientname: "", phone: "", date: new Date().toISOString().split('T')[0], time: "09:00", note: "" });
      fetchData();
    } catch (e) {
      show(e.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAppts = useMemo(() => {
    return appointments.filter(a => {
      const matchesSearch = (a.patientname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (a.phone || "").includes(searchQuery);
      const matchesStatus = filterStatus === "all" || a.status.toString() === filterStatus;
      const matchesDoctor = filterDoctor === "all" || a.doctor_id === filterDoctor || a.clinicsdoctor_id === filterDoctor;
      return matchesSearch && matchesStatus && matchesDoctor;
    });
  }, [appointments, searchQuery, filterStatus, filterDoctor]);

  // Calendar Logic
  const calendarDays = useMemo(() => {
    const days = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay()); // Start at Sunday
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  const getApptsForDay = (date) => {
    const dStr = date.toISOString().split("T")[0];
    return appointments.filter(a => a.apointementdate.startsWith(dStr));
  };

  const statusLabel = (s) => {
    if (s === 0) return { label: i18n.language === 'ar' ? "قيد الانتظار" : "En attente", color: "#f59e0b", bg: "#fef3c7" };
    if (s === 1) return { label: i18n.language === 'ar' ? "ملغي" : "Annulé", color: "#ef4444", bg: "#fee2e2" };
    if (s === 2) return { label: i18n.language === 'ar' ? "مكتمل" : "Terminé", color: "#10b981", bg: "#d1fae5" };
    return { label: i18n.language === 'ar' ? "مؤكد" : "Confirmé", color: "#3b82f6", bg: "#dbeafe" };
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", minHeight: "90vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0c4a6e", margin: "0 0 4px" }}>
            {i18n.language === 'ar' ? "إدارة المواعيد" : "Appointment Manager"}
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            {i18n.language === 'ar' ? "تابع ونسق مواعيدك الطبية بكل سهولة" : "Manage and coordinate your medical appointments with ease."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="secondary" onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {i18n.language === 'ar' ? "تحديث" : "Rafraîchir"}
          </Btn>
          <Btn variant="primary" onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={18} />
            {i18n.language === 'ar' ? "حجز جديد" : "Nouveau RDV"}
          </Btn>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <Card style={{ maxWidth: 500, width: "100%", padding: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0c4a6e", marginBottom: 20, textAlign: "center" }}>
              {i18n.language === 'ar' ? "إضافة موعد جديد" : "Nouveau Rendez-vous"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>{i18n.language === 'ar' ? "اسم المريض" : "Nom du Patient"}</label>
                <input 
                  type="text" 
                  value={newAppt.patientname} 
                  onChange={e => setNewAppt({...newAppt, patientname: e.target.value})}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14 }}
                  placeholder="Ex: Mohamed Amine"
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>{i18n.language === 'ar' ? "رقم الهاتف" : "Téléphone"}</label>
                <input 
                  type="text" 
                  value={newAppt.phone} 
                  onChange={e => setNewAppt({...newAppt, phone: e.target.value})}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14 }}
                  placeholder="06..."
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>{i18n.language === 'ar' ? "التاريخ" : "Date"}</label>
                  <input 
                    type="date" 
                    value={newAppt.date} 
                    onChange={e => setNewAppt({...newAppt, date: e.target.value})}
                    style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>{i18n.language === 'ar' ? "الوقت" : "Heure"}</label>
                  <input 
                    type="time" 
                    value={newAppt.time} 
                    onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                    style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14 }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>{i18n.language === 'ar' ? "ملاحظات" : "Note"}</label>
                <textarea 
                  value={newAppt.note} 
                  onChange={e => setNewAppt({...newAppt, note: e.target.value})}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, minHeight: 80 }}
                />
              </div>

              {user?.user_type === 2 && doctors.length > 0 && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>{i18n.language === 'ar' ? "الطبيب" : "Médecin"}</label>
                  <select 
                    value={newAppt.doctor_id}
                    onChange={e => setNewAppt({...newAppt, doctor_id: e.target.value})}
                    style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, background: "#fff" }}
                  >
                    {doctors.map(d => (
                      <option key={d.doctor_id} value={d.doctor_id}>{d.doctorname}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <Btn variant="secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>{i18n.language === 'ar' ? "إلغاء" : "Annuler"}</Btn>
                <Btn variant="primary" style={{ flex: 1 }} onClick={handleSaveNewAppt} loading={isSaving}>
                  {i18n.language === 'ar' ? "حفظ" : "Enregistrer"}
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
        {[
          { label: i18n.language === 'ar' ? "إجمالي المواعيد" : "Total RDVs", value: stats.total, icon: <Activity color="#0891b2" />, color: "#0891b2" },
          { label: i18n.language === 'ar' ? "بانتظار التأكيد" : "En attente", value: stats.pending, icon: <Clock4 color="#f59e0b" />, color: "#f59e0b" },
          { label: i18n.language === 'ar' ? "المواعيد الملغاة" : "Annulés", value: stats.cancelled, icon: <XCircle color="#ef4444" />, color: "#ef4444" },
          { label: i18n.language === 'ar' ? "مكتملة" : "Terminés", value: stats.confirmed, icon: <CheckCircle color="#10b981" />, color: "#10b981" },
        ].map((s, i) => (
          <Card key={i} style={{ padding: "20px", display: "flex", alignItems: "center", gap: 16, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <Card style={{ padding: 0, overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        {/* Toolbar */}
        <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 300 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text" 
                placeholder={i18n.language === 'ar' ? "بحث عن مريض..." : "Chercher un patient..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}
              />
            </div>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, background: "#fff", outline: "none" }}
            >
              <option value="all">{i18n.language === 'ar' ? "كل الحالات" : "Tous les statuts"}</option>
              <option value="0">{i18n.language === 'ar' ? "قيد الانتظار" : "En attente"}</option>
              <option value="3">{i18n.language === 'ar' ? "مؤكد" : "Confirmé"}</option>
              <option value="1">{i18n.language === 'ar' ? "ملغي" : "Annulé"}</option>
              <option value="2">{i18n.language === 'ar' ? "مكتمل" : "Terminé"}</option>
            </select>

            {user?.user_type === 2 && doctors.length > 0 && (
              <select 
                value={filterDoctor}
                onChange={e => setFilterDoctor(e.target.value)}
                style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, background: "#fff", outline: "none" }}
              >
                <option value="all">{i18n.language === 'ar' ? "كل الأطباء" : "Tous les médecins"}</option>
                {doctors.map(d => (
                  <option key={d.doctor_id} value={d.doctor_id}>{d.doctorname}</option>
                ))}
              </select>
            )}
          </div>
          
          <div style={{ display: "flex", background: "#f1f5f9", padding: 4, borderRadius: 10 }}>
            <button 
              onClick={() => setViewMode("list")}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: viewMode === "list" ? "#fff" : "transparent", color: viewMode === "list" ? "#0f172a" : "#64748b", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8, boxShadow: viewMode === "list" ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}
            >
              <List size={16} /> {i18n.language === 'ar' ? "قائمة" : "Liste"}
            </button>
            <button 
              onClick={() => setViewMode("calendar")}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: viewMode === "calendar" ? "#fff" : "transparent", color: viewMode === "calendar" ? "#0f172a" : "#64748b", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8, boxShadow: viewMode === "calendar" ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}
            >
              <CalendarDays size={16} /> {i18n.language === 'ar' ? "تقويم" : "تقويم"}
            </button>
          </div>
        </div>

        {/* List View */}
        {viewMode === "list" && (
          <div style={{ overflowX: "auto" }}>
            {loading ? <div style={{ padding: 20 }}><ListSkeleton count={5} /></div> : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: i18n.language === 'ar' ? "right" : "left" }}>
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                  <tr>
                    <th style={{ padding: "16px 20px", fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{i18n.language === 'ar' ? "المريض" : "Patient"}</th>
                    <th style={{ padding: "16px 20px", fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{i18n.language === 'ar' ? "التاريخ والوقت" : "Date & Heure"}</th>
                    <th style={{ padding: "16px 20px", fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{i18n.language === 'ar' ? "الحالة" : "Statut"}</th>
                    <th style={{ padding: "16px 20px", fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{i18n.language === 'ar' ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppts.map((appt, i) => {
                    const date = new Date(appt.apointementdate);
                    const s = statusLabel(appt.status);
                    return (
                      <tr key={appt.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} className="hover:bg-slate-50">
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#0891b2", fontWeight: 800 }}>
                              {appt.patientname?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#0f172a" }}>{appt.patientname}</div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>{appt.phone || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0f172a", fontWeight: 600 }}>
                            <CalendarIcon size={14} color="#64748b" /> {date.toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12, marginTop: 4 }}>
                            <Clock size={14} color="#64748b" /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.color, fontSize: 12, fontWeight: 700 }}>
                            {s.label}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button 
                              onClick={() => setSelectedAppt(appt)}
                              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}
                            >
                              <Info size={16} />
                            </button>
                            {appt.status === 0 && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(appt.id, 3)}
                                  style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#10b981", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(appt.id, 1)}
                                  style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAppts.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
                        <CalendarIcon size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <div>{i18n.language === 'ar' ? "لا توجد مواعيد حالياً" : "Aucun rendez-vous trouvé."}</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <button onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 7)))} style={{ background: "none", border: "none", cursor: "pointer", color: "#0891b2" }}><ChevronLeft /></button>
              <h3 style={{ margin: 0, fontWeight: 800 }}>
                {calendarDays[0].toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 7)))} style={{ background: "none", border: "none", cursor: "pointer", color: "#0891b2" }}><ChevronRight /></button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
              {calendarDays.map((day, i) => {
                const dayAppts = getApptsForDay(day);
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div key={i} style={{ minHeight: 180, borderRadius: 12, border: "1px solid #e2e8f0", background: isToday ? "#f0fdfa" : "#fff", padding: 12 }}>
                    <div style={{ textAlign: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{day.toLocaleDateString(i18n.language, { weekday: 'short' })}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: isToday ? "#0891b2" : "#0f172a" }}>{day.getDate()}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {dayAppts.map(a => {
                        const s = statusLabel(a.status);
                        return (
                          <div 
                            key={a.id} 
                            onClick={() => setSelectedAppt(a)}
                            style={{ padding: "6px 8px", borderRadius: 6, background: s.bg, border: `1px solid ${s.color}30`, fontSize: 11, fontWeight: 700, color: s.color, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                          >
                            {new Date(a.apointementdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {a.patientname}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <Card style={{ maxWidth: 600, width: "100%", padding: 0, overflow: "hidden", position: "relative" }}>
            <button onClick={() => setSelectedAppt(null)} style={{ position: "absolute", top: 16, right: 16, background: "#f1f5f9", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XCircle size={20} color="#64748b" /></button>
            
            <div style={{ background: "linear-gradient(135deg, #0c4a6e, #0891b2)", padding: "32px 24px", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900 }}>
                  {selectedAppt.patientname?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{selectedAppt.patientname}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.8, fontSize: 14, marginTop: 4 }}>
                    <Phone size={14} /> {selectedAppt.phone || "—"}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <h4 style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>{i18n.language === 'ar' ? "التفاصيل" : "Détails"}</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CalendarIcon size={16} color="#0891b2" />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{new Date(selectedAppt.apointementdate).toLocaleDateString(i18n.language, { dateStyle: 'long' })}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Clock size={16} color="#0891b2" />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{new Date(selectedAppt.apointementdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Stethoscope size={16} color="#0891b2" />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedAppt.reason_name || "Consultation générale"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>{i18n.language === 'ar' ? "المؤشرات الحيوية" : "Vitals"}</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ padding: 8, borderRadius: 8, background: "#f8fafc", textAlign: "center" }}>
                      <Weight size={14} color="#64748b" style={{ marginBottom: 4 }} />
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{selectedAppt.weight || "—"} kg</div>
                    </div>
                    <div style={{ padding: 8, borderRadius: 8, background: "#f8fafc", textAlign: "center" }}>
                      <Ruler size={14} color="#64748b" style={{ marginBottom: 4 }} />
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{selectedAppt.height || "—"} cm</div>
                    </div>
                    <div style={{ padding: 8, borderRadius: 8, background: "#f8fafc", textAlign: "center" }}>
                      <Heart size={14} color="#64748b" style={{ marginBottom: 4 }} />
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{selectedAppt.heartbeats || "—"} bpm</div>
                    </div>
                    <div style={{ padding: 8, borderRadius: 8, background: "#f8fafc", textAlign: "center" }}>
                      <Droplets size={14} color="#64748b" style={{ marginBottom: 4 }} />
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{selectedAppt.oxygen || "—"} %</div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAppt.note && (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>{i18n.language === 'ar' ? "ملاحظات" : "Notes"}</h4>
                  <div style={{ padding: 12, borderRadius: 10, background: "#f1f5f9", fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    {selectedAppt.note}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                {selectedAppt.status === 0 ? (
                  <>
                    <Btn variant="primary" style={{ flex: 1 }} onClick={() => handleUpdateStatus(selectedAppt.id, 3)}>{i18n.language === 'ar' ? "تأكيد الموعد" : "Confirmer"}</Btn>
                    <Btn variant="danger" style={{ flex: 1 }} onClick={() => handleUpdateStatus(selectedAppt.id, 1)}>{i18n.language === 'ar' ? "إلغاء" : "Annuler"}</Btn>
                  </>
                ) : (
                   <Btn variant="secondary" style={{ flex: 1 }} onClick={() => setSelectedAppt(null)}>{i18n.language === 'ar' ? "إغلاق" : "Fermer"}</Btn>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      <Toast />
    </div>
  );
}
