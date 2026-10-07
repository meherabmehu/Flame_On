/* ==========================================================================
   shell.js — header, navigation, data-mode control, footer
   ========================================================================== */

const Shell = (function () {

  const NAV = [
    { name: 'overview', label: 'Overview', path: '#/' },
    { name: 'explorer', label: 'Explorer', path: '#/explorer' },
    { name: 'compare', label: 'Comparison', path: '#/compare' },
    { name: 'evidence', label: 'Evidence', path: '#/evidence' },
    { name: 'data-notes', label: 'Data notes', path: '#/data-notes' }
  ];

  function headerHTML() {
    return '<div class="wrap header-inner">' +
      '<a class="brand" href="#/" aria-label="Flame in Freefall, Team CinderLens — back to overview">' +
        UI.brandMark(30) +
        '<span class="brand-text">' +
          '<span class="brand-name">Flame in Freefall</span>' +
          '<span class="brand-sub">Team CinderLens</span>' +
        '</span>' +
      '</a>' +
      '<button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="primary-nav" ' +
        'aria-label="Show navigation">' + UI.icon('grid', 18) + '</button>' +
      '<nav class="nav" id="primary-nav" aria-label="Primary">' +
        '<ul class="nav-list">' +
          NAV.map((n) => '<li><a class="nav-link" data-nav="' + n.name + '" href="' + n.path + '">' + n.label + '</a></li>').join('') +
        '</ul>' +
      '</nav>' +
      '<div class="header-actions">' +
        '<button class="mode-chip" id="mode-chip" aria-expanded="false" aria-haspopup="dialog">' +
          '<span class="dot ' + (Store.state.dataMode === 'demo' ? 'dot-ember' : 'dot-warn') + '"></span>' +
          '<span class="mode-text">' + (Store.state.dataMode === 'demo' ? 'Demo data' : 'No data') + '</span>' +
        '</button>' +
      '</div>' +
    '</div>';
  }

  function footerHTML() {
    return '<div class="wrap">' +
      '<div class="footer-grid">' +
        '<div>' +
          '<div class="row" style="gap:10px">' + UI.brandMark(26) +
            '<strong style="color:var(--tx-1);font-size:var(--fs-14)">Flame in Freefall</strong></div>' +
          '<p class="mt-3" style="max-width:44ch">' +
            'A question-led explorer across recorded microgravity combustion conditions. ' +
            'It shows what tests exist, what they recorded, and where the evidence stops.</p>' +
          '<p class="mt-3"><span class="badge badge-ember">' + UI.esc(COPY.demoTag) + ' BUILD</span></p>' +
        '</div>' +
        '<div>' +
          '<h4>Screens</h4>' +
          '<ul>' + NAV.map((n) => '<li><a href="' + n.path + '">' + n.label + '</a></li>').join('') + '</ul>' +
        '</div>' +
        '<div>' +
          '<h4>NASA sources to revisit</h4>' +
          '<ul>' +
            '<li><a href="https://ntrs.nasa.gov/citations/20160000593" target="_blank" rel="noopener">' +
              'BASS-II results overview · NTRS 20160000593 ' + UI.icon('external', 12) + '</a></li>' +
            '<li><a href="https://ntrs.nasa.gov/citations/20210011385" target="_blank" rel="noopener">' +
              'BASS-II summary report · NTRS 20210011385 ' + UI.icon('external', 12) + '</a></li>' +
            '<li><a href="https://www.nasa.gov/physical-sciences-informatics-psi/" target="_blank" rel="noopener">' +
              'NASA PSI · BASS-II investigation ' + UI.icon('external', 12) + '</a></li>' +
            '<li><a href="https://www.nasa.gov/" target="_blank" rel="noopener">' +
              '2026 Flame in Freefall challenge page ' + UI.icon('external', 12) + '</a></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<span>Prototype for the 2026 NASA Space Apps Challenge · Team CinderLens</span>' +
        '<span>Demonstration interface. No NASA measurements are reproduced as results.</span>' +
      '</div>' +
    '</div>';
  }

  function render() {
    document.getElementById('app-header').innerHTML = headerHTML();
    document.getElementById('app-footer').innerHTML = footerHTML();
    const strip = document.getElementById('app-strip');
    strip.innerHTML = Store.state.demoCaveatHidden ? '' : UI.dataCaveatStrip();
    wire();
  }

  function wire() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Hide navigation' : 'Show navigation');
        // Stop the page scrolling behind the open menu on a phone.
        document.body.classList.toggle('no-scroll', open);
      });
    }

    const chip = document.getElementById('mode-chip');
    if (chip) chip.addEventListener('click', (e) => { e.stopPropagation(); toggleModePopover(chip); });

    const stripBtn = document.getElementById('strip-dismiss');
    if (stripBtn) stripBtn.addEventListener('click', () => {
      Store.state.demoCaveatHidden = true;
      render();
    });
  }

  function toggleModePopover(chip) {
    const existing = document.getElementById('mode-popover');
    if (existing) { existing.remove(); chip.setAttribute('aria-expanded', 'false'); return; }

    const pop = document.createElement('div');
    pop.className = 'popover';
    pop.id = 'mode-popover';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Data source status');
    pop.innerHTML =
      '<div class="popover-head">' +
        '<h3>Where this data comes from</h3>' +
        '<button class="btn-icon" id="popover-close" aria-label="Close">' + UI.icon('close', 16) + '</button>' +
      '</div>' +
      '<p>' + UI.esc(COPY.datasetCaveat) + '</p>' +
      '<p>' + UI.esc(COPY.noProvenance) + '</p>' +
      '<p class="mt-4"><strong class="tx-1">Switch dataset state</strong></p>' +
      '<div class="row mt-2">' +
        '<button class="btn btn-sm" data-action="set-mode" data-mode="demo" ' +
          (Store.state.dataMode === 'demo' ? 'aria-disabled="true"' : '') + '>Demonstration records</button>' +
        '<button class="btn btn-sm" data-action="set-mode" data-mode="empty" ' +
          (Store.state.dataMode === 'empty' ? 'aria-disabled="true"' : '') + '>Empty catalog</button>' +
      '</div>' +
      '<p class="mt-3">The empty state is included on purpose: the interface must never imply that missing records were tested.</p>';
    document.body.appendChild(pop);
    chip.setAttribute('aria-expanded', 'true');
    document.getElementById('popover-close').addEventListener('click', close);
    document.getElementById('popover-close').focus();

    function close() { pop.remove(); chip.setAttribute('aria-expanded', 'false'); chip.focus(); }
    setTimeout(() => {
      document.addEventListener('click', function onDoc(ev) {
        if (!pop.contains(ev.target) && ev.target !== chip) { close(); document.removeEventListener('click', onDoc); }
      });
    }, 0);
  }

  function setActiveNav(name) {
    document.querySelectorAll('.nav-link').forEach((a) => {
      const isActive = a.dataset.nav === name ||
        (name === 'record' && a.dataset.nav === 'explorer');
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function closeMobileNav() {
    const nav = document.getElementById('primary-nav');
    const toggle = document.getElementById('nav-toggle');
    if (nav && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Show navigation');
    }
    document.body.classList.remove('no-scroll');
  }

  return { render, setActiveNav, closeMobileNav, NAV };
})();
