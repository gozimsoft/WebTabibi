import sys

path = 'frontend/src/pages/AppointmentManager.jsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add doctorLeaves state
target1 = """  const [showEmergencyLeaveModal, setShowEmergencyLeaveModal] = useState(false);"""
repl1 = """  const [showEmergencyLeaveModal, setShowEmergencyLeaveModal] = useState(false);
  const [doctorLeaves, setDoctorLeaves] = useState([]);"""

assert target1 in code, "target1 not found"
code = code.replace(target1, repl1, 1)

# 2. Add fetch active leaves in fetchAppointments
target2 = """      const incoming = Array.isArray(data) ? data : [];"""
repl2 = """      const incoming = Array.isArray(data) ? data : [];

      // Fetch active doctor leaves / absences
      try {
        const docApi = api?.doctor || api?.doctors;
        if (docApi?.getUnavailabilities) {
          const lParams = clinicId && clinicId !== "all" ? { clinic_id: clinicId, _t: Date.now() } : { _t: Date.now() };
          const lRes = await docApi.getUnavailabilities(lParams);
          const lList = Array.isArray(lRes) ? lRes : (lRes?.data || []);
          setDoctorLeaves(lList);
        }
      } catch (e) {}"""

assert target2 in code, "target2 not found"
code = code.replace(target2, repl2, 1)

# 3. Add activeHoliday calculation and banner
target3 = """          {loading && !refreshing ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><Spinner size={40} /></div>"""

repl3 = """          {/* Active Leave / Holiday Banner */}
          {(() => {
            const targetDay = dateFrom || new Date().toISOString().slice(0, 10);
            const holiday = doctorLeaves.find(l => {
              const s = (l.start_datetime || "").slice(0, 10);
              const e = (l.end_datetime || "").slice(0, 10);
              return targetDay >= s && targetDay <= e;
            });
            if (!holiday) return null;
            return (
              <div style={{
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08))",
                border: "1.5px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 16,
                padding: "16px 20px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 14
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <Calendar size={22} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 900, fontSize: 15, color: "var(--heading-color, #1e293b)" }}>
                        🌴 {holiday.reason || "عطلة / غياب مسجل للطبيب"}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                        الحجز متوقف
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary, #64748b)" }}>
                      الفترة: من {holiday.start_datetime?.slice(0, 16)} إلى {holiday.end_datetime?.slice(0, 16)}
                      {holiday.clinicname ? ` — مقر: ${holiday.clinicname}` : " — كافة المقرات"}
                      {" (تمت معالجة المواعيد المتضاربة)"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {loading && !refreshing ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><Spinner size={40} /></div>"""

assert target3 in code, "target3 not found"
code = code.replace(target3, repl3, 1)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("AppointmentManager.jsx patched with doctor leaves banner successfully!")
