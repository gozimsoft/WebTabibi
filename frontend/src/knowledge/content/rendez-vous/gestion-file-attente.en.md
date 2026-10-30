---
id: "rdv-file-attente"
title: "Waiting Queue Management & Real-time Secretary ↔ Doctor Sync"
category: "rendez-vous"
tags: ["appointment", "waiting-room", "sync", "secretary", "status", "real-time"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaire", "medecin"]
symptoms_doctor:
  - "The secretary checks in patients but they don't show on my screen"
  - "How can I see how many patients are in the waiting room without opening my door?"
  - "Patient status updates with a noticeable lag between stations"
keywords: ["waiting room", "sync", "local network", "check-in", "queue", "WebSocket"]
escalation_threshold: "Total failure of local real-time synchronization between front desk and doctor stations."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/network"
---

# Waiting Queue Management & Real-time Secretary ↔ Doctor Sync

## 1. Objective
Ensure seamless real-time coordination between the reception desk and the physician's examination room, reflecting patient arrivals, consultations, and checkout instantly across the local clinic network without page reloads.

## 2. Where to Find the Feature
- **On Secretary Station:** **"Reception & Waiting Room"** module > Arrival cards column.
- **On Doctor Station:** Quick Dashboard header or right-side panel > **"Current Waiting Room"**.

## 3. Step-by-Step Procedure
1. Patient arrives at the clinic reception.
2. Secretary searches their name and clicks **"Check In"**.
3. Patient instantly moves to the *"In Waiting Room"* column with exact arrival timestamp.
4. The patient card renders automatically on the doctor's monitor without pressing `F5`.
5. When ready, the doctor clicks **"Call Patient"** or **"Start Consultation"**.
6. Both screens immediately reflect the green *"In Consultation"* badge.
7. Upon consultation closure, the patient flows to the *"Completed"* column or checkout billing queue.

## 4. What the Doctor Should See on Screen
- A live badge in the top navigation showing current waiting count (e.g., `3 patients waiting`).
- An optional subtle audio chime when a new patient checks in.
- Ordered patient list sorted by check-in time or scheduled slot, with urgent emergencies highlighted in red.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, please verify that the network indicator icon at the bottom corner is green (connected to clinic server). If the secretary checked in a patient who isn't appearing, click the circular refresh icon above the queue list. If lag persists, we will immediately check LAN connectivity between the two computers."*

## 6. Technical Verification (Level 2)
- [ ] Verify active real-time channel (WebSocket / SSE) on port `5000`.
- [ ] Verify server host IP address: Check whether DHCP re-assigned a new IP address to the clinic server.
- [ ] Confirm Windows Defender Firewall is not blocking inbound TCP traffic on port `5000`.

## 7. Advanced Diagnostics & System (Level 3)
In the event of total real-time channel drop:
1. Run connectivity test: `ping 192.168.1.X` between front desk and physician terminals.
2. Check local Node.js backend daemon status via Muraqib service monitor or Windows Task Manager.
3. Inspect broadcast logs in `server/logs/socket.log` to identify disconnection loops.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Workstations function but updates only sync upon application restart.
- **Escalate to L3:** Widespread LAN outage with neither station able to reach the clinic database.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Audio chime disturbs consultation | Sound enabled in quiet practice environment | Navigate to Settings > Alerts > Disable "New arrival chime" |
| Urgent emergency must bypass queue | Need for exceptional manual triage | Drag-and-drop card to top position or click "High Priority Emergency" |
| Sync delays exceed 60 seconds | Unstable Wi-Fi signal between clinic rooms | Connect workstations via wired Ethernet (RJ45) cabling |
