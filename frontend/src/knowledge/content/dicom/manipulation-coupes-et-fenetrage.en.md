---
id: "dcm-coupes-fenetrage"
title: "Slice Navigation, Windowing (WW/WL) and Radiological Measurement Tools"
category: "dicom"
tags: ["dicom", "windowing", "hounsfield", "zoom", "measurement", "angles", "slices", "contrast"]
version: "1.0.0"
tabibi_version: ">=2.4.0"
status: "VALIDE"
last_validated: "2026-10-03"
author: "support-team"
reviewer: "stellarsoft-lead"
level_support: ["L1", "L2"]
target_audience: ["support", "medecin"]
symptoms_doctor:
  - "How do I switch contrast presets between bone and soft tissue on a CT scan?"
  - "How do I measure the exact size of a lesion or anatomical distance in millimeters?"
  - "Scrolling through sequential volumetric slices is choppy or laggy"
keywords: ["windowing", "WW/WL", "Hounsfield units", "distance measurement", "Cobb angle", "slice stack"]
escalation_threshold: "Pixel spacing calibration failure yielding mathematically incorrect clinical distance measurements."
muraqib_ref: null
---

# Slice Navigation, Windowing (WW/WL) and Measurement Tools

## 1. Objective
Allow practitioners to navigate volumetric radiological slices smoothly, apply standard windowing presets (Bone, Lung, Brain, Soft Tissue), and leverage diagnostic measuring tools (Distance caliper, Cobb angle, ROI Hounsfield Unit density).

## 2. Where to Find the Feature
- **Full DICOM Viewer:** Open any imaging study > Click **"Full-screen Mode"**.
- **Tool Palette:** Top viewport toolbar (Ruler, Angle, Windowing, Crosshairs, Ellipse ROI).
- **Presets Dropdown:** Action selector **"Windowing Presets"** (Bone, Mediastinum, Lung, Brain).

## 3. Step-by-Step Procedure
### A. Slice Stack Navigation and Zoom/Pan
1. Use the mouse scroll wheel to scrub smoothly through sequential slices (Slice 1 to N).
2. Right-click and drag vertically for step zoom.
3. Middle-click and drag to pan viewport.

### B. Adjusting Window Width and Window Level (WW/WL)
1. Left-click and drag across viewport:
   - Drag horizontally: Adjusts Window Width (WW - Contrast).
   - Drag vertically: Adjusts Window Level (WL - Brightness).
2. Or activate an instant preset:
   - **Bone Window:** `WW: 2000 / WL: 350` (bone cortical definition).
   - **Lung Window:** `WW: 1500 / WL: -600` (pulmonary parenchyma).
   - **Soft Tissue:** `WW: 350 / WL: 50`.

### C. Distance Caliper and Density (HU) Measurement
1. Click **"Ruler"** icon: Click origin then endpoint to measure exact distance in millimeters (grounded in DICOM `Pixel Spacing`).
2. Click **"ROI / HU Density"** icon: Draw an ellipse over the tissue to derive mean Hounsfield Units (differentiating fluid, fat, or solid masses).

## 4. What the Doctor Should See on Screen
- Viewport HUD showing slice index, slice thickness, WW/WL numbers, and physical scale bar.
- Bright yellow calipers with millimeter readings and angle arcs.
- Fluid 60fps scrolling powered by native WebGL hardware acceleration.

## 5. Level 1 Support Quick Response
> 📞 **What support must immediately answer over the phone:**
> *"Doctor, to adjust visualization, pick a preset from the top dropdown (Bone, Lung, or Soft Tissue), or simply left-click and drag over the image to tune contrast in real time. Use the mouse wheel to flip through slices, and click the ruler icon at the top to measure any distance in millimeters."*

## 6. Technical Verification (Level 2)
- [ ] Confirm parser evaluates `Rescale Slope` and `Rescale Intercept` tags: `HU = PixelValue * Slope + Intercept`.
- [ ] Verify spatial calibration against tag `Pixel Spacing (0028,0030)`.
- [ ] Ensure WebGL shader pipeline executes on host GPU without fallback CPU software emulation.

## 7. Advanced Diagnostics & System (Level 3)
If viewport renders solid black or corrupt pixels:
1. Validate bit depth: Ensure correct handling of `16-bit Signed` versus `Unsigned` pixel representation.
2. Inspect CornerstoneJS / WebGL context errors in developer console.
3. Verify host graphics driver installation on the Windows PC.

## 8. When to Escalate to Level 2 / Level 3
- **Escalate to L2:** Physician requests custom protocol presets for specialized radiological interventions.
- **Escalate to L3:** Distance measurements diverge from physical reality due to asymmetric pixel aspect ratio tag interpretation.

## 9. Frequently Asked Questions & Troubleshooting
| Issue | Cause | Fix |
| :--- | :--- | :--- |
| Caliper displays pixels instead of mm | Raw image missing calibration tags | Anatomic calibration unavailable if omitted in originating scanner metadata |
| Slice scrub skips slices erratically | Excessive mouse wheel sensitivity | Adjust mouse scroll speed in DICOM preferences |
| Image washed out solid white | Windowing dragged beyond threshold | Click "Reset WW/WL" to restore default study values |
