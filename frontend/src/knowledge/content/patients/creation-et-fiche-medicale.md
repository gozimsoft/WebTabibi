---
id: "pat-creation-fiche"
title: "Création d'un dossier patient, recherche multicritères et fiche d'identité médicale"
category: "patients"
tags: ["patients", "creation", "recherche", "fiche-medicale", "telephone", "reference", "civilite"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaires", "medecins"]
symptoms_doctor:
  - "Comment créer un dossier rapidement sans remplir tous les champs ?"
  - "La référence patient est-elle générée automatiquement ?"
  - "Comment retrouver un patient dont je ne connais que l'année de naissance ?"
keywords: ["nouveau patient", "nom", "prénom", "numéro de dossier", "téléphone", "recherche rapide"]
escalation_threshold: "Doublons de référence patient ou blocage lors de l'enregistrement de l'état civil."
muraqib_ref: null
---

# Création d'un dossier patient et fiche médicale

## 1. Objectif
Permettre la création instantanée d'une fiche patient complète ou express (pour les urgences), attribuer un identifiant unique (référence dossier), et exploiter le moteur de recherche multicritères de TABIBI.

## 2. Où trouver la fonction
- Menu principal gauche : **Patients > Liste des patients**.
- Raccourci global dans la barre supérieure : Bouton **« + Nouveau Patient »** (accessible depuis n'importe quel écran).
- Raccourci clavier de recherche : **`Ctrl + F`** ou **`F3`**.

## 3. Étapes exactes
### Création express d'un patient (moins de 20 secondes)
1. Cliquer sur le bouton **« + Nouveau Patient »**.
2. Renseigner les champs minimaux indispensables :
   - **Nom & Prénom** (ex: *BENALI Mourad*).
   - **Date de naissance ou Âge approximatif** (si date exacte inconnue, taper l'âge : ex: *45 ans*, le système calcule l'année).
   - **Genre :** Homme / Femme.
   - **Numéro de téléphone portable :** Indispensable pour la recherche rapide et les notifications SMS.
3. La **Référence dossier** (ex: `REF-BEN-001`) est générée automatiquement de manière séquentielle et unique.
4. Cliquer sur **« Enregistrer & Ouvrir le dossier »** ou **« Enregistrer & Mettre en salle d'attente »**.

### Recherche multicritères d'un patient
Dans le champ de recherche global, le médecin peut taper indifféremment :
- Le nom ou le prénom (en caractères latins ou arabes).
- Les 6 à 8 derniers chiffres du numéro de mobile.
- La référence du dossier (ex: `001`).
- La ville ou le groupe sanguin.

## 4. Ce que le médecin doit voir à l'écran
- Lors de la saisie : si un patient porte un nom similaire, une alerte orange non-bloquante prévient : *« 1 homonyme trouvé dans la base »*.
- Une fois créé : la fiche patient s'ouvre avec un résumé clinique (âge, photo/avatar, constantes récentes, antécédents et dernier passage).

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Pour enregistrer un patient en vitesse, seuls le nom, le prénom et le numéro de téléphone sont nécessaires. Vous pouvez entrer l'âge directement (ex: 35) si vous n'avez pas la date de naissance complète sous les yeux. La référence du dossier est créée automatiquement par TABIBI."*

## 6. Vérification technique (Niveau 2)
- [ ] Confirmer que la table `patients` génère un identifiant UUID unique (`ID` de type `CHAR(36)`).
- [ ] Vérifier que la colonne `Reference` est correctement indexée en base pour garantir une recherche instantanée sur de gros volumes (>20 000 dossiers).

## 7. Diagnostic avancé & Système (Niveau 3)
En cas d'erreur `Duplicate entry for key Reference` :
1. Vérifier la séquence de génération des références dans la table `clinic_settings`.
2. S'assurer qu'aucun script d'importation externe n'a inséré des références en doublon.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le bouton 'Enregistrer' ne réagit pas lors de la saisie d'un nouveau patient.
- **Escalader à N3 :** Conflit d'intégrité référentielle SQL sur l'identifiant patient.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Message « Le numéro de téléphone existe déjà » | Patient déjà enregistré lors d'une visite antérieure | Ouvrir la fiche existante proposée par l'alerte |
| Date de naissance impossible à sélectionner | Année au format invalide | Saisir directement l'âge en chiffres dans la case à côté |
