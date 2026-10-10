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
    return '<section class="step" aria-labelledby="step1-title">' +
      '<div class="step-head">' +
        '<span class="step-num">1</span>' +
        '<h2 id="step1-title">Choose the factor to compare</h2>' +
      '</div>' +
      '<div class="step-body">' +
        '<p dir="auto" style="font-size:var(--fs-14);max-width:80ch">' +
          'Choose the factor of interest. The check reviews the other indexed conditions and exposes any remaining differences. ' +
          'Only values that exist in the indexed records are offered.</p>' +
        '<div class="factor-grid mt-4">' +
          FACTORS.map((f) => {
            const e = factorEvidenceLine(f.key);
            const usable = e.pairs > 0;
            return '<button class="radio-card factor-radio" data-factor="' + f.key + '" aria-pressed="' + (current === f.key) + '">' +
              '<span class="radio-mark" aria-hidden="true"></span>' +
              '<span>' +
                '<span class="radio-card-title">' + f.label + (f.unit ? ' <span class="muted" style="font-weight:400;font-size:var(--fs-12)">' + f.unit + '</span>' : '') + '</span>' +
                '<span class="radio-card-desc">' + f.note + '</span>' +
                '<span class="radio-card-desc" style="color:' + (usable ? 'var(--teal-300)' : 'var(--st-warn)') + '">' +
                  (usable ? e.text : 'No fair pair in this dataset yet') + '</span>' +
              '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function recordOptions(selectedId) {
    return '<option value="">— choose a test —</option>' +
      Store.records().map((r) =>
        '<option value="' + UI.esc(r.id) + '"' + (selectedId === r.id ? ' selected' : '') + '>' +
          UI.esc(r.id + ' · ' + r.title) + '</option>').join('');
  }

  function slotHTML(label, id, hint) {
    const r = id ? Store.byId(id) : null;
    return '<div class="pair-slot' + (r ? ' is-filled' : '') + '">' +
      '<div class="pair-slot-label">' + label + '</div>' +
      (r
        ? '<div>' +
            '<div class="record-id">' + UI.esc(r.id) + '</div>' +
            '<h4 class="mt-1" style="color:var(--tx-1);font-size:var(--fs-15)">' + UI.esc(r.title) + '</h4>' +
            '<span class="badge badge-ember mt-3">Demonstration record</span>' +
            '<div class="pair-factor"><span>' + UI.esc(Matcher.factorLabel(Store.state.compare.factor)) + ' · varied factor</span><strong>' + UI.esc(Matcher.displayValue(Store.state.compare.factor, r[Store.state.compare.factor]) || 'Not recorded') + '</strong></div>' +
            '<div class="cond-grid">' + UI.CARD_KEYS.filter((k) => k !== Store.state.compare.factor).map((k) => UI.condValue(r, k)).join('') + '</div>' +
            '<p class="pair-observation"><span class="muted">Illustrative observation</span><br>' + UI.esc(r.outcomes?.[0]?.label || 'Not recorded') + '</p>' +
            '<div class="tag-row mt-3">' + UI.completeness(r) + UI.missingCount(r) + '</div>' +
            '<div class="row mt-3" style="gap:8px">' +
              '<a class="btn btn-sm btn-ghost" href="#/record/' + UI.esc(r.id) + '">Open record</a>' +
              '<a class="btn btn-sm" href="#/evidence/' + UI.esc(r.id) + '">Inspect evidence</a>' +
              '<button class="btn btn-sm btn-ghost" data-action="clear-slot" data-slot="' + label + '">Remove</button>' +
            '</div>' +
          '</div>'
        : '<p class="muted" style="font-size:var(--fs-13)">' + hint + '</p>') +
    '</div>';
  }

  function stepTwo() {
    const c = Store.state.compare;
    const suggestions = Matcher.suggestPairs(c.factor, Store.records(), 5);
    const evidence = Matcher.factorEvidence(c.factor, Store.records());

    return '<section class="step" aria-labelledby="step2-title">' +
      '<div class="step-head">' +
        '<span class="step-num">2</span>' +
        '<h2 id="step2-title">Pick two tests</h2>' +
        '<span class="step-hint">' + Matcher.factorLabel(c.factor) + ' is the varied factor</span>' +
      '</div>' +
      '<div class="step-body">' +
        (evidence.canCompare ? '' :
          '<div class="notice notice-warn mb-4">' + UI.icon('alert', 16) +
            '<div><span class="notice-title">No fair pair exists for ' + Matcher.factorLabel(c.factor).toLowerCase() + ' in this dataset.</span>' +
            '<p class="mt-1">' + UI.esc(evidence.reason) + ' You can still inspect any two records below — step 3 will state exactly why they do not form a controlled comparison.</p></div></div>') +
        '<div class="pair-grid">' +
          slotHTML('Test A', c.a, 'Select a test to place it here.') +
          slotHTML('Test B', c.b, 'Select a second test to compare against.') +
        '</div>' +
        '<div class="grid grid-2 mt-4" style="gap:16px">' +
          '<div class="field">' +
            '<label class="field-label" for="pick-a">Test A<span class="field-hint">from the indexed catalog</span></label>' +
            '<select class="select" id="pick-a">' + recordOptions(c.a) + '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label class="field-label" for="pick-b">Test B<span class="field-hint">from the indexed catalog</span></label>' +
            '<select class="select" id="pick-b">' + recordOptions(c.b) + '</select>' +
          '</div>' +
        '</div>' +
        '<div class="row mt-4" style="gap:8px">' +
          '<button class="btn btn-sm" data-action="swap-pair">' + UI.icon('compare', 14) + ' Swap A and B</button>' +
          '<button class="btn btn-sm btn-ghost" data-action="clear-pair">Clear selection</button>' +
          '<a class="btn btn-sm btn-ghost" href="#/explorer">Choose from the explorer instead ' + UI.icon('chevron', 13) + '</a>' +
        '</div>' +

        '<hr>' +
        '<div class="row-between" style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;flex-wrap:wrap">' +
          '<h3 style="font-size:var(--fs-15)">Suggested pairs</h3>' +
          '<span class="muted" style="font-size:var(--fs-12)">Rule-based ranking — the proposed ML retrieval is not implemented</span>' +
        '</div>' +
        (suggestions.length
          ? '<div class="suggest-list mt-3">' + suggestions.map(suggestItem).join('') + '</div>'
          : UI.state({
              dashed: true,
              inline: true,
              icon: 'layersOff',
              title: 'No suggested pair for ' + Matcher.factorLabel(c.factor).toLowerCase(),
              message: UI.esc(evidence.reason) + ' Nearest-neighbour retrieval is a proposed feature, not one that is running here, so the interface does not invent a substitute pair.'
            })) +
      '</div>' +
    '</section>';
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
    const cls = verdict.verdict === 'comparable' ? 'verdict-ok'
      : verdict.verdict === 'caution' ? 'verdict-warn'
      : verdict.verdict === 'unsuitable' ? 'verdict-risk'
      : verdict.verdict === 'incomplete' ? '' : 'verdict-warn';

    const intro = {
      comparable: 'The pair passes the current prototype matching rules. This is not scientific verification or evidence of causation.',
      caution: 'The existing rules accept this pair with limitations. Remaining differences or unknown fields prevent attributing the outcome to the selected factor alone.',
      unsuitable: 'These two tests differ in more than the chosen factor, so the interface does not describe a difference.',
      insufficient: 'A value needed for this comparison is not present in the records.',
      incomplete: 'Choose two tests above and the check runs automatically.'
    }[verdict.verdict] || '';

    return '<div class="verdict ' + cls + '">' +
      '<h3>' + (verdict.verdict === 'comparable' ? UI.icon('check', 18)
        : verdict.verdict === 'caution' ? UI.icon('alert', 18)
        : verdict.verdict === 'incomplete' ? UI.icon('compare', 18) : UI.icon('close', 18)) +
        UI.esc(verdict.headline) + '</h3>' +
      '<p>' + UI.esc(intro) + '</p>' +
      (verdict.reasons.length
        ? '<ul class="verdict-reasons">' + verdict.reasons.map((r) =>
            '<li class="verdict-reason">' + (r.ok ? UI.icon('check', 15) : UI.icon('close', 15)) +
            '<span' + (r.ok ? '' : ' style="color:var(--tx-2)"') + '>' + UI.esc(r.text) + '</span></li>').join('') + '</ul>'
        : '') +
    '</div>';
  }

  function stepThree() {
    const c = Store.state.compare;
    const a = c.a ? Store.byId(c.a) : null;
    const b = c.b ? Store.byId(c.b) : null;
    const verdict = Matcher.pairVerdict(a, b, c.factor);
    const described = (verdict.verdict === 'comparable' || verdict.verdict === 'caution')
      ? Matcher.describePair(a, b, c.factor) : null;

    return '<section class="step" aria-labelledby="step3-title">' +
      '<div class="step-head">' +
        '<span class="step-num">3</span>' +
        '<h2 id="step3-title">Condition match analysis</h2>' +
        '<span class="step-hint">Tolerance ±' + Math.round(MATCH_RULES.numericTolerance * 100) + '% on numeric conditions</span>' +
      '</div>' +
      '<div class="step-body">' +
        verdictCard(verdict) +
        checkTable(verdict) +

        (described
          ? '<div class="card card-lg mt-5" style="border-left:3px solid var(--ember-400)">' +
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
          '<h1>Compare two experiments</h1>' +
          '<p class="lead">Choose a factor, select two records and inspect every condition. The prototype check lists differences and states when a comparison is unsupported.</p>' +
          '<div class="comparison-context"><span class="badge badge-ember">Demonstration data</span><span class="badge badge-teal">Varied factor: ' + UI.esc(Matcher.factorLabel(Store.state.compare.factor)) + '</span><span class="badge">' + UI.esc(Store.state.compare.a || 'Choose Test A') + ' / ' + UI.esc(Store.state.compare.b || 'Choose Test B') + '</span></div>' +
        '</div>' +
        '<a class="btn" href="#/explorer">' + UI.icon('search', 15) + ' Back to the explorer</a>' +
      '</div></div>' +
      '<div class="wrap"><div class="compare-grid">' +
        '<div>' + (!Store.records().length ? UI.emptyDataState() : '') + (invalid.length ? '<div class="notice notice-warn mb-4" role="status">' + UI.esc(invalid.join(' ')) + '</div>' : '') + stepOne() + stepTwo() + stepThree() + '</div>' +
        sidePanel() +
      '</div></div>';

    bind();
  }

  function rerender() {
    const scrollY = window.scrollY;
    const active = document.activeElement;
    const focusId = active?.id;
    const focusFactor = active?.dataset.factor;
    render(null, root);
    Store.setCompare({});
    const c = Store.state.compare;
    history.replaceState(null, '', '#/compare?' + new URLSearchParams({ a: c.a || '', b: c.b || '', factor: c.factor }));
    if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
    else if (focusFactor) root.querySelector('[data-factor="' + focusFactor + '"]')?.focus({ preventScroll: true });
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
