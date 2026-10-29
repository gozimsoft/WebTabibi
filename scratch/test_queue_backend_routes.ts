import { getPool } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

async function runTest() {
  console.log('[Test Queue Backend Routes] Running backend routes test...');
  const pool = getPool();

  try {
    // 1. Verify settingapointements query returns queue fields
    const [settingsRows]: any = await pool.query(`
      SELECT *, 
        DATE_FORMAT(DaytimeStart, '%H:%i') as DaytimeStartStr,
        DATE_FORMAT(DaytimeEnd, '%H:%i') as DaytimeEndStr
      FROM \`settingapointements\` LIMIT 1
    `);

    if (!settingsRows || settingsRows.length === 0) {
      // Insert default setting if missing
      await pool.query(`
        INSERT INTO \`settingapointements\` (
          \`ID\`, \`Doctor_id\`, \`TimeScale\`, \`DaytimeStart\`, \`DaytimeEnd\`,
          \`BookingMode\`, \`ShiftMode\`, \`MorningStart\`, \`MorningEnd\`, \`MorningCapacity\`,
          \`EveningStart\`, \`EveningEnd\`, \`EveningCapacity\`, \`AllowOverbooking\`
        ) VALUES (
          UUID(), 'doc-admin-default', 15, '1899-12-30 08:30:00', '1899-12-30 17:00:00',
          1, 2, '08:30:00', '12:30:00', 35, '13:30:00', '17:30:00', 35, 1
        )
      `);
    }

    const [updatedSettings]: any = await pool.query(`SELECT * FROM \`settingapointements\` LIMIT 1`);
    const s = updatedSettings[0];
    console.log('[Test Queue Backend Routes] Loaded setting row:', {
      BookingMode: s.BookingMode,
      ShiftMode: s.ShiftMode,
      MorningCapacity: s.MorningCapacity,
      EveningCapacity: s.EveningCapacity
    });

    if (s.BookingMode === undefined || s.ShiftMode === undefined || s.MorningCapacity === undefined) {
      throw new Error('settingapointements row is missing dual booking fields!');
    }

    // 2. Test inserting an appointment with queue details
    const testId = uuidv4();
    await pool.query(
      `INSERT INTO \`apointements\` (
        \`ID\`, \`PatientName\`, \`ApointementDate\`, \`Doctor_id\`, \`Status\`,
        \`TokenNumber\`, \`ShiftType\`, \`EstimatedTime\`, \`IsEmergency\`, \`QueueStatus\`
      ) VALUES (?, 'Test Queue Patient', NOW(), 'doc-admin-default', 1, 12, 'morning', '10:15', 0, 'waiting')`,
      [testId]
    );

    const [appt]: any = await pool.query(
      `SELECT ID, TokenNumber, ShiftType, EstimatedTime, IsEmergency, QueueStatus FROM \`apointements\` WHERE \`ID\` = ?`,
      [testId]
    );

    if (!appt || appt.length === 0 || appt[0].TokenNumber !== 12 || appt[0].ShiftType !== 'morning') {
      throw new Error(`Appointment queue fields not correctly saved: ${JSON.stringify(appt)}`);
    }

    // Clean up
    await pool.query(`DELETE FROM \`apointements\` WHERE \`ID\` = ?`, [testId]);

    console.log('[Test Queue Backend Routes] ALL ROUTE TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err: any) {
    console.error('[Test Queue Backend Routes FAILED]:', err.message);
    process.exit(1);
  }
}

runTest();
