---
id: "v2-sauvegarde"
title: "Sauvegardes Automatisées et Restauration (Feuille de route V2)"
category: "sauvegarde"
tags: ["sauvegarde", "v2", "backup", "restauration", "mysql-dump", "muraqib"]
version: "0.1.0"
tabibi_version: ">=2.4.0"
status: "A_VERIFIER"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L3"]
target_audience: ["tech", "infra"]
symptoms_doctor:
  - "Comment sauvegarder mes dossiers sur une clé USB ?"
  - "Le disque dur montre des signes de fatigue"
keywords: ["clé usb", "dump", "export sql", "sécurité des données"]
escalation_threshold: "Perte de disque nécessitant une restauration complète depuis une archive chiffrée."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/backups"
---

# Sauvegardes Automatisées et Restauration

> ⚠️ **Catégorie cible V2 — Section en cours de rédaction**
> La politique de rétention, les scripts de dump MySQL automatisés et les procédures de restauration après sinistre sont documentés dans Muraqib.

## Principes clés TABIBI
- **Sauvegarde locale automatique :** Dump SQL quotidien horodaté généré chaque soir à la fermeture du cabinet.
- **Règle 3-2-1 :** 3 copies des données (base active, copie disque local, copie sur support externe ou cloud sécurisé).

## Documentation de référence
- 🔗 **Documentation Muraqib Sauvegardes :** [https://muraqib.stellarsoft.dz/docs/infra/backups](https://muraqib.stellarsoft.dz/docs/infra/backups)
