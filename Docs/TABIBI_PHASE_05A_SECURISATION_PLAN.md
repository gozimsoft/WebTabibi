# TABIBI — PHASE 05A — PLAN DE SÉCURISATION DES SECRETS

> **Document de référence technique — Phase 05A**  
> **Statut :** ANALYSE ET PLANIFICATION COMPLÈTES (AUCUNE MODIFICATION DE CODE)  
> **Date :** 13 septembre 2026  
> **Auteur :** Antigravity AI Assistant  
> **Baseline Git :** Commit `5214ce5c` | Tag `v1.0.0` | Branche `develop`  
> **Règle absolue :** Aucune valeur secrète réelle n'est consignée dans ce rapport. Aucun secret n'a fait l'objet d'une rotation. Aucun historique Git n'a été réécrit.

---

## 1. RÉSUMÉ EXÉCUTIF

Le présent document dresse l'état des lieux exhaustif des secrets, identifiants et configurations sensibles présents dans le dépôt TABIBI.  
L'objectif de la **Phase 05A** est d'analyser et de concevoir une stratégie rigoureuse d'externalisation des secrets **sans altérer le fonctionnement applicatif actuel**, **sans modifier la clé de signature Android**, **sans introduire de dépendances tierces superflues**, et **sans toucher à l'historique Git**.

