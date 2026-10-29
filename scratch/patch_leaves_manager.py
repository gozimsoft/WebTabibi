import sys

path = 'frontend/src/components/DoctorLeavesManager.jsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update loadLeaves to safely resolve API
target_load = """  const loadLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClinicId && selectedClinicId !== "all") {
        params.clinic_id = selectedClinicId;
      }
      const res = await api.doctor.getUnavailabilities(params);"""

repl_load = """  const docApi = api?.doctor || api?.doctors || api;

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClinicId && selectedClinicId !== "all") {
        params.clinic_id = selectedClinicId;
      }
      const fetchFn = docApi?.getUnavailabilities;
      if (!fetchFn) {
        console.warn("getUnavailabilities API method not available");
        setLeaves([]);
        return;
      }
      const res = await fetchFn(params);"""

# 2. Update handleCheckAndSubmit
target_check = """      // Step 1: Pre-check for conflicting appointments
      const conflictCheck = await api.doctor.checkUnavailabilityConflicts({
        clinic_id: payload.clinic_id,
        start_datetime: payload.start_datetime,
        end_datetime: payload.end_datetime,
        leave_type: payload.leave_type,
        shift_type: payload.shift_type
      });"""

repl_check = """      // Step 1: Pre-check for conflicting appointments
      const checkFn = docApi?.checkUnavailabilityConflicts;
      const conflictCheck = checkFn ? await checkFn({
        clinic_id: payload.clinic_id,
        start_datetime: payload.start_datetime,
        end_datetime: payload.end_datetime,
        leave_type: payload.leave_type,
        shift_type: payload.shift_type
      }) : { has_conflicts: false, count: 0 };"""

# 3. Update addUnavailability directly
target_add1 = """        // No conflicts: directly save
        await api.doctor.addUnavailability({
          ...payload,
          resolution_action: "none"
        });"""

repl_add1 = """        // No conflicts: directly save
        const addFn = docApi?.addUnavailability;
        if (addFn) {
          await addFn({
            ...payload,
            resolution_action: "none"
          });
        }"""

# 4. Update execute resolution addUnavailability
target_add2 = """    try {
      await api.doctor.addUnavailability({
        ...pendingPayload,
        resolution_action: selectedAction
      });"""

repl_add2 = """    try {
      const addFn = docApi?.addUnavailability;
      if (addFn) {
        await addFn({
          ...pendingPayload,
          resolution_action: selectedAction
        });
      }"""

# 5. Update delete
target_del = """    try {
      await api.doctor.deleteUnavailability(id);"""

repl_del = """    try {
      const delFn = docApi?.deleteUnavailability;
      if (delFn) {
        await delFn(id);
      }"""

# 6. Update Spinner size="md" to size={32}
target_spin = """<Spinner size="md" />"""
repl_spin = """<Spinner size={32} />"""

for t, r, name in [
    (target_load, repl_load, 'loadLeaves'),
    (target_check, repl_check, 'checkConflicts'),
    (target_add1, repl_add1, 'addUnavailability1'),
    (target_add2, repl_add2, 'addUnavailability2'),
    (target_del, repl_del, 'deleteUnavailability'),
    (target_spin, repl_spin, 'spinner')
]:
    if t not in code:
        print(f"FAILED target: {name}")
        sys.exit(1)
    code = code.replace(t, r, 1)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("DoctorLeavesManager.jsx patched successfully!")
