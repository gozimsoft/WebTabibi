---
id: "doc-comparaison-visionneuse"
title: "Visionneuse plein cadre, zoom, rotation et comparaison côte à côte (Touche C)"
category: "documents-medicaux"
tags: ["documents", "visionneuse", "comparaison", "zoom", "rotation", "annotation", "raccourcis"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "onboarding", "tech"]
symptoms_doctor:
  - "Comment comparer la radio d'aujourd'hui avec celle de l'année dernière ?"
  - "L'image est à l'envers, comment la faire pivoter ?"
  - "Comment voir le cliché en plein écran sur un second moniteur ?"
keywords: ["juxtaposer", "loupe", "pivoter 90", "lightbox", "split screen", "antériorité"]
escalation_threshold: "Blocage de l'interface ou plantage de l'accélération matérielle lors du zoom sur de grands clichés."
muraqib_ref: null
---

# Visionneuse plein cadre, zoom, rotation et comparaison côte à côte

## 1. Objectif
Présenter les outils d'aide au diagnostic visuel intégrés à la visionneuse médicale TABIBI : navigation clavier, grossissement fluide, rotation sans perte, annotations cliniques et comparaison simultanée de deux examens (ex: contrôle post-opératoire vs radio initiale).

## 2. Où trouver la fonction
- Ouvrir la fenêtre **Archives Médicales & Documents** (`PatientFilesModal.tsx`).
- Raccourci clavier rapide : Appuyer sur la touche **`C`** pour activer le mode Comparaison, ou cliquer sur **« Comparer côte à côte »** dans la barre d'outils.

## 3. Étapes exactes
### Visualisation et manipulation d'un document
1. Cliquer sur le document dans la liste de gauche.
2. Utiliser la barre d'outils flottante supérieure :
   - **Zoom :** Molette de la souris ou boutons `+` / `-`.
   - **Déplacement :** Clic gauche maintenu pour déplacer l'image agrandie.
   - **Rotation :** Bouton `⟳ 90°` pour redresser un cliché orienté à l'envers.
   - **Plein écran :** Touche `S` ou bouton d'agrandissement plein écran.

### Comparaison côte à côte de deux examens
1. Sélectionner le premier examen (ex: *Radio Thorax 2026*).
2. Appuyer sur la touche **`C`** (ou bouton *« Comparer côte à côte »*).
3. L'écran se divise en deux volets synchronisés.
4. Dans le volet droit, sélectionner dans la liste déroulante l'examen antérieur à comparer (ex: *Scanner TDM 2025*).
5. Pour quitter la comparaison : réappuyer sur **`C`** ou cliquer sur **« Quitter la comparaison »**.

## 4. Ce que le médecin doit voir à l'écran
- En mode normal : le cliché occupe le centre de l'écran avec fond sombre optimisé pour la radiologie.
- En mode comparaison : deux panneaux égaux 50% / 50% avec leurs propres outils de zoom et métadonnées respectives (date, praticien).
- Les raccourcis clavier sont rappelés en haut : `↑/↓ : Naviguer | C : Comparer | W : Fenêtre | S : Plein cadre | Échap : Quitter`.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, pour comparer deux clichés, appuyez simplement sur la touche 'C' de votre clavier quand le premier document est ouvert. Un second volet va s'ouvrir à droite pour choisir l'autre examen et les regarder côte à côte."*

## 6. Vérification technique (Niveau 2)
- [ ] Confirmer que le composant `PatientFilesModal.tsx` charge bien le deuxième document via l'appel API `/api/patients/:id/files/:fileId`.
- [ ] Vérifier que le format MIME retourné est correct (`image/png`, `image/jpeg` ou `application/pdf`).
- [ ] S'assurer que le navigateur dispose de l'accélération matérielle graphique activée pour une navigation fluide.

## 7. Diagnostic avancé & Système (Niveau 3)
Si les images s'affichent floues ou saccadent :
1. Vérifier si l'affichage Electron n'a pas désactivé l'accélération GPU (`disable-gpu`).
2. S'assurer que la conversion Base64 vers Blob URL (`createBlobUrl`) libère bien les anciens objets via `URL.revokeObjectURL()` pour éviter les fuites de mémoire vive.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le second panneau reste blanc ou le sélecteur déroulant ne liste aucun document.
- **Escalader à N3 :** Fuite mémoire saturant la RAM du poste médical après plusieurs dizaines de manipulations d'imagerie.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Le zoom est bloqué | La souris est positionnée en dehors du cadre de l'image | Placer le curseur directement au-dessus du cliché avant de tourner la molette |
| La rotation n'est pas mémorisée | La rotation est un outil de consultation temporaire | Utiliser l'outil de recadrage/pivotement dans la webcam pour sauvegarder l'orientation définitive |
| Impossible de comparer deux PDF multipages | La comparaison est optimisée pour les clichés d'imagerie et fiches de résultats | Consulter les PDF consécutivement via les flèches du clavier |
