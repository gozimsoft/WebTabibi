-- ============================================================
-- admin_system.sql  —  Tabibi Admin System Migration
-- Run: mysql -u root -p uyyuppcc_DBTabibi < admin_system.sql
-- ============================================================

-- 1. Add status to clinics (PENDING | APPROVED | REJECTED)
ALTER TABLE `clinics`
  ADD COLUMN IF NOT EXISTS `status`        ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN IF NOT EXISTS `rejectedreason` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `approvedat`   DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `email`        VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS `password`     VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `notes`        TEXT NULL;

-- 2. Add status to doctors
ALTER TABLE `doctors`
  ADD COLUMN IF NOT EXISTS `status`        ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN IF NOT EXISTS `rejectedreason` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `approvedat`   DATETIME NULL;

-- 3. Create clinicregistrations table (pending requests before becoming full Clinic)
CREATE TABLE IF NOT EXISTS `clinicregistrations` (
  `id`            CHAR(36)     NOT NULL,
  `clinicname`    VARCHAR(200) NOT NULL,
  `email`         VARCHAR(150) NOT NULL,
  `phone`         VARCHAR(30)  NOT NULL,
  `address`       TEXT         NULL,
  `notes`         TEXT         NULL,
  `password`      VARCHAR(255) NOT NULL,
  `status`        ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `rejectedreason` TEXT        NULL,
  `approvedat`    DATETIME     NULL,
  `clinic_id`     CHAR(36)     NULL comment 'Filled when approved and linked to clinics table',
  `user_id`       CHAR(36)     NULL comment 'Filled when approved, linked to users table',
  `createdat`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clinic_reg_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create doctorregistrations table
CREATE TABLE IF NOT EXISTS `doctorregistrations` (
  `id`            CHAR(36)     NOT NULL,
  `fullname`      VARCHAR(200) NOT NULL,
  `speciality`    VARCHAR(100) NOT NULL,
  `email`         VARCHAR(150) NOT NULL,
  `phone`         VARCHAR(30)  NOT NULL,
  `password`      VARCHAR(255) NOT NULL,
  `clinicname`    VARCHAR(200) NULL,
  `status`        ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `rejectedreason` TEXT        NULL,
  `approvedat`    DATETIME     NULL,
  `doctor_id`     CHAR(36)     NULL,
  `user_id`       CHAR(36)     NULL,
  `createdat`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_doctor_reg_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Ensure users table has usertype 3 (admin)
-- usertype: 0=Patient, 1=Doctor, 2=Clinic, 3=Admin

-- 6. Create default Admin user (username: admin, password: Admin@2025)
-- password stored as base64 of "Admin@2025" = QWRtaW5AMjAyNQ==
INSERT IGNORE INTO `users` (`id`, `username`, `password`, `usertype`)
VALUES (
  'admin-0000-0000-0000-000000000001',
  'admin',
  'QWRtaW5AMjAyNQ==',
  3
);

-- 7. Add indexes for performance
ALTER TABLE `clinicregistrations`
  ADD INDEX IF NOT EXISTS `idx_clinic_reg_status` (`status`);

ALTER TABLE `doctorregistrations`
  ADD INDEX IF NOT EXISTS `idx_doctor_reg_status` (`status`);
