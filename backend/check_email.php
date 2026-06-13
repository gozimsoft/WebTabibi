<?php
require_once __DIR__ . '/core/Database.php';

$pdo = Database::getInstance();
$email = 'amaromargg@gmail.com';

$tables = ['patients', 'doctors', 'clinics', 'doctorregistrations', 'clinicregistrations', 'users'];
foreach ($tables as $table) {
    try {
        if ($table === 'users') {
            $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE LOWER(username) = ?");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE LOWER(email) = ?");
        }
        $stmt->execute([$email]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Table $table: " . count($rows) . " matches.\n";
        if (count($rows) > 0) {
            print_r($rows);
        }
    } catch (Exception $e) {
        echo "Error on table $table: " . $e->getMessage() . "\n";
    }
}
