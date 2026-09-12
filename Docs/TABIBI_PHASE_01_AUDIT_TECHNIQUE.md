# TABIBI — PHASE 01 — AUDIT TECHNIQUE COMPLET

> Document de référence technique.
>
> Statut : AUDIT TERMINÉ
>
> Cette phase était une phase d'analyse uniquement.
>
> Aucun code fonctionnel n'a été modifié pendant l'audit.

**Date de génération :** 12 septembre 2026

---

## A. STACK ACTUELLE

### 1. Frontend & Web
* **Framework :** React `18.2.0` (Single Page Application).
* **Build Tool & Dev Server :** Vite `5.1.4` (`@vitejs/plugin-react` `4.2.1`).
* **Langage :** JavaScript (ES Modules, JSX). Pas de TypeScript.
* **Gestion du Style :** CSS Vanilla, CSS Modules partiels, variables CSS et styles inline dynamiques.
* **Gestion de l'État :** Context API React (`AuthContext`) + hooks d'état locaux (`useState`, `useReducer`, `useEffect`) + persistance `localStorage`.
* **Routage / Navigation :** Système de routage manuel basé sur le hash d'URL (`/#/route`) via un hook personnalisé `useRoute()` dans `src/App.jsx`. Pas de bibliothèque `react-router-dom`.
* **Internationalisation :** `i18next` `26.0.6`, `react-i18next` `17.0.4`, `i18next-browser-languagedetector` `8.2.1` (Arabe RTL, Français LTR, Anglais).
* **Bibliothèques UI & Effets :** `framer-motion` `12.38.0`, `lucide-react` `1.8.0`, `canvas-confetti` `1.9.4`.
* **Traitement d'images :** `sharp` `0.34.5` (utilitaire dev / scripts).

### 2. Mobile (Hybride)
* **Framework Mobile :** **Capacitor 8**
  * `@capacitor/core` : `8.3.1`
  * `@capacitor/cli` : `8.3.1`
  * `@capacitor/android` : `8.3.1`
  * `@capacitor/app` : `8.1.0`
  * `@capacitor/assets` : `3.0.5`
  * `@capacitor/ios` : **Non installé / Absent**.
* **Environnement Système :**
  * **Node.js :** `v24.14.0`
  * **NPM :** `11.9.0`
  * **Java (JDK) :** OpenJDK `25.0.1 LTS` (Microsoft build)
  * **PHP CLI :** `8.0.30`

### 3. Backend & API
* **Technologie :** PHP Vanilla `8.0` (aucun framework externe type Laravel ou Symfony).
* **Architecture Backend :** Micro-MVC personnalisé avec Front-Controller.
* **Serveur Web :** Apache (avec réécriture `.htaccess`) / PHP Built-in Server en local.
* **Point d'entrée :** `backend/index.php` qui sert de routeur centralisant tous les endpoints `/api/*`.
* **Authentification API :** Bearer Token stocké en base (`VARCHAR(64)` dans la table `sessions`), durée de validité de 30 jours (`TOKEN_EXPIRY = 2592000`).
* **Format d'échange :** JSON unifié (`Response::success`, `Response::error`).
* **Envoi d'e-mails :** Direct SMTP / PHPMailer via `EmailHelper.php`.

### 4. Base de Données
* **SGBD :** MySQL / MariaDB (Hébergée sur serveur distant `197.140.142.6`, base `uyyuppcc_DBTabibi`).
* **Driver :** PDO avec requêtes préparées (`backend/core/Database.php`, Singleton).
* **Typage des identifiants :** UUID v4 (`CHAR(36)`) sur toutes les entités principales.

### 5. Intégration Externe (Desktop)
* **Application Delphi :** Synchronisation bidirectionnelle périodique via `/api/sync/upload` et `/api/sync/download` pour les cabinets médicaux fonctionnant hors ligne.

---

## B. ARCHITECTURE

