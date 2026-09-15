# TABIBI — PHASE 02B : SÉCURISATION DES MOTS DE PASSE

**Date :** 15/09/2026  
**Statut :** IMPLÉMENTÉ — EN ATTENTE DE VALIDATION  
**Environnement :** LOCAL uniquement (aucune modification de production)

---

## 1. ÉTAT AVANT

| Critère | Valeur |
|---|---|
| Mécanisme | `base64_encode($password)` |
| Sécurité | AUCUNE (Base64 est réversible, pas un hash) |
| Détection | Impossible de distinguer un "hash" legacy d'une valeur valide |
| Résistance | Nulle face à une fuite de base de données |
| Tables concernées | `users.password`, `doctorregistrations.password`, `clinicregistrations.password` |
| Type de colonne | `varchar(255)` dans les trois tables |

---

## 2. ÉTAT APRÈS

| Critère | Valeur |
|---|---|
| Mécanisme nouveaux comptes | `password_hash($password, PASSWORD_DEFAULT)` — Bcrypt (cost=10) |
| Mécanisme anciens comptes | Détection automatique via `password_get_info()` + migration silencieuse au login |
| Longueur hash Bcrypt | 60 caractères — compatible varchar(255) existant |
| Colonne DB modifiée | **AUCUNE** — varchar(255) suffit |
| Détection | `PasswordHelper::isLegacy()` via `password_get_info()` (fonction native PHP) |
| Résistance | Bcrypt avec salage automatique — résistant aux attaques par tables arc-en-ciel |

---

## 3. FICHIERS MODIFIÉS

### Nouveau fichier

| Fichier | Action | Description |
|---|---|---|
| `backend/helpers/PasswordHelper.php` | **CRÉÉ** | Helper centralisé : `isLegacy()`, `verify()`, `hash()`, `needsMigration()` |

### Fichiers modifiés

| Fichier | Action | Lignes concernées |
|---|---|---|
| `backend/controllers/AuthController.php` | MODIFIÉ | `login()` : vérification duale + migration silencieuse |
| `backend/controllers/AuthController.php` | MODIFIÉ | `registerConfirm()` : `password_hash()` au lieu de `base64_encode()` |
| `backend/controllers/AuthController.php` | MODIFIÉ | `google()` : `password_hash()` pour mot de passe aléatoire |
| `backend/controllers/AuthController.php` | MODIFIÉ | `resetPassword()` : `password_hash()` au lieu de `base64_encode()` |
| `backend/controllers/PatientController.php` | MODIFIÉ | `updateCredentials()` : `PasswordHelper::hash()` |
| `backend/controllers/DoctorController.php` | MODIFIÉ | `updateProfile()` : `PasswordHelper::hash()` |
| `backend/controllers/ClinicController.php` | MODIFIÉ | `updateProfile()` : `PasswordHelper::hash()` |
| `backend/controllers/RegistrationController.php` | MODIFIÉ | `registerClinic()` et `registerDoctor()` : `PasswordHelper::hash()` |
| `backend/controllers/AdminController.php` | MODIFIÉ | `approveClinic()` et `approveDoctor()` : détection legacy/Bcrypt, copie sans double hash |
| `backend/helpers/EmailHelper.php` | MODIFIÉ | `sendApprovalCredentials()` : `$plainPassword` rendu nullable (`?string`) |
| `backend/helpers/EmailHelper.php` | MODIFIÉ | `buildApprovalCredentialsTemplate()` : `$plainPassword` nullable, affichage adapté |

### Fichiers NON modifiés (conformément aux instructions)

- `EmailHelper.php` → Base64 SMTP/HTML **non modifiés** (encodage email, pas mots de passe)
- `PatientController.php`, `DoctorController.php`, `ClinicController.php` → `base64_encode($photoprofile)` **non modifiés** (transport JSON de données binaires, pas de mots de passe)
- Delphi, Android, iOS : **aucune modification**

---

## 4. LOGIQUE DE MIGRATION

### PasswordHelper::isLegacy()

```php
public static function isLegacy(string $stored): bool {
    $info = password_get_info($stored);
    return empty($info['algo']) || $info['algoName'] === 'unknown';
}
```

`password_get_info()` est la fonction native PHP. Un hash Bcrypt retourne `algoName = 'bcrypt'`. Une valeur Base64 retourne `algoName = 'unknown'`.

### Flux de login (migration silencieuse)

```
1. Récupérer $user['password'] depuis la DB
2. PasswordHelper::verify($input, $stored) :
   → Si legacy : compare base64_encode($input) === $stored
   → Si Bcrypt  : password_verify($input, $stored)
3. Si échec → HTTP 401
4. Si succès ET needsMigration($stored) :
   → Créer newHash = PasswordHelper::hash($input)
   → UPDATE users SET password = newHash WHERE id = ?
   → (silencieux, transparent pour l'utilisateur)
5. Continuer la connexion normalement
```

---

## 5. GESTION DES COMPTES LEGACY

- Les comptes existants (Base64) continuent de fonctionner **sans aucune intervention**.
- À chaque login réussi, le compte est **automatiquement et silencieusement** migré vers Bcrypt.
- Le mot de passe saisi par l'utilisateur reste **strictement identique** — seul le stockage change.
- Un compte qui ne se reconnecte jamais reste en Base64 indéfiniment — **aucune migration forcée**.

