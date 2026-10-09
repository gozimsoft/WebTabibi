---
id: "ges-rapports-activite"
title: "Practice Analytics Dashboard, Revenue Reports and Accounting Exports"
category: "gestion"
tags: ["management", "analytics", "revenue", "turnover", "accounting", "excel", "daily-report"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecin", "gestionnaire"]
symptoms_doctor:
  - "How do I extract a summary report of total clinic revenue for this month?"
  - "I want to track consultation volumes compared to the preceding quarter"
  - "How do I export financial transaction ledgers to Excel for my accountant?"
keywords: ["analytics", "revenue", "financial report", "accounting", "excel export", "practice volume"]
escalation_threshold: "Aggregation logic flaw causing discrepancies in tax ledgers or fiscal reporting."
muraqib_ref: null
---

# Practice Analytics Dashboard, Revenue Reports & Accounting Exports

## 1. Objective
Provide the practice owner or clinic manager with granular visibility into operational performance, clinical volumes (consultation counts, procedures executed, follow-ups), and gross daily/monthly revenue, complete with one-click accounting exports.

## 2. Where to Find the Feature
- **Sidebar Navigation:** Section **"Analytics & Statistics"** > **"Financial Dashboard"**.
- **Daily Register Closeout:** Top reception bar > Button **"Daily Register Closeout (Clôture)"**.
- **Export Trigger:** Report header > **"Export to Excel (XLSX / CSV)"** or **"Print PDF Summary"**.

## 3. Step-by-Step Procedure
### A. Reviewing Monthly Financial Analytics
1. Navigate to **"Analytics & Reports"** in the sidebar.
2. Select target temporal interval: *Today*, *This Week*, *Current Month*, or custom date boundaries.
3. The dashboard populates live key performance indicators:
   - **Gross Revenue Collected** partitioned by payment channel (Cash, Bank Checks, Electronic Cards).
   - **Outstanding Accounts Receivable (Patient Credit Balances)**.
   - **Encounter Volume & Daily Patient Averages**.
   - **Top Clinical Acts performed & Volume Share %**.

### B. Exporting Financial Ledgers for External Accounting
1. In the financial report screen, click **"Export to Excel"**.
2. The engine compiles an organized spreadsheet containing:
   - Transaction Timestamp and Receipt Voucher ID.
   - Patient Name & Dossier ID.
   - Clinical Acts and Service Nature.
   - Tendered Amount and Payment Instrument.
3. Save or forward file to the certified practice accountant.

## 4. What the Doctor Should See on Screen
- Visual analytics curves tracking monthly revenue trends against historical baselines.
- Daily cash drawer reconciliation tool aligning physical register cash with system ledgers.
- Role-based confidentiality: Financial pages restricted strictly to Administrator and Physician roles.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, to review practice income or export data, access 'Analytics & Reports' in your sidebar. Pick your desired month to view an itemized breakdown of cash, checks, and credit balances. Simply click 'Export to Excel' to generate a spreadsheet ready for your accountant."*

## 6. Technical Verification (Level 2)
- [ ] Inspect financial aggregation SQL: Confirm queries aggregate from table `payments` rather than raw uncollected quote estimates.
- [ ] Audit RBAC enforcement: Verify secretary accounts are barred from reviewing overall practice revenue if permission is revoked.
- [ ] Benchmark Excel generation performance across multi-thousand row datasets via `xlsx` library.

## 7. Advanced Diagnostics & System (Level 3)
If variances emerge between monthly aggregates and daily register closeout sums:
1. Audit transactions voided or refunded retroactively after daily closeout events.
2. Verify timezone consistency between server environment and database host.
3. Run ledger verification query: `SELECT payment_method, SUM(amount_paid) FROM payments WHERE ... GROUP BY payment_method`.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Clinic requests a custom tax reporting export layout tailored to local accounting standards.
- **Escalate to L3:** Database ledger mismatch caused by duplicate transaction posting in high-concurrency environments.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Report omits fees collected after 18:00 | Date filter capped to standard business hours | Set date interval to "Entire Day through 23:59" |
| Secretary cannot access revenue screen | Intentionally restricted by RBAC rules | Doctor can grant viewing privileges in User Administration if desired |
| Excel export produces error on open | Obsolete Office suite | Select CSV export format for universal software compatibility |
