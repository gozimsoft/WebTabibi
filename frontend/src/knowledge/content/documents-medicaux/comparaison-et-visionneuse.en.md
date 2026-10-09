---
id: "doc-comparaison-visionneuse"
title: "Full-Screen Viewer, Zoom, Rotation and Side-by-Side Comparison (Key C)"
category: "documents-medicaux"
tags: ["documents", "viewer", "comparison", "zoom", "rotation", "annotations", "shortcut-c"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecin"]
symptoms_doctor:
  - "How do I compare two chest X-rays of a patient taken one year apart?"
  - "The scanned lab sheet is upside down, how do I rotate and zoom in?"
  - "The side-by-side comparison shortcut does not respond when pressing key C"
keywords: ["comparison", "zoom", "rotate", "full-screen", "radiology", "shortcut"]
escalation_threshold: "Canvas/WebGL interactive viewer rendering failure preventing clinical evaluation."
muraqib_ref: null
---

# Full-Screen Viewer, Zoom, Rotation and Side-by-Side Comparison

## 1. Objective
Allow the practitioner to evaluate high-resolution medical images and reports, pan and zoom into fine anatomical details, rotate poorly oriented scans, and perform simultaneous side-by-side comparative analysis using the **`C`** keyboard shortcut.

## 2. Where to Find the Feature
- **Launch Viewer:** Double-click any image or report in the document repository.
- **Tool Palette:** Floating toolbar docked at the bottom (Zoom In/Out, Rotate 90°, Reset, Full-screen).
- **Split Comparison Mode:** Click action button **"Side-by-Side Comparison"** or press shortcut key **`C`**.

## 3. Step-by-Step Procedure
### A. Viewing and Panning/Zooming
1. Double click target medical asset to open full-screen canvas.
2. Use mouse scroll wheel for smooth step zoom up to 800%.
3. Click and drag (Pan) to navigate fine diagnostic zones.
4. Click rotate icon (`↻` or `↺`) to reorient incorrectly scanned sheets.

### B. Side-by-Side Comparative Mode (Key C)
1. While inspecting an active patient document, press key **`C`**.
2. The viewport splits vertically into two synchronized panes:
   - **Right Pane:** The currently inspected document.
   - **Left Pane:** Empty selector awaiting reference document.
3. Select an earlier examination from the bottom chronological carousel.
4. Pan and zoom each side independently, or toggle **"Sync Pan/Zoom"** to evaluate radiological progression.

## 4. What the Doctor Should See on Screen
- A high-contrast dark medical canvas designed to minimize optical fatigue.
- Crisp split view with comparative date and modality banners.
- Keyboard shortcut indicators: `Esc` to dismiss viewer, `C` to toggle side-by-side comparison.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, to compare two examinations side-by-side, open the first image and simply press 'C' on your keyboard. Your screen will split instantly, allowing you to select an older test from the bottom timeline. You can zoom in with your mouse wheel and rotate pages using the bottom toolbar."*

## 6. Technical Verification (Level 2)
- [ ] Confirm GPU Hardware Acceleration is active in Electron to ensure 60fps canvas panning.
- [ ] Audit keyboard event listener in `documentViewer.tsx`: Verify keycode handling ignores inputs when active in textarea elements.
- [ ] Verify viewer requests raw high-resolution assets rather than degraded preview thumbnails.

## 7. Advanced Diagnostics & System (Level 3)
If canvas appears black or blank in comparison mode:
1. Check display adapter driver stability and GPU acceleration flags inside Electron runtime.
2. Verify available physical RAM when loading concurrent uncompressed high-resolution images (e.g. > `4000x3000`).
3. Check browser console for WebGL `context lost` event notifications.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Physician requests custom default contrast and brightness curves for plain radiography.
- **Escalate to L3:** Crash of Electron main renderer process during heavy multi-image comparisons.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Pressing C types letter into clinical notes | Text focus active inside input field | Click anywhere on the viewer canvas or use the toolbar icon |
| Rotation resets upon closing document | "Save Orientation" was not clicked | Click the lock/save orientation icon to permanently commit rotation |
| Unable to compare PDF with JPEG | Legacy viewer limitation | TABIBI v2.4+ fully supports mixed-format comparison |
