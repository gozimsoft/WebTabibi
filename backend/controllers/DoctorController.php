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
        if ($session['UserType'] != 1) {
            Response::error('Non autorisé', 403);
        }
        
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT d.*, u.Username, s.NameFr as SpecialtyFr, s.NameAr as SpecialtyAr
            FROM Doctors d
            JOIN Users u ON u.ID = d.User_id
            LEFT JOIN Specialties s ON s.ID = d.Specialtie_id
            WHERE d.User_id = ?
            LIMIT 1
        ");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();

        if (!$doctor) Response::notFound('Profil docteur non trouvé');
        
        if (!empty($doctor['PhotoProfile'])) {
            $doctor['PhotoProfile'] = base64_encode($doctor['PhotoProfile']);
        }

        Response::success($doctor);
    }

    // PUT /api/doctors/profile
    public static function updateProfile(): void {
        $session = AuthMiddleware::authenticate();
        if ($session['UserType'] != 1) {
            Response::error('Non autorisé', 403);
        }
        
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo  = Database::getInstance();

        // 1. Update Users table (Username / Password)
        $userFields = [];
        $userValues = [];
        if (!empty($data['Username'])) {
            // Check if username exists
            $check = $pdo->prepare("SELECT ID FROM Users WHERE Username = ? AND ID != ?");
            $check->execute([$data['Username'], $session['user_id']]);
            if ($check->fetchColumn()) {
                Response::error("Nom d'utilisateur déjà pris", 409);
            }
            $userFields[] = "`Username` = ?";
            $userValues[] = $data['Username'];
        }
        if (!empty($data['Password'])) {
            $userFields[] = "`Password` = ?";
            $userValues[] = base64_encode($data['Password']); // encoding using the app's standard
        }

        if (!empty($userFields)) {
            $userValues[] = $session['user_id'];
            $pdo->prepare("UPDATE Users SET " . implode(', ', $userFields) . " WHERE ID = ?")->execute($userValues);
        }

        // 2. Update Doctors table
        $stmt = $pdo->prepare("SELECT ID FROM Doctors WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctorId = $stmt->fetchColumn();

        if ($doctorId) {
            $allowed = [
                'FullName', 'Email', 'Phone', 'Fix', 'Casnos', 'SpeakingLanguage', 
                'RPPS', 'NumRegister', 'Pricing', 'Degrees', 'AcademyTitles', 
                'PostCode', 'Specialtie_id'
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
                $values[] = $doctorId;
                $pdo->prepare("UPDATE Doctors SET " . implode(', ', $fields) . " WHERE ID = ?")->execute($values);
            }
        }

        Response::success(null, 'Profil mis à jour avec succès');
    }

    // POST /api/doctors/photo
    public static function uploadPhoto(): void {
        $session = AuthMiddleware::authenticate();
        if ($session['UserType'] != 1) {
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
        $stmt = $pdo->prepare("SELECT ID FROM Doctors WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctorId = $stmt->fetchColumn();

        if (!$doctorId) {
            Response::error('Profil non trouvé', 404);
        }

        $pdo->prepare("UPDATE Doctors SET PhotoProfile = ? WHERE ID = ?")
            ->execute([$fileContent, $doctorId]);

        Response::success(null, 'Photo mise à jour avec succès');
    }
}
