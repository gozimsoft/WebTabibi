# TABIBI — SECURITY REMEDIATION 02 : RAPPORT DE VALIDATION OFFENSIVE FINALE

**Date :** 21 Septembre 2026  
**Type d'audit :** Validation offensive locale automatisée (Post-Remediation 02)  
**Environnement :** Développements Locaux (Apache 2.4 / PHP 8.0.30 / MariaDB)  
**Périmètre :** Rate Limiting (Login, OTP, Forgot-Password), CSPRNG, Upload Sécurisé, Command Injection Data-Flow, Régression & Intégrité  
**Verdict Global :** **GO FOR COMMIT** (43 Tests : 43 PASS / 0 FAIL)

---

## 1. ENVIRONMENT

- **Serveur Web :** Apache 2.4.58 (Win64) — Port 80
- **Moteur d'exécution :** PHP 8.0.30 (CLI & Apache Module)
- **Base de données :** MariaDB 10.4.32 (`uyyuppcc_DBTabibi`)
- **API Endpoint :** `http://localhost/tabibi/backend/api`
- **Comptes utilisés :** Comptes de test éphémères générés avec préfixe aléatoire (`offval_c2dac9_*`)
- **Comptes protégés exclus :** `doc_4ab633f47e` (ID: `a1edbb20-5eff-4199-90d5-dd71683392f4`, Dr. Othmane Abdelhak) — Strictement intact et non manipulé
- **Contraintes respectées :** Aucune modification de code durant l'audit, aucune altération de structure de base de données, aucune donnée réelle affectée, aucun commit ni push effectué.

---

## 2. TESTS EXÉCUTÉS

Un total de 43 scénarios de test offensifs et de non-régression ont été exécutés via la suite d'évaluation automatisée.

| Domaine d'Audit | Nombre de Tests | Succès (PASS) | Échecs (FAIL) | Avertissements (WARNING) |
| :--- | :---: | :---: | :---: | :---: |
| 1. Login Rate Limiting | 7 | 7 | 0 | 0 |
| 2. OTP Rate Limiting & Invalidation | 7 | 7 | 0 | 0 |
| 3. Forgot Password & Anti-Énumération | 2 | 2 | 0 | 0 |
| 4. CSPRNG & Audit de l'Aléa | 3 | 3 | 0 | 0 |
| 5. Upload Photo Médecin | 10 | 10 | 0 | 0 |
| 6. Command Injection & Data-Flow | 2 | 2 | 0 | 0 |
| 7. Tests de Régression Applicatifs | 10 | 10 | 0 | 0 |
| 8. Intégrité des Données & Cleanup | 2 | 2 | 0 | 0 |
| **TOTAL** | **43** | **43** | **0** | **0** |

---

## 3. LOGIN RATE LIMITING (`POST /api/auth/login`)

### Objectifs & Règles Validées
- Protection par IP : Seuil de 5 échecs consécutifs en 5 minutes $\rightarrow$ Blocage temporaire de 15 minutes (900s).
- Protection par Compte : Seuil de 5 échecs consécutifs en 15 minutes $\rightarrow$ Blocage temporaire de 15 minutes (900s).
- En-tête standard `Retry-After` présent et cohérent.
- Réinitialisation immédiate des compteurs d'échecs après une tentative réussie.
- Absence de verrouillage définitif en base de données.
- Normalisation des identifiants (casse, espaces superflus) interdisant tout contournement par variantes triviales.

### Résultats Détaillés

