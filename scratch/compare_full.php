<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

// Load reference 1541 communes
$ref = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);

// Load DB wilayas
$dbWilayas = $pdo->query("SELECT id, num, namefr, namear FROM wilayas ORDER BY num")->fetchAll(PDO::FETCH_ASSOC);
$wilayaByNum = [];
foreach ($dbWilayas as $w) {
    $wilayaByNum[(int)$w['num']] = $w;
}

// Load DB baladiyas
$dbBaladiyas = $pdo->query("SELECT id, wilaya_id, namefr, namear, postcode FROM baladiyas")->fetchAll(PDO::FETCH_ASSOC);

echo "Total DB Wilayas: " . count($dbWilayas) . "\n";
echo "Total DB Baladiyas: " . count($dbBaladiyas) . "\n";

// Check reference communes against DB
// Let's normalize strings for comparison
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

// Build index of DB baladiyas by wilaya_num
$baladiyasByWilayaNum = [];
foreach ($dbBaladiyas as $b) {
    $wId = $b['wilaya_id'];
    // Find wilaya num
    $wNum = null;
    foreach ($dbWilayas as $w) {
        if ($w['id'] === $wId) {
            $wNum = (int)$w['num'];
            break;
        }
    }
    if ($wNum !== null) {
        $baladiyasByWilayaNum[$wNum][] = $b;
    }
}

// Mapping of pseudo-wilayas to parent wilayas
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

// Let's analyze missing communes for each of the 58 official wilayas
$missingOverall = [];
$foundInPseudo = [];

foreach ($ref as $c) {
    $targetWNum = (int)$c['wilaya_code'];
    $cNameAscii = $c['commune_name_ascii'];
    $cNameAr = $c['commune_name'];
    $normAscii = norm($cNameAscii);
    $normAr = normAr($cNameAr);
    
    // Check in the wilaya itself
    $found = false;
    if (isset($baladiyasByWilayaNum[$targetWNum])) {
        foreach ($baladiyasByWilayaNum[$targetWNum] as $b) {
            if (norm($b['namefr']) === $normAscii || normAr($b['namear']) === $normAr) {
                $found = true;
                break;
            }
        }
    }
    
    // If not found, check if it's in a pseudo-wilaya that belongs to this target wilaya
    if (!$found) {
        foreach ($pseudoMap as $pseudoNum => $parentNum) {
            if ($parentNum === $targetWNum && isset($baladiyasByWilayaNum[$pseudoNum])) {
                foreach ($baladiyasByWilayaNum[$pseudoNum] as $b) {
                    if (norm($b['namefr']) === $normAscii || normAr($b['namear']) === $normAr) {
                        $foundInPseudo[] = [
                            'commune' => $cNameAscii,
                            'commune_ar' => $cNameAr,
                            'target_wilaya' => $targetWNum,
                            'pseudo_wilaya' => $pseudoNum,
                            'baladiya_id' => $b['id'],
                            'db_namefr' => $b['namefr'],
                            'db_postcode' => $b['postcode']
                        ];
                        $found = true;
                        break 2;
                    }
                }
            }
        }
    }
    
    // If still not found, check ALL db baladiyas anywhere
    if (!$found) {
        $foundSomewhereElse = null;
        foreach ($baladiyasByWilayaNum as $wNum => $bList) {
            foreach ($bList as $b) {
                if (norm($b['namefr']) === $normAscii || normAr($b['namear']) === $normAr) {
                    $foundSomewhereElse = $wNum;
                    break 2;
                }
            }
        }
        $missingOverall[] = [
            'commune' => $cNameAscii,
            'commune_ar' => $cNameAr,
            'target_wilaya' => $targetWNum,
            'found_in_w' => $foundSomewhereElse
        ];
    }
}

echo "Total reference communes: " . count($ref) . "\n";
echo "Found in pseudo-wilayas (to reassign): " . count($foundInPseudo) . "\n";
echo "Completely missing or in other wilayas: " . count($missingOverall) . "\n";

echo "\n--- Missing Communes by Target Wilaya ---\n";
$missingByW = [];
foreach ($missingOverall as $m) {
    $missingByW[$m['target_wilaya']][] = $m;
}
ksort($missingByW);
foreach ($missingByW as $wNum => $list) {
    $wName = $wilayaByNum[$wNum]['namefr'] ?? 'Unknown';
    echo "Wilaya [$wNum] $wName (" . count($list) . "):\n";
    foreach ($list as $item) {
        $extra = $item['found_in_w'] ? " (found in wilaya {$item['found_in_w']})" : " (NOT IN DB AT ALL)";
        echo "   - {$item['commune']} ({$item['commune_ar']}){$extra}\n";
    }
}