### Synthèse des constats majeurs :
1. **Base de données de production :** Les identifiants (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`) sont actuellement codés en clair dans `backend/config/database.php` et dans un script de diagnostic `scratch/analyze_db_specialties.py`.
2. **Messagerie SMTP :** Le mot de passe d'application Google (`MAIL_PASS`) et le compte SMTP (`MAIL_USER`) sont codés en clair dans `backend/config/database.php`.
3. **Signature Android :** Le keystore de production `frontend/tabibi-release.jks` est suivi par Git, et ses mots de passe (`storePassword`, `keyPassword`) sont codés en clair dans `frontend/android/app/build.gradle` ainsi que dans `Compile et signe APK .txt`.
4. **Configuration Frontend :** Le fichier `frontend/.env` contient l'URL de l'API et le Google Client ID. Bien qu'intégrés au bundle client (donc publics par nature), ces paramètres sont actuellement figés dans Git avec une valeur locale (`http://localhost:8000`).
5. **CI/CD :** Le workflow GitHub Actions `.github/workflows/_deploy.yml` utilise correctement les secrets GitHub (`FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`), mais déploie les fichiers versionnés sans mécanisme d'injection de secrets sur le serveur distant.
6. **.gitignore :** Aucun fichier `.env`, aucun fichier `.jks`, ni `keystore.properties` n'est actuellement exclu du versioning à la racine du projet.

---

## 2. SECRETS ET CONFIGURATIONS IDENTIFIÉS

| Catégorie | Identifiant / Clé | Rôle / Usage | Type de donnée |
| :--- | :--- | :--- | :--- |
| **BDD** | `DB_HOST` | Adresse IP / Hôte du serveur MySQL distant | Configuration sensible / Infrastructure |
| **BDD** | `DB_PORT` | Port d'écoute du service MySQL (3306) | Configuration réseau |
| **BDD** | `DB_NAME` | Nom de la base de données applicative | Configuration |
| **BDD** | `DB_USER` | Nom d'utilisateur MySQL | Donnée d'authentification |
| **BDD** | `DB_PASS` | Mot de passe de l'utilisateur MySQL | **Secret critique** |
| **SMTP** | `MAIL_HOST` | Serveur d'envoi SMTP (`smtp.gmail.com`) | Configuration |
| **SMTP** | `MAIL_PORT` | Port TLS (587) | Configuration |
| **SMTP** | `MAIL_USER` | Compte Gmail d'expédition | Identifiant d'infrastructure |
| **SMTP** | `MAIL_PASS` | Mot de passe d'application Google (16 car.) | **Secret critique** |
| **Android** | `tabibi-release.jks` | Clé privée RSA de signature de l'APK/AAB | **Secret critique / Actif binaire** |
| **Android** | `storePassword` | Mot de passe de protection du Keystore | **Secret critique** |
| **Android** | `keyAlias` | Alias de la clé de signature dans le Keystore | Configuration sensible |
| **Android** | `keyPassword` | Mot de passe de la clé de signature | **Secret critique** |
| **CI/CD** | `FTP_HOST` | Hôte du serveur FTP de déploiement | Secret GitHub Actions (protégé) |
| **CI/CD** | `FTP_USERNAME` | Identifiant du compte FTP | Secret GitHub Actions (protégé) |
| **CI/CD** | `FTP_PASSWORD` | Mot de passe du compte FTP | Secret GitHub Actions (protégé) |
| **Frontend** | `VITE_API_URL` | URL de l'API Backend | Configuration publique d'environnement |
| **Frontend** | `VITE_GOOGLE_CLIENT_ID` | Identifiant client OAuth 2.0 Web Google | Configuration publique client |

---

## 3. LOCALISATION DÉTAILLÉE DES SECRETS

### 3.1. `backend/config/database.php`
- **État :** Versionné dans Git (`tracked`).
- **Secrets présents :**
  - `DB_HOST` = `[DB_HOST_IP]`
  - `DB_USER` = `[DB_USER]`
  - `DB_PASS` = `[DB_PASSWORD]`
  - `MAIL_USER` = `[SMTP_USER]`
  - `MAIL_PASS` = `[SMTP_PASSWORD]`
- **Mode d'utilisation :** Hardcodé via la fonction PHP `define()`.
- **Environnement :** Utilisé indistinctement en DEV et en PROD (le serveur local se connecte à la base distante).

### 3.2. `backend/core/Database.php`
- **État :** Versionné dans Git (`tracked`).
- **Mode d'utilisation :** Consomme les constantes définies dans `config/database.php` pour instancier la connexion PDO. Ne stocke pas directement les secrets.

### 3.3. `backend/helpers/EmailHelper.php`
- **État :** Versionné dans Git (`tracked`).
- **Mode d'utilisation :** Consomme les constantes `MAIL_*` pour ouvrir la socket SMTP native vers Google. Ne stocke pas directement les secrets.

### 3.4. `frontend/android/app/build.gradle` (lignes 20-27)
- **État :** Versionné dans Git (`tracked`).
- **Secrets présents :**
  - `storePassword` = `"[KEYSTORE_PASSWORD]"`
  - `keyAlias` = `"[KEY_ALIAS]"`
  - `keyPassword` = `"[KEY_PASSWORD]"`
- **Mode d'utilisation :** Hardcodé dans le bloc `signingConfigs.release`.

### 3.5. `frontend/tabibi-release.jks`
- **État :** Versionné dans Git (`tracked`, 2 739 octets).
- **Contenu :** Clé privée de signature release Android.

### 3.6. `Compile et signe APK .txt`
- **État :** Versionné dans Git (`tracked`).
- **Contenu :** Documentation mémo reprenant `tabibi-release.jks`, `[KEYSTORE_PASSWORD]`, `[KEY_ALIAS]`, `[KEY_PASSWORD]`.

### 3.7. `scratch/analyze_db_specialties.py` (lignes 6-10)
- **État :** Versionné dans Git (`tracked`).
- **Secrets présents :**
  - `host` = `[DB_HOST_IP]`
  - `user` = `[DB_USER]`
  - `password` = `[DB_PASSWORD]`

### 3.8. `frontend/.env`
- **État :** Versionné dans Git (`tracked`).
- **Contenu :** `VITE_GOOGLE_CLIENT_ID` et `VITE_API_URL=http://localhost:8000`.

---

## 4. MATRICE D'ÉVALUATION DES RISQUES

| Élément | Niveau de Risque | Impact potentiel | Vecteur de compromission |
| :--- | :---: | :--- | :--- |
| **`DB_PASS` & `DB_USER`** | **CRITIQUE** | Accès complet en lecture/écriture/suppression à la base de données médicale (patients, consultations, dossiers médicaux). Violation directe de la loi 18-07 sur la protection des données. | Dépôt public/partagé, fuite de repository, logs d'erreur, accès non restreint par IP côté BDD. |
| **`MAIL_PASS` (Google)** | **ÉLEVÉ** | Usurpation de l'identité TABIBI pour envoi de spams, phishing médical, blocage ou résiliation du compte Google Workspace/Gmail de l'éditeur. | Lecture du code source versionné. |
| **`tabibi-release.jks` + Mots de passe** | **CRITIQUE** | Génération et signature d'APK malveillants sous l'identité officielle de TABIBI. Perte de contrôle sur les futures mises à jour Play Store. | Dépôt Git compromis, extraction de la clé binaire et des mots de passe en clair. |
| **`Compile et signe APK .txt`** | **ÉLEVÉ** | Divulgation directe des accès keystore en texte brut non masqué. | Consultation triviale de l'arborescence. |
| **`frontend/.env` versionné** | **MOYEN** | Écrasement accidentel de l'URL d'API de production lors des déploiements, désynchronisation des environnements. | Conflits de build entre dev local et bundle de release. |

---

## 5. PLAN D'EXTERNALISATION RECOMMANDÉ

### Principes directeurs :
1. **Zéro dépendance tierce supplémentaire :** Pas de package Composer (`vlucas/phpdotenv`) imposé si du PHP natif léger remplit la tâche de manière robuste et performante.
2. **Compatibilité ascendante :** Le code doit fonctionner de manière transparente en local (XAMPP Windows), en conteneur ou sur serveur d'hébergement mutualisé/VPS (cPanel / Apache / Nginx).
3. **Fichiers `.example` documentés :** Chaque fichier secret externalisé doit être accompagné d'un modèle type vierge de valeurs réelles (`.env.example`, `keystore.properties.example`).

---

## 6. CONFIGURATION ANDROID SIGNING (ANALYSE & PRÉPARATION)

### 6.1. Contraintes intangibles
- Le keystore existant `frontend/tabibi-release.jks` est **indispensable** pour la continuité de l'application sur le Play Store / appareils installés.
- Il ne doit **PAS** être supprimé, régénéré ou altéré.
- La clé et son alias doivent rester rigoureusement identiques.

### 6.2. Architecture cible pour la Phase 05B
1. **Création d'un fichier de propriétés local non versionné :**  
   Emplacement : `frontend/android/keystore.properties`
   ```properties
   # frontend/android/keystore.properties (LOCAL - NON VERSIONNÉ)
   storeFile=../../tabibi-release.jks
   storePassword=[KEYSTORE_PASSWORD]
   keyAlias=[KEY_ALIAS]
   keyPassword=[KEY_PASSWORD]
   ```

2. **Création du modèle type versionné :**  
   Emplacement : `frontend/android/keystore.properties.example`
   ```properties
   # Modèle de configuration de signature Android TABIBI
   storeFile=../../tabibi-release.jks
   storePassword=VOTRE_MOT_DE_PASSE_KEYSTORE
   keyAlias=VOTRE_ALIAS_CLE
   keyPassword=VOTRE_MOT_DE_PASSE_CLE
   ```

3. **Adaptation de `frontend/android/app/build.gradle` :**  
   Charger dynamiquement le fichier `keystore.properties` s'il existe, avec fallback propre pour éviter de bloquer les builds de debug :
   ```groovy
   def keystorePropertiesFile = rootProject.file("keystore.properties")
   def keystoreProperties = new Properties()
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }

   android {
       ...
       signingConfigs {
           release {
               if (keystorePropertiesFile.exists()) {
                   storeFile file(keystoreProperties['storeFile'] ?: "../../tabibi-release.jks")
                   storePassword keystoreProperties['storePassword']
                   keyAlias keystoreProperties['keyAlias']
                   keyPassword keystoreProperties['keyPassword']
               }
           }
       }
       ...
   }
   ```

4. **Traitement de `Compile et signe APK .txt` :**  
   Ce fichier contient les secrets en clair. Il devra être retiré du suivi Git tout en conservant les instructions non sensibles dans la documentation sécurisée.

---

## 7. CONFIGURATION BACKEND (ANALYSE & PRÉPARATION)

### 7.1. Gestion du fichier `.env` Backend
Pour éviter d'ajouter des dépendances externes, le chargement des variables d'environnement peut être assuré par une fonction PHP native (15 lignes) intégrée directement au point d'entrée `config/database.php` ou via un helper `core/Env.php`.

#### Chargeur natif autonome proposé :
```php
function loadEnv(string $path): void {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) continue;
        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv("$name=$value");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}
```

### 7.2. Fichier cible : `backend/.env` (Local - Non versionné)
```env
# ============================================================
# TABIBI BACKEND ENVIRONMENT CONFIGURATION (LOCAL)
# ============================================================
DB_HOST=[DB_HOST]
DB_PORT=3306
DB_NAME=[DB_NAME]
DB_USER=[DB_USER]
DB_PASS=[DB_PASSWORD]
DB_CHARSET=utf8mb4

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=[SMTP_USER]
MAIL_PASS=[SMTP_PASSWORD]
MAIL_NAME="Tabibi - طبيبي"

APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:80
TOKEN_EXPIRY=2592000
```

### 7.3. Fichier cible : `backend/.env.example` (Versionné)
Contiendra les mêmes clés documentées avec des valeurs d'exemple ou vides (`DB_HOST=127.0.0.1`, `DB_PASS=`, etc.).

### 7.4. Refactorisation de `backend/config/database.php`
Le fichier continuera d'exposer les constantes globales (`DB_HOST`, `DB_USER`, `DB_PASS`, `MAIL_PASS`...) pour ne casser aucun appel existant (`Database.php`, `EmailHelper.php`), mais ces constantes liront les variables d'environnement avec fallback :
```php
loadEnv(__DIR__ . '/../.env');

define('DB_HOST',      getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT',      getenv('DB_PORT') ?: '3306');
define('DB_NAME',      getenv('DB_NAME') ?: 'tabibi');
define('DB_USER',      getenv('DB_USER') ?: 'root');
define('DB_PASS',      getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_CHARSET',   getenv('DB_CHARSET') ?: 'utf8mb4');

define('MAIL_HOST',    getenv('MAIL_HOST') ?: 'smtp.gmail.com');
define('MAIL_PORT',    (int)(getenv('MAIL_PORT') ?: 587));
define('MAIL_USER',    getenv('MAIL_USER') ?: '');
define('MAIL_PASS',    getenv('MAIL_PASS') ?: '');
define('MAIL_NAME',    getenv('MAIL_NAME') ?: 'Tabibi - طبيبي');

define('APP_URL',      getenv('APP_URL') ?: 'http://localhost:8000');
define('FRONTEND_URL', getenv('FRONTEND_URL') ?: 'http://localhost:80');
define('TOKEN_EXPIRY', (int)(getenv('TOKEN_EXPIRY') ?: 2592000));
```

---

## 8. CONFIGURATION FRONTEND (ANALYSE & PRÉPARATION)

### 8.1. Délimitation des secrets vs configuration publique
> [!IMPORTANT]
> **Rappel architectural Vite :** Toutes les variables préfixées par `VITE_` sont injectées textuellement dans le code JavaScript généré côté client lors de `npm run build`. Par conséquent, **aucun secret de sécurité (clé API privée, mot de passe BDD, clé de chiffrement serveur) ne doit figurer dans le frontend.**

- **`VITE_API_URL` :** Configuration publique d'adressage réseau.
  - En DEV : `http://localhost:8000` (ou proxy `/api`).
  - En PROD : `https://tabibi.dz`.
- **`VITE_GOOGLE_CLIENT_ID` :** Identifiant client OAuth 2.0 public.
  - Cet identifiant identifie l'application auprès de Google Identity Services.
  - La sécurité repose sur la liste blanche des origines autorisées dans la console Google Cloud (`https://tabibi.dz`, `http://localhost`), et non sur le secret de la clé.

### 8.2. Recommandation pour `frontend/.env`
- Créer un modèle type versionné : `frontend/.env.example`
- Sortir `frontend/.env` du suivi Git pour que chaque environnement (machine locale de dev, environnement de staging, build de release mobile) puisse définir son propre `VITE_API_URL` sans provoquer de modifications Git intempestives.

---

## 9. LISTE DES AJOUTS `.GITIGNORE` À PRÉVOIR

La configuration `.gitignore` actuelle est insuffisante sur le plan de la sécurité. Voici la proposition exacte des règles à intégrer lors de la Phase 05B :

```gitignore
# ============================================================
# SÉCURITÉ & SECRETS (Phase 05B)
# ============================================================

# Environnements et clés d'API locales
.env
.env.local
.env.*.local
backend/.env
frontend/.env
frontend/.env.local

# Clés et certificats de signature Android
*.jks
*.keystore
frontend/tabibi-release.jks
frontend/android/keystore.properties
frontend/android/app/keystore.properties

# Fichiers mémos temporaires avec mots de passe
Compile et signe APK .txt

# Fichiers de configuration sensibles générés
google-services.json
GoogleService-Info.plist
```

### Justification ligne par ligne :
- `backend/.env` & `frontend/.env` : Empêche la propagation accidentelle de secrets ou de configurations d'hôtes locaux sur le dépôt distant.
- `*.jks` & `*.keystore` : Empêche l'exposition des clés privées de signature d'application mobile.
- `keystore.properties` : Protège les mots de passe de déverrouillage de la clé Android.
- `Compile et signe APK .txt` : Supprime l'exposition des identifiants en texte brut.
- `google-services.json` / `GoogleService-Info.plist` : Prévient les fuites de métadonnées Firebase/Google Cloud en amont des phases mobiles.

---

## 10. HISTORIQUE GIT : RISQUES ET TRAITEMENT FUTUR

### 10.1. État des lieux de l'historique
Bien que le présent plan prépare l'externalisation future des fichiers actifs, les commits historiques existants (antérieurs à `v1.0.0` / `5214ce5c`) contiennent encore les valeurs historiques de `DB_PASS`, `MAIL_PASS`, et le keystore Android.

### 10.2. Règle absolue de la Phase 05A
- **AUCUNE opération de réécriture d'historique n'a été effectuée.**
- Aucun recours à `git filter-repo`, `BFG Repo-Cleaner`, ou `git filter-branch`.
- Aucun `git push --force`.

### 10.3. Stratégie séquentielle recommandée pour l'avenir :
1. **Phase 05B (Présente étape suivante) :** Externaliser les fichiers actifs (`.env`, `keystore.properties`), adapter le code sans rien casser, et mettre à jour `.gitignore`.
2. **Phase 05C (Rotation contrôlée) :** 
   - Changer le mot de passe BDD distant sur le serveur MySQL (`197.140.142.6`).
   - Révoquer et renouveler le mot de passe d'application Google Gmail.
   - Dès cet instant, les valeurs présentes dans l'historique passé deviennent **inertes et caduques**, annulant le risque d'accès non autorisé sans nécessiter de force-push destructif immédiat.
3. **Phase ultérieure (Purge optionnelle de l'historique) :**
   - Ne planifier une purge de l'historique distant que sur décision explicite, avec backup préalable complet du dépôt, coordination de tous les contributeurs, et réinitialisation propre des clones.

---

## 11. ORDRE RECOMMANDÉ DES PROCHAINES OPÉRATIONS (PHASE 05B)

1. **Étape 1 :** Créer les fichiers modèles :
   - `backend/.env.example`
   - `frontend/.env.example`
   - `frontend/android/keystore.properties.example`
2. **Étape 2 :** Créer les fichiers locaux opérationnels (non versionnés) avec les valeurs de travail actuelles :
   - `backend/.env` (reprend les valeurs fonctionnelles actuelles)
   - `frontend/android/keystore.properties` (reprend `tabibi2026`)
3. **Étape 3 :** Adapter `backend/config/database.php` avec le chargeur d'environnement natif sécurisé et les fallbacks.
4. **Étape 4 :** Adapter `frontend/android/app/build.gradle` pour lire `keystore.properties`.
5. **Étape 5 :** Désindexer des commits Git (sans supprimer les fichiers locaux du disque) :
   - `git rm --cached frontend/tabibi-release.jks`
   - `git rm --cached "Compile et signe APK .txt"`
   - `git rm --cached frontend/.env`
6. **Étape 6 :** Mettre à jour `.gitignore`.
7. **Étape 7 :** Vérifier que le backend répond (`php -S localhost:8000`), que le frontend compile (`npm run build`), et que le build Android reste valide.
8. **Étape 8 :** Validation humaine avant commit sur `develop`.

---

## 12. ÉLÉMENTS NÉCESSITANT UNE VALIDATION HUMAINE

Avant d'entamer la Phase 05B, les décisions suivantes sont soumises à la validation explicite du responsable de projet :

1. **Validation du chargeur natif PHP :** Confirmation de l'approche PHP native autonome (sans package Composer supplémentaire).
2. **Conservation du Keystore Android local :** Confirmation que le fichier `frontend/tabibi-release.jks` restera stocké localement sur le poste de travail et archivé dans un coffre de secrets sécurisé, tout en étant retiré de l'index Git.
3. **Planning de rotation des accès BDD et SMTP :** Accord sur le principe que la rotation effective des mots de passe (changement du mot de passe MySQL et Gmail) sera exécutée après la mise en place de l'externalisation, afin de ne pas interrompre les tests actifs actuels.
