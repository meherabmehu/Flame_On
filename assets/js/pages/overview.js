/* Overview: clear entry points and a transparent demonstration boundary. */
const OverviewPage = (function () {
  function researchVisual() {
    return '<figure class="research-visual chamber-visual"><div class="visual-label"><span>RESEARCH / CONCEPT DIAGRAM</span><span>ILLUSTRATION ONLY</span></div>' +
      '<svg viewBox="0 0 520 400" role="img" aria-label="Conceptual flame inside a research chamber; not a measured flame or experiment footage"><defs>' +
      '<radialGradient id="chamber-glow"><stop stop-color="#eeb065" stop-opacity=".18"/><stop offset="1" stop-color="#eeb065" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="flame-glow"><stop stop-color="#ffdb9a" stop-opacity=".6"/><stop offset=".6" stop-color="#edaa4a" stop-opacity=".22"/><stop offset="1" stop-color="#edaa4a" stop-opacity="0"/></radialGradient>' +
      '<pattern id="chamber-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#52647c" stroke-opacity=".12"/></pattern></defs>' +
      '<rect width="520" height="400" fill="url(#chamber-grid)"/><circle cx="260" cy="202" r="168" fill="url(#chamber-glow)"/>' +
      '<g fill="none" stroke="#52647c"><circle cx="260" cy="202" r="145"/><circle cx="260" cy="202" r="125" stroke-dasharray="2 8" opacity=".5"/><path d="M260 42v25m0 270v25M99 202h26m270 0h26"/>' +
      '<ellipse cx="260" cy="202" rx="168" ry="63" transform="rotate(-28 260 202)" stroke="#3ed6c4" opacity=".4"/></g>' +
      '<circle cx="260" cy="202" r="91" fill="url(#flame-glow)"/><path d="M260 126c-43 20-60 57-48 94 10 34 68 41 94 7 21-27-9-77-46-101Z" fill="#edaa4a" fill-opacity=".08" stroke="#edaa4a" stroke-opacity=".85" stroke-width="1.5"/>' +
      '<path d="M261 165c-26 11-36 33-29 53 6 19 37 23 51 5 11-15-3-44-22-58Z" fill="#f7c982" fill-opacity=".18" stroke="#f7c982" stroke-opacity=".6"/>' +
      '<rect x="232" y="249" width="56" height="8" rx="2" fill="#8593ab"/><g stroke="#8593ab" fill="none"><path d="M324 150h65v-24M301 251h95v30M139 204H71v-32"/></g>' +
      '<g fill="#b3c1d8" font-family="monospace" font-size="10"><text x="353" y="118">O₂ / AIRFLOW</text><text x="352" y="298">SAMPLE</text><text x="38" y="163">CONDITIONS</text></g>' +
      '<circle cx="111" cy="225" r="3" fill="#3ed6c4"/><circle cx="405" cy="167" r="3" fill="#3ed6c4"/></svg>' +
      '<figcaption>Conditions → comparison → evidence<span>Concept diagram. No measured flame data.</span></figcaption></figure>';
  }
  function section(kicker, title, body, subtitle) {
    return '<section class="section"><div class="wrap"><div class="section-head"><div><p class="eyebrow">' + kicker + '</p><h2>' + title + '</h2>' + (subtitle ? '<p>' + subtitle + '</p>' : '') + '</div></div>' + body + '</div></section>';
  }
  function render(route, container) {
    const rows = Store.records();
    const paths = [
      ['search', 'Explore experiments', 'Find records by material, shape, oxygen or airflow. See missing conditions before you compare.', '#/explorer', 'Browse the catalog'],
      ['compare', 'Compare conditions', 'Choose two demonstration tests. Review the varied factor and every remaining difference.', '#/compare', 'Open the workspace'],
      ['book', 'Inspect evidence', 'Review illustrative observations, media availability and the limits of their provenance.', '#/evidence', 'Review evidence']
    ];
    const workflow = [
      ['01', 'Find relevant tests', 'Search and filter the demonstration catalog.', '#/explorer'],
      ['02', 'Choose a pair', 'Select two distinct records and a factor to vary.', '#/compare'],
      ['03', 'Check the conditions', 'Review exact matches, numeric tolerances and unknown fields.', '#/compare'],
      ['04', 'Follow the evidence', 'Inspect the record and what remains unverified.', '#/evidence']
    ];
    const sources = [
      ['BASS-II results overview', 'NTRS · 20160000593', 'https://ntrs.nasa.gov/citations/20160000593'],
      ['BASS-II summary report', 'NTRS · 20210011385', 'https://ntrs.nasa.gov/citations/20210011385'],
      ['Physical Sciences Informatics', 'NASA · reference resource', 'https://www.nasa.gov/physical-sciences-informatics-psi/']
    ];
    container.innerHTML = '<section class="hero"><div class="wrap hero-inner"><div class="hero-copy">' +
      '<p class="eyebrow"><span class="dot dot-teal"></span> Microgravity combustion research</p>' +
      '<h1>Understand fire<br><span>beyond gravity.</span></h1>' +
      '<p class="lead">Explore experiment conditions, compare illustrative flame behavior, and see exactly where the evidence stops.</p>' +
      '<div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/explorer">Explore experiments ' + UI.icon('chevron', 17) + '</a><a class="btn btn-lg" href="#/compare">' + UI.icon('compare', 17) + ' Compare tests</a></div>' +
      '<div class="hero-meta"><span>' + UI.icon('layers', 14) + ' ' + rows.length + ' demonstration records</span><span>' + UI.icon('shield', 14) + ' Evidence before conclusions</span></div></div>' +
      researchVisual() + '</div></section>' +
      '<div class="wrap prototype-note">' + UI.icon('info', 18) + '<p><strong>Interactive prototype.</strong> Illustrative experiment records only. Verified NASA experiment data has not yet been integrated.</p><a href="#/data-notes">Data notes ' + UI.icon('chevron', 14) + '</a></div>' +
      section('Your research workspace', 'Start with a question. Follow the record.', '<div class="grid grid-3">' + paths.map((p) => '<a class="workspace-card" href="' + p[3] + '"><span class="card-icon">' + UI.icon(p[0], 22) + '</span><h3>' + p[1] + '</h3><p>' + p[2] + '</p><span class="workspace-action">' + p[4] + ' ' + UI.icon('chevron', 15) + '</span></a>').join('') + '</div>') +
      section('A transparent workflow', 'One factor at a time.', '<div class="flow-steps">' + workflow.map((w) => '<a class="flow-step" href="' + w[3] + '"><span class="flow-step-num">' + w[0] + '</span><h3>' + w[1] + '</h3><p>' + w[2] + '</p></a>').join('') + '</div>' +
      '<div class="example-panel"><div><p class="eyebrow">Try a demonstration</p><h3>For one fuel and shape, what happened at low airflow versus a higher tested speed?</h3><p>The workspace explains which conditions match and which differences limit the comparison.</p></div><div class="stack-sm"><button class="btn btn-primary" data-action="prefill" data-a="BASS2-T101" data-b="BASS2-T102" data-factor="airflow_cms">Open this comparison ' + UI.icon('chevron', 15) + '</button><button class="btn" data-action="prefill" data-a="BASS2-T101" data-b="BASS2-T137" data-factor="airflow_cms">See a rejected pair</button></div></div>') +
      section('Catalog coverage', 'See what is represented. Know what is missing.', '<div class="stat-strip">' + [[rows.length, 'illustrative records'], [FACTORS.length, 'comparison factors'], [rows.filter((r) => Store.countMissing(r)).length, 'records with missing conditions'], [new Set(rows.map((r) => r.geometry)).size, 'sample geometries']].map((s) => '<div class="stat"><div class="stat-value">' + s[0] + '</div><div class="stat-label">' + s[1] + '</div></div>').join('') + '</div><div class="row mt-6"><a class="btn" href="#/explorer?coverage=1">' + UI.icon('grid', 16) + ' Inspect demo coverage</a><p class="muted">A missing combination is a catalog gap, never a physical result.</p></div>', 'Counts describe the demonstration catalog, not the full NASA archive.') +
      section('Scientific transparency', 'The limits belong beside the result.', '<div class="honesty-grid"><div class="card card-lg"><h3>What this build does</h3><ul class="honesty-list mt-4">' + ['Filters existing illustrative records by indexed conditions.', 'Checks records using deterministic prototype rules.', 'Lists condition differences and missing fields.', 'Presents observation structure and reference resources.'].map((t) => '<li class="honesty-item">' + UI.icon('check', 16) + '<span>' + t + '</span></li>').join('') + '</ul></div><div class="card card-lg"><h3>What it deliberately does not do</h3><ul class="honesty-list mt-4">' + ['Predict fire risk in untested conditions.', 'Present demo observations as verified NASA findings.', 'Produce ML or computer-vision measurements.', 'Treat a rule-based match as scientific validation.'].map((t) => '<li class="honesty-item">' + UI.icon('alert', 16) + '<span>' + t + '</span></li>').join('') + '</ul><a class="btn btn-sm mt-5" href="#/data-notes">Read the matching rules</a></div></div>') +
      '<section class="readiness-section"><div class="wrap"><div class="readiness-heading"><p class="eyebrow">Product readiness</p><h2>Available today. Clear about what comes next.</h2></div><div class="grid grid-3">' + [['Available', 'badge-teal', 'Frontend prototype', 'Demonstration catalog, Explorer, rule-based comparison, evidence layouts and demo coverage.'], ['Not integrated', 'badge-warn', 'Verified catalog', 'NASA extraction, provenance checks and quantitative scientific validation remain future work.'], ['Not implemented', 'badge-unknown', 'Model capabilities', 'ML retrieval and computer vision are planned concepts. No model has been trained or evaluated.']].map((r) => '<div class="card"><span class="badge ' + r[1] + '">' + r[0] + '</span><h3 class="mt-4">' + r[2] + '</h3><p class="mt-3">' + r[3] + '</p></div>').join('') + '</div></div></section>' +
      section('Reference library', 'Explore the published research.', '<div class="card card-lg">' + sources.map((s) => '<div class="source-item"><div><h3>' + s[0] + '</h3><p>' + s[1] + '</p></div><a class="btn btn-sm" href="' + s[2] + '" target="_blank" rel="noopener">Open NASA reference ' + UI.icon('external', 14) + '</a></div>').join('') + '</div>', 'Background references only. These reports do not verify the invented records or observations in this prototype.') +
      '<section class="section"><div class="wrap"><div class="final-cta"><div><p class="eyebrow">CinderLens / Flame in Freefall</p><h2>Your next question starts with a record.</h2></div><a class="btn btn-primary btn-lg" href="#/explorer">Explore experiments ' + UI.icon('chevron', 16) + '</a></div></div></section>';
  }
  return { render };
})();
