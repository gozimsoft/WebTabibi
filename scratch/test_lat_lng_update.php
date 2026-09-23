<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();
$doc = $pdo->query('SELECT id, latitude, longitude FROM doctors LIMIT 1')->fetch(PDO::FETCH_ASSOC);
echo "Testing on doctor: " . $doc['id'] . "\n";

try {
    $stmt = $pdo->prepare('UPDATE doctors SET latitude = ?, longitude = ? WHERE id = ?');
    $stmt->execute(['', '', $doc['id']]);
    echo "Empty string update: SUCCESS\n";
} catch (Exception $e) {
    echo "Empty string update: FAILED - " . $e->getMessage() . "\n";
}

try {
    $stmt = $pdo->prepare('UPDATE doctors SET latitude = ?, longitude = ? WHERE id = ?');
    $stmt->execute([36.7538, 3.0588, $doc['id']]);
    echo "Float update: SUCCESS\n";
} catch (Exception $e) {
    echo "Float update: FAILED - " . $e->getMessage() . "\n";
}
