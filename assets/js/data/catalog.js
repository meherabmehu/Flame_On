/* ==========================================================================
   data/catalog.js — DEMONSTRATION RECORDS (NOT REAL NASA DATA)
   --------------------------------------------------------------------------
   ⚠ All rows below are ILLUSTRATIVE demonstration records written for the
     Team CinderLens prototype. Test IDs, values and outcomes are invented so
     the interface can be demonstrated without network access. They must be
     replaced by records extracted and hand-reviewed from NASA PSI BASS-II
     files and NTRS reports before any public claim is made.

   How to connect the Django backend later
   ---------------------------------------
   Replace `CATALOG` with the JSON returned by  GET /api/records/  where each
   object keeps exactly these keys. `demo` is set to false by the backend once
   rows come from the verified catalog. Nothing in the UI imports anything
   else from this file, so the swap is contained.
   ========================================================================== */

const CATALOG_META = {
  demo: true,
  datasetLabel: 'BASS-II demonstration catalog',
  datasetVersion: 'demo-2026-10-01',
  recordCountNote: 'Illustrative rows only — not extracted from NASA files.',
  builtFrom: [
    { name: 'NASA BASS-II results overview', ref: 'NTRS 20160000593' },
    { name: 'NASA BASS-II summary report', ref: 'NTRS 20210011385' },
    { name: 'NASA PSI BASS-II investigation', ref: 'PSI · BASS-II' },
    { name: '2026 Flame in Freefall challenge page', ref: 'Challenge' }
  ]
};

/* Fuel families are grouped so that "same fuel" comparisons stay meaningful
   across surface finish / construction variants. */
const FUEL_GROUPS = {
  'PMMA': 'PMMA (clear acrylic)',
  'PMMA sphere': 'PMMA (clear acrylic)',
  'PMMA cylinder': 'PMMA (clear acrylic)',
  'Cotton-fiberglass': 'Cotton–fiberglass composite',
  'Nomex fabric': 'Nomex fabric'
};

const GEOMETRY_LABELS = {
  'flat slab': 'Flat slab',
  'cylinder': 'Cylinder',
  'sphere': 'Sphere',
  'thin sheet': 'Thin sheet'
};

/* Each record:
   id, title, session date, fuel, geometry, thickness, oxygen, airflow,
   flow direction, ignition, pressure, duration, phases (timeline),
   outcomes (recorded behaviour + its basis), media, source, limitations  */
