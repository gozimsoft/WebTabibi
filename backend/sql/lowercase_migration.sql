-- Migration script to rename tables and columns to lowercase
-- Run this on your MySQL/MariaDB database

-- Tables
RENAME TABLE `Apointements` TO `apointements`;
RENAME TABLE `Baladiyas` TO `baladiyas`;
RENAME TABLE `ClinicDoctorRequests` TO `clinicdoctorrequests`;
RENAME TABLE `ClinicRegistrations` TO `clinicregistrations`;
RENAME TABLE `Clinics` TO `clinics`;
RENAME TABLE `ClinicsDoctors` TO `clinicsdoctors`;
RENAME TABLE `ClinicsPhotos` TO `clinicsphotos`;
RENAME TABLE `DoctorRegistrations` TO `doctorregistrations`;
RENAME TABLE `Doctors` TO `doctors`;
RENAME TABLE `DoctorsOffHours` TO `doctorsoffhours`;
RENAME TABLE `DoctorsRatings` TO `doctorsratings`;
RENAME TABLE `DoctorsReasons` TO `doctorsreasons`;
RENAME TABLE `DoctorsSettingApointements` TO `doctorssettingapointements`;
RENAME TABLE `Medicines` TO `medicines`;
RENAME TABLE `PatientRatings` TO `patientratings`;
RENAME TABLE `Patients` TO `patients`;
RENAME TABLE `PatientsProches` TO `patientsproches`;
RENAME TABLE `Reasons` TO `reasons`;
RENAME TABLE `SettingPreferences` TO `settingpreferences`;
RENAME TABLE `Specialties` TO `specialties`;
RENAME TABLE `TicketMessages` TO `ticketmessages`;
RENAME TABLE `Tickets` TO `tickets`;
RENAME TABLE `Users` TO `users`;
RENAME TABLE `Wilayas` TO `wilayas`;

-- Columns (Using CHANGE for compatibility)
-- Clinics
ALTER TABLE `clinics` CHANGE `ID` `id` CHAR(36), CHANGE `ClinicName` `clinicname` VARCHAR(200), CHANGE `Phone` `phone` VARCHAR(50), CHANGE `Fax` `fax` VARCHAR(50), CHANGE `Address` `address` TEXT, CHANGE `Logo` `logo` BLOB, CHANGE `Email` `email` VARCHAR(100), CHANGE `WebSite` `website` VARCHAR(100), CHANGE `ClinicCoordinates` `cliniccoordinates` VARCHAR(100), CHANGE `Emergency` `emergency` TINYINT(1), CHANGE `ActivitySector` `activitysector` VARCHAR(50), CHANGE `Ambulances` `ambulances` TINYINT(1), CHANGE `Hospitalization` `hospitalization` TINYINT(1), CHANGE `HideRating` `hiderating` TINYINT(1), CHANGE `PostCode` `postcode` INT(11), CHANGE `Services` `services` VARCHAR(500), CHANGE `AboutClinic` `aboutclinic` VARCHAR(1000), CHANGE `Latitude` `latitude` DOUBLE, CHANGE `Longitude` `longitude` DOUBLE, CHANGE `TypeClinic` `typeclinic` INT(11), CHANGE `Status` `status` VARCHAR(20), CHANGE `RejectedReason` `rejectedreason` TEXT, CHANGE `ApprovedAt` `approvedat` DATETIME, CHANGE `Password` `password` VARCHAR(255), CHANGE `Notes` `notes` TEXT;

-- Doctors
ALTER TABLE `doctors` CHANGE `ID` `id` CHAR(36), CHANGE `FullName` `fullname` VARCHAR(200), CHANGE `Phone` `phone` VARCHAR(30), CHANGE `Email` `email` VARCHAR(150), CHANGE `Status` `status` ENUM('PENDING','APPROVED','REJECTED'), CHANGE `ApprovedAt` `approvedat` DATETIME, CHANGE `User_id` `user_id` CHAR(36);

-- Users
ALTER TABLE `users` CHANGE `ID` `id` CHAR(36), CHANGE `Username` `username` VARCHAR(255), CHANGE `Password` `password` VARCHAR(255), CHANGE `UserType` `usertype` INT;

-- Patients
ALTER TABLE `patients` CHANGE `ID` `id` CHAR(36), CHANGE `FullName` `fullname` VARCHAR(200), CHANGE `Phone` `phone` VARCHAR(30), CHANGE `Email` `email` VARCHAR(150), CHANGE `BirthDate` `birthdate` DATE, CHANGE `Gender` `gender` VARCHAR(10), CHANGE `User_id` `user_id` CHAR(36);

-- Apointements
ALTER TABLE `apointements` CHANGE `ID` `id` CHAR(36), CHANGE `AppointementDate` `appointementdate` DATETIME, CHANGE `Status` `status` VARCHAR(50), CHANGE `Patient_ID` `patient_id` CHAR(36), CHANGE `Doctor_ID` `doctor_id` CHAR(36), CHANGE `Reason_id` `reason_id` CHAR(36), CHANGE `Note` `note` TEXT, CHANGE `CreatedAt` `createdat` DATETIME;

-- Specialties
ALTER TABLE `specialties` CHANGE `ID` `id` CHAR(36), CHANGE `NameFr` `namefr` VARCHAR(255), CHANGE `NameAr` `namear` VARCHAR(255);

-- ClinicsDoctors
ALTER TABLE `clinicsdoctors` CHANGE `ID` `id` CHAR(36), CHANGE `Clinic_id` `clinic_id` CHAR(36), CHANGE `Doctor_id` `doctor_id` CHAR(36), CHANGE `RelationStatus` `relationstatus` VARCHAR(50), CHANGE `RequestedBy` `requestedby` CHAR(36), CHANGE `CreatedAt` `createdat` DATETIME;

-- ClinicRegistrations
ALTER TABLE `clinicregistrations` CHANGE `ID` `id` CHAR(36), CHANGE `ClinicName` `clinicname` VARCHAR(200), CHANGE `Email` `email` VARCHAR(150), CHANGE `Phone` `phone` VARCHAR(30), CHANGE `Address` `address` TEXT, CHANGE `Notes` `notes` TEXT, CHANGE `Password` `password` VARCHAR(255), CHANGE `Status` `status` ENUM('PENDING','APPROVED','REJECTED'), CHANGE `RejectedReason` `rejectedreason` TEXT, CHANGE `ApprovedAt` `approvedat` DATETIME, CHANGE `Clinic_ID` `clinic_id` CHAR(36), CHANGE `User_ID` `user_id` CHAR(36), CHANGE `CreatedAt` `createdat` DATETIME;

-- DoctorRegistrations
ALTER TABLE `doctorregistrations` CHANGE `ID` `id` CHAR(36), CHANGE `FullName` `fullname` VARCHAR(200), CHANGE `Speciality` `speciality` VARCHAR(100), CHANGE `Email` `email` VARCHAR(150), CHANGE `Phone` `phone` VARCHAR(30), CHANGE `Password` `password` VARCHAR(255), CHANGE `ClinicName` `clinicname` VARCHAR(200), CHANGE `Status` `status` ENUM('PENDING','APPROVED','REJECTED'), CHANGE `RejectedReason` `rejectedreason` TEXT, CHANGE `ApprovedAt` `approvedat` DATETIME, CHANGE `Doctor_ID` `doctor_id` CHAR(36), CHANGE `User_ID` `user_id` CHAR(36), CHANGE `CreatedAt` `createdat` DATETIME;
