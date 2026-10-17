import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const source = await readFile(new URL('orbit-gestures.js', dist), 'utf8');
const { bindOrbitGestures } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
class Surface extends EventTarget {
  constructor() {
    super();
    this.classes = new Set(); this.captured = new Set();
    this.classList = { add: name => this.classes.add(name), remove: name => this.classes.delete(name) };
  }
  closest() { return null; }
  setPointerCapture(id) { this.captured.add(id); }
  hasPointerCapture(id) { return this.captured.has(id); }
  releasePointerCapture(id) { this.captured.delete(id); }
}
const surface = new Surface(), page = new Surface(), rotations = [], scales = [];
const controls = bindOrbitGestures(surface, { onRotate: (dx,dy) => rotations.push([dx,dy]), onScale: factor => scales.push(factor) });
const emit = (target, type, values = {}) => {
  const event = new Event(type, { cancelable: true });
  Object.assign(event, { pointerId: 1, pointerType: 'touch', button: 0, clientX: 100, clientY: 200, ...values });
  target.dispatchEvent(event);
  return event;
};

// Starting outside the dedicated surface must never capture, rotate, zoom or cancel page input.
emit(page, 'pointerdown'); emit(page, 'pointermove', {clientX:150});
assert.equal(emit(page, 'wheel', {deltaY:100}).defaultPrevented, false);
assert.equal(page.captured.size,0); assert.equal(rotations.length,0); assert.equal(scales.length,0);

// Vertical touch motion is reserved for native scroll, even if the direction changes later.
assert.equal(emit(surface,'pointerdown').defaultPrevented,false);
assert.equal(emit(surface,'pointermove',{clientY:230}).defaultPrevented,false);
emit(surface,'pointermove',{clientX:180,clientY:235});
assert.equal(rotations.length,0); assert.equal(surface.captured.size,0);
emit(surface,'pointercancel');
assert.equal(surface.classes.has('is-dragging'),false);

// Horizontal touch rotation does not tilt the camera or prevent default vertical scrolling.
emit(surface,'pointerdown');
assert.equal(emit(surface,'pointermove',{clientX:130,clientY:203}).defaultPrevented,false);
assert.deepEqual(rotations.pop(),[30,0]);
assert.equal(surface.classes.has('is-dragging'),true);
emit(surface,'pointerup');
assert.equal(surface.classes.has('is-dragging'),false);

// Desktop dragging retains both rotation axes and only captures the compact surface.
emit(surface,'pointerdown',{pointerType:'mouse'});
assert.equal(surface.captured.has(1),true);
emit(surface,'pointermove',{pointerType:'mouse',clientX:112,clientY:217});
assert.deepEqual(rotations.pop(),[12,17]);
emit(surface,'pointerup',{pointerType:'mouse'});
assert.equal(surface.captured.size,0);
emit(surface,'pointerdown',{pointerType:'mouse',button:2});
emit(surface,'pointermove',{pointerType:'mouse',clientX:140});
assert.equal(rotations.length,0);

// Two fingers zoom; cancellation and reset do not leave stale pointer state.
emit(surface,'pointerdown');
emit(surface,'pointerdown',{pointerId:2,clientX:200});
emit(surface,'pointermove',{pointerId:2,clientX:250});
assert.equal(scales.pop(),1.5);
assert.equal(rotations.length,0);
emit(surface,'pointercancel',{pointerId:1}); emit(surface,'pointercancel',{pointerId:2});
emit(surface,'pointermove',{clientX:170}); assert.equal(rotations.length,0);
assert.equal(surface.classes.has('is-dragging'),false);
emit(surface,'pointerdown'); controls.reset(); emit(surface,'pointermove',{clientX:150});
assert.equal(rotations.length,0);
emit(surface,'pointerdown',{pointerType:'mouse'});controls.reset();assert.equal(surface.captured.size,0);
assert.equal(emit(surface,'wheel',{deltaY:100}).defaultPrevented,true);
assert.ok(scales.pop()<1);
controls.destroy();
assert.equal(emit(surface,'wheel',{deltaY:100}).defaultPrevented,false);
assert.equal(scales.length,0);

// Guard the actual scene wiring: never return gesture capture to the full world host.
const scene = await readFile(new URL('cosmos3d.js',dist),'utf8');
assert.ok(scene.includes('bindOrbitGestures(interaction,'));
assert.ok(!/host\.on(?:pointerdown|pointermove|pointerup|wheel)\s*=/.test(scene));
assert.ok(scene.includes('gestures.destroy();interaction.remove()'));
const css = await readFile(new URL('style.css',dist),'utf8');
assert.ok(css.includes('.world,.has-3d{touch-action:pan-y pinch-zoom}'));
assert.ok(!/\.has-3d\s*\{touch-action:none/.test(css));
assert.ok(css.includes('top:125px;height:320px;max-width:400px'));
console.log('Gesture checks passed: compact surface only, native vertical-scroll handoff, horizontal touch rotation, pinch, desktop drag, wheel scope and cancellation.');
