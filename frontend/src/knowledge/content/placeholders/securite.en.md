---
id: "v2-securite"
title: "Medical Data Security & Role-Based Access Control (V2 Roadmap)"
category: "securite"
tags: ["security", "v2", "rbac", "confidentiality", "permissions", "roles", "muraqib"]
version: "0.1.0"
tabibi_version: ">=2.4.0"
status: "A_VERIFIER"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L2", "L3"]
target_audience: ["tech", "dpo", "infra"]
symptoms_doctor:
  - "Secretary must not view private clinical exam findings"
  - "How do I reset and cycle user credentials?"
keywords: ["medico-legal", "encryption", "access rights", "session"]
escalation_threshold: "Suspected access violation or clinic data breach."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/security"
---

# Medical Data Security & Role-Based Access Control (RBAC)

> ⚠️ **V2 Target Category — Section in Active Drafting**
> Granular permission models (RBAC), front desk versus practitioner access matrices, and data encryption standards are documented centrally in Muraqib.

## Medical Secrecy Principles
- **Medical Secrecy:** Front desk personnel access demographics, appointments, and billing ledgers, but personal medical history and examination notes remain masked.
- **System Roles:** Attending Physician, Substitute Physician, Medical Secretary, Practice Administrator.

## Reference Documentation
- 🔗 **Muraqib Security & Compliance Guide:** [https://muraqib.stellarsoft.dz/docs/infra/security](https://muraqib.stellarsoft.dz/docs/infra/security)
