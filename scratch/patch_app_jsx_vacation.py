import re

app_path = r'd:/Application Web/WebTabibi/frontend/src/App.jsx'
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. In BookPage: add dayUnavailable state
target_state = '  const [alreadyBooked, setAlreadyBooked] = useState(null);'
repl_state = '  const [alreadyBooked, setAlreadyBooked] = useState(null);\n  const [dayUnavailable, setDayUnavailable] = useState(null);'
if 'const [dayUnavailable, setDayUnavailable]' not in content and target_state in content:
    content = content.replace(target_state, repl_state, 1)
    print("1. Added dayUnavailable state in BookPage")

# 2. In BookPage fetchSlots: add day_unavailable handling
target_fetch = """    setAlreadyBooked(null);
    try {
      const s = await api.appointments.slots({
        clinics_doctor_id: doctor.clinicsdoctor_id,
        date: d,
        patient_id: activePat?.id || ""
      });"""

repl_fetch = """    setAlreadyBooked(null);
    setDayUnavailable(null);
    try {
      const s = await api.appointments.slots({
        clinics_doctor_id: doctor.clinicsdoctor_id,
        date: d,
        patient_id: activePat?.id || ""
      });
      if (s.day_unavailable) {
        setDayUnavailable({ isUnavailable: true, reason: s.reason });
        return;
      }"""

if 'if (s.day_unavailable)' not in content and target_fetch in content:
    content = content.replace(target_fetch, repl_fetch, 1)
    print("2. Added day_unavailable check in BookPage fetchSlots")

# 3. In BookPage: Update getAvailableDates with unavailabilities
target_dates = """  const getAvailableDates = () => {
    const schedule = doctor?.Schedule || {};
    const countdays = parseInt(schedule.countdays || 30);
    const workingdays = schedule.workingdays || "1111111";

    const dates = [];

    for (let i = 0; i <= countdays; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const full = `${yyyy}-${mm}-${dd}`;

      const w = d.getDay(); // 0=Sun...6=Sat
      const dayIndex = (w + 6) % 7; // 0=Mon...6=Sun matching Delphi workingdays

      if (workingdays[dayIndex] === "1" || !schedule.workingdays) {
        dates.push({
          full: full,
          day: d.getDate(),
          month: d.toLocaleDateString("ar-DZ", { month: "short" }),
          weekday: d.toLocaleDateString("ar-DZ", { weekday: "short" }),
        });
      }
    }
    return dates;
  };"""

repl_dates = """  const getAvailableDates = () => {
    const schedule = doctor?.Schedule || {};
    const countdays = parseInt(schedule.countdays || 30);
    const workingdays = schedule.workingdays || "1111111";
    const unavails = doctor?.unavailabilities || docInfo?.unavailabilities || [];

    const dates = [];

    for (let i = 0; i <= countdays; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const full = `${yyyy}-${mm}-${dd}`;

      const w = d.getDay(); // 0=Sun...6=Sat
      const dayIndex = (w + 6) % 7; // 0=Mon...6=Sun matching Delphi workingdays

      if (workingdays[dayIndex] === "1" || !schedule.workingdays) {
        const isDayInLeave = unavails.some(u => {
          if (u.leave_type !== 'full_day') return false;
          const s = u.start_datetime?.slice(0, 10);
          const e = u.end_datetime?.slice(0, 10);
          return full >= s && full <= e;
        });
        dates.push({
          full: full,
          day: d.getDate(),
          month: d.toLocaleDateString("ar-DZ", { month: "short" }),
          weekday: d.toLocaleDateString("ar-DZ", { weekday: "short" }),
          isLeave: isDayInLeave,
        });
      }
    }
    return dates;
  };

  useEffect(() => {
    if (step === 4 && !date) {
      const avail = getAvailableDates();
      const firstAvailable = avail.find(d => !d.isLeave) || avail[0];
      if (firstAvailable) {
        setDate(firstAvailable.full);
        fetchSlots(firstAvailable.full);
      }
    }
  }, [step, doctor, docInfo, date]);"""

if 'const unavails = doctor?.unavailabilities || docInfo?.unavailabilities' not in content and target_dates in content:
    content = content.replace(target_dates, repl_dates, 1)
    print("3. Updated getAvailableDates in BookPage")

# 4. In BookPage: Add vacation alert above Stepper
target_stepper = """      <DoctorBanner />
      <Stepper />"""

