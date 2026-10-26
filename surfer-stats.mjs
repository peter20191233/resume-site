// Author: Petr Korytov. Public GitHub download counts, never estimated installs.
import { fetchReleaseDownloads, surferAssetKind } from './github-downloads.mjs';

export async function renderSurferStats(doc = document, fetcher = fetch) {
  const panel = doc.getElementById('surfer-stats');
  if (!panel) return;
  const value = doc.getElementById('surfer-download-count');
  const status = doc.getElementById('surfer-stats-status');
  try {
    const counts = await fetchReleaseDownloads(fetcher, 'ulan-ude-surfer', surferAssetKind);
    value.textContent = new Intl.NumberFormat('ru-RU').format(counts.apk);
    status.textContent = 'APK · все версии';
  } catch {
    value.textContent = '—';
    status.textContent = 'Нет данных';
  } finally {
    panel.removeAttribute('aria-busy');
  }
}

if (typeof document !== 'undefined') renderSurferStats();
