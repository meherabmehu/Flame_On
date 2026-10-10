/* ==========================================================================
   pages/explorer.js — experiment explorer
   Search + metadata filters over indexed records, with facet counts that
   respect the other filters, an explicit coverage matrix, and a two-slot
   hand-off into the comparison workspace.
   ========================================================================== */

const ExplorerPage = (function () {
  let root = null;
  let searchTimer = null;
  let releaseTrap = null;
  let showCoverage = false;
  let filtersOpen = false;   // mobile filter drawer
  let coverageView = 'oxygen-airflow';

  const COVERAGE_VIEWS = {
    'oxygen-airflow': ['oxygen_pct', 'airflow_cms', 'Oxygen vs Airflow'],
    'fuel-shape': ['fuel', 'geometry', 'Fuel vs Shape'],
    'thickness-airflow': ['thickness_mm', 'airflow_cms', 'Thickness vs Airflow']
  };

  function referenceHeatmap() {
    const [rowKey, colKey, title] = COVERAGE_VIEWS[coverageView];
    const grid = Matcher.coverageGrid(rowKey, colKey);
    const label = (key, value) => value === null ? 'Not recorded' : Matcher.displayValue(key, value);
    return '<div class="coverage-display"><nav class="coverage-views" aria-label="Coverage axes"><span class="research-label">View by</span>' +
      Object.entries(COVERAGE_VIEWS).map(([key, view]) => '<button type="button" class="btn" data-coverage-view="' + key + '" aria-pressed="' + (key === coverageView) + '">' + UI.icon('grid', 15) + UI.esc(view[2]) + '</button>').join('') +
      '<p class="notice notice-ember">Demonstration data only. A missing catalog combination does not mean NASA never performed such tests.</p></nav>' +
      '<section class="coverage-chart" aria-labelledby="coverage-chart-title"><h3 id="coverage-chart-title">' + title + ' Coverage</h3><p class="matrix-axis-note">Counts of existing repository records with both axis values recorded. Unknown axis values are excluded.</p>' +
      '<div class="matrix-scroll"><table class="matrix" aria-label="' + title + ' indexed record counts"><thead><tr><th scope="col">' + UI.esc(CONDITION_LABELS[rowKey]) + '</th>' +
      grid.cols.map((value) => '<th scope="col">' + UI.esc(label(colKey, value)) + '</th>').join('') + '</tr></thead><tbody>' +
      grid.grid.map((row) => '<tr><th scope="row">' + UI.esc(label(rowKey, row.value)) + '</th>' + row.cells.map((cell) => {
        const detail = label(rowKey, row.value) + ' / ' + label(colKey, cell.value) + ': ' + cell.count + ' indexed demonstration records' + (cell.ids.length ? ' — ' + cell.ids.join(', ') : '. Catalog gap; not a zero experimental result');
        return '<td class="cov-' + Math.min(cell.count, 3) + '"><button type="button" data-heatmap-row="' + rowKey + '" data-heatmap-col="' + colKey + '" data-heatmap-row-value="' + UI.esc(row.value) + '" data-heatmap-col-value="' + UI.esc(cell.value) + '" data-coverage-detail="' + UI.esc(detail) + '" aria-label="' + UI.esc(detail + '. Filter this combination.') + '" aria-describedby="coverage-cell-detail">' + (cell.count || '—') + '</button></td>';
      }).join('') + '</tr>').join('') + '</tbody></table></div></section></div>';
  }

  /* ------------------------------------------------------------------ view */

  function rangeField(key, label, band, bounds, unit, recordedValues) {
    return '<div class="filter-group">' +
      '<div class="filter-group-title">' + label +
        '<span class="filter-count">' + (band.min === null && band.max === null ? 'any' : 'limited') + '</span>' +
      '</div>' +
      '<p class="filter-sub">Recorded range: ' + bounds.min + '–' + bounds.max + ' ' + unit + '</p>' +
      '<div class="row" style="gap:8px">' +
        '<input class="input" type="number" step="any" inputmode="decimal" data-band="' + key + '" data-bound="min" ' +
          'placeholder="min" aria-label="' + label + ' minimum" value="' + (band.min === null ? '' : band.min) + '" ' +
          'min="' + bounds.min + '" max="' + bounds.max + '">' +
        '<input class="input" type="number" step="any" inputmode="decimal" data-band="' + key + '" data-bound="max" ' +
          'placeholder="max" aria-label="' + label + ' maximum" value="' + (band.max === null ? '' : band.max) + '" ' +
          'min="' + bounds.min + '" max="' + bounds.max + '">' +
      '</div>' +
      '<div class="row row-wrap mt-2" style="gap:6px">' +
        recordedValues.map((v) =>
          '<button type="button" class="pill" data-quickband="' + key + '" data-value="' + v + '" aria-pressed="' + (band.min === v && band.max === v) + '" style="cursor:pointer;background:transparent">' +
            v + ' ' + unit + '</button>').join('') +
      '</div>' +
    '</div>';
  }

  function checkGroup(key, label, values, counts, selected) {
    if (!values.length) {
      return '<div class="filter-group"><div class="filter-group-title">' + label + '</div>' +
        '<p class="missing-note">No recorded values in the current dataset</p></div>';
    }
    return '<div class="filter-group">' +
      '<div class="filter-group-title">' + label +
        '<span class="filter-count" data-count-key="' + key + '">' + selected.length + ' selected</span>' +
      '</div>' +
      values.map((v) => {
        const c = counts[v] || 0;
        const disabled = c === 0 && !selected.includes(v);
        return '<label class="check"' + (disabled ? ' style="opacity:.45"' : '') + '>' +
          '<input type="checkbox" data-filter="' + key + '" value="' + UI.esc(v) + '"' +
            (selected.includes(v) ? ' checked' : '') + (disabled ? ' disabled' : '') + '>' +
          '<span style="flex:1">' + UI.esc(key === 'geometry' ? GEOMETRY_LABELS[v] : v) +
            '<span class="muted" style="font-size:var(--fs-12)" data-facet="' + key + '" data-value="' + UI.esc(v) + '"> · ' + c + '</span>' +
          '</span>' +
        '</label>';
      }).join('') +
    '</div>';
  }

  function filtersHTML() {
    const f = Store.state.filters;
    const oxyBounds = Store.numericBounds('oxygen_pct');
    const airBounds = Store.numericBounds('airflow_cms');
    const thBounds = Store.numericBounds('thickness_mm');

    const missingValue = '<div class="filter-group">' +
      '<div class="filter-group-title">Data completeness</div>' +
      '<p class="filter-sub">Empty comparable fields are never treated as equal values.</p>' +
      '<label class="check"><input type="radio" name="missing" data-missing="include"' +
        (f.missingData === 'include' ? ' checked' : '') + '><span>Include everywhere</span></label>' +
      '<label class="check"><input type="radio" name="missing" data-missing="exclude"' +
        (f.missingData === 'exclude' ? ' checked' : '') + '><span>Only complete records</span></label>' +
      '<label class="check"><input type="radio" name="missing" data-missing="only"' +
        (f.missingData === 'only' ? ' checked' : '') + '><span>Only records with gaps</span></label>' +
      '<label class="check mt-2"><input type="checkbox" id="reviewed-only"' +
        (f.reviewedOnly ? ' checked' : '') + '><span>Demo metadata checked only</span></label>' +
    '</div>';

    return '<form class="filters' + (filtersOpen ? ' is-open' : '') + '" id="filters" aria-label="Experiment filters">' +
      '<div class="filters-scroll">' +
        '<div class="filter-group-title">Recorded conditions<button type="button" class="btn-icon filter-dismiss" data-action="close-filters" aria-label="Close filters">' + UI.icon('close', 18) + '</button></div>' +
        checkGroup('fuel', 'Fuel / material', Store.valuesFor('fuel'), Store.facetCounts('fuel'), f.fuel) +
        checkGroup('geometry', 'Sample geometry', Store.valuesFor('geometry'), Store.facetCounts('geometry'), f.geometry) +
        rangeField('oxygen', 'Oxygen', f.oxygen, oxyBounds, '% O₂', Store.valuesFor('oxygen_pct')) +
        rangeField('airflow', 'Airflow', f.airflow, airBounds, 'cm/s', Store.valuesFor('airflow_cms')) +
        rangeField('thickness', 'Thickness', f.thickness, thBounds, 'mm', Store.valuesFor('thickness_mm')) +
        '<details class="advanced-filters"' + (f.flow_direction.length || f.missingData !== 'include' || f.reviewedOnly ? ' open' : '') + '><summary>More recorded conditions</summary>' +
        checkGroup('flow_direction', 'Flow direction', Store.valuesFor('flow_direction'), Store.facetCounts('flow_direction'), f.flow_direction) + missingValue + '</details>' +
      '</div>' +
      '<div class="panel-foot" style="display:flex;gap:8px;justify-content:space-between;align-items:center">' +
        '<button class="link-quiet" type="button" data-action="clear-filters">Clear all</button>' +
        '<span class="muted" style="font-size:var(--fs-12)">' + Store.records().length + ' records loaded</span>' +
      '</div>' +
    '</form>';
  }

  function selectionBarHTML() {
    const picked = Store.state.picked.map((id) => Store.byId(id)).filter(Boolean);
    if (!picked.length) return '';
    return '<div class="notice notice-teal selection-tray" style="align-items:center">' +
      '<span class="dot dot-teal"></span>' +
      '<div style="flex:1">' +
        '<span class="notice-title">Compare selection <span class="tray-count">' + picked.length + '/2</span></span> ' +
        '<span class="muted">' + (picked.length === 1 ? 'Choose one more distinct record.' : 'Ready to check the conditions.') + '</span>' +
        '<div class="selection-records">' + picked.map((p, i) => '<button class="btn btn-sm" data-pick="' + p.id + '" aria-label="Remove ' + p.id + ' from comparison"><span class="tray-slot">' + (i ? 'B' : 'A') + '</span>' + p.id + ' ' + UI.icon('close', 14) + '</button>').join('') + '</div>' +
      '</div>' +
      '<div class="row" style="gap:8px">' +
        '<button class="btn btn-sm btn-primary" data-action="compare-picked"' +
          (picked.length < 2 ? ' disabled' : '') + '>Compare selected ' + UI.icon('chevron', 14) + '</button>' +
        '<button class="btn btn-sm btn-ghost" data-action="clear-pick">Clear</button>' +
      '</div>' +
    '</div>';
  }

  function coverageHTML() {
    const oxy = Matcher.coverageGrid('fuel', 'oxygen_pct');
    const air = Matcher.coverageGrid('fuel', 'airflow_cms');
    const gaps = Matcher.gapStatements();

    function table(grid, colLabel, unit, columnKey) {
      const cols = grid.cols.slice().sort((a, b) => (a === null ? 1 : b === null ? -1 : a - b));
      return '<p class="scroll-hint">Scroll the table sideways to see every recorded value.</p>' +
        '<div class="matrix-scroll">' +
        '<table class="matrix" role="table" aria-label="' + colLabel + ' coverage by fuel family">' +
        '<thead><tr><th scope="col">Fuel family</th>' +
          cols.map((c) => '<th scope="col" style="text-align:center">' + (c === null ? 'Unknown' : c + (unit || '')) + '</th>').join('') +
        '</tr></thead><tbody>' +
        grid.grid.map((row) => '<tr>' +
          '<th scope="row">' + UI.esc(Matcher.displayValue('fuel', row.value)) + '</th>' +
          cols.map((c) => {
            const cell = row.cells.find((x) => x.value === c);
            const n = cell ? cell.count : 0;
            const cls = n === 0 ? 'cov-0' : n === 1 ? 'cov-1' : n === 2 ? 'cov-2' : 'cov-3';
            const title = n === 0
              ? 'No indexed demonstration record: ' + row.label + ' at ' + (c === null ? 'an unrecorded ' + colLabel.toLowerCase() + ' value' : c + unit)
              : row.label + ' · ' + colLabel + ': ' + (c === null ? 'not recorded' : c + unit) + ' · ' + n + ' record' + (n > 1 ? 's' : '') + ' · ' + cell.ids.join(', ');
            const action = c === null ? 'Filter this fuel family to records with missing conditions.' : 'Filter this combination.';
            return '<td class="' + cls + '"><button type="button" data-coverage-fuel="' + UI.esc(row.value) + '" data-coverage-key="' + columnKey + '" data-coverage-value="' + c + '" data-coverage-detail="' + UI.esc(title + '. ' + action) + '" aria-label="' + UI.esc(title) + '. ' + action + '" aria-describedby="coverage-cell-detail" title="' + UI.esc(title) + '">' + (n === 0 ? '—' : n) + '</button></td>';
          }).join('') +
        '</tr>').join('') +
        '</tbody></table></div>';
    }

    return '<section class="card card-lg" id="coverage-panel" aria-labelledby="coverage-title">' +
      '<div class="card-title">' +
        '<h2 id="coverage-title" style="font-size:var(--fs-20)">Test coverage matrix</h2>' +
        '<button class="btn btn-sm btn-ghost" data-action="toggle-coverage">Hide</button>' +
      '</div>' +
      '<p class="notice notice-ember mb-4">Demonstration catalog coverage only. Not the full NASA research archive.</p>' +
      '<p style="font-size:var(--fs-14);max-width:78ch">' +
        'Cells count indexed records. A dashed “—” cell means no record exists for that combination — that is a catalog gap, not a zero result. ' +
        'Select a cell to filter that combination. Counts use the full demo catalog, independent of current filters.</p>' +
      '<div class="legend mt-4">' +
        '<span class="legend-item"><span class="legend-swatch cov-0"></span> No indexed demo record</span>' +
        '<span class="legend-item"><span class="legend-swatch cov-1"></span> 1 record</span>' +
        '<span class="legend-item"><span class="legend-swatch cov-2"></span> 2 records</span>' +
        '<span class="legend-item"><span class="legend-swatch cov-3"></span> 3 or more</span>' +
      '</div>' +
      referenceHeatmap() + '<div class="coverage-matrices mt-6">' +
        '<div><h3 class="mb-2">Fuel family × oxygen</h3><p class="matrix-axis-note">Columns: oxygen (% by volume). Rows: fuel families.</p>' + table(oxy, 'Oxygen', '% O₂', 'oxygen') + '</div>' +
        '<div><h3 class="mb-2">Fuel family × airflow</h3><p class="matrix-axis-note">Columns: airflow (cm/s). Rows: fuel families.</p>' + table(air, 'Airflow', ' cm/s', 'airflow') + '</div>' +
      '</div>' +
      '<div class="coverage-cell-inspector"><span class="research-label">Cell detail</span><p id="coverage-cell-detail" role="status" aria-live="polite">Hover or focus a cell to see its indexed records. Select it to apply filters.</p></div>' +
      '<hr>' +
      '<h3 style="font-size:var(--fs-15)">Gaps stated in plain English</h3>' +
      '<ul class="mt-3 honesty-list" style="gap:10px">' + gaps.map((g) =>
        '<li class="honesty-item">' + UI.icon('alert', 15) + '<span>' + UI.esc(g.text) + '</span></li>').join('') + '</ul>' +
      '<p class="muted mt-4" style="font-size:var(--fs-12)">Computed from demonstration rows. The same view reads directly from the backend catalog once extraction is verified.</p>' +
    '</section>';
  }

  function resultsHTML() {
    const list = Store.results();
    const chips = Store.activeFilterChips();
    return selectionBarHTML() +
      '<div class="results-head">' +
        '<p class="result-count" role="status" aria-live="polite">' +
          '<strong>' + list.length + '</strong> of ' + Store.records().length + ' records' +
          (chips.length ? ' · ' + chips.length + ' filter' + (chips.length > 1 ? 's' : '') + ' active' : '') +
        '</p>' +
        '<div class="row" style="gap:8px">' +
          '<button class="btn btn-sm filters-toggle" data-action="toggle-filters" ' +
            'aria-expanded="' + (filtersOpen ? 'true' : 'false') + '" aria-controls="filters">' +
            UI.icon('filter', 14) + ' <span class="filters-toggle-label">Filters</span>' +
            (chips.length ? '<span class="badge badge-teal">' + chips.length + '</span>' : '') +
          '</button>' +
          '<button class="btn btn-sm" data-action="toggle-coverage" aria-expanded="' + showCoverage + '">' +
            UI.icon('grid', 14) + ' Coverage</button>' +
          '<label class="sr-only" for="explorer-sort">Sort records</label>' +
          '<select class="select" id="explorer-sort" style="width:auto">' +
            option('id-asc', 'Test ID (A–Z)', Store.state.sort) +
            option('id-desc', 'Test ID (Z–A)', Store.state.sort) +
            option('date-desc', 'Newest session first', Store.state.sort) +
            option('completeness', 'Most complete metadata first', Store.state.sort) +
            option('airflow', 'Airflow (low to high)', Store.state.sort) +
            option('oxygen', 'Oxygen (low to high)', Store.state.sort) +
          '</select>' +
        '</div>' +
      '</div>' +
      (chips.length ? '<div class="active-filters">' + chips.map((c) =>
        '<span class="filter-chip">' + UI.esc(c.label) +
        '<button type="button" data-chip-clear="' + chips.indexOf(c) + '" aria-label="Remove filter: ' + UI.esc(c.label) + '">' +
          UI.icon('close', 12) + '</button></span>').join('') +
        '<button class="link-quiet" type="button" data-action="clear-filters">Clear all</button></div>' : '') +
      (list.length
        ? '<div class="results-list">' + list.map((r) => UI.recordCard(r)).join('') + '</div>'
        : UI.noResultsState());
  }

  function option(value, label, current) {
    return '<option value="' + value + '"' + (value === current ? ' selected' : '') + '>' + label + '</option>';
  }

  function shellHTML() {
    return '<div class="page-head"><div class="wrap page-head-inner">' +
      '<div>' +
        '<p class="eyebrow">Experiment explorer</p>' +
        '<h1>' + (showCoverage ? 'Experimental Coverage' : 'Experiment Explorer') + '</h1>' +
        '<p class="lead">Find illustrative records by their indexed conditions. Select two tests to compare, or open a record to inspect its evidence and limitations.</p>' +
      '</div>' +
      '<div class="row row-wrap" style="gap:8px">' +
        '<a class="btn" href="#/compare">' + UI.icon('compare', 15) + ' Comparison workspace</a>' +
      '</div>' +
    '</div></div>' +
    '<div class="wrap ' + (showCoverage ? 'coverage-workspace' : 'catalog-workspace') + '"><div id="catalog-stats"></div><div class="explorer-search"><label class="field-label" for="explorer-search">Search demonstration records</label><div class="search-field"><span class="search-icon">' + UI.icon('search', 18) + '</span><input class="input" id="explorer-search" type="search" placeholder="Search by test ID, material or shape…" aria-describedby="search-help" value="' + UI.esc(Store.state.filters.q) + '"><button class="btn-icon btn-clear" id="search-clear" type="button" aria-label="Clear search">' + UI.icon('close', 16) + '</button></div><p class="filter-sub" id="search-help">Searches IDs, titles, materials, geometry, flow direction and session metadata.</p></div><div class="explorer">' +
      filtersHTML() +
      '<section aria-label="Matching records">' +
        '<div id="coverage-slot"></div>' +
        '<div id="results-slot"></div>' +
      '</section>' +
    '</div></div>';
  }

  /* ---------------------------------------------------------------- wiring */

  function refresh(opts) {
    const o = opts || {};
    const resultsSlot = root.querySelector('#results-slot');
    if (!resultsSlot) return;

    const paint = () => {
      const focused = document.activeElement;
      const quickKey = focused?.dataset.quickband;
      const quickValue = focused?.dataset.value;
      const filterAction = focused?.closest('#filters') ? focused.dataset.action : null;
      const stats = root.querySelector('#catalog-stats');
      if (stats) stats.innerHTML = '<div class="catalog-stats" aria-label="Catalog summary">' +
        [[Store.records().length, 'Demonstration records', 'layers'], [Store.results().length, 'Matching results', 'search'],
         [Store.state.picked.length, 'Selected for comparison', 'compare'], [Store.activeFilterChips().length, 'Active filters', 'filter']]
        .map((s) => '<div>' + UI.icon(s[2], 19) + '<strong>' + s[0] + '</strong><span>' + s[1] + '</span></div>').join('') + '</div>';
      resultsSlot.innerHTML = resultsHTML();
      root.querySelector('.explorer')?.classList.toggle('has-selection', Store.state.picked.length > 0);
      root.querySelector('.explorer-search')?.classList.toggle('is-searching', !!Store.state.filters.q);
      const slot = root.querySelector('#coverage-slot');
      if (slot) slot.innerHTML = showCoverage ? coverageHTML() : '';
      if (o.rebuildFilters) {
        const form = root.querySelector('#filters');
        if (form) form.outerHTML = filtersHTML();
        bindFilters();
        if (filtersOpen) {
          const newPanel = root.querySelector('#filters');
          if (releaseTrap) releaseTrap();
          newPanel.setAttribute('role', 'dialog'); newPanel.setAttribute('aria-modal', 'true');
          releaseTrap = UI.trapFocus(newPanel, closeFilters);
        }
        if (quickKey) root.querySelector('[data-quickband="' + quickKey + '"][data-value="' + quickValue + '"]')?.focus({ preventScroll: true });
        else if (filterAction) root.querySelector('#filters [data-action="' + filterAction + '"]')?.focus({ preventScroll: true });
      } else {
        syncFacets();
      }
      bindResults();
      bindCoverage();
    };

    paint();
    const search = root.querySelector('#explorer-search');
    if (search) search.value = Store.state.filters.q;
  }

  /** Update facet counts and control states without rebuilding the panel, so
   *  typing in the search field keeps focus. */
  function syncFacets() {
    const form = root.querySelector('#filters');
    if (!form) return;
    ['fuel', 'geometry', 'flow_direction'].forEach((key) => {
      const counts = Store.facetCounts(key);
      form.querySelectorAll('[data-facet="' + key + '"]').forEach((span) => {
        const v = span.dataset.value;
        span.textContent = ' · ' + (counts[v] || 0);
        const wrap = span.closest('.check');
        if (wrap) {
          const cb = wrap.querySelector('input');
          const isDisabled = (counts[v] || 0) === 0 && !cb.checked;
          cb.disabled = isDisabled;
          wrap.style.opacity = isDisabled ? '.45' : '';
        }
      });
    });

    // Selection counts shown next to each filter group title
    form.querySelectorAll('[data-count-key]').forEach((el) => {
      const key = el.dataset.countKey;
      el.textContent = Store.state.filters[key].length + ' selected';
    });

    // Reflect externally cleared filters (chip removal, clear all)
    form.querySelectorAll('[data-band]').forEach((input) => {
      const band = Store.state.filters[input.dataset.band];
      const v = band[input.dataset.bound];
      input.value = v === null ? '' : v;
    });
    form.querySelectorAll('[data-quickband]').forEach((button) => {
      const band = Store.state.filters[button.dataset.quickband];
      const value = Number(button.dataset.value);
      button.setAttribute('aria-pressed', band.min === value && band.max === value);
    });
    form.querySelectorAll('[data-missing]').forEach((radio) => {
      radio.checked = radio.dataset.missing === Store.state.filters.missingData;
    });
    form.querySelectorAll('[data-filter]').forEach((cb) => {
      const selected = Store.state.filters[cb.dataset.filter];
      cb.checked = selected.includes(cb.value);
    });
    const reviewed = form.querySelector('#reviewed-only');
    if (reviewed) reviewed.checked = Store.state.filters.reviewedOnly;
    const search = form.querySelector('#explorer-search');
    if (search && search.value !== Store.state.filters.q) search.value = Store.state.filters.q;
  }

  function bindFilters() {
    const form = root.querySelector('#filters');
    if (!form) return;

    form.addEventListener('submit', (e) => e.preventDefault());

    form.querySelectorAll('[data-filter]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const key = cb.dataset.filter;
        const current = Store.state.filters[key].slice();
        const i = current.indexOf(cb.value);
        if (i >= 0) current.splice(i, 1); else current.push(cb.value);
        Store.setFilter({ [key]: current });
        refresh();
      });
    });

    form.querySelectorAll('[data-band]').forEach((input) => {
      input.addEventListener('change', () => {
        const key = input.dataset.band;          // oxygen | airflow | thickness
        const bound = input.dataset.bound;       // min | max
        const raw = input.value.trim();
        const val = raw === '' ? null : Number(raw);
        if (raw !== '' && !Number.isFinite(val)) return;
        const band = Object.assign({}, Store.state.filters[key], { [bound]: val });
        if (band.min !== null && band.max !== null && band.min > band.max) {
          input.setCustomValidity('Minimum must be less than or equal to maximum.'); input.reportValidity(); return;
        }
        input.setCustomValidity('');
        Store.setFilter({ [key]: band });
        refresh();
      });
    });

    form.querySelectorAll('[data-quickband]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.quickband;
        const v = Number(btn.dataset.value);
        Store.setFilter({ [key]: { min: v, max: v } });
        refresh({ rebuildFilters: true });
        UI.toast('Filter set to the recorded value <strong>' + v + '</strong>.');
      });
    });

    form.querySelectorAll('[data-missing]').forEach((r) => {
      r.addEventListener('change', () => { Store.setFilter({ missingData: r.dataset.missing }); refresh(); });
    });
    const reviewed = form.querySelector('#reviewed-only');
    if (reviewed) reviewed.addEventListener('change', () => { Store.setFilter({ reviewedOnly: reviewed.checked }); refresh(); });
  }

  function bindResults() {
    const slot = root.querySelector('#results-slot');

    slot.querySelectorAll('[data-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!Store.togglePick(btn.dataset.pick)) { UI.toast('Two records are already selected. Remove one before choosing another.', 'warn'); return; }
        const picked = Store.state.picked.length;
        if (picked === 2) UI.toast('Two tests selected. The comparison workspace will check whether the other conditions match.');
        refresh();
        root.querySelector('.record-card [data-pick="' + btn.dataset.pick + '"]')?.focus();
      });
    });

    const compareBtn = root.querySelector('[data-action="compare-picked"]');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        const [a, b] = Store.state.picked;
        const ra = Store.byId(a), rb = Store.byId(b);
        if (!ra || !rb) return;
        const factor = autoFactor(ra, rb);
        Store.setCompare({ a, b, factor });
        Router.go('/compare?a=' + a + '&b=' + b + '&factor=' + factor);
      });
    }
    const clearPick = root.querySelector('[data-action="clear-pick"]');
    if (clearPick) clearPick.addEventListener('click', () => { Store.set({ picked: [] }); refresh(); });

    const sort = root.querySelector('#explorer-sort');
    if (sort) sort.addEventListener('change', () => {
      Store.set({ sort: sort.value }); refresh();
      root.querySelector('#explorer-sort')?.focus({ preventScroll: true });
    });

    slot.querySelectorAll('[data-chip-clear]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chips = Store.activeFilterChips();
        const chip = chips[Number(btn.dataset.chipClear)];
        if (chip) Store.setFilter(chip.clear);
        refresh({ rebuildFilters: true });
        const next = root.querySelector('[data-chip-clear="' + btn.dataset.chipClear + '"]') || root.querySelector('#explorer-search');
        next?.focus({ preventScroll: true });
      });
    });
  }

  /** Pick the most plausible varied factor for a hand-picked pair. */
  function autoFactor(a, b) {
    const order = ['airflow_cms', 'oxygen_pct', 'thickness_mm', 'fuel', 'geometry', 'flow_direction'];
    const differing = order.filter((k) => {
      const av = a[k], bv = b[k];
      if (av === null || bv === null || av === undefined || bv === undefined) return false;
      return String(av) !== String(bv);
    });
    return differing[0] || Store.state.compare.factor || 'airflow_cms';
  }

  function focusSearch() {
    const s = root.querySelector('#explorer-search');
    if (s) s.focus();
  }

  function closeFilters(restoreFocus = true) {
    filtersOpen = false;
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
    document.querySelector('.filter-backdrop')?.remove();
    document.body.classList.remove('no-scroll');
    const panel = root?.querySelector('#filters');
    if (panel) { panel.classList.remove('is-open'); panel.removeAttribute('role'); panel.removeAttribute('aria-modal'); }
    const toggle = root?.querySelector('[data-action="toggle-filters"]');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); if (restoreFocus) toggle.focus(); }
  }

  function bindCoverage() {
    root.querySelectorAll('[data-coverage-view]').forEach((button) => {
      button.addEventListener('click', () => {
        coverageView = button.dataset.coverageView;
        refresh();
        root.querySelector('[data-coverage-view="' + coverageView + '"]')?.focus({ preventScroll: true });
      });
    });
    root.querySelectorAll('[data-heatmap-row]').forEach((button) => {
      const inspect = () => {
        root.querySelector('#coverage-cell-detail').textContent = button.dataset.coverageDetail;
        root.querySelectorAll('.matrix td.is-inspected').forEach((cell) => cell.classList.remove('is-inspected'));
        button.closest('td').classList.add('is-inspected');
      };
      button.addEventListener('focus', inspect);
      button.addEventListener('mouseenter', inspect);
      button.addEventListener('click', () => {
        const patch = {};
        [['row', 'rowValue'], ['col', 'colValue']].forEach(([axis, valueKey]) => {
          const key = button.dataset['heatmap' + axis[0].toUpperCase() + axis.slice(1)];
          const value = button.dataset['heatmap' + valueKey[0].toUpperCase() + valueKey.slice(1)];
          const band = { oxygen_pct: 'oxygen', airflow_cms: 'airflow', thickness_mm: 'thickness' }[key];
          if (band) patch[band] = { min: Number(value), max: Number(value) };
          else patch[key] = key === 'fuel' ? Store.valuesFor('fuel').filter((v) => (FUEL_GROUPS[v] || v) === (FUEL_GROUPS[value] || value)) : [value];
        });
        Store.resetFilters();
        Store.setFilter(patch);
        refresh({ rebuildFilters: true });
        const count = root.querySelector('.result-count');
        if (count) { count.tabIndex = -1; count.scrollIntoView({ block: 'center' }); count.focus({ preventScroll: true }); }
      });
    });
    root.querySelectorAll('[data-coverage-fuel]').forEach((button) => {
      const inspect = () => {
        const detail = root.querySelector('#coverage-cell-detail');
        if (detail) detail.textContent = button.dataset.coverageDetail;
        root.querySelectorAll('.matrix td.is-inspected').forEach((cell) => cell.classList.remove('is-inspected'));
        button.closest('td').classList.add('is-inspected');
      };
      button.addEventListener('focus', inspect);
      button.addEventListener('mouseenter', inspect);
      button.addEventListener('click', () => {
        const family = FUEL_GROUPS[button.dataset.coverageFuel] || button.dataset.coverageFuel;
        const fuel = Store.valuesFor('fuel').filter((v) => (FUEL_GROUPS[v] || v) === family || v === family);
        Store.resetFilters();
        const key = button.dataset.coverageKey;
        const value = button.dataset.coverageValue;
        Store.setFilter({ fuel, ...(value === 'null' ? { missingData: 'only' } : { [key]: { min: Number(value), max: Number(value) } }) });
        refresh({ rebuildFilters: true });
        const count = root.querySelector('.result-count');
        if (count) { count.tabIndex = -1; count.scrollIntoView({ block: 'center', behavior: 'auto' }); count.focus({ preventScroll: true }); }
      });
    });
  }

  /* ---------------------------------------------------------------- render */

  function render(route, container) {
    root = container;
    showCoverage = route?.params?.coverage === '1' || route?.params?.coverage === 'true';
    root.innerHTML = shellHTML();
    if (!Store.records().length) {
      root.querySelector('#results-slot').innerHTML = UI.emptyDataState();
      root.querySelector('#filters').outerHTML = '';
      return;
    }
    bindFilters();
    const search = root.querySelector('#explorer-search');
    search.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { Store.setFilter({ q: search.value }); refresh(); }, 150);
    });
    root.querySelector('#search-clear').addEventListener('click', () => { clearTimeout(searchTimer); Store.setFilter({ q: '' }); refresh(); focusSearch(); });
    refresh();
  }

  /* Actions delegated from main.js (data-action attributes). */
  const actions = {
    'toggle-filters': () => {
      if (filtersOpen) { closeFilters(); return; }
      filtersOpen = true;
      const panel = root.querySelector('#filters');
      if (panel) panel.classList.toggle('is-open', filtersOpen);
      refresh();
      if (filtersOpen && panel) {
        panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
        const backdrop = document.createElement('div'); backdrop.className = 'filter-backdrop';
        backdrop.addEventListener('click', closeFilters); document.body.appendChild(backdrop);
        document.body.classList.add('no-scroll');
        releaseTrap = UI.trapFocus(panel, closeFilters);
        const first = panel.querySelector('input, select, button');
        if (first) first.focus();
      }
    },
    'close-filters': closeFilters,
    'toggle-coverage': () => {
      Router.go(showCoverage ? '/explorer' : '/explorer?coverage=1');
    },
    'clear-filters': () => { Store.resetFilters(); refresh({ rebuildFilters: true }); UI.toast('Filters cleared.'); },
    widen: () => {
      const f = Store.state.filters;
      Store.setFilter({
        oxygen: { min: null, max: null },
        airflow: { min: null, max: null },
        thickness: { min: null, max: null },
        missingData: 'include'
      });
      refresh({ rebuildFilters: true });
      UI.toast('Numeric ranges widened and completeness filter relaxed.');
    }
  };

  function cleanup() { clearTimeout(searchTimer); closeFilters(false); }
  if (window.matchMedia) window.matchMedia('(max-width: 900px)').addEventListener('change', () => { if (filtersOpen) closeFilters(); });
  return { render, refresh, actions, cleanup };
})();
