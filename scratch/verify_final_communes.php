<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$ref = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);
$refCountByW = [];
foreach ($ref as $r) {
    $w = (int)$r['wilaya_code'];
    $refCountByW[$w] = ($refCountByW[$w] ?? 0) + 1;
}

$stmt = $pdo->query("
    SELECT w.num, w.namefr, COUNT(b.id) as db_cnt
    FROM wilayas w
    LEFT JOIN baladiyas b ON b.wilaya_id = w.id
    WHERE w.num <= 58
    GROUP BY w.num, w.namefr
    ORDER BY w.num ASC
");

$allPerfect = true;
$totalDb = 0;
$totalRef = 0;

echo "=== COMPARISON AGAINST CANONICAL 1,541 COMMUNES ===\n";
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $num = (int)$r['num'];
    $dbCnt = (int)$r['db_cnt'];
    $refCnt = $refCountByW[$num] ?? 0;
    $totalDb += $dbCnt;
    $totalRef += $refCnt;
    $status = ($dbCnt === $refCnt) ? "MATCH (100%)" : "DIFF: " . ($dbCnt - $refCnt);
    if ($dbCnt !== $refCnt) $allPerfect = false;
    echo sprintf("[%2d] %-22s: DB = %2d | Canonical = %2d | %s\n", $num, $r['namefr'], $dbCnt, $refCnt, $status);
}

echo "\n============================================\n";
echo "TOTAL COMMUNES IN DB (Wilayas 1-58): $totalDb\n";
echo "TOTAL CANONICAL COMMUNES:           $totalRef\n";
echo "All 58 Wilayas match exactly: " . ($allPerfect ? "YES! PERFECT 100% MATCH!" : "NO") . "\n";
