<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

// Find duplicates within same wilaya
$dups = $pdo->query("
    SELECT b.wilaya_id, w.num, w.namefr as w_name, b.namefr, b.namear, COUNT(*) as cnt, GROUP_CONCAT(b.id) as ids
    FROM baladiyas b
    JOIN wilayas w ON w.id = b.wilaya_id
    GROUP BY b.wilaya_id, b.namefr, b.namear
    HAVING cnt > 1
")->fetchAll(PDO::FETCH_ASSOC);

echo "Duplicates in baladiyas (same wilaya): " . count($dups) . "\n";
foreach ($dups as $d) {
    echo " - [Wilaya {$d['num']} - {$d['w_name']}] {$d['namefr']} ({$d['namear']}) x{$d['cnt']} : IDs = {$d['ids']}\n";
    // Check if doctors reference these IDs
    $idList = explode(',', $d['ids']);
    foreach ($idList as $id) {
        $docCount = $pdo->query("SELECT COUNT(*) FROM doctors WHERE baladiya_id = '$id'")->fetchColumn();
        echo "     * ID $id has $docCount doctors\n";
    }
}
