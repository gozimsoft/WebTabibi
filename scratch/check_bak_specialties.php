<?php
$bak = fopen(__DIR__ . '/../doctors_data.csv.bak', 'r');
$header = fgetcsv($bak);
$check_names = [
    'لغريب حواء',
    'صالحي نور الدين',
    'عمران أ زوجة سياح',
    'م زراري',
    'معهد الزهراء',
    'العيادة النفسية'
];

while (($row = fgetcsv($bak)) !== false) {
    $name = $row[0] ?? '';
    $spec = $row[1] ?? '';
    foreach ($check_names as $cn) {
        if (strpos($name, $cn) !== false) {
            echo "Found in .bak: Name: $name | Spec: $spec\n";
        }
    }
}
fclose($bak);
