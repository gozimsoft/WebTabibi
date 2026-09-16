# RAPPORT TECHNIQUE — PHASE 02E : SESSIONS, AUTHENTIFICATION & CONTRÔLE DES ACCÈS
**Projet :** TABIBI (Web & Desktop Sync)  
**Branche :** `develop`  
**Commit de référence :** `827740a6`  
**Date :** 16 Septembre 2026  
**Statut :** AUDIT & SÉCURISATION COMPLÉTÉS — 15/15 TESTS VALIDÉS  

---

## 1. Périmètre
Le périmètre d'intervention de la **Phase 02E** a été strictement circonscrit aux composants suivants :
1. **Sessions & Bearer tokens** (génération, stockage DB, format, durée, expiration, cycle de vie, invalidation).
2. **Authentification** (login classique, inscription, confirmation email OTP, réinitialisation de mot de passe, Google OAuth, logout, comptes inactifs/supprimés).
3. **Expiration des sessions & Déconnexion** (comportement backend & frontend, révocation côté serveur).
4. **Contrôle d’accès aux endpoints & Middlewares** (`AuthMiddleware.php`, matrice RBAC).
5. **Séparation stricte des rôles** (Patient `0`, Médecin `1`, Clinique `2`, Administrateur `3`).
6. **Contrôle d'ownership & Prévention IDOR** (isolation hermétique des ressources entre utilisateurs d'un même rôle).
7. **Protection contre les accès non authentifiés** et détection des fuites d'informations sensibles (mots de passe, tokens, secrets, données internes).

**Règles absolues respectées :**
- Travail exclusivement en local (XAMPP).
- Aucune altération des 6 comptes patients réels existants (intégrité vérifiée à 100%).
- Aucun remplacement de la technologie de session (pas de migration intempestive vers JWT).
- Aucune modification du système de consentement (Phase 02C) ni de la suppression de compte (Phase 02D).
- Aucune modification du client Delphi ni des paramètres SMTP / Google OAuth.
- Aucun commit / aucun push.

---

## 2. Architecture d'authentification actuelle
L'application TABIBI utilise une architecture centralisée avec session serveur opaque (Bearer token) :
- **Table `users` :** Contient les identifiants racines (`id` UUID v4, `username`, `password` hashé en Bcrypt ou legacy Base64 auto-migré, `usertype` : `0`=Patient, `1`=Médecin, `2`=Clinique, `3`=Admin).
- **Tables de profils métier :**
  - `patients` (liée à `users.id` via `user_id`)
  - `doctors` (liée à `users.id` via `user_id`)
  - `clinics` (liée à `users.id` via `user_id`)
