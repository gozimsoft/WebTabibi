# Unified Doctor-Clinic Architecture (Option 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved unified doctor-clinic architecture (Option 3): All-in-one registration with practice details, one-click admin approval creating both verified doctor and active clinic (`status = 'APPROVED'`), self-serve clinic creation auto-approved for verified doctors, and seamless sync readiness with `Tabibi_Rect`.

**Architecture:** A multi-layered architecture where doctors register once including their practice details. Admin approval atomically approves the doctor and creates/activates their owned clinic (`is_owner = 1`, `status = 'APPROVED'`) and initial schedule. Already verified doctors can create/update their clinic self-serve with immediate active status, while the Admin maintains full governance (freeze/suspend/edit).

**Tech Stack:** PHP (Vanilla PDO backend), MySQL/MariaDB, React (Vite, Lucide icons, i18next).

**Spec:** [`docs/superpowers/specs/2026-10-01-unified-doctor-clinic-account-design.md`](file:///d:/Application%20Web/WebTabibi/docs/superpowers/specs/2026-10-01-unified-doctor-clinic-account-design.md)

## Global Constraints

- Never break backward compatibility for existing appointments (`apointements.clinicsdoctor_id`).
- Strictly adhere to Law 18-07: passwords hashed with Bcrypt, never sent in clear text, consent flags preserved.
- All new DB columns must use `IF NOT EXISTS` in migrations.
- Maintain responsive, bilingual (Arabic & French) UI with RTL support.

## Review Focus

1. **Registration without clinic info:** If a doctor registers without filling optional clinic fields, registration succeeds and only doctor is created on admin approval without error.
2. **Duplicate clinic name or duplicate registration:** Phone and email uniqueness properly enforced across doctor and clinic tables.
3. **One-Click Atomic Transaction:** If any part of clinic creation fails during admin approval, the transaction rolls back cleanly without leaving orphan user records.
4. **Immediate Booking Slot Generation:** New approved clinic immediately generates available booking slots using default schedule (`timescale: 20`, `08:00 - 16:00`).
5. **No Double Pending State:** Self-serve clinic creation from doctor dashboard activates immediately (`status = 'APPROVED'`) without waiting for admin approval.

---

### Task 1: Database Migration for Practice Fields

**Files:**
- Create: `backend/sql/update_doctor_clinic_option3.sql`
- Modify: `backend/sql/admin_system.sql`

**Interfaces:**
- Consumes: Existing `doctorregistrations`, `clinics`, `clinicsdoctors` tables.
- Produces: Columns in `doctorregistrations`: `clinic_wilaya_id`, `clinic_baladiya_id`, `clinic_address`, `clinic_phone`.

- [x] **Step 1: Write SQL migration script `backend/sql/update_doctor_clinic_option3.sql`**

```sql
-- 1. Add practice location fields to doctorregistrations if not exists
ALTER TABLE `doctorregistrations`
  ADD COLUMN IF NOT EXISTS `clinicname` VARCHAR(200) NULL AFTER `nin`,
  ADD COLUMN IF NOT EXISTS `clinic_wilaya_id` INT NULL AFTER `clinicname`,
  ADD COLUMN IF NOT EXISTS `clinic_baladiya_id` INT NULL AFTER `clinic_wilaya_id`,
  ADD COLUMN IF NOT EXISTS `clinic_address` TEXT NULL AFTER `clinic_baladiya_id`,
  ADD COLUMN IF NOT EXISTS `clinic_phone` VARCHAR(30) NULL AFTER `clinic_address`;

-- 2. Ensure clinics has owner_doctor_id, wilaya_id, baladiya_id and updatedat
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
```

- [x] **Step 2: Commit migration file**

```bash
git add backend/sql/update_doctor_clinic_option3.sql
git commit -m "chore: add db migration for unified doctor practice fields"
```

---

### Task 2: Backend Registration Endpoint Update

**Files:**
- Modify: `backend/controllers/RegistrationController.php:30-86`

**Interfaces:**
- Consumes: HTTP `POST /api/register/doctor` with body containing: `fullname`, `speciality`, `email`, `phone`, `password`, `nin`, `clinicname`, `clinic_wilaya_id`, `clinic_baladiya_id`, `clinic_address`, `clinic_phone`.
- Produces: Saved record in `doctorregistrations` with all doctor and clinic fields.

- [x] **Step 1: Update `registerDoctor` in `backend/controllers/RegistrationController.php`**
Accept practice fields:
`$clinicName = trim($data['clinicname'] ?? '');`
`$clinicWilayaId = !empty($data['clinic_wilaya_id']) ? (int)$data['clinic_wilaya_id'] : null;`
`$clinicBaladiyaId = !empty($data['clinic_baladiya_id']) ? (int)$data['clinic_baladiya_id'] : null;`
`$clinicAddress = trim($data['clinic_address'] ?? '');`
`$clinicPhone = trim($data['clinic_phone'] ?? '');`

Insert into `doctorregistrations`:
Include `clinicname`, `clinic_wilaya_id`, `clinic_baladiya_id`, `clinic_address`, `clinic_phone`.

- [x] **Step 2: Commit backend registration controller changes**

```bash
git add backend/controllers/RegistrationController.php
git commit -m "feat: accept practice details in doctor registration endpoint"
```

---

### Task 3: Backend One-Click Admin Approval

**Files:**
- Modify: `backend/controllers/AdminController.php:500-580`

**Interfaces:**
- Consumes: HTTP `POST /api/admin/doctor-registrations/{id}/approve`
- Produces: Atomically creates `users`, `doctors` (`APPROVED`), `clinics` (`APPROVED`), `clinicsdoctors` (`is_owner = 1`), and `doctorssettingapointements`.

- [x] **Step 1: Update `approveDoctorRegistration` in `backend/controllers/AdminController.php`**
Inside the transaction:
1. Create user and doctor as usual.
2. Check if `$reg['clinicname']` is not empty (or generate default `عيادة د. ` . $reg['fullname']).
3. Insert into `clinics`:
   - `id = UUIDHelper::generate()`
   - `user_id = $userId`
   - `owner_doctor_id = $doctorIdToUse`
   - `clinicname = $clinicName`
   - `phone = $clinicPhone ?: $reg['phone']`
   - `address = $clinicAddress ?: 'الجزائر'`
   - `wilaya_id = $clinicWilayaId`
   - `baladiya_id = $clinicBaladiyaId`
   - `status = 'APPROVED'`
4. Insert into `clinicsdoctors`:
   - `id = UUIDHelper::generate()`
   - `clinic_id = $clinicId`
   - `doctor_id = $doctorIdToUse`
   - `is_owner = 1`
   - `status = 'APPROVED'`
   - `requestedby = 'DOCTOR'`
5. Insert into `doctorssettingapointements`:
   - `id = UUIDHelper::generate()`
   - `doctor_id = $doctorIdToUse`
   - `clinic_id = $clinicId`
   - `timescale = 20`
   - `daytimestart = '1899-12-30 08:00:00'`
   - `daytimeend = '1899-12-30 16:00:00'`
   - `workingdays = '1111100'`
   - `countdays = 30`

- [x] **Step 2: Commit admin approval changes**

```bash
git add backend/controllers/AdminController.php
git commit -m "feat: implement one-click atomic approval for doctor and clinic"
```

---

### Task 4: Backend Self-Serve Clinic Creation for Verified Doctors

**Files:**
- Modify: `backend/controllers/DoctorController.php:937-1044`

**Interfaces:**
- Consumes: HTTP `POST /api/doctors/clinic`
- Produces: Creates clinic with immediate `status = 'APPROVED'` and links `clinicsdoctors` (`is_owner = 1`).

- [x] **Step 1: Update `createClinic` in `backend/controllers/DoctorController.php`**
Change inserted status from `'PENDING'` to `'APPROVED'`:
```php
INSERT INTO clinics (
    ..., status, ...
) VALUES (
    ..., 'APPROVED', ...
)
```
Also insert initial `doctorssettingapointements` if none exists yet for this clinic and doctor.
Return status `'APPROVED'` with success message:
`'تم إنشاء وتفعيل عيادتك بنجاح وأصبحت جاهزة لاستقبال المواعيد.'`

- [x] **Step 2: Commit doctor controller changes**

```bash
git add backend/controllers/DoctorController.php
git commit -m "feat: auto-approve clinic created self-serve by verified doctor"
```

---

### Task 5: Frontend Unified Registration Form

**Files:**
- Modify: `frontend/src/App.jsx:6803-6950` (`RegisterDoctorPage`)

**Interfaces:**
- Consumes: `api.wilayas()`, `api.baladiyas(wilaya_id)`, `api.register.doctor()`
- Produces: Integrated practice details card in `/register-doctor` page.

- [x] **Step 1: Enhance `RegisterDoctorPage` state and layout**
- Add state fields: `clinicname`, `clinic_wilaya_id`, `clinic_baladiya_id`, `clinic_address`, `clinic_phone`.
- Automatically suggest `clinicname`: when `fullname` changes, if `clinicname` has not been manually edited, set `clinicname = "عيادة د. " + fullname`.
- Automatically suggest `clinic_phone`: when personal `phone` changes, pre-fill `clinic_phone`.
- Load `wilayas` list on mount.
- When `clinic_wilaya_id` changes, fetch matching `baladiyas`.
- Add a distinct, styled section: **"بيانات مقر العمل / العيادة الخاصة (اختياري / يُوصى به للبدء الفوري)"**.
- Submit all fields in `api.register.doctor()`.

- [x] **Step 2: Commit frontend registration form changes**

```bash
git add frontend/src/App.jsx
git commit -m "feat: add practice details section to doctor registration page"
```

---

### Task 6: Frontend Doctor Clinic Manager Update

**Files:**
- Modify: `frontend/src/components/DoctorClinicManager.jsx:195-212`

**Interfaces:**
- Consumes: `api.doctors.createClinic()`
- Produces: Updated success messages and UI badges reflecting immediate active status.

- [x] **Step 1: Update success message and status badges in `DoctorClinicManager.jsx`**
- In `handleCreateClinic`:
  Change toast message from "قيد مراجعة الإدارة" to:
  `isRtl ? "تم تفعيل عيادتك بنجاح وأصبحت جاهزة لاستقبال المرضى" : "Votre clinique est activée avec succès"`
- Show badge "معتمدة ومفعلة ✅" directly upon creation.

- [x] **Step 2: Commit clinic manager changes**

```bash
git add frontend/src/components/DoctorClinicManager.jsx
git commit -m "fix: update clinic manager UI for immediate active status"
```

---

### Task 7: End-to-End Verification & Testing

**Files:**
- Test verification across frontend and backend flows.

- [x] **Step 1: Test doctor registration API with practice details**
- [x] **Step 2: Test Admin approval flow and verify records in DB (`doctors`, `clinics`, `clinicsdoctors`, `doctorssettingapointements`)**
- [x] **Step 3: Test Doctor Dashboard (`DoctorClinicManager`) for active state**
- [x] **Step 4: Test patient booking slot availability for the newly approved clinic**
- [x] **Step 5: Final review and commit**
