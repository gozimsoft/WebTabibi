---
id: "rec-enregistrement-attente"
title: "Enregistrement rapide des arrivées et gestion de la salle d'attente (Secrétariat)"
category: "reception"
tags: ["reception", "secretaire", "arrivee", "salle-attente", "enregistrement", "priorite"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaires", "onboarding"]
symptoms_doctor:
  - "La secrétaire dit que le patient est là mais je ne le vois pas sur mon écran"
  - "Comment changer l'ordre de passage d'un patient prioritaire ou handicapé ?"
  - "Un patient se présente sans rendez-vous, comment le faire entrer ?"
keywords: ["accueil", "file d'attente", "ordre de passage", "prioritaire", "sans rdv"]
escalation_threshold: "Défaut de synchronisation réseau entre l'écran d'accueil et le poste de consultation du médecin."
muraqib_ref: null
---

# Enregistrement des arrivées et gestion de la salle d'attente

## 1. Objectif
Présenter le flux de travail de la secrétaire médicale pour accueillir les patients, enregistrer leur heure d'arrivée, gérer les cas sans rendez-vous (urgences, délégués médicaux) et transmettre en direct la liste d'attente au médecin.

## 2. Où trouver la fonction
- Menu principal gauche : **Accueil / Réception** (`ReceptionDashboard.tsx`).
- Sur chaque fiche de rendez-vous du jour : Bouton d'action **« Arrivé »** (pastille verte) et case à cocher **« Prioritaire »**.

## 3. Étapes exactes
### Cas A : Patient ayant déjà un rendez-vous planifié
1. Repérer le patient dans la liste des rendez-vous du jour (recherche rapide par nom ou heure).
2. Cliquer sur le bouton vert **« Arrivé »**.
3. L'heure d'arrivée réelle s'enregistre (ex: `09:42`).
4. Si le patient nécessite un passage prioritaire (nourrisson fébrile, personne âgée, urgence), cocher l'option **« Urgent / Prioritaire »** : la carte prend un liseré rouge et remonte en haut de la file d'attente.

### Cas B : Patient sans rendez-vous préalable
1. Cliquer sur le bouton supérieur **« + Ajouter un sans rendez-vous »**.
2. Rechercher le patient par nom ou téléphone (ou créer sa fiche en 30 secondes s'il s'agit d'une première visite).
3. Sélectionner le médecin traitant souhaité et le motif de visite (ex: *Consultation générale sans RDV*).
4. Cliquer sur **« Insérer en salle d'attente »** : le patient s'ajoute immédiatement à la file active du praticien.

## 4. Ce que la secrétaire et le médecin doivent voir
- Sur l'écran Réception : un compteur en temps réel affiche le nombre total de patients en salle d'attente (ex: *4 patients en attente*).
- Sur l'écran du médecin : la liste de gauche ou la vue cartes s'actualise sans rechargement de page.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Pour faire entrer un patient sans rendez-vous, la secrétaire clique simplement sur le bouton '+ Sans RDV' en haut à droite de l'écran d'accueil. Elle choisit le médecin et le patient est immédiatement envoyé dans la salle d'attente du docteur."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier que la table `appointments` ou `waiting_queue` contient bien une ligne avec `Status = 'arrived'` ou `'waiting'`.
- [ ] S'assurer que le champ `Doctor_id` correspond exactement à l'identifiant du médecin connecté.

## 7. Diagnostic avancé & Système (Niveau 3)
Si le médecin ne voit pas les patients marqués comme arrivés :
1. Vérifier si les deux postes sont connectés au même serveur local (même adresse IP).
2. Contrôler les requêtes API : `GET /api/calendar/waiting` doit renvoyer un statut HTTP 200 avec la liste des patients du jour.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le bouton 'Arrivé' ne change pas de couleur et n'enregistre pas l'heure.
- **Escalader à N3 :** Déconnexion répétée du flux temps réel entre le poste secrétaire et le serveur local.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Le patient a été mis chez le mauvais médecin | Sélection erronée du praticien lors de l'enregistrement | Cliquer sur la fiche du patient et réassigner le bon médecin dans le menu déroulant |
| Le patient est parti avant la consultation | Abandon de visite | Cliquer sur les trois points de la carte et choisir « Annulé / Parti » |
