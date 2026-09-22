<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$rows = $pdo->query("
    SELECT w.num, w.namefr, COUNT(d.id) as doc_count
    FROM doctors d
    JOIN baladiyas b ON b.id = d.baladiya_id
    JOIN wilayas w ON w.id = b.wilaya_id
    WHERE w.num > 58
    GROUP BY w.num, w.namefr
    ORDER BY w.num
")->fetchAll(PDO::FETCH_ASSOC);

echo "Doctors in pseudo-wilayas 59-69:\n";
foreach ($rows as $r) {
    echo " - Wilaya {$r['num']} ({$r['namefr']}): {$r['doc_count']} doctors\n";
}
