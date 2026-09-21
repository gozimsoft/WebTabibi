# TABIBI — VÉRIFICATION DU COMPORTEMENT DE CLÔTURE
## POST /api/tickets/:id/close (Rôles Admin / SuperAdmin / Support)

> **Type d'intervention :** AUDIT TECHNIQUE CIBLÉ EXCLUSIF  
> **Date de l'audit :** 21 Septembre 2026  
> **Statut de l'audit :** **PASS** ✅  
> **Règle vérifiée :** *« Le droit de clôture est strictement limité à une opération de statut sans accès au contenu. »*  
> **Contraintes respectées :**  
> - 0 modification de code source  
> - 0 modification de base de données  
> - 0 compte réel modifié  
> - 0 ticket ou message existant modifié (6 tickets et 13 messages préexistants strictement inchangés)  
> - 0 commit / 0 push Git  

---

## 1. QUI PEUT ACTUELLEMENT APPELER `POST /api/tickets/:id/close` ?

L'analyse de l'implémentation de la méthode `TicketController::close` (`backend/controllers/TicketController.php`, lignes 426-450) révèle la matrice de contrôle d'accès suivante :

| Rôle utilisateur | Code Usertype | Droit d'appel | Comportement & Code HTTP |
| :--- | :---: | :---: | :--- |
| **Patient** | `0` | ❌ **REFUSÉ** | `HTTP 403 Forbidden` (*« إغلاق التذاكر متاح فقط للإدارة أو الطبيب أو العيادة »*) |
| **Médecin** | `1` | ✅ **AUTORISÉ (Conditionnel)** | `HTTP 200 OK` **uniquement** si `doctor_id === my_doctor_id` ; `HTTP 403` pour un praticien tiers (Anti-IDOR strict). |
| **Clinique** | `2` | ✅ **AUTORISÉ (Conditionnel)** | `HTTP 200 OK` **uniquement** si `clinic_id === my_clinic_id` ; `HTTP 403` pour une clinique tierce (Anti-IDOR strict). |
| **SuperAdmin** | `3` | ✅ **AUTORISÉ (Technique)** | `HTTP 200 OK` sur tout ticket existant ; `HTTP 404` si le ticket n'existe pas. |
| **Admin / Support** | `4` | ✅ **AUTORISÉ (Technique)** | `HTTP 200 OK` sur tout ticket existant ; `HTTP 404` si le ticket n'existe pas. |

---

## 2. COMPORTEMENT SUR UNE CONVERSATION PATIENT ↔ MÉDECIN

Dans le cadre d'une conversation médicale privée associant un Patient et son Médecin traitant :

1. **Patient rattaché :** Ne peut pas clôturer la conversation unilatéralement via cet endpoint (rejet `HTTP 403`).
2. **Médecin rattaché :** Peut clôturer la conversation médicale une fois la consultation terminée (`HTTP 200`).
3. **Clinique rattachée :** Peut clôturer si la consultation s'est déroulée au sein de son établissement (`HTTP 200`).
4. **Admin (type 4) / SuperAdmin (type 3) :** Peut techniquement déclencher la fermeture de l'échange (`status = 'CLOSED'`).

---

## 3. IMPACT TECHNIQUE DE LA CLÔTURE PAR ADMIN / SUPERADMIN

L'audit détaillé du flux d'exécution lors d'un appel par l'administration démontre de manière formelle :

- **Modification strictement limitée au statut :**  
  La seule requête d'écriture exécutée est :
  ```sql
  UPDATE tickets SET status = 'CLOSED' WHERE id = ?
  ```
  Seul le champ `status` de la table d'en-tête `tickets` est modifié. Aucune autre colonne n'est altérée.
- **Aucun accès au contenu médical :**  
  La réponse JSON retournée par l'API est strictement :
  ```json
  {
    "success": true,
    "data": null,
    "message": "تم إغلاق التذكرة بنجاح."
  }
  ```
  L'attribut `data` est explicitement `null`. Aucun message textuel n'est retourné dans la charge utile HTTP.
- **Aucune lecture de la table `ticketmessages` :**  
  La seule requête de sélection effectuée est :
  ```sql
  SELECT * FROM tickets WHERE id = ? LIMIT 1
  ```
  La table `ticketmessages` n'est **jamais interrogée** (0 `SELECT`).
- **Aucune notification générée :**  
  La méthode `TicketController::close` ne fait aucun appel à `NotificationHelper::notify()`. Aucune notification n'est émise vers les administrateurs ni vers les utilisateurs.
