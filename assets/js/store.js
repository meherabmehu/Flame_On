/* ==========================================================================
   store.js — application state, filtering, faceting and persistence
   --------------------------------------------------------------------------
   Kept deliberately framework-free so the Django backend can drive the same
   state from URL query parameters later. Every mutation that should be
   reproducible goes through `Store.set()` which records a plain snapshot.
   ========================================================================== */

const Store = (function () {
  const DEFAULT_FILTERS = {
    q: '',
    fuel: [],
    geometry: [],
    flow_direction: [],
    oxygen: { min: null, max: null },
    airflow: { min: null, max: null },
    thickness: { min: null, max: null },
    reviewedOnly: false,
    missingData: 'include'   // include | exclude | only
  };

  const state = {
    filters: JSON.parse(JSON.stringify(DEFAULT_FILTERS)),
    sort: 'id-asc',
    // comparison workspace
    compare: { factor: 'airflow_cms', a: null, b: null },
    // explorer multi-select (max 2 used by the compare hand-off)
    picked: [],
    dataMode: 'demo'         // demo | empty  (empty demonstrates honest empty states)
  };

  const listeners = new Set();

  function emit() {
    listeners.forEach((fn) => fn(state));
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function set(patch, opts) {
    Object.assign(state, patch);
    if (!opts || opts.persist !== false) persist();
    emit();
  }

  function setFilter(patch) {
    Object.assign(state.filters, patch);
    persist();
    emit();
  }

  function resetFilters() {
    state.filters = JSON.parse(JSON.stringify(DEFAULT_FILTERS));
    persist();
    emit();
  }

  function persist() {
    try {
      localStorage.setItem('cinderlens.filters', JSON.stringify(state.filters));
      localStorage.setItem('cinderlens.compare', JSON.stringify(state.compare));
      localStorage.setItem('cinderlens.picked', JSON.stringify(state.picked));
    } catch (e) { /* private mode — state stays in memory only */ }
  }

  function restore() {
    try {
      const f = JSON.parse(localStorage.getItem('cinderlens.filters') || 'null');
      const c = JSON.parse(localStorage.getItem('cinderlens.compare') || 'null');
      if (f && typeof f === 'object') {
        state.filters.q = typeof f.q === 'string' ? f.q : '';
        ['fuel', 'geometry', 'flow_direction'].forEach((k) => {
          state.filters[k] = Array.isArray(f[k]) ? f[k].filter((v) => typeof v === 'string') : [];
        });
        ['oxygen', 'airflow', 'thickness'].forEach((k) => {
          ['min', 'max'].forEach((b) => { state.filters[k][b] = Number.isFinite(f[k]?.[b]) ? f[k][b] : null; });
        });
        state.filters.reviewedOnly = f.reviewedOnly === true;
        state.filters.missingData = ['include', 'exclude', 'only'].includes(f.missingData) ? f.missingData : 'include';
      }
      if (c && typeof c === 'object') {
        state.compare = { factor: FACTORS.some((x) => x.key === c.factor) ? c.factor : 'airflow_cms',
          a: byId(c.a) ? c.a : null, b: byId(c.b) ? c.b : null };
      }
      const picked = JSON.parse(localStorage.getItem('cinderlens.picked') || '[]');
      state.picked = Array.isArray(picked) ? [...new Set(picked.filter((id) => byId(id)))].slice(0, 2) : [];
    } catch (e) { /* ignore malformed stored state */ }
  }

  /* ------------------------------------------------------------------ data */

  function records() {
    return state.dataMode === 'empty' ? [] : CATALOG;
  }

  function byId(id) {
    return records().find((r) => r.id === id) || null;
  }

  /* --------------------------------------------------------------- filtering */

  function isMissing(record, key) {
    const v = record[key];
    return v === null || v === undefined || v === '';
  }

  /** All comparable-values present in the current dataset for a factor. */
  function valuesFor(key) {
    const out = [];
    records().forEach((r) => {
      const v = r[key];
      if (v !== null && v !== undefined && !out.includes(v)) out.push(v);
    });
    if (FACTORS.find((f) => f.key === key && f.type === 'numeric')) {
      out.sort((a, b) => a - b);
    } else {
      out.sort();
    }
    return out;
  }

  function numericBounds(key) {
    const vals = records()
      .map((r) => r[key])
      .filter((v) => typeof v === 'number');
    if (!vals.length) return { min: 0, max: 0 };
    return { min: Math.min(...vals), max: Math.max(...vals, 0) };
  }

  function matchesFilters(record, filters, skipKey) {
    const f = filters;

    if (f.q && skipKey !== 'q') {
      const hay = [
        record.id, record.title, record.fuel, record.geometry,
        record.flow_direction, record.session, record.run
      ].join(' ').toLowerCase();
      if (!hay.includes(f.q.trim().toLowerCase())) return false;
    }

    if (skipKey !== 'fuel' && f.fuel.length && !f.fuel.includes(record.fuel)) return false;
    if (skipKey !== 'geometry' && f.geometry.length && !f.geometry.includes(record.geometry)) return false;
    if (skipKey !== 'flow_direction' && f.flow_direction.length && !f.flow_direction.includes(record.flow_direction)) return false;

    const numericChecks = [
      ['oxygen_pct', f.oxygen], ['airflow_cms', f.airflow], ['thickness_mm', f.thickness]
    ];
    for (const [key, band] of numericChecks) {
      if (skipKey === key) continue;
      if (band.min !== null || band.max !== null) {
        if (isMissing(record, key)) return false;         // a band cannot match an empty field
        if (band.min !== null && record[key] < band.min) return false;
        if (band.max !== null && record[key] > band.max) return false;
      }
    }

    if (f.reviewedOnly && !record.metadataReviewed) return false;

    const missingCount = countMissing(record);
    if (f.missingData === 'exclude' && missingCount > 0) return false;
    if (f.missingData === 'only' && missingCount === 0) return false;

    return true;
  }

  const COMPARABLE_KEYS = ['thickness_mm', 'oxygen_pct', 'airflow_cms', 'fuel', 'geometry', 'flow_direction'];

  function countMissing(record) {
    return COMPARABLE_KEYS.filter((k) => isMissing(record, k)).length;
  }

  function filter(skipKey) {
    return records().filter((r) => matchesFilters(r, state.filters, skipKey));
  }

  /** Facet counts respect every other active filter, the usual search behaviour. */
  function facetCounts(key) {
    const pool = filter(key);
    const counts = {};
    pool.forEach((r) => {
      const v = r[key];
      if (v === null || v === undefined) return;
      counts[v] = (counts[v] || 0) + 1;
    });
    return counts;
  }

  function sortRecords(list) {
    const s = state.sort;
    const copy = list.slice();
    if (s === 'id-asc') copy.sort((a, b) => a.id.localeCompare(b.id));
    if (s === 'id-desc') copy.sort((a, b) => b.id.localeCompare(a.id));
    if (s === 'date-desc') copy.sort((a, b) => b.session.localeCompare(a.session) || a.id.localeCompare(b.id));
    if (s === 'completeness') copy.sort((a, b) => countMissing(a) - countMissing(b) || a.id.localeCompare(b.id));
    if (s === 'airflow') {
      copy.sort((a, b) => (a.airflow_cms === null ? Infinity : a.airflow_cms) - (b.airflow_cms === null ? Infinity : b.airflow_cms));
    }
    if (s === 'oxygen') {
      copy.sort((a, b) => (a.oxygen_pct === null ? Infinity : a.oxygen_pct) - (b.oxygen_pct === null ? Infinity : b.oxygen_pct));
    }
    return copy;
  }

  function results() {
    return sortRecords(filter());
  }

  function activeFilterChips() {
    const f = state.filters;
    const chips = [];
    if (f.q) chips.push({ key: 'q', label: 'Search: “' + f.q + '”', clear: { q: '' } });
    f.fuel.forEach((v) => chips.push({ key: 'fuel', label: 'Fuel: ' + v, clear: { fuel: f.fuel.filter((x) => x !== v) } }));
    f.geometry.forEach((v) => chips.push({ key: 'geometry', label: 'Geometry: ' + (GEOMETRY_LABELS[v] || v), clear: { geometry: f.geometry.filter((x) => x !== v) } }));
    f.flow_direction.forEach((v) => chips.push({ key: 'flow_direction', label: 'Flow: ' + v, clear: { flow_direction: f.flow_direction.filter((x) => x !== v) } }));
    [['oxygen', 'Oxygen'], ['airflow', 'Airflow'], ['thickness', 'Thickness']].forEach(([k, label]) => {
      const band = f[k];
      if (band.min !== null || band.max !== null) {
        const unit = UNIT_BY_KEY[k === 'oxygen' ? 'oxygen_pct' : k === 'airflow' ? 'airflow_cms' : 'thickness_mm'];
        chips.push({
          key: k,
          label: label + ': ' + (band.min ?? '–') + ' to ' + (band.max ?? '–') + ' ' + unit,
          clear: { [k]: { min: null, max: null } }
        });
      }
    });
    if (f.reviewedOnly) chips.push({ key: 'reviewedOnly', label: 'Metadata reviewed only', clear: { reviewedOnly: false } });
    if (f.missingData !== 'include') {
      chips.push({
        key: 'missingData',
        label: f.missingData === 'exclude' ? 'Complete records only' : 'Records with missing fields only',
        clear: { missingData: 'include' }
      });
    }
    return chips;
  }

  /* ------------------------------------------------------- compare selection */

  function setCompare(patch) {
    Object.assign(state.compare, patch);
    persist();
    emit();
  }

  function togglePick(id) {
    if (!byId(id)) return false;
    const i = state.picked.indexOf(id);
    if (i >= 0) state.picked.splice(i, 1);
    else {
      if (state.picked.length >= 2) return false;
      state.picked.push(id);
    }
    persist();
    emit();
    return true;
  }

  restore();

  return {
    state, subscribe, set, setFilter, resetFilters, setCompare, togglePick,
    records, byId, filter, results, facetCounts, sortRecords, valuesFor,
    numericBounds, countMissing, activeFilterChips, isMissing, COMPARABLE_KEYS
  };
})();
