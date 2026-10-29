<?php
require 'backend/config/database.php';
require 'backend/core/Database.php';

$pdo = Database::getInstance();
$doctorId = 'b481adaa-9da3-4893-91eb-2462510b4eb4';

$stmt = $pdo->prepare("
    SELECT a.*
    FROM apointements a
    JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
    WHERE cd.doctor_id = ?
    ORDER BY a.apointementdate DESC
    LIMIT 10
");
$stmt->execute([$doctorId]);
$appts = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Found " . count($appts) . " appointments for doctor:\n";
foreach ($appts as $a) {
    echo "ID: {$a['id']} | Date: {$a['apointementdate']} | Status: {$a['status']} | Note: {$a['note']}\n";
}
