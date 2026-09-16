# TABIBI — Phase 02F : Sécurisation / Conformité Loi 18-07

**Date :** 2026-09-16  
**Branche :** develop  
**Statut :** CORRECTIONS APPLIQUÉES — En attente de validation avant commit/push

---

## Résumé

Cette phase corrige les problèmes de sécurité et de conformité identifiés lors de l'audit Phase 02F. Toutes les corrections sont **chirurgicales** : aucune modification d'architecture, aucun refactoring général, aucune donnée utilisateur supprimée.

---

## 1. Secrets Git — PASS ✅

### Problème
`backend/.env` et `frontend/.env` étaient suivis par Git et exposaient les credentials SMTP, DB et clés API dans l'historique.

### Correction
```bash
git rm --cached backend/.env frontend/.env
```

### Résultat
- `git ls-files backend/.env frontend/.env` → vide (plus suivis).
- Les fichiers restent sur le disque local, non commités.

---

## 2. Exposition OTP en clair (dev_code) — PASS ✅

### Problème
`VerificationController.php` retournait `dev_code` dans la réponse API, exposant le code OTP en clair car `APP_ENV` n'était jamais défini.

### Fichier modifié
`backend/controllers/VerificationController.php`

### Correction
Suppression des lignes :
```php
$devCode = (defined('APP_ENV') && APP_ENV === 'production') ? null : $code;
'dev_code' => $devCode,
```

### Résultat
La réponse `/api/verify/send` ne contient plus de code OTP exposé.

---

## 3. Données médicales dans les emails de rendez-vous — PASS ✅

### Problème
Le motif médical (`$reason`, `ReasonName`) était inclus dans :
- L'objet email de confirmation de rendez-vous
- Le template HTML de confirmation (`buildConfirmationTemplate`)
- La description du bouton Google Calendar

### Fichiers modifiés
- `backend/helpers/EmailHelper.php` — signature et template `buildConfirmationTemplate` réécrits sans `$reason`
- `backend/controllers/AppointmentController.php` — appel `sendAppointmentConfirmation` mis à jour (suppression du paramètre `$reasonName`)
- `frontend/src/components/GoogleCalendarButton.jsx` — `ReasonName` retiré de la description de l'événement Google Calendar

### Résultat
Aucune donnée médicale (motif, diagnostic) n'est transmise via SMTP ou vers des services tiers.

---

## 4. Mot de passe en clair dans les emails d'approbation — PASS ✅

### Problème
Pour les comptes "legacy" (password encodé en Base64), `AdminController.php` décodait et transmettait le mot de passe en clair par email lors de l'approbation d'une clinique ou d'un médecin.

### Fichier modifié
`backend/controllers/AdminController.php`

### Correction
Suppression du décodage Base64 et passage systématique de `null` à `sendApprovalCredentials`. Le template affiche alors le message générique : "utilisez le mot de passe que vous avez saisi lors de votre inscription".

### Résultat
Aucun mot de passe n'est jamais envoyé par email, pour aucun type de compte.

---

## 5. Google OAuth — SSL + Consentement CGU — PASS ✅

### Problèmes
1. `CURLOPT_SSL_VERIFYPEER` était `false` dans la vérification du token Google
2. Aucune vérification du consentement CGU/Privacy lors d'une nouvelle inscription via Google OAuth

### Fichiers modifiés
- `backend/controllers/AuthController.php`
  - `CURLOPT_SSL_VERIFYPEER` → `true`, `CURLOPT_SSL_VERIFYHOST` → `2`
  - Ajout de la vérification `accepted_cgu` avant création du compte
- `frontend/src/App.jsx`
  - `googleLogin()` étendu pour accepter et transmettre `options = {}`
  - `RegisterPage` : vérification de `consentValid` avant d'appeler `onGoogleLogin`, passage de `{ accepted_cgu: true }`

### Résultat
- SSL activé pour les appels cURL Google
- Nouveau compte Google = CGU acceptées obligatoires (erreur 422 sinon)

---

## 6. Suppression de l'appel ipapi.co — PASS ✅

### Problème
L'application appelait `https://ipapi.co/json/` au premier chargement pour obtenir le pays/wilaya de l'utilisateur et les envoyer au backend. Ce service tiers collectait l'adresse IP des utilisateurs sans contrat ni mention dans la politique de confidentialité.

### Fichier modifié
`frontend/src/App.jsx`

### Correction
Suppression de l'appel `fetch('https://ipapi.co/json/')`. Le log de visite continue d'être envoyé au backend Tabibi, mais sans données de géolocalisation IP.

