/* ==========================================================================
   ui.js — shared visual components
   Small, dependency-free renderers. Each returns an HTML string so page
   modules can compose quickly; event wiring stays in the page modules.
   ========================================================================== */

const UI = (function () {

  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* --------------------------------------------------------------- icons */

  const ICONS = {
    flame: '<path d="M12 3c2.5 3 4.5 5 4.5 8.2A4.5 4.5 0 0 1 12 15.7a4.5 4.5 0 0 1-4.5-4.5C7.5 8 9.5 6 12 3Z"/><path d="M12 21c2.8 0 5-1.9 5-4.6 0-1.5-.7-2.7-1.6-3.7"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    layers: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
    compare: '<path d="M4 7h7M4 17h7M17 4v16M14 8l3-4 3 4M14 16l3 4 3-4"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M19 18v3H6.5"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    chevronDown: '<path d="m5 9 7 7 7-7"/>',
    alert: '<path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4M12 17.2v.1"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.1"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10"/>',
    videoOff: '<path d="M4 6.5h11v11H4z"/><path d="m15 11 5-3v8l-5-3"/><path d="M2.5 2.5 21.5 21.5"/>',
    layersOff: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/><path d="M3 3l18 18"/>',
    spark: '<path d="M4 17c3-8 5-3 7.5-9S16 12 20 6"/>',
    gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-5"/>',
    ruler: '<path d="M3 9h18v6H3z"/><path d="M7 9v3M11 9v3M15 9v3M19 9v3"/>',
    tag: '<path d="M12.5 3H20v7.5L11 19.5 3.5 12 12.5 3Z"/><path d="M16.5 7.5v.1"/>',
    shield: '<path d="M12 3.5 5 6v6c0 4 3 6.6 7 8.5 4-1.9 7-4.5 7-8.5V6l-7-2.5Z"/><path d="m9 12 2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'
  };

  function icon(name, size, cls) {
    const p = ICONS[name] || ICONS.info;
    const s = size || 16;
    return '<svg class="' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }

  /** The product mark: a duct cross-section with a flame inside it. */
  function brandMark(size) {
    const s = size || 30;
    return '<svg class="brand-mark" width="' + s + '" height="' + s + '" viewBox="0 0 32 32" aria-hidden="true">' +
      '<rect x="3" y="3" width="26" height="26" rx="7" fill="#0f1a2c" stroke="#2a3a5c"/>' +
      '<path d="M6.5 21h19" stroke="#1e2b45" stroke-width="1.4"/>' +
      '<path d="M16 23c0 0-5.5-4-5.5-9 0-3.2 2.4-5.6 5.5-8.6 3.1 3 5.5 5.4 5.5 8.6 0 5-5.5 9-5.5 9Z" fill="none" stroke="#edaa4a" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M16 20.4c0 0-2.6-2.2-2.6-4.8 0-1.6 1.1-2.8 2.6-4.4 1.5 1.6 2.6 2.8 2.6 4.4 0 2.6-2.6 4.8-2.6 4.8Z" fill="#edaa4a" opacity=".5"/>' +
      '</svg>';
  }

  /* -------------------------------------------------- media placeholders */

  /**
   * The prototype does not stream NASA video. Rather than showing a broken
   * player, it draws a labelled schematic and states what is missing.
   */
  function mediaPlaceholder(record, opts) {
    const o = opts || {};
    const kind = record.media ? record.media.kind : 'none';

    if (kind === 'none') {
      return '<div class="media-canvas" role="img" aria-label="No media indexed for this record">' +
        '<div style="text-align:center;color:var(--tx-3)">' + icon('videoOff', 30) +
        '<p class="mt-3" style="font-size:var(--fs-13)">No media indexed for this run</p></div></div>';
    }

    const airLabel = record.airflow_cms === null || record.airflow_cms === undefined ? '—' : record.airflow_cms + ' cm/s';
    const oxyLabel = record.oxygen_pct === null || record.oxygen_pct === undefined ? '—' : record.oxygen_pct + '% O2';
    const svg =
      '<svg viewBox="0 0 480 270" width="100%" height="100%" role="img" ' +
      'aria-label="Schematic duct diagram for record ' + esc(record.id) + '">' +
      '<defs><linearGradient id="flameFill" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0%" stop-color="#edaa4a" stop-opacity=".5"/>' +
      '<stop offset="100%" stop-color="#edaa4a" stop-opacity=".04"/></linearGradient></defs>' +
      '<path d="M20 40h440M20 232h440" stroke="#253352" stroke-width="1.5" stroke-dasharray="6 6"/>' +
      '<text x="24" y="30" fill="#64718a" font-family="monospace" font-size="10">DUCT WALL (SCHEMATIC)</text>' +
      '<text x="24" y="252" fill="#64718a" font-family="monospace" font-size="10">FLOW DIRECTION</text>' +
      '<rect x="150" y="150" width="200" height="13" rx="3" fill="#253352"/>' +
      '<text x="150" y="182" fill="#8593ab" font-family="monospace" font-size="10">SAMPLE - ' +
        esc(String(record.geometry || '').toUpperCase()) + '</text>' +
      '<path d="M178 150c-8-16-10-34 4-46 12-11 26-4 30 10 3 11-4 18-10 24-6 6-8 10-6 12Z" ' +
        'fill="url(#flameFill)" stroke="#edaa4a" stroke-width="1.4"/>' +
      '<path d="M198 150c-4-9-4-19 4-25 7-5 14 0 15 8 1 8-6 14-11 17Z" fill="#edaa4a" opacity=".4"/>' +
      '<g stroke="#3ed6c4" stroke-width="1.2" fill="none" opacity=".7">' +
      '<path d="M60 120h50M60 96h34M60 144h42"/>' +
      '<path d="m112 120-7-4v8l7-4Z" fill="#3ed6c4"/>' +
      '</g>' +
      '<text x="60" y="86" fill="#3ed6c4" font-family="monospace" font-size="10">' + esc(airLabel) + '</text>' +
      '<text x="330" y="86" fill="#8593ab" font-family="monospace" font-size="10">' + esc(oxyLabel) + '</text>' +
      '</svg>';

    return '<div class="media-canvas">' +
      '<div style="position:absolute;inset:0;display:grid;place-items:center;padding:8px">' + svg + '</div>' +
      '<span class="badge badge-ember media-badge">' + esc(COPY.demoTag) + ' SCHEMATIC</span>' +
      (o.showPlay
        ? '<span class="badge media-badge" style="left:auto;right:12px;top:12px">' +
          icon('videoOff', 12) + ' original media unavailable</span>'
        : '') +
      '</div>';
  }

  /* --------------------------------------------------------------- badges */

  const OUTCOME_STYLE = {
    spread: { label: 'Spread', cls: 'badge-ember' },
    extinction: { label: 'Extinction', cls: 'badge-risk' },
    'no-ignition': { label: 'No ignition', cls: 'badge-unknown' },
    transition: { label: 'Behaviour change', cls: 'badge-warn' }
  };

  function outcomeBadge(type) {
    const s = OUTCOME_STYLE[type] || { label: type, cls: '' };
    return '<span class="badge ' + s.cls + '">' + esc(s.label) + '</span>';
  }

  function verdictBadge(verdict) {
    const map = {
      comparable: { cls: 'badge-ok', label: 'Comparable' },
      caution: { cls: 'badge-warn', label: 'Comparable · caveats' },
      unsuitable: { cls: 'badge-risk', label: 'Not comparable' },
      insufficient: { cls: 'badge-unknown', label: 'Not enough data' },
      incomplete: { cls: 'badge', label: 'Awaiting selection' }
    };
    const s = map[verdict] || map.incomplete;
    return '<span class="badge ' + s.cls + '">' + s.label + '</span>';
  }

  function missingCount(record) {
    const n = Store.countMissing(record);
    if (n === 0) return '<span class="badge badge-ok">' + icon('check', 12) + ' all fields recorded</span>';
    return '<span class="badge badge-unknown">' + n + ' field' + (n > 1 ? 's' : '') + ' missing</span>';
  }

  function reviewedBadge(record) {
    return record.metadataReviewed
      ? '<span class="badge badge-teal">' + icon('check', 12) + ' demo metadata checked</span>'
      : '<span class="badge badge-warn">' + icon('alert', 12) + ' demo review pending</span>';
  }

  function completeness(record) {
    const total = Store.COMPARABLE_KEYS.length;
    const missing = Store.countMissing(record);
    const pct = Math.round(((total - missing) / total) * 100);
    const cls = pct >= 90 ? '' : pct >= 60 ? 'meter-fill-warn' : 'meter-fill-risk';
    return '<div class="completeness" title="Comparable fields recorded for this test">' +
      '<div class="meter" style="width:64px"><div class="meter-fill ' + cls + '" style="width:' + pct + '%"></div></div>' +
      '<span>' + (total - missing) + ' of ' + total + ' fields</span></div>';
  }

  /* ---------------------------------------------------------- record card */

  function condValue(record, key) {
    const raw = record[key];
    const missing = raw === null || raw === undefined || raw === '';
    const label = CONDITION_LABELS[key] || key;
    if (missing) {
      return '<div class="cond"><div class="cond-label">' + esc(label) + '</div>' +
        '<div class="cond-value is-missing">not recorded</div></div>';
    }
    return '<div class="cond"><div class="cond-label">' + esc(label) + '</div>' +
      '<div class="cond-value">' + esc(Matcher.displayValue(key, raw)) + '</div></div>';
  }

  const CARD_KEYS = ['fuel', 'geometry', 'thickness_mm', 'oxygen_pct', 'airflow_cms', 'flow_direction'];

  function recordCard(record, opts) {
    const o = opts || {};
    const selected = (Store.state.picked || []).includes(record.id);
    return '<article class="record-card' + (selected ? ' is-selected' : '') + '" data-record="' + esc(record.id) + '" ' +
      'aria-labelledby="title-' + esc(record.id) + '">' +
      '<div class="record-card-top">' +
        '<div>' +
          '<div class="record-identity-line"><span class="record-id">' + esc(record.id) + '</span><span class="badge badge-ember">Demonstration</span></div>' +
          '<h3 id="title-' + esc(record.id) + '">' +
            '<a href="#/record/' + esc(record.id) + '">' + esc(record.title) + '</a>' +
          '</h3>' +
          '<p class="record-sub">Session ' + esc(record.session) + ' · ' + esc(record.run) + '</p>' +
        '</div>' +
        '<div class="tag-row" style="justify-content:flex-end">' +
          (record.outcomes || []).slice(0, 2).map((oc) => outcomeBadge(oc.type)).join('') +
        '</div>' +
      '</div>' +
      '<div class="cond-grid">' + ['oxygen_pct', 'airflow_cms', 'thickness_mm', 'fuel', 'geometry', 'flow_direction'].map((k) => condValue(record, k)).join('') + '</div>' +
      '<p class="observation-preview"><span>Illustrative observation</span> · ' + esc(record.outcomes?.[0]?.label || 'Not recorded') + '</p>' +
      '<div class="record-foot">' +
        '<div class="tag-row record-metadata-status">' + missingCount(record) + reviewedBadge(record) + '</div>' +
        '<div class="record-actions">' +
          (o.hidePick ? '' :
            '<button class="btn btn-sm" data-pick="' + esc(record.id) + '" aria-pressed="' + selected + '">' +
              icon(selected ? 'check' : 'compare', 14) + (selected ? 'Selected · remove' : 'Select to compare') +
            '</button>') +
          '<a class="btn btn-sm" href="#/record/' + esc(record.id) + '">View record ' + icon('chevron', 14) + '</a>' +
          '<a class="btn btn-sm btn-ghost" href="#/evidence/' + esc(record.id) + '">Inspect evidence</a>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* --------------------------------------------------------- state blocks */

  function state(opts) {
    const o = opts || {};
    return '<div class="state' + (o.dashed ? ' state-dashed' : '') + (o.inline ? ' state-inline' : '') + '"' +
      ' role="' + (o.role || 'status') + '">' +
      icon(o.icon || 'layersOff', o.inline ? 22 : 30) +
      '<p class="state-title">' + esc(o.title || 'Nothing here') + '</p>' +
      (o.message ? '<p>' + o.message + '</p>' : '') +
      (o.action ? '<div class="mt-2">' + o.action + '</div>' : '') +
      '</div>';
  }

  function emptyDataState() {
    return state({
      icon: 'layersOff',
      title: 'No records loaded',
      message:
        'The catalog is empty in this state. In the finished product this screen reads the reviewed BASS-II catalog from the backend; ' +
        'here it shows what the interface does when a dataset is not available yet.',
      action: '<button class="btn btn-primary" data-action="load-demo">Load demonstration records</button>'
    });
  }

  function noResultsState() {
    const chips = Store.activeFilterChips();
    return state({
      icon: 'search',
      title: 'No records match the current filters',
      message:
        (chips.length ? 'Active filters: ' + esc(chips.map((c) => c.label).join(' · ')) + '. ' : '') +
        'Try removing a condition or resetting your filters. This gap describes only the illustrative catalog; it is not a finding about NASA research.',
      action: '<div class="row row-wrap" style="justify-content:center">' +
        '<button class="btn btn-sm" data-action="widen">Widen the filters</button>' +
        '<button class="btn btn-sm btn-ghost" data-action="clear-filters">Clear all filters</button></div>'
    });
  }

  function skeletonList(n) {
    const rows = [];
    for (let i = 0; i < (n || 3); i++) {
      rows.push('<div class="card" aria-hidden="true" style="padding:20px">' +
        '<div class="skeleton skeleton-line" style="width:32%"></div>' +
        '<div class="skeleton skeleton-line" style="width:64%;height:16px"></div>' +
        '<div class="skeleton skeleton-line" style="width:100%;height:44px;margin-bottom:0"></div>' +
        '</div>');
    }
    return '<div class="results-list" role="status" aria-live="polite">' +
      '<span class="sr-only">Loading records</span>' + rows.join('') + '</div>';
  }

  /* --------------------------------------------------------------- toasts */

  function toast(message, kind) {
    let region = document.querySelector('.toast-region');
    if (!region) {
      region = document.createElement('div');
      region.className = 'toast-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.style.borderLeftColor =
      kind === 'warn' ? 'var(--st-warn)' : kind === 'risk' ? 'var(--st-risk)' : 'var(--teal-500)';
    el.innerHTML = message;
    region.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 240ms'; }, 2600);
    setTimeout(() => el.remove(), 3000);
  }

  /* -------------------------------------------------------------- helpers */

  function dataCaveatStrip() {
    return '<div class="notice-bar"><div class="wrap"><div class="notice">' +
      '<span class="dot dot-ember"></span>' +
      '<p><strong>Demonstration data.</strong> Illustrative records. NASA experiment data is not yet integrated. <a href="#/data-notes">Review data status</a></p>' +
      '</div></div></div>';
  }

  /** One focus trap for transient overlays. Returns a cleanup function. */
  function trapFocus(panel, dismiss) {
    function keydown(e) {
      if (e.key === 'Escape') { e.preventDefault(); dismiss(); return; }
      if (e.key !== 'Tab') return;
      const items = [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]')]
        .filter((el) => el.getClientRects().length && el.getAttribute('aria-disabled') !== 'true');
      if (!items.length) { e.preventDefault(); panel.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }

  async function copyText(value, success) {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      toast(success || 'Copied.');
    } catch (e) { toast('Clipboard access is unavailable. Select and copy the visible text instead.', 'warn'); }
  }

  function factorChips(record) {
    return FACTORS.map((f) => {
      const missing = Store.isMissing(record, f.key);
      return '<span class="pill' + (missing ? ' pill-missing' : '') + '">' +
        '<span class="factor-tag">' + esc(f.label) + '</span>' +
        esc(missing ? 'not recorded' : Matcher.displayValue(f.key, record[f.key])) +
        '</span>';
    }).join('');
  }

  /** Recorded vs proposed: kept visually distinct everywhere it appears. */
  function interpretationBlock() {
    return '<div class="concept-panel">' +
      '<h4>' + icon('spark', 13) + ' Proposed interpretation (not implemented)</h4>' +
      '<p>The build guide describes machine-learning retrieval and computer-vision measurements in later stages. ' +
      'Neither is trained or running in this prototype, so no ranking score, measured flame dimension or accuracy figure is shown.</p>' +
      '<div class="concept-stub mt-3">Model output would appear here once labels are verified</div>' +
      '</div>';
  }

  return {
    esc, icon, brandMark, mediaPlaceholder, outcomeBadge, verdictBadge, missingCount,
    reviewedBadge, completeness, recordCard, condValue, state, emptyDataState,
    noResultsState, skeletonList, toast, dataCaveatStrip,
    factorChips, interpretationBlock, trapFocus, copyText, CARD_KEYS, OUTCOME_STYLE
  };
})();
