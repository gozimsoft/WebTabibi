---
id: "cons-cycle-de-vie"
title: "Clinical Consultation Lifecycle (Opening, Clinical Flow, Final Closure)"
category: "consultations"
tags: ["consultation", "lifecycle", "closure", "read-only", "archiving"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "onboarding", "tech"]
symptoms_doctor:
  - "I cannot edit yesterday's consultation notes anymore"
  - "How do I officially complete the session with the patient?"
  - "The consultation tab is greyed out, why?"
keywords: ["closing", "locking", "history", "patient record", "close consultation"]
escalation_threshold: "Consultation cannot be closed despite validating all mandatory fields or database lock error."
muraqib_ref: null
---

# Clinical Consultation Lifecycle

## 1. Objective
Guide the physician through the complete clinical workflow of a patient encounter, from calling the patient from the waiting room to definitive closure and secure read-only archiving.

## 2. Where to Find the Feature
- **To Start:** Home Dashboard / Waiting Room Grid > Patient Card or Row > Green button **"Start Consultation"**.
- **During Consultation:** Main consultation screen with top status header and functional tabs (Reason, Exam, Acts, Documents, Prescription).
- **To Close:** Button **"Close Consultation"** located at the top-right or bottom-right corner.

## 3. Step-by-Step Procedure
1. Select the patient in the waiting room with status *"Waiting"* or *"Arrived"*.
2. Click **"Start Consultation"**: The system updates the patient status to *"In Consultation"* in real-time on the secretary's desk.
3. Complete the clinical sections:
   - **Chief Complaint & History of Present Illness**
   - **Physical Examination & Vital Signs** (Blood Pressure, Heart Rate, Weight, Temperature)
   - **Medical Acts / Confirmed Diagnoses**
   - **Attachments / Medical Imaging if needed**
   - **Prescription Generation**
4. Click **"Close Consultation"**: A confirmation modal prompts for validation.
5. Once confirmed, the consultation is archived, the prescription becomes immutable, and the record switches to read-only mode.

## 4. What the Doctor Should See on Screen
- Upon start: An unobtrusive encounter timer begins in the top bar.
- The patient indicator in the left sidebar turns into a pulsating green badge.
- After closure: A blue banner appears stating **"Consultation Closed - Read Only"**. All input controls become locked.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, once you click 'Close Consultation', the file is securely archived in compliance with medico-legal regulations to ensure data integrity. If you need to add late clinical notes, you can issue an addendum or start a follow-up review encounter."*

## 6. Technical Verification (Level 2)
- [ ] Check the database table `diagnostics`: The field `Status` must have value `1` (Closed) or `0` (In progress).
- [ ] Check if the encounter was opened by another practitioner (multi-practitioner concurrency lock).
- [ ] Confirm that the completion timestamp (`DateEnd` or `ClosedAt`) has been persisted.

## 7. Advanced Diagnostics & System (Level 3)
If the closure button fails to respond:
1. Open Developer Tools (`Ctrl + Shift + I` in Electron).
2. Inspect the Network tab for HTTP 400 or 500 errors on `PUT /api/consultations/:id/close`.
3. Common cause: A missing mandatory field or foreign key constraint violation (e.g., medical act without an assigned practitioner).

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** The doctor reports closing the consultation, but the patient remains "In Consultation" on the secretary's waiting room.
- **Escalate to L3:** Fatal SQL error blocking writes to the `diagnostics` table.

## 9. Frequently Asked Questions & Troubleshooting
| Observed Issue | Common Cause | Immediate Resolution |
| :--- | :--- | :--- |
| Message "Consultation already open elsewhere" | Record opened on another workstation | Close session on the other terminal or unlock via admin settings |
| Unable to edit prescription | Encounter has already been closed | Use "Addendum" feature or issue a renewal prescription |
| Encounter timer not displayed | Display setting disabled in preferences | Go to Settings > Display > enable "Show encounter timer" |
