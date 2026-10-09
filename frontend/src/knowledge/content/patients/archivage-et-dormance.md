---
id: "pat-archivage-dormance"
title: "Archivage, statut dormant et conformité de purge des dossiers patients"
category: "patients"
tags: ["patients", "archivage", "dormant", "purge", "rgpd", "retention", "securite"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L2", "L3"]
target_audience: ["support", "administrateurs"]
symptoms_doctor:
  - "Un patient qui n'est pas venu depuis 5 ans encombre ma liste de recherche"
  - "Comment marquer un patient décédé ou déménagé ?"
  - "Peut-on supprimer définitivement une fiche patient ?"
keywords: ["inactif", "archivé", "décédé", "purge", "droit à l'oubli", "conservation légale"]
escalation_threshold: "Demande de suppression physique de données médicales soumises au délai légal de conservation de 20 ans."
muraqib_ref: null
---

# Archivage, statut dormant et purge des dossiers patients

## 1. Objectif
Comprendre les mécanismes de mise en sommeil (dormance) et d'archivage des dossiers patients inactifs dans TABIBI, respecter la durée légale de conservation des dossiers médicaux (20 ans en droit médical algérien) et savoir restaurer une fiche archivée lors du retour imprévu d'un patient.

## 2. Où trouver la fonction
- Sur la fiche patient : Menu d'actions `⋮` en haut à droite > **« Archiver le dossier / Marquer comme dormant »**.
- Dans la liste des patients : Filtre **« État du dossier : Actifs / Dormants / Tous »**.

## 3. Étapes exactes
### Marquer un dossier comme dormant (inactif)
1. Ouvrir la fiche du patient concerné.
2. Cliquer sur les trois points `⋮` puis choisir **« Passer en statut dormant »**.
3. Renseigner le motif : *« Absence de consultation depuis > 3 ans »*, *« Déménagement »*, ou *« Patient décédé »*.
4. Valider : le dossier est retiré des suggestions instantanées d'autocomplétion quotidienne pour alléger la recherche, tout en conservant l'intégralité de son historique médical intact.

### Réactiver un dossier dormant
1. Si le patient revient au cabinet : dans la barre de recherche des patients, cocher la case **« Inclure les dossiers dormants »**.
2. Sélectionner le patient : un bandeau d'alerte gris indique : *« Ce dossier est actuellement en sommeil »*.
3. Cliquer sur le bouton **« Réactiver le dossier »** : le patient repasse instantanément en statut actif normal.

## 4. Ce que le médecin doit voir à l'écran
- Sur un dossier dormant : un badge gris **« DOSSIER EN SOMMEIL »** apparaît à côté du nom, et les boutons de prise de rendez-vous réclament confirmation.
- L'historique complet des consultations antérieures reste consultable en lecture seule.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Pour ne pas encombrer votre liste avec des patients qui ne consultent plus, utilisez l'option 'Passer en statut dormant'. Aucune donnée n'est effacée, et si le patient revient dans 2 ans, il vous suffira de cliquer sur 'Réactiver' pour retrouver l'intégralité de ses anciennes ordonnances et radios."*

## 6. Vérification technique (Niveau 2)
- [ ] Confirmer dans la table `patients` que les colonnes `DormantAt`, `DormantBy` et `DormantReason` sont correctement peuplées.
- [ ] S'assurer que le paramètre `IsDeleted` reste à `0` (l'archivage n'est pas une suppression physique).

## 7. Diagnostic avancé & Système (Niveau 3)
Règle légale sur la purge des dossiers :
1. En droit de la santé, le médecin a l'obligation de conserver les dossiers médicaux pendant un minimum de **20 ans** à compter de la dernière consultation.
2. Toute demande de purge définitive (`DELETE FROM patients`) doit être refusée par le support technique sans ordonnance judiciaire ou validation écrite formelle du directeur médical du cabinet.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Un patient dormant ne se réactive pas lors du clic sur le bouton de réactivation.
- **Escalader à N3 :** Demande de purge définitive de base de données liée à un audit judiciaire ou litige de succession.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Le patient ne sort plus du tout dans la recherche | Le filtre « Inclure les dormants » est décoché | Cocher la case « Inclure les dormants » dans les options de filtre |
| Impossible de supprimer le patient | Protection médico-légale active | Utiliser l'archivage en mode 'Dormant' plutôt que la suppression |
