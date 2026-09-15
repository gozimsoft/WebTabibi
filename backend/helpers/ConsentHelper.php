<?php
// ============================================================
// helpers/ConsentHelper.php — TABIBI PHASE 02C
// Centralise l'enregistrement et la lecture des consentements
// ============================================================

class ConsentHelper {

    // Version courante des documents légaux
    const DOC_VERSION = 'v1.0-2026';

    // Types de consentement supportés
    const TYPE_CGU              = 'cgu';
    const TYPE_PRIVACY          = 'privacy';
    const TYPE_HEALTH_DATA      = 'health_data';
    const TYPE_LEGAL_REPR       = 'legal_representative';
    const TYPE_OPPOSITION_PROMO = 'opposition_promo';

    /**
     * Enregistre un consentement dans consent_logs
     *
     * @param PDO    $pdo
     * @param string $userId      ID de l'utilisateur (users.id), null si anonyme
     * @param string $patientId   ID du patient (patients.id), null si non applicable
     * @param string $type        Une des constantes TYPE_*
     * @param int    $value       1 = accordé, 0 = retiré
     * @param string $context     'registration' | 'appointment' | 'profile' | 'withdrawal'
     */
    public static function log(
        PDO $pdo,
        ?string $userId,
        ?string $patientId,
        string $type,
        int $value,
        string $context
    ): void {
        require_once __DIR__ . '/../helpers/UUIDHelper.php';

        // Hash anonymisé de l'IP (non réversible)
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $ipHash = hash('sha256', $ip . 'tabibi_salt_02c');

        // Hash anonymisé du User-Agent
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        $uaHash = hash('sha256', $ua . 'tabibi_salt_02c');

        $id = UUIDHelper::generate();

        $pdo->prepare("
            INSERT INTO consent_logs
              (id, user_id, patient_id, consent_type, value, doc_version, context, ip_hash, user_agent_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ")->execute([
            $id,
            $userId,
            $patientId,
            $type,
            $value,
            self::DOC_VERSION,
            $context,
            $ipHash,
            $uaHash,
        ]);
    }

    /**
     * Enregistre plusieurs consentements en une fois (inscription patient)
     *
     * @param PDO    $pdo
     * @param string $userId
     * @param string $patientId
     * @param array  $consents  Ex: ['cgu' => 1, 'privacy' => 1]
     * @param string $context
     */
    public static function logMultiple(
        PDO $pdo,
        ?string $userId,
        ?string $patientId,
        array $consents,
        string $context
    ): void {
        foreach ($consents as $type => $value) {
            self::log($pdo, $userId, $patientId, $type, (int)$value, $context);
        }
    }

    /**
     * Récupère les consentements actuels d'un utilisateur
     *
     * @param PDO    $pdo
     * @param string $userId
     * @return array  Tableau indexé par consent_type avec la valeur la plus récente
     */
    public static function getCurrent(PDO $pdo, string $userId): array {
        $stmt = $pdo->prepare("
            SELECT consent_type, value, created_at
            FROM consent_logs
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $result = [];
        foreach ($rows as $row) {
            // Garder seulement la valeur la plus récente pour chaque type
            if (!isset($result[$row['consent_type']])) {
                $result[$row['consent_type']] = [
                    'value'      => (int)$row['value'],
                    'created_at' => $row['created_at'],
                ];
            }
        }
        return $result;
    }

    /**
     * Vérifie si un utilisateur a donné un consentement obligatoire
     *
     * @param PDO    $pdo
     * @param string $userId
     * @param string $type   TYPE_CGU | TYPE_PRIVACY | TYPE_HEALTH_DATA
     * @return bool
     */
    public static function hasConsented(PDO $pdo, string $userId, string $type): bool {
        $stmt = $pdo->prepare("
            SELECT value FROM consent_logs
            WHERE user_id = ? AND consent_type = ?
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([$userId, $type]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row && (int)$row['value'] === 1;
    }
}
