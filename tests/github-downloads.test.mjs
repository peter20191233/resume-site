import test from 'node:test';
import assert from 'node:assert/strict';
import { sumReleaseDownloads, fetchReleaseDownloads } from '../github-downloads.mjs';

test('sums versions, ignores checksums and avoids duplicate assets', () => {
  const apk = { id: 1, name: 'osm-manager-game-android.apk', download_count: 2 };
  assert.deepEqual(sumReleaseDownloads([
    { assets: [apk, { id: 2, name: 'osm-manager-game-android.apk.sha256', download_count: 20 }] },
    { assets: [apk, { id: 3, name: 'osm-game.zip', download_count: 4 }] },
    { draft: true, assets: [{ id: 4, name: 'osm-game.zip', download_count: 9 }] }
  ]), { apk: 2, zip: 4, total: 6 });
});

test('continues beyond the first page of releases', async () => {
  let calls = 0;
  const result = await fetchReleaseDownloads(async () => ({
    ok: true,
    json: async () => ++calls === 1 ? Array.from({ length: 100 }, () => ({ assets: [] }))
      : [{ assets: [{ id: 1, name: 'osm-game.zip', download_count: 7 }] }]
  }));
  assert.equal(calls, 2);
  assert.equal(result.total, 7);
});

test('does not turn unavailable or malformed statistics into zero', async () => {
  await assert.rejects(fetchReleaseDownloads(async () => ({ ok: false, status: 403 })));
  assert.throws(() => sumReleaseDownloads([{ assets: [
    { id: 1, name: 'osm-game.zip', download_count: -1 }
  ] }]));
});
