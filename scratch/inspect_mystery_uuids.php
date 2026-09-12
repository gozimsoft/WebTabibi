<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$uids = [
    '2b2865d6-5966-5644-9c3f-2ba3e021cff4',
    '9278b6bc-525f-5c33-b3ef-cf69c0df0893',
    '83ca1c62-c4e2-59e2-9c47-74d5b9c9c5e3',
    'ef64a1a4-b6b6-55d3-8fbc-52423b032d80'
];

foreach ($uids as $uid) {
    echo "=== SAMPLE DOCTORS FOR $uid ===\n";
    $stmt = $pdo->prepare("SELECT id, fullname, phone, address FROM doctors WHERE specialtie_id = ? LIMIT 10");
    $stmt->execute([$uid]);
    $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($docs as $d) {
        echo "  Name: {$d['fullname']} | Phone: {$d['phone']} | Addr: {$d['address']}\n";
    }
}
