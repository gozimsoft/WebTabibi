<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("controllers.php");

$data = json_decode(file_get_contents("php://input"), true);

// ── clinic ──────────────────────────────────────────────────────────────────
$clinic_id          = $data['clinic_id']        ?? '';
$clinicname         = $data['clinicname']        ?? '';
$clinic_phone       = $data['phone']             ?? '';
$clinic_fax         = $data['fax']               ?? '';
$clinic_address     = $data['address']           ?? '';
$clinic_email       = $data['email']             ?? '';
$clinic_website     = $data['website']           ?? '';
$clinic_typeclinic  = $data['typeclinic']        ?? '';
$clinic_coordinates = $data['cliniccoordinates'] ?? '';
$clinic_activity    = $data['clinicactivity']    ?? '';
$clinic_latitude    = $data['cliniclatitude']    ?? 0;
$clinic_longitude   = $data['cliniclongitude']   ?? 0;
$clinic_postcode    = $data['clinicpostcode']    ?? 0;
$logoBase64         = $data['logo']              ?? null;

// ── التحقق من الحقول المطلوبة ────────────────────────────────────────────────
if (empty($clinic_id) || empty($clinicname)) {
    echo json_encode([
        "status"  => "fail",
        "message" => "Missing required fields: clinic_id and clinicname are required."
    ]);
    exit;
}

// ── التحقق من وجود السجل ─────────────────────────────────────────────────────
$stmtClinic = $pdo->prepare("SELECT COUNT(*) FROM Clinics WHERE ID = :id");
$stmtClinic->execute([":id" => $clinic_id]);
$clinicExists = $stmtClinic->fetchColumn() > 0;

// ── بدء المعاملة ─────────────────────────────────────────────────────────────
$pdo->beginTransaction();

try {
    $clinicParams = [
        ':clinic_id'         => $clinic_id,
        ':clinicname'        => $clinicname,
        ':clinic_phone'      => $clinic_phone,
        ':clinic_fax'        => $clinic_fax,
        ':clinic_address'    => $clinic_address,
        ':clinic_email'      => $clinic_email,
        ':clinic_website'    => $clinic_website,
        ':clinic_typeclinic' => $clinic_typeclinic,
        ':clinic_coordinates'=> $clinic_coordinates,
        ':clinic_activity'   => $clinic_activity,
        ':clinic_latitude'   => $clinic_latitude,
        ':clinic_longitude'  => $clinic_longitude,
        ':clinic_postcode'   => $clinic_postcode,
    ];

    if (!$clinicExists) {
        // إنشاء عيادة جديدة
        $stmtC = $pdo->prepare("
            INSERT INTO Clinics (
                ID, ClinicName, Phone, Fax, Address, Email, Website,
                ActivitySector, ClinicCoordinates, Latitude, Longitude, PostCode, TypeClinic
            ) VALUES (
                :clinic_id, :clinicname, :clinic_phone, :clinic_fax, :clinic_address,
                :clinic_email, :clinic_website,
                :clinic_activity, :clinic_coordinates, :clinic_latitude, :clinic_longitude, :clinic_postcode, :clinic_typeclinic  
            )
        ");
    } else {
        // تحديث بيانات العيادة الموجودة
        $stmtC = $pdo->prepare("
            UPDATE Clinics SET
                ClinicName        = :clinicname,
                Phone             = :clinic_phone,
                Fax               = :clinic_fax,
                Address           = :clinic_address,
                Email             = :clinic_email,
                Website           = :clinic_website,
                ActivitySector    = :clinic_activity,
                ClinicCoordinates = :clinic_coordinates,
                Latitude          = :clinic_latitude,
                Longitude         = :clinic_longitude,
                PostCode          = :clinic_postcode,
                TypeClinic        = :clinic_typeclinic
            WHERE ID = :clinic_id
        ");
    }
    $stmtC->execute($clinicParams);

    // ── تأكيد المعاملة ───────────────────────────────────────────────────────
    $pdo->commit();

    // حفظ شعار العيادة بعد commit (BLOB)
    if (!empty($logoBase64)) {
        $logoBlob = base64_decode($logoBase64);
        $stmtLogo = $pdo->prepare("UPDATE Clinics SET Logo = :logo WHERE ID = :id");
        $stmtLogo->bindParam(':id',   $clinic_id);
        $stmtLogo->bindParam(':logo', $logoBlob, PDO::PARAM_LOB);
        $stmtLogo->execute();
    }

    echo json_encode([
        "status"    => "success",
        "message"   => "Clinic data saved successfully",
        "clinic_id" => $clinic_id
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "status"  => "fail",
        "message" => "Operation failed: " . $e->getMessage()
    ]);
}
