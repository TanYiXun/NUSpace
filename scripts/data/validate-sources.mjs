import { readFile } from 'node:fs/promises';

const sourceFile = new URL('../../data/sources.yml', import.meta.url);
const contents = await readFile(sourceFile, 'utf8');

const requiredFragments = [
  'id: openfreemap',
  'id: osm-overpass-com3',
  'id: manual-osm-d1-prototype-route',
  'source_owner:',
  'source_url:',
  'documentation_url:',
  'terms_or_license_url:',
  'license:',
  'allowed_use:',
  'attribution_text:',
  'source_status: verified',
  'source_status: prototype-placeholder',
  'used_for:',
];

const missing = requiredFragments.filter((fragment) => !contents.includes(fragment));

if (missing.length > 0) {
  console.error(`data/sources.yml is missing required metadata: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('data/sources.yml contains required Phase 0 source metadata.');
