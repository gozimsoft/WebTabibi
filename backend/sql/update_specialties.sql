-- Migration: Update and Clean Specialties Table
-- Modifies columns length and inserts/updates all 27 standard specialties with accurate Arabic and French medical translations

ALTER TABLE `specialties` 
  MODIFY COLUMN `namear` VARCHAR(100) NOT NULL,
  MODIFY COLUMN `namefr` VARCHAR(100) NOT NULL;

-- Upsert / replace all standard 27 specialties
INSERT INTO `specialties` (`id`, `namear`, `namefr`) VALUES
('da195033-5b58-11f0-9c01-525400088b55', 'طب عام', 'Médecine générale'),
('defd6b4d-3bae-5da4-a724-b9faa642d603', 'طب وجراحة الأسنان', 'Médecine et chirurgie dentaire'),
('2d3e3093-761b-5545-a330-3b1e0ba479f8', 'طب النساء والتوليد', 'Gynécologie-obstétrique'),
('c8ca47a9-2fd0-56d6-b36a-4339d1836372', 'طب وجراحة الأطفال', 'Pédiatrie et chirurgie pédiatrique'),
('e905b54a-7be6-5676-9ed5-8cb8442cab50', 'طب العظام و المفاصل', 'Orthopédie et traumatologie'),
('fdb203c8-7b0d-5800-a7dc-b2a51571eed1', 'طب وجراحة العيون', 'Ophtalmologie'),
('699dae92-09c2-58e2-b8bf-fe076b29e750', 'طب أمراض القلب', 'Cardiologie'),
('ef64a1a4-b6b6-55d3-8fbc-52423b032d80', 'طب وجراحة المخ و الأعصاب', 'Neurologie et neurochirurgie'),
('8d5e2dd7-84e8-552b-a207-2f48bf276baa', 'طب وجراحة الأنف والأذن والحنجرة', 'Oto-rhino-laryngologie (ORL)'),
('a98e56c2-388c-58bb-a99d-8958c73e9d91', 'الطب الباطني (داخلي)', 'Médecine interne'),
('da1952ab-5b58-11f0-9c01-525400088b55', 'جراحة عامة', 'Chirurgie générale'),
('83ca1c62-c4e2-59e2-9c47-74d5b9c9c5e3', 'الامراض العقلية و النفسية', 'Psychiatrie et santé mentale'),
('4ccb860f-60e8-5a60-a7d7-54992cf8fe62', 'طب الأمراض الصدرية و الجهاز التنفسي', 'Pneumologie'),
('de4a01ab-212e-5ac1-9470-0450e10e8ddb', 'مرض السكري و الغدد الصماء', 'Endocrinologie et diabétologie'),
('b435dc57-cc0a-522d-b1dd-981995f1aaa1', 'الأمراض الجلدية والتناسلية', 'Dermatologie et vénéréologie'),
('c4e3b725-3b4b-5d45-a8fc-6c7fb5dc9b52', 'طب وجراحة المسالك البولية', 'Urologie'),
('2ee88075-70d1-5fde-9b97-d99b19d7a0ba', 'طب الجهاز الهضمي', 'Gastro-entérologie'),
('e72c35d6-8bb9-558c-95e2-4ac65c608e6a', 'علم الأشعة_راديولوجي', 'Radiologie et imagerie médicale'),
('da1952e0-5b58-11f0-9c01-525400088b55', 'الطب الفيزيائي وإعادة التأهيل الحركي', 'Médecine physique et réadaptation'),
('02045ec7-5fac-50f9-b560-599b2fb3e597', 'أخصائي أمراض الكلى', 'Néphrologie'),
('fbd41163-0635-5e40-bc7a-ec836ba76239', 'طب أمراض الدم والأورام', 'Hématologie et oncologie'),
('73560649-9d1c-500b-94ef-99ae476117b5', 'أمراض الحساسية', 'Allergologie'),
('0f7c8954-50a0-56aa-b4b3-880405974f1b', 'طب التغذية و الحمية', 'Nutrition et diététique'),
('da195401-5b58-11f0-9c01-525400088b55', 'طب التخدير', 'Anesthésiologie-réanimation'),
('da1953ea-5b58-11f0-9c01-525400088b55', 'طب وجراحة تجميلية', 'Chirurgie plastique et esthétique'),
('22a550cc-08c5-5bdf-a3cc-44f1105edad2', 'الأمراض المعدية', 'Maladies infectieuses'),
('da19538c-5b58-11f0-9c01-525400088b55', 'الطب النووي', 'Médecine nucléaire'),
('21d9f58e-45f9-43c0-886b-573c495afa8f', 'جراحة الوجه والفكين', 'Chirurgie maxillo-faciale')
ON DUPLICATE KEY UPDATE 
  `namear` = VALUES(`namear`),
  `namefr` = VALUES(`namefr`);

-- Clean up any unused legacy placeholder rows that have 0 doctors referencing them
DELETE FROM `specialties` 
WHERE `id` NOT IN (
  'da195033-5b58-11f0-9c01-525400088b55',
  'defd6b4d-3bae-5da4-a724-b9faa642d603',
  '2d3e3093-761b-5545-a330-3b1e0ba479f8',
  'c8ca47a9-2fd0-56d6-b36a-4339d1836372',
  'e905b54a-7be6-5676-9ed5-8cb8442cab50',
  'fdb203c8-7b0d-5800-a7dc-b2a51571eed1',
  '699dae92-09c2-58e2-b8bf-fe076b29e750',
  'ef64a1a4-b6b6-55d3-8fbc-52423b032d80',
  '8d5e2dd7-84e8-552b-a207-2f48bf276baa',
  'a98e56c2-388c-58bb-a99d-8958c73e9d91',
  'da1952ab-5b58-11f0-9c01-525400088b55',
  '83ca1c62-c4e2-59e2-9c47-74d5b9c9c5e3',
  '4ccb860f-60e8-5a60-a7d7-54992cf8fe62',
  'de4a01ab-212e-5ac1-9470-0450e10e8ddb',
  'b435dc57-cc0a-522d-b1dd-981995f1aaa1',
  'c4e3b725-3b4b-5d45-a8fc-6c7fb5dc9b52',
  '2ee88075-70d1-5fde-9b97-d99b19d7a0ba',
  'e72c35d6-8bb9-558c-95e2-4ac65c608e6a',
  'da1952e0-5b58-11f0-9c01-525400088b55',
  '02045ec7-5fac-50f9-b560-599b2fb3e597',
  'fbd41163-0635-5e40-bc7a-ec836ba76239',
  '73560649-9d1c-500b-94ef-99ae476117b5',
  '0f7c8954-50a0-56aa-b4b3-880405974f1b',
  'da195401-5b58-11f0-9c01-525400088b55',
  'da1953ea-5b58-11f0-9c01-525400088b55',
  '22a550cc-08c5-5bdf-a3cc-44f1105edad2',
  'da19538c-5b58-11f0-9c01-525400088b55',
  '21d9f58e-45f9-43c0-886b-573c495afa8f'
)
AND `id` NOT IN (SELECT DISTINCT `specialtie_id` FROM `doctors` WHERE `specialtie_id` IS NOT NULL);
