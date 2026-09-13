# TABIBI — PHASE 05C-B — RAPPORT DE CONTRÔLE ET ÉTAT DE ROTATION

> **Document officiel de contrôle — Phase 05C-B**  
> **Statut :** ARRÊT RÉGLEMENTAIRE / POINT DE CONTRÔLE OBLIGATOIRE  
> **Date :** 13 septembre 2026  
> **Auteur :** Antigravity AI Assistant  
> **Branche active :** `develop` | **HEAD :** `6fdbcbfb` | **Baseline :** `5214ce5c` (`v1.0.0`)  
> **Règle absolue appliquée :** Aucun secret réel affiché ou consigné. Aucune modification destructive. Respect strict de la directive d'arrêt en cas de prérequis non commité.

---

## 1. CONTRÔLE PRÉALABLE OBLIGATOIRE (ÉTAPE 0)

Conformément aux directives de l'Étape 0 :

| Point de contrôle | Exigence | Constat technique | Statut |
| :--- | :--- | :--- | :---: |
| **Branche active** | `develop` | `develop` | ✅ CONFORME |
| **HEAD** | Aligné sur l'historique | `6fdbcbfb47a329e6b4a6388ac05601936bc3dfdb` | ✅ CONFORME |
| **Tag officiel** | `v1.0.0` présent | `v1.0.0` présent sur `5214ce5c` | ✅ CONFORME |
| **Keystore Android** | `frontend/tabibi-release.jks` intact | Présent physiquement sur disque (2 736 octets, non altéré) | ✅ CONFORME |
| **Modifications Phase 05B commitées et poussées** | Validées, commitées et poussées sur `origin/develop` | **Modifications Phase 05B présentes dans le working tree local, NON encore commitées ni poussées** (conformément à la règle de fin de Phase 05B qui interdisait le commit sans validation) | ⚠️ **BLOCAGE ÉTAPE 0** |

### Application de la règle d'arrêt de l'Étape 0 :
> *"Si les modifications 05B ne sont PAS commitées/poussées : STOP. Ne procéder à aucune rotation. Produire uniquement un rapport indiquant le blocage."*

L'assistant applique strictement cette clause de sauvegarde. Aucune rotation MySQL ni SMTP n'a été déclenchée.

---

## 2. ÉTAT DU WORKING TREE (PHASE 05B EN ATTENTE DE COMMIT)

```text
Changes to be committed:
  deleted:    Compile et signe APK .txt
  deleted:    frontend/.env
  deleted:    frontend/tabibi-release.jks

Changes not staged for commit:
  modified:   .gitignore
  modified:   Docs/TABIBI_PHASE_05A_SECURISATION_PLAN.md
  modified:   backend/config/database.php
  modified:   frontend/android/app/build.gradle
  modified:   scratch/analyze_db_specialties.py

Untracked files:
  Docs/TABIBI_PHASE_05B_EXTERNALISATION_SECRETS.md
  Docs/TABIBI_PHASE_05C_AUDIT_ROTATION.md
  backend/.env.example
  frontend/.env.example
  frontend/android/keystore.properties.example
```

Toutes les modifications techniques de la Phase 05B sont prêtes, validées fonctionnellement (tests BDD, API, builds web et Android release réussis), mais nécessitent votre accord explicite pour être commitées et poussées sur `origin/develop` avant d'attaquer la rotation.

---

## 3. AUDIT DU COUPLAGE AVEC LE LOGICIEL DELPHI (ÉTAPE 2)

L'analyse approfondie du code source et de la documentation ([`Docs/DATABASE.md`](file:///c:/xampp/htdocs/tabibi/Docs/DATABASE.md), [`backend/controllers/AppointmentController.php`](file:///c:/xampp/htdocs/tabibi/backend/controllers/AppointmentController.php#L691-L720)) établit formellement le mécanisme de communication du logiciel de cabinet médical Delphi :

