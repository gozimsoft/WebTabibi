import os

target = 'D:/Application Web/Tabibi_Rect/server/src/services/tabibiSyncService.ts'

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update payload in uploadDoctorScheduleToCloud
old_payload_part = """  const isRegistered = appSettings ? (Number(appSettings.IsRegistered) === 1 ? true : false) : true;
  const doctorPricing = Number(doctor.Pricing) || 1000;"""

new_payload_part = """  const isRegistered = appSettings ? (Number(appSettings.IsRegistered) === 1 ? true : false) : true;
  const doctorPricing = Number(doctor.Pricing) || 1000;

  // Dual Booking & Shift configurations
  const bookingMode = appSettings ? (Number(appSettings.BookingMode) || 0) : 0;
  const shiftMode = appSettings ? (Number(appSettings.ShiftMode) || 1) : 1;
  const morningStart = appSettings?.MorningStart || '08:30:00';
  const morningEnd = appSettings?.MorningEnd || '12:30:00';
  const morningCapacity = appSettings ? (Number(appSettings.MorningCapacity) || 40) : 40;
  const eveningStart = appSettings?.EveningStart || '13:30:00';
  const eveningEnd = appSettings?.EveningEnd || '17:30:00';
  const eveningCapacity = appSettings ? (Number(appSettings.EveningCapacity) || 40) : 40;
  const allowOverbooking = appSettings ? (Number(appSettings.AllowOverbooking) === 1 ? 1 : 0) : 0;"""

content = content.replace(old_payload_part, new_payload_part)

old_payload_obj = """    // Appointment settings: flat fields expected by DoctorController.php
    time_scale: timeScale,
    daytime_start: daytimeStart,
    daytime_end: daytimeEnd,
    working_days: workingDays,
    count_days: countDays,
    week_begin_day: weekBeginDay,
    is_registered: isRegistered,"""

new_payload_obj = """    // Appointment settings: flat fields expected by DoctorController.php
    time_scale: timeScale,
    daytime_start: daytimeStart,
    daytime_end: daytimeEnd,
    working_days: workingDays,
    count_days: countDays,
    week_begin_day: weekBeginDay,
    is_registered: isRegistered,
    booking_mode: bookingMode,
    shift_mode: shiftMode,
    morning_start: morningStart,
    morning_end: morningEnd,
    morning_capacity: morningCapacity,
    evening_start: eveningStart,
    evening_end: eveningEnd,
    evening_capacity: eveningCapacity,
    allow_overbooking: allowOverbooking,"""

content = content.replace(old_payload_obj, new_payload_obj)

old_legacy_obj = """    doctorssettingapointements: {
      time_scale: timeScale,
      daytime_start: daytimeStart,
      daytime_end: daytimeEnd,
      working_days: workingDays,
      count_days: countDays,
      week_begin_day: weekBeginDay,
      is_registered: isRegistered
    },"""

new_legacy_obj = """    doctorssettingapointements: {
      time_scale: timeScale,
      daytime_start: daytimeStart,
      daytime_end: daytimeEnd,
      working_days: workingDays,
      count_days: countDays,
      week_begin_day: weekBeginDay,
      is_registered: isRegistered,
      booking_mode: bookingMode,
      shift_mode: shiftMode,
      morning_start: morningStart,
      morning_end: morningEnd,
      morning_capacity: morningCapacity,
      evening_start: eveningStart,
      evening_end: eveningEnd,
      evening_capacity: eveningCapacity,
      allow_overbooking: allowOverbooking
    },"""

content = content.replace(old_legacy_obj, new_legacy_obj)

# 2. Update syncAppointmentsWithCloud download extraction
old_download_extract = """      const pReasonId = app.reason_id || null;
      const pBirthDate = app.birthdate ? formatSqlDatetime(app.birthdate)?.slice(0, 10) : null;"""

new_download_extract = """      const pReasonId = app.reason_id || null;
      const pBirthDate = app.birthdate ? formatSqlDatetime(app.birthdate)?.slice(0, 10) : null;

      // Extract queue & ticket parameters from incoming booking
      const tokenNumber = app.token_number !== undefined && app.token_number !== null
        ? Number(app.token_number)
        : (app.TokenNumber !== undefined && app.TokenNumber !== null ? Number(app.TokenNumber) : null);
      const shiftType = app.shift_type || app.ShiftType || null;
      const estimatedTime = app.estimated_time || app.EstimatedTime || null;
      const isEmergency = (app.is_emergency || app.IsEmergency) ? 1 : 0;
      const queueStatus = app.queue_status || app.QueueStatus || 'waiting';"""

content = content.replace(old_download_extract, new_download_extract)

