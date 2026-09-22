<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$misplacedIds = [
    '31b4d2aa-7607-4002-9dc4-ad772b5f706d', // El Beidha in Biskra
    'ea2486f3-eca5-4cd4-b696-cc2eb45547fa', // Beni Khellad in Blida
    '50fc179b-82b7-458a-afe8-b82485bc6a5a', // Maalma in Bouira
    '0aee0556-73c7-4926-b532-4937dcc74c89', // Souk El Khemis in Tlemcen
    'c0ad158b-c429-4e8b-8531-77e8d4b7578c', // Beni Oussine in Tlemcen
    '371cd538-7ade-4810-9522-8a67d875dad7', // El Haoudane in Jijel
    '24619b70-eed8-435d-b54e-e68cfbe22673', // Souama in M'Sila
    '28174d0c-fb3e-4db1-93ad-c7e186c4ac03', // Djendel Saadi Mohamed in Ain Defla
    'fcb482a3-1ca6-4a16-a304-ea976e6a0822', // Hassania in Ain Temouchent
    'e084e41e-95bc-4b94-a22c-dcbc1b47c08c', // El Gueitena in Relizane
    'fa0694e7-61c3-4b27-8264-3d06358eb657', // Tassamert in Béni Abbès
];

foreach ($misplacedIds as $id) {
    // Verify 0 doctors and 0 patients
    $docCnt = $pdo->query("SELECT COUNT(*) FROM doctors WHERE baladiya_id = '$id'")->fetchColumn();
    $patCnt = $pdo->query("SELECT COUNT(*) FROM patients WHERE baladiya_id = '$id'")->fetchColumn();
    if ($docCnt == 0 && $patCnt == 0) {
        $pdo->exec("DELETE FROM baladiyas WHERE id = '$id'");
        echo "Deleted misplaced row $id\n";
    } else {
        echo "WARNING: ID $id has doctors or patients!\n";
    }
}
