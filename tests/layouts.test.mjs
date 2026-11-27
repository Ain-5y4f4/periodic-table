import assert from 'node:assert/strict';
import { tableLayout, sphereLayout, helixLayout, gridLayout, TABLE, GRID } from '../js/layouts.js';
import { colorFor, parseMoney, parseCsv, rowsToPeople } from '../js/data.js';
import { readFileSync } from 'node:fs';

const N = 200;
const uniq = (a) => new Set(a.map((p) => [p.x, p.y, p.z].map((v) => v.toFixed(3)).join())).size;

// Table: 20 x 10
const t = tableLayout(N);
assert.equal(new Set(t.map((p) => p.x)).size, 20);
assert.equal(new Set(t.map((p) => p.y)).size, 10);
assert.equal(uniq(t), N);

// Grid: 10 wide x 4 high x 5 deep
const g = gridLayout(N);
assert.equal(new Set(g.map((p) => p.x)).size, 10);
assert.equal(new Set(g.map((p) => p.y)).size, 4);
assert.equal(new Set(g.map((p) => p.z)).size, 5);
assert.equal(uniq(g), N);

// Sphere: all on the same radius
const s = sphereLayout(N);
s.forEach((p) => assert.ok(Math.abs(Math.hypot(p.x, p.y, p.z) - 800) < 1e-6));
assert.equal(uniq(s), N);

// Double helix: two strands, opposite sides at same height
const h = helixLayout(N);
assert.equal(uniq(h), N);
for (let k = 0; k < 100; k++) {
  const a = h[2 * k], b = h[2 * k + 1];
  assert.ok(Math.abs(a.x + b.x) < 1e-6 && Math.abs(a.z + b.z) < 1e-6 && a.y === b.y);
}

// Colours
assert.equal(colorFor(99_999), '#EF3022');
assert.equal(colorFor(150_000), '#FDCA35');
assert.equal(colorFor(250_000), '#3A9F48');
assert.equal(parseMoney('$251,260.80'), 251260.8);

// Real CSV
const people = rowsToPeople(parseCsv(readFileSync(new URL('../data/Data_Template.csv', import.meta.url), 'utf8')));
assert.equal(people.length, 200);
assert.ok(people.every((p) => p.name && p.photo.startsWith('http') && p.netWorth > 0));
console.log('All tests passed');
