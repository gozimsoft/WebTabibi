---
id: "cert-aptitude-dispense"
title: "Certificats médicaux légaux (Aptitude physique, Dispense scolaire/travail, Repos)"
category: "certificats-rapports"
tags: ["certificats", "aptitude", "dispense", "repos", "arret-travail", "constantes", "medico-legal"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecins"]
symptoms_doctor:
  - "Comment éditer un certificat d'aptitude sportive rapidement ?"
  - "Comment inscrire le nombre de jours d'arrêt de travail en chiffres et en lettres ?"
  - "Le certificat doit-il comporter les constantes mesurées ?"
keywords: ["certificat médical", "arrêt de travail", "dispense d'effort", "bonne santé apparente", "attestation"]
escalation_threshold: "Non-conformité des mentions légales obligatoires selon le Code de Déontologie Médicale algérien."
muraqib_ref: null
---

# Certificats médicaux légaux (Aptitude, Dispense et Repos)

## 1. Objectif
Assister le médecin dans la rédaction rapide de certificats médicaux conformes aux exigences du Conseil de l'Ordre des Médecins : certificat d'aptitude physique et sportive, certificat de bonne santé apparente pour l'embauche ou le mariage, dispense scolaire et arrêt de travail (repos médical).

## 2. Où trouver la fonction
- Depuis la consultation : Onglet **« Documents & Certificats »** > Bouton **« Nouveau Certificat »**.
- Depuis le dossier patient : Menu **Historique > Certificats délivrés**.

## 3. Modèles types de certificats disponibles
1. **Certificat d'Aptitude Physique & Sportive :** Attestation d'absence de contre-indication apparente à la pratique sportive.
2. **Certificat Médical de Repos (Arrêt de travail) :** Mention légale de la durée du repos (en chiffres et obligatoirement transcrit en toutes lettres).
3. **Certificat de Bonne Santé Apparente :** Recrutement, stage, internat, examen prénuptial.
4. **Certificat de Dispense / Aménagement scolaire :** Dispense temporaire d'éducation physique ou port de charges.

## 4. Étapes exactes
1. Choisir le modèle de certificat désiré dans la liste déroulante.
2. Les constantes pertinentes relevées lors de l'examen du jour s'insèrent automatiquement :
   - *Tension artérielle, Pouls, Auscultation cardio-pulmonaire, Acuité visuelle*.
3. Pour un arrêt de travail : indiquer le nombre de jours (ex: `3 jours`). Le système écrit automatiquement : *« un repos médical de trois (03) jours à compter de ce jour »*.
4. Renseigner la mention finale légale obligatoire : *« Certificat délivré à la demande de l'intéressé(e) pour servir et valoir ce que de droit »*.
5. Cliquer sur **« Valider & Imprimer »**.

## 5. Ce que le médecin doit voir à l'écran
- Un rendu fidèle au format officiel A4 ou demi-A4, reprenant l'en-tête officiel du cabinet, le numéro d'inscription à l'Ordre et la zone de signature/cachet.

## 6. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, dans l'onglet 'Certificats', sélectionnez 'Certificat de repos' ou 'Aptitude sportive'. Vos constantes du jour s'intègrent automatiquement et les jours d'arrêt s'écrivent d'office en lettres pour respecter la réglementation des caisses de sécurité sociale (CNAS/CASNOS)."*

## 7. Vérification technique (Niveau 2)
- [ ] Confirmer que le document généré est archivé sous format PDF dans la table `patientfiles` avec `TypePrescription = 0` ou `5`.
- [ ] Vérifier que les variables dynamiques (`{PATIENT_NAME}`, `{DATE}`, `{DAYS_WORDS}`) sont correctement substituées.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Les jours d'arrêt ne sont pas transcrits en toutes lettres dans le document final.
- **Escalader à N3 :** Blocage d'impression spécifique aux modèles personnalisés demandés par une commission médicale.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| La date de début d'arrêt est dans le passé | Date rétroactive saisie par erreur | Rectifier la date de début pour correspondre au jour effectif de consultation |
| Le cachet n'apparaît pas à l'impression | Cachet numérique non importé dans le profil | Scanner et importer la signature dans Paramètres > Profil médecin |