| ID Test | Description du Test Offensif | Comportement Observé | Code HTTP | Statut |
| :--- | :--- | :--- | :---: | :---: |
| **LOG-01** | 5 échecs consécutifs avec mot de passe erroné depuis même IP | Rejet systématique avec message d'erreur générique | `401 Unauthorized` | **PASS** |
| **LOG-02** | 6e tentative d'authentification depuis la même IP | Blocage déclenché, en-tête `Retry-After: 899` et payload `retry_after` | `429 Too Many Requests` | **PASS** |
| **LOG-03** | Soumission du mot de passe valide pendant la fenêtre de blocage actif | La requête reste bloquée par la couche RateLimiter avant vérification du hash | `429 Too Many Requests` | **PASS** |
| **LOG-04** | Tentative de ciblage du compte depuis une IP différente (`X-Forwarded-For`) | Compteur par compte (`login_account`) actif : blocage appliqué multi-IP | `429 Too Many Requests` | **PASS** |
| **LOG-05** | Test de contournement par variantes d'identifiant (`TEST_USER`, `  test_user  `) | Normalisation stricte via `strtolower(trim($username))` avant hachage SHA-256 : blocage maintenu | `429 Too Many Requests` | **PASS** |
| **LOG-06** | Vérification de la nature temporaire du verrouillage | Le verrouillage réside dans `rate_limits.blocked_until` (+900s), la table `users` ne subit aucun verrouillage permanent | `INFO` (expire dans 897s) | **PASS** |
| **LOG-07** | Réinitialisation après connexion réussie | La connexion légitime purge instantanément les lignes associées dans `rate_limits` via `RateLimiter::reset()` | `200 OK` | **PASS** |

---

## 4. OTP RATE LIMITING & AUTO-INVALIDATION (`POST /api/auth/verify-otp`)

### Objectifs & Règles Validées
- Protection contre le brute-force d'un code OTP à 6 chiffres (1 000 000 combinaisons).
- Seuil strict : 5 tentatives erronées maximum.
- Dès le 5e échec : invalidation irréversible en base (`UPDATE password_resets SET used = 1`).
- Rejet immédiat avec HTTP 429 et obligation de redemander un nouveau code.
- Rejet absolu des codes expirés (`expires_at < NOW()`) et déjà consommés (`used = 1`).
- Résistance aux altérations de format de code.

### Résultats Détaillés

