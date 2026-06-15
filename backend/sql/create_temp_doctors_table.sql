-- ============================================================
-- create_temp_doctors_table.sql
-- إنشاء الجدول المؤقت لبيانات الأطباء
-- ============================================================

-- حذف الجدول القديم إن وُجد
DROP TABLE IF EXISTS `temp_doctors_import`;

-- إنشاء الجدول المؤقت
CREATE TABLE `temp_doctors_import` (
    `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `doctor_name` VARCHAR(300) DEFAULT NULL COMMENT 'اسم الطبيب',
    `specialty`   VARCHAR(200) DEFAULT NULL COMMENT 'التخصص',
    `wilaya`      VARCHAR(100) DEFAULT NULL COMMENT 'الولاية',
    `baladiya`    VARCHAR(100) DEFAULT NULL COMMENT 'البلدية',
    `address`     TEXT         DEFAULT NULL COMMENT 'العنوان',
    `phone1`      VARCHAR(50)  DEFAULT NULL COMMENT 'الهاتف 1',
    `phone2`      VARCHAR(50)  DEFAULT NULL COMMENT 'الهاتف 2',
    `email`       VARCHAR(200) DEFAULT NULL COMMENT 'البريد الإلكتروني',
    `description` TEXT         DEFAULT NULL COMMENT 'الوصف',
    `imported_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_wilaya`    (`wilaya`),
    INDEX `idx_specialty` (`specialty`),
    INDEX `idx_phone1`    (`phone1`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='جدول مؤقت لاستيراد بيانات الأطباء من ملف CSV - doctors_data.csv';

-- ============================================================
-- بعد تشغيل هذا الملف، استخدم الملف import_doctors_temp.php
-- أو الأمر MySQL التالي لاستيراد البيانات من CSV مباشرةً:
-- (يعمل فقط إذا كان MySQL Server يمكنه الوصول إلى الملف)
-- ============================================================
/*
LOAD DATA LOCAL INFILE '/path/to/doctors_data.csv'
INTO TABLE `temp_doctors_import`
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 2 LINES
(`doctor_name`, `specialty`, `wilaya`, `baladiya`, `address`, `phone1`, `phone2`, `email`, `description`);
*/

-- التحقق من إنشاء الجدول
SELECT 'تم إنشاء الجدول temp_doctors_import بنجاح' AS status;
DESCRIBE `temp_doctors_import`;
