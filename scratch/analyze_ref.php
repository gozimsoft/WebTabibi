<?php
$data = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);
$wilayas = [];
foreach ($data as $c) {
    $code = $c['wilaya_code'];
    if (!isset($wilayas[$code])) {
        $wilayas[$code] = [
            'name_ascii' => $c['wilaya_name_ascii'],
            'name_ar' => $c['wilaya_name'],
            'count' => 0
        ];
    }
    $wilayas[$code]['count']++;
}
ksort($wilayas);
echo "Total Wilayas in reference: " . count($wilayas) . "\n";
echo "Total Communes: " . count($data) . "\n";
foreach ($wilayas as $code => $w) {
    echo sprintf("[%2s] %-22s (%s) : %d communes\n", $code, $w['name_ascii'], $w['name_ar'], $w['count']);
}
