import re
import json

raw_text = """
MEDECINE GENERALE
- Consultation de médecine générale
- Bilan de santé
- Contrôle médical
- Suivi d'une maladie chronique
- Fièvre
- Fatigue
- Douleurs générales
- Maux de tête
- Vertiges
- Malaise
- Toux
- Rhume / symptômes grippaux
- Mal de gorge
- Douleurs abdominales
- Nausées / vomissements
- Diarrhée
- Constipation
- Douleurs musculaires
- Douleurs articulaires
- Douleurs dorsales / lombaires
- Allergie
- Problème cutané
- Infection suspectée
- Renouvellement d'ordonnance
- Lecture / interprétation d'analyses
- Demande d'orientation vers un spécialiste
- Certificat médical
- Arrêt de travail
- Aptitude médicale
- Vaccination
- Prévention / conseils de santé
- Autre motif de consultation

MEDECINE INTERNE
- Consultation de médecine interne
- Bilan diagnostique
- Bilan de symptômes persistants
- Suivi d'une maladie systémique
- Suivi d'une maladie auto-immune
- Suivi de plusieurs maladies chroniques
- Fièvre prolongée
- Fatigue persistante
- Perte de poids inexpliquée
- Douleurs inexpliquées
- Bilan inflammatoire
- Bilan immunologique
- Bilan de maladies rares
- Suivi thérapeutique
- Avis spécialisé

CARDIOLOGIE
- Consultation de cardiologie
- Bilan cardiovasculaire
- Suivi d'hypertension artérielle
- Suivi d'insuffisance cardiaque
- Palpitations
- Douleur thoracique
- Essoufflement
- Malaise / syncope
- Troubles du rythme cardiaque
- Bilan avant chirurgie
- Suivi après infarctus
- Suivi après intervention cardiovasculaire
- Contrôle de pacemaker / défibrillateur
- Électrocardiogramme
- Échocardiographie
- Test d'effort
- Bilan des facteurs de risque cardiovasculaire

DERMATOLOGIE
- Consultation de dermatologie
- Acné
- Eczéma
- Psoriasis
- Éruption cutanée
- Démangeaisons
- Rougeurs cutanées
- Taches cutanées
- Lésion cutanée
- Grain de beauté / nævus
- Contrôle d'un grain de beauté
- Chute de cheveux
- Pellicules / problème du cuir chevelu
- Infection cutanée
- Mycose cutanée
- Verrues
- Herpès
- Urticaire
- Cicatrice
- Brûlure
- Plaie cutanée
- Problème des ongles
- Suivi d'une maladie dermatologique
- Dépistage / contrôle des cancers cutanés
- Avis dermatologique

ENDOCRINOLOGIE / DIABETOLOGIE
- Consultation d'endocrinologie
- Suivi du diabète
- Bilan de diabète
- Équilibre glycémique
- Suivi du diabète gestationnel
- Hypoglycémie
- Hyperglycémie
- Bilan thyroïdien
- Suivi d'hypothyroïdie
- Suivi d'hyperthyroïdie
- Nodule thyroïdien
- Maladie de la thyroïde
- Trouble hormonal
- Trouble de la croissance
- Trouble de la puberté
- Obésité
- Surpoids
- Bilan métabolique
- Trouble du cholestérol
- Trouble du calcium
- Ostéoporose
- Suivi d'un traitement hormonal

GYNECOLOGIE
- Consultation gynécologique
- Consultation de suivi gynécologique
- Suivi de grossesse
- Première consultation de grossesse
- Suivi prénatal
- Consultation postnatale
- Contraception
- Choix / changement de contraception
- Pose de dispositif intra-utérin (DIU)
- Contrôle de DIU
- Retrait de DIU
- Troubles des règles
- Règles douloureuses
- Règles irrégulières
- Saignements gynécologiques
- Douleurs pelviennes
- Pertes vaginales
- Démangeaisons génitales
- Infection gynécologique
- Ménopause
- Symptômes de ménopause
- Infertilité
- Bilan de fertilité
- Préconception
- Frottis / dépistage du col de l'utérus
- Résultat de frottis
- Kyste ovarien
- Fibrome
- Endométriose
- Suivi d'une pathologie gynécologique
- Santé sexuelle

OBSTETRIQUE
- Suivi de grossesse
- Première consultation prénatale
- Suivi du premier trimestre
- Suivi du deuxième trimestre
- Suivi du troisième trimestre
- Grossesse à risque
- Surveillance de grossesse
- Échographie obstétricale
- Dépistage prénatal
- Suivi du diabète gestationnel
- Suivi de l'hypertension gravidique
- Douleurs pendant la grossesse
- Saignements pendant la grossesse
- Nausées / vomissements de grossesse
- Préparation à l'accouchement
- Consultation post-partum
- Suivi après accouchement

PEDIATRIE
- Consultation pédiatrique
- Consultation de suivi de l'enfant
- Suivi du nouveau-né
- Bilan de croissance
- Bilan du développement
- Vaccination
- Fièvre chez l'enfant
- Toux chez l'enfant
- Rhume / symptômes ORL
- Douleur abdominale chez l'enfant
- Vomissements
- Diarrhée
- Constipation
- Éruption cutanée
- Allergie
- Difficultés alimentaires
- Troubles du sommeil
- Retard de croissance
- Retard du développement
- Troubles du comportement
- Suivi d'une maladie chronique
- Asthme
- Difficultés respiratoires
- Bilan scolaire
- Certificat médical enfant

NEONATOLOGIE
- Suivi du nouveau-né
- Suivi du prématuré
- Bilan néonatal
- Difficultés d'alimentation
- Prise de poids insuffisante
- Ictère néonatal
- Suivi après hospitalisation néonatale
- Suivi du développement

OPHTALMOLOGIE
- Consultation ophtalmologique
- Baisse de vision
- Vision floue
- Douleur oculaire
- Rougeur de l'œil
- Sécheresse oculaire
- Démangeaisons oculaires
- Larmoiement
- Infection oculaire
- Maux de tête liés à la vision
- Contrôle de la vue
- Prescription / renouvellement de lunettes
- Lentilles de contact
- Suivi de glaucome
- Dépistage du glaucome
- Suivi de cataracte
- Cataracte
- Suivi de rétinopathie diabétique
- Problème rétinien
- Contrôle après chirurgie oculaire
- Consultation pédiatrique ophtalmologique

ORL
- Consultation ORL
- Douleur d'oreille
- Baisse de l'audition
- Bourdonnements d'oreille
- Vertiges
- Écoulement de l'oreille
- Sinusite
- Nez bouché
- Saignement de nez
- Difficultés respiratoires nasales
- Mal de gorge
- Troubles de la voix
- Enrouement
- Difficulté à avaler
- Ronflement
- Apnée du sommeil
- Amygdales
- Troubles de l'équilibre
- Bilan auditif
- Suivi ORL

PNEUMOLOGIE
- Consultation de pneumologie
- Toux persistante
- Essoufflement
- Douleur thoracique
- Sifflements respiratoires
- Asthme
- Suivi de BPCO
- Bronchite chronique
- Infection respiratoire
- Pneumonie
- Apnée du sommeil
- Ronflement
- Allergie respiratoire
- Bilan respiratoire
- Exploration fonctionnelle respiratoire
- Suivi après infection respiratoire
- Sevrage tabagique

GASTRO-ENTEROLOGIE
- Consultation de gastro-entérologie
- Douleurs abdominales
- Ballonnements
- Reflux gastro-œsophagien
- Brûlures d'estomac
- Nausées
- Vomissements
- Diarrhée chronique
- Constipation chronique
- Sang dans les selles
- Troubles digestifs
- Intolérance alimentaire
- Maladie inflammatoire intestinale
- Syndrome de l'intestin irritable
- Maladie du foie
- Bilan hépatique
- Hépatite
- Calculs biliaires
- Maladie de la vésicule biliaire
- Suivi de cirrhose
- Coloscopie
- Gastroscopie / endoscopie
- Suivi après endoscopie

NEPHROLOGIE
- Consultation de néphrologie
- Bilan rénal
- Insuffisance rénale
- Suivi d'insuffisance rénale chronique
- Protéinurie
- Hématurie
- Hypertension d'origine rénale
- Œdèmes
- Troubles des électrolytes
- Calculs rénaux
- Suivi de dialyse
- Préparation à la dialyse
- Suivi après transplantation rénale

UROLOGIE
- Consultation d'urologie
- Douleur urinaire
- Brûlures urinaires
- Infection urinaire
- Sang dans les urines
- Difficultés à uriner
- Urgences urinaires
- Incontinence urinaire
- Rétention urinaire
- Calculs urinaires
- Douleur rénale
- Problèmes de prostate
- Hypertrophie bénigne de la prostate
- Dépistage / suivi de cancer de la prostate
- Troubles de l'érection
- Infertilité masculine
- Douleur testiculaire
- Suivi après chirurgie urologique
- Vasectomie / suivi

NEUROLOGIE
- Consultation de neurologie
- Maux de tête
- Migraine
- Vertiges
- Troubles de l'équilibre
- Perte de connaissance
- Convulsions
- Épilepsie
- Tremblements
- Troubles de la mémoire
- Troubles de la concentration
- Fourmillements
- Engourdissements
- Faiblesse musculaire
- Paralysie
- Douleurs nerveuses
- Neuropathie
- Sclérose en plaques
- Maladie de Parkinson
- Suivi neurologique
- Bilan après AVC

PSYCHIATRIE
- Consultation psychiatrique
- Anxiété
- Crises d'angoisse
- Dépression
- Troubles de l'humeur
- Troubles du sommeil
- Stress important
- Épuisement psychique
- Troubles obsessionnels compulsifs
- Troubles alimentaires
- Addiction
- Sevrage / accompagnement d'une addiction
- Trouble bipolaire
- Troubles psychotiques
- Suivi psychiatrique
- Suivi d'un traitement psychiatrique
- Évaluation psychique

PSYCHOLOGIE
- Consultation psychologique
- Anxiété
- Stress
- Difficultés émotionnelles
- Dépression
- Problèmes relationnels
- Difficultés familiales
- Deuil
- Burn-out
- Troubles du sommeil
- Difficultés scolaires
- Difficultés professionnelles
- Accompagnement psychologique
- Thérapie individuelle
- Thérapie de couple
- Thérapie familiale

RHUMATOLOGIE
- Consultation de rhumatologie
- Douleurs articulaires
- Douleurs musculaires
- Mal de dos
- Lombalgie
- Cervicalgie
- Sciatique
- Arthrose
- Arthrite
- Polyarthrite rhumatoïde
- Goutte
- Ostéoporose
- Douleurs inflammatoires
- Raideur articulaire
- Gonflement articulaire
- Tendinite
- Bursite
- Fibromyalgie
- Suivi d'une maladie rhumatismale

ORTHOPEDIE / TRAUMATOLOGIE
- Consultation orthopédique
- Douleur osseuse
- Douleur articulaire
- Traumatisme
- Fracture
- Entorse
- Luxation
- Douleur du genou
- Douleur de l'épaule
- Douleur de la hanche
- Douleur de la cheville
- Douleur du poignet
- Douleur du coude
- Douleur du pied
- Mal de dos
- Hernie discale
- Déformation osseuse
- Problème ligamentaire
- Problème tendineux
- Suivi après fracture
- Contrôle après chirurgie orthopédique

CHIRURGIE GENERALE
- Consultation de chirurgie générale
- Avis chirurgical
- Douleur abdominale nécessitant un avis chirurgical
- Hernie
- Masse / boule
- Kyste
- Lipome
- Plaie
- Abcès
- Problème de cicatrice
- Suivi post-opératoire
- Consultation préopératoire
- Contrôle بعد intervention
- Ablation de lésion
- Avis sur une intervention

CHIRURGIE VASCULAIRE
- Consultation de chirurgie vasculaire
- Varices
- Jambes lourdes
- Douleurs des jambes
- Gonflement des jambes
- Troubles de circulation
- Artériopathie
- Plaie vasculaire
- Ulcère
- Anévrisme
- Suivi après intervention vasculaire

NEUROCHIRURGIE
- Consultation de neurochirurgie
- Hernie discale
- Compression nerveuse
- Douleur rachidienne
- Sciatique
- Douleur cervicale
- Traumatisme crânien
- Tumeur cérébrale
- Tumeur rachidienne
- Avis neurochirurgical
- Suivi après chirurgie

CHIRURGIE PEDIATRIQUE
- Consultation de chirurgie pédiatrique
- Hernie chez l'enfant
- Masse / kyste
- Malformation
- Douleur abdominale chirurgicale
- Traumatisme
- Suivi post-opératoire
- Avis chirurgical pédiatrique

ONCOLOGIE
- Consultation d'oncologie
- Bilan oncologique
- Avis spécialisé
- Suivi d'un cancer
- Suivi après traitement
- Chimiothérapie
- Thérapie ciblée
- Immunothérapie
- Radiothérapie
- Gestion des effets secondaires
- Douleurs liées au cancer
- Soins de support
- Surveillance après rémission

HEMATOLOGIE
- Consultation d'hématologie
- Anémie
- Fatigue liée à une anémie
- Anomalie de la numération sanguine
- Troubles de la coagulation
- Saignements inhabituels
- Thrombose
- Leucopénie
- Thrombopénie
- Maladie du sang
- Suivi d'une maladie hématologique
- Suivi après traitement

INFECTIOLOGIE
- Consultation d'infectiologie
- Infection persistante
- Fièvre prolongée
- Infection bactérienne
- Infection virale
- Infection parasitaire
- Infection tropicale
- Hépatite infectieuse
- Infection sexuellement transmissible
- VIH
- Tuberculose
- Infection récidivante
- Avis sur antibiothérapie
- Suivi d'une infection complexe

ALLERGOLOGIE / IMMUNOLOGIE
- Consultation d'allergologie
- Allergie alimentaire
- Allergie médicamenteuse
- Allergie respiratoire
- Rhinite allergique
- Asthme allergique
- Urticaire
- Eczéma allergique
- Réaction allergique
- Bilan allergologique
- Tests allergologiques
- Désensibilisation
- Allergies saisonnières

MEDECINE PHYSIQUE ET READAPTATION
- Consultation de réadaptation
- Rééducation après accident
- Rééducation après AVC
- Rééducation après chirurgie
- Douleurs chroniques
- Handicap moteur
- Troubles de la mobilité
- Réadaptation fonctionnelle
- Rééducation musculosquelettique
- Rééducation neurologique
- Prescription de rééducation
- Évaluation fonctionnelle

MEDECINE DU TRAVAIL
- Visite médicale d'embauche
- Visite périodique
- Visite de reprise
- Visite de pré-reprise
- Aptitude au poste
- Inaptitude au poste
- Évaluation des risques professionnels
- Accident du travail
- Maladie professionnelle
- Prévention en santé au travail

MEDECINE DU SPORT
- Certificat médical sportif
- Bilan médico-sportif
- Aptitude sportive
- Douleur liée au sport
- Blessure sportive
- Entorse sportive
- Tendinite sportive
- Reprise après blessure
- Suivi du sportif
- Évaluation de la condition physique

GERIATRIE
- Consultation gériatrique
- Bilan global de la personne âgée
- Troubles de la mémoire
- Chutes répétées
- Troubles de l'équilibre
- Fragilité
- Perte d'autonomie
- Polymédication
- Dénutrition
- Troubles cognitifs
- Suivi des maladies chroniques
- Évaluation gériatrique

DENTAIRE / ODONTOLOGIE
- Consultation dentaire
- Douleur dentaire
- Carie
- Sensibilité dentaire
- Infection dentaire
- Abcès dentaire
- Saignement des gencives
- Gingivite
- Parodontite
- Détartrage
- Contrôle dentaire
- Extraction dentaire
- Dent cassée
- Prothèse dentaire
- Implant dentaire
- Orthodontie
- Contrôle orthodontique
- Urgence dentaire

STOMATOLOGIE / CHIRURGIE MAXILLO-FACIALE
- Douleur maxillo-faciale
- Traumatisme facial
- Fracture faciale
- Kyste buccal
- Lésion buccale
- Problème de mâchoire
- Articulation temporo-mandibulaire
- Extraction complexe
- Avis chirurgical maxillo-facial
- Suivi post-opératoire

RADIOLOGIE / IMAGERIE MEDICALE
- Échographie
- Échographie abdominale
- Échographie pelvienne
- Échographie obstétricale
- Échographie mammaire
- Radiographie
- Scanner / TDM
- IRM
- Mammographie
- Doppler
- Imagerie musculosquelettique
- Imagerie neurologique
- Imagerie thoracique
- Imagerie abdominale
- Imagerie urologique
- Imagerie vasculaire
- Contrôle / suivi radiologique

ANESTHESIOLOGIE
- Consultation pré-anesthésique
- Évaluation avant chirurgie
- Évaluation des risques anesthésiques
- Consultation de douleur
- Prise en charge de douleur chronique
- Suivi après anesthésie

MEDECINE D'URGENCE
- Douleur thoracique
- Difficulté respiratoire
- Malaise
- Perte de connaissance
- Traumatisme
- Plaie
- Brûlure
- Douleur abdominale aiguë
- Réaction allergique
- Fièvre importante
- Intoxication
- Crise d'asthme
- Convulsion
- Saignement important

MEDECINE ESTHETIQUE
- Consultation de médecine esthétique
- Acné et cicatrices
- Taches pigmentaires
- Rides
- Relâchement cutané
- Cicatrices
- Chute de cheveux
- Traitement esthétique du visage
- Traitement esthétique du corps
- Évaluation esthétique

PLASTIQUE / RECONSTRUCTRICE
- Consultation de chirurgie plastique
- Reconstruction après traumatisme
- Reconstruction après brûlure
- Cicatrice
- Malformation
- Reconstruction après cancer
- Plaie complexe
- Avis chirurgical
- Suivi post-opératoire

NUTRITION / DIETETIQUE
- Consultation nutritionnelle
- Surpoids
- Obésité
- Perte de poids
- Prise de poids
- Diabète et nutrition
- Cholestérol et nutrition
- Nutrition pendant la grossesse
- Nutrition de l'enfant
- Troubles alimentaires
- Rééquilibrage alimentaire
- Nutrition sportive
- Dénutrition

HEPATOLOGIE
- Consultation d'hépatologie
- Bilan hépatique
- Hépatite
- Stéatose hépatique
- Cirrhose
- Fibrose hépatique
- Anomalie des enzymes hépatiques
- Douleur hépatique
- Suivi d'une maladie du foie
- Suivi après traitement

MEDECINE DU SOMMEIL
- Consultation du sommeil
- Insomnie
- Somnolence diurne
- Ronflement
- Apnée du sommeil
- Réveils nocturnes
- Troubles du rythme veille-sommeil
- Fatigue chronique liée au sommeil
- Bilan du sommeil

GENETIQUE MEDICALE
- Consultation de génétique
- Conseil génétique
- Antécédents familiaux
- Suspicion de maladie génétique
- Maladie génétique connue
- Diagnostic génétique
- Préconception et génétique
- Diagnostic prénatal génétique

MEDECINE NUCLEAIRE
- Scintigraphie
- TEP / PET scan
- Bilan oncologique en médecine nucléaire
- Bilan thyroïdien
- Suivi thérapeutique
- Exploration fonctionnelle

PATHOLOGIE / ANATOMOPATHOLOGIE
- Analyse anatomopathologique
- Biopsie
- Cytologie
- Analyse d'une pièce opératoire
- Deuxième avis anatomopathologique

SANTE SEXUELLE
- Consultation de santé sexuelle
- Contraception
- Infection sexuellement transmissible
- Dépistage IST
- Troubles de l'érection
- Éjaculation précoce
- Baisse de libido
- Douleurs sexuelles
- Troubles sexuels féminins
- Infertilité
- Conseil en santé sexuelle

REPRODUCTION / FERTILITE
- Bilan de fertilité
- Infertilité féminine
- Infertilité masculine
- Consultation préconceptionnelle
- Suivi de traitement de fertilité
- Bilan hormonal de fertilité
- Conseil en fertilité
- Assistance médicale à la procréation

SOINS PALLIATIFS / DOULEUR
- Consultation douleur
- Douleur chronique
- Douleur cancéreuse
- Douleur neuropathique
- Douleur musculosquelettique
- Soins palliatifs
- Accompagnement de fin de vie
- Gestion des symptômes

AUTRES MOTIFS TRANSVERSAUX
- Deuxième avis médical
- Lecture d'analyses médicales
- Lecture d'un compte rendu d'imagerie
- Renouvellement d'ordonnance
- Demande d'orientation vers un spécialiste
- Consultation de suivi
- Consultation après hospitalisation
- Consultation après passage aux urgences
- Bilan préopératoire
- Bilan post-opératoire
- Certificat médical
- Avis médical
- Demande de dossier médical
- Autre motif
"""

# Parse sections
sections = {}
current_sec = None
for line in raw_text.strip().split("\n"):
    line = line.strip()
    if not line:
        continue
    if line.startswith("-"):
        if current_sec:
            sections[current_sec].append(line[1:].strip())
    elif not line.startswith("TABIBI") and not line.startswith("OBJECTIF") and not line.startswith("Ce fichier") and not line.startswith("Un médecin") and not line.startswith("Les libellés") and not line.startswith("STRUCTURE") and not line.startswith("SPECIALITE") and not line.startswith("Référentiel"):
        current_sec = line
        if current_sec not in sections:
            sections[current_sec] = []

print(f"Parsed {len(sections)} sections:")
total_motifs = sum(len(m) for m in sections.values())
print(f"Total motifs: {total_motifs}")
for s, m in sections.items():
    print(f"  {s}: {len(m)} motifs")
