---
id: "faq-raccourcis-astuces"
title: "Guide des raccourcis clavier, bascule de langue (FR/AR) et astuces d'efficacité"
category: "faq-medecins"
tags: ["faq-medecins", "raccourcis", "clavier", "arabe", "francais", "rtl", "astuces", "gain-temps"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1"]
target_audience: ["support", "onboarding", "medecins"]
symptoms_doctor:
  - "Comment passer le logiciel en arabe ?"
  - "Quels sont les raccourcis pour aller plus vite en consultation ?"
  - "Comment imprimer sans toucher la souris ?"
keywords: ["touches rapides", "langue", "bilingue", "clavier", "gauche à droite", "droite à gauche"]
escalation_threshold: "Problème d'alignement RTL persistant après bascule en langue arabe sur certains composants spécifiques."
muraqib_ref: null
---

# Guide des raccourcis clavier, bascule de langue et astuces d'efficacité

## 1. Objectif
Présenter aux médecins les raccourcis clavier essentiels et la prise en main bilingue (Français LTR / Arabe RTL) pour fluidifier la saisie en consultation et gagner 3 à 5 minutes par patient.

## 2. Où trouver la fonction
- Sélecteur de langue : En haut à droite de l'écran principal (Drapeau / Sélecteur **FR / AR / EN**).
- Aide-mémoire des raccourcis : Touche **`F1`** ou menu Aide > Raccourcis clavier.

## 3. Tableau des raccourcis clavier indispensables
| Raccourci | Action réalisée | Où l'utiliser |
| :--- | :--- | :--- |
| **`F1`** | Ouvrir l'aide contextuelle et la liste des raccourcis | Partout |
| **`Ctrl + P`** | Lancer l'impression immédiate de l'ordonnance ou du document | Consultation / Ordonnance |
| **`Ctrl + F`** ou **`F3`** | Activer la barre de recherche globale de patients | Partout |
| **`Ctrl + K`** | Ouvrir la recherche instantanée de la Knowledge Base | Dans la base de connaissances |
| **`C`** | Activer la comparaison côte à côte de deux clichés d'imagerie | Visionneuse documents |
| **`S`** | Basculer la visionneuse médicale en plein écran | Visionneuse documents |
| **`Échap`** | Fermer la fenêtre modale active ou annuler la sélection | Boîtes de dialogue / Modales |
| **`Alt + L`** | Basculer instantanément la langue (Français ⇄ Arabe) | Partout |

## 4. Prise en charge bilingue Français / Arabe (RTL)
- TABIBI est conçu nativement pour la pratique médicale bilingue en Algérie.
- Lorsque la langue **Arabe** est sélectionnée, toute l'interface s'inverse élégamment en mode RTL (Right-to-Left) :
  - La barre de navigation passe à droite.
  - Le texte et les tableaux s'alignent naturellement selon les conventions typographiques arabes.
  - Les ordonnances peuvent être éditées et imprimées avec les mentions légales en arabe ou en français selon le choix du praticien.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, vous pouvez changer la langue à tout moment en cliquant sur le sélecteur 'FR / AR' en haut à droite de votre écran. Pour les raccourcis, retenez 'Ctrl + P' pour imprimer directement l'ordonnance et 'F1' pour afficher la liste de tous les raccourcis disponibles."*

## 6. Vérification technique (Niveau 2)
- [ ] Confirmer que la police système arabe (Segoe UI, Cairo ou Noto Sans Arabic) est correctement chargée sous Windows.
- [ ] Vérifier que la préférence de langue est bien mémorisée dans le stockage local du navigateur (`tabibi_language`).

## 7. Diagnostic avancé & Système (Niveau 3)
En cas de décalage typographique ou de texte tronqué en arabe :
1. Inspecter les classes CSS `dir="rtl"` appliquées sur la balise `<html lang="ar" dir="rtl">`.
2. S'assurer que les styles utilisent des propriétés logiques CSS (`margin-inline-start`, `padding-inline-end`).

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le changement de langue ne s'applique pas sur certains formulaires de consultation.
- **Escalader à N3 :** Impression d'ordonnance en arabe avec lettres détachées ou inversées (problème d'encodage de police du moteur PDF).

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Les chiffres sortent en arabe oriental au lieu des chiffres arabes standards | Configuration des paramètres régionaux Windows | Choisir le format de chiffres arabes standards (1, 2, 3) dans Paramètres > Région |
| Le raccourci F1 ouvre l'aide Microsoft Edge au lieu de TABIBI | Touches de fonction inversées sur clavier de PC portable | Appuyer sur la touche `Fn + F1` ou activer Fn-Lock sur le clavier |
| L'interface reste en français après avoir cliqué sur Arabe | Cache navigateur non actualisé | Recharger la page avec `Ctrl + F5` |
