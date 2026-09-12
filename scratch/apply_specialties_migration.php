<?php
require_once __DIR__ . '/../backend/core/Database.php';

try {
    $pdo = Database::getInstance();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "1. Altering specialties table column types...\n";
    $pdo->exec("ALTER TABLE `specialties` 
                MODIFY COLUMN `namear` VARCHAR(100) NOT NULL,
                MODIFY COLUMN `namefr` VARCHAR(100) NOT NULL");

    $specialties = [
        ['id' => 'da195033-5b58-11f0-9c01-525400088b55', 'namear' => 'طب عام', 'namefr' => 'Médecine générale'],
        ['id' => 'defd6b4d-3bae-5da4-a724-b9faa642d603', 'namear' => 'طب وجراحة الأسنان', 'namefr' => 'Médecine et chirurgie dentaire'],
        ['id' => '2d3e3093-761b-5545-a330-3b1e0ba479f8', 'namear' => 'طب النساء والتوليد', 'namefr' => 'Gynécologie-obstétrique'],
        ['id' => 'c8ca47a9-2fd0-56d6-b36a-4339d1836372', 'namear' => 'طب وجراحة الأطفال', 'namefr' => 'Pédiatrie et chirurgie pédiatrique'],
        ['id' => 'e905b54a-7be6-5676-9ed5-8cb8442cab50', 'namear' => 'طب العظام و المفاصل', 'namefr' => 'Orthopédie et traumatologie'],
        ['id' => 'fdb203c8-7b0d-5800-a7dc-b2a51571eed1', 'namear' => 'طب وجراحة العيون', 'namefr' => 'Ophtalmologie'],
        ['id' => '699dae92-09c2-58e2-b8bf-fe076b29e750', 'namear' => 'طب أمراض القلب', 'namefr' => 'Cardiologie'],
        ['id' => 'ef64a1a4-b6b6-55d3-8fbc-52423b032d80', 'namear' => 'طب وجراحة المخ و الأعصاب', 'namefr' => 'Neurologie et neurochirurgie'],
        ['id' => '8d5e2dd7-84e8-552b-a207-2f48bf276baa', 'namear' => 'طب وجراحة الأنف والأذن والحنجرة', 'namefr' => 'Oto-rhino-laryngologie (ORL)'],
        ['id' => 'a98e56c2-388c-58bb-a99d-8958c73e9d91', 'namear' => 'الطب الباطني (داخلي)', 'namefr' => 'Médecine interne'],
        ['id' => 'da1952ab-5b58-11f0-9c01-525400088b55', 'namear' => 'جراحة عامة', 'namefr' => 'Chirurgie générale'],
        ['id' => '83ca1c62-c4e2-59e2-9c47-74d5b9c9c5e3', 'namear' => 'الامراض العقلية و النفسية', 'namefr' => 'Psychiatrie et santé mentale'],
        ['id' => '4ccb860f-60e8-5a60-a7d7-54992cf8fe62', 'namear' => 'طب الأمراض الصدرية و الجهاز التنفسي', 'namefr' => 'Pneumologie'],
        ['id' => 'de4a01ab-212e-5ac1-9470-0450e10e8ddb', 'namear' => 'مرض السكري و الغدد الصماء', 'namefr' => 'Endocrinologie et diabétologie'],
        ['id' => 'b435dc57-cc0a-522d-b1dd-981995f1aaa1', 'namear' => 'الأمراض الجلدية والتناسلية', 'namefr' => 'Dermatologie et vénéréologie'],
        ['id' => 'c4e3b725-3b4b-5d45-a8fc-6c7fb5dc9b52', 'namear' => 'طب وجراحة المسالك البولية', 'namefr' => 'Urologie'],
        ['id' => '2ee88075-70d1-5fde-9b97-d99b19d7a0ba', 'namear' => 'طب الجهاز الهضمي', 'namefr' => 'Gastro-entérologie'],
        ['id' => 'e72c35d6-8bb9-558c-95e2-4ac65c608e6a', 'namear' => 'علم الأشعة_راديولوجي', 'namefr' => 'Radiologie et imagerie médicale'],
        ['id' => 'da1952e0-5b58-11f0-9c01-525400088b55', 'namear' => 'الطب الفيزيائي وإعادة التأهيل الحركي', 'namefr' => 'Médecine physique et réadaptation'],
        ['id' => '02045ec7-5fac-50f9-b560-599b2fb3e597', 'namear' => 'أخصائي أمراض الكلى', 'namefr' => 'Néphrologie'],
        ['id' => 'fbd41163-0635-5e40-bc7a-ec836ba76239', 'namear' => 'طب أمراض الدم والأورام', 'namefr' => 'Hématologie et oncologie'],
        ['id' => '73560649-9d1c-500b-94ef-99ae476117b5', 'namear' => 'أمراض الحساسية', 'namefr' => 'Allergologie'],
        ['id' => '0f7c8954-50a0-56aa-b4b3-880405974f1b', 'namear' => 'طب التغذية و الحمية', 'namefr' => 'Nutrition et diététique'],
        ['id' => 'da195401-5b58-11f0-9c01-525400088b55', 'namear' => 'طب التخدير', 'namefr' => 'Anesthésiologie-réanimation'],
        ['id' => 'da1953ea-5b58-11f0-9c01-525400088b55', 'namear' => 'طب وجراحة تجميلية', 'namefr' => 'Chirurgie plastique et esthétique'],
        ['id' => '22a550cc-08c5-5bdf-a3cc-44f1105edad2', 'namear' => 'الأمراض المعدية', 'namefr' => 'Maladies infectieuses'],
        ['id' => 'da19538c-5b58-11f0-9c01-525400088b55', 'namear' => 'الطب النووي', 'namefr' => 'Médecine nucléaire']
    ];

    echo "2. Upserting 27 standard specialties...\n";
    $stmt = $pdo->prepare("INSERT INTO `specialties` (`id`, `namear`, `namefr`) 
                           VALUES (:id, :namear, :namefr) 
                           ON DUPLICATE KEY UPDATE `namear` = VALUES(`namear`), `namefr` = VALUES(`namefr`)");

    foreach ($specialties as $s) {
        $stmt->execute($s);
        echo "  [OK] Upserted: {$s['namear']} | {$s['namefr']}\n";
    }

    echo "3. Cleaning up old unused placeholder IDs with 0 references...\n";
    $keep_ids = array_map(fn($s) => $s['id'], $specialties);
    $in_clause = "'" . implode("','", $keep_ids) . "'";
    
    // Check if any legacy rows not in keep_ids are unused
    $deleted = $pdo->exec("DELETE FROM `specialties` 
                WHERE `id` NOT IN ($in_clause) 
                AND `id` NOT IN (SELECT DISTINCT `specialtie_id` FROM `doctors` WHERE `specialtie_id` IS NOT NULL)");
    echo "  Cleaned up $deleted unused rows.\n";

    echo "Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
