<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

// 1. Wilayas test
$wilayas = $pdo->query("SELECT * FROM wilayas ORDER BY num")->fetchAll(PDO::FETCH_ASSOC);
echo "API /wilayas count: " . count($wilayas) . "\n";
echo "First Wilaya: [{$wilayas[0]['num']}] {$wilayas[0]['namefr']} ({$wilayas[0]['namear']})\n";
echo "Last Wilaya: [{$wilayas[57]['num']}] {$wilayas[57]['namefr']} ({$wilayas[57]['namear']})\n";

// 2. Baladiyas for Alger (Wilaya 16)
$algerId = $pdo->query("SELECT id FROM wilayas WHERE num = 16")->fetchColumn();
$algerB = $pdo->query("SELECT namefr, namear, postcode FROM baladiyas WHERE wilaya_id = '$algerId' ORDER BY namefr")->fetchAll(PDO::FETCH_ASSOC);
echo "\nAlger (Wilaya 16) Communes: " . count($algerB) . " communes\n";
$sampleAlger = ['Mohamed Belouizdad', 'Sidi M\'hamed', 'Ain Benian', 'Hammamet', 'El Marsa', 'Mohammadia', 'Maalma'];
foreach ($sampleAlger as $target) {
    $found = false;
    foreach ($algerB as $b) {
        if (stripos($b['namefr'], str_replace(['\'', ' '], '', $target)) !== false || stripos($b['namefr'], $target) !== false) {
            echo " - Found: {$b['namefr']} ({$b['namear']}) - Postcode: {$b['postcode']}\n";
            $found = true;
            break;
        }
    }
    if (!$found) echo " - NOT FOUND: $target\n";
}

// 3. Baladiyas for M'Sila (Wilaya 28)
$msilaId = $pdo->query("SELECT id FROM wilayas WHERE num = 28")->fetchColumn();
$msilaB = $pdo->query("SELECT namefr, namear, postcode FROM baladiyas WHERE wilaya_id = '$msilaId' ORDER BY namefr")->fetchAll(PDO::FETCH_ASSOC);
echo "\nM'Sila (Wilaya 28) Communes: " . count($msilaB) . " communes (previously 18!)\n";
$sampleMsila = ['Bou Saada', 'Ain El Melh', 'Ain El Hadjel', 'Magra', 'M\'sila', 'Belaiba'];
foreach ($sampleMsila as $target) {
    $found = false;
    foreach ($msilaB as $b) {
        if (stripos($b['namefr'], $target) !== false) {
            echo " - Found: {$b['namefr']} ({$b['namear']}) - Postcode: {$b['postcode']}\n";
            $found = true;
            break;
        }
    }
    if (!$found) echo " - NOT FOUND: $target\n";
}

// 4. Baladiyas for Djelfa (Wilaya 17)
$djelfaId = $pdo->query("SELECT id FROM wilayas WHERE num = 17")->fetchColumn();
$djelfaB = $pdo->query("SELECT namefr, namear, postcode FROM baladiyas WHERE wilaya_id = '$djelfaId' ORDER BY namefr")->fetchAll(PDO::FETCH_ASSOC);
echo "\nDjelfa (Wilaya 17) Communes: " . count($djelfaB) . " communes (previously 19!)\n";
$sampleDjelfa = ['Ain Oussera', 'Messaad', 'Birine', 'Had Sahary', 'Djelfa', 'Faidh El Botma'];
foreach ($sampleDjelfa as $target) {
    $found = false;
    foreach ($djelfaB as $b) {
        if (stripos($b['namefr'], $target) !== false) {
            echo " - Found: {$b['namefr']} ({$b['namear']}) - Postcode: {$b['postcode']}\n";
            $found = true;
            break;
        }
    }
    if (!$found) echo " - NOT FOUND: $target\n";
}