- **Mécanisme de session :**
  - Un token aléatoire de 64 caractères hexadécimaux (256 bits d'entropie CSPRNG) est généré lors du login : `bin2hex(random_bytes(32))`.
  - Le token est stocké en clair dans la table `sessions (id, user_id, token, created_at)`.
  - Le client transmet ce token via le header HTTP standard : `Authorization: Bearer <token>`.
  - Le frontend stocke ce token dans `localStorage` (`tabibi_token`).

---

## 3. Audit du système de session
| Propriété | État Actuel | Risque / Évaluation | Statut |
|---|---|---|---|
| **Génération du token** | `bin2hex(random_bytes(32))` (CSPRNG natif PHP) | Entropie cryptographique maximale (256 bits). Aucune collision prévisible. | **PASS** |
| **Format du token** | Chaîne hexadécimale de 64 caractères ASCII | Format opaque standard, insensible aux injections de structures. | **PASS** |
| **Stockage DB** | Table `sessions (id INT PK AUTO_INCREMENT, user_id CHAR(36), token VARCHAR(64), created_at DATETIME)` | Les colonnes `token` et `user_id` ne disposaient pas d'index dédié. Le stockage en clair en DB expose la session en cas de dump direct de DB. | **À TRAITER ULTÉRIEUREMENT** (indexation DB locale / hashing SHA-256 du token stocké) |
| **Durée & Expiration** | 30 jours par défaut (`TOKEN_EXPIRY = 2592000s`) | La constante `TOKEN_EXPIRY` était définie dans `config/database.php` mais la valeur était en dur `86400 * 30` dans le middleware. | **PASS** (corrigé pour consommer `TOKEN_EXPIRY`) |
| **Validation du token** | Requête SQL préparée `SELECT ... FROM sessions WHERE token = ?` | Requête paramétrée (aucun risque d'injection SQL). | **PASS** |
| **Invalidation active (Logout)** | `DELETE FROM sessions WHERE token = ?` | Invalidation serveur immédiate et définitive. | **PASS** |
| **Renouvellement** | Aucun renouvellement glissant actif (token statique pour 30 jours) | Risque de session hijacking persistant pendant 30 jours si le token client est compromis. | **À TRAITER ULTÉRIEUREMENT** |
| **Comportement token expiré** | Détection lors de la requête (`time() - $created > TOKEN_EXPIRY`), purge automatique en DB et réponse HTTP 401 | Nettoyage "on the fly" effectif. | **PASS** |
| **Comportement token invalide** | HTTP 401 Unauthorized avec message sécurisé | Aucune fuite d'information sur la structure du token. | **PASS** |

---

## 4. Audit de l'authentification
| Flux | Comportement Analysé | Résultat / Sécurité | Statut |
|---|---|---|---|
| **Login classique** | Vérification username / email / phone validé + mot de passe (Bcrypt / legacy) | Message d'erreur uniforme en cas d'identifiant introuvable ou de mauvais mot de passe : anti-énumération d'utilisateurs. | **PASS** |
| **Inscription patient** | OTP email 6 chiffres (10 min) + validation CGU/Confidentialité obligatoire | Inscription confirmée uniquement après validation de l'OTP. | **PASS** |
| **Inscription médecin / clinique** | Enregistrement en statut `PENDING` avec mot de passe hashé Bcrypt | Aucun accès accordé avant approbation manuelle par l'administrateur. | **PASS** |
| **Reset mot de passe** | Code OTP par email (15 min), invalidation après usage, purge de toutes les sessions actives (`DELETE FROM sessions WHERE user_id = ?`) | Forçage de reconnexion complet après réinitialisation. | **PASS** |
| **Google OAuth** | Validation côté serveur auprès de l'API Google `tokeninfo`, vérification `email_verified == true` | Les comptes patients supprimés sont bloqués (`deleteacount = 1` rejeté en 403). | **PASS** |
| **Compte supprimé** | Username anonymisé `DELETED_*`, password `'DELETED'`, sessions purgées | Bloqué à la connexion et désormais invalidé au niveau du middleware. | **PASS** |
| **Compte non validé** | `emailvalidation = 0` | Bloqué en HTTP 403 avec réémission automatique de l'OTP. | **PASS** |

---

## 5. Audit des Middlewares & Autorisations
Le middleware central [`backend/middleware/AuthMiddleware.php`](file:///c:/xampp/htdocs/tabibi/backend/middleware/AuthMiddleware.php) expose :
- `AuthMiddleware::authenticate(bool $required = true)` : Extrait le token Bearer (`$_SERVER['HTTP_AUTHORIZATION']`, redirection Apache ou `getallheaders()`), vérifie la présence en table `sessions`, contrôle l'expiration (`TOKEN_EXPIRY`), vérifie si le compte patient a été supprimé (`deleteacount = 1`), et renvoie la ligne de session (`user_id`, `usertype`, `username`).
- `AuthMiddleware::patientOnly()` : Vérifie `usertype === 0`, sinon HTTP 403.
- `AuthMiddleware::doctorOnly()` : Vérifie `usertype === 1`, sinon HTTP 403.
- `AuthMiddleware::clinicOnly()` : Vérifie `usertype === 2`, sinon HTTP 403.
- `AuthMiddleware::adminOnly()` : Vérifie `usertype === 3`, sinon HTTP 403.

---

## 6. Matrice des Endpoints & Contrôle des Accès
La matrice exhaustive suivante recense l'ensemble des endpoints de l'API, leur politique d'authentification, le rôle requis, le contrôle d'ownership et le résultat validé :

| Endpoint | Méthode | Auth | Rôle Requis | Ownership Check | Résultat / Statut |
|---|---|---|---|---|---|
| `/health` | GET | Non | Public | N/A | **PASS** |
| `/debug-email` | GET | **Oui** | **Admin (3)** | N/A | **PASS** (Sécurisé en adminOnly) |
| `/auth/register` | POST | Non | Public | N/A | **PASS** |
| `/auth/register-confirm` | POST | Non | Public | N/A | **PASS** |
| `/auth/login` | POST | Non | Public | N/A | **PASS** |
| `/auth/google` | POST | Non | Public | N/A | **PASS** |
| `/auth/logout` | POST | Oui | Tous | Session courante | **PASS** |
| `/auth/me` | GET | Oui | Tous | Dérivé de `user_id` session | **PASS** |
| `/auth/forgot-password` | POST | Non | Public | Anti-énumération | **PASS** |
| `/auth/verify-otp` | POST | Non | Public | OTP 15 min | **PASS** |
| `/auth/verify-account-email` | POST | Non | Public | OTP 10 min | **PASS** |
| `/auth/reset-password` | POST | Non | Public | Invalidation des sessions | **PASS** |
| `/verify/send` | POST | Oui | Patient (0) | Dérivé de `user_id` | **PASS** |
| `/verify/confirm` | POST | Oui | Patient (0) | Dérivé de `user_id` | **PASS** |
| `/verify/status` | GET | Oui | Patient (0) | Dérivé de `user_id` | **PASS** |
| `/patients/profile` | GET | Oui | Patient (0) | `WHERE user_id = session.user_id` | **PASS** |
| `/patients/profile` | PUT | Oui | Patient (0) | `WHERE user_id = session.user_id` | **PASS** |
| `/patients/credentials` | PUT | Oui | Patient (0) | `WHERE id = session.user_id` | **PASS** |
| `/patients/appointments` | GET | Oui | Patient (0) | `WHERE patient_id = self OR proches` | **PASS** |
| `/patients/attending-doctor` | GET | Oui | Patient (0) | `WHERE user_id = session.user_id` | **PASS** |
| `/patients/attending-doctor` | POST | Oui | Patient (0) | `WHERE user_id = session.user_id` | **PASS** |
| `/patients/attending-doctor` | DELETE | Oui | Patient (0) | `WHERE user_id = session.user_id` | **PASS** |
| `/patients/attending-doctor/history` | GET | Oui | Patient (0) | `WHERE a.patient_id = self` | **PASS** |
| `/patients/attending-doctor/search` | GET | Oui | Patient (0) | Médecins approuvés publics | **PASS** |
| `/consent/my` | GET | Oui | Tous | `WHERE user_id = session.user_id` | **PASS** |
| `/consent/withdraw` | POST | Oui | Tous | `WHERE user_id = session.user_id` | **PASS** |
| `/patients/account` | DELETE | Oui | Patient (0) | `WHERE user_id = session.user_id` | **PASS** |
| `/doctors/profile` | GET | Oui | Médecin (1) | `WHERE user_id = session.user_id` | **PASS** |
| `/doctors/profile` | PUT | Oui | Médecin (1) | `WHERE user_id = session.user_id` | **PASS** |
| `/doctors/photo` | POST | Oui | Médecin (1) | `WHERE user_id = session.user_id` | **PASS** |
| `/doctors/upload` | POST | Oui | Médecin (1) | `WHERE user_id = session.user_id` | **PASS** |
| `/doctors/reasons` | GET | Oui | Médecin (1) | `WHERE doctor_id = session.doctor_id` | **PASS** |
| `/doctors/reasons` | POST | Oui | Médecin (1) | `WHERE doctor_id = session.doctor_id` | **PASS** |
| `/doctors/reasons/:id` | DELETE | Oui | Médecin (1) | `WHERE id = ? AND doctor_id = ?` | **PASS** |
| `/doctors/appointment-settings` | GET | Oui | Médecin (1) | `WHERE doctor_id = session.doctor_id` | **PASS** |
| `/doctors/appointment-settings` | POST | Oui | Médecin (1) | `WHERE doctor_id = session.doctor_id` | **PASS** |
| `/doctors/appointment-settings/:id` | PUT | Oui | Médecin (1) | `WHERE id = ? AND doctor_id = ?` | **PASS** |
| `/doctors/appointment-settings/:id` | DELETE | Oui | Médecin (1) | `WHERE id = ? AND doctor_id = ?` | **PASS** |
| `/doctors/off-hours` | GET | Oui | Médecin (1) | `WHERE doctor_id = session.doctor_id` | **PASS** |
| `/doctors/off-hours` | POST | Oui | Médecin (1) | `WHERE doctor_id = session.doctor_id` | **PASS** |
| `/doctors/off-hours/:id` | PUT | Oui | Médecin (1) | `WHERE id = ? AND doctor_id = ?` | **PASS** |
| `/doctors/off-hours/:id` | DELETE | Oui | Médecin (1) | `WHERE id = ? AND doctor_id = ?` | **PASS** |
| `/doctor/appointments` | GET | Oui | Médecin (1) | `WHERE cd.doctor_id = ?` | **PASS** |
| `/appointments/manager` | GET | Oui | Médecin (1) | `WHERE cd.doctor_id = ?` | **PASS** |
| `/appointments/sync-check` | GET | Oui | Médecin (1) | `WHERE cd.doctor_id = ?` | **PASS** |
| `/appointments/manager/add` | POST | Oui | Médecin (1) | Vérification lien clinique/médecin | **PASS** |
| `/appointments/:id/status` | PUT | Oui | Médecin (1) | Vérification ownership RDV médecin | **PASS** |
| `/appointments/available-slots` | GET | Non | Public | Agenda médecin/clinique public | **PASS** |
| `/appointments` | POST | Oui | Patient (0) | Associé à `patient_id` session | **PASS** |
| `/appointments/:id` | GET | Oui | Patient (0) | `appt.patient_id === patient.id` (403) | **PASS** |
| `/appointments/:id` | DELETE | Oui | Patient (0) | `patient_id = self OR proche` | **PASS** |
| `/apointements/sync` | POST | Oui | Médecin (1) | Dérivé de `session.user_id` | **PASS** |
| `/specialties` | GET | Non | Public | Annuaire | **PASS** |
| `/wilayas` | GET | Non | Public | Annuaire | **PASS** |
| `/baladiyas` | GET | Non | Public | Annuaire | **PASS** |
| `/reasons` | GET | Non | Public | Annuaire | **PASS** |
| `/doctors/:id` | GET | Non | Public | Profil public médecin | **PASS** |
| `/public/stats` | GET | Non | Public | Agrégats statistiques anonymes | **PASS** |
| `/visits` | POST | Non | Public | IP / Wilaya anonymisée | **PASS** |
| `/clinics` | GET | Non | Public | Recherche publique | **PASS** |
| `/clinics/profile` | GET | Oui | Clinique (2) | `WHERE user_id = session.user_id` | **PASS** |
| `/clinics/profile` | PUT | Oui | Clinique (2) | `WHERE user_id = session.user_id` | **PASS** |
| `/clinics/profile` | POST | Oui | Clinique (2) | `WHERE user_id = session.user_id` | **PASS** |
| `/clinics/logo` | POST | Oui | Clinique (2) | `WHERE user_id = session.user_id` | **PASS** |
| `/clinics/:id` | GET | Non | Public | Fiche publique (sans password) | **PASS** |
| `/clinics/:id/photo` | GET/POST | GET: Pub / POST: Clinique | Vérification usertype 2 | **PASS** |
| `/clinics/:cId/doctors/:dId` | GET | Non | Public | Fiche publique médecin en clinique | **PASS** |
| `/chat/threads` | GET | Oui | Patient (0) | `WHERE mt.patient_id = self` | **PASS** |
| `/chat/threads` | POST | Oui | Patient (0) | `WHERE mt.patient_id = self` | **PASS** |
| `/chat/threads/:id/messages` | GET | Oui | Patient (0) | `WHERE thread.patient_id = self` (403) | **PASS** |
| `/chat/threads/:id/messages` | POST | Oui | Patient (0) | `WHERE thread.patient_id = self` (403) | **PASS** |
| `/ratings` | POST | Oui | Patient (0) | `WHERE patient_id = self` | **PASS** |
| `/ratings/doctor/:id` | GET | Non | Public | Avis agrégés | **PASS** |
| `/sync/*` (upload, download, delete, etc.) | POST/GET | Oui | Médecin (1) | Dérivé du `session.user_id` médecin | **PASS** |
| `/register/clinic` | POST | Non | Public | Inscription préliminaire | **PASS** |
| `/register/doctor` | POST | Non | Public | Inscription préliminaire | **PASS** |
| `/register/status` | GET | Non | Public | Statut sans hash/mdp | **PASS** |
| `/admin/stats` | GET | Oui | Admin (3) | `AuthMiddleware::adminOnly()` | **PASS** |
| `/admin/clinics` | GET | Oui | Admin (3) | `AuthMiddleware::adminOnly()` | **PASS** |
| `/admin/doctors` | GET | Oui | Admin (3) | `AuthMiddleware::adminOnly()` | **PASS** |
| `/admin/clinics/:id/approve` | POST | Oui | Admin (3) | `AuthMiddleware::adminOnly()` | **PASS** |
| `/admin/clinics/:id/reject` | POST | Oui | Admin (3) | `AuthMiddleware::adminOnly()` | **PASS** |
| `/admin/doctors/:id/approve` | POST | Oui | Admin (3) | `AuthMiddleware::adminOnly()` | **PASS** |
| `/admin/doctors/:id/reject` | POST | Oui | Admin (3) | `AuthMiddleware::adminOnly()` | **PASS** |
| `/relations/request` | POST | Oui | Médecin (1) / Clinique (2) | Vérification rôle & relation | **PASS** |
| `/relations/requests` | GET | Oui | Médecin (1) / Clinique (2) | Scoped par ID médecin/clinique | **PASS** |
| `/relations/check/:id` | GET | Oui | Médecin (1) / Clinique (2) | Vérification relation directe | **PASS** |
| `/relations/requests/:id/respond` | POST | Oui | Médecin (1) / Clinique (2) | Destinataire strict uniquement | **PASS** |
| `/tickets` | POST | Oui | Patient (0) | `patient_id` assigné depuis session | **PASS** |
| `/tickets` | GET | Oui | Tous | Filtré par rôle & ID utilisateur | **PASS** |
| `/tickets/:id` | GET | Oui | Patient/Doc/Clinique | Vérification stricte appartenance | **PASS** |
| `/tickets/:id/reply` | POST | Oui | Patient/Doc/Clinique | Vérification stricte appartenance | **PASS** |
| `/tickets/:id/close` | POST | Oui | Médecin (1) / Clinique (2) | Vérification stricte appartenance | **PASS** |
| `/notifications` | GET | Oui | Tous | `WHERE user_id = session.user_id` | **PASS** |
| `/notifications/read-all` | PUT | Oui | Tous | `WHERE user_id = session.user_id` | **PASS** |
| `/notifications/:id` | PUT | Oui | Tous | `WHERE id = ? AND user_id = ?` | **PASS** |
| `/notifications/:id` | DELETE | Oui | Tous | `WHERE id = ? AND user_id = ?` | **PASS** |

---

## 7. Contrôle des Rôles (RBAC)
Les tests d'inversion et de transgression de rôles ont été exécutés avec des tokens réels générés pour chaque type d'utilisateur :

| Tentative de Transgression | Rôle Demandeur | Cible | Statut Obtenu | Résultat |
|---|---|---|---|---|
| Patient → Endpoint Médecin (`/api/doctors/profile`) | Patient (0) | DoctorOnly | HTTP 403 Forbidden | **PASS** |
| Patient → Endpoint Admin (`/api/admin/stats`) | Patient (0) | AdminOnly | HTTP 403 Forbidden | **PASS** |
| Patient → Delphi Sync (`/api/sync/upload`) | Patient (0) | DoctorOnly | HTTP 403 Forbidden | **PASS** |
| Médecin → Endpoint Clinique (`/api/clinics/profile`) | Médecin (1) | ClinicOnly | HTTP 403 Forbidden | **PASS** |
| Médecin → Endpoint Admin (`/api/admin/stats`) | Médecin (1) | AdminOnly | HTTP 403 Forbidden | **PASS** |
| Médecin → Création Ticket Patient (`/api/tickets`) | Médecin (1) | PatientOnly | HTTP 403 Forbidden | **PASS** |
| Clinique → Endpoint Médecin (`/api/doctors/profile`) | Clinique (2) | DoctorOnly | HTTP 403 Forbidden | **PASS** |
| Clinique → Endpoint Admin (`/api/admin/stats`) | Clinique (2) | AdminOnly | HTTP 403 Forbidden | **PASS** |
| Clinique → Fermeture de compte Patient (`/api/patients/account`) | Clinique (2) | PatientOnly | HTTP 403 Forbidden | **PASS** |

---

## 8. Tests IDOR (Insecure Direct Object Reference)
Pour valider l'étanchéité des ressources privées entre utilisateurs d'un même rôle, deux patients (`Patient A` et `Patient B`) ainsi que deux médecins (`Médecin A` et `Médecin B`) ont été configurés.

### A. Isolation Patient A vs Patient B
- **Lecture du RDV de B par A :** `GET /api/appointments/{id_b}` avec le Bearer token de A.
  - Résultat : **HTTP 403 Forbidden** (`Accès interdit`).
- **Annulation du RDV de B par A :** `DELETE /api/appointments/{id_b}` avec le Bearer token de A.
  - Résultat : **HTTP 404 Not Found** (recherche restreinte à `WHERE id = ? AND patient_id = self`).
- **Accès au ticket support de B par A :** `GET /api/tickets/{ticket_b_id}` avec le Bearer token de A.
  - Résultat : **HTTP 403 Forbidden** (`ليس لديك صلاحية الاطلاع على هذه التذكرة`).
- **Suppression d'une notification de B par A :** `DELETE /api/notifications/{notif_b_id}` avec le Bearer token de A.
  - Résultat : **HTTP 404 Not Found** (`WHERE id = ? AND user_id = self`).
- **Lecture de profil :** `GET /api/patients/profile` avec le Bearer token de A.
  - Résultat : Renvoie exclusivement les données du Patient A (`user_id` issu du token). Aucun paramètre URL d'ID n'est accepté.

### B. Isolation Médecin A vs Médecin B
- **Modification des paramètres d'agenda de B par A :** `PUT /api/doctors/appointment-settings/{setting_b_id}` avec le token de Dr A.
  - Résultat : **HTTP 404 Not Found** (`WHERE id = ? AND doctor_id = self`).
- **Suppression d'un motif de consultation de B par A :** `DELETE /api/doctors/reasons/{reason_b_id}` avec le token de Dr A.
  - Résultat : **HTTP 404 Not Found** (`WHERE id = ? AND doctor_id = self`).
- **Lecture de profil :** `GET /api/doctors/profile` avec le token de Dr A.
  - Résultat : Renvoie exclusivement le profil du Dr A (`WHERE user_id = session.user_id`).

---

## 9. Tests Tokens & Sessions
Les cycles de vie des tokens ont été éprouvés :
1. **Token valide :** Reconnexion immédiate de la session via `GET /api/auth/me` → **HTTP 200** avec identifiants utilisateur exacts.
2. **Token inexistant / aléatoire :** Requête avec un token synthétique inconnu → **HTTP 401** (`انتهت جلستك أو أنها غير صالحة`).
3. **Token expiré (> 30 jours) :** Session créée artificiellement avec `created_at = DATE_SUB(NOW(), INTERVAL 35 DAY)` :
   - L'appel API renvoie **HTTP 401** (`انتهت صلاحية جلستك`).
   - La ligne correspondante est **automatiquement purgée** de la table `sessions`.
4. **Token supprimé :** Suppression manuelle de la table `sessions` → l'appel ultérieur renvoie **HTTP 401**.

---

## 10. Déconnexion (Logout)
- L'appel à `POST /api/auth/logout` avec le Bearer token actif :
  - Supprime immédiatement l'enregistrement dans la table MySQL `sessions`.
  - Renvoie **HTTP 200** (`Déconnecté avec succès`).
- Tentative de réutilisation du même token immédiatement après déconnexion :
  - Rejetée en **HTTP 401 Unauthorized**.
- Côté frontend (`App.jsx` & `Navbar.jsx`) :
  - `localStorage.removeItem("tabibi_token")`.
  - Réinitialisation de l'état `user` à `null`.
  - Redirection vers `/login`.
  - En cas de réponse 401 sur une requête quelconque, l'intercepteur API purge le token local sans boucle infinie.

---

## 11. Rate Limiting & Protection Brute-Force
> [!WARNING]  
> **Protection brute-force absente ou non démontrée.**  

L'audit révèle qu'il n'existe actuellement aucun mécanisme applicatif (ni compteur de tentatives en base, ni verrouillage temporaire de compte, ni middleware de rate-limiting) sur les routes :
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`

**Correction minimale proposée pour une phase ultérieure :**
1. Au niveau infrastructure (recommandé) : Configuration d'une directive Nginx ou Apache `limit_req_zone` (ex. `limit_req zone=login burst=5 nodelay;` limitant à 5 requêtes/minute par IP).
2. Au niveau applicatif : Table légère `login_attempts (ip_address, username, attempted_at)` avec blocage temporaire (15 minutes) après 5 échecs consécutifs.

---

## 12. Logs de Sécurité
L'analyse de la traçabilité des événements de sécurité indique :
- **Événements tracés :**
  - Logs de consentements et retraits : table `consent_logs` (Phase 02C).
  - Logs de synchronisation Delphi : table `synclogs` / `SyncController`.
  - Visites du site : table `site_visits`.
- **Événements NON tracés (Besoin identifié) :**
  - Tentatives de login échouées (avec adresse IP source).
  - Connexions réussies (avec horodatage et IP).
  - Déconnexions.
  - Demandes de réinitialisation de mot de passe.

> [!NOTE]  
> **Recommandation :** Implémenter une table d'audit `security_logs (id, event_type, user_id, ip_address, user_agent, created_at)` sans jamais enregistrer de mots de passe, de tokens complets ni de secrets.

---

## 13. Vulnérabilités Réellement Trouvées
Au cours de l'audit technique approfondi, les vulnérabilités démontrées suivantes ont été identifiées :

1. **Fuite de hash/mot de passe de clinique sur endpoint public (CRITIQUE) :**
   - Dans [`backend/controllers/ClinicController.php:430`](file:///c:/xampp/htdocs/tabibi/backend/controllers/ClinicController.php#L430), la méthode `getClinic($id)` exécutait `SELECT c.* FROM clinics c ...` et renvoyait directement l'objet `$clinic`. La table `clinics` contient une colonne historique `password` (varchar 255). Tout internaute non authentifié interrogeant `/api/clinics/{id}` pouvait obtenir le hash/mot de passe de la clinique.
   - De même, `ClinicController::getProfile()`, `uploadProfile()`, `AuthController::login()` et `AuthController::me()` omettaient de retirer `password` de l'objet clinique.
2. **Exposition non authentifiée d'email patient sur `/debug-email` (MOYENNE) :**
   - Dans `backend/index.php`, la route `GET /api/debug-email` était accessible sans aucune authentification et renvoyait l'adresse email réelle d'un patient de la base tout en déclenchant l'envoi d'un faux email de confirmation.
3. **Validation de session pour compte patient supprimé (MOYENNE) :**
   - Si un patient voyait son compte supprimé (`deleteacount = 1` dans `patients`), le middleware `AuthMiddleware::authenticate()` ne vérifiait que la table `users` et `sessions`. Si une session résiduelle existait, le token restait accepté pour les routes ne filtrant pas sur `deleteacount`.
4. **Constante d'expiration non respectée dans le Middleware (MINEURE) :**
   - `AuthMiddleware.php` utilisait la valeur en dur `86400 * 30` au lieu de consommer la constante configurable `TOKEN_EXPIRY` définie dans `config/database.php`.

---

## 14. Corrections Effectuées
Les corrections ont été appliquées de manière strictement ciblée et minimale, sans altération des API existantes :

1. **Suppression de la fuite de mot de passe clinique :**
   - Ajout de `unset($clinic['password']);` dans `ClinicController::getClinic()`, `ClinicController::getProfile()` et `ClinicController::uploadProfile()`.
   - Ajout de `unset($clinic['password']);` et `unset($profile['password']);` dans `AuthController::login()` et `AuthController::me()`.
2. **Sécurisation de la route de debug :**
   - Ajout de `AuthMiddleware::adminOnly();` sur la route `GET /debug-email` dans `backend/index.php`.
3. **Hardening de `AuthMiddleware.php` :**
   - Prise en compte de la constante `TOKEN_EXPIRY` (`$expiryDuration = defined('TOKEN_EXPIRY') ? (int)TOKEN_EXPIRY : 86400 * 30;`).
   - Vérification de l'état `deleteacount` pour les patients (`usertype === 0`) : purge immédiate des sessions résiduelles et rejet en HTTP 403 (`هذا الحساب تم حذفه بناءً على طلب صاحبه.`).

---

## 15. Points Non Corrigés et Pourquoi
1. **Absence de protection Brute-force / Rate-limiting :**
   - Non implémenté conformément à la consigne stricte de la Phase 02E : *"NE PAS installer immédiatement une nouvelle solution. Documenter 'Protection brute-force absente ou non démontrée'."*
2. **Stockage en clair des tokens dans `sessions` :**
   - Non modifié pour ne pas casser la compatibilité avec les clients en cours de session et respecter la règle d'absence de refactorisation massive de l'architecture d'authentification.
3. **Indexation de la colonne `sessions.token` :**
   - Bien que recommandée pour la performance sur gros volume, aucune modification de schéma DB n'a été exécutée en conformité avec l'interdiction de modifier la structure sans validation préalable.

---

## 16. Résultats des Tests Automatisés
La suite de tests automatisée `test_phase02e_runner.php` exécutée en local a couvert l'intégralité des 15 scénarios minimaux requis :

```text
===================================================================
TABIBI PHASE 02E — SUITE DE TESTS DE SÉCURITÉ
===================================================================
[PASS] 01. Login valide                                     : HTTP 200, token retourné, user_type=0, profil chargé
[PASS] 02. Mauvais mot de passe                             : HTTP 401, refus authentification, aucun token émis
[PASS] 03. Utilisateur inexistant                           : HTTP 401, message générique anti-énumération
[PASS] 04. Token valide                                     : HTTP 200, session reconnue pour user_id
[PASS] 05. Token invalide                                   : HTTP 401, accès refusé proprement
[PASS] 06. Token expiré (> 30 jours)                       : HTTP 401, token invalidé et purgé de la table sessions
[PASS] 07. Déconnexion (Logout)                            : HTTP 200, session supprimée du serveur
[PASS] 08. Réutilisation token après logout               : HTTP 401, ancien token révoqué rejeté
[PASS] 09. IDOR Patient A → Patient B                     : RDV (403), Annulation (404/403), Ticket (403), Notification (404), Profil isolé
[PASS] 10. IDOR Médecin A → Médecin B                   : Settings tiers (404), Motifs tiers (404), Profil médecin strictement isolé
[PASS] 11. Accès sans authentification (Protected Routes)  : Routes protégées (Patient, Doctor, Admin, Debug) toutes rejetées en 401
[PASS] 12. Séparation stricte des rôles (RBAC)            : Transgressions de rôles systématiquement bloquées en 403 Forbidden
[PASS] 13. Gestion du compte supprimé                      : Suppression (200), Reconnexion interdite, Sessions invalidées
[PASS] 14. Export & Absence de fuite de mots de passe       : Aucun hash, password ou secret clinique/utilisateur exposé
[PASS] 15. Nettoyage des tests & Intégrité DB             : Tous les comptes de test supprimés. 6/6 patients d'origine 100% intacts
===================================================================
RÉSUMÉ : 15 / 15 TESTS VALIDÉS (Échecs : 0)
===================================================================
```

### Vérifications complémentaires :
- **Syntaxe PHP (`php -l`) :** 0 erreur sur tous les fichiers modifiés (`backend/index.php`, `backend/middleware/AuthMiddleware.php`, `backend/controllers/AuthController.php`, `backend/controllers/ClinicController.php`).
- **Build Frontend (`npm run build`) :** Succès complet (`✓ built in 13.20s`, bundle de production généré sans régression).
- **Intégrité DB :** Les 6 patients initiaux (`admin`, `Amar Gozim`, `Khaled Randji`, `khaled taybi`, `mohamed Ahmed`, `Nabil nano`) sont strictement intacts.

---

## 17. Risques Restant à Traiter
1. **Absence de Rate-Limiting (Brute-Force) :** Risque d'attaque par dictionnaire sur l'endpoint `/api/auth/login`.  
   *Classification :* **À TRAITER ULTÉRIEUREMENT** (Recommandé en Phase 02F / Infrastructure Nginx).
2. **Durée de vie des tokens longue (30 jours) sans rotation glissante :** Si un Bearer token est intercepté côté client, il demeure utilisable pendant 30 jours à moins que l'utilisateur n'effectue un logout explicite ou ne change son mot de passe.  
   *Classification :* **À TRAITER ULTÉRIEUREMENT**.
3. **Absence de journalisation des échecs d'authentification :** Impossibilité actuelle de corréler des tentatives d'intrusion répétées sans logs serveur Apache.  
   *Classification :* **À TRAITER ULTÉRIEUREMENT**.

---
**Conclusion Phase 02E :**  
Toutes les vulnérabilités démontrées (fuites de secrets cliniques, exposition de debug et sessions sur comptes supprimés) ont été corrigées de façon minimale et vérifiées. Les mécanismes d'authentification, de contrôle d'accès et d'étanchéité IDOR sont conformes et opérationnels.
