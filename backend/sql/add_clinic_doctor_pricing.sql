-- ============================================================
-- SQL Migration: Clinic-Specific Consultation Pricing & Reasons
-- File: backend/sql/add_clinic_doctor_pricing.sql
-- ============================================================

-- 1. Add pricing column to clinicsdoctors table if not exists
ALTER TABLE `clinicsdoctors`
  ADD COLUMN IF NOT EXISTS `pricing` DOUBLE NULL DEFAULT NULL AFTER `specialtie_id`;

-- 2. Add composite index for doctor_id and clinic_id on doctorsreasons if not exists
-- (Note: MySQL doesn't have ADD INDEX IF NOT EXISTS in all versions, handled safely in migration runner)
