<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

// Load CSV
$csv = fopen(__DIR__ . '/../doctors_data.csv', 'r');
$header = fgetcsv($csv);
$csv_doctors = [];
while (($row = fgetcsv($csv)) !== false) {
    $name = trim($row[0] ?? '');
    $spec = trim($row[1] ?? '');
    $phone = trim($row[5] ?? '');
    if ($name !== '') {
        $csv_doctors[] = ['name' => $name, 'spec' => $spec, 'phone' => $phone];
    }
}
fclose($csv);

echo "Loaded CSV doctors: " . count($csv_doctors) . "\n";

// Get distinct specialtie_id in DB
$stmt = $pdo->query("SELECT DISTINCT specialtie_id FROM doctors WHERE specialtie_id IS NOT NULL AND specialtie_id != ''");
$db_spec_ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo "Distinct specialtie_ids in doctors table: " . count($db_spec_ids) . "\n";

// For each specialtie_id, find some doctors and check their names in CSV
$mapping = [];
foreach ($db_spec_ids as $sid) {
    $stmt = $pdo->prepare("SELECT fullname, phone FROM doctors WHERE specialtie_id = ? LIMIT 10");
    $stmt->execute([$sid]);
    $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check match against CSV
    $matched_specs = [];
    foreach ($docs as $d) {
        $clean_name = preg_replace('/^(الدكتور|الدكتورة|Dr\.?|DR\.?)\s+/u', '', trim($d['fullname']));
        foreach ($csv_doctors as $c) {
            if ($c['name'] === $clean_name || (strlen($clean_name) > 4 && strpos($c['name'], $clean_name) !== false)) {
                $matched_specs[$c['spec']] = ($matched_specs[$c['spec']] ?? 0) + 1;
            }
        }
    }
    
    // Check if sid is in specialties table
    $stmt2 = $pdo->prepare("SELECT namear, namefr FROM specialties WHERE id = ?");
    $stmt2->execute([$sid]);
    $existing = $stmt2->fetch(PDO::FETCH_ASSOC);
    
    echo "SID: $sid\n";
    echo "  DB specialties table: " . ($existing ? "{$existing['namear']} / {$existing['namefr']}" : "NOT FOUND") . "\n";
    echo "  Sample doc: {$docs[0]['fullname']}\n";
    echo "  Matched CSV specialties: " . json_encode($matched_specs, JSON_UNESCAPED_UNICODE) . "\n\n";
}
