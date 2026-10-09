---
id: "med-recherche-dci-posologies"
title: "Drug Formulary Search (DCI & Brand Names), Standard Posologies and Interaction Alerts"
category: "medicaments"
tags: ["medication", "dci", "posology", "allergy", "interactions", "formulary", "safety-alerts"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecin"]
symptoms_doctor:
  - "I search by trade brand name and the drug does not appear in the results"
  - "How do I get alerted if a patient is allergic to Penicillin while prescribing?"
  - "I want to save a custom default posology to avoid retyping the same text daily"
keywords: ["medication", "DCI", "allergy", "drug interaction", "dosage", "generic"]
escalation_threshold: "National formulary database corruption or search indexing engine failure."
muraqib_ref: null
---

# Drug Formulary Search, Posologies and Safety Alerts

## 1. Objective
Instruct physicians on leveraging TABIBI's integrated national pharmacopeia (aligned with the Algerian National Drug Nomenclature), searching across brand names and international nonproprietary names (DCI), and configuring automated cross-allergy and drug interaction shields.

## 2. Where to Find the Feature
- **During Consultation:** Tab **"Prescription"** > Quick medication search bar (top of prescription grid).
- **General Drug Formulary:** Sidebar navigation > **"Medications & Nomenclature"** to explore items, forms, and clinical equivalents.

## 3. Step-by-Step Procedure
### A. Searching and Prescribing a Drug
1. Type the first 3 letters of a drug name (Brand name such as `Augmentin` or generic DCI such as `Amoxicilline`).
2. The dynamic search dropdown displays matching entries with galenic formulations (tablets, syrup, vials) and dosages.
3. Click target item: The system auto-populates the standard posology template (e.g., `1 tablet 3 times daily for 7 days`).
4. The doctor can modify posology with a single click or select from a personal favorites library.

### B. Intelligent Allergy Warning Engine
1. If the patient has a documented allergy on file (e.g., Penicillins):
2. When the physician selects a molecule within that cross-reactive class, a prominent red warning flashes: *"CRITICAL ALERT: Patient has documented hypersensitivity to Penicillins"*.
3. Adding the item is blocked unless the doctor explicitly clicks **"Override Warning with Clinical Justification"**.

## 4. What the Doctor Should See on Screen
- Drug lookup cards display: Brand name, DCI molecule, galenic form, strength, and indicative pricing if available.
- Visual badge indicators designate drug categories (Antibiotic, Chronic maintenance, Controlled narcotic).
- Red interaction banner triggers if two co-prescribed items produce severe contraindications.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, you can search in the prescription field using either the commercial trade name or generic molecule (DCI). If a newly approved drug is not in your list, you can add it in seconds using 'Add Custom Drug' or refresh your complete nomenclature via Settings > Drug Database Update."*

## 6. Technical Verification (Level 2)
- [ ] Inspect database table `medicaments`: Confirm search indices on columns `trade_name` and `dci_name`.
- [ ] Audit `patient_allergies` relational mappings against classified `drug_classes`.
- [ ] Verify integrity of the master pharmacopeia database (`drugs_algeria_db.sqlite`).

## 7. Advanced Diagnostics & System (Level 3)
If medication search hangs or exhibits latency:
1. Verify Full-Text Search (FTS) index integrity.
2. Execute index rebuilding query: `REINDEX medicaments_fts`.
3. Check SQLite in-memory cache allocation limits.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Physician needs to import specialized formulary sets (e.g. Ophthalmology or Oncology protocols).
- **Escalate to L3:** Fatal exception in interaction analysis engine preventing prescription rendering.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Drug exists but required dosage strength missing | Specific strength unindexed in base nomenclature | Click "Custom Strength" and manually adjust strength field |
| Persistent false allergy alert for patient | Erroneous allergy recorded in historical record | Open Patient Profile > Medical History > Delete or revise allergy entry |
| Order of items on prescription sheet is inconvenient | Default order follows selection chronological order | Use drag-and-drop handles to reorder items prior to printing |
