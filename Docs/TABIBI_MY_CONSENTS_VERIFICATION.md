# RAPPORT DE VÉRIFICATION — SECTION « MES CONSENTEMENTS » & DROITS SUR LES DONNÉES
**Plateforme TABIBI — Loi 18-07 relative à la protection des données à caractère personnel**
**Date de vérification :** 22 Septembre 2026  
**Statut global :** VALIDÉ (PASS ✅)

---

## 1. OBJECTIF ET PÉRIMÈTRE

Faire en sorte que le clic sur le menu **« Mes consentements »** (`menu_my_consents`) ouvre directement une section fonctionnelle, visible et localisée (`/#/profile?tab=security`) permettant à l'utilisateur connecté de consulter et gérer ses consentements effectifs ainsi que ses droits garantis par la loi 18-07 (Art. 33 à 36).

### Règles de non-régression et contraintes strictes respectées :
- Aucune donnée fictive créée.
- Aucune donnée d'un autre utilisateur n'est retournée ou visible (isolation stricte par compte).
- Aucun secret, mot de passe, token, ou empreinte technique interne (`ip_hash`, `user_agent_hash`) n'est exposé.
- Aucun DPO fictif mentionné : seul le canal officiel de contact `contact@tabibi.dz` est affiché.
- Aucune régression sur le chiffrement ou la confidentialité des conversations Patient ↔ Médecin.
- Aucun impact sur le système de tickets.
- Aucune modification de structure de base de données non requise : réutilisation exclusive des tables et colonnes existantes (`consent_logs`, `patients`, `settingpreferences`, `users`).
- Support trilingue complet (FR, EN, AR + RTL).
- Aucun commit, aucun push Git.

---

## 2. FICHIERS MODIFIÉS

### Backend :
1. **`backend/helpers/ConsentHelper.php`** :
   - Mise à jour de `getCurrent()` pour inclure le champ `doc_version` (`version`) pour chaque consentement actif.
   - Constante `DOC_VERSION = 'v1.0-2026'` propagée.
2. **`backend/controllers/ConsentController.php`** :
   - Méthode `getMy()` : complétée pour injecter l'historique tracé sans données sensibles (exclusion stricte de `ip_hash` et `user_agent_hash`), consolidation avec repli sur `patients.consent_cgu`, `consent_privacy`, `consent_version`, `consent_at`, et lecture de l'opposition promotionnelle dans `settingpreferences`.
   - Méthode `opposition()` : nouvel endpoint `POST /api/consent/opposition` permettant d'activer (`opposed = 1`) ou de désactiver (`opposed = 0`) l'opposition à la prospection commerciale (Art. 36 Loi 18-07), avec persistance dans `settingpreferences` et traçabilité légale dans `consent_logs` (`opposition_activated` / `opposition_deactivated`).
3. **`backend/index.php`** :
   - Ajout de la route `POST /consent/opposition` dirigée vers `ConsentController::opposition()`.

### Frontend :
4. **`frontend/src/locales/fr.json`** :
   - Ajout de l'ensemble des clés de traduction pour « Mes consentements », badges de statuts, oppositions commerciales, droits d'accès, portabilité, suppression, et contact officiel.
5. **`frontend/src/locales/en.json`** :
   - Ajout des traductions anglaises équivalentes.
6. **`frontend/src/locales/ar.json`** :
   - Ajout des traductions arabes conformes avec prise en charge RTL.
7. **`frontend/src/api/client.js`** :
   - Enrichissement de l'objet `api.consent` : `my()`, `withdraw()`, `opposition()`, `deleteAccount()`.
8. **`frontend/src/App.jsx`** :
   - Ajout de la méthode `opposition` dans l'API locale.
   - Importation des icônes Lucide nécessaires (`BellOff`).
   - Création du composant dédié `<ConsentsAndDataRightsSection />`.
   - Intégration prioritaire en haut de l'onglet `security` pour tous les profils (Patient, Médecin, Clinique, Admin).
   - Prise en charge automatique de l'URL directe `/#/profile?tab=security` avec sélection immédiate de l'onglet et chargement réactif des consentements via `fetchConsents()`.
   - Remplacement de l'ancien encart statique en arabe par une interface dynamique, complète et trilingue.

---

## 3. ENDPOINTS UTILISÉS & SCHÉMA DES DONNÉES

