# Database Structure - Clinic Management System

## Core Tables

### Doctors

* ID (int)
* User_id (int)
* FullName (string)
* Phone (string)
* Email (string)
* Specialtie_id (int)
* Status (PENDING | APPROVED | REJECTED) ← (مهم)
* Experience (int)
* PhotoProfile (string)

---

### Clinics

* ID (int)
* ClinicName (string)
* Phone (string)
* Email (string)
* Address (string)
* Status (PENDING | APPROVED | REJECTED) ← (مهم)
* Emergency (boolean)
* Hospitalization (boolean)

---

### Patients

* ID (int)
* FullName (string)
* Phone (string)
* Email (string)
* BirthDate (date)
* Gender (string)
* User_id (int)

---

### Apointements

* ID (int)
* AppointementDate (datetime)
* PatientName (string)
* Patient_id (FK -> Patients.ID)
* Doctor_id (FK -> Doctors.ID)
* ClinicsDoctor_id (FK)
* Reason_id (FK)
* Note (text)
* IsDelete (boolean)
* Source (string)

---

## Relationship Tables

### ClinicsDoctors

(ربط الطبيب بالعيادة)

* Doctor_id (FK -> Doctors.ID)
* Clinic_id (FK -> Clinics.ID)

✔️ الطبيب يمكنه العمل في عدة عيادات
✔️ العيادة تحتوي على عدة أطباء

---

### DoctorsSettingApointements

(إعدادات المواعيد)

* Doctor_id
* TimeScale (مدة الموعد)
* DaytimeStart (وقت البداية)
* DaytimeEnd (وقت النهاية)

---

### DoctorsReasons / Reasons

(أسباب الزيارة)

* Reason_id
* Name
* Duration

---

## Additional Tables (مختصرة)

* Messages / MessageThreads → نظام المحادثة
* DoctorsRatings / PatientRatings → التقييمات
* ClinicsPhotos → صور العيادات
* Medicines → الأدوية
* Baladiyas → البلديات
* PatientsProches → أقارب المريض

---

## Business Rules

* لا يمكن حجز موعد إذا:

  * Doctor.status != APPROVED
  * Clinic.status != APPROVED

* كل Appointment يجب أن يرتبط بـ:

  * Doctor
  * Patient
  * Clinic

* الطبيب يمكنه:

  * العمل في عدة Clinics
  * تحديد أوقات العمل عبر DoctorsSettingApointements

---

## Important Notes for AI

* لا تغير أسماء الجداول أو الحقول
* استخدم العلاقات الموجودة فقط
* لا تفترض وجود أعمدة غير مذكورة
* احترم نظام الربط بين Doctors و Clinics عبر ClinicsDoctors
