---
id: "dent-actes-devis"
title: "Dental Clinical Acts Logging and Formal Estimates (Devis) Generation"
category: "dentaire"
tags: ["dental", "acts", "composites", "endodontics", "crowns", "quotes", "treatment-plan"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "dentiste", "secretaire"]
symptoms_doctor:
  - "How do I issue a formal price estimate (Devis) for a patient requiring multiple implants and crowns?"
  - "How do I link a performed dental act directly to the tooth on the odontogram?"
  - "I want to split an extensive treatment plan into multiple sessions and monitor progress per visit"
keywords: ["dental act", "price quote", "Devis", "prosthetics", "crowns", "treatment plan"]
escalation_threshold: "Calculation engine discrepancy in quotes or failure to render official Devis print sheets."
muraqib_ref: null
---

# Dental Clinical Acts Logging & Formal Estimates (Devis)

## 1. Objective
Manage restorative, endodontic, prosthetic, and surgical dental acts, linking them automatically to tooth numbers on the odontogram, and generating itemized clinical estimates (Devis) for patients and supplementary dental insurers prior to intervention.

## 2. Where to Find the Feature
- **Inside Dental Module:** Tab **"Acts & Treatment Plan"** docked adjacent to the odontogram.
- **Create Estimate Button:** Action button **"+ New Estimate (Devis)"**.
- **Print Action:** Print options menu > **"Print Certified Devis"**.

## 3. Step-by-Step Procedure
### A. Logging Performed Clinical Acts
1. Click the target tooth on the chart (e.g. Tooth 24).
2. Click **"+ Add Act"**.
3. Select procedure from dental fee nomenclature (e.g., *Bi-radicular Pulpectomy*).
4. System automatically populates standard baseline tariff (e.g., `4500 DZD`).
5. Flag act state: *«Completed Today»* to push to daily checkout, or *«Planned»* to stage in treatment schedule.

### B. Generating Formal Price Estimate (Devis)
1. For complex rehabilitations (Zirconia crowns, bridges, dental implants):
2. Click **"+ New Estimate"**.
3. Select indicated teeth and associated therapeutic acts.
4. Input applicable discounts, installment schedules, or lab costs if relevant.
5. Click **"Validate & Print Devis"**.
6. Once patient accepts terms, click **"Convert Devis to Active Treatment Plan"** with a single click.

## 4. What the Doctor Should See on Screen
- Structured tabular breakdown displaying: Tooth Number, Act Description, Quantity, Unit Tariff, and Net Sum.
- Embedded mini-odontogram thumbnail rendered within the official printed Devis header.
- Financial tracking progress bar: Total Plan Cost, Sum Settled, and Remaining Balance.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, to prepare an estimate, go to the 'Acts & Devis' tab and click '+ New Estimate'. Select the teeth and procedures, and TABIBI will compute the total automatically. You can print a pristine, branded Devis sheet featuring an odontogram diagram for the patient. Once approved, convert it to an active clinical plan in one click."*

## 6. Technical Verification (Level 2)
- [ ] Inspect database tables `dental_acts` and `dental_quotes` (Devis).
- [ ] Verify arithmetic validation across tax lines, discounts, and installment schedules.
- [ ] Verify PDF generation template integrity in `devis_template.html`.

## 7. Advanced Diagnostics & System (Level 3)
If remaining balance discrepancies arise on quotation ledgers:
1. Verify linked transaction records tied to `quote_id`.
2. Inspect conversion transaction logic when migrating Devis lines to active billing queues.
3. Audit ledger entries to prevent duplicate charge posting on re-opened visits.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Clinic requests bulk updating practice dental tariff schedules at year-end.
- **Escalate to L3:** Crash in PDF generation service when compiling multi-page complex prosthetic estimates.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Patient switched crown material choice | Plan revised | Open estimate, click "Edit Draft", update material act line, and reprint |
| Act listed without tooth number | General non-tooth act (e.g. Scaling & Prophylaxis) | Expected behavior; generalized procedures omit tooth number field |
| Estimate validity expired | Statutory timeline lapsed (e.g. 90 days) | Click "Renew Estimate" to refresh dates and active tariffs |
