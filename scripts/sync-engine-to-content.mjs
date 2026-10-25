/**
 * Apply the explicitly engine-owned files from this PUBLIC repo to a
 * checked-out family content repository.
 *
 * Never sync content, private imports, site settings, or generated assets.
 * Files removed from this engine are only removed if the previous manifest
 * proves this sync originally managed them.
 *
 * Usage: node scripts/sync-engine-to-content.mjs ./genealogy-content
 */
import { readdir, readFile, writeFile, mkdir, copyFile, rm, lstat } from 'node:fs/promises';
import { resolve, relative, join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const engineRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targetRoot = resolve(process.argv[2] || '');
if (!process.argv[2] || targetRoot === engineRoot || targetRoot.startsWith(engineRoot + sep)) {
  throw new Error('Pass a separate checked-out family content repository as the target.');
}
const manifestName = '.genealogy-engine-managed.json';

const ownedDirectories = [
  'src/components',
  'src/styles',
  'src/scripts',
  'src/pages',
  'public/tree',
  'public/textures',
];
const ownedFiles = [
  'src/routeData.ts',
  'src/content.config.ts',
  'scripts/augment-genealogy-metadata.mjs',
  'scripts/build-events-places.mjs',
  'scripts/build-genealogy.mjs',
  'scripts/build-media.mjs',
  'scripts/build-og-images.mjs',
  'scripts/build-tree-data.mjs',
  'scripts/generate-site-badges.mjs',
  'scripts/check-og-card-rules.mjs',
  'scripts/check-person-title-spacing.mjs',
  'scripts/check-tree-overview-mode.mjs',
  'scripts/copy-demos.mjs',
  'scripts/starlight-people-sidebar.mjs',
];

function validOwnedPath(value) {
  if (typeof value !== 'string' || value.includes('\\') || value.startsWith('/') || value.split('/').includes('..')) {
    return false;
  }
  return ownedFiles.includes(value) || ownedDirectories.some(dir => value.startsWith(dir + '/'));
}
async function fileList(base, prefix) {
  const entries = await readdir(resolve(base, prefix), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const name = join(prefix, entry.name).replaceAll('\\', '/');
    if (entry.isDirectory()) files.push(...await fileList(base, name));
    else if (entry.isFile()) files.push(name);
    else throw new Error('Unsupported filesystem object in engine source: ' + name);
  }
  return files;
}
const next = [
  ...ownedFiles,
  ...(await Promise.all(ownedDirectories.map(dir => fileList(engineRoot, dir)))).flat(),
].sort();
if (!next.every(validOwnedPath)) throw new Error('Engine ownership allowlist violation.');
let previous = [];
try {
  const manifest = JSON.parse(await readFile(resolve(targetRoot, manifestName), 'utf8'));
  if (!Array.isArray(manifest.files) || !manifest.files.every(validOwnedPath)) {
    throw new Error('Existing engine manifest contains paths outside the allowlist.');
  }
  previous = manifest.files;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
// First sync must not silently overwrite edits made after the repositories split.
// Files written by a previous successful sync are identified by the manifest.
if (previous.length === 0) {
  const diverged = [];
  for (const name of next) {
    try {
      const existing = await readFile(resolve(targetRoot, name));
      const source = await readFile(resolve(engineRoot, name));
      if (!existing.equals(source)) diverged.push(name);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  if (diverged.length) {
    throw new Error(
      'Refusing first-time sync: reconcile modified engine-owned files in the content repo first:\\n' +
      diverged.map(name => '  ' + name).join('\\n')
    );
  }
}
const current = new Set(next);
for (const name of previous) {
  if (!current.has(name)) await rm(resolve(targetRoot, name), { force: true });
}
for (const name of next) {
  const destination = resolve(targetRoot, name);
  await mkdir(dirname(destination), { recursive: true });
  const stat = await lstat(resolve(engineRoot, name));
  if (!stat.isFile()) throw new Error('Engine source is not a regular file: ' + name);
  await copyFile(resolve(engineRoot, name), destination);
}
await writeFile(resolve(targetRoot, manifestName), JSON.stringify({
  origin: 'Antiokh/genealogy-engine',
  commit: process.env.GITHUB_SHA || null,
  files: next,
}, null, 2) + '\n', 'utf8');
console.log('Synchronized ' + next.length + ' engine files. Family content and site-specific config untouched.');
