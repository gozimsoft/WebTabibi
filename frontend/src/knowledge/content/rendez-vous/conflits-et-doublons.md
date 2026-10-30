---
id: "rdv-conflits-doublons"
title: "Résolution des conflits d'horaires et détection des doublons de RDV"
category: "rendez-vous"
tags: ["rendez-vous", "conflit", "chevauchement", "doublon", "creneau", "alerte"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "onboarding", "tech"]
symptoms_doctor:
  - "Deux patients ont été calés à la même heure (14h00)"
  - "Le système me bloque et m'affiche 'Créneau déjà occupé'"
  - "Comment forcer un surbooking pour un patient urgent ?"
keywords: ["chevauchement", "surbooking", "créneau occupé", "collision", "double réservation"]
escalation_threshold: "Doublons fantômes récurrents générés par une latence de synchronisation multi-utilisateurs."
muraqib_ref: null
---

# Résolution des conflits d'horaires et détection des doublons de RDV

## 1. Objectif
Comprendre le fonctionnement du moteur de détection des conflits d'agenda dans TABIBI, savoir comment autoriser un surbooking maîtrisé (urgence médicale) et éviter les collisions de créneaux entre praticiens.

## 2. Où trouver la fonction
- Dans la fenêtre de création de rendez-vous : **Nouveau Rendez-vous** (`AppointmentModal.tsx`).
- Sur la grille du calendrier : Indication visuelle en rayures obliques ou alerte orange.
- Dans les paramètres du cabinet : **Paramètres > Agenda > Règles de chevauchement**.

## 3. Étapes exactes
1. Lors de la saisie d'un rendez-vous, choisir le patient, le praticien, la date et l'heure de début.
2. Si un autre rendez-vous chevauche cet intervalle :
   - Le système affiche une alerte contextuelle orange : *« Conflit détecté avec [Nom du patient existant] de 14:00 à 14:30 »*.
3. **Cas normal :** Choisir le créneau libre suivant proposé automatiquement (bouton *« Proposer 14:30 »*).
4. **Cas d'urgence (Surbooking exceptionnel) :**
   - Si les autorisations du rôle le permettent, cocher la case **« Forcer le créneau (Urgence / Dépassement) »**.
   - Le rendez-vous s'insère alors en parallèle avec un marqueur d'avertissement.

## 4. Ce que le médecin doit voir à l'écran
- Sur la vue hebdomadaire ou journalière : deux colonnes étroites juxtaposées au sein du même créneau horaire, permettant de voir immédiatement les deux patients côte à côte.
- Une étiquette orange **« Surbooking »** apparaît sur la fiche d'attente du secrétariat.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"L'alerte de conflit est une sécurité pour éviter les retards en salle d'attente. Si vous souhaitez impérativement recevoir le patient en urgence sur la même tranche horaire, cochez simplement la case 'Forcer le créneau' en bas de la fenêtre de rendez-vous."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier la durée par défaut configurée pour chaque type de consultation (15 min, 20 min, 30 min) dans `appointment_types`.
- [ ] S'assurer que le paramètre `allow_overbooking` n'est pas restreint aux seuls administrateurs si la secrétaire ne parvient pas à forcer.
- [ ] Confirmer qu'il s'agit bien du même médecin (si le cabinet compte plusieurs médecins, deux RDV simultanés sont normaux s'ils sont affectés à des docteurs différents).

## 7. Diagnostic avancé & Système (Niveau 3)
Si des conflits apparaissent sans rendez-vous visible à l'écran :
1. Vérifier si un rendez-vous archivé ou annulé n'a pas son drapeau `IsDeleted = 0` actif.
2. Requête SQL d'inspection des créneaux actifs :
   ```sql
   SELECT ID, Patient_ID, Doctor_id, StartTime, EndTime, Status 
   FROM appointments 
   WHERE Doctor_id = 'DOCTOR_ID' AND Date = 'YYYY-MM-DD' AND (IsDeleted = 0 OR IsDeleted IS NULL);
   ```

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le logiciel bloque complètement l'enregistrement même lorsque l'option 'Forcer' est cochée.
- **Escalader à N3 :** Rendez-vous invisibles sur l'interface mais bloquant systématiquement la réservation de certains créneaux horaires.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Message « Impossible d'enregistrer : créneau indisponible » | Paramètre de surbooking désactivé pour ce profil | Activer l'autorisation 'Autoriser le surbooking' dans les rôles |
| Le créneau apparaît libre mais est refusé | Présence d'une pause ou indisponibilité configurée | Vérifier les plages d'indisponibilité / congés dans l'agenda |
| Deux médecins voient les RDV de l'autre | Filtre de praticien configuré sur « Tous les praticiens » | Filtrer l'agenda sur le profil du médecin connecté |
