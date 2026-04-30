<?php
// ============================================================
// debug_email_flow.php
// ============================================================
require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/helpers/EmailHelper.php';

echo "<h2>Diagnostic Flux Email Tabibi</h2>";

$pdo = Database::getInstance();

// 1. Chercher un patient de test (le premier trouvé)
$stmt = $pdo->prepare("
    SELECT p.fullname, p.user_id, u.email as user_email
    FROM patients p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE u.email IS NOT NULL AND u.email != ''
    LIMIT 1
");
$stmt->execute();
$patient = $stmt->fetch();

if (!$patient) {
    die("<p style='color:red'>❌ Aucun patient avec email trouvé dans la base pour le test.</p>");
}

echo "<p>Patient trouvé : <b>{$patient['fullname']}</b></p>";
echo "<p>Email récupéré (via JOIN users) : <b>{$patient['user_email']}</b></p>";

// 2. Tester l'envoi vers cet email
echo "<p>⏳ Tentative d'envoi d'email de test...</p>";

$ok = EmailHelper::sendAppointmentConfirmation(
    $patient['user_email'],
    $patient['fullname'],
    'Dr. Diagnostic AI',
    'Clinique de Test',
    date('Y-m-d H:i:s'),
    'Vérification du système'
);

if ($ok) {
    echo "<h3 style='color:green'>✅ SUCCÈS ! L'email a été accepté par le serveur SMTP.</h3>";
    echo "<p>Le patient <b>{$patient['user_email']}</b> devrait recevoir une confirmation.</p>";
} else {
    echo "<h3 style='color:red'>❌ ÉCHEC. Le serveur SMTP a rejeté l'envoi.</h3>";
    echo "<p>Vérifiez vos identifiants Gmail dans <code>config/database.php</code></p>";
}
