---
id: "dcm-import-etudes"
title: "Importing DICOM Radiology Studies (CD/DVD, USB Drives, PACS)"
category: "dicom"
tags: ["dicom", "imaging", "ct-scan", "mri", "xray", "pacs", "import", "cd-rom"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecin", "radiologue"]
symptoms_doctor:
  - "The patient brought a CT scan CD, how do I open it inside TABIBI?"
  - "The software does not recognize the DICOM files located on my USB thumb drive"
  - "Import takes too long when loading a volumetric study containing thousands of slices"
keywords: ["DICOM", "PACS", "CD-ROM", "CT scan", "MRI", "radiology import"]
escalation_threshold: "DICOM parser crash or system hang during ingestion of massive volumetric datasets."
muraqib_ref: null
---

# Importing DICOM Radiology Studies (X-Ray, CT, MRI)

## 1. Objective
Guide physicians and radiologists in importing standardized medical imaging studies (DICOM Part 10 format) sourced from radiology centers via physical CD/DVD media, portable USB storage, or networked clinic PACS repositories.

## 2. Where to Find the Feature
- **Inside Patient Record:** Tab **"Medical Imaging & DICOM"** > Action button **"Import Radiology Study"**.
- **During Consultation:** Side imaging drawer > Optical CD or USB drive icon.
- **Drag-and-Drop:** Dragging a folder containing DICOM files directly into the active viewer canvas.

## 3. Step-by-Step Procedure
### A. Importing from CD/DVD or USB Media
1. Insert disc into optical drive or mount USB drive to the workstation.
2. Open target patient file in TABIBI and navigate to the **"DICOM"** tab.
3. Click **"Import from CD / USB"**.
4. Browse directory: Select target drive (e.g. `D:\` or study root containing `DICOMDIR`).
5. TABIBI's native DICOM parser scans headers, automatically identifying:
   - Modality (CT, MR, CR, DX, US).
   - Study Date, Series count, and slice volumes.
6. Click **"Confirm Import & Attach to Patient"**.

### B. Ingesting Standalone .dcm Files
1. Drag and drop single or batch `.dcm` files onto the workspace.
2. The system categorizes series and generates fast thumbnail previews.

## 4. What the Doctor Should See on Screen
- A structured series gallery showing anatomical orientations (Axial, Coronal, Sagittal) and slice counts.
- Patient metadata extracted straight from DICOM tags with a validation flag if the name on the disc diverges from the active profile.
- Launch action button: **"Open in Advanced DICOM PACS Viewer"**.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, open the patient record, navigate to the 'DICOM' tab, and click 'Import Study'. Select your CD drive or USB folder, and TABIBI will automatically parse the scan and arrange all radiological slices. If the study contains hundreds of slices, please allow a few seconds for caching and it will launch smoothly."*

## 6. Technical Verification (Level 2)
- [ ] Ensure compliance with DICOM Part 10 standards (Explicit/Implicit VR Little/Big Endian).
- [ ] Check available storage capacity in `storage/dicom/{PatientId}/`.
- [ ] Inspect import error logs for cyclic redundancy (CRC) read faults on scratched optical media.

## 7. Advanced Diagnostics & System (Level 3)
If the application hangs while reading an optical disc:
1. Check optical drive spin performance and I/O buffer timeouts.
2. Verify compression codecs (JPEG Lossless, JPEG 2000, RLE).
3. Best Practice: Copy the disc directory to local desktop first, then import into TABIBI to bypass slow CD hardware.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Disc contains a standalone proprietary viewer executable and TABIBI cannot locate the raw DICOM payload.
- **Escalate to L3:** Crash on proprietary DICOM vendor extensions (e.g., modern dual-energy CT from GE or Siemens).

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Alert "Patient name on disc differs from active file" | Wrong disc inserted or spelling discrepancy | Verify patient identity and confirm exceptional link if same person |
| Disc makes grinding sound and fails to load | Scratched or degraded physical CD media | Clean disc surface with micro-fiber cloth or test in external drive |
| Import speed is extremely slow | Study contains over 3,000 volumetric slices | Copy folder to local SSD first, then import in TABIBI |