1. **Protocole de communication :**  
   L'application Delphi ne se connecte **pas** directement au port 3306 de MySQL via un driver natif.  
   Elle utilise l'API HTTP REST :
   - `POST /api/apointements/sync` (synchronisation différentielle des rendez-vous)
   - `POST /api/clinics/profile` (mise à jour profil clinique)
   - Authentification via header HTTP standard : `Authorization: Bearer <token_médecin>`
2. **Impact de la rotation MySQL sur Delphi :**  
   Puisque Delphi transite exclusivement par l'API PHP :
   - **Tant que l'API PHP est mise à jour avec le nouveau mot de passe BDD, le logiciel Delphi fonctionnera de manière totalement transparente sans nécessiter de modification de sa configuration locale de connexion.**
   - Aucun driver ou mot de passe MySQL n'est stocké dans le binaire Delphi.

---

## 4. AUDIT DES PRÉREQUIS BACKUP (ÉTAPE 1)

- Aucun fichier dump SQL complet et vérifiable de la base distante `uyyuppcc_DBTabibi` n'est actuellement présent dans l'arborescence locale.
- **Préconisation :** Avant toute modification du mot de passe MySQL sur le serveur distant, un export complet (via phpMyAdmin ou `mysqldump`) doit être téléchargé et stocké en lieu sûr.

---

## 5. STATUT DES SERVICES ET SECRETS

| Service | Statut actuel | Action de rotation requise | Prérequis bloquants |
| :--- | :--- | :--- | :--- |
| **MySQL Production** | Identifiants d'origine actifs dans `backend/.env` local (non versionné) | Changement de mot de passe via l'interface hébergeur cPanel / phpMyAdmin | 1. Commit et push de la Phase 05B<br>2. Backup SQL complet de la BDD<br>3. Exécution du changement sur cPanel |
| **Google SMTP** | Mot de passe d'application actif dans `backend/.env` local | Génération d'un nouveau mot de passe d'application sur le compte `stellarsoftpro@gmail.com` puis révocation de l'ancien | 1. Commit et push de la Phase 05B<br>2. Connexion 2FA humaine sur Google Account |
| **Android Keystore** | Intact sur disque, désindexé de Git | **Aucune rotation** (maintien absolu de la clé existante) | Aucun (conforme) |

---

## 6. SCAN DE SÉCURITÉ DES FICHIERS ACTIFS

- **Fichiers suivis par Git :** Aucun mot de passe en clair (`[DB_PASSWORD]`, `[SMTP_PASSWORD]`, `[KEYSTORE_PASSWORD]`) n'est présent dans le code source de l'application.
- **Fichiers exclus (`.gitignore`) :**
  - `backend/.env` : NON TRACKÉ (protégé)
  - `frontend/.env` : NON TRACKÉ (protégé)
  - `frontend/android/keystore.properties` : NON TRACKÉ (protégé)
  - `frontend/tabibi-release.jks` : NON TRACKÉ (protégé)
  - `Compile et signe APK .txt` : NON TRACKÉ (protégé)

---

## 7. ACTIONS REQUISES POUR LE DÉBLOCAGE ET L'EXÉCUTION

Pour franchir le point d'arrêt de l'Étape 0 et réaliser la rotation :

1. **Autorisation de commit & push de la Phase 05B :**  
   Valider le commit des modifications de sécurisation (fichiers `.example`, mise à jour de `build.gradle`, `.gitignore`, désindexations) sur `develop`.
2. **Réalisation du Backup BDD :**  
   Confirmer l'existence d'une sauvegarde récente de `uyyuppcc_DBTabibi`.
3. **Transmission / Définition des nouveaux secrets :**  
   - Nouveau mot de passe MySQL défini sur le serveur.
   - Nouveau mot de passe d'application Google généré.

---

> **FIN DU RAPPORT DE PHASE 05C-B — ARRÊT DE SÉCURITÉ CONFORME AUX DIRECTIVES**
