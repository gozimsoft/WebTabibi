---
id: "call-patient-introuvable"
title: "Emergency Reflex Scenario: Patient Missing from Search or Accidental Duplicate Creation"
category: "le-medecin-appelle"
tags: ["emergency-call", "emergency", "patient", "search", "duplicate", "merge", "support-l1"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaire", "medecin"]
symptoms_doctor:
  - "The patient has been visiting for years and now their name yields zero results in search!"
  - "The secretary created a duplicate profile and all historical consultations are missing"
  - "I have two separate files for the same individual, how do I merge them safely?"
keywords: ["missing patient", "duplicate profile", "phone lookup", "dossier merge", "archive", "rapid support"]
escalation_threshold: "Patient identity database anomaly requiring forensic manual SQL deduplication."
muraqib_ref: null
---

# Emergency Reflex Scenario: Patient Missing from Search or Duplicate Profile

> 🚨 **Level 1 Telephonic Emergency Protocol (Reflex Checklist)**
> Deployed when a physician or secretary experiences distress, suspecting that a patient file or clinical history was erased!

---

## 1. What Support Must Say in the First 10 Seconds to De-escalate
> 📞 *"Hello! Don't worry at all—TABIBI never permanently deletes patient files. The record is 100% safe in the database. Most often, this is simply due to a minor spelling variation or an archived profile. We will retrieve the file together within one minute."*

---

## 2. Three Rapid Search Techniques to Recover the File Instantly
1. **Search by Mobile Phone Number:**
   - Rather than typing names (which frequently diverge in spelling, accents, or transliterations), instruct the operator to type the last 6 digits of the patient's mobile number into the global search bar.
2. **Enable "Include Archived Records":**
   - If the patient has not visited the practice in years, their profile may have shifted into dormant archive status.
   - Access the Patients Directory and toggle **"Include Archived"**.
3. **Lookup by Date of Birth:**
   - Filter by year and month of birth in the advanced directory drawer.

---

## 3. Resolving Duplicate Profiles (Dossier Merging)
If front desk staff accidentally created a blank secondary file:
1. Open **"Patients Directory"**.
2. Select both duplicate files and click **"Merge Dossiers (Fusionner)"**.
3. Nominate the original historical profile as the **"Master Destination File"**.
4. TABIBI autonomously migrates all encounters, prescriptions, and radiology scans into the master dossier, soft-deleting the duplicate with zero data loss!

---

## 4. Diagnostic & Troubleshooting Matrix
| Observed Problem | Probable Cause | Immediate Remedy |
| :--- | :--- | :--- |
| Patient yields zero results | Spelling transliteration mismatch | Search by phone number or toggle "Include Archived" |
| Past visits vanished from view | User opened the newly created duplicate file | Merge the two dossiers using the official merge utility |
| Warning "Phone number already exists" | Shared family phone number (parent & children) | Check "Permit shared household phone" in prompt |

---

## 5. Escalation to Level 2
- Escalate if the profile remains undiscovered via phone number, national ID, or birthdate queries.
- Escalate when merging dossiers with complex multi-year attachments requiring manual index audits.
