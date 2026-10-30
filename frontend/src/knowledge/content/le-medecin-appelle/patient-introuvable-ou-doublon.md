---
id: "call-patient-introuvable"
title: "Scénario d'urgence : Patient introuvable dans la recherche ou création de doublon"
category: "le-medecin-appelle"
tags: ["le-medecin-appelle", "urgence", "patient", "recherche", "doublon", "fusion", "support-n1"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support"]
symptoms_doctor:
  - "Je cherche mon patient habituel et la recherche ne donne aucun résultat"
  - "La secrétaire a recréé un patient qui existait déjà sous un autre nom"
  - "Il y a deux dossiers pour la même personne, comment les fusionner ?"
keywords: ["introuvable", "perdu", "homonyme", "faute de frappe", "numéro de dossier", "téléphone"]
escalation_threshold: "Doublon comportant des antécédents médicaux critiques dispersés sur deux identifiants distincts."
muraqib_ref: null
---

# Scénario d'urgence : Patient introuvable ou création de doublon

## 1. Objectif
Guider l'équipe support pour retrouver immédiatement un dossier patient « égaré » lors d'une faute d'orthographe (variations de transcription arabe/français), et apporter la solution en cas de création accidentelle d'une fiche en doublon.

## 2. Où trouver la fonction
- Barre de recherche globale en haut de l'application (accessible partout via raccourci **`F3`** ou **`Ctrl + F`**).
- Menu **Patients > Liste des patients**.
- Pour la fusion : **Gestion des patients > Outils administratifs > Fusionner deux dossiers**.

## 3. Étapes exactes (Arbre de recherche rapide N1)
1. **Étape 1 — Recherche par numéro de téléphone :**
   - Demander au médecin de taper les 6 à 8 derniers chiffres du numéro de mobile dans la barre de recherche. C'est l'identifiant le plus discriminant contre les fautes d'orthographe.
2. **Étape 2 — Recherche par date de naissance ou référence :**
   - Taper l'année de naissance (ex: `1982`) ou le numéro de dossier (ex: `REF-AOU`).
3. **Étape 3 — Variations orthographiques courantes en Algérie :**
   - Remplacer `OU` par `O` (ex: *AOUES* vs *AOUIES*).
   - Remplacer `K` par `Q` (ex: *KACEMI* vs *QACEMI*).
   - Remplacer `BEN` attaché par `BEN ` séparé (ex: *BENALI* vs *BEN ALI*).
4. **Si le doublon a déjà été créé :**
   - Continuer la consultation sur le dossier du jour.
   - Prévoir la fusion en fin de journée via l'outil de fusion de dossiers.

## 4. Ce que le médecin doit voir à l'écran
- Dès la saisie de 2 lettres dans la barre de recherche, une liste déroulante instantanée affiche les noms, prénoms, âges et numéros de téléphone.
- Lors de la création d'un nouveau patient, si un homonyme existe déjà avec la même date de naissance, un panneau d'avertissement jaune prévient : **« Attention : Un patient similaire existe déjà dans la base »**.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, pour contourner les fautes d'orthographe sur le nom de famille, tapez simplement le numéro de téléphone portable du patient dans la barre de recherche. Vous retrouverez son dossier à coup sûr sans risquer de créer un doublon."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier si le patient n'a pas été marqué comme « Archivé » ou « Dormant » (colonne `DormantAt` non nulle dans la table `patients`).
- [ ] S'assurer que le filtre de recherche n'est pas limité à un médecin spécifique alors que le patient a été créé sous un autre praticien du cabinet.
- [ ] Lancer la requête SQL de recherche floue si besoin :
  ```sql
  SELECT ID, FullName, Phone, BirthDate FROM patients WHERE FullName LIKE '%MOT_CLE%' OR Phone LIKE '%NUMERO%';
  ```

## 7. Diagnostic avancé & Système (Niveau 3)
Procédure de fusion de dossiers médicaux en base :
1. Identifier le `Master_ID` (le dossier le plus ancien ou le plus complet) et le `Duplicate_ID`.
2. Mettre à jour les clés étrangères des consultations, fichiers et ordonnances :
   ```sql
   UPDATE diagnostics SET Patient_ID = 'MASTER_ID' WHERE Patient_ID = 'DUPLICATE_ID';
   UPDATE appointments SET Patient_ID = 'MASTER_ID' WHERE Patient_ID = 'DUPLICATE_ID';
   UPDATE patients SET IsDeleted = 1 WHERE ID = 'DUPLICATE_ID';
   ```

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le patient existe en base de données mais n'apparaît dans aucun résultat de recherche de l'interface.
- **Escalader à N3 :** Nécessité d'exécuter un script SQL de fusion complexe de dossiers comportant des antécédents médicaux vitaux.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| La recherche ne renvoie que 5 résultats | Limitation par défaut du menu autocomplété | Appuyer sur Entrée pour afficher la page de résultats complète |
| Le patient apparaît en rouge avec cadenas | Patient désactivé ou archivé | Cocher l'option « Inclure les patients archivés » dans les filtres |
| Nom écrit en arabe introuvable en français | La fiche a été créée avec la graphie arabe | Effectuer la recherche avec le clavier en langue arabe |
