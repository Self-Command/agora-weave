import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const themes = new URL('../../../apps/admin/src/components/themes/', import.meta.url);
const fonts = new URL('fonts/', themes);
type Asset = { path: string; url: string; sha256: string; weight: string; style: string; subset: string; bytes: number };
type Family = { family: string; variable: string; files: Asset[]; css_path: string; css_sha256: string; license: { path: string; url: string; sha256: string } };
const provenance = JSON.parse(readFileSync(new URL('provenance.json', fonts), 'utf8')) as { families: Family[]; google_fonts_license_commit: string };
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

test('AF01: all 16 original families, weights and variables load pinned local assets', () => {
  const expected: Record<string, string[]> = {
    Geist: ['100 900'], 'Geist Mono': ['100 900'], 'Google Sans Flex': ['1 1000'],
    'Source Code Pro': ['200 900'], 'Instrument Sans': ['400 700'], 'Noto Sans Mono': ['100 900'],
    Mulish: ['200 1000'], Inter: ['100 900'], 'Architects Daughter': ['400'],
    'DM Sans': ['100 1000'], 'Fira Code': ['300 700'], Outfit: ['100 900'],
    'Space Mono': ['400', '700'], 'JetBrains Mono': ['100 800'], Merriweather: ['300', '400', '700'],
    'Playfair Display': ['400 900']
  };
  const original = readFileSync(new URL('../../../apps/admin/upstream-metadata/originals/src/components/themes/font.config.ts', import.meta.url), 'utf8');
  const active = readFileSync(new URL('font.config.ts', themes), 'utf8');
  assert.match(active, /from 'next\/font\/local'/);
  assert.doesNotMatch(active, /next\/font\/google|https?:/);
  assert.equal(provenance.families.length, 16);
  assert.deepEqual(provenance.families.map(family => family.family).sort(), Object.keys(expected).sort());
  assert.deepEqual([...active.matchAll(/variable: '([^']+)'/g)].map(match => match[1]), [...original.matchAll(/variable: '([^']+)'/g)].map(match => match[1]));
  for (const family of provenance.families) {
    assert.deepEqual(family.files.map(file => file.weight), expected[family.family]);
    for (const file of family.files) {
      assert.equal(file.style, 'normal');
      assert.equal(file.subset, 'latin');
      assert.match(active, new RegExp(file.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  }
});

test('AF02: bundled WOFF2 bytes, Google CSS and official family licenses match provenance', () => {
  for (const family of provenance.families) {
    const css = readFileSync(new URL(family.css_path, fonts));
    assert.equal(digest(css), family.css_sha256);
    const license = readFileSync(new URL(family.license.path, fonts));
    assert.equal(digest(license), family.license.sha256);
    assert.match(license.toString('utf8'), /SIL OPEN FONT LICENSE/i);
    assert.ok(family.license.url.startsWith(`https://raw.githubusercontent.com/google/fonts/${provenance.google_fonts_license_commit}/`));
    for (const file of family.files) {
      const bytes = readFileSync(new URL(file.path, fonts));
      assert.equal(bytes.subarray(0, 4).toString('ascii'), 'wOF2');
      assert.equal(bytes.length, file.bytes);
      assert.equal(digest(bytes), file.sha256);
      assert.ok(file.url.startsWith('https://fonts.gstatic.com/'));
      assert.ok(css.toString('utf8').includes(file.url));
    }
  }
});
