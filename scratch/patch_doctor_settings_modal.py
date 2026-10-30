import os

target = 'D:/Application Web/Tabibi_Rect/client/src/components/settings/DoctorSettingsModal.tsx'

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update lucide-react imports to add ListOrdered, Sun, Moon
old_imports = """  CalendarDays,
  ShieldCheck,
  FolderSync,
  Globe,
  UserPlus
} from 'lucide-react';"""

new_imports = """  CalendarDays,
  ShieldCheck,
  FolderSync,
  Globe,
  UserPlus,
  ListOrdered,
  Sun,
  Moon
} from 'lucide-react';"""

content = content.replace(old_imports, new_imports)

# 2. Add state declarations
old_state = """  // Tab 7: Appointment Setting
  const [timeScale, setTimeScale] = useState(15);
  const [daytimeStart, setDaytimeStart] = useState('08:00');
  const [daytimeEnd, setDaytimeEnd] = useState('17:00');
  const [weekBeginDay, setWeekBeginDay] = useState(0); // 0 = Sat, 1 = Sun, 2 = Mon
  const [countDays, setCountDays] = useState(7);
  const [isRegistered, setIsRegistered] = useState(false);
  const [workingDays, setWorkingDays] = useState<boolean[]>([true, true, true, true, true, false, false]); // Sat..Fri"""

new_state = """  // Tab 7: Appointment Setting
  const [timeScale, setTimeScale] = useState(15);
  const [daytimeStart, setDaytimeStart] = useState('08:00');
  const [daytimeEnd, setDaytimeEnd] = useState('17:00');
  const [weekBeginDay, setWeekBeginDay] = useState(0); // 0 = Sat, 1 = Sun, 2 = Mon
  const [countDays, setCountDays] = useState(7);
  const [isRegistered, setIsRegistered] = useState(false);
  const [workingDays, setWorkingDays] = useState<boolean[]>([true, true, true, true, true, false, false]); // Sat..Fri

  // Dual Booking & Queue Settings
  const [bookingMode, setBookingMode] = useState<number>(0); // 0 = Time Slots, 1 = Queue Numbers
  const [shiftMode, setShiftMode] = useState<number>(1); // 1 = Single Shift, 2 = Two Shifts
  const [morningStart, setMorningStart] = useState('08:30');
  const [morningEnd, setMorningEnd] = useState('12:30');
  const [morningCapacity, setMorningCapacity] = useState<number>(40);
  const [eveningStart, setEveningStart] = useState('13:30');
  const [eveningEnd, setEveningEnd] = useState('17:30');
  const [eveningCapacity, setEveningCapacity] = useState<number>(40);
  const [allowOverbooking, setAllowOverbooking] = useState(false);"""

content = content.replace(old_state, new_state)

# 3. Add hydration in if (a)
old_hydrate = """        if (a) {
          setTimeScale(a.timeScale || 15);
          setDaytimeStart(a.daytimeStart || '08:00');
          setDaytimeEnd(a.daytimeEnd || '17:00');
          setWeekBeginDay(a.weekBeginDay ?? 0);
          setCountDays(a.countDays || 7);
          setIsRegistered(Boolean(a.isRegistered));
          if (a.workingDays && a.workingDays.length === 7) {
            setWorkingDays(a.workingDays.split('').map((char: string) => char === '1'));
          }
        }"""

new_hydrate = """        if (a) {
          setTimeScale(a.timeScale || 15);
          setDaytimeStart(a.daytimeStart || '08:00');
          setDaytimeEnd(a.daytimeEnd || '17:00');
          setWeekBeginDay(a.weekBeginDay ?? 0);
          setCountDays(a.countDays || 7);
          setIsRegistered(Boolean(a.isRegistered));
          if (a.workingDays && a.workingDays.length === 7) {
            setWorkingDays(a.workingDays.split('').map((char: string) => char === '1'));
          }
          setBookingMode(a.bookingMode ?? 0);
          setShiftMode(a.shiftMode ?? 1);
          setMorningStart(a.morningStart ? a.morningStart.slice(0, 5) : '08:30');
          setMorningEnd(a.morningEnd ? a.morningEnd.slice(0, 5) : '12:30');
          setMorningCapacity(Number(a.morningCapacity) || 40);
          setEveningStart(a.eveningStart ? a.eveningStart.slice(0, 5) : '13:30');
          setEveningEnd(a.eveningEnd ? a.eveningEnd.slice(0, 5) : '17:30');
          setEveningCapacity(Number(a.eveningCapacity) || 40);
          setAllowOverbooking(Boolean(a.allowOverbooking));
        }"""

