---
id: "rec-enregistrement-attente"
title: "Rapid Patient Check-In & Waiting Room Triage (Front Desk & Reception)"
category: "reception"
tags: ["reception", "secretary", "check-in", "waiting-room", "registration", "priority"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaire"]
symptoms_doctor:
  - "How do I check in a walk-in patient who arrived without an appointment?"
  - "How do I mark a patient as an urgent priority so they bypass the waiting line?"
  - "The patient left before seeing the doctor, how do I remove them from the queue?"
keywords: ["reception", "check-in", "waiting room", "walk-in", "emergency", "front desk"]
escalation_threshold: "Front desk UI unresponsive or database failure during patient check-in."
muraqib_ref: null
---

# Rapid Patient Check-In & Waiting Room Triage

## 1. Objective
Guide front desk administrative staff in receiving clinic visitors, validating demographics, checking them into the active waiting queue, and managing consultation priority with operational fluidity.

## 2. Where to Find the Feature
- **Front Desk Dashboard:** Main view **"Reception & Waiting Room"**.
- **Quick Check-In Button:** Prominent green button **"+ New Patient Check-In"** or keyboard shortcut **`F2`**.
- **Active Waiting Columns:** Structured columns: *"Waiting"*, *"In Consultation"*, and *"Completed"*.

## 3. Step-by-Step Procedure
### A. Check-in Scheduled Patient
1. On patient arrival, locate their booking in today's scheduled agenda.
2. Click **"Check In"**.
3. Patient transitions to the *Waiting* column with an exact arrival timestamp.

### B. Registering Walk-in / Unscheduled Patients
1. Click **"+ New Patient Check-In"** (or press `F2`).
2. Input core demographic identifiers: First Name, Last Name, Date of Birth, Phone Number.
3. Click **"Save & Send to Waiting Room"**.
4. The patient appears immediately in the waiting column and syncs to the practitioner's screen.

### C. Elevating Urgent Emergency Priority
1. If a patient presents acute clinical distress requiring immediate attention:
2. Right-click the patient card and select **"Mark as Urgent Emergency"**.
3. The card turns crimson red and leaps to the head of the queue with an alert banner on the physician terminal.

## 4. What the Secretary Should See on Screen
- A live statistics widget: Total patients currently waiting, elapsed average waiting duration, and consultations completed.
- Each queue card displays: Full Name, Assigned Practitioner, Reason for Visit, and Check-In time.
- Contextual card shortcuts: Call Patient, Cancel / Departed, Collect Payment, or View Medical File.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Hello! To register a patient who just walked in, click the green 'New Patient Check-In' button or hit F2. Enter their name and phone number, then click 'Send to Waiting Room'. They will instantly appear on the doctor's monitor in their arrival order."*

## 6. Technical Verification (Level 2)
- [ ] Inspect database table `waiting_room`: Validate enum integrity in `status` column (`WAITING`, `IN_PROGRESS`, `DONE`, `CANCELLED`).
- [ ] Confirm clock synchronization between front-desk client and server machine to guarantee valid wait times.
- [ ] Verify UI rendering performance with high volume queues (50+ records).

## 7. Advanced Diagnostics & System (Level 3)
If cards freeze or fail to transition across columns:
1. Verify WebSocket persistence between frontend client and local Node.js daemon.
2. Inspect server response on `PATCH /api/waiting-room/:id/status`.
3. Check for SQL database deadlocks on the active queue tables.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Secretary unable to drag or transition cards with "Sync error" dialog.
- **Escalate to L3:** Total network loss preventing the front desk terminal from creating or updating records.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Patient left before consultation | Visit cancelled | Right-click card and select "Patient Left / Cancel" to clear from queue |
| Typo in patient surname during quick check-in | Hurried input | Double click card, correct spelling in drawer, and save |
| Patient in waiting room but invisible to doctor | Patient mistakenly assigned to another clinic doctor | Reassign target doctor from the card's practitioner dropdown |