repl_stepper = """      <DoctorBanner />

      {/* Doctor Vacation Alert Banner */}
      {(() => {
        const unavails = doctor?.unavailabilities || docInfo?.unavailabilities || [];
        if (!unavails.length) return null;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const activeLeave = unavails.find(u => (u.end_datetime?.slice(0, 10) || '') >= todayStr);
        if (!activeLeave) return null;
        const s = activeLeave.start_datetime?.slice(0, 10);
        const e = activeLeave.end_datetime?.slice(0, 10);
        const isCurrent = todayStr >= s && todayStr <= e;
        return (
          <div style={{
            background: isCurrent ? "linear-gradient(135deg, #fef3c7, #fffbeb)" : "linear-gradient(135deg, #e0f2fe, #f0f9ff)",
            border: isCurrent ? "1.5px solid #f59e0b" : "1.5px solid #0284c7",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🌴</span>
            <div style={{ fontSize: 13, color: isCurrent ? "#92400e" : "#075985", lineHeight: 1.5 }}>
              <strong>{isCurrent ? (i18n.language === 'ar' ? "تنبيه للمريض:" : "Avis aux patients:") : (i18n.language === 'ar' ? "تنويه:" : "Information:")}</strong> {i18n.language === 'ar' ? "الطبيب في عطلة من" : "Le médecin est en congé du"} <strong>{s}</strong> {i18n.language === 'ar' ? "إلى غاية" : "au"} <strong>{e}</strong> {activeLeave.show_reason_to_patient && activeLeave.reason ? `(${activeLeave.reason})` : ""}.
              {i18n.language === 'ar' ? " يرجى اختيار تاريخ عمل متاح بعد انتهاء العطلة لإتمام حجزك." : " Veuillez choisir une date de consultation après la fin du congé."}
            </div>
          </div>
        );
      })()}

      <Stepper />"""

if '{/* Doctor Vacation Alert Banner */}' not in content and target_stepper in content:
    content = content.replace(target_stepper, repl_stepper, 1)
    print("4. Added vacation alert above Stepper in BookPage")

# 5. In BookPage: Update day card styling in Step 4
target_day_card = """              {getAvailableDates().map(d => {
                const sel = date === d.full;
                return (
                  <div key={d.full} onClick={() => { setDate(d.full); fetchSlots(d.full); }}
                    style={{
                      flexShrink: 0, width: 80, padding: "12px 8px", borderRadius: 14, textAlign: "center", cursor: "pointer",
                      border: sel ? "2.5px solid var(--brand)" : "1.5px solid var(--border)",
                      background: sel ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : "#fff",
                      transition: "all 0.2s",
                      boxShadow: sel ? "0 4px 12px rgba(8,145,178,0.15)" : "none",
                      transform: sel ? "translateY(-2px)" : "none"
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: sel ? "var(--brand)" : "#9ca3af", marginBottom: 4 }}>{d.weekday}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: sel ? "#0c4a6e" : "#374151" }}>{d.day}</div>
                    <div style={{ fontSize: 11, color: sel ? "var(--brand)" : "#9ca3af" }}>{d.month}</div>
                  </div>
                );
              })}"""

repl_day_card = """              {getAvailableDates().map(d => {
                const sel = date === d.full;
                return (
                  <div key={d.full} onClick={() => { setDate(d.full); fetchSlots(d.full); }}
                    style={{
                      flexShrink: 0, width: 84, padding: "12px 8px", borderRadius: 14, textAlign: "center", cursor: "pointer",
                      border: sel ? "2.5px solid var(--brand)" : d.isLeave ? "1.5px solid #fde68a" : "1.5px solid var(--border)",
                      background: sel ? "linear-gradient(135deg,#ecfeff,#e0f7fa)" : d.isLeave ? "#fffbeb" : "#fff",
                      transition: "all 0.2s",
                      boxShadow: sel ? "0 4px 12px rgba(8,145,178,0.15)" : "none",
                      transform: sel ? "translateY(-2px)" : "none",
                      position: "relative"
                    }}
                  >
                    {d.isLeave && (
                      <span style={{ position: "absolute", top: 3, left: 4, fontSize: 10 }}>🌴</span>
                    )}
                    <div style={{ fontSize: 11, fontWeight: 700, color: sel ? "var(--brand)" : d.isLeave ? "#d97706" : "#9ca3af", marginBottom: 4 }}>{d.weekday}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: sel ? "#0c4a6e" : d.isLeave ? "#b45309" : "#374151" }}>{d.day}</div>
                    <div style={{ fontSize: 11, fontWeight: d.isLeave ? 700 : 400, color: sel ? "var(--brand)" : d.isLeave ? "#d97706" : "#9ca3af" }}>
                      {d.isLeave ? "عطلة" : d.month}
                    </div>
                  </div>
                );
              })}"""

