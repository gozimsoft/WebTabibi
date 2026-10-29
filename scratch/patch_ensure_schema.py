import os

target = 'D:/Application Web/Tabibi_Rect/server/src/db/ensureAppointmentSchema.ts'

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the column check on Apointements
old_col_check = """      // 3. Détection des colonnes existantes
      const [colRows]: any = await conn.query(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME IN ('Version', 'CancelReason')`,
        [dbName, actualTableName]
      );
      const existingCols = new Set((colRows as any[]).map(r => r.COLUMN_NAME));
      const hasVersion = existingCols.has('Version');
      const hasCancelReason = existingCols.has('CancelReason');"""

new_col_check = """      // 3. Détection des colonnes existantes sur apointements
      const [colRows]: any = await conn.query(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME IN ('Version', 'CancelReason', 'TokenNumber', 'ShiftType', 'EstimatedTime', 'IsEmergency', 'QueueStatus')`,
        [dbName, actualTableName]
      );
      const existingCols = new Set((colRows as any[]).map(r => r.COLUMN_NAME));
      const hasVersion = existingCols.has('Version');
      const hasCancelReason = existingCols.has('CancelReason');
      const hasTokenNumber = existingCols.has('TokenNumber');
      const hasShiftType = existingCols.has('ShiftType');
      const hasEstimatedTime = existingCols.has('EstimatedTime');
      const hasIsEmergency = existingCols.has('IsEmergency');
      const hasQueueStatus = existingCols.has('QueueStatus');"""

content = content.replace(old_col_check, new_col_check)

# Replace index check
old_idx_check = """      // 4. Détection des index existants
      const [idxRows]: any = await conn.query(
        `SELECT DISTINCT INDEX_NAME 
         FROM INFORMATION_SCHEMA.STATISTICS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME IN ('idx_appointments_doctor_date', 'idx_appointments_status')`,
        [dbName, actualTableName]
      );
      const existingIndexes = new Set((idxRows as any[]).map(r => r.INDEX_NAME));
      const hasIdxDoctorDate = existingIndexes.has('idx_appointments_doctor_date');
      const hasIdxStatus = existingIndexes.has('idx_appointments_status');"""

new_idx_check = """      // 4. Détection des index existants
      const [idxRows]: any = await conn.query(
        `SELECT DISTINCT INDEX_NAME 
         FROM INFORMATION_SCHEMA.STATISTICS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME IN ('idx_appointments_doctor_date', 'idx_appointments_status', 'idx_appointments_queue')`,
        [dbName, actualTableName]
      );
      const existingIndexes = new Set((idxRows as any[]).map(r => r.INDEX_NAME));
      const hasIdxDoctorDate = existingIndexes.has('idx_appointments_doctor_date');
      const hasIdxStatus = existingIndexes.has('idx_appointments_status');
      const hasIdxQueue = existingIndexes.has('idx_appointments_queue');"""

content = content.replace(old_idx_check, new_idx_check)

# Add detection of SettingApointements
old_hist_sec = """      // 5. Détection de la table appointment_history et de ses colonnes"""

new_setting_and_hist = """      // 4.1 Détection de la table settingapointements et de ses colonnes
      const [settingTableRows]: any = await conn.query(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND LOWER(TABLE_NAME) = 'settingapointements' LIMIT 1",
        [dbName]
      );
      const hasSettingTable = settingTableRows && settingTableRows.length > 0;
      const actualSettingTableName = hasSettingTable ? settingTableRows[0].TABLE_NAME : 'SettingApointements';
      let hasBookingMode = false;
      let hasShiftMode = false;
      let hasMorningStart = false;
      let hasMorningEnd = false;
      let hasMorningCapacity = false;
      let hasEveningStart = false;
      let hasEveningEnd = false;
      let hasEveningCapacity = false;
      let hasAllowOverbooking = false;

      if (hasSettingTable) {
        const [settingColRows]: any = await conn.query(
          `SELECT COLUMN_NAME 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME IN (
             'BookingMode', 'ShiftMode', 'MorningStart', 'MorningEnd', 'MorningCapacity',
             'EveningStart', 'EveningEnd', 'EveningCapacity', 'AllowOverbooking'
           )`,
          [dbName, actualSettingTableName]
        );
        const existingSettingCols = new Set((settingColRows as any[]).map(r => r.COLUMN_NAME));
        hasBookingMode = existingSettingCols.has('BookingMode');
        hasShiftMode = existingSettingCols.has('ShiftMode');
        hasMorningStart = existingSettingCols.has('MorningStart');
        hasMorningEnd = existingSettingCols.has('MorningEnd');
        hasMorningCapacity = existingSettingCols.has('MorningCapacity');
        hasEveningStart = existingSettingCols.has('EveningStart');
        hasEveningEnd = existingSettingCols.has('EveningEnd');
        hasEveningCapacity = existingSettingCols.has('EveningCapacity');
        hasAllowOverbooking = existingSettingCols.has('AllowOverbooking');
      }

      // 5. Détection de la table appointment_history et de ses colonnes"""

