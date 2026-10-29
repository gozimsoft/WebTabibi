import os

# 1. Patch server/src/routes/settings.ts
settings_path = 'D:/Application Web/Tabibi_Rect/server/src/routes/settings.ts'
with open(settings_path, 'r', encoding='utf-8') as f:
    s_content = f.read()

# Update appointmentSettings object in GET /doctor
old_get_app_settings = """      appointmentSettings: appSettings ? {
        timeScale: appSettings.TimeScale || 15,
        daytimeStart: appSettings.DaytimeStartStr || (appSettings.DaytimeStart ? appSettings.DaytimeStart.toString().substring(11, 16) : '08:00'),
        daytimeEnd: appSettings.DaytimeEndStr || (appSettings.DaytimeEnd ? appSettings.DaytimeEnd.toString().substring(11, 16) : '17:00'),
        weekBeginDay: appSettings.WeekBeginDay ?? 0,
        workingDays: appSettings.WorkingDays || '1111100',
        styleCalendar: appSettings.StyleCalendar || 'Day',
        countDays: appSettings.CountDays || 7,
        isRegistered: Boolean(appSettings.IsRegistered)
      } : {
        timeScale: 15,
        daytimeStart: '08:00',
        daytimeEnd: '17:00',
        weekBeginDay: 0,
        workingDays: '1111100',
        styleCalendar: 'Day',
        countDays: 7,
        isRegistered: false
      },"""

new_get_app_settings = """      appointmentSettings: appSettings ? {
        timeScale: appSettings.TimeScale || 15,
        daytimeStart: appSettings.DaytimeStartStr || (appSettings.DaytimeStart ? appSettings.DaytimeStart.toString().substring(11, 16) : '08:00'),
        daytimeEnd: appSettings.DaytimeEndStr || (appSettings.DaytimeEnd ? appSettings.DaytimeEnd.toString().substring(11, 16) : '17:00'),
        weekBeginDay: appSettings.WeekBeginDay ?? 0,
        workingDays: appSettings.WorkingDays || '1111100',
        styleCalendar: appSettings.StyleCalendar || 'Day',
        countDays: appSettings.CountDays || 7,
        isRegistered: Boolean(appSettings.IsRegistered),
        bookingMode: Number(appSettings.BookingMode) || 0,
        shiftMode: Number(appSettings.ShiftMode) || 1,
        morningStart: appSettings.MorningStart || '08:30:00',
        morningEnd: appSettings.MorningEnd || '12:30:00',
        morningCapacity: Number(appSettings.MorningCapacity) || 40,
        eveningStart: appSettings.EveningStart || '13:30:00',
        eveningEnd: appSettings.EveningEnd || '17:30:00',
        eveningCapacity: Number(appSettings.EveningCapacity) || 40,
        allowOverbooking: Boolean(appSettings.AllowOverbooking)
      } : {
        timeScale: 15,
        daytimeStart: '08:00',
        daytimeEnd: '17:00',
        weekBeginDay: 0,
        workingDays: '1111100',
        styleCalendar: 'Day',
        countDays: 7,
        isRegistered: false,
        bookingMode: 0,
        shiftMode: 1,
        morningStart: '08:30:00',
        morningEnd: '12:30:00',
        morningCapacity: 40,
        eveningStart: '13:30:00',
        eveningEnd: '17:30:00',
        eveningCapacity: 40,
        allowOverbooking: false
      },"""

s_content = s_content.replace(old_get_app_settings, new_get_app_settings)

