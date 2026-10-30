---
id: "pat-antecedents-constantes"
title: "Medical History, Allergies, Risk Factors and Vital Signs Trend Charts"
category: "patients"
tags: ["patients", "history", "allergies", "vitals", "blood-pressure", "diabetes", "charts"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecin"]
symptoms_doctor:
  - "How do I log a Penicillin allergy so it appears in red on every future visit?"
  - "I want to review the patient's blood pressure trend or weight curve over the past year"
  - "How do I add a past surgical history item with its intervention date?"
keywords: ["medical history", "allergy", "blood pressure", "trend chart", "weight", "vitals"]
escalation_threshold: "Vital trend charting component crash or failure of allergy alert rendering."
muraqib_ref: null
---

# Medical History, Allergies and Vital Signs Trend Charts

## 1. Objective
Document patient medical and surgical history, record severe drug and environmental allergies, capture vital signs (Blood Pressure, Heart Rate, Temperature, Weight, BMI), and render dynamic trend curves over time.

## 2. Where to Find the Feature
- **Inside Patient Record:** Tabs **"Medical History & Allergies"** and **"Vital Signs"**.
- **During Consultation:** Side panel with quick vital signs entry inputs.
- **Trend Charts:** Graphic icon next to Blood Pressure or Weight input fields.

## 3. Step-by-Step Procedure
### A. Logging Allergies and Risk Factors
1. Open Patient Profile and access **"History & Allergies"** tab.
2. Click **"+ Add Allergy"**.
3. Select allergen substance (Medication, Food, Environmental) and define severity (*Severe / Anaphylaxis* or *Moderate*).
4. Click **"Save"**: A persistent red allergy banner mounts at the top of the patient file and during every future encounter.

### B. Entering Vitals and Inspecting Graphical Trends
1. During consultation, enter current readings:
   - **Blood Pressure (BP):** Systolic and Diastolic (e.g., `120/80`).
   - **Weight & Height:** System automatically calculates Body Mass Index (`BMI: 24.2 - Normal`).
   - **Pulse, Temperature, and Oxygen Saturation (SpO2)**.
2. Click the **"Trend Chart"** icon:
3. An interactive modal plots chronological values, with normal limits highlighted in green and abnormal hypertension/weight zones marked in red.

## 4. What the Doctor Should See on Screen
- A high-visibility crimson allergy alert banner permanently pinned on top of the patient file.
- Smooth, responsive line charts illustrating vital trends across clinical visits.
- Ability to export or print the trend chart as part of a patient clinical summary report.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, to log an allergy, open the 'History' tab and click '+ Add Allergy'. Once saved, a red warning badge will stay visible on the patient header, actively warning you if you prescribe a conflicting drug. To see blood pressure or weight graphs over time, simply click the graph icon next to the vitals input."*

## 6. Technical Verification (Level 2)
- [ ] Inspect database table `patient_vitals`: Validate data fields `systolic`, `diastolic`, `weight`, `height`, and `bmi`.
- [ ] Verify chart rendering library (Chart.js / Recharts) loads without browser console errors.
- [ ] Verify foreign key linkage between logged allergies and the pharmacological molecule dictionary.

## 7. Advanced Diagnostics & System (Level 3)
If trend chart renders blank despite recorded historical values:
1. Verify timestamp formatting (`ISO 8601`) in the vitals query dataset.
2. Ensure values are parsed as numeric floats (`parseFloat`) before injection into the chart series.
3. Check for Canvas context sizing errors in Electron viewport wrappers.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Physician requests custom tracked vital parameters (e.g. HbA1c curves or intraocular pressure).
- **Escalate to L3:** Software bug causing logged allergies to intermittently disappear from the patient banner.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Calculated BMI appears absurd | Height entered in meters instead of cm or vice-versa | Enter height in centimeters (e.g. 175) and system converts automatically |
| Trend graph displays a single isolated point | Only one historical reading recorded | Line charts require at least two distinct dated entries to draw trend lines |
| Logging medical history without exact year | Unknown exact historical date | Select "Approximate Year" or "Childhood" in date selector |
