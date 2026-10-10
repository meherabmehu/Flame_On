# CinderLens / Flame in Freefall — Team CinderLens

A **question-led explorer across recorded microgravity combustion conditions**, built as a frontend
prototype for the 2026 NASA Space Apps Challenge ("Flame in Freefall").

Explore how oxygen, airflow and fuel or sample shape relate to flame behaviour — with clear matching explanations and visible evidence gaps. The current catalog is illustrative.

> **Demonstration build.** Every record in this repository is an *illustrative demonstration row*
> written by the team to exercise the interface. Test IDs, values, outcomes and timings are invented.
> No NASA measurement is reproduced as a result, no model is trained, and no accuracy figure or
> fire-risk prediction is shown anywhere. See [`docs/design-notes.md`](docs/design-notes.md).

---

## What the prototype does

| Screen | Route | Purpose |
|---|---|---|
| Project overview | `#/` | The problem, the product purpose, the honest boundary, and one clear action to start |
| Experiment explorer | `#/explorer` | Search + filter indexed records, see which conditions are recorded and which are missing, inspect the coverage matrix |
| Comparison workspace | `#/compare` | Choose one factor, pick two tests, and check whether the other conditions are matched closely enough — or refuse to conclude |
| Evidence & results | `#/evidence/:id` | Media status, recorded conditions, observed behaviour, traceability, limitations, source links |
| Experiment detail | `#/record/:id` | The catalog row itself: identifiers, every field with an explicit "not recorded", media inventory, provenance |
| Data notes | `#/data-notes` | Honesty table, matching rules, backend connection points, run instructions |

Deep links work for a live demo:

```
#/compare?a=BASS2-T101&b=BASS2-T102&factor=airflow_cms     comparable pair
#/compare?a=BASS2-T121&b=BASS2-T145&factor=oxygen_pct      comparable with caveats
#/compare?a=BASS2-T101&b=BASS2-T137&factor=airflow_cms     rejected: fuel differs
#/explorer?coverage=1                                      coverage matrix + gaps
```

---

## Run it locally

No build step, no dependencies, no CDN.

```bash
git clone https://github.com/meherabmehu/Flame_On.git
cd Flame_On
python3 -m http.server 8000
```

Open <http://localhost:8000>.

Opening `index.html` directly from the file system also works. A local server is recommended because
it keeps in-page navigation and clipboard behaviour consistent across browsers.

### One-minute demo script

1. **Overview** → press **Open this comparison** (airflow example already loaded).
2. **Step 3** shows the match check and the recorded difference in plain English.
3. Change the varied factor to **Thickness** and load a suggested pair — the same machinery, another condition.
4. Load `BASS2-T121 vs BASS2-T145` → the interface refuses to conclude.
5. Open an **evidence view**, then the **full record**, to show traceability and limitations.
6. Press the **Demo data** chip in the header → switch to **Empty catalog** for the honest empty state.

Keyboard: press `/` anywhere to jump to the explorer search field.

---

## Project structure

```
flame-on/
├── index.html                  single entry point, hash-routed
├── assets/css/
│   ├── tokens.css              colour, type, spacing, radii, motion
│   ├── base.css                reset, typography, layout primitives
│   ├── components.css          header, buttons, badges, tables, state blocks
│   ├── pages.css               page layouts (explorer, compare, evidence, record)
│   ├── responsive.css          tablet / mobile / print / reduced motion
│   └── hero.css                cinematic homepage and responsive scene layout
├── assets/js/
│   ├── data/catalog.js         DEMONSTRATION RECORDS + factor definitions + copy
│   ├── store.js                state, filtering, faceting, persistence
│   ├── matcher.js              comparison + abstention rules (portable to Python)
│   ├── ui.js                   shared components, badges, empty/loading states
│   ├── router.js               hash routing
│   ├── shell.js                header, navigation, data-mode control, footer
│   ├── components/heroFlame.js  isolated procedural WebGL concept artwork
│   ├── pages/                  overview, explorer, compare, evidence, record, dataNotes
│   └── main.js                 bootstrap, delegated actions, public API
└── docs/
    ├── design-notes.md         screen structure, visual choices, honesty rules
    └── backend-notes.md        endpoint contracts for the Django service
```

---

## Design summary

**Palette** — deep navy surfaces (`#0a1120` → `#16223a`), teal for interaction (`#16b8a7` / `#3ed6c4`),
and a warm ember accent (`#edaa4a`) reserved for combustion-related highlights: observed behaviour,
schematic flames, and demonstration-data warnings. Status colours (green / amber / red / blue / grey)
communicate comparable, caveats, rejected, information and unknown.

**Type** — one system sans stack with a five-step type scale, tabular numerals for all recorded values,
and monospace for test IDs and measurement timings.

**Motion** — 120–320 ms transitions that explain change (row highlighting when a factor varies, panel
expansion, toast confirmation). The homepage also has a decorative procedural WebGL flame with slow
motion and damped pointer interaction. A pause control stops it; `prefers-reduced-motion` replaces it
with a static illustration. It pauses offscreen and releases GPU resources on route changes.

