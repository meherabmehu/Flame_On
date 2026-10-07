# Design notes — Flame in Freefall (Team CinderLens)

Written for a reviewer or judge who wants the reasoning behind the interface, in the order the
decisions were made.

---

## 1. The user journey the screens support

The product answers one question shape:

> *"For one recorded fuel and shape, what happened at low airflow versus a higher tested speed?"*

…and the same question for oxygen, fuel, thickness and geometry. The journey has four moves, and each
move is a screen, because each one has a different failure mode that must be visible.

| Step | User intent | Screen | Failure mode it exposes |
|---|---|---|---|
| 1 | "Show me what exists." | **Experiment explorer** | Metadata gaps — fields that were never recorded |
| 2 | "Which tests can I fairly line up?" | **Comparison workspace** | Conditions that differ beyond the factor of interest |
| 3 | "What do those tests actually say?" | **Evidence & results** | Observation separated from interpretation |
| 4 | "Where did this come from?" | **Experiment detail** | Provenance and limitations |

Supporting screens: **Project overview** (orientation + one action), **Data notes** (the honesty
contract and backend map).

### Why the abstention state is a first-class screen element

The concept guide is explicit: *"If the tests do not match closely enough: 'Not enough comparable
tests.'"* A tool that always produces an answer would be more impressive and less useful. So step 3 of
the comparison workspace is designed to be able to say **no**, and the "no" is given the same visual
weight as a positive result: a bordered verdict panel, an itemised list of reasons, and a route out
("Find a fairer pair", "Inspect coverage"). The demo can therefore be driven to a clean rejection in
one click (`#/compare?a=BASS2-T101&b=BASS2-T137&factor=airflow_cms`).

---

## 2. Screen structure

### Project overview `#/`
Hero (problem + purpose + two actions) → "Read this first" caveat → the problem in three cards → the
example question from the concept guide with three pre-built deep links → the four-step workflow →
inputs/outputs tables straight from the guide → coverage-at-a-glance statistics → what the build does
and deliberately does not do → roadmap (now / hackathon / later) → sources to revisit.

Nothing on this page claims a result. It exists to get a judge to the explorer in one click and to set
expectations for what the tool will refuse to say.

### Experiment explorer `#/explorer`
Two columns: a sticky filter rail and the result list.

- **Filters**: free search, fuel/material, sample geometry, flow direction, numeric ranges for oxygen,
  airflow and thickness (with quick-pick buttons for values that were actually recorded), a
  completeness control (*include / only complete / only records with gaps*) and a metadata-review
  switch.
- **Facet counts** respect the other active filters, so a zero means "not in this slice", and disabled
  options are visually dimmed rather than hidden.
- **Record cards** list the six comparable conditions. Empty ones read *not recorded* in italics with a
  dashed marker — never `0`, never "none".
- **Coverage matrix** (`Coverage` button or `?coverage=1`) crosses fuel families against oxygen and
  airflow bands. Zero cells are drawn as dashed placeholders and explained: a dotted cell is an
  evidence gap, not a result. Underneath, "Gaps stated in plain English" converts the matrix into
  sentences a person can read aloud.
- Filtering to an empty set is a designed state: it repeats the active filters, explains that coverage
  in this experiment is uneven by design, and offers "Widen the filters".

### Comparison workspace `#/compare`
Three numbered steps, with a sticky side panel.

1. **Choose the factor** — six factor cards, each showing how many records carry that field and how
   many usable pairs exist. A factor with no fair pair says so on the card, before the user commits.
2. **Pick two tests** — two slots fed by dropdowns or by "Select to compare" in the explorer. Suggested
   pairs are ranked by a transparent rule ("what matches"), each labelled with a **fit** indicator that
   is explicitly described as *how many conditions match exactly — not a confidence score*.
3. **Check the remaining conditions** — a condition-by-condition table (matches / differs / not
   recorded / varied factor), a verdict panel, and either the recorded difference in plain English or
   the abstention block.

The side panel keeps the varied factor, the matching rules, the sources for the two tests, and the
dashed **Proposed interpretation (not implemented)** slot in view at all times.

### Evidence & results `#/evidence/:id`
Left column: media frame (schematic + explicit "video not streamed locally" note), observed behaviour
with its basis, an operator-note phase timeline, the *Visual measurements* panel marked **Not
implemented**, a traceability table, and limitations.
Right column: an **Observed** card beside a dashed **Proposed interpretation** card, recorded
conditions with a completeness meter, comparable neighbours on the currently selected factor, and the
original NASA sources.

When no neighbour matches closely enough, this screen renders *"No suitable comparison found for this
test"* and states that this is a fact about the records, not a statement about physics.

### Experiment detail `#/record/:id`
The catalog row as indexed: identification, all nine test conditions in a definition grid, a media
inventory (video / frames / instrumented measurements / verified labels, each marked present or
missing), recorded behaviour with phase notes, limitations, a provenance block, and the list of fair
comparisons on the active factor.

### Data notes `#/data-notes`
The honesty table (area × what this prototype does × what replaces it), the matching rules as
implemented, the six backend endpoints, the project structure, and the local run + demo instructions.

---

