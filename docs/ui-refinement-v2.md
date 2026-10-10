# CinderLens UI/UX refinement V2

Completed in the existing static frontend on 10 October 2026. Changes were committed and pushed
separately by feature at the user's request. No runtime library, external font, framework, build
pipeline or deployment change was introduced.

## Page improvements

| Area | Result |
| --- | --- |
| Compare | A full-width workspace puts six compact factor controls above mirrored A/B panels. Actual varied values are prominent. Numeric tracks compare the magnitudes of the two recorded settings only; the caption explicitly excludes flame response and confidence. Condition Match Analysis shows the existing verdict, five controlled-condition counts, actual differences, unknowns, and a plain-language explanation. Suggestions, rejection reasons and rule references have native disclosures. |
| Explorer | Compact records lead with oxygen, airflow and thickness, followed by material, geometry and direction. Actions retain selection, record and evidence access. Advanced filters group direction and completeness. Selected checkboxes and exact-value controls have explicit states. Search stays outside the mobile drawer; sorting, filter removal and coverage selection retain keyboard context. |
| Homepage | A local SVG research-chamber illustration is labeled as a concept, never source footage. Connected workflow steps, a demonstration comparison, a flat catalog-count strip, concise readiness cards and restrained reference rows share a consistent rhythm. All entry links and both comparison examples work. |
| Evidence | Media availability, source extraction and demo-review status appear before illustrative observations. A key-condition strip and section buttons support inspection. Original footage is explicitly unavailable; schematics are optional. Missing-media records retain a visible empty state. Proposed interpretation and unimplemented measurements remain separate disclosures. |
| Coverage | Fuel-family rows and oxygen/airflow columns have explicit labels and units. Discrete cells retain actual counts, native tooltips and filter actions. An accessible live detail panel reveals indexed record IDs on hover or focus. Dashed empty cells mean no indexed demo record. An unknown-value cell explicitly describes the existing broader missing-condition filter action. |
| Records | Key conditions precede the dossier. Numbered identification and condition groups use definition lists with explicit missing values. Provenance identifies unverified extraction and links its background report. Media inventory is available through a disclosure. |
| Navigation/mobile | Desktop active pages use a restrained underline. The mobile drawer provides descriptive links, a close button, a backdrop, focus trapping and focus restoration. The selected-record tray stays fixed above the phone safe area; content and footer space account for it. Branding is consistent in the header and footer. |

## Shared design and behavior

Navy surfaces, restrained teal controls and ember observation accents use shared tokens. Added display,
page and section type scales, surface/selection aliases and consistent gutter, panel and section spacing.
Borders and background levels provide hierarchy without adding heavy visual effects. Numbers use tabular
figures; interactive targets remain at least 44px. Text labels and icons accompany state colors.

Shared helpers render evidence availability and key conditions. Completeness badges describe the six
comparison fields explicitly, rather than implying every metadata field is present. Native details keep
supporting content accessible. Existing reduced-motion rules disable animation and smooth scrolling.

Search, categorical/numeric filters, chip clearing, two-record selection, persisted state, sorting,
comparison factors, suggestions, reset, deep links, browser history, evidence access, citation/ID copy,
empty states and invalid-record recovery remain available. Coverage counts still use the full catalog.

The catalog, Store and Matcher files have no V2 changes relative to `cb46193`. No dataset, model,
computer-vision measurement, tolerance, ranking or scientific verdict was added or altered. Six-field
matching remains an unvalidated prototype heuristic; ignition, pressure and duration are displayed
without being checked by the matcher. NASA reports remain background references, not verification
of the invented demonstration records.

## Files

- `assets/css/{tokens,base,components,pages,responsive}.css`: shared visual system and responsive layouts.
- `assets/js/pages/{compare,explorer,overview,evidence,record}.js`: page composition and inspection flows.
- `assets/js/{ui,shell}.js`: status/condition helpers, record cards and navigation.
- `tools/{browser-test,accessibility-test}.js`: expanded interaction, layout and disclosure checks.
- `README.md`, `docs/frontend-report.md`, and this report: current behavior and validation.

## Final validation

QA dependencies are installed in TEMP only: jsdom, playwright-core and axe-core. Browser checks use
installed Microsoft Edge and a local Python server. Screenshots are also written to TEMP.

| Check | Result |
| --- | --- |
| `node --check` across application and QA JavaScript | Passed |
| `node tools/smoke-test.js` | All checks passed, including every one of 4,056 ordered record-pair/factor verdicts |
| `node tools/browser-test.js` | Passed; no browser JavaScript errors |
| Responsive layouts | 8 routes at 19 widths: 320, 360, 375, 390, 412, 430, 480, 568, 640, 740, 768, 820, 834, 1024, 1180, 1280, 1440, 1920 and 2560px; all 152 layouts had no page overflow |
| Interaction checks | Search/empty/reset, modal filters, focus after rebuilding, mobile navigation opening and focus cycling, Escape/close, fixed selection tray, selection limits, comparison handoff/refresh, history/skip link, coverage focus details/filtering, invalid links, missing media, expanded evidence and record disclosures, section focus and reduced motion passed |
| `node tools/accessibility-test.js` | Zero automated violations across 17 scans: 7 screens at 390/1440px plus open mobile navigation, expanded evidence disclosures and expanded record inventory at 390px |
| Accessibility rules | axe WCAG 2 A/AA, 2.1 AA and 2.2 AA tags |
| Local assets and CSS tokens | All 18 referenced assets exist; no unresolved CSS variables |
| Visual review | Desktop overview, Compare, Evidence, Coverage and record screenshots; mobile Explorer, selection tray and navigation screenshots inspected |
| `git diff --check` | Passed |
| Production build | No build command exists; the HTML/CSS/JS files are the deployable application |

The visual review found a mobile navigation click bubbling into outside-dismiss handling after its
icon changed, and an old responsive rule overriding the fixed tray. Both were corrected and browser
assertions now check the open drawer and fixed position. An initially hidden missing-media message
was restored as a directly visible state. No final test failures remain.

No known blocking frontend issue remains in the tested flows. Automated checks are not a full
accessibility certification. Real devices, other browsers, all assistive technologies, live deployment,
network timing and platform-dependent clipboard permissions were not exhaustively tested. Verified
NASA catalog integration, original media, ML and computer vision remain outside this UI task.

## Feature history

The V2 sequence starts after `cb46193`:

- `3ea73c8` — bringing more balance to the research interface
- `420b099` — putting the experiments and their differences at the center of Compare
- `a0de849` — making experiment records quicker to scan and select
- `b89c7b2` — giving the homepage a quieter research identity
- `7893726` — making evidence availability clear before the observations
- `20a6bf9` — making coverage gaps and their records easier to inspect
- `d1c61b1` — organizing record details around conditions and provenance
- `bb36189` — finishing the navigation and mobile comparison experience
- `f30bfed` — clarifying metadata status and keeping keyboard context

The final verification/report commit follows these feature commits in repository history.