| ID Test | Description du Test Offensif | Comportement Observé | Code HTTP | Statut |
| :--- | :--- | :--- | :---: | :---: |
| **OTP-01** | Envoi de 4 mauvais codes successifs (`000001` à `000004`) | Rejet standard indiquant un code invalide | `400 Bad Request` | **PASS** |
| **OTP-02** | 5e tentative erronée soumise | Dépassement de quota déclenché : réponse 429 avec message explicatif | `429 Too Many Requests` | **PASS** |
| **OTP-03** | Vérification directe de l'état en base de données MariaDB | La ligne `password_resets` ciblée est basculée à `used = 1` | `DB State = 1` | **PASS** |
| **OTP-04** | Soumission ultérieure du véritable code OTP correct | Code rejeté (invalidation persistée en DB et blocage d'adresse actif) | `429 Too Many Requests` | **PASS** |
| **OTP-05** | Tentative avec un OTP dont la date d'expiration est dépassée | Rejet immédiat par le filtre `expires_at > NOW()` | `400 Bad Request` | **PASS** |
| **OTP-06** | Tentative avec un OTP déjà consommé (`used = 1`) | Rejet immédiat par le filtre `used = 0` | `400 Bad Request` | **PASS** |
| **OTP-07** | Altération du format de code (espaces, chaînes de caractères, longueur) | Toutes les requêtes malformées sont traitées comme des échecs sans contournement | `429 / 400` | **PASS** |

---

## 5. FORGOT PASSWORD & ANTI-ÉNUMÉRATION (`POST /api/auth/forgot-password`)

### Objectifs & Règles Validées
- Protection anti-énumération absolue : Aucune information permettant de savoir si un email existe dans la base.
- Protection anti-spam SMTP : Limitation à 3 demandes par tranche de 10 minutes par IP.

### Résultats Détaillés

| ID Test | Description du Test Offensif | Comportement Observé | Code HTTP | Statut |
| :--- | :--- | :--- | :---: | :---: |
| **FPW-01** | Comparaison compte existant vs compte inexistant (`does_not_exist@tabibi.local`) | Réponses HTTP (`200 OK`), structure JSON (`{"success":true,"message":"...","data":null}`) et messages strictement identiques | `200 OK` | **PASS** |
| **FPW-02** | 4e demande consécutive en moins de 10 minutes depuis la même IP | Limitation de débit déclenchée : `Retry-After: 900` imposé, spam SMTP bloqué | `429 Too Many Requests` | **PASS** |

---

## 6. AUDIT CSPRNG & GESTION DE L'ALÉA

### Objectifs & Règles Validées
- Substitution complète de tout générateur pseudo-aléatoire faible (`rand`, `mt_rand`) par des primitives CSPRNG du noyau PHP (`random_int`, `random_bytes`).
- Qualification rigoureuse des usages restants (`uniqid`, `microtime`).

### Résultats Détaillés

| ID Test | Cible Audité | Constat Technique | Impact Sécurité | Statut |
| :--- | :--- | :--- | :--- | :---: |
| **RND-01** | Analyse statique globale du dossier `backend/` (`\b(rand|mt_rand)\s*\(`) | **0 occurrence** trouvée dans l'intégralité du code backend | Aucun générateur non sécurisé subsistant | **PASS** |
| **RND-02** | Analyse des occurrences de `uniqid()` dans `backend/` | 1 occurrence trouvée : `backend/helpers/EmailHelper.php:79` (`$boundary = md5(uniqid());`) | Usage non sensible : séparateur de parties de message MIME RFC 2046 | **PASS** |
| **RND-03** | Génération OTP dans `AuthController::forgotPassword()` | Utilisation de `(string) random_int(100000, 999999)` garantissant un intervalle strict de 6 chiffres décimaux alimenté par CSPRNG OS | Entropie cryptographique maximale | **PASS** |

---

## 7. UPLOAD PHOTO MÉDECIN (`POST /api/doctors/photo`)

### Objectifs & Règles Validées
- Harmonisation avec `ClinicController` : Contrôle réel du type MIME binaire via `finfo_file(FILEINFO_MIME_TYPE)` et intégrité via `@getimagesize()`.
- Rejet strict des fichiers vides, fichiers surdimensionnés (>5 Mo), extensions non autorisées, faux JPEG textuels, scripts PHP renommés et images corrompues.
- Préservation de l'architecture de stockage en colonne BLOB (`photoprofile`).

### Résultats Détaillés

| ID Test | Type de Payload Injecté | Comportement Observé | Code HTTP | Statut |
| :--- | :--- | :--- | :---: | :---: |
| **UPL-01** | Fichier vide (0 octet) | Détection de taille nulle via `(int)$file['size'] === 0` | `400 Bad Request` | **PASS** |
| **UPL-02** | Fichier excédant 5 Mo (5 243 904 octets) | Rejet par contrôle de taille maximale autorisée | `400 Bad Request` | **PASS** |
| **UPL-03** | Fichier texte arbitraire nommé `fake.jpg` | Rejet par détection MIME (`text/plain` $\ne$ `image/*`) | `400 Bad Request` | **PASS** |
| **UPL-04** | Script PHP exécutable renommé `exploit.jpg` (`<?php phpinfo(); ?>`) | Rejet immédiat par `finfo_file` (`text/x-php`) | `400 Bad Request` | **PASS** |
| **UPL-05** | Binaire Windows exécutable nommé `payload.exe` | Rejet par whitelist d'extensions (`in_array($extension, ...)`) | `400 Bad Request` | **PASS** |
| **UPL-06** | En-tête JFIF valide suivi de données tronquées/corrompues | Rejet par validation structurelle d'image via `@getimagesize()` | `400 Bad Request` | **PASS** |
| **UPL-07** | Fichier JPEG réel et intègre | Accepté et stocké avec succès | `200 OK` | **PASS** |
| **UPL-08** | Fichier PNG réel et intègre | Accepté et stocké avec succès | `200 OK` | **PASS** |
| **UPL-09** | Fichier WebP réel et intègre | Accepté et stocké avec succès | `200 OK` | **PASS** |
| **UPL-10** | Vérification de la persistance en base MariaDB | Données binaires de l'image (34 octets) enregistrées dans la colonne BLOB `doctors.photoprofile` | `DB BLOB OK` | **PASS** |

---

## 8. COMMAND INJECTION : ANALYSE DU DATA-FLOW

### Méthodologie
Recherche exhaustive de l'ensemble des primitives système : `exec`, `shell_exec`, `system`, `passthru`, `proc_open`, `popen`, `pcntl_exec`, ainsi que les opérateurs d'exécution par accents graves (`` `...` ``).

### Traçabilité Complète du Data-Flow

| Fichier | Ligne | Précision d'Appel | Code Source Exact | Origine des Paramètres | Donnée Utilisateur Accessible | Statut Data-Flow |
| :--- | :---: | :--- | :--- | :--- | :---: | :--- |
| `backend/core/Database.php` | 57 | Méthode `$pdo->exec($sql)` | `$pdo->exec($sql);` (Création de `notifications`) | Constante interne DDL | **NON** | Méthode PDO SQL pure |
| `backend/controllers/AdminController.php` | 79 | Méthode `$pdo->exec(...)` | `SET foreign_key_checks = ...` | Chaîne statique hardcodée | **NON** | Méthode PDO SQL pure |
| `backend/controllers/PublicController.php` | 38 | Méthode `$pdo->exec(...)` | `SET NAMES utf8mb4` | Chaîne statique hardcodée | **NON** | Méthode PDO SQL pure |
| `backend/helpers/RateLimiter.php` | 19 | Méthode `$pdo->exec(...)` | `CREATE TABLE IF NOT EXISTS rate_limits ...` | Chaîne statique DDL interne | **NON** | Méthode PDO SQL pure |
| `backend/helpers/RateLimiter.php` | 86 | Méthode `$pdo->exec(...)` | `DELETE FROM rate_limits WHERE ...` | Chaîne statique DML interne | **NON** | Méthode PDO SQL pure |

### VERDICT TECHNIQUE
> [!NOTE]
> **VERDICT FORMEL : NO EXPLOITABLE COMMAND INJECTION DEMONSTRATED**  
> Aucun appel à un interpréteur de commandes du système d'exploitation (`cmd.exe`, `sh`, `bash`, `powershell`) n'existe dans le backend Tabibi.  
> Les alertes de scanners automatisés provenaient d'un faux positif de détection lexicale entre la méthode de base de données `$pdo->exec()` et la fonction système `exec()`.

---

## 9. TESTS DE RÉGRESSION APPLICATIFS

Les flux fonctionnels clés ont été éprouvés de bout en bout avec des comptes de test dédiés :

| ID Test | Module & Action Testée | Données / Route | Code HTTP | Statut |
| :--- | :--- | :--- | :---: | :---: |
| **REG-01** | Authentification Patient | `POST /auth/login` (Patient de test) | `200 OK` (Token émis) | **PASS** |
| **REG-02** | Authentification Médecin | `POST /auth/login` (Médecin de test) | `200 OK` (Token émis) | **PASS** |
| **REG-03** | Authentification Clinique | `POST /auth/login` (Clinique de test) | `200 OK` (Token émis) | **PASS** |
| **REG-04** | Authentification Administrateur | `POST /auth/login` (Compte `admin`) | `200 OK` (Token émis) | **PASS** |
| **REG-05** | Authentification SuperAdmin | `POST /auth/login` (Compte `usertype = 3`) | `200 OK` (Token émis) | **PASS** |
| **REG-06** | Déconnexion & Révocation de Session | `POST /auth/logout` suivi de `GET /auth/me` | `200 OK` $\rightarrow$ `401 Unauthorized` | **PASS** |
| **REG-07** | Consultation Rendez-vous Patient | `GET /patients/appointments` avec Bearer token | `200 OK` | **PASS** |
| **REG-08** | Consultation Tickets Support Patient | `GET /tickets` avec Bearer token | `200 OK` | **PASS** |
| **REG-09** | SuperAdmin Account Management | `GET /superadmin/accounts` avec Bearer token SuperAdmin | `200 OK` (Liste paginée reçue) | **PASS** |
| **REG-10** | SuperAdmin Reset Password (sur compte de test) | `POST /superadmin/accounts/{id}/reset-password` | `200 OK` & Hash DB renouvelé | **PASS** |

---

## 10. DATA INTEGRITY & AUDIT CLEANUP

Avant et après l'exécution de la suite offensive, un contrôle exhaustif des compteurs de tables et de l'intégrité des comptes réels a été opéré :

| Entité / Compteur | État Initial (Baseline) | État Final (Post-Test & Cleanup) | Statut de Conformité |
| :--- | :---: | :---: | :---: |
| **Nombre total d'utilisateurs (`users`)** | 20 197 | 20 197 | **STRICTEMENT IDENTIQUE** |
| **Nombre total de patients (`patients`)** | 11 | 11 | **STRICTEMENT IDENTIQUE** |
| **Nombre total de médecins (`doctors`)** | 20 183 | 20 183 | **STRICTEMENT IDENTIQUE** |
| **Nombre total de cliniques (`clinics`)** | 2 | 2 | **STRICTEMENT IDENTIQUE** |
| **Nombre total de rendez-vous (`apointements`)**| 16 | 16 | **STRICTEMENT IDENTIQUE** |
| **Nombre total de tickets (`tickets`)** | 5 | 5 | **STRICTEMENT IDENTIQUE** |
| **Compte protégé `doc_4ab633f47e` (Dr. Othmane)** | Actif (`is_frozen = 0`), photo non altérée | Actif (`is_frozen = 0`), photo non altérée | **100% INTACT ET PROTÉGÉ** |

Toutes les données de test éphémères (utilisateurs, sessions, jetons de réinitialisation, entrées de rate-limits créées durant l'audit) ont été intégralement purgées.

---

## 11. FINDINGS RÉSIDUELS & RECOMMANDATIONS

| ID Finding | Composant | Niveau de Risque | Description & Justification | Recommandation |
| :--- | :--- | :---: | :--- | :--- |
| **RES-01** | `EmailHelper.php:79` | **INFO** | Utilisation de `uniqid()` pour le séparateur de corps MIME d'email multipart RFC 2046. N'intervient dans aucun mécanisme d'authentification ou de cryptographie. | Maintenir tel quel. Remplacement optionnel par `bin2hex(random_bytes(16))` lors d'un futur refactoring de messagerie. |
| **RES-02** | `RateLimiter.php` | **INFO** | L'extraction d'IP évalue `HTTP_CF_CONNECTING_IP` puis `HTTP_X_FORWARDED_FOR` avant `REMOTE_ADDR`. | En environnement de production derrière Cloudflare ou reverse-proxy certifié, s'assurer que ces en-têtes sont assainis au niveau de la passerelle pour interdire l'usurpation d'IP de limitation. |

---

## 12. VERDICT FINAL

> [!IMPORTANT]
> **VERDICT OFFENSIF : GO FOR COMMIT**
>
> - **100% des tests de validation offensive sont validés avec succès (43 PASS / 0 FAIL).**
> - Les mécanismes de rate-limiting (Login, OTP, Forgot-Password) bloquent de manière effective et mesurée toute tentative de force brute sans impacter les utilisateurs légitimes.
> - L'invalidation automatique des codes OTP au 5e échec détruit la surface d'attaque sur la réinitialisation de mot de passe.
> - L'upload photo médecin valide le type MIME réel et la géométrie de l'image, interdisant tout contournement par renommage.
> - L'absence d'injection de commande OS est techniquement démontrée sur l'ensemble du flux de données.
> - L'intégrité de la base de données est certifiée : aucun compte réel n'a été altéré.
