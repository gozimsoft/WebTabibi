---
id: "v2-securite"
title: "Sécurité des Données Médicales et Contrôle d'Accès RBAC (Feuille de route V2)"
category: "securite"
tags: ["securite", "v2", "rbac", "confidentialite", "droits", "roles", "muraqib"]
version: "0.1.0"
tabibi_version: ">=2.4.0"
status: "A_VERIFIER"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L2", "L3"]
target_audience: ["tech", "dpo", "infra"]
symptoms_doctor:
  - "La secrétaire ne doit pas voir les détails de l'examen clinique"
  - "Comment changer les mots de passe des utilisateurs ?"
keywords: ["médico-légal", "chiffrement", "droits d'accès", "session"]
escalation_threshold: "Suspicion de violation d'accès ou fuite de données d'un cabinet."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/security"
---

# Sécurité des Données Médicales et Contrôle d'Accès (RBAC)

> ⚠️ **Catégorie cible V2 — Section en cours de rédaction**
> Le modèle de permissions granulaires (RBAC), les matrices de droits secrétariat/praticien et les protocoles de chiffrement sont documentés dans Muraqib.

## Principes de confidentialité médicale
- **Secret médical :** Le secrétariat a accès à l'état civil, à la facturation et à l'agenda, mais les antécédents intimes et les observations cliniques sont masqués.
- **Rôles système :** Médecin titulaire, Médecin remplaçant, Secrétaire médicale, Administrateur cabinet.

## Documentation de référence
- 🔗 **Documentation Muraqib Sécurité & Conformité :** [https://muraqib.stellarsoft.dz/docs/infra/security](https://muraqib.stellarsoft.dz/docs/infra/security)
