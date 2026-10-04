<?php
$extraSpec = <<<'MD'


---

## 6. Écran Tableau de Bord & Statistiques (Dashboard / Charts)

* **4 Cartes d'Indicateurs KPI Clés (En-tête) :**
  * **Dépenses :** Total Dépenses (ex: `1 000,00 €`) avec raccourci direct.
  * **Produits :** Nombre total d'articles au catalogue (ex: `1 494 articles`).
  * **Clients :** Nombre total de clients enregistrés (ex: `37 clients`).
  * **Ventes :** Nombre total de factures/ventes émises (ex: `9 ventes`).
* **KPIs Centraux & Graphiques :**
  * Bloc Ventes du Mois (icône calendrier) : ex: `2 296,70 €`.
  * Bloc Ventes du Jour (icône caddie) : ex: `0,00 €`.
  * Graphique linéaire d'activité horaire (mar. 00h à mar. 12h...).
  * Barre de progression : `OBJECTIF DU JOUR : 0 %`.
* **3 Grilles de Synthèse Directe :**
  * `Les Derniers Produits` : Désignation, Prix Vente, Code Articles.
  * `Les Derniers Clients` : Nom Client, Date Création, Téléphone.
  * `Les Dernières Ventes` : Référence (`CF-00000009`), Montant, Vendeur (`amar`, `Khaled`).

---

## 7. Modal de Recherche Intuitive des Produits

* **Filtres de navigation :** `Rayon` (ex: Alimentations), `Catégorie` (ex: Poulet cru), `Sous-Catégorie`.
* **Affichage Accordéon Extensible :**
  * Mode réduit : Nom produit avec flèche dépliable.
  * Mode étendu :
    * Photo du produit à gauche avec marque / fabricant (ex: `Jens Mobile`).
    * Titre du produit + **Indicateur circulaire de marge** (ex: `70%`).
    * `En Stock : 10` | `Stock Min : 0` | `Stock Max : 0`.
    * `Prix Achat : 400 €` (rouge) | `Prix Vente : 812 €` (bleu).
    * `TVA : TVA 1 (20%)` (rose).
    * Rayon, Catégorie, Sous-catégorie.
* **Actions :** Bouton `Sélectionner` (insère directement dans la caisse ou le document) et bouton fermeture.

---

## 8. Formulaire Complet « Fiche Client »

* **Identité & Coordonnées :** Nom, Civilité, Statut Actif (`[x]`).
* **Adresse Facturation vs Livraison :** Société, Adresse, Voie, Code Postal, Ville.
* **Contacts :** Portable, Fixe, E-mail.
* **Paramètres Financiers & Crédit :**
  * Mode de règlement par défaut (ex: `ESPÈCE`).
  * Échéance (en jours), Tarif appliqué (Tarif 1, 2, etc.).
  * **Encours Maximum autorisé** (€).
  * Taux de remise accordé (%).
* **Programme de Fidélité :** Numéro carte de fidélité, Seuil d'alerte points, Montant points cumulés, Date création.
* **Comptabilité & Entreprise :** SIRET, SIREN, Numéro TVA intracommunautaire, Registre de commerce, Badge du nombre de factures émises.
* **Historique & Soldes :**
  * Solde client actuel, Crédit en cours, Cumul fidélité, Chiffre d'affaires total généré.
* **Menu latéral Outils Client :**
  * Liste Échéances, Détails des ventes, Historique des Règlements, Journal des emails, Abonnements, Impression Enveloppe.

---

## 9. Écran Gestion des Fournisseurs & Achats

* **Onglets de filtrage par type de document :**
  * `[Tous]`, `[Factures]`, `[Bon Livraison]`, `[Bon Commande]`, `[Return Achats]`.
* **Filtre par plage de dates :** Sélecteur Période De -> À.
* **Grille des documents :** `Document`, `Date Document`, `Total HT`, `Raison Social`, `Total Quantité`, `Utilisateur`.
* **Menu d'actions Tuiles Fournisseur :**
  * Nouvelle Fiche Fournisseur, Modifier, Supprimer.
  * État de stock, Entrée Rapide, Entrée Stock détaillée.
  * Historique, Recherche Fournisseur, Retours Achats, Mes Dépenses, Historique des paiements, Commandes & Règlements.
MD;

file_put_contents('D:/Github/Utopia_react/UI_POS_SPECIFICATION.md', $extraSpec, FILE_APPEND);
echo "Appended new screens to D:/Github/Utopia_react/UI_POS_SPECIFICATION.md\n";
