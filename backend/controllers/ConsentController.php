<?php
// ============================================================
// controllers/ConsentController.php — TABIBI PHASE 02C
// Droits des personnes (Art. 34, 35, 36 Loi 18-07)
//
// GET  /api/consent/my          → Consentements actuels de l'utilisateur connecté
// POST /api/consent/withdraw    → Retrait d'un type de consentement
// POST /api/consent/opposition  → Opposition prospection (Art. 36)
// DELETE /api/patients/account  → Suppression de compte patient (Art. 35)
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/ConsentHelper.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';

class ConsentController {

    // ----------------------------------------------------------
    // GET /api/consent/my
    // Retourne les consentements actuels de l'utilisateur connecté
    // ----------------------------------------------------------
    public static function getMy(): void {
        $session = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();

        $consents = ConsentHelper::getCurrent($pdo, $session['user_id']);

        // Construire un état lisible
        $state = [
            'cgu'              => isset($consents['cgu'])              ? $consents['cgu']              : ['value' => null, 'created_at' => null],
            'privacy'          => isset($consents['privacy'])          ? $consents['privacy']          : ['value' => null, 'created_at' => null],
            'health_data'      => isset($consents['health_data'])      ? $consents['health_data']      : ['value' => null, 'created_at' => null],
            'opposition_promo' => isset($consents['opposition_promo']) ? $consents['opposition_promo'] : ['value' => 0,    'created_at' => null],
        ];

        Response::success([
            'user_id'      => $session['user_id'],
            'doc_version'  => ConsentHelper::DOC_VERSION,
            'consents'     => $state,
        ]);
    }

    // ----------------------------------------------------------
    // POST /api/consent/withdraw
    // Body: { type: "cgu"|"privacy"|"health_data"|"opposition_promo" }
    // Enregistre le retrait d'un consentement dans consent_logs
    //
    // IMPORTANT JURIDIQUE :
    // Le retrait du consentement CGU/privacy ne supprime pas le compte automatiquement.
    // Il est enregistré comme signal. La suppression doit être demandée séparément.
    // ----------------------------------------------------------
    public static function withdraw(): void {
        $session = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $allowedTypes = [
            ConsentHelper::TYPE_CGU,
            ConsentHelper::TYPE_PRIVACY,
            ConsentHelper::TYPE_HEALTH_DATA,
            ConsentHelper::TYPE_OPPOSITION_PROMO,
        ];

        if (empty($data['type']) || !in_array($data['type'], $allowedTypes)) {
            Response::error('نوع الموافقة غير صالح. يجب أن يكون: cgu | privacy | health_data | opposition_promo', 422);
        }

        $pdo = Database::getInstance();

        // Enregistrer le retrait dans consent_logs
        // La valeur 0 = retiré
        ConsentHelper::log($pdo, $session['user_id'], null, $data['type'], 0, 'withdrawal');

        // Si opposition promo : mettre à jour settingpreferences également
        if ($data['type'] === ConsentHelper::TYPE_OPPOSITION_PROMO) {
            // Récupérer patient_id depuis l'utilisateur
            $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
            $stmt->execute([$session['user_id']]);
            $patient = $stmt->fetch();
            if ($patient) {
                // Vérifier si une préférence existe déjà
                $stmtCheck = $pdo->prepare("SELECT id FROM settingpreferences WHERE patient_id = ? LIMIT 1");
                $stmtCheck->execute([$patient['id']]);
                $pref = $stmtCheck->fetch();
                if ($pref) {
                    $pdo->prepare("UPDATE settingpreferences SET opposition_promo = 1 WHERE patient_id = ?")
                        ->execute([$patient['id']]);
                } else {
                    $newPrefId = UUIDHelper::generate();
                    $pdo->prepare("INSERT INTO settingpreferences (id, patient_id, opposition_promo) VALUES (?, ?, 1)")
                        ->execute([$newPrefId, $patient['id']]);
                }
            }
        }

        $messages = [
            ConsentHelper::TYPE_CGU              => 'تم تسجيل طلب سحب القبول بشروط الاستخدام.',
            ConsentHelper::TYPE_PRIVACY          => 'تم تسجيل طلب سحب القبول بسياسة الخصوصية.',
            ConsentHelper::TYPE_HEALTH_DATA      => 'تم تسجيل سحب الموافقة على معالجة البيانات الصحية.',
            ConsentHelper::TYPE_OPPOSITION_PROMO => 'تم تسجيل معارضتك للاستخدام التجاري لبياناتك (Art. 36 Loi 18-07).',
        ];

        Response::success(
            ['type' => $data['type'], 'withdrawn_at' => date('Y-m-d H:i:s')],
            $messages[$data['type']] ?? 'تم تسجيل السحب.'
        );
    }

