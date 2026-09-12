<?php
require_once __DIR__ . '/../backend/config/Database.php';

$pdo = new PDO(
    sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET),
    DB_USER, DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// Fetch all 27 Specialties from remote DB
$stmt = $pdo->query("SELECT id, namear, namefr FROM specialties ORDER BY id");
$specialties = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Fetch all 716 Reasons from remote DB (only ID and Name)
$stmt = $pdo->query("SELECT id, name FROM reasons ORDER BY id");
$reasons = $stmt->fetchAll(PDO::FETCH_ASSOC);

function escapePascal($str) {
    if ($str === null) return "''";
    return str_replace("'", "''", $str);
}

$file_path = 'D:/Delphi/programs/Clinic/uCreateDatabase.pas';
$lines = file($file_path);

$new_lines = [];
$spec_done = false;
$reason_done = false;

foreach ($lines as $line) {
    // 1. Revert CreateTables for Specialties
    if (strpos($line, "CREATE TABLE IF NOT EXISTS `Specialties`") !== false) {
        $new_lines[] = "  ExecSQL('CREATE TABLE IF NOT EXISTS `Specialties` ( `ID` CHAR(36) NOT NULL PRIMARY KEY, `NameAr` VARCHAR(50) NOT NULL, `NameFr` VARCHAR(50) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');\r\n";
        continue;
    }

    // 2. Revert CreateTables for Reasons (only ID, Name)
    if (strpos($line, "CREATE TABLE IF NOT EXISTS `Reasons`") !== false) {
        $new_lines[] = "  ExecSQL('CREATE TABLE IF NOT EXISTS `Reasons` ( `ID` CHAR(36) NOT NULL PRIMARY KEY, `Name` VARCHAR(50) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');\r\n";
        continue;
    }

    // 3. Specialties inserts (ID, NameAr, NameFr)
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
        continue;
    }

    // 4. Reasons inserts (only ID, Name)
    if (strpos($line, "INSERT INTO `Reasons`") !== false) {
        if (!$reason_done) {
            foreach ($reasons as $r) {
                $id = escapePascal($r['id']);
                $name = escapePascal($r['name']);
                $new_lines[] = "    SL.Add('INSERT INTO `Reasons` (`ID`, `Name`) VALUES (''$id'', ''$name'');');\r\n";
            }
            $reason_done = true;
        }
        continue;
    }

    // 5. Remove fk_reasons_specialtie_id constraint
    if (strpos($line, "fk_reasons_specialtie_id") !== false) {
        // Skip this line completely
        continue;
    }

    $new_lines[] = $line;
}

file_put_contents($file_path, implode('', $new_lines));
echo "Successfully updated Delphi uCreateDatabase.pas with original schema fields only!\n";
echo "Total lines: " . count($new_lines) . "\n";
