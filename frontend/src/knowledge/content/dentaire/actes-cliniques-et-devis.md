---
id: "dent-actes-devis"
title: "Saisie des actes dentaires (Endo, Prothèse, Soins) et génération de devis"
category: "dentaire"
tags: ["dentaire", "actes", "composites", "pulpectomie", "couronne", "devis", "honoraires"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "dentistes", "secretaires"]
symptoms_doctor:
  - "Comment éditer un devis dentaire pour une prothèse avant de commencer ?"
  - "Comment utiliser les phrases types de soins (Composite A2/A3, Obturation canalaire) ?"
  - "L'historique des soins d'une dent ne s'affiche pas sur l'impression"
keywords: ["soins conservateurs", "endodontie", "prothèse conjointe", "détartrage", "devis estimatif", "modèle de note"]
escalation_threshold: "Calcul d'honoraires incohérent dans le total du devis dentaire multi-actes."
muraqib_ref: null
---

# Saisie des actes dentaires et devis de soins

## 1. Objectif
Permettre au praticien dentiste de consigner les actes cliniques sur les dents sélectionnées en un clic grâce aux modèles de phrases types (`CLINICAL_TEMPLATES`), et d'éditer des devis prothétiques clairs et conformes pour le patient (`DentalQuotesPanel.tsx`).

## 2. Où trouver la fonction
- Dans l'onglet **« Dent »** de la consultation > Section **« Actes & Soins réalisés »**.
- Pour les devis : Bouton **« Devis & Plans de traitement »** dans la barre d'outils dentaire.

## 3. Modèles cliniques rapides intégrés (Templates)
TABIBI intègre en natif les protocoles les plus fréquents en cabinet dentaire bilingue (FR/AR) :
- **Anesthésie :** *« Sous anesthésie locale »*
- **Obturation esthétique :** *« Restauration composite esthétique teinte A2/A3 »*
- **Endodontie :** *« Pulpectomie, parage canalaire et irrigation abondante (NaOCl) »*
- **Obturation canalaire :** *« Obturation canalaire à la gutta-percha et ciment biocéramique »*
- **Chirurgie :** *« Extraction dentaire non compliquée, hémostase locale assurée »*
- **Parodontie :** *« Détartrage ultrasonique et surfaçage radiculaire soigné »*
- **Prothèse :** *« Essayage et scellement définitif de la couronne céramique »*

## 4. Étapes exactes pour enregistrer un soin
1. Cliquer sur la dent concernée dans l'odontogramme (ex: `26`).
2. Sélectionner le type d'acte dans la liste déroulante (ex: *Traitement de carie*).
3. Cliquer sur un ou plusieurs modèles cliniques pour composer la note d'observation en 2 secondes.
4. Renseigner le montant de l'acte (ex: `4 000 DZD`).
5. Cliquer sur **« Enregistrer l'acte »** : la dent change de teinte sur le schéma dentaire et la facture de la consultation s'ajuste immédiatement.

## 5. Génération d'un Devis Prothétique (Dental Quote)
1. Ouvrir le panneau **« Devis dentaires »**.
2. Cliquer sur **« Nouveau devis »**.
3. Ajouter les propositions thérapeutiques (ex: *Couronne céramo-métallique sur 15, 16 et 17*).
4. Le système totalise le montant des actes, les éventuels acomptes convenus et les facilités de paiement.
5. Cliquer sur **« Imprimer le devis »** pour le remettre au patient avec la mention légale d'acceptation préalable.

## 6. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, pour ne pas perdre de temps à taper vos notes de soins, cliquez sur les étiquettes rapides 'Composite', 'Dévitalisation' ou 'Extraction' situées juste sous l'arcade dentaire. Le texte s'écrit tout seul dans votre observation médicale et vous n'avez plus qu'à valider."*

## 7. Vérification technique (Niveau 2)
- [ ] Confirmer dans la table `dental_procedures` l'enregistrement du numéro de dent (`ToothNumber: 11-48`), du `ProcedureType_id` et de la description.
- [ ] S'assurer que le devis généré dans `dental_quotes` est bien lié au `Patient_ID` avec le statut `0` (En attente), `1` (Accepté) ou `2` (Refusé).

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le modèle de devis imprimé ne liste pas le détail des dents traitées.
- **Escalader à N3 :** Erreur lors de la mise à jour des statuts de devis (`PUT /api/dental/quotes/:id`).

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Le devis n'intègre pas les réductions accordées | Remise globale non renseignée | Renseigner le pourcentage ou le montant de la remise dans la case « Remise commerciale » |
| L'acte disparaît après avoir changé d'onglet | L'utilisateur n'a pas cliqué sur « Enregistrer l'acte » | Cliquer impérativement sur le bouton de validation avant de changer d'écran |
