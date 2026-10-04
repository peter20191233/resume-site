/* Site-only analytics: never bundled into the APK or portable HTML game. */
(() => {
  if (location.hostname !== 'peter20191233.github.io') return;
  let started = false;
  document.addEventListener('click', event => {
    if (started || !event.target.closest?.('#next-button')) return;
    const button = document.getElementById('next-button');
    if (!button || button.disabled) return;
    started = true;
    const send = () => {
      if (!navigator.onLine) return;
      window.goatcounter = {
        no_onload: true,
        endpoint: 'https://__ACCOUNT__.goatcounter.com/count'
      };
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://gc.zgo.at/count.js';
      script.referrerPolicy = 'no-referrer';
      script.addEventListener('load', () => {
        window.goatcounter.count({
          path: 'osm-web-start', title: 'Запуск веб-игры Будни ОСМ',
          event: true, referrer: ''
        });
      }, {once: true});
      document.head.append(script);
      window.removeEventListener('online', send);
    };
    if (navigator.onLine) send();
    else window.addEventListener('online', send);
  }, {capture: true});
})();
