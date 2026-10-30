<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
echo "Connected successfully to hosting database!\n";

$stmt = $pdo->query("SHOW TABLES LIKE '%apointements%'");
echo "Appointment tables:\n";
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
    echo " - " . $row[0] . "\n";
}

echo "\nColumns in doctorssettingapointements:\n";
$stmt = $pdo->query("DESCRIBE doctorssettingapointements");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo " - {$row['Field']} ({$row['Type']})\n";
}

echo "\nColumns in apointements:\n";
$stmt = $pdo->query("DESCRIBE apointements");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo " - {$row['Field']} ({$row['Type']})\n";
}
