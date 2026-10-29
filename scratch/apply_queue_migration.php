<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
echo "Connected to database...\n";

function addColumnIfNotExists(PDO $pdo, string $table, string $column, string $colDef): void {
    $check = $pdo->prepare("
        SELECT COUNT(*) 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ? 
          AND COLUMN_NAME = ?
    ");
    $check->execute([$table, $column]);
    if ((int)$check->fetchColumn() === 0) {
        $sql = "ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$colDef}";
        $pdo->exec($sql);
        echo " [+] Added column '{$column}' to '{$table}'\n";
    } else {
        echo " [=] Column '{$column}' already exists in '{$table}'\n";
    }
}

// 1. doctorssettingapointements
$settingCols = [
    'booking_mode'      => 'TINYINT NOT NULL DEFAULT 0 COMMENT "0: Time-Slots, 1: Queue-Numbers"',
    'shift_mode'         => 'TINYINT NOT NULL DEFAULT 1 COMMENT "1: Single Shift, 2: Double Shift"',
    'morning_start'      => 'TIME DEFAULT "08:30:00" COMMENT "Morning shift start time"',
    'morning_end'        => 'TIME DEFAULT "12:30:00" COMMENT "Morning shift end time"',
    'morning_capacity'   => 'INT NOT NULL DEFAULT 25 COMMENT "Max patients for morning shift"',
    'evening_start'      => 'TIME DEFAULT "14:00:00" COMMENT "Evening shift start time"',
    'evening_end'        => 'TIME DEFAULT "17:30:00" COMMENT "Evening shift end time"',
    'evening_capacity'   => 'INT NOT NULL DEFAULT 15 COMMENT "Max patients for evening shift"',
    'allow_overbooking'  => 'TINYINT NOT NULL DEFAULT 1 COMMENT "1: allow emergency addition above capacity"',
];

echo "\n--- Updating doctorssettingapointements ---\n";
foreach ($settingCols as $col => $def) {
    addColumnIfNotExists($pdo, 'doctorssettingapointements', $col, $def);
}

// 2. apointements
$apptCols = [
    'token_number'    => 'INT DEFAULT NULL COMMENT "Sequential queue number per shift/day"',
    'shift_type'      => 'VARCHAR(10) DEFAULT "morning" COMMENT "morning, evening, full_day"',
    'estimated_time'  => 'TIME DEFAULT NULL COMMENT "Estimated consultation time"',
    'is_emergency'    => 'TINYINT NOT NULL DEFAULT 0 COMMENT "1 if added above capacity for emergency"',
    'queue_status'    => 'VARCHAR(20) NOT NULL DEFAULT "waiting" COMMENT "waiting, in_consultation, completed, absent"',
];

echo "\n--- Updating apointements ---\n";
foreach ($apptCols as $col => $def) {
    addColumnIfNotExists($pdo, 'apointements', $col, $def);
}

// 3. Index
$idxCheck = $pdo->prepare("
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'apointements' 
      AND INDEX_NAME = 'idx_queue_lookup'
");
$idxCheck->execute();
if ((int)$idxCheck->fetchColumn() === 0) {
    $pdo->exec("ALTER TABLE `apointements` ADD INDEX `idx_queue_lookup` (`clinicsdoctor_id`, `apointementdate`, `shift_type`, `token_number`)");
    echo " [+] Added index 'idx_queue_lookup' on 'apointements'\n";
} else {
    echo " [=] Index 'idx_queue_lookup' already exists on 'apointements'\n";
}

echo "\nMigration executed successfully!\n";
