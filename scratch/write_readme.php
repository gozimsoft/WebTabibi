<?php
$content = <<<'MD'
# Utopia ERP - Delphi VCL to React & MariaDB Migration

Ce dossier contient l'ensemble des données extraites, le schéma de base de données converti, les ressources et l'analyse architecturale du projet **Utopia** extrait depuis `D:\Github\Utopya`.

---

## 1. État de la Base de Données (MariaDB)

* **Source originale** : `DBUtopia.db` (SQLite 3 - 131 MB) + `db.bak` (MSSQL).
* **Base cible MariaDB** : `utopia_db` créée et importée avec succès sur le serveur MariaDB local (`127.0.0.1:3306`).
* **Nombre de tables migrées** : **61 tables**.
* **Script SQL complet généré** : `database/utopia_mariadb.sql` (4.38 MB, DDL + données initiales).
* **Schéma détaillé en JSON** : `database/schema_analysis.json`.

### Principaux Domaines Métier & Tables :
1. **Ventes & Facturation** :
   - `InvoicesVentes`, `Ligne_Ventes`
   - `InvoicesProformas`, `Ligne_Proformas`
   - `InvoicesAvoirs`, `Ligne_Avoirs`
   - `Devis`, `Ligne_Devis`
   - `CorrectionFactures`
2. **Achats & Fournisseurs** :
   - `Fournisseurs`
   - `InvoicesAchats`, `Ligne_Achats`
   - `BonAchats`, `BonCommandes`, `Ligne_BonCommandes`
   - `InvoicesReturnAchats`, `Ligne_ReturnAchats`
3. **Produits, Catalogue & Tarifs** :
   - `Produits` (75 articles déjà importés dans le jeu d'essai)
   - `DescriptionProduits`, `Units`, `UnitsProduits`
   - `Coefficients`, `TVAs`, `SalesProduits`
4. **Gestion de Stock & Multi-Dépôts** :
   - `Stores` (Dépôts / Magasins)
   - `StoresProduits` (Stock par dépôt)
   - `MovesSotres`, `Ligne_MovesSotres` (Transferts inter-dépôts)
   - `Inventorys`, `Ligne_Inventorys` (Inventaires physiques)
   - `Depreciations`, `Ligne_Depreciations` (Pertes / Dépréciations)
5. **Tiers & Fidélité** :
   - `Clients`, `CarteFidelites`, `CarteFidelitesInvoicesVentes`
   - `FideliteTransations`, `Cadeaus`, `AssignmentDebtsSales`
6. **Caisse & Trésorerie** :
   - `ModePayements`, `ModePayementsAvoirs`, `ModePayementsCarteCadeau`
   - `MouvementCaisses`, `Depenses`, `ReturnAmounts`, `PayementVenteEncours`
   - `SessionSales`, `SessionMonths`, `SessionYears`, `JourneesVendeurs`
7. **Ressources Humaines & Sécurité** :
   - `Employees`
   - `Users`, `USERS_ROLES`, `SessionUsers`
8. **Paramètres Système** :
   - `InfoStore`, `Parameters`, `ParametersDocs`, `ParametersReports`, `CodeDocuments`, `Zakats`

---

## 2. Analyse du Code Source Delphi VCL

* **162 Formulaires Delphi (`.dfm`)** analysés et répertoriés dans `delphi_forms_map.json`.
* **228 Unités Pascal (`.pas`)** analysées et répertoriées dans `delphi_units_map.json` (fonctions, requêtes SQL, procédures).
* **Moteur d'impression original** : FastReport (`frxClass`, `frxDBSet`) -> à remplacer par génération PDF moderne.
* **Composants d'interface originaux** : DevExpress VCL (`TcxGrid`, `TcxDateEdit`, `dxSkin`, etc.).

---

## 3. Contenu de ce Répertoire (`Utopia_react`)

```
D:\Github\Utopia_react\
├── assets/
│   ├── icons/                  # Icônes originales de l'application Delphi
│   └── images/                 # Images originales
├── database/
│   ├── DBUtopia.db             # Copie de sauvegarde SQLite originale (131 MB)
│   ├── utopia_mariadb.sql      # Script MariaDB complet (Schéma + Données)
│   ├── schema_analysis.json    # Analyse complète des 61 tables et colonnes
│   └── Lang.ini                # Dictionnaire et labels multilingues
├── delphi_forms_map.json       # Cartographie détaillée des 162 écrans DFM
├── delphi_units_map.json       # Cartographie des 228 unités et procédures Pascal
└── README.md                   # Ce document de synthèse
```

---

## 4. Prochaines Étapes pour la Migration React

1. **Réception de vos captures d'écran** des écrans principaux (Caisse / POS, Saisie Facture Vente, Fiche Produit, Gestion de Stock, etc.).
2. **Initialisation de l'application React** (Vite + React + structure modulaire de composants ERP).
3. **Mise en place de l'API Backend** connectée directement à votre base `utopia_db` sur MariaDB.
4. **Implémentation écran par écran** en commençant par les flux prioritaires.
MD;

file_put_contents('D:/Github/Utopia_react/README.md', $content);
echo "Successfully wrote D:/Github/Utopia_react/README.md\n";
