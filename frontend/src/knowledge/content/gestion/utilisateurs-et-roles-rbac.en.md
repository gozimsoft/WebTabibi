---
id: "ges-utilisateurs-rbac"
title: "User Management, Practitioner Profiles and Access Control (RBAC)"
category: "gestion"
tags: ["management", "users", "roles", "rbac", "permissions", "security", "medical-secrecy"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "administrateur", "medecin"]
symptoms_doctor:
  - "How do I prevent the secretary from viewing confidential clinical notes and exam diagnoses?"
  - "We hired a substitute associate doctor, how do I create their individual user profile?"
  - "The secretary forgot her password and is locked out of the software"
keywords: ["permissions", "RBAC roles", "doctor account", "secretary account", "password", "security"]
escalation_threshold: "Loss of master Administrator credentials or total failure of the authorization middleware."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/security"
---

# User Management, Practitioner Profiles & Access Control (RBAC)

## 1. Objective
Protect patient medical secrecy and clinic databases through a granular Role-Based Access Control (RBAC) framework, ensuring every staff member (attending physician, secretary, nurse, accountant) accesses strictly the functional tools authorized for their duty profile.

## 2. Where to Find the Feature
- **Administration Screen:** Sidebar > **"Settings & Administration"** > **"Users & Permissions"** (requires Admin privileges).
- **Add User Button:** Action button **"+ New User Profile"**.
- **Permissions Grid:** Tab **"Roles & Permissions Matrix"**.

## 3. Step-by-Step Procedure
### A. Creating a Front Desk Profile and Restricting Access
1. Authenticate with the master Administrator profile.
2. Navigate to **"Users & Permissions"** and click **"+ New User"**.
3. Input username, full name, and initial temporary password.
4. Select functional role: **"Reception & Front Desk (Secrétaire)"**.
5. Configure standard permission toggles:
   - ✅ Check-in patients & triage waiting room.
   - ✅ Manage appointment calendar.
   - ✅ Collect fees & print financial receipts.
   - ❌ **Revoked:** View clinical observations, doctor's notes, and medical diagnoses.
   - ❌ **Revoked:** Edit or delete prescriptions.
   - ❌ **Revoked:** Access aggregate practice revenue and financial analytics.
6. Click **"Save User Account"**.

### B. Password Reset Protocol
1. When an employee forgets their credentials:
2. Administrator opens User Management and clicks the target user card.
3. Click **"Reset Password"** and assign a new secure credential string.

## 4. What the User Should See on Screen
- When a front desk operator logs in: A clean interface completely stripped of clinical examination tabs or sensitive practice accounting figures.
- If an unauthorized URL or action is attempted: A clear modal alerts: *"Access Restricted: This module is reserved for authorized clinical practitioners"*.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, you can manage access for each employee in your practice with total security. Log in with your admin profile and open 'Users & Permissions' in Settings. You can create a dedicated account for your secretary allowing reception and appointments, while strictly locking clinical files and revenue data to guarantee complete patient privacy."*

## 6. Technical Verification (Level 2)
- [ ] Inspect database table `users`: Validate passwords stored exclusively as cryptographically salted hashes (`bcrypt` or `Argon2`).
- [ ] Inspect relational table `role_permissions` tied to `role_id`.
- [ ] Ensure authorization middleware enforces RBAC server-side on API endpoints rather than merely relying on frontend DOM hiding.

## 7. Advanced Diagnostics & System (Level 3)
If the clinic owner loses the master Administrator password:
1. Adhere to emergency credential recovery protocols defined in Muraqib Security Documentation.
2. Utilize local recovery CLI tooling on the server console to reset the administrative password hash without exposing database security.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Clinic requests authoring an intermediary custom role (e.g., Clinical Nurse authorized exclusively for vitals recording).
- **Escalate to L3:** Total lockout of all clinic workstations due to brute-force security lock triggers.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Secretary still sees restricted screens after permission change | Stale session token cache | Log secretary out and re-login to refresh active JWT claims |
| Password reject error | Password policy non-compliance | Password must contain at least 8 characters including letters and digits |
| Administration button missing from sidebar | Active user lacks Admin rank | Log in with the master clinic administrator profile |
