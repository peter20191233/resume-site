// Author: Petr Korytov.
import test from 'node:test';
import assert from 'node:assert/strict';
import { sumReleaseDownloads, surferAssetKind } from '../github-downloads.mjs';
import { renderSurferStats } from '../surfer-stats.mjs';

test('Surfer counts versioned APKs across releases without checksums or duplicates', () => {
  const apk = { id: 1, name: 'ulan-ude-surfer-1.2.0.apk', download_count: 2 };
  assert.equal(sumReleaseDownloads([
    { assets: [apk, { id: 2, name: 'ulan-ude-surfer-1.2.0.apk.sha256', download_count: 50 }] },
    { assets: [apk, { id: 3, name: 'ulan-ude-surfer-1.1.0.apk', download_count: 3 }] },
    { draft: true, assets: [{ ...apk, id: 4, download_count: 10 }] },
  ], surferAssetKind).apk, 5);
});

test('Surfer uses its own repository and does not show zero on a failed request', async () => {
  const entries = new Map();
  const doc = { getElementById(id) {
    if (!entries.has(id)) entries.set(id, { textContent: '', removeAttribute() {} });
    return entries.get(id);
  } };
  await renderSurferStats(doc, async url => {
    assert.match(url, /\/ulan-ude-surfer\/releases\?/);
    return { ok: true, json: async () => [{ assets: [{ id: 1, name: 'ulan-ude-surfer-1.2.0.apk', download_count: 2 }] }] };
  });
  assert.equal(doc.getElementById('surfer-download-count').textContent, '2');
  await renderSurferStats(doc, async () => ({ ok: false, status: 403 }));
  assert.equal(doc.getElementById('surfer-download-count').textContent, '—');
  assert.equal(doc.getElementById('surfer-stats-status').textContent, 'Нет данных');
});
