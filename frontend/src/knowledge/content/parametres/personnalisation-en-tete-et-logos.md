---
id: "par-personnalisation-en-tete"
title: "Personnalisation du papier à en-tête, coordonnées du cabinet et logos d'ordonnances"
category: "parametres"
tags: ["parametres", "en-tete", "logo", "ordonnance", "coordonnees", "ordre-medecins", "mise-en-page"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecins", "onboarding"]
symptoms_doctor:
  - "Comment mettre le logo de ma clinique sur l'ordonnance ?"
  - "Mon numéro de téléphone de cabinet a changé, comment le modifier ?"
  - "Je veux imprimer sur du papier pré-imprimé sans le haut de page"
keywords: ["papier pré-imprimé", "logo clinique", "numéro d'inscription", "titres et diplômes", "marges d'impression"]
escalation_threshold: "Déformation géométrique du logo ou décalage de marge sur papier pré-imprimé sécurisé."
muraqib_ref: null
---

# Personnalisation de l'en-tête et logos d'ordonnances

## 1. Objectif
Configurer l'identité visuelle et les mentions légales du cabinet médical : nom du médecin, spécialité, diplômes et titres, numéro d'inscription à l'Ordre des Médecins, adresse complète, numéros de téléphone et intégration du logo officiel (`DoctorSettingsModal.tsx`).

## 2. Où trouver la fonction
- Menu principal gauche : **Paramètres > En-tête & Documents**.
- Raccourci : Cliquer sur le nom du docteur en haut à droite > **« Paramètres du médecin »**.

## 3. Éléments configurables
1. **Identification du praticien :**
   - Titre et Civilité (ex: *Docteur* / *Professeur*).
   - Nom complet en français et en arabe.
   - Spécialité médicale (ex: *Cardiologie et Maladies Vasculaires*).
   - N° d'inscription à l'Ordre National des Médecins (ex: *N° Ordre : 16/4820*).
2. **Coordonnées du cabinet :**
   - Adresse géographique complète (Wilaya, Commune, Rue, Étage).
   - Numéros de téléphone fixe et mobile pour les urgences.
   - Adresse e-mail professionnelle.
3. **Logo & Graphisme :**
   - Importation du logo du cabinet (format PNG transparent ou JPEG haute résolution, 300 DPI recommandé).
   - Position du logo : Gauche, Centre ou Droite.
4. **Mode Papier Pré-imprimé :**
   - Si le cabinet dispose déjà de feuilles à en-tête cartonnées fournies par un imprimeur, cocher l'option **« Utiliser du papier pré-imprimé »** : TABIBI masque l'en-tête logiciel et décale le texte vers le bas (marge haute réglable en millimètres).

## 4. Étapes exactes pour importer un logo
1. Dans **Paramètres > En-tête**, section **Logo du cabinet**, cliquer sur **« Parcourir »**.
2. Sélectionner le fichier image sur l'ordinateur.
3. TABIBI affiche un aperçu instantané du rendu d'ordonnance.
4. Ajuster la hauteur du logo avec le curseur (ex: de 40px à 80px).
5. Cliquer sur **« Enregistrer les modifications »**.
6. Faire un test en cliquant sur **« Imprimer une ordonnance test »**.

## 5. Ce que le médecin doit voir à l'écran
- Un aperçu vectoriel temps réel de l'ordonnance modèle A4 / A5 se mettant à jour à chaque lettre tapée.
- Les polices de caractères sont nettes, lisibles et conformes aux chartes graphiques médicales.

## 6. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, allez dans 'Paramètres' puis 'En-tête'. Vous pouvez modifier votre numéro de téléphone ou importer votre logo au format PNG ou JPG. Si vous utilisez des feuilles pré-imprimées, cochez simplement la case 'Papier pré-imprimé' pour que TABIBI n'imprime que les médicaments sans réimprimer votre en-tête par-dessus."*

## 7. Vérification technique (Niveau 2)
- [ ] Vérifier que les paramètres sont enregistrés dans la table `clinic_settings` ou `doctor_profiles`.
- [ ] Confirmer que le fichier `print.css` prend en compte la variable CSS `--print-header-margin-top` lors de l'activation du papier pré-imprimé.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le logo apparaît écrasé ou flou lors de l'impression sur imprimante laser.
- **Escalader à N3 :** Décalage des marges d'impression spécifique aux bacs d'imprimantes bi-formats (A4 et A5 combinés).

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Le logo a un fond noir moche à l'impression | Fichier PNG transparent mal géré par le pilote d'impression | Convertir le logo sur fond blanc opaque ou au format JPEG |
| Le texte de l'ordonnance mord sur l'en-tête pré-imprimé | Marge haute insuffisante | Augmenter la « Marge haute pré-imprimé » de 10 à 25 mm dans les réglages |
| Les mentions en arabe sont inversées | Police arabe non intégrée dans le modèle d'impression | Choisir la police système 'Cairo' ou 'Segoe UI' pour l'en-tête |
