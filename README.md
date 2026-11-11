# Artemis Base Camp: Junior Outpost Commander
### NASA International Space Apps Challenge 2026 &bull; Challenge 03: *Build a Junior Astronaut Mission Trainer*

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Offline Capable](https://img.shields.io/badge/Offline--First-100%25-brightgreen.svg)]()
[![NASA Open Data](https://img.shields.io/badge/NASA%20Open%20Data-DONKI%20%7C%20OSDR%20%7C%20PDS-orange.svg)]()
[![Target Audience](https://img.shields.io/badge/Audience-Junior%20Cadets%20(Ages%207--12)-ff69b4.svg)]()

> *"In deep space survival, no choice is free. Every decision has an immediate and compounding resource cost, and every system is grounded in real NASA open science."*

---

## 🚀 Mission Overview
**Artemis Base Camp: Junior Outpost Commander** is a responsive, browser-playable deep space outpost survival and engineering simulator crafted specifically for young explorers aged 7–12. 

Junior commanders take charge of a deep space habitat on either the **Lunar South Pole (Shackleton Crater Rim)** or **Mars (Jezero Crater Paleolake Delta)**. Players command a 4-astronaut crew through 20 challenging Sols, balancing critical power allocation, life support chemistry, biological radiation thresholds, and surface science operations.

---

## 🎯 The "No Free Lunch" Engine
The simulator's deterministic core teaches real aerospace systems engineering: **you cannot maximize everything at once.**

1. **Power Grid (kW & Battery %):**
   - Sourced from dual deployable Solar Arrays and an uninterrupted 10kW surface Kilopower nuclear Stirling reactor.
   - Solar flux dynamically rises and falls with planetary diurnal cycles (28 Earth days on the Moon; 24h 39m Sol on Mars) and Martian atmospheric dust storms (optical depth $\tau$).
   - Brownouts occur if demand outstrips generation and backup battery storage runs dry.
2. **Life Support & ECLSS (Oxygen % & Water Liters):**
   - 4 crew members consume $\sim 0.84\text{ kg } \text{O}_2/\text{day}$ and $\sim 2.5\text{ L } \text{H}_2\text{O}/\text{day}$ each (NASA-STD-3001 ECLSS standards).
   - High power funds 96% closed-loop Sabatier water recovery and MOXIE $\text{CO}_2$ splitting.
   - Starving ECLSS power stalls scrubbers, causing toxic $\text{CO}_2$ buildup and dangerous hypoxia.
3. **Radiation & Crew Health (mSv Absorbed & EM Deflection):**
   - Passive regolith bulkheads provide a baseline $\sim 50\%$ attenuation.
   - High-voltage electromagnetic coils deflect up to an additional $45\%$ of charged protons.
   - Grounded in NASA OSDR Study 87 & NCRP-153 biological limits: cumulative doses over $20\text{ mSv}$ enter the Caution Zone; $>100\text{ mSv}$ triggers medical alerts.
4. **Research & Science Yield (Data Points):**
   - High-gain Deep Space Network (DSN) uplinks, core drills, and autonomous rovers generate vital scientific breakthroughs, but demand heavy electricity and accelerate mechanical wear.

---

## 🔬 Grounding in Real NASA Open Datasets
Every metric, solar calculation, and biological limit is grounded directly in official NASA open data:

| Subsystem / Metric | NASA Open Dataset & Mission | Dataset Identifier | Evidence Grounding & Purpose |
| :--- | :--- | :--- | :--- |
| **Space Weather & Flare Alerts** | NASA DONKI Space Weather Service | `NASA-DONKI-CME-SPE-2024` | Real X-class solar flare & CME shock fronts (1,450 km/s) setting radiation spike events. |
| **Spaceflight Biological Thresholds** | NASA Open Science Data Repository (OSDR) / GeneLab | `NASA-OSDR-STUDY-87` | DNA cellular stress, repair pathways, and mSv radiation limits for astronauts. |
| **Musculoskeletal Health** | NASA GeneLab Partial Gravity Studies | `NASA-OSDR-GLDS-48` | Bone mineral density and muscle degradation rates in 1/6th and 1/3rd gravity regimes. |
| **Lunar South Pole Topography** | Lunar Reconnaissance Orbiter (LOLA altimetry) | `NASA-PDS-LRO-LOLA-GDR` | Shackleton Crater rim elevation and Peaks of Eternal Light with 86% annual sunlight. |
| **Lunar Cryo Cold Traps** | LRO Diviner Lunar Radiometer Experiment | `NASA-PDS-LRO-DIVINER-GDR` | Coldest recorded solar system temperatures (-246°C / 27 K) where volatile water ice survives. |
| **Martian Weather & Dust** | Perseverance Mars Environmental Dynamics (MEDA) | `NASA-PDS-M2020-MEDA` | Surface temperatures (-10°C to -95°C), atmospheric pressure (610 Pa), and dust optical depth ($\tau$). |
| **In-Situ Oxygen Production** | Perseverance MOXIE Instrument | `NASA-PDS-M2020-MOXIE-CAL` | Solid oxide electrolysis producing 6-12 g/hr breathable oxygen from Martian $\text{CO}_2$. |
| **Fission Surface Power** | NASA Space Tech Mission Directorate (STMD) | `NASA-STMD-KRUSTY-2019` | 10 kW continuous Stirling nuclear reactor baseline. |

*Open the interactive **[🔬 NASA DATA PROVENANCE]** modal in the top navigation bar during gameplay to inspect full dataset IDs and access links.*

---

## 🎨 Kid-Friendly Usability (Ages 7–12) & Mobile Optimization
- **Highly Responsive Mobile Architecture:** Optimized for smartphones (iPhones, Android, Galaxy, Pixel), tablets (iPads, Galaxy Tab), and desktops with fluid, responsive CSS grids and safe-area insets (`env(safe-area-inset-top)` / `bottom`).
- **Mobile Navigation Drawer:** Clean hamburger drawer keeping the mobile header slim (<56px) while providing 1-tap access to *How to Play*, *Space Glossary*, *NASA Science Data*, and *Flight Badge Certificate*.
- **Touch-First Tactile Feedback:** Strict $\ge 44\text{px}$ touch targets across all buttons, cards, and toggles. Integrates zero-latency `pointerdown` canvas tap detection and subtle haptic vibrations (`navigator.vibrate`) on touchscreens.
- **Compact Spaceship HUD:** Responsive 2-column mobile resource layout (⚡ Power, 🫧 Oxygen, 💧 Water, 🛡️ Shields) that fits cleanly on phone screens without pushing the game canvas out of view.
- **Landscape Smartphone Mode:** Dedicated landscape orientation layouts (`@media (max-height: 520px) and (orientation: landscape)`) maximizing canvas viewing area when kids turn their phones sideways.
- **High-Contrast Digital HUD:** Big, tactile dials with clear color-coded statuses (Green = Nominal, Amber = Caution, Red = Critical Alert, Cyan = Science).
- **Interactive Space Glossary:** Plain-language explanations with hover/click cards for complex concepts (`mSv`, `Sol`, `Regolith`, `Kilowatt`, `ECLSS`, `MOXIE`, `CME`, `EVA`, `ISRU`, and `Kilopower`).
- **Procedural Retro-Futuristic Audio:** Pure Web Audio API synthesis generating satisfying clicks, alarms, and repair cues with an instant mute toggle and zero external audio downloads.
- **Dynamic Flight Director Certificate:** At mission conclusion, a personalized badge certificate is dynamically drawn onto an HTML5 `<canvas>` and downloadable as a PNG keepsake!

---

## 🏗️ Architecture & Offline-First Resiliency
Following NASA Space Apps architectural guidelines, compute is strictly separated from presentation:

```
outpost/
├── index.html                      # Semantic HUD dashboard, dials & modal overlays
├── style.css                       # High-tech space HUD styling & accessible tokens
├── sim.js                          # Pure deterministic simulation engine (browser build)
├── app.js                          # DOM controller, Web Audio synthesizer, canvas renderer
├── data/
│   └── nasa_reference.json         # Pre-cached NASA reference datasets (DONKI, OSDR, PDS)
├── demo_fixtures/                  # Offline backup fixture for OFFLINE=1 execution
├── cache/                          # Offline data cache
├── src/
│   └── compute/
│       └── sim.js                  # Pure deterministic calculation engine (unit tested)
├── tests/
│   └── test_sim.js                 # 25 automated unit tests for physics & tradeoffs
├── docs/
│   └── AI_USE.md                   # Space Apps AI disclosure documentation
├── LICENSE                         # Apache-2.0 Open Source License
└── README.md                       # Complete mission documentation
```

### Instant Play (Zero Build Step & Offline Resilient)
The entire application runs **offline out of the box** with zero account creation, zero package installation, and zero external build steps:
1. Double-click or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, serve via any local static web server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or Node.js
   npx serve .
   ```
3. Open `http://localhost:8000` in your browser.

---

## 🧪 Deterministic Verification & Unit Tests
To verify all physical equations, resource balances, and OSDR health degradation rules outside the UI:

```bash
node tests/test_sim.js
```

All 25 automated unit tests verify:
- Moon and Mars planetary environmental initializations.
- Day/night diurnal power progression and battery energy balance.
- ECLSS oxygen decline under power starvation.
- Active electromagnetic deflection attenuation.
- Deterministic tactical event triggering and choice resolution.
- Mission scoring and Junior Flight Director badge ranking.

---

## 📄 Open Source License & Attribution
- Distributed under the **Apache-2.0 License**. See [LICENSE](LICENSE) for full legal text.
- Scientific data provided courtesy of NASA Open Data, NASA PDS, NASA DONKI, and NASA OSDR GeneLab.
- Built for the **NASA International Space Apps Challenge 2026**.

