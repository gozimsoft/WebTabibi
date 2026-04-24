-- ============================================================
-- admin_system.sql  —  Tabibi Admin System Migration
-- Run: mysql -u root -p uyyuppcc_DBTabibi < admin_system.sql
-- ============================================================

-- 1. Add Status to Clinics (PENDING | APPROVED | REJECTED)
ALTER TABLE `Clinics`
  ADD COLUMN IF NOT EXISTS `Status`        ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN IF NOT EXISTS `RejectedReason` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `ApprovedAt`   DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `Email`        VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS `Password`     VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `Notes`        TEXT NULL;

-- 2. Add Status to Doctors
ALTER TABLE `Doctors`
  ADD COLUMN IF NOT EXISTS `Status`        ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN IF NOT EXISTS `RejectedReason` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `ApprovedAt`   DATETIME NULL;

-- 3. Create ClinicRegistrations table (pending requests before becoming full Clinic)
CREATE TABLE IF NOT EXISTS `ClinicRegistrations` (
  `ID`            CHAR(36)     NOT NULL,
  `ClinicName`    VARCHAR(200) NOT NULL,
  `Email`         VARCHAR(150) NOT NULL,
  `Phone`         VARCHAR(30)  NOT NULL,
  `Address`       TEXT         NULL,
  `Notes`         TEXT         NULL,
  `Password`      VARCHAR(255) NOT NULL,
  `Status`        ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `RejectedReason` TEXT        NULL,
  `ApprovedAt`    DATETIME     NULL,
  `Clinic_ID`     CHAR(36)     NULL COMMENT 'Filled when approved and linked to Clinics table',
  `User_ID`       CHAR(36)     NULL COMMENT 'Filled when approved, linked to Users table',
  `CreatedAt`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `uq_clinic_reg_email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create DoctorRegistrations table
CREATE TABLE IF NOT EXISTS `DoctorRegistrations` (
  `ID`            CHAR(36)     NOT NULL,
  `FullName`      VARCHAR(200) NOT NULL,
  `Speciality`    VARCHAR(100) NOT NULL,
  `Email`         VARCHAR(150) NOT NULL,
  `Phone`         VARCHAR(30)  NOT NULL,
  `Password`      VARCHAR(255) NOT NULL,
  `ClinicName`    VARCHAR(200) NULL,
  `Status`        ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `RejectedReason` TEXT        NULL,
  `ApprovedAt`    DATETIME     NULL,
  `Doctor_ID`     CHAR(36)     NULL,
  `User_ID`       CHAR(36)     NULL,
  `CreatedAt`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `uq_doctor_reg_email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Ensure Users table has UserType 3 (admin)
-- UserType: 0=Patient, 1=Doctor, 2=Clinic, 3=Admin

-- 6. Create default Admin user (username: admin, password: Admin@2025)
-- Password stored as base64 of "Admin@2025" = QWRtaW5AMjAyNQ==
INSERT IGNORE INTO `Users` (`ID`, `Username`, `Password`, `UserType`)
VALUES (
  'admin-0000-0000-0000-000000000001',
  'admin',
  'QWRtaW5AMjAyNQ==',
  3
);

-- 7. Add indexes for performance
ALTER TABLE `ClinicRegistrations`
  ADD INDEX IF NOT EXISTS `idx_clinic_reg_status` (`Status`);

ALTER TABLE `DoctorRegistrations`
  ADD INDEX IF NOT EXISTS `idx_doctor_reg_status` (`Status`);
