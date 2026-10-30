-- Migration: doctor_unavailabilities table
-- Description: Stores doctor leaves, unavailabilities, holidays, and emergency exits.

CREATE TABLE IF NOT EXISTS `doctor_unavailabilities` (
  `id` CHAR(36) NOT NULL,
  `doctor_id` CHAR(36) NOT NULL,
  `clinic_id` CHAR(36) DEFAULT NULL COMMENT 'NULL applies to all clinics',
  `clinicsdoctor_id` CHAR(36) DEFAULT NULL,
  `leave_type` ENUM('full_day', 'partial_hours', 'shift') NOT NULL DEFAULT 'full_day',
  `start_datetime` DATETIME NOT NULL COMMENT 'Start of absence period',
  `end_datetime` DATETIME NOT NULL COMMENT 'End of absence period',
  `shift_type` VARCHAR(20) DEFAULT NULL COMMENT 'morning or evening or full_day',
  `reason` VARCHAR(255) DEFAULT NULL COMMENT 'Reason for absence',
  `show_reason_to_patient` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_doc_dates` (`doctor_id`, `start_datetime`, `end_datetime`),
  KEY `idx_cd_dates` (`clinicsdoctor_id`, `start_datetime`, `end_datetime`),
  CONSTRAINT `fk_unavail_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
