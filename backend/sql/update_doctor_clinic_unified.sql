-- ============================================================
-- SQL Migration: Unified Doctor-Clinic Architecture
-- File: backend/sql/update_doctor_clinic_unified.sql
-- ============================================================

-- 1. Add owner_doctor_id, createdat, and updatedat to clinics table
ALTER TABLE `clinics` 
  ADD COLUMN IF NOT EXISTS `owner_doctor_id` CHAR(36) NULL AFTER `user_id`,
  ADD COLUMN IF NOT EXISTS `createdat` DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updatedat` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD INDEX IF NOT EXISTS `idx_clinics_owner_doctor` (`owner_doctor_id`);

-- 2. Add is_owner flag to clinicsdoctors table
ALTER TABLE `clinicsdoctors` 
  ADD COLUMN IF NOT EXISTS `is_owner` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`;
