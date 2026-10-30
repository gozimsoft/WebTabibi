path = r'd:/Application Web/WebTabibi/frontend/src/pages/AppointmentManager.jsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add import
if 'import QuickEmergencyLeaveModal' not in code:
    code = code.replace(
        'import { Btn, Spinner, useToast } from "../components/SharedUI";',
        'import { Btn, Spinner, useToast } from "../components/SharedUI";\nimport QuickEmergencyLeaveModal from "../components/QuickEmergencyLeaveModal";',
        1
    )

# 2. Add state showEmergencyLeaveModal
if 'showEmergencyLeaveModal' not in code:
    code = code.replace(
        '  const [showModal, setShowModal] = useState(false);',
        '  const [showModal, setShowModal] = useState(false);\n  const [showEmergencyLeaveModal, setShowEmergencyLeaveModal] = useState(false);',
        1
    )

# 3. Add button next to New Appointment button
target_btn = """                <button
                  onClick={() => setShowModal(true)}"""

emergency_btn = """                <button
                  type="button"
                  onClick={() => setShowEmergencyLeaveModal(true)}
                  title="تسجيل طلعة طارئة لإيقاف المواعيد اليوم"
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 13,
                    border: "1.5px solid rgba(239, 68, 68, 0.35)",
                    cursor: "pointer",
                    transition: "0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(239, 68, 68, 0.12)",
                    color: "#ef4444"
                  }}
                >
                  <Clock size={16} />
                  <span>⚡ طلعة طارئة</span>
                </button>

                <button
                  onClick={() => setShowModal(true)}"""

if 'setShowEmergencyLeaveModal(true)' not in code and target_btn in code:
    code = code.replace(target_btn, emergency_btn, 1)

# 4. Render modal next to NewAppointmentModal
target_modal = """      {/* Modal */}
      <NewAppointmentModal"""

replacement_modal = """      {/* Emergency Leave Modal */}
      <QuickEmergencyLeaveModal
        show={showEmergencyLeaveModal}
        onClose={() => setShowEmergencyLeaveModal(false)}
        onSuccess={() => fetchAppointments(true)}
        clinicId={selectedClinicId}
      />

      {/* Modal */}
      <NewAppointmentModal"""

if '<QuickEmergencyLeaveModal' not in code and target_modal in code:
    code = code.replace(target_modal, replacement_modal, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: AppointmentManager.jsx patched with emergency leave modal and button")