content = content.replace(old_hydrate, new_hydrate)

# 4. Add fields to appointmentSettings in handleSaveAll
old_payload = """        appointmentSettings: {
          timeScale,
          daytimeStart,
          daytimeEnd,
          weekBeginDay,
          workingDays: workingDaysStr,
          countDays: Number(countDays) || 7,
          styleCalendar: 'Day',
          isRegistered
        },"""

new_payload = """        appointmentSettings: {
          timeScale,
          daytimeStart,
          daytimeEnd,
          weekBeginDay,
          workingDays: workingDaysStr,
          countDays: Number(countDays) || 7,
          styleCalendar: 'Day',
          isRegistered,
          bookingMode,
          shiftMode,
          morningStart: `${morningStart}:00`,
          morningEnd: `${morningEnd}:00`,
          morningCapacity: Number(morningCapacity) || 40,
          eveningStart: `${eveningStart}:00`,
          eveningEnd: `${eveningEnd}:00`,
          eveningCapacity: Number(eveningCapacity) || 40,
          allowOverbooking
        },"""

content = content.replace(old_payload, new_payload)

# 5. Add UI in Tab 7 (activeTab === 6)
old_tab_end = """                        <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
                          {t(
                            'Seuls les patients déjà répertoriés dans la base de données de la clinique peuvent être programmés pour une consultation (interdit les réservations anonymes ou non enregistrées).',
                            'يقتصر حجز المواعيد حصرياً على المرضى الذين لديهم ملفات مسجلة مسبقاً في قاعدة بيانات العيادة (منع الحجز العشوائي أو غير المسجل).'
                          )}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              )}"""

