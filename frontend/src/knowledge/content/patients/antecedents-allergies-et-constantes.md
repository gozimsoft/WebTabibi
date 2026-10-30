---
id: "pat-antecedents-constantes"
title: "Antécédents médicaux, allergies, facteurs de risque et suivi des constantes"
category: "patients"
tags: ["patients", "antecedents", "allergies", "constantes", "tension", "diabete", "courbes"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecins"]
symptoms_doctor:
  - "Comment déclarer une allergie pour qu'elle m'alerte sur l'ordonnance ?"
  - "Où voir la courbe d'évolution de la tension ou de la glycémie ?"
  - "Les antécédents familiaux ne s'affichent pas dans le résumé de consultation"
keywords: ["antécédents personnels", "chirurgicaux", "tension artérielle", "poids", "taille", "imc", "glycémie"]
escalation_threshold: "Non-déclenchement d'une alerte d'allergie critique connue lors de la prescription d'un médicament contre-indiqué."
muraqib_ref: null
---

# Antécédents médicaux, allergies et suivi des constantes

## 1. Objectif
Structurer le dossier médical du patient : consigner les antécédents personnels, familiaux et chirurgicaux, enregistrer les allergies médicamenteuses actives (déclenchant les alertes de prescription), et tracer l'évolution des constantes vitales (Tension, Poids, IMC, Température, Glycémie).

## 2. Où trouver la fonction
- Dans le dossier patient : Onglet **« Antécédents & Facteurs de risque »**.
- En consultation active : Volet latéral gauche **« Profil clinique »** et section **« Constantes du jour »**.

## 3. Étapes exactes
### Enregistrement des allergies et alertes vitales
1. Dans la section **Allergies & Intolérances**, cliquer sur **« + Ajouter une allergie »**.
2. Choisir la famille ou la molécule concernée : ex: *Pénicillines / Bêta-lactamines*, *Aspirine / AINS*, *Sulfamides*.
3. Préciser la réaction constatée : *Choc anaphylactique*, *Œdème de Quincke*, *Urticaire*.
4. Valider : une pastille rouge d'avertissement s'affiche désormais en permanence sur l'en-tête du patient et verrouille toute tentative de prescription de ces molécules.

### Saisie des constantes et génération des graphiques
1. Dans le volet **Constantes vitales**, saisir :
   - **Tension artérielle :** Systolique / Diastolique (ex: `130 / 85 mmHg`).
   - **Fréquence cardiaque :** (ex: `72 bpm`).
   - **Poids & Taille :** Le système calcule automatiquement l'**IMC** (Indice de Masse Corporelle) et affiche le statut pondéral.
2. Cliquer sur l'icône **« Courbe d'évolution »** : un graphique interactif affiche la tendance sur les 12 derniers mois.

## 4. Ce que le médecin doit voir à l'écran
- Si le patient est hypertendu ou diabétique : des marqueurs visuels de couleur alertent sur les valeurs anormales (ex: TA > 140/90 en orange vif).
- En consultation, les antécédents majeurs restent affichés en permanence à gauche de l'écran pour garder le contexte clinique sous les yeux pendant la rédaction de l'ordonnance.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Pour activer les alertes automatiques contre les erreurs d'ordonnance, déclarez toujours l'allergie dans l'onglet 'Antécédents' sous la rubrique 'Allergies'. TABIBI analysera ensuite chaque médicament que vous sélectionnerez et vous avertira immédiatement en cas de contre-indication."*

## 6. Vérification technique (Niveau 2)
- [ ] Confirmer que la table `patient_vitals` enregistre bien chaque mesure avec son horodatage `MeasuredAt`.
- [ ] Vérifier que le moteur d'alerte de `PrescriptionsManager.tsx` croise correctement la table `patient_allergies` avec les classes ATC de la molécule prescrite.

## 7. Diagnostic avancé & Système (Niveau 3)
Si les courbes d'évolution des constantes ne se dessinent pas :
1. Vérifier si les valeurs numériques de poids ou de tension contiennent des caractères alphabétiques ou des virgules au lieu de points décimaux.
2. S'assurer que le composant de visualisation graphique (SVG ou Canvas) ne lève pas d'exception dans la console.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Les antécédents saisis sur le dossier ne s'affichent pas dans le volet de consultation.
- **Escalader à N3 :** Défaut avéré dans la détection d'une contre-indication médicamenteuse formellement enregistrée.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| L'IMC ne se calcule pas automatiquement | La taille ou le poids est laissé vide | Renseigner à la fois la taille (en cm) et le poids (en kg) |
| L'alerte d'allergie apparaît sur chaque patient | Règle globale d'allergie mal configurée | Vérifier que l'allergie est bien liée à la fiche patient et non aux paramètres généraux |
