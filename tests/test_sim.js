/**
 * Automated Unit Test Suite for Pure Deterministic Engine (src/compute/sim.js)
 * Run with: node tests/test_sim.js
 */

const fs = require('fs');
const path = require('path');
const OutpostSim = require('../src/compute/sim.js');

const refData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/nasa_reference.json'), 'utf8'));

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== Artemis Outpost Simulation Engine Unit Tests ===\n');

// Test 1: Moon Initialization
console.log('[Test 1: Moon Outpost Initialization]');
const moonSim = new OutpostSim(refData, 'moon');
assert(moonSim.state.locationId === 'moon', 'Location set to moon');
assert(moonSim.state.power.batteryPercent === 100, 'Battery starts at 100%');
assert(moonSim.state.lifeSupport.oxygenPercent === 100, 'Oxygen starts at 100%');
assert(moonSim.state.lifeSupport.waterLiters === 850, 'Water reserves start at 850 L');
assert(moonSim.state.radiation.crewDoseMsv === 1.2, 'Crew dose starts at 1.2 mSv');
assert(moonSim.state.crew.count === 4, 'Crew count is 4 astronauts');

// Test 2: Mars Initialization
console.log('\n[Test 2: Mars Outpost Initialization]');
const marsSim = new OutpostSim(refData, 'mars');
assert(marsSim.state.locationId === 'mars', 'Location set to mars');
assert(marsSim.state.dustOpticalDepthTau === 0.4, 'Martian dust tau initialized to 0.4');
assert(marsSim.locationConfig.environment.gravity_g === 0.38, 'Martian gravity is 0.38g');

// Test 3: Deterministic Tick Step & Power Calculation
console.log('\n[Test 3: Power & Day/Night Progression]');
moonSim.setAllocations({ lifeSupport: 80, shielding: 70, science: 60, comms: 80 });
const stateBeforeTick = JSON.parse(JSON.stringify(moonSim.state));
moonSim.stepTick(); // 4 hours elapsed
assert(moonSim.state.tickCount === 1, 'Tick count incremented to 1');
assert(moonSim.state.elapsedHours === 4, 'Elapsed hours incremented by 4');
assert(typeof moonSim.state.power.generationKw === 'number' && !isNaN(moonSim.state.power.generationKw), 'Generation kW is valid number');
assert(typeof moonSim.state.power.consumptionKw === 'number' && !isNaN(moonSim.state.power.consumptionKw), 'Consumption kW is valid number');

// Test 4: ECLSS Power Starvation & Hypoxia
console.log('\n[Test 4: ECLSS Power Starvation Trade-off]');
const starvedSim = new OutpostSim(refData, 'moon');
// Starve Life Support (cut power to 20%)
starvedSim.setAllocations({ lifeSupport: 20, shielding: 100, science: 0, comms: 20 });
for (let i = 0; i < 6; i++) {
  starvedSim.stepTick();
}
assert(starvedSim.state.lifeSupport.oxygenPercent < 100, `Oxygen decreased under power starvation (Current: ${starvedSim.state.lifeSupport.oxygenPercent}%)`);
assert(starvedSim.state.lifeSupport.co2ScrubberStatus === 'offline', 'CO2 scrubbers switched to offline');

// Test 5: Radiation Deflection & OSDR Limits
console.log('\n[Test 5: Active Shielding & OSDR Limits]');
const shieldSim = new OutpostSim(refData, 'moon');
// Max shielding: 100%
shieldSim.setAllocations({ lifeSupport: 80, shielding: 100, science: 20, comms: 50 });
shieldSim.recalculateAll();
const highDeflection = shieldSim.state.radiation.deflectionEfficiencyPercent;
// Minimal shielding: 0%
shieldSim.setAllocations({ lifeSupport: 80, shielding: 0, science: 20, comms: 50 });
shieldSim.recalculateAll();
const lowDeflection = shieldSim.state.radiation.deflectionEfficiencyPercent;
assert(highDeflection > lowDeflection, `High shield power yields greater deflection (${highDeflection}% vs ${lowDeflection}%)`);

// Test 6: Tactical Event Trigger & Choice Resolution
console.log('\n[Test 6: Tactical Event Deterministic Resolution]');
const eventSim = new OutpostSim(refData, 'moon');
// Fast forward to Day 3 where Solar Storm event triggers
while (eventSim.state.solDay < 3) {
  eventSim.stepTick();
}
assert(eventSim.state.activeEvent !== null, 'Tactical event triggered on Day 3');
assert(eventSim.state.activeEvent.id === 'event_solar_particle_storm', 'Event is Solar Particle Storm');

// Resolve with storm shelter choice
const choiceResult = eventSim.resolveActiveEvent('storm_shelter');
assert(choiceResult !== null, 'Event resolved successfully');
assert(eventSim.state.activeEvent === null, 'Active event cleared after decision');
assert(eventSim.state.resolvedEvents.includes('event_solar_particle_storm'), 'Event logged in resolvedEvents');
assert(eventSim.state.radiation.activeStorm !== null, 'Active storm state initiated for subsequent ticks');

// Test 7: Debrief Scoring & Badge Ranking
console.log('\n[Test 7: Mission Debrief & Certification]');
const debrief = eventSim.computeDebriefScore();
assert(typeof debrief.totalScore === 'number' && debrief.totalScore > 0, `Total score computed: ${debrief.totalScore}`);
assert(typeof debrief.rank === 'string' && debrief.rank.length > 0, `Rank assigned: ${debrief.rank}`);
assert(Array.isArray(debrief.lessonsLearned) && debrief.lessonsLearned.length === 3, 'Lessons learned generated');

console.log(`\n===========================================`);
console.log(`Test Results: ${passed} Passed, ${failed} Failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log(`ALL ENGINE SCIENTIFIC TESTS PASSED!`);
}

