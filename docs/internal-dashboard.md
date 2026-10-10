# CinderLens aerospace dashboard refinement

The latest six-page collage is the visual target for the internal screens. Changes are applied in the existing HTML/CSS/JavaScript project. The homepage hero component, shaders, hero stylesheet and overview renderer are unchanged.

## Page changes

| Screen | Layout and visual changes | Decorative background |
| --- | --- | --- |
| Explorer | Compact record panels, expandable recorded conditions, search/filter rail, live stats and preserved selection tray | Nebula clouds and sparse stars |
| Compare | Two experiment cards side by side above condition analysis, blue controls, aligned metadata and prominent varied settings | Planet with inclined orbital ring |
| Coverage | Existing interactive matrices plus computed summary cards, completeness/gap counts and fuel-family distribution | Spiral galaxy with faint chart grid |
| Evidence | Blue observation-navigation controls, large truthful media-unavailable panel and adjacent conditions/observation cards | Spacecraft window looking toward a stylized planet |
| Experiment Details | Refined identity panel, compact chips, striped scientific metadata rows and provenance panels | Lunar terrain silhouette with distant planet |
| Data Notes | Blue document-navigation rail, compact transparency notice and structured methodology/documentation cards | Blue galaxy above archive-like horizon |

## Design system and shared components

Internal styles are scoped through the route's `data-screen` and `internal-dashboard` class. They use navy layered panels, electric-blue actions, cyan metadata highlights, amber caveats, thin borders, restrained shadows and consistent rounded corners. The internal container expands to 1360 px. Tables, badges, buttons, search inputs, filter rows and responsive panels share the same visual language.

Evidence now has a working primary-navigation link to the existing chooser route and its own active state. Record details keep Explorer active. Existing navigation items remain. Opening mobile navigation makes the background regions inert, and closing restores their prior states. Backgrounds are painted directly on main so fixed filter drawers remain above their backdrop; checks caught and fixed an earlier stacking-context issue.

The six local SVG assets total less than 270 KB uncompressed. They are decorative code-generated artwork, not photos, extracted frames, evidence or a simulation. No runtime asset service, font dependency, image library or new framework was introduced. `python tools/create-space-backgrounds.py` regenerates them deterministically. Dark overlays keep foreground text readable. No background animation is added.

## Preserved behavior and scientific boundaries

Catalog records, Store state/filter logic, matcher rules, tolerances, ranking and scientific verdicts remain unchanged. Existing search, facets, sorting, selection limits, comparison handoff, suggestions, URL/history navigation, heatmap cell filters, evidence disclosures, missing-value labels, source links and demo/empty states still work. Recorded-condition disclosure hides detail visually until expanded, while every original value remains available.

No collage experiments, dates, fabricated similarity scores, scientific charts, invented footage, verified-source claims, profile controls or notifications were copied. Coverage counts and fuel bars come from repository records. Metadata review is explicitly distinguished from source verification. Missing footage stays unavailable, with optional illustrative schematics labeled separately. The current illustrative WebGL homepage remains interactive and functional.

## Verification

- `tools/smoke-test.js`: passed, including all 4,056 existing catalog pair/factor verdicts and six working navigation links.
- `tools/browser-test.js`: passed 152 route/viewport checks from 320 to 2560 px, including the requested 375, 390, 430, 768, 1024, 1280 and 1440 px widths. No page overflow or browser JavaScript errors. Filter drawers, focus restoration, search, selections, routing/history, coverage filtering, disclosures and reduced motion passed.
- `tools/accessibility-test.js`: zero automated violations in 17 page and expanded-control scans.
- `tools/reference-test.js`: seven desktop/mobile screenshots; live totals, all three heatmap filters, document focus, side-by-side experiments above analysis, six distinct backgrounds, and homepage exclusion passed.
- `tools/hero-test.js`: animated rendered pixels, mouse/touch interaction, pause/resume, low-power budgets, route disposal and unsupported/reduced-motion fallbacks passed.
- JavaScript syntax, SVG XML parsing, local asset HTTP responses and `git diff --check`: passed.

Desktop and mobile screenshots were visually inspected. QA dependencies remain in the system temporary directory; no app dependency or build step was added.

## Practical limits

Backgrounds approximate the collage with lightweight vector artwork rather than reproducing its photographic images. The repository's longer metadata, explicit scientific caveats and unavailable media require different spacing from the fictional collage. Browser emulation is not a test of every physical device or browser; no live deployment verification is implied.
