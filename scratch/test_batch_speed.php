<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$start = microtime(true);
$values = [];
$params = [];
for ($i = 0; $i < 100; $i++) {
    $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
    $values[] = "(?, ?, ?, 'APPROVED')";
    $params[] = $id;
    $params[] = "Test Doctor $i";
    $params[] = "05500000$i";
}

$sql = "INSERT INTO `doctors` (`id`, `fullname`, `phone`, `status`) VALUES " . implode(',', $values);
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

$elapsed = microtime(true) - $start;
echo "Inserted 100 test doctors in a single batch in " . round($elapsed, 3) . " seconds!\n";

$pdo->exec("DELETE FROM `doctors` WHERE `fullname` LIKE 'Test Doctor%'");
echo "Cleaned up.\n";
