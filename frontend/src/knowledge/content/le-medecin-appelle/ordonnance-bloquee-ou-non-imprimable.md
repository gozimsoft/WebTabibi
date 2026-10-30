---
id: "call-ordonnance-bloquee"
title: "Scénario d'urgence : Ordonnance bloquée ou impossible à imprimer"
category: "le-medecin-appelle"
tags: ["le-medecin-appelle", "urgence", "ordonnance", "imprimante", "blocage", "support-n1"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2", "L3"]
target_audience: ["support"]
symptoms_doctor:
  - "Je clique sur Imprimer et rien ne se passe !"
  - "Mon patient attend devant mon bureau et l'ordonnance ne sort pas"
  - "Le bouton Imprimer tourne dans le vide"
keywords: ["bloqué", "impression", "papier", "patient devant moi", "spooler"]
escalation_threshold: "L'imprimante ne répond sur aucun logiciel Windows (Word/Bloc-notes) ou plantage du spooler d'impression Windows."
muraqib_ref: null
---

# Scénario d'urgence : Ordonnance bloquée ou impossible à imprimer

## 1. Objectif
Fournir au technicien de support Niveau 1 un arbre de décision chronométré pour débloquer le praticien en moins de 90 secondes alors que son patient est assis devant son bureau.

## 2. Où trouver la fonction
- Écran de consultation > Volet Ordonnance > Bouton vert **« Imprimer »**.
- Raccourci clavier de secours : **`Ctrl + P`**.

## 3. Étapes exactes (Procédure d'urgence N1)
1. **Étape 1 (10 secondes) — Calmer et contourner immédiatement :**
   - Demander au médecin d'appuyer simultanément sur les touches **`Ctrl + P`**.
   - Si la boîte d'impression Windows s'ouvre : choisir l'imprimante et lancer l'impression.
2. **Étape 2 (20 secondes) — Vérifier le statut de l'imprimante physique :**
   - Demander : *« Docteur, est-ce que le voyant vert de l'imprimante est allumé ou clignote-t-il en orange ? Y a-t-il du papier dans le bac ? »*
   - Vérifier si un câble USB ne s'est pas débranché lors d'un mouvement de bureau.
3. **Étape 3 (30 secondes) — Sauvegarde PDF de secours :**
   - Si l'imprimante physique est hors-service : cliquer sur le bouton **« Exporter en PDF »**.
   - Le médecin peut immédiatement envoyer l'ordonnance par e-mail au patient ou l'ouvrir pour l'imprimer depuis un autre poste du cabinet.

## 4. Ce que le médecin doit voir à l'écran
- Lors d'une impression normale : la fenêtre de prévisualisation TABIBI apparaît avec les coordonnées du praticien, la liste des médicaments numérotés et le bouton bleu « Confirmer l'impression ».
- En cas de blocage : le curseur de la souris peut afficher une roue d'attente.

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Ne vous inquiétez pas docteur, votre ordonnance est bien enregistrée en mémoire, vos données ne sont pas perdues. Faites le raccourci clavier 'Ctrl + P' pour forcer l'impression directe. Si l'imprimante est coincée, cliquez sur 'Exporter PDF' pour donner le document à votre patient sans attendre."*

## 6. Vérification technique (Niveau 2)
- [ ] Vérifier dans la file d'attente d'impression Windows (`Paramètres > Imprimantes > Ouvrir la file d'attente`) s'il y a un document bloqué en état « Erreur ».
- [ ] Annuler tous les documents bloqués dans la file d'attente Windows.
- [ ] Redémarrer le spouleur d'impression Windows :
  ```cmd
  net stop spooler
  net start spooler
  ```

## 7. Diagnostic avancé & Système (Niveau 3)
Si TABIBI plante au moment d'appeler l'API d'impression Electron :
1. Consulter les logs de l'application : `C:\Users\[User]\AppData\Roaming\Tabibi\logs\main.log`.
2. Vérifier si un pilote d'imprimante virtuel tiers (ex: vieux driver PDF ou télécopie) est défini par défaut dans Windows à la place de l'imprimante réelle du cabinet.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Le raccourci `Ctrl + P` ne réagit pas du tout et l'écran de consultation reste figé.
- **Escalader à N3 :** Le service Spouleur de Windows plante en boucle dès que TABIBI est lancé.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Rien ne sort et aucun message d'erreur | L'impression part sur une imprimante éteinte ou virtuelle (OneNote / Fax) | Choisir explicitement l'imprimante Brother/Canon/HP dans la liste déroulante |
| L'ordonnance sort avec des caractères bizarres | Pilote d'imprimante générique inadapté | Installer le pilote constructeur officiel de l'imprimante |
| Message « Imprimante hors ligne » | Câble USB débranché ou imprimante en veille profonde | Appuyer sur le bouton Marche de l'imprimante ou rebrancher le câble USB |
