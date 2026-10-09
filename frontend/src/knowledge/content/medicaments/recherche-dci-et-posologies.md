---
id: "med-recherche-dci-posologies"
title: "Recherche dans la nomenclature médicamenteuse (DCI/Commercial), posologies types et alertes"
category: "medicaments"
tags: ["medicaments", "dci", "posologie", "allergie", "interactions", "nomenclature"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "onboarding", "tech"]
symptoms_doctor:
  - "Je ne trouve pas un médicament dans la liste"
  - "Comment ajouter un dosage qui n'existe pas dans la base ?"
  - "Comment enregistrer mes posologies habituelles pour aller plus vite ?"
keywords: ["nom de marque", "générique", "fréquence", "durée de traitement", "base médicaments"]
escalation_threshold: "Médicament manquant dans la nomenclature officielle nationale algérienne nécessitant une mise à jour de la table centrale."
muraqib_ref: null
---

# Recherche dans la nomenclature médicamenteuse (DCI/Commercial) et posologies types

## 1. Objectif
Expliquer comment exploiter la base médicamenteuse intégrée à TABIBI (référentiel national des produits pharmaceutiques enregistrés en Algérie), effectuer des recherches croisées (Nom commercial ou DCI), configurer des protocoles de posologies favorites et gérer les alertes d'allergies.

## 2. Où trouver la fonction
- Dans l'onglet **Prescriptions** de la consultation : Barre de recherche de médicaments avec autocomplétion instantanée.
- Dans le menu de configuration : **Paramètres > Base Médicaments & Posologies types**.

## 3. Étapes exactes
1. Dans le champ de recherche de l'ordonnance, taper les 3 premières lettres du médicament (ex: `amox` pour Amoxicilline).
2. Le menu déroulant affiche les correspondances en précisant :
   - Le **Nom commercial** (ex: *CLAMOXYL*)
   - La **DCI** (ex: *Amoxicilline*)
   - Le **Dosage & la Forme** (ex: *1g Comprimé dispersible*)
   - Le statut de remboursement éventuel.
3. Cliquer sur le médicament souhaité : les champs de posologie se pré-remplissent automatiquement avec le protocole standard le plus fréquent (ex: *1 cp matin et soir pendant 7 jours*).
4. Le praticien peut ajuster la fréquence (matin, midi, soir, coucher) ou la durée (jours, semaines, mois).
5. Cliquer sur **« Ajouter à l'ordonnance »** (ou touche `Entrée`).

## 4. Ce que le médecin doit voir à l'écran
- Si le patient présente une allergie déclarée dans ses antécédents (ex: *Allergie aux Pénicillines*), un bandeau d'alerte rouge clignotant s'affiche immédiatement : **« ALERTE CONTRE-INDICATION : Patient allergique aux Bêta-lactamines »**.
- La ligne de prescription s'insère proprement dans le tableau récapitulatif avec numérotation automatique.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, vous pouvez chercher aussi bien par le nom de marque que par la molécule (DCI). Si un produit très récent n'apparaît pas encore dans la liste officielle, vous pouvez cliquer sur 'Ajouter manuellement un médicament hors base' pour le saisir librement et continuer votre consultation sans être bloqué."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier que la table `medicaments` contient bien les index SQL sur `NomCommercial` et `DCI` pour une autocomplétion rapide.
- [ ] Confirmer si la recherche est insensible aux accents et à la casse (`utf8mb4_general_ci`).
- [ ] Vérifier dans le profil du patient que la colonne `Allergies` est correctement renseignée sous forme de liste structurée.

## 7. Diagnostic avancé & Système (Niveau 3)
Si un praticien signale que la base médicamenteuse est vide ou incomplète :
1. Vérifier le nombre d'entrées dans la base :
   ```sql
   SELECT COUNT(*) FROM medicaments;
   ```
   (La base de référence complète doit contenir plus de 5 000 spécialités pharmaceutiques).
2. Si une mise à jour semestrielle de la nomenclature doit être injectée, utiliser le script de synchronisation dédié décrit dans Muraqib [Mises à jour des référentiels](file:///muraqib/docs/database-seeds).

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** L'autocomplétion reste bloquée ou met plus de 3 secondes à répondre.
- **Escalader à N3 :** Nécessité d'importer une nouvelle mise à jour de la nomenclature nationale du Ministère de l'Industrie Pharmaceutique.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Le médicament n'apparaît pas dans la liste | Orthographe différente ou produit retiré du marché | Taper la DCI ou utiliser l'option « Saisie manuelle » |
| Les posologies types sont toujours vides | Aucune posologie favorite enregistrée pour cette molécule | Saisir la posologie puis cocher « Mémoriser comme posologie par défaut » |
| L'alerte allergie ne s'est pas déclenchée | L'allergie n'a pas été saisie dans la section 'Antécédents' | Ajouter l'allergie dans la fiche administrative/médicale du patient |
