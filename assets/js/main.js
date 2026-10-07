/* ==========================================================================
   main.js — application bootstrap
   --------------------------------------------------------------------------
   Owns: page registry, routing, delegated actions, keyboard shortcuts and the
   global "dataset state" switch. Page modules own their own rendering.
   ========================================================================== */

const App = (function () {

  const PAGES = {
    overview: OverviewPage,
    explorer: ExplorerPage,
    compare: ComparePage,
    evidence: EvidencePage,
    record: RecordPage,
    'data-notes': DataNotesPage
  };

  let currentPage = null;
  let route = Router.parse();
  let booted = false;

  /* ------------------------------------------------------------ rendering */

  function renderRoute(r) {
    route = r;
    const main = document.getElementById('main');
    const page = PAGES[r.name];

    Shell.closeMobileNav();

    if (!page) {
      main.innerHTML = '<div class="wrap section">' + UI.state({
        icon: 'search',
        title: 'That screen does not exist',
        message: 'The address “' + UI.esc(r.path) + '” is not part of this prototype. The navigation above lists every available screen.',
        action: '<a class="btn btn-sm btn-primary" href="#/explorer">Go to the experiment explorer</a>'
      }) + '</div>';
      Shell.setActiveNav('none');
      currentPage = null;
      document.title = 'Not found · Flame in Freefall';
      return;
    }

    currentPage = page;
    // Pages normally write straight into <main>; a returned string is also
    // accepted so a page can stay a pure render function if it prefers.
    const output = page.render(r, main);
    if (typeof output === 'string') main.innerHTML = output;
    else if (output && output.html) main.innerHTML = output.html;
    Shell.setActiveNav(r.name);
    document.title = titleFor(r) + ' · Flame in Freefall';

    const heading = main.querySelector('h1');
    if (heading) { heading.setAttribute('tabindex', '-1'); }
  }

  function titleFor(r) {
    switch (r.name) {
      case 'overview': return 'Overview';
      case 'explorer': return 'Experiment explorer';
      case 'compare': return 'Comparison workspace';
      case 'evidence': return r.id ? 'Evidence · ' + r.id : 'Evidence and results';
      case 'record': return r.id ? 'Record · ' + r.id : 'Experiment detail';
      case 'data-notes': return 'Data notes';
      default: return 'Flame in Freefall';
    }
  }

  /* -------------------------------------------------------- delegated UX */

  function bindGlobalActions() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;

      // Page-level actions first.
      if (currentPage && currentPage.actions && currentPage.actions[action]) {
        if (el.getAttribute('aria-disabled') === 'true') return;
        e.preventDefault();
        currentPage.actions[action](el, e);
        return;
      }

      switch (action) {
        case 'load-demo':
          e.preventDefault();
          Store.set({ dataMode: 'demo' });
          renderRoute(route);
          UI.toast('Demonstration records loaded.');
          break;

        case 'set-mode': {
          e.preventDefault();
          const mode = el.dataset.mode;
          Store.set({ dataMode: mode });
          const pop = document.getElementById('mode-popover');
          if (pop) pop.remove();
          Shell.render();
          renderRoute(route);
          UI.toast(mode === 'empty'
            ? 'Catalog set to empty. The interface now shows how it behaves without records.'
            : 'Demonstration records loaded.', mode === 'empty' ? 'warn' : 'info');
          break;
        }

        case 'clear-filters':
          e.preventDefault();
          Store.resetFilters();
          renderRoute(route);
          break;

        case 'prefill': {
          e.preventDefault();
          const { a, b } = el.dataset;
          const factor = el.dataset.factor || 'airflow_cms';
          Store.setCompare({ a, b, factor });
          Router.go('/compare?a=' + a + '&b=' + b + '&factor=' + factor);
          break;
        }

        default:
          break;
      }
    });

    // Keyboard: "/" focuses the explorer search field.
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === '/') {
        if (route.name !== 'explorer') {
          e.preventDefault();
          Router.go('/explorer');
          setTimeout(() => {
            const s = document.getElementById('explorer-search');
            if (s) s.focus();
          }, 260);
        } else {
          const s = document.getElementById('explorer-search');
          if (s) { e.preventDefault(); s.focus(); }
        }
      }
      if (e.key === 'Escape') {
        const pop = document.getElementById('mode-popover');
        if (pop) pop.remove();
      }
    });
  }

  /* ----------------------------------------------------------------- boot */

  function boot() {
    // Guard: boot may be triggered both by the DOMContentLoaded listener and,
    // in embedded contexts, by a host page calling App.boot() directly.
    if (booted) return;
    booted = true;

    Shell.render();
    bindGlobalActions();
    Router.onChange(renderRoute);

    if (CATALOG_META.demo) {
      console.info(
        '%cFlame in Freefall — demonstration build',
        'color:#edaa4a;font-weight:600',
        '\nRecords in assets/js/data/catalog.js are illustrative demonstration rows, not extracted NASA data.' +
        '\nSee #/data-notes for the honesty table and backend connection points.'
      );
    }
  }

  return { boot, renderRoute, PAGES };
})();

/* --------------------------------------------------------------------------
   Public surface.
   Exposed on purpose: a Django template can hand server-rendered records to
   the frontend (window.CinderLens.Store), and the team can inspect state from
   the browser console while demonstrating.
   -------------------------------------------------------------------------- */
window.CinderLens = {
  App: App,
  Store: Store,
  Matcher: Matcher,
  Router: Router,
  UI: UI,
  CATALOG: CATALOG,
  CATALOG_META: CATALOG_META,
  FACTORS: FACTORS,
  MATCH_RULES: MATCH_RULES
};

document.addEventListener('DOMContentLoaded', App.boot);
