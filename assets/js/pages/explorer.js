/* ==========================================================================
   pages/explorer.js — experiment explorer
   Search + metadata filters over indexed records, with facet counts that
   respect the other filters, an explicit coverage matrix, and a two-slot
   hand-off into the comparison workspace.
   ========================================================================== */

const ExplorerPage = (function () {
  let root = null;
  let loading = false;
  let showCoverage = false;
  let filtersOpen = false;   // mobile filter drawer

  /* ------------------------------------------------------------------ view */

  function rangeField(key, label, band, bounds, unit, recordedValues) {
    return '<div class="filter-group">' +
      '<div class="filter-group-title">' + label +
        '<span class="filter-count">' + (band.min === null && band.max === null ? 'any' : 'limited') + '</span>' +
      '</div>' +
      '<p class="filter-sub">Recorded range: ' + bounds.min + '–' + bounds.max + ' ' + unit + '</p>' +
      '<div class="row" style="gap:8px">' +
        '<input class="input" type="number" inputmode="decimal" data-band="' + key + '" data-bound="min" ' +
          'placeholder="min" aria-label="' + label + ' minimum" value="' + (band.min === null ? '' : band.min) + '" ' +
          'min="' + bounds.min + '" max="' + bounds.max + '">' +
        '<input class="input" type="number" inputmode="decimal" data-band="' + key + '" data-bound="max" ' +
          'placeholder="max" aria-label="' + label + ' maximum" value="' + (band.max === null ? '' : band.max) + '" ' +
          'min="' + bounds.min + '" max="' + bounds.max + '">' +
      '</div>' +
      '<div class="row row-wrap mt-2" style="gap:6px">' +
        recordedValues.map((v) =>
          '<button class="pill" data-quickband="' + key + '" data-value="' + v + '" style="cursor:pointer;background:transparent">' +
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
        (f.reviewedOnly ? ' checked' : '') + '><span>Metadata review finished only</span></label>' +
    '</div>';

    return '<form class="filters' + (filtersOpen ? ' is-open' : '') + '" id="filters" aria-label="Experiment filters">' +
      '<div class="filters-scroll">' +
        '<div class="filter-group">' +
          '<div class="filter-group-title">Search</div>' +
          '<div class="search-field">' +
            '<span class="search-icon">' + UI.icon('search', 16) + '</span>' +
            '<input class="input" id="explorer-search" type="search" placeholder="Test ID, fuel, geometry…" ' +
              'aria-label="Search experiment records" value="' + UI.esc(f.q) + '">' +
            (f.q ? '<button class="btn-icon btn-clear" id="search-clear" type="button" aria-label="Clear search">' + UI.icon('close', 15) + '</button>' : '') +
          '</div>' +
        '</div>' +
        checkGroup('fuel', 'Fuel / material', Store.valuesFor('fuel'), Store.facetCounts('fuel'), f.fuel) +
        checkGroup('geometry', 'Sample geometry', Store.valuesFor('geometry'), Store.facetCounts('geometry'), f.geometry) +
        checkGroup('flow_direction', 'Flow direction', Store.valuesFor('flow_direction'), Store.facetCounts('flow_direction'), f.flow_direction) +
        rangeField('oxygen', 'Oxygen', f.oxygen, oxyBounds, '% O₂', Store.valuesFor('oxygen_pct')) +
        rangeField('airflow', 'Airflow', f.airflow, airBounds, 'cm/s', Store.valuesFor('airflow_cms')) +
        rangeField('thickness', 'Thickness', f.thickness, thBounds, 'mm', Store.valuesFor('thickness_mm')) +
        missingValue +
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
    return '<div class="notice notice-teal" style="align-items:center">' +
      '<span class="dot dot-teal"></span>' +
      '<div style="flex:1">' +
        '<span class="notice-title">' + picked.length + ' test' + (picked.length > 1 ? 's' : '') + ' selected</span> ' +
        '<span class="muted">' + picked.map((p) => p.id).join(' · ') + '</span>' +
      '</div>' +
      '<div class="row" style="gap:8px">' +
        '<button class="btn btn-sm btn-primary" data-action="compare-picked"' +
          (picked.length < 2 ? ' aria-disabled="true"' : '') + '>Compare selected ' + UI.icon('chevron', 14) + '</button>' +
        '<button class="btn btn-sm btn-ghost" data-action="clear-pick">Clear</button>' +
      '</div>' +
    '</div>';
  }

  function coverageHTML() {
    const oxy = Matcher.coverageGrid('fuel', 'oxygen_pct');
    const air = Matcher.coverageGrid('fuel', 'airflow_cms');
    const gaps = Matcher.gapStatements();

    function table(grid, colLabel, unit) {
      const cols = grid.cols.slice().sort((a, b) => (a === null ? 1 : b === null ? -1 : a - b));
      return '<div class="table-wrap">' +
        '<table class="matrix" role="table" aria-label="' + colLabel + ' coverage by fuel family">' +
        '<thead><tr><th scope="col">' + colLabel + '</th>' +
          cols.map((c) => '<th scope="col" style="text-align:center">' + (c === null ? 'n/a' : c + (unit || '')) + '</th>').join('') +
        '</tr></thead><tbody>' +
        grid.grid.map((row) => '<tr>' +
          '<th scope="row">' + UI.esc(Matcher.displayValue('fuel', row.value)) + '</th>' +
          cols.map((c) => {
            const cell = row.cells.find((x) => x.value === c);
            const n = cell ? cell.count : 0;
            const cls = n === 0 ? 'cov-0' : n === 1 ? 'cov-1' : n === 2 ? 'cov-2' : 'cov-3';
            const title = n === 0
              ? 'No record: ' + row.label + ' at ' + (c === null ? 'an unrecorded value' : c + unit)
              : n + ' record' + (n > 1 ? 's' : '') + ' · ' + cell.ids.join(', ');
            return '<td class="' + cls + '" title="' + UI.esc(title) + '">' + (n === 0 ? '·' : n) + '</td>';
          }).join('') +
        '</tr>').join('') +
        '</tbody></table></div>';
    }

    return '<section class="card card-lg" id="coverage-panel" aria-labelledby="coverage-title">' +
      '<div class="card-title">' +
        '<h2 id="coverage-title" style="font-size:var(--fs-20)">Test coverage matrix</h2>' +
        '<button class="btn btn-sm btn-ghost" data-action="toggle-coverage">Hide</button>' +
      '</div>' +
      '<p style="font-size:var(--fs-14);max-width:78ch">' +
        'Cells count indexed records. A dotted “·” cell means no record exists for that combination — that is an evidence gap, not a zero result. ' +
        'Hover a cell to see the test IDs behind it.</p>' +
      '<div class="legend mt-4">' +
        '<span class="legend-item"><span class="legend-swatch cov-0"></span> no record</span>' +
        '<span class="legend-item"><span class="legend-swatch cov-1"></span> 1 record</span>' +
        '<span class="legend-item"><span class="legend-swatch cov-2"></span> 2 records</span>' +
        '<span class="legend-item"><span class="legend-swatch cov-3"></span> 3 or more</span>' +
      '</div>' +
      '<div class="grid grid-2 mt-6" style="align-items:start">' +
        '<div><h3 style="font-size:var(--fs-15)" class="mb-4">Oxygen coverage</h3>' + table(oxy, 'Fuel', '% O₂') + '</div>' +
        '<div><h3 style="font-size:var(--fs-15)" class="mb-4">Airflow coverage</h3>' + table(air, 'Fuel', ' cm/s') + '</div>' +
      '</div>' +
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
        '<button type="button" data-chip-clear="' + c.key + '" aria-label="Remove filter: ' + UI.esc(c.label) + '">' +
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
        '<h1>Browse recorded combustion conditions</h1>' +
        '<p class="lead">Search the indexed catalog and filter it by the conditions each test recorded. ' +
          'Every card states which comparable fields are populated and which are empty, so a gap in the metadata is visible before it becomes a gap in the reasoning.</p>' +
      '</div>' +
      '<div class="row row-wrap" style="gap:8px">' +
        '<a class="btn" href="#/compare">' + UI.icon('compare', 15) + ' Comparison workspace</a>' +
      '</div>' +
    '</div></div>' +
    '<div class="wrap"><div class="explorer">' +
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
      resultsSlot.innerHTML = resultsHTML();
      const slot = root.querySelector('#coverage-slot');
      if (slot) slot.innerHTML = showCoverage ? coverageHTML() : '';
      if (o.rebuildFilters) {
        const form = root.querySelector('#filters');
        if (form) form.outerHTML = filtersHTML();
        bindFilters();
      } else {
        syncFacets();
      }
      bindResults();
    };

    if (!o.reload) { paint(); return; }
    resultsSlot.innerHTML = UI.skeletonList(3);
    loading = true;
    UI.simulateLoad(200).then(() => {
      loading = false;
      paint();
      const heading = root.querySelector('#results-slot .result-count');
      if (heading) heading.setAttribute('tabindex', '-1');
    });
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

    const search = form.querySelector('#explorer-search');
    let t = null;
    search.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => { Store.setFilter({ q: search.value }); refresh(); }, 180);
    });
    const clear = form.querySelector('#search-clear');
    if (clear) clear.addEventListener('click', () => { Store.setFilter({ q: '' }); refresh({ rebuildFilters: true }); focusSearch(); });

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
        if (raw !== '' && Number.isNaN(val)) return;
        const band = Object.assign({}, Store.state.filters[key], { [bound]: val });
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
        UI.toast('Airflow/Oxygen/Thickness filter set to the single recorded value <strong>' + v + '</strong>.');
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
        Store.togglePick(btn.dataset.pick);
        const picked = Store.state.picked.length;
        if (picked === 2) UI.toast('Two tests selected. The comparison workspace will check whether the other conditions match.');
        refresh();
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
    if (clearPick) clearPick.addEventListener('click', () => { Store.state.picked = []; refresh(); });

    const sort = root.querySelector('#explorer-sort');
    if (sort) sort.addEventListener('change', () => { Store.set({ sort: sort.value }); refresh(); });

    slot.querySelectorAll('[data-chip-clear]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chips = Store.activeFilterChips();
        const chip = chips.find((c) => c.key === btn.dataset.chipClear);
        if (chip) Store.setFilter(chip.clear);
        refresh({ rebuildFilters: true });
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

  /* ---------------------------------------------------------------- render */

  function render(route, container) {
    root = container;
    if (route && route.params && (route.params.coverage === '1' || route.params.coverage === 'true')) {
      showCoverage = true;
    }
    root.innerHTML = shellHTML();
    if (!Store.records().length) {
      root.querySelector('#results-slot').innerHTML = UI.emptyDataState();
      root.querySelector('#filters').outerHTML = '';
      return;
    }
    bindFilters();
    refresh();
  }

  /* Actions delegated from main.js (data-action attributes). */
  const actions = {
    'toggle-filters': () => {
      filtersOpen = !filtersOpen;
      // The filter rail lives outside the results slot, so the class is applied
      // to the existing element first, then the results head is re-rendered to
      // refresh the filter count on the button.
      const panel = root.querySelector('#filters');
      if (panel) panel.classList.toggle('is-open', filtersOpen);
      refresh();
      if (filtersOpen && panel) {
        const first = panel.querySelector('input, select, button');
        if (first) first.focus();
      }
    },
    'toggle-coverage': () => {
      showCoverage = !showCoverage;
      refresh();
      if (showCoverage) {
        const panel = root.querySelector('#coverage-panel');
        if (panel && panel.scrollIntoView) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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

  return { render, refresh, actions };
})();
