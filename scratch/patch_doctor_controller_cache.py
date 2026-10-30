import sys

path = 'backend/controllers/DoctorController.php'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    // GET /doctor/unavailabilities
    public static function getUnavailabilities(): void {
        $session = AuthMiddleware::authenticate();
        $doctorId = self::resolveDoctorIdFromSession($session);
        if (!$doctorId) Response::notFound('لم يتم العثور على حساب الطبيب.');

        $pdo = Database::getInstance();
        $clinicId = trim($_GET['clinic_id'] ?? '');

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
        }"""

repl = """    // GET /doctor/unavailabilities
    public static function getUnavailabilities(): void {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');

        $session = AuthMiddleware::authenticate();
        $doctorId = self::resolveDoctorIdFromSession($session);
        if (!$doctorId) Response::notFound('لم يتم العثور على حساب الطبيب.');

        $pdo = Database::getInstance();
        $clinicId = trim($_GET['clinic_id'] ?? '');

        $sql = "
            SELECT u.*, c.clinicname
            FROM doctor_unavailabilities u
            LEFT JOIN clinics c ON c.id = u.clinic_id
            WHERE u.doctor_id = ?
        ";
        $params = [$doctorId];
        if (!empty($clinicId) && $clinicId !== 'all') {
            $sql .= " AND (u.clinic_id = ? OR u.clinic_id IS NULL OR u.clinic_id = '')";
            $params[] = $clinicId;
        }"""

if target not in content:
    print("target not found in DoctorController.php")
    sys.exit(1)

content = content.replace(target, repl, 1)
with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("DoctorController.php cache headers patched successfully!")
