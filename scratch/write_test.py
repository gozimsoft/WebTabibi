target_path = 'D:/Application Web/Tabibi_Rect/server/src/scripts/test_queue_schema_migration.ts'
content = """import { ensureAppointmentSchema } from '../db/ensureAppointmentSchema';
import { getPool } from '../db/connection';

async function runTest() {
  console.log('[Test Queue Schema Migration] Running test...');
  const pool = getPool();

  try {
    const res = await ensureAppointmentSchema({ skipBackupForTest: true, throwOnError: true });
    console.log('[Test Queue Schema Migration] First run result:', res);

    // Verify columns on Apointements
    const [apptCols]: any = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = 'apointements' AND COLUMN_NAME IN ('TokenNumber', 'ShiftType', 'EstimatedTime', 'IsEmergency', 'QueueStatus')"
    );
    console.log('[Test Queue Schema Migration] Apointements queue columns found:', apptCols.map((c: any) => c.COLUMN_NAME));
    const apptColNames = new Set(apptCols.map((c: any) => c.COLUMN_NAME.toLowerCase()));
    const expectedApptCols = ['tokennumber', 'shifttype', 'estimatedtime', 'isemergency', 'queuestatus'];
    for (const col of expectedApptCols) {
      if (!apptColNames.has(col)) {
        throw new Error("Missing expected column '" + col + "' in Apointements table!");
      }
    }

    // Verify columns on SettingApointements
    const [settingCols]: any = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = 'settingapointements' AND COLUMN_NAME IN ('BookingMode', 'ShiftMode', 'MorningStart', 'MorningEnd', 'MorningCapacity', 'EveningStart', 'EveningEnd', 'EveningCapacity', 'AllowOverbooking')"
    );
    console.log('[Test Queue Schema Migration] SettingApointements queue columns found:', settingCols.map((c: any) => c.COLUMN_NAME));
    const settingColNames = new Set(settingCols.map((c: any) => c.COLUMN_NAME.toLowerCase()));
    const expectedSettingCols = [
      'bookingmode', 'shiftmode', 'morningstart', 'morningend', 'morningcapacity',
      'eveningstart', 'eveningend', 'eveningcapacity', 'allowoverbooking'
    ];
    for (const col of expectedSettingCols) {
      if (!settingColNames.has(col)) {
        throw new Error("Missing expected column '" + col + "' in SettingApointements table!");
      }
    }

    // Test idempotency: run again
    const secondRun = await ensureAppointmentSchema({ skipBackupForTest: true, throwOnError: true });
    console.log('[Test Queue Schema Migration] Second run result (idempotency):', secondRun);

    console.log('[Test Queue Schema Migration] ALL CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err: any) {
    console.error('[Test Queue Schema Migration FAILED]:', err.message);
    process.exit(1);
  }
}

runTest();
"""

with open(target_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated test_queue_schema_migration.ts cleanly!")