| Méthode | Endpoint | Rôle | Authentification |
|---|---|---|---|
| **GET** | `/api/consent/my` | Récupère l'état actuel des consentements de l'utilisateur connecté (`cgu`, `privacy`, `health_data`, `opposition_promo`) et l'historique sécurisé (`history`). | Bearer Token (Session active) |
| **POST** | `/api/consent/opposition` | Active ou désactive l'opposition commerciale (Art. 36) : `{ "opposed": true\|false }`. | Bearer Token (Session active) |
| **POST** | `/api/consent/withdraw` | Enregistre un signal de retrait de consentement (`cgu`, `privacy`, `health_data`). | Bearer Token (Session active) |
| **DELETE** | `/api/patients/account` | Demande d'effacement / anonymisation du compte (Art. 35 Loi 18-07). | Bearer Token (Session patient) |
| **GET** | `/api/patients/profile` | Récupération des données personnelles pour la portabilité (Art. 34). | Bearer Token (Session patient) |

---

## 4. DONNÉES RÉELLEMENT AFFICHÉES

### Section 1 : « Mes consentements enregistrés »
- **Conditions Générales d'Utilisation (CGU) :**
  - État : Badge « Accepté » (vert) / « Non enregistré » (gris) / « Retiré » (orange).
  - Version : Ex. `v1.0-2026`.
  - Date & heure réelles de consentement : Ex. `21 sept. 2026, 15:34`.
- **Politique de confidentialité :**
  - État : Badge « Accepté » / « Non enregistré » / « Retiré ».
  - Version : Ex. `v1.0-2026`.
  - Date & heure réelles : Ex. `21 sept. 2026, 15:34`.
- **Traitement des données de santé (Prise de rendez-vous) :**
  - État : Badge dynamique selon les consentements spécifiques enregistrés lors des rendez-vous.
  - Version et date associées.
- **Historique (`consent_logs`) :**
  - Accordéon dépliable affichant le tableau des événements réels du compte connecté : Date, Type de consentement, Valeur (Accepté / Retiré), Contexte (Inscription, Inscription Google, Rendez-vous, Activation opposition, etc.).
  - Empreintes techniques (`ip_hash`, `user_agent_hash`) **strictement exclues** de l'affichage et de l'API.

### Section 2 : « Opposition aux communications promotionnelles (Art. 36) »
- Statut temps réel : « Opposition active (Aucune communication commerciale) » ou « Opposition non activée ».
- Bouton d'action temps réel :
  - « Activer l'opposition » (enregistre `opposition_promo = 1` dans `settingpreferences` + log).
  - « Désactiver l'opposition » (enregistre `opposition_promo = 0` dans `settingpreferences` + log).

### Section 3 : « Mes droits sur mes données (Art. 33-36) »
- **Droit d'accès (Art. 33) :** Résumé des informations du compte (Nom, Email, Téléphone) avec bouton « Voir mon profil complet ».
- **Droit à la portabilité (Art. 34) :** Bouton « Télécharger mes données (JSON) » qui génère une extraction chiffrée/nettoyée au format JSON (`tabibi_export_user_<id>_<date>.json`), exempt de mot de passe, tokens et secrets.
- **Droit à l'effacement (Art. 35) :** Bouton « Demander la suppression de mon compte » avec boîte de dialogue explicite informant sur les modalités légales de conservation médicale anonymisée.

### Section 4 : « Contact officiel données personnelles »
- Coordonnée unique : **`contact@tabibi.dz`**
- Libellé : « Pour toute demande relative à vos données personnelles : contact@tabibi.dz »
- **Aucune mention de DPO fictif.**

---

## 5. RÉSULTATS DES TESTS OBLIGATOIRES

