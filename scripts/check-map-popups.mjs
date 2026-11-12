import assert from 'node:assert/strict';
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

console.log('Map popup grouping checks passed.');
