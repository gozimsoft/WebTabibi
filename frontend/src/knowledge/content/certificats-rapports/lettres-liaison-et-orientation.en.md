---
id: "cert-lettres-liaison"
title: "Referral Letters, Colleague Communications and Detailed Clinical Reports"
category: "certificats-rapports"
tags: ["referral-letter", "colleague", "specialist-consult", "clinical-report", "handover"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecin"]
symptoms_doctor:
  - "How do I compose a quick referral letter to a cardiologist including the recent exam summary?"
  - "I want to auto-populate the patient's active drug regimen into the referral letter without retyping"
  - "How do I print a comprehensive medical report summarizing history and current pathology?"
keywords: ["referral letter", "colleague", "medical handover", "clinical summary", "specialist"]
escalation_threshold: "Data aggregation failure in liaison editor or printing engine crash."
muraqib_ref: null
---

# Referral Letters & Inter-Colleague Clinical Communications

## 1. Objective
Streamline communication between attending practitioners and specialists or hospital departments, generating formal referral and handover letters that automatically pull active diagnoses, medical history, and current medications without duplicate typing.

## 2. Where to Find the Feature
- **During Consultation:** Tab **"Certificates & Letters"** > Button **"Referral Letter (Orientation)"**.
- **Inside Patient Record:** Tab **"Letters & Clinical Reports"**.
- **Smart Injection Palette:** Contextual buttons in editor toolbar: *"Inject History"*, *"Inject Clinical Findings"*, and *"Inject Active Medications"*.

## 3. Step-by-Step Procedure
### A. Authoring a Specialist Referral Letter
1. During consultation, click **"Referral Letter"**.
2. Select specialty or target colleague (e.g. *Cardiology / Endocrinology*).
3. Standard respectful greeting opens: *"Dear Colleague, I am referring patient [Full Name] for your expert assessment regarding..."*.
4. Input specific clinical question (e.g., *Refractory hypertension and echocardiogram evaluation*).
5. Click one-touch injection buttons:
   - **Inject History:** Inserts Diabetes, Hypertension, and Past Surgeries.
   - **Inject Current Regimen:** Inserts active pharmacological lines with exact dosages.
6. Click **"Preview & Print"** (on standard A4 clinic letterhead).

### B. Archiving and Referral Tracking
1. A permanent digital duplicate saves automatically to the patient's dossier.
2. A timeline tag denotes that the patient was referred on [Date] to Dr. [Name], facilitating follow-up when the counter-report returns.

## 4. What the Doctor Should See on Screen
- A clean rich-text composer supporting bilingual French and Arabic typography.
- A docked clinical drawer enabling quick insertion of prior lab findings or radiological observations.
- Export capability to password-protected PDF for compliant transmission via secure medical email.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, to draft a referral letter for a specialist, open the 'Letters' tab and click 'Referral Letter'. Select your colleague's specialty and click 'Inject Current Regimen & History'—TABIBI will automatically insert their active drugs and medical background into the letter to save your time. You can print and sign it immediately."*

## 6. Technical Verification (Level 2)
- [ ] Confirm active prescription extraction service compiles cleanly into formatted HTML strings.
- [ ] Verify colleague address book table `confreres_directory` (Name, Specialty, Address, Phone).
- [ ] Confirm records commit to table `referral_letters` with timestamp and referral status.

## 7. Advanced Diagnostics & System (Level 3)
If smart injection buttons fail to populate current medications:
1. Verify whether the patient holds an active, validated prescription in today's or recent visits.
2. Audit backend method `patient.getActivePrescription()` execution in developer console.
3. Ensure no unhandled null pointer exceptions exist when patients have empty allergy arrays.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Physician requests importing the regional medical syndicate directory to enrich colleague lookups.
- **Escalate to L3:** PDF renderer font embedding fault producing illegible Arabic characters.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Specialist sent counter-report back; where to store? | Incoming reply documentation | Scan document and file under "Medical Documents & EDM" tab |
| Letter font renders uncomfortably small on printout | A5 paper format selected in print driver | Set paper format to Standard A4 in print preview modal |
| Referral includes discontinued drugs | Complete history injected instead of active drugs | Click "Inject Active Rx Only" to filter strictly active regimens |
