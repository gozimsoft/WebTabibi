---
id: "dent-odontogramme-fdi"
title: "Interactive Dental Chart (FDI Odontogram), Numbering and Quadrants"
category: "dentaire"
tags: ["dental", "odontogram", "fdi", "teeth", "quadrants", "adults", "pediatric", "tooth-status"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "dentiste", "assistante"]
symptoms_doctor:
  - "How do I switch between adult dentition and pediatric deciduous teeth?"
  - "How do I designate a specific tooth surface (occlusal, vestibular, mesial) for a cavity or composite?"
  - "Extracted tooth does not render the crossed-out icon on the odontogram"
keywords: ["odontogram", "FDI", "caries", "filling", "extraction", "deciduous", "quadrants"]
escalation_threshold: "Failure to persist dental chart modifications in database or SVG canvas corruption."
muraqib_ref: null
---

# Interactive Dental Chart (FDI Odontogram) & Quadrants

## 1. Objective
Enable dental surgeons and assistants to record clinical intraoral examinations utilizing the standardized FDI World Dental Federation notation (Teeth 11–48 for permanent dentition, 51–85 for pediatric deciduous dentition), mapping clinical conditions across five anatomical surfaces per tooth.

## 2. Where to Find the Feature
- **Inside Patient Record:** Module **"Dental Practice / Odontogram"**.
- **During Dental Encounter:** Central interactive SVG diagram rendering maxillary and mandibular dental arches.
- **Dentition Toggle:** Button **"Permanent (Adult) / Deciduous (Pediatric)"**.

## 3. Step-by-Step Procedure
### A. Selecting Tooth and Anatomical Surface
1. Each tooth on the diagram is partitioned into 5 anatomical surfaces:
   - **Occlusal (O)**
   - **Vestibular / Buccal (V)**
   - **Lingual / Palatal (L/P)**
   - **Mesial (M)**
   - **Distal (D)**
2. Click the target tooth (e.g. Molar 16).
3. Select clinical pathology or procedure from quick menu:
   - **Caries / Decay:** Marked in bright red on the selected surface.
   - **Composite / Amalgam Restoration:** Shaded in blue/grey.
   - **Endodontic Root Canal:** Red pulpal root canal indicator.
   - **Missing / Extracted:** Crossed out with an `X` glyph.
   - **Prosthetic Crown / Bridge:** Shaded with ceramic/gold crown outline.

### B. Toggling Pediatric Deciduous Arch
1. For pediatric cases, click **"Deciduous Dentition"**.
2. The chart instantly transforms to the 20 primary teeth using FDI pediatric quadrant indices (5, 6, 7, 8).

## 4. What the Doctor Should See on Screen
- A crisp vector SVG chart responsive to mouse hover and clicks.
- Clear visual status legend detailing color codes and glyphs.
- Chronological historical intervention ledger displayed directly beneath the arches.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, inside the dental module, click any tooth to reveal its 5 individual surfaces. Select the surface and choose the pathology (caries, filling, extraction, or root canal) to update the visual chart instantly. If treating a child, toggle 'Deciduous Dentition' at the top to access the primary teeth numbering."*

## 6. Technical Verification (Level 2)
- [ ] Inspect database table `dental_teeth`: Validate fields `tooth_number`, `surface_mask`, and `status_code`.
- [ ] Confirm ISO 3950 (FDI) 2-digit compliance.
- [ ] Ensure SVG canvas state synchronizes with React component state without re-render lag.

## 7. Advanced Diagnostics & System (Level 3)
If dental status fails to persist upon saving:
1. Verify payload array structure in `PUT /api/dental/:patientId/chart`.
2. Inspect database transaction logs for foreign key violations in `dental_history`.
3. Verify historical versioning logic preserving pre-treatment states.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Physician requests custom coloration tokens or new dental conditions (e.g., Titanium Implants).
- **Escalate to L3:** Database corruption resetting saved dental records across multiple patients.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Adult patient with retained deciduous tooth | Mixed dentition clinical reality | Enable "Mixed Dentition" override to color a primary tooth inside adult arch |
| Entire tooth colored instead of one surface | User clicked tooth center | Click specifically on the surrounding surface polygon |
| Odontogram graphic omitted in print report | Print graphics disabled | Check "Include Dental Odontogram" in print configuration |
