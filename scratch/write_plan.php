<?php
$docsDir = 'D:/Github/Utopia_react/docs';
@mkdir("$docsDir/specs", 0777, true);
@mkdir("$docsDir/plans", 0777, true);

$specContent = <<<'MD'
# Architecture & Sécurité de l'Infrastructure ERP Utopia

**Date :** 2026-10-03  
**Statut :** Validé par l'utilisateur  
**Contexte :** Migration Delphi VCL vers React & MariaDB  

---

## 1. Objectifs & Exigences Fondamentales
Construire un socle d'infrastructure d'entreprise solide, robuste, auditable et hautement sécurisé pour l'ERP Utopia avant toute extension de l'interface utilisateur.

---

## 2. Découpage Modulaire par Couches (Clean Layering)
L'API Express est structurée en modules métier indépendants suivant le pattern :
`Route -> Validation (Zod DTO) -> Auth/RBAC -> Controller -> Service Métier -> Repository (SQL Paramétré)`.

### Structure :
- `backend/src/config/` : Pool MariaDB (`mysql2/promise`), JWT secrets, variables d'environnement.
- `backend/src/middleware/` :
  - `auth.js` : Vérification du JWT (Cookie HTTP-Only ou Header Bearer) et extraction du contexte utilisateur (`req.user`).
  - `validate.js` : Validation automatique des schémas Zod sur `req.body`, `req.query`, `req.params`.
  - `errorHandler.js` : Interception centralisée de toutes les erreurs avec masquage en production.
  - `auditLogger.js` : Enregistrement transparent des événements sensibles dans la table `AuditLogs`.
  - `rateLimiter.js` : Limitation des requêtes d'authentification pour contrer le brute-force.
- `backend/src/modules/` :
  - `auth` : Login, gestion des sessions caisse, vérification PIN, hachage bcrypt.
  - `pos` : Ventes en caisse, transactions ACID, gestion des tickets et fractionnement de paiement.
  - `products` : Gestion du catalogue, mouvements de stock avec verrouillage optimiste.
  - `clients` : Gestion des tiers, comptes clients, encours et fidélité.
  - `audit` : Lecture et historisation des logs de sécurité.
  - `stats` : Métriques et tableaux de bord financiers.

---

## 3. Sécurité & Protection
1. **Mots de passe :** Hachage systématique avec `bcrypt` (12 salt rounds).
2. **Authentification :** JWT signé (`HS256` ou `RS256`), durée d'expiration paramétrable (ex: 8 heures par session de caisse).
3. **Protection HTTP :** `helmet` pour la protection des headers et CORS restreint à l'origine locale (`http://localhost:3000`).
4. **Intégrité SQL :** Requêtes paramétrées exclusivement, évitant 100% des injections SQL.

---

## 4. Intégrité des Données & Journal d'Audit
1. **Table `AuditLogs` dans MariaDB :**
   - Colonnes : `id (BIGINT AUTO_INCREMENT)`, `user_id`, `user_name`, `action`, `module`, `entity_id`, `details (JSON)`, `ip_address`, `created_at`.
2. **Transactions ACID strictes :**
   - Chaque opération financière (vente, annulation, clôture) s'exécute dans une transaction isolée `START TRANSACTION ... COMMIT / ROLLBACK`.
   - Verrouillage du stock à la vente (`UPDATE Produits SET Stock = Stock - ? WHERE ID = ? AND Stock >= ?`).
   - Séquence des numéros de vente garantie sans trou (`CF-000000XX`).
MD;

file_put_contents("$docsDir/specs/2026-10-03-enterprise-infrastructure-design.md", $specContent);

$planContent = <<<'MD'
# Enterprise Infrastructure & Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre en place un socle backend professionnel, hautement sécurisé, modulaire et auditable (Clean Layering, JWT HTTP-Only, validation Zod, audit logs SQL, transactions ACID) pour l'ERP Utopia.

**Architecture:** Architecture en couches par modules autonomes (Route -> DTO Validation -> Auth -> Controller -> Service -> Repository).

**Tech Stack:** Node.js, Express, mysql2/promise, MariaDB, Zod, bcrypt, jsonwebtoken, helmet, express-rate-limit, cors.

**Spec:** `D:/Github/Utopia_react/docs/specs/2026-10-03-enterprise-infrastructure-design.md`

## Global Constraints
- Utiliser exclusivement des requêtes SQL paramétrées (`mysql2/promise`).
- Mots de passe chiffrés avec `bcrypt` (rounds = 12).
- Authentification par JWT avec support Cookie HTTP-Only.
- Toutes les opérations de vente et de stock doivent être transactionnelles (ACID).
- Réponse API standardisée : `{ success: true, data: ... }` ou `{ success: false, error: { code, message } }`.

---

### Task 1: Sécurité Base de Données & Table d'Audit SQL (`AuditLogs`)
**Files:**
- Create: `D:/Github/Utopia_react/backend/src/config/initAuditDb.js`
- Modify: `D:/Github/Utopia_react/backend/src/config/db.js`

