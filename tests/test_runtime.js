const fs = require('fs');
const simCode = fs.readFileSync('sim.js', 'utf8');
const appCode = fs.readFileSync('app.js', 'utf8');
const refData = JSON.parse(fs.readFileSync('data/nasa_reference.json', 'utf8'));

const listeners = {};
const elements = {};

function createMockElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); }
    },
    style: {},
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener(event, fn) {
      const key = id + ':' + event;
      if (!listeners[key]) listeners[key] = [];
      listeners[key].push(fn);
    },
    dispatchEvent() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 390, height: 220 }; },
    getContext(type) {
      if (type === '2d') {
        return new Proxy({}, {
          get(target, prop) {
            if (prop === 'roundRect') {
              // Test what happens if roundRect is undefined in browser!
              return undefined;
            }
            if (prop === 'measureText') return () => ({ width: 50 });
            if (prop === 'createLinearGradient') return () => ({ addColorStop() {} });
            return () => {};
          }
        });
      }
      return null;
    },
    width: 960,
    height: 520,
    value: 'Cadet Explorer',
    appendChild() {},
    innerHTML: '',
    textContent: ''
  };
}

const mockDoc = {
  readyState: 'complete',
  getElementById(id) {
    if (!elements[id]) elements[id] = createMockElement(id);
    return elements[id];
  },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  addEventListener(event, fn) {
    const key = 'doc:' + event;
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(fn);
  },
  createElement(tag) { return createMockElement('anon_' + Math.random(), tag); }
};

let frameCount = 0;
const mockWindow = {
  document: mockDoc,
  addEventListener(event, fn) {
    const key = 'win:' + event;
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(fn);
  },
  requestAnimationFrame(fn) {
    frameCount++;
    if (frameCount <= 5) {
      try {
        fn();
      } catch (e) {
        console.error('CRASH IN requestAnimationFrame on frame ' + frameCount + ':', e);
        process.exit(1);
      }
    }
    return frameCount;
  },
  cancelAnimationFrame() {},
  AudioContext: class {
    createGain() { return { connect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {} } }; }
    createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
    destination = {};
    currentTime = 0;
  }
};

global.window = mockWindow;
global.document = mockDoc;
global.self = mockWindow;
global.requestAnimationFrame = mockWindow.requestAnimationFrame;
global.cancelAnimationFrame = mockWindow.cancelAnimationFrame;
global.navigator = { vibrate: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve(refData) });

try {
  eval(simCode);
  if (!global.window.OutpostSim && typeof module !== 'undefined' && module.exports) {
    global.window.OutpostSim = module.exports;
  }
  eval(appCode);
  console.log('Runtime eval finished without top-level errors. Frame count at start:', frameCount);

  setTimeout(() => {
    console.log('After async ticks: Frame count is', frameCount);
    if (frameCount > 0) {
      console.log('SUCCESS: Animation frames rendered successfully!');
      process.exit(0);
    } else {
      console.error('FAILED: No frames rendered.');
      process.exit(1);
    }
  }, 200);
} catch (e) {
  console.error('Top-level evaluation error:', e);
}
