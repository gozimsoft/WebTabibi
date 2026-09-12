<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Test single prepared insert
$stmt = $pdo->prepare("INSERT INTO `doctors` (`id`, `fullname`, `phone`, `status`) VALUES (?, ?, ?, 'APPROVED')");

$start = microtime(true);
$pdo->beginTransaction();
for ($i = 0; $i < 10; $i++) {
    $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
    $stmt->execute([$id, "Test Doctor $i", "055000000$i"]);
}
$pdo->commit();
$elapsed = microtime(true) - $start;

echo "Inserted 10 test doctors in " . round($elapsed, 3) . " seconds.\n";

// Cleanup test doctors
$pdo->exec("DELETE FROM `doctors` WHERE `fullname` LIKE 'Test Doctor%'");
echo "Cleaned up.\n";
