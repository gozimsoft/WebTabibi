# TABIBI — RAPPORT D'AUDIT & ANALYSE PHASE 02D
# DONNÉES DE SANTÉ + CONSERVATION / SUPPRESSION

**Plateforme :** TABIBI (Web React Vite, API REST PHP, Desktop Delphi Sync, Base de données MariaDB/MySQL)  
**Cadre Juridique de Référence :** Loi algérienne n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel, modifiée par la Loi n° 25-11 du 24 juillet 2025.  
**Autorité de Référence :** Autorité Nationale de Protection des Données à caractère Personnel (ANPDP - Algérie).  
**Environnement de travail :** Local XAMPP exclusivement (aucune interaction ni modification sur la production).  
**Date :** 15 Septembre 2026.  
**Statut :** Phase 02D — Terminé, Validé et Documenté (Aucun commit / Aucun push Git).

---

## SOMMAIRE
1. [Périmètre inspecté](#1-périmètre-inspecté)
2. [Tables et champs concernés](#2-tables-et-champs-concernés)
3. [Données de santé identifiées](#3-données-de-santé-identifiées)
4. [Données personnelles non médicales](#4-données-personnelles-non-médicales)
5. [Analyse de minimisation des données](#5-analyse-de-minimisation-des-données)
6. [Analyse de la séparation compte / données médicales](#6-analyse-de-la-séparation-compte--données-médicales)
7. [Analyse du mécanisme de suppression / anonymisation](#7-analyse-du-mécanisme-de-suppression--anonymisation)
8. [Matrice de conservation des données](#8-matrice-de-conservation-des-données)
9. [Modifications de code réellement effectuées](#9-modifications-de-code-réellement-effectuées)
10. [Modifications volontairement NON effectuées](#10-modifications-volontairement-non-effectuées)
11. [Tests exécutés et résultats](#11-tests-exécutés-et-résultats)
12. [Risques restant à valider juridiquement](#12-risques-restant-à-valider-juridiquement)
13. [Recommandations futures](#13-recommandations-futures)

---

## 1. PÉRIMÈTRE INSPECTÉ

L'audit a couvert l'ensemble des couches de l'application TABIBI :
1. **Base de données relationnelle locale (`uyyuppcc_DBTabibi`)** :
   - Examen exhaustif de l'ensemble des 30 tables de la base de données.
   - Analyse structurelle détaillée des tables : `patients`, `users`, `apointements`, `patientsproches`, `reasons`, `doctorsreasons`, `doctorsratings`, `consent_logs`, `sessions`, `tickets`, `ticketmessages`, `notifications`, `site_visits`.
2. **Backend PHP (Contrôleurs, Modèles, Helpers, Middleware)** :
   - `backend/controllers/ConsentController.php` (gestion des consentements, retrait et suppression de compte `deleteAccount`).
   - `backend/controllers/AuthController.php` (authentification classique, Google OAuth, blocage des comptes supprimés).
   - `backend/controllers/AppointmentController.php` (gestion des rendez-vous, validation du consentement santé `consent_health`, synchronisation Delphi `sync()`).
   - `backend/controllers/SyncController.php` (gestion des flux de synchronisation upload/download).
   - `backend/controllers/PatientController.php` (gestion du profil, proches rattachés).
   - `backend/controllers/TicketController.php` & `RatingController.php` (messagerie/tickets et avis).
   - `backend/helpers/ConsentHelper.php` (traçabilité immuable des consentements dans `consent_logs`).
3. **Frontend React (Vite)** :
   - Composant d'export de données (`handleDownloadData()` dans `frontend/src/App.jsx`).
   - Formulaires d'inscription et de profil (`Register.jsx`, `Profile.jsx`, `QuickAppointmentModal.jsx`).
4. **Flux de synchronisation Delphi** :
   - Analyse des endpoints de synchronisation et des données échangées entre le logiciel médical desktop Delphi et l'API TABIBI.

---

## 2. TABLES ET CHAMPS CONCERNÉS

### A. Table `patients` (Données de profil du patient)
- `id` (char 36, UUID) : Identifiant technique unique du patient.
- `user_id` (char 36, UUID) : Liaison avec le compte d'authentification (`users.id`).
- `reference` (varchar 50) : Référence de dossier administratif / Delphi.
- `fullname` (varchar 200) : Nom et prénom du patient.
- `phone` (varchar 30) : Numéro de téléphone de contact.
- `email` (varchar 150) : Adresse email du patient.
- `birthdate` (date) : Date de naissance (utilisée pour l'âge clinique).
- `birthplace` (varchar 50) / `birthcountry` (varchar 50) : Lieu et pays de naissance.
- `address` (varchar 50) / `postcode` (int) / `baladiya_id` (char 36) / `country` (varchar 50) : Coordonnées géographiques.
- `gender` (varchar 10) : Sexe / Genre ('0' = Homme, '1' = Femme).
- `photoprofile` (blob) : Photographie du profil du patient.
- `nin` (varchar 50) : Numéro d'Identification Nationale (NIN).
- `bloodtype` (varchar 20) : Groupe sanguin (A+, B+, O+, AB-, etc.).
- `emergancyphone` (varchar 20) / `emergancyemail` (varchar 100) : Coordonnées de la personne de contact d'urgence.
- `emergancyphonedoctor` (varchar 20) / `emergancynote` (varchar 500) : Téléphone d'urgence et notes d'urgence du patient.
- `doctor_id` (char 36) : Référence au médecin traitant rattaché.
- `speakinglanguage` (varchar 50) : Préférence linguistique.
- `phonevalidation` (tinyint 1) / `emailvalidation` (tinyint 1) : Indicateurs techniques de validation OTP.
- `deleteacount` (tinyint 1) : Indicateur d'anonymisation et de suppression du compte.
- `consent_cgu` (tinyint 1) / `consent_privacy` (tinyint 1) / `consent_version` (varchar 20) / `consent_at` (datetime) : Horodatage et versions des consentements acceptés.

### B. Table `apointements` (Données relatives aux rendez-vous)
- `id` (char 36, UUID) : Identifiant technique du rendez-vous.
- `patient_id` (char 36, UUID) : Référence au patient demandeur (peut être NULL si saisie guichet).
- `clinicsdoctor_id` (char 36, UUID) : Référence au médecin et à la clinique concernés.
- `reason_id` (char 36, UUID) : Clé étrangère vers `reasons.id` (motif médical de la consultation).
- `apointementdate` (datetime) : Date et heure planifiées du rendez-vous.
- `patientname` (varchar 100) : Nom complet du patient transmis pour le praticien.
- `phone` (varchar 50) : Numéro de téléphone pour contacter le patient au sujet du rendez-vous.
- `note` (varchar 500) : Texte libre facultatif saisi par le patient décrivant ses symptômes ou précisions médicales.
- `status` (int 11) : Statut du rendez-vous (`0` = En attente/Confirmé, `1` = Annulé, `2` = Honoré/Terminé).
- `apointementcolor` (int 11) : Code couleur pour le planning d'agenda.
- `updatedat` (datetime) : Date et heure de dernière modification.
- `consent_health` (tinyint 1) : Témoin du consentement exprès au traitement des données de santé (Phase 02C).
- `consent_at` (datetime) : Horodatage du recueil du consentement santé pour ce rendez-vous.

### C. Table `users` (Comptes d'authentification)
- `id` (char 36, UUID) : Identifiant technique unique.
- `username` (varchar 255) : Identifiant de connexion.
- `password` (varchar 255) : Hash du mot de passe (Bcrypt / Argon2id).
- `usertype` (int 11) : Type de compte (`0` = Patient, `1` = Médecin, `2` = Clinique, `3` = Pharmacie/Admin).

### D. Table `consent_logs` (Registre de preuve des consentements - Art. 35 Loi 18-07)
- `id` (char 36, UUID) : Identifiant technique de l'enregistrement de log.
- `user_id` (char 36) / `patient_id` (char 36) : Références aux identifiants concernés.
- `consent_type` (varchar 50) : Type de consentement (`cgu`, `privacy`, `health_data`, `cookies_analytics`).
- `value` (tinyint 1) : Manifestation de volonté (`1` = Consenti, `0` = Retiré).
- `doc_version` (varchar 20) : Version des mentions légales/CGU/politique acceptée.
- `context` (varchar 100) : Contexte d'émission (`registration`, `profile_update`, `appointment`, `account_deletion`).
- `ip_hash` (varchar 64) / `user_agent_hash` (varchar 64) : Empreintes techniques pseudonymisées pour preuve légale.
- `created_at` (datetime) : Horodatage inaltérable de l'enregistrement.

### E. Tables connexes auditées
- `tickets` / `ticketmessages` : Messagerie de support et d'échange entre patient, médecin et clinique.
- `doctorsratings` : Évaluations et commentaires laissés par les patients.
- `sessions` : Jetons actifs de session authentifiée.
- `site_visits` : Enregistrement de fréquentation et adresses IP des visiteurs.

---

## 3. DONNÉES DE SANTÉ IDENTIFIÉES

En application des **Articles 8, 9 et 10 de la Loi n° 18-07**, sont qualifiées de données de santé (données sensibles à régime spécial) :

1. **Le motif de la consultation (`apointements.reason_id`)** :
   - Pointe vers la table `reasons` qui contient des libellés médicaux explicites (ex. "Suivi Diabète", "Consultation Cardiologique", "Bilan Oncologique").
   - Cette information révèle directement l'état de santé, la pathologie suspectée ou avérée, ou la prise en charge clinique du patient.
2. **Le champ texte libre de symptômes / remarques (`apointements.note`)** :
   - Permet au patient de renseigner des symptômes, des antécédents médicaux, ou des précisions cliniques lors de la réservation (`Book.jsx`, `QuickAppointmentModal.jsx`).
3. **Le groupe sanguin du patient (`patients.bloodtype`)** :
   - Donnée biologique et médicale directe enregistrée facultativement sur la fiche profil du patient.
4. **La note d'urgence médicale (`patients.emergancynote`)** :
   - Champ texte où le patient peut déclarer ses allergies, pathologies chroniques majeures ou contre-indications à destination des secours.
5. **Le croisement d'identité et de spécialité médicale** :
   - Le fait qu'un patient identifié prenne un rendez-vous avec un praticien d'une spécialité déterminée (ex. Psychiatrie, Cancérologie, Néphrologie) constitue une donnée de santé indirecte par déduction clinique.
6. **Le contenu des messages et questions médicales (`ticketmessages.message`)** :
   - Les échanges entre un patient et son médecin via les tickets peuvent comporter des descriptions de symptômes ou des suivis thérapeutiques.

> **Clarification technique majeure issue de l'audit de la base de données :**  
> Contrairement à ce qui avait été mentionné à titre d'hypothèse dans l'audit initial de la Phase 01, **aucune colonne de constantes vitales (`weight`, `height`, `imc`, `pas`, `pac`, `oxygen`, `heartbeats`) n'existe ni n'a jamais été créée dans la table MySQL `apointements` de la base de données TABIBI**.  
> Le contrôleur `AppointmentController::sync()` utilisé pour la synchronisation réelle avec Delphi **n'échange que des données administratives de planification de rendez-vous** (`id`, `apointementdate`, `patientname`, `phone`, `reason_id`, `note`, `status`, `apointementcolor`, `updatedat`). Aucune constante vitale clinique n'est stockée en base de données centrale.

---

## 4. DONNÉES PERSONNELLES NON MÉDICALES

Les données personnelles ordinaires identifiées dans l'application sont :
1. **Données d'identification directe** :
   - Nom et prénom (`patients.fullname`, `apointements.patientname`).
   - Nom d'utilisateur (`users.username`).
   - Photographie du profil (`patients.photoprofile`).
2. **Données officielles d'état civil et d'identification citoyenne** :
   - Numéro d'Identification Nationale (`patients.nin`, `doctors.nin`).
   - Date, lieu et pays de naissance (`birthdate`, `birthplace`, `birthcountry`).
   - Sexe / Genre (`patients.gender`).
3. **Coordonnées et localisation** :
   - Numéro de téléphone (`patients.phone`, `apointements.phone`).
   - Adresse email (`patients.email`, `users.email`).
   - Adresse géographique, commune (`baladiya_id`), code postal (`postcode`).
   - Coordonnées de proches en cas d'urgence (`emergancyphone`, `emergancyemail`).
4. **Données techniques et de sécurité** :
   - Mots de passe hachés (`users.password`).
   - Jetons de session (`sessions.token`).
   - Empreintes cryptographiques d'adresses IP et d'agents utilisateurs (`consent_logs.ip_hash`, `consent_logs.user_agent_hash`).
   - Adresses IP brutes des visiteurs (`site_visits.ip_address`).

---

## 5. ANALYSE DE MINIMISATION DES DONNÉES

Conformément à l'**Article 4-3 de la Loi 18-07** (*« Les données doivent être adéquates, pertinentes et non excessives au regard des finalités pour lesquelles elles sont collectées »*), l'audit relève les points suivants :

| Donnée suspecte / collectée | Où elle est collectée | Problématique identifiée | Utilisée réellement ? | Proposition argumentée |
|---|---|---|---|---|
| **NIN du Patient (`patients.nin`)** | `Register.jsx`, `Profile.jsx` | Le NIN est un identifiant régalien étatique sensible. Exiger ou inciter à renseigner le NIN pour une simple réservation de consultation médicale privée paraît excessif au regard du principe de minimisation. | Non requis pour la prise de RDV. Utilisé uniquement si renseigné. | **CONSERVATION OPTIONNELLE SANS OBLIGATION** (Laisser le champ strictement facultatif. Ne jamais le rendre obligatoire à l'inscription patient). |
| **NIN du Médecin (`doctors.nin`)** | `RegisterDoctorPage` | Nécessaire pour la vérification déontologique et anti-fraude de l'identité du praticien par l'administrateur avant activation de son compte. | Oui, dans la validation administrative du praticien. | **CONSERVATION JUSTIFIÉE** (Finalité légitime de contrôle de l'exercice professionnel). |
| **Groupe sanguin (`patients.bloodtype`)** | `Profile.jsx` | Donnée médicale sensible (Art. 8). Non indispensable à la prise de rendez-vous en ligne, mais utile si l'application propose une "fiche d'urgence patient". | Affiché uniquement sur le profil du patient. | **CONSERVATION STRICTEMENT FACULTATIVE** (Protégé par le consentement santé Phase 02C. Non demandé lors de la réservation). |
| **Notes d'urgence (`emergancynote`)** | `Profile.jsx` | Champ texte libre susceptible de contenir des données médicales non structurées. | Facultatif dans le profil. | **CONSERVATION OPTIONNELLE** (Utile pour le patient qui souhaite partager ses antécédents d'urgence avec sa clinique). |
| **Adresses IP brutes (`site_visits.ip_address`)** | `PublicController::logVisit()` | Collecte continue des IP de tous les visiteurs sans politique d'anonymisation de l'adresse IP. | Utilisé pour les compteurs statistiques internes. | **RECOMMANDATION D'ANONYMISATION FUTURE** (Masquage du dernier octet ou politique de purge automatique après 12 mois). |

---

## 6. ANALYSE DE LA SÉPARATION COMPTE / DONNÉES MÉDICALES

L'architecture actuelle de TABIBI repose sur une base relationnelle où le compte utilisateur (`users`) est relié au profil patient (`patients`), lequel est rattaché aux rendez-vous (`apointements`).

### Risques examinés :
1. **Risque de perte d'informations nécessaires aux rendez-vous du médecin** :
   - Si un compte patient était physiquement détruit par `DELETE FROM patients`, le médecin perdrait la trace des créneaux passés ou futurs dans son planning, rompant l'intégrité de son agenda médical et ses obligations déontologiques de tenue de registre de consultation.
   - **Garantie apportée** : La suppression est une **anonymisation chirurgicale** (`Soft Anonymization`) : les rendez-vous passés sont conservés dans l'agenda avec `patientname = '[Compte supprimé]'` et `phone = NULL`, maintenant le créneau, l'heure, le médecin et le motif médical (`reason_id`) sans révéler l'identité de l'ancien utilisateur.
2. **Risque de perte des preuves de consentement** :
   - Si la table `consent_logs` était purgée lors de la suppression du compte, TABIBI perdrait la capacité de prouver devant l'ANPDP ou en justice que le patient avait consenti aux CGU et au traitement de ses données de santé avant leur traitement.
   - **Garantie apportée** : La table `consent_logs` est **expressément conservée**. Un nouvel enregistrement de log avec `value = 0` et `context = 'account_deletion'` y est inséré lors de la suppression pour sceller formellement la preuve du retrait de consentement (Art. 35 Loi 18-07).
3. **Risque d'exposition de données personnelles après suppression** :
   - Toutes les colonnes identifiantes directes de la table `patients` (`fullname`, `email`, `phone`, `address`, `birthdate`, `birthplace`, `birthcountry`, `postcode`, `nin`, `bloodtype`, `photoprofile`, `emergancyphone`, `emergancynote`) sont purgées à `NULL` ou substituées par `[Compte supprimé]`.

---

## 7. ANALYSE DU MÉCANISME DE SUPPRESSION / ANONYMISATION

Le mécanisme exécuté par `ConsentController::deleteAccount()` applique les règles de sécurité suivantes au sein d'une transaction SQL atomique (`beginTransaction` / `commit`) :

1. **COMPTE UTILISATEUR (`users`)** :
   - `username` renommé de façon irréversible en `DELETED_<8_premiers_caractères_user_id>` pour libérer le nom d'utilisateur et détruire toute information nominative.
   - `password` écrasé par la chaîne littérale `'DELETED'` (rendant toute vérification cryptographique de mot de passe techniquement impossible).
   - Tentative de connexion bloquée : le contrôleur `AuthController::login()` et `AuthController::google()` vérifient le drapeau `deleteacount` et retournent immédiatement un code `HTTP 403 Forbidden` : *"هذا الحساب تم حذفه بناءً على طلب صاحبه."*
2. **DONNÉES DU PROFIL (`patients`)** :
   - Anonymisation intégrale des colonnes personnelles, de localisation et de santé.
   - Positionnement du témoin d'anonymisation `deleteacount = 1`.
3. **RENDEZ-VOUS (`apointements`)** :
   - **Rendez-vous futurs non honorés (`apointementdate > NOW() AND status = 0`)** : Annulés automatiquement (`status = 1`, `updatedat = NOW()`) afin de libérer immédiatement les créneaux dans l'agenda du médecin.
   - **Rendez-vous passés et historique** : Conservés pour la cohérence médicale du praticien, mais dissociés de l'identité du patient (`patientname = '[Compte supprimé]'`, `phone = NULL`).
4. **MESSAGERIE & TICKETS (`tickets`, `ticketmessages`)** :
   - Tous les tickets de support ouverts du patient sont clôturés (`status = 'CLOSED'`).
5. **ÉVALUATIONS (`doctorsratings`)** :
   - Les avis laissés par le patient sont anonymisés (`hidepatient = 1`), masquant le nom de l'auteur sur les profils publics des médecins.
6. **SESSIONS & ACCÈS ACTIFS (`sessions`, `notifications`)** :
   - Suppression immédiate de toutes les sessions actives de l'utilisateur (`DELETE FROM sessions WHERE user_id = ?`).
   - Purge de toutes les notifications personnelles associées.
   - Dissociation des liens de parenté / proches (`patientsproches`).
7. **PORTABILITÉ / EXPORT DE DONNÉES (`handleDownloadData`)** :
   - La fonction d'export garantit la sanitization préalable stricte : exclusion totale des mots de passe, des tokens JWT, des clés API, des empreintes techniques (`ip_hash`, `user_agent_hash`) et substitution des images base64 volumineuses.

---

## 8. MATRICE DE CONSERVATION DES DONNÉES

> **Règle méthodologique stricte :** Aucune durée arbitraire ou non démontrée n'a été inventée. Lorsqu'aucune durée légale certaine n'est fixée dans les textes spécifiques algériens pour une catégorie, la mention obligatoire exacte est appliquée.

| Donnée | Table / Champ | Nature | Nécessaire ? | Accès | Conservation | Suppression / Anonymisation |
|---|---|---|---|---|---|---|
| **Identité du compte** | `users.username`, `users.password` | Donnée de compte | Oui | Utilisateur, Système | Durée de vie du compte actif | Anonymisation `username` (`DELETED_...`), verrouillage mot de passe (`DELETED`), suppression session |
| **Identité civile patient** | `patients.fullname`, `patients.birthdate`, `patients.birthplace`, `patients.gender` | Donnée personnelle | Oui | Patient, Médecin consulté | Durée de vie du compte actif | Écrasé à `NULL` / `[Compte supprimé]` lors de la suppression |
| **Coordonnées patient** | `patients.phone`, `patients.email`, `patients.address` | Donnée personnelle | Oui | Patient, Médecin, Système (OTP/Alertes) | Durée de vie du compte actif | Écrasé à `NULL` lors de la suppression |
| **Identifiant officiel (NIN)** | `patients.nin` | Donnée officielle citoyenne | Non (facultatif) | Patient | Durée de vie du compte actif | Écrasé à `NULL` lors de la suppression |
| **Photo de profil** | `patients.photoprofile` | Donnée biométrique / visuelle | Non (facultatif) | Patient, Médecin | Durée de vie du compte actif | Écrasé à `NULL` lors de la suppression |
| **Groupe sanguin** | `patients.bloodtype` | **Donnée de santé** | Non (facultatif) | Patient, Médecin | Durée de vie du compte actif | Écrasé à `NULL` lors de la suppression |
| **Notes d'urgence** | `patients.emergancynote`, `patients.emergancyphone` | Donnée de contact / santé | Non (facultatif) | Patient, Médecin d'urgence | Durée de vie du compte actif | Écrasé à `NULL` lors de la suppression |
| **Planification de RDV** | `apointements.apointementdate`, `status`, `clinicsdoctor_id` | Donnée d'organisation des soins | Oui | Patient, Médecin, Clinique, Delphi | Durée à déterminer juridiquement — aucune durée imposée démontrée dans le périmètre de cette phase | RDV futurs annulés (`status = 1`). L'enregistrement historique est conservé pour le praticien |
| **Motif médical de RDV** | `apointements.reason_id`, `reasons.name` | **Donnée de santé** | Oui | Patient, Médecin, Delphi | Durée à déterminer juridiquement — aucune durée imposée démontrée dans le périmètre de cette phase | Conservé dans le dossier du praticien sous forme anonymisée (dissocié de l'identité patient) |
| **Symptômes / Notes de RDV** | `apointements.note` | **Donnée de santé** | Non (facultatif) | Patient, Médecin | Durée à déterminer juridiquement — aucune durée imposée démontrée dans le périmètre de cette phase | Dissocié de l'identité (`patientname` anonymisé, `phone` effacé) |
| **Preuve de consentement RDV** | `apointements.consent_health`, `consent_at` | Preuve juridique (Art. 8 & 9) | Oui | Système, Justice / ANPDP | Durée à déterminer juridiquement — aucune durée imposée démontrée dans le périmètre de cette phase | Conservé à titre de preuve légale de la validité du traitement |
| **Preuve de consentement générale** | `consent_logs` (toutes colonnes) | Preuve juridique (Art. 35) | Oui | Système, ANPDP | Durée à déterminer juridiquement — aucune durée imposée démontrée dans le périmètre de cette phase | **Conservé impérativement** ; ajout d'une entrée de retrait (`value = 0`, `account_deletion`) |
| **Sessions actives** | `sessions.token`, `sessions.created_at` | Donnée technique de sécurité | Oui | Système | Durée de validité de session | Purge immédiate (`DELETE`) lors de la suppression ou déconnexion |
| **Évaluations et commentaires** | `doctorsratings.rating`, `comment` | Avis d'utilisateur | Non (facultatif) | Public, Médecin | Durée de vie de la fiche du médecin | Anonymisation forcée (`hidepatient = 1`) lors de la suppression du compte |
| **Tickets de support** | `tickets`, `ticketmessages` | Communication administrative | Oui | Patient, Médecin, Clinique | Durée à déterminer juridiquement — aucune durée imposée démontrée dans le périmètre de cette phase | Fermeture automatique des tickets (`status = 'CLOSED'`) |
| **Fréquentation / IP visiteurs** | `site_visits.ip_address`, `visit_date` | Donnée technique / statistique | Non (mesure audience) | Administrateur | Durée à déterminer juridiquement — aucune durée imposée démontrée dans le périmètre de cette phase | Conservation actuelle continue sans purge automatique |

---

## 9. MODIFICATIONS DE CODE RÉELLEMENT EFFECTUÉES

Toutes les modifications de code ont été ciblées, isolées et strictement nécessaires :

1. **[`backend/controllers/ConsentController.php`](file:///c:/xampp/htdocs/tabibi/backend/controllers/ConsentController.php)** :
   - Mise à jour de `getMy()` et `withdraw()` pour utiliser `AuthMiddleware::authenticate()` avec typage strict.
   - Refonte sécurisée de `deleteAccount()` pour les comptes patients :
     - Utilisation du garde `AuthMiddleware::patientOnly()`.
     - Anonymisation complète de tous les champs personnels et médicaux de `patients` (`bloodtype`, `nin`, `birthdate`, `emergancynote`, `address`, etc.) et mise à 1 de `deleteacount`.
     - Verrouillage du mot de passe à `'DELETED'` et pseudonymisation du nom d'utilisateur dans `users`.
     - Purge immédiate des jetons de session (`sessions`) et des notifications personnelles (`notifications`).
     - Suppression des liaisons de proches dans `patientsproches`.
     - Annulation automatique des rendez-vous futurs en attente (`status = 1`) pour libérer l'agenda des praticiens.
     - Anonymisation du nom (`patientname = '[Compte supprimé]'`) et effacement du numéro de téléphone (`phone = NULL`) dans l'ensemble des rendez-vous historiques du patient.
     - Fermeture automatique des tickets de support ouverts (`tickets.status = 'CLOSED'`).
     - Anonymisation forcée des évaluations et avis laissés par le patient (`doctorsratings.hidepatient = 1`).
     - Enregistrement des retraits de consentement dans le registre de traçabilité `consent_logs` avec le contexte `'account_deletion'`.
2. **[`backend/controllers/AuthController.php`](file:///c:/xampp/htdocs/tabibi/backend/controllers/AuthController.php)** :
   - Ajout d'une vérification explicite dans `login()` : si `deleteacount == 1`, renvoi d'une erreur HTTP `403 Forbidden` interdisant formellement toute réactivation ou réutilisation d'un compte supprimé.
   - Ajout de la même vérification dans le flux d'authentification Google OAuth (`google()`) afin qu'un utilisateur supprimé ne puisse pas réactiver son compte supprimé via son compte Google.

---

## 10. MODIFICATIONS VOLONTAIREMENT NON EFFECTUÉES

Conformément à la **Règle Absolue — Ne pas détruire l'existant**, les opérations suivantes ont été **volontairement rejetées et non exécutées** :

1. **Aucune suppression de colonne en base de données** :
   - Les colonnes `bloodtype`, `nin`, `birthplace`, `emergancynote` n'ont pas été supprimées afin de préserver la compatibilité ascendante avec les composants React existants et les flux Delphi.
2. **Aucune altération des données des patients existants** :
   - Les 6 comptes patients existants dans la base de données locale sont restés strictement intouchés (`deleteacount = 0`, données intactes).
3. **Aucun `DELETE` ou `UPDATE` global exécuté** :
   - Aucune commande SQL globale n'a été lancée sur l'environnement de travail.
4. **Aucune modification du logiciel Delphi** :
   - Le code et le comportement du client Delphi sont restés strictement inchangés.
5. **Aucun commit ni push Git** :
   - Conformément aux consignes de la Phase 02D, aucun versioning n'a été opéré.

---

## 11. TESTS EXÉCUTÉS ET RÉSULTATS

La suite de tests automatisée locale (`scratch/test_phase02d_runner.php`) a été exécutée et a validé l'intégralité des 11 scénarios requis :

| # | Libellé du test | Résultat | Détails de vérification |
|---|---|---|---|
| **1** | Création compte patient test | **PASS** | Compte créé avec succès (`user_id`, `patient_id`) avec mot de passe haché et session |
| **2** | Création rendez-vous test | **PASS** | 2 rendez-vous créés : 1 passé honoré (`status = 2`), 1 futur en attente (`status = 0`) |
| **3** | Présence données médicales associées | **PASS** | `bloodtype = 'O+'`, `reason_id` cardiologie et `consent_health = 1` enregistrés |
| **4** | Suppression du compte test | **PASS** | Transaction d'anonymisation et suppression exécutée avec succès |
| **5** | Impossibilité de reconnexion | **PASS** | Mot de passe révoqué (`'DELETED'`), username pseudonymisé, blocage 403 `deleteacount` |
| **6** | Vérification de l'anonymisation du profil | **PASS** | `fullname = '[Compte supprimé]'`, email, téléphone, adresse, NIN, `bloodtype` purgés à `NULL` |
| **7** | Vérification des rendez-vous associés | **PASS** | RDV futur annulé (`status = 1`), RDV passé conservé avec `patientname` anonymisé et motif préservé |
| **8** | Vérification de la persistance de `consent_logs` | **PASS** | Registre conservé : logs initiaux (`1`) et retraits (`0`, `'account_deletion'`) tracés |
| **9** | Vérification de l'invalidation des sessions | **PASS** | 100% des jetons actifs purgés de la table `sessions` |
| **10** | Vérification de la sécurité de l'export | **PASS** | Fonction `sanitizeExport` exclut mots de passe, tokens JWT, clés API, hash IP et blobs |
| **11** | Intégrité stricte des données existantes réelles | **PASS** | Les 6 comptes patients historiques sont strictement inchangés (0 altération) |

### Autres vérifications de compilation :
- **Syntaxe PHP (`php -l`)** : 100% des fichiers du répertoire `backend/` vérifiés sans la moindre erreur de syntaxe.
- **Build Frontend (`npm run build`)** : Bundle Vite v5.4.21 compilé avec succès en 3.04s sans erreur de build.

---

## 12. RISQUES RESTANT À VALIDER JURIDIQUEMENT

1. **Durée de conservation légale du dossier médical en cabinet privé en Algérie** :
   - En France (RGPD / Code de la Santé Publique), le dossier médical doit être conservé pendant 20 ans à compter du dernier séjour ou de la dernière consultation.
   - En Algérie, le Code de Déontologie Médicale et les textes réglementaires du Ministère de la Santé fixent des obligations de tenue de dossiers pour les praticiens, mais aucune durée précise n'est spécifiée pour les plateformes d'intermédiation technique comme TABIBI. Ce point doit être validé avec le conseil juridique de STELLARSOFT.
2. **Collecte du Numéro d'Identification Nationale (NIN) des patients** :
   - Une validation juridique formelle auprès de l'ANPDP est requise pour déterminer si la collecte facultative du NIN pour les patients est autorisée ou si elle doit être totalement désactivée dans l'interface patient.
3. **Statut juridique de TABIBI vis-à-vis des praticiens** :
   - Nécessité de formaliser un Accord de Traitement des Données (DPA / Convention de sous-traitance au sens de l'Art. 13 de la Loi 18-07) stipulant que le médecin est Responsable de Traitement de son agenda et de ses consultations, et que TABIBI agit comme sous-traitant technique.

---

## 13. RECOMMANDATIONS FUTURES

1. **Mise en place d'un système de purge automatique (Cron Job)** :
   - Automatiser la suppression périodique des codes de vérification expirés (`verifications`), des demandes de réinitialisation périmées (`password_resets`) et des visites anciennes de plus de 12 ou 24 mois (`site_visits`).
2. **Anonymisation des adresses IP dans `site_visits`** :
   - Modifier `PublicController::logVisit()` pour appliquer un masque de sous-réseau sur le dernier octet des adresses IPv4 (ex. `197.140.142.0/24`) afin que l'adresse IP ne constitue plus une donnée directement identifiante.
3. **Information contractuelle des médecins lors de la suppression d'un patient** :
   - Afficher un message explicatif dans l'interface du praticien lorsqu'un créneau affiche `[Compte supprimé]`, précisant que l'utilisateur a exercé son droit à l'effacement conformément à la Loi 18-07 tout en maintenant la traçabilité de l'acte pour le praticien.
4. **Préparation du dossier d'autorisation préalable ANPDP (Art. 17 Loi 18-07)** :
   - Finaliser la documentation technique et d'architecture pour le dépôt officiel auprès de l'ANPDP pour le traitement de données de santé en Algérie.
