<?php
// ============================================================
// controllers/RatingController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';

class RatingController {

    // POST /api/ratings
    // Body: { doctor_id, rating (1-5), comment, hide_patient }
    public static function addRating(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo     = Database::getInstance();

        if (empty($data['doctor_id'])) Response::error('doctor_id requis', 422);
        $rating = (int)($data['rating'] ?? 0);
        if ($rating < 1 || $rating > 5) Response::error('Note entre 1 et 5', 422);

        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound();

        // Check existing rating
        $stmt = $pdo->prepare("
            SELECT ID FROM DoctorsRatings
            WHERE Patient_id = ? AND Doctor_id = ? LIMIT 1
        ");
        $stmt->execute([$patient['ID'], $data['doctor_id']]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Update
            $pdo->prepare("
                UPDATE DoctorsRatings SET Rating = ?, Comment = ?, HidePatient = ?
                WHERE ID = ?
            ")->execute([$rating, $data['comment'] ?? '', $data['hide_patient'] ? 1 : 0, $existing['ID']]);
            Response::success(null, 'Avis mis à jour');
        } else {
            $id = UUIDHelper::generate();
            $pdo->prepare("
                INSERT INTO DoctorsRatings (ID, Patient_id, Doctor_id, Rating, Comment, HidePatient)
                VALUES (?,?,?,?,?,?)
            ")->execute([$id, $patient['ID'], $data['doctor_id'], $rating,
                         $data['comment'] ?? '', $data['hide_patient'] ? 1 : 0]);
            Response::success(['rating_id' => $id], 'Avis ajouté', 201);
        }
    }

    // GET /api/ratings/doctor/{id}
    public static function getDoctorRatings(string $doctorId): void {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("
            SELECT 
                dr.ID, dr.Rating, dr.Comment, dr.HidePatient,
                CASE WHEN dr.HidePatient=1 THEN 'Anonyme' ELSE p.FullName END as PatientName,
                COALESCE(AVG(dr2.Rating),0) as AvgRating
            FROM DoctorsRatings dr
            LEFT JOIN Patients p ON p.ID = dr.Patient_id
            JOIN DoctorsRatings dr2 ON dr2.Doctor_id = dr.Doctor_id
            WHERE dr.Doctor_id = ?
            GROUP BY dr.ID
            ORDER BY dr.ID DESC
        ");
        $stmt->execute([$doctorId]);
        $ratings = $stmt->fetchAll();

        $stmt2 = $pdo->prepare("
            SELECT COALESCE(AVG(Rating),0) as avg, COUNT(*) as total
            FROM DoctorsRatings WHERE Doctor_id = ?
        ");
        $stmt2->execute([$doctorId]);
        $summary = $stmt2->fetch();

        Response::success([
            'ratings'   => $ratings,
            'average'   => round((float)$summary['avg'], 1),
            'total'     => (int)$summary['total'],
        ]);
    }
}
