<?php
$wilayas = json_decode(file_get_contents('http://localhost:81/api/wilayas'), true);
$items = $wilayas['data'] ?? $wilayas;
foreach ($items as $w) {
    if (in_array($w['num'], [3, 5, 7, 12, 14, 16, 17, 26, 28, 32])) {
        $bals = json_decode(file_get_contents('http://localhost:81/api/baladiyas?wilaya_id=' . urlencode($w['id'])), true);
        $list = $bals['data'] ?? $bals;
        echo sprintf("Wilaya [%2d] %-20s communes via HTTP: %d\n", $w['num'], $w['namefr'], count($list));
    }
}
