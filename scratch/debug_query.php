<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$patient_id = '18706236-45bb-4cda-ad8e-a2758dc5135b';

$sql = "
    SELECT 
        a.id, a.apointementdate, a.note, a.patientname,
        a.clinicsdoctor_id, a.reason_id, a.status,
        cd.clinic_id, cd.doctor_id, cd.specialtie_id,
        d.fullname as doctorname, d.email as doctoremail, d.photoprofile,
        c.clinicname, c.address as ClinicAddress,
        r.name as ReasonName,
        s.namefr as specialtyfr, s.namear as specialtyar
    FROM apointements a
    LEFT JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
    LEFT JOIN doctors d         ON d.id = cd.doctor_id
    LEFT JOIN clinics c         ON c.id = cd.clinic_id
    LEFT JOIN reasons r         ON r.id = a.reason_id
    LEFT JOIN specialties s     ON s.id = cd.specialtie_id
    WHERE a.patient_id = ?
    ORDER BY a.apointementdate DESC
";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$patient_id]);
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}
