-- ============================================================
-- SQL Migration: Unified Doctor-Clinic Architecture (Option 3)
-- File: backend/sql/update_doctor_clinic_option3.sql
-- ============================================================

-- 1. Add practice location fields to doctorregistrations table
ALTER TABLE `doctorregistrations`
  ADD COLUMN IF NOT EXISTS `clinicname` VARCHAR(200) NULL AFTER `nin`,
  ADD COLUMN IF NOT EXISTS `clinic_wilaya_id` INT NULL AFTER `clinicname`,
  ADD COLUMN IF NOT EXISTS `clinic_baladiya_id` INT NULL AFTER `clinic_wilaya_id`,
  ADD COLUMN IF NOT EXISTS `clinic_address` TEXT NULL AFTER `clinic_baladiya_id`,
  ADD COLUMN IF NOT EXISTS `clinic_phone` VARCHAR(30) NULL AFTER `clinic_address`;

-- 2. Ensure clinics has owner_doctor_id, wilaya_id, baladiya_id, and timestamps
ALTER TABLE `clinics`
  ADD COLUMN IF NOT EXISTS `owner_doctor_id` CHAR(36) NULL AFTER `user_id`,
  ADD COLUMN IF NOT EXISTS `wilaya_id` INT NULL AFTER `address`,
  ADD COLUMN IF NOT EXISTS `baladiya_id` INT NULL AFTER `wilaya_id`,
  ADD COLUMN IF NOT EXISTS `createdat` DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updatedat` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD INDEX IF NOT EXISTS `idx_clinics_owner_doctor` (`owner_doctor_id`);

-- 3. Ensure clinicsdoctors has is_owner flag
ALTER TABLE `clinicsdoctors`
  ADD COLUMN IF NOT EXISTS `is_owner` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`;
