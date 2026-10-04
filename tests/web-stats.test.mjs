import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { parseCounterCount, fetchWebCount, renderGameStats } from '../game-stats.mjs';

test('formatted counts parse; invalid numbers are rejected', () => {
  assert.equal(parseCounterCount('1,234'), 1234);
  assert.equal(parseCounterCount('0'), 0);
  for (const count of ['unknown', '-1', '1.5', '', '9,99']) {
    assert.throws(() => parseCounterCount(count));
  }
});

test('missing event is zero only after verifying a working public account', async () => {
  assert.equal(await fetchWebCount('example', async url => url.includes('TOTAL')
    ? {ok: true, json: async () => ({count:'0'})} : {status:404}), 0);
  await assert.rejects(fetchWebCount('example', async () => ({status:404})));
  await assert.rejects(fetchWebCount(null));
});

test('failed Web statistics preserve known download counts without a misleading total', async () => {
  const elements = new Map();
  const doc = {getElementById: id => {
    if (!elements.has(id)) elements.set(id, {textContent:'—', removeAttribute() {}});
    return elements.get(id);
  }};
  await renderGameStats(doc, async url => url.includes('api.github.com')
    ? {ok:true, json:async () => [{assets:[{id:1, name:'osm-manager-game-android.apk', download_count:3}]}]}
    : {ok:true, json:async () => ({goatcounter:null})});
  assert.equal(elements.get('game-count-apk').textContent, '3');
  assert.equal(elements.get('game-count-zip').textContent, '0');
  assert.equal(doc.getElementById('game-count-total').textContent, '—');
  assert.equal(doc.getElementById('game-count-web').textContent, '—');
});

test('tracker ignores ordinary clicks and only sends after an enabled game start', () => {
  const source = fs.readFileSync(new URL('../tools/web-usage.js', import.meta.url), 'utf8');
  let click, loaded, inserted = 0, counted = 0;
  const window = {removeEventListener() {}};
  const button = {disabled:true};
  const document = {
    addEventListener(name, cb) {click=cb;}, getElementById() {return button;},
    createElement() {return {addEventListener(name, cb) {loaded=cb;}};},
    head:{append() {inserted++;}}
  };
  vm.runInNewContext(source, {window, document, navigator:{onLine:true}, location:{hostname:'peter20191233.github.io'}});
  click({target:{closest:() => null}});
  click({target:{closest:() => button}});
  assert.equal(inserted,0);
  button.disabled=false;
  click({target:{closest:() => button}});
  click({target:{closest:() => button}});
  assert.equal(inserted,1);
  window.goatcounter.count = data => {assert.equal(data.path,'osm-web-start'); counted++;};
  loaded();
  assert.equal(counted,1);
});
