<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$ref = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);
$postcodes = json_decode(file_get_contents(__DIR__ . '/algeria_postcodes.json'), true);

// Build reference commune map: [wilaya_code => [communes]]
$refByW = [];
$expectedCount = [];
foreach ($ref as $r) {
    $w = (int)$r['wilaya_code'];
    $refByW[$w][] = $r;
    $expectedCount[$w] = ($expectedCount[$w] ?? 0) + 1;
}

echo "Total Wilayas in reference: " . count($refByW) . "\n";
echo "Total expected communes: " . array_sum($expectedCount) . "\n";

// Map commune_id to primary post_code
$communePostcode = [];
foreach ($postcodes as $p) {
    $cId = $p['commune_id'];
    $code = (int)$p['post_code'];
    if (!isset($communePostcode[$cId]) || $code < $communePostcode[$cId]) {
        $communePostcode[$cId] = $code;
    }
}

// Pseudo wilaya parent mapping
$pseudoMap = [
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

$wilayas = $pdo->query("SELECT id, num, namefr, namear FROM wilayas ORDER BY num")->fetchAll(PDO::FETCH_ASSOC);
$wById = [];
$wByNum = [];
foreach ($wilayas as $w) {
    $wById[$w['id']] = $w;
    $wByNum[(int)$w['num']] = $w;
}

$baladiyas = $pdo->query("SELECT id, wilaya_id, namefr, namear, postcode FROM baladiyas")->fetchAll(PDO::FETCH_ASSOC);

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

// Simulate reassigning pseudo-wilayas to parents
$simulatedBaladiyas = [];
foreach ($baladiyas as $b) {
    $currWNum = (int)($wById[$b['wilaya_id']]['num'] ?? 0);
    $effectiveWNum = $currWNum;
    if (isset($pseudoMap[$currWNum])) {
        $effectiveWNum = $pseudoMap[$currWNum];
    }
    $simulatedBaladiyas[] = [
        'id' => $b['id'],
        'orig_wilaya_id' => $b['wilaya_id'],
        'target_wilaya_id' => $wByNum[$effectiveWNum]['id'],
        'wilaya_num' => $effectiveWNum,
        'namefr' => $b['namefr'],
        'namear' => $b['namear'],
        'postcode' => $b['postcode']
    ];
}

// Group simulated baladiyas by wilaya_num
$simByW = [];
foreach ($simulatedBaladiyas as $b) {
    $simByW[$b['wilaya_num']][] = $b;
}

echo "\n=== Simulation Commune Counts After Reassignment ===\n";
$perfectCount = 0;
for ($wn = 1; $wn <= 58; $wn++) {
    $wName = $wByNum[$wn]['namefr'] ?? "Wilaya $wn";
    $exp = $expectedCount[$wn];
    
    // Check how many unique reference communes are matched in $simByW[$wn]
    $matchedRefIds = [];
    $bList = $simByW[$wn] ?? [];
    foreach ($refByW[$wn] as $refC) {
        $rNorm = norm($refC['commune_name_ascii']);
        $rNormAr = normAr($refC['commune_name']);
        foreach ($bList as $b) {
            if (norm($b['namefr']) === $rNorm || normAr($b['namear']) === $rNormAr) {
                $matchedRefIds[$refC['id']] = true;
                break;
            }
        }
    }
    $matchedCnt = count($matchedRefIds);
    $missingCnt = $exp - $matchedCnt;
    $rawCount = count($bList);
    
    if ($missingCnt === 0) {
        $perfectCount++;
    } else {
        echo sprintf("[%2d] %-22s: Matched = %2d/%2d | Missing = %2d | Raw in DB = %2d\n", 
            $wn, $wName, $matchedCnt, $exp, $missingCnt, $rawCount);
    }
}

echo "\nWilayas already at 100% after reassignment: $perfectCount / 58\n";
