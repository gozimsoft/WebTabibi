---
id: "dcm-import-etudes"
title: "Importation des études radiologiques DICOM (CD/DVD, USB, PACS)"
category: "dicom"
tags: ["dicom", "imagerie", "scanner", "irm", "radio", "pacs", "import", "cd-rom"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "radiologues", "medecins"]
symptoms_doctor:
  - "Le patient m'a ramené le CD du scanner, comment le lire dans TABIBI ?"
  - "Le logiciel m'affiche 'Aucun fichier DICOM valide détecté sur le disque'"
  - "L'importation de l'IRM prend beaucoup de temps"
keywords: ["fichiers .dcm", "DICOMDIR", "série radiologique", "scanner TDM", "IRM", "tomodensitométrie"]
escalation_threshold: "Fichiers DICOM avec encodage de compression propriétaire (JPEG2000 non supporté sans codec)."
muraqib_ref: null
---

# Importation des études radiologiques DICOM

## 1. Objectif
Guider l'équipe médicale pour importer et indexer des examens radiologiques au standard international DICOM (.dcm, DICOMDIR) provenant de CD/DVD d'imagerie, clés USB de centres de radiologie ou liaisons PACS locales.

## 2. Où trouver la fonction
- Dans le volet **Fichiers & Examens** de la consultation > Onglet **« Radiographie »** avec badge bleu **« DICOM »**.
- Bouton d'action : **« Importer une étude DICOM »** (`DicomUploadModal.tsx`).

## 3. Étapes exactes
1. Insérer le CD du scanner dans le lecteur ou brancher la clé USB du centre d'imagerie.
2. Dans TABIBI, cliquer sur **« Importer étude DICOM »**.
3. Sélectionner le lecteur CD ou le dossier source (ex: `D:\` ou `E:\DICOM`).
4. Le parseur d'imagerie analyse automatiquement l'arborescence :
   - Détection automatique du nom du patient, de la date de l'examen et de la modalité (CT, MR, CR, DX, US).
   - Découpage en séries (ex: *Série 1 : Scout view*, *Série 2 : Coupes axiales 1.5mm*, *Série 3 : Injection produit de contraste*).
5. Cliquer sur **« Rattacher au dossier patient »**.
6. L'examen est indexé et prêt à être visualisé immédiatement.

## 4. Ce que le médecin doit voir à l'écran
- Une barre de progression rapide indiquant le nombre de coupes importées (ex: *120/120 coupes chargées*).
- Dans l'onglet Radiographie, chaque étude s'affiche avec sa miniature représentative, la modalité (ex: `CT`), le nombre de séries et la date du cliché.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, insérez le CD du patient puis cliquez sur 'Importer étude DICOM' dans le panneau Radiographie. Sélectionnez simplement la lettre de votre lecteur CD (par exemple D:). TABIBI va analyser tout le disque et extraire automatiquement les images médicales sans que vous ayez à chercher dans les sous-dossiers."*

## 6. Vérification technique (Niveau 2)
- [ ] Confirmer que le module DICOM Cornerstone.js (`@cornerstonejs/core` et `@cornerstonejs/dicom-image-loader`) est bien initialisé sans erreur WebGL.
- [ ] S'assurer que le dossier source contient bien un fichier `DICOMDIR` ou des extensions `.dcm` standard.

## 7. Diagnostic avancé & Système (Niveau 3)
Si certaines séries sont illisibles :
1. Vérifier la syntaxe de transfert DICOM (`Transfer Syntax UID`).
2. Les syntaxes non compressées (*Explicit VR Little Endian `1.2.840.10008.1.2.1`*) et compressées standard (*JPEG Lossless*) sont supportées nativement.
3. Pour l'interconnexion directe avec un serveur PACS hospitalier via le protocole DICOM C-STORE, consulter la documentation Muraqib [Intégration PACS & Imagerie](file:///muraqib/docs/pacs-cstore).

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le lecteur CD tourne mais le logiciel indique « Aucun fichier trouvé » alors que le CD s'ouvre sous Windows.
- **Escalader à N3 :** Nécessité de configurer les nœuds AETitle et adresses IP pour une liaison PACS automatique en cabinet de radiologie.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Importation très lente | Vitesse de lecture physique du lecteur CD-ROM USB | Copier le dossier DICOM sur le bureau du PC avant d'importer |
| Message « Format DICOM non pris en charge » | Fichier propriétaire d'un constructeur sans export standard | Demander au centre de radiologie un export en DICOM standard non compressé |
| Les coupes sont dans le désordre | Tri par nom de fichier au lieu de la position axiale | Activer l'option « Trier par position spatiale Z (SliceLocation) » |
