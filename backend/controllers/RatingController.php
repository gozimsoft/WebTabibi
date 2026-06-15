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

        if (empty($data['doctor_id'])) Response::error('يرجى تحديد الطبيب لتقييمه.', 422);
        $rating = (int)($data['rating'] ?? 0);
        if ($rating < 1 || $rating > 5) Response::error('التقييم يجب أن يكون بين 1 و 5 نجوم.', 422);

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        // Check existing rating
        $stmt = $pdo->prepare("
            SELECT id FROM doctorsratings
            WHERE patient_id = ? AND doctor_id = ? LIMIT 1
        ");
        $stmt->execute([$patient['id'], $data['doctor_id']]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Update
            $pdo->prepare("
                UPDATE doctorsratings SET rating = ?, comment = ?, hidepatient = ?
                WHERE id = ?
            ")->execute([$rating, $data['comment'] ?? '', $data['hide_patient'] ? 1 : 0, $existing['id']]);
            Response::success(null, 'تم تحديث تقييمك بنجاح.');
        } else {
            $id = UUIDHelper::generate();
            $pdo->prepare("
                INSERT INTO doctorsratings (id, patient_id, doctor_id, rating, comment, hidepatient)
                VALUES (?,?,?,?,?,?)
            ")->execute([$id, $patient['id'], $data['doctor_id'], $rating,
                         $data['comment'] ?? '', $data['hide_patient'] ? 1 : 0]);
            Response::success(['rating_id' => $id], 'تم إضافة تقييمك بنجاح.', 201);
        }
    }

    // GET /api/ratings/doctor/{id}
    public static function getDoctorRatings(string $doctor_id): void {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("
            SELECT 
                dr.id, dr.rating, dr.comment, dr.hidepatient,
                CASE WHEN dr.hidepatient=1 THEN 'Anonyme' ELSE p.fullname END as patientname,
                COALESCE(AVG(dr2.rating),0) as AvgRating
            FROM doctorsratings dr
            LEFT JOIN patients p ON p.id = dr.patient_id
            JOIN doctorsratings dr2 ON dr2.doctor_id = dr.doctor_id
            WHERE dr.doctor_id = ?
            GROUP BY dr.id
            ORDER BY dr.id DESC
        ");
        $stmt->execute([$doctor_id]);
        $ratings = $stmt->fetchAll();

        $stmt2 = $pdo->prepare("
            SELECT COALESCE(AVG(rating),0) as avg, COUNT(*) as total
            FROM doctorsratings WHERE doctor_id = ?
        ");
        $stmt2->execute([$doctor_id]);
        $summary = $stmt2->fetch();

        Response::success([
            'ratings'   => $ratings,
            'average'   => round((float)$summary['avg'], 1),
            'total'     => (int)$summary['total'],
        ]);
    }
}
