---
id: "doc-formats-numerisation"
title: "Supported Formats, Direct Digitization (Webcam/Scanner) and EDM Storage"
category: "documents-medicaux"
tags: ["documents", "edm", "scanner", "webcam", "pdf", "dicom", "wia", "file-size"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaire", "medecin"]
symptoms_doctor:
  - "Scanner is not listed when trying to digitize a patient report"
  - "What is the maximum allowed PDF size for a patient record attachment?"
  - "How do I take a direct picture of a paper lab result using the webcam?"
keywords: ["scan", "webcam", "document archive", "imaging", "labs", "EDM"]
escalation_threshold: "Failure in WIA library or webcam acquisition within Electron wrapper preventing file persistence."
muraqib_ref: null
---

# Supported Formats, Direct Digitization and Electronic Document Management (EDM)

## 1. Objective
Guide users in acquiring and archiving medical reports, laboratory findings, and clinical photographs directly into the patient dossier, utilizing flatbed scanners (WIA protocol), integrated webcams, or digital imports.

## 2. Where to Find the Feature
- **During Consultation:** Tab **"Documents & Archive"** > Blue action button **"Attach Document"** or **"New Scan"**.
- **From Patient Record:** Patient Profile > Tab **"Electronic Document Management (EDM)"**.
- **Quick Camera Tool:** Webcam icon situated on top of the document acquisition window.

## 3. Step-by-Step Procedure
### A. Acquisition via Flatbed/Feeder Scanner (WIA)
1. Place the paper report onto the connected scanner bed.
2. Click **"Scan Document"**.
3. Choose the target scanner from the device dropdown (supports Windows WIA native protocol).
4. Set DPI resolution (recommended: `150 DPI` or `300 DPI` to optimize storage and rapid viewing).
5. Preview image, assign document category (Lab Test, Radiology, Referral Letter), and click **"Save to Record"**.

### B. Direct Photo Capture via Webcam
1. Click the **"Webcam Capture"** icon.
2. A live video feed modal opens.
3. Position document or clinical lesion within framing guides.
4. Click **"Capture"** (or press Spacebar).
5. Crop or rotate if necessary, then confirm to commit as an optimized JPEG.

## 4. What the User Should See on Screen
- A generated thumbnail immediately appears in the patient's media gallery.
- File metadata (file size, acquisition timestamp, document category) is neatly displayed.
- A green sync badge confirms successful write to local clinic storage.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Hello! To scan a document or capture with your webcam, open the Documents tab and click 'Scan Document'. If your scanner is missing from the list, ensure the USB cable is firmly plugged, powered on, and recognized by Windows WIA. You can also simply drag and drop any PDF or image directly into the window."*

## 6. Technical Verification (Level 2)
- [ ] Verify file extension validity: `PDF, JPG, JPEG, PNG, DICOM, DCM`.
- [ ] Verify maximum file size policy (default limit: `25 MB` per asset to preserve system performance).
- [ ] Inspect destination storage path: `storage/documents/{PatientId}/` for write permissions.

## 7. Advanced Diagnostics & System (Level 3)
If webcam acquisition fails inside Electron:
1. Audit Windows Privacy settings (Settings > Privacy & Security > Camera > Allow desktop apps).
2. Inspect `navigator.mediaDevices.getUserMedia()` errors in Chromium devtools.
3. If scanner driver conflicts arise (32-bit TWAIN vs 64-bit Electron), switch to the Windows Image Acquisition (WIA) interface.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Scanner operates in standard Windows fax/scan utility but fails to register in TABIBI.
- **Escalate to L3:** Storage volume exhaustion or corrupted EDM file database pointers.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Common Cause | Resolution |
| :--- | :--- | :--- |
| Error "File exceeds allowable size limit" | Scanned at excessive resolution (`600 DPI`) in uncompressed format | Lower resolution to `200 DPI Grayscale` for textual records |
| Webcam displays pitch black screen | Camera locked by another process (Teams, Zoom, Skype) | Close conflicting app and reload acquisition dialog |
| Document thumbnail does not open | File moved or renamed on disk | Verify physical disk path and resync from automated backup |
