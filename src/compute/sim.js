/**
 * Artemis Base Camp: Junior Outpost Commander
 * Pure Deterministic Simulation Engine (sim.js & src/compute/sim.js)
 * 
 * Complies with NASA Space Apps 2026 Challenge 03 standards:
 * - Deterministic science calculation engine: all physics, resource balance,
 *   space weather events, and OSDR biological limits live here.
 * - Separation of Compute & Narrative: zero AI guessing, 100% grounded in
 *   NASA PDS, DONKI, and OSDR datasets.
 * - Licensed under Apache-2.0.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OutpostSim = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Constants grounded in real NASA Engineering & Spaceflight Medicine
  const CONSTANTS = {
    // NASA ECLSS standards: ~0.84 kg O2 and ~2.5 L H2O per crew member per Earth day
    O2_CONSUMPTION_PER_CREW_DAY: 0.84, // kg / crew / day
    WATER_CONSUMPTION_PER_CREW_DAY: 2.50, // L / crew / day
    WATER_RECYCLING_EFFICIENCY_BASE: 0.96, // 96% to 98% closed-loop recovery
    
    // Power baselines (kW)
    KILOPOWER_OUTPUT_KW: 10.0, // NASA STMD KRUSTY fission reactor
    SOLAR_PEAK_LUNAR_KW: 30.0, // Multi-junction deployable mast
    SOLAR_PEAK_MARS_KW: 24.0,  // Lower solar irradiance at 1.52 AU
    
    // Subsystem baseline power demands (kW)
    LIFE_SUPPORT_BASE_KW: 12.0,
    SHIELDING_ACTIVE_KW: 10.0,
    SCIENCE_LAB_BASE_KW: 6.0,
    COMMS_BASE_KW: 3.0,
    HAB_THERMAL_BASE_KW: 4.0,
    
    // Radiation thresholds (mSv) - NASA-STD-3001 & OSDR Study 87
    RAD_SAFE_MAX_MSV: 20.0,
    RAD_CAUTION_MSV: 50.0,
    RAD_WARNING_MSV: 100.0,
    RAD_CRITICAL_MSV: 200.0,
    RAD_LETHAL_MSV: 400.0,

    // Time scales
    HOURS_PER_TICK: 4, // Each game tick advances 4 hours
    TICKS_PER_EARTH_DAY: 6
  };

  class OutpostEngine {
    constructor(referenceData, locationId = 'moon') {
      if (!referenceData) {
        throw new Error('OutpostEngine requires referenceData loaded from data/nasa_reference.json');
      }
      this.ref = referenceData;
      this.locationId = locationId in referenceData.locations ? locationId : 'moon';
      this.locationConfig = referenceData.locations[this.locationId];
      
      this.initDefaultState();
    }

    /**
     * Initializes a fresh simulation state
     */
    initDefaultState() {
      const cfg = this.locationConfig;
      const init = cfg.initial_state;

      this.state = {
        locationId: this.locationId,
        locationName: cfg.name,
        body: cfg.body,
        site: cfg.site,
        tagline: cfg.tagline,
        
        // Clock & Timing
        tickCount: 0,
        elapsedHours: 0,
        solDay: 1,
        dayPhaseAngle: 0,
        isNight: false,
        sunlightPercent: 100,
        currentTempC: cfg.environment.temp_day_c,
        dustOpticalDepthTau: this.locationId === 'mars' ? 0.4 : 0.0,

        // 4 Primary Resources
        power: {
          generationKw: init.power_generation_kw,
          consumptionKw: init.power_consumption_kw,
          solarKw: 25.0,
          nuclearKw: CONSTANTS.KILOPOWER_OUTPUT_KW,
          batteryPercent: init.battery_percent,
          batteryCapacityKwh: init.battery_capacity_kwh,
          batteryCurrentKwh: init.battery_capacity_kwh,
          status: 'nominal',
          netKw: 0
        },

        lifeSupport: {
          oxygenPercent: init.oxygen_percent,
          waterLiters: init.water_liters,
          foodRationsDays: init.food_rations_days,
          recyclingEfficiency: CONSTANTS.WATER_RECYCLING_EFFICIENCY_BASE * 100,
          status: 'nominal',
          co2ScrubberStatus: 'active'
        },

        radiation: {
          shieldIntegrityPercent: init.shield_integrity_percent,
          currentFluxMsvPerDay: cfg.environment.background_gcr_msv_day,
          crewDoseMsv: init.crew_radiation_msv,
          crewHealthPercent: init.crew_health_percent,
          deflectionEfficiencyPercent: 75,
          activeStorm: null,
          healthTier: 'Nominal'
        },

        science: {
          points: init.science_points,
          ratePerDay: 8,
          discoveries: [],
          samplesAnalyzed: 0,
          evasCompleted: 0
        },

        crew: {
          count: init.crew_count,
          names: [...init.crew_names],
          fatiguePercent: 10,
          moralePercent: 95
        },

        modules: JSON.parse(JSON.stringify(init.modules)),

        allocations: {
          lifeSupport: 80,
          shielding: 70,
          science: 60,
          comms: 80
        },

        log: [
          {
            sol: 1,
            hour: 0,
            type: 'system',
            message: `Commander initialized outpost at ${cfg.site}. All systems nominal.`
          }
        ],
        activeEvent: null,
        resolvedEvents: [],
        gameOver: false,
        victory: false,
        endReason: ''
      };

      this.recalculateAll();
    }

    /**
     * Set power routing allocations
     */
    setAllocations(newAllocations) {
      if (!newAllocations) return;
      ['lifeSupport', 'shielding', 'science', 'comms'].forEach(key => {
        if (typeof newAllocations[key] === 'number') {
          this.state.allocations[key] = Math.max(0, Math.min(100, Math.round(newAllocations[key])));
        }
      });
      this.recalculateAll();
    }

    /**
     * Compute instantaneous environmental parameters
     */
    computeEnvironment() {
      const s = this.state;
      const env = this.locationConfig.environment;
      const cycleHours = env.day_length_hours;
      s.dayPhaseAngle = ((s.elapsedHours % cycleHours) / cycleHours) * 360;

      if (this.locationId === 'moon') {
        const shadowZone = s.dayPhaseAngle > 310 || s.dayPhaseAngle < 20;
        s.isNight = shadowZone;
        s.sunlightPercent = s.isNight ? 0 : Math.round(Math.max(15, Math.sin((s.dayPhaseAngle * Math.PI) / 180) * 100));
        s.currentTempC = s.isNight ? env.temp_night_c : env.temp_day_c - Math.round(Math.cos((s.dayPhaseAngle * Math.PI) / 180) * 40);
        s.dustOpticalDepthTau = 0.0;
      } else {
        s.isNight = s.dayPhaseAngle > 180;
        const sunHeight = Math.sin((s.dayPhaseAngle * Math.PI) / 180);
        s.sunlightPercent = s.isNight ? 0 : Math.round(Math.max(0, sunHeight * 100));
        s.currentTempC = s.isNight 
          ? env.temp_night_c + Math.round(Math.sin((s.dayPhaseAngle * Math.PI) / 180) * 15)
          : env.temp_day_c - Math.round(Math.cos((s.dayPhaseAngle * Math.PI) / 180) * 30);
      }
    }

    /**
     * Compute instantaneous Power Generation, Consumption rates
     */
    computePower() {
      const s = this.state;
      const p = s.power;
      const a = s.allocations;

      const baseSolarPeak = this.locationId === 'moon' ? CONSTANTS.SOLAR_PEAK_LUNAR_KW : CONSTANTS.SOLAR_PEAK_MARS_KW;
      const arrayModule = s.modules.solar_array;
      const arrayHealthMultiplier = Math.max(0.2, (100 - arrayModule.wear) / 100);
      
      const dustAttenuation = this.locationId === 'mars' ? Math.exp(-s.dustOpticalDepthTau) : 1.0;
      p.solarKw = parseFloat((baseSolarPeak * (s.sunlightPercent / 100) * dustAttenuation * arrayHealthMultiplier).toFixed(1));

      const kiloModule = s.modules.kilopower;
      const kiloMultiplier = Math.max(0.5, (100 - kiloModule.wear) / 100);
      p.nuclearKw = parseFloat((CONSTANTS.KILOPOWER_OUTPUT_KW * kiloMultiplier).toFixed(1));

      p.generationKw = parseFloat((p.solarKw + p.nuclearKw).toFixed(1));

      const thermalDemand = s.isNight ? CONSTANTS.HAB_THERMAL_BASE_KW * 1.5 : CONSTANTS.HAB_THERMAL_BASE_KW;
      const lifeSupportDemand = (CONSTANTS.LIFE_SUPPORT_BASE_KW * (a.lifeSupport / 100));
      const shieldDemand = (CONSTANTS.SHIELDING_ACTIVE_KW * (a.shielding / 100));
      const scienceDemand = (CONSTANTS.SCIENCE_LAB_BASE_KW * (a.science / 100));
      const commsDemand = (CONSTANTS.COMMS_BASE_KW * (a.comms / 100));

      p.consumptionKw = parseFloat((thermalDemand + lifeSupportDemand + shieldDemand + scienceDemand + commsDemand).toFixed(1));
      p.netKw = parseFloat((p.generationKw - p.consumptionKw).toFixed(1));

      if (p.batteryPercent <= 0) {
        p.status = 'brownout';
      } else if (p.batteryPercent < 25 || p.netKw < -5) {
        p.status = 'strained';
      } else {
        p.status = 'nominal';
      }
    }

    /**
     * Compute Life Support status & rates
     */
    computeLifeSupport() {
      const s = this.state;
      const ls = s.lifeSupport;
      const a = s.allocations;
      const p = s.power;

      const effectivePowerPct = p.status === 'brownout' ? 15 : a.lifeSupport;
      if (effectivePowerPct >= 70) {
        ls.co2ScrubberStatus = 'active';
      } else if (effectivePowerPct >= 40) {
        ls.co2ScrubberStatus = 'degraded';
      } else {
        ls.co2ScrubberStatus = 'offline';
      }

      const eclssHealth = (100 - s.modules.eclss.wear) / 100;
      const recyclingRatio = (effectivePowerPct / 100) * CONSTANTS.WATER_RECYCLING_EFFICIENCY_BASE * eclssHealth;
      ls.recyclingEfficiency = Math.round(recyclingRatio * 100);

      if (ls.oxygenPercent < 75 || ls.waterLiters < 100) {
        ls.status = 'hypoxia';
      } else if (ls.oxygenPercent < 90 || ls.waterLiters < 250) {
        ls.status = 'warning';
      } else {
        ls.status = 'nominal';
      }
    }

    /**
     * Compute Radiation Flux & OSDR biological status
     */
    computeRadiation() {
      const s = this.state;
      const rad = s.radiation;
      const a = s.allocations;
      const env = this.locationConfig.environment;
      const p = s.power;

      const shieldPowerPct = p.status === 'brownout' ? 10 : a.shielding;
      const passiveBlockRatio = 0.50;
      const activeBlockRatio = 0.45 * (shieldPowerPct / 100) * ((100 - s.modules.shielding.wear) / 100);
      rad.deflectionEfficiencyPercent = Math.round((passiveBlockRatio + activeBlockRatio) * 100);

      let rawDailyFlux = env.background_gcr_msv_day;
      if (rad.activeStorm) {
        rawDailyFlux += rad.activeStorm.unshieldedSpike;
      }

      const netDailyFlux = rawDailyFlux * (1 - (rad.deflectionEfficiencyPercent / 100));
      rad.currentFluxMsvPerDay = parseFloat(netDailyFlux.toFixed(2));

      if (rad.crewDoseMsv < CONSTANTS.RAD_SAFE_MAX_MSV) {
        rad.healthTier = 'Nominal';
      } else if (rad.crewDoseMsv < CONSTANTS.RAD_CAUTION_MSV) {
        rad.healthTier = 'Caution';
      } else if (rad.crewDoseMsv < CONSTANTS.RAD_WARNING_MSV) {
        rad.healthTier = 'Warning';
      } else {
        rad.healthTier = 'Critical';
      }

      let healthPenalties = 0;
      if (rad.crewDoseMsv > CONSTANTS.RAD_SAFE_MAX_MSV) {
        healthPenalties += (rad.crewDoseMsv - CONSTANTS.RAD_SAFE_MAX_MSV) * 0.4;
      }
      if (s.lifeSupport.oxygenPercent < 90) {
        healthPenalties += (90 - s.lifeSupport.oxygenPercent) * 1.5;
      }
      if (s.lifeSupport.waterLiters < 150) {
        healthPenalties += ((150 - s.lifeSupport.waterLiters) / 150) * 35;
      }

      rad.crewHealthPercent = Math.max(0, Math.min(100, Math.round(100 - healthPenalties)));
    }

    /**
     * Compute Science Milestones
     */
    computeScience() {
      const s = this.state;
      const sci = s.science;

      const milestones = [
        { points: 50, title: "Subsurface Regolith Ice Spectrometry Complete", id: "DISC_ICE_01" },
        { points: 150, title: "Deep Solar Flare Coronal Ion Cataloged", id: "DISC_SOLAR_01" },
        { points: 300, title: "Autonomous Core Drilling Stratigraphy Mapped", id: "DISC_GEO_01" },
        { points: 500, title: "Closed-Loop ISRU Methalox Synthesis Confirmed", id: "DISC_ISRU_01" }
      ];

      milestones.forEach(m => {
        if (sci.points >= m.points && !sci.discoveries.includes(m.id)) {
          sci.discoveries.push(m.id);
          s.log.push({
            sol: s.solDay,
            hour: Math.round(s.elapsedHours % 24),
            type: 'discovery',
            message: `★ SCIENCE BREAKTHROUGH: ${m.title}! (+50 Bonus points)`
          });
          sci.points += 50;
        }
      });
    }

    recalculateAll() {
      this.computeEnvironment();
      this.computePower();
      this.computeLifeSupport();
      this.computeRadiation();
      this.computeScience();
      this.checkMissionStatus();
    }

    checkMissionStatus() {
      const s = this.state;
      if (s.gameOver) return;

      if (s.radiation.crewHealthPercent <= 0) {
        s.gameOver = true;
        s.victory = false;
        s.endReason = 'MISSION ABORT: Crew medical emergency! Radiation and hypoxia exceeded survivable limits.';
        s.log.push({ sol: s.solDay, hour: 0, type: 'critical', message: s.endReason });
        return;
      }

      if (s.lifeSupport.waterLiters <= 0) {
        s.gameOver = true;
        s.victory = false;
        s.endReason = 'MISSION ABORT: Critical Life Support collapse — Outpost fresh water reserves depleted.';
        s.log.push({ sol: s.solDay, hour: 0, type: 'critical', message: s.endReason });
        return;
      }

      if (s.solDay >= 21) {
        s.gameOver = true;
        s.victory = true;
        s.endReason = 'MISSION SUCCESS: 20-Sol Deep Space Expedition successfully completed! Outpost established.';
        s.log.push({ sol: s.solDay, hour: 0, type: 'victory', message: s.endReason });
      }
    }

    /**
     * Advance the simulation by one tick (4 hours)
     * Consumables accumulate and deplete here!
     */
    stepTick() {
      if (this.state.gameOver) return this.state;

      const s = this.state;
      s.tickCount += 1;
      s.elapsedHours += CONSTANTS.HOURS_PER_TICK;

      const hoursPerMissionDay = this.locationId === 'mars' ? 24.65 : 24.0;
      const calculatedSol = Math.floor(s.elapsedHours / hoursPerMissionDay) + 1;
      const newDayStarted = calculatedSol > s.solDay;
      s.solDay = calculatedSol;

      // 1. Battery Net Energy Delta (kWh)
      const p = s.power;
      const netKwhDelta = p.netKw * CONSTANTS.HOURS_PER_TICK;
      p.batteryCurrentKwh = Math.max(0, Math.min(p.batteryCapacityKwh, p.batteryCurrentKwh + netKwhDelta));
      p.batteryPercent = Math.round((p.batteryCurrentKwh / p.batteryCapacityKwh) * 100);

      // 2. Life Support Consumption Delta
      const effectivePowerPct = p.status === 'brownout' ? 15 : s.allocations.lifeSupport;
      const ls = s.lifeSupport;
      if (effectivePowerPct >= 70) {
        ls.oxygenPercent = Math.min(100, ls.oxygenPercent + 0.2);
      } else if (effectivePowerPct >= 40) {
        ls.oxygenPercent = Math.max(0, parseFloat((ls.oxygenPercent - 0.4).toFixed(1)));
      } else {
        ls.oxygenPercent = Math.max(0, parseFloat((ls.oxygenPercent - 1.4).toFixed(1)));
      }

      const crewWaterConsumptionTick = (CONSTANTS.WATER_CONSUMPTION_PER_CREW_DAY * s.crew.count) / CONSTANTS.TICKS_PER_EARTH_DAY;
      const eclssHealth = (100 - s.modules.eclss.wear) / 100;
      const recyclingRatio = (effectivePowerPct / 100) * CONSTANTS.WATER_RECYCLING_EFFICIENCY_BASE * eclssHealth;
      const waterLostTick = crewWaterConsumptionTick * Math.max(0.02, (1 - recyclingRatio));
      ls.waterLiters = Math.max(0, parseFloat((ls.waterLiters - waterLostTick).toFixed(1)));

      // 3. Radiation Dose Accumulation Delta
      const rad = s.radiation;
      const tickDose = rad.currentFluxMsvPerDay / CONSTANTS.TICKS_PER_EARTH_DAY;
      rad.crewDoseMsv = parseFloat((rad.crewDoseMsv + tickDose).toFixed(2));

      // 4. Science Yield Delta
      const sci = s.science;
      const a = s.allocations;
      if (p.status !== 'brownout' && a.science >= 30) {
        const powerBonus = a.science / 100;
        const tickScience = (1.5 * powerBonus) / (CONSTANTS.TICKS_PER_EARTH_DAY / 2);
        sci.points = Math.round(sci.points + tickScience);
      }

      // 5. Environmental Wear
      const wearRate = this.locationConfig.environment.dust_abrasion_rate;
      s.modules.solar_array.wear = Math.min(80, s.modules.solar_array.wear + (wearRate * 0.5));
      s.modules.eclss.wear = Math.min(75, s.modules.eclss.wear + (wearRate * 0.4));
      s.modules.shielding.wear = Math.min(70, s.modules.shielding.wear + (wearRate * 0.3));

      // 6. Active Storm Countdown
      if (rad.activeStorm) {
        rad.activeStorm.remainingTicks -= 1;
        if (rad.activeStorm.remainingTicks <= 0) {
          s.log.push({
            sol: s.solDay,
            hour: Math.round(s.elapsedHours % 24),
            type: 'info',
            message: `DONKI Alert Clear: Solar storm ${rad.activeStorm.id} has passed. Radiation flux returning to baseline.`
          });
          rad.activeStorm = null;
        }
      }

      // 7. Check Tactical Events
      if (newDayStarted && !s.activeEvent) {
        this.checkForEvents();
      }

      this.recalculateAll();
      return this.state;
    }

    checkForEvents() {
      const s = this.state;
      const eventCandidates = this.ref.tactical_events || [];

      for (const evt of eventCandidates) {
        if (evt.trigger_day === s.solDay && !s.resolvedEvents.includes(evt.id)) {
          s.activeEvent = JSON.parse(JSON.stringify(evt));
          s.log.push({
            sol: s.solDay,
            hour: Math.round(s.elapsedHours % 24),
            type: 'alert',
            message: `TACTICAL ALERT: ${evt.title}`
          });
          break;
        }
      }
    }

    resolveActiveEvent(choiceId) {
      const s = this.state;
      if (!s.activeEvent) return null;

      const choice = s.activeEvent.choices.find(c => c.id === choiceId);
      if (!choice) return null;

      const imp = choice.impacts;

      if (imp.crew_radiation_msv) {
        s.radiation.crewDoseMsv = parseFloat((s.radiation.crewDoseMsv + imp.crew_radiation_msv).toFixed(2));
      }
      if (imp.science_points) {
        s.science.points += imp.science_points;
      }
      if (imp.battery_percent_change) {
        s.power.batteryPercent = Math.max(0, Math.min(100, s.power.batteryPercent + imp.battery_percent_change));
        s.power.batteryCurrentKwh = (s.power.batteryPercent / 100) * s.power.batteryCapacityKwh;
      }
      if (imp.oxygen_percent_change) {
        s.lifeSupport.oxygenPercent = Math.max(0, Math.min(100, s.lifeSupport.oxygenPercent + imp.oxygen_percent_change));
      }
      if (imp.water_liters_change) {
        s.lifeSupport.waterLiters = Math.max(0, parseFloat((s.lifeSupport.waterLiters + imp.water_liters_change).toFixed(1)));
      }
      if (imp.shield_integrity_change) {
        s.radiation.shieldIntegrityPercent = Math.max(10, Math.min(100, s.radiation.shieldIntegrityPercent + imp.shield_integrity_change));
      }
      if (imp.crew_health_change) {
        s.radiation.crewHealthPercent = Math.max(0, Math.min(100, s.radiation.crewHealthPercent + imp.crew_health_change));
      }

      if (s.activeEvent.donki_ref && s.activeEvent.donki_ref.includes('DONKI')) {
        const donkiCatalogItem = this.ref.donki_weather_catalog.find(d => d.id === s.activeEvent.donki_ref);
        if (donkiCatalogItem) {
          s.radiation.activeStorm = {
            id: donkiCatalogItem.id,
            intensity: donkiCatalogItem.intensity,
            unshieldedSpike: donkiCatalogItem.radiation_unshielded_spike_msv,
            remainingTicks: 3
          };
        }
      }

      const eventSummary = {
        eventId: s.activeEvent.id,
        title: s.activeEvent.title,
        choiceMade: choice.label,
        feedback: choice.feedback,
        sol: s.solDay
      };

      s.resolvedEvents.push(s.activeEvent.id);
      s.log.push({
        sol: s.solDay,
        hour: Math.round(s.elapsedHours % 24),
        type: 'decision',
        message: `Commander Decision: ${choice.label} | ${choice.feedback}`
      });

      s.activeEvent = null;
      this.recalculateAll();

      return eventSummary;
    }

    performMaintenance(moduleKey) {
      const s = this.state;
      if (!s.modules[moduleKey]) return false;

      if (s.power.batteryPercent < 15) {
        s.log.push({
          sol: s.solDay,
          hour: Math.round(s.elapsedHours % 24),
          type: 'warning',
          message: 'Maintenance cancelled: Insufficient battery reserve (< 15%).'
        });
        return false;
      }

      const mod = s.modules[moduleKey];
      const previousWear = mod.wear;
      mod.wear = Math.max(0, mod.wear - 35);
      
      s.power.batteryPercent = Math.max(0, s.power.batteryPercent - 12);
      s.power.batteryCurrentKwh = (s.power.batteryPercent / 100) * s.power.batteryCapacityKwh;
      s.crew.fatiguePercent = Math.min(100, s.crew.fatiguePercent + 15);

      s.log.push({
        sol: s.solDay,
        hour: Math.round(s.elapsedHours % 24),
        type: 'maintenance',
        message: `Maintenance Overhaul completed on ${mod.name}. Wear reduced from ${Math.round(previousWear)}% to ${Math.round(mod.wear)}%.`
      });

      this.recalculateAll();
      return true;
    }

    computeDebriefScore() {
      const s = this.state;
      
      const survivalScore = Math.min(20, s.solDay) * 50;
      const scienceScore = s.science.points * 2;
      const healthScore = Math.round(s.radiation.crewHealthPercent * 10);
      const radiationBonus = Math.max(0, Math.round((250 - s.radiation.crewDoseMsv) * 3));
      const reserveScore = Math.round((s.lifeSupport.waterLiters * 0.4) + (s.power.batteryPercent * 2));

      const totalScore = survivalScore + scienceScore + healthScore + radiationBonus + reserveScore;

      let rank = 'Junior Outpost Cadet';
      let badgeClass = 'bronze';
      let evaluation = 'Satisfactory training trial.';

      if (totalScore >= 3200 && s.victory) {
        rank = 'Master Deep Space Flight Director';
        badgeClass = 'elite-gold';
        evaluation = 'Exceptional engineering discipline! Balanced life support, mitigated high-energy solar storms, and maximized planetary science without compromising crew safety.';
      } else if (totalScore >= 2400) {
        rank = 'Senior Outpost Commander';
        badgeClass = 'gold';
        evaluation = 'Superb command performance. Handled mission trade-offs with calm calculation and preserved vital habitat reserves.';
      } else if (totalScore >= 1600) {
        rank = 'Certified Mission Specialist';
        badgeClass = 'silver';
        evaluation = 'Good operational control. Encountered resource stress and space radiation exposure, but kept the outpost running.';
      } else {
        rank = 'Junior Space Systems Apprentice';
        badgeClass = 'bronze';
        evaluation = 'Hard lessons in deep space survival: every kilowatt diverted has an immediate cost, and space radiation leaves no margin for hesitation.';
      }

      return {
        totalScore,
        survivalSols: s.solDay,
        sciencePoints: s.science.points,
        finalCrewHealth: s.radiation.crewHealthPercent,
        totalDoseMsv: s.radiation.crewDoseMsv,
        waterRemainingLiters: Math.round(s.lifeSupport.waterLiters),
        batteryRemainingPercent: s.power.batteryPercent,
        discoveriesUnlocked: s.science.discoveries.length,
        rank,
        badgeClass,
        evaluation,
        lessonsLearned: [
          "No choice is free: Routing power to shields protects astronauts from deadly Coronal Mass Ejections (CMEs) but starves life-support scrubbers.",
          "Living off the land (ISRU): Extracting water ice and cracking atmospheric CO2 with MOXIE is essential because bringing supplies from Earth costs millions per kilogram.",
          "Biological limits are real: Radiation from Solar Particle Events accumulates silently inside the human body (measured in mSv), requiring vigilant storm shelter doctrine."
        ]
      };
    }

    serialize() {
      return JSON.stringify(this.state);
    }

    deserialize(jsonString) {
      try {
        const loaded = JSON.parse(jsonString);
        this.state = loaded;
        this.locationId = loaded.locationId;
        this.locationConfig = this.ref.locations[this.locationId];
        this.recalculateAll();
        return true;
      } catch (e) {
        console.error('Failed to load simulation state', e);
        return false;
      }
    }
  }

  return OutpostEngine;
}));
