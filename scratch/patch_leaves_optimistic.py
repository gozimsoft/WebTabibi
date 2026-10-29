import sys

path = 'frontend/src/components/DoctorLeavesManager.jsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# Add parseDateSafe helper before getLeaveTypeBadge
target_helper = """  const getLeaveTypeBadge = (type) => {"""
repl_helper = """  const parseDateSafe = (dStr) => {
    if (!dStr) return new Date();
    return new Date(String(dStr).replace(" ", "T"));
  };

  const getLeaveTypeBadge = (type) => {"""

assert target_helper in code, "target_helper not found"
code = code.replace(target_helper, repl_helper, 1)

# Update loadLeaves with cache-busting
target_load = """      const params = {};
      if (selectedClinicId && selectedClinicId !== "all") {
        params.clinic_id = selectedClinicId;
      }"""

repl_load = """      const params = { _t: Date.now() };
      if (selectedClinicId && selectedClinicId !== "all") {
        params.clinic_id = selectedClinicId;
      }"""

assert target_load in code, "target_load not found"
code = code.replace(target_load, repl_load, 1)

# Optimistic update in handleCheckAndSubmit (no conflicts branch)
target_direct = """        // No conflicts: directly save
        const addFn = docApi?.addUnavailability;
        if (addFn) {
          await addFn({
            ...payload,
            resolution_action: "none"
          });
        }
        if (showToast) showToast(isRtl ? "تم تسجيل الغياب وإيقاف الحجوزات بنجاح" : "Absence enregistrée avec succès", "success");
        setShowAddForm(false);
        loadLeaves();"""

repl_direct = """        // No conflicts: directly save
        const addFn = docApi?.addUnavailability;
        let saveRes = null;
        if (addFn) {
          saveRes = await addFn({
            ...payload,
            resolution_action: "none"
          });
        }
        const createdItem = {
          id: saveRes?.id || (saveRes?.data?.id) || ('temp_' + Date.now()),
          doctor_id: '',
          clinic_id: payload.clinic_id,
          clinicsdoctor_id: null,
          leave_type: payload.leave_type,
          start_datetime: payload.start_datetime,
          end_datetime: payload.end_datetime,
          shift_type: payload.shift_type,
          reason: payload.reason,
          show_reason_to_patient: payload.show_reason_to_patient ? 1 : 0,
          is_past: false,
          clinicname: clinics.find(c => (c.clinic_id || c.id) === payload.clinic_id)?.name || clinics.find(c => (c.clinic_id || c.id) === payload.clinic_id)?.clinicname || null
        };
        setLeaves(prev => [createdItem, ...prev.filter(x => x.id !== createdItem.id)]);
        if (showToast) showToast(isRtl ? "تم تسجيل الغياب وإيقاف الحجوزات بنجاح" : "Absence enregistrée avec succès", "success");
        setShowAddForm(false);
        await loadLeaves();"""

assert target_direct in code, "target_direct not found"
code = code.replace(target_direct, repl_direct, 1)

# Optimistic update in handleExecuteResolution
target_res = """      const addFn = docApi?.addUnavailability;
      if (addFn) {
        await addFn({
          ...pendingPayload,
          resolution_action: selectedAction
        });
      }"""

repl_res = """      const addFn = docApi?.addUnavailability;
      let saveRes = null;
      if (addFn) {
        saveRes = await addFn({
          ...pendingPayload,
          resolution_action: selectedAction
        });
      }
      const createdItem = {
        id: saveRes?.id || (saveRes?.data?.id) || ('temp_' + Date.now()),
        doctor_id: '',
        clinic_id: pendingPayload.clinic_id,
        clinicsdoctor_id: null,
        leave_type: pendingPayload.leave_type,
        start_datetime: pendingPayload.start_datetime,
        end_datetime: pendingPayload.end_datetime,
        shift_type: pendingPayload.shift_type,
        reason: pendingPayload.reason,
        show_reason_to_patient: pendingPayload.show_reason_to_patient ? 1 : 0,
        is_past: false,
        clinicname: clinics.find(c => (c.clinic_id || c.id) === pendingPayload.clinic_id)?.name || clinics.find(c => (c.clinic_id || c.id) === pendingPayload.clinic_id)?.clinicname || null
      };
      setLeaves(prev => [createdItem, ...prev.filter(x => x.id !== createdItem.id)]);"""

assert target_res in code, "target_res not found"
code = code.replace(target_res, repl_res, 1)

# Update loadLeaves in handleExecuteResolution
target_load_res = """      setShowAddForm(false);
      loadLeaves();"""

repl_load_res = """      setShowAddForm(false);
      await loadLeaves();"""

assert target_load_res in code, "target_load_res not found"
code = code.replace(target_load_res, repl_load_res, 1)

# Update date formatting in JSX
target_date_map = """            {leaves.map(item => {
              const startFmt = new Date(item.start_datetime).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
                hour: item.leave_type === "partial_hours" ? "2-digit" : undefined,
                minute: item.leave_type === "partial_hours" ? "2-digit" : undefined,
              });
              const endFmt = new Date(item.end_datetime).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
                hour: item.leave_type === "partial_hours" ? "2-digit" : undefined,
                minute: item.leave_type === "partial_hours" ? "2-digit" : undefined,
              });"""

repl_date_map = """            {leaves.map(item => {
              const startFmt = parseDateSafe(item.start_datetime).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
                hour: item.leave_type === "partial_hours" ? "2-digit" : undefined,
                minute: item.leave_type === "partial_hours" ? "2-digit" : undefined,
              });
              const endFmt = parseDateSafe(item.end_datetime).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
                hour: item.leave_type === "partial_hours" ? "2-digit" : undefined,
                minute: item.leave_type === "partial_hours" ? "2-digit" : undefined,
              });"""

assert target_date_map in code, "target_date_map not found"
code = code.replace(target_date_map, repl_date_map, 1)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("DoctorLeavesManager.jsx successfully patched with optimistic updates and cache busting!")
