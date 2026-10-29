# Doctor Leaves, Emergency Unavailabilities & Existing Bookings Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, end-to-end doctor unavailabilities and emergency leave management system in WebTabibi with automated conflict detection, patient notification, auto-rescheduling, and secretary call list workflows.

**Architecture:** A MySQL database table (`doctor_unavailabilities`) tracks leaves by date/time and scope. The PHP backend provides conflict detection and resolution endpoints (`cancel`, `reschedule`, `manual`) while guarding `getAvailableSlots` and `create` against double bookings during leave periods. The React frontend introduces a dedicated "leaves" tab in `DoctorClinicManager`, a conflict resolution modal, a quick "⚡ طلعة طارئة" button in `AppointmentManager`, and calendar slot disabling in `Book.jsx`.

**Tech Stack:** PHP 8+ (PDO, MySQL), React (Vite, Lucide icons, Vanilla CSS tokens), Delphi sync schema compatibility.

**Spec:** [`Docs/superpowers/specs/2026-10-27-doctor-leaves-and-unavailabilities-design.md`](file:///d:/Application%20Web/WebTabibi/Docs/superpowers/specs/2026-10-27-doctor-leaves-and-unavailabilities-design.md)

## Global Constraints

- Primary keys MUST use `UUID v4` (`CHAR(36)`) generated via `UUIDHelper::generate()` for Delphi desktop sync compatibility.
- Passwords and auth tokens remain unchanged (using existing session auth and RBAC middleware).
- Responsive UI matching existing dark/light mode CSS variables and Arabic RTL direction.
- All SQL modifications must be non-destructive and backward compatible.

## Review Focus

- Doctor with appointments scheduled in morning shift creates a partial-hours leave (e.g. 10:00 to 12:00): only appointments inside that range are marked as conflicting.
- Creating a full-day leave with `cancel` action updates conflicting appointments to `status = 2` and inserts records into `notifications` for every affected patient.
- Creating a leave with `reschedule` shifts appointments to the next available working day without exceeding daily capacities.
- `getAvailableSlots` in both `TIME_SLOTS` and `QUEUE_NUMBERS` modes properly suppresses slots falling on leave days or during leave hours.
- Emergency receptionist booking or patient booking during an active leave is strictly rejected by the backend with HTTP 409.

---

### Task 1: Database Migration for `doctor_unavailabilities`

**Files:**
- Create: `backend/sql/doctor_unavailabilities_migration.sql`
- Test: `scratch/test_unavailabilities_migration.php`

**Interfaces:**
- Produces: Table `doctor_unavailabilities` with columns `id`, `doctor_id`, `clinic_id`, `clinicsdoctor_id`, `leave_type`, `start_datetime`, `end_datetime`, `shift_type`, `reason`, `show_reason_to_patient`, `created_by_user_id`, `created_at`, `updated_at`.

- [ ] **Step 1: Write SQL migration file**
  Create `backend/sql/doctor_unavailabilities_migration.sql` with table definition, foreign keys, and indexes.

- [ ] **Step 2: Write test script to verify table creation and structure**
  Create `scratch/test_unavailabilities_migration.php` using PDO to execute or verify table existence and column types.

- [ ] **Step 3: Run migration verification test**
  Run: `php scratch/test_unavailabilities_migration.php`
  Expected: PASS with "Table doctor_unavailabilities verified successfully".

---

### Task 2: Backend API Endpoints & Conflict Resolution Engine

**Files:**
- Modify: `backend/controllers/DoctorController.php`
- Modify: `backend/index.php`
- Test: `scratch/test_unavailabilities_api.php`

**Interfaces:**
- Consumes: Table `doctor_unavailabilities`, `apointements`, `notifications`
- Produces:
  - `GET /doctor/unavailabilities`: returns list of unavailabilities for logged-in doctor
  - `POST /doctor/unavailabilities/check-conflicts`: returns `{ has_conflicts, count, appointments }`
  - `POST /doctor/unavailabilities`: creates leave and executes `cancel`, `reschedule`, or `manual` action
  - `DELETE /doctor/unavailabilities/{id}`: removes leave record

- [ ] **Step 1: Add controller methods in `DoctorController.php`**
  Implement:
  - `getUnavailabilities()`
  - `checkUnavailabilityConflicts()`
  - `createUnavailability()`
  - `deleteUnavailability()`

- [ ] **Step 2: Register routes in `backend/index.php`**
  Route the 4 endpoints under `/doctor/unavailabilities` protected by `AuthMiddleware::authenticate()`.

- [ ] **Step 3: Write test script to exercise conflict check, creation with cancel action, and deletion**
  Create `scratch/test_unavailabilities_api.php`.

- [ ] **Step 4: Run API test to verify passes**
  Run: `php scratch/test_unavailabilities_api.php`
  Expected: PASS with HTTP 200/201 and conflict resolution validation.

---

### Task 3: Backend Booking Guards in `AppointmentController.php`

**Files:**
- Modify: `backend/controllers/AppointmentController.php`
- Test: `scratch/test_appointment_unavailability_guards.php`

**Interfaces:**
- Consumes: `doctor_unavailabilities` table
- Produces: Filtered slots in `getAvailableSlots()` and rejection in `create()` when date/time overlaps an active leave.

- [ ] **Step 1: Update `AppointmentController::getAvailableSlots()`**
  Fetch active unavailabilities for doctor/clinic on the requested date.
  If full-day leave: return empty slots with `day_unavailable: true` and `reason`.
  If partial-hours leave: filter out overlapping slots.
  In queue mode: mark shift as unavailable if leave covers shift duration.

- [ ] **Step 2: Update `AppointmentController::create()` and receptionist add appointment**
  Add guard query checking for overlap between requested appointment datetime and `doctor_unavailabilities`. Reject with 409 if overlapping.

- [ ] **Step 3: Write test script for slot filtering and booking rejection**
  Create `scratch/test_appointment_unavailability_guards.php`.

- [ ] **Step 4: Run test to verify guards**
  Run: `php scratch/test_appointment_unavailability_guards.php`
  Expected: PASS (slots filtered on leave hours, booking rejected on leave date).

---

### Task 4: Frontend API Client Methods

**Files:**
- Modify: `frontend/src/api/client.js`
- Test: verify imports and method definitions

**Interfaces:**
- Produces:
  - `api.doctor.getUnavailabilities(params)`
  - `api.doctor.checkUnavailabilityConflicts(payload)`
  - `api.doctor.addUnavailability(payload)`
  - `api.doctor.deleteUnavailability(id)`

- [ ] **Step 1: Add methods to `api.doctor` in `frontend/src/api/client.js`**
  Connect to backend endpoints with standard query string and JSON body handling.

---

### Task 5: Doctor Leaves Management Tab & Conflict Modal in `DoctorClinicManager.jsx`

**Files:**
- Modify: `frontend/src/components/DoctorClinicManager.jsx`

**Interfaces:**
- Consumes: `api.doctor.getUnavailabilities`, `api.doctor.checkUnavailabilityConflicts`, `api.doctor.addUnavailability`, `api.doctor.deleteUnavailability`
- Produces: UI subtab `"leaves"` ("الإجازات والطلعات الطارئة") with creation form, conflict modal, and list of leaves.

- [ ] **Step 1: Add "leaves" subtab button to navigation bar**
  Add tab button with `CalendarDays` / `Clock` icon, responsive badge showing count of active leaves.

- [ ] **Step 2: Implement Leave Creation Form**
  Form inputs: Leave type (`partial_hours`, `full_day`, `shift`), Clinic selector (or All Clinics), Date, Start Time, End Time, Shift, Reason, Show Reason toggle.

- [ ] **Step 3: Implement Conflict Resolution Modal**
  Upon submit, call `checkUnavailabilityConflicts`:
  If conflicts > 0, open modal displaying patient count and 3 choice cards:
  1. Auto-Cancel & Notify (`cancel`)
  2. Auto-Reschedule (`reschedule`)
  3. Manual Secretary Call List (`manual`) with phone numbers table.

- [ ] **Step 4: Implement Active Leaves Table**
  List cards for upcoming and past leaves with type badges, dates, reason, and delete button with confirmation.

---

### Task 6: Quick Emergency Leave Button in `AppointmentManager.jsx`

**Files:**
- Modify: `frontend/src/pages/AppointmentManager.jsx`

**Interfaces:**
- Consumes: `api.doctor.checkUnavailabilityConflicts`, `api.doctor.addUnavailability`
- Produces: Quick Action Button `"⚡ طلعة طارئة"` and modal in live queue header.

- [ ] **Step 1: Add "⚡ طلعة طارئة" button in `AppointmentManager` toolbar**
  Place button next to queue controls.

- [ ] **Step 2: Create Quick Emergency Leave Modal**
  Defaults date to today, start time to current hour/minute. Allows doctor/secretary to block the next 1-4 hours or the rest of the day with one click.

---

### Task 7: Patient Booking Experience in `Book.jsx`

**Files:**
- Modify: `frontend/src/pages/Book.jsx`

**Interfaces:**
- Consumes: `day_unavailable` and filtered `slots` from `api.patient.getAvailableSlots()`
- Produces: Disabled styling on calendar day and informative message ("الطبيب في عطلة / غير متاح").

- [ ] **Step 1: Update Calendar Day Rendering in `Book.jsx`**
  When selected date is marked as unavailable, render alert banner with reason and prevent slot selection.

---

### Task 8: End-to-End Verification & Build Validation

**Files:**
- Run: Frontend build check (`npm run build`)
- Run: End-to-end integration test script

- [ ] **Step 1: Verify frontend bundle build**
  Run: `npm run build` in `frontend/`
  Expected: Build succeeds with 0 errors.

- [ ] **Step 2: Run complete backend integration tests**
  Run: `php scratch/test_unavailabilities_api.php`
  Expected: All checks pass.
