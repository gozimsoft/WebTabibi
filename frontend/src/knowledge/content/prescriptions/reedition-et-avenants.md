---
id: "presc-reedition-avenants"
title: "Réédition, duplicata et création d'avenants d'ordonnances"
category: "prescriptions"
tags: ["prescription", "duplicata", "avenant", "impression", "perte", "reimpression"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "onboarding", "tech"]
symptoms_doctor:
  - "Le patient a perdu son ordonnance, comment lui réimprimer ?"
  - "Comment marquer 'DUPLICATA' sur la réimpression ?"
  - "L'imprimante a bourré au moment de sortir l'ordonnance"
keywords: ["perte", "réimpression", "papier coincé", "copie conforme", "archive"]
escalation_threshold: "Incohérence entre les médicaments réimprimés et l'archive originale."
muraqib_ref: null
---

# Réédition, duplicata et création d'avenants d'ordonnances

## 1. Objectif
Permettre au praticien ou à son secrétariat autorisé de réimprimer une ordonnance existante (en cas de perte par le patient ou de bourrage papier) sous forme de duplicata officiel, ou de générer un avenant thérapeutique.

## 2. Où trouver la fonction
- Depuis le dossier patient : Onglet **« Historique médical » > Sous-onglet « Prescriptions »**.
- Depuis la consultation : Section **Prescriptions antérieures** dans le panneau latéral droit.
- Bouton d'action rapide : Icône Imprimante 🖨️ avec menu déroulant **« Réimprimer / Duplicata »**.

## 3. Étapes exactes
### Cas A : Le patient a perdu l'ordonnance (Duplicata)
1. Ouvrir le dossier du patient concerné.
2. Accéder à l'onglet **« Historique » > « Prescriptions »**.
3. Repérer l'ordonnance par sa date et sa référence.
4. Cliquer sur les trois points verticaux `⋮` puis choisir **« Imprimer Duplicata »**.
5. L'aperçu avant impression s'ouvre avec la mention obligatoire en filigrane : **« DUPLICATA DU [Date] »**.

### Cas B : Bourrage papier immédiat lors de la consultation
1. Si l'impression a échoué matériellement, cliquer simplement sur **« Réimprimer »**.
2. Tant que la consultation n'est pas fermée, l'ordonnance originale sort sans filigrane supplémentaire.

### Cas C : Modification thérapeutique requise (Avenant)
1. Sélectionner l'ordonnance validée.
2. Cliquer sur **« Créer un avenant »**.
3. Corriger les lignes souhaitées (ex: passage de 500mg à 1g).
4. Cliquer sur **« Valider l'avenant »** : une nouvelle ordonnance liée est créée et horodatée.

## 4. Ce que le médecin doit voir à l'écran
- Sur le document Duplicata : un tampon diagonal discret en haut à droite avec la mention *« DUPLICATA DÉLIVRÉ LE [Date du jour] »*.
- Dans l'historique : un compteur de réimpressions s'incrémente (`Imprimé 2 fois`) pour assurer la traçabilité.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, ouvrez le dossier du patient, allez dans 'Historique' puis 'Prescriptions'. À côté de l'ordonnance souhaitée, cliquez sur les trois petits points et choisissez 'Imprimer Duplicata'. Le document sortira avec la mention conforme sans modifier la date d'origine."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier que la table `patient_prescriptions_log` incrémente le champ `PrintCount`.
- [ ] Confirmer que le modèle d'impression `print.css` n'a pas été altéré et respecte les marges du cabinet.
- [ ] S'assurer que le secrétariat dispose de la permission `prescriptions.reprint` si l'action est menée par la secrétaire.

## 7. Diagnostic avancé & Système (Niveau 3)
En cas d'absence de réponse de l'imprimante :
1. Tester l'impression PDF intégrée du navigateur (`Ctrl + P`).
2. Vérifier les services d'impression Windows (`spoolsv.exe`).
3. Pour les imprimantes partagées réseau : se référer au guide Muraqib [Périphériques & Imprimantes Réseau](file:///muraqib/docs/printers).

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le bouton 'Imprimer' n'affiche pas la boîte de dialogue système d'impression.
- **Escalader à N3 :** Discordance de mise en page spécifique aux formats d'ordonnance personnalisés (ordonnance sécurisée A5 / format billetterie).

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| La mention DUPLICATA masque le texte | Résolution d'écran ou zoom navigateur anormal | Ajuster le zoom navigateur à 100% (`Ctrl + 0`) |
| L'entête de la clinique ne sort pas | Option « Graphiques d'arrière-plan » décochée dans Chrome | Cocher « Graphiques d'arrière-plan » dans la fenêtre d'impression Windows/Chrome |
| Seule la moitié de la page s'imprime | Format papier réglé sur Letter au lieu de A4/A5 | Modifier les propriétés par défaut de l'imprimante dans le panneau de configuration Windows |
