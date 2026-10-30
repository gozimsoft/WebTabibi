---
id: "v2-sauvegarde"
title: "النسخ الاحتياطي الآلي والاسترجاع بعد الكوارث (خارطة طريق الإصدار V2)"
category: "sauvegarde"
tags: ["نسخ-احتياطي", "v2", "backup", "استرجاع", "mysql-dump", "مراقب"]
version: "0.1.0"
tabibi_version: ">=2.4.0"
status: "A_VERIFIER"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L3"]
target_audience: ["tech", "infra"]
symptoms_doctor:
  - "كيف أقوم بنسخ احتياطي لكافة الملفات على مفتاح USB؟"
  - "القرص الصلب يظهر علامات بطء وتلف"
keywords: ["فلاش ديسك", "dump", "تصدير sql", "أمان البيانات"]
escalation_threshold: "تلف في القرص الصلب يستدعي استرجاعاً شاملاً من أرشيف مشفر."
muraqib_ref: "https://muraqib.stellarsoft.dz/docs/infra/backups"
---

# النسخ الاحتياطي الآلي والاسترجاع بعد الكوارث

> ⚠️ **فئة مستهدفة في الإصدار V2 — قسم قيد الصياغة المركزية**
> سياسات الاحتفاظ، سكريبتات النسخ الآلي لقواعد البيانات MySQL، وإجراءات استئناف النشاط بعد الكوارث موثقة في منصة مراقب.

## مبادئ الأمان الأساسية في طبيبي
- **النسخ المحلي التلقائي :** تفريغ آلي لقاعدة البيانات مشفر ومؤرخ يتم توليده كل مساء عند إغلاق العيادة.
- **قاعدة الحماية 3-2-1 :** الاحتفاظ بـ 3 نسخ من البيانات (القاعدة النشطة، نسخة على قرص محلي منفصل، ونسخة على وسيط تخزين خارجي محمي).

## التوثيق المرجعي الرسمي
- 🔗 **توثيق مراقب للنسخ الاحتياطي :** [https://muraqib.stellarsoft.dz/docs/infra/backups](https://muraqib.stellarsoft.dz/docs/infra/backups)
