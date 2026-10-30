path = r'd:/Application Web/WebTabibi/frontend/src/App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove import
code = code.replace('import DoctorOffHoursSettings from "./components/DoctorOffHoursSettings";\n', '')
code = code.replace('import DoctorOffHoursSettings from "./components/DoctorOffHoursSettings";\r\n', '')

# 2. Update initial tab state
target_initial = """  const initialOffHours = initialTab === "off_hours";
  const [doctorActiveTab, setDoctorActiveTab] = useState(
    initialSecurity ? "security" :
    initialOffHours ? "off_hours" :
    "profile"
  ); // 'profile' | 'off_hours' | 'security'"""

replacement_initial = """  const initialOffHours = initialTab === "off_hours";
  const [doctorActiveTab, setDoctorActiveTab] = useState(
    initialSecurity ? "security" : "profile"
  ); // 'profile' | 'security'"""

if target_initial in code:
    code = code.replace(target_initial, replacement_initial, 1)

# 3. Add redirect if initialOffHours
target_redirect = """      if (initialClinic) {
        if (navigate) navigate("/clinics");
      } else if (initialSettings) {
        if (navigate) navigate("/clinics?tab=appointment_settings");
      }"""

replacement_redirect = """      if (initialClinic) {
        if (navigate) navigate("/clinics");
      } else if (initialSettings) {
        if (navigate) navigate("/clinics?tab=appointment_settings");
      } else if (initialOffHours) {
        if (navigate) navigate("/clinics?tab=off_hours");
      }"""

if target_redirect in code:
    code = code.replace(target_redirect, replacement_redirect, 1)

# 4. Redirect tab === "off_hours"
target_tab_check = """      } else if (tab === "off_hours") {
        setDoctorActiveTab("off_hours");"""

replacement_tab_check = """      } else if (tab === "off_hours") {
        if (user?.user_type === 1 && navigate) {
          navigate("/clinics?tab=off_hours");
        }"""

if target_tab_check in code:
    code = code.replace(target_tab_check, replacement_tab_check, 1)

# 5. Remove off_hours button in doctor profile header
target_btn = """          <button
            type="button"
            onClick={() => setDoctorActiveTab("off_hours")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "11px 18px",
              borderRadius: 12,
              border: "none",
              background: doctorActiveTab === "off_hours" ? "linear-gradient(135deg, var(--brand, #0891b2), #0891b2)" : "transparent",
              color: doctorActiveTab === "off_hours" ? "#ffffff" : "#64748b",
              fontWeight: doctorActiveTab === "off_hours" ? 800 : 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap"
            }}
          >
            <Clock size={17} />
            {t("off_hours_tab", "أوقات الراحة والعطل")}
          </button>"""

if target_btn in code:
    code = code.replace(target_btn, '', 1)

# 6. Remove tab content render
target_render = """      {/* 3. Doctor Off-Hours Settings Tab */}
      {user?.user_type === 1 && doctorActiveTab === "off_hours" && (
        <DoctorOffHoursSettings doctor={form} showToast={show} isMobile={isMobile} />
      )}"""

if target_render in code:
    code = code.replace(target_render, '', 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: Removed redundant DoctorOffHoursSettings tab from App.jsx")
