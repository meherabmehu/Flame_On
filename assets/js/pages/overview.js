/* ==========================================================================
   pages/overview.js — project overview
   Purpose: state the problem, the product purpose and the honest boundary,
   then hand the user a single obvious action: start exploring experiments.
   ========================================================================== */

const OverviewPage = (function () {

  function stats() {
    const list = Store.records();
    const missing = list.filter((r) => Store.countMissing(r) > 0).length;
    const pairs = Matcher.suggestPairs('airflow_cms', list, 40);
    const gaps = Matcher.gapStatements().length;
    return [
      { value: String(list.length), label: 'demonstration records indexed' },
      { value: String(FACTORS.length), label: 'comparable factors modelled' },
      { value: missing + ' of ' + list.length, label: 'records with an empty comparable field' },
      { value: String(gaps), label: 'coverage gaps stated in plain English' },
      { value: pairs.length + '+', label: 'airflow pairs the matcher can line up' }
    ];
  }

  function exampleQuestion() {
    return '<div class="card card-lg" style="border-left:3px solid var(--teal-500)">' +
      '<div class="row-between row-top" style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap">' +
        '<div style="max-width:62ch">' +
          '<p class="eyebrow">The example question from the concept guide</p>' +
          '<h3 class="mt-2" style="font-size:var(--fs-20)">' +
            'For one recorded fuel and shape, what happened at low airflow versus a higher tested speed?' +
          '</h3>' +
          '<p class="mt-3">Airflow is the October 1 story, not the limit of the product. ' +
            'Oxygen, fuel, thickness and geometry are all first-class comparison factors here — the same workspace handles each of them, ' +
            'and says so plainly when a fair pair does not exist.</p>' +
        '</div>' +
        '<div class="stack-sm" style="min-width:230px">' +
          '<button class="btn btn-primary btn-block" data-action="prefill" ' +
            'data-a="BASS2-T101" data-b="BASS2-T102" data-factor="airflow_cms">' +
            'Open this comparison ' + UI.icon('chevron', 15) + '</button>' +
          '<button class="btn btn-block" data-action="prefill" ' +
            'data-a="BASS2-T102" data-b="BASS2-T143" data-factor="oxygen_pct">' +
            'Same idea for oxygen</button>' +
          '<button class="btn btn-ghost btn-block" data-action="prefill" ' +
            'data-a="BASS2-T121" data-b="BASS2-T145" data-factor="oxygen_pct">' +
            'See a case with no fair match</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function problemSection() {
    const items = [
      {
        icon: 'flame',
        title: 'Fire behaves differently in very low gravity',
        text: 'Physical Sciences Informatics lists BASS-II as complete, and the investigation examined how ambient oxygen, ventilation and fuel affect burning. ' +
          'One striking reported behaviour is that a dim, stable flame at very low airflow can brighten quickly when airflow rises.'
      },
      {
        icon: 'layers',
        title: 'The records exist, but not as one table',
        text: 'Experiment files, videos and published reports live in PSI, the NTRS and the mission logs. Each file has to be checked by hand before an observation can be tied to a test condition.'
      },
      {
        icon: 'search',
        title: 'Finding comparable tests is the hard part',
        text: 'Two tests may share a fuel and a flow speed and still differ in thickness, mounting or flow direction. ' +
          'A useful tool has to line them up carefully — and refuse to compare when it cannot.'
      }
    ];
    return '<div class="grid grid-3">' + items.map((i) =>
      '<div class="card">' +
        '<div class="card-icon card-icon-ember">' + UI.icon(i.icon, 18) + '</div>' +
        '<h3 class="mt-4" style="font-size:var(--fs-17)">' + i.title + '</h3>' +
        '<p class="mt-2" style="font-size:var(--fs-14)">' + i.text + '</p>' +
      '</div>').join('') + '</div>';
  }

  function workflowSection() {
    const steps = [
      { n: '01', t: 'Explore what was tested', d: 'Search and filter indexed records by fuel, geometry, oxygen, airflow and thickness. Records show which fields are recorded and which are empty.', a: '#/explorer', al: 'Open the explorer' },
      { n: '02', t: 'Change one factor', d: 'Pick the factor to compare — airflow, oxygen, fuel, thickness or geometry. The interface only offers values that exist in the records.', a: '#/compare', al: 'Open the comparison workspace' },
      { n: '03', t: 'Match the rest', d: 'The matcher checks the remaining conditions, tolerates small numeric differences, and lists every difference rather than hiding it.', a: '#/compare?factor=thickness_mm', al: 'See a robustness check' },
      { n: '04', t: 'Read evidence or the gap', d: 'Every observation sits beside its recorded conditions, media status and original sources — or the interface abstains and says no fair pair exists.', a: '#/evidence/BASS2-T124', al: 'Open an evidence view' }
    ];
    return '<div class="flow-steps">' + steps.map((s) =>
      '<a class="flow-step" href="' + s.a + '" style="text-decoration:none">' +
        '<span class="flow-step-num">' + s.n + '</span>' +
        '<h3>' + s.t + '</h3>' +
        '<p>' + s.d + '</p>' +
        '<p class="mt-3" style="color:var(--teal-300);font-size:var(--fs-13)">' + s.al + ' ' + UI.icon('chevron', 12) + '</p>' +
      '</a>').join('') + '</div>';
  }

  function inputOutputSection() {
    return '<div class="grid grid-2">' +
      '<div class="card card-lg">' +
        '<div class="card-title"><h3>What the user enters</h3><span class="badge badge-teal">Input</span></div>' +
        '<div class="table-wrap"><table class="table"><tbody>' +
          row('Explore filters', 'Recorded fuel, sample shape, oxygen and airflow ranges. Browse observations and coverage before comparing anything.') +
          row('Change one factor', 'Compare two tested airflow speeds, two oxygen settings, two thicknesses or two geometries. Values come from the records, never invented.') +
          row('Match the rest', 'Fuel, shape, thickness, flow direction and the other conditions stay as similar as the records allow.') +
        '</tbody></table></div>' +
      '</div>' +
      '<div class="card card-lg">' +
        '<div class="card-title"><h3>What the screen shows</h3><span class="badge badge-ember">Output</span></div>' +
        '<div class="table-wrap"><table class="table"><tbody>' +
          row('Test coverage', 'Which combinations of oxygen, airflow, fuel and shape appear in the records, and which combinations have no evidence at all.',
            '#/compare', 'Open coverage') +
          row('Evidence rows', 'For each comparable test: conditions, recorded spread or extinction, source report and whether media exists.',
            '#/evidence/BASS2-T101', 'Open evidence') +
          row('Comparison or gap', 'A plain-English statement of the recorded difference — or “Not enough comparable tests.”',
            '#/compare?a=BASS2-T121&b=BASS2-T145&f=oxygen_pct', 'See the abstention') +
        '</tbody></table></div>' +
      '</div>' +
    '</div>';

    function row(a, b, href, linkLabel) {
      return '<tr><td style="width:34%"><strong class="tx-1">' + a + '</strong>' +
        (href ? '<div class="mt-2"><a href="' + href + '" style="font-size:var(--fs-12)">' + linkLabel + ' ' + UI.icon('chevron', 11) + '</a></div>' : '') +
        '</td><td>' + b + '</td></tr>';
    }
  }

  function honestySection() {
    const does = [
      'Indexes recorded conditions and shows exactly which fields are empty',
      'Compares one factor at a time and states the recorded difference in plain English',
      'Refuses to conclude when the tests are not matched closely enough',
      'Links every observation back to its source report and media status',
      'Keeps recorded behaviour visually separate from proposed machine interpretation',
      'States uncertainty and coverage gaps in ordinary language'
    ];
    const doesNot = [
      'Predict fire behaviour in any cabin, atmosphere or material',
      'Report an accuracy, confidence score or model metric — none has been measured',
      'Simulate arbitrary physical conditions; only recorded test values are offered',
      'Reproduce NASA findings as results; the demonstration rows are clearly labelled',
      'Claim that no similar tool already exists',
      'Replace a reviewer: extraction and labels still need a human pass'
    ];
    return '<div class="honesty-grid">' +
      '<div class="card card-lg">' +
        '<div class="card-title"><h3>What this build does</h3>' + UI.icon('check', 18) + '</div>' +
        '<div class="honesty-list">' + does.map((t) =>
          '<div class="honesty-item">' + UI.icon('check', 16) + '<span>' + t + '</span></div>').join('') + '</div>' +
      '</div>' +
      '<div class="card card-lg">' +
        '<div class="card-title"><h3>What it deliberately does not do</h3>' + UI.icon('alert', 18) + '</div>' +
        '<div class="honesty-list">' + doesNot.map((t) =>
          '<div class="honesty-item" style="color:var(--tx-3)">' + UI.icon('close', 16) + '<span>' + t + '</span></div>').join('') + '</div>' +
      '</div>' +
    '</div>';
  }

  function sourcesSection() {
    const sources = [
      { name: 'NASA BASS-II results overview', ref: 'NTRS 20160000593', desc: 'Published BASS-II methods and findings, including the variables tested and the low-airflow behaviour.', url: 'https://ntrs.nasa.gov/citations/20160000593' },
      { name: 'NASA BASS-II summary report', ref: 'NTRS 20210011385', desc: 'Consolidated summary of the investigation and its test program.', url: 'https://ntrs.nasa.gov/citations/20210011385' },
      { name: 'NASA Physical Sciences Informatics — BASS-II', ref: 'PSI · BASS-II', desc: 'BASS-II experiment files and videos. Each file’s contents must be checked before observations are linked to conditions.', url: 'https://www.nasa.gov/physical-sciences-informatics-psi/' },
      { name: '2026 Flame in Freefall challenge page', ref: 'Challenge', desc: 'The challenge brief. Full details and suggested resources were scheduled to arrive on 28 October 2026 and may refine scope.', url: 'https://www.nasa.gov/' }
    ];
    return '<div class="card card-lg">' +
      sources.map((s) =>
        '<div class="source-item">' +
          '<div>' +
            '<h4>' + s.name + '</h4>' +
            '<p>' + s.desc + '</p>' +
          '</div>' +
          '<div class="row" style="gap:10px">' +
            '<span class="source-ref">' + s.ref + '</span>' +
            '<a class="btn btn-sm btn-ghost" href="' + s.url + '" target="_blank" rel="noopener">' +
              'Visit ' + UI.icon('external', 13) + '</a>' +
          '</div>' +
        '</div>').join('') +
    '</div>';
  }

  function roadsSection() {
    const roads = [
      { t: 'Now', tag: 'Available today', cls: 'badge-ok', items: ['Public BASS-II reports and PSI materials', 'A hand-checked test catalog with source links', 'This traceable explorer and comparison interface'] },
      { t: 'During the hackathon', tag: 'Build and test', cls: 'badge-teal', items: ['Extract the catalog across oxygen, airflow, fuel and geometry', 'Compare machine retrieval against a keyword baseline', 'Verify extracted labels against source records'] },
      { t: 'Later, if labels allow', tag: 'Possible, not promised', cls: 'badge-warn', items: ['Computer-vision measurements on a selected video subset, human-verified', 'Additional NASA combustion studies once their fields are mapped', 'A predictive model only if verified labels and coverage support it'] }
    ];
    return '<div class="grid grid-3">' + roads.map((r) =>
      '<div class="card">' +
        '<div class="row-between" style="display:flex;justify-content:space-between;gap:12px;align-items:center">' +
          '<h3 style="font-size:var(--fs-17)">' + r.t + '</h3>' +
          '<span class="badge ' + r.cls + '">' + r.tag + '</span>' +
        '</div>' +
        '<ul class="mt-4 honesty-list" style="gap:10px">' + r.items.map((i) =>
          '<li class="honesty-item">' + UI.icon('tag', 15) + '<span>' + i + '</span></li>').join('') + '</ul>' +
      '</div>').join('') + '</div>';
  }

  function render(route, container) {
    const s = stats();
    container.innerHTML = '' +
    '<section class="hero">' +
      '<div class="wrap hero-inner">' +
        '<p class="eyebrow">NASA Space Apps Challenge 2026 · Combustion in microgravity</p>' +
        '<h1>Flame in Freefall</h1>' +
        '<p class="lead">Explore how oxygen, airflow and fuel or sample shape relate to flame behaviour, ' +
          'with every answer tied to matching NASA tests and clear evidence gaps.</p>' +
        '<p class="lead" style="color:var(--tx-3)">' +
          'A question-led explorer across recorded combustion conditions. It shows what was tested, what each test recorded, ' +
          'which tests can fairly be lined up — and it stops short of a conclusion when they cannot.' +
        '</p>' +
        '<div class="hero-actions">' +
          '<a class="btn btn-primary btn-lg" href="#/explorer">' + UI.icon('search', 16) + ' Start exploring experiments</a>' +
          '<a class="btn btn-lg" href="#/compare">' + UI.icon('compare', 16) + ' Open the comparison workspace</a>' +
          '<a class="btn btn-lg btn-ghost" href="#/data-notes">Read the data notes</a>' +
        '</div>' +
        '<div class="hero-meta">' +
          '<span><span class="dot dot-ember"></span> Demonstration dataset · ' + UI.esc(CATALOG_META.datasetVersion) + '</span>' +
          '<span>' + UI.icon('clock', 13) + ' Primary workflow demonstrable in under a minute</span>' +
          '<span>' + UI.icon('shield', 13) + ' Abstains when evidence is thin</span>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section-sm">' +
      '<div class="wrap">' +
        UI.state({
          role: 'note',
          icon: 'info',
          title: 'Read this first',
          message: UI.esc(COPY.datasetCaveat) + ' ' +
            'Team CinderLens has not yet published a verified extraction of PSI files, so this interface never presents an inverted or invented measurement as a NASA result. ' +
            'Real catalog rows replace these through one documented connection point.',
          action: '<a class="btn btn-sm" href="#/data-notes">See how to connect the backend</a>',
          inline: true
        }) +
      '</div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap stack-lg">' +
        '<div class="section-head">' +
          '<div>' +
            '<p class="eyebrow">The problem</p>' +
            '<h2>Why a comparison tool, and not another report</h2>' +
            '<p>The science is published. The difficulty is knowing which tests can fairly be set beside each other, and where nothing was tested at all.</p>' +
          '</div>' +
        '</div>' +
        problemSection() +
        exampleQuestion() +
      '</div>' +
    '</section>' +

    '<section class="section" style="border-top:1px solid var(--line-soft);background:var(--bg-shell)">' +
      '<div class="wrap stack-lg">' +
        '<div class="section-head">' +
          '<div>' +
            '<p class="eyebrow">How the product works</p>' +
            '<h2>Four steps, one factor at a time</h2>' +
            '<p>Each step is a screen. The last one is allowed to end in “not enough comparable tests”.</p>' +
          '</div>' +
        '</div>' +
        workflowSection() +
      '</div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap stack-lg">' +
        '<div class="section-head"><div><p class="eyebrow">Scope</p><h2>Inputs and outputs, as described in the concept guide</h2></div></div>' +
        inputOutputSection() +
      '</div>' +
    '</section>' +

    '<section class="section" style="border-top:1px solid var(--line-soft)">' +
      '<div class="wrap stack-lg">' +
        '<div class="section-head"><div><p class="eyebrow">Coverage at a glance</p><h2>What the demonstration catalog contains</h2>' +
          '<p>Numbers describe the demonstration rows only. They exist to show the interface working, not to report science.</p></div>' +
          '<a class="btn" href="#/explorer?coverage=1">' + UI.icon('grid', 15) + ' Open the coverage matrix</a></div>' +
        '<div class="stat-strip">' + s.slice(0, 4).map((x) =>
          '<div class="stat"><div class="stat-value">' + x.value + '</div><div class="stat-label">' + x.label + '</div></div>').join('') + '</div>' +
        '<p class="muted" style="font-size:var(--fs-13)">' + s[4].value + ' ' + s[4].label + '.' +
          ' The intended use is safety-oriented research and engineering, not flight operations.</p>' +
      '</div>' +
    '</section>' +

    '<section class="section" style="border-top:1px solid var(--line-soft);background:var(--bg-shell)">' +
      '<div class="wrap stack-lg">' +
        '<div class="section-head"><div><p class="eyebrow">Scientific honesty</p><h2>The boundary of every claim in this interface</h2>' +
          '<p>Written so a reviewer can hold the prototype to it.</p></div></div>' +
        honestySection() +
        '<div class="grid grid-2 mt-6">' +
          '<div class="card"><div class="card-title"><h3>Intended users</h3></div>' +
            '<p style="font-size:var(--fs-14)">Researchers and safety-minded engineers who need to know what was actually observed under tested conditions — ' +
            'and a competition reviewer checking whether the tool is honest about what it does not know.</p></div>' +
          '<div class="card"><div class="card-title"><h3>Where this goes</h3></div>' +
            '<p style="font-size:var(--fs-14)">BASS-II is the first collection, not the limit of the idea. ' +
            'Other NASA combustion studies can follow once their fields are mapped to the same catalog shape.</p>' +
            '<a class="btn btn-sm btn-ghost mt-3" href="#/data-notes">Read the data and backend notes ' + UI.icon('chevron', 13) + '</a></div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap stack-lg">' +
        '<div class="section-head"><div><p class="eyebrow">Roadmap</p><h2>What is available now, and what happens next</h2>' +
          '<p>The 2026 build guide says full challenge details and suggested resources arrive on 28 October 2026. That may refine scope; it is not a promise of a clean training dataset.</p></div></div>' +
        roadsSection() +
      '</div>' +
    '</section>' +

    '<section class="section" style="border-top:1px solid var(--line-soft)">' +
      '<div class="wrap stack-lg">' +
        '<div class="section-head"><div><p class="eyebrow">Sources to revisit</p><h2>Every claim in this prototype is traceable to these</h2></div></div>' +
        sourcesSection() +
      '</div>' +
    '</section>';
  }

  return { render };
})();
