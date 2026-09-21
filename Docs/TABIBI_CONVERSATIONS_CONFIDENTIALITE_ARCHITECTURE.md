# TABIBI — ARCHITECTURE DE CONFIDENTIALITÉ DES CONVERSATIONS PATIENT ↔ MÉDECIN
> **Document de Référence Juridique & Technique**  
> **Plateforme :** TABIBI (Web React Vite, API REST PHP, MariaDB/MySQL)  
> **Date d'élaboration :** Septembre 2026  
> **Statut :** Document d'Analyse et de Spécification Préparatoire — Aucune modification de code ni de base de données effectuée à ce stade.  
> **Cadre Juridique de Référence :**  
> - **Loi n° 18-11 du 2 juillet 2018 relative à la santé** (*Journal Officiel n° 46 du 29 juillet 2018*).  
> - **Loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel** (*Journal Officiel n° 34 du 10 juin 2018*), modifiée et complétée par la **Loi n° 25-11 du 24 juillet 2025** (*Journal Officiel n° 50 du 27 juillet 2025*).  
> - **Code Pénal algérien** (Ordonnance n° 66-156 modifiée et complétée).  
> - **Autorité de Contrôle :** Autorité Nationale de Protection des Données à caractère Personnel (ANPDP - Algérie).

---

## SOMMAIRE

