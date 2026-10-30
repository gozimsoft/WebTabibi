---
id: "par-personnalisation-en-tete"
title: "Letterhead Customization, Practice Contact Details and Prescription Logos"
category: "parametres"
tags: ["settings", "letterhead", "logo", "prescription", "clinic-details", "medical-board", "layout"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "administrateur", "medecin"]
symptoms_doctor:
  - "How do I embed my clinic logo onto prescriptions and official certificates?"
  - "I need to update the phone number or practice address printed on prescriptions"
  - "The printout overlaps with the pre-printed header on our physical stationery sheets"
keywords: ["letterhead", "clinic logo", "pre-printed stationery", "address", "registration number", "layout"]
escalation_threshold: "Image rendering pipeline failure preventing logo upload or distorting printed page geometry."
muraqib_ref: null
---

# Letterhead Customization, Practice Details and Prescription Logos

## 1. Objective
Allow the physician to customize the practice visual brand identity, upload high-resolution clinic logos, and configure contact details and medical syndicate registration numbers, with full support for blank sheets or commercial pre-printed stationery.

## 2. Where to Find the Feature
- **Sidebar Navigation:** Section **"General Settings"** > Tab **"Clinic Letterhead & Layout"**.
- **Logo Upload Button:** Action button **"Upload Practice Logo (PNG / JPG)"**.
- **Real-Time Canvas:** Interactive WYSIWYG preview updating dynamically before saving.

## 3. Step-by-Step Procedure
### A. Configuring Physician and Practice Demographics
1. Open **"Settings"** > **"Prescription Header"**.
2. Complete bilingual French and Arabic identity fields:
   - **Physician Name, Surname & Specialty:** (e.g., *Dr. Ahmed Benali - Cardiologist*).
   - **Academic Credentials:** (e.g., *Former Assistant Professor, Algiers Faculty of Medicine*).
   - **Practice Physical Address, Phone Numbers, and Consultation Hours**.
   - **Medical Board Registration Number (N° Ordre des Médecins)**.
3. Click **"Save Settings"**.

### B. Logo Configuration & Pre-printed Stationery Margins
1. Click **"Upload Logo"** and select a high-resolution transparent PNG graphic.
2. If the clinic utilizes pre-printed physical paper stocks produced by an offset print house:
   - Toggle on **"Use Pre-printed Letterhead (Papier pré-imprimé)"**.
   - Input top margin offset (e.g., `50 mm`) and bottom margin offset: TABIBI will suppress digital header elements and print strictly prescription medication lines in the designated open space!
3. Execute a validation test print via **"Print Test Page"**.

## 4. What the Doctor Should See on Screen
- A live split preview updating synchronously with each keystroke.
- Font styling controls allowing selection between Cairo, Arial, or Times typography with fine-tuned font sizing.
- Symmetrical layout preview showing bilingual Arabic (RTL) on right and French (LTR) on left headers.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, you can customize your header via Settings > Prescription Header. Input your specialty, contact numbers, and upload your clinic logo in PNG format. If you use physical pre-printed stationery from a print shop, enable 'Pre-printed Stationery'—TABIBI will automatically clear the top margins and print medications cleanly into your paper's blank area."*

## 6. Technical Verification (Level 2)
- [ ] Inspect database table `clinic_settings`: Verify persistence in `header_fr`, `header_ar`, `logo_path`, and `margin_top_mm`.
- [ ] Confirm automated aspect ratio preservation during logo image ingestion.
- [ ] Verify print template styles across `rx_template_a4.html` and `rx_template_a5.html`.

## 7. Advanced Diagnostics & System (Level 3)
If printed medication text collides with pre-printed graphic margins:
1. Verify `margin-top` CSS injection in headless Chromium print driver.
2. Verify print dialog scaling factors in Windows OS driver: Ensure scale is locked to `100%` rather than `Fit to page`.
3. Check that the logo asset path resides in a world-readable application assets folder.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Physician needs precision caliper calibration assistance to align specialized custom paper dimensions.
- **Escalate to L3:** Crash in PDF layout compiler when assembling bilingual mixed-direction headers.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Logo prints as a solid black rectangle | Image formatted in CMYK color space | Convert image to standard sRGB 24-bit PNG file |
| Old telephone number still prints on prescription | Changes saved in draft without clicking Save | Edit number and click "Save Letterhead Changes" at bottom |
| Second blank page ejected on every print | Excessive bottom margin forcing line wrap | Decrease prescription font size or lower bottom margin offset |
