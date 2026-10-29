import { getPool } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

async function runTest() {
  console.log('[Test Queue Sync Service] Running test...');
  const pool = getPool();

  try {
    // 1. Verify that tabibiSyncService.ts contains queue fields in uploadDoctorScheduleToCloud payload
    const syncSource = fs.readFileSync('server/src/services/tabibiSyncService.ts', 'utf-8');
    
    const requiredKeysInSync = [
      'booking_mode',
      'shift_mode',
      'morning_start',
      'morning_end',
      'morning_capacity',
      'evening_start',
      'evening_end',
      'evening_capacity',
      'allow_overbooking',
      'TokenNumber',
      'ShiftType',
      'EstimatedTime',
      'IsEmergency',
      'QueueStatus'
    ];

    for (const key of requiredKeysInSync) {
      if (!syncSource.includes(key)) {
        throw new Error(`tabibiSyncService.ts is missing queue field: ${key}`);
      }
    }

    // 2. Insert a test appointment with queue fields and verify SQL queries handle them
    const testApptId = uuidv4();
    await pool.query(
      `INSERT INTO \`apointements\` (
        \`ID\`, \`PatientName\`, \`ApointementDate\`, \`Doctor_id\`, \`Status\`,
        \`TokenNumber\`, \`ShiftType\`, \`EstimatedTime\`, \`IsEmergency\`, \`QueueStatus\`, \`IsUpload\`
      ) VALUES (?, 'Test Queue Patient', NOW(), 'doc-admin-default', 0, 7, 'morning', '09:30:00', 0, 'waiting', 0)`,
      [testApptId]
    );

    const [rows]: any = await pool.query(
      `SELECT TokenNumber, ShiftType, EstimatedTime, IsEmergency, QueueStatus FROM \`apointements\` WHERE \`ID\` = ?`,
      [testApptId]
    );

    if (!rows || rows.length === 0 || rows[0].TokenNumber !== 7 || rows[0].ShiftType !== 'morning') {
      throw new Error(`Failed to persist or retrieve queue fields on test appointment: ${JSON.stringify(rows)}`);
    }

    // Clean up test appointment
    await pool.query(`DELETE FROM \`apointements\` WHERE \`ID\` = ?`, [testApptId]);

    console.log('[Test Queue Sync Service] ALL CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err: any) {
    console.error('[Test Queue Sync Service FAILED]:', err.message);
    process.exit(1);
  }
}

runTest();