## 3. Visual direction

### Palette
| Token | Value | Role |
|---|---|---|
| `--bg-app` | `#0a1120` | Page background |
| `--bg-panel` / `--bg-panel-2` | `#111b2e` / `#16223a` | Cards, raised surfaces |
| `--tx-1` / `--tx-2` / `--tx-3` | `#e9eff8` / `#b3c1d8` / `#8593ab` | ~15.6:1, ~9.1:1, ~5.2:1 on the page background |
| `--teal-500` / `--teal-400` | `#16b8a7` / `#3ed6c4` | Interaction: primary buttons, focus rings, varied-factor highlight |
| `--ember-400` | `#edaa4a` | Combustion: observed behaviour, schematic flame, demonstration warnings |
| status | `#4bc79a` / `#e8b055` / `#e5796b` / `#7ba6f2` / `#6d7b93` | comparable / caveats / rejected / info / unknown |

Restraint rules: no glows, no gradients behind text, no star fields or space imagery. The only
gradients are two very low-opacity radial washes at the top of the hero page and a faint ember wash
inside the media frame.

### Typography and rhythm
One system sans stack (Inter → Segoe UI → system-ui) plus a monospace stack for test IDs, timings and
measurement labels. Type scale 11 → 38 px; body copy at 15 px with 1.65 line-height; measured line
lengths (`68ch` for prose, `78ch` max in wide cards). Spacing follows a 4 px scale with 64 px section
rhythm and generous card padding so dense metadata stays readable on a projector.

All numbers use tabular figures so columns of conditions line up.

### Component consistency
- Two button heights (sm / default), one border radius family (4 / 6 / 10 / 14 / pill).
- One badge component with semantic colour variants; uppercase 11 px for statuses.
- One card shell (panel, flush, inset) used by every screen.
- One state block for loading / empty / no-results / error, so "nothing here" always looks deliberate.

### Motion
120 ms for hover and focus, 200 ms for panel and toast transitions, 320 ms for meter fills. The
comparison table highlights the varied-factor row and tints conflicting rows when the pair changes —
movement that carries meaning. `prefers-reduced-motion: reduce` collapses all of it.

### Responsive behaviour
Desktop-first (the demo runs at 1440 px). At ≤1100 px the side panels move below the content; at
≤900 px the explorer becomes single-column with a collapsible filter rail and the condition table
switches to a stacked A/B layout with explicit prefixes; at ≤640 px everything is single-column, the
comparison table becomes a list, and the header collapses to a menu button. A print stylesheet trims
chrome so an evidence view can be exported on paper.

---

## 4. Scientific honesty rules encoded in the UI

1. **Demonstration content is labelled everywhere.** A persistent strip under the header, an ember
   `DEMONSTRATION` badge on every record, an ember badge on every schematic, and a console notice.
2. **No invented measurements, predictions, accuracy or NASA findings.** The interface never renders a
   numeric model output. The only "score" shown is a *fit* description of matched conditions, with a
   "watch out" note directly underneath.
3. **Not-implemented features get concept states, not fake output.** Dashed panels labelled
   *Proposed interpretation (not implemented)* and *Not implemented* sit exactly where the ML ranking
   and computer-vision measurements would appear.
4. **Missing data is visible and explicit.** Missing metadata is dashed and italic ("not recorded"),
   counted per record ("2 fields missing"), filterable, named inside the match check, and never treated
   as equal to a recorded value.
5. **Uncertainty is explained in plain English.** Unknown values are described as unknown rather than
   zero, ±10% numeric tolerance is stated in the interface, and every comparison carries the sentence
   *"No prediction is made here about any untested cabin, atmosphere or material."*
6. **The tool abstains.** More than three differing conditions, a missing varied value, or a vanished
   difference all produce "Not enough comparable tests" instead of a claim.
7. **No arbitrary simulation.** The factor picker only offers values that exist in the indexed records;
   there is no free-form slider that could imply untested conditions can be explored.

---

## 5. Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`, `aside`), a skip link, and labelled inputs.
- Visible 2 px teal focus rings on every interactive element; focus is moved to the search field by `/`
  and restored sensibly after popovers close.
- Status announcements through `role="status"` / `aria-live` on result counts, toasts and loading
  regions; `aria-pressed` on the comparison slots and the factor picker.
- Colour is never the only signal: statuses also carry a text label, and the coverage matrix prints the
  record count inside each cell.
- Contrast targets: body text ≥ 7:1, secondary text ≥ 4.5:1, interactive borders ≥ 3:1.

---

## 6. What a future backend must preserve

The comparison and abstention rules currently live in `assets/js/matcher.js` as small pure functions so
they can be ported to Python unchanged:

- `pairVerdict(a, b, variedKey)` → verdict, headline, reasons, per-condition rows
- `suggestPairs(variedKey, pool, limit)` → ranked candidate pairs
- `coverageGrid(rowsKey, colsKey)` → counts plus the zero cells that become gap statements
- `gapStatements()` → the plain-English summary of untested combinations

If the rules move server-side, the interface must keep receiving the *reasons*, not just a verdict —
the reason list is the part a user reads to decide whether to trust the pair.
