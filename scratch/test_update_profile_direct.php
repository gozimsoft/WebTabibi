<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();

$stmt = $pdo->query("
    SELECT d.id, d.user_id, d.fullname
    FROM doctors d
    JOIN users u ON u.id = d.user_id
    WHERE COALESCE(d.is_frozen, 0) = 0
    LIMIT 1
");
$doctor = $stmt->fetch(PDO::FETCH_ASSOC);

$testToken = 'test_token_upd_' . bin2hex(random_bytes(16));
$pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$doctor['user_id']]);
$pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")
    ->execute([$doctor['user_id'], $testToken]);

// Save initial values to restore later
$orig = $pdo->query("SELECT presentation, education, rpps, numregister, casnos, nin FROM doctors WHERE id = '{$doctor['id']}'")->fetch(PDO::FETCH_ASSOC);

$testPresentation = "Dr. Spécialiste passionné avec plus de 15 ans d'expérience clinique.";
$testEducation = "Diplôme d'État en Médecine, Faculté d'Alger - Spécialisation Cardio-Pédiatrique.";
$testRpps = "DSP-16-778899";
$testNumRegister = "16/7788";
$testCasnos = "16-7788990-11";
$testNin = "198016010099887766";

// Update directly via SQL or controller logic
$allowed = [
    'fullname', 'email', 'phone', 'fix', 'casnos', 'speakinglanguage', 
    'rpps', 'numregister', 'pricing', 'degrees', 'academytitles', 
    'postcode', 'specialtie_id', 'nin', 'presentation', 'education'
];

$data = [
    'presentation' => $testPresentation,
    'education' => $testEducation,
    'rpps' => $testRpps,
    'numregister' => $testNumRegister,
    'casnos' => $testCasnos,
    'nin' => $testNin
];

$fields = [];
$values = [];
foreach ($allowed as $field) {
    if (array_key_exists($field, $data)) {
        $val = $data[$field];
        if (($field === 'presentation' || $field === 'education') && is_string($val)) {
            $val = mb_substr(trim($val), 0, 1000);
        }
        $fields[] = "`$field` = ?";
        $values[] = $val;
    }
}
$values[] = $doctor['id'];
$pdo->prepare("UPDATE doctors SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);

// Verify read back
$check = $pdo->query("SELECT presentation, education, rpps, numregister, casnos, nin FROM doctors WHERE id = '{$doctor['id']}'")->fetch(PDO::FETCH_ASSOC);

$pass = true;
if ($check['presentation'] !== $testPresentation) { echo "FAIL: presentation\n"; $pass = false; }
if ($check['education'] !== $testEducation) { echo "FAIL: education\n"; $pass = false; }
if ($check['rpps'] !== $testRpps) { echo "FAIL: rpps\n"; $pass = false; }
if ($check['numregister'] !== $testNumRegister) { echo "FAIL: numregister\n"; $pass = false; }
if ($check['casnos'] !== $testCasnos) { echo "FAIL: casnos\n"; $pass = false; }
if ($check['nin'] !== $testNin) { echo "FAIL: nin\n"; $pass = false; }

if ($pass) {
    echo "SUCCESS: All updated fields persisted correctly in doctors table!\n";
}

// Restore original values
$pdo->prepare("UPDATE doctors SET presentation = ?, education = ?, rpps = ?, numregister = ?, casnos = ?, nin = ? WHERE id = ?")
    ->execute([$orig['presentation'], $orig['education'], $orig['rpps'], $orig['numregister'], $orig['casnos'], $orig['nin'], $doctor['id']]);

echo "Restored original doctor state.\n";
