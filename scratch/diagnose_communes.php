<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$ref = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);
$dbWilayas = $pdo->query("SELECT id, num, namefr, namear FROM wilayas ORDER BY num")->fetchAll(PDO::FETCH_ASSOC);
$wilayaByNum = [];
foreach ($dbWilayas as $w) {
    $wilayaByNum[(int)$w['num']] = $w;
}

$dbBaladiyas = $pdo->query("
    SELECT b.id, b.wilaya_id, b.namefr, b.namear, b.postcode, w.num as wilaya_num, w.namefr as wilaya_namefr
    FROM baladiyas b
    JOIN wilayas w ON w.id = b.wilaya_id
")->fetchAll(PDO::FETCH_ASSOC);

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

// Index DB baladiyas by wilaya_num
$dbByW = [];
foreach ($dbBaladiyas as $b) {
    $dbByW[(int)$b['wilaya_num']][] = $b;
}

// Map pseudo wilayas
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

// For each of the 1541 reference communes:
// Check status:
// 1. EXACT_MATCH in target wilaya
// 2. IN_PSEUDO_WILAYA (needs wilaya_id update to parent wilaya)
// 3. COMPLETELY_MISSING_IN_TARGET_WILAYA (needs INSERT)

$exactMatch = [];
$inPseudo = [];
$needsInsert = [];

foreach ($ref as $refItem) {
    $targetWNum = (int)$refItem['wilaya_code'];
    $nameAscii = $refItem['commune_name_ascii'];
    $nameAr = $refItem['commune_name'];
    $nAscii = norm($nameAscii);
    $nAr = normAr($nameAr);
    
    // Check in target wilaya
    $matchedDbId = null;
    if (isset($dbByW[$targetWNum])) {
        foreach ($dbByW[$targetWNum] as $b) {
            if (norm($b['namefr']) === $nAscii || normAr($b['namear']) === $nAr) {
                $matchedDbId = $b['id'];
                break;
            }
        }
    }
    
    if ($matchedDbId) {
        $exactMatch[] = [
            'ref' => $refItem,
            'db_id' => $matchedDbId
        ];
        continue;
    }
    
    // Check in pseudo-wilayas that map to target wilaya
    $foundPseudo = null;
    foreach ($pseudoMap as $pNum => $parentWNum) {
        if ($parentWNum === $targetWNum && isset($dbByW[$pNum])) {
            foreach ($dbByW[$pNum] as $b) {
                if (norm($b['namefr']) === $nAscii || normAr($b['namear']) === $nAr) {
                    $foundPseudo = [
                        'ref' => $refItem,
                        'b_id' => $b['id'],
                        'current_w_num' => $pNum,
                        'target_w_num' => $targetWNum,
                        'current_postcode' => $b['postcode']
                    ];
                    break 2;
                }
            }
        }
    }
    
    if ($foundPseudo) {
        $inPseudo[] = $foundPseudo;
        continue;
    }
    
    // Not found in target wilaya nor in pseudo wilayas
    $needsInsert[] = [
        'ref' => $refItem,
        'target_w_num' => $targetWNum,
        'namefr' => $nameAscii,
        'namear' => $nameAr
    ];
}

echo "=== DIAGNOSTIC REPORT ===\n";
echo "Total canonical communes: " . count($ref) . "\n";
echo "Exact matches already in target wilaya: " . count($exactMatch) . "\n";
echo "In pseudo-wilayas (reassign to parent wilaya): " . count($inPseudo) . "\n";
echo "Needs INSERT in target wilaya: " . count($needsInsert) . "\n";

echo "\n--- Communes needing INSERT (" . count($needsInsert) . ") ---\n";
$byW = [];
foreach ($needsInsert as $item) {
    $byW[$item['target_w_num']][] = $item;
}
ksort($byW);
foreach ($byW as $wNum => $items) {
    $wName = $wilayaByNum[$wNum]['namefr'] ?? 'Unknown';
    echo "Wilaya [$wNum] $wName (" . count($items) . "):\n";
    foreach ($items as $it) {
        echo "   + {$it['namefr']} ({$it['namear']})\n";
    }
}
