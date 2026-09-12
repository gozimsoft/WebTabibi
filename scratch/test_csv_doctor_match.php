<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

// Load specialties mapping: namear -> id
$stmt = $pdo->query("SELECT id, namear FROM specialties");
$spec_map = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $spec_map[trim($row['namear'])] = $row['id'];
}

// Load wilayas and baladiyas
$stmt = $pdo->query("SELECT id, namear, namefr FROM wilayas");
$wilayas = $stmt->fetchAll(PDO::FETCH_ASSOC);
$wilaya_map = [];
foreach ($wilayas as $w) {
    $wilaya_map[trim($w['namear'])] = $w['id'];
    $wilaya_map[trim($w['namefr'])] = $w['id'];
}

$stmt = $pdo->query("SELECT id, wilaya_id, namear, namefr FROM baladiyas");
$baladiyas = $stmt->fetchAll(PDO::FETCH_ASSOC);
$baladiya_map = [];
foreach ($baladiyas as $b) {
    $key_ar = trim($b['namear']);
    $baladiya_map[$b['wilaya_id'] . '_' . $key_ar] = $b['id'];
}

echo "Loaded: " . count($spec_map) . " specialties, " . count($wilaya_map) . " wilayas, " . count($baladiyas) . " baladiyas.\n";

// Test matching with CSV
$csv = fopen(__DIR__ . '/../doctors_data.csv', 'r');
$header = fgetcsv($csv);
$count = 0;
$matched_spec = 0;
while (($row = fgetcsv($csv)) !== false) {
    $count++;
    $spec = trim($row[1] ?? '');
    if (isset($spec_map[$spec])) {
        $matched_spec++;
    }
}
fclose($csv);

echo "Total CSV rows: $count | Matched specialties: $matched_spec / $count\n";
