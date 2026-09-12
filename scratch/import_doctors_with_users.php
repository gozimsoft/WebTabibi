<?php
/**
 * Tabibi — Import Doctors and Create Random User Accounts
 * Imports 20,178 doctors from doctors_data.csv into DB
 * Creates a unique random user account for each doctor with usertype = 1
 * Links doctors.user_id to users.id and doctors.specialtie_id to specialties.id
 */

require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "1. Cleaning up previous doctor data...\n";
$pdo->exec("DELETE FROM `doctors`");
$pdo->exec("DELETE FROM `users` WHERE `usertype` = 1");
echo "  Previous doctor records and doctor users cleared.\n";

echo "2. Loading metadata (specialties, wilayas, baladiyas)...\n";
// Load specialties mapping: namear -> id
$stmt = $pdo->query("SELECT id, namear FROM specialties");
$spec_map = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $spec_map[trim($row['namear'])] = $row['id'];
}

// Load wilayas mapping: namear/namefr -> id
$stmt = $pdo->query("SELECT id, namear, namefr FROM wilayas");
$wilayas = $stmt->fetchAll(PDO::FETCH_ASSOC);
$wilaya_map = [];
foreach ($wilayas as $w) {
    $wilaya_map[trim(preg_replace('/\s+/u', ' ', $w['namear']))] = $w['id'];
    $wilaya_map[trim(preg_replace('/\s+/u', ' ', $w['namefr']))] = $w['id'];
}

// Load baladiyas mapping
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

echo "  Metadata loaded: " . count($spec_map) . " specialties, " . count($wilaya_map) . " wilayas, " . count($baladiyas) . " baladiyas.\n";

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

// Open CSV
$csv_file = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'doctors_data.csv';
$csv = fopen($csv_file, 'r');
if (!$csv) {
    die("Error: Could not open $csv_file\n");
}
$header = fgetcsv($csv);

echo "3. Starting import of doctors and user accounts...\n";

$batch_size = 100;
$user_values = [];
$user_params = [];
$doctor_values = [];
$doctor_params = [];
$total_inserted = 0;
$start_time = microtime(true);
$used_usernames = [];

$user_insert_header = "INSERT INTO `users` (`id`, `username`, `password`, `usertype`) VALUES ";
$doc_insert_header = "INSERT INTO `doctors` (
    `id`, `user_id`, `fullname`, `address`, `phone`, `fix`, `email`, `baladiya_id`, 
    `specialtie_id`, `presentation`, `status`, `approvedat`, `emailvalidation`, `phonevalidation`
) VALUES ";

$default_encoded_password = base64_encode('Tabibi2026!');

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

    // Format phone 1
    if ($phone1 !== '' && $phone1 !== '0') {
        if (strlen($phone1) === 9 && !str_starts_with($phone1, '0')) {
            $phone1 = '0' . $phone1;
        }
    } else {
        $phone1 = null;
    }

    // Format phone 2
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

    // Clean fullname with standard prefix
    $clean_fullname = $name;
    if (!preg_match('/^(الدكتور|الدكتورة|Dr\.?|DR\.?)\s+/u', $clean_fullname)) {
        $clean_fullname = 'الدكتور ' . $clean_fullname;
    }

    // Generate unique user account
    $user_id = gen_uuid();
    $doc_id = gen_uuid();

    // Unique random username
    do {
        $username = 'doc_' . bin2hex(random_bytes(5));
    } while (isset($used_usernames[$username]));
    $used_usernames[$username] = true;

    // Users batch
    $user_values[] = "(?, ?, ?, 1)";
    $user_params[] = $user_id;
    $user_params[] = $username;
    $user_params[] = $default_encoded_password;

    // Doctors batch
    $doctor_values[] = "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', NOW(), 1, 1)";
    $doctor_params[] = $doc_id;
    $doctor_params[] = $user_id;
    $doctor_params[] = mb_substr($clean_fullname, 0, 200);
    $doctor_params[] = mb_substr($address, 0, 500);
    $doctor_params[] = $phone1;
    $doctor_params[] = $phone2;
    $doctor_params[] = $email ?: null;
    $doctor_params[] = $baladiya_id;
    $doctor_params[] = $specialtie_id;
    $doctor_params[] = $desc ?: null;

    if (count($user_values) >= $batch_size) {
        // 1. Insert users
        $stmt_user = $pdo->prepare($user_insert_header . implode(',', $user_values));
        $stmt_user->execute($user_params);

        // 2. Insert doctors
        $stmt_doc = $pdo->prepare($doc_insert_header . implode(',', $doctor_values));
        $stmt_doc->execute($doctor_params);

        $total_inserted += count($doctor_values);
        $user_values = [];
        $user_params = [];
        $doctor_values = [];
        $doctor_params = [];

        if ($total_inserted % 1000 === 0) {
            $elapsed = round(microtime(true) - $start_time, 1);
            echo "  Progress: $total_inserted doctors & user accounts imported ({$elapsed}s)...\n";
        }
    }
}
fclose($csv);

// Insert remainder
if (!empty($user_values)) {
    $stmt_user = $pdo->prepare($user_insert_header . implode(',', $user_values));
    $stmt_user->execute($user_params);

    $stmt_doc = $pdo->prepare($doc_insert_header . implode(',', $doctor_values));
    $stmt_doc->execute($doctor_params);

    $total_inserted += count($doctor_values);
}

$total_time = round(microtime(true) - $start_time, 1);
echo "=== COMPLETED: $total_inserted doctors and user accounts imported in {$total_time}s! ===\n";
