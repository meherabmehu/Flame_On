/* ==========================================================================
   matcher.js — comparison and abstention logic
   --------------------------------------------------------------------------
   The scientific rules of the prototype live here, in one reviewable file:

     • only values that exist in the catalog can be compared
     • fuel, geometry and flow direction must match exactly (hard conditions)
     • thickness, oxygen and airflow may differ only inside a stated tolerance
     • if anything needed for a claim is missing, the interface abstains

   Every function returns plain objects so the same rules can be ported to
   Python, or replaced by the retrieval ranking described in the build guide
   (stage 2: "find and rank similar tests"), without touching the UI.
   ========================================================================== */

const Matcher = (function () {

  function factor(key) {
    return FACTORS.find((f) => f.key === key) || null;
  }

  function factorLabel(key) {
    const f = factor(key);
    return f ? f.label : CONDITION_LABELS[key] || key;
  }

  function displayValue(key, value) {
    if (value === null || value === undefined || value === '') return null;
    const unit = UNIT_BY_KEY[key];
    if (key === 'flow_direction') return value;
    if (key === 'fuel') return FUEL_GROUPS[value] || value;
    if (key === 'geometry') return GEOMETRY_LABELS[value] || value;
    return unit ? value + ' ' + unit : String(value);
  }

  /** Numeric equality inside the documented tolerance band. */
  function withinTolerance(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') return a === b;
    const hi = Math.max(Math.abs(a), Math.abs(b));
    if (hi === 0) return true;
    return Math.abs(a - b) / hi <= MATCH_RULES.numericTolerance;
  }

  /** Compare one condition across two records. */
  function conditionRow(key, a, b, variedKey) {
    const av = a[key];
    const bv = b[key];
    const missing = (v) => v === null || v === undefined || v === '';

    let state;
    if (key === variedKey) state = 'varied';
    else if (missing(av) || missing(bv)) state = 'missing';
    else if (typeof av === 'number' && typeof bv === 'number') {
      state = withinTolerance(av, bv) ? 'match' : 'differs';
    } else {
      state = av === bv ? 'match' : 'differs';
    }

    return {
      key,
      label: CONDITION_LABELS[key] || factorLabel(key),
      a: displayValue(key, av),
      b: displayValue(key, bv),
      aMissing: missing(av),
      bMissing: missing(bv),
      state
    };
  }

  const CHECK_KEYS = ['fuel', 'geometry', 'thickness_mm', 'flow_direction', 'oxygen_pct', 'airflow_cms'];

  /**
   * The full verdict for one candidate pair.
   * @returns {{verdict:string, headline:string, reasons:Array, rows:Array,
   *            differs:number, missing:number, sameSetting:boolean}}
   */
  function pairVerdict(a, b, variedKey) {
    if (!a || !b) {
      return {
        verdict: 'incomplete',
        headline: 'Select two tests to check whether they can be compared',
        reasons: [],
        rows: [],
        differs: 0,
        missing: 0,
        sameSetting: false
      };
    }

    const rows = CHECK_KEYS.map((k) => conditionRow(k, a, b, variedKey));
    const variedRow = rows.find((r) => r.key === variedKey);
    const differs = rows.filter((r) => r.state === 'differs').length;
    const missing = rows.filter((r) => r.state === 'missing').length;
    const reasons = [];

    const variedMissing = variedRow ? (variedRow.aMissing || variedRow.bMissing) : true;
    const sameSetting = variedRow && !variedMissing &&
      String(variedRow.a) === String(variedRow.b);

    // 1. Can the factor even be compared with these records?
    if (variedMissing) {
      reasons.push({
        ok: false,
        text: factorLabel(variedKey) + ' is not recorded for at least one of the selected tests, so the two records cannot be lined up on this factor.'
      });
      return {
        verdict: 'insufficient',
        headline: 'Not enough comparable data',
        reasons: reasons.concat(missingReason(rows, 'missing')),
        rows, differs, missing, sameSetting: false
      };
    }

    // 2. Hard conditions must agree exactly.
    const hardConflicts = rows.filter((r) => MATCH_RULES.hardKeys.includes(r.key) && r.state === 'differs');
    if (hardConflicts.length) {
      hardConflicts.forEach((r) => reasons.push({
        ok: false,
        text: r.label + ' differs (' + (r.a || 'not recorded') + ' vs ' + (r.b || 'not recorded') + '). ' +
          'Fuel family, sample geometry and flow direction are treated as hard conditions in this prototype.'
      }));
      return {
        verdict: 'unsuitable',
        headline: 'Not a controlled comparison',
        reasons: reasons.concat(missingReason(rows, 'missing')),
        rows, differs, missing, sameSetting
      };
    }

    // 3. Same setting on both sides means there is nothing to compare.
    if (sameSetting) {
      reasons.push({
        ok: false,
        text: 'Both tests use the same ' + factorLabel(variedKey).toLowerCase() + ' (' + variedRow.a + '), so there is no difference to describe.'
      });
      return {
        verdict: 'unsuitable',
        headline: 'No change to compare',
        reasons: reasons.concat(missingReason(rows, 'missing')),
        rows, differs, missing, sameSetting
      };
    }

    // 4. Missing supporting conditions limit what can be said.
    const softMissing = rows.filter((r) => r.key !== variedKey && r.state === 'missing');
    const softDiffers = rows.filter((r) => r.key !== variedKey && r.state === 'differs');

    if (missing > 0) {
      reasons.push({
        ok: false,
        text: 'One or more supporting conditions are empty (' +
          rows.filter((r) => r.state === 'missing').map((r) => r.label.toLowerCase()).join(', ') +
          '). Those fields were not in the catalog for these rows, so they are treated as unknown rather than equal.'
      });
    }

    if (softDiffers.length > MATCH_RULES.maxDiffering) {
      return {
        verdict: 'unsuitable',
        headline: 'Too many conditions differ',
        reasons: reasons.concat(softDiffers.map((r) => ({
          ok: false,
          text: r.label + ' differs as well (' + r.a + ' vs ' + r.b + '). More than ' + MATCH_RULES.maxDiffering +
            ' differing conditions means the pair is not treated as a one-factor comparison.'
        }))),
        rows, differs, missing, sameSetting
      };
    }

    softDiffers.forEach((r) => reasons.push({
      ok: false,
      text: r.label + ' also differs (' + r.a + ' vs ' + r.b + '). The pair is inside the ' +
        Math.round(MATCH_RULES.numericTolerance * 100) + '% tolerance band, but the difference is reported rather than hidden.'
    }));

    softMissing.forEach(() => { /* already reported by the missing block above */ });

    rows.filter((r) => r.state === 'match').forEach((r) => reasons.push({
      ok: true,
      text: r.label + ' matches exactly (' + r.a + ').'
    }));

    if (!reasons.length) {
      reasons.push({ ok: true, text: 'Every other recorded condition matches.' });
    }

    const hasCaveat = missing > 0 || softDiffers.length > 0 || !a.metadataReviewed || !b.metadataReviewed;
    if (!a.metadataReviewed || !b.metadataReviewed) {
      reasons.push({
        ok: false,
        text: 'At least one row has not finished metadata review, so its values may still change.'
      });
    }

    return {
      verdict: hasCaveat ? 'caution' : 'comparable',
      headline: hasCaveat ? 'Comparable with caveats' : 'Comparable, one factor varied',
      reasons,
      rows, differs, missing, sameSetting
    };
  }

  function missingReason(rows) {
    return rows.filter((r) => r.state === 'missing').map((r) => ({
      ok: false,
      text: r.label + ' is empty for ' + (r.aMissing && r.bMissing ? 'both tests' : 'one test') + ', so it cannot be checked.'
    }));
  }

  /* ---------------------------------------------------- plain-English result */

  /**
   * A sentence describing what the records say. Deliberately narrow:
   * it repeats the recorded outcome, and never predicts.
   */
  function describePair(a, b, variedKey) {
    if (!a || !b) return null;
    const va = displayValue(variedKey, a[variedKey]);
    const vb = displayValue(variedKey, b[variedKey]);
    const better = typeof a[variedKey] === 'number' && typeof b[variedKey] === 'number' && a[variedKey] > b[variedKey];
    const low = better ? b : a;
    const high = better ? a : b;
    const lowV = better ? vb : va;
    const highV = better ? va : vb;

    const labelOf = (r) => (r.outcomes && r.outcomes[0] ? r.outcomes[0].label : 'an outcome that is not recorded');

    return {
      varied: factorLabel(variedKey),
      lowLabel: lowV, highLabel: highV,
      lowRecord: low, highRecord: high,
      sentence:
        'At ' + factorLabel(variedKey).toLowerCase() + ' of ' + lowV + ' the recorded outcome is “' + labelOf(low) +
        '”. At ' + highV + ' the recorded outcome is “' + labelOf(high) + '”. ' +
        'Both statements describe these two records only.',
      noClaim:
        'No prediction is made here about any untested cabin, atmosphere or material. Records are a report of what happened in a specific test.'
    };
  }

  /* ------------------------------------------------------------ suggestions */

  /**
   * Rank candidate pairs for a factor among the currently filtered records.
   * Mirrors build-guide stage 2 in a transparent, rule-based way; the ML
   * retrieval step can replace this function later.
   */
  function suggestPairs(variedKey, pool, limit) {
    const list = pool || Store.filter();
    const out = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        const v = pairVerdict(a, b, variedKey);
        if (v.verdict === 'comparable' || v.verdict === 'caution') {
          const hardOk = v.rows.filter((r) => MATCH_RULES.hardKeys.includes(r.key) && r.state === 'match').length;
          const score = hardOk * 10 + (v.rows.filter((r) => r.state === 'match').length) - v.differs * 1.5 - v.missing * 1.5;
          out.push({
            a, b, verdict: v.verdict, score,
            matched: v.rows.filter((r) => r.state === 'match').map((r) => r.label),
            variedRow: v.rows.find((r) => r.key === variedKey)
          });
        }
      }
    }
    out.sort((x, y) => y.score - x.score);

    // Keep the list readable: at most one pair per combination of varied values
    // per fuel geometry, so the user sees distinct evidence rather than repeats.
    const seen = new Set();
    const distinct = [];
    out.forEach((p) => {
      const key = [p.a.fuel, p.a.geometry, p.variedRow.a, p.variedRow.b].join('|');
      if (seen.has(key)) return;
      seen.add(key);
      distinct.push(p);
    });
    return distinct.slice(0, limit || 6);
  }

  /** Why a factor can — or cannot — be demonstrated from the current pool. */
  function factorEvidence(variedKey, pool) {
    const list = pool || Store.filter();
    const withValue = list.filter((r) => !Store.isMissing(r, variedKey));
    const distinctValues = new Set(withValue.map((r) => r[variedKey])).size;
    const pairs = suggestPairs(variedKey, list, 1);
    return {
      total: list.length,
      recorded: withValue.length,
      missing: list.length - withValue.length,
      distinctValues,
      canCompare: pairs.length > 0,
      reason: pairs.length ? '' :
        withValue.length < 2
          ? 'Fewer than two records in the current selection have a recorded value for ' + factorLabel(variedKey).toLowerCase() + '.'
          : 'Records with this factor recorded do not form a pair whose other conditions match closely enough.'
    };
  }

  /* --------------------------------------------------------------- coverage */

  /**
   * Coverage of a factor grid: how many records exist for each combination.
   * Zero cells are the point of the view — they are the evidence gaps.
   */
  function coverageGrid(rowsKey, colsKey, rowValues, colValues) {
    const list = Store.records();
    let rows = rowValues || Store.valuesFor(rowsKey);
    let cols = colValues || Store.valuesFor(colsKey);

    // When rows are categorical, report the grouping actually shown to the user
    // (fuel families, for example) instead of one row per raw value.
    if (rowsKey === 'fuel') rows = uniqueFuelFamilies(rows);
    if (colsKey === 'fuel') cols = uniqueFuelFamilies(cols);

    const cellFor = (rv, cv) => {
      const hits = list.filter((r) => matchesFamily(r[rowsKey], rv) && matchesFamily(r[colsKey], cv));
      return { value: cv, count: hits.length, ids: hits.map((h) => h.id) };
    };

    const grid = rows.map((rv) => ({
      value: rv,
      label: displayValue(rowsKey, rv) || String(rv),
      cells: cols.map((cv) => cellFor(rv, cv))
    }));
    return { rows, cols, grid };
  }

  /** Fuel values that share a family label collapse into one coverage row. */
  function uniqueFuelFamilies(values) {
    const seen = new Set();
    const out = [];
    values.forEach((v) => {
      const family = FUEL_GROUPS[v] || v;
      if (seen.has(family)) return;
      seen.add(family);
      out.push(v);
    });
    return out;
  }

  function matchesFamily(value, familyValue) {
    if (value === familyValue) return true;
    return (FUEL_GROUPS[value] || value) === (FUEL_GROUPS[familyValue] || familyValue);
  }

  /** Self-explanatory sentences about what has no evidence at all. */
  function gapStatements(limit) {
    const list = Store.records();
    const fuels = uniqueFuelFamilies(Store.valuesFor('fuel'));
    const out = [];
    fuels.forEach((fuel) => {
      const sub = list.filter((r) => r.fuel === fuel);
      const oxy = [...new Set(sub.map((r) => r.oxygen_pct).filter((v) => v !== null))].sort((a, b) => a - b);
      const flow = [...new Set(sub.map((r) => r.airflow_cms).filter((v) => v !== null))].sort((a, b) => a - b);
      const empties = [];
      oxy.forEach((o) => flow.forEach((f) => {
        if (!sub.some((r) => r.oxygen_pct === o && r.airflow_cms === f)) {
          empties.push(o + '% O₂ at ' + f + ' cm/s');
        }
      }));
      if (empties.length) {
        out.push({
          fuel,
          fuelLabel: FUEL_GROUPS[fuel] || fuel,
          text: (FUEL_GROUPS[fuel] || fuel) + ': the records contain no test at ' +
            empties.slice(0, 3).join(', ') +
            (empties.length > 3 ? ', plus ' + (empties.length - 3) + ' further untested combinations.' : '.')
        });
      }
      const missingFields = sub.filter((r) => Store.countMissing(r) > 0).length;
      if (missingFields) {
        out.push({
          fuel,
          fuelLabel: FUEL_GROUPS[fuel] || fuel,
          text: (FUEL_GROUPS[fuel] || fuel) + ': ' + missingFields + ' of ' + sub.length +
            ' records have an empty comparable field, so they cannot take part in every comparison.'
        });
      }
    });
    return limit ? out.slice(0, limit) : out;
  }

  return {
    factor, factorLabel, displayValue, withinTolerance, pairVerdict, describePair,
    suggestPairs, factorEvidence, coverageGrid, gapStatements, CHECK_KEYS
  };
})();
