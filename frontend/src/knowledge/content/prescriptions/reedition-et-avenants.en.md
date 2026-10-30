---
id: "presc-reedition-avenants"
title: "Prescription Re-issue, Duplicata Copies and Addenda Generation"
category: "prescriptions"
tags: ["prescription", "duplicata", "addendum", "printing", "loss", "reissue"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaire", "medecin"]
symptoms_doctor:
  - "The patient lost their prescription and requests another copy"
  - "Can the secretary reprint a prescription without accessing clinical exam notes?"
  - "How do I print a copy watermarked with 'Duplicata' to prevent fraudulent pharmacy dispensing?"
keywords: ["duplicate", "lost prescription", "reprint", "addendum", "pharmacy"]
escalation_threshold: "Unable to print duplicata copy or print engine rendering exception."
muraqib_ref: null
---

# Prescription Re-issue, Duplicata Copies and Addenda Generation

## 1. Objective
Enable the medical clinic (physician or authorized administrative secretary) to reissue a prescription for a patient who misplaced the original, automatically watermarked as "DUPLICATA" to prevent unauthorized multiple dispensing at pharmacies.

## 2. Where to Find the Feature
- **From Patient Record:** Patient dossier > **"Prescriptions & Documents"** tab > Select item > **"Print Duplicata"**.
- **From Front Desk (if permission granted):** Patient Quick Search > Action menu > **"Print Duplicate Rx"**.
- **Addendum Button:** Inside closed prescription viewer > Action button **"Create Addendum"**.

## 3. Step-by-Step Procedure
### A. Printing a Duplicata Copy
1. Search patient by full name, phone number, or national ID.
2. Open record and access the **"Prescriptions"** tab.
3. Select the target prescription by date and prescribing doctor.
4. Click the print options dropdown and choose **"Print Duplicata"**.
5. The system automatically superimposes a watermark and header stating: *"DUPLICATA - Certified Copy of Original"*, recording reprint date, time, and operator user ID.
6. Send job to the configured printer.

### B. Issuing a Clinical Addendum
1. If the physician needs to modify an active therapeutic line:
2. Click **"Create Addendum"**: A linked draft is instantiated containing the initial items.
3. Amend items (cancel, adjust posology, add supplementary drug).
4. Click **"Validate Addendum & Print"**.

## 4. What the Doctor and Secretary Should See on Screen
- In print preview: A translucent diagonal watermark reading **"DUPLICATA"** across the page.
- In audit trail: A dedicated log line: *"User X reprinted a Duplicata copy of Prescription Y on timestamp Z"*.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"If a patient lost their prescription, open their file, go to the Prescriptions tab, and click 'Print Duplicata'. The system prints an exact official replica with a legally compliant watermark and timestamp, protecting your practice against unauthorized repeat dispensing at the pharmacy."*

## 6. Technical Verification (Level 2)
- [ ] Verify that print events are logged in table `print_logs` with document type `DUPLICATA`.
- [ ] Inspect RBAC permissions: Does the secretary role possess the `can_print_duplicata` capability?
- [ ] Verify print template integrity in `prescription_template.frx` or Chromium headless PDF engine.

## 7. Advanced Diagnostics & System (Level 3)
If a blank page is produced during printing:
1. Check the local PDF rendering subsystem (Chromium Print Engine).
2. Ensure standard system fonts (Cairo, Arial) are available in the Windows font cache.
3. Verify write permissions on temp spool directory `%AppData%/Tabibi/temp_print`.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Secretary receives "Insufficient permissions" dialog despite doctor authorization.
- **Escalate to L3:** Crash or fatal failure in print spooler service (`winspool.drv`).

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Patient refuses Duplicata watermark | Fear of pharmacy refusal | Explain it is the legal standard and validates clinic issuance |
| Date displays today's date instead of consultation date | Incorrect template selection | Duplicata template displays both: original consultation date and reprint date |
| Printer spits blank paper | Out of ink or driver spooler error | Run Windows printer self-test page to verify hardware |
