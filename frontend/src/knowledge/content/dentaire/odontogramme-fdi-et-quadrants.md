---
id: "dent-odontogramme-fdi"
title: "Schéma dentaire interactif (Odontogramme FDI), numérotation et quadrants"
category: "dentaire"
tags: ["dentaire", "odontogramme", "fdi", "dents", "quadrants", "caries", "couronnes", "extractions"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "dentistes", "assistantes"]
symptoms_doctor:
  - "Comment marquer un traitement sur la molaire 36 ou 46 ?"
  - "Pourquoi l'onglet 'Dent' n'apparaît pas dans ma consultation ?"
  - "Comment distinguer les dents soignées des dents absentes ?"
keywords: ["dentition adulte", "numérotation internationale", "quadrant 1 2 3 4", "dents de sagesse", "formule dentaire"]
escalation_threshold: "Inversion d'arcade ou problème d'orientation gauche/droite dans l'odontogramme."
muraqib_ref: null
---

# Schéma dentaire interactif (Odontogramme FDI) et quadrants

## 1. Objectif
Présenter l'odontogramme clinique complet destiné aux chirurgiens-dentistes : numérotation internationale FDI à deux chiffres (dents 11 à 48), sélection anatomique par arcade (maxillaire / mandibule) et quadrants, et codification couleur de l'état des dents.

## 2. Où trouver la fonction
- Activé automatiquement pour les profils ayant la spécialité **Chirurgien-Dentiste / Odontologie**.
- Dans la consultation : Onglet **« Dent »** (icône Dent 🦷) dans le volet Fichiers & Examens (`ConsultationFilesPanel.tsx`).
- Historique dentaire global : Bouton **« Voir tout l'historique dentaire »** ouvrant la cartographie buccale complète du patient.

## 3. Système de numérotation FDI et Quadrants
TABIBI utilise le système international de la Fédération Dentaire Internationale (FDI) :
- **Quadrant 1 (Maxillaire supérieur droit) :** Dents 18 (sagesse) à 11 (incisive centrale).
- **Quadrant 2 (Maxillaire supérieur gauche) :** Dents 21 (incisive centrale) à 28 (sagesse).
- **Quadrant 3 (Mandibule inférieure gauche) :** Dents 31 (incisive centrale) à 38 (sagesse).
- **Quadrant 4 (Mandibule inférieure droite) :** Dents 41 (incisive centrale) à 48 (sagesse).

## 4. Étapes exactes d'utilisation
1. Cliquer sur l'onglet **« Dent »** de la consultation.
2. L'arcade dentaire s'affiche avec la représentation anatomique des 32 dents adultes :
   - Dents supérieures (racines vers le haut).
   - Dents inférieures (racines vers le bas).
3. Cliquer sur la dent à examiner (ex: dent `36`) :
   - La dent se surligne en bleu vif.
   - Les actes antérieurs réalisés sur cette dent sont listés immédiatement en dessous.
4. Pour attacher un cliché radiographique (rétro-alvéolaire ou rétro-coronaire) à cette dent spécifique :
   - Garder la dent sélectionnée.
   - Cliquer sur Téléverser ou Numériser : le fichier est préfixé automatiquement `[Dent 36] Nom_Fichier.png`.

## 5. Code couleur de l'odontogramme
- **Blanc avec contour gris :** Dent saine sans traitement enregistré.
- **Vert pastel :** Dent ayant au moins une radiographie rétro-alvéolaire rattachée.
- **Bleu / Teinte spécifique d'acte :** Dent ayant fait l'objet d'un soin (obturation composite, dévitalisation).
- **Gris barré :** Dent extraite ou absente.

## 6. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, si l'onglet 'Dent' n'apparaît pas dans votre consultation, c'est simplement que votre profil utilisateur est configuré en 'Médecine Générale' au lieu de 'Chirurgien-Dentiste'. Il suffit d'activer la spécialité dentaire dans Paramètres > Utilisateurs pour faire apparaître l'odontogramme immédiatement."*

## 7. Vérification technique (Niveau 2)
- [ ] Vérifier dans la table `users` que la colonne `UserType` ou `Speciality` contient `dental` ou `dentist`.
- [ ] Confirmer que le composant `ConsultationFilesPanel.tsx` reçoit bien la propriété `isDentist = true`.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Les clics sur les dents ne mettent pas à jour la liste des actes de la dent sélectionnée.
- **Escalader à N3 :** Discordance de sauvegarde dans la table `patient_dental_status`.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Les dents gauches et droites semblent inversées | Confusion avec la vue miroir du praticien | La dentition est présentée du point de vue du praticien face au patient (la droite du patient est à gauche de l'écran) |
| Impossible de sélectionner plusieurs dents simultanément | Mode sélection multiple non activé | Maintenir la touche `Ctrl` enfoncée pour sélectionner plusieurs dents (ex: bridge 14-16) |
