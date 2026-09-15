# TABIBI — PHASE 01 : RAPPORT D'AUDIT JURIDIQUE ET DE CONFORMITÉ ALGÉRIENNE
> **Plateforme :** TABIBI (Web, Mobile Android Capacitor, API REST PHP, Desktop Delphi Sync)  
> **Cadre Légal de Référence :**  
> 1. **Loi n° 18-07 du 10 juin 2018** relative à la protection des personnes physiques dans le traitement des données à caractère personnel (*Journal Officiel n° 34 du 10 juin 2018*).  
> 2. **Loi n° 25-11 du 24 juillet 2025** modifiant et complétant la loi n° 18-07 (*Journal Officiel n° 50 du 27 juillet 2025*).  
> **Autorité de Contrôle :** Autorité Nationale de Protection des Données à caractère Personnel (ANPDP - Algérie).  
> **Statut du document :** Audit exhaustif de l'existant — Aucune modification de code ni de base de données effectuée.  
> **Date de réalisation :** Septembre 2026.

---

## SOMMAIRE

1. [État actuel du projet](#1-état-actuel-du-projet)
2. [Pages et documents juridiques existants](#2-pages-et-documents-juridiques-existants)
3. [Inventaire des consentements existants](#3-inventaire-des-consentements-existants)
4. [Inventaire détaillé des données collectées](#4-inventaire-détaillé-des-données-collectées)
5. [Traitement spécifique des données de santé](#5-traitement-spécifique-des-données-de-santé)
6. [Droits des personnes concernées](#6-droits-des-personnes-concernées)
7. [Durée et politique de conservation des données](#7-durée-et-politique-de-conservation-des-données)
8. [Responsabilités respectives définies (STELLARSOFT, TABIBI, Médecins, Patients)](#8-responsabilités-respectives-définies)
9. [Hébergement, transferts transfrontaliers et sous-traitants techniques](#9-hébergement-transferts-transfrontaliers-et-sous-traitants-techniques)
10. [Sécurité, traçabilité et journalisation](#10-sécurité-traçabilité-et-journalisation)
11. [Synthèse des manquements constatés](#11-synthèse-des-manquements-constatés)
12. [Points juridiquement incertains nécessitant validation professionnelle](#12-points-juridiquement-incertains-nécessitant-validation-professionnelle)
13. [Plan d'actions : éléments à créer et modifier ultérieurement](#13-plan-dactions--éléments-à-créer-et-modifier-ultérieurement)

---

## 1. ÉTAT ACTUEL DU PROJET

Le projet **TABIBI** est un écosystème logiciel de santé numérique opérant en Algérie, composé de :
1. **Une application Web (SPA) & Mobile hybride (Capacitor Android) :** Interface React 18 / Vite accessible aux patients, médecins, cliniques et administrateurs (`frontend/src/App.jsx`).
2. **Une API REST Backend :** Micro-architecture PHP Vanilla (`backend/index.php`, contrôleurs dans `backend/controllers/`).
3. **Une base de données relationnelle :** MySQL / MariaDB (`uyyuppcc_DBTabibi`) interconnectée via PDO.
4. **Un module de synchronisation bidirectionnelle :** Endpoints `/api/sync/*` (`backend/controllers/SyncController.php`) assurant la réplication périodique des rendez-vous et des données cliniques avec un logiciel médical pour cabinets et cliniques codé en Delphi.

### Constat global de conformité :
Le système a été conçu et développé avec une forte orientation technique et opérationnelle, mais présente un **déficit majeur de conformité juridique** vis-à-vis des exigences impératives de la **Loi n° 18-07** et des révisions substantielles introduites par la **Loi n° 25-11 du 24 juillet 2025**.  
Bien que des pages d'information juridique existent (`/privacy`, `/terms`, `/law-18-07`), elles sont purement passives, déconnectées des flux de collecte opérationnels, non contractualisées, incomplètes et juridiquement inexécutables.

---

## 2. PAGES ET DOCUMENTS JURIDIQUES EXISTANTS

L'inspection intégrale du code frontend (`frontend/src/App.jsx`, `frontend/src/pages/`, `frontend/src/locales/`) révèle l'existence de **4 écrans juridiques** :

### 2.1. Politique de Confidentialité (`PrivacyPolicyPage`)
- **Fichier / Composant :** `frontend/src/App.jsx` (lignes 5294 à 5334) ; Textes dans `frontend/src/locales/fr.json` (clés `privacy_section1_*` à `privacy_section9_*`), `ar.json` et `en.json`.
- **Route :** `/#/privacy`
- **Langues disponibles :** Français, Arabe, Anglais.
- **Affichage :** Accessible via un lien statique présent dans le footer général du site (`footer_privacy`).
- **Contenu actuel :**
  - Section 1 : Données collectées (nom, téléphone, email, rendez-vous).
  - Section 2 : Conservation ("durée nécessaire... puis archivées ou supprimées conformément à la réglementation").
  - Section 3 : Responsable du traitement ("Les données personnelles collectées... sont traitées par Tabibi").
  - Section 4 : Finalités (gestion des RDV, rappels, notifications, amélioration des services).
  - Section 5 : Données de santé ("considérées comme sensibles... accessibles qu’aux professionnels de santé").
  - Section 6 : Partage des données (professionnels de santé, prestataires techniques hébergement/maintenance).
  - Section 7 : Sécurité ("mesures techniques et organisationnelles").
  - Section 8 : Droits (accès, rectification, suppression via compte ou contact).
  - Section 9 : Contact (`contact@tabibi.dz`).
- **Quand l'utilisateur l'accepte-t-il ? :** **JAMAIS de manière explicite.** Aucun flux d'inscription n'impose son acceptation.
- **Caractère :** Purement consultatif et facultatif.
- **Enregistrement de l'acceptation :** **NON ENREGISTRÉE.**
- **Possibilité de retrait du consentement :** **NON IDENTIFIÉ** (aucune fonction applicative).
- **Date / Version du document :** **NON MENTIONNÉE** (aucun numéro de version ni date de révision).
- **Mention de la Loi 25-11 :** **ABSENTE** (seule la Loi 18-07 originale est citée).
- **Identification de la personne morale :** **DÉFAILLANTE** ("Tabibi" sans forme juridique, sans adresse de siège, sans NIF/RC, sans mention de STELLARSOFT).

### 2.2. Conditions Générales d'Utilisation (`TermsOfUsePage`)
- **Fichier / Composant :** `frontend/src/App.jsx` (lignes 5337 à 5372) ; Textes dans `frontend/src/locales/fr.json` (clés `term1_*` à `term9_*`), `ar.json` et `en.json`.
- **Route :** `/#/terms`
- **Langues disponibles :** Français, Arabe, Anglais.
- **Affichage :** Accessible via le footer (`footer_terms`).
- **Contenu actuel :**
  - 9 clauses couvrant l'acceptation, la responsabilité du compte, le rôle d'intermédiaire de mise en relation, la prise de RDV, l'annulation, la limitation de responsabilité en cas de faute médicale, la disponibilité du service, la modification des conditions et l'email de contact (`contact@tabibi.dz`).
- **Quand l'utilisateur l'accepte-t-il ? :** Aucune case à cocher lors de la création de compte patient, médecin ou clinique.
- **Enregistrement de l'acceptation :** **NON ENREGISTRÉE.**
- **Preuve juridique :** **INEXISTANTE** (simple clause réputée acceptée par l'usage — opposabilité très contestable au sens des articles 6 et 7 de la loi 18-07).

### 2.3. Synthèse de la Loi 18-07 (`Law1807Page`)
- **Fichier / Composant :** `frontend/src/App.jsx` (lignes 5171 à 5258).
- **Route :** `/#/law-18-07`
- **Langues disponibles :** Français, Arabe.
- **Nature :** Page purement informative résumant les principes de la loi (objectifs, principes du traitement, droits des personnes, sanctions).
- **Lien externe :** Renvoie vers le site officiel de l'ANPDP (`https://anpdp.dz/ar/storage/2025/08/18-07-Edited.pdf`).
- **Mise à jour Loi 25-11 :** **ABSENTE** (le texte résume la loi de 2018 sans intégrer les réformes de juillet 2025).

### 2.4. Visionneuse PDF de la Loi (`LawPDFViewerPage`)
- **Fichier / Composant :** `frontend/src/App.jsx` (lignes 5261 à 5290).
- **Route :** `/#/law-pdf`
- **Nature :** Écran d'attente (placeholder) avec bouton de redirection externe vers le PDF hébergé sur le serveur de l'ANPDP.

### 2.5. Mentions Légales
- **Fichier / Composant :** **TOTALEMENT ABSENT.** Il n'existe aucune page dédiée aux mentions légales (Directeur de publication, Raison sociale de l'éditeur, Coordonnées complètes du siège, Capital, Registre du Commerce, Numéro d'Agrément/Déclaration ANPDP, Identité de l'hébergeur physique).

### 2.6. Politique des Cookies / Traceurs
- **Fichier / Composant :** **TOTALEMENT ABSENT.** Aucune page ni section expliquant l'usage du stockage local (`localStorage`), des cookies de session ou des scripts de télémétrie.

---

## 3. INVENTAIRE DES CONSENTEMENTS EXISTANTS

L'audit des parcours utilisateurs révèle des défaillances structurelles dans le recueil et la preuve du consentement :

### 3.1. Inscription Patient classique (`RegisterPage`)
- **Fichier :** `frontend/src/App.jsx` (lignes 2096–2260) et `frontend/src/pages/Register.jsx`.
- **Champs saisis :** Nom complet, nom d'utilisateur, email, téléphone, genre, mot de passe.
- **Vérification du consentement :** **AUCUNE.**
  - Aucune case à cocher (checkbox) CGU.
  - Aucune mention ni renvoi vers la Politique de Confidentialité.
  - Aucun consentement exprès au traitement des données personnelles.
  - L'utilisateur clique sur "Créer le compte" et le compte est généré immédiatement après vérification OTP de l'email.

### 3.2. Inscription / Connexion Patient via Google OAuth (`onGoogleLogin`)
- **Fichier :** `frontend/src/App.jsx` (lignes 268–273) et `backend/controllers/AuthController.php` (`google()`, lignes 327–451).
- **Fonctionnement :** L'utilisateur clique sur le bouton Google Identity Services (GSI). Si son compte n'existe pas en base, le backend crée automatiquement l'utilisateur et le profil patient à la volée.
- **Vérification du consentement :** **AUCUNE.** Aucune fenêtre modale, aucun recueil préalable de consentement, aucune acceptation contractuelle.

### 3.3. Inscription Médecin (`RegisterDoctorPage`)
- **Fichier :** `frontend/src/App.jsx` (lignes 4732–4838).
- **Champs saisis :** Nom complet, spécialité, email, téléphone, mot de passe, NIN (Numéro d'Identification Nationale), claim_id.
- **Vérification du consentement :** **AUCUNE.**
  - Pas de contrat de partenariat ou de sous-traitance à valider.
  - Pas d'engagement sur la responsabilité médicale et le secret professionnel.
  - Pas de consentement sur le traitement des données professionnelles et du NIN.

### 3.4. Inscription Clinique / Établissement (`RegisterClinicPage`)
- **Fichier :** `frontend/src/App.jsx` (lignes 4650–4720).
- **Champs saisis :** Nom de la clinique, téléphone professionnel, email, mot de passe, adresse, coordonnées GPS (latitude/longitude), notes.
- **Vérification du consentement :** **AUCUNE.** Aucune acceptation contractuelle des conditions de service ni de politique de données.

### 3.5. Prise de Rendez-vous Standard (`Book.jsx` et `App.jsx`)
- **Fichiers :** `frontend/src/pages/Book.jsx` (lignes 437–448) et `frontend/src/App.jsx` (lignes 4220–4235).
- **Présence d'un bloc de consentement :** **OUI (Visuel uniquement)**.
  - Titre : `{t("privacy_title")}` ("اتفاقية الخصوصية والموافقة" / "Privacy Agreement").
  - Texte : `{t("privacy_desc")}` ("بإتمامك لهذا الحجز، فإنك توافق على تخزين بياناتك الشخصية والطبية بأمان...").
  - Checkbox : `<input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />`.
  - Libellé : `{t("privacy_agree")}` ("أوافق على الشروط والأحكام وسياسة الخصوصية").
  - Bouton de confirmation bloqué si non coché (`disabled={!agreed}`).
- **Analyse critique et faiblesses juridiques majeures :**
  1. **Absence dans la version française :** Les clés `privacy_title`, `privacy_desc` et `privacy_agree` sont **absentes de `frontend/src/locales/fr.json`** ! Elles n'existent qu'en arabe et en anglais.
  2. **Non-transmission au serveur :** La variable `agreed` est un simple état React local (`useState(false)`). Elle n'est **jamais envoyée dans la charge utile HTTP** (`payload`) vers l'API `/api/appointments/book`.
  3. **Non-persistance en base de données :** La table `apointements` ne comporte **aucune colonne** pour enregistrer l'acceptation, la date et l'heure du consentement, l'adresse IP du signataire, ni la version des termes acceptés.
  4. **Valeur probante nulle :** En cas de contentieux, TABIBI est dans l'impossibilité matérielle de prouver qu'un patient a consenti au traitement de ses données de santé pour un rendez-vous donné.

### 3.6. Prise de Rendez-vous Rapide (`QuickAppointmentModal.jsx`)
- **Fichier :** `frontend/src/components/QuickAppointmentModal.jsx` (lignes 240–475).
- **Champs saisis :** Sélection clinique, date, créneau horaire, et **note / symptômes médicaux** (`note_optional`).
- **Vérification du consentement :** **ZÉRO CONSENTEMENT.**
  - Aucune case à cocher.
  - Aucun texte d'avertissement.
  - Aucun lien vers la politique de confidentialité.
  - Le patient valide directement ses symptômes et son rendez-vous sans la moindre manifestation de volonté.

### 3.7. Cookies, Traceurs et Stockage Local
- **Bannière de consentement aux cookies :** **TOTALEMENT INEXISTANTE.**
- Le site dépose et utilise :
  - `localStorage.getItem("tabibi_token")` (Jeton d'authentification Bearer).
  - `localStorage.getItem("i18nextLng")` (Préférence de langue).
  - Chargement automatique du script Google GSI (`https://accounts.google.com/gsi/client`).
  - Script d'enregistrement de visiteur anonyme / IP (`POST /api/public/visit` -> table `site_visits`).
- Aucun recueil de consentement n'est effectué préalablement au dépôt de traceurs ou à l'exécution de scripts tiers.

### 3.8. Consentement pour les Mineurs et Proches
- **Fichier :** `backend/controllers/PatientController.php` (table `patientsproches`).
- Le système permet à un patient d'enregistrer des proches (enfants, parents) et de prendre des rendez-vous en leur nom.
- **Mécanisme de consentement parental / tuteur légal :** **TOTALEMENT ABSENT.**
- Aucune attestation sur l'honneur ni vérification de l'autorité parentale n'est implémentée.

---

## 4. INVENTAIRE DÉTAILLÉ DES DONNÉES COLLECTÉES

### 4.1. Données relatives aux Patients

| Catégorie de Données | Donnée exacte | Champ BDD / Fichier | Statut | Finalité opérationnelle | Accès | Stockage | Durée de conservation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Identité** | Nom et prénom | `patients.fullname`, `apointements.patientname` | Obligatoire | Identification, création du compte, gestion des RDV | Patient, Médecin, Clinique, Admin | MySQL (`patients`) | NON IDENTIFIÉE (illimitée) |
| **Identité** | Nom d'utilisateur | `users.username` | Obligatoire | Authentification login | Patient, Admin | MySQL (`users`) | NON IDENTIFIÉE (illimitée) |
| **Identité** | Genre (Sexe) | `patients.gender` (`0`=M, `1`=F) | Facultatif | Profil médical, démographie | Patient, Médecin | MySQL (`patients`) | NON IDENTIFIÉE (illimitée) |
| **Identité** | Date de naissance | `patients.birthdate`, `apointements.birthdate` | Facultatif | Calcul de l'âge médical | Patient, Médecin, Delphi | MySQL | NON IDENTIFIÉE (illimitée) |
| **Identité** | Lieu & pays de naissance | `patients.birthplace`, `patients.birthcountry` | Facultatif | Complétude dossier administratif | Patient | MySQL (`patients`) | NON IDENTIFIÉE (illimitée) |
| **Identité officielle** | Numéro National (NIN) | `patients.nin` | Facultatif | Identification unique citoyenne | Patient, Admin | MySQL (`patients`) | NON IDENTIFIÉE (illimitée) |
| **Identité visuelle** | Photo de profil | `patients.photoprofile` | Facultatif | Personnalisation du profil | Patient, Médecin | MySQL (BLOB) | NON IDENTIFIÉE (illimitée) |
| **Coordonnées** | Numéro de téléphone | `patients.phone`, `apointements.phone` | Obligatoire/Facultatif | Contact, confirmation RDV, unicité compte | Patient, Médecin, Clinique, Admin | MySQL | NON IDENTIFIÉE (illimitée) |
| **Coordonnées** | Adresse email | `patients.email` | Obligatoire | Authentification, réinitialisation, alertes | Patient, Admin, Médecin | MySQL | NON IDENTIFIÉE (illimitée) |
| **Coordonnées** | Adresse physique & Code postal | `patients.address`, `patients.postcode` | Facultatif | Localisation géographique | Patient | MySQL (`patients`) | NON IDENTIFIÉE (illimitée) |
| **Localisation** | Commune & Wilaya | `patients.baladiya_id` | Facultatif | Recherche de proximité | Patient | MySQL | NON IDENTIFIÉE (illimitée) |
| **Contact Urgence** | Tél., email, note urgence | `emergancyphone`, `emergancyemail`, `emergancynote` | Facultatif | Sécurité en cas de détresse vitale | Patient, Médecin | MySQL (`patients`) | NON IDENTIFIÉE (illimitée) |
| **Liens familiaux** | Proches rattachés | `patientsproches.proche_id` | Facultatif | Prise de RDV pour tiers/enfants | Patient, Médecin | MySQL (`patientsproches`) | NON IDENTIFIÉE (illimitée) |
| **Santé / Médicale** | Groupe sanguin | `patients.bloodtype` | Facultatif | Fiche médicale d'urgence | Patient, Médecin | MySQL (`patients`) | NON IDENTIFIÉE (illimitée) |
| **Santé / Médicale** | Médecin traitant choisi | `patients.doctor_id` | Facultatif | Suivi médical coordonné | Patient, Médecin | MySQL (`patients`) | NON IDENTIFIÉE (illimitée) |
| **Santé / Médicale** | Motif de consultation | `apointements.reason_id`, `reasons.name` | Facultatif | Préparation consultation médicale | Patient, Médecin, Clinique, Delphi | MySQL | NON IDENTIFIÉE (illimitée) |
| **Santé / Médicale** | Notes & Symptômes | `apointements.note` | Facultatif | Description symptômes par patient | Patient, Médecin, Clinique, Delphi | MySQL | NON IDENTIFIÉE (illimitée) |
| **Santé / Biométrie** | Poids, Taille, IMC | `weight`, `height`, `imc` dans `apointements` | Via Sync Delphi | Suivi biométrique clinique | Médecin, Delphi | MySQL (`apointements`) | NON IDENTIFIÉE (illimitée) |
| **Santé / Constantes** | Tension artérielle (PAS/PAC) | `pas`, `pac` dans `apointements` | Via Sync Delphi | Données cliniques de consultation | Médecin, Delphi | MySQL (`apointements`) | NON IDENTIFIÉE (illimitée) |
| **Santé / Constantes** | Saturation O2, Pouls | `oxygen`, `heartbeats` dans `apointements` | Via Sync Delphi | Constantes vitales du patient | Médecin, Delphi | MySQL (`apointements`) | NON IDENTIFIÉE (illimitée) |
| **Parcours de soins** | Rendez-vous passés/futurs | `apointements.apointementdate`, `status` | Obligatoire | Planification des soins | Patient, Médecin, Clinique, Delphi | MySQL | NON IDENTIFIÉE (illimitée) |
| **Communication** | Échanges écrits (Chat) | `messages.ContentMessage`, `DateSend` | Facultatif | Télé-échange médecin/patient | Patient, Médecin | MySQL (`messages`) | NON IDENTIFIÉE (illimitée) |
| **Avis / Évaluations** | Note et commentaire | `doctorsratings.rating`, `comment` | Facultatif | Évaluation de la prise en charge | Public, Médecin, Admin | MySQL (`doctorsratings`) | NON IDENTIFIÉE (illimitée) |

### 4.2. Données relatives aux Médecins

| Catégorie de Données | Donnée exacte | Champ BDD / Fichier | Statut | Finalité opérationnelle | Accès | Stockage | Durée de conservation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Identité** | Nom et prénom | `doctors.fullname`, `users.username` | Obligatoire | Annuaire, exercice médical, facturation | Public, Patient, Admin | MySQL (`doctors`, `users`) | NON IDENTIFIÉE (illimitée) |
| **Identité officielle** | Numéro National (NIN) | `doctors.nin`, `doctorregistrations.nin` | Facultatif/Demandé | Contrôle d'identité par l'admin | Admin | MySQL | NON IDENTIFIÉE (illimitée) |
| **Identité pro.** | Spécialité médicale | `doctors.specialtie_id`, `specialties.name*` | Obligatoire | Orientation des patients | Public, Patient | MySQL | NON IDENTIFIÉE (illimitée) |
| **Identité pro.** | N° d'ordre / Enregistrement | `doctors.numregister` | Facultatif | Vérification du droit d'exercer | Admin | MySQL (`doctors`) | NON IDENTIFIÉE (illimitée) |
| **Identité pro.** | N° RPPS (Santé) | `doctors.rpps` | Facultatif | Registre des professionnels | Admin | MySQL (`doctors`) | NON IDENTIFIÉE (illimitée) |
| **Sécurité sociale** | Affiliation CASNOS | `doctors.casnos` | Facultatif | Statut fiscal / social praticien | Admin | MySQL (`doctors`) | NON IDENTIFIÉE (illimitée) |
| **Cursus** | Titres et Diplômes | `doctors.degrees`, `doctors.academytitles` | Facultatif | Information des patients | Public | MySQL (`doctors`) | NON IDENTIFIÉE (illimitée) |
| **Coordonnées** | Téléphone portable & Fixe | `doctors.phone`, `doctors.fix` | Obligatoire/Facultatif | Contact professionnel, alertes | Admin, Clinique, Patient | MySQL (`doctors`) | NON IDENTIFIÉE (illimitée) |
| **Coordonnées** | Adresse email | `doctors.email` | Obligatoire | Authentification, alertes système | Admin, Système | MySQL (`doctors`) | NON IDENTIFIÉE (illimitée) |
| **Tarification** | Tarifs consultations | `doctors.pricing`, `doctorsreasons` | Facultatif | Transparence tarifaire | Public, Patient | MySQL | NON IDENTIFIÉE (illimitée) |
| **Planning** | Horaires de travail & congés | `doctorssettingapointements`, `doctorsoffhours`| Obligatoire | Gestion des disponibilités RDV | Public, Patient, Delphi | MySQL | NON IDENTIFIÉE (illimitée) |
| **Rattachement** | Liens avec les cliniques | `clinicsdoctors.clinic_id`, `status` | Obligatoire | Lieux d'exercice | Public, Clinique | MySQL (`clinicsdoctors`) | NON IDENTIFIÉE (illimitée) |
| **Image** | Photographie professionnelle | `doctors.photoprofile` | Facultatif | Présentation dans l'annuaire | Public | MySQL (BLOB) | NON IDENTIFIÉE (illimitée) |

### 4.3. Données relatives aux Cliniques et Établissements
- **Données collectées :** Nom de l'établissement (`clinicname`), statut juridique / validation (`status`), logo (`logo`), numéro de téléphone fixe et mobile (`phone`, `fix`), adresse complète, coordonnées GPS (`latitude`, `longitude`), statut d'urgence (`emergency`), notes administratives.
- **Finalité :** Référencement des centres de soins, géolocalisation pour les patients, affectation des cabinets médicaux.

### 4.4. Données de Navigation et Données Techniques
- **Adresses IP des visiteurs :** Collectées automatiquement par `PublicController::logVisit()` (`site_visits.ip_address`), associées au pays (`country`), à la wilaya (`wilaya`) et à la date (`visit_date`).
- **Jalons de connexion :** Table `sessions` (`token`, `created_at`).
- **Codes OTP de vérification :** Table `verifications` (`target`, `code`, `type`, `expires_at`).
- **Demandes de réinitialisation :** Table `password_resets` (`email`, `token`, `expires_at`, `used`).

---

## 5. TRAITEMENT SPÉCIFIQUE DES DONNÉES DE SANTÉ

### 5.1. Qualification juridique sous l'empire de la Loi 18-07 et de la Loi 25-11
En vertu de l'**Article 8 de la Loi n° 18-07**, le traitement des données à caractère personnel relatives à la santé, aux caractéristiques génétiques ou à la vie sexuelle est **strictement interdit**, sauf dérogations expresses limitativement énumérées :
1. **Consentement exprès** et éclairé de la personne concernée (Art. 9).
2. Traitement nécessaire à la **médecine préventive, aux diagnostics médicaux, à l'administration de soins ou de traitements**, ou à la gestion de services de santé, mis en œuvre par un **praticien de santé tenu au secret professionnel** (Art. 10).

L'**Article 17 de la Loi n° 18-07** impose une obligation d'**AUTORISATION PRÉALABLE de l'ANPDP** pour tout traitement portant sur des données génétiques ou de santé.

### 5.2. Constat des données de santé traitées dans TABIBI
Le système traite des données de santé à 4 niveaux :
1. **La nature même de la prise de rendez-vous médical :** Le croisement entre l'identité d'un patient et la spécialité d'un médecin (ex. Oncologie, Psychiatrie, Gynécologie, Cardiologie) constitue déjà une **donnée de santé indirecte** au sens jurisprudentiel algérien et international.
2. **Le motif de consultation (`reason_id`) :** La base contient 716 motifs médicaux préenregistrés dans la table `reasons` (ex. "Suivi Diabète", "Douleur thoracique", "Dépression").
3. **Le champ texte libre de symptômes (`note`) :** Présent dans `Book.jsx`, `QuickAppointmentModal.jsx` et `apointements.note`, permettant au patient d'écrire librement ses symptômes et antécédents.
4. **Les constantes et paramètres vitaux cliniques synchronisés depuis Delphi :**
   - Poids, Taille, IMC.
   - Pression artérielle systolique et diastolique (`pas`, `pac`).
   - Saturation pulsée en oxygène (`oxygen`).
   - Fréquence cardiaque (`heartbeats`).
5. **La messagerie médicale instantanée (`messages`) :** Échange de messages textuels contenant des avis, conseils thérapeutiques et descriptions de pathologies entre patient et médecin.

### 5.3. Défauts critiques de conformité sur les données de santé
- **Absence d'autorisation ANPDP :** Aucun dossier d'autorisation préalable (Art. 17) n'a été formalisé ni référencé dans l'application.
- **Absence de chiffrement applicatif au repos :** Les données de santé (constantes vitales, notes, messages de chat, motifs) sont stockées en **texte clair (plain text)** dans les tables MySQL `apointements` et `messages`.
- **Transmission non étanche :** Les emails de notification générés par `EmailHelper::sendAppointmentConfirmation` incluent le nom du médecin, de la clinique et le motif médical (`reason`), transmis en clair via le réseau SMTP de Google.

---

## 6. DROITS DES PERSONNES CONCERNÉES

Analyse de la conformité vis-à-vis des **Articles 32 à 37 de la Loi 18-07** (modifiée par la Loi 25-11) :

| Droit légal | Article Loi 18-07 | Statut dans TABIBI | Analyse de l'implémentation actuelle |
| :--- | :--- | :--- | :--- |
| **Droit à l'information préalable** | Art. 32 | **PARTIEL** | Présent dans `/privacy` mais non affiché lors des formulaires de collecte (inscriptions, réservations rapides). Finalités et destinataires imprécis. |
| **Droit d'accès** | Art. 34 | **PARTIEL** | L'utilisateur peut consulter ses rendez-vous et son profil personnel via l'UI. En revanche, il ne dispose d'aucun accès aux constantes vitales synchronisées ni aux logs d'audit. |
| **Droit de rectification** | Art. 35 | **EXISTE** | Fonctionnel : les patients et médecins peuvent modifier leurs données personnelles et de contact via les endpoints `PUT /api/patients/profile` et `PUT /api/doctors/profile`. |
| **Droit d'opposition** | Art. 36 | **ABSENT** | Aucun mécanisme pour s'opposer à certains traitements (ex. notifications, enregistrement IP `site_visits`, synchronisation avec Delphi). |
| **Droit à l'effacement (Suppression)** | Art. 35 | **ABSENT** | **Aucun bouton "Supprimer mon compte"** ni endpoint API de purge ou d'anonymisation n'existe dans le système. Les données restent ad vitam aeternam. |
| **Droit au retrait du consentement** | Art. 6 & 9 | **ABSENT** | Impossible de révoquer un consentement consenti sans supprimer manuellement le compte par voie de requête SQL directe en BDD. |
| **Droit à l'export (Portabilité)** | Pratique standard | **ABSENT** | Aucun bouton de téléchargement du dossier ou historique sous format interopérable (JSON, PDF structuré). |
| **Fermeture de compte** | Obligation contractuelle | **ABSENT** | Aucun flux automatisé de résiliation ou désactivation de compte dans les interfaces patient ou médecin. |
| **Procédure de réclamation / DPO** | Art. 32 & 40 | **ABSENT** | Seul un email générique `contact@tabibi.dz` est fourni. Pas de désignation de Délégué à la Protection des Données (DPO/CPO), pas de formulaire formel d'exercice des droits. |

---

## 7. DURÉE ET POLITIQUE DE CONSERVATION DES DONNÉES

En vertu de l'**Article 4-5 de la Loi n° 18-07**, les données ne doivent être conservées que pendant une durée n'excédant pas celle nécessaire aux finalités pour lesquelles elles ont été collectées.

### Constat dans TABIBI :
1. **Durée de conservation programmée :** **AUCUNE (INDÉTERMINÉE).**
2. **Mécanisme d'archivage :** **INEXISTANT.**
3. **Purge automatique des comptes inactifs :** **INEXISTANTE.**
4. **Gestion des rendez-vous passés :** Les rendez-vous annulés reçoivent un marquage logique `status = 1` (Soft Cancel), mais restent indéfiniment en base.
5. **Logs de synchronisation (`sync_logs`) :** Conservés sans politique de rotation ni d'effacement périodique.
6. **Statistiques de visites (`site_visits`) :** Table accumulant ad vitam l'ensemble des adresses IP collectées.
7. **Codes OTP expirés (`verifications`) :** Nettoyés uniquement lors d'une nouvelle demande sur la même cible, sinon conservés indéfiniment.

---

## 8. RESPONSABILITÉS RESPECTIVES DÉFINIES

### 8.1. STELLARSOFT
- **Mentions dans le code et les docs :** Apparaît comme propriétaire du compte d'envoi SMTP (`stellarsoftpro@gmail.com`), de l'adresse de support (`contact@stellarsoft.dz`), de l'URL de téléchargement APK (`stellarsoft.dz/download/tabibi.apk`), et créateur du projet (`Docs/PROJECT_CONTEXT.md`).
- **Statut juridique défini dans l'application :** **NON IDENTIFIÉ.**  
  Aucun document contractuel n'indique si STELLARSOFT est :
  - L'Éditeur juridique et Responsable du traitement de la plateforme ?
  - Un sous-traitant technique / développeur de la plateforme ?
  - Un prestataire d'hébergement ?

### 8.2. TABIBI
- **Mention dans la Politique de Confidentialité :** "Les données personnelles collectées sur cette application sont traitées par Tabibi" (section 3).
- **Statut juridique :** **NON IDENTIFIÉ.** "Tabibi" est une marque ou un nom d'application, sans personnalité juridique autonome précisée (SARL, EURL, SPA ? Siège social ? Registre du Commerce ?).

### 8.3. Les Médecins et Praticiens
- **Mention dans les CGU :** "Les médecins et établissements de santé sont seuls responsables des soins, des consultations et des informations médicales fournies. La plateforme agit en tant qu’intermédiaire de mise en relation" (section 3 et 6).
- **Rôle au sens de la Loi 18-07 :**
  - Pour le dossier médical et l'acte de soin : Le Médecin est le **Responsable du Traitement** médical.
  - Dans la relation avec TABIBI : Le statut de TABIBI vis-à-vis du médecin (Sous-traitant au sens de l'Art. 3 de la loi 18-07 mettant à disposition un outil de gestion d'agenda) **n'est formalisé par aucun contrat de sous-traitance (DPA - Data Processing Agreement)**.

### 8.4. Les Patients
- Définis dans les CGU comme responsables de la confidentialité de leurs identifiants et de l'exactitude des informations renseignées lors de la réservation.

---

## 9. HÉBERGEMENT, TRANSFERTS TRANSFRONTALIERS ET SOUS-TRAITANTS TECHNIQUES

### 9.1. Localisation physique de l'hébergement
- **Serveur API & Base de données :** Adresse IP distante `197.140.142.6` (domaine `tabibi.dz`).
- **Environnement :** Serveur cPanel / Apache / MySQL.
- **Conformité territoriale :**
  - La plage IP `197.140.142.6` est rattachée à l'espace AfriNIC / Algérie.
  - **Exigence Loi 25-11 :** La loi impose la localisation impérative et exclusive des infrastructures hébergeant des données de santé de citoyens algériens sur le territoire national algérien. Une attestation d'hébergement physique souverain (datacenter en Algérie) est requise pour validation ANPDP.

### 9.2. Transferts Transfrontaliers de Données (Articles 44 à 48 de la Loi 18-07)
En vertu de l'**Article 44 de la Loi 18-07**, le transfert de données à caractère personnel vers un pays étranger est **interdit**, sauf autorisation préalable de l'ANPDP et sous réserve que le pays de destination offre un niveau de protection équivalent.

**Transferts effectifs constatés dans le code de TABIBI :**
1. **Sous-traitant Google LLC (États-Unis) — Messagerie SMTP :**
   - Fichier : `backend/.env` et `backend/helpers/EmailHelper.php`.
   - Serveur : `smtp.gmail.com` via TLS.
   - Données transférées vers l'étranger : Noms des patients, noms des praticiens, dates de rendez-vous, motifs médicaux de consultation, codes OTP, mots de passe de comptes créés.
   - Statut juridique : **TRANSFERT NON DÉCLARÉ / NON AUTORISÉ auprès de l'ANPDP**.
2. **Sous-traitant Google LLC (États-Unis) — Authentification OAuth & GSI :**
   - Fichiers : `frontend/index.html` (`accounts.google.com/gsi/client`) et `backend/controllers/AuthController.php` (`https://oauth2.googleapis.com/tokeninfo`).
   - Données transférées vers l'étranger : Adresses IP, identifiants de compte Google, jetons d'identification.
   - Statut juridique : **TRANSFERT NON DÉCLARÉ**.
3. **Polices de caractères Google Fonts :**
   - Fichiers : `frontend/index.html` (Cairo) et `EmailHelper.php` (Tajawal).
   - Appel externe direct transmettant les IP des utilisateurs à Google sans consentement préalable.

### 9.3. Synchronisation Desktop (Logiciel Delphi en Clinique)
- **Flux :** `/api/sync/upload` et `/api/sync/download`.
- **Rôle :** Échange bidirectionnel entre le cloud et les postes informatiques locaux des cabinets médicaux.
- **Risque de sécurité / fuite :** Le logiciel local Delphi extrait et stocke des données de santé sans audit documenté de la sécurité des postes locaux (antivirus, accès physique, sauvegardes locales non chiffrées).

---

## 10. SÉCURITÉ, TRAÇABILITÉ ET JOURNALISATION

Analyse au regard des **Articles 38 à 43 de la Loi n° 18-07** (Sécurité et confidentialité des données) :

### 10.1. Authentification et Mots de Passe
- **Mots de passe :** Stockés en base sous forme de chaînes encodées en **Base64** (`base64_encode()`) dans la table `users`.
  - **Gravité :** **CRITIQUE**. Le Base64 n'est pas un algorithme de hachage cryptographique mais un simple format d'encodage réversible. Toute personne accédant à la base de données ou à une sauvegarde peut décoder l'intégralité des mots de passe en une fraction de seconde.
  - **Origine documentée :** Contrainte de compatibilité historique avec le système Delphi local (`Docs/SECURITY.md`, `Docs/BUSINESS_RULES.md`).
  - **Non-conformité légale :** Violation directe de l'obligation de sécurité de base prescrite par l'Art. 38 de la loi 18-07.
- **Gestion des sessions :** Utilisation d'un jeton aléatoire Bearer (`VARCHAR(64)`) stocké dans la table `sessions` et conservé côté client dans le `localStorage`.
  - Durée de vie : 30 jours (`TOKEN_EXPIRY = 2592000` secondes).
  - Vulnérabilité XSS : Le stockage de jetons de session d'une durée de 30 jours dans `localStorage` expose les comptes médecins et patients à un vol de session en cas d'injection de script.

### 10.2. Contrôle d'Accès (RBAC)
- Mis en œuvre de façon logicielle via `backend/middleware/AuthMiddleware.php`.
- Cloisonnement fonctionnel :
  - `patientOnly()` : réservé au rôle patient (`usertype = 0`).
  - `doctorOnly()` : réservé aux médecins (`usertype = 1`).
  - `adminOnly()` : réservé aux administrateurs (`usertype = 3`).
- **Faiblesse :** L'authentification repose uniquement sur le token en base. Pas de double facteur (2FA) pour les comptes praticiens manipulant des dossiers médicaux.

### 10.3. Journalisation et Traçabilité des Accès Médicaux
- **Exigence Loi 18-07 (Art. 38) & Loi 25-11 :** Obligation de tracer les accès, consultations, modifications et suppressions de données sensibles, particulièrement les données de santé, avec horodatage et identification précise de l'auteur de la consultation.
- **Constat dans TABIBI :**
  - **Journal d'audit médical :** **TOTALEMENT INEXISTANT.**
  - Aucune table `audit_logs` ou `access_logs` n'enregistre qui a consulté la fiche d'un patient, qui a lu ses constantes médicales, ou qui a accédé à l'historique des consultations.
  - Seules des métriques globales de synchronisation technique par lots sont enregistrées dans `sync_logs` (`CountProcessed`, `CountCreated`, etc.).

### 10.4. Chiffrement et Communications
- **HTTPS :** Activé en production sur `tabibi.dz`.
- **Chiffrement de la base au repos (Data at Rest) :** **NON MIS EN ŒUVRE.** La base MySQL stocke toutes les tables en clair sur le disque du serveur.

---

## 11. SYNTHÈSE DES MANQUEMENTS CONSTATÉS

Au regard des dispositions impératives de la **Loi n° 18-07** et de la **Loi n° 25-11 du 24 juillet 2025**, les manquements suivants sont formellement constatés :

1. **Défaut d'autorisation ANPDP pour les données de santé (Loi 18-07 Art. 17 & Loi 25-11) :** Absence de dossier de déclaration et d'autorisation pour le traitement des constantes vitales, motifs de consultation et notes cliniques.
2. **Absence de recueil du consentement exprès à l'inscription (Loi 18-07 Art. 6 & 7) :** Inscription de patients, médecins et cliniques sans aucune acceptation préalable des CGU ni de la politique de confidentialité.
3. **Défaut de preuve et d'horodatage du consentement lors de la réservation (Loi 25-11) :** La case à cocher de `Book.jsx` est un trompe-l'œil purement cosmétique, non transmise à l'API et non persistée en BDD. Absente totale dans `QuickAppointmentModal.jsx`.
4. **Absence totale de politique et de bandeau de consentement Cookies / Traceurs (Loi 18-07 Art. 32) :** Dépôt de jetons et traçage IP sans information préalable ni possibilité de refus.
5. **Absence de mécanisme d'exercice des droits (Loi 18-07 Art. 34 à 37) :** Impossibilité pour un utilisateur de supprimer son compte, de retirer son consentement ou d'exporter ses données.
6. **Mots de passe stockés en Base64 (Loi 18-07 Art. 38) :** Manquement grave à l'obligation de sécurité et de confidentialité des données à caractère personnel.
7. **Transfert illicite de données vers l'étranger sans autorisation (Loi 18-07 Art. 44) :** Routage de données personnelles et de santé via Gmail SMTP (`smtp.gmail.com`) et scripts Google OAuth.
8. **Absence de traçabilité des accès aux dossiers de santé (Loi 25-11) :** Aucun journal d'audit permettant de vérifier la légitimité des accès aux dossiers et constantes des patients.
9. **Absence de Mentions Légales et d'identification de la personne morale responsable :** Ni STELLARSOFT ni TABIBI ne disposent d'une identification juridique complète (RC, NIF, représentant légal, capital, adresse).
10. **Absence de contrat de sous-traitance / DPA avec les médecins et cliniques :** Les responsabilités respectives de la plateforme et des praticiens ne sont pas encadrées par un accord formel de traitement de données.

---

## 12. POINTS JURIDIQUEMENT INCERTAINS NÉCESSITANT VALIDATION PROFESSIONNELLE

L'audit technique et documentaire ne permet pas de trancher seul les questions suivantes, qui relèvent impérativement d'une décision de la direction et de conseils juridiques spécialisés en droit algérien :

1. **Qualification juridique exacte de la structure :**  
   *STELLARSOFT est-elle le "Responsable de Traitement" direct vis-à-vis des patients, ou un simple "Sous-traitant" agissant pour le compte des Médecins / Cliniques (qui seraient les véritables Responsables de Traitement) ?*  
   -> Nécessite la formalisation contractuelle des rôles selon l'article 3 de la loi 18-07.
2. **Statut de l'hébergement physique sous l'empire de la Loi 25-11 :**  
   *Le serveur actuel (`197.140.142.6`) est-il certifié comme hébergeur souverain sur le territoire national algérien répondant aux critères stricts de l'ANPDP pour l'e-santé ?*  
   -> Nécessite la production du contrat d'hébergement et de l'attestation de localisation physique des datacenters.
3. **Légalité de la conservation des constantes médicales (Poids, Tension, SpO2) :**  
   *La plateforme TABIBI a-t-elle vocation à être un simple outil de prise de rendez-vous (auquel cas ces données biométriques sont superflues et en violation du principe de minimisation Art. 5), ou un Dossier Médical Partagé (DMP) / plateforme de télémédecine (exigeant un agrément ministériel de santé) ?*  
   -> Décision stratégique et juridique obligatoire sur le périmètre fonctionnel.
4. **Désignation obligatoire d'un Délégué à la Protection des Données (DPO) :**  
   *Compte tenu du volume et de la sensibilité des données médicales traitées, la loi 25-11 rend-elle obligatoire la désignation et la notification d'un DPO auprès de l'ANPDP pour STELLARSOFT ?*
5. **Cadre contractuel de la synchronisation Delphi :**  
   *Quel accord lie STELLARSOFT aux cabinets médicaux utilisant le logiciel Delphi ? Qui est pénalement responsable en cas de compromission des données sur le poste local du médecin ?*

---

## 13. PLAN D'ACTIONS : ÉLÉMENTS À CRÉER ET MODIFIER ULTÉRIEUREMENT

*(Rappel : Aucun élément n'a été créé ni modifié au cours de cette phase d'audit. Ce plan constitue la feuille de route des phases ultérieures).*

### Phase A : Création des Documents et Pages Juridiques Manquants
- [ ] Rédiger et publier les **Mentions Légales complètes** (Identification société STELLARSOFT, Registre de Commerce, NIF, adresse, direction, hébergeur).
- [ ] Mettre à jour la **Politique de Confidentialité** pour intégrer explicitement la **Loi n° 25-11 du 24 juillet 2025**, la finalité exacte de chaque traitement, les flux Delphi, et la procédure formelle DPO.
- [ ] Rédiger les **Conditions Générales d'Utilisation (CGU) dédiées aux Praticiens et Cliniques** incluant un accord de sous-traitance de données (DPA conforme ANPDP).
- [ ] Créer une **Politique de Gestion des Cookies et Traceurs** avec module de recueil du consentement (Consent Banner).
- [ ] Compléter les traductions manquantes en langue française (`fr.json`) pour l'accord de confidentialité du rendez-vous.

### Phase B : Refonte des Consentements Applicatifs (Frontend & API)
- [ ] Ajouter une **checkbox obligatoire d'acceptation des CGU et Politique de Confidentialité** lors de la création de compte patient, médecin et clinique.
- [ ] Intégrer une étape d'acceptation des conditions lors de la connexion via Google OAuth.
- [ ] Intégrer l'accord de confidentialité dans la modale de réservation rapide (`QuickAppointmentModal.jsx`).
- [ ] Modifier la table `apointements` et l'API pour **sauvegarder la preuve d'acceptation** :
  - `consent_given` (BOOLEAN),
  - `consent_date` (DATETIME),
  - `consent_version` (VARCHAR),
  - `consent_ip` (VARCHAR).

### Phase C : Implémentation des Droits des Personnes (Droits Utilisateurs)
- [ ] Développer la fonctionnalité de **Suppression de compte (Droit à l'effacement)** avec anonymisation des rendez-vous passés et purge des données personnelles.
- [ ] Implémenter une fonction d'**Export des données personnelles** (format JSON / PDF sécurisé).
- [ ] Créer un formulaire dédié aux réclamations et demandes d'exercice des droits (Art. 34-37).

### Phase D : Sécurité, Hébergement et Souveraineté
- [ ] Remplacer impérativement le stockage des mots de passe en Base64 par un hachage cryptographique fort (`password_hash($pwd, PASSWORD_BCRYPT)`), en coordination avec le module Delphi.
- [ ] Remplacer l'envoi SMTP externe non autorisé (`smtp.gmail.com`) par une solution souveraine de messagerie hébergée localement en Algérie.
- [ ] Créer une table de **Journalisation des accès aux dossiers de santé** (`health_access_logs`) pour tracer chaque consultation de données sensibles par les professionnels de santé ou les administrateurs.
- [ ] Établir le dossier de déclaration et d'autorisation auprès de l'ANPDP.

---
*Rapport d'audit établi dans le respect strict des directives : aucune ligne de code métier n'a été altérée, aucun fichier de configuration n'a été modifié, aucun commit n'a été exécuté.*