content = content.replace(old_hist_sec, new_setting_and_hist)

# Replace needsMigration
old_needs = """      const needsMigration = !hasVersion || !hasCancelReason || !hasIdxDoctorDate || !hasIdxStatus || !hasHistoryTable || !hasHistForced || !hasHistForceReason || !hasHistCreatedAt;

      if (!needsMigration) {
        console.log('[Schema] Schéma de rendez-vous à jour (Version, CancelReason, index, appointment_history).');
        return { migrated: false, skippedNonLocal: false, actions: [] };
      }"""

new_needs = """      const needsQueueMigration = !hasTokenNumber || !hasShiftType || !hasEstimatedTime || !hasIsEmergency || !hasQueueStatus || !hasIdxQueue ||
        !hasBookingMode || !hasShiftMode || !hasMorningStart || !hasMorningEnd || !hasMorningCapacity || !hasEveningStart || !hasEveningEnd || !hasEveningCapacity || !hasAllowOverbooking;

      const needsMigration = !hasVersion || !hasCancelReason || !hasIdxDoctorDate || !hasIdxStatus || !hasHistoryTable || !hasHistForced || !hasHistForceReason || !hasHistCreatedAt || needsQueueMigration;

      if (!needsMigration) {
        console.log('[Schema] Schéma de rendez-vous et file d\\'attente à jour (Version, Queue, Shift, Index, appointment_history).');
        return { migrated: false, skippedNonLocal: false, actions: [] };
      }"""

content = content.replace(old_needs, new_needs)

# Add ALTER statements for queue columns and settingapointements columns
old_alter_block = """      if (!hasIdxStatus) {
        await conn.query(
          `ALTER TABLE \\`${actualTableName}\\` 
           ADD INDEX \\`idx_appointments_status\\` (\\`Status\\`, \\`ApointementDate\\`)`
        );
        actions.push(`ADD INDEX idx_appointments_status to ${actualTableName}`);
        console.log(`[Schema] ✓ Index 'idx_appointments_status' ajouté.`);
      }"""