1. [Cadre Juridique Vérifié](#1-cadre-juridique-vérifié)
2. [Ce que TABIBI peut Légitimement Conserver](#2-ce-que-tabibi-peut-légitimement-conserver)
3. [Qui Peut Accéder à Quoi (Matrice RBAC)](#3-qui-peut-accéder-à-quoi-matrice-rbac)
4. [Modèle de Confidentialité en 5 Niveaux](#4-modèle-de-confidentialité-en-5-niveaux)
5. [Gestion des Signalements et Litiges](#5-gestion-des-signalements-et-litiges)
6. [Procédure d'Accès Exceptionnel Interne](#6-procédure-daccès-exceptionnel-interne)
7. [Traitement des Réquisitions d'Autorités Judiciaires](#7-traitement-des-réquisitions-dautorités-judiciaires)
8. [Conservation et Durées](#8-conservation-et-durées)
9. [Droits des Personnes Concernées (Effacement, Opposition, Rectification)](#9-droits-des-personnes-concernées)
10. [Chiffrement au Repos des Messages](#10-chiffrement-au-repos-des-messages)
11. [Journalisation et Traçabilité Inviolable](#11-journalisation-et-traçabilité-inviolable)
12. [Architecture Cible Proposée](#12-architecture-cible-proposée)
13. [Impact sur le Code Existant](#13-impact-sur-le-code-existant)
14. [Risques Juridiques Restant à Valider (Avocat / ANPDP)](#14-risques-juridiques-restant-à-valider-avocat--anpdp)
15. [Plan d'Implémentation par Étapes](#15-plan-dimplémentation-par-étapes)

---

## 1. CADRE JURIDIQUE VÉRIFIÉ

Pour chaque disposition légale retenue, la grille d'analyse obligatoire est appliquée rigoureusement.

### 1.1. Secret des Informations Médicales et Respect de la Vie Privée
- **Texte légal précis :** Loi n° 18-11 du 2 juillet 2018 relative à la santé (*J.O. n° 46 du 29 juillet 2018*).
- **Article :** **Article 24**.
- **Ce que le texte dit réellement :**  
  > *« L'usager des services de santé a droit au respect de sa vie privée et au secret des informations le concernant.  
  > Ce secret s'impose à tous les professionnels de santé ainsi qu'à toute personne intervenant à quelque titre que ce soit dans l'organisation, le fonctionnement ou l'administration des structures et établissements de santé, sauf dans les cas où la loi en dispose autrement. »*
- **Conséquence pour TABIBI :**  
  Le propriétaire, l'exploitant technique (STELLARSOFT), les administrateurs et les agents de support technique de TABIBI interviennent directement dans l'organisation et le fonctionnement technique de la communication médicale. Ils sont donc **légalement et pénalement tenus au secret médical** au même titre que le personnel administratif d'un établissement de soins. Ils ont l'interdiction formelle de prendre connaissance du contenu des échanges cliniques. L'accès libre ou permanent au texte des messages constitue une violation directe de cette obligation d'ordre public.
- **Niveau de certitude :** **CERTAIN**.

### 1.2. Répression Pénale de la Violation du Secret Professionnel
- **Texte légal précis :** Code Pénal algérien (Ordonnance n° 66-156 modifiée et complétée).
- **Article :** **Article 301**.
- **Ce que le texte dit réellement :**  
  > *« Les médecins, chirurgiens, pharmaciens, sages-femmes et toutes autres personnes dépositaires, par état ou profession ou par fonctions temporaires ou permanentes, des secrets qu'on leur confie, qui, hors le cas où la loi les oblige ou les autorise à se porter dénonciateurs, ont révélé ces secrets, sont punis d'un emprisonnement d'un (1) mois à six (6) mois et d'une amende de 20.000 DA à 100.000 DA. »*
- **Conséquence pour TABIBI :**  
  Tout employé, développeur, administrateur système ou dirigeant accédant indûment ou divulguant le contenu d'une conversation médicale engage sa responsabilité pénale personnelle (peine d'emprisonnement et amende), indépendamment de la responsabilité civile de la société exploitante.
- **Niveau de certitude :** **CERTAIN**.

### 1.3. Régime Spécial des Données Sensibles et Données de Santé
- **Texte légal précis :** Loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel (*J.O. n° 34 du 10 juin 2018*).
- **Articles :** **Article 8** et **Article 10**.
- **Ce que le texte dit réellement :**  
  - **Article 8 :** Interdit par principe le traitement des données à caractère personnel qui révèlent l'origine raciale ou ethnique, les opinions politiques, les convictions religieuses, l'appartenance syndicale, ainsi que le traitement des **données relatives à la santé**.
  - **Article 10 :**  
    > *« L'interdiction prévue à l'article 8 ne s'applique pas lorsque le traitement des données est nécessaire à la médecine préventive, aux diagnostics médicaux, à l'administration de soins ou de traitements, ou à la gestion de services de santé et que ces données sont traitées par un praticien de la santé soumis au secret professionnel ou par une autre personne soumise également à une obligation de secret. »*
- **Conséquence pour TABIBI :**  
  L'hébergement et le routage des messages entre un patient et un médecin constituent un traitement de données de santé au sens de la loi. Ce traitement n'est licite que s'il est strictement cantonné aux finalités de soins et d'organisation médicale, et à condition que toute personne ayant accès à l'infrastructure soit assujettie au secret (Art. 24 Loi 18-11). Tout accès pour d'autres finalités (ex. modération éditoriale non sollicitée, curiosité, ciblage) est illégal.
- **Niveau de certitude :** **CERTAIN**.

### 1.4. Principe de Finalité et de Minimisation
- **Texte légal précis :** Loi n° 18-07 du 10 juin 2018.
- **Article :** **Article 4 (alinéas 2 et 3)**.
- **Ce que le texte dit réellement :**  
  Les données doivent être :  
  - *« collectées pour des finalités déterminées, explicites et légitimes, et ne pas être traitées ultérieurement de manière incompatible avec ces finalités »* (Art. 4-2°).  
  - *« adéquates, pertinentes et non excessives au regard des finalités pour lesquelles elles sont collectées et traitées ultérieurement »* (Art. 4-3° - Minimisation).
- **Conséquence pour TABIBI :**  
  Pour assurer le fonctionnement technique du service et la maintenance de l'infrastructure, l'administration de TABIBI n'a besoin que des **métadonnées de transmission** (horodatage, expéditeur, destinataire, volume, statut de délivrance). L'accès au corps rédactionnel du message est excessif et viole le principe de minimisation.
- **Niveau de certitude :** **CERTAIN**.

### 1.5. Confidentialité et Sécurité du Traitement
- **Texte légal précis :** Loi n° 18-07 du 10 juin 2018.
- **Articles :** **Article 12**, **Article 13** et **Article 14**.
- **Ce que le texte dit réellement :**  
  - **Article 12 :** Toute personne agissant sous l'autorité du responsable du traitement ou de celle du sous-traitant ne doit accéder aux données que sur instruction de celui-ci et sous le respect strict de la confidentialité.  
  - **Article 13 :** Le responsable du traitement met en œuvre les mesures techniques et organisationnelles appropriées pour protéger les données contre la destruction accidentelle ou illicite, la perte accidentelle, l'altération, la diffusion ou l'accès non autorisés.  
  - **Article 14 :** En cas de traitement confié à un sous-traitant, un contrat ou un acte juridique écrit doit lier le sous-traitant au responsable du traitement.
- **Conséquence pour TABIBI :**  
  L'architecture technique doit intégrer des barrières d'accès effectives (contrôle d'accès logique RBAC, chiffrement au repos, séparation des privilèges) garantissant que les personnes sous l'autorité de TABIBI ne puissent pas intercepter ou lire les messages.
- **Niveau de certitude :** **CERTAIN**.

### 1.6. Obligation d'Autorisation Préalable auprès de l'ANPDP
- **Texte légal précis :** Loi n° 18-07 du 10 juin 2018.
- **Article :** **Article 17 (alinéa 1)**.
- **Ce que le texte dit réellement :**  
  Les traitements portant sur les données génétiques, biométriques et les **données de santé** sont soumis à l'**autorisation préalable** de l'Autorité Nationale (ANPDP).
- **Conséquence pour TABIBI :**  
  La fonctionnalité de messagerie médicale Patient ↔ Médecin doit figurer explicitement dans la demande d'autorisation déposée auprès de l'ANPDP, avec description précise des mesures de sécurité garantissant l'étanchéité des communications vis-à-vis des administrateurs.
- **Niveau de certitude :** **CERTAIN**.

### 1.7. Droit à l'Information des Utilisateurs
- **Texte légal précis :** Loi n° 18-07 du 10 juin 2018.
- **Article :** **Article 32**.
- **Ce que le texte dit réellement :**  
  La personne concernée doit être préalablement et expressément informée de l'identité du responsable du traitement, des finalités précises du traitement, des destinataires ou catégories de destinataires, de ses droits d'accès, de rectification et d'opposition, ainsi que de la durée de conservation des données.
- **Conséquence pour TABIBI :**  
  Les utilisateurs (patients et médecins) doivent être formellement informés dans la Politique de Confidentialité et au sein de l'interface de messagerie :  
  1. Que leurs échanges sont strictement confidentiels entre eux et leur praticien.  
  2. Que l'administration de TABIBI n'a pas accès au contenu.  
  3. Des règles d'archivage, de signalement et de fourniture légale aux autorités.
- **Niveau de certitude :** **CERTAIN**.

---

## 2. CE QUE TABIBI PEUT LÉGITIMEMENT CONSERVER

En application stricte des principes de finalité (Art. 4-2°) et de minimisation (Art. 4-3°), la distinction entre données d'acheminement et données de santé doit être absolue.

| Donnée / Élément | Nature | TABIBI peut-il le conserver ? | Base légale & Finalité légitime | Niveau d'accès Admin |
| :--- | :--- | :---: | :--- | :--- |
| **Identifiant du ticket (`id`)** | Métadonnée technique | **OUI** | Acheminement et intégrité de la base relationnelle | Consultation autorisée |
| **Identifiants participants (`patient_id`, `doctor_id`, `clinic_id`)** | Donnée d'annuaire / routage | **OUI** | Identification des interlocuteurs pour la remise du message | Consultation autorisée |
| **Horodatages (`created_at`, `updated_at`)** | Métadonnée de session | **OUI** | Chronologie, ordonnancement et traçabilité de transmission | Consultation autorisée |
| **Statut (`status`: OPEN, PENDING, CLOSED)** | Métadonnée d'état | **OUI** | Gestion du cycle de vie applicatif | Consultation autorisée |
| **Indicateur de lecture (`is_read`)** | Métadonnée d'état | **OUI** | Notification de délivrance pour l'expéditeur | Consultation autorisée |
| **Objet du ticket (`subject`)** | Métadonnée d'orientation | **OUI (Restreint)** | Indexation de l'échange. *Recommandation : inciter à un libellé administratif non médical* | Consultation limitée |
| **Corps du message (`ticketmessages.message`)** | **Donnée de santé confidentielle** | **OUI (en stockage scellé)** | Finalité exclusive de transmission au destinataire et maintien de l'historique de soins | **AUCUN ACCÈS COURANT** |
| **Pièces jointes / Photos médicales éventuelles** | **Donnée de santé sensible** | **OUI (en stockage scellé)** | Finalité exclusive de diagnostic et suivi médical | **AUCUN ACCÈS COURANT** |
| **Adresses IP et empreintes de connexion** | Journal technique | **OUI** | Sécurité informatique et détection des intrusions (Loi 09-04) | Consultation sous conditions |

### Règle Fondamentale :
TABIBI n'est pas "propriétaire" du contenu des messages. TABIBI agit en tant que **dépositaire technique et intermédiaire de transmission**. La conservation en base n'a qu'un seul objectif légitime : permettre au patient et à son médecin de retrouver l'historique de leur relation médicale et assurer la continuité des soins.

---

## 3. QUI PEUT ACCÉDER À QUOI (MATRICE RBAC)

La matrice de contrôle d'accès basée sur les rôles (RBAC) doit être étanche :

```
[Patient] ───────────────► Accès complet à SES propres tickets uniquement
[Médecin] ───────────────► Accès complet aux tickets de SES patients uniquement
[Clinique] ──────────────► Accès complet aux tickets adressés à SA clinique uniquement
[Admin TABIBI] ──────────► Métadonnées uniquement (Statuts, dates, compteurs, IDs)
                            ❌ ACCÈS INTERDIT au texte des messages
[Support Administratif] ─► Gère UNIQUEMENT le module séparé `admin_support_tickets`
```

### Grille des Droits d'Accès Applicatifs :

| Rôle Utilisateur | Liste des tickets (`list`) | Consultation détail (`get`) | Lecture du message (`message`) | Réponse (`reply`) | Clôture (`close`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Patient (`usertype = 0`)** | Ses tickets uniquement | Ses tickets uniquement | **OUI (en clair)** | OUI | OUI |
| **Médecin (`usertype = 1`)** | Ses tickets uniquement | Ses tickets uniquement | **OUI (en clair)** | OUI | OUI |
| **Clinique (`usertype = 2`)** | Tickets de sa clinique | Tickets de sa clinique | **OUI (en clair)** | OUI | OUI |
| **Admin TABIBI (`usertype = 3`)** | Métadonnées globales | Métadonnées uniquement | ❌ **NON (Masqué / Bloqué)** | ❌ **NON** | OUI (technique) |
| **Support TABIBI (`usertype = 4`)** | ❌ **NON** | ❌ **NON** | ❌ **NON** | ❌ **NON** | ❌ **NON** |

---

## 4. MODÈLE DE CONFIDENTIALITÉ EN 5 NIVEAUX

Pour concilier les impératifs de secret médical, d'administration technique et de sécurité publique, l'architecture cible est organisée en **5 niveaux étanches** :

```
┌────────────────────────────────────────────────────────────────────────┐
│ NIVEAU 1 : Patient ↔ Médecin (Échange clinique privé)                 │
│ ➔ Accès au contenu réservé strictement aux deux parties prenantes.     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ NIVEAU 2 : Administration & Support Technique                          │
│ ➔ Métadonnées techniques uniquement. Contenu textuel médical scellé.   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ NIVEAU 3 : Signalement / Litige (Patient ou Médecin déclencheur)       │
│ ➔ Création d'un dossier administratif distinct. Gel conservatoire.    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ NIVEAU 4 : Accès Exceptionnel Interne (Procédure scellée & justifiée)  │
│ ➔ Déverrouillage exceptionnel audité : motif légal + journal immuable.│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ NIVEAU 5 : Réquisition d'une Autorité Judiciaire Compétente            │
│ ➔ Remise sur réquisition légale authentifiée. Procédure hors-bande.   │
└────────────────────────────────────────────────────────────────────────┘
```

### Détail des Niveaux :

- **Niveau 1 (Opérationnel Clinique) :**  
  Le patient et le médecin échangent librement. Le chiffrement applicatif au repos garantit que même un dump brut de la base MySQL ne révèle pas les textes en clair.
- **Niveau 2 (Supervision Technique) :**  
  L'administrateur système dispose d'une vue synthétique : nombre total de messages échangés, état du serveur, messages en attente d'acheminement, taux d'erreurs HTTP. Le contenu textuel est remplacé dans les vues d'administration par `[Contenu médical confidentiel - Art. 24 Loi 18-11]`.
- **Niveau 3 (Contentieux & Signalement) :**  
  Permet aux utilisateurs de signaler un comportement répréhensible sans exposer préventivement l'ensemble des autres conversations.
- **Niveau 4 (Contrôle d'Exception Tracé) :**  
  Mécanisme d'ouverture sous contrainte stricte lorsqu'un impératif vital ou un dossier de signalement formel l'exige.
- **Niveau 5 (Conformité Légale Réquisition) :**  
  Processus encadré de réponse aux mandats de justice.

---

## 5. GESTION DES SIGNALEMENTS ET LITIGES

Lorsqu'un différend survient entre un patient et un médecin (ex. menaces, harcèlement, usurpation d'identité, propos injurieux, refus de soins caractérisé), le système doit permettre une prise en charge administrative **sans briser le secret des autres conversations**.

### 5.1. Déclenchement du Signalement
1. Le patient ou le médecin dispose dans l'interface de discussion d'un bouton **"Signaler cet échange"**.
2. L'utilisateur sélectionne un motif prédéfini :
   - Propos injurieux / diffamatoires / menaçants ;
   - Harcèlement ou sollicitation illicite ;
   - Usurpation d'identité médicale ;
   - Danger imminent pour une personne physique ;
   - Autre manquement grave.
3. L'utilisateur saisit une explication factuelle et valide le signalement.

### 5.2. Conséquences Techniques Immédiates
1. **Création d'un dossier administratif distinct :**  
   Le signalement génère un ticket dans le module [`admin_support_tickets`](file:///c:/xampp/htdocs/tabibi/Docs/TABIBI_SUPPORT_ADMIN_AUDIT.md) avec la catégorie `'report'` (`Signalement`). Ce ticket contient les déclarations de l'auteur du signalement, son identité, la date et la référence du ticket médical contesté.
2. **Gel Conservatoire (*Legal Hold*) :**  
   - Le ticket médical concerné reçoit un drapeau technique `is_flagged = 1` et un horodatage `flagged_at = NOW()`.
   - **Règle absolue :** Tout mécanisme de purge automatique ou de demande unilatérale de suppression de compte est **suspendu** pour les messages associés à ce ticket pendant toute la durée de traitement du signalement.
   - Les preuves d'horodatage, les empreintes de messages et les métadonnées de connexion sont figées.
3. **Information des Parties :**  
   L'auteur du signalement reçoit un accusé de réception confirmant l'ouverture d'un dossier d'enquête administrative par TABIBI.

---

## 6. PROCÉDURE D'ACCÈS EXCEPTIONNEL INTERNE

L'administrateur de TABIBI ne doit en aucun cas pouvoir "naviguer" ou "fouiller" dans les conversations à sa convenance. Un accès exceptionnel ne peut intervenir que dans des circonstances extrêmes et formellement documentées.

### 6.1. Cas Exclusifs Autorisant un Accès Exceptionnel
1. **Signalement formel validé :** Instruction d'un signalement grave déposé par l'une des parties (Niveau 3).
2. **Sauvegarde de la vie humaine (*Danger Vital Imminent*) :** En application de l'**Article 7 (alinéa 4) de la Loi 18-07** (*« la sauvegarde de la vie de la personne concernée »*), lorsqu'un message signale un risque de suicide imminent ou une menace directe contre l'intégrité corporelle.
3. **Incident technique majeur de corruption de données :** Demande expresse et écrite du médecin ou du patient demandant la restauration ou le déblocage technique d'un échange corrompu.

### 6.2. Conditions Techniques et Managériales Obligatoires
Pour qu'un accès exceptionnel soit déverrouillé au niveau applicatif :
1. **Double validation (Quatre Yeux) :**  
   L'accès requiert l'autorisation conjointe de deux administrateurs habilités (ou du Délégué à la Protection des Données / Responsable Légal et de l'Administrateur Système).
2. **Obligation de Saisie des Métadonnées Justificatives :**  
   L'opérateur doit renseigner obligatoirement dans le système :
   - Son identité authentifiée (`admin_id`) ;
   - Le numéro de dossier support/signalement rattaché (`admin_support_ticket_id`) ;
   - Le motif légal précis et circonstancié ;
   - L'identifiant strict du ticket médical ciblé (interdiction absolue de déverrouillage par lot ou global).
3. **Périmètre Restreint :**  
   L'accès n'est accordé que pour une durée limitée (session temporaire expirant après 15 minutes) et pour le seul ticket concerné.
4. **Journalisation Automatique Inviolable :**  
   Chaque affichage de message exceptionnel génère une écriture immédiate dans la table `audit_access_logs`.

---

## 7. TRAITEMENT DES RÉQUISITIONS D'AUTORITÉS JUDICIAIRES

### 7.1. Clarification Juridique Fondamentale
> [!CAUTION]
> **Règle Impérative :**  
> Un champ texte `requisition_ref` saisi dans une interface Web par un administrateur ne constitue **EN AUCUN CAS** une autorisation juridique, ni un substitut légal à un acte de procédure.  
> TABIBI ne doit jamais implémenter un "bouton magique" permettant à n'importe quel administrateur de déchiffrer des conversations sous prétexte d'avoir tapé un faux numéro de réquisition dans un formulaire.

### 7.2. Cadre Procédural Légal en Algérie
En vertu du **Code de Procédure Pénale algérien** et de la **Loi n° 09-04 du 5 août 2009 portant règles particulières relatives à la prévention et à la lutte contre les infractions liées aux technologies de l'information et de la communication** :
- Une autorité publique ne peut exiger la communication de correspondances électroniques privées que dans le cadre d'une procédure judiciaire formelle :
  - **Réquisition Judiciaire** émise par un Officier de Police Judiciaire (OPJ) agissant sur délégation ou instructions du Procureur de la République ;
  - **Ordonnance ou Mandat** d'un Juge d'Instruction ;
  - **Jugement / Décision exécutoire** d'une juridiction compétente.

### 7.3. Procédure Matérielle Externe Obligatoire
1. **Réception et Contrôle de Légalité :**  
   - La réquisition doit parvenir sous forme d'un document officiel original écrit, comportant l'en-tête de l'autorité requérante, le cachet humide, la signature du magistrat ou de l'OPJ habilité, la base légale de la réquisition et le périmètre exact des données requises (identifiant de compte, plage de dates).
   - Le Responsable Légal de STELLARSOFT/TABIBI vérifie l'authenticité de la réquisition.
2. **Enregistrement au Registre Physique des Réquisitions :**  
   La réquisition est archivée dans un classeur sécurisé sous clé avec attribution d'un numéro d'ordre interne.
3. **Extraction Sécurisée Hors-Ligne (Offline Script) :**  
   - L'extraction n'est pas réalisée via une interface Web publique.
   - Elle est exécutée via une commande administrative scellée côté serveur (CLI en environnement sécurisé), restreinte aux stricts éléments visés par la décision judiciaire.
4. **Remise Scellée :**  
   Les données extraites (transcriptions chiffrées/déchiffrées, métadonnées) sont gravées sur support chiffré ou remises en main propre sous pli scellé contre récépissé de décharge signé par l'autorité judiciaire.
5. **Principe du Secret Médical en Justice :**  
   Dans le cas de données couvertes par le secret médical, leur versement au dossier judiciaire fait l'objet de procédures particulières (souvent sous la surveillance d'un médecin expert assermenté désigné par le tribunal ou en présence d'un représentant du Conseil de l'Ordre des Médecins).

---

## 8. CONSERVATION ET DURÉES

### 8.1. Analyse des Textes Applicables
- **Article 4 (alinéa 5) de la Loi 18-07 :**  
  > *« Les données doivent être conservées sous une forme permettant l'identification des personnes concernées pendant une durée n'excédant pas celle nécessaire aux finalités pour lesquelles elles sont collectées et traitées. »*
- **Textes spécifiques Santé (Algérie) :**  
  Il n'existe pas actuellement dans la réglementation algérienne un décret fixant un nombre exact d'années de conservation pour les messageries de télésanté ou d'intermédiation privée (contrairement au dossier médical hospitalier papier ou au droit comparé fixant 20 ans).

### 8.2. Règles de Conservation Retenues pour TABIBI

| Catégorie de Données | Durée en Base Active | Durée en Archivage Intermédiaire | Justification & Destination | Statut Juridique |
| :--- | :--- | :--- | :--- | :--- |
| **Conversations courantes Patient ↔ Médecin** | Tant que le compte patient et le compte médecin sont actifs | 3 à 5 ans après la dernière interaction | Continuité de la prise en charge et suivi médical | **À CONFIRMER JURIDIQUEMENT** auprès de l'ANPDP |
| **Conversations avec Signalement (Litige)** | Durée du traitement du signalement | Jusqu'à extinction des délais de prescription (pénale : 3 ans ; civile : 15 ans) | Conservation des preuves en cas d'action judiciaire | **CERTAIN** (Prescription légale) |
| **Tickets de Support Administratif TABIBI** | 24 mois après clôture | 5 ans | Preuve de gestion contractuelle et réclamations | **À CONFIRMER JURIDIQUEMENT** |
| **Journaux d'accès et d'audit (`audit_access_logs`)** | 12 mois minimum | 3 ans | Sécurité des SI, traçabilité des accès aux données de santé | Recommandation standard ANPDP |
| **Adresses IP et logs de connexion (`sessions`, `visits`)** | 6 mois à 12 mois | Purge automatique | Détection d'attaques et lutte contre la cybercriminalité | Standard légal TIC |

---

## 9. DROITS DES PERSONNES CONCERNÉES

### 9.1. Droit d'Accès (Article 34 Loi 18-07)
- Le patient a le droit d'accéder à l'ensemble de ses messages envoyés et reçus.
- Cette consultation s'effectue directement depuis son compte dans l'interface `/tickets`.
- La fonctionnalité d'export de données personnelles (`handleDownloadData`) doit inclure les messages rédigés par le patient, mais exclure les données internes de modération ou les identifiants techniques tiers.

### 9.2. Droit de Rectification (Article 35 Loi 18-07)
- **Règle Médicale :** Un message médical envoyé et lu par le médecin **ne peut pas être modifié rétroactivement** ni altéré dans son contenu textuel, afin de préserver la loyauté de la traçabilité médicale.
- En cas d'erreur factuelle, le patient doit envoyer un message rectificatif venant s'ajouter chronologiquement à la suite du fil de discussion.

### 9.3. Droit à l'Effacement (Suppression de Compte) vs Obligation de Preuve
- **Problématique Juridique :**  
  Si un patient supprime son compte en application de l'Article 35 de la Loi 18-07, a-t-il le droit d'exiger la destruction totale et immédiate de tous ses messages envoyés aux médecins ?
- **Réponse Juridique :**  
  **NON, pas de destruction intégrale unilatérale.**  
  En vertu de l'**Article 36 (alinéa 2) de la Loi 18-07** et des obligations déontologiques médicales, le médecin a le droit et le devoir de conserver la trace des actes, avis et échanges cliniques ayant justifié ses prescriptions ou orientations, pour assurer sa défense en cas de mise en cause de sa responsabilité médicale.
- **Solution Technique Appliquée (Déjà validée en Phase 02D) :**  
  - **Anonymisation du compte patient :** Le profil du patient est anonymisé (`fullname = '[Compte supprimé]'`, coordonnées purgées).  
  - **Dissociation :** Les messages restent visibles dans l'historique du médecin praticien, mais dissociés des données de contact directes de l'ancien patient.  
  - **Exception Signalement en cours :** Si le fil de discussion fait l'objet d'un signalement actif (Niveau 3), l'anonymisation est suspendue jusqu'à décision du support ou de l'autorité compétente.

---

## 10. CHIFFREMENT AU REPOS DES MESSAGES

### 10.1. Analyse d'Opportunité et de Nécessité
- Le stockage en texte clair (`plain text`) des messages médicaux dans la table MySQL `ticketmessages` constitue une vulnérabilité critique en cas de :
  1. Compromission d'un compte d'administration de la base de données (cPanel / phpMyAdmin) ;
  2. Fuite ou sauvegarde non chiffrée de la base de données (`dump.sql`) ;
  3. Intrusion sur le serveur physique ou virtuel de l'hébergeur.
- Le chiffrement au repos applicatif est une mesure de sécurité technique directement exigée par l'**Article 13 de la Loi 18-07**.

### 10.2. Spécification Cryptographique Recommandée
- **Algorithme retenu :** **AES-256-GCM** (*Galois/Counter Mode*).  
  - Fournit à la fois la **confidentialité** des données et l'**authenticité/intégrité** du message (AEAD - *Authenticated Encryption with Associated Data*).
  - Empêche toute altération silencieuse des données en base (un message modifié frauduleusement dans MySQL est immédiatement rejeté au déchiffrement).
- **Gestion des Éléments Cryptographiques :**
  - **Clé de chiffrement (`CHAT_ENCRYPTION_KEY`) :** Clé binaire pseudo-aléatoire de 256 bits (32 octets), encodée en hexadécimal (64 caractères hex) ou base64.
  - **Localisation de la clé :** Strictement stockée dans le fichier d'environnement serveur [`backend/.env`](file:///c:/xampp/htdocs/tabibi/backend/.env) (externalisé en Phase 05B).  
    ❌ **JAMAIS** codée en dur dans les fichiers PHP.  
    ❌ **JAMAIS** versionnée dans Git.  
    ❌ **JAMAIS** stockée dans la base de données MySQL à côté des messages.  
    ❌ **JAMAIS** transmise au frontend React.
  - **Vecteur d'Initialisation (IV / Nonce) :**  
    - Longueur standard GCM : **12 octets (96 bits)**.  
    - Généré de manière cryptographiquement sûre à chaque écriture via `random_bytes(12)`.  
    - ❌ **JAMAIS** réutilisé pour deux messages distincts avec la même clé.
  - **Tag d'Authentification (Auth Tag) :**  
    - Longueur standard : **16 octets (128 bits)** générés automatiquement par `openssl_encrypt`.
  - **Format de Stockage dans `ticketmessages.message` :**  
    Chaîne préfixée par un identifiant de version cryptographique permettant les évolutions futures :  
    `$enc$v1$<base64(iv . tag . ciphertext)>`
- **Rétrocompatibilité :**  
  Le déchiffreur vérifie le préfixe `$enc$v1$`. Si le message en base ne contient pas ce préfixe, il est considéré comme un message historique hérité (*legacy*) et restitué en texte clair sans erreur.

### 10.3. Limite Fondamentale du Chiffrement Applicatif
> [!IMPORTANT]
> Le chiffrement au repos protège les données au repos sur le disque. Cependant, si l'application PHP possède la clé et sert les données déchiffrées à un administrateur connecté, le chiffrement est transparent et inopérant pour empêcher l'espionnage administratif.  
> **Le chiffrement ne remplace pas le contrôle d'accès (RBAC) au niveau applicatif.** Les deux couches doivent coexister.

---

## 11. JOURNALISATION ET TRAÇABILITÉ INVIOLABLE

Toute tentative ou action touchant aux conversations doit faire l'objet d'un audit scellé.

### Structure Recommandée de la Table d'Audit : `conversation_audit_logs`

| Colonne | Type SQL | Rôle et Contenu |
| :--- | :--- | :--- |
| `id` | `CHAR(36)` | Identifiant UUID v4 unique de l'événement |
| `ticket_id` | `CHAR(36)` | Référence du ticket médical concerné |
| `actor_user_id` | `CHAR(36)` | Identifiant du compte utilisateur ou administrateur ayant agi |
| `actor_role` | `VARCHAR(20)` | Rôle de l'acteur (`patient`, `doctor`, `admin`, `system`) |
| `action_type` | `VARCHAR(50)` | Nature de l'action (`VIEW_CONVERSATION`, `FLAG_CONVERSATION`, `EXCEPTIONAL_ACCESS_ATTEMPT`, `EXCEPTIONAL_ACCESS_GRANTED`, `CLOSE_TICKET`) |
| `justification` | `TEXT` | Motif obligatoire renseigné en cas d'accès exceptionnel (NULL en cas d'accès patient/médecin standard) |
| `support_ticket_id`| `CHAR(36)` | Référence du dossier administratif associé (Niveau 3/4) |
| `ip_address` | `VARCHAR(45)` | Adresse IP de l'opérateur (v4 ou v6) |
| `user_agent` | `VARCHAR(255)`| Signature du navigateur / client |
| `created_at` | `DATETIME` | Horodatage inaltérable (`CURRENT_TIMESTAMP`) |

### Règles de Traçabilité :
1. **Append-Only :** La table `conversation_audit_logs` ne dispose d'aucun endpoint ni méthode `UPDATE` ou `DELETE`. Les écritures sont définitives.
2. **Alerting Administrateur :** Tout déclenchement d'un `EXCEPTIONAL_ACCESS_GRANTED` envoie une notification immédiate par email de sécurité aux dirigeants de STELLARSOFT.

---

## 12. ARCHITECTURE CIBLE PROPOSÉE

### Schéma des Flux Applicatifs :

```
                                 ┌───────────────────────┐
                                 │   Patient & Médecin   │
                                 └───────────┬───────────┘
                                             │
                                             │ Auth Bearer + RBAC
                                             ▼
                               ┌───────────────────────────┐
                               │   TicketController.php    │
                               │  (Vérification d'accès)   │
                               └─────────────┬─────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
         Écriture (create/reply)                     Lecture (get/list)
                       │                                           │
                       ▼                                           ▼
         ┌───────────────────────────┐               ┌───────────────────────────┐
         │     CryptoHelper.php      │               │     CryptoHelper.php      │
         │ Chiffrement AES-256-GCM   │               │ Déchiffrement AES-256-GCM │
         │ Clé hors code (.env)      │               │ Validation du Tag AEAD    │
         └─────────────┬─────────────┘               └─────────────▲─────────────┘
                       │                                           │
                       ▼                                           │
        ┌─────────────────────────────┐                            │
        │ Base MySQL `ticketmessages` │────────────────────────────┘
        │   $enc$v1$<iv.tag.cipher>   │
        └─────────────────────────────┘
                       ▲
                       │
        ═══════════════╪═══════════════════════════════════════════════════
                       │  BARRIÈRE DE SÉCURITÉ ADMINISTRATIVE
                       │
        ┌──────────────┴──────────────┐
        │   Admin & Support TABIBI    │
        │                             │
        │ ❌ get() / list() bloqué    │
        │ ❌ lecture message bloquée  │
        │ ❌ réponse interdite        │
        │                             │
        │ ✔ Accès métadonnées         │
        │ ✔ admin_support_tickets     │
        └─────────────────────────────┘
```

---

## 13. IMPACT SUR LE CODE EXISTANT

L'audit détaillé du code source met en évidence les ajustements techniques nécessaires lors des futures phases d'implémentation :

### 13.1. `backend/controllers/TicketController.php`
1. **Suppression du privilège de consultation globale dans `list()` (Lignes 229 à 247) :**  
   Retirer le bloc autorisant `usertype == 3` (Admin) et `usertype == 4` (Support) à récupérer la liste de tous les tickets médicaux et leurs derniers messages. Les orienter vers `AdminSupportTicketController`.
2. **Verrouillage strict de `get(string $id)` (Lignes 289 à 291) :**  
   Remplacer `$isAllowed = true; // Admin & Support have full access` par un refus formel `Response::error("Accès interdit : les conversations médicales sont strictement confidentielles entre le patient et le médecin.", 403)`.
3. **Suppression du rôle de réponse `'admin'` dans `reply()` (Lignes 357 à 360) :**  
   Interdire aux administrateurs de poster un message dans un ticket médical. Si un échange avec l'administration est nécessaire, il s'opère via le support administratif.
4. **Intégration du composant cryptographique :**  
   Appeler `CryptoHelper::encrypt()` avant l'insertion dans `ticketmessages`, et `CryptoHelper::decrypt()` lors de la restitution des messages au patient ou au praticien.

### 13.2. Frontend React (`frontend/src/App.jsx`)
1. **Écran `TicketsPage` (Ligne 7537) :**  
   Vérifier que cette vue n'est accessible qu'aux types d'utilisateurs autorisés (`user.user_type === 0` pour Patient, `user.user_type === 1` pour Médecin, `user.user_type === 2` pour Clinique). Rediriger automatiquement les administrateurs vers `/support-tickets` ou `/admin`.
2. **Bouton de Signalement :**  
   Ajouter dans l'en-tête de discussion de `TicketsPage` un bouton discret permettant de déclencher le flux de signalement (Niveau 3).

### 13.3. Base de Données
- Aucun changement destructif.
- Ajout prévu de la table `conversation_audit_logs`.
- Ajout des colonnes de gel conservatoire sur `tickets` : `is_flagged` (tinyint default 0), `flagged_at` (datetime nullable).

---

## 14. RISQUES JURIDIQUES RESTANT À VALIDER (AVOCAT / ANPDP)

Les points suivants constituent des zones où la législation algérienne ne fournit pas de durée chiffrée explicite ou nécessite un arbitrage officiel :

1. **Durée de conservation maximale de l'archivage intermédiaire des messages de télé-échange :**  
   *Question à valider :* L'ANPDP exige-t-elle une purge obligatoire des conversations médicales après 1 an, 3 ans ou 5 ans à compter de la clôture du ticket, ou admet-elle un alignement sur la prescription civile de 15 ans du Code Civil algérien ?  
   *Statut :* **À CONFIRMER JURIDIQUEMENT PAR L'ANPDP**.
2. **Portée exacte de la qualification de "plateforme d'intermédiation" :**  
   *Question à valider :* Confirmation formelle de l'exonération de responsabilité civile de STELLARSOFT concernant les prescriptions ou avis médicaux émis par les médecins dans la messagerie, sous réserve de non-ingérence dans le contenu (statut d'hébergeur / intermédiaire technique).  
   *Statut :* **À VALIDER PAR AVOCAT EN DROIT ALGÉRIEN**.
3. **Forme contractuelle de l'accord de sous-traitance (DPA - Art. 14 Loi 18-07) :**  
   *Question à valider :* Les Conditions Générales d'Utilisation Médecins signées électroniquement suffisent-elles à constituer le contrat de sous-traitance exigé par l'Article 14 de la Loi 18-07, ou une convention écrite spécifique doit-elle être conclue avec chaque praticien et clinique ?  
   *Statut :* **À CONFIRMER JURIDIQUEMENT**.

---

## 15. PLAN D'IMPLÉMENTATION PAR ÉTAPES

Ce plan directeur décrit les phases ordonnées à suivre lors des travaux ultérieurs de développement, **sans aucune exécution immédiate** :

```
┌────────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 1 : Sécurisation du Contrôle d'Accès Applicatif (RBAC)           │
│ ➔ Modification de `TicketController.php`                               │
│ ➔ Blocage total de l'accès Admin/Support au contenu des tickets        │
│ ➔ Redirection des flux admin vers `admin_support_tickets`              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ ÉTAPE 2 : Mise en Place du Composant Cryptographique                   │
│ ➔ Création de `backend/helpers/CryptoHelper.php` (AES-256-GCM)         │
│ ➔ Définition de `CHAT_ENCRYPTION_KEY` dans `backend/.env`              │
│ ➔ Tests unitaires d'intégrité et de compatibilité avec l'existant      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ ÉTAPE 3 : Création des Tables de Gel et d'Audit                        │
│ ➔ Migration SQL : table `conversation_audit_logs`                      │
│ ➔ Ajout des champs `is_flagged` et `flagged_at` sur `tickets`          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ ÉTAPE 4 : Implémentation du Mécanisme de Signalement (Niveau 3)        │
│ ➔ Endpoint `POST /api/tickets/:id/flag`                                │
│ ➔ Création automatique d'un ticket dans `admin_support_tickets`        │
│ ➔ Verrouillage contre la suppression en cas de signalement actif       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ ÉTAPE 5 : Procédure d'Accès Exceptionnel & Réquisitions (Niveaux 4 & 5)│
│ ➔ Procédure de double validation et journalisation obligatoire         │
│ ➔ Rédaction du guide de procédure interne pour réquisitions papier     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ ÉTAPE 6 : Mise à Jour de la Documentation Utilisateur et ANPDP         │
│ ➔ Mise à jour de `Docs/SECURITY.md` et `Docs/BUSINESS_RULES.md`        │
│ ➔ Mention transparente dans la Politique de Confidentialité (`/privacy`)│
│ ➔ Intégration dans le dossier d'autorisation préalable ANPDP (Art. 17) │
└────────────────────────────────────────────────────────────────────────┘
```

---

> **Rappel de clôture méthodologique :**  
> Conformément aux consignes formelles reçues, aucun code source n'a été modifié, aucune table n'a été altérée, aucune donnée n'a été migrée ou chiffrée, et aucun commit n'a été effectué lors de cette phase de conception.
