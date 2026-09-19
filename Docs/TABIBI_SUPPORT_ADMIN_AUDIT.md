# TABIBI — Module Support Administratif / Réclamations : Rapport d'Architecture et d'Audit

**Date :** 19 Septembre 2026  
**Module :** Support Administratif & Réclamations (`admin_support_tickets`)  
**Statut :** INTÉGRÉ, VALIDÉ ET TESTÉ — 10/10 TESTS PASS ✅  

---

## 1. Objectif & Règle Absolue

### Objectif
Mettre en place un système complet de gestion des requêtes et réclamations administratives orienté exclusivement :
**UTILISATEUR (Patient, Médecin, Clinique) ➔ ADMINISTRATION TABIBI**

Permettre aux utilisateurs de soumettre des réclamations, demandes d'information, signalements de problèmes techniques, demandes administratives ou requêtes d'abonnement, et offrir à l'administration un backoffice complet de suivi, filtrage, réponse, mise à jour des statuts et gestion des priorités.

### Règle Absolue Respectée
Le système médical existant de tickets **Patient ↔ Médecin** (`tickets`, `ticketmessages`, `TicketsPage`, `TicketController`) n'a **ni été modifié, ni refait, ni altéré**. L'isolation est totale (100% de séparation logique, physique et applicative).

---

## 2. Audit Préliminaire du Système Existant

L'analyse du système existant de tickets médicaux a révélé :
1. **Table `tickets`** : Possède une contrainte `patient_id NOT NULL` et relie obligatoirement un patient à un médecin (`doctor_id`).
2. **Contrôleur `TicketController::create()`** : Bloque explicitement tout utilisateur qui n'est pas un patient (`if ($user['user_type'] != 0) Response::json(false, null, 'Patients only', 403)`).
3. **Table `ticketmessages`** : Énumération stricte `sender_type IN ('patient', 'doctor', 'clinic')`, sans distinction de rôle d'administration de plateforme.
4. **Conclusion de l'audit** : Tenter de fusionner le support administratif dans la table médicale existante aurait introduit des risques de régression, des réécritures destructives du code médical existant, et un risque de fuite de données (IDOR / confusion entre données de santé et demandes administratives).
5. **Solution retenue** : Création d'une architecture dédiée, ultra-performante et modulaire, calquée sur les patterns de TABIBI (`Database::getInstance()`, `Response::json()`, `AuthMiddleware`, `UUIDHelper`).

---

## 3. Architecture Technique et Base de Données

### Tables Dédiées

