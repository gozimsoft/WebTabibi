<?php
require_once __DIR__ . '/backend/core/Database.php';
$pdo = Database::getInstance();

$sql = "
ALTER TABLE Apointements
ADD COLUMN IF NOT EXISTS Doctor_id char(36) AFTER Patient_id,
ADD COLUMN IF NOT EXISTS IsDelete tinyint(1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS Source varchar(20) DEFAULT 'web',
ADD COLUMN IF NOT EXISTS SyncedAt datetime DEFAULT NULL,
ADD COLUMN IF NOT EXISTS BirthDate datetime DEFAULT NULL,
ADD COLUMN IF NOT EXISTS Phone varchar(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ApointementColor int DEFAULT 0,
ADD COLUMN IF NOT EXISTS Weight double DEFAULT NULL,
ADD COLUMN IF NOT EXISTS Height double DEFAULT NULL,
ADD COLUMN IF NOT EXISTS IMC double DEFAULT NULL,
ADD COLUMN IF NOT EXISTS PAS double DEFAULT NULL,
ADD COLUMN IF NOT EXISTS PAC double DEFAULT NULL,
ADD COLUMN IF NOT EXISTS Oxygen double DEFAULT NULL,
ADD COLUMN IF NOT EXISTS Heartbeats double DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_ap_doctor_date ON Apointements(Doctor_id, AppointementDate);
CREATE INDEX IF NOT EXISTS idx_ap_cd_date ON Apointements(ClinicsDoctor_id, AppointementDate);
";

echo "Running migration...\n";
try {
    $pdo->exec($sql);
    echo "Migration successful!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
