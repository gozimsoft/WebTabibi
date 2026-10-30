---
id: "cons-pause-reprise"
title: "Pausing and Resuming a Consultation (Emergency & Multi-tasking Management)"
category: "consultations"
tags: ["consultation", "pause", "resume", "emergency", "multitask", "autosave"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "tech"]
symptoms_doctor:
  - "An emergency arrived and I need to attend without losing current patient notes"
  - "How do I return to the consultation I paused earlier?"
  - "Will the prescription draft be lost if I switch to another patient?"
keywords: ["pause", "resume", "emergency", "draft", "autosave", "multitask"]
escalation_threshold: "Loss of clinical notes upon resuming a paused consultation or UI freeze."
muraqib_ref: null
---

# Pausing and Resuming a Consultation (Emergency Management)

## 1. Objective
Allow the practitioner to handle an incoming emergency or urgent interruption without losing any clinical notes or prescription items entered for the current patient, resuming seamlessly later.

## 2. Where to Find the Feature
- **Pause Button:** Top-right corner of consultation screen > Yellow button **"Pause Consultation"** (or keyboard shortcut `F9`).
- **Paused Encounters List:** Top quick banner or waiting room grid marked with **"Paused ⏸️"**.
- **Resume Button:** Click the paused patient card > Blue button **"Resume Consultation"**.

## 3. Step-by-Step Procedure
1. While examining a patient, if an urgent case arrives:
2. Click **"Pause Consultation"** (or press `F9`).
3. The system instantly commits an atomic draft of all clinical observations, prescription drugs, and vitals.
4. The UI returns to the main waiting room, and the initial patient's status becomes *"Paused"*.
5. The doctor opens the emergency patient's record and administers urgent care.
6. When the initial patient returns, click their card and select **"Resume Consultation"**.
7. The system restores the encounter state exactly where it was left off.

## 4. What the Doctor Should See on Screen
- On pause: A floating notification states: *"Draft saved and consultation paused successfully"*.
- In waiting room: An amber tag displays next to the patient's name indicating paused duration.
- On resume: Instant restoration of all typed text, vitals, and selected drugs with continuous timer tracking.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Don't worry Doctor, simply click 'Pause Consultation' at the top or hit F9. All your notes are automatically secured in the database as an encrypted draft. You can attend to the emergency immediately, then click 'Resume' to pick up right where you left off without any loss of data."*

## 6. Technical Verification (Level 2)
- [ ] Verify in table `consultations` or `diagnostics` that `IsPaused = 1` or `Status = 2`.
- [ ] Confirm presence of the temporary draft payload in `consultation_drafts` for the given `PatientId`.
- [ ] Verify there is no concurrency conflict if the doctor operates across multiple monitors.

## 7. Advanced Diagnostics & System (Level 3)
If a doctor reports blank fields after resuming:
1. Check local session persistence (Local Storage / SQLite session store).
2. Inspect server response to `POST /api/consultations/:id/pause` to verify there was no network timeout during draft write.
3. Recover the latest snapshot from the continuous logging table `auto_save_log`.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** "Resume" button consistently absent from waiting room cards despite paused flag.
- **Escalate to L3:** Corrupted draft JSON payload causing rendering exceptions upon restoration.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Probable Cause | Action |
| :--- | :--- | :--- |
| Paused patient vanished from waiting room | Status mistakenly altered by reception staff | Filter by "Active Patients Today" and click Resume |
| Alert "Another consultation is active" when opening new patient | Doctor attempted to open next patient without pausing the first | Click "Pause Current & Start New" in prompt dialog |
| Prescription empty upon resume | Cancel button was clicked instead of Pause | Retrieve draft items from Auto-Save History dialog |
