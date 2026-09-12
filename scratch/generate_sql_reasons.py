import json
import uuid

with open(r"d:\Application Web\WebTabibi\scratch\all_reasons_dataset.json", "r", encoding="utf-8") as f:
    reasons = json.load(f)

# Load specialties from DB
# We know the specialties mapping
specialties_map = {
    "طب عام": "da195033-5b58-11f0-9c01-525400088b55",
    "طب وجراحة الأسنان": "defd6b4d-3bae-5da4-a724-b9faa642d603",
    "طب النساء والتوليد": "2d3e3093-761b-5545-a330-3b1e0ba479f8",
    "طب وجراحة الأطفال": "c8ca47a9-2fd0-56d6-b36a-4339d1836372",
    "طب العظام و المفاصل": "e905b54a-7be6-5676-9ed5-8cb8442cab50",
    "طب وجراحة العيون": "fdb203c8-7b0d-5800-a7dc-b2a51571eed1",
    "طب أمراض القلب": "699dae92-09c2-58e2-b8bf-fe076b29e750",
    "طب وجراحة المخ و الأعصاب": "ef64a1a4-b6b6-55d3-8fbc-52423b032d80",
    "طب وجراحة الأنف والأذن والحنجرة": "8d5e2dd7-84e8-552b-a207-2f48bf276baa",
    "الطب الباطني (داخلي)": "a98e56c2-388c-58bb-a99d-8958c73e9d91",
    "جراحة عامة": "da1952ab-5b58-11f0-9c01-525400088b55",
    "الامراض العقلية و النفسية": "83ca1c62-c4e2-59e2-9c47-74d5b9c9c5e3",
    "طب الأمراض الصدرية و الجهاز التنفسي": "4ccb860f-60e8-5a60-a7d7-54992cf8fe62",
    "مرض السكري و الغدد الصماء": "de4a01ab-212e-5ac1-9470-0450e10e8ddb",
    "الأمراض الجلدية والتناسلية": "b435dc57-cc0a-522d-b1dd-981995f1aaa1",
    "طب وجراحة المسالك البولية": "c4e3b725-3b4b-5d45-a8fc-6c7fb5dc9b52",
    "طب الجهاز الهضمي": "2ee88075-70d1-5fde-9b97-d99b19d7a0ba",
    "علم الأشعة_راديولوجي": "e72c35d6-8bb9-558c-95e2-4ac65c608e6a",
    "الطب الفيزيائي وإعادة التأهيل الحركي": "da1952e0-5b58-11f0-9c01-525400088b55",
    "أخصائي أمراض الكلى": "02045ec7-5fac-50f9-b560-599b2fb3e597",
    "طب أمراض الدم والأورام": "fbd41163-0635-5e40-bc7a-ec836ba76239",
    "أمراض الحساسية": "73560649-9d1c-500b-94ef-99ae476117b5",
    "طب التغذية و الحمية": "0f7c8954-50a0-56aa-b4b3-880405974f1b",
    "طب التخدير": "da195401-5b58-11f0-9c01-525400088b55",
    "طب وجراحة تجميلية": "da1953ea-5b58-11f0-9c01-525400088b55",
    "الأمراض المعدية": "22a550cc-08c5-5bdf-a3cc-44f1105edad2",
    "الطب النووي": "da19538c-5b58-11f0-9c01-525400088b55"
}

# Generate SQL script
sql_lines = [
    "-- Migration: Medical Consultation Reasons Reference Table",
    "-- Inserts comprehensive consultation motifs linked to specialties with Arabic & French labels",
    "",
    "ALTER TABLE `reasons`",
    "  MODIFY COLUMN `name` VARCHAR(255) NOT NULL;",
    "",
    "-- Optional: ensure namear and namefr columns exist",
    "SET @dbname = DATABASE();",
    "SET @tablename = 'reasons';",
    "SET @columnname = 'namear';",
    "SET @preparedStatement = (SELECT IF(",
    "  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,",
    "  'SELECT 1',",
    "  'ALTER TABLE `reasons` ADD COLUMN `namear` VARCHAR(255) NULL AFTER `name`, ADD COLUMN `namefr` VARCHAR(255) NULL AFTER `namear`'",
    "));",
    "PREPARE alterIfNotExists FROM @preparedStatement;",
    "EXECUTE alterIfNotExists;",
    "DEALLOCATE PREPARE alterIfNotExists;",
    "",
    "DELETE FROM `reasons`;",
    "",
    "INSERT INTO `reasons` (`id`, `name`, `namear`, `namefr`, `specialtie_id`) VALUES"
]

sql_values = []
for r in reasons:
    sid = specialties_map[r['specialty_ar']]
    uid = str(uuid.uuid4())
    name_fr = r['namefr'].replace("'", "''")
    name_ar = r['namear'].replace("'", "''")
    sql_values.append(f"('{uid}', '{name_fr}', '{name_ar}', '{name_fr}', '{sid}')")

sql_lines.append(",\n".join(sql_values) + ";\n")

with open(r"d:\Application Web\WebTabibi\backend\sql\insert_reasons.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"Generated backend/sql/insert_reasons.sql with {len(sql_values)} rows.")
