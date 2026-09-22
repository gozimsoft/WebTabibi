<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$ref = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);
$postcodes = json_decode(file_get_contents(__DIR__ . '/algeria_postcodes.json'), true);

function norm($s) {
    $s = mb_strtolower(trim($s));
    $s = str_replace(['-', '_', "'", '’', '`', ' '], '', $s);
    $s = str_replace(['é', 'è', 'ê', 'ë'], 'e', $s);
    $s = str_replace(['à', 'â', 'ä'], 'a', $s);
    $s = str_replace(['î', 'ï'], 'i', $s);
    $s = str_replace(['ô', 'ö'], 'o', $s);
    $s = str_replace(['ù', 'û', 'ü'], 'u', $s);
    $s = str_replace(['ç'], 'c', $s);
    return $s;
}

function normAr($s) {
    $s = trim($s);
    $s = preg_replace('/[أإآ]/u', 'ا', $s);
    $s = preg_replace('/[ة]/u', 'ه', $s);
    $s = preg_replace('/[ى]/u', 'ي', $s);
    $s = preg_replace('/\s+/u', '', $s);
    return $s;
}

function gen_uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// Map commune_id to primary post_code
$communePostcode = [];
foreach ($postcodes as $p) {
    $cId = (int)$p['commune_id'];
    $code = (int)$p['post_code'];
    if ($code > 0 && (!isset($communePostcode[$cId]) || $code < $communePostcode[$cId])) {
        $communePostcode[$cId] = $code;
    }
}

// Load DB wilayas (1 to 58)
$wilayas = $pdo->query("SELECT id, num, namefr, namear FROM wilayas ORDER BY num")->fetchAll(PDO::FETCH_ASSOC);
$wByNum = [];
$wById = [];
foreach ($wilayas as $w) {
    $num = (int)$w['num'];
    $wByNum[$num] = $w;
    $wById[$w['id']] = $w;
}

echo "=== STARTING COMMUNES REMEDIATION ===\n";

$pdo->beginTransaction();

// STEP 1: Specific relocations of misplaced communes currently in pseudo-wilayas
// 1. Mohamed Belouzdad (68010 in W68) -> Wilaya 16 (Alger)
$w16Id = $wByNum[16]['id'];
$pdo->exec("UPDATE baladiyas SET wilaya_id = '$w16Id', postcode = 16015, namefr = 'Mohamed Belouizdad' WHERE namefr LIKE '%Belouzdad%' AND postcode LIKE '68%'");

// 2. Elhammadia in W64 -> Wilaya 34 (Bordj Bou Arreridj)
$w34Id = $wByNum[34]['id'];
$pdo->exec("UPDATE baladiyas SET wilaya_id = '$w34Id', postcode = 34022 WHERE namefr = 'Elhammadia' AND wilaya_id = '{$wByNum[64]['id']}'");

// 3. Oued Lakhdar in W67 -> Wilaya 13 (Tlemcen)
$w13Id = $wByNum[13]['id'];
$pdo->exec("UPDATE baladiyas SET wilaya_id = '$w13Id', postcode = 13038 WHERE namefr = 'Oued Lakhdar' AND wilaya_id = '{$wByNum[67]['id']}'");

// 4. One copy of Bougara in W64 (which belongs to Blida W09)
$w09Id = $wByNum[9]['id'];
// Let's find if Blida has Bougara
$blidaHasBougara = $pdo->query("SELECT id FROM baladiyas WHERE wilaya_id = '$w09Id' AND (namefr LIKE '%Bougara%' OR namear LIKE '%بوقرة%')")->fetchColumn();
if (!$blidaHasBougara) {
    // Reassign one Bougara from W64 to Blida
    $bougaraId = $pdo->query("SELECT id FROM baladiyas WHERE wilaya_id = '{$wByNum[64]['id']}' AND namefr = 'Bougara' LIMIT 1")->fetchColumn();
    if ($bougaraId) {
        $pdo->exec("UPDATE baladiyas SET wilaya_id = '$w09Id', postcode = 9006 WHERE id = '$bougaraId'");
        echo "Reassigned Bougara from pseudo-wilaya 64 to Wilaya 09 (Blida)\n";
    }
}

