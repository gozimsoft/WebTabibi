<?php
require_once __DIR__ . '/../backend/config/Database.php';

$pdo = new PDO(
    sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET),
    DB_USER, DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// 1. Fetch all Specialties
$stmt = $pdo->query("SELECT id, namear, namefr FROM specialties ORDER BY namear");
$specialties = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total Specialties: " . count($specialties) . "\n";

// 2. Fetch all Reasons
$stmt = $pdo->query("SELECT id, name, namear, namefr, specialtie_id FROM reasons ORDER BY id");
$reasons = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total Reasons: " . count($reasons) . "\n";

// Helper function to escape Pascal string literals (e.g. single quote ' -> '')
function escapePascal($str) {
    if ($str === null) return "''";
    return str_replace("'", "''", $str);
}

// Generate Specialties Pascal code
$specialties_code = [];
foreach ($specialties as $s) {
    $id = escapePascal($s['id']);
    $nameAr = escapePascal($s['namear']);
    $nameFr = escapePascal($s['namefr']);
    $specialties_code[] = "    SL.Add('INSERT INTO `Specialties` (`ID`, `NameAr`, `NameFr`) VALUES (''$id'', ''$nameAr'', ''$nameFr'');');";
}

// Generate Reasons Pascal code
$reasons_code = [];
foreach ($reasons as $r) {
    $id = escapePascal($r['id']);
    $name = escapePascal($r['name']);
    $nameAr = escapePascal($r['namear']);
    $nameFr = escapePascal($r['namefr']);
    $specId = escapePascal($r['specialtie_id']);
    $reasons_code[] = "    SL.Add('INSERT INTO `Reasons` (`ID`, `Name`, `NameAr`, `NameFr`, `Specialtie_id`) VALUES (''$id'', ''$name'', ''$nameAr'', ''$nameFr'', ''$specId'');');";
}

file_put_contents(__DIR__ . '/specialties_delphi.txt', implode("\n", $specialties_code));
file_put_contents(__DIR__ . '/reasons_delphi.txt', implode("\n", $reasons_code));

echo "Specialties and Reasons Pascal code generated successfully!\n";

// Let's find consultation general reason ID for general medicine
$stmt = $pdo->prepare("SELECT id, name, namear FROM reasons WHERE specialtie_id = 'da195033-5b58-11f0-9c01-525400088b55' LIMIT 5");
$stmt->execute();
$genReasons = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "\nGeneral Medicine Sample Reasons:\n";
print_r($genReasons);