# Replace INSERT in download
old_download_insert = """      if (!existing || existing.length === 0) {
        // Insert incoming booking from cloud
        await pool.query(
          `INSERT INTO \`apointements\` (
            \`ID\`, \`PatientName\`, \`BirthDate\`, \`Phone\`, \`ApointementDate\`, 
            \`Note\`, \`ApointementColor\`, \`Doctor_id\`, \`Reason_id\`, \`Status\`, 
            \`IsDelete\`, \`IsUpload\`, \`UpdatedAt\`
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
          [appId, pName, pBirthDate, pPhone, pDate, pNote, pColor, doctorId, pReasonId, pStatus, isDelete]
        );
        downloadedCount++;
      } else {
        // Update local appointment with remote updates
        await pool.query(
          `UPDATE \`apointements\` SET 
            \`PatientName\` = ?, \`Phone\` = ?, \`BirthDate\` = COALESCE(?, \`BirthDate\`), 
            \`ApointementDate\` = ?, \`Note\` = ?, \`ApointementColor\` = ?, 
            \`Reason_id\` = COALESCE(?, \`Reason_id\`), \`Status\` = ?, \`IsDelete\` = ?, 
            \`IsUpload\` = 1, \`UpdatedAt\` = NOW() 
           WHERE \`ID\` = ?`,
          [pName, pPhone, pBirthDate, pDate, pNote, pColor, pReasonId, pStatus, isDelete, appId]
        );
        downloadedCount++;
      }"""

new_download_insert = """      if (!existing || existing.length === 0) {
        // Insert incoming booking from cloud with queue metadata
        await pool.query(
          `INSERT INTO \`apointements\` (
            \`ID\`, \`PatientName\`, \`BirthDate\`, \`Phone\`, \`ApointementDate\`, 
            \`Note\`, \`ApointementColor\`, \`Doctor_id\`, \`Reason_id\`, \`Status\`, 
            \`IsDelete\`, \`IsUpload\`, \`UpdatedAt\`,
            \`TokenNumber\`,\`ShiftType\`, \`EstimatedTime\`, \`IsEmergency\`, \`QueueStatus\`
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), ?, ?, ?, ?, ?)`,
          [appId, pName, pBirthDate, pPhone, pDate, pNote, pColor, doctorId, pReasonId, pStatus, isDelete, tokenNumber, shiftType, estimatedTime, isEmergency, queueStatus]
        );
        downloadedCount++;
      } else {
        // Update local appointment with remote updates
        await pool.query(
          `UPDATE \`apointements\` SET 
            \`PatientName\` = ?, \`Phone\` = ?, \`BirthDate\` = COALESCE(?, \`BirthDate\`), 
            \`ApointementDate\` = ?, \`Note\` = ?, \`ApointementColor\` = ?, 
            \`Reason_id\` = COALESCE(?, \`Reason_id\`), \`Status\` = ?, \`IsDelete\` = ?, 
            \`IsUpload\` = 1, \`UpdatedAt\` = NOW(),
            \`TokenNumber\` = COALESCE(?, \`TokenNumber\`),
            \`ShiftType\` = COALESCE(?, \`ShiftType\`),
            \`EstimatedTime\` = COALESCE(?, \`EstimatedTime\`),
            \`IsEmergency\` = ?,
            \`QueueStatus\` = COALESCE(?, \`QueueStatus\`)
           WHERE \`ID\` = ?`,
          [pName, pPhone, pBirthDate, pDate, pNote, pColor, pReasonId, pStatus, isDelete, tokenNumber, shiftType, estimatedTime, isEmergency, queueStatus, appId]
        );
        downloadedCount++;
      }"""

content = content.replace(old_download_insert, new_download_insert)

# 3. Update pendingUploads SELECT in upload
old_upload_select = """    const [pendingUploads]: any = await pool.query(
      `SELECT ID, PatientName, BirthDate, Phone, ApointementDate, Note, ApointementColor, 
              Weight, Height, IMC, PAS, PAC, Oxygen, Heartbeats, Reason_id, Doctor_id, Status, IsDelete 
       FROM \`apointements\` 
       WHERE \`Doctor_id\` = ? AND (\`IsUpload\` = 0 OR \`IsUpload\` IS NULL)
       LIMIT 100`,
      [doctorId]
    );"""

new_upload_select = """    const [pendingUploads]: any = await pool.query(
      `SELECT ID, PatientName, BirthDate, Phone, ApointementDate, Note, ApointementColor, 
              Weight, Height, IMC, PAS, PAC, Oxygen, Heartbeats, Reason_id, Doctor_id, Status, IsDelete,
              TokenNumber, ShiftType, EstimatedTime, IsEmergency, QueueStatus
       FROM \`apointements\` 
       WHERE \`Doctor_id\` = ? AND (\`IsUpload\` = 0 OR \`IsUpload\` IS NULL)
       LIMIT 100`,
      [doctorId]
    );"""

content = content.replace(old_upload_select, new_upload_select)

# Replace upload payload mapping in upload
old_upload_map = """            status: isCancelled ? 1 : (p.Status === 2 ? 2 : 0),
            isdelete: isCancelled,
            is_delete: isCancelled
          };"""

new_upload_map = """            status: isCancelled ? 1 : (p.Status === 2 ? 2 : 0),
            isdelete: isCancelled,
            is_delete: isCancelled,
            token_number: p.TokenNumber !== null && p.TokenNumber !== undefined ? Number(p.TokenNumber) : null,
            shift_type: p.ShiftType || null,
            estimated_time: p.EstimatedTime || null,
            is_emergency: Boolean(p.IsEmergency) ? 1 : 0,
            queue_status: p.QueueStatus || 'waiting'
          };"""

content = content.replace(old_upload_map, new_upload_map)

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)

print("tabibiSyncService.ts patched successfully!")