if 'd.isLeave ? "عطلة" : d.month' not in content and target_day_card in content:
    content = content.replace(target_day_card, repl_day_card, 1)
    print("5. Updated day cards with holiday styling in BookPage")

# 6. In BookPage: Render dayUnavailable alert banner in Step 4
target_slot_load = """              {slotsLoad ? (
                <div style={{ padding: "30px 0", textAlign: "center" }}><Spinner /></div>
              ) : alreadyBooked ? ("""

repl_slot_load = """              {slotsLoad ? (
                <div style={{ padding: "30px 0", textAlign: "center" }}><Spinner /></div>
              ) : dayUnavailable?.isUnavailable ? (
                <div style={{
                  padding: "26px 22px",
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #fef3c7, #fffbeb)",
                  border: "1.5px solid #f59e0b",
                  color: "#92400e",
                  textAlign: "center",
                  margin: "12px 0 20px"
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🛑</div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
                    {dayUnavailable.reason || "الطبيب في عطلة / غير متاح في هذا اليوم"}
                  </div>
                  <div style={{ fontSize: 13, color: "#b45309", lineHeight: 1.6 }}>
                    يرجى اختيار يوم عمل آخر من شريط الأيام بالأعلى لإتمام حجزك.
                  </div>
                </div>
              ) : alreadyBooked ? ("""

if 'dayUnavailable?.isUnavailable' not in content and target_slot_load in content:
    content = content.replace(target_slot_load, repl_slot_load, 1)
    print("6. Added dayUnavailable banner rendering in Step 4")

# 7. In BookPage: Disable next button if dayUnavailable
target_next_btn = 'disabled={!date || alreadyBooked || (bookingMode === \'queue\' ? (!selectedShift || selectedShift.is_full) : !selSlot)}'
repl_next_btn = 'disabled={!date || alreadyBooked || dayUnavailable?.isUnavailable || (bookingMode === \'queue\' ? (!selectedShift || selectedShift.is_full) : !selSlot)}'
if target_next_btn in content:
    content = content.replace(target_next_btn, repl_next_btn, 1)
    print("7. Disabled next button when dayUnavailable in BookPage")

# 8. In DoctorDetailPage: Add badge under Book button and banner under Doctor header
target_book_btn_doc = """                  <Btn
                    onClick={() => navigate(`/book/${selectedClinicId || 0}/${doctor_id}`)}
                    className="book-btn"
                    style={{ padding: "12px 24px", justifyContent: "center" }}
                  >
                    <Calendar size={18} /> {t("book_appointment")}
                  </Btn>"""

repl_book_btn_doc = """                  <Btn
                    onClick={() => navigate(`/book/${selectedClinicId || 0}/${doctor_id}`)}
                    className="book-btn"
                    style={{ padding: "12px 24px", justifyContent: "center" }}
                  >
                    <Calendar size={18} /> {t("book_appointment")}
                  </Btn>
                  {(() => {
                    const unavails = data?.unavailabilities || [];
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    const curLeave = unavails.find(u => {
                      const s = u.start_datetime?.slice(0, 10);
                      const e = u.end_datetime?.slice(0, 10);
                      return todayStr >= s && todayStr <= e;
                    });
                    if (!curLeave) return null;
                    return (
                      <div style={{ fontSize: 11, color: "#d97706", fontWeight: 800, textAlign: "center", background: "#fef3c7", padding: "5px 10px", borderRadius: 8, border: "1px solid #fde68a" }}>
                        🌴 في عطلة حتى {curLeave.end_datetime?.slice(0, 10)}
                      </div>
                    );
                  })()}"""

if '🌴 في عطلة حتى' not in content and target_book_btn_doc in content:
    content = content.replace(target_book_btn_doc, repl_book_btn_doc, 1)
    print("8. Added vacation badge under Book button in DoctorDetailPage")

# 9. In DoctorDetailPage: Add prominent vacation banner after Doctor header card
target_doc_card_end = """        </div>
      </Card>

      {/* Virtual Doctor Claim Banner — shown when emailvalidation is not confirmed (NULL or 0) */}"""

