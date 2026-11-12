import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { formatMapDate, groupMapRecords } from '../src/scripts/map-popup.ts';
import { mapYearBounds, mapEventsInYears, mapPhotosInYears } from '../src/scripts/map-year-range.ts';

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


const datedEvents = [
  { properties: { startYear: 1999, endYear: 2002 } },
  { properties: { startYear: 2010 } },
  { properties: { startYear: null } },
];
const datedPhotos = [{ year: 2000 }, { year: 2013 }, { year: null }];
assert.deepEqual(mapYearBounds(datedEvents, datedPhotos), { min: 1999, max: 2013 });
assert.deepEqual(mapYearBounds([], [{ year: 2007 }]), { min: 2007, max: 2007 }, 'photo-only maps have a year range');
assert.equal(mapYearBounds([{ properties: {} }], [{ year: null }]), null, 'undated maps keep the slider hidden');
const narrowed = { from: 2001, to: 2005, full: false };
assert.deepEqual(mapEventsInYears(datedEvents, narrowed), [datedEvents[0]], 'spanning events overlap the window');
assert.equal(mapPhotosInYears(datedPhotos, narrowed).length, 0, 'photos outside the range disappear');
const photoYear = { from: 2000, to: 2000, full: false };
assert.deepEqual(mapPhotosInYears(datedPhotos, photoYear), [datedPhotos[0]], 'photo years are inclusive');
const fullYears = { from: 1999, to: 2013, full: true };
assert.equal(mapEventsInYears(datedEvents, fullYears).length, 3, 'full range keeps undated events');
assert.equal(mapPhotosInYears(datedPhotos, fullYears).length, 3, 'full range keeps undated photos');
assert.equal(mapEventsInYears(datedEvents, narrowed).includes(datedEvents[2]), false, 'narrowed range hides undated events');
assert.equal(mapPhotosInYears(datedPhotos, narrowed).includes(datedPhotos[2]), false, 'narrowed range hides undated photos');

// Protect both map sliders, including their independent controls and event handlers.
const readSource = (file) => readFile(new URL(file, import.meta.url), 'utf8');
const [fullPage, fullRenderer, personMap, controls, titleStyles, yearStyle, yearScript] = await Promise.all([
  readSource('../src/pages/events/map-renderer.astro'),
  readSource('../src/scripts/event-map-renderer.ts'),
  readSource('../src/components/PersonPlacesMap.astro'),
  readSource('../src/scripts/map-controls.ts'),
  readSource('../src/styles/map-controls.css'),
  readSource('../src/styles/map-year-range.css'),
  readSource('../src/scripts/map-year-range.ts'),
]);

assert.match(fullPage, /data-map-title/, 'full map keeps its title tab');
assert.match(fullPage, /map-year-range\.css/, 'full map loads the shared slider CSS');
assert.match(personMap, /map-year-range\.css/, 'person map loads the shared slider CSS');
for (const control of ['data-range-control', 'data-range-from', 'data-range-to', 'data-range-track', 'data-range-label']) {
  assert(fullPage.includes(control), `full map retains its year slider: ${control}`);
}
assert.match(fullRenderer, /mountMapYearRange\(rangeControl, allFeatures, allPhotos/, 'full-map slider is wired through the shared controller');
assert.match(yearScript, /fromInput\.addEventListener\('input', handleInput\)/, 'start year handle is wired');
assert.match(yearScript, /toInput\.addEventListener\('input', handleInput\)/, 'end year handle is wired');
assert.match(fullRenderer, /FullscreenControl/, 'full-map fullscreen remains');
assert.match(fullRenderer, /MapOverviewControl/, 'full-map overview remains');
assert.match(personMap, /data-map-title/, 'person map has a built-in title tab');
for (const control of ['data-range-control', 'data-range-from', 'data-range-to', 'data-range-track', 'data-range-label']) {
  assert(personMap.includes(control), `person map also has a year slider: ${control}`);
}
assert.match(personMap, /mountMapYearRange\(rangeControl, eventsForPerson, photosForPerson/, 'person map filters its own years');
assert.match(personMap, /mapEventsInYears\(eventsForPerson/, 'person map filters its events');
assert.match(personMap, /mapPhotosInYears\(photosForPerson/, 'person map filters photos');
assert.match(yearStyle, /\.event-range__track/, 'both maps share the year slider styles');
assert.match(yearStyle, /bottom:\s*max\(0\.65rem, env\(safe-area-inset-bottom\)\)/, 'slider is docked to the safe bottom of the map');
assert.match(yearStyle, /display:\s*flex/, 'year label and controls share one compact row');
assert.match(yearStyle, /map-shell:has\(\.event-range:not\(\[hidden\]\)\) \.genealogy-map-layer-switch/, 'full-map layer switch stays above the visible slider');
assert.match(yearStyle, /person-map-canvas:has\(\.event-range:not\(\[hidden\]\)\) \.genealogy-map-layer-switch/, 'personal layer switch stays above the visible slider');
assert.match(yearStyle, /transform:\s*translateY\(-50%\)/, 'year handles stay vertically centered');
assert.match(yearScript, /label\.value = years/, 'compact slider shows only the years');
assert.match(yearScript, /label\.setAttribute\('aria-label', `Временной интервал:/, 'full accessible range label remains');
assert(!fullPage.includes('genealogy-map-top-panels'), 'full-map range is no longer under the title');
assert(!personMap.includes('genealogy-map-top-panels'), 'person-map range is no longer under the title');
assert.match(fullPage, /class="event-range" data-range-control/, 'full-map slider remains mounted');
assert.match(personMap, /class="event-range" data-range-control/, 'personal slider remains mounted');
assert.match(personMap, /События жизни/, 'person map title includes the full name');
assert.match(personMap, /new MapOverviewControl/, 'person map gets a reset-bounds control');
assert.match(personMap, /new maplibregl\.FullscreenControl\(\{ container: canvas \}\)/, 'person map fullscreen targets the map itself');
assert.match(controls, /aria-label/, 'overview control is accessible');
assert.match(titleStyles, /person-map-canvas:fullscreen/, 'person map expands to the viewport');
console.log('Map popup and map UI checks passed.');
