import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { formatMapDate, groupMapRecords } from '../src/scripts/map-popup.ts';

const events = [{
  properties: { placeRef: 'city.md', placeLabel: 'Город', eventTitle: 'Учёба' },
  geometry: { coordinates: [37.1, 55.5] },
}];
const photos = [{
  ref: 'school/photo.md',
  title: 'Школьное фото',
  thumbnailUrl: '/_astro/photo-thumb.webp',
  coordinates: [37.1, 55.5],
  placeRef: 'city.md',
  placeLabel: 'Город',
  placeUrl: '/places/city/',
  geoExplicit: false,
}];

const grouped = groupMapRecords(events, photos);
assert.equal(grouped.length, 1, 'an event and a photo at one place share a marker');
assert.equal(grouped[0].events.length, 1);
assert.equal(grouped[0].photos.length, 1);
assert.equal(grouped[0].placeUrl, '/places/city/');
assert.equal(groupMapRecords([], photos)[0].photos.length, 1, 'photo-only places are visible');
assert.equal(groupMapRecords(events, [])[0].events.length, 1, 'event-only places are visible');
assert.equal(groupMapRecords([], [{ ...photos[0], thumbnailUrl: '' }]).length, 0, 'missing thumbnails are skipped');
assert.equal(groupMapRecords([], [{ ...photos[0], coordinates: [NaN, 4] }]).length, 0, 'invalid coordinates are skipped');

const exact = groupMapRecords(events, [{ ...photos[0], geoExplicit: true, coordinates: [37.2, 55.6] }]);
assert.equal(exact.length, 2, 'a distinct camera location remains independent from its place');
assert(exact.some((group) => group.key === 'photo:school/photo.md'));
assert.equal(formatMapDate({ year: 1901, circa: true }), 'ок. 1901');
assert.equal(formatMapDate({ year: 1999, month: 5, day: 3 }), '3.5.1999');

// Protect the separate full-map year slider when reusing the personal map chrome.
const readSource = (file) => readFile(new URL(file, import.meta.url), 'utf8');
const [fullPage, fullRenderer, personMap, controls, titleStyles] = await Promise.all([
  readSource('../src/pages/events/map-renderer.astro'),
  readSource('../src/scripts/event-map-renderer.ts'),
  readSource('../src/components/PersonPlacesMap.astro'),
  readSource('../src/scripts/map-controls.ts'),
  readSource('../src/styles/map-controls.css'),
]);

assert.match(fullPage, /data-map-title/, 'full map keeps its title tab');
for (const control of ['data-range-control', 'data-range-from', 'data-range-to', 'data-range-track', 'data-range-label']) {
  assert(fullPage.includes(control), `full map retains its year slider: ${control}`);
}
assert.match(fullRenderer, /rangeFrom\.addEventListener\('input', updateRange\)/, 'full-map slider is wired');
assert.match(fullRenderer, /rangeTo\.addEventListener\('input', updateRange\)/, 'both year handles are wired');
assert.match(fullRenderer, /FullscreenControl/, 'full-map fullscreen remains');
assert.match(fullRenderer, /MapOverviewControl/, 'full-map overview remains');
assert.match(personMap, /data-map-title/, 'person map has a built-in title tab');
assert.match(personMap, /События жизни/, 'person map title includes the full name');
assert.match(personMap, /new MapOverviewControl/, 'person map gets a reset-bounds control');
assert.match(personMap, /new maplibregl\.FullscreenControl\(\{ container: canvas \}\)/, 'person map fullscreen targets the map itself');
assert.match(controls, /aria-label/, 'overview control is accessible');
assert.match(titleStyles, /person-map-canvas:fullscreen/, 'person map expands to the viewport');
console.log('Map popup and map UI checks passed.');