repl_doc_card_end = """        </div>
      </Card>

      {/* Vacation / Leave Banner if Doctor is on leave or has upcoming leave */}
      {(() => {
        const unavails = data?.unavailabilities || [];
        if (!unavails.length) return null;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        const activeOrUpcoming = unavails.find(u => {
          const end = u.end_datetime?.slice(0, 10);
          return end >= todayStr;
        });

        if (!activeOrUpcoming) return null;

        const start = activeOrUpcoming.start_datetime?.slice(0, 10);
        const end = activeOrUpcoming.end_datetime?.slice(0, 10);
        const isCurrent = todayStr >= start && todayStr <= end;

        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return (
          <Card style={{
            marginBottom: 20,
            background: isCurrent ? "linear-gradient(135deg, #fef3c7, #fffbeb)" : "linear-gradient(135deg, #e0f2fe, #f0f9ff)",
            border: isCurrent ? "1.5px solid #f59e0b" : "1.5px solid #0284c7",
            padding: "18px 22px",
            borderRadius: 16,
            boxShadow: "0 4px 14px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>🌴</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: isCurrent ? "#92400e" : "#075985" }}>
                    {isCurrent ? "تنبيه: الطبيب في عطلة حالياً" : "تنويه للمرضى: عطلة مبرمجة قادمة للطبيب"}
                  </h3>
                  <span style={{
                    background: isCurrent ? "#fde68a" : "#bae6fd",
                    color: isCurrent ? "#854d0e" : "#0369a1",
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 800
                  }}>
                    {diffDays > 1 ? `المدة: ${diffDays} أيام` : "المدة: يوم واحد"}
                  </span>
                  {activeOrUpcoming.leave_type === 'full_day' && (
                    <span style={{
                      background: isCurrent ? "#fee2e2" : "#f1f5f9",
                      color: isCurrent ? "#991b1b" : "#475569",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      عطلة كاملة
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: isCurrent ? "#78350f" : "#0c4a6e", lineHeight: 1.6, marginBottom: 4 }}>
                  فترة العطلة: من <strong>{start}</strong> إلى غاية <strong>{end}</strong>
                  {activeOrUpcoming.show_reason_to_patient && activeOrUpcoming.reason ? (
                    <span> — السبب: <strong>{activeOrUpcoming.reason}</strong></span>
                  ) : null}
                </div>
                <div style={{ fontSize: 12, color: isCurrent ? "#b45309" : "#0284c7", fontWeight: 700 }}>
                  {isCurrent
                    ? "⚠️ تنبيه: الحجز متوقف خلال فترة العطلة. يمكنك حجز موعد في الأيام المتاحة بعد استئناف العمل."
                    : "ℹ️ لن تكون المواعيد متاحة خلال فترة العطلة أعلاه. يرجى اختيار تاريخ مناسب خارجها."}
                </div>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Virtual Doctor Claim Banner — shown when emailvalidation is not confirmed (NULL or 0) */}"""

if '{/* Vacation / Leave Banner if Doctor is on leave or has upcoming leave */}' not in content and target_doc_card_end in content:
    content = content.replace(target_doc_card_end, repl_doc_card_end, 1)
    print("9. Added vacation banner in DoctorDetailPage in App.jsx")

# 10. In SearchPage in App.jsx: Add holiday badge next to specialty
target_search_specialty = """                        <Badge color={specialtyColor} style={{ fontSize: 10, padding: "2px 6px", width: "fit-content", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {specialty || "\\u00A0"}
                        </Badge>"""

repl_search_specialty = """                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <Badge color={specialtyColor} style={{ fontSize: 10, padding: "2px 6px", width: "fit-content", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {specialty || "\\u00A0"}
                          </Badge>
                          {isDoctor && r.active_unavailability && (
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              background: "#fef3c7",
                              color: "#92400e",
                              border: "1px solid #f59e0b",
                              borderRadius: 20,
                              padding: "2px 8px",
                              fontSize: 10,
                              fontWeight: 800
                            }}>
                              🌴 في عطلة حتى {r.active_unavailability.end_datetime?.slice(0, 10)}
                            </span>
                          )}
                        </div>"""

if 'r.active_unavailability' not in content and target_search_specialty in content:
    content = content.replace(target_search_specialty, repl_search_specialty, 1)
    print("10. Added vacation badge in SearchPage in App.jsx")

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("ALL APP.JSX UPDATES COMPLETED!")
