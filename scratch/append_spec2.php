<?php
$extraSpec2 = <<<'MD'


---

## 10. Modèle Ticket de Caisse Thermique 80mm

* **En-tête :** Logo `O'MEGA SERVICES`, Ville `messad`, Code-barres `14872901561414`, `Caisse N° : 2`, Date & Heure.
* **Références :** `N° CF-XXXXXX`, Téléphone, Horaires d'ouverture du magasin.
* **Lignes Articles :** `Qte`, `Désignation`, `Total`.
* **Récapitulatif Financier :**
  * `Total X articles : XXX €`
  * `Bon immédiat : 0,00 €`
  * `Reste à payer : XXX €`
  * `Espèce : XXX €`
  * `Rendu : 0,00 €`
  * `TVA : XX €` | **`Net à payer : XXX €`** (Grand & Gras).
* **Fidélité « Point Privilège Gozimsoft » :**
  * Solde Actuel, Solde Précédent, Points cumulés sur l'année.
* **Pied de ticket :** Email, Site web, « MERCI DE VOTRE VISITE ».

---

## 11. Écran Historique des Ventes en Caisse & Clôtures

* **Filtres :** Période De -> À, Barre de recherche rapide.
* **Grille des Ventes :** `Type Document` (Ticket, Facture), `Référence` (`CF-XXXXXX`), `Date Facture`, `Total TTC`, `Paiement` (`Paid`), `Nom Complet Client`.
* **Totaux en pied de grille :**
  * Nombre factures non payées / Total non payé.
  * Nombre remboursements / Total remboursé.
  * **Nombre Factures payées : 9** | **Total Règlements : 2 296,70 €** (vert).
* **Actions Caisse :**
  * Désistement des encours, **Clôture Journée (Z de Caisse)**, Avoir Client, Corrections Doc, Clôture Mois, Bons d'avoir, Export PDF.

---

## 12. Écran Statistiques & Analyses Approfondies (Charts Pro)

* **3 Cartes d'Analyse :**
  * **Analyse des Ventes :** Chiffre d'affaires (`2 296,70 €`), Objectif (`2 019,05 €`), Tendance.
  * **Analyse des Achats :** Dépenses achats (`115,97 €`), Objectif, Tendance.
  * **Performances par Jour :** Ventilation du CA de Lundi à Dimanche.
* **Camemberts Analytiques :**
  * Répartition du Chiffre d'Affaires par **Vendeur** (`amar` 83%, `Khaled` 17%...).
  * Répartition du Chiffre d'Affaires par **Rayon** (`Informatique` 34%, `Électroménager` 24%, `Energy` 1.5%...).
* **Graphique Historique Annuel :** Courbe chronologique des ventes journalières sur l'année.
MD;

file_put_contents('D:/Github/Utopia_react/UI_POS_SPECIFICATION.md', $extraSpec2, FILE_APPEND);
echo "Appended ticket and sales journal specs.\n";
