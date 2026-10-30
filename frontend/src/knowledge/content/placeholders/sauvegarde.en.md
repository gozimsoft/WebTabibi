---
id: "v2-sauvegarde"
title: "Automated Backups & Disaster Recovery (V2 Roadmap)"
category: "sauvegarde"
tags: ["backup", "v2", "recovery", "mysql-dump", "disaster-recovery", "muraqib"]
version: "0.1.0"
tabibi_version: ">=2.4.0"
status: "A_VERIFIER"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L3"]
target_audience: ["tech", "infra"]
symptoms_doctor:
  - "How do I backup patient dossiers onto a flash drive?"
  - "The workstation hard drive is showing signs of hardware failure"
keywords: ["usb drive", "dump", "sql export", "data protection"]
escalation_threshold: "Catastrophic drive loss requiring bare-metal restore from encrypted archive."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/backups"
---

# Automated Backups & Disaster Recovery

> ⚠️ **V2 Target Category — Section in Active Drafting**
> Backup retention protocols, automated MySQL dump automation scripts, and disaster recovery plans are documented centrally in Muraqib.

## Core TABIBI Backup Principles
- **Automated Local Backup:** Nightly timestamped SQL dumps generated automatically upon practice closing.
- **3-2-1 Backup Rule:** 3 copies of data (live production database, local drive copy, and external storage copy).

## Reference Documentation
- 🔗 **Muraqib Backup Documentation:** [https://muraqib.stellarsoft.dz/docs/infra/backups](https://muraqib.stellarsoft.dz/docs/infra/backups)
