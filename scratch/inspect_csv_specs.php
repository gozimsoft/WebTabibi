<?php
$csv = fopen(__DIR__ . '/../doctors_data.csv', 'r');
$header = fgetcsv($csv);
$specialties_csv = [];
while (($row = fgetcsv($csv)) !== false) {
    $spec = trim($row[1] ?? '');
    if ($spec !== '') {
        $specialties_csv[$spec] = ($specialties_csv[$spec] ?? 0) + 1;
    }
}
fclose($csv);

echo "=== DISTINCT SPECIALTIES IN CSV (" . count($specialties_csv) . ") ===\n";
arsort($specialties_csv);
foreach ($specialties_csv as $name => $count) {
    echo "$name: $count\n";
}
