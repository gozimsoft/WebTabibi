---
id: "rdv-conflits-doublons"
title: "Schedule Conflict Resolution & Duplicate Booking Detection"
category: "rendez-vous"
tags: ["appointment", "conflict", "overlap", "duplicate", "time-slot", "alert"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaire"]
symptoms_doctor:
  - "Two patients were booked at the exact same hour and minute"
  - "The software does not alert when booking the same patient twice"
  - "How do I prevent booking appointments outside working hours?"
keywords: ["conflict", "duplicate appointment", "slot overlap", "calendar", "overbooking"]
escalation_threshold: "Bypass of slot collision engine allowing unintended concurrent bookings in database."
muraqib_ref: null
---

# Schedule Conflict Resolution & Duplicate Booking Detection

## 1. Objective
Explain the collision detection engine in TABIBI's appointment scheduler, designed to prevent overlapping bookings for the same practitioner and detect accidental duplicate appointments for the same patient.

## 2. Where to Find the Feature
- **Calendar & Appointments Module:** Menu **"Appointments & Agenda"** > Day or Week grid view.
- **New Booking Modal:** Visual collision alert (amber warning or hard stop) triggers immediately upon selecting an occupied slot.

## 3. Step-by-Step Procedure
1. When the secretary attempts to place a booking in an occupied slot:
2. The system checks boundary ranges (`StartTime` and `EndTime`).
3. If collision is detected, a modal warns: *"Warning: Dr. [Name] already has a confirmed appointment with [Patient Name] during this slot"*.
4. Two paths are offered:
   - **Suggest Next Available Slot:** The engine automatically finds the nearest open window.
   - **Exceptional Overbooking:** Allowed only if the user possesses the required permission and with doctor consent.
5. If the patient already has a future booking scheduled, an alert indicates: *"This patient already holds an appointment on [Date]; do you wish to reschedule or add an additional visit?"*.

## 4. What the Secretary Should See on Screen
- On the grid view: Occupied slots render in solid grey/blue cards; available slots remain crisp white.
- In overbooking situations: Conflicting cards render side-by-side bordered by an amber warning flag.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Hello! TABIBI's agenda is designed to prevent scheduling collisions. When the conflict warning appears, click 'Suggest Next Available Slot' and the system will automatically locate the doctor's next free opening, or you can choose an exceptional overbooking if the doctor gave authorization."*

## 6. Technical Verification (Level 2)
- [ ] Check clinic global settings: Is `allow_overbooking` enabled or disabled?
- [ ] Inspect default consultation duration (`default_slot_duration`, typically 15–30 minutes).
- [ ] Ensure soft-deleted appointments (`IsDeleted = 1`) are not mistakenly holding slots due to filter failure.

## 7. Advanced Diagnostics & System (Level 3)
If unhandled overlaps occur without warning:
1. Verify system timezone alignment between Windows OS and Node.js environment.
2. Audit backend verification logic `checkSlotAvailability()` confirming: `start < existingEnd AND end > existingStart`.
3. Check SQL database indexing on `appointments (DoctorId, StartTime, EndTime)` to ensure sub-millisecond query responses.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Clinic requests restricting overbooking authority strictly to practitioner accounts.
- **Escalate to L3:** Calendar algorithm defect permitting infinite overlapping entries.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Appointment shifts to previous day | Timezone mismatch between server and client | Set Windows system timezone to Algeria Standard Time (GMT+1) |
| Cannot book on Friday | Friday designated as clinic closing day in settings | Open Settings > Practice Hours > enable Friday slots if necessary |
| Deleted appointment does not free slot | Stale calendar UI cache | Click circular refresh button or toggle day/week view |