# Update appointmentSettings update & insert in PUT /doctor
old_put_app_settings = """      if (exists && exists.length > 0) {
        await pool.query(
          `UPDATE \`settingapointements\` SET 
           \`TimeScale\` = ?, \`DaytimeStart\` = ?, \`DaytimeEnd\` = ?, \`WeekBeginDay\` = ?,
           \`WorkingDays\` = ?, \`StyleCalendar\` = ?, \`CountDays\` = ?, \`IsRegistered\` = ?
           WHERE \`Doctor_id\` = ?`,
          [
            parseInt(appointmentSettings.timeScale, 10) || 15,
            startDateTime,
            endDateTime,
            parseInt(appointmentSettings.weekBeginDay, 10) || 0,
            appointmentSettings.workingDays || '1111100',
            appointmentSettings.styleCalendar || 'Day',
            parseInt(appointmentSettings.countDays, 10) || 7,
            appointmentSettings.isRegistered ? 1 : 0,
            doctor.id
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO \`settingapointements\` 
           (\`ID\`, \`TimeScale\`, \`DaytimeStart\`, \`DaytimeEnd\`, \`WeekBeginDay\`, \`WorkingDays\`, \`StyleCalendar\`, \`Doctor_id\`, \`CountDays\`, \`IsRegistered\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            parseInt(appointmentSettings.timeScale, 10) || 15,
            startDateTime,
            endDateTime,
            parseInt(appointmentSettings.weekBeginDay, 10) || 0,
            appointmentSettings.workingDays || '1111100',
            appointmentSettings.styleCalendar || 'Day',
            doctor.id,
            parseInt(appointmentSettings.countDays, 10) || 7,
            appointmentSettings.isRegistered ? 1 : 0
          ]
        );
      }"""

new_put_app_settings = """      if (exists && exists.length > 0) {
        await pool.query(
          `UPDATE \`settingapointements\` SET 
           \`TimeScale\` = ?, \`DaytimeStart\` = ?, \`DaytimeEnd\` = ?, \`WeekBeginDay\` = ?,
           \`WorkingDays\` = ?, \`StyleCalendar\` = ?, \`CountDays\` = ?, \`IsRegistered\` = ?,
           \`BookingMode\` = ?, \`ShiftMode\` = ?, \`MorningStart\` = ?, \`MorningEnd\` = ?,
           \`MorningCapacity\` = ?, \`EveningStart\` = ?, \`EveningEnd\` = ?, \`EveningCapacity\` = ?,
           \`AllowOverbooking\` = ?
           WHERE \`Doctor_id\` = ?`,
          [
            parseInt(appointmentSettings.timeScale, 10) || 15,
            startDateTime,
            endDateTime,
            parseInt(appointmentSettings.weekBeginDay, 10) || 0,
            appointmentSettings.workingDays || '1111100',
            appointmentSettings.styleCalendar || 'Day',
            parseInt(appointmentSettings.countDays, 10) || 7,
            appointmentSettings.isRegistered ? 1 : 0,
            parseInt(appointmentSettings.bookingMode, 10) || 0,
            parseInt(appointmentSettings.shiftMode, 10) || 1,
            appointmentSettings.morningStart || '08:30:00',
            appointmentSettings.morningEnd || '12:30:00',
            parseInt(appointmentSettings.morningCapacity, 10) || 40,
            appointmentSettings.eveningStart || '13:30:00',
            appointmentSettings.eveningEnd || '17:30:00',
            parseInt(appointmentSettings.eveningCapacity, 10) || 40,
            appointmentSettings.allowOverbooking ? 1 : 0,
            doctor.id
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO \`settingapointements\` 
           (\`ID\`, \`TimeScale\`, \`DaytimeStart\`, \`DaytimeEnd\`, \`WeekBeginDay\`, \`WorkingDays\`, \`StyleCalendar\`, \`Doctor_id\`, \`CountDays\`, \`IsRegistered\`,
            \`BookingMode\`, \`ShiftMode\`, \`MorningStart\`, \`MorningEnd\`, \`MorningCapacity\`, \`EveningStart\`, \`EveningEnd\`, \`EveningCapacity\`, \`AllowOverbooking\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            parseInt(appointmentSettings.timeScale, 10) || 15,
            startDateTime,
            endDateTime,
            parseInt(appointmentSettings.weekBeginDay, 10) || 0,
            appointmentSettings.workingDays || '1111100',
            appointmentSettings.styleCalendar || 'Day',
            doctor.id,
            parseInt(appointmentSettings.countDays, 10) || 7,
            appointmentSettings.isRegistered ? 1 : 0,
            parseInt(appointmentSettings.bookingMode, 10) || 0,
            parseInt(appointmentSettings.shiftMode, 10) || 1,
            appointmentSettings.morningStart || '08:30:00',
            appointmentSettings.morningEnd || '12:30:00',
            parseInt(appointmentSettings.morningCapacity, 10) || 40,
            appointmentSettings.eveningStart || '13:30:00',
            appointmentSettings.eveningEnd || '17:30:00',
            parseInt(appointmentSettings.eveningCapacity, 10) || 40,
            appointmentSettings.allowOverbooking ? 1 : 0
          ]
        );
      }"""

