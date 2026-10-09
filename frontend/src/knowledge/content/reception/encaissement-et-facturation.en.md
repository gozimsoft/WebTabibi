---
id: "rec-encaissement-facturation"
title: "Fee Collection, Partial Payments and Consultation Receipts"
category: "reception"
tags: ["reception", "collection", "fees", "billing", "receipt", "cash", "cash-drawer"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "secretaire", "gestionnaire"]
symptoms_doctor:
  - "The patient paid part of the fee and promised to clear the balance next visit"
  - "How do I print an official receipt for a patient requesting insurance reimbursement?"
  - "Discrepancy detected between physical cash and system recorded revenue"
keywords: ["collection", "payment", "receipt", "fees", "cash register", "invoice"]
escalation_threshold: "Mathematical discrepancy in daily cash balance or loss of recorded financial transactions."
muraqib_ref: null
---

# Fee Collection, Partial Payments and Consultation Receipts

## 1. Objective
Manage medical fee collection, track diverse payment channels (Cash, Bank Check, CIB/Edahabia cards), handle split payments and outstanding debts, and issue official financial receipts for patients and health insurers.

## 2. Where to Find the Feature
- **On Front Desk:** Patient queue card upon consultation completion > Button **"Collect Fee ($)"**.
- **Inside Patient Record:** Tab **"Financial & Invoicing"** > History of transactions and balances.
- **Daily Cash Drawer:** Sidebar navigation > **"Daily Cash Management"**.

## 3. Step-by-Step Procedure
### A. Processing Full Payment
1. When consultation ends and the patient reaches checkout, click **"Collect Fee"**.
2. The total balance calculated from standard consultation fee and clinical acts displays (e.g., `3000 DZD`).
3. Select payment method: *Cash*, *Bank Card*, or *Check*.
4. Click **"Confirm Payment"**.
5. Click **"Print Receipt"** to provide patient with an official voucher.

### B. Recording Partial Payment or Debt (Credit Balance)
1. If the patient pays partially (e.g., pays `2000 DZD` out of `3000 DZD` due):
2. Input the actual cash tendered into the *Amount Paid* field.
3. The system automatically computes remaining debt: `1000 DZD` and commits it to the patient ledger.
4. On subsequent clinic visits, an amber warning badge notifies reception of outstanding arrears.

## 4. What the Secretary Should See on Screen
- Itemized billing breakdown of clinical acts performed.
- Official printable receipt displaying: Invoice serial number, Patient Name, Date and Time, Doctor Name, and Fee in numerals and written words.
- Live tally of daily cash drawer totals in the top navigation bar.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Hello! To register a payment, click the fee collection button on the patient's card. If they only pay part of the total, enter the collected cash into 'Amount Paid', and TABIBI will automatically record the remainder as an outstanding balance, alerting you on their next visit. You can print an official receipt with one click."*

## 6. Technical Verification (Level 2)
- [ ] Verify transaction entry in database table `payments` with columns `amount_paid`, `amount_due`, and `payment_method`.
- [ ] Confirm strict serial continuity of `invoice_number` without missing numbering gaps.
- [ ] Inspect RBAC permissions: Does the secretary account possess authority to void or amend payment entries?

## 7. Advanced Diagnostics & System (Level 3)
If ledger reports diverge from calculated transaction sums:
1. Execute reconciliation query: `SELECT SUM(amount_paid) FROM payments WHERE DATE(created_at) = CURRENT_DATE`.
2. Inspect whether payments were tied to soft-deleted encounters.
3. Review audit trail in `cash_drawer_events`.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Need to void or reverse an erroneous payment ticket entered by reception.
- **Escalate to L3:** Ledger computation bug corrupting historical accounts receivable.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Patient requests detailed itemized insurance bill | Insurance reimbursement requirement | Click "Print Options" > Select "Detailed Certified Invoice" |
| Registered as cash instead of bank check | Operator selection error | Open transaction record and amend payment method before closing daily register |
| Daily register displays cash deficit | Unlogged payment or calculation slip | Reconcile payments line-by-line against physical cash drawer |
