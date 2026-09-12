<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 1. Load specialties mapping
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

echo "Loaded metadata: " . count($spec_map) . " specialties.\n";

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
$csv_file = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'doctors_data.csv';
$csv = fopen($csv_file, 'r');
if (!$csv) {
    die("Could not open $csv_file\n");
}
$header = fgetcsv($csv);

$batch_size = 150;
$values = [];
$params = [];
$total_inserted = 0;
$start_time = microtime(true);

$insert_header = "INSERT INTO `doctors` (
    `id`, `fullname`, `address`, `phone`, `fix`, `email`, `baladiya_id`, 
    `specialtie_id`, `presentation`, `status`, `approvedat`, `emailvalidation`, `phonevalidation`
) VALUES ";

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

    $specialtie_id = $spec_map[$spec_name] ?? null;

    $baladiya_id = null;
    $wilaya_id = $wilaya_map[$wilaya_name] ?? null;
    if ($wilaya_id && $baladiya_name !== '') {
        $baladiya_id = $baladiya_by_w_name[$wilaya_id . '_' . mb_strtolower($baladiya_name)] ?? null;
    }
    if (!$baladiya_id && $baladiya_name !== '') {
        $baladiya_id = $baladiya_by_name[mb_strtolower($baladiya_name)] ?? null;
    }

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

    if (count($values) >= $batch_size) {
        $sql = $insert_header . implode(',', $values);
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $total_inserted += count($values);
        $values = [];
        $params = [];
        
        if ($total_inserted % 1500 === 0) {
            $elapsed = round(microtime(true) - $start_time, 1);
            echo "Progress: $total_inserted doctors imported ($elapsed s)...\n";
        }
    }
}
fclose($csv);

if (!empty($values)) {
    $sql = $insert_header . implode(',', $values);
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $total_inserted += count($values);
}

$total_time = round(microtime(true) - $start_time, 1);
echo "=== COMPLETED: $total_inserted doctors imported in $total_time seconds! ===\n";
