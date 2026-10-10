/* ==========================================================================
   pages/record.js — experiment detail (catalog / metadata view)
   --------------------------------------------------------------------------
   Where the evidence view explains what was observed, this page is the
   record itself: identifiers, session information, every catalog field with
   an explicit "not recorded" state, media inventory, provenance and limits.
   ========================================================================== */

const RecordPage = (function () {
  let root = null;

  const FIELD_GROUPS = [
    {
      title: 'Identification',
      fields: [
        { key: 'id', label: 'Test ID' },
        { key: 'title', label: 'Record title' },
        { key: 'session', label: 'Session date', raw: true },
        { key: 'run', label: 'Position in session', raw: true }
      ]
    },
    {
      title: 'Test conditions',
      fields: [
        { key: 'fuel', label: 'Fuel / material' },
        { key: 'geometry', label: 'Sample geometry' },
        { key: 'thickness_mm', label: 'Thickness', unit: 'mm' },
        { key: 'oxygen_pct', label: 'Oxygen', unit: '% by volume' },
        { key: 'airflow_cms', label: 'Airflow', unit: 'cm/s' },
        { key: 'flow_direction', label: 'Flow direction' },
        { key: 'ignition', label: 'Ignition source' },
        { key: 'pressure_kpa', label: 'Cabin pressure', unit: 'kPa' },
        { key: 'duration_s', label: 'Test duration', unit: 's' }
      ]
    }
  ];

  function fieldHTML(record, f) {
    const v = record[f.key];
    const missing = v === null || v === undefined || v === '';
    let shown;
    if (missing) shown = 'not recorded';
    else if (f.key === 'fuel') shown = Matcher.displayValue('fuel', v);
    else if (f.key === 'geometry') shown = GEOMETRY_LABELS[v] || v;
    else if (['flow_direction', 'ignition', 'session', 'run', 'title', 'id'].includes(f.key)) shown = v;
    else shown = Matcher.displayValue(f.key, v) || (v + (f.unit ? ' ' + f.unit : ''));

    return '<div>' +
      '<dt class="def-term">' + UI.esc(f.label) + (f.unit ? ' <span class="muted">(' + UI.esc(f.unit) + ')</span>' : '') + '</dt>' +
      '<dd class="def-val' + (missing ? ' is-missing' : '') + '">' + UI.esc(shown) + '</dd>' +
    '</div>';
  }

  function mediaSection(record) {
    const kind = record.media.kind;
    const inventory = [
      { label: 'Video file', available: false, note: 'demo metadata only; no video file supplied' },
      { label: 'Extracted frames', available: false, note: 'demo metadata only; no frame files supplied' },
      { label: 'Instrumented measurements', available: false, note: 'not produced in this prototype' },
      { label: 'Verified labels', available: false, note: 'requires a human review pass' }
    ];
    return '<details class="card card-lg record-media"><summary>Media inventory <span class="badge badge-unknown">No original files supplied</span></summary>' +
      '<div class="card-title"><h2 style="font-size:var(--fs-20)">Media inventory</h2>' +
        '<span class="badge ' + (kind === 'none' ? 'badge-unknown' : 'badge-teal') + '">' +
          UI.esc(kind === 'none' ? 'no media indexed' : kind === 'video' ? 'video described only' : 'frames described only') + '</span></div>' +
      UI.mediaPlaceholder(record, { showPlay: kind === 'video' }) +
      '<div class="mt-4">' +
        inventory.map((i) =>
          '<div class="source-item" style="padding:10px 0">' +
            '<div class="row" style="gap:10px">' +
              '<span class="dot ' + (i.available ? 'dot-ok' : 'dot-warn') + '"></span>' +
              '<strong class="tx-1" style="font-size:var(--fs-14)">' + UI.esc(i.label) + '</strong>' +
            '</div>' +
            '<span class="muted" style="font-size:var(--fs-12)">' +
              UI.esc(i.available ? (kind === 'frame-set' && i.label === 'Extracted frames' ? record.media.label : 'present in this record') : (i.note || 'not available')) +
            '</span>' +
          '</div>').join('') +
      '</div>' +
      '<p class="muted mt-3" style="font-size:var(--fs-12)">' +
        'No original video or frame files are supplied. Media descriptors are illustrative metadata, not verified NASA assets.</p>' +
    '</details>';
  }

  function usedInComparisons(record) {
    const factor = Store.state.compare.factor;
    const partners = [];
    Store.records().forEach((other) => {
      if (other.id === record.id) return;
      const v = Matcher.pairVerdict(record, other, factor);
      if (v.verdict === 'comparable' || v.verdict === 'caution') partners.push({ other, v });
    });
    if (!partners.length) {
      return UI.state({
        dashed: true, inline: true, icon: 'layersOff',
        title: 'No fair partner on ' + Matcher.factorLabel(factor).toLowerCase(),
        message: 'This record can still be inspected, but no indexed test sits close enough on the other conditions to support a one-factor comparison.'
      });
    }
    return '<ul style="display:flex;flex-direction:column;gap:10px">' + partners.map((p) =>
      '<li class="row-between" style="display:flex;justify-content:space-between;gap:10px;align-items:center">' +
        '<span><a href="#/record/' + UI.esc(p.other.id) + '">' + UI.esc(p.other.id) + '</a>' +
          '<span class="muted" style="font-size:var(--fs-12)"> · ' + UI.esc(p.other.title) + '</span></span>' +
        '<span class="row" style="gap:8px">' + UI.verdictBadge(p.v.verdict) +
          '<a class="btn btn-sm btn-ghost" href="#/compare?a=' + UI.esc(record.id) + '&b=' + UI.esc(p.other.id) + '&factor=' + UI.esc(factor) + '">Compare</a></span>' +
      '</li>').join('') + '</ul>';
  }

  function render(route, container) {
    root = container;
    const id = route && route.id;
    const record = id ? Store.byId(id) : null;

    if (!Store.records().length) {
      container.innerHTML = '<div class="wrap section">' + UI.emptyDataState() + '</div>';
      return;
    }

    if (!record) {
      container.innerHTML = '<div class="wrap section">' + UI.state({
        icon: 'search',
        title: 'Record not found',
        message: id ? 'There is no record with the identifier “' + UI.esc(id) + '” in the catalog.' : 'No record was specified.',
        action: '<a class="btn btn-sm btn-primary" href="#/explorer">Back to the explorer</a>'
      }) + '</div>';
      return;
    }

    container.innerHTML =
      '<div class="page-head"><div class="wrap page-head-inner">' +
        '<div>' +
          '<nav class="breadcrumb" aria-label="Breadcrumb">' +
            '<a href="#/explorer">Explorer</a><span aria-hidden="true">/</span>' +
            '<span>' + UI.esc(record.id) + '</span>' +
          '</nav>' +
          '<p class="eyebrow">Experiment detail <span class="dossier-id">' + UI.esc(record.id) + '</span></p>' +
          '<h1>' + UI.esc(record.title) + '</h1>' +
          '<p class="lead">The catalog row as indexed: what was set, what was recorded, what is missing and where the record came from.</p>' +
          '<div class="tag-row mt-4">' +
            '<span class="badge badge-ember">' + UI.esc(COPY.demoTag) + '</span>' +
            UI.reviewedBadge(record) + UI.missingCount(record) +
          '</div>' +
        '</div>' +
        '<div class="stack-sm page-head-actions">' +
          '<button class="btn btn-primary btn-block" data-action="use-in-compare">' + UI.icon('compare', 15) + ' Use in a comparison</button>' +
          '<button class="btn btn-block" data-action="copy-id">Copy experiment ID</button>' +
          '<a class="btn btn-block" href="#/evidence/' + UI.esc(record.id) + '">Open evidence view</a>' +
        '</div>' +
      '</div></div>' +

      '<div class="wrap record-workspace">' + UI.conditionStrip(record) +
        '<div class="record-provenance-note">' + UI.icon('book', 17) + '<p><strong>Source extraction unverified.</strong> Conditions and observations are team-authored demonstration content. NASA reports provide background references only.</p></div>' +
      '<div class="detail-grid">' +
        '<div class="stack-lg">' +

          '<section class="card card-lg">' +
            FIELD_GROUPS.map((g, i) =>
              '<section class="metadata-group' + (i ? ' mt-6' : '') + '">' +
                '<div class="card-title"><h2 style="font-size:var(--fs-17)"><span class="section-marker">0' + (i + 1) + '</span>' + g.title + '</h2>' +
                  '<span class="badge">' + g.fields.filter((f) => !Store.isMissing(record, f.key)).length + '/' + g.fields.length + ' recorded</span></div>' +
                '<dl class="def-list">' + g.fields.map((f) => fieldHTML(record, f)).join('') + '</dl>' +
              '</section>').join('') +
            '<p class="muted mt-6" style="font-size:var(--fs-13)">' +
              'Empty fields are shown as “not recorded” and never as zero. In the finished product this grid is rendered from the reviewed catalog table, ' +
              'with each value traceable to the PSI file or report it came from.</p>' +
          '</section>' +

          mediaSection(record) +

          '<section class="card card-lg">' +
            '<div class="card-title"><h2 style="font-size:var(--fs-20)">Illustrative behaviour and phase notes</h2></div>' +
            (record.outcomes || []).map((o) =>
              '<div class="obs-row"><div class="row row-wrap" style="gap:10px">' + UI.outcomeBadge(o.type) +
                '<span class="obs-value">' + UI.esc(o.label) + '</span></div>' +
                '<p class="obs-note">' + UI.esc(o.detail) + '</p>' +
                '<p class="muted mt-1" style="font-size:var(--fs-12)">Basis: ' + 'Team-authored demo observation; not a verified source extraction' + '</p></div>').join('') +
            '<hr>' +
            '<h3 style="font-size:var(--fs-15)">Phase notes</h3>' +
            '<ul class="mt-3" style="display:flex;flex-direction:column;gap:8px">' +
              (record.phases || []).map((p) =>
                '<li class="row" style="gap:12px;align-items:flex-start">' +
                  '<span class="mono muted" style="font-size:var(--fs-12);min-width:64px">' +
                    Math.floor(p.t_s / 60) + ':' + String(p.t_s % 60).padStart(2, '0') + '</span>' +
                  '<span style="font-size:var(--fs-13)">' + UI.esc(p.label) + '</span></li>').join('') +
            '</ul>' +
          '</section>' +

          '<section class="card card-lg">' +
            '<div class="card-title"><h2 style="font-size:var(--fs-20)">Limitations</h2></div>' +
            '<div class="limit-list">' +
              '<div class="limit-item">' + UI.icon('alert', 15) + '<span>' + UI.esc(record.limitations) + '</span></div>' +
              '<div class="limit-item">' + UI.icon('alert', 15) + '<span>Demonstration content: this row was written to exercise the interface and is not an extracted NASA record.</span></div>' +
            '</div>' +
          '</section>' +

        '</div>' +

        '<aside class="side-panel" aria-label="Record summary">' +
          '<div class="card sticky-actions">' +
            '<div class="card-title"><h3 style="font-size:var(--fs-15)">At a glance</h3></div>' +
            '<div class="tag-row">' + UI.factorChips(record) + '</div>' +
          '</div>' +

          '<div class="card">' +
            '<div class="card-title"><h3 style="font-size:var(--fs-15)">Provenance</h3>' +
              '<span class="badge badge-unknown">Unverified extraction</span></div>' +
            '<dl class="kv">' +
              '<dt>Catalog row</dt><dd>' + UI.esc(record.id) + '</dd>' +
              '<dt>PSI collection</dt><dd>' + UI.esc(record.source.psi) + '</dd>' +
              '<dt>Background report</dt><dd><a href="https://ntrs.nasa.gov/citations/' + UI.esc(record.source.ntrs) + '" target="_blank" rel="noopener">' + UI.esc(record.source.report) + ' (' + UI.esc(record.source.ntrs) + ') ' + UI.icon('external', 12) + '</a></dd>' +
              '<dt>Extraction</dt><dd>Not run — demonstration row</dd>' +
              '<dt>Demo metadata check</dt><dd>' + (record.metadataReviewed ? 'Interface review only; source unverified' : 'Pending; source unverified') + '</dd>' +
            '</dl>' +
            '<p class="muted mt-4" style="font-size:var(--fs-12)">' +
              'The provenance block is where a reviewer checks the claim. Today it says plainly that no extraction has been verified.</p>' +
          '</div>' +

          '<div class="card">' +
            '<div class="card-title"><h3 style="font-size:var(--fs-15)">Fair comparisons on ' +
              UI.esc(Matcher.factorLabel(Store.state.compare.factor).toLowerCase()) + '</h3></div>' +
            usedInComparisons(record) +
          '</div>' +
        '</aside>' +
      '</div></div>';
  }

  const actions = {
    'copy-id': () => { const id = Router.current().id; if (Store.byId(id)) UI.copyText(id, 'Experiment ID copied.'); },
    'use-in-compare': () => {
      const id = (location.hash.split('/')[2] || '').split('?')[0];
      const record = Store.byId(id);
      if (!record) return;
      const c = Store.state.compare;
      // Fill the first free slot; if both are taken, replace B.
      if (!c.a) Store.setCompare({ a: record.id });
      else if (!c.b && c.a !== record.id) Store.setCompare({ b: record.id });
      else if (c.a !== record.id) Store.setCompare({ b: record.id });
      Router.go('/compare?factor=' + c.factor + '&a=' + (Store.state.compare.a || '') + '&b=' + (Store.state.compare.b || ''));
      UI.toast('Added to the comparison workspace. Step 3 checks whether the other conditions match.');
    }
  };

  return { render, actions };
})();
