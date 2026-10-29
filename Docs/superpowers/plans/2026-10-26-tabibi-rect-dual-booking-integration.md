# Tabibi_Rect Dual Booking System Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the dual booking system (Time slots vs. Queue numbers) into `Tabibi_Rect` (desktop clinic management system), covering database initialization/migration, cloud sync with `WebTabibi`, backend API, and doctor settings/waiting room UI.

**Architecture:** Extend the MySQL database schema in `schema.sql`, `syncSchema.ts`, and `ensureAppointmentSchema.ts` so that new database creations from the connection settings window and existing clinic databases automatically include the dual booking fields (`BookingMode`, `ShiftMode`, shifts, capacities, `TokenNumber`, `QueueStatus`, etc.). Update `tabibiSyncService.ts` for bidirectional synchronization of schedule configs and appointments with `WebTabibi`. Update `server/src/routes/settings.ts` and `server/src/routes/appointments.ts` to manage shifts and ticket numbers, and update `client/src/components/settings/DoctorSettingsModal.tsx` and calendar waiting views (`WaitingTableView.tsx`, `WaitingScreenView.tsx`) to configure and display queue numbers.

**Tech Stack:** Node.js, Express, TypeScript, MySQL (mysql2), React, Vite, CSS.

**Spec:** [Docs/CHANGELOG.md](file:///d:/Application%20Web/WebTabibi/Docs/CHANGELOG.md) & [Docs/DATABASE.md](file:///d:/Application%20Web/WebTabibi/Docs/DATABASE.md).

## Global Constraints
- Target codebase: `D:/Application Web/Tabibi_Rect`
- Zero breaking changes for doctors using the legacy time-based appointment system (default `BookingMode = 0`).
- Database schema changes must be in the initial database creation script (`server/src/db/schema.sql`) executed by the connection settings window (`POST /api/settings/create-database-user`), plus self-healing in `syncSchema.ts` and `ensureAppointmentSchema.ts`.
- Full backwards-compatibility with `WebTabibi` cloud API and sync protocol.

## Review Focus
1. New database creation via `/api/settings/create-database-user` creates tables with all new columns without SQL syntax errors.
2. Existing databases get new columns without error or table recreation when `ensureAppointmentSchema` runs.
3. Schedule upload to `WebTabibi` sends `booking_mode`, `shift_mode`, `morning_start`, `morning_end`, `morning_capacity`, `evening_start`, `evening_end`, `evening_capacity`, `allow_overbooking`.
4. Appointment download from `WebTabibi` persists `TokenNumber`, `ShiftType`, `EstimatedTime`, `IsEmergency`, `QueueStatus`.
5. Saving doctor settings in `DoctorSettingsModal.tsx` persists dual booking options and triggers schedule sync to `WebTabibi`.

---

### Task 1: Database Schema & Self-Healing Migration in `Tabibi_Rect`

**Files:**
- Modify: `D:/Application Web/Tabibi_Rect/server/src/db/schema.sql`
- Modify: `D:/Application Web/Tabibi_Rect/server/src/db/ensureAppointmentSchema.ts`
- Modify: `D:/Application Web/Tabibi_Rect/server/src/db/syncSchema.ts`
- Test: `D:/Application Web/Tabibi_Rect/server/src/scripts/test_queue_schema_migration.ts`

**Interfaces:**
- Consumes: Existing table definitions `SettingApointements` and `Apointements`.
- Produces: Columns in `SettingApointements` (`BookingMode`, `ShiftMode`, `MorningStart`, `MorningEnd`, `MorningCapacity`, `EveningStart`, `EveningEnd`, `EveningCapacity`, `AllowOverbooking`), and columns in `Apointements` (`TokenNumber`, `ShiftType`, `EstimatedTime`, `IsEmergency`, `QueueStatus`).

- [ ] **Step 1: Write verification script `test_queue_schema_migration.ts`**
Verify that `ensureAppointmentSchema` checks for and adds the new columns idempotently.

- [ ] **Step 2: Update `server/src/db/schema.sql`**
Add the new columns to the `CREATE TABLE IF NOT EXISTS \`SettingApointements\`` and `CREATE TABLE IF NOT EXISTS \`Apointements\`` definitions.

- [ ] **Step 3: Update `server/src/db/ensureAppointmentSchema.ts` and `server/src/db/syncSchema.ts`**
Implement idempotent column verification and `ALTER TABLE` queries for existing databases.

- [ ] **Step 4: Run verification script**
Run `npx ts-node server/src/scripts/test_queue_schema_migration.ts` and ensure columns are verified/added successfully.

---

### Task 2: Cloud Sync Integration in `tabibiSyncService.ts`

**Files:**
- Modify: `D:/Application Web/Tabibi_Rect/server/src/services/tabibiSyncService.ts`
- Test: `D:/Application Web/Tabibi_Rect/server/src/scripts/test_queue_sync_service.ts`

**Interfaces:**
- Consumes: `settingapointements` columns and `WebTabibi` `/api/doctors/upload` endpoint.
- Produces: Updated schedule payload containing shift & queue config; bidirectional appointment sync with `TokenNumber`, `ShiftType`, `EstimatedTime`, `IsEmergency`, and `QueueStatus`.

- [ ] **Step 1: Write test script `test_queue_sync_service.ts`**
Verify schedule payload generation and appointment mapping logic with queue fields.

- [ ] **Step 2: Update `uploadDoctorScheduleToCloud` in `tabibiSyncService.ts`**
Include `booking_mode`, `shift_mode`, `morning_start`, `morning_end`, `morning_capacity`, `evening_start`, `evening_end`, `evening_capacity`, and `allow_overbooking` in the cloud payload.

- [ ] **Step 3: Update `syncAppointmentsWithCloud` in `tabibiSyncService.ts`**
Handle `TokenNumber`, `ShiftType`, `EstimatedTime`, `IsEmergency`, and `QueueStatus` during both download and upload stages.

- [ ] **Step 4: Run test script**
Verify that payloads correctly serialize and deserialize queue fields without regressions.

---

### Task 3: Backend Routes in `settings.ts` and `appointments.ts`

**Files:**
- Modify: `D:/Application Web/Tabibi_Rect/server/src/routes/settings.ts`
- Modify: `D:/Application Web/Tabibi_Rect/server/src/routes/appointments.ts`
- Test: `D:/Application Web/Tabibi_Rect/server/src/scripts/test_queue_backend_routes.ts`

**Interfaces:**
- Consumes: Database connection pool and request bodies.
- Produces: API endpoints `/api/settings/doctor` (GET & PUT) and `/api/appointments` (GET, POST, PATCH).

- [ ] **Step 1: Update `server/src/routes/settings.ts`**
Update `GET /api/settings/doctor` and `PUT /api/settings/doctor` to load and save `BookingMode`, `ShiftMode`, `MorningStart`, `MorningEnd`, `MorningCapacity`, `EveningStart`, `EveningEnd`, `EveningCapacity`, and `AllowOverbooking`.

- [ ] **Step 2: Update `server/src/routes/appointments.ts`**
Update `GET /api/appointments/settings` to return queue settings. Update `POST /api/appointments` to accept and auto-assign token numbers when in queue mode. Update `PATCH /api/appointments/:id/status` to handle `QueueStatus`.

- [ ] **Step 3: Write and run verification script `test_queue_backend_routes.ts`**
Ensure settings update and appointment creation handle queue parameters properly.

---

### Task 4: Frontend Doctor Settings in `DoctorSettingsModal.tsx`

**Files:**
- Modify: `D:/Application Web/Tabibi_Rect/client/src/components/settings/DoctorSettingsModal.tsx`

**Interfaces:**
- Consumes: Doctor settings API (`/api/settings/doctor`).
- Produces: UI in Tab 7 for selecting Booking Mode (Time Slots vs Queue Numbers), Shift Mode (Single vs Two Shifts), Shift times, Capacities, and Emergency Overbooking.

- [ ] **Step 1: Add state variables and hydration for dual booking settings**
Add state for `bookingMode`, `shiftMode`, `morningStart`, `morningEnd`, `morningCapacity`, `eveningStart`, `eveningEnd`, `eveningCapacity`, `allowOverbooking`. Hydrate from `/api/settings/doctor` response.

- [ ] **Step 2: Build UI controls in Tab 7 (Appointment Setting)**
Add segmented button/radio controls for Booking Mode and Shift Mode with Arabic & French labels, inputs for hours and capacities, and emergency overbooking toggle.

- [ ] **Step 3: Include queue settings in `handleSaveAll` payload**
Ensure `appointmentSettings` sent in PUT `/api/settings/doctor` includes all new fields.

---

### Task 5: Frontend Waiting Room Views in `Tabibi_Rect`

**Files:**
- Modify: `D:/Application Web/Tabibi_Rect/client/src/components/calendar/WaitingTableView.tsx`
- Modify: `D:/Application Web/Tabibi_Rect/client/src/components/calendar/WaitingScreenView.tsx`

**Interfaces:**
- Consumes: Appointment list with `TokenNumber`, `ShiftType`, `EstimatedTime`.
- Produces: Visual ticket badge `#XX` in `WaitingTableView.tsx`, and prominent Current/Next ticket display on the Waiting Screen TV (`WaitingScreenView.tsx`).

- [ ] **Step 1: Update `WaitingTableView.tsx`**
Display prominent ticket number badges (e.g. `دور #05` / `Ticket #05`), shift type tag, and estimated consultation time.

- [ ] **Step 2: Update `WaitingScreenView.tsx`**
Display current ticket in consultation and next waiting ticket in large TV-friendly badges.

- [ ] **Step 3: Verify build and components**
Run `npm run build` or TypeScript compile check in `Tabibi_Rect` to guarantee zero syntax or type errors.
