---
id: "pat-archivage-dormance"
title: "Patient Archiving, Dormancy Status and Medico-Legal Retention Compliance"
category: "patients"
tags: ["patients", "archiving", "dormant", "soft-delete", "retention", "security", "privacy"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "gestionnaire", "medecin"]
symptoms_doctor:
  - "How do I hide a patient who hasn't visited in 5 years without deleting their medical records?"
  - "I accidentally archived a patient file, how do I restore it?"
  - "Can a patient dossier be permanently deleted from the SQL database?"
keywords: ["archiving", "dormant", "restore", "soft delete", "medical secrecy", "retention"]
escalation_threshold: "Direct request for physical database record purging or recovering corrupted archived assets."
muraqib_ref: null
---

# Patient Archiving, Dormancy Status and Medico-Legal Retention

## 1. Objective
Explain patient record archiving (Dormant status) and safe Soft Deletion architecture, safeguarding clinics against catastrophic data loss and maintaining compliance with healthcare retention regulations while enabling single-click reactivation.

## 2. Where to Find the Feature
- **Inside Patient Record:** Action Menu > File options > **"Archive Patient File"**.
- **Archive Management:** Sidebar > Patients Directory > Toggle filter **"Include Archived Records"**.
- **Restoration Action:** Inside archived profile > Green button **"Unarchive & Restore File"**.

## 3. Step-by-Step Procedure
### A. Archiving an Inactive Patient File
1. Open the target patient record.
2. Select File Options and click **"Archive File"**.
3. Choose justification reason (Relocated, Inactive > 5 years, Patient Deceased).
4. Confirm: The profile is instantly hidden from standard daily searches, speeding up search autocomplete and reducing interface clutter.

### B. Searching and Restoring an Archived File
1. In the Patient Directory, enable the toggle **"Include Archived"**.
2. Search by name or phone: The record appears badged with a grey *"Archived"* label.
3. Open record and click **"Restore to Active Status"**.
4. The file instantly returns to daily active rosters with 100% of historical visits, prescriptions, and media intact.

## 4. What the User Should See on Screen
- An archived file opens in read-only mode, with a distinct grey hue and top banner indicating archived status.
- Standard search dropdowns omit archived profiles by default to keep daily operations lean and fast.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, TABIBI never performs permanent physical file deletions, ensuring complete protection of your legal liability and patient history. When you want to hide an inactive patient, select 'Archive File'. They will be hidden from daily lookups, but you can retrieve their full history and reactivate them at any time with a single click."*

## 6. Technical Verification (Level 2)
- [ ] Verify database schema in table `patients`: Validate fields `is_archived = 1` and `archived_at` with reason string.
- [ ] Confirm daily search queries append predicate: `WHERE is_archived = 0`.
- [ ] Strictly refuse manual execution of `DELETE FROM patients` SQL operations.

## 7. Advanced Diagnostics & System (Level 3)
If clinic requests offloading dormant data to conserve physical NVMe disk space:
1. Utilize Muraqib database export tools to migrate archived partitions into an external read-only cold store (`tabibi_archive.db`).
2. Retain verified cryptographic backups of all attached media matching statutory health record retention guidelines.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Bulk restoration required for a cohort of files mistakenly archived on a specific date.
- **Escalate to L3:** Formal legal subpoena requiring forensic data export of a deceased patient's records.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Patient returns after years, missing from standard search | File flagged as dormant archive | Toggle "Include Archived" in search drawer and click Restore |
| Do thousands of archived files degrade app speed? | Optimized indexing | No, SQL indexes specifically partition active vs archived entries |
| Error when attempting to archive active patient | Patient currently queued in waiting room | Complete or cancel today's queued encounter prior to archiving |