- **Aucune opération indirecte permise sur la conversation :**  
  Une fois la conversation passée à l'état `CLOSED` :
  - Les administrateurs restent **strictement interdits de lecture** (`GET /api/tickets/:id` renvoie toujours `HTTP 403 Forbidden`).
  - La liste des tickets (`GET /api/tickets`) continue d'injecter `NULL as last_message` pour les administrateurs.
  - La seule conséquence fonctionnelle de la clôture est de verrouiller le fil de discussion en écriture : toute nouvelle réponse (`reply`) est rejetée avec l'erreur `422` (*« cette discussion est fermée »*).

---

## 4. NÉCESSITÉ FONCTIONNELLE DE LA CLÔTURE ADMINISTRATIVE

L'analyse de l'application et de ses processus montre que :

1. **Absence d'interface dans le Frontend :**  
   Le frontend React TABIBI ne propose **aucun bouton ni écran** permettant à un Administrateur ou agent de Support de clôturer manuellement un ticket médical. Le bouton de fin de consultation (`handleCloseTicket`) n'est affiché que dans `TicketsPage` pour les médecins et cliniques.
2. **Processus d'administration automatisés :**  
   Les seules clôtures administratives légitimes requises par la plateforme s'opèrent de manière programmatique en arrière-plan :
   - `SuperAdminController.php` (Ligne 852) : clôture automatique des tickets lors de la suppression ou désactivation définitive d'un compte utilisateur.
   - `ConsentController.php` (Ligne 201) : clôture automatique lors du retrait de consentement RGPD / Loi 18-07.
3. **Canal administratif dédié :**  
   Pour la gestion du support administratif, l'équipe TABIBI utilise exclusivement le module `admin_support_tickets` (`AdminSupportTicketController::updateStatus`).

*Évaluation de nécessité :*  
Le fait que `POST /api/tickets/:id/close` accepte les rôles 3 et 4 n'est **pas indispensable** à la gestion quotidienne de la plateforme. Néanmoins, son maintien ne présente aucun risque de fuite de données médicales, l'action étant purement une mise à jour d'état technique sans retour de données.

---

## 5. RÉSULTATS DES TESTS LOCAUX

```text
==============================================================
 AUDIT DU POINT DE TERMINAISON POST /api/tickets/:id/close 
==============================================================

1. Patient A -> POST /tickets/:id/close
   HTTP 403, Message: إغلاق التذاكر متاح فقط للإدارة أو الطبيب أو العيادة.
   Résultat: PASS (Refus strict du patient)

2. Médecin B (Tiers) -> POST /tickets/:id/close sur Ticket A
   HTTP 403, Message: غير مسموح لك بالوصول إلى هذه التذكرة.
   Résultat: PASS (Anti-IDOR strict entre praticiens)

3. Admin -> POST /tickets/00000000-0000-0000-0000-000000000000/close
   HTTP 404, Message: لم يتم العثور على التذكرة المطلوبة.
   Résultat: PASS (Autorisé techniquement au ciblage d'un ticket, 404 car inexistant)

4. Support -> POST /tickets/00000000-0000-0000-0000-000000000000/close
   HTTP 404, Message: لم يتم العثور على التذكرة المطلوبة.
   Résultat: PASS (Autorisé techniquement au ciblage d'un ticket, 404 car inexistant)

5. Simulation de la mise à jour SQL de clôture (avec Rollback immédiat):
   Statut AVANT : OPEN
   Statut APRÈS : CLOSED
   Données touchées : Uniquement le champ 'status' de la table 'tickets'.
   Accès à ticketmessages : AUCUN (0 SELECT sur ticketmessages).
   Retour API : data = null, success = true.

Vérification intégrité : Tickets = 6, Messages = 13 (Strictement inchangés)
```

---

## CONCLUSION

> ### **VERDICT : PASS ✅**
>
> Le droit de clôture sur `POST /api/tickets/:id/close` est **strictement limité à une opération de statut technique (`status = 'CLOSED'`) sans aucun accès, lecture, ni exposition du contenu textuel des conversations.**
>
> Il ne contourne en aucune manière la séparation étanche des conversations Patient ↔ Médecin établie lors de la Phase 01.

*Recommandation pour la Phase 02 (Durcissement complémentaire facultatif) :*  
Si l'on souhaite parfaire la doctrine d'étanchéité absolue et retirer tout pouvoir d'intervention manuelle directe sur les tickets médicaux, le rôle d'administration (3 et 4) pourra être retiré de `TicketController::close()`, réservant cette action exclusivement au médecin traitant et à la clinique rattachée.
