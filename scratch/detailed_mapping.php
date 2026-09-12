<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

// Load CSV doctors indexed by full name and by phone
$csv = fopen(__DIR__ . '/../doctors_data.csv', 'r');
$header = fgetcsv($csv);
$csv_by_phone = [];
$csv_by_name = [];
while (($row = fgetcsv($csv)) !== false) {
    $name = trim($row[0] ?? '');
    $spec = trim($row[1] ?? '');
    $phone1 = trim($row[5] ?? '');
    $phone2 = trim($row[6] ?? '');
    if ($phone1 !== '' && $phone1 !== '0') {
        $csv_by_phone[$phone1] = $spec;
    }
    if ($phone2 !== '' && $phone2 !== '0') {
        $csv_by_phone[$phone2] = $spec;
    }
    if ($name !== '') {
        $csv_by_name[$name] = $spec;
    }
}
fclose($csv);

echo "Loaded from CSV: " . count($csv_by_name) . " names, " . count($csv_by_phone) . " phones\n";

// Get distinct specialtie_id from doctors in DB
$stmt = $pdo->query("SELECT specialtie_id, COUNT(*) as cnt FROM doctors GROUP BY specialtie_id");
$db_groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($db_groups as $group) {
    $sid = $group['specialtie_id'];
    $cnt = $group['cnt'];
    
    // Find matching specialties from CSV for doctors in this group
    $stmt2 = $pdo->prepare("SELECT fullname, phone FROM doctors WHERE specialtie_id <=> ? LIMIT 50");
    $stmt2->execute([$sid]);
    $docs = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    
    $spec_counts = [];
    foreach ($docs as $d) {
        $clean_name = preg_replace('/^(الدكتور|الدكتورة|Dr\.?|DR\.?)\s+/u', '', trim($d['fullname']));
        $matched_spec = null;
        if (!empty($d['phone']) && isset($csv_by_phone[$d['phone']])) {
            $matched_spec = $csv_by_phone[$d['phone']];
        } elseif (isset($csv_by_name[$clean_name])) {
            $matched_spec = $csv_by_name[$clean_name];
        } else {
            foreach ($csv_by_name as $cname => $cspec) {
                if (strpos($cname, $clean_name) !== false || strpos($clean_name, $cname) !== false) {
                    $matched_spec = $cspec;
                    break;
                }
            }
        }
        if ($matched_spec) {
            $spec_counts[$matched_spec] = ($spec_counts[$matched_spec] ?? 0) + 1;
        } else {
            $spec_counts['UNKNOWN'] = ($spec_counts['UNKNOWN'] ?? 0) + 1;
        }
    }
    
    // Check if sid is in specialties
    $stmt3 = $pdo->prepare("SELECT namear, namefr FROM specialties WHERE id = ?");
    $stmt3->execute([$sid]);
    $existing = $stmt3->fetch(PDO::FETCH_ASSOC);
    
    echo "--------------------------------------------------------\n";
    echo "SID: " . ($sid ?? 'NULL') . " | Doctors in DB: $cnt\n";
    echo "Specialties Table: " . ($existing ? "AR: {$existing['namear']} | FR: {$existing['namefr']}" : "NOT FOUND IN SPECIALTIES TABLE") . "\n";
    echo "CSV Matches (top sample): " . json_encode($spec_counts, JSON_UNESCAPED_UNICODE) . "\n";
}
