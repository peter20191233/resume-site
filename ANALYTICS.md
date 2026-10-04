# Game download and Web launch statistics

APK/ZIP buttons point to the GitHub Release assets. `github-downloads.mjs`
sums their `download_count` across all published releases, excluding checksums.
Direct downloads under `/downloads/`, Git clone traffic, and generated source
archives are not included. Do not add GoatCounter click events to these numbers:
that would count the same request twice. These are not unique installations.

Web uses GoatCounter event `osm-web-start` when a player presses the start
button. Only the hosted Web game sends this event. APK and portable HTML do not.
The counter uses GoatCounter session deduplication, not a permanent player ID.
The script runs asynchronously; a blocked tracker must not prevent gameplay.
Offline sessions cannot always be counted. No private API token is needed.

## Activation (requires the owner's registered account)

1. In GoatCounter settings enable **Allow adding visitor counts on your website**.
2. Put the verified account code and real start date (`DD.MM.YYYY`) in
   `game-stats-config.json`. Do not use guessed accounts or invented historical counts.
3. Run `python tools/configure_game_analytics.py`.
4. Verify a real Web start is received and the public event JSON is readable.
   Public counts can be cached for up to four hours.
5. Publish the website. Do not describe unavailable Web statistics as zero.

After copying a new PWA release into `games/osm/`, rerun the configuration script.
It appends the site tracker to the existing cached installation script and updates
the service worker version, without changing the downloadable binaries.

Historical downloads from GitHub Pages cannot be recovered. The site explains
the limits in “Как считаем”. Account: `peter2026.goatcounter.com`; start date:
4 October 2026. Public counts are enabled; the dashboard requires sign-in.
Only aggregate counts and session deduplication are enabled: collection of
referrers, country, region, browser, screen size and language is disabled.