- [ ] **Step 1:** Créer le script d'initialisation de la table `AuditLogs` dans `utopia_db`.
- [ ] **Step 2:** Exécuter la création de la table `AuditLogs` dans MariaDB.
- [ ] **Step 3:** Vérifier la structure de la table créée via mysql2.

---

### Task 2: Dépendances de Sécurité & Validation (`bcrypt`, `jsonwebtoken`, `zod`, `helmet`, `express-rate-limit`, `cookie-parser`)
**Files:**
- Modify: `D:/Github/Utopia_react/backend/package.json`

- [ ] **Step 1:** Installer les modules npm `bcryptjs`, `jsonwebtoken`, `zod`, `helmet`, `express-rate-limit`, `cookie-parser`.
- [ ] **Step 2:** Vérifier l'installation sans vulnérabilités.

---

### Task 3: Classes d'Erreurs Centralisées & Middleware de Gestion des Erreurs
**Files:**
- Create: `D:/Github/Utopia_react/backend/src/errors/AppError.js`
- Create: `D:/Github/Utopia_react/backend/src/middleware/errorHandler.js`
- Create: `D:/Github/Utopia_react/backend/src/middleware/validate.js`

- [ ] **Step 1:** Créer la hiérarchie d'erreurs (`AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ConflictError`).
- [ ] **Step 2:** Créer le middleware de validation `validate(schema)`.
- [ ] **Step 3:** Créer le middleware `errorHandler`.

---

### Task 4: Module d'Audit (`AuditRepository` & `AuditService`)
**Files:**
- Create: `D:/Github/Utopia_react/backend/src/modules/audit/audit.repository.js`
- Create: `D:/Github/Utopia_react/backend/src/modules/audit/audit.service.js`
- Create: `D:/Github/Utopia_react/backend/src/modules/audit/audit.routes.js`

- [ ] **Step 1:** Écrire `audit.repository.js` avec requêtes SQL paramétrées d'insertion et consultation.
- [ ] **Step 2:** Écrire `audit.service.js` avec helpers métier `logAction()`.
- [ ] **Step 3:** Exposer la route `GET /api/audit` pour les administrateurs.

---

### Task 5: Module d'Authentification Sécurisé (JWT, Bcrypt, Sessions Caissier)
**Files:**
- Create: `D:/Github/Utopia_react/backend/src/modules/auth/auth.dto.js`
- Create: `D:/Github/Utopia_react/backend/src/modules/auth/auth.repository.js`
- Create: `D:/Github/Utopia_react/backend/src/modules/auth/auth.service.js`
- Create: `D:/Github/Utopia_react/backend/src/modules/auth/auth.controller.js`
- Create: `D:/Github/Utopia_react/backend/src/modules/auth/auth.routes.js`
- Create: `D:/Github/Utopia_react/backend/src/middleware/auth.js`

- [ ] **Step 1:** Écrire les schémas Zod DTO pour login et ouverture de session caisse.
- [ ] **Step 2:** Écrire le repository pour `Users`, `USERS_ROLES` et `SessionUsers`.
- [ ] **Step 3:** Écrire le service avec vérification du mot de passe (migration transparente vers bcrypt si mot de passe en clair).
- [ ] **Step 4:** Créer le controller et les routes `/api/auth/login`, `/api/auth/session/open`, `/api/auth/session/close`, `/api/auth/me`.
- [ ] **Step 5:** Implémenter le middleware `authenticate` et `requireRole`.

---

### Task 6: Module POS & Ventes Transactionnelles ACID
**Files:**
- Create: `D:/Github/Utopia_react/backend/src/modules/pos/pos.dto.js`
- Create: `D:/Github/Utopia_react/backend/src/modules/pos/pos.repository.js`
- Create: `D:/Github/Utopia_react/backend/src/modules/pos/pos.service.js`
- Create: `D:/Github/Utopia_react/backend/src/modules/pos/pos.controller.js`
- Create: `D:/Github/Utopia_react/backend/src/modules/pos/pos.routes.js`

- [ ] **Step 1:** Écrire le schéma Zod pour la validation du panier et des paiements (montants, TVA, lignes, mode de règlement).
- [ ] **Step 2:** Écrire le repository POS avec requêtes SQL paramétrées.
- [ ] **Step 3:** Écrire le service avec transaction atomique (`START TRANSACTION` -> contrôle stock -> décrémentation atomique -> insertion facture -> insertion lignes -> log audit -> `COMMIT`).
- [ ] **Step 4:** Exposer les routes sécurisées `/api/pos/checkout`, `/api/pos/journal`, `/api/pos/cloture-z`.

---

### Task 7: Assemblage Global & Durcissement de `server.js`
**Files:**
- Modify: `D:/Github/Utopia_react/backend/src/server.js`

- [ ] **Step 1:** Intégrer `helmet`, `cors` restrictif, `cookieParser`, rate limiter sur `/api/auth`.
- [ ] **Step 2:** Monter les nouveaux modules par couches.
- [ ] **Step 3:** Vérifier le bon démarrage et tester les endpoints clés.
MD;

file_put_contents("$docsDir/plans/2026-10-03-enterprise-infrastructure.md", $planContent);

echo "Spec and Plan documents written successfully.\n";