| # | Test Obligatoire | Méthode de vérification | Résultat |
|---|---|---|---|
| **1** | Clic « Mes consentements » | Clic via menu avatar ou mobile menu (`menu_my_consents`) | **PASS ✅** |
| **2** | Arrivée sur `#/profile?tab=security` | Navigation hash et parsing `qs = tab=security` | **PASS ✅** |
| **3** | Affichage réel de la section | Composant `<ConsentsAndDataRightsSection />` rendu visiblement au sommet | **PASS ✅** |
| **4** | Consentements du compte connecté | Données réelles CGU (`value: 1`, `v1.0-2026`, date), Privacy (`value: 1`, `v1.0-2026`, date) | **PASS ✅** |
| **5** | Opposition promotionnelle | Toggle testé via HTTP POST `/api/consent/opposition` (0 → 1 et 1 → 0) avec persistance vérifiée en base | **PASS ✅** |
| **6** | Téléchargement des données | Handler `handleDownloadPersonalData()` génère le fichier JSON assaini sans mot de passe ni token | **PASS ✅** |
| **7** | Demande de suppression / anonymisation | Handler `handleDeleteAccount()` avec confirmation Art. 35 et appel API sécurisé | **PASS ✅** |
| **8** | Contact `contact@tabibi.dz` | Présence vérifiée dans l'encart officiel, aucun DPO mentionné | **PASS ✅** |
| **9** | Test Français (FR) | Clés i18n FR vérifiées (`my_consents_title`, `data_rights_title`, etc.) | **PASS ✅** |
| **10** | Test Anglais (EN) | Clés i18n EN vérifiées | **PASS ✅** |
| **11** | Test Arabe (AR) + RTL | Clés i18n AR vérifiées avec disposition RTL automatique | **PASS ✅** |
| **12** | Accès direct `#/profile?tab=security` | Initialisation d'état `initialSecurity` sélectionne immédiatement l'onglet et lance `fetchConsents()` | **PASS ✅** |
| **13** | Isolation des données utilisateurs | Vérification SQL et test d'isolation : Zéro enregistrement croisé retourné | **PASS ✅** |
| **14** | `npm run build` | Compilation Vite réussie sans erreur (code de sortie 0) | **PASS ✅** |
| **15** | PHP syntax check | `php -l` exécuté avec succès sur tous les fichiers modifiés (0 erreur) | **PASS ✅** |

---

## 6. EXTRAIT DU TEST D'EXÉCUTION HTTP (PORT 81 / BACKEND PROXIÉ)

```json
=== 1. HTTP GET /api/consent/my ===
HTTP Code: 200
{
    "success": true,
    "message": "OK",
    "data": {
        "user_id": "47ba95a1-d1f9-4434-b126-6604d78b1840",
        "doc_version": "v1.0-2026",
        "consents": {
            "cgu": {
                "value": 1,
                "created_at": "2026-09-21 15:34:35",
                "version": "v1.0-2026"
            },
            "privacy": {
                "value": 1,
                "created_at": "2026-09-21 15:34:35",
                "version": "v1.0-2026"
            },
            "health_data": {
                "value": null,
                "created_at": null,
                "version": "v1.0-2026"
            },
            "opposition_promo": {
                "value": 0,
                "created_at": "2026-09-22 08:53:30",
                "version": "v1.0-2026"
            }
        },
        "history": [
            {
                "consent_type": "opposition_promo",
                "value": 1,
                "doc_version": "v1.0-2026",
                "context": "opposition_activated",
                "created_at": "2026-09-22 08:53:30"
            },
            {
                "consent_type": "opposition_promo",
                "value": 0,
                "doc_version": "v1.0-2026",
                "context": "opposition_deactivated",
                "created_at": "2026-09-22 08:53:30"
            }
        ]
    }
}

=== 2. HTTP POST /api/consent/opposition (opposed = true) ===
HTTP Code: 200
{
    "success": true,
    "message": "تم تفعيل المعارضة للاستخدام التجاري بنجاح (Art. 36 Loi 18-07).",
    "data": {
        "opposition_promo": 1,
        "updated_at": "2026-09-22 10:00:41"
    }
}

=== 3. HTTP GET /api/consent/my (Verify opposition_promo = 1) ===
HTTP Code: 200
opposition_promo value: 1 (PASS ✅)

=== 4. HTTP POST /api/consent/opposition (opposed = false) ===
HTTP Code: 200
{
    "success": true,
    "message": "تم إلغاء المعارضة للاستخدام التجاري بنجاح.",
    "data": {
        "opposition_promo": 0,
        "updated_at": "2026-09-22 10:00:44"
    }
}

=== 5. HTTP GET /api/consent/my (Verify opposition_promo = 0) ===
HTTP Code: 200
opposition_promo value: 0 (PASS ✅)

=== 6. History sanitization check ===
History count: 6
History leak check: PASS (No IP/UA hashes exposed) ✅
```

