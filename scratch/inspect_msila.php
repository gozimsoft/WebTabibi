<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$ref = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);
$pseudoMap = [
    59 => 3,  60 => 5,  61 => 7,  62 => 12, 63 => 13,
    64 => 14, 65 => 17, 66 => 17, 67 => 26, 68 => 28, 69 => 32
];

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

// Check Wilaya 28 M'Sila
$refMsila = [];
foreach ($ref as $r) {
    if ((int)$r['wilaya_code'] === 28) {
        $refMsila[norm($r['commune_name_ascii'])] = $r;
    }
}

$dbMsila = $pdo->query("
    SELECT b.id, b.namefr, b.namear, b.postcode, w.num,
           (SELECT COUNT(*) FROM doctors WHERE baladiya_id = b.id) as doc_count
    FROM baladiyas b
    JOIN wilayas w ON w.id = b.wilaya_id
    WHERE w.num IN (28, 68)
    ORDER BY b.namefr
")->fetchAll(PDO::FETCH_ASSOC);

echo "=== M'Sila & Bou Saada Entries in DB (" . count($dbMsila) . ") ===\n";
foreach ($dbMsila as $b) {
    $n = norm($b['namefr']);
    $inRef = isset($refMsila[$n]) ? "OK (In Ref)" : "EXTRA/MISMATCH";
    echo sprintf("%-25s | %-25s | Postcode: %-5s | W: %2d | Docs: %2d | %s\n", 
        $b['namefr'], $b['namear'], $b['postcode'], $b['num'], $b['doc_count'], $inRef);
}
