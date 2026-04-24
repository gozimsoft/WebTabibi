<?php
require 'backend/core/Database.php';
$pdo = Database::getInstance();

$sql = "
CREATE TABLE IF NOT EXISTS `ClinicDoctorRequests` (
  `ID`            CHAR(36)     NOT NULL,
  `Clinic_ID`     CHAR(36)     NOT NULL,
  `Doctor_ID`     CHAR(36)     NOT NULL,
  `SenderType`    ENUM('DOCTOR', 'CLINIC') NOT NULL,
  `Status`        ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `CreatedAt`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt`     DATETIME     NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `uq_cd_req_active` (`Clinic_ID`, `Doctor_ID`, `Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

$pdo->exec($sql);
echo "Table ClinicDoctorRequests created successfully.\n";
