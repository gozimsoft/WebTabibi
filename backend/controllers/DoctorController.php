<?php
// ============================================================
// controllers/DoctorController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class DoctorController {

    // GET /api/doctors/profile
    public static function getProfile(): void {
        $session = AuthMiddleware::authenticate();
        if ($session['usertype'] != 1) {
            Response::error('Non autorisé', 403);
        }
        
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT d.*, u.username, s.namefr as specialtyfr, s.namear as specialtyar
            FROM doctors d
            JOIN users u ON u.id = d.user_id
            LEFT JOIN specialties s ON s.id = d.specialtie_id
            WHERE d.user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();

        if (!$doctor) Response::notFound('Profil docteur non trouvé');
        
        if (!empty($doctor['photoprofile'])) {
            $doctor['photoprofile'] = base64_encode($doctor['photoprofile']);
        }

        Response::success($doctor);
    }

    // PUT /api/doctors/profile
    public static function updateProfile(): void {
        $session = AuthMiddleware::authenticate();
        if ($session['usertype'] != 1) {
            Response::error('Non autorisé', 403);
        }
        
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo  = Database::getInstance();

        // 1. Update users table (username / password)
        $userFields = [];
        $userValues = [];
        if (!empty($data['username'])) {
            // Check if username exists
            $check = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
            $check->execute([$data['username'], $session['user_id']]);
            if ($check->fetchColumn()) {
                Response::error("Nom d'utilisateur déjà pris", 409);
            }
            $userFields[] = "`username` = ?";
            $userValues[] = $data['username'];
        }
        if (!empty($data['password'])) {
            $userFields[] = "`password` = ?";
            $userValues[] = base64_encode($data['password']); // encoding using the app's standard
        }

        if (!empty($userFields)) {
            $userValues[] = $session['user_id'];
            $pdo->prepare("UPDATE users SET " . implode(', ', $userFields) . " WHERE id = ?")->execute($userValues);
        }

        // 2. Update doctors table
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor_id = $stmt->fetchColumn();

        if ($doctor_id) {
            $allowed = [
                'fullname', 'email', 'phone', 'fix', 'casnos', 'speakinglanguage', 
                'rpps', 'numregister', 'pricing', 'degrees', 'academytitles', 
                'postcode', 'specialtie_id'
            ];

            $fields = [];
            $values = [];
            foreach ($allowed as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "`$field` = ?";
                    $values[] = $data[$field];
                }
            }

            if (!empty($fields)) {
                $values[] = $doctor_id;
                $pdo->prepare("UPDATE doctors SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
            }
        }

        Response::success(null, 'Profil mis à jour avec succès');
    }

    // POST /api/doctors/photo
    public static function uploadPhoto(): void {
        $session = AuthMiddleware::authenticate();
        if ($session['usertype'] != 1) {
            Response::error('Non autorisé', 403);
        }

        if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            Response::error('Erreur lors du téléchargement de la photo', 400);
        }

        $fileContent = file_get_contents($_FILES['photo']['tmp_name']);
        if (!$fileContent) {
            Response::error('Fichier vide ou invalide', 400);
        }

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor_id = $stmt->fetchColumn();

        if (!$doctor_id) {
            Response::error('Profil non trouvé', 404);
        }

        $pdo->prepare("UPDATE doctors SET photoprofile = ? WHERE id = ?")
            ->execute([$fileContent, $doctor_id]);

        Response::success(null, 'Photo mise à jour avec succès');
    }
}
