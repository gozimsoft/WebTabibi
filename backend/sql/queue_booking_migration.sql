-- ============================================================
-- backend/sql/queue_booking_migration.sql
-- Migration for Dual Queue-Based & Time-Slot Booking System
-- ============================================================

-- 1. Add Queue and Shift configuration columns to `doctorssettingapointements`
ALTER TABLE `doctorssettingapointements`
  ADD COLUMN IF NOT EXISTS `booking_mode` TINYINT NOT NULL DEFAULT 0 COMMENT '0: Time-Slots, 1: Queue-Numbers',
  ADD COLUMN IF NOT EXISTS `shift_mode` TINYINT NOT NULL DEFAULT 1 COMMENT '1: Single Shift, 2: Double Shift',
  ADD COLUMN IF NOT EXISTS `morning_start` TIME DEFAULT '08:30:00' COMMENT 'Morning shift start time',
  ADD COLUMN IF NOT EXISTS `morning_end` TIME DEFAULT '12:30:00' COMMENT 'Morning shift end time',
  ADD COLUMN IF NOT EXISTS `morning_capacity` INT NOT NULL DEFAULT 25 COMMENT 'Max patients for morning shift',
  ADD COLUMN IF NOT EXISTS `evening_start` TIME DEFAULT '14:00:00' COMMENT 'Evening shift start time',
  ADD COLUMN IF NOT EXISTS `evening_end` TIME DEFAULT '17:30:00' COMMENT 'Evening shift end time',
  ADD COLUMN IF NOT EXISTS `evening_capacity` INT NOT NULL DEFAULT 15 COMMENT 'Max patients for evening shift',
  ADD COLUMN IF NOT EXISTS `allow_overbooking` TINYINT NOT NULL DEFAULT 1 COMMENT '1: allow emergency addition above capacity';

-- 2. Add Queue ticket columns to `apointements`
ALTER TABLE `apointements`
  ADD COLUMN IF NOT EXISTS `token_number` INT DEFAULT NULL COMMENT 'Sequential queue number per shift/day',
  ADD COLUMN IF NOT EXISTS `shift_type` VARCHAR(10) DEFAULT 'morning' COMMENT 'morning, evening, full_day',
  ADD COLUMN IF NOT EXISTS `estimated_time` TIME DEFAULT NULL COMMENT 'Estimated consultation time',
  ADD COLUMN IF NOT EXISTS `is_emergency` TINYINT NOT NULL DEFAULT 0 COMMENT '1 if added above capacity for emergency',
  ADD COLUMN IF NOT EXISTS `queue_status` VARCHAR(20) NOT NULL DEFAULT 'waiting' COMMENT 'waiting, in_consultation, completed, absent';

-- 3. Add performance index on queue lookup if not already existing
SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'apointements'
    AND index_name = 'idx_queue_lookup'
);

SET @sql = IF(@index_exists = 0,
  'ALTER TABLE `apointements` ADD INDEX `idx_queue_lookup` (`clinicsdoctor_id`, `apointementdate`, `shift_type`, `token_number`)',
  'SELECT "Index idx_queue_lookup already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
