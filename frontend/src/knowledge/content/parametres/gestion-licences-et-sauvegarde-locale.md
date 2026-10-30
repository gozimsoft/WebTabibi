---
id: "par-licences-sauvegarde"
title: "Activation de la licence TABIBI, période d'essai et déclenchement d'une sauvegarde manuelle"
category: "parametres"
tags: ["parametres", "licence", "activation", "cle-produit", "sauvegarde-manuelle", "export", "cle-usb"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "administrateurs", "commercial"]
symptoms_doctor:
  - "Un message m'indique 'Votre licence expire dans 5 jours'"
  - "Comment entrer ma nouvelle clé d'activation annuelle ?"
  - "Je veux sauvegarder toute ma base sur ma clé USB avant de partir en vacances"
keywords: ["clé de licence", "activation", "expiration", "backup immédiat", "clé USB", "sécurisation"]
escalation_threshold: "Clé de licence cryptographique rejetée malgré une signature valide émise par le serveur central de licences Stellarsoft."
muraqib_ref: null
---

# Activation de la licence TABIBI et sauvegarde manuelle

## 1. Objectif
Guider le médecin ou le gestionnaire pour saisir sa clé d'activation officielle TABIBI (`ActivationModal.tsx`), vérifier la validité de sa formule (Essai, Licence Standard, Multi-Postes, Pack Dentaire), et lancer une sauvegarde manuelle complète de la base de données sur support amovible (clé USB / disque externe).

## 2. Où trouver la fonction
- Pour la licence : **Paramètres > À propos & Licence** (ou lien direct lors de l'alerte d'expiration).
- Pour la sauvegarde : **Paramètres > Sauvegarde & Données > Bouton « Sauvegarder maintenant »**.

## 3. Étapes exactes pour activer une licence
1. Récupérer la clé d'activation transmise par le service commercial Stellarsoft (format: `TBB-XXXX-XXXX-XXXX-XXXX`).
2. Ouvrir **Paramètres > Licence**.
3. Cliquer sur **« Saisir une clé d'activation »**.
4. Coller la clé dans le champ prévu et cliquer sur **« Activer le produit »**.
5. Le système contacte le serveur de licences ou valide l'empreinte cryptographique locale hors-ligne :
   - Affichage de la date de validité (ex: *Licence active jusqu'au 31/12/2027*).
   - Déblocage immédiat de tous les modules contractuels.

## 4. Déclencher une sauvegarde manuelle sur clé USB (moins d'une minute)
1. Brancher une clé USB propre sur l'ordinateur principal (serveur du cabinet).
2. Aller dans **Paramètres > Sauvegarde & Données**.
3. Cliquer sur **« Sauvegarder maintenant »**.
4. Choisir la destination : sélectionner la clé USB (ex: `E:\Sauvegardes_Tabibi\`).
5. TABIBI génère un fichier SQL compressé et chiffré horodaté :
   `tabibi_backup_clinic_2026-10-03_13h00.sql.gz`.
6. Une fois le message de succès affiché, éjecter la clé USB en toute sécurité.

## 5. Ce que l'utilisateur doit voir à l'écran
- Sur la licence : une coche verte avec mention **« LICENCE VALIDE »** et le nombre de jours restants.
- Lors de la sauvegarde : une jauge de progression suivie de : *« Sauvegarde réussie (Taille: 42 Mo). 100% des dossiers et ordonnances archivés. »*

## 6. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, pour renouveler votre licence, allez dans Paramètres > Licence, puis collez la clé que nous vous avons envoyée par SMS ou e-mail. Pour faire une copie de sécurité sur clé USB avant vos congés, allez dans Paramètres > Sauvegarde et cliquez simplement sur 'Sauvegarder maintenant'."*

## 7. Vérification technique (Niveau 2)
- [ ] Confirmer que la clé d'activation respecte le chiffrement RSA/HMAC validé dans `server/src/routes/license.ts`.
- [ ] Vérifier que l'utilitaire `mysqldump` s'exécute correctement sans lever d'erreur de permissions disque.

## 8. Diagnostic avancé & Système (Niveau 3)
Si l'activation échoue avec l'erreur `Invalid machine fingerprint` :
1. L'empreinte matérielle (Hardware ID / MAC Address) a changé (ex: changement de carte mère ou clonage de disque).
2. Régénérer une clé de réactivation liée au nouveau Machine GUID via la console d'administration Muraqib [Gestion des Licences](file:///muraqib/docs/licenses-fleet).

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Message « Clé de licence invalide » | Erreur de frappe (espaces en trop ou confusion entre 0 et O) | Copier/coller directement la clé sans insérer d'espace |
| Message « Espace disque insuffisant sur la clé USB » | Clé USB saturée par d'autres fichiers | Insérer une clé USB disposant d'au moins 2 Go d'espace libre |
| La sauvegarde s'interrompt à 50% | Verrouillage de la base par une consultation restée ouverte | Fermer les consultations en cours avant de lancer la sauvegarde |
