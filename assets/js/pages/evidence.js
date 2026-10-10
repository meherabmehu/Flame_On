/* ==========================================================================
   pages/evidence.js — evidence & results view
   --------------------------------------------------------------------------
   Answers three questions in order:
     1. what media and conditions exist for this test?
     2. what was observed, and on what basis?
     3. which other tests can fairly be set beside it — and if none can,
        what exactly is missing?
   Recorded observation and proposed machine interpretation are never mixed.
   ========================================================================== */

const EvidencePage = (function () {
  let root = null;

  /* ------------------------------------------------------------- chooser */

  function chooser() {
    const list = Store.records();
    const withMedia = list.filter((r) => r.media.kind !== 'none');
    const c = Store.state.compare;

    return '<div class="page-head"><div class="wrap page-head-inner">' +
      '<div>' +
        '<p class="eyebrow">Evidence &amp; results</p>' +
        '<h1>Open a test to see its evidence</h1>' +
        '<p class="lead">Each view shows illustrative conditions and observations, media status, ' +
          'and the neighbouring tests that can be compared fairly.</p>' +
      '</div>' +
    '</div></div>' +
    '<div class="wrap section-sm stack-lg">' +
      (c.a && c.b
        ? '<div class="notice notice-teal">' + UI.icon('compare', 16) +
            '<div><span class="notice-title">You have a comparison loaded</span>' +
            '<p class="mt-1">Open either side of it directly.</p>' +
            '<div class="row mt-3" style="gap:8px">' +
              '<a class="btn btn-sm" href="#/evidence/' + UI.esc(c.a) + '">Evidence for ' + UI.esc(c.a) + '</a>' +
              '<a class="btn btn-sm" href="#/evidence/' + UI.esc(c.b) + '">Evidence for ' + UI.esc(c.b) + '</a>' +
              '<a class="btn btn-sm btn-ghost" href="#/compare">Back to the workspace</a>' +
            '</div></div></div>'
        : '') +
      '<div class="card card-lg">' +
        '<div class="card-title"><h2 style="font-size:var(--fs-20)">Records with illustrative media descriptions</h2>' +
          '<span class="badge">' + withMedia.length + ' of ' + list.length + '</span></div>' +
        '<p style="font-size:var(--fs-13);color:var(--tx-3)">No original video or frame files are supplied. ' +
          'Media descriptions are demonstration metadata only, not verified source assets.</p>' +
        '<div class="grid grid-auto mt-4">' +
          withMedia.slice(0, 8).map((r) =>
            '<a class="card" href="#/evidence/' + UI.esc(r.id) + '" style="text-decoration:none;background:var(--bg-inset)">' +
              '<div class="record-id">' + UI.esc(r.id) + '</div>' +
              '<h3 class="mt-1" style="font-size:var(--fs-14);color:var(--tx-1)">' + UI.esc(r.title) + '</h3>' +
              '<p class="muted mt-2" style="font-size:var(--fs-12)">' + UI.esc(r.media.label) + '</p>' +
            '</a>').join('') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* -------------------------------------------------------------- helpers */

  function traceabilityTable(record) {
    return '<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table class="table">' +
      '<thead><tr><th scope="col">Observation</th><th scope="col">Value recorded</th><th scope="col">Where it comes from</th><th scope="col">Review state</th></tr></thead><tbody>' +
      (record.outcomes || []).map((o) =>
        '<tr><td><strong class="tx-1">' + UI.esc(o.label) + '</strong><div class="muted" style="font-size:var(--fs-12)">' + UI.esc(o.detail) + '</div></td>' +
          '<td>' + UI.outcomeBadge(o.type) + '</td>' +
          '<td>' + 'Team-authored demonstration observation; source extraction unverified' + '<div class="muted" style="font-size:var(--fs-12)">' + UI.esc(record.source.report) + ' · ' + UI.esc(record.source.ntrs) + '</div></td>' +
          '<td>' + UI.reviewedBadge(record) + '</td></tr>').join('') +
      '</tbody></table></div>';
  }

  function timeline(record) {
    if (!record.phases || !record.phases.length) {
      return UI.state({
        dashed: true, inline: true, icon: 'clock',
        title: 'No phase timeline recorded',
        message: 'This demo record has no ordered events. In the finished product the timeline is built from reviewed PSI file contents.'
      });
    }
    return '<ol class="timeline">' + record.phases.map((p) =>
      '<li class="timeline-item">' +
        '<span class="timeline-time">' + Math.floor(p.t_s / 60) + ':' + String(p.t_s % 60).padStart(2, '0') + '</span>' +
        '<span class="timeline-body">' + UI.esc(p.label) + '</span>' +
      '</li>').join('') + '</ol>';
  }

  function conditionsTable(record) {
    const keys = ['fuel', 'geometry', 'thickness_mm', 'oxygen_pct', 'airflow_cms', 'flow_direction', 'ignition', 'pressure_kpa', 'duration_s'];
    return '<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table class="table">' +
      '<thead><tr><th scope="col">Condition</th><th scope="col">Recorded value</th><th scope="col">Status</th></tr></thead><tbody>' +
      keys.map((k) => {
        const missing = Store.isMissing(record, k);
        const unit = UNIT_BY_KEY[k] || '';
        const shown = missing ? '—' : (k === 'ignition' || k === 'flow_direction') ? record[k]
          : (Matcher.displayValue(k, record[k]) || record[k] + (unit ? ' ' + unit : ''));
        return '<tr><td>' + UI.esc(CONDITION_LABELS[k] || k) + (unit ? ' <span class="muted">(' + unit + ')</span>' : '') + '</td>' +
          '<td class="' + (missing ? '' : 'tx-1') + '">' + (missing ? '<span class="missing-note">not recorded</span>' : UI.esc(shown)) + '</td>' +
          '<td>' + (missing ? '<span class="badge badge-unknown">unknown, not zero</span>' : '<span class="badge badge-ok">recorded</span>') + '</td></tr>';
      }).join('') +
      '</tbody></table></div>';
  }

  function relatedComparisons(record) {
    const factor = Store.state.compare.factor;
    const partners = [];
    Store.records().forEach((other) => {
      if (other.id === record.id) return;
      const v = Matcher.pairVerdict(record, other, factor);
      if (v.verdict === 'comparable' || v.verdict === 'caution' || v.verdict === 'unsuitable') {
        partners.push({ other, v });
      }
    });
    const good = partners.filter((p) => p.v.verdict !== 'unsuitable').slice(0, 4);
    const bad = partners.filter((p) => p.v.verdict === 'unsuitable').slice(0, 2);

    if (!good.length) {
      return UI.state({
        dashed: true,
        icon: 'layersOff',
        title: 'No suitable comparison found for this test',
        message: 'On the factor currently selected in the workspace (' + UI.esc(Matcher.factorLabel(factor)) + '), no other indexed record matches closely enough. ' +
          'This describes the demonstration catalog only, not real experiments or physical behavior.'
      });
    }

    return '<div class="suggest-list">' +
      good.map((p) =>
        '<div class="suggest-item">' +
          '<div class="suggest-main">' +
            '<h4>' + UI.esc(p.other.id) + '</h4>' +
            '<p>' + UI.esc(p.other.title) + '</p>' +
            '<div class="tag-row mt-2">' + UI.verdictBadge(p.v.verdict) +
              '<span class="pill">' + UI.esc(Matcher.factorLabel(factor)) + ' ' +
                UI.esc(Matcher.displayValue(factor, record[factor])) + ' → ' +
                UI.esc(Matcher.displayValue(factor, p.other[factor])) + '</span></div>' +
          '</div>' +
          '<a class="btn btn-sm" href="#/compare?a=' + UI.esc(record.id) + '&b=' + UI.esc(p.other.id) + '&factor=' + UI.esc(factor) + '">Compare</a>' +
        '</div>').join('') +
      (bad.length
        ? '<div class="notice notice-warn mt-2">' + UI.icon('alert', 16) +
            '<div><span class="notice-title">Shown for contrast — examined and rejected</span>' +
            '<ul class="mt-2" style="font-size:var(--fs-13)">' + bad.map((p) =>
              '<li>' + UI.esc(p.other.id) + ': ' + UI.esc(p.v.reasons.find((r) => !r.ok) ? p.v.reasons.find((r) => !r.ok).text : 'conditions differ') + '</li>').join('') +
            '</ul></div></div>'
        : '') +
    '</div>';
  }

  /* ----------------------------------------------------------- main view */

  function fullView(record) {
    const c = Store.state.compare;
    const mediaNote = record.media.kind === 'none'
      ? 'No media is described for this demonstration record. Its observation is illustrative text only.'
      : 'Illustrative media description: ' + record.media.label + '. No original video or frame files are supplied or verified.';

    return '<div class="page-head"><div class="wrap page-head-inner">' +
      '<div>' +
        '<nav class="breadcrumb" aria-label="Breadcrumb">' +
          '<a href="#/explorer">Explorer</a><span aria-hidden="true">/</span>' +
          '<a href="#/compare">Comparison</a><span aria-hidden="true">/</span>' +
          '<span>' + UI.esc(record.id) + '</span>' +
        '</nav>' +
        '<p class="eyebrow">Evidence &amp; results</p>' +
        '<h1>Evidence &amp; Observations — ' + UI.esc(record.id) + '</h1>' +
        '<p class="lead">' + UI.esc(record.id) + ' · session ' + UI.esc(record.session) + ' · ' + UI.esc(record.run) + '</p>' +
        '<div class="tag-row mt-4">' +
          '<span class="badge badge-ember">' + UI.esc(COPY.demoTag) + '</span>' +
          UI.reviewedBadge(record) + UI.missingCount(record) +
          (record.outcomes || []).map((o) => UI.outcomeBadge(o.type)).join('') +
        '</div>' +
      '</div>' +
      '<div class="stack-sm page-head-actions">' +
        '<button class="btn btn-primary" data-action="compare-with">' + UI.icon('compare', 15) + ' Compare this test</button>' +
        '<a class="btn" href="#/record/' + UI.esc(record.id) + '">Full record metadata</a>' +
      '</div>' +
    '</div></div>' +

    '<div class="wrap evidence-workspace">' + UI.evidenceSummary(record) + UI.conditionStrip(record) +
      '<nav class="inspection-nav" aria-label="Evidence sections">' +
        [['obs-title', 'Observations'], ['trace-title', 'Traceability'], ['lim-title', 'Limitations']].map((s) =>
          '<button class="btn btn-sm btn-ghost" data-action="inspect-section" data-section="' + s[0] + '">' + s[1] + '</button>').join('') +
      '</nav><div class="evidence-grid">' +
      '<div class="stack-lg">' +

        '<section class="card card-flush" aria-labelledby="media-title">' +
          '<figure class="media-frame" style="border:0;border-radius:0">' +
            '<div class="viewer-toolbar"><h2>Media Viewer</h2><div class="viewer-tabs"><button class="btn" type="button" data-action="evidence-view" data-view="schematic" aria-pressed="true">Schematic</button><button class="btn" type="button" data-action="evidence-view" data-view="unavailable" aria-pressed="false">Footage status</button></div></div>' +
            '<div class="viewer-schematic">' + UI.mediaPlaceholder(record, { showPlay:false }) + '</div>' +
            '<div class="media-unavailable viewer-unavailable" hidden>' + UI.icon('videoOff', 28) + '<div><strong>No original experiment footage</strong><p>This prototype provides metadata and illustrative observations only.</p></div></div>' +
            (record.media.kind === 'none' ? '' :
              '<details class="schematic-disclosure"><summary>View illustrative schematic <span class="muted">Not source footage</span></summary>' +
              UI.mediaPlaceholder(record, { showPlay: false }) + '</details>') +
            '<figcaption>' +
              '<div class="card-title" style="margin-bottom:8px">' +
                '<h2 id="media-title" style="font-size:var(--fs-17)">Experiment media</h2>' +
                '<span class="badge">' + UI.esc(record.media.kind === 'none' ? 'no file' : record.media.label) + '</span>' +
              '</div>' +
              UI.esc(mediaNote) +
              '<p class="mt-2 muted" style="font-size:var(--fs-12)">The optional drawing is a schematic of the duct and sample, generated from this record’s fields. ' +
                'It is not a frame from a NASA video.</p>' +
            '</figcaption>' +
          '</figure>' +
        '</section>' +

        '<section class="card card-lg" aria-labelledby="obs-title">' +
          '<div class="card-title"><h2 id="obs-title" style="font-size:var(--fs-20)">Observed behaviour</h2>' +
            '<span class="badge badge-ember">Illustrative, unverified</span></div>' +
          '<p class="muted mb-4">These team-authored observations demonstrate the evidence layout. They are not findings extracted from NASA experiments.</p>' +
          '<div class="mt-2">' + (record.outcomes || []).map((o) =>
            '<div class="obs-row">' +
              '<div class="row row-wrap" style="gap:10px">' + UI.outcomeBadge(o.type) +
                '<span class="obs-value">' + UI.esc(o.label) + '</span></div>' +
              '<p class="obs-note">' + UI.esc(o.detail) + '</p>' +
              '<p class="muted mt-1" style="font-size:var(--fs-12)">Basis: ' + 'Team-authored demonstration observation; source extraction unverified' + '</p>' +
            '</div>').join('') + '</div>' +
        '</section>' +

        '<section class="card card-lg" aria-labelledby="tl-title">' +
          '<div class="card-title"><h2 id="tl-title" style="font-size:var(--fs-20)">Phase timeline</h2>' +
            '<span class="badge badge-unknown">Illustrative phase notes</span></div>' +
          '<p class="muted mb-4" style="font-size:var(--fs-13)">Timings are demonstration values recorded by hand in this prototype. ' +
            'Instrumented timings would come from the PSI files once extraction is verified.</p>' +
          timeline(record) +
        '</section>' +

        '<details class="card card-lg planned-measurements"><summary>Visual measurements <span class="badge badge-warn">Not implemented</span></summary>' +
          '<div class="card-title"><h2 id="meas-title" style="font-size:var(--fs-20)">Visual measurements</h2>' +
            '<span class="badge badge-warn">Not implemented</span></div>' +
          '<p style="font-size:var(--fs-14);max-width:74ch">The build guide describes computer vision on a selected video subset to measure visible flame changes, ' +
            'with people verifying the measurements. Nothing is trained or measured here, so this panel shows the shape the output will take rather than a number.</p>' +
          '<div class="grid grid-3 mt-4">' +
            ['Flame length', 'Flame front position', 'Brightness change'].map((m) =>
              '<div class="concept-panel"><h4>' + UI.icon('ruler', 13) + ' ' + m + '</h4>' +
                '<div class="concept-stub mt-3">Awaiting verified labels</div>' +
                '<p>No value is produced in this prototype, and no placeholder number is shown in its place.</p></div>').join('') +
          '</div>' +
        '</details>' +

        '<section class="card card-lg" aria-labelledby="trace-title">' +
          '<div class="card-title"><h2 id="trace-title" style="font-size:var(--fs-20)">How each observation is traceable</h2></div>' +
          traceabilityTable(record) +
        '</section>' +

        '<section class="card card-lg" aria-labelledby="lim-title">' +
          '<div class="card-title"><h2 id="lim-title" style="font-size:var(--fs-20)">Limitations of this record</h2></div>' +
          '<div class="limit-list">' +
            '<div class="limit-item">' + UI.icon('alert', 15) + '<span>' + UI.esc(record.limitations) + '</span></div>' +
            '<div class="limit-item">' + UI.icon('alert', 15) + '<span>Demonstration row: values, outcomes and timings are invented for interface testing and must be replaced by reviewed extraction.</span></div>' +
            (!record.metadataReviewed ? '<div class="limit-item">' + UI.icon('alert', 15) + '<span>Metadata review for this row is not finished, so its values may still change.</span></div>' : '') +
            '<div class="limit-item">' + UI.icon('alert', 15) + '<span>A record of what happened is not a prediction about an untested cabin.</span></div>' +
          '</div>' +
        '</section>' +

      '</div>' +

      '<aside class="side-panel" aria-label="Evidence summary">' +

        '<section class="card observation-identity"><h2>Observation Details</h2><div class="observation-record-title">' + UI.recordThumbnail(record) + '<div><h3>' + UI.esc(record.title) + '</h3><span class="record-id">' + UI.esc(record.id) + '</span></div></div><dl class="kv"><dt>Session</dt><dd>' + UI.esc(record.session) + '</dd><dt>Material</dt><dd>' + UI.esc(Matcher.displayValue('fuel',record.fuel)) + '</dd><dt>Sample geometry</dt><dd>' + UI.esc(Matcher.displayValue('geometry',record.geometry)) + '</dd><dt>Source extraction</dt><dd>Unverified demonstration row</dd></dl><a class="btn btn-primary" href="#/record/' + UI.esc(record.id) + '">View full record ' + UI.icon('chevron',14) + '</a></section>' +

        '<div class="split-claim">' +
          '<div class="claim claim-observed">' +
            '<h4>Illustrative observation</h4>' +
            '<p class="tx-1">' + UI.esc((record.outcomes && record.outcomes[0]) ? record.outcomes[0].label : 'Not recorded') + '</p>' +
            '<p class="muted" style="font-size:var(--fs-12)">Team-authored demonstration outcome in ' + UI.esc(record.id) + '.</p>' +
          '</div>' +
          '<details class="claim claim-concept"><summary>Proposed interpretation</summary>' +
            '<h4>Proposed interpretation</h4>' +
            '<p class="muted">A machine explanation of this test would appear here. No model is trained in this prototype, so the slot stays empty and clearly marked.</p>' +
          '</details>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-title"><h3 style="font-size:var(--fs-15)">Recorded conditions</h3>' + UI.completeness(record) + '</div>' +
          conditionsTable(record) +
        '</div>' +

        '<div class="card">' +
          '<div class="card-title"><h3 style="font-size:var(--fs-15)">Comparable neighbours</h3>' +
            '<span class="badge badge-teal">' + UI.esc(Matcher.factorLabel(c.factor)) + '</span></div>' +
          relatedComparisons(record) +
          '<p class="muted mt-3" style="font-size:var(--fs-12)">Change the varied factor in the <a href="#/compare">comparison workspace</a> to see a different set of neighbours.</p>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-title"><h3 style="font-size:var(--fs-15)">NASA background references</h3></div>' +
          '<div class="source-item" style="padding:12px 0">' +
            '<div><h4>' + UI.esc(record.source.report) + '</h4><p>Published BASS-II reporting</p></div>' +
            '<span class="source-ref">' + UI.esc(record.source.ntrs) + '</span>' +
          '</div>' +
          '<div class="source-item" style="padding:12px 0">' +
            '<div><h4>Physical Sciences Informatics</h4><p>Experiment files and videos for BASS-II</p></div>' +
            '<span class="source-ref">PSI</span>' +
          '</div>' +
          '<div class="row mt-3" style="gap:8px;flex-wrap:wrap">' +
            '<a class="btn btn-sm" href="https://ntrs.nasa.gov/citations/' + UI.esc(record.source.ntrs) + '" target="_blank" rel="noopener">' + UI.icon('external', 13) + ' NTRS ' + UI.esc(record.source.ntrs) + '</a>' +
            '<a class="btn btn-sm" href="https://www.nasa.gov/physical-sciences-informatics-psi/" target="_blank" rel="noopener">' + UI.icon('external', 13) + ' PSI investigation</a>' +
          '</div>' +
          '<p class="muted mt-3">These background reports do not verify this invented record or its observations.</p><button class="btn btn-sm btn-ghost mt-3" data-action="copy-citation">' + UI.icon('book', 13) + ' Copy citation string</button>' +
        '</div>' +

      '</aside>' +
    '</div></div>';
  }

  function render(route, container) {
    root = container;
    const id = route && route.id;
    const record = id ? Store.byId(id) : null;

    if (!Store.records().length) {
      container.innerHTML = '<div class="wrap section">' + UI.emptyDataState() + '</div>';
      return;
    }

    if (!id) { container.innerHTML = chooser(); return; }

    if (!record) {
      container.innerHTML = '<div class="wrap section">' + UI.state({
        icon: 'search',
        title: 'No record with ID “' + UI.esc(id) + '”',
        message: 'The catalog does not contain that identifier. It may be a demonstration row that was renamed, or an identifier from a source that has not been extracted yet.',
        action: '<a class="btn btn-sm btn-primary" href="#/explorer">Back to the explorer</a>'
      }) + '</div>';
      return;
    }

    container.innerHTML = fullView(record);
  }

  const actions = {
    'evidence-view': (button) => {
      const schematic = button.dataset.view === 'schematic';
      root.querySelector('.viewer-schematic').hidden = !schematic;
      root.querySelector('.viewer-unavailable').hidden = schematic;
      root.querySelectorAll('[data-action="evidence-view"]').forEach((tab) => tab.setAttribute('aria-pressed', String(tab === button)));
    },
    'inspect-section': (button) => {
      const heading = root.querySelector('#' + button.dataset.section);
      if (!heading) return;
      heading.setAttribute('tabindex', '-1');
      heading.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      heading.focus({ preventScroll: true });
    },
    'compare-with': () => {
      const c = Store.state.compare;
      const id = (location.hash.split('/')[2] || '').split('?')[0];
      const record = Store.byId(id);
      if (!record) return;
      Store.setCompare({ a: record.id, b: c.b === record.id ? null : c.b });
      Router.go('/compare?a=' + record.id + (c.b && c.b !== record.id ? '&b=' + c.b : '') + '&factor=' + c.factor);
    },
    'copy-citation': () => {
      const id = (location.hash.split('/')[2] || '').split('?')[0];
      const r = Store.byId(id);
      if (!r) return;
      const text = 'Team CinderLens illustrative record ' + r.id + '. Invented conditions and observations; not a NASA measurement. Background reference: https://ntrs.nasa.gov/citations/' + r.source.ntrs;
      UI.copyText(text, 'Citation copied with demonstration status.');
    }
  };

  return { render, actions };
})();
