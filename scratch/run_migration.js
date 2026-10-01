const fs = require('fs');
const path = require('path');
const mysql = require('D:/Application Web/Tabibi_Rect/node_modules/mysql2/promise');

async function run() {
  const envContent = fs.readFileSync(path.join(__dirname, '../backend/.env'), 'utf8');
  const env = {};
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }

  console.log(`Connecting to ${env.DB_HOST}:${env.DB_PORT || 3306} as ${env.DB_USER}, db: ${env.DB_NAME}...`);
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT || '3306', 10),
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME
  });

  console.log('Connected successfully!');

  // Check current columns
  const [colsClinics] = await conn.query("SHOW COLUMNS FROM `clinics`");
  const clinicColNames = colsClinics.map(c => c.Field);
  console.log('Current clinics columns:', clinicColNames.join(', '));

  if (!clinicColNames.includes('owner_doctor_id')) {
    console.log('Adding owner_doctor_id to clinics...');
    await conn.query("ALTER TABLE `clinics` ADD COLUMN `owner_doctor_id` CHAR(36) NULL AFTER `user_id`, ADD INDEX `idx_clinics_owner_doctor` (`owner_doctor_id`)");
    console.log('owner_doctor_id added!');
  } else {
    console.log('owner_doctor_id already exists in clinics.');
  }

  if (!clinicColNames.includes('createdat')) {
    console.log('Adding createdat to clinics...');
    await conn.query("ALTER TABLE `clinics` ADD COLUMN `createdat` DATETIME DEFAULT CURRENT_TIMESTAMP");
    console.log('createdat added to clinics!');
  }

  if (!clinicColNames.includes('updatedat')) {
    console.log('Adding updatedat to clinics...');
    await conn.query("ALTER TABLE `clinics` ADD COLUMN `updatedat` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    console.log('updatedat added to clinics!');
  } else {
    console.log('updatedat already exists in clinics.');
  }

  const [colsCD] = await conn.query("SHOW COLUMNS FROM `clinicsdoctors`");
  const cdColNames = colsCD.map(c => c.Field);
  console.log('Current clinicsdoctors columns:', cdColNames.join(', '));

  if (!cdColNames.includes('is_owner')) {
    console.log('Adding is_owner to clinicsdoctors...');
    await conn.query("ALTER TABLE `clinicsdoctors` ADD COLUMN `is_owner` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`");
    console.log('is_owner added to clinicsdoctors!');
  } else {
    console.log('is_owner already exists in clinicsdoctors.');
  }

  console.log('Verifying table changes...');
  const [verifyClinics] = await conn.query("SHOW COLUMNS FROM `clinics` WHERE Field IN ('owner_doctor_id', 'createdat', 'updatedat')");
  const [verifyCD] = await conn.query("SHOW COLUMNS FROM `clinicsdoctors` LIKE 'is_owner'");
  console.log('clinics new columns:', verifyClinics.map(c => c.Field));
  console.log('clinicsdoctors.is_owner:', verifyCD.map(c => c.Field));

  await conn.end();
  console.log('Migration completed successfully!');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