new_alter_block = """      if (!hasIdxStatus) {
        await conn.query(
          `ALTER TABLE \\`${actualTableName}\\` 
           ADD INDEX \\`idx_appointments_status\\` (\\`Status\\`, \\`ApointementDate\\`)`
        );
        actions.push(`ADD INDEX idx_appointments_status to ${actualTableName}`);
        console.log(`[Schema] ✓ Index 'idx_appointments_status' ajouté.`);
      }

      // Colonnes du système de file d'attente / tickets (Dual Booking Queue)
      if (!hasTokenNumber) {
        await conn.query(
          `ALTER TABLE \\`${actualTableName}\\` 
           ADD COLUMN \\`TokenNumber\\` INT NULL COMMENT 'Queue ticket number (1..N)'`
        );
        actions.push(`ADD COLUMN TokenNumber to ${actualTableName}`);
        console.log(`[Schema] ✓ Colonne 'TokenNumber' ajoutée à '${actualTableName}'.`);
      }

      if (!hasShiftType) {
        await conn.query(
          `ALTER TABLE \\`${actualTableName}\\` 
           ADD COLUMN \\`ShiftType\\` VARCHAR(20) NULL COMMENT 'morning or evening'`
        );
        actions.push(`ADD COLUMN ShiftType to ${actualTableName}`);
        console.log(`[Schema] ✓ Colonne 'ShiftType' ajoutée à '${actualTableName}'.`);
      }

      if (!hasEstimatedTime) {
        await conn.query(
          `ALTER TABLE \\`${actualTableName}\\` 
           ADD COLUMN \\`EstimatedTime\\` VARCHAR(20) NULL COMMENT 'Estimated time of consultation (HH:mm)'`
        );
        actions.push(`ADD COLUMN EstimatedTime to ${actualTableName}`);
        console.log(`[Schema] ✓ Colonne 'EstimatedTime' ajoutée à '${actualTableName}'.`);
      }

      if (!hasIsEmergency) {
        await conn.query(
          `ALTER TABLE \\`${actualTableName}\\` 
           ADD COLUMN \\`IsEmergency\\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Emergency ticket override'`
        );
        actions.push(`ADD COLUMN IsEmergency to ${actualTableName}`);
        console.log(`[Schema] ✓ Colonne 'IsEmergency' ajoutée à '${actualTableName}'.`);
      }

      if (!hasQueueStatus) {
        await conn.query(
          `ALTER TABLE \\`${actualTableName}\\` 
           ADD COLUMN \\`QueueStatus\\` VARCHAR(30) NOT NULL DEFAULT 'waiting' COMMENT 'waiting, in_consultation, completed, absent, cancelled'`
        );
        actions.push(`ADD COLUMN QueueStatus to ${actualTableName}`);
        console.log(`[Schema] ✓ Colonne 'QueueStatus' ajoutée à '${actualTableName}'.`);
      }

      if (!hasIdxQueue) {
        await conn.query(
          `ALTER TABLE \\`${actualTableName}\\` 
           ADD INDEX \\`idx_appointments_queue\\` (\\`Doctor_id\\`, \\`ApointementDate\\`, \\`TokenNumber\\`)`
        );
        actions.push(`ADD INDEX idx_appointments_queue to ${actualTableName}`);
        console.log(`[Schema] ✓ Index 'idx_appointments_queue' ajouté.`);
      }

      // Colonnes de configuration du mode de réservation et des shifts (SettingApointements)
      if (hasSettingTable) {
        if (!hasBookingMode) {
          await conn.query(
            `ALTER TABLE \\`${actualSettingTableName}\\` 
             ADD COLUMN \\`BookingMode\\` INT NOT NULL DEFAULT 0 COMMENT '0: Time slots, 1: Queue numbers'`
          );
          actions.push(`ADD COLUMN BookingMode to ${actualSettingTableName}`);
          console.log(`[Schema] ✓ Colonne 'BookingMode' ajoutée à '${actualSettingTableName}'.`);
        }
        if (!hasShiftMode) {
          await conn.query(
            `ALTER TABLE \\`${actualSettingTableName}\\` 
             ADD COLUMN \\`ShiftMode\\` INT NOT NULL DEFAULT 1 COMMENT '1: Single shift, 2: Morning & Evening'`
          );
          actions.push(`ADD COLUMN ShiftMode to ${actualSettingTableName}`);
          console.log(`[Schema] ✓ Colonne 'ShiftMode' ajoutée à '${actualSettingTableName}'.`);
        }
        if (!hasMorningStart) {
          await conn.query(
            `ALTER TABLE \\`${actualSettingTableName}\\` 
             ADD COLUMN \\`MorningStart\\` VARCHAR(20) NOT NULL DEFAULT '08:30:00'`
          );
          actions.push(`ADD COLUMN MorningStart to ${actualSettingTableName}`);
          console.log(`[Schema] ✓ Colonne 'MorningStart' ajoutée à '${actualSettingTableName}'.`);
        }
        if (!hasMorningEnd) {
          await conn.query(
            `ALTER TABLE \\`${actualSettingTableName}\\` 
             ADD COLUMN \\`MorningEnd\\` VARCHAR(20) NOT NULL DEFAULT '12:30:00'`
          );
          actions.push(`ADD COLUMN MorningEnd to ${actualSettingTableName}`);
          console.log(`[Schema] ✓ Colonne 'MorningEnd' ajoutée à '${actualSettingTableName}'.`);
        }
        if (!hasMorningCapacity) {
          await conn.query(
            `ALTER TABLE \\`${actualSettingTableName}\\` 
             ADD COLUMN \\`MorningCapacity\\` INT NOT NULL DEFAULT 40`
          );
          actions.push(`ADD COLUMN MorningCapacity to ${actualSettingTableName}`);
          console.log(`[Schema] ✓ Colonne 'MorningCapacity' ajoutée à '${actualSettingTableName}'.`);
        }
        if (!hasEveningStart) {
          await conn.query(
            `ALTER TABLE \\`${actualSettingTableName}\\` 
             ADD COLUMN \\`EveningStart\\` VARCHAR(20) NOT NULL DEFAULT '13:30:00'`
          );
          actions.push(`ADD COLUMN EveningStart to ${actualSettingTableName}`);
          console.log(`[Schema] ✓ Colonne 'EveningStart' ajoutée à '${actualSettingTableName}'.`);
        }
        if (!hasEveningEnd) {
          await conn.query(
            `ALTER TABLE \\`${actualSettingTableName}\\` 
             ADD COLUMN \\`EveningEnd\\` VARCHAR(20) NOT NULL DEFAULT '17:30:00'`
          );
          actions.push(`ADD COLUMN EveningEnd to ${actualSettingTableName}`);
          console.log(`[Schema] ✓ Colonne 'EveningEnd' ajoutée à '${actualSettingTableName}'.`);
        }
        if (!hasEveningCapacity) {
          await conn.query(
            `ALTER TABLE \\`${actualSettingTableName}\\` 
             ADD COLUMN \\`EveningCapacity\\` INT NOT NULL DEFAULT 40`
          );
          actions.push(`ADD COLUMN EveningCapacity to ${actualSettingTableName}`);
          console.log(`[Schema] ✓ Colonne 'EveningCapacity' ajoutée à '${actualSettingTableName}'.`);
        }
        if (!hasAllowOverbooking) {
          await conn.query(
            `ALTER TABLE \\`${actualSettingTableName}\\` 
             ADD COLUMN \\`AllowOverbooking\\` TINYINT(1) NOT NULL DEFAULT 0`
          );
          actions.push(`ADD COLUMN AllowOverbooking to ${actualSettingTableName}`);
          console.log(`[Schema] ✓ Colonne 'AllowOverbooking' ajoutée à '${actualSettingTableName}'.`);
        }
      }"""

content = content.replace(old_alter_block, new_alter_block)

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)

print("ensureAppointmentSchema.ts patched successfully!")
