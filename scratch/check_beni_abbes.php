<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$ref = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);
$dbCommunes = $pdo->query('
    SELECT b.id, b.namefr, b.namear, (SELECT COUNT(*) FROM doctors WHERE baladiya_id = b.id) as doc_cnt 
    FROM baladiyas b 
    JOIN wilayas w ON w.id = b.wilaya_id 
    WHERE w.num = 52
')->fetchAll(PDO::FETCH_ASSOC);

echo "DB Communes in Béni Abbès (" . count($dbCommunes) . "):\n";
foreach ($dbCommunes as $b) {
    echo " - " . $b['namefr'] . " (" . $b['namear'] . ") [Docs: " . $b['doc_cnt'] . ", ID: " . $b['id'] . "]\n";
}

echo "\nCanonical in Béni Abbès:\n";
foreach ($ref as $r) {
    if ($r['wilaya_code'] === '52') {
        echo " * " . $r['commune_name_ascii'] . " (" . $r['commune_name'] . ")\n";
    }
}
