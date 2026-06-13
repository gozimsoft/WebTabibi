<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Database.php';

header("Content-Type: application/json");
$pdo = Database::getInstance();

try {
    // 1. Add wilaya_id to baladiyas if not exists
    $stmt = $pdo->query("SHOW COLUMNS FROM `baladiyas` LIKE 'wilaya_id'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE `baladiyas` ADD COLUMN `wilaya_id` CHAR(36) NULL");
        $msg1 = "Added `wilaya_id` column to `baladiyas` table.";
    } else {
        $msg1 = "`wilaya_id` column already exists in `baladiyas` table.";
    }

    // 2. Map the active baladiyas to their correct wilayas
    $mappings = [
        // Alger Centre -> Alger
        '9b4fd321-e436-41fd-a772-19397ec1a546' => '7e03223f-aa6b-4a15-9872-f26d0aaaa800',
        // M'sila -> M'Sila
        '9b6c6bb3-5783-46aa-ae29-8254e54fbb72' => 'af3549ae-3fb2-4a92-b127-51e47f329f7d',
        // Oran -> Oran
        'f0c4c10a-d76d-4714-89a2-495494313439' => 'c55f1ebf-be46-4057-8515-c0ffd3bc11b9'
    ];

    $updatedCount = 0;
    $updateStmt = $pdo->prepare("UPDATE baladiyas SET wilaya_id = ? WHERE id = ?");
    foreach ($mappings as $baladiyaId => $wilayaId) {
        $updateStmt->execute([$wilayaId, $baladiyaId]);
        $updatedCount += $updateStmt->rowCount();
    }

    echo json_encode([
        'status' => 'success',
        'column_migration' => $msg1,
        'mapped_baladiyas_count' => $updatedCount
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
