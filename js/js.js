/* =========================================================
   NestGen '26 — scroll engine
   Extends the original Luxy.js + GSAP/ScrollTrigger template.

   Architecture note
   -----------------
   luxy.js pins #luxy with `position:fixed` and translates it, so ANY
   `position:fixed` child of #luxy (including ScrollTrigger's own pin
   spacer) would be trapped inside that transform. So nothing here uses
   `pin:true`. Instead the film "theatres" and the drone live in fixed
   layers OUTSIDE #luxy, and empty `.runway` sections inside #luxy supply
   the scroll budget that drives them. Real scroll still happens on
   window (luxy sets body height), so ScrollTrigger is accurate.
   ========================================================= */

/* A refresh part-way down would leave luxy mid-lerp while ScrollTrigger takes its
   measurements, throwing every trigger off by the lag. Opt out of the browser's
   scroll restoration here, at parse time — by DOMContentLoaded it's already too
   late to stop it. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', function () {

	'use strict';

	var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var CAN_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

	gsap.registerPlugin(ScrollTrigger);
	Splitting();

	var vw = function (n) { return window.innerWidth * n / 100; };
	var vh = function (n) { return window.innerHeight * n / 100; };
	var $ = function (s, c) { return (c || document).querySelector(s); };
	var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

	/* -----------------------------------------------------
	   0. reduced motion — flatten everything, keep the story
	   ----------------------------------------------------- */
	if (REDUCED) {
		document.documentElement.classList.add('is-reduced');
		$$('.runway').forEach(function (sec) {
			var th = $('.theater[data-theater="' + sec.dataset.runway + '"]');
			if (!th) return;
			sec.appendChild(th);
			var v = $('.theater__video', th);
			v.src = v.dataset.src;
			v.controls = true;
			v.setAttribute('preload', 'metadata');
		});
		$('#hud').remove();
		return; // no scroll choreography at all
	}

	/* -----------------------------------------------------
	   1. smooth scroll engine (kept, slightly tightened)
	   ----------------------------------------------------- */
	luxy.init({ wrapperSpeed: 0.11 });

	/* -----------------------------------------------------
	   2. intro
	   ----------------------------------------------------- */
	var intro = gsap.timeline({ delay: .15 });
	intro.from('.header__brand', .9, { opacity: 0, y: -14, ease: 'power2.out' })
		.from('.header__kicker', .9, { opacity: 0, y: 18, ease: 'power2.out' }, '-=.6')
		.from('.title .char', 1, { opacity: 0, yPercent: 130, stagger: .045, ease: 'back.out' }, '-=.5')
		.to('.header__img', 1.8, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', ease: 'expo.out' }, '-=.9')
		.from('.header__sub', 1, { opacity: 0, y: 20, ease: 'power2.out' }, '-=1.2')
		.from('.header__marq', 1.6, { opacity: 0, yPercent: 100, ease: 'expo.out' }, '-=1.3')
		.from('.header__cue', .8, { opacity: 0, ease: 'power1.out' }, '-=.9')
		.to('#hud', .8, { opacity: 1, onStart: function () { $('#hud').classList.add('is-on'); } }, '-=.6');

	/* rotating squares behind each section title (original behaviour) */
	gsap.utils.toArray('.section-title__square').forEach(function (sq) {
		ScrollTrigger.create({
			trigger: sq,
			animation: gsap.from(sq, 3, { rotation: 720 }),
			start: 'top bottom',
			scrub: 1.9
		});
	});

	/* -----------------------------------------------------
	   3. directional entrances AND exits
	   data-fly="x,y,rotation" — the element flies in from that
	   offset, holds while on screen, then retreats the same way.
	   ----------------------------------------------------- */
	$$('[data-fly]').forEach(function (el) {
		var p = el.dataset.fly.split(',').map(parseFloat);
		var dx = p[0] || 0, dy = p[1] || 0, dr = p[2] || 0;

		var tl = gsap.timeline({
			scrollTrigger: {
				trigger: el,
				start: 'top 94%',
				end: 'bottom 6%',
				scrub: 1.1,
				invalidateOnRefresh: true
			}
		});

		tl.fromTo(el,
			{ x: dx, y: dy, rotation: dr, autoAlpha: 0 },
			{ x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 1, ease: 'power2.out' })
			.to(el, { duration: 2.6 })                                             // dwell
			.to(el, { x: dx, y: dy, rotation: dr, autoAlpha: 0, duration: 1, ease: 'power2.in' });
	});

	/* -----------------------------------------------------
	   4. section parallax (original passes, re-pointed)
	   ----------------------------------------------------- */
	function scrubTo(target, vars, trigger, start) {
		vars.scrollTrigger = { trigger: trigger, start: start || 'top top', scrub: 1.9 };
		return gsap.to(target, vars);
	}

	scrubTo('.title_paralax', { yPercent: -150 }, '.header');
	scrubTo('.header .stroke', { xPercent: 30 }, '.header');
	scrubTo('.header__img', { xPercent: -40, opacity: 0 }, '.header');
	scrubTo('.header__img img', { scale: 1.25 }, '.header');

	/* .header__sub is also animated by the intro, so a plain `to` would latch its
	   start opacity at 0 (whatever the intro happened to have set when the scrub
	   first rendered) and the line would never come back. State it explicitly. */
	gsap.fromTo('.header__sub', { yPercent: 0, opacity: 1 }, {
		yPercent: -80, opacity: 0, immediateRender: false,
		scrollTrigger: { trigger: '.header', start: 'top top', scrub: 1.9 }
	});
	scrubTo('.header__marq-wrapp', { xPercent: -60 }, '.header');
	scrubTo('.header__marq-star img', { rotate: -720 }, '.header');

	gsap.from('.about__img img', { scale: 1.5, scrollTrigger: { trigger: '.about', start: 'top bottom', scrub: 1.9 } });

	gsap.from('.benefits__num', {
		x: function (i, el) { return (1 - parseFloat(el.getAttribute('data-speed'))); },
		scrollTrigger: { trigger: '.benefits__list', start: 'top bottom', scrub: 1.9 }
	});

	gsap.from('.work__item, .work__item-num', {
		y: function (i, el) { return (1 - parseFloat(el.getAttribute('data-speed'))); },
		scrollTrigger: { trigger: '.work', start: 'top bottom', scrub: 1.9 }
	});
	gsap.from('.work__item-img img', {
		scale: 1.5,
		scrollTrigger: { trigger: '.work__wrapp', start: 'top bottom', scrub: 1.9 }
	});

	gsap.from('.serv__item-arrow', {
		x: function (i, el) { return (1 - parseFloat(el.getAttribute('data-speed'))); },
		scrollTrigger: { trigger: '.serv__list', start: 'top bottom', scrub: 1.9 }
	});
	gsap.from('.serv__item', {
		yPercent: 60, autoAlpha: 0, stagger: .06,
		scrollTrigger: { trigger: '.serv__list', start: 'top 85%', end: 'top 40%', scrub: 1.2 }
	});

	gsap.from('.footer__div span', {
		y: function (i, el) { return (1 - parseFloat(el.getAttribute('data-speed'))); },
		opacity: 0,
		scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 1.9 }
	});

	/* horizontal proof strip — drifts sideways as the page scrolls past */
	var strip = $('.strip'), track = $('.strip__track');
	if (strip && track) {
		gsap.fromTo(track, { x: 0 }, {
			x: function () { return -Math.max(0, track.scrollWidth - window.innerWidth + 120); },
			ease: 'none',
			scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true }
		});
	}

	/* -----------------------------------------------------
	   5. frame-by-frame, scroll-scrubbed film theatres
	   ----------------------------------------------------- */
	$$('.runway').forEach(function (sec) {
		var key = sec.dataset.runway;
		var th = $('.theater[data-theater="' + key + '"]');
		if (!th) return;

		var vid = $('.theater__video', th);
		var bar = $('.theater__scrubbar i', th);
		var cap = $('.theater__caption', th);
		var endMsg = $('.theater__endmsg', th);
		var isAutoplay = th.hasAttribute('data-autoplay');

		/* --- lazy load: only fetch the file one screen before it's needed */
		ScrollTrigger.create({
			trigger: sec, start: 'top bottom+=120%', once: true,
			onEnter: function () {
				th.classList.add('is-loading');
				vid.src = vid.dataset.src;
				vid.load();
			}
		});

		/* ===== AUTOPLAY-LOOP THEATRES (astronaut, etc.) ===== */
		if (isAutoplay) {
			var apReady = false, apPlaying = false;

			vid.addEventListener('loadedmetadata', function () {
				apReady = true;
				th.classList.remove('is-loading');
				vid.muted = true;
			});

			vid.addEventListener('canplay', function () {
				apReady = true;
				th.classList.remove('is-loading');
			});

			vid.addEventListener('error', function () {
				th.classList.remove('is-loading');
			});

			var win = ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom' });
			var lastO = -1;

			gsap.ticker.add(function () {
				var y = luxy.wapperOffset || 0;
				var a = win.start, b = win.end, H = window.innerHeight;
				var fin = Math.min(H * .7, a), fout = H * .45;

				var o = y < a ? gsap.utils.clamp(0, 1, (y - (a - fin)) / Math.max(1, fin))
					: y <= b ? 1
						: gsap.utils.clamp(0, 1, 1 - (y - b) / fout);

				if (o !== lastO) { gsap.set(th, { autoAlpha: o }); lastO = o; }

				/* play/pause based on visibility */
				if (apReady) {
					if (o > 0 && !apPlaying) {
						apPlaying = true;
						vid.muted = true;
						var pr = vid.play();
						if (pr && pr.catch) pr.catch(function () { });
					} else if (o <= 0 && apPlaying) {
						apPlaying = false;
						vid.pause();
					}
				}

				if (o <= 0) return;

				var p = gsap.utils.clamp(0, 1, (y - a) / Math.max(1, b - a));

				/* caption fades in/out */
				if (cap) {
					var k = Math.min(gsap.utils.clamp(0, 1, p / .12), gsap.utils.clamp(0, 1, (1 - p) / .12));
					gsap.set(cap, { autoAlpha: k, y: (1 - k) * 40 });
				}

				/* scrub bar still tracks scroll even though video autoplays */
				if (bar) bar.style.width = (p * 100).toFixed(1) + '%';

				/* end message: show when near the bottom of the runway */
				if (endMsg) {
					if (p > 0.85) {
						var msgAlpha = gsap.utils.clamp(0, 1, (p - 0.85) / 0.12);
						gsap.set(endMsg, { autoAlpha: msgAlpha, y: (1 - msgAlpha) * 30 });
						if (cap) gsap.set(cap, { autoAlpha: 0 });
					} else {
						gsap.set(endMsg, { autoAlpha: 0 });
					}
				}
			});

			return; // skip the scroll-scrub logic below
		}

		/* ===== SCROLL-SCRUBBED THEATRES (thesis, maritime) ===== */
		var dur = 0, wanted = 0, ready = false;

		vid.addEventListener('loadedmetadata', function () {
			dur = vid.duration || 0;
			ready = true;
			th.classList.remove('is-loading');
			vid.muted = true;
			var pr = vid.play();
			if (pr && pr.then) {
				pr.then(function () { vid.pause(); vid.currentTime = 0; })
				  .catch(function () {
					try { vid.currentTime = 0; } catch (e) { }
				  });
			}
		});

		vid.addEventListener('error', function () {
			th.classList.remove('is-loading');
		});

		var win = ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom' });
		var lastO = -1, lastBar = -1;

		gsap.ticker.add(function () {
			var y = luxy.wapperOffset || 0;
			var a = win.start, b = win.end, H = window.innerHeight;
			var fin = Math.min(H * .7, a), fout = H * .45;

			var o = y < a ? gsap.utils.clamp(0, 1, (y - (a - fin)) / Math.max(1, fin))
				: y <= b ? 1
					: gsap.utils.clamp(0, 1, 1 - (y - b) / fout);

			if (o !== lastO) { gsap.set(th, { autoAlpha: o }); lastO = o; }
			if (o <= 0) return;

			var p = gsap.utils.clamp(0, 1, (y - a) / Math.max(1, b - a));

			if (bar && Math.abs(p - lastBar) > .002) { bar.style.width = (p * 100).toFixed(1) + '%'; lastBar = p; }

			gsap.set(vid, { scale: 1.12 - .12 * p });

			if (cap) {
				var k = Math.min(gsap.utils.clamp(0, 1, p / .12), gsap.utils.clamp(0, 1, (1 - p) / .12));
				gsap.set(cap, { autoAlpha: k, y: (1 - k) * 40 });
			}

			if (!ready || !dur) return;
			wanted = gsap.utils.clamp(0, dur - 0.05, p * dur);
			if (Math.abs(vid.currentTime - wanted) > 1 / 25 && !vid.seeking) {
				try { vid.currentTime = wanted; } catch (e) { }
			}
		});
	});

	/* -----------------------------------------------------
	   6. the drone throughline
	   One object, parked at rest, moved only by scroll. It hops
	   between per-section waypoints, banking into the turns.
	   ----------------------------------------------------- */
	var drone = $('#drone');
	var droneImg = $('.drone__img');
	var droneBeam = $('.drone__beam');
	var droneTag = $('#droneTag');

	var LEGS = [
		{ id: 'hook', x: 12, y: 62, r: 0, s: .95, tag: 'unit 01 · idle' },
		{ id: 'pattern', x: 76, y: 22, r: -10, s: .62, tag: 'transit' },
		{ id: 'thesis', x: 22, y: 16, r: 12, s: .5, tag: 'physical ai' },
		{ id: 'industries', x: 84, y: 58, r: -14, s: .82, tag: 'six rooms' },
		{ id: 'maritime', x: 16, y: 28, r: 10, s: .58, tag: 'alarm · 90s' },
		{ id: 'tool', x: 64, y: 12, r: -7, s: .48, tag: 'telemetry' },
		{ id: 'crossover', x: 28, y: 68, r: 14, s: .88, tag: 'gadget' },
		{ id: 'rooms', x: 88, y: 22, r: -11, s: .6, tag: 'four more' },
		{ id: 'stage', x: 10, y: 44, r: 8, s: .7, tag: 'on stage' },
		{ id: 'cta', x: 50, y: 26, r: 0, s: 1.1, tag: 'sept 29' }
	].filter(function (l) { return document.getElementById(l.id); });

	if (drone && LEGS.length > 1) {
		gsap.set(drone, {
			xPercent: -50, yPercent: -50,
			x: vw(LEGS[0].x), y: vh(LEGS[0].y),
			rotation: LEGS[0].r, scale: LEGS[0].s
		});

		/* Position is interpolated by hand rather than by one scrub tween per leg:
		   overlapping tweens on the same properties all park at progress 1 and the
		   last one to render wins, which strands the drone mid-page. One reader,
		   one writer, no ambiguity. quickTo supplies the easing/lag. */
		var probes = LEGS.map(function (l) {
			return ScrollTrigger.create({ trigger: '#' + l.id, start: 'top top', end: 'top top' });
		});

		var qx = gsap.quickTo(drone, 'x', { duration: .45, ease: 'power3' });
		var qy = gsap.quickTo(drone, 'y', { duration: .45, ease: 'power3' });
		var qr = gsap.quickTo(drone, 'rotation', { duration: .8, ease: 'power3' });
		// NB: quickTo needs a real prop tween. `scale` is a shorthand CSSPlugin
		// expands into scaleX/scaleY, so quickTo('scale') recurses forever in
		// Tween.resetTo. Drive the two components instead.
		var qsx = gsap.quickTo(drone, 'scaleX', { duration: .6, ease: 'power3' });
		var qsy = gsap.quickTo(drone, 'scaleY', { duration: .6, ease: 'power3' });
		var qs = function (v) { qsx(v); qsy(v); };
		var smooth = gsap.parseEase('power1.inOut');
		var tagNow = '';

		function flyDrone(y) {
			var i = 0;
			while (i < probes.length - 2 && y >= probes[i + 1].start) i++;
			var a = LEGS[i], b = LEGS[i + 1];
			var s0 = probes[i].start, s1 = probes[i + 1].start;
			var e = smooth(gsap.utils.clamp(0, 1, (y - s0) / Math.max(1, s1 - s0)));

			qx(vw(a.x + (b.x - a.x) * e));
			qy(vh(a.y + (b.y - a.y) * e));
			qr(a.r + (b.r - a.r) * e);
			qs(a.s + (b.s - a.s) * e);

			var tag = e > .5 ? b.tag : a.tag;
			if (droneTag && tag !== tagNow) { tagNow = tag; droneTag.textContent = tag; }
		}

		/* banking + rotor wash read off raw scroll velocity */
		var bank = gsap.quickTo(droneImg, 'rotation', { duration: .5, ease: 'power3' });
		var lift = gsap.quickTo(droneImg, 'y', { duration: .5, ease: 'power3' });
		var beam = gsap.quickTo(droneBeam, 'opacity', { duration: .6, ease: 'power2' });

		var lastY = window.pageYOffset || 0, vel = 0;

		gsap.ticker.add(function (time, dt) {
			// driven off luxy's own smoothed offset, so the drone sits exactly where
			// the page visually is rather than where the raw scrollbar is
			flyDrone(luxy.wapperOffset || 0);

			var y = window.pageYOffset || 0;
			var raw = (y - lastY) / Math.max(dt || 16.7, 8) * 1000;   // px/sec
			lastY = y;
			vel += (raw - vel) * .25;                                  // smooth the spikes

			var v = gsap.utils.clamp(-2600, 2600, vel);
			bank(v / 190);
			lift(-Math.abs(v) / 260);
			beam(gsap.utils.clamp(0, .9, Math.abs(v) / 1500));
		});
	}

	/* -----------------------------------------------------
	   7. stat count-up
	   ----------------------------------------------------- */
	$$('[data-count]').forEach(function (el) {
		var end = parseFloat(el.dataset.count);
		var pre = el.dataset.prefix || '';
		var suf = el.dataset.suffix || '';
		var o = { v: 0 };
		ScrollTrigger.create({
			trigger: el, start: 'top 88%', once: true,
			onEnter: function () {
				gsap.to(o, {
					v: end, duration: 1.4, ease: 'power2.out',
					onUpdate: function () { el.textContent = pre + Math.round(o.v) + suf; }
				});
			}
		});
	});

	/* -----------------------------------------------------
	   8. hover micro-interactions
	   ----------------------------------------------------- */
	if (CAN_HOVER) {

		/* cursor spotlight */
		var spot = $('#spotlight');
		var sx = gsap.quickTo(spot, 'x', { duration: .8, ease: 'power3' });
		var sy = gsap.quickTo(spot, 'y', { duration: .8, ease: 'power3' });
		var spotOn = false;
		window.addEventListener('pointermove', function (e) {
			if (!spotOn) { spotOn = true; gsap.to(spot, { opacity: 1, duration: .6 }); }
			sx(e.clientX); sy(e.clientY);
		}, { passive: true });

		/* 3d tilt + light-follows-cursor on cards */
		$$('[data-tilt]').forEach(function (el) {
			var rx = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power3' });
			var ry = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power3' });
			gsap.set(el, { transformPerspective: 1000, transformOrigin: 'center' });

			el.addEventListener('pointermove', function (e) {
				var r = el.getBoundingClientRect();
				var px = (e.clientX - r.left) / r.width;
				var py = (e.clientY - r.top) / r.height;
				rx(-(py - .5) * 7);
				ry((px - .5) * 9);
				el.style.setProperty('--mx', (px * 100) + '%');
				el.style.setProperty('--my', (py * 100) + '%');
			}, { passive: true });

			el.addEventListener('pointerleave', function () { rx(0); ry(0); });
		});

		/* magnetic elements */
		$$('[data-magnet]').forEach(function (el) {
			var mx = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' });
			var my = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
			el.addEventListener('pointermove', function (e) {
				var r = el.getBoundingClientRect();
				mx((e.clientX - (r.left + r.width / 2)) * .35);
				my((e.clientY - (r.top + r.height / 2)) * .5);
			}, { passive: true });
			el.addEventListener('pointerleave', function () { mx(0); my(0); });
		});
	}

	/* -----------------------------------------------------
	   9. chapter rail
	   ----------------------------------------------------- */
	var hudLinks = $$('#hud a');
	hudLinks.forEach(function (a) {
		var sec = document.getElementById(a.getAttribute('href').slice(1));
		if (!sec) return;

		a.addEventListener('click', function (e) {
			e.preventDefault();
			// #luxy is translated by its own lerp, so rect.top is already relative
			// to the smoothed wrapper — add the wrapper offset back to get doc-space.
			var top = sec.getBoundingClientRect().top + (luxy.wapperOffset || 0);
			window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
		});

		ScrollTrigger.create({
			trigger: sec, start: 'top 55%', end: 'bottom 45%',
			onToggle: function (self) { a.classList.toggle('is-active', self.isActive); }
		});
	});

	var pct = $('#hudPct'), lastPct = -1;
	if (pct) {
		gsap.ticker.add(function () {
			var max = document.documentElement.scrollHeight - window.innerHeight;
			var n = max > 0 ? Math.round(((window.pageYOffset || 0) / max) * 100) : 0;
			if (n !== lastPct) { lastPct = n; pct.textContent = String(n).padStart(2, '0'); }
		});
	}

	/* -----------------------------------------------------
	   10. keep measurements honest
	   ----------------------------------------------------- */
	window.addEventListener('load', function () {
		if (!location.hash) window.scrollTo(0, 0);   // browsers restore scroll after load
		ScrollTrigger.refresh();
	});
	$$('img').forEach(function (img) {
		if (!img.complete) img.addEventListener('load', ScrollTrigger.refresh, { once: true });
	});
});
