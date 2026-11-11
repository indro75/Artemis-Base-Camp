/**
 * Artemis Base Camp: Junior Outpost Commander
 * Kid-Friendly Visual Game Engine & Application Controller (app.js)
 * 
 * Complies with NASA Space Apps 2026 Challenge 03:
 * - Highly visual, interactive arcade-style space base simulation
 * - Interactive canvas stage with animated rovers, astronauts, forcefields & particle effects
 * - Web Audio API synthesized procedural sounds (no external downloads)
 * - Grounded in NASA Open Data: DONKI space weather, OSDR biological thresholds, PDS planetary records
 * - Apache-2.0 License
 */

(function () {
  'use strict';

  // =========================================================================
  // State & Global Handles
  // =========================================================================
  let refData = null;
  let sim = null;
  let simTimer = null;
  let simSpeedMultiplier = 1; // 1 = 1x, 2 = 2x, 0 = paused
  let isMuted = false;
  let audioCtx = null;
  let activeLocation = 'moon';

  // Canvas Handles
  let outpostCanvas = null;
  let outpostCtx = null;
  let certCanvas = null;
  let certCtx = null;
  let animationFrameId = null;

  // Visual Gaming State
  let floatingTexts = []; // Floating numbers on canvas e.g. "+30 Science!"
  let sparkParticles = []; // Electrical/ice drill particles
  let screenShakeAmount = 0;
  let animTime = 0;

  // Interactive Rover Simulation on Canvas
  const roverActor = {
    x: 740,
    y: 350,
    state: 'idle', // 'idle' | 'driving_out' | 'drilling' | 'driving_back'
    targetX: 840,
    speed: 1.5,
    drillTimer: 0,
    wheelRot: 0
  };

  // Interactive Astronauts on Surface
  const astronauts = [
    { x: 380, y: 355, state: 'walking', dir: 1, bubble: 'Earth looks amazing! 🌍', bubbleTimer: 200, name: 'Commander Maya' },
    { x: 190, y: 355, state: 'inspecting', dir: -1, bubble: 'Solar panels clean! ☀️', bubbleTimer: 100, name: 'Engineer Tariq' },
    { x: 620, y: 355, state: 'drilling', dir: 1, bubble: 'Subsurface ice found! 🧊', bubbleTimer: 150, name: 'Astrobiologist Elena' },
    { x: 470, y: 355, state: 'waving', dir: 1, bubble: 'Life support nominal! 🫧', bubbleTimer: 80, name: 'Pilot Leo' }
  ];

  // Pre-generated Twinkling Stars
  const stars = Array.from({ length: 60 }, () => ({
    x: Math.random() * 960,
    y: Math.random() * 260,
    size: Math.random() * 2 + 0.5,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.05 + 0.02
  }));

  // Embedded Offline Fallback in case fetch is blocked by strict local file protocol (file://)
  const FALLBACK_REF_DATA = {
    glossary: {
      mSv: {
        term: "Millisievert (mSv)",
        simple: "How NASA measures space sunburn from cosmic rays!",
        detail: "On Earth, rocks and sun give you ~3 mSv a year. In space, solar flares can deliver hundreds of mSv, so astronauts need magnetic shields!",
        citation: "NASA Space Radiation Program Element / NCRP Report No. 153",
        dataset_id: "NASA-STD-3001-VOL-1"
      },
      Sol: {
        term: "Sol (Martian Day)",
        simple: "One full day and night on Mars (24h 39m).",
        detail: "A Martian Sol is just 40 minutes longer than an Earth day!",
        citation: "NASA JPL Mars Exploration",
        dataset_id: "NASA-PDS-M2020-MEDA"
      },
      Regolith: {
        term: "Regolith (Moon & Mars Dirt)",
        simple: "Space dust that acts like super-thick cosmic sunscreen!",
        detail: "Piled into thick mounds over a habitat dome, regolith makes an amazing natural shield against radiation and micrometeorites!",
        citation: "NASA Artemis Base Camp Concepts",
        dataset_id: "NASA-NTRS-20210018593"
      },
      Kilowatt: {
        term: "Kilowatt (kW)",
        simple: "The electric power that keeps our lights and heaters humming.",
        detail: "1 kilowatt is 1,000 watts. A full Artemis base needs 20 to 40 kilowatts to heat rooms, make oxygen, and charge rovers.",
        citation: "NASA Kilopower Nuclear Reactor Project",
        dataset_id: "NASA-NTRS-20180007817"
      },
      ECLSS: {
        term: "ECLSS (Life Support)",
        simple: "The awesome machine that turns sweat back into clean juice! 🧃",
        detail: "Recycles 98% of crew moisture into clean drinking water, scrubs carbon dioxide, and generates fresh oxygen!",
        citation: "NASA Marshall Space Flight Center",
        dataset_id: "NASA-OSDR-ECLSS-TR-2023"
      },
      MOXIE: {
        term: "MOXIE (Oxygen Generator)",
        simple: "A golden box on Perseverance that cracks Mars air into oxygen!",
        detail: "A real instrument on Perseverance that takes thin Martian CO2 and turns it into breathable O2 like a mechanical tree!",
        citation: "NASA Perseverance MOXIE Team",
        dataset_id: "NASA-PDS-M2020-MOXIE-CAL"
      },
      Kilopower: {
        term: "Kilopower Surface Reactor",
        simple: "A safe, compact nuclear fission battery for 24/7 power.",
        detail: "Provides 10 to 40 kilowatts of constant electricity 24/7, uninterrupted by lunar night or Martian dust storms.",
        citation: "NASA STMD KRUSTY Project",
        dataset_id: "NASA-STMD-KRUSTY-2019"
      }
    },
    locations: {
      moon: {
        id: "moon",
        name: "Artemis Base Camp",
        body: "Moon (Lunar South Pole)",
        site: "Shackleton Crater Rim (89.9°S, 0.0°E)",
        tagline: "Peak of Eternal Light — Extreme temperatures, ancient polar water ice.",
        environment: {
          day_length_hours: 708.7,
          day_cycle_name: "Lunar Day (28 Earth Days)",
          gravity_g: 0.166,
          atmosphere_pressure_pa: 0.000000001,
          temp_day_c: 120,
          temp_night_c: -130,
          temp_shadow_c: -246,
          solar_baseline_flux_w_m2: 1361,
          solar_peak_rim_availability: 0.86,
          background_gcr_msv_day: 0.42,
          dust_abrasion_rate: 0.04
        },
        initial_state: {
          sol_day: 1,
          battery_percent: 100,
          battery_capacity_kwh: 120,
          power_generation_kw: 35.0,
          power_consumption_kw: 24.5,
          oxygen_percent: 100,
          water_liters: 850,
          food_rations_days: 45,
          shield_integrity_percent: 100,
          crew_radiation_msv: 1.2,
          science_points: 0,
          crew_health_percent: 100,
          crew_count: 4,
          crew_names: ["Commander Maya Lin", "Engineer Tariq Khan", "Astrobiologist Elena Cruz", "Pilot Leo Chen"],
          modules: {
            solar_array: { level: 1, status: "nominal", wear: 0, name: "Deployable Solar Mast" },
            kilopower: { level: 1, status: "nominal", wear: 0, name: "10kW Surface Fission Generator" },
            eclss: { level: 1, status: "nominal", wear: 0, name: "Water Recovery & Sabatier Scrubbers" },
            shielding: { level: 1, status: "nominal", wear: 0, name: "Regolith Bunkers & Active EM Coils" },
            drill_lab: { level: 1, status: "nominal", wear: 0, name: "South Pole Cryo-Drill & Science Lab" },
            rover: { level: 1, status: "nominal", wear: 0, name: "VIPER-Class Volatiles Scout Rover" }
          }
        },
        data_citations: [
          {
            system: "Lunar Elevation & Topography",
            instrument: "Lunar Orbiter Laser Altimeter (LOLA)",
            dataset_id: "NASA-PDS-LRO-LOLA-GDR",
            url: "https://pds-geosciences.wustl.edu/missions/lro/lola.htm",
            fact: "Mapped Shackleton Crater rim elevation and identified Peaks of Eternal Light with 86% annual sunlight."
          },
          {
            system: "Thermal Mapping & Cold Traps",
            instrument: "Diviner Lunar Radiometer Experiment",
            dataset_id: "NASA-PDS-LRO-DIVINER-GDR",
            url: "https://diviner.ucla.edu",
            fact: "Recorded coldest temperatures in the solar system (-246°C / 27 Kelvin) inside permanently shadowed craters where water ice survives."
          },
          {
            system: "Space Radiation Limits",
            instrument: "Cosmic Ray Telescope for the Effects of Radiation (CRaTER)",
            dataset_id: "NASA-LRO-CRATER-LEVEL2",
            url: "https://crater.unh.edu",
            fact: "Measured deep space Galactic Cosmic Rays (GCR) delivering 0.35 to 0.45 mSv/day at the lunar surface."
          }
        ]
      },
      mars: {
        id: "mars",
        name: "Jezero Outpost Alpha",
        body: "Mars (The Red Planet)",
        site: "Jezero Crater Paleolake Delta (18.38°N, 77.58°E)",
        tagline: "Ancient Riverbed — Dynamic dust storms, CO2 atmosphere, frozen subsurface aquifers.",
        environment: {
          day_length_hours: 24.65,
          day_cycle_name: "Sol (24h 39m)",
          gravity_g: 0.38,
          atmosphere_pressure_pa: 610,
          temp_day_c: -10,
          temp_night_c: -95,
          temp_shadow_c: -125,
          solar_baseline_flux_w_m2: 590,
          solar_peak_rim_availability: 0.50,
          background_gcr_msv_day: 0.32,
          dust_abrasion_rate: 0.08
        },
        initial_state: {
          sol_day: 1,
          battery_percent: 100,
          battery_capacity_kwh: 140,
          power_generation_kw: 32.0,
          power_consumption_kw: 22.0,
          oxygen_percent: 100,
          water_liters: 780,
          food_rations_days: 50,
          shield_integrity_percent: 100,
          crew_radiation_msv: 0.8,
          science_points: 0,
          crew_health_percent: 100,
          crew_count: 4,
          crew_names: ["Commander Sofia Ramos", "Engineer Samira Begum", "Geochemist David Park", "Systems Tech Lucas Mori"],
          modules: {
            solar_array: { level: 1, status: "nominal", wear: 0, name: "Triple-Junction Martian Solar Field" },
            kilopower: { level: 1, status: "nominal", wear: 0, name: "Kilopower Stirling Fission Cell" },
            eclss: { level: 1, status: "nominal", wear: 0, name: "MOXIE CO2 Extractor & Water Recovery" },
            shielding: { level: 1, status: "nominal", wear: 0, name: "Compacted Basalt Berm & EM Deflector" },
            drill_lab: { level: 1, status: "nominal", wear: 0, name: "SHERLOC Raman Astrobiology Lab" },
            rover: { level: 1, status: "nominal", wear: 0, name: "Perseverance-Class Sample Retrieval Rover" }
          }
        },
        data_citations: [
          {
            system: "Atmospheric & Environmental Sensors",
            instrument: "Mars Environmental Dynamics Analyzer (MEDA)",
            dataset_id: "NASA-PDS-M2020-MEDA",
            url: "https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/PERSEVERANCE/meda.html",
            fact: "Provides daily records of Martian air temperature (-85°C to -10°C), atmospheric pressure (610 Pa), and optical dust thickness (tau)."
          },
          {
            system: "In-Situ Atmospheric Oxygen Synthesis",
            instrument: "Mars Oxygen ISRU Experiment (MOXIE)",
            dataset_id: "NASA-PDS-M2020-MOXIE-CAL",
            url: "https://mars.nasa.gov/mars2020/spacecraft/instruments/moxie/",
            fact: "Proven technology producing 6 to 12 grams of breathable oxygen per hour from the 95% CO2 Martian atmosphere."
          },
          {
            system: "Biological Radiation Standards",
            instrument: "Mars Science Laboratory Radiation Assessment Detector (RAD)",
            dataset_id: "NASA-PDS-MSL-RAD",
            url: "https://pds-geosciences.wustl.edu/missions/msl/rad.htm",
            fact: "Confirmed surface radiation dose rate of ~0.64 mSv/day during solar minimum, proving deep shelters are required for long stays."
          }
        ]
      }
    },
    osdr_biological_thresholds: {
      safe_threshold_msv: 20.0,
      caution_threshold_msv: 50.0,
      warning_threshold_msv: 100.0,
      critical_threshold_msv: 200.0,
      studies: [
        {
          study_id: "NASA-OSDR-STUDY-87",
          title: "GeneLab: Cellular Stress & DNA Double-Strand Breaks Under High-LET Space Radiation",
          url: "https://osdr.nasa.gov/osdr/data/osd/files/87.1"
        }
      ]
    },
    donki_weather_catalog: [
      {
        id: "DONKI-SPE-2024-X4",
        intensity: "X4.5 Solar Flare + Fast Halo CME (1,450 km/s)",
        radiation_unshielded_spike_msv: 45.0,
        radiation_deflected_spike_msv: 4.5
      }
    ],
    tactical_events: [
      {
        id: "event_solar_particle_storm",
        trigger_day: 3,
        title: "ALERT: X-Class Solar Particle Storm Inbound!",
        category: "Space Weather Alert (DONKI)",
        donki_ref: "DONKI-SPE-2024-X4",
        science_note: "Real NASA DONKI records show an X4.5 coronal mass ejection can send billions of tons of high-energy protons directly across planetary surfaces.",
        dialogue: "Capcom Bot: 'Commander! NASA satellites detected a massive solar flare! A proton storm will hit our base in 45 minutes! Should we power up our magnetic shields or scan the flare?'",
        choices: [
          {
            id: "storm_shelter",
            label: "Option A: Maximum Force Shields (100% Defense)",
            preview: "Protects astronauts from radiation (+3 mSv only) | Life support uses backup battery | Science paused",
            impacts: {
              crew_radiation_msv: 3.0,
              science_points: 0,
              battery_percent_change: -18,
              oxygen_percent_change: -4,
              shield_integrity_change: -5,
              crew_health_change: 0
            },
            feedback: "Engineering Report: The active magnetic coil deflected 92% of energetic protons into space. The crew remained safe inside the regolith vault."
          },
          {
            id: "harvest_cme_science",
            label: "Option B: Scan the Solar Flare (+140 Science!)",
            preview: "Massive Science Yield (+140 Pts!) | Dangerous Radiation Dose (+38 mSv) | Astronauts get tired",
            impacts: {
              crew_radiation_msv: 38.0,
              science_points: 140,
              battery_percent_change: -5,
              oxygen_percent_change: 0,
              shield_integrity_change: -15,
              crew_health_change: -22
            },
            feedback: "Science Report: Unprecedented solar particle observations captured! But crew radiation monitors flashed amber-red (OSDR threshold alert)."
          }
        ]
      },
      {
        id: "event_dust_or_nightfall",
        trigger_day: 7,
        title: "ENVIRONMENTAL HAZARD: Solar Blackout Approaching!",
        category: "Planetary Environment (PDS)",
        donki_ref: "NASA-PDS-M2020-MEDA",
        science_note: "Martian dust storms (or Lunar polar night) can drop sunlight by over 75%, plunging temperatures and starving solar arrays of power.",
        dialogue: "Base Engineer: 'Commander, dust is covering the sky! Solar panel output will drop from 30 kW down to 4 kW! How should we save battery?'",
        choices: [
          {
            id: "conserve_power_moxie_off",
            label: "Option 1: Switch to Stored Tanks & Conserve Power",
            preview: "Saves 14 kW of electricity | Dips into stored water/O2 reserves | Keeps battery charged",
            impacts: {
              crew_radiation_msv: 1.5,
              science_points: 25,
              battery_percent_change: 5,
              oxygen_percent_change: -12,
              water_liters_change: -75,
              shield_integrity_change: 0,
              crew_health_change: -5
            },
            feedback: "Resource Log: Throttling life support scrubbers carried our base through the blackout without draining the battery bank."
          },
          {
            id: "burn_fuel_cells",
            label: "Option 2: Fire Auxiliary Fuel Cells for Full Power",
            preview: "Full Science & Life Support maintained | Burns 180 L Stored Reserves & Battery Wear",
            impacts: {
              crew_radiation_msv: 1.0,
              science_points: 90,
              battery_percent_change: -30,
              oxygen_percent_change: 0,
              water_liters_change: -180,
              shield_integrity_change: -8,
              crew_health_change: 2
            },
            feedback: "Engineering Log: The base ran at 100% capacity and science continued! However, our backup fuel cells burned 180 liters of precious reserves."
          }
        ]
      },
      {
        id: "event_cryo_ice_deposit",
        trigger_day: 11,
        title: "RESOURCE DISCOVERY: Subsurface Water Ice Pocket!",
        category: "ISRU & Resource Scouting",
        donki_ref: "NASA-PDS-LRO-DIVINER-GDR",
        science_note: "Orbital radar detected a rich pocket of pure water ice 1.5 meters under the regolith.",
        dialogue: "Astrobiologist: 'Commander! We found frozen water ice 2 kilometers outside the base! How should we collect it?'",
        choices: [
          {
            id: "astronaut_eva",
            label: "Option A: Spacewalk (EVA) with Thermal Core Drill",
            preview: "Yields +350 L Fresh Water & +110 Science! | Spacewalk consumes suit O2 and tires astronauts",
            impacts: {
              crew_radiation_msv: 4.5,
              science_points: 110,
              battery_percent_change: -8,
              oxygen_percent_change: -8,
              water_liters_change: 350,
              shield_integrity_change: 0,
              crew_health_change: -10
            },
            feedback: "Mission Log: Astronauts completed a 6-hour EVA! They harvested 350 liters of water ice."
          },
          {
            id: "autonomous_rover",
            label: "Option B: Send Robotic Rover Drill",
            preview: "Zero astronaut danger (0 mSv) | High power draw (-22% Battery) | Slower yield (+120 L Water)",
            impacts: {
              crew_radiation_msv: 0.5,
              science_points: 50,
              battery_percent_change: -22,
              oxygen_percent_change: 0,
              water_liters_change: 120,
              shield_integrity_change: 0,
              crew_health_change: 4
            },
            feedback: "Robotics Log: Rover drill navigated automatically. Extraction was slow, but the crew stayed safely inside."
          }
        ]
      }
    ]
  };

  // =========================================================================
  // Web Audio Synthesizer: Procedural Retro-Futuristic Sound Effects
  // =========================================================================
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(cueName) {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (cueName === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (cueName === 'alert') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.15);
        osc.frequency.linearRampToValueAtTime(440, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (cueName === 'forcefield') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (cueName === 'bubble') {
        [600, 750, 900].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + (idx * 0.06));
          gain.gain.setValueAtTime(0.08, now + (idx * 0.06));
          gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.06) + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + (idx * 0.06));
          osc.stop(now + (idx * 0.06) + 0.08);
        });
      } else if (cueName === 'rover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.2);
        osc.frequency.linearRampToValueAtTime(160, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (cueName === 'repair') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        osc.frequency.linearRampToValueAtTime(900, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (cueName === 'success') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + (i * 0.08));
          gain.gain.setValueAtTime(0.14, now + (i * 0.08));
          gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.08) + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + (i * 0.08));
          osc.stop(now + (i * 0.08) + 0.35);
        });
      } else if (cueName === 'launch') {
        [440, 554, 659, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + (i * 0.12));
          gain.gain.setValueAtTime(0.14, now + (i * 0.12));
          gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.12) + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + (i * 0.12));
          osc.stop(now + (i * 0.12) + 0.2);
        });
        const sweep = ctx.createOscillator();
        const sweepGain = ctx.createGain();
        sweep.type = 'triangle';
        sweep.frequency.setValueAtTime(110, now + 0.45);
        sweep.frequency.exponentialRampToValueAtTime(880, now + 1.1);
        sweepGain.gain.setValueAtTime(0.01, now + 0.45);
        sweepGain.gain.linearRampToValueAtTime(0.2, now + 0.8);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        sweep.connect(sweepGain);
        sweepGain.connect(ctx.destination);
        sweep.start(now + 0.45);
        sweep.stop(now + 1.2);
      }
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // =========================================================================
  // Canvas Visualization: Giant Living Space Outpost Stage
  // =========================================================================
  function initCanvases() {
    outpostCanvas = document.getElementById('outpost-canvas');
    if (outpostCanvas) {
      outpostCtx = outpostCanvas.getContext('2d');
    }
    certCanvas = document.getElementById('cert-canvas');
    if (certCanvas) {
      certCtx = certCanvas.getContext('2d');
    }
  }

  function spawnFloatingText(text, x, y, color = '#00e5ff') {
    floatingTexts.push({
      text,
      x,
      y,
      alpha: 1.0,
      color,
      vy: -1.2
    });
  }

  function spawnSparks(x, y, count = 8, color = '#ffd54f') {
    for (let i = 0; i < count; i++) {
      sparkParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 1.2) * 2.5,
        alpha: 1.0,
        color,
        size: Math.random() * 3 + 1
      });
    }
  }

  function startSchematicAnimation() {
    function renderFrame() {
      if (!outpostCtx || !sim) return;
      animTime += 0.03;

      const s = sim.state;
      const w = outpostCanvas.width;
      const h = outpostCanvas.height;

      outpostCtx.save();

      // Screen Shake
      if (screenShakeAmount > 0) {
        const sx = (Math.random() - 0.5) * screenShakeAmount;
        const sy = (Math.random() - 0.5) * screenShakeAmount;
        outpostCtx.translate(sx, sy);
        screenShakeAmount *= 0.88;
        if (screenShakeAmount < 0.2) screenShakeAmount = 0;
      }

      // 1. SKY & CELESTIAL BACKDROP
      if (sim.locationId === 'moon') {
        // Deep Pitch-Black Sky with Twinkling Stars
        const skyGrad = outpostCtx.createLinearGradient(0, 0, 0, h * 0.65);
        skyGrad.addColorStop(0, '#02040a');
        skyGrad.addColorStop(1, '#080e1c');
        outpostCtx.fillStyle = skyGrad;
        outpostCtx.fillRect(0, 0, w, h);

        // Twinkling Stars
        stars.forEach(star => {
          const tw = Math.sin(animTime * star.speed * 20 + star.phase);
          const alpha = 0.4 + 0.6 * Math.max(0, tw);
          outpostCtx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
          outpostCtx.beginPath();
          outpostCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          outpostCtx.fill();
        });

        // The Blue Marble (Earth) Floating in Lunar Sky
        const earthX = w - 120;
        const earthY = 70;
        outpostCtx.save();
        outpostCtx.beginPath();
        outpostCtx.arc(earthX, earthY, 32, 0, Math.PI * 2);
        outpostCtx.fillStyle = '#0d47a1';
        outpostCtx.fill();
        // Earth Continents (Stylized)
        outpostCtx.fillStyle = '#43a047';
        outpostCtx.beginPath();
        outpostCtx.arc(earthX - 10, earthY - 6, 16, 0, Math.PI * 2);
        outpostCtx.fill();
        outpostCtx.beginPath();
        outpostCtx.arc(earthX + 8, earthY + 10, 12, 0, Math.PI * 2);
        outpostCtx.fill();
        // Atmosphere Glow
        outpostCtx.strokeStyle = 'rgba(128, 216, 255, 0.4)';
        outpostCtx.lineWidth = 4;
        outpostCtx.beginPath();
        outpostCtx.arc(earthX, earthY, 34, 0, Math.PI * 2);
        outpostCtx.stroke();
        outpostCtx.restore();

        // Lunar South Pole Mountain Rim & Crater Floor
        outpostCtx.fillStyle = '#263238';
        outpostCtx.beginPath();
        outpostCtx.moveTo(0, h * 0.66);
        outpostCtx.quadraticCurveTo(w * 0.25, h * 0.61, w * 0.5, h * 0.66);
        outpostCtx.quadraticCurveTo(w * 0.75, h * 0.70, w, h * 0.64);
        outpostCtx.lineTo(w, h);
        outpostCtx.lineTo(0, h);
        outpostCtx.closePath();
        outpostCtx.fill();

        // Surface Highlights
        outpostCtx.strokeStyle = '#455a64';
        outpostCtx.lineWidth = 2;
        outpostCtx.beginPath();
        outpostCtx.moveTo(0, h * 0.66);
        outpostCtx.quadraticCurveTo(w * 0.25, h * 0.61, w * 0.5, h * 0.66);
        outpostCtx.quadraticCurveTo(w * 0.75, h * 0.70, w, h * 0.64);
        outpostCtx.stroke();
      } else {
        // Mars Pinkish / Butterscotch Sky & Ochre Dunes
        const skyGrad = outpostCtx.createLinearGradient(0, 0, 0, h * 0.65);
        skyGrad.addColorStop(0, '#26110e');
        skyGrad.addColorStop(1, '#56251b');
        outpostCtx.fillStyle = skyGrad;
        outpostCtx.fillRect(0, 0, w, h);

        // Mars Twin Moons: Phobos & Deimos
        outpostCtx.fillStyle = '#cfd8dc';
        outpostCtx.beginPath();
        outpostCtx.arc(w - 140, 50, 10, 0, Math.PI * 2);
        outpostCtx.fill();
        outpostCtx.beginPath();
        outpostCtx.arc(w - 180, 70, 6, 0, Math.PI * 2);
        outpostCtx.fill();

        // Mars Red Dunes
        outpostCtx.fillStyle = '#a84224';
        outpostCtx.beginPath();
        outpostCtx.moveTo(0, h * 0.65);
        outpostCtx.quadraticCurveTo(w * 0.3, h * 0.58, w * 0.65, h * 0.67);
        outpostCtx.quadraticCurveTo(w * 0.85, h * 0.63, w, h * 0.65);
        outpostCtx.lineTo(w, h);
        outpostCtx.lineTo(0, h);
        outpostCtx.closePath();
        outpostCtx.fill();
      }

      // 2. BASE MODULES (CROSS-SECTION SCHEMATIC)
      const groundY = h * 0.65;

      // Module A: Solar Array Mast (Left Side)
      const solarX = 140;
      outpostCtx.save();
      outpostCtx.strokeStyle = '#b0bec5';
      outpostCtx.lineWidth = 6;
      outpostCtx.beginPath();
      outpostCtx.moveTo(solarX, groundY);
      outpostCtx.lineTo(solarX, groundY - 110);
      outpostCtx.stroke();

      // Dual Solar Wings
      const solarActive = s.sunlightPercent > 10;
      const wingColor = solarActive ? '#ffd54f' : '#455a64';
      outpostCtx.fillStyle = wingColor;
      outpostCtx.strokeStyle = '#ffffff';
      outpostCtx.lineWidth = 2;

      // Left wing
      outpostCtx.fillRect(solarX - 80, groundY - 140, 75, 40);
      outpostCtx.strokeRect(solarX - 80, groundY - 140, 75, 40);
      // Right wing
      outpostCtx.fillRect(solarX + 5, groundY - 140, 75, 40);
      outpostCtx.strokeRect(solarX + 5, groundY - 140, 75, 40);

      // Shimmering Photovoltaic Cells
      if (solarActive) {
        outpostCtx.fillStyle = 'rgba(255, 235, 59, ' + (0.35 + 0.2 * Math.sin(animTime * 4)) + ')';
        outpostCtx.fillRect(solarX - 82, groundY - 142, 164, 44);

        // Charging sparks
        if (Math.random() < 0.25) {
          spawnSparks(solarX + (Math.random() - 0.5) * 80, groundY - 120, 2, '#ffea00');
        }
      }
      outpostCtx.restore();

      // Module B: Kilopower Nuclear Reactor (Subsurface Vault)
      const kiloX = 265;
      outpostCtx.save();
      // Shielded trench
      outpostCtx.fillStyle = '#1c2833';
      outpostCtx.fillRect(kiloX - 35, groundY - 10, 70, 50);
      outpostCtx.strokeStyle = '#37474f';
      outpostCtx.lineWidth = 2;
      outpostCtx.strokeRect(kiloX - 35, groundY - 10, 70, 50);

      // Radiator Fins (Stirling heat sinks)
      outpostCtx.fillStyle = '#e53935';
      for (let f = 0; f < 5; f++) {
        outpostCtx.fillRect(kiloX - 28 + (f * 12), groundY - 45, 8, 35);
      }
      // Core Glow
      outpostCtx.fillStyle = 'rgba(0, 229, 255, ' + (0.6 + 0.3 * Math.sin(animTime * 3)) + ')';
      outpostCtx.beginPath();
      outpostCtx.arc(kiloX, groundY + 15, 14, 0, Math.PI * 2);
      outpostCtx.fill();
      outpostCtx.restore();

      // Module C: Central Titanium Hab Dome & Regolith Shielding
      const habX = w * 0.48;
      const habRadius = 110;

      outpostCtx.save();
      // Regolith Protective Mounded Bunker
      outpostCtx.fillStyle = sim.locationId === 'moon' ? '#37474f' : '#6d2b1b';
      outpostCtx.beginPath();
      outpostCtx.arc(habX, groundY, habRadius + 18, Math.PI, 0);
      outpostCtx.fill();

      // Inner Pressurized Titanium Shell
      outpostCtx.fillStyle = '#cfd8dc';
      outpostCtx.beginPath();
      outpostCtx.arc(habX, groundY, habRadius, Math.PI, 0);
      outpostCtx.fill();

      // Warm Interior Portholes
      outpostCtx.fillStyle = '#fff59d';
      outpostCtx.beginPath();
      outpostCtx.arc(habX - 45, groundY - 45, 12, 0, Math.PI * 2);
      outpostCtx.arc(habX, groundY - 65, 15, 0, Math.PI * 2);
      outpostCtx.arc(habX + 45, groundY - 45, 12, 0, Math.PI * 2);
      outpostCtx.fill();

      // Module D: Active Electromagnetic Forcefield Shield Dome
      const shieldRatio = s.allocations.shielding / 100;
      if (shieldRatio > 0.05) {
        const shieldPulse = Math.sin(animTime * 5);
        const shieldColor = s.radiation.activeStorm ? 'rgba(255, 61, 0, ' : 'rgba(0, 210, 255, ';
        const shieldAlpha = (0.2 + 0.25 * shieldPulse + (shieldRatio * 0.3)).toFixed(2);
        
        outpostCtx.strokeStyle = shieldColor + shieldAlpha + ')';
        outpostCtx.lineWidth = 6 + (shieldRatio * 8);
        outpostCtx.beginPath();
        outpostCtx.arc(habX, groundY, habRadius + 40, Math.PI * 0.98, Math.PI * 0.02, true);
        outpostCtx.stroke();

        // Forcefield Deflector Ripple Arc
        outpostCtx.strokeStyle = shieldColor + (shieldAlpha * 0.6) + ')';
        outpostCtx.lineWidth = 3;
        outpostCtx.beginPath();
        outpostCtx.arc(habX, groundY, habRadius + 60, Math.PI * 0.95, Math.PI * 0.05, true);
        outpostCtx.stroke();
      }

      // Airlock Module
      outpostCtx.fillStyle = '#78909c';
      outpostCtx.fillRect(habX + habRadius - 10, groundY - 40, 50, 40);
      outpostCtx.fillStyle = '#00e676'; // Airlock Green Ready Light
      outpostCtx.fillRect(habX + habRadius + 32, groundY - 30, 8, 8);
      outpostCtx.restore();

      // Module E: Science Lab & Ice Core Derrick (Right)
      const sciX = w - 160;
      outpostCtx.save();
      // Science Lab Building
      outpostCtx.fillStyle = '#263238';
      outpostCtx.fillRect(sciX - 45, groundY - 60, 90, 60);
      outpostCtx.strokeStyle = '#00e5ff';
      outpostCtx.lineWidth = 3;
      outpostCtx.strokeRect(sciX - 45, groundY - 60, 90, 60);

      // Deep Cryo Drill Tower
      outpostCtx.strokeStyle = '#cfd8dc';
      outpostCtx.lineWidth = 4;
      outpostCtx.beginPath();
      outpostCtx.moveTo(sciX + 20, groundY - 60);
      outpostCtx.lineTo(sciX + 20, groundY - 110);
      outpostCtx.lineTo(sciX + 45, groundY);
      outpostCtx.stroke();

      // Drill Subterranean Shaft with Ice Particles
      outpostCtx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
      outpostCtx.setLineDash([5, 5]);
      outpostCtx.beginPath();
      outpostCtx.moveTo(sciX + 20, groundY);
      outpostCtx.lineTo(sciX + 20, groundY + 55);
      outpostCtx.stroke();
      outpostCtx.setLineDash([]);
      outpostCtx.restore();

      // 3. ANIMATED ROVER EXPEDITION (VIPER / PERSEVERANCE STYLE)
      updateAndDrawRover(outpostCtx, groundY);

      // 4. ANIMATED ASTRONAUTS WITH SPEECH BUBBLES
      updateAndDrawAstronauts(outpostCtx, groundY);

      // 5. PARTICLE EFFECTS (SPARKS & FLOATING TEXT)
      updateAndDrawParticles(outpostCtx);

      outpostCtx.restore();

      animationFrameId = requestAnimationFrame(renderFrame);
    }

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(renderFrame);
  }

  function updateAndDrawRover(ctx, groundY) {
    // Rover state animation
    if (roverActor.state === 'driving_out') {
      roverActor.x += roverActor.speed;
      roverActor.wheelRot += 0.2;
      if (roverActor.x >= roverActor.targetX) {
        roverActor.state = 'drilling';
        roverActor.drillTimer = 60;
        spawnSparks(roverActor.x + 20, groundY, 15, '#00e5ff');
      }
    } else if (roverActor.state === 'drilling') {
      roverActor.drillTimer--;
      if (Math.random() < 0.4) spawnSparks(roverActor.x + 20, groundY, 3, '#00e5ff');
      if (roverActor.drillTimer <= 0) {
        roverActor.state = 'driving_back';
      }
    } else if (roverActor.state === 'driving_back') {
      roverActor.x -= roverActor.speed;
      roverActor.wheelRot -= 0.2;
      if (roverActor.x <= 740) {
        roverActor.x = 740;
        roverActor.state = 'idle';
      }
    }

    const rx = roverActor.x;
    const ry = groundY - 5;

    ctx.save();
    // Rover Chassis
    ctx.fillStyle = '#eceff1';
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 2;
    ctx.fillRect(rx - 20, ry - 18, 40, 14);
    ctx.strokeRect(rx - 20, ry - 18, 40, 14);

    // Mast Camera
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rx - 10, ry - 18);
    ctx.lineTo(rx - 10, ry - 32);
    ctx.stroke();
    ctx.fillStyle = '#00e5ff'; // Camera eye
    ctx.fillRect(rx - 14, ry - 35, 8, 6);

    // Rover Solar Deck / RTG
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(rx + 5, ry - 22, 12, 4);

    // 6 Rocker-Bogie Wheels
    ctx.fillStyle = '#263238';
    [-15, 0, 15].forEach(wx => {
      ctx.beginPath();
      ctx.arc(rx + wx, ry, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78909c';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // "ROVER" Label
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('ROVER', rx - 16, ry - 38);

    ctx.restore();
  }

  function updateAndDrawAstronauts(ctx, groundY) {
    astronauts.forEach((a, i) => {
      // Gentle pacing
      if (a.state === 'walking') {
        a.x += a.dir * 0.4;
        if (a.x > 420) a.dir = -1;
        if (a.x < 360) a.dir = 1;
      }

      const ax = a.x;
      const ay = groundY;

      ctx.save();
      // White Spacesuit Body
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ax - 5, ay - 24, 10, 16);
      
      // Helmet & Shiny Gold Visor
      ctx.beginPath();
      ctx.arc(ax, ay - 28, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(ax - 3, ay - 31, 7, 5);

      // Life Support Backpack
      ctx.fillStyle = '#90a4ae';
      ctx.fillRect(ax - 8, ay - 24, 3, 12);

      // Speech Bubble (Periodic thoughts)
      a.bubbleTimer--;
      if (a.bubbleTimer <= 0) {
        a.bubbleTimer = 300 + Math.floor(Math.random() * 200);
      }
      if (a.bubbleTimer > 150) {
        drawSpeechBubble(ctx, a.bubble, ax, ay - 42);
      }

      ctx.restore();
    });
  }

  function drawSpeechBubble(ctx, text, x, y) {
    ctx.save();
    ctx.font = 'bold 11px system-ui, sans-serif';
    const textWidth = ctx.measureText(text).width;
    const pad = 6;
    const bw = textWidth + pad * 2;
    const bh = 20;

    ctx.fillStyle = 'rgba(7, 12, 26, 0.9)';
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 1.5;
    
    // Bubble box
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x - bw / 2, y - bh, bw, bh, 6);
    } else {
      ctx.rect(x - bw / 2, y - bh, bw, bh);
    }
    ctx.fill();
    ctx.stroke();

    // Little triangle pointer
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x + 4, y);
    ctx.lineTo(x, y + 5);
    ctx.closePath();
    ctx.fillStyle = '#00d2ff';
    ctx.fill();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x - bw / 2 + pad, y - 6);
    ctx.restore();
  }

  function updateAndDrawParticles(ctx) {
    // 1. Sparks
    for (let i = sparkParticles.length - 1; i >= 0; i--) {
      const p = sparkParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      if (p.alpha <= 0) {
        sparkParticles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Floating Numbers
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const t = floatingTexts[i];
      t.y += t.vy;
      t.alpha -= 0.015;
      if (t.alpha <= 0) {
        floatingTexts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.font = 'bold 16px "Consolas", monospace';
      ctx.fillStyle = t.color;
      ctx.globalAlpha = t.alpha;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  // =========================================================================
  // Mobile Haptic Feedback Helper (Tactile vibration on mobile devices)
  // =========================================================================
  function triggerHaptic(duration = 15) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (_) {}
    }
  }

  // =========================================================================
  // Canvas Click & Touch Detection (Zero-Latency Mobile Touch on Canvas)
  // =========================================================================
  function bindCanvasClickInteraction() {
    if (!outpostCanvas) return;
    outpostCanvas.style.touchAction = 'none';

    function handleCanvasInteraction(clientX, clientY) {
      const rect = outpostCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scaleX = outpostCanvas.width / rect.width;
      const scaleY = outpostCanvas.height / rect.height;
      const clickX = (clientX - rect.left) * scaleX;
      const clickY = (clientY - rect.top) * scaleY;

      // Haptic feedback on tap
      triggerHaptic(18);

      // Click on Solar Panels (x: 60 - 220, y: 180 - 380)
      if (clickX >= 60 && clickX <= 220 && clickY >= 180 && clickY <= 380) {
        triggerModuleClean('solar_array');
        return;
      }

      // Click on Rover (x: rover.x - 45 to rover.x + 45)
      if (Math.abs(clickX - roverActor.x) < 45 && clickY >= 310 && clickY <= 380) {
        triggerRoverScienceMission();
        return;
      }

      // Click on Hab Dome (x: 350 - 580, y: 200 - 380)
      if (clickX >= 350 && clickX <= 580 && clickY >= 200 && clickY <= 380) {
        playSound('success');
        spawnFloatingText('ASTRONAUTS HAPPY! 😊', clickX, clickY - 20, '#00e676');
        setCapcomMessage("Commander! Crew sends their salutes from inside the habitat vault!");
        return;
      }

      // Click on Science Lab (x: 750 - 870, y: 240 - 380)
      if (clickX >= 750 && clickX <= 870 && clickY >= 240 && clickY <= 380) {
        triggerRoverScienceMission();
        return;
      }

      // General surface tap: electric blue sparks
      spawnSparks(clickX, clickY, 8, '#00e5ff');
    }

    let pointerHandled = false;
    outpostCanvas.addEventListener('pointerdown', (e) => {
      pointerHandled = true;
      handleCanvasInteraction(e.clientX, e.clientY);
    });

    outpostCanvas.addEventListener('click', (e) => {
      if (pointerHandled) {
        pointerHandled = false;
        return;
      }
      handleCanvasInteraction(e.clientX, e.clientY);
    });
  }

  // =========================================================================
  // Quick Actions: Rover, Repair Drone, Shields, Life Support
  // =========================================================================
  function triggerRoverScienceMission() {
    if (roverActor.state !== 'idle') return;
    triggerHaptic(25);
    playSound('rover');
    roverActor.state = 'driving_out';

    if (sim) {
      sim.state.science.points += 30;
      spawnFloatingText('+30 SCIENCE! 💎', roverActor.x, 320, '#e040fb');
      setCapcomMessage("Rover deployed! Exploring the crater for volatile water ice!");
      updateUI();
    }
  }

  function triggerModuleClean(modKey = 'solar_array') {
    if (!sim) return;
    triggerHaptic(20);
    if (sim.performMaintenance(modKey)) {
      playSound('repair');
      spawnFloatingText('PANELS CLEANED! ✨', 140, 240, '#ffd54f');
      setCapcomMessage("Maintenance drone wiped abrasive space dust off solar panels!");
      updateUI();
    } else {
      playSound('alert');
      setCapcomMessage("Battery too low (<15%) to run cleaning drone!");
    }
  }

  function cycleShieldState() {
    if (!sim) return;
    triggerHaptic(20);
    const current = sim.state.allocations.shielding;
    let next = 70;
    let stateLabel = 'HIGH (70%)';

    if (current < 50) {
      next = 70;
      stateLabel = 'HIGH (70%)';
    } else if (current < 90) {
      next = 100;
      stateLabel = 'MAX DEFENSE (100%)';
    } else {
      next = 20;
      stateLabel = 'ECO STANDBY (20%)';
    }

    sim.setAllocations({ shielding: next });
    playSound('forcefield');
    spawnFloatingText(`SHIELDS: ${next}% 🛡️`, 460, 200, '#00e5ff');
    setCapcomMessage(`Forcefield magnetic coils adjusted to ${stateLabel}!`);
    updateUI();
  }

  function cycleLifeSupportState() {
    if (!sim) return;
    triggerHaptic(20);
    const current = sim.state.allocations.lifeSupport;
    let next = 80;
    let stateLabel = 'NOMINAL (80%)';

    if (current < 60) {
      next = 80;
      stateLabel = 'NOMINAL (80%)';
    } else if (current < 90) {
      next = 100;
      stateLabel = 'TURBO SCRUBBERS (100%)';
    } else {
      next = 50;
      stateLabel = 'ECO MODE (50%)';
    }

    sim.setAllocations({ lifeSupport: next });
    playSound('bubble');
    spawnFloatingText(`O2 RECYCLER: ${next}% 🫧`, 460, 260, '#00b0ff');
    setCapcomMessage(`Life support scrubbers set to ${stateLabel}!`);
    updateUI();
  }

  function setCapcomMessage(msg) {
    const el = document.getElementById('capcom-message');
    if (el) {
      el.textContent = `"${msg}"`;
    }
    const ticker = document.getElementById('live-radio-chatter');
    if (ticker) {
      ticker.textContent = msg;
    }
  }

  // =========================================================================
  // UI Synchronization: Update DOM Gauges, Meters, and Readouts
  // =========================================================================
  function updateUI() {
    if (!sim) return;
    const s = sim.state;

    // 1. Mission Clock
    const clockDisp = document.getElementById('disp-mission-clock');
    if (clockDisp) {
      const hourInDay = Math.floor(s.elapsedHours % 24);
      const hourStr = hourInDay < 10 ? '0' + hourInDay : '' + hourInDay;
      clockDisp.textContent = `SOL ${s.solDay < 10 ? '0' + s.solDay : s.solDay} • ${hourStr}:00`;
    }
    const sunDisp = document.getElementById('disp-sunlight-status');
    if (sunDisp) {
      sunDisp.textContent = s.isNight ? `🌑 Nightfall (${s.currentTempC}°C)` : `☀️ Sunlight: ${s.sunlightPercent}% (${s.currentTempC}°C)`;
    }

    // Space Weather Status
    const weatherDisp = document.getElementById('disp-weather-status');
    if (weatherDisp) {
      if (s.radiation.activeStorm) {
        weatherDisp.innerHTML = `<span class="radar-ping" style="background:#ff1744"></span> 🚨 ALERT: ${s.radiation.activeStorm.intensity}`;
        weatherDisp.style.borderColor = '#ff1744';
        weatherDisp.style.color = '#ff1744';
      } else {
        weatherDisp.innerHTML = `<span class="radar-ping"></span> 🟢 DONKI SPACE WEATHER: NOMINAL`;
        weatherDisp.style.borderColor = 'rgba(0, 230, 118, 0.4)';
        weatherDisp.style.color = '#00e676';
      }
    }

    // 2. Power Battery
    const barBattery = document.getElementById('bar-battery');
    if (barBattery) barBattery.style.width = `${s.power.batteryPercent}%`;
    const dispBattery = document.getElementById('disp-battery-pct');
    if (dispBattery) dispBattery.textContent = `${s.power.batteryPercent}% Battery`;
    const dispNetKw = document.getElementById('disp-power-flow');
    if (dispNetKw) {
      const sign = s.power.netKw >= 0 ? '+' : '';
      dispNetKw.textContent = `${sign}${s.power.netKw} kW Net`;
      dispNetKw.style.color = s.power.netKw >= 0 ? '#ffea00' : '#ff1744';
    }

    const badgePower = document.getElementById('badge-power-status');
    if (badgePower) {
      if (s.power.status === 'brownout') {
        badgePower.textContent = 'BROWNOUT!';
        badgePower.className = 'status-pill status-alert';
      } else if (s.power.status === 'strained') {
        badgePower.textContent = 'STRAINED';
        badgePower.className = 'status-pill status-caution';
      } else {
        badgePower.textContent = 'CHARGED';
        badgePower.className = 'status-pill status-nominal';
      }
    }

    // 3. Oxygen
    const barO2 = document.getElementById('bar-oxygen');
    if (barO2) barO2.style.width = `${Math.min(100, Math.max(0, s.lifeSupport.oxygenPercent))}%`;
    const dispO2 = document.getElementById('disp-oxygen-pct');
    if (dispO2) dispO2.textContent = `${Math.round(s.lifeSupport.oxygenPercent)}% O2 Purity`;

    const badgeLS = document.getElementById('badge-ls-status');
    if (badgeLS) {
      if (s.lifeSupport.status === 'hypoxia') {
        badgeLS.textContent = 'HYPOXIA ALERT!';
        badgeLS.className = 'status-pill status-alert';
      } else if (s.lifeSupport.status === 'warning') {
        badgeLS.textContent = 'LOW O2';
        badgeLS.className = 'status-pill status-caution';
      } else {
        badgeLS.textContent = 'FRESH';
        badgeLS.className = 'status-pill status-nominal';
      }
    }

    // 4. Water
    const barWater = document.getElementById('bar-water');
    if (barWater) barWater.style.width = `${Math.min(100, (s.lifeSupport.waterLiters / 900) * 100)}%`;
    const dispWater = document.getElementById('disp-water-liters');
    if (dispWater) dispWater.textContent = `${Math.round(s.lifeSupport.waterLiters)} Liters`;
    const dispRecycling = document.getElementById('disp-water-recycling');
    if (dispRecycling) dispRecycling.textContent = `${s.lifeSupport.recyclingEfficiency}% Recycled`;

    // 5. Force Shields
    const barShield = document.getElementById('bar-shield-meter');
    if (barShield) barShield.style.width = `${s.radiation.deflectionEfficiencyPercent}%`;
    const dispDeflect = document.getElementById('disp-deflection-pct');
    if (dispDeflect) dispDeflect.textContent = `${s.radiation.deflectionEfficiencyPercent}% Blocked`;
    const dispDose = document.getElementById('disp-crew-dose');
    if (dispDose) dispDose.textContent = `${s.radiation.crewDoseMsv} mSv Dose`;

    // 6. Science
    const dispSci = document.getElementById('disp-science-total');
    if (dispSci) dispSci.textContent = `${s.science.points} PTS`;
    const dispDisc = document.getElementById('disp-discoveries-count');
    if (dispDisc) dispDisc.textContent = `${s.science.discoveries.length} / 4 Discoveries`;

    // 7. Crew Avatars Emotion
    const health = s.radiation.crewHealthPercent;
    const mood = health > 80 ? '😊' : health > 50 ? '😐' : '😨';
    [0, 1, 2, 3].forEach(idx => {
      const el = document.getElementById(`crew-avatar-${idx}`);
      if (el) el.textContent = idx % 2 === 0 ? (health > 60 ? '👩‍🚀' : mood) : (health > 60 ? '👨‍🚀' : mood);
    });

    // 8. Action Button Labels
    const shieldStateEl = document.getElementById('disp-action-shield-state');
    if (shieldStateEl) shieldStateEl.textContent = `${s.allocations.shielding}% Power`;
    const eclssStateEl = document.getElementById('disp-action-eclss-state');
    if (eclssStateEl) eclssStateEl.textContent = `${s.allocations.lifeSupport}% Power`;

    // Check for Active Tactical Event Modal
    if (s.activeEvent && !document.getElementById('modal-tactical').classList.contains('active-event')) {
      showTacticalModal(s.activeEvent);
    }

    // Check for Game Over / Victory
    if (s.gameOver && !document.getElementById('modal-debrief').classList.contains('active-debrief')) {
      showDebriefModal();
    }
  }

  // =========================================================================
  // Tactical Decision Modal Logic
  // =========================================================================
  function showTacticalModal(evt) {
    const modal = document.getElementById('modal-tactical');
    if (!modal) return;

    playSound('alert');
    screenShakeAmount = 14;
    modal.classList.remove('hidden');
    modal.classList.add('active-event');

    document.getElementById('tactical-modal-category').textContent = evt.category || 'MISSION CRITICAL ALERT';
    document.getElementById('tactical-modal-title').textContent = evt.title;
    document.getElementById('tactical-dialogue-text').textContent = evt.dialogue;
    document.getElementById('tactical-science-note').textContent = evt.science_note;

    const choicesContainer = document.getElementById('tactical-choices-container');
    choicesContainer.innerHTML = '';

    evt.choices.forEach(choice => {
      const card = document.createElement('div');
      card.className = 'choice-card';
      card.innerHTML = `
        <div>
          <h3 class="choice-label">${choice.label}</h3>
          <p class="choice-preview">${choice.preview}</p>
        </div>
        <button class="btn-choose" data-choice="${choice.id}">Confirm Directive</button>
      `;

      card.querySelector('.btn-choose').addEventListener('click', () => {
        playSound('click');
        const summary = sim.resolveActiveEvent(choice.id);
        modal.classList.add('hidden');
        modal.classList.remove('active-event');
        setCapcomMessage(choice.feedback);
        updateUI();
      });

      choicesContainer.appendChild(card);
    });
  }

  // =========================================================================
  // Post-Mission Debrief & Certificate Modal Logic
  // =========================================================================
  function showDebriefModal() {
    const modal = document.getElementById('modal-debrief');
    if (!modal) return;

    playSound('success');
    modal.classList.remove('hidden');
    modal.classList.add('active-debrief');

    const debrief = sim.computeDebriefScore();

    document.getElementById('disp-debrief-score').textContent = `${debrief.totalScore} PTS`;
    document.getElementById('disp-debrief-rank').textContent = debrief.rank;
    document.getElementById('debrief-sols').textContent = `${debrief.survivalSols} Sols`;
    document.getElementById('debrief-science').textContent = `${debrief.sciencePoints} Pts`;
    document.getElementById('debrief-health').textContent = `${debrief.finalCrewHealth}%`;
    document.getElementById('debrief-dose').textContent = `${debrief.totalDoseMsv} mSv (${debrief.totalDoseMsv < 50 ? 'OSDR Safe' : 'Elevated'})`;
    document.getElementById('debrief-water').textContent = `${debrief.waterRemainingLiters} Liters`;

    const lessonsList = document.getElementById('debrief-lessons-list');
    if (lessonsList && debrief.lessonsLearned) {
      lessonsList.innerHTML = debrief.lessonsLearned.map(l => `<li>${l}</li>`).join('');
    }

    renderCertificateBadge();
  }

  function renderCertificateBadge() {
    if (!certCtx || !sim) return;
    const debrief = sim.computeDebriefScore();
    const cadetName = (document.getElementById('input-cadet-name').value || 'Cadet Explorer').trim();

    const w = certCanvas.width;
    const h = certCanvas.height;

    const bgGrad = certCtx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#071026');
    bgGrad.addColorStop(1, '#0c1a3a');
    certCtx.fillStyle = bgGrad;
    certCtx.fillRect(0, 0, w, h);

    certCtx.strokeStyle = '#ffb300';
    certCtx.lineWidth = 4;
    certCtx.strokeRect(12, 12, w - 24, h - 24);
    certCtx.strokeStyle = 'rgba(255, 179, 0, 0.4)';
    certCtx.lineWidth = 1.5;
    certCtx.strokeRect(18, 18, w - 36, h - 36);

    certCtx.font = 'bold 12px system-ui, sans-serif';
    certCtx.fillStyle = '#00e5ff';
    certCtx.textAlign = 'center';
    certCtx.fillText('NATIONAL AERONAUTICS AND SPACE ADMINISTRATION', w / 2, 45);

    certCtx.font = '900 18px system-ui, sans-serif';
    certCtx.fillStyle = '#ffffff';
    certCtx.fillText('JUNIOR FLIGHT DIRECTOR CERTIFICATION', w / 2, 70);

    certCtx.strokeStyle = '#fc3d21';
    certCtx.lineWidth = 3;
    certCtx.beginPath();
    certCtx.moveTo(w / 2 - 100, 80);
    certCtx.lineTo(w / 2 + 100, 80);
    certCtx.stroke();

    certCtx.font = 'italic 14px Georgia, serif';
    certCtx.fillStyle = '#9cb3d8';
    certCtx.fillText('This certifies that Commander', w / 2, 110);

    certCtx.font = '900 24px system-ui, sans-serif';
    certCtx.fillStyle = '#ffca28';
    certCtx.fillText(cadetName.toUpperCase(), w / 2, 142);

    certCtx.font = '13px system-ui, sans-serif';
    certCtx.fillStyle = '#e6edfa';
    certCtx.fillText(`has successfully commanded deep space outpost survival at`, w / 2, 170);

    certCtx.font = 'bold 15px system-ui, sans-serif';
    certCtx.fillStyle = '#00e676';
    certCtx.fillText(`${sim.locationConfig.name.toUpperCase()} (${sim.locationConfig.site})`, w / 2, 192);

    certCtx.font = 'bold 12px "Consolas", monospace';
    certCtx.fillStyle = '#d0e1f9';
    certCtx.fillText(`MISSION DURATION: ${debrief.survivalSols} SOLS  |  SCIENCE YIELD: ${debrief.sciencePoints} PTS`, w / 2, 225);
    certCtx.fillText(`CREW HEALTH: ${debrief.finalCrewHealth}%  |  CUMULATIVE DOSE: ${debrief.totalDoseMsv} mSv`, w / 2, 245);

    certCtx.font = '900 17px system-ui, sans-serif';
    certCtx.fillStyle = '#ffb300';
    certCtx.fillText(`★ RANK: ${debrief.rank.toUpperCase()} ★`, w / 2, 280);

    certCtx.font = '10px "Consolas", monospace';
    certCtx.fillStyle = '#78909c';
    const stamp = new Date().toISOString().split('T')[0];
    certCtx.fillText(`CERTIFICATE ID: NASA-JFD-${debrief.totalScore}-${stamp}  •  APACHE-2.0 OPEN PROVENANCE`, w / 2, 330);
    certCtx.fillText(`Grounded in NASA PDS, DONKI Space Weather & OSDR GeneLab standards`, w / 2, 345);
  }

  // =========================================================================
  // Event Listeners & Interactive Controls Binding
  // =========================================================================
  function bindUIEventListeners() {
    // 1. Location Switcher
    const btnMoon = document.getElementById('btn-loc-moon');
    const btnMars = document.getElementById('btn-loc-mars');

    if (btnMoon) {
      btnMoon.addEventListener('click', () => {
        playSound('click');
        if (activeLocation === 'moon') return;
        activeLocation = 'moon';
        btnMoon.classList.add('active');
        if (btnMars) btnMars.classList.remove('active');
        sim = new window.OutpostSim(refData, 'moon');
        setCapcomMessage("Welcome to the Moon! Shackleton Crater Peaks of Eternal Light!");
        updateUI();
      });
    }

    if (btnMars) {
      btnMars.addEventListener('click', () => {
        playSound('click');
        if (activeLocation === 'mars') return;
        activeLocation = 'mars';
        btnMars.classList.add('active');
        if (btnMoon) btnMoon.classList.remove('active');
        sim = new window.OutpostSim(refData, 'mars');
        setCapcomMessage("Touching down on Mars! Jezero Crater river delta!");
        updateUI();
      });
    }

    // 2. Audio Toggle
    const btnAudio = document.getElementById('btn-audio-toggle');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        isMuted = !isMuted;
        document.getElementById('audio-icon').textContent = isMuted ? '🔇' : '🔊';
        try { localStorage.setItem('artemis_audio_muted', isMuted ? '1' : '0'); } catch(e){}
        if (!isMuted) playSound('click');
      });
    }

    // 3. Tactile Action Buttons
    const btnActionShield = document.getElementById('btn-action-shield');
    if (btnActionShield) {
      btnActionShield.addEventListener('click', cycleShieldState);
    }

    const btnActionEclss = document.getElementById('btn-action-eclss');
    if (btnActionEclss) {
      btnActionEclss.addEventListener('click', cycleLifeSupportState);
    }

    const btnActionRover = document.getElementById('btn-action-rover');
    if (btnActionRover) {
      btnActionRover.addEventListener('click', triggerRoverScienceMission);
    }

    const btnActionRepair = document.getElementById('btn-action-repair');
    if (btnActionRepair) {
      btnActionRepair.addEventListener('click', () => {
        triggerModuleClean('solar_array');
      });
    }

    // 4. Quick Doctrines
    const presetBalanced = document.getElementById('preset-balanced');
    const presetStorm = document.getElementById('preset-storm');
    const presetScience = document.getElementById('preset-science');

    if (presetBalanced) {
      presetBalanced.addEventListener('click', () => {
        playSound('click');
        sim.setAllocations({ lifeSupport: 80, shielding: 70, science: 60, comms: 80 });
        [presetBalanced, presetStorm, presetScience].forEach(p => p.classList.remove('active'));
        presetBalanced.classList.add('active');
        setCapcomMessage("Cruise Mode active: Balanced life support and steady science!");
        updateUI();
      });
    }

    if (presetStorm) {
      presetStorm.addEventListener('click', () => {
        playSound('alert');
        screenShakeAmount = 8;
        sim.setAllocations({ lifeSupport: 40, shielding: 100, science: 0, comms: 30 });
        [presetBalanced, presetStorm, presetScience].forEach(p => p.classList.remove('active'));
        presetStorm.classList.add('active');
        setCapcomMessage("STORM SHELTER ACTIVATED! 100% Power routed to Forcefield Shields!");
        updateUI();
      });
    }

    if (presetScience) {
      presetScience.addEventListener('click', () => {
        playSound('success');
        sim.setAllocations({ lifeSupport: 75, shielding: 40, science: 100, comms: 100 });
        [presetBalanced, presetStorm, presetScience].forEach(p => p.classList.remove('active'));
        presetScience.classList.add('active');
        setCapcomMessage("SCIENCE FRENZY! Drills spinning, rovers scouting, double research!");
        updateUI();
      });
    }

    // 5. Start Mission Launchpad Modal
    const btnStartMissionHeader = document.getElementById('btn-start-mission-header');
    const btnCloseStartMission = document.getElementById('btn-close-start-mission');
    const modalStartMission = document.getElementById('modal-start-mission');
    const destCardMoon = document.getElementById('dest-card-moon');
    const destCardMars = document.getElementById('dest-card-mars');
    const btnLaunchCountdown = document.getElementById('btn-launch-countdown');
    const inputLaunchCallsign = document.getElementById('input-launch-callsign');

    if (btnStartMissionHeader && modalStartMission) {
      btnStartMissionHeader.addEventListener('click', () => {
        playSound('click');
        modalStartMission.classList.remove('hidden');
      });
    }
    if (btnCloseStartMission && modalStartMission) {
      btnCloseStartMission.addEventListener('click', () => {
        modalStartMission.classList.add('hidden');
      });
    }

    if (destCardMoon && destCardMars) {
      destCardMoon.addEventListener('click', () => {
        playSound('click');
        activeLocation = 'moon';
        destCardMoon.classList.add('active');
        destCardMars.classList.remove('active');
        if (btnMoon) btnMoon.classList.add('active');
        if (btnMars) btnMars.classList.remove('active');
      });

      destCardMars.addEventListener('click', () => {
        playSound('click');
        activeLocation = 'mars';
        destCardMars.classList.add('active');
        destCardMoon.classList.remove('active');
        if (btnMars) btnMars.classList.add('active');
        if (btnMoon) btnMoon.classList.remove('active');
      });
    }

    if (btnLaunchCountdown && modalStartMission) {
      btnLaunchCountdown.addEventListener('click', () => {
        const callsign = (inputLaunchCallsign ? inputLaunchCallsign.value : 'Cadet Explorer').trim() || 'Cadet Explorer';
        const nameInput = document.getElementById('input-cadet-name');
        if (nameInput) nameInput.value = callsign;

        playSound('launch');
        sim = new window.OutpostSim(refData, activeLocation);
        modalStartMission.classList.add('hidden');
        setSpeed(1);
        setCapcomMessage(`Mission initiated! Welcome to deep space, Commander ${callsign}!`);
        updateUI();
      });
    }

    // Modals References
    const modalTutorial = document.getElementById('modal-tutorial');
    const modalProv = document.getElementById('modal-provenance');
    const modalGloss = document.getElementById('modal-glossary');
    const modalDebrief = document.getElementById('modal-debrief');

    // 6. Tutorial Modal
    const btnTutorialOpen = document.getElementById('btn-tutorial-open');
    const btnTutorialClose = document.getElementById('btn-close-tutorial');
    const btnTutorialStart = document.getElementById('btn-tutorial-start');

    if (btnTutorialOpen && modalTutorial) {
      btnTutorialOpen.addEventListener('click', () => {
        playSound('click');
        modalTutorial.classList.remove('hidden');
      });
    }
    if (btnTutorialClose && modalTutorial) {
      btnTutorialClose.addEventListener('click', () => modalTutorial.classList.add('hidden'));
    }
    if (btnTutorialStart && modalTutorial) {
      btnTutorialStart.addEventListener('click', () => {
        playSound('success');
        modalTutorial.classList.add('hidden');
      });
    }

    // Mobile Drawer Navigation (Tactile & Fast for Mobile Devices)
    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');

    function closeMobileDrawer() {
      if (mobileNavDrawer) mobileNavDrawer.classList.add('hidden');
      if (btnMobileMenu) btnMobileMenu.setAttribute('aria-expanded', 'false');
      if (mobileMenuIcon) mobileMenuIcon.textContent = '☰';
    }

    if (btnMobileMenu && mobileNavDrawer) {
      btnMobileMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        playSound('click');
        const isClosed = mobileNavDrawer.classList.contains('hidden');
        if (isClosed) {
          mobileNavDrawer.classList.remove('hidden');
          btnMobileMenu.setAttribute('aria-expanded', 'true');
          if (mobileMenuIcon) mobileMenuIcon.textContent = '✕';
        } else {
          closeMobileDrawer();
        }
      });

      document.addEventListener('click', (e) => {
        if (!mobileNavDrawer.contains(e.target) && e.target !== btnMobileMenu && !btnMobileMenu.contains(e.target)) {
          closeMobileDrawer();
        }
      });
    }

    const btnMobTut = document.getElementById('btn-mobile-tutorial');
    if (btnMobTut && modalTutorial) {
      btnMobTut.addEventListener('click', () => {
        triggerHaptic(15);
        playSound('click');
        closeMobileDrawer();
        modalTutorial.classList.remove('hidden');
      });
    }

    const btnMobGloss = document.getElementById('btn-mobile-glossary');
    if (btnMobGloss && modalGloss) {
      btnMobGloss.addEventListener('click', () => {
        triggerHaptic(15);
        playSound('click');
        closeMobileDrawer();
        modalGloss.classList.remove('hidden');
      });
    }

    const btnMobProv = document.getElementById('btn-mobile-provenance');
    if (btnMobProv && modalProv) {
      btnMobProv.addEventListener('click', () => {
        triggerHaptic(15);
        playSound('click');
        closeMobileDrawer();
        modalProv.classList.remove('hidden');
      });
    }

    const btnMobDebrief = document.getElementById('btn-mobile-debrief');
    if (btnMobDebrief && modalDebrief) {
      btnMobDebrief.addEventListener('click', () => {
        triggerHaptic(15);
        playSound('click');
        closeMobileDrawer();
        showDebriefModal();
      });
    }

    // 7. Modals: Provenance, Glossary, Debrief
    const btnProvOpen = document.getElementById('btn-provenance-open');
    const btnProvClose = document.getElementById('btn-close-provenance');
    if (btnProvOpen && modalProv) {
      btnProvOpen.addEventListener('click', () => { playSound('click'); modalProv.classList.remove('hidden'); });
    }
    if (btnProvClose && modalProv) {
      btnProvClose.addEventListener('click', () => modalProv.classList.add('hidden'));
    }

    const btnGlossOpen = document.getElementById('btn-glossary-open');
    const btnGlossClose = document.getElementById('btn-close-glossary');
    if (btnGlossOpen && modalGloss) {
      btnGlossOpen.addEventListener('click', () => { playSound('click'); modalGloss.classList.remove('hidden'); });
    }
    if (btnGlossClose && modalGloss) {
      btnGlossClose.addEventListener('click', () => modalGloss.classList.add('hidden'));
    }

    const btnDebriefView = document.getElementById('btn-debrief-view');
    const btnDebriefClose = document.getElementById('btn-close-debrief');
    if (btnDebriefView && modalDebrief) {
      btnDebriefView.addEventListener('click', () => { playSound('click'); showDebriefModal(); });
    }
    if (btnDebriefClose && modalDebrief) {
      btnDebriefClose.addEventListener('click', () => { modalDebrief.classList.add('hidden'); modalDebrief.classList.remove('active-debrief'); });
    }

    // Close on overlay backdrop click or Escape key
    [modalStartMission, modalTutorial, modalProv, modalGloss, modalDebrief].forEach(m => {
      if (m) {
        m.addEventListener('click', (e) => {
          if (e.target === m) m.classList.add('hidden');
        });
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        [modalStartMission, modalTutorial, modalProv, modalGloss, modalDebrief].forEach(m => {
          if (m) m.classList.add('hidden');
        });
      }
    });

    // 8. Simulation Timing Controls
    const btnPause = document.getElementById('btn-sim-pause');
    const btnPlay = document.getElementById('btn-sim-play');
    const btnFast = document.getElementById('btn-sim-fast');
    const btnStep = document.getElementById('btn-sim-step');

    function setSpeed(speed) {
      simSpeedMultiplier = speed;
      [btnPause, btnPlay, btnFast].forEach(b => { if (b) b.classList.remove('active'); });
      if (speed === 0 && btnPause) btnPause.classList.add('active');
      if (speed === 1 && btnPlay) btnPlay.classList.add('active');
      if (speed === 2 && btnFast) btnFast.classList.add('active');
    }

    if (btnPause) btnPause.addEventListener('click', () => { playSound('click'); setSpeed(0); });
    if (btnPlay) btnPlay.addEventListener('click', () => { playSound('click'); setSpeed(1); });
    if (btnFast) btnFast.addEventListener('click', () => { playSound('click'); setSpeed(2); });
    if (btnStep) {
      btnStep.addEventListener('click', () => {
        playSound('click');
        if (sim) {
          sim.stepTick();
          updateUI();
        }
      });
    }

    // 9. Certificate Dynamic Updates & Download
    const nameInput = document.getElementById('input-cadet-name');
    if (nameInput) {
      nameInput.addEventListener('input', () => renderCertificateBadge());
    }

    const btnDownloadCert = document.getElementById('btn-download-cert');
    if (btnDownloadCert && certCanvas) {
      btnDownloadCert.addEventListener('click', () => {
        playSound('click');
        const link = document.createElement('a');
        link.download = `NASA_Junior_Flight_Director_Badge.png`;
        link.href = certCanvas.toDataURL('image/png');
        link.click();
      });
    }

    // 10. Restart Mission
    const btnRestart = document.getElementById('btn-restart-mission');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        playSound('click');
        modalDebrief.classList.add('hidden');
        modalDebrief.classList.remove('active-debrief');
        sim = new window.OutpostSim(refData, activeLocation);
        setCapcomMessage("Expedition reset! Good luck Commander!");
        updateUI();
      });
    }
  }

  // =========================================================================
  // Science Provenance & Glossary Modals Population
  // =========================================================================
  function populateProvenanceModal() {
    const container = document.getElementById('provenance-cards-list');
    if (!container || !refData) return;
    container.innerHTML = '';

    const allCitations = [
      ...(refData.locations.moon.data_citations || []),
      ...(refData.locations.mars.data_citations || [])
    ];

    allCitations.forEach(c => {
      const card = document.createElement('div');
      card.className = 'dataset-card';
      card.innerHTML = `
        <div class="dataset-card-header">
          <span class="dataset-system-name">${c.system} (${c.instrument})</span>
          <span class="dataset-id-badge">${c.dataset_id}</span>
        </div>
        <p class="dataset-fact">${c.fact}</p>
        <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="dataset-link">
          🔗 Access NASA Open Dataset Archive: ${c.url}
        </a>
      `;
      container.appendChild(card);
    });
  }

  function populateGlossaryModal() {
    const container = document.getElementById('glossary-cards-container');
    if (!container || !refData || !refData.glossary) return;
    container.innerHTML = '';

    Object.entries(refData.glossary).forEach(([key, item]) => {
      const card = document.createElement('div');
      card.className = 'glossary-card';
      card.id = `glossary-term-${key}`;
      card.innerHTML = `
        <h3 class="glossary-term-title">${item.term}</h3>
        <p class="glossary-simple-def">${item.simple}</p>
        <p class="glossary-detail">${item.detail}</p>
        <span class="glossary-citation">NASA Grounding: ${item.citation} [${item.dataset_id}]</span>
      `;
      container.appendChild(card);
    });
  }

  // =========================================================================
  // Simulation Loop Timer
  // =========================================================================
  function startSimulationLoop() {
    if (simTimer) clearInterval(simTimer);
    simTimer = setInterval(() => {
      if (simSpeedMultiplier > 0 && sim && !sim.state.gameOver && !sim.state.activeEvent) {
        sim.stepTick();
        updateUI();
      }
    }, 2400 / (simSpeedMultiplier || 1));
  }

  let lastSpeed = 1;
  setInterval(() => {
    if (simSpeedMultiplier !== lastSpeed) {
      lastSpeed = simSpeedMultiplier;
      if (simSpeedMultiplier > 0) {
        startSimulationLoop();
      }
    }
  }, 250);

  // =========================================================================
  // App Initialization
  // =========================================================================
  async function initApp() {
    try {
      const storedMute = localStorage.getItem('artemis_audio_muted');
      if (storedMute === '1') {
        isMuted = true;
        const icon = document.getElementById('audio-icon');
        if (icon) icon.textContent = '🔇';
      }
    } catch (e) {}

    initCanvases();

    try {
      const resp = await fetch('data/nasa_reference.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      refData = await resp.json();
    } catch (err) {
      console.warn('Falling back to embedded NASA reference fixtures:', err);
      refData = FALLBACK_REF_DATA;
    }

    sim = new window.OutpostSim(refData, activeLocation);

    bindUIEventListeners();
    bindCanvasClickInteraction();
    populateProvenanceModal();
    populateGlossaryModal();

    startSchematicAnimation();
    startSimulationLoop();

    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
