-- ============================================================
-- backend/sql/init_clinic_installer_schema.sql
-- كود إنشاء الجداول التلقائي عند التثبيت الأولي في نافذة إعدادات الاتصال (Tabibi_Rect)
-- ============================================================

-- 1. جدول إعدادات دوام ومواعيد الأطباء
CREATE TABLE IF NOT EXISTS `doctorssettingapointements` (
  `id` CHAR(36) NOT NULL,
  `doctor_id` CHAR(36) NOT NULL,
  `clinic_id` CHAR(36) NOT NULL,
  `booking_mode` TINYINT NOT NULL DEFAULT 0 COMMENT '0: Time-Slots, 1: Queue-Numbers',
  `shift_mode` TINYINT NOT NULL DEFAULT 1 COMMENT '1: Single Shift, 2: Double Shift',
  `timescale` INT NOT NULL DEFAULT 15 COMMENT 'Estimated duration in mins',
  `morning_start` TIME DEFAULT '08:30:00',
  `morning_end` TIME DEFAULT '12:30:00',
  `morning_capacity` INT NOT NULL DEFAULT 25,
  `evening_start` TIME DEFAULT '14:00:00',
  `evening_end` TIME DEFAULT '17:30:00',
  `evening_capacity` INT NOT NULL DEFAULT 15,
  `allow_overbooking` TINYINT NOT NULL DEFAULT 1,
  `daytimestart` DATETIME DEFAULT '1899-12-30 08:30:00',
  `daytimeend` DATETIME DEFAULT '1899-12-30 17:30:00',
  `workingdays` VARCHAR(7) NOT NULL DEFAULT '1111110',
  `weekbeginday` INT NOT NULL DEFAULT 0,
  `countdays` INT NOT NULL DEFAULT 30,
  `isregistered` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_doc_clinic_settings` (`doctor_id`, `clinic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول المواعيد والتذاكر
CREATE TABLE IF NOT EXISTS `apointements` (
  `id` CHAR(36) NOT NULL,
  `clinicsdoctor_id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) DEFAULT NULL,
  `patientname` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(25) DEFAULT NULL,
  `apointementdate` DATETIME NOT NULL,
  `token_number` INT DEFAULT NULL COMMENT 'Sequential queue number',
  `shift_type` VARCHAR(10) DEFAULT 'morning' COMMENT 'morning, evening, full_day',
  `estimated_time` TIME DEFAULT NULL COMMENT 'Estimated consultation time',
  `is_emergency` TINYINT NOT NULL DEFAULT 0 COMMENT '1 if emergency',
  `queue_status` VARCHAR(20) NOT NULL DEFAULT 'waiting' COMMENT 'waiting, in_consultation, completed, absent',
  `reason_id` CHAR(36) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `status` INT NOT NULL DEFAULT 0 COMMENT '0: active, 1: cancelled, 2: completed',
  `consent_health` TINYINT NOT NULL DEFAULT 1,
  `consent_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedat` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_queue_lookup` (`clinicsdoctor_id`, `apointementdate`, `shift_type`, `token_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
