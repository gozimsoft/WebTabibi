<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query("
    SELECT d.id, d.fullname, d.is_frozen, u.id as user_id, u.username, u.usertype,
           (SELECT token FROM sessions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as token,
           (SELECT created_at FROM sessions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as session_created_at
    FROM doctors d 
    JOIN users u ON u.id = d.user_id 
    WHERE d.id IN ('13f12428-b754-46dd-bf48-73ca9683491b', 'b481adaa-9da3-4893-91eb-2462510b4eb4')
");
while($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Doctor {$r['username']} (DocID: {$r['id']}):\n";
    $ch = curl_init("http://localhost:81/api/appointments/sync-check?clinic_id=6789f1a5-df59-47d6-a5c8-8b363bd1e13e");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer " . $r['token']]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "   HTTP $code => $res\n";
}