```text
WebTabibi/
├── Docs/                       # Documentation technique détaillée
├── backend/                    # API REST PHP Vanilla
│   ├── config/database.php     # Configuration BDD & SMTP
│   ├── controllers/            # Contrôleurs métier (Auth, Doctor, Clinic, Appointment, etc.)
│   ├── core/                   # Classes noyau (Database.php, Response.php)
│   ├── helpers/                # Utilitaires (UUIDHelper, EmailHelper, etc.)
│   ├── middleware/             # Authentification et RBAC (AuthMiddleware.php)
│   ├── sql/                    # Scripts et migrations manuelles SQL
│   └── index.php               # Routeur HTTP principal
├── frontend/                   # Client React + Enveloppe Capacitor
│   ├── android/                # Projet natif Android Studio
│   ├── src/
│   │   ├── api/client.js       # Client HTTP fetch
│   │   ├── components/         # Composants partagés (SharedUI, Navbar, etc.)
│   │   ├── locales/            # Traductions JSON (ar.json, fr.json, en.json)
│   │   ├── pages/              # Écrans découpés (Home, Search, Book, Profile, etc.)
│   │   └── App.jsx             # ⚠️ Monolithe central (+7 100 lignes)
│   ├── capacitor.config.json   # Configuration Capacitor
│   ├── package.json            # Dépendances NPM
│   └── vite.config.js          # Configuration Vite & Proxy
└── .github/workflows/          # CI/CD FTP basique
```

### Points forts de l'architecture :
1. Découplage strict API / Client.
2. Identifiants UUID évitant tout conflit d'ID lors des synchronisations multi-sources (Web, Mobile, Desktop Delphi).
3. Requêtes SQL entièrement paramétrées via PDO (protection contre les injections SQL).

### Faiblesses architecturales majeures :
1. **Monolithe `App.jsx` :** Le fichier principal dépasse 7 100 lignes de code et regroupe le routage, des dizaines de modales, des sous-pages et des gestionnaires d'état. C'est le point de fragilité numéro 1 du frontend.
2. **Duplication de code :** Des composants entiers et des appels API sont définis à la fois dans `src/pages/` et réimplémentés directement dans `src/App.jsx`.

---

## C. ÉTAT ACTUEL ANDROID

* **Application ID / Package Name :** `com.tabibi.app`
* **Version Name :** `"1.0"` (défini dans `app/build.gradle`)
* **Version Code :** `1`
* **Compile SDK :** `36` (Android 16 preview / Android 15+)
* **Target SDK :** `36`
* **Min SDK :** `24` (Android 7.0 Nougat — couvre ~96% des appareils actifs)
* **Gradle Wrapper :** `8.14.3` (`gradle-8.14.3-all.zip`)
* **Android Gradle Plugin (AGP) :** `8.13.0`
* **Signature & Keystore :**
  * Fichier présent : `frontend/tabibi-release.jks`
  * Alias : `tabibi-key`
  * ⚠️ **Problème de sécurité critique :** Les mots de passe du Keystore (`tabibi2026`) sont codés en clair dans `frontend/android/app/build.gradle` et dans `Compile et signe APK .txt`.
* **Build Types :**
  * `debug` : standard.
  * `release` : signature configurée avec `tabibi-release.jks`, `minifyEnabled false` (pas de ProGuard/R8 actif pour obfusquer le code).
* **Permissions (`AndroidManifest.xml`) :**
  * Actuellement déclarée : `android.permission.INTERNET` uniquement.
  * *Manquantes pour une application médicale complète :* Accès caméra (documents/ordonnances), lecture stockage/médias, permission notifications (`POST_NOTIFICATIONS` sur Android 13+).
* **Firebase / Push Notifications :**
  * Dépendance Gradle présente (`com.google.gms:google-services:4.4.4`).
  * ⚠️ Le fichier `google-services.json` est **absent** dans `android/app/`. Par conséquent, le plugin Firebase est automatiquement désactivé par le bloc `try/catch` du `build.gradle`. Les notifications Push natives ne fonctionnent pas actuellement.
* **Deep Links :** Aucun filtre d'intention (`intent-filter`) configuré pour intercepter les liens web `https://tabibi.dz` ou un schéma personnalisé (`tabibi://`).
* **Stockage Local :** WebView Chromium (IndexedDB / LocalStorage).
* **Crash Reporting :** Aucun (ni Crashlytics, ni Sentry).

---

## D. ÉTAT ACTUEL IOS

