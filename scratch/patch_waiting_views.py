import os

# 1. Patch WaitingTableView.tsx
table_path = 'D:/Application Web/Tabibi_Rect/client/src/components/calendar/WaitingTableView.tsx'
with open(table_path, 'r', encoding='utf-8') as f:
    t_content = f.read()

# Replace Index cell in WaitingTableView
old_index_td = """                    {/* Index */}
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, color: isWaiting ? '#d97706' : '#64748b', verticalAlign: 'middle' }}>
                      {idx + 1}
                    </td>"""

new_index_td = """                    {/* Index / Ticket Number */}
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, color: isWaiting ? '#d97706' : '#64748b', verticalAlign: 'middle' }}>
                      {app.TokenNumber ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '32px',
                          height: '24px',
                          padding: '0 6px',
                          borderRadius: '12px',
                          background: isWaiting ? '#fef3c7' : '#e0f2fe',
                          color: isWaiting ? '#92400e' : '#0369a1',
                          border: `1.5px solid ${isWaiting ? '#f59e0b' : '#38bdf8'}`,
                          fontSize: '12px',
                          fontWeight: 800
                        }}>
                          #{app.TokenNumber}
                        </span>
                      ) : (
                        idx + 1
                      )}
                    </td>"""

t_content = t_content.replace(old_index_td, new_index_td)

# Replace Scheduled Time cell in WaitingTableView
old_time_td = """                    {/* Scheduled Time */}
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} color="#0284c7" />
                        <span style={{ fontSize: '12.5px' }}>
                          {app.ApointementDate ? new Date(app.ApointementDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </span>
                      </div>
                    </td>"""

new_time_td = """                    {/* Scheduled & Estimated Time */}
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} color="#0284c7" />
                          <span style={{ fontSize: '12.5px' }}>
                            {app.ApointementDate ? new Date(app.ApointementDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                        </div>
                        {app.EstimatedTime && (
                          <span style={{ fontSize: '10.5px', color: '#0891b2', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <span>~{String(app.EstimatedTime).slice(0, 5)}</span>
                          </span>
                        )}
                      </div>
                    </td>"""

t_content = t_content.replace(old_time_td, new_time_td)

# Add badges next to Patient Name in WaitingTableView
old_patient_name = """                          <strong style={{
                            color: isCancelled ? '#64748b' : '#1e293b',
                            textDecoration: isCancelled ? 'line-through' : 'none',
                            fontSize: '12.5px',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {app.PatientName || '—'}
                          </strong>"""

new_patient_name = """                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <strong style={{
                              color: isCancelled ? '#64748b' : '#1e293b',
                              textDecoration: isCancelled ? 'line-through' : 'none',
                              fontSize: '12.5px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {app.PatientName || '—'}
                            </strong>
                            {app.ShiftType && (
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: app.ShiftType === 'morning' ? '#fef3c7' : '#ede9fe',
                                color: app.ShiftType === 'morning' ? '#92400e' : '#5b21b6'
                              }}>
                                {app.ShiftType === 'morning' ? (isRTL ? 'صباح' : 'Matin') : (isRTL ? 'مساء' : 'Soir')}
                              </span>
                            )}
                            {Boolean(app.IsEmergency) && (
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fca5a5'
                              }}>
                                {isRTL ? 'طوارئ' : 'Urgence'}
                              </span>
                            )}
                          </div>"""

t_content = t_content.replace(old_patient_name, new_patient_name)

with open(table_path, 'w', encoding='utf-8') as f:
    f.write(t_content)

print("WaitingTableView.tsx patched!")

# 2. Patch WaitingScreenView.tsx
screen_path = 'D:/Application Web/Tabibi_Rect/client/src/components/calendar/WaitingScreenView.tsx'
with open(screen_path, 'r', encoding='utf-8') as f:
    s_content = f.read()

# Add Ticket Badge to activeInConsult
old_active_name = """              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                {activeInConsult.PatientName}
              </h2>"""

new_active_name = """              {activeInConsult.TokenNumber && (
                <div style={{
                  background: 'rgba(56, 189, 248, 0.25)',
                  border: '1.5px solid #38bdf8',
                  color: '#ffffff',
                  padding: '4px 16px',
                  borderRadius: '12px',
                  fontSize: '17px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
                }}>
                  {isRTL ? `تذكرة رقم: #${activeInConsult.TokenNumber}` : `Ticket N° #${activeInConsult.TokenNumber}`}
                </div>
              )}
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                {activeInConsult.PatientName}
              </h2>"""

s_content = s_content.replace(old_active_name, new_active_name)

# Update waitingQueue ticket number display
old_queue_num = """                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: i === 0 ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                      color: i === 0 ? '#0c1a2e' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '14px'
                    }}>
                      #{i + 1}
                    </span>"""

new_queue_num = """                    <span style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: i === 0 ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)',
                      color: i === 0 ? '#0c1a2e' : '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '14px'
                    }}>
                      #{app.TokenNumber || (i + 1)}
                    </span>"""

s_content = s_content.replace(old_queue_num, new_queue_num)

with open(screen_path, 'w', encoding='utf-8') as f:
    f.write(s_content)

print("WaitingScreenView.tsx patched!")
