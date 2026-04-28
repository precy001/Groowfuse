/**
 * Groow Fuse Consult — Home page
 * --------------------------------------------------------
 * Single self-contained component. No Framer Motion, no extra
 * dependencies. Tailwind classes are used for layout primitives;
 * all visual styling lives in the embedded <style> block so the
 * design language is intact even if a Tailwind class is missing.
 *
 * Requirements:
 *   - React 17+
 *   - Tailwind CSS (recommended). If you don't have it, install:
 *       npm i -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
 *   - Internet (Google Fonts loaded at runtime, deduped).
 *
 * Wire to backend later:
 *   - Newsletter form posts to /api/newsletter (PHP).
 *   - CTA buttons currently point to /contact and /services.
 */

import { useEffect, useRef, useState } from 'react';

/* ────────────────────────────────────────────────────────────
 * Hooks
 * ──────────────────────────────────────────────────────────── */

// Fade-up reveal on scroll (no library)
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, shown];
}

// Mouse-tracked spotlight for the hero
function useMouseGlow() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);
  return ref;
}

/* ────────────────────────────────────────────────────────────
 * Main
 * ──────────────────────────────────────────────────────────── */

export default function Home() {
  // Inject Google Fonts once
  useEffect(() => {
    const id = 'gf-fonts';
    if (document.getElementById(id)) return;
    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(pre1);
    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    document.head.appendChild(pre2);
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="gf-root">
      <GfStyles />
      <Nav />
      <Hero />
      <Intro />
      <Services />
      <Differentiators />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Styles
 * ──────────────────────────────────────────────────────────── */

function GfStyles() {
  return (
    <style>{`
      .gf-root {
        --bg: #0A0A0B;
        --surface: #101012;
        --surface-2: #16161A;
        --border: #1E1E22;
        --border-bright: #2A2A30;
        --text: #F5F5F4;
        --muted: #8A8A8E;
        --dim: #555558;
        --green: #1FE07A;
        --green-soft: rgba(31, 224, 122, 0.45);

        --serif: 'Instrument Serif', Georgia, serif;
        --sans: 'Geist', ui-sans-serif, system-ui, -apple-system, sans-serif;
        --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

        background: var(--bg);
        color: var(--text);
        font-family: var(--sans);
        font-feature-settings: "ss01", "cv11";
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
      }
      .gf-root *, .gf-root *::before, .gf-root *::after { box-sizing: border-box; }
      .gf-root a { color: inherit; text-decoration: none; }
      .gf-root button { font-family: inherit; cursor: pointer; }

      /* Backgrounds */
      .gf-grid {
        background-image:
          linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
        background-size: 56px 56px;
        background-position: -1px -1px;
      }
      .gf-grid-dense {
        background-image:
          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
        background-size: 28px 28px;
      }
      .gf-noise {
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
      }

      /* Reveal */
      .gf-reveal { opacity: 0; transform: translateY(24px); transition: opacity .9s cubic-bezier(.22,.61,.36,1), transform .9s cubic-bezier(.22,.61,.36,1); }
      .gf-reveal.is-shown { opacity: 1; transform: translateY(0); }
      .gf-reveal-1 { transition-delay: .08s; }
      .gf-reveal-2 { transition-delay: .18s; }
      .gf-reveal-3 { transition-delay: .28s; }
      .gf-reveal-4 { transition-delay: .38s; }

      /* Hero entrance */
      @keyframes gfRise {
        from { opacity: 0; transform: translateY(28px); filter: blur(6px); }
        to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
      }
      .gf-rise { animation: gfRise .9s cubic-bezier(.22,.61,.36,1) both; }

      /* Pulse for orb */
      @keyframes gfPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.65; }
        50%      { transform: translate(-50%, -50%) scale(1.08); opacity: 0.9;  }
      }
      .gf-orb { animation: gfPulse 7s ease-in-out infinite; }

      /* Slow drift on grid */
      @keyframes gfDrift {
        from { background-position: -1px -1px; }
        to   { background-position: 559px 559px; }
      }
      .gf-drift { animation: gfDrift 60s linear infinite; }

      /* Caret blink */
      @keyframes gfBlink { 50% { opacity: 0; } }
      .gf-caret {
        display: inline-block;
        width: 0.42em; height: 0.7em;
        background: var(--green);
        margin-left: 6px;
        transform: translateY(-2px);
        animation: gfBlink 1s steps(2, start) infinite;
        box-shadow: 0 0 18px var(--green-soft);
        vertical-align: baseline;
      }

      /* Float */
      @keyframes gfFloat {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-4px); }
      }
      .gf-float { animation: gfFloat 4s ease-in-out infinite; }

      /* Mouse spotlight */
      .gf-spotlight { position: relative; }
      .gf-spotlight::before {
        content: ""; position: absolute; inset: 0;
        background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(31,224,122,0.10), transparent 60%);
        pointer-events: none;
        mix-blend-mode: screen;
      }

      /* Cards */
      .gf-card { transition: transform .5s cubic-bezier(.22,.61,.36,1), border-color .3s ease, background .3s ease; }
      .gf-card:hover { transform: translateY(-4px); }
      .gf-card:hover .gf-arrow { transform: translateX(4px); background: var(--green); color: #000; border-color: var(--green); }
      .gf-arrow { transition: transform .35s ease, background .3s ease, color .3s ease, border-color .3s ease; }

      /* Buttons */
      .gf-btn-primary {
        background: var(--green);
        color: #000;
        position: relative;
        overflow: hidden;
        transition: transform .25s ease, box-shadow .35s ease;
        border: 1px solid var(--green);
        font-weight: 500;
      }
      .gf-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 40px -10px var(--green-soft); }
      .gf-btn-primary::after {
        content: ""; position: absolute; inset: 0;
        background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
        transform: translateX(-100%);
        transition: transform .8s ease;
      }
      .gf-btn-primary:hover::after { transform: translateX(100%); }

      .gf-btn-ghost {
        border: 1px solid var(--border-bright);
        color: var(--text);
        background: transparent;
        transition: border-color .3s ease, background .3s ease, color .3s ease;
      }
      .gf-btn-ghost:hover { border-color: var(--green); background: rgba(31,224,122,0.06); }

      /* Eyebrow / section label */
      .gf-eyebrow {
        font-family: var(--mono);
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--muted);
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .gf-eyebrow::before {
        content: "";
        width: 8px; height: 8px;
        background: var(--green);
        display: inline-block;
        box-shadow: 0 0 12px var(--green);
      }

      /* Italic emphasis */
      .gf-serif { font-family: var(--serif); font-style: italic; font-weight: 400; }

      /* Nav */
      .gf-nav { transition: backdrop-filter .3s ease, background .3s ease, border-color .3s ease; }
      .gf-nav.is-scrolled {
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        background: rgba(10,10,11,0.7);
        border-bottom-color: var(--border);
      }
      .gf-nav-link { position: relative; }
      .gf-nav-link::after {
        content: ""; position: absolute;
        bottom: -6px; left: 0; right: 0; height: 1px;
        background: var(--green);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform .35s ease;
      }
      .gf-nav-link:hover::after { transform: scaleX(1); }
      .gf-nav-link:hover { color: var(--text); }

      /* Inputs */
      .gf-input {
        background: transparent;
        border: 0;
        outline: none;
        color: var(--text);
        font-family: var(--sans);
      }
      .gf-input::placeholder { color: var(--dim); }

      /* Headline scaling */
      .gf-h1 {
        font-size: clamp(44px, 7.2vw, 96px);
        line-height: 0.98;
        letter-spacing: -0.035em;
        font-weight: 500;
      }
      .gf-h2 {
        font-size: clamp(32px, 4.6vw, 56px);
        line-height: 1.04;
        letter-spacing: -0.025em;
        font-weight: 500;
      }

      /* Underline link */
      .gf-link {
        display: inline-flex; align-items: center; gap: 8px;
        border-bottom: 1px solid var(--border-bright);
        padding-bottom: 4px;
        transition: border-color .3s, color .3s;
      }
      .gf-link:hover { border-color: var(--green); color: var(--green); }

      /* Section divider */
      .gf-hairline { background: linear-gradient(to right, transparent, var(--border-bright) 20%, var(--border-bright) 80%, transparent); }

      /* Marquee for capability strip (subtle) */
      @keyframes gfMarquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }

      @media (max-width: 640px) {
        .gf-h1 { font-size: clamp(38px, 11vw, 64px); }
      }

      /* ─── Hero slide stack (non-carousel) ───
         All slides occupy the same grid cell so the parent sizes to the
         tallest, then we crossfade between them via opacity + translate. */
      .gf-slides {
        display: grid;
        grid-template-columns: 1fr;
        position: relative;
      }
      .gf-slide {
        grid-column: 1;
        grid-row: 1;
        opacity: 0;
        transform: translateY(14px);
        transition: opacity 0.7s cubic-bezier(.22,.61,.36,1),
                    transform 0.7s cubic-bezier(.22,.61,.36,1);
        pointer-events: none;
      }
      .gf-slide.is-active {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      /* ─── Frame navigator (replaces dots/arrows) ───
         Console-style indicator strip. Active tile gets a glowing green
         line filling its top edge; doubles as the auto-advance progress. */
      .gf-frame-nav {
        margin-top: 80px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        background: var(--border);
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
      }
      .gf-frame-tile {
        background: var(--bg);
        border: 0;
        padding: 18px 22px;
        text-align: left;
        position: relative;
        cursor: pointer;
        font: inherit;
        color: inherit;
        font-family: var(--mono);
        transition: background 0.3s ease;
      }
      .gf-frame-tile:hover { background: rgba(255,255,255,0.025); }
      .gf-frame-tile::before {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: var(--border-bright);
        transition: background 0.4s ease;
      }
      .gf-frame-tile.is-active::before { background: rgba(31,224,122,0.18); }

      .gf-frame-num {
        display: block;
        font-size: 11px;
        color: var(--dim);
        letter-spacing: 0.22em;
        margin-bottom: 6px;
        transition: color 0.4s ease;
      }
      .gf-frame-tag {
        display: block;
        font-size: 13px;
        color: var(--muted);
        letter-spacing: 0.2em;
        transition: color 0.4s ease;
      }
      .gf-frame-tile.is-active .gf-frame-num { color: var(--green); }
      .gf-frame-tile.is-active .gf-frame-tag { color: var(--text); }

      .gf-frame-fill {
        position: absolute;
        top: 0; left: 0;
        height: 1px;
        background: var(--green);
        box-shadow: 0 0 12px var(--green-soft), 0 0 4px var(--green);
        animation: gfFrameFill linear forwards;
        pointer-events: none;
      }
      @keyframes gfFrameFill {
        from { width: 0; }
        to   { width: 100%; }
      }

      @media (max-width: 640px) {
        .gf-frame-nav { margin-top: 56px; }
        .gf-frame-tile { padding: 16px 14px; }
        .gf-frame-num { font-size: 10px; margin-bottom: 6px; letter-spacing: 0.18em; }
        .gf-frame-tag { font-size: 11px; letter-spacing: 0.14em; }
      }

      /* ─── Hero viewport-fit + background image ─── */
      .gf-hero {
        position: relative;
        min-height: 100vh;
        min-height: 100svh;     /* small-viewport fallback for mobile chrome */
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .gf-hero-inner {
        position: relative;
        flex: 1;
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding: 96px 24px 24px;
        display: flex;
        flex-direction: column;
        min-height: 0;          /* allow flex children to shrink */
      }
      @media (min-width: 1024px) {
        .gf-hero-inner { padding: 104px 40px 32px; }
      }
      .gf-hero-center {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 16px 0;
        min-height: 0;
      }
      /* Background image — swap the URL for your final hero asset.
         Treated heavily so it doesn't compete with the grid/orb layers. */
      .gf-hero-bg {
        position: absolute;
        inset: 0;
        background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=80');
        background-size: cover;
        background-position: center;
        opacity: 0.22;
        filter: grayscale(100%) contrast(1.05);
        pointer-events: none;
      }
      /* Dark veil for text legibility — sits between image and grid */
      .gf-hero-veil {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(10, 10, 11, 0.65) 0%,
          rgba(10, 10, 11, 0.45) 45%,
          rgba(10, 10, 11, 0.95) 100%
        );
        pointer-events: none;
      }

      /* On short viewports, ease up vertical padding so it still fits */
      @media (max-height: 860px) {
        .gf-hero-inner { padding: 88px 24px 20px; }
        .gf-hero-center { padding: 12px 0; }
      }
      @media (min-width: 1024px) and (max-height: 860px) {
        .gf-hero-inner { padding: 92px 40px 24px; }
      }
      @media (max-height: 720px) {
        .gf-hero-inner { padding: 80px 24px 16px; }
        .gf-hero-center { padding: 8px 0; }
        .gf-frame-tile { padding: 14px 18px; }
      }
      @media (max-height: 600px) {
        .gf-hero-inner { padding: 72px 24px 12px; }
      }
    `}</style>
  );
}

/* ────────────────────────────────────────────────────────────
 * Logo
 * ──────────────────────────────────────────────────────────── */

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="gf-float">
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeOpacity="0.25" />
      <circle cx="14" cy="14" r="4" fill="var(--green)" />
      <path d="M14 1 L14 9 M14 19 L14 27 M1 14 L9 14 M19 14 L27 14"
        stroke="var(--green)" strokeOpacity="0.5" strokeWidth="1" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * Nav
 * ──────────────────────────────────────────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Home', 'Services', 'Blog', 'About', 'Contact'];

  return (
    <header className={`gf-nav fixed top-0 inset-x-0 z-50 border-b border-transparent ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="max-w-[1280px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <Logo />
          <span className="text-[15px] tracking-tight font-medium">
            Groow<span style={{ color: 'var(--green)' }}>Fuse</span>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-9 text-[14px]"
          style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          {links.map((x, i) => (
            <li key={x}>
              <a href={`/${x === 'Home' ? '' : x.toLowerCase()}`} className="gf-nav-link">
                <span style={{ color: 'var(--dim)' }} className="mr-1.5">0{i + 1}</span>
                {x}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href="/contact" className="gf-btn-primary text-[13px] px-4 py-2 rounded-md tracking-tight inline-flex items-center gap-2 hidden sm:inline-flex">
            Book Consultation
            <span aria-hidden>→</span>
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-md border"
            style={{ borderColor: 'var(--border-bright)' }}
            aria-label="Menu"
          >
            <span className="block w-4 h-px bg-white relative before:content-[''] before:absolute before:left-0 before:right-0 before:h-px before:bg-white before:-top-1.5 after:content-[''] after:absolute after:left-0 after:right-0 after:h-px after:bg-white after:top-1.5" />
          </button>
        </div>
      </nav>
      {open && (
        <div className="md:hidden border-t" style={{ borderColor: 'var(--border)', background: 'rgba(10,10,11,0.95)' }}>
          <ul className="px-6 py-6 space-y-4" style={{ fontFamily: 'var(--mono)', fontSize: 14 }}>
            {links.map((x, i) => (
              <li key={x}>
                <a href={`/${x === 'Home' ? '' : x.toLowerCase()}`} className="flex justify-between items-center" style={{ color: 'var(--muted)' }}>
                  <span>{x}</span>
                  <span style={{ color: 'var(--dim)' }}>0{i + 1}</span>
                </a>
              </li>
            ))}
            <li>
              <a href="/contact" className="gf-btn-primary block text-center text-[13px] px-4 py-3 rounded-md mt-4">
                Book Consultation →
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/* ────────────────────────────────────────────────────────────
 * Hero
 * ──────────────────────────────────────────────────────────── */

function Hero() {
  const spotRef = useMouseGlow();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance interval. User clicks reset this timer (via dep on activeIndex).
  const ROTATE_MS = 7000;

  // Three frames, copy verbatim from groowfuse.com hero slider.
  const slides = [
    {
      tag: 'TRUST',
      headline: (
        <>
          Experience You Can{' '}
          <span style={{ whiteSpace: 'nowrap' }}>
            <span className="gf-serif" style={{ color: 'var(--green)' }}>Trust</span>.
            <span className="gf-caret" />
          </span>
        </>
      ),
      sub: 'Empowering your business with innovative IT strategies that bridge the gap between technology and vision.',
      primary: { label: 'Get Started', href: '/contact' },
      secondary: { label: 'Our Services', href: '/services' },
    },
    {
      tag: 'GROWTH',
      headline: (
        <>
          Grow <span className="gf-serif" style={{ color: 'var(--green)' }}>Faster</span>{' '}
          &amp;{' '}
          <span style={{ whiteSpace: 'nowrap' }}>
            <span className="gf-serif" style={{ color: 'var(--green)' }}>Safer</span>.
            <span className="gf-caret" />
          </span>
        </>
      ),
      sub: 'We help organizations of all sizes implement smarter, secure, and future-proof digital infrastructures.',
      primary: { label: 'Book Consultation', href: '/contact' },
      secondary: { label: 'About Us', href: '/about' },
    },
    {
      tag: 'DIGITAL',
      headline: (
        <>
          Digital{' '}
          <span style={{ whiteSpace: 'nowrap' }}>
            <span className="gf-serif" style={{ color: 'var(--green)' }}>Transformation</span>.
            <span className="gf-caret" />
          </span>
        </>
      ),
      sub: 'Specialized Business Analysis and Data Management to keep your business resilient.',
      primary: { label: 'Book Consultation', href: '/contact' },
      secondary: { label: 'Our Services', href: '/services' },
    },
  ];

  // Effect re-runs on every activeIndex change → click also resets the timer.
  useEffect(() => {
    const id = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => clearTimeout(id);
  }, [activeIndex, slides.length]);

  const capabilities = [
    'Process Analysis',
    'IT Procurement',
    'Workflow Automation',
    'Digital Transformation',
    'Vendor Evaluation',
    'SOP Development',
  ];

  return (
    <section ref={spotRef} className="gf-hero gf-spotlight">
      {/* Background image (treated) — swap URL to use your own */}
      <div aria-hidden className="gf-hero-bg" />
      {/* Dark veil for legibility */}
      <div aria-hidden className="gf-hero-veil" />
      {/* Background grid */}
      <div className="absolute inset-0 gf-grid gf-drift opacity-80 pointer-events-none" />
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-[200px] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, var(--bg), transparent)' }} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-[160px] pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
      {/* Green orb */}
      <div
        aria-hidden
        className="gf-orb absolute"
        style={{
          left: '50%', top: '65%', width: 520, height: 520,
          background: 'radial-gradient(circle, rgba(31,224,122,0.28) 0%, rgba(31,224,122,0.08) 35%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      {/* Noise overlay */}
      <div className="absolute inset-0 gf-noise opacity-25 pointer-events-none mix-blend-overlay" />

      <div className="gf-hero-inner">
        {/* TOP — eyebrow + frame index */}
        <div className="flex items-center justify-between gf-rise" style={{ animationDelay: '.05s' }}>
          <span className="gf-eyebrow">Groow Fuse Consult</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.22em' }}>
            FRAME{' '}
            <span style={{ color: 'var(--green)' }}>
              {String(activeIndex + 1).padStart(2, '0')}
            </span>
            {' '}/ {String(slides.length).padStart(2, '0')}
          </span>
        </div>

        {/* CENTER — slide stack vertically centered, grows to fill remaining space */}
        <div className="gf-hero-center">
          <div className="gf-slides gf-rise" style={{ animationDelay: '.15s' }}>
            {slides.map((slide, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={i}
                  className={`gf-slide ${isActive ? 'is-active' : ''}`}
                  aria-hidden={!isActive}
                >
                  <h1 className="gf-h1" style={{ maxWidth: '20ch' }}>
                    {slide.headline}
                  </h1>
                  <p className="mt-8 max-w-[58ch] text-[16px] md:text-[18px] leading-relaxed"
                    style={{ color: 'var(--muted)' }}>
                    {slide.sub}
                  </p>
                  <div className="mt-10 flex flex-wrap gap-3">
                    <a
                      href={slide.primary.href}
                      tabIndex={isActive ? 0 : -1}
                      className="gf-btn-primary px-6 py-3.5 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight"
                    >
                      {slide.primary.label}
                      <span aria-hidden>→</span>
                    </a>
                    <a
                      href={slide.secondary.href}
                      tabIndex={isActive ? 0 : -1}
                      className="gf-btn-ghost px-6 py-3.5 rounded-md text-[14px] font-medium inline-flex items-center gap-2 tracking-tight"
                    >
                      {slide.secondary.label}
                      <span aria-hidden>↗</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM — frame nav + capability strip */}
        <div>
          {/* Frame navigator — non-carousel: console-style indicator strip */}
          <div
            className="gf-frame-nav gf-rise"
            style={{ animationDelay: '.5s' }}
            role="tablist"
            aria-label="Hero frames"
          >
            {slides.map((slide, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveIndex(i)}
                  className={`gf-frame-tile ${isActive ? 'is-active' : ''}`}
                >
                  <span className="gf-frame-num">
                    {String(i + 1).padStart(2, '0')} / 03
                  </span>
                  <span className="gf-frame-tag">{slide.tag}</span>
                  {isActive && (
                    <span
                      key={`fill-${activeIndex}`}
                      className="gf-frame-fill"
                      style={{ animationDuration: `${ROTATE_MS}ms` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Capability strip */}
          <div className="gf-rise mt-8 pt-5 border-t flex flex-wrap items-center gap-x-8 gap-y-3"
            style={{ borderColor: 'var(--border)', animationDelay: '.6s' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.18em' }}>
              CORE CAPABILITIES /
            </span>
            {capabilities.map((c) => (
              <span key={c} style={{ fontFamily: 'var(--mono)', fontSize: 12 }} className="text-white/80">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Intro statement — verbatim mission line from groowfuse.com
 * ──────────────────────────────────────────────────────────── */

function Intro() {
  const [ref, shown] = useReveal();
  return (
    <section ref={ref} className="relative border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-28 lg:py-36 grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className={`gf-reveal ${shown ? 'is-shown' : ''} lg:col-span-3`}>
          <span className="gf-eyebrow">Mission</span>
        </div>
        <p className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} lg:col-span-9`}
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(24px, 2.8vw, 38px)',
            lineHeight: 1.3,
            letterSpacing: '-0.015em',
            color: 'var(--text)',
          }}>
          Groow Fuse Consult provides comprehensive business support to help organizations
          navigate the digital transformation landscape.
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Services
 * ──────────────────────────────────────────────────────────── */

function Services() {
  const [ref, shown] = useReveal();

  const services = [
    {
      n: '01',
      title: 'Business Process Improvement & Analysis',
      // Verbatim from groowfuse.com home
      desc: 'We help businesses reduce delays, manual work, and inefficiencies by reviewing and redesigning their business processes for peak performance.',
      href: '/services',
    },
    {
      n: '02',
      title: 'IT Procurement Advisory & Digital Transformation',
      // Verbatim from groowfuse.com home
      desc: 'We help growing companies choose the right business tools without wasting money, guiding smart technology investments from evaluation to implementation.',
      href: '/services',
    },
  ];

  return (
    <section ref={ref} className="relative py-40 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className={`gf-reveal ${shown ? 'is-shown' : ''}`}>
          <span className="gf-eyebrow">01 — Services</span>
        </div>
        <h2 className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} gf-h2 mt-8 max-w-[20ch]`}>
          Specialized <span className="gf-serif" style={{ color: 'var(--green)' }}>Consulting</span> Services
        </h2>

        {/* 1px-gap grid */}
        <div className="mt-24 grid lg:grid-cols-2 gap-px"
          style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
          {services.map((s, i) => (
            <article
              key={s.n}
              className={`gf-card gf-reveal gf-reveal-${i + 2} ${shown ? 'is-shown' : ''} relative p-12 lg:p-16`}
              style={{ background: 'var(--bg)' }}
            >
              {/* Corner brackets */}
              <span className="absolute top-4 left-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┌</span>
              <span className="absolute top-4 right-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┐</span>
              <span className="absolute bottom-4 left-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>└</span>
              <span className="absolute bottom-4 right-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┘</span>

              <div className="flex items-center justify-between mb-12">
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', letterSpacing: '0.2em' }}>
                  / {s.n}
                </span>
                <span className="gf-arrow inline-flex items-center justify-center w-10 h-10 rounded-md border"
                  style={{ borderColor: 'var(--border-bright)' }}>
                  <span aria-hidden>→</span>
                </span>
              </div>

              <h3 className="text-[22px] md:text-[26px] leading-tight tracking-tight font-medium max-w-[22ch]">
                {s.title}
              </h3>
              <p className="mt-6 text-[15px] leading-relaxed max-w-[48ch]" style={{ color: 'var(--muted)' }}>
                {s.desc}
              </p>

              <a href={s.href} className="gf-link mt-14 text-[14px] font-medium" style={{ display: 'inline-flex' }}>
                Learn more
                <span aria-hidden>↗</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Differentiators
 * ──────────────────────────────────────────────────────────── */

function Differentiators() {
  const [ref, shown] = useReveal();
  const items = [
    {
      n: '01',
      title: 'What Makes Us Different',
      // Verbatim from groowfuse.com
      body: 'We are built on top industry standards across multiple sectors, ensuring our work is reliable, secure, and aligned with the best practices that drive growth.',
    },
    {
      n: '02',
      title: 'Expertise',
      body: 'We deliver outcomes that are measurable, dependable, and meet the highest professional standards, ensuring your technology acts as a catalyst for value.',
    },
    {
      n: '03',
      title: 'Built to Evolve',
      body: 'Our approach supports growth and change, creating systems and processes that scale seamlessly as your business or organization expands into new markets.',
    },
    {
      n: '04',
      title: 'Future-Proof Growth',
      body: 'We create adaptable frameworks designed to remain relevant in a changing digital landscape, protecting your investment for the long term.',
    },
  ];

  return (
    <section ref={ref} className="relative py-40 overflow-hidden" style={{ background: 'var(--surface)' }}>
      <div className="absolute inset-0 gf-grid-dense opacity-30 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--green), transparent)' }} />

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-24">
          <div className={`gf-reveal ${shown ? 'is-shown' : ''} lg:col-span-6`}>
            <span className="gf-eyebrow">02 — Why us</span>
            <h2 className="gf-h2 mt-8">
              Providing <span className="gf-serif" style={{ color: 'var(--green)' }}>Top-Notch</span> Solutions At <span className="gf-serif">Affordable</span> Rates
            </h2>
          </div>
          <div className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} lg:col-span-5 lg:col-start-8 flex items-end`}>
            <p className="text-[15px] md:text-[17px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              At GroowFuse, we believe exceptional technology shouldn't come at a premium cost.
              We deliver high-quality, enterprise-grade technology solutions that are practical,
              efficient, and built around your unique business needs.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
          {items.map((it, i) => (
            <div
              key={it.n}
              className={`gf-card gf-reveal gf-reveal-${(i % 4) + 1} ${shown ? 'is-shown' : ''} p-10 relative`}
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center justify-between mb-8">
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)' }}>{it.n}</span>
                <DiffIcon i={i} />
              </div>
              <h3 className="text-[18px] font-medium tracking-tight">{it.title}</h3>
              <p className="mt-4 text-[14px] leading-relaxed" style={{ color: 'var(--muted)' }}>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DiffIcon({ i }) {
  const stroke = 'var(--green)';
  if (i === 0) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="2" width="18" height="18" stroke={stroke} strokeWidth="1.2" />
      <rect x="6" y="6" width="10" height="10" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
  if (i === 1) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 18 L9 8 L13 13 L19 4" stroke={stroke} strokeWidth="1.2" />
      <circle cx="19" cy="4" r="1.4" fill={stroke} />
    </svg>
  );
  if (i === 2) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3 L11 19 M3 11 L19 11" stroke={stroke} strokeWidth="1" strokeOpacity="0.5" />
      <path d="M5 5 L17 17 M17 5 L5 17" stroke={stroke} strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="11" cy="11" r="2.5" fill={stroke} />
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 11 L11 3 L19 11 L11 19 Z" stroke={stroke} strokeWidth="1.2" />
      <path d="M7 11 L11 7 L15 11 L11 15 Z" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * Final CTA
 * ──────────────────────────────────────────────────────────── */

function FinalCTA() {
  const [ref, shown] = useReveal();
  return (
    <section ref={ref} className="relative py-48 overflow-hidden">
      {/*
        Background image — treated heavily to fit the dark IT aesthetic.
        Echoes the original site's "Customer Satisfaction" handshake section.
        Swap the URL with a real client/team photo when ready (1920x1080+ works best).
      */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
          filter: 'grayscale(100%) contrast(1.1)',
        }}
      />
      {/* Dark base + green wash */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,11,0.88) 0%, rgba(10,10,11,0.78) 50%, rgba(10,10,11,0.95) 100%), radial-gradient(ellipse at center, rgba(31,224,122,0.10), transparent 60%)',
        }}
      />
      <div className="absolute inset-0 gf-grid-dense opacity-40 pointer-events-none" />
      <div
        aria-hidden
        className="gf-orb absolute"
        style={{
          left: '50%', top: '50%', width: 800, height: 800,
          background: 'radial-gradient(circle, rgba(31,224,122,0.18) 0%, rgba(31,224,122,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div className="relative max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
        <div className={`gf-reveal ${shown ? 'is-shown' : ''} flex justify-center`}>
          <span className="gf-eyebrow">Trust &amp; Partnership</span>
        </div>
        {/* Verbatim heading */}
        <h2 className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} mt-10`}
          style={{ fontSize: 'clamp(36px, 5.6vw, 76px)', lineHeight: 1.0, letterSpacing: '-0.035em', fontWeight: 500 }}>
          Customer <span className="gf-serif" style={{ color: 'var(--green)' }}>Satisfaction</span> Guaranteed
        </h2>
        {/* Verbatim body */}
        <p className={`gf-reveal gf-reveal-2 ${shown ? 'is-shown' : ''} mt-10 max-w-[58ch] mx-auto text-[16px] md:text-[17px] leading-relaxed`}
          style={{ color: 'var(--muted)' }}>
          At GroowFuse, our focus on customer satisfaction is key to our business.
          We believe trust is built through results and relationships. Partnering with
          GroowFuse means benefiting from our expertise and commitment to your success.
        </p>
        <div className={`gf-reveal gf-reveal-3 ${shown ? 'is-shown' : ''} mt-14 flex flex-wrap gap-3 justify-center`}>
          {/* Verbatim button label */}
          <a href="/contact" className="gf-btn-primary px-8 py-4 rounded-md text-[15px] inline-flex items-center gap-2 tracking-tight">
            Let's Get Started
            <span aria-hidden>→</span>
          </a>
          <a href="mailto:info@groowfuse.com" className="gf-btn-ghost px-8 py-4 rounded-md text-[15px] font-medium inline-flex items-center gap-2 tracking-tight">
            info@groowfuse.com
          </a>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Footer
 * ──────────────────────────────────────────────────────────── */

function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      // Wire to your PHP endpoint:
      // const res = await fetch('/api/newsletter.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
      // if (!res.ok) throw new Error();
      await new Promise((r) => setTimeout(r, 600)); // placeholder
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="border-t pt-20 pb-10" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="text-[15px] tracking-tight font-medium">
                Groow<span style={{ color: 'var(--green)' }}>Fuse</span> Consult
              </span>
            </div>
            <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              Practical, enterprise-grade IT consulting for growing businesses.
              Smarter processes, smarter procurement, stronger digital foundations.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 max-w-md" noValidate>
              <span className="gf-eyebrow">Newsletter</span>
              <p className="mt-3 mb-4 text-[14px]" style={{ color: 'var(--muted)' }}>
                Occasional insights for SME leaders. No spam.
              </p>
              <div className="flex gap-2 border rounded-md p-1.5"
                style={{ borderColor: 'var(--border-bright)' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="gf-input flex-1 px-3 py-2 text-[14px]"
                  required
                />
                <button type="submit" disabled={status === 'loading'}
                  className="gf-btn-primary px-4 py-2 rounded-[6px] text-[13px]">
                  {status === 'success' ? '✓ Subscribed' : status === 'loading' ? '...' : 'Subscribe'}
                </button>
              </div>
              {status === 'error' && (
                <p className="mt-2 text-[12px]" style={{ color: '#FF6B6B', fontFamily: 'var(--mono)' }}>
                  Something went wrong. Try again.
                </p>
              )}
            </form>
          </div>

          {/* Site links */}
          <div className="lg:col-span-2">
            <span className="gf-eyebrow">Site</span>
            <ul className="mt-6 space-y-3 text-[14px]">
              {['Home', 'Services', 'Blog', 'About', 'Contact'].map((x) => (
                <li key={x}>
                  <a href={`/${x === 'Home' ? '' : x.toLowerCase()}`}
                    className="hover:text-white transition-colors"
                    style={{ color: 'var(--muted)' }}>
                    {x}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <span className="gf-eyebrow">Services</span>
            <ul className="mt-6 space-y-3 text-[14px]">
              {['Process Analysis', 'IT Procurement', 'Digital Transformation', 'Workflow Automation'].map((x) => (
                <li key={x}>
                  <a href="/services" className="hover:text-white transition-colors" style={{ color: 'var(--muted)' }}>
                    {x}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <span className="gf-eyebrow">Contact</span>
            <ul className="mt-6 space-y-3 text-[14px]">
              <li>
                <a href="mailto:info@groowfuse.com" className="hover:text-white transition-colors" style={{ color: 'var(--muted)' }}>
                  info@groowfuse.com
                </a>
              </li>
              <li className="flex gap-3 mt-4">
                <a href="https://www.linkedin.com/company/groowfuse-consult/" aria-label="LinkedIn"
                  className="w-9 h-9 rounded-md border flex items-center justify-center transition-colors hover:border-[var(--green)]"
                  style={{ borderColor: 'var(--border-bright)' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M3 5h2v7H3V5zm1-3a1.2 1.2 0 100 2.4A1.2 1.2 0 004 2zm3 3h1.9v1h.03c.27-.5.93-1.05 1.92-1.05 2.05 0 2.43 1.32 2.43 3.04V12h-2V8.4c0-.86-.02-1.97-1.2-1.97s-1.38.93-1.38 1.9V12H7V5z" />
                  </svg>
                </a>
                <a href="https://www.facebook.com/share/1HF9C3hmW1/" aria-label="Facebook"
                  className="w-9 h-9 rounded-md border flex items-center justify-center transition-colors hover:border-[var(--green)]"
                  style={{ borderColor: 'var(--border-bright)' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M7 0a7 7 0 00-1.1 13.9V9H4.2V7h1.7V5.4c0-1.7 1-2.6 2.6-2.6.7 0 1.4.1 1.4.1v1.6H9c-.8 0-1.1.5-1.1 1V7h1.9l-.3 2H7.9v4.9A7 7 0 007 0z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t flex flex-wrap justify-between gap-4"
          style={{ borderColor: 'var(--border)' }}>
          {/* Verbatim copyright from groowfuse.com */}
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)' }}>
            © 2026, Groow Fuse Consult, All Rights Reserved
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)' }}>
            Email: info@groowfuse.com
          </span>
        </div>
      </div>
    </footer>
  );
}