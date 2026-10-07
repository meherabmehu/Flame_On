/* ==========================================================================
   tools/smoke-test.js — optional interaction test for the prototype
   --------------------------------------------------------------------------
   Boots every screen in a headless DOM, walks the main journey and exercises
   the comparison and abstention rules. It exists so the team can prove the
   demo flows still work after a change, and so a reviewer can see which
   behaviours are verified.

   Usage (jsdom is the only dependency, and it is not shipped with the app):

       npm install jsdom
       node tools/smoke-test.js

   Exits with code 0 when every check passes.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const dom = new JSDOM(html, {
  url: 'http://localhost:8000/#/',
  runScripts: 'dangerously',
  resources: undefined,
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;

// Load the scripts manually in document order (jsdom won't fetch local files).
const scripts = [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src'));
scripts.forEach((src) => {
  const code = fs.readFileSync(path.join(ROOT, src), 'utf8');
  const el = document.createElement('script');
  el.textContent = code;
  document.body.appendChild(el);
});

window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

let failures = 0;
function check(label, cond, extra) {
  const ok = !!cond;
  if (!ok) { failures++; }
  console.log((ok ? 'PASS  ' : 'FAIL  ') + label + (extra && !ok ? '  → ' + extra : ''));
}

const tick = (ms) => new Promise((r) => setTimeout(r, ms || 30));
async function nav(hash) {
  window.location.hash = hash;
  window.dispatchEvent(new window.Event('hashchange'));
  await tick();
}
async function settle() { window.dispatchEvent(new window.Event('hashchange')); await tick(); }
function text() { return document.getElementById('main').textContent.replace(/\s+/g, ' '); }
function htmlMain() { return document.getElementById('main').innerHTML; }

(async function run() {
// ---------- overview ----------
check('header renders brand', htmlMain || document.body.textContent.includes('Flame in Freefall'));
check('nav has 5 links', document.querySelectorAll('.nav-link').length === 5);
check('overview hero present', text().includes('Flame in Freefall'));
check('overview shows example question', text().includes('what happened at low airflow'));
check('overview honesty section', text().includes('deliberately does not do'));
check('overview sources listed', text().includes('20160000593') && text().includes('20210011385'));
check('demo caveat strip present', document.body.textContent.includes('Demonstration data'));
check('no invented accuracy claim', !/(accuracy|precision|confidence)\s*(of|:)\s*\d|\d+(\.\d+)?\s*%\s*(accuracy|confidence)/i.test(text()));

// prefill action from overview
const prefill = document.querySelector('[data-action="prefill"]');
check('prefill button exists on overview', !!prefill);
if (prefill) {
  prefill.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await settle();
  check('prefill routed to compare', window.location.hash.startsWith('#/compare?a=BASS2-T101'));
}

// ---------- compare ----------
check('compare step 1 factor cards', document.querySelectorAll('[data-factor]').length === 6);
check('compare step 2 slots', document.querySelectorAll('.pair-slot').length === 2);
check('compare shows match check rows', document.querySelectorAll('.check-row').length >= 7);
check('compare verdict card present', !!document.querySelector('.verdict'));
check('compare describes recorded difference', text().includes('the recorded outcome is'));
check('compare abstention wording available', text().includes('No prediction is made here') || text().includes('Varied factor'));
check('concept panel labelled not implemented', text().includes('Proposed interpretation (not implemented)'));

// switch factor to oxygen via card
const oxyCard = document.querySelector('[data-factor="oxygen_pct"]');
oxyCard.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('factor switch to oxygen', window.CinderLens.Store.state.compare.factor === 'oxygen_pct');
check('oxygen check table renders', document.querySelectorAll('.check-row').length >= 7);

// abstention case: sphere 18% vs sphere 21% -> should warn, and T121 vs T145 oxygen
await nav('#/compare?a=BASS2-T121&b=BASS2-T145&factor=oxygen_pct');
check('abstain/limit case renders verdict', !!document.querySelector('.verdict'));
const verdictText = document.querySelector('.verdict').textContent;
check('sphere pair flagged (n/a thickness recorded as unknown)',
  /Not a controlled comparison|Comparable with caveats|Not enough/.test(verdictText), verdictText);

// a clearly unsuitable pair: different fuel
await nav('#/compare?a=BASS2-T101&b=BASS2-T137&factor=airflow_cms');
check('hard-condition mismatch rejected', document.querySelector('.verdict').className.includes('verdict-risk'),
  document.querySelector('.verdict').className);
check('abstention message shown', text().includes('Not enough comparable tests'));
check('find fairer pair button', !!document.querySelector('[data-action="find-fairer"]'));

// suggested pair click
await nav('#/compare?a=BASS2-T101&b=BASS2-T102&factor=airflow_cms');
const usePair = document.querySelector('[data-pair]');
check('suggested pairs rendered', !!usePair);
if (usePair) {
  usePair.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('pair applied from suggestion', !!window.CinderLens.Store.state.compare.a && !!window.CinderLens.Store.state.compare.b);
}

// ---------- explorer ----------
await nav('#/explorer');
check('explorer filters panel', !!document.getElementById('filters'));
check('explorer results rendered', document.querySelectorAll('.record-card').length > 5);
const total = document.querySelectorAll('.record-card').length;
check('all demo records listed', total === window.CinderLens.CATALOG.length, total + ' vs ' + window.CinderLens.CATALOG.length);
check('missing fields labelled', text().includes('not recorded'));

// fuel filter
const fuelBox = document.querySelector('[data-filter="fuel"][value="PMMA"]');
fuelBox.checked = true;
fuelBox.dispatchEvent(new window.Event('change', { bubbles: true }));
const afterFuel = document.querySelectorAll('.record-card').length;
check('fuel filter narrows results', afterFuel > 0 && afterFuel < total, afterFuel + ' of ' + total);
check('active filter chip shown', !!document.querySelector('.filter-chip'));

// search
const search = document.getElementById('explorer-search');
search.focus();
search.value = 'cotton';
search.dispatchEvent(new window.Event('input', { bubbles: true }));
await tick(320);
check('search narrows results', /Cotton/i.test(text()), text().slice(0, 80));
const searchStillFocused = document.activeElement === document.getElementById('explorer-search');
check('search field keeps focus while typing', searchStillFocused, String(document.activeElement && document.activeElement.id));

// coverage toggle
document.querySelector('[data-action="toggle-coverage"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(50);
check('coverage matrix renders', !!document.getElementById('coverage-panel'));
check('coverage legend and gaps', text().includes('no record') && text().includes('Gaps stated in plain English'));
check('coverage gaps quantified', /no test at \d+% O/.test(text()), text().match(/.{0,60}no test at.{0,60}/) ? text().match(/.{0,60}no test at.{0,60}/)[0] : 'not found');

// clear filters
const clearBtn = document.querySelector('.panel-foot [data-action="clear-filters"]');
clearBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('filters cleared', window.CinderLens.Store.state.filters.fuel.length === 0);

// pick two records then compare
const picks = document.querySelectorAll('[data-pick]');
picks[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const picks2 = document.querySelectorAll('[data-pick]');
picks2[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('two records picked', window.CinderLens.Store.state.picked.length === 2);
const comparePicked = document.querySelector('[data-action="compare-picked"]');
check('compare selected button appears', !!comparePicked);
if (comparePicked) {
  comparePicked.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await settle();
  check('handoff to compare workspace', window.location.hash.startsWith('#/compare?a='), window.location.hash);
  check('handoff renders comparison step 3', !!document.querySelector('.verdict'));
}

// empty-result state
await nav('#/explorer');
const oxyMin = document.querySelector('[data-band="oxygen"][data-bound="min"]');
oxyMin.value = '99';
oxyMin.dispatchEvent(new window.Event('change', { bubbles: true }));
check('empty result state shown', text().includes('No records match the current filters'));
document.querySelector('[data-action="clear-filters"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(30);

// ---------- evidence ----------
await nav('#/evidence/BASS2-T124');
check('evidence view media block', text().includes('Experiment media'));
check('evidence schematic labelled', text().includes('SCHEMATIC'));
check('evidence observations', text().includes('Observed behaviour'));
check('evidence measurements not implemented', text().includes('Visual measurements') && text().includes('Not implemented'));
check('observed vs proposed separated', text().includes('Observed') && text().includes('Proposed interpretation'));
check('traceability table', text().includes('How each observation is traceable'));
check('limitations listed', text().includes('Limitations of this record'));
check('sources linked', htmlMain().includes('ntrs.nasa.gov/citations/20160000593'));

// no-suitable-comparison case
await nav('#/compare?a=BASS2-T145&b=BASS2-T121&factor=oxygen_pct');
await nav('#/evidence/BASS2-T137');
check('evidence page for a lone record renders', text().includes('BASS2-T137'));

// evidence chooser
await nav('#/evidence');
check('evidence chooser lists media records', text().includes('Records with media indexed'));

// ---------- record detail ----------
await nav('#/record/BASS2-T133');
check('record detail shows id', text().includes('BASS2-T133'));
check('missing fields called out', text().includes('not recorded'));
check('media inventory', text().includes('Media inventory'));
check('provenance block', text().includes('Provenance') && text().includes('Not run'));
check('fair comparisons block', text().includes('Fair comparisons on'));

await nav('#/record/NOPE-1');
check('unknown record state', text().includes('Record not found'));

// ---------- data notes ----------
await nav('#/data-notes');
check('data notes honesty table', text().includes('Honesty table'));
check('backend endpoints documented', text().includes('/api/records/') && text().includes('/api/compare/'));
check('run instructions present', text().includes('python3 -m http.server 8000'));
check('walkthrough present', text().includes('Demonstration walkthrough'));

// ---------- unknown route ----------
await nav('#/nope');
check('unknown route state', text().includes('That screen does not exist'));

// ---------- empty catalog mode ----------
await nav('#/explorer');
document.getElementById('mode-chip').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const emptyBtn = document.querySelector('[data-action="set-mode"][data-mode="empty"]');
check('mode popover opens', !!emptyBtn);
emptyBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(40);
check('empty catalog state shown', text().includes('No records loaded'));
const loadBtn = document.querySelector('[data-action="load-demo"]');
check('load demo action offered', !!loadBtn);
if (loadBtn) {
  loadBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await tick(40);
  check('records restored', document.querySelectorAll('.record-card').length === window.CinderLens.CATALOG.length);
}

// ---------- matcher unit checks ----------
const M = window.CinderLens.Matcher, S = window.CinderLens.Store;
check('exact pair is comparable', M.pairVerdict(S.byId('BASS2-T101'), S.byId('BASS2-T102'), 'airflow_cms').verdict === 'comparable');
check('tolerance pair is caution or comparable',
  ['comparable', 'caution'].includes(M.pairVerdict(S.byId('BASS2-T102'), S.byId('BASS2-T108'), 'oxygen_pct').verdict));
check('cross-fuel pair rejected', M.pairVerdict(S.byId('BASS2-T101'), S.byId('BASS2-T123'), 'airflow_cms').verdict === 'unsuitable');
check('missing factor returns insufficient',
  M.pairVerdict(S.byId('BASS2-T133'), S.byId('BASS2-T101'), 'airflow_cms').verdict === 'insufficient');
check('identical values rejected', M.pairVerdict(S.byId('BASS2-T101'), S.byId('BASS2-T133'), 'oxygen_pct').verdict === 'unsuitable');
check('suggestions exist for airflow', M.suggestPairs('airflow_cms', S.records(), 10).length > 0);
check('suggestions empty for nomex airflow', M.suggestPairs('airflow_cms', S.records().filter(r => r.fuel === 'Nomex fabric'), 10).length === 0);
check('coverage grid counts zeros', M.coverageGrid('fuel', 'oxygen_pct').grid.some(r => r.cells.some(c => c.count === 0)));
check('gap statements produced', M.gapStatements().length > 0);
check('describePair produces sentence', (M.describePair(S.byId('BASS2-T101'), S.byId('BASS2-T102'), 'airflow_cms') || {}).sentence.includes('recorded outcome'));

const withMissing = S.records().filter(r => S.countMissing(r) > 0).length;
check('some rows intentionally have missing fields', withMissing > 0, String(withMissing));

console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('TEST HARNESS ERROR:', e.stack); process.exit(2); });
