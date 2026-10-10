/* ==========================================================================
   shell.js — header, navigation, data-mode control, footer
   ========================================================================== */

const Shell = (function () {
  let releaseNavTrap = null;
  let navInertRegions = [];

  const NAV = [
    { name: 'overview', label: 'Overview', path: '#/', icon: 'layers', description: 'Start with the research workflow' },
    { name: 'explorer', label: 'Explorer', path: '#/explorer', icon: 'search', description: 'Find and select experiment records' },
    { name: 'compare', label: 'Compare', path: '#/compare', icon: 'compare', description: 'Check conditions across two tests' },
    { name: 'coverage', label: 'Coverage', path: '#/explorer?coverage=1', icon: 'grid', description: 'Inspect catalog counts and gaps' },
    { name: 'evidence', label: 'Evidence', path: '#/evidence', icon: 'book', description: 'Inspect observations and source availability' },
    { name: 'data-notes', label: 'Data notes', path: '#/data-notes', icon: 'book', description: 'Review sources, rules and limitations' }
  ];

  function headerHTML() {
    return '<div class="wrap header-inner">' +
      '<a class="brand" href="#/" aria-label="Flame in Freefall, Team CinderLens — back to overview">' +
        UI.brandMark(30) +
        '<span class="brand-text">' +
          '<span class="brand-name">CinderLens</span>' +
          '<span class="brand-sub">Flame in Freefall</span>' +
        '</span>' +
      '</a>' +
      '<button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="primary-nav" ' +
        'aria-label="Show navigation">' + UI.icon('menu', 18) + '</button>' +
      '<nav class="nav" id="primary-nav" aria-label="Primary">' +
        '<div class="nav-mobile-heading"><span>Research workspace</span><button class="btn-icon" id="nav-dismiss" aria-label="Close navigation">' + UI.icon('close', 18) + '</button></div>' +
        '<ul class="nav-list">' +
          NAV.map((n) => '<li><a class="nav-link" data-nav="' + n.name + '" href="' + n.path + '">' + UI.icon(n.icon, 18) + '<span>' + n.label + '<span class="nav-link-description">' + n.description + '</span></span></a></li>').join('') +
        '</ul>' +
      '</nav>' +
      '<div class="header-actions">' +
        '<button class="mode-chip" id="mode-chip" aria-label="Demonstration data status" aria-expanded="false" aria-haspopup="dialog">' +
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
            '<strong style="color:var(--tx-1);font-size:var(--fs-14)">CinderLens <span class="footer-brand-sub">Flame in Freefall</span></strong></div>' +
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
    closeMobileNav();
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
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        if (nav.classList.contains('is-open')) { closeMobileNav(); return; }
        closeModePopover();
        nav.classList.add('is-open');
        nav.setAttribute('role', 'dialog');
        nav.setAttribute('aria-modal', 'true');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Hide navigation');
        toggle.innerHTML = UI.icon('close', 18);
        document.body.classList.add('no-scroll');
        navInertRegions = ['main', 'app-strip', 'app-footer'].map((id) => document.getElementById(id)).filter(Boolean).map((el) => ({ el, inert: el.inert }));
        navInertRegions.forEach(({ el }) => { el.inert = true; });
        const dismiss = () => { closeMobileNav(); toggle.focus(); };
        const backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        backdrop.addEventListener('click', dismiss);
        document.body.appendChild(backdrop);
        releaseNavTrap = UI.trapFocus(nav, dismiss);
        nav.querySelector('a').focus();
      });
      document.getElementById('nav-dismiss').addEventListener('click', () => { closeMobileNav(); toggle.focus(); });
    }

    const chip = document.getElementById('mode-chip');
    if (chip) chip.addEventListener('click', (e) => { e.stopPropagation(); closeMobileNav(); toggleModePopover(chip); });

    const stripBtn = document.getElementById('strip-dismiss');
    if (stripBtn) stripBtn.addEventListener('click', () => {
      Store.state.demoCaveatHidden = true;
      render();
    });
  }

  function toggleModePopover(chip) {
    const existing = document.getElementById('mode-popover');
    if (existing) { closeModePopover(); return; }

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

    function close() { closeModePopover(); }
    const untrap = UI.trapFocus(pop, close);
    function onDoc(ev) { if (!pop.contains(ev.target) && !chip.contains(ev.target)) close(); }
    document.addEventListener('click', onDoc);
    pop.cleanup = () => { untrap(); document.removeEventListener('click', onDoc); };
  }

  function closeModePopover() {
    const pop = document.getElementById('mode-popover');
    if (!pop) return;
    if (pop.cleanup) pop.cleanup();
    pop.remove();
    const chip = document.getElementById('mode-chip');
    if (chip) { chip.setAttribute('aria-expanded', 'false'); chip.focus(); }
  }

  function setActiveNav(name) {
    const coverage = name === 'explorer' && Router.current().params.coverage === '1';
    document.querySelectorAll('.nav-link').forEach((a) => {
      const isActive = a.dataset.nav === (coverage ? 'coverage' : name) ||
        (name === 'record' && a.dataset.nav === 'explorer');
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function closeMobileNav() {
    navInertRegions.forEach(({ el, inert }) => { el.inert = inert; });
    navInertRegions = [];
    if (releaseNavTrap) { releaseNavTrap(); releaseNavTrap = null; }
    document.querySelector('.nav-backdrop')?.remove();
    const nav = document.getElementById('primary-nav');
    const toggle = document.getElementById('nav-toggle');
    if (nav && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      nav.removeAttribute('role');
      nav.removeAttribute('aria-modal');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Show navigation');
      toggle.innerHTML = UI.icon('menu', 18);
    }
    document.body.classList.remove('no-scroll');
  }

  document.addEventListener('keydown', (e) => {
    const nav = document.getElementById('primary-nav');
    if (e.key === 'Escape' && nav?.classList.contains('is-open')) { closeMobileNav(); document.getElementById('nav-toggle').focus(); }
  });
  document.addEventListener('click', (e) => {
    const header = document.getElementById('app-header');
    if (header && !header.contains(e.target)) closeMobileNav();
  });
  if (window.matchMedia) window.matchMedia('(max-width: 900px)').addEventListener('change', closeMobileNav);
  return { render, setActiveNav, closeMobileNav, closeModePopover, NAV };
})();
