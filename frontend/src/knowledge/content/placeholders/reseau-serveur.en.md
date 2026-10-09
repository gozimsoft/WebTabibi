---
id: "v2-reseau-serveur"
title: "Local Area Network, Synchronization & Clinic Server (V2 Roadmap)"
category: "reseau-serveur"
tags: ["network-server", "v2", "lan", "server", "ports", "offline", "muraqib"]
version: "0.1.0"
tabibi_version: ">=2.4.0"
status: "A_VERIFIER"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L3"]
target_audience: ["tech", "infra"]
symptoms_doctor:
  - "Secretary workstation disconnected from doctor terminal"
  - "Alert: Unable to reach local clinic server"
keywords: ["static ip", "port 5000", "mysql", "lan", "firewall"]
escalation_threshold: "Total failure of local database host server."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/network"
---

# Local Area Network, Synchronization & Clinic Server

> ⚠️ **V2 Target Category — Section in Active Drafting**
> To avoid divergence, LAN topology rules and local server management are centrally maintained in Muraqib.

## Standard Network Architecture
- **TABIBI Clinic Server:** Listens on port `5000` (Express API) and port `3306` (MySQL).
- **Client Workstations (Reception & Doctor):** Connect to server's static LAN IP address (e.g. `192.168.1.100:5000`).

## Reference Documentation
- 🔗 **Muraqib Network & Server Guide:** [https://muraqib.stellarsoft.dz/docs/infra/network](https://muraqib.stellarsoft.dz/docs/infra/network)
