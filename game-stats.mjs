import { fetchReleaseDownloads } from './github-downloads.mjs';

export function parseCounterCount(value) {
  // GoatCounter returns formatted strings such as "1,234".
  if (typeof value !== 'string' || !/^\d+(?:[,\s]\d{3})*$/.test(value)) {
    throw new Error('Invalid public counter');
  }
  const count = Number(value.replace(/[,\s]/g, ''));
  if (!Number.isSafeInteger(count)) throw new Error('Counter out of range');
  return count;
}

export async function fetchWebCount(account, fetcher = fetch) {
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(account || '')) {
    throw new Error('Web analytics not configured');
  }
  const root = `https://${account}.goatcounter.com/counter/`;
  const get = path => fetcher(`${root}${path}.json`, { signal: AbortSignal.timeout(10000) });
  const response = await get('osm-web-start');
  if (response.status === 404) {
    // Confirm the account's public counter works before treating a missing event as zero.
    const total = await get('TOTAL');
    if (!total.ok) throw new Error('Public Web counter unavailable');
    parseCounterCount((await total.json()).count);
    return 0;
  }
  if (!response.ok) throw new Error('Web statistics unavailable');
  return parseCounterCount((await response.json()).count);
}

export async function renderGameStats(doc = document, fetcher = fetch) {
  const panel = doc.getElementById('game-stats');
  if (!panel) return;
  const put = (key, value) => {
    doc.getElementById(`game-count-${key}`).textContent = new Intl.NumberFormat('ru-RU').format(value);
  };
  const github = fetchReleaseDownloads(fetcher);
  const web = (async () => {
    const response = await fetcher('./game-stats-config.json', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Configuration unavailable');
    const config = await response.json();
    const count = await fetchWebCount(config.goatcounter, fetcher);
    if (config.webStartedAt) doc.getElementById('game-web-since').textContent = config.webStartedAt;
    return count;
  })();
  const [files, launches] = await Promise.allSettled([github, web]);
  if (files.status === 'fulfilled') {
    put('apk', files.value.apk);
    put('zip', files.value.zip);
  }
  if (launches.status === 'fulfilled') put('web', launches.value);
  if (files.status === 'fulfilled' && launches.status === 'fulfilled') {
    put('total', files.value.total + launches.value);
    doc.getElementById('game-stats-status').textContent = 'Данные обновляются с задержкой до 4 часов.';
  } else {
    doc.getElementById('game-stats-status').textContent = 'Часть статистики временно недоступна. Пропуски не означают нулевое число загрузок.';
  }
  panel.removeAttribute('aria-busy');
}

if (typeof document !== 'undefined') renderGameStats().catch(() => {
  const status = document.getElementById('game-stats-status');
  if (status) status.textContent = 'Статистика временно недоступна.';
});
