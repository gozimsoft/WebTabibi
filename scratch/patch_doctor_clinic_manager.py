path = r'd:/Application Web/WebTabibi/frontend/src/components/DoctorClinicManager.jsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add import
if 'import DoctorLeavesManager' not in code:
    code = code.replace(
        'import { Btn, Card, Spinner, Input, Badge } from "./SharedUI";',
        'import { Btn, Card, Spinner, Input, Badge } from "./SharedUI";\nimport DoctorLeavesManager from "./DoctorLeavesManager";',
        1
    )

# 2. Add 'leaves' to activeSubTab whitelist
code = code.replace(
    '["info", "doctors", "requests", "pricing", "schedule", "booking_system", "reasons", "off_hours"]',
    '["info", "doctors", "requests", "pricing", "schedule", "booking_system", "reasons", "off_hours", "leaves"]'
)

# 3. Add tab button for leaves next to off_hours (Owner bar)
target_btn1 = """                <button
                  type="button"
                  onClick={() => setActiveSubTab("off_hours")}"""

btn1_replacement = """                <button
                  type="button"
                  onClick={() => setActiveSubTab("leaves")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSubTab === "leaves" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
                    color: activeSubTab === "leaves" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <Calendar size={16} />
                  {isRtl ? "الإجازات والطلعات الطارئة" : "Congés & Absences"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("off_hours")}"""

if 'setActiveSubTab("leaves")' not in code and target_btn1 in code:
    code = code.replace(target_btn1, btn1_replacement, 1)

# 4. Add tab button for leaves (Non-owner bar)
target_btn2 = """                <button
                  type="button"
                  onClick={() => setActiveSubTab("off_hours")}"""

# Replace second occurrence
parts = code.split(target_btn2)
if len(parts) >= 3:
    code = parts[0] + target_btn2 + parts[1] + btn1_replacement + parts[2]

# 5. Render leaves tab content
target_content = """          {/* ──────────────────────────────────────────────────────────
              TAB 5: CLINIC INFO & GPS (بيانات المقر والموقع)
              ────────────────────────────────────────────────────────── */}"""

leaves_content = """          {/* ──────────────────────────────────────────────────────────
              TAB: DOCTOR LEAVES & EMERGENCY ABSENCES (الإجازات والطلعات)
              ────────────────────────────────────────────────────────── */}
          {activeSubTab === "leaves" && (
            <DoctorLeavesManager
              api={api}
              selectedClinicId={selectedClinicId}
              clinics={clinicData?.affiliated_clinics || []}
              showToast={showToast}
              isMobile={isMobile}
              isRtl={isRtl}
            />
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 5: CLINIC INFO & GPS (بيانات المقر والموقع)
              ────────────────────────────────────────────────────────── */}"""

if 'activeSubTab === "leaves"' not in code and target_content in code:
    code = code.replace(target_content, leaves_content, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: DoctorClinicManager.jsx patched with leaves subtab")