### Résultat
Aucune IP utilisateur transmise à des services tiers.

---

## 7. Suppression des Google Fonts distants — PASS ✅

### Problème
`frontend/index.html` chargeait la police Cairo depuis `fonts.googleapis.com`, créant un transfert de données (IP de l'utilisateur) vers des serveurs Google aux États-Unis sans contrat adéquat.

Les templates email (`EmailHelper.php`) importaient également Google Fonts via `@import url(...)`.

### Fichiers modifiés
- `frontend/index.html` — suppression des `<link rel="preconnect">` et `<link href="...fonts.googleapis.com">`, remplacement par un stack de polices système
- `backend/helpers/EmailHelper.php` — suppression des `@import url('https://fonts.googleapis.com/...')` dans tous les templates

### Polices système utilisées
```css
font-family: 'Segoe UI', 'Geeza Pro', 'Arial Unicode MS', Tahoma, Arial, sans-serif;
```

### Résultat
Aucune requête vers `fonts.googleapis.com` ou `fonts.gstatic.com`.

---

## 8. Suppression des images Flaticon distantes dans les emails — PASS ✅

### Problème
Les templates email (`EmailHelper.php`) utilisaient des images hébergées sur `cdn-icons-png.flaticon.com`, créant des requêtes vers des CDN tiers lors de l'ouverture des emails.

### Fichier modifié
`backend/helpers/EmailHelper.php`

### Correction
Toutes les balises `<img src="https://cdn-icons-png.flaticon.com/...">` ont été remplacées par des emojis Unicode ou du texte.

### Résultat
Aucun appel vers des CDN tiers lors de la lecture des emails.

---

## 9. Blocage effectif du tracking analytics — PASS ✅

### Problème
La classe `Analytics` dans `frontend/src/utils/analytics.js` avait `this.enabled = true` défini au constructeur (statique), donc une modification de `localStorage` en cours de session n'était pas reflétée.

### Fichier modifié
`frontend/src/utils/analytics.js`

### Correction
- `enabled` transformé en propriété `get` (lecture dynamique du localStorage à chaque accès)
- Ajout des méthodes `enable()` et `disable()` explicites
- Suppression de la vérification redondante dans `track()`

### Résultat
Le refus de l'utilisateur dans le modal Cookies est immédiatement respecté, même en cours de session.

---

## Tests effectués

| Test | Résultat |
|------|----------|
| `git ls-files backend/.env frontend/.env` | PASS — vide |
| `php -l backend/helpers/EmailHelper.php` | PASS — aucune erreur syntaxe |
| `php -l backend/controllers/VerificationController.php` | PASS |
| `php -l backend/controllers/AppointmentController.php` | PASS |
| `php -l backend/controllers/AdminController.php` | PASS |
| `php -l backend/controllers/AuthController.php` | PASS |
| Recherche `flaticon` dans EmailHelper | PASS — aucun résultat |
| Recherche `googleapis.com/css` dans EmailHelper | PASS — aucun résultat |
| Recherche `reason` dans EmailHelper | PASS — aucun résultat |
| Recherche `ipapi.co` dans frontend | PASS — aucun résultat |
| Recherche `fonts.googleapis.com` dans index.html | PASS — aucun résultat |

---

## Problèmes OUVERTS (hors scope phase 02F ou nécessitant action externe)

| Problème | Statut |
|----------|--------|
| Rotation des mots de passe SMTP/DB | Hors scope (décision opérationnelle) |
| Migration de `tabibi_family` vers le backend | Hors scope (refactoring complexe) |
| Réécriture de l'historique Git pour supprimer l'historique `.env` | Hors scope (risque de perturbation sur branches partagées) |
| Mention ipapi.co dans la politique de confidentialité | Obsolète — service supprimé |

---

## Fichiers modifiés

- `backend/.env` — retiré de l'index Git (non supprimé du disque)
- `frontend/.env` — retiré de l'index Git (non supprimé du disque)
- `backend/controllers/VerificationController.php`
- `backend/helpers/EmailHelper.php`
- `backend/controllers/AppointmentController.php`
- `backend/controllers/AdminController.php`
- `backend/controllers/AuthController.php`
- `frontend/index.html`
- `frontend/src/App.jsx`
- `frontend/src/utils/analytics.js`
- `frontend/src/components/GoogleCalendarButton.jsx`
- `Docs/TABIBI_PHASE_02F_SECURISATION.md` (ce fichier)