s_content = s_content.replace(old_put_app_settings, new_put_app_settings)

with open(settings_path, 'w', encoding='utf-8') as f:
    f.write(s_content)

print("settings.ts updated!")

# 2. Patch server/src/routes/appointments.ts
appt_path = 'D:/Application Web/Tabibi_Rect/server/src/routes/appointments.ts'
with open(appt_path, 'r', encoding='utf-8') as f:
    a_content = f.read()

# Update POST / in appointments.ts to handle queue fields and auto-numbering
old_post_handler = """    const {
      patientName, birthDate, phone, appointementDate, note,
      appointementColor = 8689404, weight = 0, height = 0, imc = 0,
      pas = 0, pac = 0, oxygen = 0, heartbeats = 0, reasonId, doctorId,
      status = 0 // 0=Pending, 1=In-Progress (Waiting Room), 2=Completed, 3=Cancelled
    } = req.body;"""

new_post_handler = """    let {
      patientName, birthDate, phone, appointementDate, note,
      appointementColor = 8689404, weight = 0, height = 0, imc = 0,
      pas = 0, pac = 0, oxygen = 0, heartbeats = 0, reasonId, doctorId,
      status = 0, // 0=Pending, 1=In-Progress (Waiting Room), 2=Completed, 3=Cancelled
      tokenNumber, shiftType, estimatedTime, isEmergency = 0, queueStatus = 'waiting'
    } = req.body;

    // Auto-calculate next token number if booking in Queue mode and tokenNumber not provided
    if ((tokenNumber === undefined || tokenNumber === null) && doctorId && appointementDate) {
      const [docSetting]: any = await pool.query(
        "SELECT BookingMode FROM `settingapointements` WHERE `Doctor_id` = ? LIMIT 1",
        [doctorId]
      );
      if (docSetting && docSetting.length > 0 && docSetting[0].BookingMode === 1) {
        let tokenSql = "SELECT COALESCE(MAX(TokenNumber), 0) + 1 AS nextToken FROM `apointements` WHERE `Doctor_id` = ? AND DATE(`ApointementDate`) = DATE(?) AND (`IsDelete` = 0 OR `IsDelete` IS NULL)";
        const tokenParams: any[] = [doctorId, appointementDate];
        if (shiftType) {
          tokenSql += " AND (`ShiftType` = ? OR `ShiftType` IS NULL)";
          tokenParams.push(shiftType);
        }
        const [tokenRow]: any = await pool.query(tokenSql, tokenParams);
        tokenNumber = tokenRow && tokenRow[0] ? tokenRow[0].nextToken : 1;
      }
    }"""

a_content = a_content.replace(old_post_handler, new_post_handler)

# Update INSERT query in POST /
old_insert_query = """    await pool.query(
      `INSERT INTO \`apointements\` (
        \`ID\`, \`PatientName\`, \`BirthDate\`, \`Phone\`, \`ApointementDate\`, 
        \`Note\`, \`ApointementColor\`, \`Weight\`, \`Height\`, \`IMC\`, 
        \`PAS\`, \`PAC\`, \`Oxygen\`, \`Heartbeats\`, \`Reason_id\`, 
        \`Doctor_id\`, \`IsDelete\`, \`Status\`, \`IsUpload\`, \`UpdatedAt\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, NOW())`,
      [
        id, (patientName || '').trim(), birthDate || null, (phone || '').trim(), appointementDate,
        note, appointementColor, weight, height, imc,
        pas, pac, oxygen, heartbeats, reasonId,
        doctorId, status
      ]
    );"""

new_insert_query = """    await pool.query(
      `INSERT INTO \`apointements\` (
        \`ID\`, \`PatientName\`, \`BirthDate\`, \`Phone\`, \`ApointementDate\`, 
        \`Note\`, \`ApointementColor\`, \`Weight\`, \`Height\`, \`IMC\`, 
        \`PAS\`, \`PAC\`, \`Oxygen\`, \`Heartbeats\`, \`Reason_id\`, 
        \`Doctor_id\`, \`IsDelete\`, \`Status\`, \`IsUpload\`, \`UpdatedAt\`,
        \`TokenNumber\`, \`ShiftType\`, \`EstimatedTime\`, \`IsEmergency\`, \`QueueStatus\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, NOW(), ?, ?, ?, ?, ?)`,
      [
        id, (patientName || '').trim(), birthDate || null, (phone || '').trim(), appointementDate,
        note, appointementColor, weight, height, imc,
        pas, pac, oxygen, heartbeats, reasonId,
        doctorId, status,
        tokenNumber !== undefined && tokenNumber !== null ? Number(tokenNumber) : null,
        shiftType || null,
        estimatedTime || null,
        isEmergency ? 1 : 0,
        queueStatus || 'waiting'
      ]
    );"""

