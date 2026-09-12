<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$csv = fopen(__DIR__ . '/../doctors_data.csv', 'r');
$header = fgetcsv($csv);
$target_specs = [
    'الطب الفيزيائي وإعادة التأهيل الحركي',
    'طب وجراحة تجميلية',
    'الطب النووي'
];

$names_by_spec = [];
while (($row = fgetcsv($csv)) !== false) {
    $spec = trim($row[1] ?? '');
    if (in_array($spec, $target_specs)) {
        $names_by_spec[$spec][] = [
            'name' => trim($row[0] ?? ''),
            'phone' => trim($row[5] ?? ''),
            'city' => trim($row[2] ?? '')
        ];
    }
}
fclose($csv);

foreach ($target_specs as $ts) {
    echo "=== SPECIALTY: $ts (Found " . count($names_by_spec[$ts] ?? []) . " in CSV) ===\n";
    $sample = array_slice($names_by_spec[$ts] ?? [], 0, 5);
    foreach ($sample as $item) {
        $clean = preg_replace('/^(الدكتور|الدكتورة|Dr\.?|DR\.?)\s+/u', '', $item['name']);
        // Search in DB
        $stmt = $pdo->prepare("SELECT id, fullname, phone, specialtie_id FROM doctors WHERE fullname LIKE ? OR (phone != '' AND phone = ?)");
        $stmt->execute(['%' . $clean . '%', $item['phone']]);
        $found = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "  CSV: {$item['name']} ({$item['phone']}) -> DB matches (" . count($found) . "):\n";
        foreach ($found as $f) {
            echo "    DB ID: {$f['id']} | DB Name: {$f['fullname']} | DB SID: {$f['specialtie_id']}\n";
        }
    }
}
