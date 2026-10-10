# CinderLens frontend implementation report

This report records the original refinement. The subsequent visual transformation, current validation
results and feature commits are documented in [the V2 report](ui-refinement-v2.md).

Implemented in the existing repository on 10 October 2026. No framework, runtime dependency,
backend, environment variable or deployment configuration was replaced. The implementation did not
deploy the application. Subsequent feature commits and Git publishing are recorded in repository history.

## Repository audit

The application is a buildless HTML/CSS/JavaScript frontend. There is no package.json, package
installation requirement or build command. index.html loads shared modules and six page modules;
router.js uses hash routes, store.js owns filters and selection, and matcher.js supplies deterministic
comparison verdicts and coverage counts. The catalog contains 26 existing illustrative records and
six comparison factors. Coverage is an Explorer view, not a separate route. NASA references are
background sources; no original experiment video or frame assets are supplied.

Inspected the entry point, all page and shared modules, catalog, matcher, tokens and styles, existing
smoke tests, README, design/backend notes and Vercel configuration before implementation. The existing
working tree was clean. The live application could not be fetched through the web tool; implementation
and browser verification used the local repository. Both existing NTRS reference URLs were checked.

## Changes by screen

| Area | Result |
| --- | --- |
| Overview | New two-column hero with explicitly labeled local SVG schematic; three functional workspace cards; shorter workflow, demonstration example, catalog counts, limitations, accurate roadmap and background references. Removed unverified challenge-date claims and contradictory verified-catalog wording. |
| Navigation | CinderLens branding, Overview/Explorer/Compare/Coverage/Data notes links, contextual evidence access, responsive menu with Escape/outside dismissal, active states, route focus and repaired skip link. Coverage uses the existing Explorer hash route. |
| Explorer | Search remains visible outside filters, including mobile. Search clearing works after typing. Numeric inputs support decimals and explain reversed ranges. Exact recorded-value buttons retain focus. Filter chips remove their own values. Records include demonstration status, illustrative observation and direct evidence actions. |
| Comparison selection | Two distinct records maximum; a third requires explicit removal instead of silently replacing a record. Tray offers individual removal, accurate readiness and a natively disabled action for one record. Selections persist locally. |
| Compare | Side-by-side panels show varied values, supporting conditions, illustrative observations and evidence actions. Header retains selection context. Match table distinguishes exact and approximate matches and explains each assessment. Counts replace fit percentages. Invalid factors/IDs get recovery explanations; reset slots and factor changes synchronize to the URL. |
| Evidence | Explicitly distinguishes illustrative observations, phase notes, unavailable original media and NASA background references. No file is claimed to exist based on demo descriptors. Citation copy confirms actual clipboard success and states demonstration status. |
| Record details | Semantic definition lists for identification and conditions, explicit media inventory, corrected demo-review provenance, copy-ID action, and preserved related-comparison navigation. |
| Coverage | Repaired malformed markup. Keyboard-operable cells filter their fuel family and recorded value. Counts remain based on the full demonstration catalog; missing cells state catalog gaps. Fuel-family gap calculations now align with the displayed grouping. |
| Data notes | Clear explanation of unvalidated heuristics, unchecked conditions, caveated comparisons and missing fields. Developer integration contracts are collapsed behind a disclosure. Wide tables and code examples support keyboard scrolling. |

## Shared components and design system

Improved existing recordCard, reviewedBadge, dataCaveatStrip, condition rows, selection tray,
match verdicts, empty states and schematic media components. Added shared focus trapping and
clipboard feedback helpers. No component framework was introduced.

Centralized tokens retain the deep navy, teal and ember identity, with more readable metadata,
stronger control borders, semantic aliases, larger hero type, consistent 44px controls, tabular
numbers, restrained borders and spacing. Desktop pages share the same page-header rhythm;
mobile uses stacked comparison panels, a focus-trapped filter drawer and visible page-level search.
Reduced-motion preferences disable transitions and smooth scrolling. Inline links use underlines.