const CATALOG = [
  {
    id: 'BASS2-T101',
    title: 'PMMA slab, low airflow baseline',
    session: '2014-07-18',
    run: 'Run 1 · 3 of 9',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 21,
    airflow_cms: 3,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 240,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 12, label: 'Flame establishes over upstream half' },
      { t_s: 96, label: 'Spread slows; flame becomes dim and rounded' },
      { t_s: 240, label: 'Test ends with sample partly consumed' }
    ],
    outcomes: [
      { type: 'spread', label: 'Slow spread, then near-stable', detail: 'Visible flame front advances for the first ~90 s, then appears to hold.', basis: 'recorded outcome field' },
      { type: 'extinction', label: 'No extinction within test window', detail: 'Flame persists to the end of the run.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Oxygen and airflow taken from the test log; camera framing changes partway through the run.'
  },
  {
    id: 'BASS2-T102',
    title: 'PMMA slab, higher airflow',
    session: '2014-07-18',
    run: 'Run 1 · 5 of 9',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 21,
    airflow_cms: 15,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 210,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 9, label: 'Flame establishes along the sample' },
      { t_s: 60, label: 'Steady spread to downstream end' },
      { t_s: 210, label: 'Test ends; sample mostly consumed' }
    ],
    outcomes: [
      { type: 'spread', label: 'Sustained spread', detail: 'Flame front reaches the downstream end without stalling.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Single camera; no side view, so flame height is not measurable from this file.'
  },
  {
    id: 'BASS2-T104',
    title: 'PMMA slab, highest tested airflow',
    session: '2014-07-19',
    run: 'Run 2 · 2 of 8',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 21,
    airflow_cms: 25,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 180,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 7, label: 'Fast flame establishment' },
      { t_s: 48, label: 'Spread completes; flame shortens near burnout' },
      { t_s: 180, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Sustained spread, faster than mid airflow', detail: 'Front reaches the end sooner than the 15 cm/s case in this demo set.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Only one repeat at this airflow in the demo set; repeat-to-repeat variation is unknown here.'
  },
  {
    id: 'BASS2-T107',
    title: 'PMMA slab, reduced oxygen at low airflow',
    session: '2014-07-21',
    run: 'Run 3 · 1 of 7',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 18,
    airflow_cms: 3,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 260,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 15, label: 'Flame establishes weakly' },
      { t_s: 130, label: 'Flame shrinks toward ignition end' },
      { t_s: 260, label: 'Extinction' }
    ],
    outcomes: [
      { type: 'extinction', label: 'Extinction before test end', detail: 'Flame disappears roughly two thirds into the run.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'frame-set', label: '30 extracted frames', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Extinction time reported without uncertainty in the demo set.'
  },
  {
    id: 'BASS2-T108',
    title: 'PMMA slab, reduced oxygen at mid airflow',
    session: '2014-07-21',
    run: 'Run 3 · 3 of 7',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 18,
    airflow_cms: 15,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 230,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 14, label: 'Dim flame establishes' },
      { t_s: 95, label: 'Slow advance continues' },
      { t_s: 230, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Slow but sustained spread', detail: 'Flame remains visibly dimmer than in the 21% oxygen case.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Brightness differences were noted by the operator, not measured photometrically.'
  },
  {
    id: 'BASS2-T117',
    title: 'PMMA slab, lowest tested oxygen at mid airflow',
    session: '2014-07-22',
    run: 'Run 4 · 2 of 6',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 16,
    airflow_cms: 15,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 200,
    phases: [
      { t_s: 0, label: 'Ignition attempted' },
      { t_s: 21, label: 'Short-lived flame at igniter' },
      { t_s: 74, label: 'Flame out' }
    ],
    outcomes: [
      { type: 'extinction', label: 'Early extinction', detail: 'Flame does not travel past the ignition region.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Whether the igniter fully engaged is not recorded in the demo row.'
  },
  {
    id: 'BASS2-T109',
    title: 'PMMA slab, quiescent baseline (no forced flow)',
    session: '2014-07-18',
    run: 'Run 1 · 7 of 9',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 21,
    airflow_cms: 0,
    flow_direction: 'quiescent',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 300,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 18, label: 'Flame establishes and stays near igniter' },
      { t_s: 300, label: 'Test ends; little apparent advance' }
    ],
    outcomes: [
      { type: 'spread', label: 'Negligible spread', detail: 'Flame does not travel far from the ignition region in this run.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Residual spacecraft ventilation is not characterised in the demo row.'
  },
  {
    id: 'BASS2-T110',
    title: 'PMMA slab, mid-low airflow',
    session: '2014-07-19',
    run: 'Run 2 · 4 of 8',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 21,
    airflow_cms: 8,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 250,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 11, label: 'Flame establishes' },
      { t_s: 120, label: 'Steady slow advance' },
      { t_s: 250, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Intermediate spread rate', detail: 'Sits between the quiescent and 15 cm/s demonstrations in this set.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'frame-set', label: '48 extracted frames', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Frames are sampled; the exact front position between frames is interpolated.'
  },
  {
    id: 'BASS2-T118',
    title: 'PMMA thick slab, mid airflow',
    session: '2014-07-24',
    run: 'Run 5 · 2 of 6',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 6.4,
    oxygen_pct: 21,
    airflow_cms: 15,
    flow_direction: 'co-flow (axial)',
    ignition: 'hot-wire igniter',
    pressure_kpa: 101.3,
    duration_s: 280,
    phases: [
      { t_s: 0, label: 'Hot-wire igniter energised' },
      { t_s: 26, label: 'Flame establishes on the thick face' },
      { t_s: 160, label: 'Slower front advance than thin sample' },
      { t_s: 280, label: 'Test ends; sample partly consumed' }
    ],
    outcomes: [
      { type: 'spread', label: 'Sustained but slower spread', detail: 'Thicker sample spreads more slowly in this demo pair.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: false,
    limitations: 'Thickness value withdrawn from the log by hand and still awaiting a second review pass.'
  },
  {
    id: 'BASS2-T119',
    title: 'PMMA thin sheet, mid airflow',
    session: '2014-07-24',
    run: 'Run 5 · 4 of 6',
    fuel: 'PMMA',
    geometry: 'thin sheet',
    thickness_mm: 1.6,
    oxygen_pct: 21,
    airflow_cms: 15,
    flow_direction: 'co-flow (axial)',
    ignition: 'hot-wire igniter',
    pressure_kpa: 101.3,
    duration_s: 150,
    phases: [
      { t_s: 0, label: 'Hot-wire igniter energised' },
      { t_s: 6, label: 'Rapid ignition across the sheet' },
      { t_s: 70, label: 'Front reaches downstream end' },
      { t_s: 150, label: 'Test ends; sheet largely consumed' }
    ],
    outcomes: [
      { type: 'spread', label: 'Fastest spread in the thickness set', detail: 'Thin sheet is consumed quickly in this demo run.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'The sheet deforms during burning, so the final geometry is not the starting geometry.'
  },
  {
    id: 'BASS2-T114',
    title: 'PMMA cylinder, low airflow',
    session: '2014-07-26',
    run: 'Run 6 · 2 of 7',
    fuel: 'PMMA cylinder',
    geometry: 'cylinder',
    thickness_mm: 6.35,
    oxygen_pct: 21,
    airflow_cms: 3,
    flow_direction: 'cross-flow',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 240,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 19, label: 'Flame wraps part of the circumference' },
      { t_s: 240, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Slow spread along the axis', detail: 'Front creeps downstream with a dim wake.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Two views, duct + side', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20210011385', report: 'Summary report' },
    metadataReviewed: true,
    limitations: 'Cross-flow means this row is not a like-for-like match with axial duct runs.'
  },
  {
    id: 'BASS2-T115',
    title: 'PMMA cylinder, mid airflow',
    session: '2014-07-26',
    run: 'Run 6 · 5 of 7',
    fuel: 'PMMA cylinder',
    geometry: 'cylinder',
    thickness_mm: 6.35,
    oxygen_pct: 21,
    airflow_cms: 15,
    flow_direction: 'cross-flow',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 220,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 12, label: 'Flame wraps the cylinder fully' },
      { t_s: 90, label: 'Steady downstream advance' },
      { t_s: 220, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Sustained spread around the section', detail: 'Circumferential spread precedes axial advance.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Two views, duct + side', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20210011385', report: 'Summary report' },
    metadataReviewed: true,
    limitations: 'Same cross-flow caveat as the low-airflow cylinder run.'
  },
  {
    id: 'BASS2-T121',
    title: 'PMMA sphere, mid airflow, cross-flow mount',
    session: '2014-07-28',
    run: 'Run 7 · 1 of 5',
    fuel: 'PMMA sphere',
    geometry: 'sphere',
    thickness_mm: null,
    oxygen_pct: 21,
    airflow_cms: 15,
    flow_direction: 'cross-flow',
    ignition: 'hot-wire igniter',
    pressure_kpa: 101.3,
    duration_s: 260,
    phases: [
      { t_s: 0, label: 'Hot-wire igniter energised' },
      { t_s: 30, label: 'Flame establishes on the upstream face' },
      { t_s: 260, label: 'Test ends; sphere partly consumed' }
    ],
    outcomes: [
      { type: 'spread', label: 'Front migrates around the sphere', detail: 'Flame appears to move toward the wake region.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Two views, duct + side', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20210011385', report: 'Summary report' },
    metadataReviewed: true,
    limitations: 'Wall thickness of the fuel sphere is not recorded; that field is empty in the demo row.'
  },
  {
    id: 'BASS2-T122',
    title: 'PMMA sphere, low airflow, cross-flow mount',
    session: '2014-07-28',
    run: 'Run 7 · 3 of 5',
    fuel: 'PMMA sphere',
    geometry: 'sphere',
    thickness_mm: null,
    oxygen_pct: 21,
    airflow_cms: 3,
    flow_direction: 'cross-flow',
    ignition: 'hot-wire igniter',
    pressure_kpa: 101.3,
    duration_s: 300,
    phases: [
      { t_s: 0, label: 'Hot-wire igniter energised' },
      { t_s: 44, label: 'Flame holds near the igniter' },
      { t_s: 300, label: 'Test ends; little migration' }
    ],
    outcomes: [
      { type: 'spread', label: 'Little migration', detail: 'Front stays near the ignition point at this flow.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'frame-set', label: '52 extracted frames', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20210011385', report: 'Summary report' },
    metadataReviewed: true,
    limitations: 'Same missing wall-thickness field as the other sphere run.'
  },
  {
    id: 'BASS2-T123',
    title: 'Cotton–fiberglass slab, low airflow',
    session: '2014-07-30',
    run: 'Run 8 · 2 of 6',
    fuel: 'Cotton-fiberglass',
    geometry: 'flat slab',
    thickness_mm: 4.0,
    oxygen_pct: 21,
    airflow_cms: 3,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 320,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 25, label: 'Glowing front establishes, little visible flame' },
      { t_s: 320, label: 'Test ends; front has advanced a short distance' }
    ],
    outcomes: [
      { type: 'spread', label: 'Smoulder-like advance', detail: 'Front advances without a persistent visible flame.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20210011385', report: 'Summary report' },
    metadataReviewed: true,
    limitations: 'A glowing front is not the same phenomenon as a flaming front; treat comparisons across fuels with care.'
  },
  {
    id: 'BASS2-T124',
    title: 'Cotton–fiberglass slab, airflow stepped up mid-test',
    session: '2014-07-30',
    run: 'Run 8 · 4 of 6',
    fuel: 'Cotton-fiberglass',
    geometry: 'flat slab',
    thickness_mm: 4.0,
    oxygen_pct: 21,
    airflow_cms: 15,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 340,
    phases: [
      { t_s: 0, label: 'Ignition coil energised; airflow held low' },
      { t_s: 120, label: 'Dim, settled front at low airflow' },
      { t_s: 150, label: 'Airflow stepped up to 15 cm/s' },
      { t_s: 168, label: 'Front brightens and accelerates (operator note)' },
      { t_s: 340, label: 'Test ends; sample largely consumed' }
    ],
    outcomes: [
      { type: 'transition', label: 'Behaviour change after an airflow step', detail: 'A dim front at low airflow is followed by visible brightening shortly after the step increase.', basis: 'reported in NTRS summary — placeholder wording' },
      { type: 'spread', label: 'Spread after the step', detail: 'Front continues to the downstream end of the sample.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview (low-airflow behaviour)' },
    metadataReviewed: false,
    limitations:
      'The step-up in airflow is a single un-repeated event in the demo set. The recorded airflow value is the commanded value, not a measured local velocity, and the timing of the brightening is an operator note rather than an instrumented measurement.'
  },
  {
    id: 'BASS2-T126',
    title: 'Cotton–fiberglass cylinder, mid airflow',
    session: '2014-07-31',
    run: 'Run 9 · 1 of 5',
    fuel: 'Cotton-fiberglass',
    geometry: 'cylinder',
    thickness_mm: 6.35,
    oxygen_pct: 21,
    airflow_cms: 15,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 300,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 40, label: 'Front establishes around the section' },
      { t_s: 300, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Slow smoulder-like advance', detail: 'Advance along the axis without persistent flame.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'frame-set', label: '40 extracted frames', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20210011385', report: 'Summary report' },
    metadataReviewed: true,
    limitations: 'Geometry differs from the slab runs, so thickness comparisons do not transfer.'
  },
  {
    id: 'BASS2-T128',
    title: 'PMMA slab, opposed flow at low speed',
    session: '2014-08-02',
    run: 'Run 10 · 1 of 6',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 21,
    airflow_cms: 3,
    flow_direction: 'opposed (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 260,
    phases: [
      { t_s: 0, label: 'Ignition coil energised at downstream end' },
      { t_s: 14, label: 'Flame leans upstream' },
      { t_s: 260, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Upstream spread at low speed', detail: 'Front advances against the flow direction.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20210011385', report: 'Summary report' },
    metadataReviewed: true,
    limitations: 'Flow direction differs from the co-flow runs; that condition is a hard match rule in this prototype.'
  },
  {
    id: 'BASS2-T130',
    title: 'PMMA slab, opposed flow at mid speed',
    session: '2014-08-02',
    run: 'Run 10 · 3 of 6',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 21,
    airflow_cms: 15,
    flow_direction: 'opposed (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 240,
    phases: [
      { t_s: 0, label: 'Ignition coil energised at downstream end' },
      { t_s: 9, label: 'Flame establishes and leans upstream' },
      { t_s: 240, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'extinction', label: 'Blow-off at a higher opposed speed', detail: 'Front stalls and the flame does not persist to the end of the run.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20210011385', report: 'Summary report' },
    metadataReviewed: true,
    limitations: 'Opposed-flow extinction speed is expected to differ from co-flow; not directly comparable.'
  },
  {
    id: 'BASS2-T133',
    title: 'PMMA slab, airflow not recorded',
    session: '2014-08-04',
    run: 'Run 11 · 2 of 5',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 21,
    airflow_cms: null,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: null,
    duration_s: 220,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 16, label: 'Flame establishes' },
      { t_s: 220, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Spread observed', detail: 'Front advance is visible but the flow setting for this run was not captured in the demo row.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: false,
    limitations: 'Airflow and cabin pressure are empty here. Without them this record cannot support a one-factor comparison; it is excluded from suggested pairs.'
  },
  {
    id: 'BASS2-T135',
    title: 'PMMA slab, oxygen not recorded',
    session: '2014-08-04',
    run: 'Run 11 · 4 of 5',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: null,
    airflow_cms: 15,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 230,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 13, label: 'Flame establishes' },
      { t_s: 230, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Spread observed', detail: 'Oxygen setting for this run is not present in the demo row.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: false,
    limitations: 'Oxygen is empty. Any oxygen comparison involving this record is withheld by the match check.'
  },
  {
    id: 'BASS2-T137',
    title: 'Nomex fabric, low airflow, no ignition',
    session: '2014-08-06',
    run: 'Run 12 · 1 of 4',
    fuel: 'Nomex fabric',
    geometry: 'flat slab',
    thickness_mm: 0.8,
    oxygen_pct: 21,
    airflow_cms: 3,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 180,
    phases: [
      { t_s: 0, label: 'Ignition coil energised for the full window' },
      { t_s: 180, label: 'Test ends with no sustained flame' }
    ],
    outcomes: [
      { type: 'no-ignition', label: 'No sustained flame', detail: 'Localised charring only; the flame does not establish.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'none', label: 'No media indexed for this run', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20210011385', report: 'Summary report' },
    metadataReviewed: true,
    limitations: 'Only one Nomex record exists in the demo set, so no fair airflow pair can be built from it.'
  },
  {
    id: 'BASS2-T141',
    title: 'PMMA slab, enriched oxygen at low airflow',
    session: '2014-08-08',
    run: 'Run 13 · 1 of 5',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 25,
    airflow_cms: 3,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 220,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 8, label: 'Vigorous flame establishes' },
      { t_s: 130, label: 'Front advances steadily' },
      { t_s: 220, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Sustained spread at low airflow', detail: 'Flame remains vigorous even at the lowest tested speed.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Enriched-oxygen runs are not representative of a nominal cabin atmosphere.'
  },
  {
    id: 'BASS2-T143',
    title: 'PMMA slab, enriched oxygen at mid airflow',
    session: '2014-08-08',
    run: 'Run 13 · 3 of 5',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 25,
    airflow_cms: 15,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 160,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 6, label: 'Rapid flame establishment' },
      { t_s: 55, label: 'Front reaches downstream end' },
      { t_s: 160, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Fast spread', detail: 'Faster than the 21% oxygen case at the same speed in this set.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Only one repeat at 25% in the demo set.'
  },
  {
    id: 'BASS2-T145',
    title: 'PMMA sphere, reduced oxygen, cross-flow mount',
    session: '2014-08-08',
    run: 'Run 13 · 5 of 5',
    fuel: 'PMMA sphere',
    geometry: 'sphere',
    thickness_mm: null,
    oxygen_pct: 18,
    airflow_cms: 15,
    flow_direction: 'cross-flow',
    ignition: 'hot-wire igniter',
    pressure_kpa: 101.3,
    duration_s: 280,
    phases: [
      { t_s: 0, label: 'Hot-wire igniter energised' },
      { t_s: 52, label: 'Weak flame established' },
      { t_s: 280, label: 'Test ends; front barely migrated' }
    ],
    outcomes: [
      { type: 'spread', label: 'Barely migrating front', detail: 'Very slow migration relative to the 21% sphere run.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'frame-set', label: '36 extracted frames', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20210011385', report: 'Summary report' },
    metadataReviewed: false,
    limitations: 'Only one sphere run exists at this oxygen level, so an oxygen comparison is not supported.'
  },
  {
    id: 'BASS2-T147',
    title: 'PMMA slab, high airflow, repeat A',
    session: '2014-08-10',
    run: 'Run 14 · 2 of 4',
    fuel: 'PMMA',
    geometry: 'flat slab',
    thickness_mm: 3.2,
    oxygen_pct: 21,
    airflow_cms: 25,
    flow_direction: 'co-flow (axial)',
    ignition: 'coil igniter',
    pressure_kpa: 101.3,
    duration_s: 175,
    phases: [
      { t_s: 0, label: 'Ignition coil energised' },
      { t_s: 8, label: 'Fast establishment' },
      { t_s: 175, label: 'Test ends' }
    ],
    outcomes: [
      { type: 'spread', label: 'Sustained spread', detail: 'Repeat of the highest tested speed; used to show run-to-run variation.', basis: 'recorded outcome field' }
    ],
    media: { kind: 'video', label: 'Duct view, single camera', streamed: false },
    source: { psi: 'BASS-II · PSI investigation', ntrs: '20160000593', report: 'Results overview' },
    metadataReviewed: true,
    limitations: 'Demo row exists mainly so the interface can show that repeats are not interchangeable with single runs.'
  }
];

/* Fields that the interface treats as comparable conditions. `role` drives
   the comparison workspace; `unit` is shown next to values everywhere. */
const FACTORS = [
  { key: 'airflow_cms', label: 'Airflow', unit: 'cm/s', role: 'variable', type: 'numeric', scale: 'linear', note: 'Commanded duct speed, not a measured local velocity.' },
  { key: 'oxygen_pct', label: 'Oxygen', unit: '% by volume', role: 'variable', type: 'numeric', scale: 'linear', note: 'Test-atmosphere setting for the run.' },
  { key: 'flow_direction', label: 'Flow direction', unit: '', role: 'variable', type: 'categorical', note: 'Co-flow, opposed or cross-flow mounting.' },
  { key: 'fuel', label: 'Fuel', unit: '', role: 'variable', type: 'categorical', groupOf: FUEL_GROUPS, note: 'Material family, grouped across surface variants.' },
  { key: 'geometry', label: 'Sample geometry', unit: '', role: 'variable', type: 'categorical', note: 'Sample shape as mounted in the duct.' },
  { key: 'thickness_mm', label: 'Thickness', unit: 'mm', role: 'variable', type: 'numeric', scale: 'linear', note: 'Not defined for spherical samples.' }
];

/* Conditions that are kept fixed where the records allow it. */
const MATCH_KEYS = ['fuel', 'geometry', 'thickness_mm', 'flow_direction', 'oxygen_pct', 'airflow_cms'];

/* Human-readable condition labels for match rows and record cards. */
const CONDITION_LABELS = {
  fuel: 'Fuel',
  geometry: 'Geometry',
  thickness_mm: 'Thickness',
  oxygen_pct: 'Oxygen',
  airflow_cms: 'Airflow',
  flow_direction: 'Flow direction',
  ignition: 'Ignition',
  pressure_kpa: 'Cabin pressure',
  duration_s: 'Test duration'
};

const UNIT_BY_KEY = {
  thickness_mm: 'mm',
  oxygen_pct: '% O₂',
  airflow_cms: 'cm/s',
  pressure_kpa: 'kPa',
  duration_s: 's'
};

/* Default tolerance used by the match check. Numeric comparisons are allowed
   to differ by up to this fraction of the higher value before they are
   flagged as "not matched". */
const MATCH_RULES = {
  numericTolerance: 0.10,     // 10 % band on numeric conditions
  hardKeys: ['fuel', 'geometry', 'flow_direction'],
  softKeys: ['thickness_mm', 'oxygen_pct', 'airflow_cms'],
  minComparableOutcomes: 1,
  quiescentIsSpecial: true,   // 0 cm/s is treated as its own regime
  maxDiffering: 3             // more than this many differing conditions = no fair match
};

/* Copy used across the interface. Kept here so the wording stays consistent
   and can be reviewed by the team in one place. */
const COPY = {
  demoTag: 'DEMONSTRATION',
  datasetCaveat:
    'Every record in this build is an illustrative demonstration row, not an extracted NASA measurement. Values, outcomes and timings are invented for interface testing.',
  noProvenance:
    'The team has not yet published a verified extraction of PSI files, so the prototype does not display real NASA findings as results.',
  abstain:
    'Not enough comparable tests. The records shown differ in more than one relevant condition, so this interface will not state a difference.'
};
