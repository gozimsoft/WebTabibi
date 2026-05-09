<?php
require_once __DIR__ . '/../backend/core/Database.php';

try {
    $pdo = Database::getInstance();
    
    echo "Updating clinics table...\n";
    
    // Add missing columns to clinics
    $pdo->exec("ALTER TABLE clinics ADD COLUMN IF NOT EXISTS status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'APPROVED'");
    $pdo->exec("ALTER TABLE clinics ADD COLUMN IF NOT EXISTS approvedat DATETIME NULL");
    $pdo->exec("ALTER TABLE clinics ADD COLUMN IF NOT EXISTS rejectedreason TEXT NULL");
    $pdo->exec("ALTER TABLE clinics ADD COLUMN IF NOT EXISTS notes TEXT NULL");
    $pdo->exec("ALTER TABLE clinics ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL");
    
    echo "Successfully updated clinics table.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
