/* ==========================================================================
   router.js — hash routing
   --------------------------------------------------------------------------
   Routes (deliberately URL-addressable so a Django backend can render the
   same views server-side later):

     #/                       project overview
     #/explorer               experiment explorer (filters + records)
     #/compare                comparison workspace
     #/compare?a=ID&b=ID&f=K  deep link to a prepared comparison
     #/evidence/:id           evidence & results view for one record
     #/record/:id             experiment detail
     #/data-notes             demonstration data + backend connection notes
   ========================================================================== */

const Router = (function () {
  let handler = null;

  function parse() {
    const raw = (location.hash || '#/').replace(/^#/, '');
    const [path, query] = raw.split('?');
    const params = {};
    new URLSearchParams(query || '').forEach((v, k) => { params[k] = v; });

    const parts = path.split('/').filter(Boolean);
    const name = parts[0] || 'overview';
    return {
      name,
      id: parts[1] ? decodeURIComponent(parts[1]) : null,
      params,
      path: raw
    };
  }

  function go(path) {
    if (location.hash === '#' + path) {
      handle();
      return;
    }
    location.hash = path;
  }

  function handle() {
    const route = parse();
    if (handler) handler(route);
    if (typeof window.scrollTo === 'function') {
      try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) { /* older engines ignore options */ }
    }
  }

  function onChange(fn) {
    handler = fn;
    window.addEventListener('hashchange', handle);
    handle();
  }

  function link(path) { return '#' + path; }

  return { parse, go, onChange, link, current: parse };
})();
