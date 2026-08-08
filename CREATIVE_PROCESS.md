# Creative Process Document — NestGen '26 Scrollytelling Landing Page
**Built by Sunil**

---

## Core Idea

> **Make the viewer feel like they're being let into a room they shouldn't be in.**

The NestGen '26 pitch isn't "drones are cool" — it's "companies almost never talk about this stuff in public." The whole page is built around that tension: Fortune 500 playbooks, procurement failures, internal arguments that normally never leave the boardroom, but for one day a year, do.

The goal is to make the user scroll compulsively — not from gimmicks, but because the next section always feels like turning a page in a story they've already committed to. Each section reveals a new industry, a new stat, a new reason this matters.

Secondary goals:
- Make FlytBase's product feel real: real dashboards, real drone images, real deployments, not a pitch deck
- Make six industries feel distinct but connected by one pattern: "instead of X, now Y"
- Leave the viewer thinking: "I need to watch this event"

---

## Direction / References

### Visual Language
- **Dark, cinematic, editorial** — not SaaS-bright. Closer to a Bloomberg Businessweek feature or an Apple keynote than a landing page
- **JetBrains Mono + Syne 800** typography pairing — technical authority meets bold editorial weight
- **Cyan (#3fb9ff) as the only accent** — everything else is grayscale. Cyan functions like a status LED and always means "this is live / active / confirmed"

### Mood References
- Apple product launch pages (scroll-driven video reveals)
- Bloomberg long-form data journalism (dark backgrounds, big stats)
- Stripe developer docs (monospace precision, information density)
- Film title sequences

### Anti-References (deliberately avoided)
- Generic SaaS hero with gradient blob + "Book a Demo"
- Team headshot carousels
- Light mode / corporate blue
- Stock photography
- Animated SVG illustrations

### Key Inspirations
- FlytBase's own Kathputli Factory puppet video — it proved serious-but-not-boring tone works
- The NestGen26_Context.md doc itself — the copy practically wrote the page
- The Luxy.js smooth scroll engine — the foundation the website was built on and extended

---

## AI Process

### Tools Used

| Tool | What It Did | My Override |
|---|---|---|
| **Gemini (Antigravity)** | Codebase assembly, JS architecture, CSS systems, debugging scroll-scrub logic, responsive breakpoints | Reviewed every line myself; rejected several animation approaches; manually tuned timing values, parallax offsets, and colors |
| **Pika** | Generated characters and helped produce one of the film assets | Some outputs didn't work as expected, but it helped create some key visual material |
| **GSAP / ScrollTrigger** | Animation engine, not AI — the core dependency | Hand-authored every timeline, scrub range, and easing curve |
| **Google Flow** | Helped generate videos more efficiently | Useful, but limited |
| **KlingAI** | Attempted video generation | Didn't work as expected at all |

### What I Rejected / Manually Overrode
- IntersectionObserver + CSS classes for entrances — exits can't reverse properly on scroll
- vanilla-tilt.js for card hover — fights with GSAP transforms on the same elements
- MotionPathPlugin for the drone — extra CDN dependency and it breaks when section heights change
- Several "startup-y" color palettes — locked in the single-cyan-on-black system instead
- All AI-generated copy was replaced with sourced content from NestGen26_Context.md

---

## Iterations

### Iteration 1: The Drone Problem
Per-section GSAP scrub tweens caused the drone to strand mid-page because multiple writers fought over `x/y`. Fixed by building a single interpolator that reads all section positions and lerps between waypoints — one reader, one writer.

### Iteration 2: Video Scrub — Images vs. Video
Considered JPEG sequences (~33MB per section) versus real MP4s (0.4–14MB). Went with real `<video>` elements and `currentTime` seeking, throttled, with a primed decoder on load so the first seek paints a real frame.

### Iteration 3: Astronaut Video Swap
The original Doraemon × Spider-Man crossover clip was replaced with an AI-generated astronaut clip from Pika. Scroll-scrubbing was choppy (`.mov`, 94MB), so it became an autoplay loop instead — more cinematic. Added the "that was scary no? / saved by our automation" fade-in to bridge back to the pitch.

### Iteration 4: The Pin Problem
Luxy.js's `position: fixed` wrapper trapped ScrollTrigger's `pin: true`. Fixed by moving theatres into fixed layers outside `#luxy`, with empty `.runway` sections (320–360vh) inside `#luxy` supplying scroll budget.

### Iteration 5: Directional Entrances
Built a `data-fly="x,y,rotation"` system so cards arrive from a specific direction with a three-beat fly-in / dwell / retreat, fully reversible on scroll-back.

---

## Final Rationale

### Why this works

1. **The scroll IS the story.** Every section answers "what happened next?"
2. **The drone is the throughline.** It follows you through the page, banks on fast scroll, hovers on stop, and updates its tag per section.
3. **Dark mode is a content choice, not a style choice.** The videos and dashboards were built for dark UI, and the darkness reinforces the feeling of being behind closed doors.
4. **Accessibility is built in.** Skip links, focus rings, alt text throughout, `sr-only` copy in film sections, and a full `prefers-reduced-motion` fork are all part of the experience.

---

## If I Had More Time

- Convert `astronaut.mov` → `.mp4` for universal compatibility and ~50% smaller file size
- Add a sticky "Register Now" CTA after the first theatre section
- Add speaker bio cards with photos
- Add a live countdown to September 29
- Re-encode videos with a shorter GOP for smoother scroll-scrubbing
- Add a mobile-optimized experience with poster-frame fallback for slow connections
- Add subtle ambient sound design, muted by default and user-activated
- Add more micro-interactions like magnetic icon hover and dashboard parallax

---

## Raw Dump

### Prompts & Decisions
- "Companies never talk about this in public" — this line from the context doc became the hero title
- Considered and cut: ocean drones, Bedrock Robotics retrofits, Wandercraft exoskeletons, autonomous greenhouses — none were in the context file, none were NestGen '26 speakers, and using them would have meant inventing credibility
- The marquee ticker lists every confirmed organization — social proof density: "Shell · Airbus · UK Police · SQM · MPA Singapore · CSX"
- The "BVLOS" tooltip was deliberate — the context doc says you'll hear this term a lot, so it became an interactive glossary instead of body-copy exposition

### Tech Stack Decisions
- No build step. Open `index.html` and it runs — intentional for hackathon judges
- GSAP via CDN
- Luxy.js was kept intact and extended

### Rejected Visual Directions
- Split-screen layout — felt too much like a presentation deck
- Animated particles — felt too much like a crypto landing page
- Horizontal scroll section — broke vertical rhythm and confused drone pathing
- Per-industry color coding — clashed with the video content; monochrome-with-cyan won

### File Structure
```text
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

### Key Numbers
- 0 dependencies to install
- 6 industries covered with sourced stats
- 3 scroll-scrubbed video theatres + 1 autoplay loop
- 10 drone waypoints across the page
- 17+ confirmed organizations in the marquee
- 1 accent color: cyan (#3fb9ff)
