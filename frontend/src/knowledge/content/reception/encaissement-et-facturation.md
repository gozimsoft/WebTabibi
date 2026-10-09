---
id: "rec-encaissement-facturation"
title: "Encaissement des honoraires, paiements fractionnés et reçus de consultation"
category: "reception"
tags: ["reception", "encaissement", "honoraires", "facturation", "recu", "especes", "caisse"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaires", "gestion"]
symptoms_doctor:
  - "Comment éditer un reçu de paiement avec le montant en dinars (DZD) ?"
  - "Le patient règle la moitié aujourd'hui et le reste au contrôle"
  - "Le total de caisse du soir ne correspond pas aux paiements enregistrés"
keywords: ["tarifs", "règlement", "reçu d'honoraires", "caisse journalière", "reste à payer"]
escalation_threshold: "Incohérence arithmétique dans le journal de caisse ou transaction fantôme non modifiable."
muraqib_ref: null
---

# Encaissement des honoraires et reçus de consultation

## 1. Objectif
Gérer la perception des honoraires médicaux au secrétariat ou dans le cabinet : enregistrement du mode de paiement (Espèces, Virement/Chèque, TPE), gestion des paiements partiels (avances, reste à payer) et émission instantanée de reçus justificatifs.

## 2. Où trouver la fonction
- Depuis la fiche patient ou en fin de consultation : Bouton **« Encaisser les honoraires »**.
- Dans le menu **Accueil / Réception** : Colonne des consultations terminées du jour > Bouton **« Reste à payer / Facturation »**.

## 3. Étapes exactes
1. Cliquer sur **« Encaisser »** sur la consultation concernée.
2. Le montant de base de la consultation s'affiche automatiquement (ex: `2 500 DZD`) selon la spécialité et les actes cochés par le médecin (ex: *Échographie + 1 500 DZD*).
3. Sélectionner le mode de règlement : **Espèces**, **Chèque** ou **Virement**.
4. Saisir le montant perçu :
   - Si paiement intégral : cliquer sur **« Montant exact »**.
   - Si paiement partiel : saisir le montant versé (ex: `2 000 DZD`). Le système calcule immédiatement le solde dû (`500 DZD`) et crée une ligne de créance rattachée au compte du patient.
5. Cliquer sur **« Valider l'encaissement »**.
6. Cliquer sur **« Imprimer le reçu »** pour délivrer au patient une quittance au format ticket ou demi-A4.

## 4. Ce que l'utilisateur doit voir à l'écran
- Le badge de paiement passe au vert : **« Payé : 2 500 DZD »**.
- En cas de dette résiduelle : une alerte orange apparaît sur le dossier du patient : **« Reste dû : 500 DZD »**.
- Le journal de caisse de la journée s'actualise immédiatement dans la colonne droite.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Pour enregistrer un paiement partiel, indiquez simplement le montant effectivement donné par le patient dans la case 'Montant perçu'. TABIBI enregistre le reste à payer automatiquement sur le dossier du patient, et il sera rappelé lors de sa prochaine visite."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier que la table `payments` contient bien une ligne avec `Patient_ID`, `Diagnostic_ID`, `AmountPaid` et `PaymentMethod`.
- [ ] Confirmer que le journal de caisse journalier somme correctement les encaissements du jour sans inclure les consultations non réglées.

## 7. Diagnostic avancé & Système (Niveau 3)
Si un écart de caisse est constaté :
1. Exécuter la requête récapitulative des paiements du jour :
   ```sql
   SELECT PaymentMethod, SUM(AmountPaid) as Total 
   FROM payments 
   WHERE DATE(PaymentDate) = CURDATE() AND IsDeleted = 0 
   GROUP BY PaymentMethod;
   ```

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le reçu ne s'imprime pas sur l'imprimante à tickets thermique 80mm.
- **Escalader à N3 :** Double débit constaté dans les écritures comptables de la base de données.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Le montant du reçu est faux | Acte complémentaire oublié ou tarif mal configuré | Modifier la ligne d'acte avant de valider l'encaissement final |
| Le reçu sort en devises étrangères | Monnaie par défaut non paramétrée sur DZD | Définir DZD comme devise officielle dans Paramètres > Facturation |
