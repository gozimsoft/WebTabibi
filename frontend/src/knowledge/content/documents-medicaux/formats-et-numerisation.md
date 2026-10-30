---
id: "doc-formats-numerisation"
title: "Formats acceptés, numérisation directe (Webcam/Scanner) et stockage GED"
category: "documents-medicaux"
tags: ["documents", "ged", "scan", "webcam", "pdf", "dicom", "wia", "taille-fichier"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "onboarding", "tech"]
symptoms_doctor:
  - "Je veux scanner une ordonnance ramenée par le patient"
  - "La webcam ne s'ouvre pas pour photographier le bilan"
  - "Le fichier est trop volumineux et refuse de se charger"
keywords: ["appareil photo", "numériseur", "pièce jointe", "résolution", "format d'image"]
escalation_threshold: "Crash mémoire du client lors de l'importation de documents très haute résolution (>25 MB)."
muraqib_ref: null
---

# Formats acceptés, numérisation directe (Webcam/Scanner) et stockage GED

## 1. Objectif
Présenter la chaîne d'acquisition de pièces jointes médicales dans TABIBI : formats autorisés (PDF, JPEG, PNG, DICOM), utilisation de la webcam HD intégrée, interfaçage avec les scanners à plat ou à défilement USB (WIA/TWAIN), et bonnes pratiques de compression.

## 2. Où trouver la fonction
- Depuis le dossier patient : Fenêtre **Archives Médicales & Documents** (`PatientFilesModal.tsx`).
- Depuis la consultation : Volet rétractable droit **Fichiers & Examens** (`ConsultationFilesPanel.tsx`).
- Boutons d'action : **« Téléverser un fichier »** et **« Numériser / Webcam »**.

## 3. Étapes exactes
### Numérisation via Webcam USB
1. Cliquer sur **« Numériser / Webcam »**.
2. Placer le document papier sous la caméra ou diriger l'objectif vers la zone à photographier.
3. Cliquer sur **« Capturer l'image »**.
4. Ajuster si nécessaire : Rotation 90°, Contraste, Luminosité, Recadrage.
5. Saisir le titre (ex: `Bilan_Cardio_Externe_2026.jpg`) et choisir la catégorie (Biologie, Radio, Ordonnance).
6. Valider : le cliché est converti et archivé dans le dossier du patient.

### Numérisation via Scanner USB / Réseau (Dossier partagé)
1. TABIBI surveille automatiquement le dossier de dépôt local (ex: `C:\Scanner\`).
2. Dès que le document est scanné sur le copieur, il apparaît dans l'onglet **« Fichiers du scanner »**.
3. Cliquer sur **« Importer »** pour le rattacher en un clic au patient actif.

## 4. Ce que le médecin doit voir à l'écran
- Lors de l'acquisition webcam : flux vidéo fluide 30 fps avec mire de guidage A4.
- Après téléversement : miniature générée instantanément avec badge de type (PDF, IMAGE ou DICOM).
- Si le fichier est un nouveau bilan reçu, un badge bleu **« NOUVEAU »** apparaît tant que le médecin ne l'a pas consulté.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, TABIBI accepte les fichiers PDF, PNG, JPG et les imageries DICOM jusqu'à 20 Mo par document. Si vous utilisez la webcam, assurez-vous qu'aucune autre application (Skype, WhatsApp, Zoom) n'occupe la caméra au même moment."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier les autorisations d'accès à la caméra dans Windows : **Paramètres Windows > Confidentialité > Caméra > Autoriser les applications de bureau**.
- [ ] Confirmer que le chemin du scanner configuré (`scannerFolderPath`) existe bien sur le disque dur local (`C:\Scanner\`).
- [ ] S'assurer que le payload binaire en base64 ne dépasse pas la limite du serveur Express (`limit: '50mb'` dans `server/src/index.ts`).

## 7. Diagnostic avancé & Système (Niveau 3)
En cas d'échec répété d'importation :
1. Vérifier la taille du document dans `patientfiles` (colonne `FileData` de type `LONGBLOB`).
2. Contrôler le paramètre MySQL `max_allowed_packet` (recommandé : minimum `64M`).
3. Pour la configuration réseau des scanners multifonctions, consulter la documentation Muraqib [Imagerie & Scanners](file:///muraqib/docs/scanners-storage).

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Périphérique webcam reconnu par Windows mais affichant un écran noir dans TABIBI.
- **Escalader à N3 :** Erreur MySQL `Packet too large` lors de la synchronisation de séries radiologiques volumineuses.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| « Impossible d'accéder à la caméra » | Caméra verrouillée par un autre logiciel ou pilote non signé | Fermer les autres logiciels utilisant la vidéo et reconnecter la prise USB |
| « Erreur de téléversement : fichier trop lourd » | Fichier dépassant la taille limite autorisée | Réduire la résolution de scan à 150 ou 200 DPI (amplement suffisant pour le texte) |
| Le PDF ne s'affiche pas dans la visionneuse | Fichier PDF corrompu ou protégé par un mot de passe | Ouvrir le PDF dans Adobe Reader pour vérifier s'il exige un mot de passe |
