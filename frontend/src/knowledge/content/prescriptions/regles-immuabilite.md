---
id: "presc-immuabilite"
title: "Règles d'immuabilité des ordonnances et prescriptions"
category: "prescriptions"
tags: ["prescription", "ordonnance", "immuabilite", "medico-legal", "securite", "cloture"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "onboarding", "tech"]
symptoms_doctor:
  - "Je veux changer un médicament sur une ordonnance déjà imprimée ce matin"
  - "Pourquoi l'icône de suppression est grisée sur les médicaments ?"
  - "Le pharmacien m'appelle pour changer la forme, comment modifier l'ordonnance ?"
keywords: ["verrouillage", "interdiction de modifier", "intégrité", "médico-légal", "cachet"]
escalation_threshold: "Demande de déverrouillage manuel en base de données — STRICTEMENT INTERDIT par la politique produit sans accord juridique."
muraqib_ref: null
---

# Règles d'immuabilité des ordonnances et prescriptions

## 1. Objectif
Exposer le cadre légal et technique de l'immuabilité dans TABIBI : pourquoi une ordonnance validée et imprimée ne peut plus être éditée directement, et comment créer légalement un correctif ou un avenant conforme aux exigences de l'Ordre des Médecins.

## 2. Où trouver la fonction
- Dans l'onglet **Prescriptions** de la consultation.
- Dans le sous-menu historique du patient : **Historique > Ordonnances délivrées**.
- En haut de l'ordonnance validée : Badge de statut **« Validée & Verrouillée »** avec le bouton d'action **« Émettre un avenant / Annuler et remplacer »**.

## 3. Étapes exactes
1. Lorsque le praticien rédige l'ordonnance, tous les champs sont éditables (ajout, retrait de médicament, modification de posologie ou de durée).
2. Au moment de l'impression ou de la clôture de séance, le praticien clique sur **« Valider et Imprimer »**.
3. Le système enregistre l'empreinte numérique de l'ordonnance : celle-ci devient **immuable**.
4. Si une correction est requise ultérieurement :
   - Le médecin clique sur l'ordonnance verrouillée.
   - Il clique sur le bouton **« Créer un avenant / Rectificatif »**.
   - Le système clone les lignes existantes dans un nouveau document tracé mentionnant explicitement : *« Avenant annulant et remplaçant l'ordonnance du [Date] »*.

## 4. Ce que le médecin doit voir à l'écran
- Sur l'ordonnance clôturée : les boutons de modification directe (poubelle rouge, champs de texte) sont désactivés ou masqués.
- Un cadenas fermé apparaît à côté de la référence de l'ordonnance (ex: `ORD-2026-0842 🔒`).
- L'infobulle d'explication affiche : *« Document validé médico-légalement. Utilisez 'Créer un avenant' pour apporter une modification. »*

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, TABIBI applique strictement la réglementation médico-légale algérienne : une fois qu'une ordonnance a été validée ou imprimée, elle est verrouillée pour vous protéger juridiquement en cas de litige ou d'accident médicamenteux. Pour changer un médicament, cliquez simplement sur le bouton 'Créer un avenant' : cela génère une ordonnance rectificative officielle sans altérer l'historique légal."*

## 6. Vérification technique (Niveau 2)
- [ ] Dans la table `prescriptions`, vérifier que la colonne `IsLocked` ou `Status` est bien égale à `1`.
- [ ] Confirmer qu'aucune requête `UPDATE` n'est autorisée par l'API sur une ordonnance dont la consultation est clôturée (l'API renvoie un code HTTP 403 Forbidden).
- [ ] Vérifier que la table d'audit `prescription_audits` a bien consigné l'horodatage de validation et le nom du médecin.

## 7. Diagnostic avancé & Système (Niveau 3)
Si un praticien insiste pour « effacer complètement une fausse ordonnance » :
1. **Règle absolue :** Aucune suppression physique (`DELETE FROM prescriptions`) ne doit être opérée manuellement en base.
2. La procédure consiste à utiliser la fonction d'annulation motivée depuis l'interface, qui marque le champ `IsCancelled = 1` avec le motif saisi (ex: *« Erreur de saisie patient »*).

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le bouton « Créer un avenant » génère une erreur ou ne copie pas les médicaments existants.
- **Escalader à N3 :** Discordance constatée entre le contenu affiché à l'écran et le PDF généré pour l'impression.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Message « Modification interdite : document validé » | Le praticien tente d'éditer directement une ordonnance archivée | Cliquer sur le bouton « Avenant / Dupliquer » pour créer une nouvelle version |
| L'imprimante réimprime l'ancienne version | Le médecin a cliqué sur 'Historique' au lieu de l'avenant | Sélectionner la dernière ordonnance de la liste (portant le suffixe -V2 ou Avenant) |
| Le pharmacien refuse l'ordonnance modifiée à la main | Rature manuelle au stylo par le médecin | Imprimer l'avenant officiel généré par TABIBI avec le cachet et la mention rectificative |
