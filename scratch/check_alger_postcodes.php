<?php
$postcodes = json_decode(file_get_contents(__DIR__ . '/algeria_postcodes.json'), true);
$cities = json_decode(file_get_contents(__DIR__ . '/algeria_cities_ref.json'), true);

$algerCommunes = [
    'Mohamed Belouzdad',
    'El Marsa',
    'Mohammadia',
    'Maalma',
    'Ain Benian',
    'Hammamet',
    'Sidi M\'hamed'
];

foreach ($cities as $c) {
    if ($c['wilaya_code'] === '16' && in_array($c['commune_name_ascii'], $algerCommunes)) {
        echo "Commune {$c['id']}: {$c['commune_name_ascii']} ({$c['commune_name']})\n";
        foreach ($postcodes as $p) {
            if ($p['commune_id'] == $c['id']) {
                echo "   -> Post: {$p['post_code']} - {$p['post_name_ascii']}\n";
            }
        }
    }
}
