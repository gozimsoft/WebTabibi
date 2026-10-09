---
id: "call-webcam-non-detectee"
title: "Scénario d'urgence : Webcam ou scanner non détecté lors de la consultation"
category: "le-medecin-appelle"
tags: ["le-medecin-appelle", "urgence", "webcam", "scanner", "peripherique", "usb", "support-n1"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2", "L3"]
target_audience: ["support"]
symptoms_doctor:
  - "L'écran de la caméra reste tout noir quand je clique sur Numériser"
  - "Le logiciel m'affiche 'Aucun périphérique vidéo trouvé'"
  - "Je dois photographier la gorge ou la radio et la caméra est bloquée"
keywords: ["caméra USB", "écran noir", "non reconnue", "accès refusé", "autorisation Windows"]
escalation_threshold: "Caméra matérielle défaillante ou conflit avec une carte d'acquisition endoscopique spécifique."
muraqib_ref: null
---

# Scénario d'urgence : Webcam ou scanner non détecté

## 1. Objectif
Procéder au diagnostic matériel et logiciel immédiat lorsqu'une caméra USB de numérisation ou un numériseur refuse de s'initialiser dans TABIBI, avec solution de contournement sans interrompre la consultation.

## 2. Où trouver la fonction
- Dans le volet **Fichiers & Examens** de la consultation > Bouton **« Numériser / Webcam »**.
- Dans la fenêtre **Archives Médicales** > Bouton **« Numériser / Webcam »**.

## 3. Étapes exactes (Diagnostic chronométré N1)
1. **Étape 1 (15 secondes) — Vérifier le cache physique & conflit d'application :**
   - Demander au médecin de vérifier si le clapet physique de confidentialité de la webcam n'est pas fermé !
   - Demander de fermer immédiatement toute application susceptible d'utiliser la caméra en arrière-plan : **WhatsApp Desktop, Skype, Zoom, Teams, navigateur avec onglet visioconférence**.
2. **Étape 2 (20 secondes) — Débrancher / Rebrancher la prise USB :**
   - Déconnecter le câble USB de la caméra et le brancher sur un port USB situé directement sur la carte mère (à l'arrière de l'unité centrale ou port USB direct sans hub).
   - Cliquer sur le bouton **« Arrêter la caméra »** puis **« Relancer »** dans TABIBI.
3. **Étape 3 (Solution de contournement immédiate) :**
   - Si la webcam refuse toujours : demander au médecin de prendre la photo avec son smartphone, de se l'envoyer par e-mail ou WhatsApp Web, et de cliquer sur **« Téléverser un fichier »**.

## 4. Ce que le médecin doit voir à l'écran
- Dès la détection : une diode lumineuse verte ou bleue s'allume sur le boîtier de la webcam.
- La vidéo en direct s'affiche au format 16:9 ou 4:3 avec le bouton bleu « Capturer ».

## 5. Réponse rapide Support (Niveau 1)
> 📞 **Ce que le support doit répondre immédiatement au téléphone :**
> *"Docteur, vérifiez d'abord si un clapet en plastique ne masque pas la lentille de la caméra. Si l'écran reste noir, débranchez la prise USB et rebranchez-la sur un autre port, puis fermez toute application comme WhatsApp qui pourrait verrouiller la caméra. Si besoin, vous pouvez utiliser le bouton 'Téléverser' pour charger une photo prise avec votre téléphone."*

## 6. Vérification technique (Niveau 2)
- [ ] Ouvrir l'application standard **« Caméra »** de Windows pour vérifier si l'image s'affiche en dehors de TABIBI.
- [ ] Vérifier les paramètres de confidentialité Windows :
  - `Paramètres Windows > Confidentialité & Sécurité > Caméra`.
  - S'assurer que l'option **« Autoriser les applications de bureau à accéder à votre caméra »** est activée (`Activé`).
- [ ] Dans le Gestionnaire de périphériques (`devmgmt.msc`), vérifier qu'aucun triangle jaune d'erreur de pilote ne figure sous « Périphériques d'acquisition d'images ».

## 7. Diagnostic avancé & Système (Niveau 3)
Si la caméra est reconnue par Windows mais rejetée par Chromium / Electron :
1. Vérifier si l'antivirus du cabinet (ex: Kaspersky, Bitdefender, Avast) ne dispose pas d'une protection webcam active qui bloque le processus `tabibi.exe`.
2. Ajouter une exception dans l'antivirus pour autoriser l'accès à la webcam par TABIBI.

## 8. Quand escalader au Niveau 2 / Niveau 3
- **Escalader à N2 :** La caméra fonctionne dans l'application Caméra de Windows mais renvoie une erreur `NotReadableError` dans TABIBI.
- **Escalader à N3 :** Blocage persistant causé par une politique de sécurité de groupe (GPO) ou un antivirus d'entreprise.

## 9. Questions fréquentes & Erreurs possibles
| Erreur constatée | Cause fréquente | Solution immédiate |
| :--- | :--- | :--- |
| Message « PermissionDeniedError » | Accès caméra refusé dans les autorisations de l'application | Activer l'accès caméra dans les paramètres de confidentialité Windows |
| Image saccadée ou déformée | Hub USB sous-alimenté ou caméra branchée sur port USB 1.1 | Brancher la caméra directement sur un port USB 3.0 (bleu) du PC |
| L'image est floue lors de la capture d'un texte | Mise au point automatique bloquée ou objectif trop près | Reculer le document à 25-30 cm de l'objectif |
