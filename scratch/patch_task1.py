import os
import re

# 1. Patch schema.sql
schema_path = 'D:/Application Web/Tabibi_Rect/server/src/db/schema.sql'
with open(schema_path, 'r', encoding='utf-8') as f:
    schema_sql = f.read()

# Update SettingApointements in schema.sql
old_setting = "CREATE TABLE IF NOT EXISTS `SettingApointements` ( `ID` CHAR(36) NOT NULL PRIMARY KEY, `TimeScale` INT DEFAULT 10, `DaytimeStart` DATETIME, `DaytimeEnd` DATETIME, `WeekBeginDay` INT, `WorkingDays` VARCHAR(100), `StyleCalendar` VARCHAR(50), `Doctor_id` CHAR(36), `CountDays` INT DEFAULT 7, `IsRegistered` TINYINT(1) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
new_setting = "CREATE TABLE IF NOT EXISTS `SettingApointements` ( `ID` CHAR(36) NOT NULL PRIMARY KEY, `TimeScale` INT DEFAULT 10, `DaytimeStart` DATETIME, `DaytimeEnd` DATETIME, `WeekBeginDay` INT, `WorkingDays` VARCHAR(100), `StyleCalendar` VARCHAR(50), `Doctor_id` CHAR(36), `CountDays` INT DEFAULT 7, `IsRegistered` TINYINT(1), `BookingMode` INT DEFAULT 0, `ShiftMode` INT DEFAULT 1, `MorningStart` VARCHAR(20) DEFAULT '08:30:00', `MorningEnd` VARCHAR(20) DEFAULT '12:30:00', `MorningCapacity` INT DEFAULT 40, `EveningStart` VARCHAR(20) DEFAULT '13:30:00', `EveningEnd` VARCHAR(20) DEFAULT '17:30:00', `EveningCapacity` INT DEFAULT 40, `AllowOverbooking` TINYINT(1) DEFAULT 0 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"

if old_setting in schema_sql:
    schema_sql = schema_sql.replace(old_setting, new_setting)
    print("Updated SettingApointements in schema.sql")
else:
    print("WARNING: old_setting not found in schema.sql")

# Update Apointements in schema.sql
old_appt = "CREATE TABLE IF NOT EXISTS `Apointements` ( `ID` CHAR(36) NOT NULL PRIMARY KEY, `PatientName` VARCHAR(50), `BirthDate` DATETIME, `Phone` VARCHAR(50), `ApointementDate` DATETIME, `Note` VARCHAR(100), `ApointementColor` INT, `Weight` DOUBLE, `Height` DOUBLE, `IMC` DOUBLE, `PAS` DOUBLE, `PAC` DOUBLE, `Oxygen` DOUBLE, `Heartbeats` DOUBLE, `Reason_id` CHAR(36), `Doctor_id` CHAR(36), `IsDelete` TINYINT(1), `IsUpload` TINYINT(1), `UpdatedAt` DATETIME, `Status` INT ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
new_appt = "CREATE TABLE IF NOT EXISTS `Apointements` ( `ID` CHAR(36) NOT NULL PRIMARY KEY, `PatientName` VARCHAR(50), `BirthDate` DATETIME, `Phone` VARCHAR(50), `ApointementDate` DATETIME, `Note` VARCHAR(100), `ApointementColor` INT, `Weight` DOUBLE, `Height` DOUBLE, `IMC` DOUBLE, `PAS` DOUBLE, `PAC` DOUBLE, `Oxygen` DOUBLE, `Heartbeats` DOUBLE, `Reason_id` CHAR(36), `Doctor_id` CHAR(36), `IsDelete` TINYINT(1), `IsUpload` TINYINT(1), `UpdatedAt` DATETIME, `Status` INT, `Version` INT NOT NULL DEFAULT 1, `CancelReason` VARCHAR(255) NULL, `TokenNumber` INT NULL, `ShiftType` VARCHAR(20) NULL, `EstimatedTime` VARCHAR(20) NULL, `IsEmergency` TINYINT(1) DEFAULT 0, `QueueStatus` VARCHAR(30) DEFAULT 'waiting' ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"

if old_appt in schema_sql:
    schema_sql = schema_sql.replace(old_appt, new_appt)
    print("Updated Apointements in schema.sql")
else:
    print("WARNING: old_appt not found in schema.sql")

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(schema_sql)

print("schema.sql saved successfully!")
