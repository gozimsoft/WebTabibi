---
id: "v2-reseau-serveur"
title: "الشبكة المحلية، المزامنة وخادم العيادة المركزي (خارطة طريق الإصدار V2)"
category: "reseau-serveur"
tags: ["شبكة-سيرفر", "v2", "lan", "خادم", "منافذ", "بدون-إنترنت", "مراقب"]
version: "0.1.0"
tabibi_version: ">=2.4.0"
status: "A_VERIFIER"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L3"]
target_audience: ["tech", "infra"]
symptoms_doctor:
  - "جهاز السكرتارية لم يعد يتصل بجهاز الطبيب"
  - "رسالة : تعذر الاتصال بالخادم المحلي للعيادة"
keywords: ["ip ثابت", "منفذ 5000", "mysql", "lan", "جدار حماية"]
escalation_threshold: "عطل عام في خادم قاعدة البيانات المحلي للعيادة."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/network"
---

# الشبكة المحلية، المزامنة وخادم العيادة المركزي

> ⚠️ **فئة مستهدفة في الإصدار V2 — قسم قيد الصياغة المركزية**
> لتفادي أي تعارض تقني، تم توثيق قواعد هندسة الشبكة المحلية وإعدادات الخادم المركزي في منصة مراقب (Muraqib).

## بنية الشبكة النموذجية في العيادة
- **خادم طبيبي المحلي (Server) :** يستمع على المنفذ `5000` (Express API) والمنفذ `3306` (MySQL).
- **أجهزة الاستقبال والعيادات (Clients) :** تتصل بعنوان IP الثابت للخادم على الشبكة المحلية (مثل: `192.168.1.100:5000`).

## التوثيق المرجعي الرسمي
- 🔗 **توثيق مراقب للشبكة والخادم :** [https://muraqib.stellarsoft.dz/docs/infra/network](https://muraqib.stellarsoft.dz/docs/infra/network)
