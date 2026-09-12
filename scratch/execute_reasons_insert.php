<?php
require_once __DIR__ . '/../backend/core/Database.php';

try {
    $pdo = Database::getInstance();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "1. Ensuring reasons table structure...\n";
    try {
        $pdo->exec("ALTER TABLE `reasons` MODIFY COLUMN `name` VARCHAR(255) NOT NULL");
    } catch (Exception $e) {}

    // Check if namear and namefr columns exist
    $cols = $pdo->query("SHOW COLUMNS FROM `reasons`")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('namear', $cols)) {
        echo "  Adding namear column...\n";
        $pdo->exec("ALTER TABLE `reasons` ADD COLUMN `namear` VARCHAR(255) NULL AFTER `name`");
    }
    if (!in_array('namefr', $cols)) {
        echo "  Adding namefr column...\n";
        $pdo->exec("ALTER TABLE `reasons` ADD COLUMN `namefr` VARCHAR(255) NULL AFTER `namear`");
    }

    echo "2. Loading reasons dataset...\n";
    $json_file = __DIR__ . '/all_reasons_dataset.json';
    $reasons = json_decode(file_get_contents($json_file), true);
    echo "  Loaded " . count($reasons) . " reasons from JSON.\n";

    // Load specialties mapping
    $stmt = $pdo->query("SELECT id, namear FROM specialties");
    $spec_map = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $spec_map[trim($row['namear'])] = $row['id'];
    }

    echo "3. Clearing previous reasons records...\n";
    $pdo->exec("DELETE FROM `reasons`");

    function gen_uuid() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    echo "4. Inserting reasons in batches...\n";
    $batch_size = 100;
    $values = [];
    $params = [];
    $total_inserted = 0;
    $insert_header = "INSERT INTO `reasons` (`id`, `name`, `namear`, `namefr`, `specialtie_id`) VALUES ";

    foreach ($reasons as $r) {
        $spec_id = $spec_map[$r['specialty_ar']] ?? null;
        if (!$spec_id) {
            echo "Warning: Specialty not found: {$r['specialty_ar']}\n";
            continue;
        }

        $id = gen_uuid();
        $values[] = "(?, ?, ?, ?, ?)";
        $params[] = $id;
        $params[] = $r['namefr'];
        $params[] = $r['namear'];
        $params[] = $r['namefr'];
        $params[] = $spec_id;

        if (count($values) >= $batch_size) {
            $stmt = $pdo->prepare($insert_header . implode(',', $values));
            $stmt->execute($params);
            $total_inserted += count($values);
            $values = [];
            $params = [];
            echo "  Inserted $total_inserted / " . count($reasons) . "...\n";
        }
    }

    if (!empty($values)) {
        $stmt = $pdo->prepare($insert_header . implode(',', $values));
        $stmt->execute($params);
        $total_inserted += count($values);
    }

    echo "=== COMPLETED: $total_inserted reasons inserted successfully! ===\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
