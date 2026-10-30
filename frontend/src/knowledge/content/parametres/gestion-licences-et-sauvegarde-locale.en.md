---
id: "par-licences-sauvegarde"
title: "TABIBI License Activation, Trial Management and Manual Flash Drive Backups"
category: "parametres"
tags: ["settings", "license", "activation", "product-key", "manual-backup", "export", "usb-drive"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "administrateur", "medecin"]
symptoms_doctor:
  - "Warning banner states that 5 days remain on the TABIBI evaluation trial"
  - "Where do I input the permanent product license key provided by Stellarsoft?"
  - "I want to take a full encrypted backup of all patient files onto a USB drive before travelling"
keywords: ["license activation", "product key", "trial period", "backup", "USB", "security export"]
escalation_threshold: "Cryptographic license verification failure or manual backup compilation error."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/backups"
---

# TABIBI License Activation & Manual Flash Drive Backups

## 1. Objective
Guide the physician in activating permanent or annual software licenses, tracking validity status, and generating single-click encrypted backups of the clinic database and medical media repository onto external storage (USB thumb drives or external hard disks) without technical complexity.

## 2. Where to Find the Feature
- **Sidebar Navigation:** Section **"Settings"** > Tab **"License & Backups"**.
- **One-Click Backup Action:** Prominent button **"💾 Create Backup to USB Now"**.
- **License Field:** Input box **"Activation Key (Product Key)"**.

## 3. Step-by-Step Procedure
### A. Activating Software License
1. Open the **"License"** screen inside Settings.
2. The persistent unique Hardware Machine ID displays.
3. Paste the multi-segment cryptographic activation key received from Stellarsoft support.
4. Click **"Activate License"**.
5. The system cryptographically verifies the key signature, updating status to: *"Permanently Activated & Registered to Dr. [Name]"*.

### B. Generating Manual Backup onto a USB Flash Drive
1. Insert a USB flash drive into the workstation and verify adequate free space.
2. In the Backup panel, click **"💾 Create Backup Now"**.
3. Select target USB drive letter (e.g. `E:\`).
4. TABIBI autonomously runs the automated pipeline in seconds:
   - Dumps consistent database state into an encrypted archive (`tabibi_backup_YYYYMMDD_HHMM.enc`).
   - Packages and compresses clinical documents and radiological media.
   - Calculates cryptographic SHA-256 verification checksums.
5. A green success banner confirms: *"Backup successfully compiled and secured on external drive"*.

## 4. What the Doctor Should See on Screen
- License info card: Build number, validation timestamp, and seat type (Solo Practice / Multi-seat LAN).
- Historical audit table of previous backups: Date, payload size, and integrity status.
- Interactive progress bar during archive compilation.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, to activate TABIBI, open Settings > License, paste your activation key, and click 'Activate'. To take a backup, plug your USB flash drive into your computer and click 'Create Backup to USB Now'. The system will compress and encrypt your entire practice database and documents in seconds, keeping your medical data fully protected."*

## 6. Technical Verification (Level 2)
- [ ] Confirm public key verification algorithm (RSA-2048 / Ed25519) correctly matches the host Machine ID.
- [ ] Audit backup pipeline: Ensure transaction isolation prevents corrupted partial dumps during active writes.
- [ ] Confirm write permissions on removable USB media under Windows host policies.

## 7. Advanced Diagnostics & System (Level 3)
If backup errors with "Disk full or I/O failure":
1. Verify free space in local temporary directory `%TEMP%` where staging occurs prior to flash drive transfer.
2. Verify flash drive filesystem format (FAT32 caps individual files at 4GB; format flash drive to NTFS or exFAT for large clinical vaults).
3. Review Muraqib service logs for concurrent process lockouts.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Physician upgraded workstation motherboard/CPU, altering Machine ID and triggering invalid license status.
- **Escalate to L3:** Backup archive decompression failure during disaster recovery drill.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Error "Invalid License Key" | Copy-paste error or accidental whitespace padding | Copy key string cleanly without leading or trailing spaces |
| Backup hangs at 50% | Degraded slow USB drive or premature disconnection | Use high-speed USB 3.0 storage and do not disconnect until success prompt |
| Is the USB backup password-protected? | Encryption enforced to protect patient privacy | Yes, backups are encrypted using practice credentials to prevent unauthorized exposure |
