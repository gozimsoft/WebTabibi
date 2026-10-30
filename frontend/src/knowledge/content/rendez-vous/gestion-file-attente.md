---
id: "rdv-file-attente"
title: "Gestion de la file d'attente et synchronisation Secrétariat ↔ Médecin"
category: "rendez-vous"
tags: ["rendez-vous", "salle-attente", "synchronisation", "secretaire", "statut", "temps-reel"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "onboarding", "tech"]
symptoms_doctor:
  - "La secrétaire a fait entrer le patient mais il n'apparaît pas sur mon écran"
  - "Comment changer l'ordre de passage des patients ?"
  - "La liste des patients d'aujourd'hui ne s'actualise pas"
keywords: ["arrivée", "temps réel", "ordre de passage", "priorité", "actualisation"]
escalation_threshold: "Défaut de synchronisation WebSocket / Polling entre le poste d'accueil et le poste médical."
muraqib_ref: null
---

# Gestion de la file d'attente et synchronisation Secrétariat ↔ Médecin

## 1. Objectif
Assurer un flux fluide entre l'accueil (secrétariat) et le cabinet médical : enregistrement de l'arrivée du patient, mise en attente, affichage de l'ordre de passage en temps réel et bascule instantanée en consultation.

## 2. Où trouver la fonction
- **Poste Secrétariat :** Écran principal **Réception / Tableau de bord d'accueil** (`ReceptionDashboard.tsx`).
- **Poste Médecin :** Écran **Planning & Salle d'attente** (`CalendarPage.tsx`) avec les bascules de vue : **Vue Cartes** (`WaitingCardsView`) et **Vue Tableau** (`WaitingTableView`).

## 3. Étapes exactes
1. **À l'arrivée du patient :** La secrétaire clique sur le bouton **« Arrivé »** à côté du rendez-vous du jour.
2. L'heure précise d'arrivée est enregistrée (ex: `10:14`). Le patient passe en statut **« En attente »** (vert/jaune).
3. **Sur le poste du médecin :** La liste d'attente se rafraîchit automatiquement en temps réel.
4. Le médecin visualise le temps d'attente écoulé (ex: *« Attente : 18 min »*).
5. Pour faire entrer le patient : le médecin clique sur **« Appeler / Commencer »**.
6. Le statut bascule sur les deux postes en **« En consultation »**.

## 4. Ce que le médecin doit voir à l'écran
- Un compteur numérique en haut de la colonne : ex: **En attente (4)**.
- Des cartes ordonnées chronologiquement selon l'heure d'arrivée réelle ou l'heure de RDV initial.
- Une pastille prioritaire rouge si la secrétaire a coché la case **« Urgent / Prioritaire »**.
- En cas de consultation en cours, un bandeau en haut rappelle le nom du patient actuellement dans le cabinet.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, vérifiez si le filtre en haut de votre salle d'attente est bien sur 'Tous les arrivés' et non sur une date passée. Vous pouvez aussi cliquer sur le bouton d'actualisation (icône flèches circulaires) en haut à droite pour forcer la mise à jour immédiate."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier la connectivité LAN entre les deux postes : les deux machines doivent joindre la même adresse IP du serveur local TABIBI (port 5000).
- [ ] Vérifier que le polling automatique (toutes les 15 à 30 secondes) ou le flux d'événements Socket est actif sans coupure réseau.
- [ ] S'assurer que les horloges système de Windows sont synchronisées à la même minute sur les deux ordinateurs.

## 7. Diagnostic avancé & Système (Niveau 3)
Si la synchronisation ne s'effectue qu'après redémarrage du logiciel :
1. Vérifier si le pare-feu Windows sur le poste serveur bloque les requêtes entrantes sur le port `5000`.
2. Inspecter les logs réseau du navigateur client (`Network > fetch /api/calendar/waiting`).
3. Pour les diagnostics de configuration réseau multi-postes, consulter le guide Muraqib [Réseau Local & Pare-feu](file:///muraqib/docs/network-lan).

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le statut change côté secrétaire mais ne s'affiche jamais côté médecin sans fermer complètement TABIBI.
- **Escalader à N3 :** Erreurs d'accès concurrent SQL de type *Deadlock* lors de la prise simultanée de RDV.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Le patient apparaît absent alors qu'il est en salle | La secrétaire n'a pas validé le bouton 'Arrivé' | Demander à la secrétaire de cliquer sur la coche verte 'Arrivé' |
| Décalage de 1 heure sur les heures d'arrivée | Fuseau horaire Windows différent entre les 2 PC | Régler le fuseau horaire de Windows sur `(UTC+01:00) Alger` sur tous les postes |
| Impossible de réordonner les patients | La vue est triée par ordre strict d'horaire | Basculer en mode 'Tri par ordre d'arrivée réelle' |
