<?php
require_once __DIR__ . '/../backend/config/Database.php';

$pdo = new PDO(
    sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET),
    DB_USER, DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// 1. Fetch all Specialties from remote DB
$stmt = $pdo->query("SELECT id, namear, namefr FROM specialties ORDER BY id");
$specialties = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 2. Fetch all Reasons from remote DB
$stmt = $pdo->query("SELECT id, name, namear, namefr, specialtie_id FROM reasons ORDER BY id");
$reasons = $stmt->fetchAll(PDO::FETCH_ASSOC);

function escapePascal($str) {
    if ($str === null) return "''";
    return str_replace("'", "''", $str);
}

$file_path = 'D:/Delphi/programs/Clinic/uCreateDatabase.pas';
$lines = file($file_path);

echo "Total lines in file: " . count($lines) . "\n";

$new_lines = [];
$in_spec = false;
$spec_done = false;
$in_reason = false;
$reason_done = false;

foreach ($lines as $line) {
    // Check if line is Specialties insert
    if (strpos($line, "INSERT INTO `Specialties`") !== false) {
        if (!$spec_done) {
            foreach ($specialties as $s) {
                $id = escapePascal($s['id']);
                $nameAr = escapePascal($s['namear']);
                $nameFr = escapePascal($s['namefr']);
                $new_lines[] = "    SL.Add('INSERT INTO `Specialties` (`ID`, `NameAr`, `NameFr`) VALUES (''$id'', ''$nameAr'', ''$nameFr'');');\r\n";
            }
            $spec_done = true;
        }
        // Skip existing specialties lines
        continue;
    }

    // Check if line is Reasons insert
    if (strpos($line, "INSERT INTO `Reasons`") !== false) {
        if (!$reason_done) {
            foreach ($reasons as $r) {
                $id = escapePascal($r['id']);
                $name = escapePascal($r['name']);
                $nameAr = escapePascal($r['namear']);
                $nameFr = escapePascal($r['namefr']);
                $specId = escapePascal($r['specialtie_id']);
                $new_lines[] = "    SL.Add('INSERT INTO `Reasons` (`ID`, `Name`, `NameAr`, `NameFr`, `Specialtie_id`) VALUES (''$id'', ''$name'', ''$nameAr'', ''$nameFr'', ''$specId'');');\r\n";
            }
            $reason_done = true;
        }
        // Skip existing reasons lines
        continue;
    }

    $new_lines[] = $line;
}

echo "Spec done: " . ($spec_done ? 'YES' : 'NO') . "\n";
echo "Reason done: " . ($reason_done ? 'YES' : 'NO') . "\n";
echo "New total lines: " . count($new_lines) . "\n";

file_put_contents($file_path, implode('', $new_lines));
echo "Successfully updated $file_path!\n";
