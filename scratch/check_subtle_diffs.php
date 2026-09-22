<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$ref = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);

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

$refByW = [];
foreach ($ref as $r) {
    $w = (int)$r['wilaya_code'];
    $refByW[$w][] = $r;
}

$wilayas = $pdo->query("SELECT id, num, namefr FROM wilayas WHERE num <= 58 ORDER BY num")->fetchAll(PDO::FETCH_ASSOC);

foreach ($wilayas as $w) {
    $wNum = (int)$w['num'];
    $wId = $w['id'];
    $dbB = $pdo->query("SELECT id, namefr, namear, postcode FROM baladiyas WHERE wilaya_id = '$wId'")->fetchAll(PDO::FETCH_ASSOC);
    $refB = $refByW[$wNum] ?? [];
    
    // Check unmatched in DB
    $unmatchedInDb = [];
    foreach ($dbB as $b) {
        $matched = false;
        foreach ($refB as $r) {
            if (norm($b['namefr']) === norm($r['commune_name_ascii']) || normAr($b['namear']) === normAr($r['commune_name'])) {
                $matched = true;
                break;
            }
        }
        if (!$matched) {
            $docCnt = $pdo->query("SELECT COUNT(*) FROM doctors WHERE baladiya_id = '{$b['id']}'")->fetchColumn();
            $unmatchedInDb[] = "{$b['namefr']} ({$b['namear']}) [Docs: $docCnt, ID: {$b['id']}]";
        }
    }
    
    // Check missing in DB
    $missingInDb = [];
    foreach ($refB as $r) {
        $matched = false;
        foreach ($dbB as $b) {
            if (norm($b['namefr']) === norm($r['commune_name_ascii']) || normAr($b['namear']) === normAr($r['commune_name'])) {
                $matched = true;
                break;
            }
        }
        if (!$matched) {
            $missingInDb[] = "{$r['commune_name_ascii']} ({$r['commune_name']})";
        }
    }
    
    if (!empty($unmatchedInDb) || !empty($missingInDb)) {
        echo "=== Wilaya [$wNum] {$w['namefr']} (DB: " . count($dbB) . " | Ref: " . count($refB) . ") ===\n";
        if (!empty($unmatchedInDb)) {
            echo "   Extra/Unmatched in DB:\n      - " . implode("\n      - ", $unmatchedInDb) . "\n";
        }
        if (!empty($missingInDb)) {
            echo "   Missing from DB:\n      - " . implode("\n      - ", $missingInDb) . "\n";
        }
    }
}