* **Statut :** **INEXISTANT (0% configuré).**
* **Dossier `ios/` :** Absent du projet.
* **Dépendance `@capacitor/ios` :** Non installée dans `package.json`.
* **Bundle Identifier :** `com.tabibi.app` est prévu dans `capacitor.config.json`, mais aucun projet Xcode n'a été généré (`npx cap add ios` n'a jamais été exécuté).
* **Marketing Version / Build Number :** Non définis.
* **Deployment Target :** Non défini.
* **Configuration Xcode / CocoaPods :** Aucun fichier `.xcodeproj`, `.xcworkspace`, ni `Podfile`.
* **Certificats & Provisioning Apple :** Aucun profil, certificat de distribution ou Team ID configuré.
* **Permissions (`Info.plist`) :** Aucune (pas de `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`).
* **Push Notifications (APNs) :** Inexistantes.
* **Universal Links (`apple-app-site-association`) :** Non configuré.
* **TestFlight / App Store :** Aucun pipeline de soumission.

---

## E. BACKEND & API

* **Architecture :** MVC sans framework.
* **Routage HTTP :** Manuellement géré dans `backend/index.php` via vérification de `$uri` et `$method`.
* **Sécurité & RBAC :**
  * Filtrage via `AuthMiddleware.php`.
  * Rôles : `usertype` (`0`: Patient, `1`: Médecin, `2`: Clinique, `3`: Administrateur).
* **Endpoints Clés :**
  * `/api/auth/*` : Inscription, Connexion, Google Login, Réinitialisation de mot de passe, OTP.
  * `/api/patients/*` : Profil, modifications, rendez-vous, proches.
  * `/api/doctors/*` : Profil, créneaux, validation, motifs de consultation (`/reasons`), upload photo.
  * `/api/clinics/*` : Recherche multicritères, profil, association médecins-cliniques.
  * `/api/appointments/*` : Disponibilités dynamiques, prise de rendez-vous, annulation.
  * `/api/sync/*` : Synchronisation bidirectionnelle avec le logiciel de cabinet Delphi.
  * `/api/tickets/*` : Messagerie et support.
