/* Overview: clear entry points and a transparent demonstration boundary. */
const OverviewPage = (function () {
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
      '<figure class="research-visual"><div class="visual-label"><span>EXPERIMENT / SCHEMATIC</span><span>ILLUSTRATION ONLY</span></div>' +
      '<svg viewBox="0 0 520 360" role="img" aria-label="Decorative flame in a research duct; not experiment footage"><defs><pattern id="research-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="#2a3950" stroke-opacity=".45"/></pattern></defs><rect width="520" height="360" fill="url(#research-grid)"/>' +
      '<g fill="none" stroke="#52647c"><path d="M52 76H468M52 286H468"/><path d="M62 67v18M458 67v18M62 277v18M458 277v18"/><path d="M260 50v255" stroke-dasharray="3 8" opacity=".4"/></g>' +
      '<g fill="none" stroke="#3ed6c4" stroke-width="1.5"><path d="M62 155h94m-8-5 8 5-8 5M62 185h114m-8-5 8 5-8 5M62 215h94m-8-5 8 5-8 5" opacity=".7"/></g>' +
      '<path d="M236 244c-38-34-44-74-11-110 21-24 27-44 29-65 45 30 72 69 64 108-4 29-29 43-33 67Z" fill="#edaa4a" fill-opacity=".10" stroke="#edaa4a" stroke-width="2"/><path d="M253 244c-18-24-24-45-8-70 10-15 17-23 17-39 27 25 34 45 26 67-4 13-16 24-17 42" fill="#edaa4a" fill-opacity=".22" stroke="#f7c982"/>' +
      '<rect x="205" y="248" width="136" height="10" rx="3" fill="#52647c"/><path d="M347 235h49v-21M322 121h74v-18" stroke="#8593ab" fill="none"/><g fill="#b3c1d8" font-family="monospace" font-size="11"><text x="63" y="133">FLOW →</text><text x="354" y="202">FLAME</text><text x="355" y="97">O₂ SETTING</text><text x="205" y="279">SAMPLE GEOMETRY</text></g></svg>' +
      '<figcaption>Conditions → comparison → evidence<span>Concept diagram. No measured flame data.</span></figcaption></figure></div></section>' +
      '<div class="wrap prototype-note">' + UI.icon('info', 18) + '<p><strong>Interactive prototype.</strong> Illustrative experiment records only. Verified NASA experiment data has not yet been integrated.</p><a href="#/data-notes">Data notes ' + UI.icon('chevron', 14) + '</a></div>' +
      section('Your research workspace', 'Start with a question. Follow the record.', '<div class="grid grid-3">' + paths.map((p) => '<a class="workspace-card" href="' + p[3] + '"><span class="card-icon">' + UI.icon(p[0], 22) + '</span><h3>' + p[1] + '</h3><p>' + p[2] + '</p><span class="workspace-action">' + p[4] + ' ' + UI.icon('chevron', 15) + '</span></a>').join('') + '</div>') +
      section('A transparent workflow', 'One factor at a time.', '<div class="flow-steps">' + workflow.map((w) => '<a class="flow-step" href="' + w[3] + '"><span class="flow-step-num">' + w[0] + '</span><h3>' + w[1] + '</h3><p>' + w[2] + '</p></a>').join('') + '</div>' +
      '<div class="example-panel"><div><p class="eyebrow">Try a demonstration</p><h3>For one fuel and shape, what happened at low airflow versus a higher tested speed?</h3><p>The workspace explains which conditions match and which differences limit the comparison.</p></div><div class="stack-sm"><button class="btn btn-primary" data-action="prefill" data-a="BASS2-T101" data-b="BASS2-T102" data-factor="airflow_cms">Open this comparison ' + UI.icon('chevron', 15) + '</button><button class="btn" data-action="prefill" data-a="BASS2-T101" data-b="BASS2-T137" data-factor="airflow_cms">See a rejected pair</button></div></div>') +
      section('Catalog coverage', 'See what is represented. Know what is missing.', '<div class="stat-strip">' + [[rows.length, 'illustrative records'], [FACTORS.length, 'comparison factors'], [rows.filter((r) => Store.countMissing(r)).length, 'records with missing conditions'], [new Set(rows.map((r) => r.geometry)).size, 'sample geometries']].map((s) => '<div class="stat"><div class="stat-value">' + s[0] + '</div><div class="stat-label">' + s[1] + '</div></div>').join('') + '</div><div class="row mt-6"><a class="btn" href="#/explorer?coverage=1">' + UI.icon('grid', 16) + ' Inspect demo coverage</a><p class="muted">A missing combination is a catalog gap, never a physical result.</p></div>', 'Counts describe the demonstration catalog, not the full NASA archive.') +
      section('Scientific transparency', 'The limits belong beside the result.', '<div class="honesty-grid"><div class="card card-lg"><h3>What this build does</h3><ul class="honesty-list mt-4">' + ['Filters existing illustrative records by indexed conditions.', 'Checks records using deterministic prototype rules.', 'Lists condition differences and missing fields.', 'Presents observation structure and reference resources.'].map((t) => '<li class="honesty-item">' + UI.icon('check', 16) + '<span>' + t + '</span></li>').join('') + '</ul></div><div class="card card-lg"><h3>What it deliberately does not do</h3><ul class="honesty-list mt-4">' + ['Predict fire risk in untested conditions.', 'Present demo observations as verified NASA findings.', 'Produce ML or computer-vision measurements.', 'Treat a rule-based match as scientific validation.'].map((t) => '<li class="honesty-item">' + UI.icon('alert', 16) + '<span>' + t + '</span></li>').join('') + '</ul><a class="btn btn-sm mt-5" href="#/data-notes">Read the matching rules</a></div></div>') +
      section('Product roadmap', 'Available today. Clear about what comes next.', '<div class="grid grid-3">' + [['Available', 'badge-teal', 'Frontend prototype', 'Demonstration catalog, Explorer, rule-based comparison, evidence layouts and demo coverage.'], ['Not integrated', 'badge-warn', 'Verified catalog', 'NASA extraction, provenance checks and quantitative scientific validation remain future work.'], ['Not implemented', 'badge-unknown', 'Model capabilities', 'ML retrieval and computer vision are planned concepts. No model has been trained or evaluated.']].map((r) => '<div class="card"><span class="badge ' + r[1] + '">' + r[0] + '</span><h3 class="mt-4">' + r[2] + '</h3><p class="mt-3">' + r[3] + '</p></div>').join('') + '</div>') +
      section('Reference library', 'Explore the published research.', '<div class="card card-lg">' + sources.map((s) => '<div class="source-item"><div><h3>' + s[0] + '</h3><p>' + s[1] + '</p></div><a class="btn btn-sm" href="' + s[2] + '" target="_blank" rel="noopener">Open NASA reference ' + UI.icon('external', 14) + '</a></div>').join('') + '</div>', 'Background references only. These reports do not verify the invented records or observations in this prototype.') +
      '<section class="section"><div class="wrap"><div class="final-cta"><div><p class="eyebrow">CinderLens / Flame in Freefall</p><h2>Your next question starts with a record.</h2></div><a class="btn btn-primary btn-lg" href="#/explorer">Explore experiments ' + UI.icon('chevron', 16) + '</a></div></div></section>';
  }
  return { render };
})();
