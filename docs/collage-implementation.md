# CinderLens reference layout implementation

The six-screen aerospace collage is the visual target for the internal dashboard. This pass changes the page structure as well as its colors: compact Explorer rows beside the filter rail, comparison selectors above two experiment panels, a full-width Coverage stage with summary cards, a schematic Evidence viewer beside observation details, a featured record with section controls, and a Data Notes rail with overview and source cards.

The Overview and its mouse-responsive WebGL hero remain unchanged. The existing catalog, filter state, routing, selection limits, match tolerances and abstention rules remain authoritative. No invented missions, measurements, experiment photos, similarity percentages or scientific claims from the reference were added. Record thumbnails are labeled sample geometry schematics. Evidence controls show the repository's schematic or the original-footage availability status.

## Decorative artwork

Six images were generated with the built-in image generation tool, visually reviewed, and encoded as JPEG at quality 84 without changing their 2172 × 724 dimensions. They are decorative backgrounds only, never linked to an experiment's media or source. The combined JPEG payload is approximately 1.25 MB. Original PNGs remain in the generator's local output directory.

Shared prompt:

> Use case: stylized-concept. Asset type: decorative panoramic background for a premium aerospace research dashboard, not evidence or experiment imagery. Create ONE landscape cinematic image, very wide 3:1 composition. Scene: [scene]. Palette: near-black navy, cold blue, restrained amber light. Keep left half nearly black with sparse stars so white interface text stays readable. Concentrate detailed imagery on right half. High-end astrophotography / cinematic rendering, rich fine textures, sharp natural details, realistic depth, no text, no labels, no logos, no UI, no collage, no panels. Pure decorative artwork.

| Page | Saved asset | Scene |
| --- | --- | --- |
| Explorer | `assets/artwork/explorer-cosmic.jpg` | Teal nebula with illuminated copper dust on the right |
| Compare | `assets/artwork/compare-cosmic.jpg` | Shadowed planets, inclined dusty orbits and an asteroid |
| Coverage | `assets/artwork/coverage-cosmic.jpg` | Luminous spiral galaxy with a cream core and blue violet arms |
| Evidence | `assets/artwork/evidence-cosmic.jpg` | Spacecraft observation window overlooking Earth's curved cloud horizon |
| Experiment Details | `assets/artwork/record-cosmic.jpg` | Rugged lunar landscape, mountain horizon and distant blue planet |
| Data Notes | `assets/artwork/data-notes-cosmic.jpg` | Galaxy starfield over a dark mountain horizon |

## Behavior and responsive checks

The Search button uses the same catalog filtering as typing. Comparison controls retain the six real factors. Coverage cells filter both axes to their indexed count. Evidence viewer modes disclose unavailable original footage. Record section controls open the media inventory where necessary, scroll to the selected section, move keyboard focus and update the selected state. Source links distinguish background reports from the illustrative catalog.

Desktop keeps filters beside results, experiment panels beside each other, and the evidence viewer beside observation details. Tablet and phone layouts stack panels and retain the existing filter and navigation drawers. Wide result lists scroll within their rail; scientific tables scroll within their labeled regions on narrow devices.

Validation uses the existing smoke, browser, accessibility, reference and hero scripts. Smoke checks preserve all 4,056 catalog comparison verdicts. Browser checks cover eight routes at nineteen widths from 320 to 2560 pixels. Accessibility checks cover seventeen default and expanded-control states. Reference checks capture seven pages at desktop and phone widths and exercise the new controls. Hero checks verify rendering, animation, pointer interaction, reduced motion and fallback behavior.

Vercel now revalidates assets whose filenames are not versioned. The previous one-year immutable cache was inappropriate for CSS and JavaScript changed at the same URLs. The entry page also uses a release query on every stylesheet and script, so browsers holding the older immutable responses request the updated files immediately.

## Compact pages and continuous 3D views

The follow-up replaces the header-only backdrops with continuous, fixed cosmic backgrounds, including Overview and the footer. Every internal page mounts the same procedural WebGL flame renderer used by Overview, with gentle motion, orbital glow, pointer response, pause/resume and reduced-motion fallback. Only one scene owns a WebGL context at a time; route changes and comparison rerenders dispose the old scene. All scenes are labeled illustrative concept artwork.

Long record conditions, match tables, observations, source sections and lower Overview sections are expandable disclosures. Existing section shortcuts reveal their containing disclosures before focusing the requested section. Coverage keeps the heatmap visible and folds its record browser; selecting a cell opens that browser. Explorer keeps records and desktop filters within bounded scrolling areas. Data Notes shows one selected section at a time. Footer navigation and research references are also expandable.

`tools/compact-test.js` verifies animated scenes on all seven pages at desktop and mobile widths, continuous backgrounds, context disposal on comparison changes, pointer response, pause, disclosure shortcuts, one visible notes panel and reduced motion. Set `CINDERLENS_BASE_URL` to check a deployed site with the same test.
