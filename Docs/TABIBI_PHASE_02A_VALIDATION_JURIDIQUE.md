# TABIBI — PHASE 02A : VALIDATION JURIDIQUE DES CONSTATS D'AUDIT
> **Objet :** Examen critique et vérification juridique des constats issus de [`Docs/TABIBI_PHASE_01_AUDIT_JURIDIQUE.md`](file:///c:/xampp/htdocs/tabibi/Docs/TABIBI_PHASE_01_AUDIT_JURIDIQUE.md) et [`Docs/TABIBI_PHASE_02_MATRICE_CONFORMITE_JURIDIQUE.md`](file:///c:/xampp/htdocs/tabibi/Docs/TABIBI_PHASE_02_MATRICE_CONFORMITE_JURIDIQUE.md).  
> **Textes Officiels de Référence :**  
> 1. **Loi n° 18-07 du 10 juin 2018** relative à la protection des personnes physiques dans le traitement des données à caractère personnel (*Journal Officiel n° 34 du 10 juin 2018*).  
> 2. **Loi n° 25-11 du 24 juillet 2025** modifiant et complétant la loi n° 18-07 (*Journal Officiel n° 50 du 27 juillet 2025*).  
> 3. **Code Civil Algérien** (notamment sur la majorité civile et la capacité juridique, Art. 40).  
> 4. **Code de Déontologie Médicale Algérien** (Décret exécutif n° 92-276) et législation sanitaire sur les dossiers médicaux.  
>  
> **Principe méthodologique :** Rigueur juridique absolue. Aucune transposition automatique du RGPD européen. Seuls les textes publiés au Journal Officiel de la République Algérienne Démocratique et Populaire font foi.  
> **Statut :** Document d'analyse préliminaire avant toute modification technique — Aucun code n'est altéré.  
> **Date :** Septembre 2026.

---

## SYSTÈME DE CLASSIFICATION RETENU

Chaque point identifié lors de l'audit est classé dans l'une des 5 catégories suivantes :

- **Catégorie A : OBLIGATION LÉGALE CERTAINE**  
  Exigence textuelle expresse d'un article en vigueur de la Loi 18-07 ou de la Loi 25-11.
- **Catégorie B : OBLIGATION LÉGALE PROBABLE MAIS À CONFIRMER**  
  Exigence découlant d'une interprétation des principes généraux ou dont les conditions exactes dépendent de décrets d'application ou de directives spécifiques de l'ANPDP.
- **Catégorie C : BONNE PRATIQUE / SÉCURITÉ**  
  Mesure technique issue de l'état de l'art permettant de satisfaire à l'obligation de moyens, mais non prescrite mot pour mot par la loi.
- **Catégorie D : CHOIX CONTRACTUEL OU STRATÉGIQUE**  
  Décision d'affaires ou d'organisation propre à STELLARSOFT dans ses relations avec les praticiens, cliniques et patients.
- **Catégorie E : AFFIRMATION DE L'AUDIT NON DÉMONTRÉE**  
  Constat du rapport Phase 01 ou Phase 02 extrapolant la loi algérienne, confondant le droit algérien avec le RGPD européen, ou ne reposant sur aucun texte légal certain.

---

## 1. OBLIGATIONS LÉGALES CERTAINES (CATÉGORIE A)

Ces points constituent des obligations impératives dont le non-respect engage directement la responsabilité pénale et administrative de la plateforme au regard des textes officiels.

---

### 1.1. Autorisation préalable obligatoire pour les données relatives à la santé
- **Article exact :** Article 17, alinéa 2
- **Loi exacte :** Loi n° 18-07 du 10 juin 2018
- **Texte / Obligation résumée :** Sont expressément soumis à l'**AUTORISATION PRÉALABLE** de l'Autorité nationale (ANPDP) les traitements portant sur les données génétiques et les données relatives à la santé.
- **Pourquoi il s'applique à TABIBI :** TABIBI traite des données de santé identifiables : motifs de consultations médicales (`reasons`), notes de symptômes rédigées par les patients (`apointements.note`), et constantes vitales synchronisées depuis les cliniques (`weight`, `height`, `pas`, `pac`, `oxygen`, `heartbeats`).
- **Action technique nécessaire :** Aucune modification de code immédiate ; formaliser la cartographie technique des données de santé traitées pour constituer le dossier de demande d'autorisation auprès de l'ANPDP.

---

### 1.2. Interdiction de principe et consentement exprès pour les données de santé
- **Article exact :** Article 8 et Article 9, alinéa 1
- **Loi exacte :** Loi n° 18-07 du 10 juin 2018
- **Texte / Obligation résumée :** Le traitement des données relatives à la santé est interdit de principe (Art. 8). Il n'est autorisé que si la personne concernée a donné son **CONSENTEMENT EXPRÈS** (Art. 9 al. 1).
- **Pourquoi il s'applique à TABIBI :** Lors de la réservation d'un rendez-vous chez un médecin spécialiste ou de la saisie d'un motif ou d'un symptôme, le patient transmet une donnée de santé.
- **Action technique nécessaire :** 
  1. Rendre la case à cocher de consentement obligatoire et distincte dans `Book.jsx` et `QuickAppointmentModal.jsx`.
  2. Transmettre l'accord dans le payload API de réservation (`api.appointments.book`).
  3. Enregistrer en base (`apointements`) la confirmation du consentement.

---

### 1.3. Information préalable obligatoire de l'utilisateur
- **Article exact :** Article 32
- **Loi exacte :** Loi n° 18-07 du 10 juin 2018
- **Texte / Obligation résumée :** Le responsable du traitement doit obligatoirement fournir à la personne concernée au moment de la collecte : son identité et celle de son représentant (a), les finalités du traitement (b), les catégories de données (c), les destinataires (d), le caractère obligatoire ou facultatif des réponses et les conséquences du défaut de réponse (e), l'existence et les modalités d'exercice des droits d'accès, de rectification et d'opposition (f), et les transferts envisagés vers l'étranger (g).
- **Pourquoi il s'applique à TABIBI :** Les formulaires d'inscription de TABIBI (`RegisterPage`, `RegisterDoctorPage`, `RegisterClinicPage`) collectent des données directes sans fournir ces 7 mentions obligatoires.
- **Action technique nécessaire :** 
  1. Insérer sous chaque formulaire d'inscription un bloc textuel d'information préalable synthétique avec lien vers la Politique de Confidentialité.
  2. Compléter la Politique de Confidentialité (`/#/privacy`) pour y intégrer formellement les 7 mentions prescrites par l'Art. 32.

---

### 1.4. Interdiction de transfert transfrontalier sans autorisation de l'ANPDP
- **Article exact :** Article 17 (alinéa 4) et Article 44
- **Loi exacte :** Loi n° 18-07 du 10 juin 2018
- **Texte / Obligation résumée :** Le transfert de données à caractère personnel vers un pays étranger ne peut être effectué qu'après **AUTORISATION PRÉALABLE** de l'Autorité nationale (Art. 17-4 et 44).
- **Pourquoi il s'applique à TABIBI :** TABIBI achemine actuellement des emails transactionnels contenant des données personnelles (noms, emails, rendez-vous, motifs) via les serveurs SMTP de Google LLC situés hors d'Algérie (`smtp.gmail.com` configuré dans `backend/.env`). Ce flux sortant vers l'étranger sans autorisation préalable de l'ANPDP constitue une violation directe de l'Art. 44.
- **Action technique nécessaire :** 
  1. Déconnecter le relais sortant `smtp.gmail.com`.
  2. Basculer l'envoi d'emails vers un serveur SMTP souverain hébergé localement en Algérie (sur le même hébergement ou chez un prestataire local).
  3. Supprimer des modèles d'emails (`EmailHelper.php`) les motifs médicaux et données sensibles.

---

### 1.5. Obligation légale de sécurité et d'intégrité des identifiants (Mots de passe)
- **Article exact :** Article 38
- **Loi exacte :** Loi n° 18-07 du 10 juin 2018
- **Texte / Obligation résumée :** Le responsable du traitement et le sous-traitant sont tenus de prendre les mesures techniques et organisationnelles appropriées pour protéger les données contre l'accès non autorisé, la diffusion ou l'altération.
- **Pourquoi il s'applique à TABIBI :** Le stockage des mots de passe en **Base64** réversible dans la table `users` n'est pas un algorithme de protection cryptographique. Il s'agit d'une violation directe de l'obligation élémentaire de sécurité prescrite par l'Art. 38 (tout accès à la table permet de lire les mots de passe de tous les médecins et patients immédiatement).
- **Action technique nécessaire :** 
  1. Remplacer `base64_encode()` par la fonction native de hachage unidirectionnel `password_hash($password, PASSWORD_BCRYPT)`.
  2. Adapter la vérification de connexion avec `password_verify()`.
  3. Coordonner l'algorithme d'authentification avec l'équipe du logiciel de cabinet Delphi.

---

### 1.6. Droit de rectification des données inexactes
- **Article exact :** Article 35, alinéa 1
- **Loi exacte :** Loi n° 18-07 du 10 juin 2018
- **Texte / Obligation résumée :** Toute personne peut exiger la rectification, la mise à jour, l'effacement ou le verrouillage des données la concernant qui sont inexactes, incomplètes ou périmées.
- **Pourquoi il s'applique à TABIBI :** Les patients et professionnels de santé ont le droit légal de mettre à jour leurs coordonnées ou données erronées.
- **Action technique nécessaire :** Maintenir et sécuriser les routes existantes `PUT /api/patients/profile` et `PUT /api/doctors/profile` (l'application est déjà fonctionnellement conforme sur ce point).

---

### 1.7. Droit d'opposition sans motif à la prospection
- **Article exact :** Article 36, alinéa 2
- **Loi exacte :** Loi n° 18-07 du 10 juin 2018
- **Texte / Obligation résumée :** La personne concernée a le droit de s'opposer, sans frais et sans avoir à motiver sa demande, à ce que les données la concernant soient utilisées à des fins de prospection, notamment commerciale.
- **Pourquoi il s'applique à TABIBI :** TABIBI envoie des notifications et communications aux utilisateurs. Si des messages non strictement médicaux (promotions de cliniques, offres de services) sont transmis, l'usager doit pouvoir s'y opposer immédiatement.
- **Action technique nécessaire :** Intégrer dans les paramètres du profil un réglage permettant de désactiver les notifications promotionnelles ou non indispensables.

---

### 1.8. Obligation d'un contrat écrit régissant la sous-traitance
- **Article exact :** Article 41
- **Loi exacte :** Loi n° 18-07 du 10 juin 2018
- **Texte / Obligation résumée :** La réalisation de traitements en sous-traitance doit être régie par un **contrat écrit ou un acte juridique** liant le sous-traitant au responsable du traitement, prévoyant que le sous-traitant n'agit que sur instruction du responsable et est tenu aux obligations de sécurité de l'article 38.
- **Pourquoi il s'applique à TABIBI :** Dans la mesure où TABIBI héberge et gère l'agenda et les données de rendez-vous pour le compte de cabinets médicaux ou de cliniques privées (qui sont les responsables du traitement médical de leurs patients), l'absence de contrat écrit viole directement l'Art. 41.
- **Action technique nécessaire :** Intégrer un processus d'acceptation contractuelle en ligne (Accord de Traitement des Données / DPA) lors de l'inscription et de la validation des comptes médecins et cliniques.

---

### 1.9. Obligation de notification des violations de données à l'Autorité nationale
- **Article exact :** Article 40
- **Loi exacte :** Loi n° 18-07 modifiée et complétée par la Loi n° 25-11
- **Texte / Obligation résumée :** En cas de violation de données à caractère personnel susceptible d'engendrer un risque pour les droits et libertés des personnes physiques, le responsable du traitement informe sans délai l'Autorité nationale (ANPDP) et, le cas échéant, les personnes concernées.
- **Pourquoi il s'applique à TABIBI :** Tout incident de sécurité (intrusion serveur, fuite de base MySQL, compromission d'accès praticien) déclenche cette obligation légale sous peine de sanctions pénales.
- **Action technique nécessaire :** Mettre en place un mécanisme interne de détection et de journalisation des erreurs critiques et des accès anormaux pour alimenter la procédure de notification.

---

### 1.10. Secret professionnel du personnel et des intervenants
- **Article exact :** Article 42
- **Loi exacte :** Loi n° 18-07 du 10 juin 2018
- **Texte / Obligation résumée :** Le responsable du traitement, le sous-traitant et toute personne qui intervient dans la mise en œuvre d'un traitement sont tenus au **secret professionnel**, même après la cessation de leurs fonctions.
- **Pourquoi il s'applique à TABIBI :** Les administrateurs de la plateforme, développeurs et techniciens ayant accès à la base de données de production ou aux serveurs manipulent des données médicales confidentielles.
- **Action technique nécessaire :** Restreindre strictement les accès d'administration aux seules données nécessaires ; ne pas afficher en clair les notes médicales ou constantes cliniques sur la console d'administration générale (`AdminDashboardPage`).

---

## 2. OBLIGATIONS PROBABLEMENT APPLICABLES À CONFIRMER (CATÉGORIE B)

Ces exigences sont très probables dans leur esprit ou découlent des textes récents de 2025, mais leur mise en œuvre exacte pour une plateforme privée de prise de rendez-vous nécessite une confirmation juridique ou réglementaire.

---

### 2.1. Traçabilité et journalisation des accès aux dossiers de santé
- **Articles de référence :** Article 38 de la Loi 18-07 (sécurité adaptée aux risques) + Dispositions de la Loi n° 25-11 sur la numérisation de la santé et le secret médical.
- **Analyse juridique :** La loi 18-07 ne contient pas une liste textuelle rigide précisant "un journal d'audit SQL doit enregistrer tel champ". Cependant, l'obligation de garantir le secret médical (Art. 42) et la sécurité contre tout accès non autorisé (Art. 38) impose techniquement de pouvoir prouver **qui a consulté ou modifié une donnée de santé**.
- **Pourquoi il s'applique à TABIBI :** Actuellement, aucun journal n'enregistre les consultations de dossiers patients ou de notes médicales par les praticiens ou l'administrateur.
- **Action technique recommandée :** Créer une table légère `audit_access_logs` (`id`, `user_id`, `patient_id`, `action`, `resource`, `ip`, `created_at`) enregistrant les accès aux données médicales.

---

### 2.2. Droit à l'effacement (Suppression de compte) vs Obligations médicales
- **Articles de référence :** Article 35 de la Loi 18-07 (effacement des données) vs Code de Déontologie Médicale et réglementation sanitaire (conservation obligatoire du dossier médical).
- **Analyse juridique :** L'Article 35 prévoit le droit d'obtenir l'effacement des données dont le traitement n'est plus conforme à la loi ou dont la finalité a cessé. Cependant, ce droit n'est pas absolu : un patient qui demande la suppression de son compte web TABIBI ne peut pas exiger la destruction illégale des traces d'un acte médical ou d'un rendez-vous effectif conservé par le médecin pour sa responsabilité professionnelle.
- **Pourquoi il s'applique à TABIBI :** Il n'existe actuellement aucun bouton ni endpoint pour fermer un compte utilisateur sur TABIBI.
- **Action technique recommandée :** Implémenter un endpoint de suppression de compte patient qui :
  1. Supprime ou anonymise les identifiants d'accès (`users`, `sessions`, téléphone, email).
  2. Conserve les rendez-vous passés sous forme anonymisée ou verrouillée (soft cancel / archivage détaché de l'identité web) pour préserver la cohérence du planning du praticien.

---

### 2.3. Modalités du recueil de consentement pour les mineurs
- **Articles de référence :** Code Civil Algérien (Art. 40 fixant la majorité civile à 19 ans révolus) + Loi 18-07 (Art. 6 & 9).
- **Analyse juridique :** La loi 18-07 ne fixe pas d'âge spécifique de "majorité numérique" autonome (comme les 15 ans en France). En droit civil algérien, le consentement relatif aux données d'un mineur relève donc de l'autorité parentale (père, mère ou tuteur légal).
- **Pourquoi il s'applique à TABIBI :** Le module `patientsproches` permet de réserver pour un tiers ou un enfant sans déclarer la qualité de représentant légal.
- **Action technique recommandée :** Ajouter une mention déclarative simple sous forme de case à cocher lors de l'ajout d'un proche mineur : *"Je déclare être le représentant légal (parent/tuteur) de cette personne"*.

---

### 2.4. Désignation formelle d'un Délégué à la Protection des Données (DPO)
- **Articles de référence :** Loi n° 25-11 du 24 juillet 2025 et guides doctrinaux de l'ANPDP.
- **Analyse juridique :** La loi 25-11 renforce la gouvernance et le rôle des correspondants / délégués à la protection des données pour les organismes publics et les organismes traitant des données sensibles à grande échelle. Il convient de faire confirmer par un juriste si la taille et le statut juridique de STELLARSOFT imposent obligatoirement une notification formelle de DPO auprès de l'ANPDP ou une simple désignation d'un référent interne.
- **Action technique recommandée :** Créer une adresse email institutionnelle de contact dédiée (`contact@tabibi.dz` ou `dpo@stellarsoft.dz`) mentionnée dans la Politique de Confidentialité.

---

## 3. BONNES PRATIQUES DE SÉCURITÉ (CATÉGORIE C)

Ces mesures ne figurent pas textuellement dans le texte de la loi algérienne comme des articles impératifs formulés ainsi, mais constituent des standards techniques universels indispensables pour satisfaire à l'obligation générale de sécurité (Art. 38).

1. **Chiffrement de la base de données au repos (Data at Rest) :**  
   *Observation :* Aucun article de la loi 18-07 ne prescrit textuellement "le chiffrement AES-256 des tables MySQL". Cependant, pour protéger les données de santé contre l'exfiltration physique du serveur, c'est une recommandation technique majeure.
2. **Durée de validité des jetons de session et stockage sécurisé :**  
   *Observation :* La loi ne réglemente pas la durée des tokens API (30 jours actuellement dans TABIBI). L'utilisation de cookies `HttpOnly; Secure` pour le Web et la réduction de la durée de session constituent des bonnes pratiques contre les attaques XSS.
3. **Export automatisé des données au format JSON / Portabilité :**  
   *Observation :* L'Art. 34 exige la "communication sous une forme accessible". Il n'impose pas une API d'export universel automatisé (spécificité du RGPD européen Art. 20). Offrir un export structuré est une excellente pratique technique facilitant l'accès.
4. **Auto-hébergement des polices Google Fonts :**  
   *Observation :* Télécharger localement les polices `Cairo` et `Tajawal` évite des requêtes externes inutiles et renforce l'autonomie et la vitesse de chargement.
5. **Sauvegardes automatiques chiffrées et isolées :**  
   *Observation :* Découle de la nécessité d'assurer la disponibilité et la continuité d'activité médicale (Art. 38).

---

## 4. CHOIX CONTRACTUELS OU STRATÉGIQUES (CATÉGORIE D)

Ces points relèvent des décisions d'affaires et d'organisation de STELLARSOFT et de TABIBI, et non d'une obligation imposée par le législateur :

1. **Conservation ou suppression des constantes vitales synchronisées depuis Delphi :**  
   *Décision stratégique :* Si TABIBI souhaite se positionner comme un simple agenda de prise de rendez-vous, la synchronisation du poids, de la tension et du rythme cardiaque est inutile et viole le principe de minimisation. Si TABIBI souhaite devenir une plateforme de dossier clinique partagé, elle doit assumer le statut de dossier de santé et les contraintes réglementaires associées.
2. **Politique tarifaire et conditions d'annulation des rendez-vous :**  
   *Décision contractuelle :* Les délais d'annulation (ex. 2h ou 24h à l'avance) et la responsabilité des absences injustifiées relèvent de la liberté contractuelle des CGU.
3. **Modèle de partenariat avec les praticiens (Mandat d'intermédiation) :**  
   *Décision contractuelle :* Définir si la plateforme agit en simple intermédiaire technique transparent ou en mandataire des praticiens.

---

## 5. AFFIRMATIONS DE L'AUDIT NON DÉMONTRÉES (CATÉGORIE E)

L'audit technique initial comportait certaines assertions qu'il convient de rectifier juridiquement afin de ne pas engager le projet dans des travaux inutiles ou basés sur des inexactitudes :

---

### Affirmation 1 : *"L'hébergement hors d'Algérie est purement et simplement interdit par la loi"*
- **Vérification textuelle :**  
  L'Article 44 de la Loi 18-07 dispose : *"Le responsable du traitement ne peut transférer des données à caractère personnel vers un pays étranger que sur autorisation de l'Autorité nationale."*  
  Le texte n'interdit pas l'hébergement étranger de manière absolue ; il le soumet à une **procédure d'autorisation préalable**.  
- **Qualification exacte :** **NON DÉMONTRÉ DANS SA FORME ABSOLUE.**  
  Ce qui est illégal, c'est d'héberger ou de transférer des données hors d'Algérie **sans l'autorisation expresse de l'ANPDP**. Toutefois, pour les données de santé des citoyens, la doctrine nationale et les directives souveraines de 2025 privilégient très fortement l'hébergement sur le sol national.  
- **Conclusion opérationnelle :** Viser l'hébergement en Algérie est un impératif de conformité pratique vis-à-vis de l'ANPDP, mais l'affirmation légale exacte est l'interdiction de tout transfert non autorisé.

---

### Affirmation 2 : *"Un DPO certifié est obligatoire pour TABIBI sous peine de nullité"*
- **Vérification textuelle :**  
  La Loi 18-07 originale ne mentionnait pas l'obligation générale d'un DPO pour toutes les entreprises privées. La Loi 25-11 encadre la désignation d'un délégué ou référent à la protection des données, mais les décrets d'application fixant les seuils d'assujettissement pour les TPE/PME numériques de droit privé doivent être vérifiés.
- **Qualification exacte :** **AFFIRMATION NON DÉMONTRÉE PAR LE TEXTE LÉGAL ACTUEL — À CONFIRMER JURIDIQUEMENT.**
- **Conclusion opérationnelle :** Désigner un référent interne de contact (`dpo@stellarsoft.dz`) suffit amplement sur le plan technique à ce stade sans bloquer le projet.

---

### Affirmation 3 : *"Un bandeau cookies avec case 'Refuser' est obligatoirement exigé par la loi 18-07"*
- **Vérification textuelle :**  
  La loi algérienne ne contient pas l'équivalent de la Directive européenne ePrivacy 2002/58/CE ni des lignes directrices CNIL sur les cookies. L'obligation découle uniquement de la qualification de l'adresse IP et des identifiants comme données personnelles (Art. 3). Les cookies techniques strictement nécessaires au fonctionnement du service (ex. session de connexion) sont licites au titre de l'exécution contractuelle (Art. 7-2) sans exiger de bandeau bloquant.
- **Qualification exacte :** **EXTRAPOLATION ISSUE DU DROIT EUROPÉEN.**
- **Conclusion opérationnelle :** Il est nécessaire d'informer sur les traceurs dans la politique de confidentialité, mais il est faux d'affirmer que la loi 18-07 impose le bandeau cookies européen standard avec consentement préalable pour un simple jeton de session. En revanche, le traçage statistique par IP brute dans `site_visits` doit être anonymisé.

---

### Affirmation 4 : *"Le chiffrement au repos des bases de données est une obligation textuelle de la loi 18-07"*
- **Vérification textuelle :**  
  L'Article 38 impose de *"prendre les mesures techniques et organisationnelles appropriées"*. Il ne cite aucun protocole cryptographique ni obligation de chiffrement au repos de MySQL.
- **Qualification exacte :** **CONFUSION ENTRE BONNE PRATIQUE TECHNIQUE ET OBLIGATION LÉGALE LITTÉRALE.**
- **Conclusion opérationnelle :** C'est une bonne pratique de sécurité (Catégorie C) hautement recommandée, mais non une exigence textuelle sanctionnée comme telle in abstracto.

---

### Affirmation 5 : *"L'API d'exportation de données (portabilité) est une obligation légale de la loi 18-07"*
- **Vérification textuelle :**  
  L'Article 34 de la Loi 18-07 mentionne la *"communication, sous une forme accessible, des données qui font l'objet du traitement"*. Le concept de "droit à la portabilité" (format structuré, couramment utilisé et lisible par machine pour transfert à un concurrent) est une création de l'Art. 20 du RGPD européen, non repris textuellement dans la loi 18-07.
- **Qualification exacte :** **CONFUSION AVEC LE RGPD EUROPÉEN.**
- **Conclusion opérationnelle :** Fournir une copie lisible du profil et de l'historique répond pleinement à l'Art. 34. Le développement d'un export JSON automatisé complexe est une bonne pratique, non une obligation légale impérative.

---

## 6. CORRECTIONS JURIDIQUEMENT PRIORITAIRES

Sur la base exclusive des obligations légales certaines (Catégorie A), voici les **5 chantiers prioritaires indiscutables** à programmer lors des phases techniques ultérieures :

1. **Chantier 1 (Sécurité & Infraction pénale immédiate) : Hachage Bcrypt des mots de passe**  
   Remplacer le Base64 dans `users` par `password_hash($pwd, PASSWORD_BCRYPT)` pour se mettre en conformité immédiate avec l'Article 38.
2. **Chantier 2 (Transfert transfrontalier illicite) : Remplacement du SMTP Gmail étranger**  
   Remplacer `smtp.gmail.com` par un service de messagerie souverain interne hébergé en Algérie et supprimer toute donnée de santé des notifications par email (Articles 17-4 et 44).
3. **Chantier 3 (Légalité de la collecte) : Information préalable (Art. 32) et recueil du consentement (Art. 6, 8, 9)**  
   - Ajouter une case à cocher d'acceptation obligatoire des CGU et de la Politique de Confidentialité lors de l'inscription patient, médecin et clinique.
   - Enregistrer en base (`apointements`) la preuve du consentement exprès lors de la prise de rendez-vous.
   - Intégrer l'accord de consentement dans `QuickAppointmentModal.jsx`.
4. **Chantier 4 (Transparence & Mentions Légales) : Identification légale de l'éditeur**  
   Créer la page des Mentions Légales identifiant formellement STELLARSOFT (raison sociale, forme, siège social, NIF, RC) et réviser la Politique de Confidentialité selon les 7 points de l'Art. 32 en y intégrant la Loi 25-11.
5. **Chantier 5 (Droits des personnes) : Mécanisme de clôture et de suppression de compte**  
   Créer une fonction permettant à l'utilisateur de supprimer son compte conformément à l'Art. 35, avec anonymisation des archives de rendez-vous.

---

## 7. POINTS NÉCESSITANT L'AVIS D'UN PROFESSIONNEL DU DROIT

Avant d'engager des modifications lourdes d'architecture ou de modèles contractuels, l'avis d'un avocat ou juriste spécialisé en droit algérien doit être sollicité sur :

1. **La qualification juridique exacte de STELLARSOFT :**  
   Doit-elle se déclarer auprès de l'ANPDP en tant que **Sous-traitant** (les praticiens étant les seuls Responsables de Traitement de leurs patients), ou en tant que **Responsable de Traitement autonome** ?
2. **Le sort des constantes vitales Delphi au regard de la réglementation e-santé algérienne :**  
   Le stockage centralisé sur le cloud de TABIBI des constantes cliniques (`weight`, `height`, `pas`, `pac`, `oxygen`, `heartbeats`) fait-il entrer la plateforme sous le régime des agréments ministériels de télémédecine et de dossier médical partagé ?
3. **La validation du modèle d'Accord de Traitement des Données (DPA) avec les cliniques et médecins** pour répondre aux stipulations de l'Article 41.
