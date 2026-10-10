/* Compact page disclosures and decorative WebGL scenes. No scientific model. */
const DashboardView = (function () {
  let scene = null, observer = null, root = null, screen = null;

  function reveal(target) {
    for (let parent = target?.parentElement; parent && parent !== root; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
  }

  function fold(element, label) {
    if (!element || element.closest('.compact-disclosure')) return;
    const disclosure = document.createElement('details');
    disclosure.className = 'compact-disclosure';
    const summary = document.createElement('summary');
    const heading = element.querySelector('h2,h3')?.cloneNode(true);
    heading?.querySelectorAll('.section-marker').forEach(el => el.remove());
    summary.textContent = label || 'Show ' + (heading?.textContent.trim() || 'additional details');
    disclosure.append(summary);
    element.before(disclosure);
    disclosure.append(element);
  }

  function compact() {
    if (screen === 'compare') {
      root.querySelectorAll('.pair-slot .cond-grid').forEach(el => fold(el, 'Show recorded conditions'));
      root.querySelectorAll('.comparison-outcomes').forEach(el => fold(el));
      fold(root.querySelector('.analysis-section .table-wrap'), 'Show the condition-by-condition match check');
    }
    if (screen === 'evidence') {
      root.querySelectorAll('.evidence-grid > .stack-lg:first-child > section:not(:first-child)').forEach(el => fold(el));
      root.querySelectorAll('.evidence-grid > :last-child > .card').forEach((el, i) => { if (i) fold(el); });
    }
    if (screen === 'record') {
      fold(root.querySelector('.record-profile .tag-row'), 'Show key conditions');
      root.querySelectorAll('.metadata-group:not(:first-child)').forEach(el => fold(el));
      root.querySelectorAll('.detail-grid > .stack-lg > section:not(:first-child)').forEach(el => fold(el));
      root.querySelectorAll('.detail-grid > aside > .card').forEach(el => fold(el));
    }
    if (screen === 'coverage') fold(root.querySelector('.coverage-workspace > .explorer'), 'Browse and filter the covered records');
    if (screen === 'overview') {
      root.querySelectorAll('.cinematic-overview > .section').forEach((el, i) => { if (i > 0) fold(el); });
      fold(root.querySelector('.readiness-section'));
    }
    if (screen === 'data-notes') {
      const content = root.querySelector('.notes-content');
      if (content && !content.dataset.compact) {
        content.dataset.compact = 'true';
        [...content.children].forEach(el => { el.hidden = el.id !== 'notes-overview'; });
      }
    }
  }

  function enhance() {
    compact();
    if (screen === 'overview') return; // Overview already owns its full scene.
    if (scene && !root.querySelector('.dashboard-scene')) { scene.destroy(); scene = null; }
    const head = root.querySelector('.page-head-inner');
    if (!head || head.querySelector('.dashboard-scene')) return;
    const figure = document.createElement('figure');
    figure.className = 'hero-scene dashboard-scene';
    figure.setAttribute('aria-label', 'Interactive 3D flame concept, illustrative artwork');
    figure.innerHTML = '<div class="hero-renderer"><canvas hidden aria-hidden="true"></canvas>' +
      '<svg class="hero-fallback" viewBox="0 0 180 130" role="img" aria-label="Decorative flame concept fallback"><ellipse cx="90" cy="95" rx="62" ry="15" fill="none" stroke="#65cbff"/><path d="M90 20C65 44 55 75 75 92C100 112 129 80 109 56Z" fill="#b97525" fill-opacity=".35" stroke="#ffb65c"/><path d="M90 49C72 68 83 93 98 85C112 75 95 58 90 49Z" fill="#ffe2a3"/></svg></div>' +
      '<figcaption><span>3D concept · illustrative only</span><button class="hero-motion" type="button" data-hero-motion hidden aria-pressed="false">Pause motion</button></figcaption>';
    head.append(figure);
    scene = HeroFlame.mount(figure);
  }

  function beforeAction(event) {
    const button = event.target.closest('[data-action], [data-notes-section]');
    if (!button) return;
    if (button.dataset.notesSection) {
      root.querySelectorAll('.notes-content > [id]').forEach(el => { el.hidden = el.id !== button.dataset.notesSection; });
    }
    const target = button.dataset.target || button.dataset.section;
    if (target) reveal(root.querySelector('#' + target));
  }

  function mount(container, name) {
    cleanup(); root = container; screen = name;
    fold(document.querySelector('.footer .footer-grid'), 'About CinderLens · navigation and research references');
    root.addEventListener('click', beforeAction, true);
    enhance();
    observer = new MutationObserver(enhance);
    observer.observe(root, { childList: true });
  }

  function cleanup() {
    observer?.disconnect(); observer = null;
    root?.removeEventListener('click', beforeAction, true);
    scene?.destroy(); scene = null; root = null;
  }
  return { mount, cleanup, reveal };
})();