---

## 6. GESTION DES NOUVEAUX COMPTES

Tous les nouveaux mots de passe (inscription, reset, changement) utilisent désormais :

```php
PasswordHelper::hash($password) // = password_hash($password, PASSWORD_DEFAULT)
```

Cela concerne :
- Inscription patient (OTP confirm)
- Inscription médecin (RegistrationController)
- Inscription clinique (RegistrationController)
- Reset mot de passe
- Changement de mot de passe (patient, médecin, clinique)
- Création de compte Google (mot de passe aléatoire)

---

## 7. GESTION DES DEMANDES MÉDECIN/CLINIQUE (flux d'approbation admin)

### Problème critique résolu

Avant cette phase :
- `doctorregistrations.password` et `clinicregistrations.password` stockaient les mots de passe en Base64.
- Lors de l'approbation admin, le code faisait `base64_decode($reg['password'])` pour l'email et copiait `$reg['password']` tel quel dans `users`.

Après cette phase :
- Ces tables stockent désormais les mots de passe en Bcrypt (pour les nouvelles demandes).
- Lors de l'approbation, `PasswordHelper::isLegacy()` détecte le format :
  - **Legacy (Base64)** : décode pour l'email, copie tel quel dans `users`.
  - **Bcrypt** : `$plainPassword = null` pour l'email (message "mot de passe que vous avez défini"), copie tel quel dans `users`.
- **Aucun double hash** dans aucun cas.

### Email d'approbation

- Legacy : l'email affiche le mot de passe en clair (comme avant).
- Bcrypt : l'email affiche "كلمة المرور التي اخترتها عند التسجيل" (le mot de passe que vous avez défini lors de l'inscription).

---

## 8. TESTS EFFECTUÉS

| Test | Description | Résultat |
|---|---|---|
| Test 0 | Détection format (isLegacy, verify, needsMigration) | ✅ PASS (8 assertions) |
| TEST 1 | Nouveau patient — Bcrypt en DB | ✅ PASS |
| TEST 2 | Login nouveau patient | ✅ PASS |
| TEST 3 | Mauvais mot de passe → refus | ✅ PASS |
| TEST 4 | Changement mot de passe → Bcrypt | ✅ PASS (2 assertions) |
| TEST 5 | Ancien mot de passe refusé après changement | ✅ PASS |
| TEST 6 | Reset password → Bcrypt | ✅ PASS (2 assertions) |
| TEST 7 | Compte legacy Base64 → login réussi + migration | ✅ PASS (3 assertions) |
| TEST 8 | Reconnexion compte migré → Bcrypt | ✅ PASS (3 assertions) |
| TEST 9 | Demande médecin legacy — flux approbation sans double hash | ✅ PASS (4 assertions) |
| TEST 10 | Demande médecin Bcrypt — flux approbation sans double hash | ✅ PASS (4 assertions) |
| TEST 11 | Demande clinique Bcrypt — flux approbation sans double hash | ✅ PASS (3 assertions) |
| TEST 12 | Sécurité — aucun mot de passe en clair en DB | ✅ PASS (3 assertions) |

**Résultat global : 37/37 PASS — 0 FAIL**

Toutes les données de test ont été supprimées après les tests (nettoyage automatique).

---

## 9. RISQUES ET LIMITATIONS RESTANTES

| Item | Statut | Note |
|---|---|---|
| Comptes existants en Base64 | ⚠️ Migration progressive | Migrent automatiquement au prochain login |
| Anciens comptes qui ne se reconnectent jamais | ⚠️ Resteront en Base64 | Comportement attendu — aucune migration forcée |
| Delphi | ✅ Aucun impact | Delphi n'utilise pas `users.password` directement |
| Android/iOS | ✅ Aucun impact | Le login API retourne un token — les clients ne voient pas le hash |
| SyncController | ✅ Aucun impact | La sync ne passe pas par le login standard |
| Email d'approbation | ⚠️ Nouveaux comptes | Le mot de passe n'est plus lisible dans l'email (sécurité améliorée, mais l'admin ne peut plus le voir) |
| Modification de structure DB | ✅ Aucune nécessaire | varchar(255) ≥ 60 chars (Bcrypt) |
| Production | ✅ NON MODIFIÉE | Aucun changement en production |
| Tests | ✅ Locaux uniquement | Base de données locale, données de test supprimées |

---

## 10. INFORMATIONS TECHNIQUES

- **PHP version** : 8.0.30 (PHP 8.x — PASSWORD_DEFAULT = bcrypt)
- **Longueur hash Bcrypt** : 60 caractères
- **Colonnes DB** : varchar(255) — suffisant
- **Algorithme** : Bcrypt (cost=10 par défaut)
- **Fonction de détection** : `password_get_info()` — native PHP, pas de mécanisme inventé
- **Fonctions utilisées** : `password_hash()`, `password_verify()`, `password_needs_rehash()`, `password_get_info()`

---

*Document créé par ANTIGRAVITY pour TABIBI — PHASE 02B*  
*Environnement local — Aucune modification de production*
