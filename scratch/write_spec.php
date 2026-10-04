<?php
$spec = <<<'MD'
# Utopia ERP - Spécifications Visuelles et Fonctionnelles (Extraites des Écrans)

Ce document décrit en détail l'ergonomie, la disposition, les composants visuels et les règles métier observés sur les captures d'écran réelles du logiciel Utopia V1.0.

---

## 1. Écran de Caisse / Point de Vente (POS) - `La Caisse`

### En-tête (Informations Produit & Client)
* **Informations de l'article actif :** Libellé, Rayon, Qte Article, Remise, Taux TVA, Case à cocher `[x] Pro`, Code Produit (bleu), Stock disponible.
* **Informations Client :** Nom du client sélectionné, Solde de points de fidélité (ex: 10,12 pts).
* **Totaux en temps réel :**
  * Total HT (bleu)
  * TOTAL TVA (bleu)
  * TOTAL TTC (bleu)
  * **Affichage Digital Géant :** Vert néon lumineux (ex: `571,88 €`).

### Corps de Caisse
* **Scanner / Recherche :** Champ `Scanner un produit` avec raccourci de rafraîchissement.
* **Grille Panier (Ticket en cours) :**
  * Colonnes : `Désignation`, `Quantité`, `Prix`, `Tva`, `Remise`, `Total (€)`.
  * Actions latérales sur le panier : Bouton Ajouter, Retirer article sélectionné, Vider le panier, Corbeille.
* **Panneau d'actions et Pavé Tactile (Droite) :**
  * Vendeur en cours affiché en haut (ex: `amar`).
  * Onglets : `[Saisie]`, `[Documents]`, `[Options]`.
  * Boutons de fonctions caisse :
    * `Reprise de vente` & `Mise en attente`
    * `Chercher un article` & `Gestion Prix`
    * `Appel Client` & `Offert`
    * `Remise en +`
    * `Vendre chèque KDO`, `Vendre Carte KDO`, `Vendre B.A`
    * `Fidélité`, `Remise G (%)`, `Imp Facture`, `Clavier virtuel`, `Imprimer ticket`.
  * **Pavé numérique tactile (Numpad) :**
    * Touches : `7 8 9`, `4 5 6`, `1 2 3`, `0 , +/-`, `Effacer`.
    * Touches de modification directe : `Code`, `Calc.`, `Quantité`, `Rem %`, `Rem €`, `Prix`.
  * **Bouton Maître :** `ENCAISSER` (Gros bouton vert).

### Zone Inférieure (Rayons & Grille Tactile Rapide)
* **Barre des Rayons / Catégories :** `Alcool`, `Arcade`, `batterie`, `Batterie de voiture`, `Boisson`, `bonbon`, `Cables`, `canapé`, `casque`, `chaussette`...
* **Grille de sélection rapide :** Vignettes avec photo du produit, désignation, prix en rouge/bleu, et stock restant. Clic = ajout direct au panier.
* **Barre d'outils caisse (Droite) :** Bascule écran, reload, veille, déconnexion, sortie.

---

## 2. Fenêtre Modale d'Encaissement & Paiement Fractionné

* **Rappel montant :** Affichage digital vert géant `571,88 €`.
* **Monnaie Tactile (Gauche) :**
  * Billets cliquables : `5 €`, `10 €`, `20 €`, `50 €`, `100 €`, `200 €`, `500 €`.
  * Pièces cliquables : `1c`, `2c`, `5c`, `10c`, `20c`, `50c`, `1 €`, `2 €`.
  * Permet un calcul instantané de la monnaie sans calculatrice !
* **Modes de Règlement (Multi-Paiement) :**
  * `ESPÈCE`, `CARTE DE CRÉDIT`, `CHÈQUE`, `VIRREMENT`.
  * `Paiement différés`, `Avoir`, `Ticket Restau`, `Chèque Voyage`.
* **Fractionnement du paiement :**
  * Champ montant partiel avec pavé tactile (`00`, `000`, `Effacer`).
  * Tableau récapitulatif des règlements ajoutés (`Mode de règlement` / `Montant`).
  * `Reste En cours : XXX €` avec bouton `Recharger`.
* **Calcul du Rendu Monnaie :**
  * `Somme Reçue : 00.00 €` (vert)
  * `Somme à rendre : 00.00 €` (rouge)
  * Champ scanner pour code-barre chèque/bon.
* **Actions de Clôture de Vente :**
  * `[Valider Avec Ticket]`
  * `[Valider Sans Ticket]`
  * `[Valider Avec Facture]`
  * `[Retour]`

---

## 3. Écran Gestion des Articles & Stock

* **Sidebar Navigation :** Vente/Caisse, Clients/Gestion, Article/Stock, Fournisseurs, Paramètres, Charts.
* **Menu d'actions Tuiles (Gauche) :**
  * `État de Stock`, `Modifier Article`, `Historique des Stocks`, `Supprimer`.
  * `Entrée Stock`, `Entrée Stock Rapide`, `Sortie Stock`, `Imprimer Code à barre`.
  * `Mouvement de Stock`, `Imp. Articles`, `Dépréciations`, `Inventaire`.
* **Tableau Principal :**
  * Sélecteur / Checkbox, `Code Article`, `Désignation`, `Dernier Prix Achat`, `Prix Vente`, `CMUP`, `Code à Barre`.
  * Recherche globale par texte et code-barres.
* **Barre d'état inférieure :**
  * Horloge temps réel (Date en grand rose/rouge + heure).
  * `Nom Poste : Post2 | Poste : 2`.
  * Sélecteur de magasin actif (`Store Principale`).
  * Actions rapides (Sync, Rôles, Paramètres, Clavier, Calendrier).

---

## 4. Écran Gestion Clients & Échéances

* **Actions Client (Gauche) :**
  * `Modifier`, `Supprimer`, `Liste Échéances`, `Recherche Client`, `Transférer D'un Devis`.
  * `Gestion de fidélité`, `Payement des encours`, `Carte Cadeau`, `Historique`.
  * `Gestion bon d'achat`, `Envoyer`, `Saisie Doc vente`, `Correction Règlement`, `Reçu Payment`.
  * Boutons d'export : `Imprimer`, `PDF`, `Excel`.
* **Tableau Clients :**
  * `Nom Complet`, `RaisonSocial`, `Téléphone`, `Email`, `State`, `CP`, `City`, `Echéances`.

---

## 5. Modèle de Facture A4 (Omega Services)

* **En-tête :** Logo `O'MEGA SERVICES`, Titre `Facture`, Numéro (ex: `CF-00000009`), Code-barre standard 128.
* **Blocs tiers :**
  * Émetteur (Gozimsoft, adresse, site web).
  * Client (Nom, adresse complète, téléphone, email).
  * Métadonnées (Numéro, Total, Date émission, Remise).
* **Tableau des articles :**
  * `#`, `Désignation`, `Qte`, `Prix HT`, `TVA`, `Rem`, `Total TTC`.
* **Pied de facture :**
  * Mention légale de garantie de conformité 2 ans.
  * Récapitulatif : Date Facture, Montant HT, Taux TVA, Total TVA.
  * Mode de Paiement mentionné (ex: `ESPECE (277,66 €)`).
  * Totaux encadrés : `Total HT`, `Total TVA`, `Remise`, `Total TTC`.
MD;

file_put_contents('D:/Github/Utopia_react/UI_POS_SPECIFICATION.md', $spec);
echo "Successfully wrote D:/Github/Utopia_react/UI_POS_SPECIFICATION.md\n";
