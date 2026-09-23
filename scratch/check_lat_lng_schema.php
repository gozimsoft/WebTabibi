<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();
echo "--- CLINICS ---\n";
foreach ($pdo->query('DESCRIBE clinics') as $row) {
    if (in_array($row['Field'], ['latitude', 'longitude', 'cliniccoordinates'])) {
        print_r($row);
    }
}

echo "--- DOCTORS ---\n";
foreach ($pdo->query('DESCRIBE doctors') as $row) {
    if (in_array($row['Field'], ['latitude', 'longitude'])) {
        print_r($row);
    }
}
