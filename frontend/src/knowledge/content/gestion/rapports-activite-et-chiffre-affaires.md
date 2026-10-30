---
id: "ges-rapports-activite"
title: "Tableau de bord d'activité médicale, chiffre d'affaires et exports comptables"
category: "gestion"
tags: ["gestion", "statistiques", "chiffre-affaires", "recettes", "comptabilite", "actes", "excel"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "gestionnaires", "medecins"]
symptoms_doctor:
  - "Comment voir le total de mes honoraires du mois pour mon comptable ?"
  - "Combien de consultations et d'échographies ont été réalisées cette semaine ?"
  - "Comment exporter le journal des recettes sous Excel (CSV) ?"
keywords: ["recettes journalières", "bilan mensuel", "export excel", "comptabilité médecin", "statistiques d'actes"]
escalation_threshold: "Incohérence entre les montants encaissés affichés et les lignes de la table de paiement."
muraqib_ref: null
---

# Tableau de bord d'activité médicale et chiffre d'affaires

## 1. Objectif
Présenter le tableau de bord de pilotage du cabinet médical (`ManagementDashboard.tsx`) : suivi en temps réel du volume de consultations, répartition des actes médicaux les plus pratiqués, décompte des honoraires perçus par praticien et export comptable officiel conforme (CSV / Excel).

## 2. Où trouver la fonction
- Menu principal gauche : **Gestion & Statistiques** (`ManagementDashboard.tsx`).
- Restriction de sécurité : Accessible uniquement aux profils dotés du rôle **Médecin titulaire** ou **Administrateur du cabinet**.

## 3. Indicateurs clés de performance (KPIs)
Le tableau de bord consolide automatiquement 4 indicateurs majeurs :
1. **Volume d'activité :** Nombre total de consultations réalisées sur la période sélectionnée (Jour, Semaine, Mois, Trimestre, Année).
2. **Nouveaux patients :** Taux d'acquisition de nouveaux dossiers par rapport aux consultations de suivi.
3. **Chiffre d'affaires global :** Total des honoraires encaissés (ventilés en Espèces, Chèques et Virements).
4. **Répartition des actes :** Graphique circulaire illustrant la part relative de chaque acte (ex: *60% Consultations générales*, *25% Échographies*, *15% ECG*).

## 4. Étapes exactes pour générer un export comptable
1. Sélectionner l'intervalle de dates souhaité (ex: *Du 01/09/2026 au 30/09/2026*).
2. Filtrer par praticien (si le cabinet compte plusieurs médecins associés ou remplaçants).
3. Visualiser le récapitulatif à l'écran.
4. Cliquer sur le bouton **« Exporter pour la comptabilité »** (format CSV / Excel).
5. Le fichier téléchargé détaille chaque transaction : Date, Réf. Dossier, Nom du patient, Actes réalisés, Montant honoraires, Mode de règlement et Praticien.

## 5. Ce que l'utilisateur doit voir à l'écran
- Des graphiques interactifs en barres et camemberts illustrant la dynamique du cabinet.
- Un tableau récapitulatif avec totalisation automatique en dinars algériens (DZD).

## 6. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, ouvrez le menu 'Gestion & Statistiques' à gauche. Choisissez le mois désiré dans le filtre de date en haut, puis cliquez sur 'Exporter Excel'. Vous obtiendrez immédiatement le relevé complet prêt à être transmis à votre expert-comptable."*

## 7. Vérification technique (Niveau 2)
- [ ] Confirmer que la route backend `/api/reports/revenue` applique le contrôle de permission `reports.view`.
- [ ] Vérifier que les exports CSV utilisent l'encodage `UTF-8 avec BOM` pour garantir l'affichage correct des caractères accentués et arabes sous Microsoft Excel.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Les dates filtrées ne modifient pas les montants affichés dans les graphiques.
- **Escalader à N3 :** Écart avéré entre le total affiché et la somme réelle de la table SQL `payments`.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| La secrétaire voit le chiffre d'affaires du médecin | Permissions du rôle secrétaire trop permissives | Retirer la permission `reports.view` du rôle secrétaire dans Paramètres |
| Les accents sont déformés à l'ouverture d'Excel | Problème d'encodage par défaut d'anciennes versions d'Excel | Ouvrir le fichier via 'Données > Importer depuis texte/CSV' en choisissant UTF-8 |
