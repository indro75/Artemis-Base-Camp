# Use of AI in this Project

**Challenge:** NASA International Space Apps Challenge 2026 — *Build a Junior Astronaut Mission Trainer*  
**Project:** *Artemis Base Camp: Junior Outpost Commander*  
**License:** Apache-2.0  

---

## 1. AI Tools Utilized
- **Claude / Gemini via Coding Agent:** Assisting with project scaffolding, CSS design token structuring, semantic HTML5 structure, and code documentation.

---

## 2. What the AI Did
- **Frontend Architecture & Scaffolding:** Drafted semantic layouts for the Commander HUD, resource gauge cards, and interactive modal overlays in `index.html`.
- **CSS Styling & Accessibility Formatting:** Assisted in implementing high-contrast space HUD design variables, accessible color tokens, minimum 44px touch targets, and `@media (prefers-reduced-motion: reduce)` rules in `style.css`.
- **Audio Synthesizer Boilerplate:** Generated the baseline Web Audio API oscillator synthesis mappings for sound effects (clicks, alarms, power diverts, chimes) in `app.js` without external audio libraries.

---

## 3. What the AI Did NOT Do (Human Creative & Scientific Work)
- **Deterministic Science Calculation Engine (`src/compute/sim.js`):** All mathematical models, resource balance equations, battery drain rates, ECLSS recycling equations, day/night diurnal temperature curves, and radiation dose accumulation formulas were authored and verified by our team.
- **NASA Dataset Curation & Evidence Grounding:** All datasets and parameters were curated directly from official NASA archives:
  - **NASA DONKI Space Weather Service:** Coronal Mass Ejection (CME) and Solar Particle Event (SPE) proton flux parameters (`NASA-DONKI-CME-SPE-2024`).
  - **NASA OSDR & GeneLab:** Biological radiation thresholds (NCRP-153 / NASA-STD-3001) and spaceflight physiological responses (`NASA-OSDR-STUDY-87`, `NASA-OSDR-GLDS-48`).
  - **NASA PDS Lunar Reconnaissance Orbiter (LRO):** LOLA topography and Diviner thermal mapping for Shackleton Crater South Pole (`NASA-PDS-LRO-LOLA-GDR`, `NASA-PDS-LRO-DIVINER-GDR`).
  - **NASA Mars Perseverance Rover:** MEDA weather telemetry and MOXIE in-situ atmospheric oxygen synthesis benchmarks (`NASA-PDS-M2020-MEDA`, `NASA-PDS-M2020-MOXIE-CAL`).
  - **NASA Kilopower Project:** Surface fission power output baselines (`NASA-STMD-KRUSTY-2019`).
- **Game Design & "No Free Lunch" Educational Doctrine:** The trade-off mechanics (protecting astronauts from high-energy SPEs vs. maintaining life support scrubbers vs. harvesting scientific discoveries) were designed specifically to teach kids aged 7–12 real space engineering trade-offs.

---

## 4. Prompts Used
- *"Scaffold a zero-dependency, browser-playable educational space outpost simulator for kids aged 7-12 based on NASA Space Apps 2026 Challenge 03 standards."*
- *"Ensure strict separation of deterministic compute logic (src/compute/sim.js) and presentation layer, with offline-first fallback and zero account creation."*
- *"Incorporate real NASA open datasets: DONKI space weather events, OSDR GeneLab radiation thresholds in mSv, LRO Shackleton Crater thermal profiles, and Perseverance MOXIE oxygen generation."*

