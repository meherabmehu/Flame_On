# Seven-page CinderLens reference implementation

The supplied visual reference guides the existing Flame_On application. This is a refinement of the current static project, with the existing routes and data intact.

## Screens

- **Overview:** cinematic navy background, cyan headline and primary actions, amber feature accents, orbital concept artwork. The existing native WebGL flame remains genuinely animated and pointer responsive, with floating, rotation, glowing layers, moving orbits and damped mouse/touch tilt.
- **Explorer:** live repository totals, matching-result and selection counts, compact record rows, a narrower filter rail, cyan selection states and the existing mobile comparison tray.
- **Compare:** experiments flank the condition analysis on wide screens. Tablet layouts show the pair above analysis; phones stack A, B and analysis. Factor controls, suggestions, swap/remove actions, caveats and abstention remain available.
- **Coverage:** Oxygen vs Airflow, Fuel vs Shape and Thickness vs Airflow views compute their cells through the existing matcher. Cyan intensity represents indexed counts only. Focus/hover exposes record IDs; choosing a cell filters both axes. Existing fuel-family matrices, gap explanations and filtering remain available. Unknown axis values are excluded from the three new views and explicitly described; they are never zero experimental results.
- **Evidence:** cinematic inspection panel clearly states that original footage is absent. Existing optional record schematics, illustrative observations, conditions, timeline, traceability and limitations remain accessible.
- **Experiment Details:** record identity panel, condition chips, striped metadata rows, source status, provenance and media inventory use the existing record only.
- **Data Notes:** document navigation rail, project overview, prominent prototype disclosure and preserved honesty/rule/integration documentation. Navigation opens collapsed contracts and moves keyboard focus to the selected section without changing hash routing.

## Scientific boundaries

No mockup IDs, measurements, observations, charts, imagery or conclusions were copied. Catalog, Store, matcher, comparison tolerances, ranking and verdict logic are unchanged. Decorative record icons are generic catalog symbols, not generated experiment thumbnails. No footage or playback control is fabricated. The WebGL scene remains labeled illustrative concept artwork and does not model combustion physics.

## Validation

Run with the existing temporary QA dependencies on `NODE_PATH`, and a local server on port 8000:

```powershell
node tools/smoke-test.js
node tools/browser-test.js
node tools/accessibility-test.js
node tools/hero-test.js
node tools/reference-test.js
```

All five checks passed. Smoke verification preserves all 4,056 catalog pair/factor verdicts. Browser checks cover 152 route/width layouts between 320 and 2560 px, filtering, selections, routing/history, drawers, disclosures, focus and reduced motion. Accessibility checks report zero automated violations across 17 page/expanded-control scans. Hero checks verify changing rendered pixels, bounded pointer tilt, pause/resume, rendering budgets, context recovery, route disposal, low-power/touch behavior and reduced-motion/unsupported fallbacks. The context disposal test now waits for the asynchronous WebGL loss event.

The new reference check captures all seven screens at 1440 and 390 px to the system temporary directory. It verifies live totals, all three heatmap views against the resulting record count, document navigation and desktop placement of analysis between A and B. Those checks caught and resolved a raw-material/fuel-family filtering mismatch before commit. Screenshots were visually inspected, and `git diff --check` passed.

System fonts and code-native visuals keep the application dependency-free. Responsive browser emulation is not a test of every physical device, GPU or browser. Actual video imagery from the mockup is deliberately replaced by honest unavailable-media UI; no live deployment check is implied.