// STEP 2: Reassign all other communes in pseudo-wilayas 59-69 to their mother wilaya
$pseudoParentMap = [
    59 => 3,  // Aflou -> Laghouat
    60 => 5,  // Barika -> Batna
    61 => 7,  // El Kantara -> Biskra
    62 => 12, // Bir El Ater -> Tébessa
    63 => 13, // El Aricha -> Tlemcen
    64 => 14, // Ksar Chellala -> Tiaret
    65 => 17, // Ain Oussera -> Djelfa
    66 => 17, // Messad -> Djelfa
    67 => 26, // Ksar El Boukhari -> Médéa
    68 => 28, // Bou Saada -> M'Sila
    69 => 32, // El Abiodh Sidi Cheikh -> El Bayadh
];

foreach ($pseudoParentMap as $pseudoNum => $parentNum) {
    if (!isset($wByNum[$pseudoNum]) || !isset($wByNum[$parentNum])) continue;
    $pseudoId = $wByNum[$pseudoNum]['id'];
    $parentId = $wByNum[$parentNum]['id'];
    
    $cnt = $pdo->exec("UPDATE baladiyas SET wilaya_id = '$parentId' WHERE wilaya_id = '$pseudoId'");
    echo "Reassigned $cnt communes from Wilaya $pseudoNum to parent Wilaya $parentNum ({$wByNum[$parentNum]['namefr']})\n";
}

// STEP 3: Deduplicate identical communes within the same wilaya
// For each wilaya, if multiple rows have the exact same namefr or namear:
// Merge them: update doctors & patients pointing to duplicate IDs to the primary ID, then delete duplicate row.
$wilayas58 = $pdo->query("SELECT id, num, namefr FROM wilayas WHERE num <= 58 ORDER BY num")->fetchAll(PDO::FETCH_ASSOC);

