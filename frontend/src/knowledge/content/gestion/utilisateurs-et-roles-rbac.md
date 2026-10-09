---
id: "ges-utilisateurs-rbac"
title: "Gestion des utilisateurs, profils praticiens et contrôle d'accès RBAC"
category: "gestion"
tags: ["gestion", "utilisateurs", "roles", "rbac", "permissions", "secretaire", "medecin-remplacant", "securite"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "administrateurs"]
symptoms_doctor:
  - "Comment créer un compte d'accès pour ma nouvelle secrétaire ?"
  - "La secrétaire ne doit pas avoir accès aux ordonnances confidentielles"
  - "Mon remplaçant doit pouvoir consulter sans voir les statistiques financières"
keywords: ["mot de passe", "droits d'accès", "médecin remplaçant", "sécurité", "nouveau compte"]
escalation_threshold: "Verrouillage accidentel de tous les comptes administrateurs d'un cabinet."
muraqib_ref: null
---

# Gestion des utilisateurs et contrôle d'accès (RBAC)

## 1. Objectif
Présenter la politique de sécurité et de contrôle d'accès basé sur les rôles (RBAC - Role-Based Access Control) de TABIBI : création de comptes pour le personnel (secrétaires, infirmiers, médecins associés, remplaçants), réinitialisation de mots de passe et cloisonnement strict du secret médical.

## 2. Où trouver la fonction
- Menu principal gauche : **Paramètres > Utilisateurs & Permissions**.
- Restriction : Accessible exclusivement au rôle **Administrateur** (`admin`).

## 3. Rôles système standardisés
TABIBI intègre 4 profils de droits prédéfinis :
1. **Médecin Titulaire (Full Access) :** Accès clinique illimité, validation d'ordonnances, rapports financiers, gestion des comptes et configuration.
2. **Médecin Remplaçant / Associé :** Accès clinique complet aux dossiers patients et consultations, mais **aucun accès** aux données financières globales du cabinet ni à la gestion des utilisateurs.
3. **Secrétaire Médicale :** Gestion de l'accueil, prise de rendez-vous, modification de l'état civil, encaissement des honoraires, mais **aucun accès** aux observations médicales confidentielles ni aux diagnostics.
4. **Infirmier / Assistant :** Saisie des constantes vitales, réalisation de pansements et actes infirmiers, sans droit de prescription.

## 4. Étapes exactes pour créer un compte utilisateur
1. Se connecter avec le compte administrateur du cabinet.
2. Accéder à **Paramètres > Utilisateurs**.
3. Cliquer sur **« + Ajouter un utilisateur »**.
4. Saisir :
   - **Nom complet :** (ex: *Khadidja Belhadj*).
   - **Identifiant de connexion :** (ex: *secretaire1*).
   - **Mot de passe initial sécurisé :** (au moins 8 caractères).
   - **Rôle attribué :** Choisir *Secrétaire médicale*.
5. Cliquer sur **« Enregistrer »** : le compte est actif immédiatement.

## 5. Ce que l'utilisateur doit voir à l'écran
- Chaque utilisateur connecté voit son nom affiché en haut à droite avec son avatar de rôle.
- Sur le compte de la secrétaire : les menus sensibles comme « Gestion financière » et « Dossier clinique intime » sont automatiquement masqués de l'arborescence.

## 6. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Pour créer un accès à votre secrétaire, connectez-vous avec votre compte médecin, allez dans Paramètres puis 'Utilisateurs'. Cliquez sur '+ Ajouter un utilisateur' et choisissez le rôle 'Secrétaire'. Ses accès seront automatiquement bridés pour protéger le secret médical de vos patients."*

## 7. Vérification technique (Niveau 2)
- [ ] Confirmer dans la table `users` que le mot de passe est haché de manière irréversible via l'algorithme `bcrypt` (la colonne `Password` commence par `$2a$` ou `$2b$`).
- [ ] Vérifier que la table `roles_permissions` associe les bonnes clés de permissions (`patients.manage`, `prescriptions.sign`, `reports.view`).

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** Un utilisateur ne parvient pas à se connecter malgré la réinitialisation de son mot de passe.
- **Escalader à N3 :** Nécessité d'exécuter un script d'urgence de déverrouillage du compte administrateur suite à la perte du mot de passe maître du cabinet.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Message « Identifiant déjà utilisé » | Un autre compte porte déjà ce nom d'utilisateur | Choisir un identifiant distinct (ex: `secretaire_matin`) |
| La secrétaire ne peut pas encaisser | Permission `billing.manage` non cochée sur le rôle | Vérifier les permissions du rôle Secrétaire dans Paramètres |
| Mot de passe administrateur oublié | Perte du mot de passe maître du docteur | Utiliser la clé de secours fournie sur le certificat de licence |