new_tab_end = """                        <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
                          {t(
                            'Seuls les patients déjà répertoriés dans la base de données de la clinique peuvent être programmés pour une consultation (interdit les réservations anonymes ou non enregistrées).',
                            'يقتصر حجز المواعيد حصرياً على المرضى الذين لديهم ملفات مسجلة مسبقاً في قاعدة بيانات العيادة (منع الحجز العشوائي أو غير المسجل).'
                          )}
                        </p>
                      </label>
                    </div>

                    {/* 3. Dual Booking Mode & Shifts Configuration */}
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '14px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ListOrdered size={16} color="#0891b2" />
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          {t('Mode de gestion des rendez-vous & File d\\'attente', 'نظام إدارة المواعيد وقائمة الانتظار')}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                        <div
                          onClick={() => setBookingMode(0)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: `2px solid ${bookingMode === 0 ? '#0284c7' : '#e2e8f0'}`,
                            background: bookingMode === 0 ? '#f0f9ff' : '#f8fafc',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Clock size={15} color={bookingMode === 0 ? '#0284c7' : '#64748b'} />
                            <strong style={{ fontSize: '12.5px', color: bookingMode === 0 ? '#0369a1' : '#334155' }}>
                              {t('Par heure et minute (Time Slots)', 'مواعيد بالساعة والدقيقة')}
                            </strong>
                          </div>
                          <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
                            {t('Créneaux fixes (ex: 09:00, 09:15). Chaque patient choisit son heure exacte.', 'مواعيد محددة بدقة. يختار المريض الساعة المناسبة له.')}
                          </p>
                        </div>

                        <div
                          onClick={() => setBookingMode(1)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: `2px solid ${bookingMode === 1 ? '#0d9488' : '#e2e8f0'}`,
                            background: bookingMode === 1 ? '#f0fdfa' : '#f8fafc',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <ListOrdered size={15} color={bookingMode === 1 ? '#0d9488' : '#64748b'} />
                            <strong style={{ fontSize: '12.5px', color: bookingMode === 1 ? '#0f766e' : '#334155' }}>
                              {t('File d\\'attente & Numéros (Queue Mode)', 'نظام قائمة الدور والتذاكر المرقّمة')}
                            </strong>
                          </div>
                          <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
                            {t('Tirage de ticket séquentiel (1..40) avec calcul du temps estimé de passage.', 'أسبقية الحضور والتذاكر (1..40) مع وقت تقديري لكل دور.')}
                          </p>
                        </div>
                      </div>

                      {/* Shifts selection */}
                      <div style={{
                        marginTop: '4px',
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                            {t('Plages de travail & Capacité de réception', 'فترات العمل اليومية وطاقة الاستيعاب')}
                          </span>
                          <div style={{ display: 'inline-flex', borderRadius: '6px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                            <button
                              type="button"
                              onClick={() => setShiftMode(1)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: shiftMode === 1 ? '#0284c7' : '#ffffff',
                                color: shiftMode === 1 ? '#ffffff' : '#64748b'
                              }}
                            >
                              {t('1 Plage unique', 'فترة واحدة')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShiftMode(2)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: shiftMode === 2 ? '#0284c7' : '#ffffff',
                                color: shiftMode === 2 ? '#ffffff' : '#64748b'
                              }}
                            >
                              {t('2 Plages (Matin + Soir)', 'فترتان (صباحية + مسائية)')}
                            </button>
                          </div>
                        </div>

                        {/* Morning Shift */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', alignItems: 'flex-end', background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <label className="tm-label" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Sun size={12} color="#f59e0b" />
                              <span>{shiftMode === 2 ? t('Début Matin', 'بداية الصباح') : t('Début journée', 'بداية الفترة')}</span>
                            </label>
                            <input className="tm-input" type="time" value={morningStart} onChange={e => setMorningStart(e.target.value)} />
                          </div>
                          <div>
                            <label className="tm-label" style={{ fontSize: '11px' }}>
                              {shiftMode === 2 ? t('Fin Matin', 'نهاية الصباح') : t('Fin journée', 'نهاية الفترة')}
                            </label>
                            <input className="tm-input" type="time" value={morningEnd} onChange={e => setMorningEnd(e.target.value)} />
                          </div>
                          <div>
                            <label className="tm-label" style={{ fontSize: '11px' }}>
                              {t('Capacité (Max)', 'الطاقة الاستيعابية')}
                            </label>
                            <input
                              className="tm-input"
                              type="number"
                              min={1}
                              max={200}
                              value={morningCapacity}
                              onChange={e => setMorningCapacity(Math.max(1, Number(e.target.value)))}
                            />
                          </div>
                        </div>

                        {/* Evening Shift */}
                        {shiftMode === 2 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', alignItems: 'flex-end', background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <div>
                              <label className="tm-label" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Moon size={12} color="#6366f1" />
                                <span>{t('Début Après-midi', 'بداية المساء')}</span>
                              </label>
                              <input className="tm-input" type="time" value={eveningStart} onChange={e => setEveningStart(e.target.value)} />
                            </div>
                            <div>
                              <label className="tm-label" style={{ fontSize: '11px' }}>
                                {t('Fin Après-midi', 'نهاية المساء')}
                              </label>
                              <input className="tm-input" type="time" value={eveningEnd} onChange={e => setEveningEnd(e.target.value)} />
                            </div>
                            <div>
                              <label className="tm-label" style={{ fontSize: '11px' }}>
                                {t('Capacité (Max)', 'الطاقة الاستيعابية')}
                              </label>
                              <input
                                className="tm-input"
                                type="number"
                                min={1}
                                max={200}
                                value={eveningCapacity}
                                onChange={e => setEveningCapacity(Math.max(1, Number(e.target.value)))}
                              />
                            </div>
                          </div>
                        )}

                        {/* Allow Overbooking */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '2px' }}>
                          <input
                            type="checkbox"
                            checked={allowOverbooking}
                            onChange={e => setAllowOverbooking(e.target.checked)}
                            style={{ accentColor: '#0284c7', cursor: 'pointer', width: '15px', height: '15px' }}
                          />
                          <span style={{ fontSize: '11.5px', color: '#334155', fontWeight: 600 }}>
                            {t('Autoriser le dépassement de capacité pour les cas d\\'urgence', 'السماح بتجاوز الطاقة الاستيعابية لحالات الطوارئ والمواعيد المستعجلة')}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}"""

content = content.replace(old_tab_end, new_tab_end)

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)

print("DoctorSettingsModal.tsx patched successfully!")