    // ----------------------------------------------------------
    // DELETE /api/patients/account
    // Suppression / fermeture du compte patient (Art. 35 Loi 18-07)
    //
    // Ce endpoint :
    // 1. Anonymise les données personnelles du patient (email, nom, téléphone, etc.)
    // 2. Supprime la session active
    // 3. NE SUPPRIME PAS les rendez-vous passés (obligation déontologique médecin)
    // 4. NE SUPPRIME PAS les données médicales synchronisées depuis Delphi
    //
    // IMPORTANT JURIDIQUE (Art. 35 vs Code de déontologie médical) :
    // Le droit à l'effacement n'est pas absolu. Les données de rendez-vous effectifs
    // peuvent être conservées sous forme anonymisée pour les obligations du praticien.
    // ----------------------------------------------------------
    public static function deleteAccount(): void {
        $session = AuthMiddleware::patientOnly();
        $pdo = Database::getInstance();

        // Récupérer le patient
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();

        if (!$patient) {
            Response::notFound('لم يتم العثور على الملف الشخصي.');
        }

        $patientId = $patient['id'];
        $anonymId  = 'DELETED_' . substr($session['user_id'], 0, 8);
        $timestamp = date('Y-m-d H:i:s');

        $pdo->beginTransaction();
        try {
            // 1. Anonymiser toutes les données personnelles et médicales du profil patient
            $pdo->prepare("
                UPDATE patients SET
                    fullname              = '[Compte supprimé]',
                    email                 = NULL,
                    phone                 = NULL,
                    address               = NULL,
                    birthdate             = NULL,
                    birthplace            = NULL,
                    birthcountry          = NULL,
                    postcode              = NULL,
                    nin                   = NULL,
                    bloodtype             = NULL,
                    speakinglanguage      = NULL,
                    baladiya_id           = NULL,
                    doctor_id             = NULL,
                    emergancyphone        = NULL,
                    emergancyemail        = NULL,
                    emergancyphonedoctor  = NULL,
                    emergancynote         = NULL,
                    photoprofile          = NULL,
                    deleteacount          = 1
                WHERE id = ?
            ")->execute([$patientId]);

            // 2. Anonymiser le username dans users et verrouiller le mot de passe
            $pdo->prepare("UPDATE users SET username = ?, password = 'DELETED' WHERE id = ?")
                ->execute([$anonymId, $session['user_id']]);

            // 3. Supprimer toutes les sessions actives (déconnexion immédiate)
            $pdo->prepare("DELETE FROM sessions WHERE user_id = ?")
                ->execute([$session['user_id']]);

            // 4. Supprimer les notifications personnelles de l'utilisateur
            $pdo->prepare("DELETE FROM notifications WHERE user_id = ?")
                ->execute([$session['user_id']]);

            // 5. Dissocier les relations de proches/famille
            $pdo->prepare("DELETE FROM patientsproches WHERE patient_id = ? OR proche_id = ?")
                ->execute([$patientId, $patientId]);

            // 6. Gestion des rendez-vous (apointements) :
            // a) Annuler les rendez-vous futurs en attente pour libérer le planning du médecin
            $pdo->prepare("
                UPDATE apointements
                SET status = 1, updatedat = NOW()
                WHERE patient_id = ? AND apointementdate > NOW() AND status = 0
            ")->execute([$patientId]);

            // b) Anonymiser les données identifiantes directes dans tous les rendez-vous du patient
            // Les données médicales objectives (date, motif/reason_id, clinique, médecin) sont conservées
            // pour la continuité des soins et les obligations déontologiques du praticien.
            $pdo->prepare("
                UPDATE apointements
                SET patientname = '[Compte supprimé]', phone = NULL, updatedat = NOW()
                WHERE patient_id = ?
            ")->execute([$patientId]);

            // c) Fermer les tickets d'assistance/support ouverts du patient
            $pdo->prepare("UPDATE tickets SET status = 'CLOSED', updated_at = NOW() WHERE patient_id = ?")
                ->execute([$patientId]);

            // d) Anonymiser les avis et commentaires laissés par le patient
            $pdo->prepare("UPDATE doctorsratings SET hidepatient = 1 WHERE patient_id = ?")
                ->execute([$patientId]);

            // 7. Enregistrer le retrait des consentements et la traçabilité de suppression dans consent_logs
            // NOTE : consent_logs est expressément CONSERVÉ pour fournir la preuve juridique
            // de l'antériorité du consentement et de son retrait effectif (Art. 35 Loi 18-07).
            ConsentHelper::logMultiple($pdo, $session['user_id'], $patientId, [
                ConsentHelper::TYPE_CGU         => 0,
                ConsentHelper::TYPE_PRIVACY     => 0,
                ConsentHelper::TYPE_HEALTH_DATA => 0,
            ], 'account_deletion');

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ أثناء حذف الحساب. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.');
        }

        // Note : Les rendez-vous passés (apointements) sont conservés sous forme
        // anonymisée (patient_id reste mais données personnelles supprimées ci-dessus).
        // Cette approche préserve la cohérence du planning médecin (obligation déontologique).

        Response::success(
            ['deleted_at' => $timestamp],
            'تم حذف حسابك وإخفاء بياناتك الشخصية بنجاح. قد تتأخر بعض البيانات في الحذف وفقاً للالتزامات القانونية.'
        );
    }
}
