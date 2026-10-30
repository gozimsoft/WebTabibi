---
id: "cons-pause-reprise"
title: "Mise en pause et reprise d'une consultation (Gestion des urgences)"
category: "consultations"
tags: ["consultation", "pause", "reprise", "urgence", "multitache", "sauvegarde"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "onboarding", "tech"]
symptoms_doctor:
  - "Une urgence arrive alors que j'ai déjà un patient en consultation"
  - "Est-ce que je perds mes notes si je change de patient sans terminer ?"
  - "Comment mettre en attente un patient parti faire une radio ?"
keywords: ["interrompre", "sauvegarde automatique", "patient en attente", "différé"]
escalation_threshold: "Notes cliniques ou médicaments saisis non retrouvés après reprise de la consultation."
muraqib_ref: null
---

# Mise en pause et reprise d'une consultation

## 1. Objectif
Permettre au praticien de suspendre momentanément une consultation en cours (ex: patient envoyé pour une radiographie immédiate, appel d'urgence, patient prioritaire) sans perdre la moindre saisie, et reprendre ultérieurement là où il s'était arrêté.

## 2. Où trouver la fonction
- En haut de l'écran de consultation, à côté du minuteur : Bouton **« Mettre en pause »** (icône Pause ⏸️).
- Dans le menu latéral gauche : Icône **« Retour salle d'attente »** avec option « Conserver la séance en cours ».

## 3. Étapes exactes
1. Pendant la consultation active, cliquer sur le bouton **« Mettre en pause »**.
2. Un dialogue invite à préciser le motif de suspension (optionnel : *« Examen complémentaire en cours »*, *« Urgence »*, etc.).
3. Valider : le système effectue une **sauvegarde automatique intégrale** de tous les onglets (notes, médicaments sélectionnés, actes préparés).
4. Le patient repasse dans la colonne **« En pause »** ou **« En attente d'examen »** sur le tableau de bord.
5. Le médecin peut alors ouvrir un autre patient.
6. Dès que le patient revient, cliquer sur **« Reprendre la consultation »** : l'écran se recharge exactement avec toutes les données saisies.

## 4. Ce que le médecin doit voir à l'écran
- Dès le clic sur pause, un message vert de confirmation indique : *« Consultation mise en pause avec succès. Données sauvegardées. »*
- Sur le tableau de bord des rendez-vous, la carte du patient arbore un badge jaune **« EN PAUSE »** avec le chrono gelé.
- Au moment de la reprise, toutes les zones de texte et les lignes de prescriptions se réaffichent instantanément.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, vous ne perdez rien du tout ! Cliquez simplement sur le bouton 'Mettre en pause' en haut de votre écran. Votre dossier est enregistré automatiquement. Vous pouvez ouvrir votre patient urgent et, dès qu'il sera parti, vous cliquerez sur 'Reprendre' sur le premier patient pour retrouver exactement vos notes."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier que la table `diagnostics` conserve l'enregistrement avec `Status = 0` (non clôturée) et `IsPaused = 1`.
- [ ] Vérifier que les lignes de prescriptions temporaires sont bien rattachées au `Diagnostic_id` du patient dans la table `prescriptions`.
- [ ] S'assurer que le minuteur cumule le temps effectif et ne compte pas la durée de la pause.

## 7. Diagnostic avancé & Système (Niveau 3)
Si un praticien signale que le bouton « Reprendre » n'ouvre pas le dossier :
1. Examiner les requêtes réseau : `GET /api/consultations/active?doctorId=...`
2. Vérifier si un verrouillage résiduel en base n'attribue pas la consultation à une autre session utilisateur.
3. Requête SQL de vérification :
   ```sql
   SELECT ID, Patient_ID, Status, DateDiagnistic FROM diagnostics WHERE Patient_ID = 'PATIENT_ID' AND Status = 0;
   ```

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le patient n'apparaît plus sur le tableau d'accueil après mise en pause.
- **Escalader à N3 :** Perte de données avérée sur les posologies ou les notes cliniques lors de la reprise.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Message « Une autre consultation est déjà en cours » | Le médecin a cliqué sur un nouveau patient sans mettre le précédent en pause | Cliquer sur 'Mettre en pause' sur le premier patient avant d'en ouvrir un nouveau |
| Le patient n'est plus visible sur l'écran d'accueil | Filtre de salle d'attente positionné sur « Arrivés seulement » | Sélectionner « Tous les statuts » ou « En pause » dans le filtre du calendrier |
| Durée de consultation faussée | La consultation est restée ouverte toute la nuit | Le médecin peut ajuster manuellement l'heure de début dans le panneau des paramètres de la séance |
