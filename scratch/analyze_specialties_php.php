<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

// Load CSV
$csv = fopen(__DIR__ . '/../doctors_data.csv', 'r');
$header = fgetcsv($csv);
$csv_by_phone = [];
$csv_by_name = [];
while (($row = fgetcsv($csv)) !== false) {
    $name = trim($row[0] ?? '');
    $spec = trim($row[1] ?? '');
    $phone1 = trim($row[5] ?? '');
    if ($phone1 !== '' && $phone1 !== '0') {
        $csv_by_phone[$phone1] = $spec;
    }
    if ($name !== '') {
        $csv_by_name[$name] = $spec;
    }
}
fclose($csv);

echo "Loaded CSV: " . count($csv_by_name) . " names, " . count($csv_by_phone) . " phones\n";

$stmt = $pdo->query("SELECT id, fullname, phone, specialtie_id FROM doctors");
$doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Loaded DB doctors: " . count($doctors) . "\n";

$stats = [];
foreach ($doctors as $d) {
    $sid = $d['specialtie_id'] ?? 'NULL';
    $name = trim($d['fullname'] ?? '');
    $clean_name = preg_replace('/^(الدكتور|الدكتورة|Dr\.?|DR\.?)\s+/u', '', $name);
    $clean_name = trim($clean_name);
    $phone = trim($d['phone'] ?? '');

    $matched = null;
    if ($phone !== '' && isset($csv_by_phone[$phone])) {
        $matched = $csv_by_phone[$phone];
    } elseif ($clean_name !== '' && isset($csv_by_name[$clean_name])) {
        $matched = $csv_by_name[$clean_name];
    } elseif ($name !== '' && isset($csv_by_name[$name])) {
        $matched = $csv_by_name[$name];
    }

    if (!isset($stats[$sid])) {
        $stats[$sid] = [];
    }
    $label = $matched ?? 'NO_MATCH';
    $stats[$sid][$label] = ($stats[$sid][$label] ?? 0) + 1;
}

// Fetch existing specialties in DB
$stmt2 = $pdo->query("SELECT id, namear, namefr FROM specialties");
$current_specs = [];
while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
    $current_specs[$row['id']] = $row;
}

echo "\n=== SUMMARY OF EACH UUID IN DOCTORS TABLE ===\n";
ksort($stats);
foreach ($stats as $sid => $counts) {
    arsort($counts);
    $top = array_slice($counts, 0, 3, true);
    $total = array_sum($counts);
    $curr = isset($current_specs[$sid]) ? "({$current_specs[$sid]['namear']} | {$current_specs[$sid]['namefr']})" : "(NOT IN SPECIALTIES TABLE)";
    echo "UUID: $sid $curr\n";
    echo "  Total docs: $total | Breakdown: " . json_encode($top, JSON_UNESCAPED_UNICODE) . "\n";
}
