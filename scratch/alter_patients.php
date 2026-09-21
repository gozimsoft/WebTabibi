<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$db = Database::getInstance();
$db->exec("ALTER TABLE patients ADD COLUMN IF NOT EXISTS is_frozen TINYINT(1) NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS freeze_reason TEXT NULL, ADD COLUMN IF NOT EXISTS frozen_at DATETIME NULL");
echo "PATIENTS ALTER SUCCESS\n";

$stmt = $db->query("DESCRIBE patients");
$cols = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'Field');
echo "is_frozen in patients: " . (in_array('is_frozen', $cols) ? "YES" : "NO") . "\n";
