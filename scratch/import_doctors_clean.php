<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 1. Load specialties
$stmt = $pdo->query("SELECT id, namear FROM specialties");
$spec_map = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $spec_map[trim($row['namear'])] = $row['id'];
}

// 2. Load wilayas & baladiyas
$stmt = $pdo->query("SELECT id, namear, namefr FROM wilayas");
$wilayas = $stmt->fetchAll(PDO::FETCH_ASSOC);
$wilaya_map = [];
foreach ($wilayas as $w) {
    $wilaya_map[trim(preg_replace('/\s+/u', ' ', $w['namear']))] = $w['id'];
    $wilaya_map[trim(preg_replace('/\s+/u', ' ', $w['namefr']))] = $w['id'];
}

$stmt = $pdo->query("SELECT id, wilaya_id, namear, namefr FROM baladiyas");
$baladiyas = $stmt->fetchAll(PDO::FETCH_ASSOC);
$baladiya_by_w_name = [];
$baladiya_by_name = [];
foreach ($baladiyas as $b) {
    $ar = trim(preg_replace('/\s+/u', ' ', $b['namear']));
    $fr = trim(preg_replace('/\s+/u', ' ', $b['namefr']));
    $baladiya_by_w_name[$b['wilaya_id'] . '_' . mb_strtolower($ar)] = $b['id'];
    $baladiya_by_w_name[$b['wilaya_id'] . '_' . mb_strtolower($fr)] = $b['id'];
    $baladiya_by_name[mb_strtolower($ar)] = $b['id'];
    $baladiya_by_name[mb_strtolower($fr)] = $b['id'];
}

echo "Loaded metadata for import.\n";

// Function to generate UUID v4
function gen_uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// Read CSV
$csv = fopen(__DIR__ . '/../doctors_data.csv', 'r');
$header = fgetcsv($csv);

$batch = [];
$total_inserted = 0;
$pdo->beginTransaction();

$insert_sql = "INSERT INTO `doctors` (
    `id`, `fullname`, `address`, `phone`, `fix`, `email`, `baladiya_id`, 
    `specialtie_id`, `presentation`, `status`, `approvedat`, `emailvalidation`, `phonevalidation`
) VALUES ";

$values = [];
$params = [];
$row_idx = 0;

while (($row = fgetcsv($csv)) !== false) {
    $name = trim($row[0] ?? '');
    if ($name === '') continue;
    
    $spec_name = trim($row[1] ?? '');
    $wilaya_name = trim(preg_replace('/\s+/u', ' ', $row[2] ?? ''));
    $baladiya_name = trim(preg_replace('/\s+/u', ' ', $row[3] ?? ''));
    $address = trim($row[4] ?? '');
    $phone1 = trim($row[5] ?? '');
    $phone2 = trim($row[6] ?? '');
    $email = trim($row[7] ?? '');
    $desc = trim($row[8] ?? '');

    // Format phone
    if ($phone1 !== '' && $phone1 !== '0') {
        if (strlen($phone1) === 9 && !str_starts_with($phone1, '0')) {
            $phone1 = '0' . $phone1;
        }
    } else {
        $phone1 = null;
    }

    if ($phone2 !== '' && $phone2 !== '0') {
        if (strlen($phone2) === 9 && !str_starts_with($phone2, '0')) {
            $phone2 = '0' . $phone2;
        }
    } else {
        $phone2 = null;
    }

    // Specialty ID
    $specialtie_id = $spec_map[$spec_name] ?? null;

    // Baladiya ID
    $baladiya_id = null;
    $wilaya_id = $wilaya_map[$wilaya_name] ?? null;
    if ($wilaya_id && $baladiya_name !== '') {
        $baladiya_id = $baladiya_by_w_name[$wilaya_id . '_' . mb_strtolower($baladiya_name)] ?? null;
    }
    if (!$baladiya_id && $baladiya_name !== '') {
        $baladiya_id = $baladiya_by_name[mb_strtolower($baladiya_name)] ?? null;
    }

    // Doctor prefix
    $clean_fullname = $name;
    if (!preg_match('/^(الدكتور|الدكتورة|Dr\.?|DR\.?)\s+/u', $clean_fullname)) {
        $clean_fullname = 'الدكتور ' . $clean_fullname;
    }

    $id = gen_uuid();

    $values[] = "(?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', NOW(), 1, 0)";
    $params[] = $id;
    $params[] = mb_substr($clean_fullname, 0, 200);
    $params[] = mb_substr($address, 0, 500);
    $params[] = $phone1;
    $params[] = $phone2;
    $params[] = $email ?: null;
    $params[] = $baladiya_id;
    $params[] = $specialtie_id;
    $params[] = $desc ?: null;

    $row_idx++;

    if (count($values) >= 500) {
        $stmt = $pdo->prepare($insert_sql . implode(',', $values));
        $stmt->execute($params);
        $total_inserted += count($values);
        $values = [];
        $params = [];
    }
}
fclose($csv);

if (!empty($values)) {
    $stmt = $pdo->prepare($insert_sql . implode(',', $values));
    $stmt->execute($params);
    $total_inserted += count($values);
}

$pdo->commit();

echo "Successfully imported $total_inserted doctors into database!\n";