$totalMerged = 0;
foreach ($wilayas58 as $w) {
    $wId = $w['id'];
    $wNum = (int)$w['num'];
    $bList = $pdo->query("SELECT id, namefr, namear, postcode FROM baladiyas WHERE wilaya_id = '$wId' ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
    
    $seen = [];
    foreach ($bList as $b) {
        $keyFr = norm($b['namefr']);
        $keyAr = normAr($b['namear']);
        
        $matchKey = null;
        if (isset($seen[$keyFr])) {
            $matchKey = $keyFr;
        } elseif (isset($seen[$keyAr])) {
            $matchKey = $keyAr;
        }
        
        if ($matchKey !== null) {
            $keep = $seen[$matchKey];
            $dupId = $b['id'];
            $keepId = $keep['id'];
            
            // Re-point any doctors pointing to duplicate
            $docUpdated = $pdo->exec("UPDATE doctors SET baladiya_id = '$keepId' WHERE baladiya_id = '$dupId'");
            // Re-point any patients pointing to duplicate
            $patUpdated = $pdo->exec("UPDATE patients SET baladiya_id = '$keepId' WHERE baladiya_id = '$dupId'");
            
            // Delete duplicate
            $pdo->exec("DELETE FROM baladiyas WHERE id = '$dupId'");
            $totalMerged++;
            // echo "Merged duplicate in Wilaya $wNum: '{$b['namefr']}' ($dupId -> $keepId, docs: $docUpdated, pats: $patUpdated)\n";
        } else {
            $seen[$keyFr] = $b;
            if ($keyAr !== '') $seen[$keyAr] = $b;
        }
    }
}
echo "Total duplicate communes merged: $totalMerged\n";

// STEP 4: Insert missing reference communes for each of the 58 Wilayas
// Check all 1541 reference communes
$totalInserted = 0;
$stmtInsert = $pdo->prepare("
    INSERT INTO baladiyas (id, namefr, namear, postcode, wilaya_id)
    VALUES (?, ?, ?, ?, ?)
");

// Pre-load current baladiyas by wilaya_id
$currentBaladiyas = $pdo->query("SELECT id, wilaya_id, namefr, namear, postcode FROM baladiyas")->fetchAll(PDO::FETCH_ASSOC);
$currentByW = [];
foreach ($currentBaladiyas as $b) {
    $currentByW[$b['wilaya_id']][] = $b;
}

foreach ($ref as $refItem) {
    $wNum = (int)$refItem['wilaya_code'];
    if (!isset($wByNum[$wNum])) continue;
    $wId = $wByNum[$wNum]['id'];
    
    $rNormFr = norm($refItem['commune_name_ascii']);
    $rNormAr = normAr($refItem['commune_name']);
    
    // Check if already in this wilaya
    $found = false;
    if (isset($currentByW[$wId])) {
        foreach ($currentByW[$wId] as $cb) {
            if (norm($cb['namefr']) === $rNormFr || normAr($cb['namear']) === $rNormAr) {
                $found = true;
                break;
            }
        }
    }
    
    if (!$found) {
        $cId = (int)$refItem['id'];
        $postcode = $communePostcode[$cId] ?? ($wNum * 1000 + 1);
        $newId = gen_uuid();
        $nameFr = trim($refItem['commune_name_ascii']);
        $nameAr = trim($refItem['commune_name']);
        
        $stmtInsert->execute([$newId, $nameFr, $nameAr, $postcode, $wId]);
        $currentByW[$wId][] = [
            'id' => $newId,
            'wilaya_id' => $wId,
            'namefr' => $nameFr,
            'namear' => $nameAr,
            'postcode' => $postcode
        ];
        $totalInserted++;
        echo "Inserted missing commune in Wilaya [$wNum] {$wByNum[$wNum]['namefr']}: $nameFr ($nameAr) - Postcode: $postcode\n";
    }
}

echo "Total missing communes inserted: $totalInserted\n";

// STEP 5: Update postcodes for communes that have fake 6x000 postcodes or outdated postcodes
$allBaladiyas = $pdo->query("SELECT b.id, b.namefr, b.namear, b.postcode, b.wilaya_id, w.num as w_num FROM baladiyas b JOIN wilayas w ON w.id = b.wilaya_id")->fetchAll(PDO::FETCH_ASSOC);
$postcodeUpdated = 0;
$stmtUpdatePostcode = $pdo->prepare("UPDATE baladiyas SET postcode = ? WHERE id = ?");

// Build lookup of reference postcodes
$refLookup = [];
foreach ($ref as $r) {
    $cId = (int)$r['id'];
    $wNum = (int)$r['wilaya_code'];
    $pc = $communePostcode[$cId] ?? null;
    if ($pc) {
        $refLookup[$wNum . '_' . norm($r['commune_name_ascii'])] = $pc;
        $refLookup[$wNum . '_' . normAr($r['commune_name'])] = $pc;
    }
}

foreach ($allBaladiyas as $b) {
    $wNum = (int)$b['w_num'];
    $currPc = (int)$b['postcode'];
    $expectedPc = $refLookup[$wNum . '_' . norm($b['namefr'])] ?? $refLookup[$wNum . '_' . normAr($b['namear'])] ?? null;
    
    if ($expectedPc && ($currPc >= 59000 || $currPc <= 0 || floor($currPc / 1000) != $wNum)) {
        $stmtUpdatePostcode->execute([$expectedPc, $b['id']]);
        $postcodeUpdated++;
    }
}
echo "Postcodes sanitized to official values: $postcodeUpdated\n";

// Check final counts
$finalTotal = $pdo->query("SELECT COUNT(*) FROM baladiyas")->fetchColumn();
echo "FINAL TOTAL BALADIYAS IN DB: $finalTotal\n";

$pdo->commit();
echo "=== TRANSACTION COMMITTED SUCCESSFULLY ===\n";
