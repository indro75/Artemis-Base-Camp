# 🚀 ARTEMIS BASE CAMP: FLIGHT DIRECTOR'S MANUAL
### Official NASA Junior Astronaut Mission Trainer • Space Apps Challenge 2026 (Ages 7–12)

Welcome to Mission Control, Commander! This manual contains complete flight directives, telemetry guides, engineering trade-off explanations, and pro-tips to help you keep your crew alive and earn your **Official NASA Junior Flight Director Certification Badge**.

---

## 🎯 1. The Core Objective

> **Your Mission:** Keep **4 astronauts** safe, healthy, hydrated, and breathing for **20 Sols** (space days) on the surface of deep space while gathering scientific research!

### The Golden Rule: *"No Choice is Free"*
Deep space is an uncompromising environment where every system depends on every other system:
- Pushing active electromagnetic force fields to 100% deflects deadly solar flares, but drains your battery grid.
- Powering down life support scrubbers saves electricity during a storm, but toxic carbon dioxide builds up and oxygen drops.
- Deploying autonomous science rovers discovers vital water ice reserves, but consumes power and causes mechanical wear.

```
                    ┌─────────────────────────┐
                    │    KILOPOWER & SOLAR    │
                    │       POWER GRID        │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   LIFE SUPPORT   │    │  FORCE SHIELDS   │    │  SCIENCE ROVER   │
│  (O2 & Scrubbers)│    │  (mSv Deflection)│    │ (Ice Discoveries)│
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 🕹️ 2. How to Start a Mission (Step-by-Step)

```
[ Click 🚀 START MISSION ] ➔ [ Type Callsign ] ➔ [ Choose Moon or Mars ] ➔ [ Click START MISSION NOW ]
```

1. **Launch the Game:** Open [`index.html`](file:///d:/Projects/nasa_app/outpost/index.html) in any modern web browser (Chrome, Edge, Firefox, Safari). Zero installation, zero account creation, instant browser play.
2. **Open the Launchpad Briefing:** Click the prominent glowing green **`[🚀 START MISSION]`** button in the top navigation bar (or press `Space` / click the prompt on first load).
3. **Enter Your Commander Callsign:** Type your astronaut name (e.g., *"Commander Maya"* or *"Cadet Alex"*) into the name box.
4. **Choose Your Target Outpost World:**
   - **🌕 Moon Base (Shackleton Crater Rim):**
     - **Location:** Lunar South Pole (89.9°S) at the Peak of Eternal Light.
     - **Environment:** 28 Earth days per diurnal cycle, extreme temperatures ($-130^\circ\text{C}$ night to $+120^\circ\text{C}$ day), near-vacuum atmosphere ($10^{-9}\text{ Pa}$), and high galactic cosmic ray exposure.
     - **Advantage:** 86% annual sunlight availability on crater rim peaks; ancient water ice hidden in permanently shadowed craters ($-246^\circ\text{C}$).
   - **🪐 Mars Outpost (Jezero Crater Paleolake):**
     - **Location:** Ancient Martian river delta (18.38°N, 77.58°E).
     - **Environment:** 24h 39m Sol day/night cycle, cold desert temperatures ($-10^\circ\text{C}$ to $-95^\circ\text{C}$), thin 610 Pa carbon dioxide atmosphere, and 0.38g gravity.
     - **Challenge:** Seasonal atmospheric dust storms (optical depth $\tau$) reduce sunlight on solar panels by up to 80%.
     - **Advantage:** MOXIE solid oxide electrolysis can crack atmospheric $\text{CO}_2$ directly into breathable oxygen.
5. **Initiate Mission:** Click **`[🚀 START MISSION NOW]`**. The liftoff acoustic sweep sounds, the launchpad dismisses, and the simulation mission clock begins ticking at Sol 01!

---

## 📊 3. The 4 Vital Meters (Spaceship Telemetry)

The dashboard bar across the top of your cockpit displays your outpost's vital signs:

| Telemetry Gauge | Measured Unit | Normal Range | What Powers / Replenishes It | What Happens in the Danger Zone |
| :--- | :--- | :--- | :--- | :--- |
| **⚡ POWER GRID** | Net Flow ($\text{kW}$) & Battery $\%$ | $80\% - 100\%$ | Deployable Solar Mast + 10kW Kilopower nuclear Stirling reactor | **$<15\%$:** Base brownout! Force fields collapse, ECLSS scrubbers stall, and alarms sound. |
| **🫧 OXYGEN AIR** | $\text{O}_2$ Purity $\%$ & Scrubbers | $90\% - 100\%$ | Sabatier scrubbers recycling air; MOXIE cracking Martian $\text{CO}_2$ | **$<80\%$:** Hypoxia warning! Astronauts become fatigued and health deteriorates. |
| **💧 WATER RESERVOIR**| Liters ($\text{L}$) & Loop Efficiency | $500 - 850\text{ L}$ | 96% closed-loop recovery recycling humidity, sweat, and moisture | **$<200\text{ L}$:** Severe dehydration hazard; crew physical performance drops. |
| **🛡️ FORCE SHIELDS** | Cumulative Dose ($\text{mSv}$) & Deflection | $<20\text{ mSv}$ (Safe) | Active electromagnetic coils + regolith mounded bunker | **$>20\text{ mSv}$:** Enters OSDR caution zone; **$>100\text{ mSv}$:** Acute cellular damage. |
| **🔬 SCIENCE YIELD** | Points ($\text{PTS}$) & Ice Samples | $0 - 500+\text{ PTS}$| Deploying scout rovers and running deep core cryo drills | Directly drives your final mission score and flight director certification rank! |
| **🧑‍🚀 CREW HEALTH** | Status of 4 Astronauts | $90\% - 100\%$ Nominal| Fresh air, clean water, adequate power, and low radiation | If health drops below $40\%$, emergency medical evacuation protocols trigger. |

---

## 🎮 4. Commander's Tactical Controls

Use the tactile action deck pinned to the bottom of your screen to issue instant flight directives:

### Primary Action Cards
- **`[🛡️ FORCE SHIELDS]`:** One tap cycles magnetic coil power:
  - **ECO STANDBY (20%):** Draws minimal power (2 kW). Sufficient for calm space weather.
  - **HIGH (70%):** Standard protective shield (7 kW). Deflects normal cosmic rays and moderate proton flux.
  - **MAX DEFENSE (100%):** Maximum electromagnetic shielding (10 kW). Essential during X-class solar flares!
- **`[🫧 LIFE SUPPORT]`:** One tap toggles habitat atmosphere recycling:
  - **ECO MODE (50%):** Conserves battery power during nighttime or dust storms, but air scrubbers run at half speed.
  - **NOMINAL (80%):** Standard balanced operations. Maintains 100% oxygen purity and 96% closed-loop water recovery.
  - **TURBO SCRUBBERS (100%):** Maximum filtration mode. Rapidly purges carbon dioxide if air quality drops.
- **`[🚜 DEPLOY ROVER]`:** Launches the autonomous VIPER-class / Perseverance-style scout rover:
  - Drives across crater rims and permanently shadowed cold traps.
  - Drills into cryo-ice deposits with visible mist and sparks.
  - Awards **+30 Science Points 💎** on every successful mission!
- **`[🔧 REPAIR DRONE]`:** Dispatches an autonomous maintenance drone:
  - Wipes abrasive lunar or Martian regolith dust off the photovoltaic solar panels.
  - Costs 12% battery energy, but restores solar cell electrical generation to 100% peak output!

### Quick Strategy Doctrines (1-Tap Emergency Configurations)
- **`[⚖️ Cruise Mode]`:** Balanced everyday operations for nominal sols (70% shields, 80% life support, steady science).
- **`[🚨 Storm Shelter!]`:** Emergency defense mode! Diverts 100% power to active magnetic force fields and seals astronauts inside thick regolith vaults to survive Coronal Mass Ejections.
- **`[🔭 Science Frenzy!]`:** High-yield research mode! Pushes power to subterranean cryo-drills and doubles rover deployment for maximum score return.

---

## 🎨 5. Interactive Living Canvas (Direct Clicks & Taps)

You can interact directly with the animated space base by tapping objects on the screen:

- **Click Solar Array Mast (Left):** Cleans abrasive space dust off the shimmering photovoltaic cells (`PANELS CLEANED! ✨`).
- **Click the Rover (Crater Surface):** Dispatches the rover immediately on an ice-scouting run (`+30 SCIENCE! 💎`).
- **Click the Titanium Habitat Dome (Center):** Checks in on your crew (`ASTRONAUTS HAPPY! 😊`). Astronauts salute from the viewing cupola.
- **Click the Science Lab & Derrick (Right):** Activates subterranean cryo-drilling to sample subsurface volatiles.
- **Click Surface Dust / Ground:** Discharges surface static electricity with celebratory electric blue sparks.

---

## ⏱️ 6. Time & Playback Controls

Located floating at the top-right of the visual canvas:
- **`[⏸ Pause]`:** Freezes the mission clock. Perfect when you need to inspect telemetry, read glossary entries, or plan your resource strategy.
- **`[▶ Play (1x)]`:** Standard real-time mission clock (1 tick = 4 hours of simulated mission time).
- **`[⏩ Fast (2x)]`:** Double-speed execution to advance through quiet daytime cycles.
- **`[⏭ +4h Tick]`:** Manually step forward by a single 4-hour time block.

---

## ⚠️ 7. Space Weather Alerts & Tactical Trade-offs

During your 20-Sol expedition, NASA's **DONKI space weather monitoring satellites** will trigger critical alerts:

When an alert triggers, the simulation automatically pauses and presents **two real engineering trade-off choices**:

### Scenario A: Solar Particle Event (DONKI Satellite Data)
*Sensors detect an X-class coronal mass ejection heading toward the crater at 1,450 km/s.*
- **Choice 1 (Safety First — Storm Shelter):** Route 80% power to electromagnetic deflector coils.
  - *Consequence:* Crew absorbs $<0.5\text{ mSv}$ radiation, but habitat runs on emergency battery reserves and all science halts.
- **Choice 2 (High Risk Science):** Keep high-gain instruments recording rare space weather data.
  - *Consequence:* Earns **+150 Science Points**, but crew radiation dose climbs significantly toward NCRP biological limits.

### Scenario B: Dust Storm Blackout / Lunar Nightfall
*Martian dust optical depth spikes ($\tau = 2.5$) or the 14-day lunar night begins. Solar generation drops to zero.*
- **Choice 1 (Conserve Reserves):** Shut down MOXIE/ECLSS scrubbers and draw breathing air from backup storage tanks.
  - *Consequence:* Conserves battery power for heating, but oxygen reserves slowly drain.
- **Choice 2 (Auxiliary Fuel Cells):** Burn auxiliary reserves to maintain full 24/7 operations.
  - *Consequence:* Maintains full base comfort, but burns through consumable fuel at 3x standard rate.

---

## 🏅 8. Official NASA Flight Director Certification

```
Final Score = (Sols Survived × 100) + (Science Points × 3) + (Crew Health × 10) - (Radiation Dose × 5)
```

At **Sol 20** (or anytime by clicking the **`[🏅 CERTIFICATE]`** button in the header bar):
1. The **Official NASA Flight Director Debrief** modal opens.
2. Review your full engineering breakdown: survival duration, total science return, water remaining, and cumulative radiation dose.
3. Read the engineering lessons learned explaining how your choices mirrored real aerospace engineering challenges.
4. Your official award badge is rendered dynamically onto the certificate canvas:
   - **Junior Cadet:** 0 – 1,499 pts
   - **Mission Specialist:** 1,500 – 2,499 pts
   - **Senior Outpost Commander:** 2,500 – 3,499 pts
   - **Master Flight Director:** 3,500+ pts
5. Type your name into the Commander Name input and click **`[📥 Download Badge (PNG)]`** to save your high-resolution official award!

---

## 🔬 9. Grounding in Real NASA Open Datasets

Every mechanic in this simulator is grounded in verified NASA open scientific data:

| Mission Science | NASA Dataset Identifier | Real Aerospace Engineering Fact |
| :--- | :--- | :--- |
| **Space Weather & Flare Alerts** | `NASA-DONKI-CME-SPE-2024` | Real X-class solar flares and Coronal Mass Ejections (CMEs) that set radiation spike events. |
| **Biological Radiation Limits** | `NASA-OSDR-STUDY-87` | NCRP-153 radiation exposure standards: $<20\text{ mSv}$ safe, $100\text{ mSv}$ threshold for cellular damage. |
| **Lunar Polar Topography** | `NASA-PDS-LRO-LOLA-GDR` | Laser altimetry mapped Shackleton Crater rim and identified Peaks of Eternal Light with 86% annual sun. |
| **Lunar Cold Traps** | `NASA-PDS-LRO-DIVINER-GDR` | Coldest recorded solar system temperatures ($-246^\circ\text{C}$ / 27 K) where volatile water ice survives. |
| **Martian Weather & Pressure** | `NASA-PDS-M2020-MEDA` | Surface temperatures ($-10^\circ\text{C}$ to $-95^\circ\text{C}$), 610 Pa atmospheric pressure, and dust optical depth ($\tau$). |
| **In-Situ Oxygen Cracking** | `NASA-PDS-M2020-MOXIE-CAL` | Solid oxide electrolysis producing 6–12 g/hr breathable $\text{O}_2$ directly from Martian atmospheric $\text{CO}_2$. |
| **Fission Surface Power** | `NASA-STMD-KRUSTY-2019` | 10 kW continuous nuclear Stirling reactor providing uninterrupted power during night and dust storms. |

*Click the **`[🔬 NASA DATA]`** button in the top bar to inspect complete dataset IDs and official URLs.*

---

## 💡 10. Pro-Tips for Junior Flight Directors

1. **Charge Before Sunset:** When night begins, solar panel generation drops to 0 kW! Make sure your battery is at 100% before sunset so the 10kW Kilopower reactor can easily carry the base through the dark.
2. **Dust is the Enemy:** If your solar power output starts dropping during bright daylight, regolith dust has coated the panels. Tap the panels or click **`[🔧 REPAIR DRONE]`** immediately.
3. **Watch the Radar Ping:** The green radar dot in the upper-left of the canvas turns yellow when space weather intensifies, and flashing red when a coronal mass ejection is inbound. Switch to **`[🚨 Storm Shelter!]`** before the storm strikes!
4. **Deploy the Rover Early & Often:** Every rover scouting run adds +30 science points. Running rover expeditions whenever sunlight is high is the fastest way to achieve the **Master Flight Director** certification rank!
5. **No Scrolling on Desktop:** On PC and laptop screens, the entire cockpit is engineered to fit on a single screen without scrolling. Keep an eye on both the meters above and the controls below simultaneously.

---

*Artemis Base Camp: Junior Outpost Commander • NASA International Space Apps Challenge 2026 • Open Source (Apache-2.0)*

