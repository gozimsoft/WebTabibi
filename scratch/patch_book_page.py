path = r'd:/Application Web/WebTabibi/frontend/src/pages/Book.jsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add state dayUnavailable
if 'dayUnavailable' not in code:
    code = code.replace(
        '  const [slotsLoad, setSL] = useState(false);',
        '  const [slotsLoad, setSL] = useState(false);\n  const [dayUnavailable, setDayUnavailable] = useState(null);',
        1
    )

# 2. Add day_unavailable check in fetchSlots
target_fetch = """    setSL(true); setSlots([]); setSlot(""); setQueueShifts([]); setSelectedShift(null);
    try {
      const s = await api.appointments.slots({ clinics_doctor_id: doctor.clinicsdoctor_id, date: d });"""

replacement_fetch = """    setSL(true); setSlots([]); setSlot(""); setQueueShifts([]); setSelectedShift(null); setDayUnavailable(null);
    try {
      const s = await api.appointments.slots({ clinics_doctor_id: doctor.clinicsdoctor_id, date: d });
      if (s.day_unavailable) {
        setDayUnavailable({ isUnavailable: true, reason: s.reason });
        return;
      }"""

if 's.day_unavailable' not in code and target_fetch in code:
    code = code.replace(target_fetch, replacement_fetch, 1)

# 3. Add dayUnavailable banner rendering
target_render = """              {slotsLoad ? (
                <div style={{ padding: 24, textAlign: "center" }}><Spinner /></div>
              ) : bookingMode === 'queue' ? ("""

replacement_render = """              {slotsLoad ? (
                <div style={{ padding: 24, textAlign: "center" }}><Spinner /></div>
              ) : dayUnavailable?.isUnavailable ? (
                <div style={{
                  padding: "24px 20px",
                  borderRadius: 16,
                  background: "#fef3c7",
                  border: "1.5px solid #f59e0b",
                  color: "#92400e",
                  textAlign: "center",
                  margin: "8px 0"
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🛑</div>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                    {dayUnavailable.reason || "الطبيب في عطلة / غير متاح في هذا اليوم"}
                  </div>
                  <div style={{ fontSize: 13, color: "#b45309" }}>
                    يرجى اختيار يوم عمل آخر من شريط الأيام بالأعلى لإتمام حجزك.
                  </div>
                </div>
              ) : bookingMode === 'queue' ? ("""

if 'dayUnavailable?.isUnavailable' not in code and target_render in code:
    code = code.replace(target_render, replacement_render, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: Book.jsx patched with day_unavailable support")
