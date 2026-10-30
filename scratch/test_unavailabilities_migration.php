<?php
require_once __DIR__ . '/../backend/core/Database.php';

try {
    $pdo = Database::getInstance();
    $sql = file_get_contents(__DIR__ . '/../backend/sql/doctor_unavailabilities_migration.sql');
    $pdo->exec($sql);

    // Verify table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'doctor_unavailabilities'");
    if ($stmt->rowCount() === 0) {
        echo "FAIL: Table doctor_unavailabilities does not exist.\n";
        exit(1);
    }

    // Verify columns
    $stmt = $pdo->query("DESCRIBE `doctor_unavailabilities`");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $required = [
        'id', 'doctor_id', 'clinic_id', 'clinicsdoctor_id',
        'leave_type', 'start_datetime', 'end_datetime', 'shift_type',
        'reason', 'show_reason_to_patient', 'created_by_user_id',
        'created_at', 'updated_at'
    ];

    foreach ($required as $col) {
        if (!in_array($col, $columns)) {
            echo "FAIL: Missing column {$col}\n";
            exit(1);
        }
    }

    echo "PASS: Table doctor_unavailabilities verified successfully.\n";
    exit(0);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
