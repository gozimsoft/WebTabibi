---
id: "cert-aptitude-dispense"
title: "Official Medical Certificates (Physical Aptitude, School/Work Dispensations, Sick Leave)"
category: "certificats-rapports"
tags: ["certificates", "aptitude", "dispensation", "sick-leave", "work-stoppage", "legal", "printing"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecin", "secretaire"]
symptoms_doctor:
  - "How do I print a sick leave certificate with days written out in words and numbers automatically?"
  - "I want to customize a physical fitness certificate template for competitive sports"
  - "Can I save custom certificate templates and trigger them with a single click?"
keywords: ["medical certificate", "sick leave", "fitness certificate", "dispensation", "print certificate"]
escalation_threshold: "Failure in official legal certificate generation or arithmetic errors in return-to-work date computing."
muraqib_ref: null
---

# Official Medical Certificates (Fitness, Dispensations & Sick Leave)

## 1. Objective
Allow the practitioner to generate and print standardized medico-legal certificates (Physical fitness, driving license evaluation, school sports dispensations, and certified medical rest / work stoppage orders) rapidly, with automated day conversion to words and resumption dates calculation.

## 2. Where to Find the Feature
- **During Consultation:** Tab **"Certificates & Letters"** > Action button **"+ New Medical Certificate"**.
- **Inside Patient Record:** Tab **"Documents & Certificates"**.
- **Template Selector:** Preset dropdown (Physical Aptitude, Sick Leave, Medical Attendance, Child Escort).

## 3. Step-by-Step Procedure
### A. Issuing a Work Stoppage / Sick Leave Certificate (Certificat de Repos)
1. Inside the certificates tab, select template **"Sick Leave / Work Stoppage"**.
2. Demographic fields auto-populate from the patient record (Full Name, Date of Birth).
3. Input prescribed rest duration in days (e.g., `7` days).
4. System automatically computes and formats:
   - Days in words: *"Seven (07) days"*.
   - Start date and expected return-to-work timestamp: *"Effective from [Date] with resumption of professional duties on [Date+7], barring complications"*.
5. Click **"Preview & Print"**.

### B. Issuing a Physical Aptitude Certificate
1. Select template **"Physical Aptitude"**.
2. Select target purpose: Competitive Soccer, Driving License Examination, or Employment dossier.
3. Standard clinical attestation loads: *"Does not present apparent clinical signs contraindicating..."*.
4. Click **"Print"**.

## 4. What the Doctor Should See on Screen
- A rich text editor allowing instant inline wording adjustments while preserving statutory phrasing.
- Real-time layout preview on practice letterhead showing logo, header, and official registration numbers.
- Checkbox to automatically commit a copy to the patient's permanent chronological archive.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, to issue any certificate, open the 'Certificates' tab and choose your template (Sick Leave or Fitness). Enter the number of rest days, and TABIBI will automatically spell out the days in words and compute the return-to-work date. You can print it directly on your clinic letterhead and keep a saved copy in the patient's history."*

## 6. Technical Verification (Level 2)
- [ ] Inspect database table `medical_certificates`: Columns `patient_id`, `cert_type`, `days_count`, `start_date`, and `end_date`.
- [ ] Validate accuracy of the number-to-words engine in French and Arabic.
- [ ] Verify statutory wording compliance with social security guidelines (CNAS / CASNOS regulations).

## 7. Advanced Diagnostics & System (Level 3)
If printed output exhibits truncated or overlapping text:
1. Validate CSS print styles for margins and paper dimensions (A4 / A5 half-sheet).
2. Check printer default DPI and printable area boundaries in Windows driver preferences.
3. Verify persistence of customized text edits inside database field `custom_text`.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Physician requests authoring a new specialized certificate template.
- **Escalate to L3:** Leap year date calculation defect causing invalid return-to-work projections.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Patient asks for diagnostic details on sick leave sheet | Violation of medical secrecy | Remind doctor that employment sick leave sheets must omit diagnosis by law |
| Rest period starts tomorrow instead of today | Default date selection | Click the start date picker and select the desired calendar date |
| Clinic header and logo missing on printout | "Print Letterhead" toggle disabled | Check "Include Letterhead & Practice Logo" in print settings |
