<?php
$cities = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);
$postcodes = json_decode(file_get_contents(__DIR__ . '/algeria_postcodes.json'), true);

// Map commune_id to primary post_code
$communePostcode = [];
foreach ($postcodes as $p) {
    $cId = $p['commune_id'];
    $code = (int)$p['post_code'];
    // Keep minimum post_code (main bureau / recette principale)
    if (!isset($communePostcode[$cId]) || $code < $communePostcode[$cId]) {
        $communePostcode[$cId] = $code;
    }
}

echo "Cities count: " . count($cities) . "\n";
echo "Communes with postal code matched: " . count($communePostcode) . "\n";

// Check 64 missing communes
$missingCount = 0;
foreach ($cities as $c) {
    $cId = $c['id'];
    if (!isset($communePostcode[$cId])) {
        $missingCount++;
        echo "Missing postcode for commune {$cId}: {$c['commune_name_ascii']} (Wilaya {$c['wilaya_code']})\n";
    }
}
echo "Total without postal code: $missingCount\n";
