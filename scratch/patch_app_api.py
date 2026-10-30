import sys

path = 'frontend/src/App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = """    appointments: p => req("GET", `/doctor/appointments${p ? '?' + new URLSearchParams(p) : ''}`),
  },"""

repl1 = """    appointments: p => req("GET", `/doctor/appointments${p ? '?' + new URLSearchParams(p) : ''}`),
    getUnavailabilities: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return req("GET", `/doctor/unavailabilities${qs ? '?' + qs : ''}`);
    },
    checkUnavailabilityConflicts: b => req("POST", "/doctor/unavailabilities/check-conflicts", b),
    addUnavailability: b => req("POST", "/doctor/unavailabilities", b),
    deleteUnavailability: id => req("DELETE", `/doctor/unavailabilities/${encodeURIComponent(id)}`),
  },"""

target2 = """    searchDoctorsForClinic: (clinicId, q = '') => req("GET", `/doctors/clinic/search-doctors?clinic_id=${encodeURIComponent(clinicId)}&q=${encodeURIComponent(q)}`),
  },"""

repl2 = """    searchDoctorsForClinic: (clinicId, q = '') => req("GET", `/doctors/clinic/search-doctors?clinic_id=${encodeURIComponent(clinicId)}&q=${encodeURIComponent(q)}`),
    getUnavailabilities: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return req("GET", `/doctor/unavailabilities${qs ? '?' + qs : ''}`);
    },
    checkUnavailabilityConflicts: b => req("POST", "/doctor/unavailabilities/check-conflicts", b),
    addUnavailability: b => req("POST", "/doctor/unavailabilities", b),
    deleteUnavailability: id => req("DELETE", `/doctor/unavailabilities/${encodeURIComponent(id)}`),
  },"""

if target1 not in content:
    print("target1 not found")
    sys.exit(1)
if target2 not in content:
    print("target2 not found")
    sys.exit(1)

content = content.replace(target1, repl1, 1)
content = content.replace(target2, repl2, 1)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("Successfully patched App.jsx!")
