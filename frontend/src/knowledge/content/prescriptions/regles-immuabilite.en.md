---
id: "presc-immuabilite"
title: "Prescription Immutability Rules & Medico-Legal Protection"
category: "prescriptions"
tags: ["prescription", "immutability", "medico-legal", "security", "closure", "audit-trail"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "tech", "compliance"]
symptoms_doctor:
  - "I want to correct a dosage on a prescription issued yesterday"
  - "Why are the edit and delete buttons locked on this prescription?"
  - "The pharmacist called to change a medication, how do I edit the existing paper?"
keywords: ["protection", "lock", "immutable prescription", "digital signature", "tamper-proof", "audit"]
escalation_threshold: "Direct request to manually alter database prescription tables (strictly forbidden without legal addendum)."
muraqib_ref: null
---

# Prescription Immutability Rules & Medico-Legal Protection

## 1. Objective
Explain the foundational medico-legal principle in TABIBI: Once a prescription is officially validated, printed, or the encounter closed, it becomes digitally immutable. Retroactive edits or deletions are strictly blocked to provide total legal and forensic protection for the physician and clinic.

## 2. Where to Find the Feature
- **Validated Prescription:** Prescription tab within patient dossier or closed consultation screen > Displays a distinctive badge **"Validated Prescription - Locked 🔒"**.
- **Addendum / Correction:** Action button **"Create Prescription Addendum (Avenant)"** or **"Renew Prescription"**.

## 3. Step-by-Step Procedure
1. When a doctor must revise a drug regimen after handing the printed prescription:
2. Open Patient Record > Navigate to **"Prescriptions History"**.
3. Select the locked prescription and click **"Create Addendum"**.
4. The system clones all existing lines into a new revision linked to the parent record, formatted as `REF-2026-XXXX-A1`.
5. The doctor updates dosages or substitutes molecules, entering the clinical rationale (e.g., pharmacy consultation, acute drug allergy).
6. Print the addendum for the patient while the original remains tamper-proof in the legal audit log.

## 4. What the Doctor Should See on Screen
- The closed prescription appears with a protected background; "Delete" and "Edit" action buttons are completely disabled.
- A cryptographic integrity verification hash (SHA-256) is displayed at the bottom of the document.
- A prominent green action button reads: **"Create Official Addendum"**.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, TABIBI is engineered strictly under healthcare compliance standards to protect your liability. Once printed or finalized, a prescription is an official legal record and cannot be rewritten retroactively. To adjust a dosage or replace a drug safely, click 'Create Addendum'—it immediately opens a linked corrective prescription with full audit compliance."*

## 6. Technical Verification (Level 2)
- [ ] Query table `prescriptions`: Verify `IsLocked = 1` and timestamps `PrintedAt` or `ClosedAt` are populated.
- [ ] Verify the cryptographic record `SignatureHash` verifying document authenticity.
- [ ] Reject any request to execute manual SQL `UPDATE` queries on locked prescription records.

## 7. Advanced Diagnostics & System (Level 3)
If a software glitch prematurely locks a prescription before the initial print cycle (due to abrupt power failure):
1. Inspect `audit_logs` to identify the lock trigger condition.
2. If the clinical consultation remains open and no physical copy was ever produced, L3 support may utilize the administrative unlock protocol with documented justification.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Physician needs immediate telephone guidance to issue an addendum and cannot locate the action button.
- **Escalate to L3:** Digital signature generation failure preventing document rendering.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Standard Resolution |
| :--- | :--- | :--- |
| Doctor insists on completely erasing a wrong drug from historical logs | Unawareness of legal consequences of retroactive record tampering | Explain legal liabilities and use the "Revoke with Reason" workflow |
| Pharmacist questions the addendum document | Addendum lacked reference to original prescription | Print official addendum which explicitly states "Addendum to Rx #XXX dated YYY" |
| QR Code verification fails to scan | Low printer DPI or fading toner | Clean print heads or increase print contrast in TABIBI print preferences |
