# NestGen '26 — scrollytelling landing page

Static, no backend, no build step. Open `index.html` (or serve the folder) and it runs.

```bash
python -m http.server 4321
```

Built on top of the supplied `Parallax-website-main` template — the Luxy.js + GSAP +
ScrollTrigger + Splitting engine is intact and extended, not replaced.

---

## Research step — what I picked, and why

### 1. Directional object entrances *and* exits

**Picked:** one GSAP timeline per element, scrubbed by a ScrollTrigger spanning
`top 94% → bottom 6%`, with a three-beat shape: *fly in → dwell → retreat the way it came*.
Direction is authored in markup as `data-fly="x,y,rotation"`.

Considered and rejected:
- *IntersectionObserver + CSS classes* — cheap, but the exit can only be a reverse
  transition on a timer. It can't stay under the user's thumb, and scrubbing back up
  doesn't rewind it.
- *One ScrollTrigger with `toggleActions`* — same problem: time-based, not scroll-based.

The timeline approach means scrolling up genuinely un-does the entrance frame for frame,
and each section gets a distinct direction (left, bottom, right, diagonal) so six cards in
a row don't read as one repeated move.

### 2. The persistent drone throughline

**Picked:** a single fixed layer *outside* `#luxy`, positioned by hand-interpolating
between per-section waypoints, driven off **Luxy's own smoothed scroll offset**.

Considered and rejected:
- *MotionPathPlugin along an SVG path* — lovely, but it needs another CDN file and the path
  has to be re-authored whenever section heights change.
- *One scrub tween per leg* — this was the first implementation and it's subtly broken:
  every leg parks at `progress: 1` once you scroll past it, and they all keep writing the
  same `x/y/rotation`, so whichever rendered last wins. The drone strands itself mid-page.
  Replaced with **one reader, one writer**: a single interpolator, smoothed by `gsap.quickTo`.

Driving it from `luxy.wapperOffset` rather than raw `scrollY` matters — the page content is
eased, so a drone on raw scroll runs ahead of the section it's supposed to be arriving at.

Banking, rotor wash and the light cone are derived from scroll velocity, so the drone is
genuinely **static at rest** and only ever moves because you moved.

### 3. Frame-by-frame scroll-scrubbed video

**Picked:** real `<video>` elements with `currentTime` driven directly by scroll position —
not a preloaded image sequence.

The performance maths decided it. The three supplied clips are 5s / 10s / 8s. As JPEG
sequences at 24fps that's ~550 frames; even at a lean 60 KB each that's **~33 MB of images
per section** to preload before the section can start. The MP4s are 0.4 MB, 11 MB and 14 MB
for the same footage, and the browser's decoder does the seeking.

What makes it feel like a frame sequence rather than a video player:
- Nothing autoplays. `currentTime` is a pure function of scroll offset.
- Seeks are throttled to one frame's worth (`> 1/30s` of delta) and skipped while
  `video.seeking` — otherwise fast scrolling queues seeks faster than the decoder retires them.
- The decoder is primed with a muted `play()`/`pause()` on `loadedmetadata`, so the first
  seek paints a real frame instead of black.
- Each file is fetched **one screen before it's needed** (`start: 'top bottom+=120%'`), so
  the 25 MB of the two big clips never touches the initial page load.

### 4. Hover micro-interactions

**Picked:** `gsap.quickTo` throughout — no tilt library.

Considered and rejected: *vanilla-tilt.js* / *atropos*. Both are another dependency doing
what quickTo already does, and neither composes cleanly with a GSAP transform that
ScrollTrigger is also writing to (they fight over the same matrix).

Four behaviours, all gated behind `(hover: hover) and (pointer: fine)`:
- 3D tilt on every card, plus a light source that tracks the cursor (`--mx/--my` feed a
  radial gradient).
- Magnetic pull on the date chip.
- A page-wide cursor spotlight.
- CSS-only lifts on the icons, the strip, and the arrow list.

---

## The architectural hack

`luxy.js` makes `#luxy` `position: fixed` and translates it. Anything `position: fixed`
inside a transformed ancestor is trapped in that ancestor's coordinate space — which means
**ScrollTrigger's `pin` cannot work in this project at all.** Its pin spacer would be pinned
to the moving wrapper, not the viewport.

So nothing here uses `pin: true`. Instead:

- The three film theatres and the drone live in **fixed layers outside `#luxy`**.
- Inside `#luxy`, each theatre has an empty `.runway` section (320–360vh) whose only job is
  to supply scroll budget.
- Real scroll still happens on `window` (luxy sets `body.height`), so ScrollTrigger's
  measurements stay accurate.

That gives true viewport-locked cinema on top of a smooth-scroll engine that structurally
can't pin, without touching luxy.js.

---

## Layout

| Section | Role |
| --- | --- |
| `#hook` | Split-text tension line, drone at rest, ticker of confirmed orgs |
| `#pattern` | The one-paragraph thesis + what FlytBase is + BVLOS glossary chip |
| `#thesis` | **Theatre A** — "AI for the physical world", scrubbed |
| `#industries` | Six industry cards: *instead of X, now Y*, one real stat, confirmed speaker |
| `#maritime` | **Theatre B** — 15 min → under 90 seconds, scrubbed |
| `#tool` | Real dashboard screenshots + a drifting proof strip |
| `#crossover` | **Theatre C** — Doraemon hands Spider-Man the drone, scrubbed |
| `#rooms` | Four more industries, parallax only (no film supplied for these) |
| `#stage` | Who's on stage, by track + what they actually walk through |
| `#cta` | Kinetic NESTGEN '26 / SEPT 29 |

---

## Content provenance

Every stat, company and claim traces to `NestGen26_Context.md`. Nothing was invented.

The four "idea" concepts from the brief (ocean drones, Bedrock Robotics retrofits,
Wandercraft exoskeletons, autonomous greenhouses) were **cut** — they aren't in the context
file and none of them is a NestGen '26 speaker, so putting them on the page would have meant
inventing credibility. In their place, `#rooms` uses four *sourced* industries from the same
file: Construction (Ibn Firnas, Oman), Electric Utilities, Solar (EnBW), Data Centers.

The context file's link/instruction lines were treated as reference content only.

---

## Accessibility

- Skip link, visible focus rings, alt text on every image, `sr-only` copy inside each
  runway so the three film beats aren't invisible to a screen reader.
- Nothing is keyboard-trappable: the fixed layers are `pointer-events: none` and contain no
  focusable elements.
- `prefers-reduced-motion` takes a hard fork: luxy never initialises, no scroll
  choreography runs, the drone and grain are removed, and the three theatres are moved
  **into** their runways as ordinary in-flow panels with native video controls.

## Known constraints

- GSAP loads from cdnjs (as in the original template) — needs a network at demo time.
- On mobile the two large clips are still ~25 MB combined; they're lazy-loaded one screen
  ahead, but a throttled connection will show the "loading film…" state for a beat.
- Frame-perfect scrub quality depends on the MP4s' keyframe density. If a clip feels sticky
  when scrubbed fast, re-encode it with a shorter GOP
  (`ffmpeg -i in.mp4 -g 6 -crf 22 out.mp4`) — ffmpeg wasn't available on this machine.

## Source archives

`assets/` holds the four originals (three zips + the brief) and `assets/_extracted/`
holds their unpacked contents. Nothing in `assets/` is referenced by the site — the
site reads from `media/`, `img/`, `js/`, `style/`.
