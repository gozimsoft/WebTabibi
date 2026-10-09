---
id: "cert-lettres-liaison"
title: "Lettres de liaison, courriers d'orientation confrère et comptes rendus médicaux"
category: "certificats-rapports"
tags: ["lettre-liaison", "confrere", "orientation", "specialiste", "compte-rendu", "hospitalisation"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecins"]
symptoms_doctor:
  - "Comment adresser mon patient à un confrère cardiologue ou chirurgien ?"
  - "Est-ce que la lettre reprend automatiquement le traitement en cours ?"
  - "Comment envoyer le compte-rendu directement par e-mail au confrère ?"
keywords: ["cher confrère", "orientation spécialisée", "antécédents inclus", "courrier médical", "transfert"]
escalation_threshold: "Échec d'envoi par e-mail sécurisé dû à un paramétrage SMTP erroné."
muraqib_ref: null
---

# Lettres de liaison et courriers d'orientation confrère

## 1. Objectif
Rédiger des courriers d'adressage et de transfert médical professionnels destinés aux confrères spécialistes, cliniques ou services d'urgence : synthèse de l'examen clinique, motifs de l'orientation, inclusion automatique des antécédents et des traitements en cours, et envoi dématérialisé (`SendDocumentEmailModal.tsx`).

## 2. Où trouver la fonction
- En consultation active : Bouton **« Rédiger une lettre d'orientation / Liaison »** (`LiaisonLetterReport.tsx`).
- Depuis la fiche patient : Menu **Rapports & Liaisons**.

## 3. Étapes exactes
1. Cliquer sur **« Lettre de liaison »**.
2. Choisir le destinataire :
   - Sélectionner un confrère dans l'annuaire médical TABIBI (ex: *Dr. K. MEZIANI - Cardiologue*).
   - Ou saisir librement : *« À l'attention de notre cher confrère / Consœur »*.
3. Cocher les éléments du dossier à inclure automatiquement :
   - [x] **Motif d'adressage** (ex: *Suspicion d'angor d'effort atypique*).
   - [x] **Constantes du jour** (TA, Fréquence cardiaque, Poids).
   - [x] **Antécédents médicaux pertinents**.
   - [x] **Traitement médicamenteux actuellement en cours**.
   - [x] **Derniers résultats d'analyses (NFS, ECG, Créatinine)**.
4. Ajouter une conclusion ou question clinique spécifique (ex: *« Merci de réaliser une épreuve d'effort et de nous donner votre avis thérapeutique »*).
5. Cliquer sur **« Imprimer »** ou **« Envoyer par E-mail »** : le système génère un PDF crypté et l'envoie via la boîte SMTP du cabinet.

## 4. Ce que le médecin doit voir à l'écran
- Un courrier médical soigné avec formule de politesse confraternelle standardisée, date du jour, synthèse clinique claire et coordonnées de contact pour le retour d'information.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, dans la consultation, cliquez sur 'Lettre de liaison'. Vous n'avez pas besoin de recopier le traitement : cochez simplement la case 'Inclure traitement en cours' et TABIBI injecte automatiquement la liste des médicaments du patient dans le courrier au confrère."*

## 6. Vérification technique (Niveau 2)
- [ ] Confirmer dans `SendDocumentEmailModal.tsx` que les paramètres SMTP (serveur, port 587/465, authentification) sont validés.
- [ ] S'assurer que le fichier PDF généré est automatiquement indexé dans l'historique des documents du patient.

## 7. Diagnostic avancé & Système (Niveau 3)
Si l'envoi d'e-mail échoue avec l'erreur `SMTP connection timeout` :
1. Vérifier la configuration du serveur mail dans `server/src/routes/email.ts`.
2. S'assurer que le port `587` n'est pas bloqué par le fournisseur d'accès internet (FIBRE / 4G) du cabinet.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Les antécédents cochés n'apparaissent pas dans le corps du texte généré.
- **Escalader à N3 :** Blocage de sécurité SMTP imposé par le fournisseur de messagerie (ex: exigence d'un mot de passe d'application Google/Microsoft).

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Le nom du confrère n'apparaît pas dans la liste | Le confrère n'a pas été ajouté à l'annuaire | Taper son nom manuellement ou l'ajouter dans Paramètres > Annuaire confrères |
| Message « Échec de l'envoi e-mail » | Adresse e-mail du confrère invalide ou mot de passe SMTP expiré | Vérifier l'adresse e-mail ou imprimer la lettre en version papier |