* **Uploads & Fichiers :** Les photos de profil et logos sont actuellement encodés en `LONGBLOB` / `BLOB` directement dans les lignes de la base de données (au lieu d'un stockage fichier / CDN).
* **CORS :** `header('Access-Control-Allow-Origin: *')` ouvert à tous les domaines dans `index.php`.

---

## F. BASE DE DONNÉES

* **Moteur :** MySQL / MariaDB (`InnoDB`, UTF8MB4).
* **Schéma :** Relatif et relationnel, ~18 tables interconnectées.
* **Gestion des Clés :**
  * `CHAR(36)` (UUID v4) sur les clés primaires et étrangères afin de garantir l'unicité distribuée lors de la synchronisation avec les cliniques locales.
* **Tables principales :**
  * `users` : Comptes et mots de passe.
  * `sessions` : Jetons d'authentification API actifs.
  * `patients`, `doctors`, `clinics` : Profils respectifs.
  * `apointements` : Moteur de rendez-vous (orthographe historique avec un seul 'p').
  * `clinicsdoctors` : Table de jointure N:N entre médecins et cliniques.
  * `doctorsreasons` & `reasons` : Motifs médicaux (716 motifs référencés par spécialités).
  * `doctorssettingapointements` : Horaires d'ouverture, durée des consultations et configuration des créneaux.
* **Migrations :** Aucun outil de migration automatique (type Phinx, Flyway ou Liquibase). Les migrations sont des scripts SQL exécutés manuellement dans `backend/sql/`.

---

## G. ÉTAT GIT

* **Branche courante :** `main`.
* **Branches existantes :** Uniquement `main` et `origin/main`.
* **Dépôt distant (Remote) :** `https://github.com/gozimsoft/WebTabibi.git`.
* **Dernier commit local :** `7ca15b71 Merge branch 'main' of https://github.com/gozimsoft/WebTabibi`.
* **Statut de synchronisation :** La branche locale est en avance de **3 commits non poussés** (`7ca15b71`, `dc35a9e3`, `aeba3869`).
* **Tags Git :** **0 tag** existant (aucune version `v1.0.0` n'a été balisée).
* **Working Tree :** Actuellement modifié avec 10 fichiers en attente de validation :
  * `backend/controllers/ClinicController.php`
  * `backend/controllers/DoctorController.php`
  * `backend/index.php`
  * `frontend/.env`
  * `frontend/src/App.jsx`
  * `frontend/src/api/client.js`
  * `frontend/src/components/SharedUI.jsx`
  * `frontend/src/locales/ar.json`
  * `frontend/src/locales/en.json`
  * `frontend/src/locales/fr.json`

---

## H. GESTION DES ENVIRONNEMENTS

* **Environnements existants :** **Aucune séparation stricte.**
  * Il n'existe pas d'environnement de *Staging* ni de base de données de test dédiée.
* **Backend :**
  * Le fichier `backend/config/database.php` contient en dur l'IP et les identifiants de la base de production (`197.140.142.6`).
  * ⚠️ **Risque immédiat :** Le développement local se connecte directement à la base de données distante de production. Toute manipulation locale altère les données réelles.
* **Frontend :**
  * Géré manuellement dans `frontend/.env` en commentant/décommentant `VITE_API_URL` (`http://localhost:8000` vs `https://tabibi.dz`).
* **Déploiement CI/CD :**
  * Fichier `.github/workflows/_deploy.yml` : se déclenche sur tout `push` sur `main` et transfère les fichiers bruts par FTP sur le serveur sans aucune phase préalable de build ni de tests.

---

## I. TESTS EXISTANTS

| Catégorie de test | Outil | Statut | Commentaire |
| :--- | :--- | :--- | :--- |
| **Tests Unitaires (Frontend)** | Vitest / Jest | ❌ Aucun | Aucune dépendance de test dans `package.json`. |
| **Tests Unitaires (Backend)** | PHPUnit | ❌ Aucun | Pas de `phpunit.xml` ni de suite de tests. |
| **Tests d'Intégration** | Scripts manuels | ⚠️ Partiel | Scripts isolés dans `scratch/` sans exécution automatique. |
| **Tests Composants / Widgets** | Testing Library | ❌ Aucun | Aucun test de rendu UI. |
| **Tests End-to-End (E2E)** | Cypress / Playwright | ❌ Aucun | Aucun test de parcours complet (réservation, connexion). |
| **Linter & Analyse Statique** | ESLint / PHPStan | ❌ Aucun | Pas d'analyse syntaxique ou de respect des types en CI. |
| **Vérification de Build en CI** | GitHub Actions | ❌ Aucun | Le workflow FTP pousse les fichiers sans vérifier que `npm run build` réussit. |

---

## J. ANALYSE DES RISQUES DE RÉGRESSION

### CRITIQUE (Bloquant pour la production)
1. **Monolithe `App.jsx` (+7 100 lignes) :** Toute modification sur une page risque de casser les variables globales, le routage ou l'initialisation de l'application entière.
2. **Absence de tests automatisés :** Impossible de détecter une régression avant la mise en production sans test manuel exhaustif de chaque rôle (Patient, Médecin, Clinique).
3. **Base de données unique partagée :** Développer ou tester localement avec l'accès direct à la base distante peut corrompre les données patients réelles.

### ÉLEVÉ (Impact fonctionnel majeur)
1. **Couplage fort avec le logiciel Delphi :** Toute modification de nom de champ dans la table `apointements` ou les tables associées cassera la synchronisation des cliniques physiques.
2. **Secrets de production dans le dépôt Git :** Les clés de signature Android, mots de passe de BDD et mots de passe SMTP sont versionnés dans l'historique Git.
3. **Absence totale du projet iOS :** Lancer iOS nécessitera une phase d'initialisation native sur macOS, la gestion des certificats Apple et l'adaptation des composants web aux contraintes WebKit/iOS.

### MOYEN
1. **Stockage des photos en base (BLOBs) :** Risque de saturation mémoire du serveur PHP et ralentissement des requêtes API à mesure que le nombre de médecins augmente.
2. **Absence de Push Notifications natives :** L'absence de Firebase Cloud Messaging (Android) et APNs (iOS) limite l'expérience mobile aux seules notifications in-app.

### FAIBLE
1. **Routage Hash (`/#/`) :** Bien qu'idéal pour Capacitor car il évite les problèmes de 404 sur les fichiers locaux, il est sous-optimal pour le référencement naturel (SEO) sur le Web.

---

## K. PROBLÈMES CRITIQUES IDENTIFIÉS

1. **Secrets et Keystore dans Git :** Le fichier `frontend/tabibi-release.jks` et ses mots de passe sont exposés publiquement/dans le code source.
2. **Pas de plateforme iOS initialisée :** L'application ne peut pas être compilée sur iOS dans l'état actuel.
3. **Connexion directe à la base de production depuis le code local :** Manque d'isolation des environnements DEV / STAGING / PROD.
4. **Déploiement FTP automatique non sécurisé :** Pousser sur `main` déploie immédiatement en production sans aucune validation préalable du build.

---

## L. RECOMMANDATIONS STRATÉGIQUES

1. **Sécurisation des Accès & Environnements (Priorité 1) :**
   * Extraire les identifiants BDD et SMTP dans un fichier `.env` côté backend.
   * Mettre en place une base de données locale ou de staging séparée de la production.
   * Supprimer les mots de passe en clair du fichier `build.gradle` Android et utiliser les variables d'environnement.
2. **Mise en place de la plateforme iOS (Priorité 2) :**
   * Installer `@capacitor/ios`.
   * Initialiser le projet Xcode via `npx cap add ios`.
   * Configurer le Bundle Identifier `com.tabibi.app` et les autorisations requises dans `Info.plist`.
3. **Sécurisation du Pipeline Git & Déploiement :**
   * Adopter une stratégie à 2 branches : `main` (Production) et `develop` (Développement / Staging).
   * Mettre en place un workflow GitHub Actions qui exécute `npm run build` avant tout déploiement.
4. **Modularisation Progressive :**
   * Isoler les composants du fichier `App.jsx` dans leurs pages respectives de `src/pages/` pour réduire `App.jsx` à moins de 300 lignes.

---

## M. PLAN DE VERSIONING RECOMMANDÉ

Pour garantir la pérennité et la synchronisation parfaite entre le Web, le Play Store et l'App Store, nous recommandons la mise en place d'un **Semantic Versioning (SemVer)** strict :

### 1. Structure des Versions : `MAJOR.MINOR.PATCH`
* **MAJOR (ex: 2.0.0) :** Refonte d'architecture, refonte graphique complète ou modification cassante d'API (breaking change).
* **MINOR (ex: 1.1.0) :** Ajout d'une nouvelle fonctionnalité (ex: intégration iOS, nouveau système de paiement, module d'ordonnances) sans casser l'existant.
* **PATCH (ex: 1.0.1) :** Correction de bug, ajustement de style, optimisation sans ajout de fonctionnalité.

### 2. Matrice d'Alignement des Versions

| Composant | Format de Version | Exemple Initial | Exemple Évolution |
| :--- | :--- | :--- | :--- |
| **Git Tag** | `vX.Y.Z` | `v1.0.0` | `v1.1.0` |
| **Frontend (`package.json`)** | `"version": "X.Y.Z"` | `"1.0.0"` | `"1.1.0"` |
| **Android (`versionName`)** | `X.Y.Z` | `"1.0.0"` | `"1.1.0"` |
| **Android (`versionCode`)** | Entier incrémental (`X * 10000 + Y * 100 + Z`) | `10000` | `10100` |
| **iOS (`CFBundleShortVersionString`)** | `X.Y.Z` | `"1.0.0"` | `"1.1.0"` |
| **iOS (`CFBundleVersion`)** | Numéro de build incrémental (`1, 2, 3...`) | `"1"` | `"2"` |
| **API Backend (`X-API-Version`)** | Date ou numéro majeur | `v1` | `v1` |

### 3. Stratégie de Branches Git Recommandée
* `main` : Version stable en production uniquement. Tout commit sur `main` fait l'objet d'un Tag Git (`v1.0.0`).
* `develop` : Branche d'intégration où sont regroupées les fonctionnalités testées.
* `feature/<nom>` : Branche temporaire pour chaque nouvelle fonctionnalité.
* `hotfix/<nom>` : Branche urgente pour corriger un bug critique de production.

---

*Ce rapport d'audit est terminé et complet. Aucune modification n'a été apportée au code. J'attends vos instructions pour définir les priorités de la phase suivante.*