---
id: "v2-reseau-serveur"
title: "Réseau Local, Synchronisation & Serveur Cabinet (Feuille de route V2)"
category: "reseau-serveur"
tags: ["reseau-serveur", "v2", "lan", "serveur", "ports", "offline", "muraqib"]
version: "0.1.0"
tabibi_version: ">=2.4.0"
status: "A_VERIFIER"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L3"]
target_audience: ["tech", "infra"]
symptoms_doctor:
  - "Le poste secrétaire ne communique plus avec le poste médecin"
  - "Message : Impossible de contacter le serveur local"
keywords: ["ip statique", "port 5000", "mysql", "lan", "pare-feu"]
escalation_threshold: "Panne générale du serveur local de base de données."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/network"
---

# Réseau Local, Synchronisation & Serveur Cabinet

> ⚠️ **Catégorie cible V2 — Section en cours de rédaction**
> Afin d'éviter toute divergence technique, les règles d'architecture réseau et de serveur local sont documentées de manière centralisée dans Muraqib.

## Architecture réseau type
- **Serveur local TABIBI :** Écoute sur le port `5000` (API Express) et le port `3306` (MySQL).
- **Postes clients Réception & Consultation :** Doivent joindre l'adresse IP fixe du serveur sur le sous-réseau local (ex: `192.168.1.100:5000`).

## Documentation de référence
- 🔗 **Documentation Muraqib Réseau & Serveur :** [https://muraqib.stellarsoft.dz/docs/infra/network](https://muraqib.stellarsoft.dz/docs/infra/network)
