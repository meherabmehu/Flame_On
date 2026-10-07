# Backend connection notes — Flame in Freefall

The frontend was written so that a Python Django service can replace the demonstration layer without
touching a single page module. This file lists the contracts, the field names and the three places
where a swap is required.

---

## 1. Where the data enters the frontend today

| Concern | File | Swap target |
|---|---|---|
| Records + factor definitions + interface copy | `assets/js/data/catalog.js` | `GET /api/records/`, `/api/factors/` |
| Filtering, faceting, sorting, local state | `assets/js/store.js` | unchanged (works on any record array) |
| Comparison and abstention rules | `assets/js/matcher.js` | optionally `GET /api/compare/` |

`main.js` exposes the frontend on `window.CinderLens` (`Store`, `Matcher`, `Router`, `UI`, `CATALOG`,
`FACTORS`, `MATCH_RULES`) so a Django template can hand server-rendered records to the same code, or a
demonstrator can inspect state from the browser console.

---

## 2. Endpoints

### `GET /api/records/`

Returns an array of record objects. Field names must match `assets/js/data/catalog.js` exactly:

```json
[
  {
    "id": "BASS2-T101",
    "title": "PMMA slab, low airflow baseline",
    "session": "2014-07-18",
    "run": "Run 1 · 3 of 9",
    "fuel": "PMMA",
    "geometry": "flat slab",
    "thickness_mm": 3.2,
    "oxygen_pct": 21,
    "airflow_cms": 3,
    "flow_direction": "co-flow (axial)",
    "ignition": "coil igniter",
    "pressure_kpa": 101.3,
    "duration_s": 240,
    "phases": [{ "t_s": 0, "label": "Ignition coil energised" }],
    "outcomes": [
      {
        "type": "spread",
        "label": "Slow spread, then near-stable",
        "detail": "Visible flame front advances for the first ~90 s, then appears to hold.",
        "basis": "recorded outcome field"
      }
    ],
    "media": { "kind": "video", "label": "Duct view, single camera", "streamed": false },
    "source": { "psi": "BASS-II · PSI investigation", "ntrs": "20160000593", "report": "Results overview" },
    "metadataReviewed": true,
    "limitations": "Oxygen and airflow taken from the test log; camera framing changes partway through the run."
  }
]
```

Valid `outcomes[].type` values: `spread`, `extinction`, `no-ignition`, `transition`.
Valid `media.kind` values: `video`, `frame-set`, `none`.

**Nulls matter.** Send `null` for a value that was not recorded. The interface renders that as
"not recorded" and excludes the record from comparisons that need it. Sending `0` would silently
invent a physical condition.

### `GET /api/records/{id}/`
Single record, same shape. Used by `#/record/:id` and `#/evidence/:id`.

### `GET /api/factors/`
```json
[
  { "key": "airflow_cms", "label": "Airflow", "unit": "cm/s", "role": "variable",
    "type": "numeric", "note": "Commanded duct speed, not a measured local velocity." }
]
```
Add `"groupOf": { "PMMA sphere": "PMMA (clear acrylic)" }` for categorical values that should be
grouped in coverage views (fuel families today).

### `GET /api/coverage/`
```json
{
  "rows": [{ "value": "PMMA", "label": "PMMA (clear acrylic)",
             "cells": [{ "value": 21, "count": 15, "ids": ["BASS2-T101"] }] }],
  "cols": [21, 18],
  "gaps": [{ "fuel": "PMMA", "text": "PMMA (clear acrylic): the records contain no test at 16% O₂ at 3 cm/s." }]
}
```
Zero-count cells are the point of the view. Do not omit them; the frontend relies on their presence to
draw dashed "no evidence" cells.

### `GET /api/compare/?a=ID&b=ID&factor=KEY`
```json
{
  "verdict": "comparable | caution | unsuitable | insufficient | incomplete",
  "headline": "Comparable, one factor varied",
  "rows": [{ "key": "oxygen_pct", "label": "Oxygen", "a": "21 % O₂", "b": "18 % O₂",
             "state": "match | differs | varied | missing" }],
  "reasons": [{ "ok": true, "text": "Oxygen matches exactly (21 % O₂)." }],
  "differs": 0,
  "missing": 0
}
```
Keep the `reasons` array: the reason list is what a user reads to decide whether to trust a pair. A
verdict without reasons would have to be re-implemented in the UI.

### `GET /api/records/{id}/neighbours/?factor=KEY`
Ranked candidate partners for one record, each with the same verdict payload as above.
This is where the proposed machine-learning retrieval would plug in; until then, return the rule-based
result so the interface behaviour does not change.

---

## 3. Rules currently implemented client-side

```
hard conditions   fuel family, sample geometry, flow direction must match exactly
numeric tolerance thickness, oxygen, airflow may differ by up to 10% of the higher value,
                  and every difference is still reported to the user
missing values    an empty field is unknown — never treated as equal to a recorded value
abstention        more than 3 differing conditions, identical varied values, or a missing
                  varied value stops the comparison with "Not enough comparable tests"
quiescent        0 cm/s airflow is treated as its own flow regime
```

These live in `MATCH_RULES` in `assets/js/data/catalog.js` and are applied by `matcher.js`. If they move
to the backend, port them verbatim first and only then adjust them, so the interface and the backend
cannot disagree during the transition.

---

## 4. Suggested Django app layout

```
api/
├── models.py         TestRecord, Outcome, Media, Source, FactorSchema
├── serializers.py    field names exactly as above
├── views.py          RecordViewSet, FactorViewSet, CoverageView, CompareView, NeighbourView
├── retrieval.py      rule-based matcher today; ML ranking behind the same interface later
└── tests/            compare the HTTP verdict with matcher.js output on a fixed fixture set
```

The test in the last line matters: while the rules exist in two places, a fixture-based comparison is
the cheapest way to keep them honest.

---

## 5. Reference endpoints used by the interface

```
GET /api/records/
GET /api/records/{id}/
GET /api/factors/
GET /api/coverage/
GET /api/compare/?a={id}&b={id}&factor={key}
GET /api/records/{id}/neighbours/?factor={key}
```

## 6. Non-goals for this build

Authentication, database models, media streaming, the trained retrieval model and computer-vision
measurements are explicitly out of scope for the frontend prototype. Where they would appear, the
interface shows a labelled concept state instead of fabricated output.