**Honesty mechanics** — recorded and proposed content are never blended: proposed AI features appear in
dashed "not implemented" panels. Missing metadata is rendered as "not recorded" with a dashed marker,
never as `0` or "none". Abstention has its own designed state, `Not enough comparable tests`.

Full reasoning: [`docs/design-notes.md`](docs/design-notes.md).

---

## Connecting the Django backend

The frontend reads its data from one place and computes nothing it cannot see. The endpoints that
replace the demonstration layer are documented in [`docs/backend-notes.md`](docs/backend-notes.md), with
the field-by-field response shape in `assets/js/data/catalog.js`.

Quick version: `GET /api/records/`, `/api/records/{id}/`, `/api/factors/`, `/api/coverage/`,
`/api/compare/?a=&b=&factor=`, `/api/records/{id}/neighbours/?factor=`.

---

## Sources to revisit

- NASA BASS-II results overview — NTRS [20160000593](https://ntrs.nasa.gov/citations/20160000593)
- NASA BASS-II summary report — NTRS [20210011385](https://ntrs.nasa.gov/citations/20210011385)
- NASA Physical Sciences Informatics — [BASS-II investigation](https://www.nasa.gov/physical-sciences-informatics-psi/)

## Status

Frontend prototype complete: six screens, working filters, record selection, comparison and
abstention logic, detail views, and honest loading / empty / missing-data states.
Backend, verified data extraction and ML retrieval are out of scope for this build and clearly marked
as such in the interface.

Team CinderLens · 2026 NASA Space Apps Challenge


## Frontend refinement and verification

CinderLens retains its buildless, dependency-free architecture and existing Vercel configuration.
The overview now introduces the research workflow with a labeled SVG illustration. Explorer has
page-level search, individually removable filter chips, a modal mobile filter drawer, honest record
cards and a persistent two-record selection tray. Coverage cells filter the corresponding fuel family
and recorded value; their counts describe the full demonstration catalog, regardless of active filters.
Comparison panels show the varied value, supporting conditions, illustrative observations and evidence
links. Comparison changes synchronize to the hash URL, including explicit empty slots on reset.

All data remains illustrative. Media descriptors do not establish that original files exist. NASA
references provide background context and do not verify any demonstration record. The current matcher
uses six fields and a 10% numeric tolerance; these heuristics have not been scientifically validated.
Supporting numeric differences beyond tolerance or missing fields can still yield a caveated verdict
under the preserved rules. Ignition, pressure and duration are displayed but are not checked.

No build command or package.json exists. Validate JavaScript with `node --check` and use the QA scripts:

```powershell
# Optional QA dependencies only; keep them outside the repository.
npm.cmd install --prefix "$env:TEMP/cinderlens-qa" --cache "$env:TEMP/cinderlens-npm-cache" --no-audit --no-fund jsdom playwright-core axe-core
$env:NODE_PATH = "$env:TEMP/cinderlens-qa/node_modules"
node tools/smoke-test.js
# In another terminal: python -m http.server 8000 --bind 127.0.0.1
node tools/browser-test.js
node tools/accessibility-test.js
node tools/hero-test.js
```

Browser scripts use installed Microsoft Edge on Windows and a local server on port 8000. They do not
install a browser or ship dependencies with the app. Screenshots are saved in TEMP. The smoke suite
also checks every catalog pair and factor against the committed baseline to preserve existing verdicts.
See [the implementation report](docs/frontend-report.md) for the completed checks and limitations.

### UI/UX refinement V2

Compare now puts the experiment pair and condition analysis first, with prominent varied settings,
actual match counts and collapsible supporting explanations. Explorer prioritizes oxygen, airflow and
thickness, groups advanced filters, and keeps a fixed two-record tray on phones. The homepage includes
a clearly labeled research-chamber illustration and a connected workflow. Evidence leads with media
availability and source status; optional schematics and future measurements are disclosed separately.
Records group metadata around their key conditions and provenance. Coverage labels both axes and
reveals indexed record IDs on hover or keyboard focus. Mobile navigation uses a focused drawer.

The V2 checks cover 152 route/viewport layouts and 17 automated accessibility scans, including expanded
controls. Catalog values, matching rules, ranking and verdicts are unchanged from the preceding build.
See [the V2 refinement report](docs/ui-refinement-v2.md) for page changes, validation and limitations.

### Cinematic interactive hero

The homepage now uses a native WebGL shader for a three-dimensional decorative flame, concentric
orbits and floating markers. No library, external model or scientific simulation is required. The HUD
uses generic condition names, not invented measurements. The scene is explicitly labeled **Concept
visualization — illustrative only**. Unsupported WebGL, shader failure and reduced-motion preference
retain a static SVG fallback. Phones and low-power devices have smaller rendering budgets.

See [the hero implementation report](docs/cinematic-hero.md) for controls, cleanup, performance bounds,
browser verification and remaining hardware-testing limits.
