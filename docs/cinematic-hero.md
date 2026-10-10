# Cinematic interactive homepage hero

Implemented in the existing static frontend on 10 October 2026, following the supplied design
reference. The original catalog, matcher, Store, scientific verdicts and evidence semantics remain
unchanged from `aef81d7`. The implementation uses native WebGL and GLSL, with no added runtime
dependency, external model, image download, font service or build step.

## Scene and composition

`assets/js/components/heroFlame.js` is an isolated renderer mounted by OverviewPage. A perspective
camera renders a procedural three-dimensional flame volume with translucent density layers, an
amber core, cyan envelope, flowing filaments and organic surface deformation. It floats, rotates
gently on multiple axes and pulses. Four world-space orbital rings have independently moving arcs;
twelve markers orbit at different depths. Camera tilt changes their perspective and parallax.
Glow is computed in the shader rather than an extra bloom/postprocessing pipeline.

Pointer movement uses bounded rotation targets and time-based exponential damping. Pointer leave
and cancellation return the scene smoothly to its resting position. Touch input permits gentle
rotation without calling preventDefault; `touch-action: pan-y` preserves normal vertical scrolling.
A visible keyboard-operable pause/resume button stops all scene motion.

The homepage keeps a large two-line headline and existing copy/CTAs on the left, with the scene
occupying approximately half the desktop hero. Deep navy, cyan and amber surfaces carry through
the three horizontal workspace cards and icon-led workflow. Phones put the headline and CTAs first,
then the smaller visual and simplified HUD. Existing roadmap, transparency, sources and example
comparisons remain available.

The artwork is explicitly labeled **Concept visualization — illustrative only**. A second line
states that it contains no measured flame data or physical simulation. HUD labels name oxygen,
airflow, material and sample geometry without invented numeric values. The catalog count is read
from Store, and NASA dataset status remains explicit. The image reference is not used as a website
background, source footage or an experiment result.

## Lifecycle and rendering limits

- Desktop uses at most a 1.5 device-pixel ratio and approximately 440,000 drawing-buffer pixels.
- Phones use a maximum ratio of 1 and approximately 230,000 pixels. Low-power hints also apply the
  smaller budget, reduce volume sampling from 36 to 24 steps, and cap drawing at approximately 20fps.
- Normal drawing is capped at approximately 30fps. Browser requestAnimationFrame still schedules
  the lightweight callback, with no unnecessary per-frame object allocations.
- IntersectionObserver stops drawing when the visual leaves the viewport. Document visibility
  changes stop/resume it without advancing hidden time.
- Reduced-motion preference uses the static SVG without running a GPU animation loop. Preference
  changes are handled dynamically, including restoring normal rendering.
- Unsupported WebGL or shader initialization failure preserves the illustration and functional
  page links. Context loss shows the fallback; context restoration rebuilds the renderer.
- OverviewPage.cleanup cancels callbacks, disconnects observers, removes events, deletes shaders,
  programs and buffers, and relinquishes the WebGL context. Failed compilation also disposes both
  shader resources, rather than leaving a partially initialized scene.

The implementation follows [MDN's WebGL resource and rendering guidance](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).
Rendering limits are implementation bounds, not a claim that every device achieves the target rate.

## Verification

QA uses temporary jsdom, playwright-core and axe-core installations. Edge is installed locally.
`tools/hero-test.js` enables Chromium's software WebGL renderer in the headless test environment;
this flag is confined to QA and is not required by the application on WebGL-capable browsers.

| Check | Result |
| --- | --- |
| Application/QA JavaScript syntax | Passed |
| `tools/smoke-test.js` | All checks passed, including 4,056 catalog pair/factor verdicts |
| `tools/browser-test.js` | All 152 layouts across 8 routes and 19 widths passed; existing interactions and reduced-motion checks passed; no browser JavaScript errors |
| `tools/accessibility-test.js` | Zero automated violations across 17 default and expanded-control scans |
| `tools/hero-test.js`: real rendering | Changing canvas pixels confirmed animation; pause/resume, damped pointer response and bounded pixel count passed |
| Hero lifecycle | Offscreen pause/resume, navigation cleanup, CTA routing and history remount passed |
| Hero fallbacks | Initial/dynamic reduced motion, unavailable WebGL, simulated shader failure, shader disposal, context loss and restoration passed |
| Mobile/low power | 375, 390, 430 and 768px layout checks, bounded resolution, low-power quality selection and scroll-compatible touch/cancellation passed |
| Visual comparison | Desktop and mobile Edge screenshots captured in TEMP and inspected against the supplied reference |
| Build | Not applicable: the HTML/CSS/JS assets are the deployable application |

The dynamic preference test exposed a transition where motion stopped before the visual switched
to its fallback. Preference state is now updated through the media-query change event rather than
queried every frame, and the complete transition test passes. Shader-failure disposal and touch
cancellation have explicit regressions in the hero suite. The touch test also caught a low-power
startup interval that prevented its first animated frame; the loop now uses that mode's actual
interval from the first frame, and low-power motion is verified.

There are no known blocking issues in the tested flows. Device-specific GPU throughput, real phone
hardware, Safari/Firefox, all assistive technologies and live deployment were not comprehensively
tested. Automated accessibility checks are not certification. There are no measured NASA flame
assets or validated physical flame models in this artwork.

## Changed files

- `assets/js/components/heroFlame.js`: renderer, interaction, fallbacks and lifecycle.
- `assets/js/pages/overview.js`: scene mounting/cleanup and homepage composition.
- `assets/css/hero.css`: isolated homepage styling and responsive scene layout.
- `index.html`: local CSS/component references.
- `tools/hero-test.js`: renderer and fallback verification.
- `README.md`, `docs/design-notes.md`, and this report: current behavior and testing.

The implementation commit is `17e115c` (bringing an interactive 3D flame to the homepage). A separate
verification and resource-hardening commit follows in repository history, with both pushed to main
at the user's request.
