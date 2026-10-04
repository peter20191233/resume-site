"""Apply site analytics after copying a fresh game PWA into games/osm."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
config = json.loads((ROOT / 'game-stats-config.json').read_text(encoding='utf-8'))
account = config.get('goatcounter') or ''
if not re.fullmatch(r'[a-z0-9](?:[a-z0-9-]*[a-z0-9])?', account):
    raise SystemExit('Configure a verified GoatCounter account before enabling analytics.')
folder = ROOT / 'games' / 'osm'
install = folder / 'install.js'
marker = '\n/* SITE_GAME_ANALYTICS */\n'
source = install.read_text(encoding='utf-8').split(marker)[0].rstrip()
tracker = (ROOT / 'tools' / 'web-usage.js').read_text(encoding='utf-8')
install.write_text(source + marker + tracker.replace('__ACCOUNT__', account), encoding='utf-8', newline='\n')
worker = folder / 'sw.js'
text = worker.read_text(encoding='utf-8')
normalized = re.sub(r"const CACHE = PREFIX \+ '[^']+';", "const CACHE = PREFIX + '__VERSION__';", text)
digest = hashlib.sha256(normalized.encode())
for name in ('index.html', 'install.js', 'install.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'):
    digest.update(name.encode() + b'\0' + (folder / name).read_bytes())
worker.write_text(normalized.replace('__VERSION__', digest.hexdigest()[:16]), encoding='utf-8', newline='\n')
print('Site-only Web analytics configured; offline cache version updated.')