## Scientific behavior and limitations

The catalog records, MATCH_RULES thresholds, pair ranking and pair verdict decisions are preserved.
All 4,056 existing ordered catalog pair/factor verdicts match the committed baseline. The changes
correct explanation text: larger numeric differences were previously described as inside tolerance,
and approximate matches were called exact. Verdict decisions have not been silently tightened.

The matcher checks fuel, geometry, thickness, flow direction, oxygen and airflow. It does not check
ignition, pressure or duration. Its 10% tolerance and maximum-difference rule are prototype heuristics,
not validated scientific thresholds. Missing supporting fields and differences outside tolerance can
still produce caveated acceptance under those rules. UI copy explains that this cannot establish
causation or isolate the selected factor. No fit percentage, confidence claim, prediction or model
output was added.

NASA extraction/integration, ML retrieval, computer vision and quantitative scientific validation
remain intentionally unimplemented. Media availability is illustrative metadata only. An accepted
comparison is not a verified scientific conclusion.

## Verification

QA dependencies were installed only in TEMP: jsdom, playwright-core and axe-core. They are not
application dependencies. Microsoft Edge was already installed; no browser was downloaded.
A temporary Python server served the repository at 127.0.0.1:8000 and was stopped after QA.

| Check | Command / method | Final result |
| --- | --- | --- |
| JavaScript syntax | node --check for every assets/js and tools JavaScript file | Passed |
| Interaction/regression suite | node tools/smoke-test.js with temporary NODE_PATH | All checks passed, including 4,056 baseline verdicts |
| Browser/layout suite | node tools/browser-test.js | Passed; no browser JavaScript errors |
| Responsive checks | 8 routes at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px | 72 layouts passed without page overflow |
| Browser interactions | Search/reset/empty results, modal filters, focus after rebuild, Escape, selection limits, comparison handoff, deep-link refresh, invalid IDs, missing media, coverage filtering, popover dismissal, reduced motion | Passed |
| Routing/keyboard | Skip link, browser back/forward, primary active state and keyboard filter trap | Passed |
| Accessibility scan | node tools/accessibility-test.js; WCAG 2 A/AA, 2.1 AA and 2.2 AA rules on 7 screens at 390 and 1440px | Zero automated violations in 14 scans |
| Visual inspection | Local Edge screenshots of full desktop overview/comparison and mobile Explorer | Completed |
| Asset/syntax checks | Local HTTP 200, loaded browser pages, JavaScript syntax and git diff --check | Passed |
| Production build | None exists: static files are the deployable application | Not applicable |

The first smoke run found three failing legacy assertions: two used selectors that now also matched
tray removal controls, and one depended on superseded media copy. Those assertions were updated and
specific behavioral regressions added. The first accessibility scan found inline-link differentiation
and keyboard-scroll issues; both were fixed before the passing final scan. No final test failures
remain.

Automated accessibility checks and keyboard tests do not constitute full WCAG certification. Real
mobile hardware, every assistive technology, live Vercel deployment and clipboard permissions across
all browsers were not tested. There are no known blocking frontend issues from the completed checks.

## Important files

- assets/css/{tokens,base,components,pages,responsive}.css: shared design language and device layouts.
- assets/js/pages/{overview,explorer,compare,evidence,record,dataNotes}.js: all six experiences.
- assets/js/{ui,shell,main,store,router}.js: shared rendering, accessibility, navigation and state.
- assets/js/matcher.js: accurate explanatory text and consistent fuel-family gap counting; verdicts unchanged.
- assets/js/data/catalog.js: generic abstention copy only; experiment records and thresholds unchanged.
- tools/{smoke-test,browser-test,accessibility-test}.js: reproducible verification.
- README.md and docs/design-notes.md: current behaviors, running QA and scientific limitations.

Hash routing and vercel.json remain intact. Application assets remain local and dependency-free.