a_content = a_content.replace(old_insert_query, new_insert_query)

# Update GET /settings in appointments.ts
old_get_settings = """      res.json({
        ...r,
        DaytimeStart: r.DaytimeStartStr || '08:00',
        DaytimeEnd: r.DaytimeEndStr || '17:00'
      });
    } else {
      res.json({
        TimeScale: 15,
        DaytimeStart: '08:00:00',
        DaytimeEnd: '17:00:00',
        WeekBeginDay: 5, // Saturday in Algeria (Friday/Saturday weekend)
        WorkingDays: '1111011',
        StyleCalendar: 'Blue',
        CountDays: 7
      });"""

new_get_settings = """      res.json({
        ...r,
        DaytimeStart: r.DaytimeStartStr || '08:00',
        DaytimeEnd: r.DaytimeEndStr || '17:00',
        BookingMode: Number(r.BookingMode) || 0,
        ShiftMode: Number(r.ShiftMode) || 1,
        MorningStart: r.MorningStart || '08:30:00',
        MorningEnd: r.MorningEnd || '12:30:00',
        MorningCapacity: Number(r.MorningCapacity) || 40,
        EveningStart: r.EveningStart || '13:30:00',
        EveningEnd: r.EveningEnd || '17:30:00',
        EveningCapacity: Number(r.EveningCapacity) || 40,
        AllowOverbooking: Boolean(r.AllowOverbooking)
      });
    } else {
      res.json({
        TimeScale: 15,
        DaytimeStart: '08:00:00',
        DaytimeEnd: '17:00:00',
        WeekBeginDay: 5, // Saturday in Algeria (Friday/Saturday weekend)
        WorkingDays: '1111011',
        StyleCalendar: 'Blue',
        CountDays: 7,
        BookingMode: 0,
        ShiftMode: 1,
        MorningStart: '08:30:00',
        MorningEnd: '12:30:00',
        MorningCapacity: 40,
        EveningStart: '13:30:00',
        EveningEnd: '17:30:00',
        EveningCapacity: 40,
        AllowOverbooking: false
      });"""

a_content = a_content.replace(old_get_settings, new_get_settings)

# Update handleUpdateStatus in appointments.ts to handle queueStatus and tokenNumber
old_status_handler = """    const { status } = req.body;"""

new_status_handler = """    const { status, queueStatus, tokenNumber } = req.body;"""

a_content = a_content.replace(old_status_handler, new_status_handler)

old_status_query = """    await pool.query(
      `UPDATE \`apointements\` SET \`Status\` = ?, \`UpdatedAt\` = NOW(), \`Version\` = COALESCE(\`Version\`, 0) + 1 WHERE \`ID\` = ?`,
      [status, req.params.id]
    );"""

new_status_query = """    let derivedQueueStatus = queueStatus;
    if (!derivedQueueStatus) {
      if (status === 1) derivedQueueStatus = 'waiting';
      else if (status === 2) derivedQueueStatus = 'in_consultation';
      else if (status === 3) derivedQueueStatus = 'completed';
      else if (status === 4) derivedQueueStatus = 'cancelled';
    }

    await pool.query(
      `UPDATE \`apointements\` SET 
        \`Status\` = ?, 
        \`QueueStatus\` = COALESCE(?, \`QueueStatus\`),
        \`TokenNumber\` = COALESCE(?, \`TokenNumber\`),
        \`UpdatedAt\` = NOW(), 
        \`Version\` = COALESCE(\`Version\`, 0) + 1 
       WHERE \`ID\` = ?`,
      [status, derivedQueueStatus || null, tokenNumber !== undefined ? tokenNumber : null, req.params.id]
    );"""

a_content = a_content.replace(old_status_query, new_status_query)

with open(appt_path, 'w', encoding='utf-8') as f:
    f.write(a_content)

print("appointments.ts updated!")
