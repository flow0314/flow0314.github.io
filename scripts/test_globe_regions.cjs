// Run with @napi-rs/canvas available on NODE_PATH; no browser or live tracking.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { pathToFileURL, fileURLToPath } = require('node:url');
const { resolve } = require('node:path');
const { createHash } = require('node:crypto');
const { createCanvas, Path2D } = require('@napi-rs/canvas');

(async () => {
  const base = resolve(__dirname, '..');
  const module = await import(pathToFileURL(resolve(base, 'assets/js/globe-choropleth.js')));
  global.Path2D = Path2D;
  global.document = { createElement(tag) { assert.equal(tag, 'canvas'); return createCanvas(1, 1); } };
  global.fetch = async url => {
    assert.equal(fileURLToPath(url), resolve(base, 'assets/data/globe-regions.json'));
    return { ok: true, json: async () => JSON.parse(readFileSync(url, 'utf8')) };
  };
  const map = await module.createCountryMap();
  const neutral = map.paint([]);
  const hash = canvas => createHash('sha256').update(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data).digest('hex');
  const baseline = hash(neutral);
  assert.equal(hash(map.paint([{ country: 'ZZ', visits: 100000 }])), baseline,
    'unknown locations must not color unassigned map units');
  const canvas = map.paint([{ country: 'CN', visits: 100 }, { country: 'US', visits: 10 }, { country: 'ZZ', visits: 100000 }]);
  function pixel(lon, lat) {
    const [x, y] = module.project([lon, lat], canvas.width, canvas.height);
    return Array.from(canvas.getContext('2d').getImageData(Math.floor(x), Math.floor(y), 1, 1).data);
  }
  const rgb = value => value.match(/\d+/g).map(Number);
  assert.deepEqual(pixel(105, 35), [...module.HIGH, 255], 'whole China region uses its aggregate count');
  const us = [...rgb(module.regionColor(10, 100)), 255];
  assert.deepEqual(pixel(-110, 40), us, 'western US uses the country color');
  assert.deepEqual(pixel(-85, 35), us, 'eastern US uses the same country color');
  assert.deepEqual(pixel(-110, 57), [...module.NEUTRAL, 255], 'unvisited Canada stays neutral');
  assert.equal(pixel(-140, 0)[3], 0, 'date-line polygons do not cover the Pacific ocean');
  const singaporeBefore = pixel(103.82, 1.35);
  map.paint([{ country: 'US', visits: 100 }, { country: 'SG', visits: 4 }]);
  const singapore = [...rgb(module.regionColor(4, 100)), 255];
  assert.deepEqual(pixel(103.82, 1.35), singapore, 'Singapore fill survives pale boundaries');
  assert.deepEqual(pixel(104.3, 1.35), singapore, 'tiny visited regions receive a visible footprint');
  assert.notDeepEqual(singaporeBefore, singapore, 'unvisited Singapore has no visit color');
  assert.deepEqual(pixel(102, 4), [...module.NEUTRAL, 255], 'nearby Malaysia keeps its neutral fill');
  map.paint([{ country: 'US', visits: 100 }]);
  assert.notDeepEqual(pixel(104.3, 1.35), singapore, 'visibility treatment disappears without visits');
  const luminance = color => color[0] * .2126 + color[1] * .7152 + color[2] * .0722;
  const levels = [module.NEUTRAL, ...[1, 10, 100].map(count => rgb(module.regionColor(count, 100)))].map(luminance);
  assert(levels.every((value, i) => !i || value < levels[i - 1]), 'more visits produce progressively darker colors');
  assert.deepEqual(module.project([-180, 90], 2048, 1024), [0, 0]);
  assert.deepEqual(module.project([180, -90], 2048, 1024), [2048, 1024]);
  console.log('Passed: whole-country fill, tiny-region visibility, country borders, monotonic shading, unknown locations, and date-line clipping.');
})().catch(error => { console.error(error); process.exitCode = 1; });
