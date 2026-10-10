/* ==========================================================================
   pages/compare.js — comparison workspace
   --------------------------------------------------------------------------
   Three steps:
     1. choose the factor to vary
     2. choose two tests (or accept a suggested pair)
     3. check whether everything else matches closely enough
   The third step is allowed to answer "no". That is the product's honesty
   mechanism, so it is presented with the same care as a positive result.
   ========================================================================== */

const ComparePage = (function () {
  let root = null;

  function factorEvidenceLine(key) {
    const pool = Store.records();
    const withValue = pool.filter((r) => !Store.isMissing(r, key));
    const pairs = Matcher.suggestPairs(key, pool, 50).length;
    return {
      recorded: withValue.length,
      total: pool.length,
      pairs,
      text: withValue.length + ' of ' + pool.length + ' records · ' + pairs + ' usable pair' + (pairs === 1 ? '' : 's')
    };
  }

  function stepOne() {
    const current = Store.state.compare.factor;
    const selected = Matcher.factor(current);
    return '<section class="step factor-section" aria-labelledby="step1-title"><div class="step-head">' +
      '<span class="step-num">1</span><h2 id="step1-title">Choose the factor to compare</h2><span class="step-hint">One recorded condition at a time</span></div>' +
      '<div class="step-body"><div class="factor-grid">' + FACTORS.map((f) => {
        const evidence = factorEvidenceLine(f.key);
        return '<button type="button" class="radio-card factor-radio" data-factor="' + f.key + '" aria-pressed="' + (current === f.key) + '">' +
          '<span class="radio-mark" aria-hidden="true"></span><span><span class="radio-card-title">' + UI.esc(f.label) + '</span>' +
          '<span class="radio-card-desc">' + evidence.pairs + ' usable pairs</span></span></button>';
      }).join('') + '</div><p class="factor-context"><strong>' + UI.esc(selected.label) + '.</strong> ' + UI.esc(selected.note) +
      ' <span>Matching uses unvalidated prototype rules.</span></p></div></section>';
  }

  function recordOptions(selectedId) {
    return '<option value="">— choose a test —</option>' +
      Store.records().map((r) =>
        '<option value="' + UI.esc(r.id) + '"' + (selectedId === r.id ? ' selected' : '') + '>' +
          UI.esc(r.id + ' · ' + r.title) + '</option>').join('');
  }

  function slotHTML(label, id, hint) {
    const r = id ? Store.byId(id) : null;
    const slot = label === 'Test A' ? 'a' : 'b';
    const factor = Store.state.compare.factor;
    const other = Store.byId(Store.state.compare[slot === 'a' ? 'b' : 'a']);
    const value = r?.[factor];
    const scale = r && typeof value === 'number' && typeof other?.[factor] === 'number'
      ? Math.max(Math.abs(value), Math.abs(other[factor])) : null;
    const ratio = scale === null ? null : scale === 0 ? 0 : Math.abs(value) / scale * 100;
    return '<article class="pair-slot' + (r ? ' is-filled' : '') + '" aria-label="Experiment ' + slot.toUpperCase() + '">' +
      '<div class="pair-slot-top"><span class="experiment-marker">' + slot.toUpperCase() + '</span><span class="pair-slot-label">Experiment ' + slot.toUpperCase() + '</span>' +
      '<span class="badge badge-ember">Demonstration</span></div><label class="sr-only" for="pick-' + slot + '">' + label + '</label>' +
      '<select class="select experiment-select" id="pick-' + slot + '">' + recordOptions(id) + '</select>' +
      (r ? '<div class="pair-identity"><div class="record-id">' + UI.esc(r.id) + '</div><h3>' + UI.esc(r.title) + '</h3></div>' +
        '<div class="pair-factor"><span class="research-label">' + UI.esc(Matcher.factorLabel(factor)) + ' · varied factor</span>' +
        '<strong class="research-number">' + UI.esc(Matcher.displayValue(factor, value) || 'Not recorded') + '</strong>' +
        (ratio === null ? '' : '<div class="setting-track" aria-hidden="true"><span style="width:' + ratio + '%"></span></div>') + '</div>' +
        '<div class="cond-grid">' + UI.CARD_KEYS.filter((k) => k !== factor).map((k) => UI.condValue(r,k)).join('') + '</div>' +
        '<div class="pair-observation"><span class="research-label">Illustrative observation</span><p>' + UI.esc(r.outcomes?.[0]?.label || 'Not recorded') + '</p></div>' +
        '<div class="pair-actions"><a class="btn btn-primary btn-sm" href="#/evidence/' + UI.esc(r.id) + '">Inspect evidence ' + UI.icon('chevron',14) + '</a>' +
        '<a class="btn btn-ghost btn-sm" href="#/record/' + UI.esc(r.id) + '">View record</a><button type="button" class="btn-icon" data-action="clear-slot" data-slot="' + label + '" aria-label="Remove ' + UI.esc(r.id) + ' from ' + label + '">' + UI.icon('close',16) + '</button></div>'
      : '<div class="pair-empty">' + UI.icon('layers',28) + '<h3>Choose experiment ' + slot.toUpperCase() + '</h3><p>' + hint + '</p><a class="btn btn-sm" href="#/explorer">Browse records</a></div>') + '</article>';
  }

  function stepTwo() {
    const c = Store.state.compare;
    const suggestions = Matcher.suggestPairs(c.factor, Store.records(), 5);
    const evidence = Matcher.factorEvidence(c.factor, Store.records());
    const numeric = Matcher.factor(c.factor)?.type === 'numeric';
    return '<section class="pair-section" aria-labelledby="step2-title"><div class="workspace-section-head"><div class="section-marker">' +
      '<span class="step-num">2</span><h2 id="step2-title">Select two experiments</h2></div><div class="row">' +
      '<button type="button" class="btn btn-sm" data-action="swap-pair">' + UI.icon('compare',14) + ' Swap A and B</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" data-action="clear-pair">Clear selection</button></div></div>' +
      (evidence.canCompare ? '' : '<div class="notice notice-warn mb-4">' + UI.icon('alert',16) + '<p><strong>No suggested pair on ' + UI.esc(Matcher.factorLabel(c.factor)) + '.</strong> ' + UI.esc(evidence.reason) + '</p></div>') +
      '<div class="comparison-stage">' + slotHTML('Test A',c.a,'Select a record using the catalog control above.') + slotHTML('Test B',c.b,'Select a distinct record to compare against A.') + stepThree() + '</div>' +
      (numeric && c.a && c.b ? '<p class="setting-caption">Bars show recorded settings relative to the larger value in this pair. They do not show flame response or scientific confidence.</p>' : '') +
      '<details class="pair-suggestions" id="pair-suggestions"><summary>Suggested pairs <span class="badge">' + suggestions.length + ' shown</span><span class="muted">Deterministic ranking</span></summary>' +
      (suggestions.length ? '<div class="suggest-list">' + suggestions.map(suggestItem).join('') + '</div>' : UI.state({dashed:true,inline:true,icon:'layersOff',title:'No suggested pair for '+Matcher.factorLabel(c.factor).toLowerCase(),message:UI.esc(evidence.reason)})) +
      '<p class="muted mt-3">Condition counts are not confidence scores. ML retrieval is not implemented.</p></details></section>';
  }

  function suggestItem(p) {
    const c = Store.state.compare;
    const active = c.a === p.a.id && c.b === p.b.id;
    return '<div class="suggest-item">' +
      '<div class="suggest-main">' +
        '<h4>' + UI.esc(p.a.id) + ' <span class="muted" style="font-weight:400">vs</span> ' + UI.esc(p.b.id) + '</h4>' +
        '<p>' + UI.esc(Matcher.factorLabel(c.factor)) + ' ' + UI.esc(p.variedRow.a) + ' → ' + UI.esc(p.variedRow.b) +
          ' · matched: ' + UI.esc(p.matched.slice(0, 3).join(', ') || 'none') + '</p>' +
      '</div>' +
      '<div class="row" style="gap:8px">' +
        '<span class="score-chip"><strong>' + p.matched.length + '</strong> matched conditions</span>' +
        UI.verdictBadge(p.verdict) +
        '<button class="btn btn-sm" data-pair="' + UI.esc(p.a.id) + '|' + UI.esc(p.b.id) + '"' +
          (active ? ' aria-disabled="true"' : '') + '>' + (active ? 'Loaded' : 'Use this pair') + '</button>' +
      '</div>' +
    '</div>';
  }

  function checkTable(verdict) {
    if (!verdict.rows.length) return '';
    const c = Store.state.compare;
    return '<div class="table-wrap mt-4"><div role="table" aria-label="Condition by condition match check">' +
      '<div class="check-row is-head" role="row">' +
        '<span role="columnheader">Condition</span>' +
        '<span role="columnheader">' + UI.esc(c.a || 'Test A') + '</span>' +
        '<span role="columnheader">' + UI.esc(c.b || 'Test B') + '</span>' +
        '<span role="columnheader">Assessment</span>' +
      '</div>' +
      verdict.rows.map((r) => {
        const cls = r.state === 'varied' ? 'is-varied' : r.state === 'differs' ? 'is-conflict' : '';
        const badge = r.state === 'match' ? '<span class="badge badge-ok">' + (r.approximate ? 'Approximate match' : 'Exact match') + '</span>'
          : r.state === 'varied' ? '<span class="badge badge-teal">varied factor</span>'
          : r.state === 'differs' ? '<span class="badge badge-warn">differs</span>'
          : '<span class="badge badge-unknown">not recorded</span>';
        return '<div class="check-row ' + cls + '" role="row">' +
          '<span class="check-field" role="cell">' + UI.esc(r.label) + '</span>' +
          '<span class="check-val check-a' + (r.aMissing ? ' is-missing' : '') + '" role="cell">' +
            '<span class="check-cell-label">' + UI.esc(c.a || 'Test A') + '</span>' +
            UI.esc(r.a || 'not recorded') + '</span>' +
          '<span class="check-val check-b' + (r.bMissing ? ' is-missing' : '') + '" role="cell">' +
            '<span class="check-cell-label">' + UI.esc(c.b || 'Test B') + '</span>' +
            UI.esc(r.b || 'not recorded') + '</span>' +
          '<span class="check-assess" role="cell">' + badge + '<span class="check-explanation">' + UI.esc(r.explanation) + '</span></span>' +
        '</div>';
      }).join('') +
    '</div></div>';
  }

  function verdictCard(verdict) {
    const positive = verdict.verdict === 'comparable';
    const cls = positive ? 'verdict-ok' : verdict.verdict === 'unsuitable' ? 'verdict-risk' : verdict.verdict === 'incomplete' ? '' : 'verdict-warn';
    const intro = {
      comparable: 'The other indexed conditions pass the prototype check. This does not verify an isolated effect or establish causation.',
      caution: 'Additional differences or unknown fields remain. These records cannot establish an isolated effect of the selected factor.',
      unsuitable: verdict.sameSetting ? 'The selected factor has the same setting in both records. Choose a different pair or factor.' : 'These records do not pass the prototype comparison rules. The analysis below names the conflicting conditions.',
      insufficient: 'The varied condition is not recorded in at least one record. Choose records with that value available.',
      incomplete: 'Choose two distinct experiments above. The condition check will update automatically.'
    }[verdict.verdict] || '';
    return '<div class="verdict ' + cls + '" role="status"><div class="verdict-symbol" aria-hidden="true">' + UI.icon(positive?'check':verdict.verdict==='incomplete'?'compare':'alert',24) + '</div><div class="verdict-content">' +
      '<p class="research-label">Prototype comparison verdict</p><h3>' + UI.esc(verdict.headline) + '</h3><p>' + UI.esc(intro) + '</p>' +
      (verdict.reasons.length ? '<details id="verdict-reasons"><summary>Why this verdict? <span class="muted">' + verdict.reasons.length + ' checks</span></summary><ul class="verdict-reasons">' + verdict.reasons.map((r) => '<li class="verdict-reason">' + UI.icon(r.ok?'check':'alert',15) + '<span>' + UI.esc(r.text) + '</span></li>').join('') + '</ul></details>' : '') + '</div></div>';
  }

  function stepThree() {
    const c = Store.state.compare;
    const a = c.a ? Store.byId(c.a) : null;
    const b = c.b ? Store.byId(c.b) : null;
    const verdict = Matcher.pairVerdict(a, b, c.factor);
    const described = (verdict.verdict === 'comparable' || verdict.verdict === 'caution')
      ? Matcher.describePair(a, b, c.factor) : null;

    return '<section class="step analysis-section" id="condition-analysis" aria-labelledby="step3-title">' +
      '<div class="step-head">' +
        '<span class="step-num">3</span>' +
        '<h2 id="step3-title" tabindex="-1">Condition Match Analysis</h2>' +
        '<span class="step-hint">Tolerance ±' + Math.round(MATCH_RULES.numericTolerance * 100) + '% on numeric conditions</span>' +
      '</div>' +
      '<div class="step-body">' +
        verdictCard(verdict) +
        comparisonSummary(verdict, a, b) +
        checkTable(verdict) +

        (described
          ? '<div class="comparison-outcomes mt-5">' +
              '<div class="card-title"><h3>Recorded difference, in plain English</h3>' +
              '<span class="badge badge-ember">Illustrative observations</span></div>' +
              '<p class="muted mb-4">Demonstration content only. This description is not a verified NASA finding or a causal conclusion.</p>' +
              '<p style="font-size:var(--fs-15)">' + UI.esc(described.sentence) + '</p>' +
              '<p class="muted mt-3" style="font-size:var(--fs-13)">' + UI.esc(described.noClaim) + '</p>' +
              '<div class="row row-wrap mt-4" style="gap:8px">' +
                '<a class="btn btn-sm" href="#/evidence/' + UI.esc(a.id) + '">Evidence for ' + UI.esc(a.id) + '</a>' +
                '<a class="btn btn-sm" href="#/evidence/' + UI.esc(b.id) + '">Evidence for ' + UI.esc(b.id) + '</a>' +
              '</div>' +
            '</div>'
          : verdict.verdict === 'incomplete'
            ? ''
            : '<div class="state state-dashed mt-5">' + UI.icon('close', 26) +
                '<p class="state-title">' + UI.esc(COPY.abstain) + '</p>' +
                '<p>Nothing is reported as a difference here. ' +
                'Where the records do not line up, the honest output of this screen is the reason it cannot: ' +
                'the rows above name every condition that differs or is missing.</p>' +
                '<div class="row row-wrap" style="justify-content:center">' +
                  '<button class="btn btn-sm" data-action="find-fairer">' + UI.icon('search', 14) + ' Find a fairer pair</button>' +
                  '<a class="btn btn-sm btn-ghost" href="#/explorer?coverage=1">Inspect coverage</a>' +
                '</div></div>') +
      '</div>' +
    '</section>';
  }

  function comparisonSummary(verdict, a, b) {
    if (!a || !b) return '';
    const controlled = verdict.rows.filter((row) => row.state !== 'varied');
    const counts = [
      [controlled.filter((r) => r.state === 'match' && !r.approximate).length,'Exact matches','check'],
      [controlled.filter((r) => r.approximate).length,'Approximate matches','ruler'],
      [controlled.filter((r) => r.state === 'differs').length,'Other differences','compare'],
      [controlled.filter((r) => r.state === 'missing').length,'Unknown conditions','alert']
    ];
    return '<div class="condition-totals" aria-label="Supporting condition summary">' + counts.map((n) => '<div>' + UI.icon(n[2],16) + '<strong>' + n[0] + '</strong><span>' + n[1] + '</span></div>').join('') + '</div>' +
      '<p class="comparison-reading"><strong>' + UI.esc(Matcher.factorLabel(Store.state.compare.factor)) + ': </strong>' +
      UI.esc(Matcher.displayValue(Store.state.compare.factor,a[Store.state.compare.factor]) || 'Not recorded') + ' → ' + UI.esc(Matcher.displayValue(Store.state.compare.factor,b[Store.state.compare.factor]) || 'Not recorded') +
      '. ' + (verdict.differs || verdict.missing ? 'Other conditions differ or remain unknown; the selected factor is not isolated.' : 'Review the checked conditions below. A match is not scientific validation.') + '</p>';
  }

  function sidePanel() {
    const c = Store.state.compare;
    const a = c.a ? Store.byId(c.a) : null;
    const b = c.b ? Store.byId(c.b) : null;

    return '<aside class="side-panel" aria-label="Workspace summary">' +
      '<div class="card">' +
        '<div class="card-title"><h3 style="font-size:var(--fs-15)">Varied factor</h3>' +
          '<span class="badge badge-teal">' + UI.esc(Matcher.factorLabel(c.factor)) + '</span></div>' +
        '<p class="muted" style="font-size:var(--fs-13)">' + UI.esc((Matcher.factor(c.factor) || {}).note || '') + '</p>' +
        (a && b && Matcher.factor(c.factor)
          ? '<dl class="kv mt-3"><dt>Test A</dt><dd>' + UI.esc(a[c.factor] === null ? 'not recorded' : Matcher.displayValue(c.factor, a[c.factor])) + '</dd>' +
            '<dt>Test B</dt><dd>' + UI.esc(b[c.factor] === null ? 'not recorded' : Matcher.displayValue(c.factor, b[c.factor])) + '</dd></dl>'
          : '') +
      '</div>' +

      '<div class="card">' +
        '<div class="card-title"><h3 style="font-size:var(--fs-15)">How matching works here</h3></div>' +
        '<ul class="honesty-list" style="gap:10px">' +
          '<li class="honesty-item">' + UI.icon('shield', 15) + '<span>Fuel family, geometry and flow direction must match exactly.</span></li>' +
          '<li class="honesty-item">' + UI.icon('ruler', 15) + '<span>Numeric matches use ' +
            Math.round(MATCH_RULES.numericTolerance * 100) + '% of the higher value. Larger numeric differences may remain as caveats under existing rules.</span></li>' +
          '<li class="honesty-item">' + UI.icon('alert', 15) + '<span>An empty field is unknown, never treated as equal to a recorded value.</span></li>' +
          '<li class="honesty-item">' + UI.icon('close', 15) + '<span>More than ' + MATCH_RULES.maxDiffering + ' differing conditions means no claim at all.</span></li>' +
        '</ul>' +
        '<p class="muted mt-4">Prototype heuristics, not scientifically validated. Ignition, pressure and duration are displayed in records but are not checked by this matcher.</p><a class="btn btn-sm mt-3" href="#/data-notes">Review rule limitations</a>' +
      '</div>' +

      UI.interpretationBlock() +

      '<div class="card">' +
        '<div class="card-title"><h3 style="font-size:var(--fs-15)">Background references</h3></div>' +
        [a, b].filter(Boolean).map((r) =>
          '<div class="source-item" style="padding:12px 0">' +
            '<div><h4>' + UI.esc(r.id) + '</h4><p>' + UI.esc(r.source.report) + '</p></div>' +
            '<div class="row" style="gap:8px">' +
              '<span class="source-ref">' + UI.esc(r.source.ntrs) + '</span>' +
              '<a class="btn btn-sm btn-ghost" href="https://ntrs.nasa.gov/citations/' + UI.esc(r.source.ntrs) + '" target="_blank" rel="noopener" aria-label="Open NTRS record ' + UI.esc(r.source.ntrs) + '">' + UI.icon('external', 13) + '</a>' +
            '</div>' +
          '</div>').join('') +
        '<p class="muted mt-3" style="font-size:var(--fs-12)">These reports provide research context. They do not verify the invented conditions or observations in either record.</p>' +
      '</div>' +
    '</aside>';
  }

  function render(route, container) {
    root = container;
    const p = (route && route.params) || {};
    const invalid = [];
    const requestedFactor = p.factor || p.f;
    if (requestedFactor) {
      if (Matcher.factor(requestedFactor)) Store.state.compare.factor = requestedFactor;
      else { Store.state.compare.factor = 'airflow_cms'; invalid.push('Unknown comparison factor. Airflow is selected instead.'); }
    }
    ['a', 'b'].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(p, key)) {
        Store.state.compare[key] = Store.byId(p[key]) ? p[key] : null;
        if (p[key] && !Store.byId(p[key])) invalid.push('Record ' + p[key] + ' is not in the catalog. Choose a replacement.');
      }
    });
    Store.setCompare({});

    container.innerHTML =
      '<div class="page-head"><div class="wrap page-head-inner">' +
        '<div>' +
          '<p class="eyebrow">Comparison workspace</p>' +
          '<h1>Compare Experiments</h1>' +
          '<p class="lead">Review recorded settings, supporting conditions and the limits of a one-factor comparison.</p>' +
          '<div class="comparison-context"><span class="badge badge-ember">Demonstration data</span><span class="badge badge-teal">Varied factor: ' + UI.esc(Matcher.factorLabel(Store.state.compare.factor)) + '</span><span class="badge">' + UI.esc(Store.state.compare.a || 'Choose Test A') + ' / ' + UI.esc(Store.state.compare.b || 'Choose Test B') + '</span></div>' +
        '</div>' +
        '<a class="btn" href="#/explorer">' + UI.icon('search', 15) + ' Back to the explorer</a>' +
        '<div class="compare-header-result"><span>Current check</span>' + UI.verdictBadge(Matcher.pairVerdict(Store.byId(Store.state.compare.a), Store.byId(Store.state.compare.b), Store.state.compare.factor).verdict) + '<span class="muted">Unvalidated prototype rules</span><button type="button" class="btn btn-sm btn-ghost" data-action="jump-analysis">Review condition analysis ' + UI.icon('chevron',14) + '</button></div>' +
      '</div></div>' +
      '<div class="wrap"><div class="compare-workspace">' +
        '<div>' + (!Store.records().length ? UI.emptyDataState() : '') + (invalid.length ? '<div class="notice notice-warn mb-4" role="status">' + UI.esc(invalid.join(' ')) + '</div>' : '') + stepOne() + stepTwo() + '</div>' +
        '<details class="workspace-reference" id="workspace-reference"><summary>Matching rules &amp; background references</summary>' + sidePanel() + '</details>' +
      '</div></div>';

    bind();
  }

  function rerender() {
    const scrollY = window.scrollY;
    const active = document.activeElement;
    const focusId = active?.id;
    const focusFactor = active?.dataset.factor;
    const focusAction = active?.dataset.action;
    const focusSlot = active?.dataset.slot;
    const opened = [...root.querySelectorAll('details[open][id]')].map((d) => d.id);
    render(null, root);
    opened.forEach((id) => { const disclosure = document.getElementById(id); if (disclosure) disclosure.open = true; });
    Store.setCompare({});
    const c = Store.state.compare;
    history.replaceState(null, '', '#/compare?' + new URLSearchParams({ a: c.a || '', b: c.b || '', factor: c.factor }));
    if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
    else if (focusFactor) root.querySelector('[data-factor="' + focusFactor + '"]')?.focus({ preventScroll: true });
    else if (focusAction) root.querySelector('[data-action="' + focusAction + '"]' + (focusSlot ? '[data-slot="' + focusSlot + '"]' : ''))?.focus({ preventScroll: true });
    window.scrollTo({ top: scrollY, behavior: 'auto' });
  }

  function bind() {
    root.querySelectorAll('[data-factor]').forEach((btn) => {
      btn.addEventListener('click', () => {
        Store.setCompare({ factor: btn.dataset.factor });
        rerender();
        UI.toast('Varied factor set to <strong>' + UI.esc(Matcher.factorLabel(btn.dataset.factor)) + '</strong>. The check re-ran and the other conditions were re-examined.');
      });
    });

    const pickA = root.querySelector('#pick-a');
    const pickB = root.querySelector('#pick-b');
    if (pickA) pickA.addEventListener('change', () => { Store.setCompare({ a: pickA.value || null }); rerender(); });
    if (pickB) pickB.addEventListener('change', () => { Store.setCompare({ b: pickB.value || null }); rerender(); });

    root.querySelectorAll('[data-pair]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [a, b] = btn.dataset.pair.split('|');
        Store.setCompare({ a, b });
        rerender();
        root.querySelector('#step3-title')?.focus();
        UI.toast('Pair loaded. Step 3 shows whether the remaining conditions match.');
      });
    });

    root.querySelectorAll('[data-action="clear-slot"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = btn.dataset.slot;
        Store.setCompare(slot === 'Test A' ? { a: null } : { b: null });
        rerender();
      });
    });
  }

  const actions = {
    'jump-analysis': () => { const heading = root.querySelector('#step3-title'); heading?.focus(); heading?.scrollIntoView({ block: 'start', behavior: 'auto' }); },
    'swap-pair': () => {
      const c = Store.state.compare;
      Store.setCompare({ a: c.b, b: c.a });
      rerender();
      UI.toast('Test A and Test B swapped. The check outcome is unchanged in direction, only in presentation.');
    },
    'clear-pair': () => { Store.setCompare({ a: null, b: null }); rerender(); },
    'find-fairer': () => {
      const c = Store.state.compare;
      const suggestions = Matcher.suggestPairs(c.factor, Store.records(), 5);
      const list = root.querySelector('.suggest-list');
      if (suggestions.length && list && list.scrollIntoView) {
        root.querySelector('#pair-suggestions').open = true;
        list.querySelector('button:not([aria-disabled="true"])')?.focus();
        list.scrollIntoView({ behavior: 'smooth', block: 'center' });
        list.style.outline = '2px solid var(--teal-500)';
        setTimeout(() => { list.style.outline = 'none'; }, 1600);
        UI.toast('Suggested pairs are listed in step 2 — each one is checked against the same rules.');
      } else {
        UI.toast('No pair in the indexed records satisfies the match rules for this factor.', 'warn');
      }
    }
  };

  return { render, actions, rerender };
})();
