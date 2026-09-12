<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();

echo "=== VERIFYING REASONS TABLE ===\n";
$total = $pdo->query("SELECT COUNT(*) FROM `reasons`")->fetchColumn();
echo "Total reasons in DB: $total\n\n";

echo "=== BREAKDOWN BY SPECIALTY ===\n";
$stmt = $pdo->query("
    SELECT s.namear, s.namefr, COUNT(r.id) as reason_count
    FROM specialties s
    LEFT JOIN reasons r ON r.specialtie_id = s.id
    GROUP BY s.id, s.namear, s.namefr
    ORDER BY reason_count DESC
");
$breakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($breakdown as $b) {
    printf("%-35s | %-35s : %2d motifs\n", $b['namear'], $b['namefr'], $b['reason_count']);
}

echo "\n=== SAMPLE 10 REASONS ===\n";
$stmt = $pdo->query("
    SELECT r.id, r.namear, r.namefr, s.namear as specialty_ar
    FROM reasons r
    JOIN specialties s ON s.id = r.specialtie_id
    LIMIT 10
");
$sample = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($sample as $s) {
    echo "• [{$s['specialty_ar']}] AR: {$s['namear']} | FR: {$s['namefr']}\n";
}

echo "\n=== CHECK UNLINKED REASONS ===\n";
$unlinked = $pdo->query("SELECT COUNT(*) FROM reasons WHERE specialtie_id IS NULL")->fetchColumn();
echo "Unlinked reasons: $unlinked\n";