#### `admin_support_tickets`
- `id` : `CHAR(36)` PRIMARY KEY (UUID v4)
- `ticket_number` : `VARCHAR(32)` UNIQUE (format `ADM-YYMM-XXXX`, ex: `ADM-2609-4821`)
- `user_id` : `CHAR(36)` NOT NULL, INDEX
- `user_type` : `TINYINT` NOT NULL (0 = Patient, 1 = Médecin, 2 = Clinique)
- `category` : `VARCHAR(64)` NOT NULL (ex: `reclamation`, `technical`, `account`, `subscription`, etc.)
- `subject` : `VARCHAR(255)` NOT NULL
- `status` : `ENUM('OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED')` DEFAULT `'OPEN'`
- `priority` : `ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')` DEFAULT `'MEDIUM'`
- `created_at` : `DATETIME` NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` : `DATETIME` NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### `admin_support_messages`
- `id` : `CHAR(36)` PRIMARY KEY (UUID v4)
- `ticket_id` : `CHAR(36)` NOT NULL, FOREIGN KEY vers `admin_support_tickets(id)` ON DELETE CASCADE
- `sender_id` : `CHAR(36)` NOT NULL
- `sender_type` : `ENUM('user', 'admin')` NOT NULL
- `message` : `TEXT` NOT NULL
- `is_read` : `TINYINT(1)` DEFAULT 0
- `created_at` : `DATETIME` NOT NULL DEFAULT CURRENT_TIMESTAMP

---

## 4. Endpoints API & Sécurité (Anti-IDOR)

Tous les endpoints sont protégés par `AuthMiddleware` et validés par PDO Prepared Statements.

### Endpoints Utilisateurs (`/api/support/tickets`)
Accessible à tout utilisateur authentifié (Patient, Médecin, Clinique) :

| Méthode | Route | Contrôle d'accès & Sécurité |
|---|---|---|
| `POST` | `/api/support/tickets` | Authentifié. Crée le ticket avec `user_id` de la session, génère le `ticket_number`, insère le premier message. |
| `GET` | `/api/support/tickets` | Authentifié. **Anti-IDOR** : Retourne strictement les tickets où `user_id = $currentUser['id']`. |
| `GET` | `/api/support/tickets/:id` | Authentifié. **Anti-IDOR** : Vérifie l'appartenance (`user_id`). Marque les réponses admin comme lues (`is_read = 1`). |
| `POST` | `/api/support/tickets/:id/reply` | Authentifié. **Anti-IDOR** : Vérifie l'appartenance. Si le ticket était `RESOLVED` ou `PENDING`, le repasse en `IN_PROGRESS`. |

### Endpoints Administration (`/api/admin/support-tickets`)
Accessible exclusivement aux administrateurs et membres du support (`user_type = 3` ou `user_type = 4`) :

| Méthode | Route | Rôle & Fonction |
|---|---|---|
| `GET` | `/api/admin/support-tickets` | `adminOnly()`. Listing paginé, recherche textuelle multi-colonnes, filtres par `status`, `category`, `user_type`, `priority`. Jointures avec profils (nom, email, téléphone). |
| `GET` | `/api/admin/support-tickets/stats` | `adminOnly()`. Compteurs globaux (`total`, `open`, `in_progress`, `pending`, `resolved`, `closed`, `unread_messages`). |
| `GET` | `/api/admin/support-tickets/:id` | `adminOnly()`. Détails complets, métadonnées du demandeur (profil patient, médecin ou clinique), historique des messages. Marque les messages utilisateurs comme lus. |
| `POST` | `/api/admin/support-tickets/:id/reply` | `adminOnly()`. Ajoute une réponse officielle d'administration (`sender_type = 'admin'`). |
| `POST` | `/api/admin/support-tickets/:id/status` | `adminOnly()`. Modifie le statut (`status`) et/ou la priorité (`priority`). |

---

## 5. Interface Utilisateur (Frontend)

### Composant Utilisateur (`AdminSupportUserTicketsPage`)
- Localisation : Accessible via `/support-tickets` depuis la barre de navigation et le menu déroulant utilisateur.
- Liste des réclamations avec badges de statut colorés, badges de priorité, date et aperçu.
- Modal de création intuitive :
  - Sélection de catégorie (Réclamation, Technique, Compte, Service TABIBI, Abonnement, Administratif, Signalement, Demande spéciale, Autre).
  - Objet et description détaillée avec validation.
- Vue de conversation temps réel avec distinction claire entre l'utilisateur et l'équipe administrative TABIBI.
- Formulaire de relance / réponse pour continuer l'échange.

### Backoffice Administrateur (`AdminSupportBackoffice`)
- Localisation : Intégré sous forme d'onglet dédié dans le tableau de bord administrateur (`AdminDashboardPage` ➔ Onglet **Support & Réclamations**).
- Indicateur visuel de badges : Compteur dynamique des messages non lus sur le bouton d'onglet.
- Cartes d'indicateurs de performance (KPIs) : Total, Ouverts, En cours, En attente, Résolus, Fermés, Messages non lus.
- Filtres rapides par statut et recherche instantanée par numéro de ticket, nom de l'utilisateur ou objet.
- Tiroir latéral d'inspection :
  - Fiche détaillée du demandeur : Type de compte (Patient, Médecin, Clinique), Nom complet, Téléphone, Email, Date d'inscription.
  - Sélecteurs interactifs de Statut et Priorité.
  - Fil de discussion complet et éditeur de réponse administrative.

### Internationalisation (i18n)
Toutes les clés de traduction ont été ajoutées et vérifiées en trois langues :
- **Français (`fr.json`)**
- **Arabe (`ar.json`)** (avec prise en compte complète de la direction RTL)
- **Anglais (`en.json`)**

---

## 6. Fichiers Créés et Modifiés

### Fichiers Créés
1. `backend/controllers/AdminSupportTicketController.php` : Contrôleur backend complet avec logique métier, requêtes préparées et sécurisation IDOR.
2. `frontend/src/pages/AdminSupportTickets.jsx` : Composants React pour l'espace utilisateur et le backoffice d'administration.
3. `scratch/migrate_admin_support_tickets.php` : Script de migration idempotente des tables SQL.
4. `scratch/test_admin_support_tickets_api.php` : Suite de tests automatisés couvrant les 10 exigences fonctionnelles et de sécurité.
5. `Docs/TABIBI_SUPPORT_ADMIN_AUDIT.md` : Le présent rapport technique d'audit et de validation.

### Fichiers Modifiés
1. `backend/index.php` : Déclaration des routes `/api/support/tickets*` et `/api/admin/support-tickets*`.
2. `frontend/src/locales/fr.json` : Clés de traduction en français.
3. `frontend/src/locales/ar.json` : Clés de traduction en arabe.
4. `frontend/src/locales/en.json` : Clés de traduction en anglais.
5. `frontend/src/App.jsx` : Intégration du client API (`api.adminSupport`), ajout de la route `/support-tickets`, ajout de l'onglet et des badges dans `AdminDashboardPage`.

---

## 7. Résultats des Tests Automatisés (10/10 PASS)

Exécution de la suite de tests complète via `php scratch/test_admin_support_tickets_api.php` :

| N° | Test Exécuté | Description | Résultat |
|---|---|---|---|
| 1 | `Patient_Create` | Création d'un ticket par un compte Patient | **PASS** ✅ |
| 2 | `Doctor_Create` | Création d'un ticket par un compte Médecin | **PASS** ✅ |
| 3 | `Clinic_Create` | Création d'un ticket par un compte Clinique | **PASS** ✅ |
| 4 | `Admin_Receive` | Réception, listing et consultation par l'Administration | **PASS** ✅ |
| 5 | `Admin_Reply` | Envoi d'une réponse officielle par l'Admin | **PASS** ✅ |
| 6 | `User_Receive_Reply` | Réception de la réponse admin côté utilisateur | **PASS** ✅ |
| 7 | `Status_Change` | Changement des statuts (`RESOLVED`, `CLOSED`) et priorité | **PASS** ✅ |
| 8 | `User_Isolation` | Vérification IDOR (un utilisateur tiers ne peut ni voir ni répondre au ticket d'un autre) | **PASS** ✅ (HTTP 403) |
| 9 | `Med_Tickets_Isolation` | Vérification d'isolation totale (aucun ticket admin n'apparaît dans `/api/tickets` Patient↔Médecin) | **PASS** ✅ |
| 10 | `Badge_Stats` | Précision des statistiques et compteurs de messages non lus pour le backoffice | **PASS** ✅ |

Vérification frontend :
- Compilation Vite : `npm run build` exécuté avec succès (0 erreurs).

---

## 8. Conclusion et Conformité

Le module de Support Administratif & Réclamations est opérationnel, sécurisé, isolé des tickets médicaux, parfaitement traduit dans les trois langues du projet, et prêt pour l'exploitation sans aucun risque d'effet de bord sur l'existant.
