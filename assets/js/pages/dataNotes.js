/* ==========================================================================
   pages/dataNotes.js — in-app documentation
   Two audiences at once: a reviewer checking scientific honesty, and the
   developer who will connect the Django backend.
   ========================================================================== */

const DataNotesPage = (function () {

  function honestyBlock() {
    const rows = [
      ['Experiment records', 'Illustrative demonstration rows in <code>assets/js/data/catalog.js</code>. Test IDs, values, outcomes and timings were written by the team to exercise the interface.', 'Replace with hand-reviewed extraction from PSI files and NTRS reports.'],
      ['Media', 'Never streamed and never shown. A generated duct schematic is drawn from the record’s own fields and labelled as a schematic.', 'Serve PSI video or extracted frames and keep the source label visible.'],
      ['Visual measurements', 'None produced. The measurement panel states that computer vision is proposed, not implemented.', 'Add verified measurements only after a human review pass.'],
      ['Retrieval ranking', 'A transparent rule-based match check. The suggested pairs carry a “fit” indicator derived from matched conditions, not from a trained model.', 'Swap in the ML retrieval step and compare it against the keyword baseline, as the build guide describes.'],
      ['Predictions and scores', 'No fire-risk prediction, no accuracy figure, no confidence percentage is displayed anywhere.', 'Only published if verified labels and coverage support it, and only with its uncertainty stated.'],
      ['Abstention', 'Any pair that differs in too many conditions, or whose factor is not recorded, returns “Not enough comparable tests.”', 'Keep the explicit rejection and its condition-specific reasons.']
    ];
    return '<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table class="table">' +
      '<thead><tr><th scope="col">Area</th><th scope="col">What this prototype does</th><th scope="col">What replaces it</th></tr></thead><tbody>' +
      rows.map((r) => '<tr><td class="tx-1"><strong>' + r[0] + '</strong></td><td>' + r[1] + '</td><td class="muted">' + r[2] + '</td></tr>').join('') +
      '</tbody></table></div>';
  }

  function connectionBlock() {
    const endpoints = [
      { m: 'GET', p: '/api/records/', d: 'Full catalog. Each object uses the exact field names in catalog.js, including the nested <code>outcomes</code>, <code>phases</code>, <code>media</code> and <code>source</code> objects.', f: 'Replaces <code>CATALOG</code>' },
      { m: 'GET', p: '/api/records/{id}/', d: 'A single record for the experiment detail page.', f: 'Replaces <code>Store.byId()</code>' },
      { m: 'GET', p: '/api/factors/', d: 'The comparable factors with labels, units, tolerances and the note shown beside each factor.', f: 'Replaces <code>FACTORS</code> and <code>MATCH_RULES</code>' },
      { m: 'GET', p: '/api/coverage/', d: 'Coverage counts per factor combination and the gap statements, so the matrix and the “gaps stated in plain English” list stay in step with the catalog.', f: 'Replaces <code>Matcher.coverageGrid()</code>' },
      { m: 'GET', p: '/api/compare/?a=ID&b=ID&factor=KEY', d: 'Server-side verdict so the same rules are authoritative in one place, and the match check can be tested directly.', f: 'Replaces <code>Matcher.pairVerdict()</code>' },
      { m: 'GET', p: '/api/records/{id}/neighbours/?factor=KEY', d: 'Suggested comparable tests for one record.', f: 'Replaces <code>Matcher.suggestPairs()</code>' }
    ];
    return '<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table class="table">' +
      '<thead><tr><th scope="col">Endpoint</th><th scope="col">Purpose</th><th scope="col">Frontend hook</th></tr></thead><tbody>' +
      endpoints.map((e) =>
        '<tr><td class="nowrap"><span class="badge badge-teal">' + e.m + '</span> <code class="mono">' + e.p + '</code></td>' +
        '<td>' + e.d + '</td><td class="muted">' + e.f + '</td></tr>').join('') +
      '</tbody></table></div>';
  }

  function structureBlock() {
    return '<pre tabindex="0" aria-label="Scrollable code example" class="card" style="overflow:auto;font-size:var(--fs-12);line-height:1.7;color:var(--tx-2)">' +
UI.esc(
`flame-on/
├── index.html                  single entry point, hash-routed
├── assets/css/
│   ├── tokens.css              colour, type, spacing, motion
│   ├── base.css                reset, typography, layout primitives
│   ├── components.css          header, buttons, badges, tables, states
│   ├── pages.css               page layouts (explorer, compare, evidence)
│   └── responsive.css          tablet and mobile behaviour
├── assets/js/
│   ├── data/catalog.js         DEMONSTRATION RECORDS + factor definitions
│   ├── store.js                state, filtering, faceting, persistence
│   ├── matcher.js              comparison + abstention rules (portable to Python)
│   ├── ui.js                   shared components and empty states
│   ├── router.js               hash routing
│   ├── shell.js                header, navigation, data-mode control
│   ├── pages/                  overview, explorer, compare, evidence, record, data-notes
│   └── main.js                 bootstrap and delegated actions
└── docs/                       design notes and screen walkthrough`) +
    '</pre>';
  }

  function runBlock() {
    return '<div class="card card-lg" id="notes-running" tabindex="-1">' +
      '<div class="card-title"><h3>Running the prototype locally</h3><span class="badge badge-teal">no build step</span></div>' +
      '<p class="muted" style="font-size:var(--fs-13)">The frontend is plain HTML, CSS and JavaScript with no dependencies.</p>' +
      '<ol class="mt-4" style="display:flex;flex-direction:column;gap:14px">' +
        '<li><strong class="tx-1">1. Clone the repository</strong><pre tabindex="0" aria-label="Scrollable code example" class="mono mt-2" style="font-size:var(--fs-12);background:var(--bg-inset);padding:12px;border-radius:6px;overflow:auto">git clone https://github.com/meherabmehu/Flame_On.git\ncd Flame_On</pre></li>' +
        '<li><strong class="tx-1">2. Serve the folder</strong>' +
          '<pre tabindex="0" aria-label="Scrollable code example" class="mono mt-2" style="font-size:var(--fs-12);background:var(--bg-inset);padding:12px;border-radius:6px;overflow:auto">python3 -m http.server 8000</pre>' +
          '<p class="muted mt-2" style="font-size:var(--fs-13)">Opening <code>index.html</code> directly also works, but a local server keeps navigation and clipboard behaviour consistent.</p></li>' +
        '<li><strong class="tx-1">3. Open the app</strong><pre tabindex="0" aria-label="Scrollable code example" class="mono mt-2" style="font-size:var(--fs-12);background:var(--bg-inset);padding:12px;border-radius:6px;overflow:auto">http://localhost:8000</pre></li>' +
      '</ol>' +
      '<hr>' +
      '<h4>Demonstration walkthrough (about one minute)</h4>' +
      '<ol class="mt-3" style="display:flex;flex-direction:column;gap:10px;font-size:var(--fs-14)">' +
        '<li>1. On the overview, press <strong class="tx-1">Open this comparison</strong> to load the airflow example.</li>' +
        '<li>2. In the workspace, step 3 already shows the match check and the recorded difference.</li>' +
        '<li>3. Change the varied factor to <strong class="tx-1">Thickness</strong> and pick a suggested pair to see the same machinery on another condition.</li>' +
        '<li>4. Load <strong class="tx-1">BASS2-T121 vs BASS2-T145</strong> to watch the interface refuse to conclude.</li>' +
        '<li>5. Open an evidence view, then the full record, to show traceability and limitations.</li>' +
        '<li>6. Switch the data chip in the header to <strong class="tx-1">Empty catalog</strong> to show the honest empty state.</li>' +
      '</ol>' +
    '</div>';
  }

  function render(route, container) {
    container.innerHTML =
      '<div class="page-head"><div class="wrap page-head-inner">' +
        '<div>' +
          '<p class="eyebrow">Data notes</p>' +
          '<h1>Data Notes</h1>' +
          '<p class="lead">Understand the demonstration data, what the prototype rules check, and why a match is not scientific validation.</p>' +
        '</div>' +
      '</div></div>' +
      '<div class="wrap section-sm notes-workspace"><nav class="notes-nav" aria-label="Data notes sections">' +
        [['notes-overview','Overview','info'], ['notes-demo','Demonstration data','layers'], ['notes-matching','Matching methodology','compare'], ['notes-developer','Integration contracts','book'], ['notes-structure','Project structure','grid'], ['notes-running','Run & walkthrough','chevron']]
        .map((s) => '<button class="btn btn-ghost" type="button"' + (s[0] === 'notes-overview' ? ' aria-current="location"' : '') + ' data-notes-section="' + s[0] + '">' + UI.icon(s[2],16) + s[1] + '</button>').join('') +
      '</nav><div class="stack-lg notes-content"><section class="card card-lg" id="notes-overview" tabindex="-1"><p class="eyebrow">About this project</p><h2>From experimental conditions to evidence</h2><p class="mt-3">CinderLens explores the repository’s illustrative microgravity combustion records. Search recorded conditions, compare two experiments, and review the available metadata and its limitations.</p><p class="notice notice-ember mt-4"><strong>This is a prototype.</strong> Verified NASA experiment data has not yet been integrated. The animated hero is concept artwork, not experiment footage or a validated simulation.</p></section>' +

        UI.state({
          role: 'note',
          icon: 'alert',
          title: 'Demonstration content',
          message: UI.esc(COPY.datasetCaveat) + ' ' + UI.esc(COPY.noProvenance),
          inline: true
        }) +

        '<section class="card card-lg" id="notes-demo" tabindex="-1">' +
          '<div class="card-title"><h2 style="font-size:var(--fs-20)">Honesty table</h2>' +
            '<span class="badge badge-ember">Read before judging output</span></div>' +
          honestyBlock() +
        '</section>' +

        '<details class="card card-lg" id="notes-developer" tabindex="-1"><summary>Developer reference: future integration contracts</summary>' +
          '<div class="card-title mt-4"><h2 style="font-size:var(--fs-20)">Future integration contracts</h2>' +
            '<span class="badge badge-teal">Not implemented</span></div>' +
          '<p style="font-size:var(--fs-14);max-width:78ch">The frontend never computes science it cannot see: every rule lives in <code>matcher.js</code> and every field name comes from the catalog. ' +
            'The endpoints below are the only places that need to change when the reviewed dataset replaces the demonstration rows.</p>' +
          '<div class="mt-4">' + connectionBlock() + '</div>' +
          '<p class="muted mt-4" style="font-size:var(--fs-13)">Response shapes are documented in <code>docs/backend-notes.md</code>. ' +
            'If the backend omits a field, the interface keeps showing “not recorded” rather than assuming a value.</p>' +
        '</details>' +

        '<section class="card card-lg" id="notes-matching" tabindex="-1">' +
          '<div class="card-title"><h2 style="font-size:var(--fs-20)">Matching rules used by this build</h2></div>' +
          '<p class="notice notice-warn mb-4">Prototype heuristics, not scientifically validated. The six checked fields exclude ignition, pressure and duration. A comparable verdict is not evidence of causation.</p>' +
          '<div class="grid grid-2" style="gap:20px">' +
            '<div>' +
              '<h4 class="tx-1">Hard conditions</h4>' +
              '<p class="mt-2" style="font-size:var(--fs-14)">Fuel family, sample geometry and flow direction must be identical. A different flow direction changes the physics, so the pair is rejected rather than annotated.</p>' +
              '<h4 class="tx-1 mt-5">Tolerance</h4>' +
              '<p class="mt-2" style="font-size:var(--fs-14)">An approximate numeric match uses a tolerance of ' + Math.round(MATCH_RULES.numericTolerance * 100) + '% of the higher value. Larger differences can still produce a caveated verdict under the existing rules. These are prototype heuristics, not scientifically validated thresholds.</p>' +
            '</div>' +
            '<div>' +
              '<h4 class="tx-1">Missing values</h4>' +
              '<p class="mt-2" style="font-size:var(--fs-14)">An empty field is unknown. A missing varied value stops the comparison. Missing supporting conditions produce caveats; they never establish a match.</p>' +
              '<h4 class="tx-1 mt-5">Abstention</h4>' +
              '<p class="mt-2" style="font-size:var(--fs-14)">More than ' + MATCH_RULES.maxDiffering + ' differing conditions, an identical varied value, or a missing varied value all stop the comparison.</p>' +
            '</div>' +
          '</div>' +
        '</section>' +

        '<section class="card card-lg" id="notes-structure" tabindex="-1">' +
          '<div class="card-title"><h2 style="font-size:var(--fs-20)">Project structure</h2></div>' +
          structureBlock() +
        '</section>' +

        runBlock() +

      '</div></div>';
    container.querySelectorAll('[data-notes-section]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = container.querySelector('#' + button.dataset.notesSection);
        if (target.tagName === 'DETAILS') target.open = true;
        target.scrollIntoView({ block: 'start' });
        target.focus({ preventScroll: true });
        container.querySelectorAll('[data-notes-section]').forEach((item) => item.removeAttribute('aria-current'));
        button.setAttribute('aria-current', 'location');
      });
    });
  }

  return { render };
})();
