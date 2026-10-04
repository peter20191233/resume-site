// Counts only published game assets in GitHub Releases, not GitHub Pages traffic.
export function sumReleaseDownloads(releases) {
  const result = { apk: 0, zip: 0 };
  const seen = new Set();
  for (const release of releases) {
    if (release.draft) continue;
    for (const asset of release.assets || []) {
      const kind = asset.name === 'osm-manager-game-android.apk' ? 'apk'
        : asset.name === 'osm-game.zip' ? 'zip' : null;
      if (!kind || seen.has(asset.id)) continue;
      if (!Number.isSafeInteger(asset.download_count) || asset.download_count < 0) {
        throw new Error('Invalid GitHub download count');
      }
      seen.add(asset.id);
      result[kind] += asset.download_count;
    }
  }
  return { ...result, total: result.apk + result.zip };
}

export async function fetchReleaseDownloads(fetcher = fetch) {
  const releases = [];
  for (let page = 1; ; page++) {
    const response = await fetcher(
      `https://api.github.com/repos/peter20191233/osm-manager-game/releases?per_page=100&page=${page}`,
      { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(10000) }
    );
    if (!response.ok) throw new Error(`GitHub statistics unavailable (${response.status})`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('Invalid GitHub response');
    releases.push(...batch);
    if (batch.length < 100) break;
  }
  return sumReleaseDownloads(releases);
}
