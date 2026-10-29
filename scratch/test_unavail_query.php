<?php
require 'backend/config/database.php';
require 'backend/core/Database.php';

$pdo = Database::getInstance();
$doctorId = 'b481adaa-9da3-4893-91eb-2462510b4eb4';
$clinicId = '86dc18dc-6ddf-43a5-a4b2-acbd8d182cf0';

$sql = "
    SELECT u.*, c.clinicname
    FROM doctor_unavailabilities u
    LEFT JOIN clinics c ON c.id = u.clinic_id
    WHERE u.doctor_id = ?
";
$params = [$doctorId];
if (!empty($clinicId) && $clinicId !== 'all') {
    $sql .= " AND (u.clinic_id = ? OR u.clinic_id IS NULL)";
    $params[] = $clinicId;
}
$sql .= " ORDER BY u.start_datetime DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Query returned " . count($rows) . " rows for doctor $doctorId and clinic $clinicId\n";
foreach ($rows as $r) {
    echo "Leave ID: {$r['id']} | Start: {$r['start_datetime']} | End: {$r['end_datetime']} | Clinic: {$r['clinic_id']}\n";
}
