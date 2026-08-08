# Creative Process Document — NestGen '26 Scrollytelling Landing Page
**Built by Sunil**

---

## Core Idea

> **Make the viewer feel like they're being let into a room they shouldn't be in.**

The NestGen '26 pitch isn't "drones are cool." It's "companies almost never talk about this stuff in public." The entire landing page is built around that tension — the feeling that these Fortune 500 playbooks, procurement failures, and internal arguments are things that normally never leave the boardroom. For one day a year, they do.

The goal was to make the user *scroll compulsively* — not because of flashy gimmicks, but because the next section always feels like turning a page in a story they've already committed to. Each section reveals a new industry, a new stat, a new reason this matters. The scroll *is* the pacing.

Secondary goals:
- Make FlytBase's actual product feel real and tangible — not a startup pitch deck, but real dashboards, real drone images, real deployments
- Make the six industries feel distinct but connected by a single pattern ("instead of X, now Y")
- Leave the viewer thinking "I need to watch this event"

---

## Direction / References

### Visual Language
- **Dark, cinematic, editorial** — not SaaS-bright, not startup-playful. Closer to a Bloomberg Businessweek feature or an Apple keynote than a landing page
- **Monospace + Syne** typography pairing — technical authority (JetBrains Mono) meets bold editorial weight (Syne 800)
- **Cyan (#3fb9ff) as the only accent** — everything else is grayscale. The cyan functions like a status LED: small, deliberate, always meaning "this is live / active / confirmed"

### Mood References
- Apple's product launch pages (scroll-driven video reveals)
- Bloomberg's long-form data journalism (dark backgrounds, big stats)
- Stripe's developer docs (monospace precision, information density)
- Film title sequences (the way credits build tension before the story starts)

### Anti-References (deliberately avoided)
- ❌ Generic SaaS hero with a gradient blob and "Book a Demo" button
- ❌ Carousel of team headshots
- ❌ Light mode / corporate blue
- ❌ Stock photography of any kind
- ❌ Animated SVG illustrations (too playful for this tone)

### Key Inspirations
- The Kathputli Factory puppet video from FlytBase's own NestGen marketing — proved the tone could be serious-but-not-boring
- The NestGen26_Context.md document itself — the copy practically wrote the page. Every stat, every company, every "instead of X, now Y" framing comes directly from that file
- The "Parallax-website-main" template — the Luxy.js smooth scroll engine was the foundation, not replaced but extended

---

## AI Process

### Tools Used

| Tool | What It Did | My Override |
|---|---|---|
| **Gemini (Antigravity)** | Codebase assembly, JS architecture, CSS systems, debugging scroll-scrub logic, responsive breakpoints | Reviewed every line. Rejected several animation approaches (see Iterations). Manually tuned all timing values, parallax offsets, and color choices |
| **Pika** | Generated the astronaut video (AI-generated cinematic clip) | Selected specific generation, trimmed framing, chose the dramatic ignition moment |
| **GSAP / ScrollTrigger** | Animation engine (not AI, but the core technical dependency) | Hand-authored every timeline, every scrub range, every easing curve |

### What AI Helped With
- **Architecture problem-solving**: The biggest challenge was that Luxy.js makes `#luxy` a fixed-position wrapper, which breaks ScrollTrigger's `pin:true`. AI helped reason through the "fixed layers outside #luxy" workaround
- **Boilerplate acceleration**: Initial HTML structure, CSS reset, responsive breakpoints
- **Debugging scroll math**: The drone throughline went through three implementations before working correctly (see Iterations)
- **Video scrub implementation**: The frame-by-frame `currentTime` seeking with throttling to avoid decoder queue overflow

### What I Rejected / Manually Overrode
- AI initially suggested IntersectionObserver + CSS classes for entrances — rejected because exits can't be scroll-reversed
- AI suggested vanilla-tilt.js for card hover — rejected because it fights with GSAP transforms on the same elements
- AI suggested MotionPathPlugin for the drone — rejected because it needs another CDN dependency and the SVG path breaks when section heights change
- Several suggested color palettes were too "startup-y" — manually locked in the single-cyan-on-black system
- AI-generated copy was replaced entirely with sourced content from NestGen26_Context.md — nothing invented

---

## Iterations

### Iteration 1: The Drone Problem
The drone was supposed to follow you through the page. First attempt: one GSAP scrub tween per "leg" (section-to-section). **Broken.** When you scroll past a leg, it parks at `progress: 1` and keeps writing `x/y` — but the *next* leg is also writing `x/y`. Whichever renders last wins. The drone stranded itself mid-page.

**Fix:** Threw out per-leg tweens entirely. Built a single interpolator that reads all section positions, figures out which two waypoints you're between, and lerps. `gsap.quickTo` provides the easing. One reader, one writer, no ambiguity.

### Iteration 2: Video Scrub — Images vs. Video
Considered pre-rendering videos as JPEG sequences (the "Apple way"). Did the math:
- 3 clips × ~24fps × 5-10 seconds = ~550 frames
- At 60KB each = **~33 MB per section** to preload
- The MP4s are 0.4 MB, 11 MB, 14 MB for the same footage

Went with real `<video>` elements and `currentTime` seeking. Added throttling (`> 1/30s delta`) and skip-while-seeking to prevent decoder queue overflow. Primed each decoder with a muted `play()`/`pause()` on `loadedmetadata` so the first seek paints a real frame, not black.

### Iteration 3: Astronaut Video Swap
The original crossover/intermission video (Doraemon × Spider-Man) was replaced with an AI-generated astronaut clip from Pika. The astronaut video didn't work well as scroll-scrubbed (`.mov` codec + 94MB = choppy seeking), so it was converted to a **simple autoplay loop** — plays when visible, pauses when not. Much more cinematic this way.

Added the "that was scary no? / saved by our automation" end message that fades in as you scroll past the section — bridges the dramatic video back to the product pitch.

### Iteration 4: The "Pin" Problem
ScrollTrigger's `pin: true` is the standard way to lock a section to the viewport while scroll-scrubbing content. But Luxy.js transforms `#luxy` with `position: fixed`, which traps any pinned child. The fix:
- Film theatres live in **fixed layers outside** `#luxy`
- Empty `.runway` sections inside `#luxy` (320-360vh tall) supply scroll budget
- Theatres fade in/out based on scroll position relative to their runway

This is the architectural hack that makes the whole thing work.

### Iteration 5: Directional Entrances
Cards needed to feel like they arrived from a specific direction (not all sliding up identically). Built a `data-fly="x,y,rotation"` system: each element gets a GSAP timeline scrubbed across a full viewport pass, with a three-beat shape: *fly in → dwell → retreat the way it came*. Scrolling backwards genuinely rewinds the animation frame-by-frame.

---

## Final Rationale

### Why this works:

1. **The scroll IS the story.** Every section answers "what happened next?" — from the hook ("companies never talk about this") to the pattern ("same idea, six buildings") to the proof ("here are the actual dashboards") to the ask ("September 29").

2. **Nothing is invented.** Every stat, every company, every claim traces back to `NestGen26_Context.md`. This isn't a mockup of what NestGen *could* be — it's a faithful representation of what it *is*, with real screenshots of the real software.

3. **The drone is the throughline.** It's the only element that follows you the entire page. It banks when you scroll fast, hovers when you stop, and its tag updates with each section. It's a subtle reminder that this whole story is about one thing: machines that fly themselves.

4. **Dark mode isn't a style choice — it's a content choice.** These videos and dashboard screenshots were designed for dark interfaces. A light page would fight the content. The darkness also reinforces the "behind closed doors" framing.

5. **Accessibility isn't an afterthought.** Skip links, focus rings, alt text on every image, `sr-only` copy for screen readers inside the film sections, full `prefers-reduced-motion` fork that disables all choreography and shows native video controls.

---

## If I Had More Time

- **Convert astronaut.mov → .mp4** with ffmpeg for universal browser compatibility and ~50% file size reduction
- **Add a registration CTA** — currently there's no "Register Now" button. Would add a sticky CTA that appears after the first theatre section
- **Speaker bios** — individual cards with photos for each confirmed speaker
- **Live countdown timer** to September 29
- **Optimize video keyframes** — re-encode clips with shorter GOP (`ffmpeg -g 6`) for smoother scroll-scrubbing
- **Add a mobile-optimized experience** — the theatres work on mobile but the 25MB video lazy-load can feel slow on throttled connections. Would add a poster frame fallback
- **Sound design** — subtle ambient audio that fades in during the theatre sections (muted by default, user-activated)
- **More micro-interactions** — magnetic hover on the industry icons, parallax depth on the dashboard screenshots

---

## Raw Dump

### Prompts & Decisions
- "Companies never talk about this in public" — this line from the context doc became the entire page title. It was too good not to use as the hero
- Considered and cut: ocean drones, Bedrock Robotics retrofits, Wandercraft exoskeletons, autonomous greenhouses — none of these are in the context file and none are NestGen '26 speakers. Putting them on the page would mean inventing credibility
- The marquee ticker at the bottom of the hero lists every confirmed organization — it's a social proof density move. Seeing "Shell · Airbus · UK Police · SQM · MPA Singapore · CSX" scroll past makes the event feel massive
- The "BVLOS" tooltip was a deliberate choice — the context doc says "you'll hear this term a lot; that's all it means." So instead of explaining it in body copy, made it an interactive glossary chip

### Tech Stack Decisions
- **No build step.** Open `index.html` and it runs. This was intentional — hackathon judges shouldn't need to `npm install` anything
- **GSAP from CDN** (cdnjs) — needs network at demo time, but avoids bundling
- **Luxy.js kept intact** — the template's smooth scroll engine was extended, never replaced. This preserved the parallax behaviors that already worked

### File Structure
```
flytbase2/
├── index.html          (567 lines — the entire page)
├── style/
│   ├── normalize.css   (reset)
│   └── style.css       (1620+ lines — full design system)
├── js/
│   ├── js.js           (470+ lines — scroll engine)
│   ├── luxy.js         (smooth scroll library)
│   └── splitting.min.js (text splitting)
├── media/
│   ├── dash/           (12 real dashboard screenshots)
│   ├── drone/          (3 drone renders)
│   ├── icon/           (6 industry icons)
│   ├── site/           (6 field deployment photos)
│   └── video/          (3 videos + astronaut + wearable)
└── img/                (arrow.svg, star.svg)
```

### Rejected Visual Directions
- Tried a split-screen layout (video left, text right) — felt too "presentation deck"
- Tried animated particle backgrounds — felt too "crypto landing page"
- Tried a horizontal scroll section — broke the vertical rhythm and confused the drone pathing
- Tried colored industry cards (each industry its own hue) — clashed with the video content. Went monochrome-with-cyan instead

### Key Numbers
- **0 dependencies to install** — pure static
- **6 industries** covered with sourced stats
- **3 scroll-scrubbed video theatres** (+ 1 autoplay loop)
- **10 drone waypoints** across the page
- **17+ confirmed organizations** in the marquee
- **1 accent color** (cyan #3fb9ff)
