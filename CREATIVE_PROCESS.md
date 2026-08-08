# Creative Process Document — NestGen '26 Scrollytelling Landing Page
 
**Built by Sunil**
 
Enjoy viewing the website, hope it feels interactive enough.
Had 3 generated films — last one took a bit, and credits too.
 
`Cntrl + Shift + R` — if smthn not working, you know it ;)
 
🔗 **[sunil22516.github.io/flytbase_NestGen26](https://sunil22516.github.io/flytbase_NestGen26/)**
 
---
 
## Core Idea
 
> **Make the viewer feel like they're being let into a room they shouldn't be in.**
 
The NestGen '26 pitch isn't "drones are cool" — it's "companies almost never talk about this stuff in public." The whole page is built around that tension: Fortune 500 playbooks, procurement failures, internal arguments that normally never leave the boardroom, but for one day a year, do.
 
**Goal:** make the user scroll compulsively — not from gimmicks, but because the next section always feels like turning a page in a story they've committed to. Each section reveals a new industry, a new stat, a new reason this matters.
 
**Secondary goals:**
- Make FlytBase's product feel real (real dashboards, real drone images, real deployments — not a pitch deck)
- Make six industries feel distinct but connected by one pattern ("instead of X, now Y")
- Leave the viewer thinking "I need to watch this event"
---
 
## Direction / References
 
**Visual language:** dark, cinematic, editorial — not SaaS-bright. Closer to a Bloomberg Businessweek feature or an Apple keynote than a landing page. JetBrains Mono + Syne 800 pairing — technical authority meets bold editorial weight. Cyan (`#3fb9ff`) as the only accent, everything else grayscale — functions like a status LED, always meaning "this is live / active / confirmed."
 
**Mood references:** Apple product launch pages (scroll-driven video reveals), Bloomberg long-form data journalism (dark backgrounds, big stats), Stripe developer docs (monospace precision, information density), film title sequences.
 
**Anti-references:** generic SaaS hero with gradient blob + "Book a Demo," team headshot carousels, light mode/corporate blue, stock photography, animated SVG illustrations.
 
**Key inspirations:** FlytBase's own Kathputli Factory puppet video (proved serious-but-not-boring tone works); the `NestGen26_Context.md` doc itself — the copy practically wrote the page; built on top of a website template — Luxy.js smooth scroll engine.
 
---
 
## AI Process
 
### Tools Used
 
| Tool | What It Did |
|---|---|
| **Gemini (Antigravity)** | Codebase assembly, JS architecture, CSS systems, debugging scroll-scrub logic, responsive breakpoints. Reviewed every line myself; rejected several animation approaches; manually tuned all timing values, parallax offsets, colors. |
| **Pika** | Didn't work as expected, though I created some characters here. |
| **GSAP / ScrollTrigger** | Animation engine (not AI, core dependency). Hand-authored every timeline, scrub range, easing curve. |
| **Google Flow** | Used to generate videos more efficiently, though that was limited. |
| **KlingAI** | Didn't work as it was supposed to at all. |
 
### What I Rejected / Overrode
- IntersectionObserver + CSS classes for entrances — exits can't reverse on scroll
- vanilla-tilt.js for card hover — fights GSAP transforms
- MotionPathPlugin for the drone — extra CDN dependency, breaks on section height changes
- Several "startup-y" color palettes — locked in single-cyan-on-black instead
- All AI-generated copy — replaced entirely with sourced content from `NestGen26_Context.md`
---
 
## Iterations
 
**1. The drone problem** — Per-section GSAP scrub tweens caused the drone to strand mid-page (competing writers to x/y). Fixed by building a single interpolator that reads all section positions and lerps between waypoints — one reader, one writer.
 
**2. Video scrub: images vs. video** — Considered JPEG sequences (~33MB/section) vs. real MP4s (0.4–14MB). Went with `<video>` + `currentTime` seeking, throttled, with a primed decoder on load so the first seek paints a real frame.
 
**3. Astronaut video swap** — Original Doraemon × Spider-Man crossover clip replaced with an AI-generated astronaut clip (Pika). Scroll-scrubbing was choppy (.mov, 94MB) so it became an autoplay loop instead — more cinematic. Added the "that was scary no? / saved by our automation" fade-in bridging back to the pitch.
 
**4. The pin problem** — Luxy.js's `position: fixed` wrapper trapped ScrollTrigger's `pin: true`. Fixed by moving theatres into fixed layers outside `#luxy`, with empty `.runway` sections (320–360vh) inside `#luxy` supplying scroll budget.
 
**5. Directional entrances** — Built a `data-fly="x,y,rotation"` system so cards arrive from a specific direction with a three-beat fly-in/dwell/retreat, fully reversible on scroll-back.
 
---
 
## Final Rationale
 
- **The scroll IS the story** — every section answers "what happened next?"
- **The drone is the throughline** — the one element that follows you the whole page, banking on fast scroll, hovering on stop, tag updating per section.
- **Dark mode is a content choice, not a style choice** — the videos and dashboards were built for dark UI; reinforces "behind closed doors."
- **Accessibility built in** — skip links, focus rings, alt text throughout, sr-only copy in film sections, full `prefers-reduced-motion` fork.
---
 
## If You Had More Time
 
- Convert `astronaut.mov` → `.mp4` (universal compatibility, ~50% smaller)
- Add a sticky "Register Now" CTA after the first theatre section
- Speaker bio cards with photos
- Live countdown to September 29
- Re-encode videos with shorter GOP for smoother scroll-scrubbing
- Mobile-optimized experience with poster-frame fallback for slow connections
- Subtle ambient sound design (muted by default, user-activated)
- More micro-interactions (magnetic icon hover, dashboard parallax)
---
 
## Raw Dump
 
**Prompts & Decisions**
- "Companies never talk about this in public" — line from the context doc, became the hero title
- Considered and cut: ocean drones, Bedrock Robotics retrofits, Wandercraft exoskeletons, autonomous greenhouses — none in the context file, none NestGen '26 speakers, would've meant inventing credibility
- Marquee ticker lists every confirmed org ("Shell · Airbus · UK Police · SQM · MPA Singapore · CSX") — social proof density
- "BVLOS" made an interactive glossary tooltip instead of explained in body copy, per the context doc's own framing
**Tech Stack Decisions**
- No build step — open `index.html` and it runs, intentional for hackathon judges
- GSAP via CDN, Luxy.js kept intact and extended
**Rejected Visual Directions**
- Split-screen (too "presentation deck")
- Animated particles (too "crypto landing page")
- Horizontal scroll (broke vertical rhythm, confused drone pathing)
- Per-industry color coding (clashed with video content)
**File Structure**
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
│   ├── site/            (6 field deployment photos)
│   └── video/          (3 videos + astronaut + wearable)
└── img/                (arrow.svg, star.svg)
```
 
**Key Numbers**
- 0 dependencies to install
- 6 industries covered with sourced stats
- 3 scroll-scrubbed video theatres + 1 autoplay loop
- 10 drone waypoints across the page
- 17+ confirmed organizations in the marquee
- 1 accent color (`#3fb9ff`)
 
