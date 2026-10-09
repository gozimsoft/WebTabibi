---
id: "cons-cycle-de-vie"
title: "Cycle de vie d'une consultation médicale (Ouverture, Déroulement, Clôture)"
category: "consultations"
tags: ["consultation", "cycle-de-vie", "cloture", "lecture-seule", "archivage"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "onboarding", "tech"]
symptoms_doctor:
  - "Je n'arrive plus à modifier mes notes d'hier"
  - "Comment terminer officiellement la séance avec le patient ?"
  - "La consultation est grisée, pourquoi ?"
keywords: ["fermeture", "verrouillage", "historique", "dossier patient", "clôturer"]
escalation_threshold: "Consultation impossible à clôturer malgré validation de tous les champs obligatoires ou blocage de base de données."
muraqib_ref: null
---

# Cycle de vie d'une consultation médicale

## 1. Objectif
Guider le médecin tout au long du déroulement clinique d'une consultation, depuis son ouverture depuis la salle d'attente jusqu'à sa clôture définitive et son passage en archive sécurisée (lecture seule).

## 2. Où trouver la fonction
- **Pour démarrer :** Page d'accueil / Tableau de bord d'attente > Colonne ou Carte du patient > Bouton vert **« Commencer la consultation »**.
- **Pendant la consultation :** Écran principal de consultation avec barre d'état supérieure et volet d'onglets (Motif, Examen, Actes, Documents, Ordonnance).
- **Pour clôturer :** Bouton **« Clôturer la consultation »** situé en haut à droite ou en bas à droite de l'écran.

## 3. Étapes exactes
1. Sélectionner le patient en salle d'attente ayant le statut *« En attente »* ou *« Arrivé »*.
2. Cliquer sur **« Commencer la consultation »** : le système bascule le statut du patient en *« En consultation »* (visible en direct sur le poste secrétaire).
3. Renseigner les étapes médicales :
   - **Motif & Histoire de la maladie**
   - **Examen clinique & Constantes** (Tension, Pouls, Poids, T°)
   - **Actes médicaux / Diagnostics retenus**
   - **Pièces jointes / Imagerie si nécessaire**
   - **Génération de l'ordonnance**
4. Cliquer sur **« Clôturer la consultation »** : une boîte de dialogue confirme l'opération.
5. Une fois validée, la consultation est archivée, l'ordonnance devient immuable et le dossier passe en lecture seule.

## 4. Ce que le médecin doit voir à l'écran
- Lors de l'ouverture : un minuteur de consultation démarre discrètement en haut de l'écran.
- La pastille du patient dans la liste de gauche affiche un indicateur vert pulsant.
- Après clôture : un badge bleu **« Consultation clôturée - Lecture seule »** apparaît en bandeau supérieur. Les boutons de saisie sont verrouillés.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, une fois que vous avez cliqué sur 'Clôturer la consultation', le dossier est archivé conformément aux règles médico-légales pour garantir qu'aucune donnée ne soit modifiée a posteriori. Si vous devez ajouter une précision, vous pouvez créer une note complémentaire ou débuter une consultation de contrôle."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier dans la base de données la table `diagnostics` : le champ `Status` doit avoir la valeur `1` (Clôturée) ou `0` (En cours).
- [ ] Vérifier si la consultation a été ouverte par un autre praticien du cabinet (verrouillage multi-praticien).
- [ ] Confirmer que l'heure de fin (`DateEnd` ou `ClosedAt`) a bien été enregistrée.

## 7. Diagnostic avancé & Système (Niveau 3)
En cas de dysfonctionnement où le bouton de clôture ne répond pas :
1. Ouvrir la console développeur (`Ctrl + Shift + I` sous Electron).
2. Vérifier si une erreur réseau HTTP 400 ou 500 survient sur `PUT /api/consultations/:id/close`.
3. Cause fréquente : champ obligatoire manquant ou contrainte SQL non respectée sur une table liée (ex: acte sans praticien attribué).

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le médecin affirme avoir clôturé la consultation mais elle apparaît toujours "En consultation" sur l'écran d'accueil du secrétariat.
- **Escalader à N3 :** Erreur SQL bloquante empêchant toute sauvegarde ou écriture sur la table `diagnostics`.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Message « Consultation déjà en cours » | Le dossier a été ouvert sur un autre poste du cabinet | Fermer la session sur l'autre poste ou déverrouiller via les paramètres administrateur |
| Impossible de modifier l'ordonnance | La consultation a été clôturée | Utiliser la fonction « Avenant » ou créer une nouvelle prescription de renouvellement |
| Le minuteur ne s'affiche pas | Option d'affichage masquée dans les préférences | Vérifier dans Paramètres > Affichage > « Afficher la durée de consultation » |
