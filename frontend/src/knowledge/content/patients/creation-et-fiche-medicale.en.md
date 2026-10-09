---
id: "pat-creation-fiche"
title: "Patient File Creation, Multi-Criteria Lookup and Medical Identity Card"
category: "patients"
tags: ["patients", "creation", "search", "medical-file", "phone", "national-id", "demographics"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaire", "medecin"]
symptoms_doctor:
  - "How do I search for a patient when I only remember their phone number?"
  - "What are the mandatory fields required by the system to open a new file?"
  - "The system alerts that a patient with the same name already exists, what should I do?"
keywords: ["patient file", "quick search", "phone number", "date of birth", "identity card", "duplicate"]
escalation_threshold: "Inability to create patient records or global search engine retrieval failure."
muraqib_ref: null
---

# Patient File Creation, Multi-Criteria Lookup and Medical Identity Card

## 1. Objective
Enable clinical and administrative teams to create new patient records swiftly and accurately, prevent duplicate dossiers, and retrieve existing records instantly by name, phone number, or national health ID.

## 2. Where to Find the Feature
- **Global Search Bar:** Always available at the top of the interface (shortcut `Ctrl + F` or `Ctrl + K`).
- **New Patient Button:** Sidebar navigation > **"Patients Directory"** > Green action button **"+ New File"**.
- **Active Patient Profile:** Header banner displaying demographics, medical history, and clinical encounters.

## 3. Step-by-Step Procedure
### A. Searching for an Existing Record
1. In the top global search bar, type part of the surname, given name, or mobile phone number.
2. Results filter instantaneously as you type.
3. Clicking on a record immediately loads their clinical profile.

### B. Creating a New Patient Record
1. Click **"+ New File"**.
2. Complete mandatory demographic fields:
   - **First & Last Name** (in Latin or Arabic script).
   - **Date of Birth** (the system automatically derives and updates precise age).
   - **Gender** (Male / Female).
   - **Mobile Phone Number** (essential for automated appointment notifications).
   - **Blood Group** (if known).
3. Automated Duplicate Check: If an existing patient matches name and birthdate, a warning flags: *"A patient with matching demographics already exists; would you like to review their file to avoid duplication?"*.
4. Click **"Save Record"**.

## 4. What the Doctor Should See on Screen
- A persistent demographic banner showing: Name, Age, Gender, Blood Type, and unique Record ID.
- Prominent clinical alert badges: Severe Allergies (Red), Chronic Illnesses (Amber), Pregnancy (Pink).
- Chronological timeline of all historical encounters, prescriptions, and laboratory reports.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Hello! To find any patient, just type their phone number or part of their name into the top search bar. To create a new file, click '+ New File', fill in the name, date of birth, and phone number. TABIBI will automatically check for existing profiles to prevent duplicate files in your clinic."*

## 6. Technical Verification (Level 2)
- [ ] Inspect database table `patients`: Mandatory non-null columns `first_name`, `last_name`, and `birth_date`.
- [ ] Verify query indexes on columns `phone`, `national_id`, and `file_number`.
- [ ] Verify case-insensitive, diacritic-agnostic search collation.

## 7. Advanced Diagnostics & System (Level 3)
If global search hangs or errors during patient creation:
1. Verify uniqueness constraint integrity on `file_number`.
2. Inspect backend search controller and verify `SELECT * FROM patients WHERE ... LIKE` query plans.
3. Check for invalid characters or encoding failures in UTF-8 multi-byte name strings.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Clinic requests merging two duplicate records while transferring all visits to the parent file.
- **Escalate to L3:** Fatal database error preventing auto-generation of sequential record numbers.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Patient is a newborn without personal phone | Infant profile | Record mother's or father's mobile number in phone field |
| Calculated age appears inaccurate | Typo in birth year | Edit date of birth on patient demographics tab and save |
| Two files created for the same individual | Spelling variation (e.g. Belkacem vs Belkassem) | Use "Merge Duplicate Records" administrative utility to unify history |