---

## 7. CONCLUSION & CORRECTIF DU PROFIL ADMINISTRATEUR

La correction ciblée « Mes consentements » est pleinement opérationnelle et conforme aux exigences strictes de la Loi 18-07 et du cahier des charges :
- Accès fluide et direct depuis le menu vers `/#/profile?tab=security`.
- Affichage clair et exhaustif des consentements réellement enregistrés, de leurs versions et dates.
- Gestion persistante et tracée de l'opposition promotionnelle.
- Disponibilité concrète des droits d'accès, de portabilité et de suppression.
- Support linguistique intégral FR / EN / AR avec inversion RTL.
- Zéro fuite technique, zéro fausse donnée, zéro DPO fictif.

### Note corrective — Rôle Administrateur :
Le bouton « Voir les détails de mon profil » (Droit d'accès Art. 33) redirigeait vers l'onglet `profile` qui n'était pas implémenté pour les administrateurs (qui ne disposaient initialement que des onglets `overview` et `security`), provoquant un affichage vide. Un onglet dédié **« Informations du profil »** (`profile`) a été ajouté à la barre d'onglets de l'administrateur, affichant en clair ses données personnelles (Rôle, Email, Nom d'utilisateur, Statut) ainsi que le formulaire de modification de ses identifiants.

---

## 8. RÉGULARISATION DES CONSENTEMENTS CGU & CONFIDENTIALITÉ (COMPTES ANTÉRIEURS)

### Constat :
Certains comptes utilisateurs créés avant le renforcement systématique de la Phase 02C (ou n'ayant pas enregistré leurs consentements initiaux) affichaient un statut « Non enregistré » pour les CGU et la Politique de Confidentialité, sans possibilité directe de régularisation depuis leur profil.

### Solution déployée :
1. **Nouvel Endpoint Backend** : `POST /api/consent/accept`
   - Prend en charge `{ "type": "cgu" }`, `{ "type": "privacy" }`, ou `{ "types": ["cgu", "privacy"] }`.
   - Met à jour la table `patients` (`consent_cgu = 1`, `consent_privacy = 1`, `consent_version = 'v1.0-2026'`, `consent_at = NOW()`).
   - Journalise chaque consentement dans `consent_logs` avec `context = 'profile_regularization'`.
2. **Interface Utilisateur Enrichie** :
   - Bannière de notification élégante signalant la possibilité de régulariser ses consentements en un clic (« Accepter les CGU et la Politique »).
   - Liens directs vers les textes juridiques complets (« Lire le document ») ouvrant les CGU (`#/terms`) et la Politique (`#/privacy`).
   - Boutons individuels « J'accepte » intégrés directement sur chaque carte non enregistrée.
   - Actualisation dynamique et immédiate sans rechargement de page (`fetchConsents()`) avec passage au badge vert « Accepté » horodaté.

---

## 9. CLAUSE DE RETRAIT DES CONSENTEMENTS & PROTECTION JURIDIQUE DE LA PLATEFORME

### Problématique juridique :
L'Article 6 de la Loi 18-07 garantit à tout utilisateur le droit de retirer son consentement à tout moment. Toutefois, pour les conditions contractuelles obligatoires (CGU et Politique de Confidentialité), un retrait sans clôture de compte placerait la plateforme dans une illégalité critique (détention de données sans base légale ni contrat actif).

### Solution de protection juridique déployée :
1. **Clause informative et opposable sous les cartes acceptées** :
   - Mention expresse : *« Conformément à l'Art. 6 de la Loi 18-07, le retrait de votre accord aux conditions contractuelles s'effectue via la suppression de votre compte (Art. 35). »*
   - Lien direct actionnant la procédure de suppression sécurisée pour les patients.
   - Lien vers le contact officiel `contact@tabibi.dz` pour les professionnels (médecins, cliniques).
2. **Consultation permanente des textes opposables** :
   - Présence continue du lien *« Lire le document »* sur les cartes acceptées pour consultation libre et permanente à tout moment.
3. **Traçabilité totale dans `consent_logs`** :
   - La clôture du compte enregistre immédiatement le retrait formel (`cgu = 0`, `privacy = 0`, `health_data = 0`) avec le contexte `'account_deletion'` prouvant à l'ANPDP le respect absolu de la volonté de l'utilisateur.

