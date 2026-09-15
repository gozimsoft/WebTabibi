# TABIBI — PHASE 02 : MATRICE DE CONFORMITÉ JURIDIQUE VÉRIFIÉE
> **Cadre Juridique Officiel de Référence :**  
> - **Loi n° 18-07 du 10 juin 2018** relative à la protection des personnes physiques dans le traitement des données à caractère personnel (*Journal Officiel n° 34 du 10 juin 2018*).  
> - **Loi n° 25-11 du 24 juillet 2025** modifiant et complétant la loi n° 18-07 (*Journal Officiel n° 50 du 27 juillet 2025*).  
> - **Code Civil Algérien** (notamment sur la majorité légale, Art. 40).  
> - **Code de Déontologie Médicale Algérien** (Décret exécutif n° 92-276) et législation sanitaire sur la conservation des dossiers médicaux.  
>  
> **Source documentaire de base :** [`Docs/TABIBI_PHASE_01_AUDIT_JURIDIQUE.md`](file:///c:/xampp/htdocs/tabibi/Docs/TABIBI_PHASE_01_AUDIT_JURIDIQUE.md)  
> **Statut :** Matrice d'analyse juridique et de qualification réglementaire stricte — Aucune modification du code applicatif, de la base de données ou des pages web.  
> **Date :** Septembre 2026.

---

## 1. TYPOLOGIE ET DÉFINITION DES NIVEAUX DE QUALIFICATION

Pour éviter toute confusion entre une contrainte légale impérative et une recommandation technique, chaque exigence est catégorisée selon la typologie suivante :

1. **OBLIGATION LÉGALE CERTAINE :**  
   Exigence expressément prévue par un article de la Loi n° 18-07 ou de la Loi n° 25-11, dont la méconnaissance constitue une infraction administrative ou pénale directe (passible de sanctions par l'ANPDP ou les tribunaux).
2. **OBLIGATION À CONFIRMER JURIDIQUEMENT :**  
   Exigence issue d'une interprétation des principes généraux, ou dont le champ d'application exact dépend de décrets d'application complémentaires, de directives spécifiques de l'ANPDP, ou d'une qualification préalable du modèle d'affaires de TABIBI par un juriste spécialisé.
3. **BONNE PRATIQUE DE SÉCURITÉ :**  
   Mesure technique ou organisationnelle non textuellement imposée in abstracto par la loi, mais indispensable pour satisfaire à l'obligation générale de sécurité et de résilience (Art. 38) au regard de l'état de l'art technologique.
4. **CHOIX CONTRACTUEL / STRATÉGIQUE TABIBI :**  
   Décision organisationnelle ou contractuelle propre à STELLARSOFT régissant la relation commerciale avec les praticiens, cliniques et tiers, sans découler d'un impératif légal direct.

---

## 2. MATRICE ANALYTIQUE DE CONFORMITÉ JURIDIQUE

### SECTION 1 : CONSENTEMENT ET BASE LÉGALE DU TRAITEMENT

| N° | Exigence | Base légale exacte | Article exact | Texte / Obligation résumée fidèlement | Applicabilité à TABIBI | Niveau | Élément actuel concerné | État actuel | Action technique nécessaire | Action documentaire nécessaire | Action contractuelle nécessaire | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **Consentement préalable à la création de compte** | Loi 18-07 modifiée par Loi 25-11 | **Art. 6 & 7** | Le traitement ne peut être effectué que si la personne concernée a indubitablement donné son consentement préalable, sauf exécution contractuelle ou obligation légale. | Applicable à tout utilisateur s'inscrivant sur la plateforme (patients, médecins, cliniques). | **CERTAIN** | Formulaires d'inscription : `RegisterPage`, `RegisterDoctorPage`, `RegisterClinicPage`. | **ABSENT** | Ajouter une case à cocher obligatoire non pré-cochée avec lien explicite vers CGU et Politique de confidentialité avant validation. | Intégrer la mention expresse dans les parcours d'inscription. | Rendre les CGU opposables dès la création du compte. | **CRITIQUE** |
| **02** | **Consentement exprès pour le traitement des données de santé** | Loi 18-07 | **Art. 8 & 9 al. 1** | Interdiction de traiter des données de santé sauf consentement exprès et écrit (ou équivalent électronique probant) de la personne concernée. | Applicable dès qu'un patient renseigne un motif médical, des symptômes, ou réserve une spécialité clinique. | **CERTAIN** | Écrans de réservation : `Book.jsx`, `QuickAppointmentModal.jsx`, tables `apointements` et `reasons`. | **PARTIEL** (visuel non persistant dans Book, absent dans QuickModal) | Transmettre le statut du consentement à l'API lors du `book()` et enregistrer en base la preuve datée et horodatée. Ajouter le bloc dans `QuickAppointmentModal`. | Rédiger une clause de consentement spécifique et distincte dédiée aux données de santé. | Stipuler expressément la portée du consentement dans la Politique de Confidentialité. | **CRITIQUE** |
| **03** | **Conservation de la preuve du consentement (Traçabilité)** | Loi 25-11 & Loi 18-07 | **Art. 6, 38** | La charge de la preuve du consentement incombe au responsable du traitement. Le système doit pouvoir démontrer quand, comment et quelle version a été acceptée. | Applicable à toutes les actions de consentement (inscription, prise de RDV, acceptation CGU). | **CERTAIN** | Table `users`, table `apointements`, aucun champ d'audit de consentement. | **ABSENT** | Ajouter en base : colonnes `consent_given` (bool), `consent_date` (datetime), `consent_ip` (varchar), `consent_version` (varchar). | Tenir un registre horodaté des versions successives des CGU et Politiques de confidentialité. | Mentionner la conservation de la preuve électronique dans les CGU. | **HAUTE** |
| **04** | **Consentement lors de l'authentification Google OAuth** | Loi 18-07 modifiée par Loi 25-11 | **Art. 6, 7 & 32** | L'utilisation d'une authentification tierce créant un compte à la volée ne dispense pas du recueil du consentement aux conditions de la plateforme. | Applicable aux patients s'inscrivant via le bouton Google Identity Services (GSI). | **CERTAIN** | `onGoogleLogin`, `AuthController::google()`. | **ABSENT** | Si nouveau compte Google détecté : bloquer la création automatique et afficher une modale d'acceptation obligatoire des CGU avant validation finale. | Documenter le flux Google dans la Politique de confidentialité. | Encadrer l'inscription via tiers dans les CGU. | **HAUTE** |
| **05** | **Consentement pour les mineurs et personnes sous tutelle** | Code Civil Art. 40 / Loi 18-07 | **Art. 6, 9** | Les mineurs de moins de 19 ans ne peuvent consentir seuls à des actes juridiques engageant leurs données sans l'accord du tuteur légal. | Applicable lors de l'ajout d'un proche/enfant dans `patientsproches` et de la prise de RDV pédiatrique. | **CERTAIN** | Contrôleur `PatientController.php`, table `patientsproches`. | **ABSENT** | Ajouter un champ de déclaration du statut de représentant légal / tuteur avec case à cocher lors de l'ajout d'un mineur. | Rédiger les mentions relatives aux droits parentaux dans la Politique de confidentialité. | Clause de garantie de représentation légale dans les CGU. | **HAUTE** |
| **06** | **Droit au retrait du consentement à tout moment** | Loi 18-07 modifiée par Loi 25-11 | **Art. 6, 9** | La personne concernée doit pouvoir retirer son consentement à tout moment, aussi facilement qu'elle l'a donné. | Applicable à tout consentement donné pour des traitements facultatifs (ex. rappels marketing, profil public). | **CERTAIN** | Interfaces de profil utilisateur (`ProfilePage`, `Settings`). | **ABSENT** | Créer une section "Gestion des consentements" dans les paramètres du profil permettant de basculer les autorisations. | Décrire la procédure de retrait dans la Politique de Confidentialité. | Prévoir les conséquences du retrait dans les CGU. | **MOYENNE** |

---

### SECTION 2 : INFORMATION PRÉALABLE ET DOCUMENTS JURIDIQUES

| N° | Exigence | Base légale exacte | Article exact | Texte / Obligation résumée fidèlement | Applicabilité à TABIBI | Niveau | Élément actuel concerné | État actuel | Action technique nécessaire | Action documentaire nécessaire | Action contractuelle nécessaire | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **07** | **Droit à l'information préalable claire et complète** | Loi 18-07 | **Art. 32** | Obligation de fournir : identité du responsable, finalités, catégories de données, destinataires, caractère obligatoire/facultatif des réponses, droits d'accès/rectification/opposition, transferts. | Applicable à toutes les interfaces de collecte de données (web, mobile). | **CERTAIN** | Page `/privacy` (incomplète), formulaires sans mentions légales. | **PARTIEL** | Insérer sous chaque formulaire de saisie une mention d'information concise renvoyant à la politique complète. | Réécrire intégralement la Politique de Confidentialité en intégrant les 7 points de l'Art. 32. | Insérer les mentions d'information obligatoires dans les contrats praticiens. | **CRITIQUE** |
| **08** | **Mentions Légales et identification de l'éditeur** | Code de Commerce / Loi 18-07 | **Art. 32 al. a** | Identification claire de l'entité juridique éditrice (Dénomination, Forme sociale, Siège social, Registre du Commerce, NIF, représentant légal, hébergeur). | Applicable au site public et aux applications mobiles. | **CERTAIN** | Absence totale de page Mentions Légales dans le projet. | **ABSENT** | Créer la route `/#/legal` accessible depuis le footer et les paramètres mobiles. | Rédiger le document officiel des Mentions Légales de STELLARSOFT. | Formaliser le mandat d'édition entre STELLARSOFT et la marque TABIBI. | **HAUTE** |
| **09** | **Conditions Générales d'Utilisation (CGU) opposables** | Code Civil / Pratique contractuelle | **Art. 106 et s. Code Civil** | Le contrat fait la loi des parties. Les CGU doivent être expressément acceptées pour être juridiquement opposables. | Applicable à la relation entre TABIBI et les usagers (patients). | **CERTAIN** | Page `/terms` purement passive, jamais formellement signée. | **PARTIEL** | Mettre en place un mécanisme d'acceptation par clic (Clickwrap) avec traçabilité de version. | Mettre à jour les CGU (définition des services, limitation d'intermédiation, responsabilités). | Contrat d'adhésion patient opposable. | **HAUTE** |
| **10** | **Mise à jour des références légales (Loi 25-11 de 2025)** | Journal Officiel n° 50 | **Loi n° 25-11** | La loi 25-11 modifie et complète la loi 18-07. Toute documentation citant exclusivement la loi 18-07 est obsolète. | Applicable à toutes les mentions juridiques de TABIBI. | **CERTAIN** | Pages `/privacy`, `/law-18-07`, fichiers de traduction `fr.json`, `ar.json`. | **ABSENT** | Mettre à jour les textes traduits dans `locales/` pour citer la Loi 18-07 modifiée et complétée par la Loi 25-11. | Mettre à jour le texte explicatif de la page `/#/law-18-07`. | Adapter les clauses contractuelles aux délais et sanctions de la loi 25-11. | **MOYENNE** |

---

### SECTION 3 : FORMALITÉS PRÉALABLES AUPRÈS DE L'ANPDP

| N° | Exigence | Base légale exacte | Article exact | Texte / Obligation résumée fidèlement | Applicabilité à TABIBI | Niveau | Élément actuel concerné | État actuel | Action technique nécessaire | Action documentaire nécessaire | Action contractuelle nécessaire | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **11** | **Autorisation préalable obligatoire pour données de santé** | Loi 18-07 | **Art. 17 al. 2** | Sont soumis à l'AUTORISATION PRÉALABLE de l'ANPDP les traitements portant sur les données génétiques et de santé. | Applicable impérativement à TABIBI du fait du traitement des motifs, notes de santé et données cliniques. | **CERTAIN** | Traitement global de l'application, BDD `apointements`, synchronisation Delphi. | **ABSENT** | Aucune action logicielle immédiate ; préparer l'export technique d'architecture pour le dossier ANPDP. | Constituer et déposer le dossier officiel de demande d'autorisation auprès de l'ANPDP. | Clause de suspension contractuelle en cas de refus ou réserve de l'ANPDP. | **CRITIQUE** |
| **12** | **Déclaration préalable des traitements ordinaires** | Loi 18-07 | **Art. 13 & 14** | Tout traitement non soumis à autorisation fait l'objet d'une déclaration auprès de l'ANPDP préalablement à sa mise en œuvre. | Applicable à la gestion des comptes utilisateurs, annuaire des médecins, facturation. | **CERTAIN** | Fichiers utilisateurs `users`, `patients`, `doctors`, `clinics`. | **ABSENT** | Aucune modification de code. | Établir le registre interne des activités de traitement (Art. 24) en vue de la déclaration. | Préciser dans les conditions de service que le traitement fait l'objet d'une déclaration ANPDP. | **HAUTE** |
| **13** | **Autorisation préalable pour transfert vers l'étranger** | Loi 18-07 | **Art. 17 al. 4 & Art. 44** | Sont soumis à autorisation préalable les transferts de données à caractère personnel vers un pays étranger. | Applicable dès lors que des données transitent par Google SMTP ou Google OAuth situés à l'étranger. | **CERTAIN** | `backend/.env` (`MAIL_HOST=smtp.gmail.com`), Google GSI. | **ABSENT** | Soit supprimer le flux étranger (migration SMTP souverain), soit déposer une demande expresse d'autorisation de transfert ANPDP. | Rédiger la documentation technique du flux transfrontalier si maintenu. | Valider les clauses contractuelles types avec les sous-traitants étrangers. | **CRITIQUE** |

---

### SECTION 4 : RESPONSABILITÉS, SOUS-TRAITANCE ET RELATIONS AVEC LES PRATICIENS

| N° | Exigence | Base légale exacte | Article exact | Texte / Obligation résumée fidèlement | Applicabilité à TABIBI | Niveau | Élément actuel concerné | État actuel | Action technique nécessaire | Action documentaire nécessaire | Action contractuelle nécessaire | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **14** | **Qualification juridique des rôles (RT vs Sous-traitant)** | Loi 18-07 | **Art. 3** | Définition distincte du "Responsable du Traitement" (définit finalités et moyens) et du "Sous-traitant" (traite pour le compte du RT). | Détermine l'entière responsabilité juridique et pénale de STELLARSOFT vis-à-vis des praticiens et patients. | **À CONFIRMER JURIDIQUEMENT** | Documentation générale et CGU de TABIBI. | **NON IDENTIFIÉ** | Adapter les profils et accès d'administration en fonction de la décision juridique de qualification. | Rédiger une note de cadrage juridique formelle par un avocat spécialisé. | Définir précisément dans les contrats : Médecin = RT du dossier médical ; TABIBI = Sous-traitant d'agenda OU Co-responsable. | **CRITIQUE** |
| **15** | **Contrat de sous-traitance obligatoire (DPA)** | Loi 18-07 | **Art. 41** | Le traitement par sous-traitant doit être régi par un contrat liant le sous-traitant au RT, stipulant les obligations de sécurité et l'action exclusive sur instructions. | Applicable à la relation entre STELLARSOFT / TABIBI et chaque cabinet médical ou clinique adhérente. | **CERTAIN** | Inscription médecin et clinique (`RegisterDoctorPage`, `RegisterClinicPage`). | **ABSENT** | Intégrer la signature électronique / acceptation formelle du contrat de sous-traitance lors de l'adhésion praticien. | Rédiger l'Accord de Traitement de Données (DPA - Data Processing Agreement) conforme Art. 41. | Soumettre le DPA à signature obligatoire de tout médecin ou clinique avant activation. | **CRITIQUE** |
| **16** | **Désignation d'un Délégué à la Protection des Données (DPO)** | Loi 25-11 / Recommandations ANPDP | **Loi 25-11** | Désignation d'un délégué ou référent chargé de veiller au respect de la législation au sein de l'organisme traitant des données sensibles. | Applicable à une plateforme traitant des volumes importants de données de santé nationales. | **À CONFIRMER JURIDIQUEMENT** | Organisation interne de STELLARSOFT / TABIBI. | **ABSENT** | Configurer une adresse email dédiée `dpo@stellarsoft.dz` ou `dpo@tabibi.dz` dans l'application. | Rédiger l'acte de désignation et la fiche de mission du DPO. | Notifier la désignation du DPO à l'ANPDP dès confirmation des textes d'application. | **MOYENNE** |

---

### SECTION 5 : SÉCURITÉ, MOTS DE PASSE, CRYPTOGRAPHIE ET TRAÇABILITÉ

| N° | Exigence | Base légale exacte | Article exact | Texte / Obligation résumée fidèlement | Applicabilité à TABIBI | Niveau | Élément actuel concerné | État actuel | Action technique nécessaire | Action documentaire nécessaire | Action contractuelle nécessaire | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **17** | **Sécurité et intégrité absolue des mots de passe** | Loi 18-07 | **Art. 38** | Obligation de mettre en œuvre des mesures techniques appropriées pour empêcher l'accès non autorisé aux données personnelles. | Applicable à tous les comptes utilisateurs stockés dans la table `users`. | **CERTAIN** | Table `users.password`, codée en Base64 réversible (`base64_encode()`). | **ABSENT (VIOLATION GRAVE)** | Remplacer impérativement Base64 par `password_hash($pwd, PASSWORD_BCRYPT)` et `password_verify()`, synchronisé avec le logiciel Delphi. | Documenter la politique de sécurité des mots de passe dans la PSSI interne. | Exiger contractuellement la mise à jour du logiciel Delphi dans les cliniques. | **CRITIQUE** |
| **18** | **Journalisation des accès aux données de santé** | Loi 25-11 & Loi 18-07 | **Art. 38, Secret Médical** | Traçabilité obligatoire des consultations, modifications et extractions portant sur des données sensibles pour prévenir et prouver les accès illégitimes. | Applicable à la consultation des dossiers patients, notes de symptômes et constantes vitales. | **CERTAIN** | API Backend (`AppointmentController`, `PatientController`), table `sync_logs` insuffisante. | **ABSENT** | Créer une table `audit_access_logs` consignant : `id`, `user_id`, `patient_id`, `action` (VIEW/EDIT/DELETE), `resource`, `ip`, `timestamp`. | Documenter la politique de journalisation et durée de rétention des logs d'audit. | Informer les praticiens que leurs accès aux dossiers sont légalement tracés. | **CRITIQUE** |
| **19** | **Notification des violations de données (Data Breach)** | Loi 18-07 modifiée par Loi 25-11 | **Art. 40** | Le responsable du traitement informe sans délai l'ANPDP et les personnes concernées de toute violation de données susceptible d'engendrer un risque pour leurs droits. | Applicable en cas d'intrusion, de fuite de base de données ou de compromission de session. | **CERTAIN** | Procédure opérationnelle et technique de détection d'intrusion. | **ABSENT** | Mettre en place des alertes système automatisées sur les anomalies critiques de l'API. | Rédiger la procédure formelle de réponse aux incidents et de notification ANPDP sous 72h. | Prévoir les obligations réciproques de notification d'incident dans les contrats praticiens. | **HAUTE** |
| **20** | **Chiffrement des données sensibles au repos (Data at Rest)** | Loi 18-07 | **Art. 38** | Mesures techniques adaptées à la sensibilité des données traitées pour empêcher leur lecture illicite en cas de vol physique de support ou de base. | Recommandé pour les constantes vitales et dossiers médicaux stockés en base MySQL. | **BONNE PRATIQUE DE SÉCURITÉ** | Base MySQL distante `uyyuppcc_DBTabibi` stockée en clair. | **ABSENT** | Évaluer le chiffrement au niveau colonne pour les notes cliniques et données vitales (AES-256) ou chiffrement du volume BDD. | Documenter les choix cryptographiques dans la documentation technique de sécurité. | Sans objet. | **HAUTE** |
| **21** | **Sécurisation des sessions et jetons d'accès** | Loi 18-07 | **Art. 38** | Empêcher le détournement de compte utilisateur par interception de jeton d'authentification. | Concerne tous les utilisateurs connectés via le Web et l'application mobile. | **BONNE PRATIQUE DE SÉCURITÉ** | Jeton Bearer stocké dans `localStorage` pendant 30 jours consécutifs. | **PARTIEL** | Réduire la durée de vie du jeton mobile/web, migrer vers des cookies `HttpOnly; Secure; SameSite=Strict` pour la version Web. | Mettre à jour la documentation d'architecture technique. | Sans objet. | **MOYENNE** |

---

### SECTION 6 : HÉBERGEMENT, LOCALISATION SOUVERAINE ET TRANSFERTS INTERNATIONAUX

| N° | Exigence | Base légale exacte | Article exact | Texte / Obligation résumée fidèlement | Applicabilité à TABIBI | Niveau | Élément actuel concerné | État actuel | Action technique nécessaire | Action documentaire nécessaire | Action contractuelle nécessaire | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **22** | **Hébergement souverain des données de santé en Algérie** | Loi 25-11 / Doctrine ANPDP | **Loi 25-11** | Les données sensibles et données de santé des citoyens doivent être hébergées sur le territoire national algérien au sein d'infrastructures sécurisées. | Applicable à la base de données de production et aux serveurs applicatifs de TABIBI. | **CERTAIN** | Serveur distant IP `197.140.142.6` (hébergement cPanel `tabibi.dz`). | **À VÉRIFIER** | Obtenir l'adresse physique du datacenter et l'attestation de souveraineté géographique du fournisseur d'hébergement. | Intégrer l'attestation de l'hébergeur dans le dossier d'autorisation ANPDP. | Exiger un engagement contractuel d'hébergement exclusif en Algérie auprès de l'hébergeur. | **CRITIQUE** |
| **23** | **Interdiction du routage de données médicales via Gmail SMTP** | Loi 18-07 | **Art. 17 & 44** | Interdiction de transférer des données de santé hors d'Algérie sans autorisation ANPDP. | Concerne l'envoi d'emails contenant le nom du patient, du médecin et le motif médical via `smtp.gmail.com`. | **CERTAIN** | `backend/helpers/EmailHelper.php`, `MAIL_HOST=smtp.gmail.com`. | **ABSENT (VIOLATION)** | Remplacer immédiatement le relais SMTP Google par un serveur SMTP interne sécurisé hébergé localement en Algérie. Ne plus inclure de données de santé dans les emails. | Déclarer les prestataires de messagerie dans la Politique de confidentialité. | Résilier ou exclure le flux SMTP de données médicales vers Google LLC. | **CRITIQUE** |
| **24** | **Régularisation ou suppression des scripts tiers externes (Google GSI / Fonts)** | Loi 18-07 | **Art. 6 & 44** | Le chargement de bibliothèques tierces transmettant l'adresse IP et les requêtes des usagers vers des serveurs étrangers sans consentement préalable est prohibé. | Concerne les scripts chargés sur toutes les pages publiques et médicales de TABIBI. | **CERTAIN** | `frontend/index.html` (`accounts.google.com/gsi/client`, Google Fonts Cairo/Tajawal). | **PARTIEL** | Héberger les polices de caractères localement (Self-hosted). Conditionner le chargement de Google Identity Services au consentement préalable ou supprimer GSI. | Documenter les connexions tierces dans la Politique des cookies. | Sans objet. | **HAUTE** |

---

### SECTION 7 : DROITS DES PERSONNES CONCERNÉES (EXERCICE ET RESTRICTIONS)

| N° | Exigence | Base légale exacte | Article exact | Texte / Obligation résumée fidèlement | Applicabilité à TABIBI | Niveau | Élément actuel concerné | État actuel | Action technique nécessaire | Action documentaire nécessaire | Action contractuelle nécessaire | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **25** | **Droit à l'effacement (Suppression de compte)** | Loi 18-07 | **Art. 35** | La personne peut exiger l'effacement de ses données personnelles lorsque le traitement n'est plus nécessaire ou illicite. | Applicable aux patients et praticiens souhaitant quitter la plateforme TABIBI. | **CERTAIN** | Absence totale d'endpoint API ou de bouton de suppression dans le système. | **ABSENT** | Créer un endpoint sécurisé `POST /api/users/delete-account` avec anonymisation des rendez-vous passés (conservation des obligations comptables). | Rédiger la politique d'effacement et de rétention des archives légales. | Préciser dans les CGU les modalités de clôture de compte. | **CRITIQUE** |
| **26** | **Droit d'accès sous une forme accessible** | Loi 18-07 | **Art. 34** | Droit d'obtenir la communication, sous une forme accessible, des données faisant l'objet du traitement. | Applicable à tout utilisateur demandant la copie intégrale de son dossier personnel. | **CERTAIN** | Interface profil actuel (restitution partielle sans export). | **PARTIEL** | Développer une fonctionnalité de téléchargement du récapitulatif du dossier patient en PDF structuré ou JSON. | Préciser les délais légaux de réponse (1 mois) dans la Politique de confidentialité. | Sans objet. | **HAUTE** |
| **27** | **Droit de rectification des données inexactes** | Loi 18-07 | **Art. 35** | Droit d'obtenir la mise à jour ou rectification sans frais des données inexactes ou incomplètes. | Applicable à l'ensemble des données déclaratives des patients et praticiens. | **CERTAIN** | Endpoints `PUT /api/patients/profile`, `PUT /api/doctors/profile`. | **CONFORME** | Maintenir les contrôles de cohérence existants. | Documenter les modalités de rectification dans la Politique de confidentialité. | Sans objet. | **BASSE** |
| **28** | **Droit d'opposition pour motifs légitimes** | Loi 18-07 | **Art. 36** | Droit de s'opposer, pour des motifs légitimes, au traitement de ses données, et opposition sans motif à toute prospection commerciale. | Applicable aux communications, notifications et réceptions d'emails informatifs. | **CERTAIN** | Système de notifications push/in-app et emails transactionnels. | **ABSENT** | Ajouter des cases d'options de désactivation des notifications non critiques dans les paramètres du compte. | Mentionner expressément l'Art. 36 dans la Politique de confidentialité. | Sans objet. | **MOYENNE** |
| **29** | **Droit à la portabilité automatisée des données** | RGPD Art. 20 / Pratique internationale | **Non textuellement repris dans la Loi 18-07** | Droit de recevoir les données dans un format structuré et couramment utilisé pour les transmettre à un autre responsable. | Non obligatoire au sens strict de la loi algérienne actuelle (la loi exige une "forme accessible"). | **BONNE PRATIQUE DE SÉCURITÉ** | Aucune fonction d'export universel (FHIR, HL7, JSON standard). | **ABSENT** | Optionnel : concevoir un export standard des rendez-vous au format iCal / JSON. | Mentionner la mise à disposition de l'export comme avantage de service. | Choix stratégique de fidélisation et d'interopérabilité. | **BASSE** |

---

### SECTION 8 : COOKIES, TRACEURS ET STATISTIQUES DE VISITE

| N° | Exigence | Base légale exacte | Article exact | Texte / Obligation résumée fidèlement | Applicabilité à TABIBI | Niveau | Élément actuel concerné | État actuel | Action technique nécessaire | Action documentaire nécessaire | Action contractuelle nécessaire | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **30** | **Bandeau de consentement et gestion des cookies / traceurs** | Loi 18-07 | **Art. 6 & 32** | Les identifiants techniques et données de connexion (IP) sont des données personnelles. Tout dépôt non strictement nécessaire exige consentement. | Applicable au site web public `tabibi.dz`. | **CERTAIN** | `localStorage` (`tabibi_token`), absence de bandeau de consentement. | **ABSENT** | Implémenter un bandeau de cookies conforme (Accepter tout / Refuser / Paramétrer) bloquant les scripts tiers avant consentement. | Rédiger une "Politique relative aux Cookies et Traceurs" détaillée. | Sans objet. | **HAUTE** |
| **31** | **Légalité de la collecte des adresses IP dans `site_visits`** | Loi 18-07 | **Art. 4 & 6** | L'adresse IP est une donnée à caractère personnel. Sa collecte systématique à des fins statistiques doit être justifiée ou anonymisée. | Applicable à `PublicController::logVisit()` qui insère l'IP brute de chaque visiteur en BDD. | **CERTAIN** | Table `site_visits` (`ip_address VARCHAR(45)` stockée en clair). | **NON CONFORME** | Anonymiser l'adresse IP avant insertion (hachage avec sel journalier ou masquage du dernier octet : ex. `197.140.xxx.xxx`). | Mentionner le traitement statistique anonymisé dans la Politique de confidentialité. | Sans objet. | **HAUTE** |

---

### SECTION 9 : CONSERVATION DES DONNÉES ET ARCHIVAGE

| N° | Exigence | Base légale exacte | Article exact | Texte / Obligation résumée fidèlement | Applicabilité à TABIBI | Niveau | Élément actuel concerné | État actuel | Action technique nécessaire | Action documentaire nécessaire | Action contractuelle nécessaire | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **32** | **Limitation de la durée de conservation des données** | Loi 18-07 | **Art. 4 al. 5** | Les données doivent être conservées pendant une durée n'excédant pas celle nécessaire aux finalités pour lesquelles elles ont été collectées. | Applicable aux comptes inactifs, codes OTP, historiques de rendez-vous et logs de visite. | **CERTAIN** | Aucune purge automatique en base ; rétention infinie par défaut. | **ABSENT** | Développer des scripts automatiques (cron jobs) pour : 1. Purger les OTP après 24h ; 2. Archiver/anonymiser les rendez-vous de plus de 3 ans ; 3. Purger les logs de visites. | Définir et publier une grille formelle des durées de conservation par catégorie de données. | Informer les utilisateurs des délais de conservation dans les CGU. | **HAUTE** |
| **33** | **Conservation des dossiers médicaux par les médecins** | Code de Déontologie Médicale Algérien | **Réglementation Sanitaire** | Obligation pour les praticiens de conserver les dossiers médicaux pendant les délais légaux (généralement 20 ans). | Ne s'applique directement qu'aux médecins, mais TABIBI ne doit pas détruire les archives du praticien sans accord. | **CHOIX STRATÉGIQUE TABIBI** | Données cliniques et rendez-vous stockés dans `apointements`. | **À CLARIFIER** | Distinguer la suppression du compte patient sur la plateforme web de la conservation de l'archive médicale par le médecin. | Expliquer clairement aux patients la différence entre compte web supprimé et dossier médical légal du cabinet. | Prévoir dans le contrat médecin que l'exportation des archives lui incombe en cas de résiliation. | **HAUTE** |

---

### SECTION 10 : MODULE DE SYNCHRONISATION DELPHI ET MINIMISATION

| N° | Exigence | Base légale exacte | Article exact | Texte / Obligation résumée fidèlement | Applicabilité à TABIBI | Niveau | Élément actuel concerné | État actuel | Action technique nécessaire | Action documentaire nécessaire | Action contractuelle nécessaire | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **34** | **Principe de minimisation des données (Données biométriques Delphi)** | Loi 18-07 | **Art. 4 al. 3** | Les données doivent être adéquates, pertinentes et non excessives au regard des finalités pour lesquelles elles sont collectées. | Concerne la synchronisation des constantes vitales (`weight`, `height`, `imc`, `pas`, `pac`, `oxygen`, `heartbeats`). | **À CONFIRMER JURIDIQUEMENT** | `SyncController::upload()`, table `apointements`. | **PROBLÉMATIQUE** | Si TABIBI n'est qu'un agenda de prise de RDV : supprimer la synchronisation de ces constantes vers le cloud. Si TABIBI est un DMP : requérir autorisation ANPDP. | Justifier formellement la finalité de chaque constante dans le dossier ANPDP si maintenue. | Encadrer contractuellement les catégories de données synchronisées avec la clinique. | **CRITIQUE** |
| **35** | **Sécurité et intégrité du canal de synchronisation Delphi** | Loi 18-07 | **Art. 38** | Obligation de sécuriser les flux de données contre toute interception ou altération lors des transmissions entre systèmes distants. | Concerne les échanges API entre le logiciel desktop en clinique et le serveur distant. | **BONNE PRATIQUE DE SÉCURITÉ** | `POST /api/sync/upload`, jeton Bearer du médecin. | **PARTIEL** | Imposer le chiffrement TLS 1.3 strict, authentification mutuelle ou clé d'API machine dédiée pour le logiciel Delphi. | Documenter l'architecture de synchronisation dans le dossier de sécurité. | Obligation contractuelle pour la clinique de sécuriser le poste local Delphi (antivirus, accès physique). | **HAUTE** |

---

## 3. RÉSUMÉ DES OBLIGATIONS LÉGALES CERTAINES

Les obligations suivantes résultent de dispositions expresses et impératives de la **Loi n° 18-07** et de la **Loi n° 25-11** :

1. **Obtention de l'autorisation préalable de l'ANPDP** pour le traitement des données de santé (Art. 17 al. 2).
2. **Recueil d'un consentement exprès et traçable** pour tout traitement de données de santé (Art. 8, 9 al. 1).
3. **Mise en conformité de l'information préalable (Art. 32)** sur l'ensemble des formulaires de collecte (identité légale de l'éditeur, finalités, destinataires, droits, durée).
4. **Rédaction et publication des Mentions Légales complètes** avec identification de la personne morale STELLARSOFT (Art. 32 al. a).
5. **Remplacement immédiat du stockage des mots de passe en Base64** par un hachage cryptographique fort conforme à l'état de l'art (Art. 38).
6. **Cessation du routage des données de santé via le SMTP étranger de Google (Gmail)** sans autorisation formelle de transfert ANPDP (Art. 17 al. 4, Art. 44).
7. **Création d'un mécanisme de droit à l'effacement (suppression de compte)** pour les patients et praticiens (Art. 35).
8. **Mise en place d'un journal d'audit d'accès aux données médicales** permettant d'identifier qui a consulté quelle donnée de santé (Art. 38, Loi 25-11).
9. **Formalisation obligatoire d'un accord de sous-traitance de données (DPA)** liant contractuellement TABIBI à chaque praticien et clinique (Art. 41).
10. **Anonymisation des adresses IP collectées à des fins statistiques** dans la table `site_visits` (Art. 4 al. 3, Art. 6).
11. **Mise en place d'un recueil de consentement parental** pour les données des mineurs rattachés dans `patientsproches` (Art. 6, Code Civil Art. 40).
12. **Définition et application technique de durées limites de conservation** avec purge automatique des données périmées (Art. 4 al. 5).

---

## 4. RÉSUMÉ DES POINTS À CONFIRMER PAR UN JURISTE SPÉCIALISÉ

Les points suivants nécessitent impérativement une consultation juridique formelle auprès d'un avocat spécialisé en droit du numérique et de la santé en Algérie :

1. **Qualification de la relation TABIBI ↔ Médecins (Art. 3 de la Loi 18-07) :**  
   *STELLARSOFT doit-elle se positionner comme sous-traitant exclusif des médecins (qui porteraient la qualité de Responsable de Traitement pour leurs patients), ou comme co-responsable de traitement ?*  
   -> De cette qualification dépend l'étendue de la responsabilité civile et pénale de l'éditeur.
2. **Périmètre légitime des constantes vitales synchronisées depuis Delphi :**  
   *La plateforme TABIBI peut-elle légalement conserver sur son cloud les paramètres biométriques (Poids, Tension, SpO2) sans être qualifiée d'Hébergeur de Dossier Médical Partagé (DMP) ou de plateforme de télémédecine soumise à agrément du Ministère de la Santé ?*  
   -> Si la réponse est non, ces champs doivent être définitivement exclus du flux de synchronisation cloud.
3. **Statut de l'hébergeur physique actuel (`197.140.142.6`) sous l'empire de la Loi 25-11 :**  
   *Le datacenter hébergeant le serveur cPanel actuel est-il juridiquement qualifié d'hébergeur souverain sur le sol algérien au sens des exigences de la Loi 25-11 pour les données de santé ?*
4. **Obligation formelle de désignation d'un DPO :**  
   *La désignation d'un DPO auprès de l'ANPDP est-elle obligatoire immédiatement pour STELLARSOFT au titre de la loi 25-11 ou facultative selon les seuils d'activité ?*
5. **Articulation entre suppression de compte web et conservation du dossier médical :**  
   *Quelles sont les modalités légales exactes permettant de supprimer le compte d'un patient sur TABIBI tout en garantissant au médecin la conservation légale de son historique de consultation imposée par le Code de Déontologie Médicale ?*

---

## 5. TOP 10 DES RISQUES JURIDIQUES ET SÉCURITAIRES DE TABIBI

| Rang | Risque identifié | Nature du risque | Conséquence juridique / opérationnelle possible | Gravité |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Mots de passe stockés en Base64 dans `users`** | Sécurité / Loi 18-07 Art. 38 | Violation de sécurité flagrante. En cas de fuite de la BDD, exposition publique immédiate de tous les mots de passe praticiens et patients. Responsabilité pénale directe. | **CRITIQUE** |
| **2** | **Traitement de données de santé sans autorisation ANPDP** | Conformité / Loi 18-07 Art. 17 | Sanctions administratives de l'ANPDP (mise en demeure, suspension du traitement, fermeture de la plateforme) et sanctions pénales (amendes et peines d'emprisonnement prévues aux Art. 55 et s.). | **CRITIQUE** |
| **3** | **Fuite de données médicales via Gmail SMTP vers l'étranger** | Réglementaire / Loi 18-07 Art. 44 | Transfert illicite de données de santé hors d'Algérie sans autorisation ANPDP. Violation du secret médical par transmission en clair. | **CRITIQUE** |
| **4** | **Absence de consentement réel lors de la réservation** | Légalité du traitement / Art. 8 & 9 | La checkbox non enregistrée en BDD rend TABIBI incapable d'apporter la preuve légale du consentement en cas de litige avec un patient ou de contrôle ANPDP. | **CRITIQUE** |
| **5** | **Absence totale de contrat DPA avec les médecins et cliniques** | Contractuel / Loi 18-07 Art. 41 | Nullité des clauses d'exonération de responsabilité de TABIBI. Impossibilité d'opposer aux praticiens le respect de la loi 18-07. | **HAUTE** |
| **6** | **Inscriptions directes sans acceptation des CGU ni de la Politique** | Droit des contrats / Art. 6 & 7 | Inopposabilité totale des Conditions Générales d'Utilisation aux patients et médecins inscrits (aucun contrat valablement formé). | **HAUTE** |
| **7** | **Absence de traçabilité des consultations de dossiers médicaux** | Sécurité / Loi 25-11 | Impossibilité de détecter ou de prouver un accès illégitime (espionnage, curiosité malveillante) aux constantes vitales ou notes d'un patient. | **HAUTE** |
| **8** | **Absence de mécanisme d'effacement de compte** | Droits des personnes / Art. 35 | Violation directe du droit des usagers à la suppression de leurs données personnelles, motif fréquent de plainte auprès de l'ANPDP. | **HAUTE** |
| **9** | **Collecte brute des adresses IP des visiteurs sans consentement** | Traçage / Art. 4 & 6 | Collecte disproportionnée de données personnelles de navigation dans `site_visits` sans base légale ni information préalable. | **MOYENNE** |
| **10** | **Enregistrement de mineurs sans preuve de tutelle légale** | Protection de l'enfance / Code Civil | Traitement illégal de données de santé de mineurs sans recueil formalisé du consentement du titulaire de l'autorité parentale. | **MOYENNE** |

---

## 6. ORDRE RECOMMANDÉ DES FUTURES PHASES TECHNIQUES

Pour remédier de façon rationnelle et sécurisée à ces manquements, sans perturber le fonctionnement opérationnel du système, l'ordonnancement technique suivant est recommandé :

### ÉTAPE 1 : URGENCE SÉCURITAIRE ET INFRASTRUCTURE (Priorité Immédiate)
1. **Migration cryptographique des mots de passe :** Remplacer le Base64 par Bcrypt dans la table `users` et coordonner la mise à niveau de l'algorithme d'authentification du logiciel Delphi.
2. **Remplacement de la messagerie SMTP Google :** Configurer un serveur SMTP interne souverain hébergé en Algérie pour l'expédition de tous les courriels transactionnels, et expurger les motifs de santé des corps d'emails.
3. **Auto-hébergement des polices et isolation des scripts tiers :** Télécharger en local les polices Google Fonts Cairo et Tajawal afin de supprimer les flux sortants systématiques d'adresses IP vers Google.

### ÉTAPE 2 : CADRAGE DOCUMENTAIRE ET DÉPÔT DU DOSSIER ANPDP
1. **Rédaction et mise en ligne des Mentions Légales et de la Politique de Confidentialité révisée** (intégrant la Loi 25-11).
2. **Rédaction des CGU Patient et des Contrats de Service Médecins / Cliniques** intégrant l'Accord de Sous-traitance (DPA conforme Art. 41).
3. **Constitution et dépôt du dossier d'autorisation préalable** auprès de l'ANPDP pour le traitement des données de santé.

### ÉTAPE 3 : REFONTE DU CONSENTEMENT ET PERSISTANCE EN BDD
1. **Intégration d'un Clickwrap obligatoire à l'inscription** (Patients, Médecins, Cliniques et Google OAuth).
2. **Modification du schéma SQL `apointements`** : Ajouter les colonnes `consent_given`, `consent_date`, `consent_version`, `consent_ip`.
3. **Mise à jour de l'API de réservation (`AppointmentController::book`)** pour enregistrer formellement la preuve du consentement.
4. **Ajout du bloc de consentement dans `QuickAppointmentModal.jsx`** et complétion des traductions françaises manquantes dans `fr.json`.

### ÉTAPE 4 : IMPLÉMENTATION DES DROITS DES PERSONNES ET TRAÇABILITÉ
1. **Création de la table `audit_access_logs`** et journalisation systématique de chaque consultation de dossier médical ou note clinique.
2. **Développement de la fonction de Suppression de compte** (`POST /api/users/delete-account`) avec anonymisation des archives légales.
3. **Développement de l'export structuré du dossier patient** (PDF sécurisé / JSON).
4. **Mise en place d'un bandeau de consentement pour les cookies / traceurs** et anonymisation des IP dans `site_visits`.

### ÉTAPE 5 : OPTIMISATION DE LA SYNCHRONISATION DELPHI ET POLITIQUES DE PURGE
1. **Arbitrage juridique sur les constantes vitales Delphi :** Suppression du flux cloud si non essentiel, ou sécurisation par chiffrement si maintenu.
2. **Automatisation des purges et de l'archivage :** Cron jobs de suppression des OTP expirés et des logs anciens.
