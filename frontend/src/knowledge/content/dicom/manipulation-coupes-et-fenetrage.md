---
id: "dcm-coupes-fenetrage"
title: "Navigation dans les coupes axiales, fenêtrage (WW/WL) et outils de mesure DICOM"
category: "dicom"
tags: ["dicom", "fenetrage", "hounsfield", "zoom", "mesure", "caliper", "densite"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecins", "chirurgiens"]
symptoms_doctor:
  - "L'image du scanner est toute blanche, je ne vois pas les organes"
  - "Comment passer en fenêtre osseuse ou parenchymateuse ?"
  - "Comment mesurer la taille exacte d'une lésion en millimètres ?"
keywords: ["fenêtre osseuse", "fenêtre médiastinale", "unités Hounsfield", "règle", "défilement des coupes"]
escalation_threshold: "Incohérence du calcul d'échelle de mesure mm causée par des métadonnées PixelSpacing corrompues."
muraqib_ref: null
---

# Navigation dans les coupes axiales, fenêtrage (WW/WL) et mesures DICOM

## 1. Objectif
Maîtriser les fonctionnalités diagnostiques du visualiseur DICOM intégré (`DicomViewer.tsx`) : défilement fluide des coupes tomographiques (scrolling), ajustement de la fenêtre de contraste en Unités Hounsfield (fenêtre poumon, médiastin, os, cerveau) et prise de mesures calibrées au millimètre près.

## 2. Où trouver la fonction
- En cliquant sur une étude DICOM dans le volet Radiographie de la consultation.
- Barre d'outils supérieure du visualiseur : Sélecteur de fenêtrage **WW/WL**, Icône de mesure **Caliper / Règle**, Icône d'inversion et Plein écran.

## 3. Étapes exactes
### Défilement des coupes (Slices)
1. Placer le curseur au-dessus de l'image.
2. Faire rouler la molette de la souris vers le haut ou vers le bas pour faire défiler les coupes axiales de haut en bas (ex: coupe 24/180).
3. Le numéro de coupe et la position spatiale (en mm) sont affichés en surimpression en bas à droite.

### Ajustement du fenêtrage (Window Width / Window Level)
1. Cliquer sur le menu déroulant **« Fenêtre »** et choisir le profil anatomique désiré :
   - **Médiastin / Tissus mous :** WW 350 / WL 40.
   - **Os / Squelette :** WW 1800 / WL 400 (met en évidence les fractures).
   - **Parenchyme Pulmonaire :** WW 1500 / WL -600 (met en évidence les nodules et condensations).
   - **Cerveau / AVC :** WW 80 / WL 40.
2. Pour un réglage libre continu : maintenir le **clic droit** et déplacer la souris (gauche/droite pour le contraste, haut/bas pour la luminosité).

### Mesure millimétrique d'une lésion
1. Cliquer sur l'outil **Règle (Mesure)**.
2. Cliquer sur le point de départ de la lésion et glisser jusqu'au point d'arrivée.
3. TABIBI calcule immédiatement la distance exacte en s'appuyant sur le `PixelSpacing` certifié du scanner (ex: `14.2 mm`).

## 4. Ce que le médecin doit voir à l'écran
- En surimpression (HUD médical) : Nom du patient, date de l'examen, épaisseur de coupe, et valeurs actuelles de WW / WL.
- En plein écran : un affichage haute fidélité sans perte de dynamique radiologique (profondeur 12 bits ou 16 bits).

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, si l'image du scanner est trop blanche ou trop sombre, cliquez sur le bouton 'Fenêtre' en haut du visualiseur et choisissez 'Poumon' ou 'Os'. Vous pouvez aussi maintenir le clic droit de la souris enfoncé et bouger la souris pour régler le contraste en direct."*

## 6. Vérification technique (Niveau 2)
- [ ] Confirmer que le visualiseur charge les métadonnées `WindowWidth` (0028,1051) et `WindowCenter` (0028,1050) du fichier DICOM.
- [ ] Vérifier que l'accélération matérielle WebGL 2.0 est fonctionnelle sur la carte graphique du poste médical.

## 7. Diagnostic avancé & Système (Niveau 3)
Si les mesures affichent des valeurs fantaisistes (ex: 500 cm pour une vertèbre) :
1. Inspecter les balises DICOM `(0028,0030) PixelSpacing` et `(0018,0050) SliceThickness`.
2. Si le constructeur de la radio n'a pas étalonné le PixelSpacing, le visualiseur bascule en mode pixels bruts et affiche un avertissement de mesure non calibrée.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le défilement de la molette ne fait pas tourner les coupes du scanner.
- **Escalader à N3 :** Crash du composant WebGL lors de l'ouverture de volumes 3D supérieurs à 500 coupes.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| L'outil de mesure ne s'arrête pas de tracer | Double-clic non effectué pour clore la mesure | Double-cliquer pour fixer le point final de la règle |
| L'inversion noir/blanc est inversée par défaut | Cliché en mode Monochrome 1 au lieu de Monochrome 2 | Cliquer sur l'icône 'Inverser' (Soleil/Lune) pour rétablir la vue standard |
