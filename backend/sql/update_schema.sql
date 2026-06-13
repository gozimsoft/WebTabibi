-- ============================================================
-- SQL Script: Add emailvalidation and verifications table
-- ============================================================

-- 1. Create the verifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS `verifications` (
  `id`         char(36)     NOT NULL,
  `user_id`    char(36)     DEFAULT NULL,
  `type`       varchar(10)  NOT NULL comment 'email or phone',
  `target`     varchar(100) NOT NULL comment 'the email or phone being verified',
  `code`       varchar(10)  NOT NULL,
  `expires_at` datetime     NOT NULL,
  `verified`   tinyint(1)   DEFAULT 0,
  `created_at` datetime     DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_type_idx` (`user_id`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add emailvalidation and phonevalidation to patients, doctors, and clinics
-- Note: MySQL doesn't natively support "ADD COLUMN IF NOT EXISTS" cleanly in all versions.
-- If these columns already exist in 'patients', running this will show a warning/error on that line, 
-- but will continue for the others.

ALTER TABLE `patients` ADD COLUMN IF NOT EXISTS `emailvalidation` TINYINT(1) DEFAULT 1;
ALTER TABLE `patients` ADD COLUMN IF NOT EXISTS `phonevalidation` TINYINT(1) DEFAULT 0;

ALTER TABLE `doctors` ADD COLUMN IF NOT EXISTS `emailvalidation` TINYINT(1) DEFAULT 1;
ALTER TABLE `doctors` ADD COLUMN IF NOT EXISTS `phonevalidation` TINYINT(1) DEFAULT 0;

ALTER TABLE `clinics` ADD COLUMN IF NOT EXISTS `emailvalidation` TINYINT(1) DEFAULT 1;
ALTER TABLE `clinics` ADD COLUMN IF NOT EXISTS `phonevalidation` TINYINT(1) DEFAULT 0;
