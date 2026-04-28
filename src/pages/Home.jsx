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
        width: 0.5em; height: 0.9em;
        background: var(--green);
        margin-left: 8px;
        transform: translateY(-2px);
        animation: gfBlink 1s steps(2, start) infinite;
        box-shadow: 0 0 24px var(--green-soft);
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
        font-size: clamp(56px, 9vw, 132px);
        line-height: 0.92;
        letter-spacing: -0.04em;
        font-weight: 500;
      }
      .gf-h2 {
        font-size: clamp(40px, 6vw, 72px);
        line-height: 1;
        letter-spacing: -0.03em;
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
        .gf-h1 { font-size: clamp(46px, 12vw, 80px); }
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
  const capabilities = [
    'Process Analysis',
    'IT Procurement',
    'Workflow Automation',
    'Digital Transformation',
    'Vendor Evaluation',
    'SOP Development',
  ];

  return (
    <section ref={spotRef} className="gf-spotlight relative pt-[140px] pb-[120px] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 gf-grid gf-drift opacity-90 pointer-events-none" />
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-[200px] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, var(--bg), transparent)' }} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-[200px] pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
      {/* Green orb */}
      <div
        aria-hidden
        className="gf-orb absolute"
        style={{
          left: '50%', top: '60%', width: 520, height: 520,
          background: 'radial-gradient(circle, rgba(31,224,122,0.28) 0%, rgba(31,224,122,0.08) 35%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      {/* Noise overlay */}
      <div className="absolute inset-0 gf-noise opacity-40 pointer-events-none mix-blend-overlay" />

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Top strip */}
        <div className="flex items-center justify-between mb-12 gf-rise" style={{ animationDelay: '.05s' }}>
          <span className="gf-eyebrow">Groow Fuse Consult</span>
          <span className="hidden sm:inline" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)' }}>
            v2.0 · Abuja, NG
          </span>
        </div>

        {/* Headline */}
        <h1 className="gf-h1 gf-rise" style={{ animationDelay: '.15s', maxWidth: '17ch' }}>
          Grow <span className="gf-serif" style={{ color: 'var(--green)' }}>faster</span>.<br />
          Build <span className="gf-serif">safer</span>.<span className="gf-caret" />
        </h1>

        {/* Subhead */}
        <p className="gf-rise mt-10 max-w-[58ch] text-[18px] md:text-[20px] leading-relaxed"
          style={{ color: 'var(--muted)', animationDelay: '.3s' }}>
          We help organizations of all sizes implement smarter, secure, and future-proof
          digital infrastructures — from process redesign to procurement to digital transformation.
        </p>

        {/* CTAs */}
        <div className="gf-rise mt-12 flex flex-wrap gap-3" style={{ animationDelay: '.45s' }}>
          <a href="/contact" className="gf-btn-primary px-6 py-3.5 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight">
            Book a Consultation
            <span aria-hidden>→</span>
          </a>
          <a href="/services" className="gf-btn-ghost px-6 py-3.5 rounded-md text-[14px] font-medium inline-flex items-center gap-2 tracking-tight">
            Explore Services
            <span aria-hidden>↗</span>
          </a>
        </div>

        {/* Capability strip */}
        <div className="gf-rise mt-24 pt-10 border-t flex flex-wrap items-center gap-x-10 gap-y-4"
          style={{ borderColor: 'var(--border)', animationDelay: '.6s' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.18em' }}>
            CORE CAPABILITIES /
          </span>
          {capabilities.map((c) => (
            <span key={c} style={{ fontFamily: 'var(--mono)', fontSize: 13 }} className="text-white/80">
              {c}
            </span>
          ))}
        </div>
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
      desc: 'We help SMEs streamline operations by identifying bottlenecks, reducing delays, and eliminating inefficient manual processes.',
      points: [
        'Process mapping & workflow analysis',
        'Bottleneck identification',
        'SOP development',
        'Requirements gathering',
        'Team accountability & handoffs',
      ],
      href: '/services#process',
    },
    {
      n: '02',
      title: 'IT Procurement & Digital Transformation',
      desc: 'We help growing businesses make smarter technology decisions — selecting the right tools, systems, and vendors without overspending.',
      points: [
        'Software & vendor selection',
        'Procurement strategy',
        'Cost optimisation',
        'Transformation roadmap',
        'Workflow automation',
      ],
      href: '/services#procurement',
    },
  ];

  return (
    <section ref={ref} className="relative py-32 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className={`gf-reveal ${shown ? 'is-shown' : ''}`}>
          <span className="gf-eyebrow">01 — Services</span>
        </div>
        <h2 className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} gf-h2 mt-6 max-w-[20ch]`}>
          Specialized <span className="gf-serif" style={{ color: 'var(--green)' }}>consulting</span>, built around your business.
        </h2>

        {/* 1px-gap grid */}
        <div className="mt-20 grid lg:grid-cols-2 gap-px"
          style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
          {services.map((s, i) => (
            <article
              key={s.n}
              className={`gf-card gf-reveal gf-reveal-${i + 2} ${shown ? 'is-shown' : ''} relative p-10 lg:p-12`}
              style={{ background: 'var(--bg)' }}
            >
              {/* Corner brackets */}
              <span className="absolute top-4 left-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┌</span>
              <span className="absolute top-4 right-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┐</span>
              <span className="absolute bottom-4 left-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>└</span>
              <span className="absolute bottom-4 right-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┘</span>

              <div className="flex items-center justify-between mb-10">
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', letterSpacing: '0.2em' }}>
                  / {s.n}
                </span>
                <span className="gf-arrow inline-flex items-center justify-center w-10 h-10 rounded-md border"
                  style={{ borderColor: 'var(--border-bright)' }}>
                  <span aria-hidden>→</span>
                </span>
              </div>

              <h3 className="text-[28px] md:text-[32px] leading-tight tracking-tight font-medium max-w-[22ch]">
                {s.title}
              </h3>
              <p className="mt-5 text-[15px] leading-relaxed max-w-[48ch]" style={{ color: 'var(--muted)' }}>
                {s.desc}
              </p>

              <ul className="mt-10 space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="flex items-baseline gap-3 text-[14px]">
                    <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)' }}>→</span>
                    <span style={{ color: 'var(--text)' }}>{p}</span>
                  </li>
                ))}
              </ul>

              <a href={s.href} className="gf-link mt-10 text-[14px] font-medium">
                Read more
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
      title: 'Built on standards',
      body: 'Top industry standards across multiple sectors. Reliable, secure, aligned with the practices that drive growth.',
    },
    {
      n: '02',
      title: 'Measurable expertise',
      body: 'Outcomes that are dependable and meet the highest professional standards — technology as a catalyst for value.',
    },
    {
      n: '03',
      title: 'Built to evolve',
      body: 'Systems and processes designed to scale seamlessly as your business expands into new markets.',
    },
    {
      n: '04',
      title: 'Future-proof growth',
      body: 'Adaptable frameworks designed to remain relevant in a changing digital landscape, protecting your investment.',
    },
  ];

  return (
    <section ref={ref} className="relative py-32 overflow-hidden" style={{ background: 'var(--surface)' }}>
      <div className="absolute inset-0 gf-grid-dense opacity-30 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--green), transparent)' }} />

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-20">
          <div className={`gf-reveal ${shown ? 'is-shown' : ''} lg:col-span-5`}>
            <span className="gf-eyebrow">02 — Why us</span>
            <h2 className="gf-h2 mt-6">
              Practical <span className="gf-serif" style={{ color: 'var(--green)' }}>solutions</span>.<br />
              Premium <span className="gf-serif">outcomes</span>.
            </h2>
          </div>
          <div className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} lg:col-span-6 lg:col-start-7 flex items-end`}>
            <p className="text-[16px] md:text-[18px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              Exceptional technology shouldn't come at a premium cost. We deliver high-quality,
              enterprise-grade solutions that are practical, efficient, and built around your
              unique business needs.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
          {items.map((it, i) => (
            <div
              key={it.n}
              className={`gf-card gf-reveal gf-reveal-${(i % 4) + 1} ${shown ? 'is-shown' : ''} p-8 relative`}
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)' }}>{it.n}</span>
                <DiffIcon i={i} />
              </div>
              <h3 className="text-[20px] font-medium tracking-tight">{it.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--muted)' }}>{it.body}</p>
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
    <section ref={ref} className="relative py-40 overflow-hidden">
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
          <span className="gf-eyebrow">Ready when you are</span>
        </div>
        <h2 className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} mt-8`}
          style={{ fontSize: 'clamp(44px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.04em', fontWeight: 500 }}>
          Let's build something <span className="gf-serif" style={{ color: 'var(--green)' }}>resilient</span>.
        </h2>
        <p className={`gf-reveal gf-reveal-2 ${shown ? 'is-shown' : ''} mt-8 max-w-[58ch] mx-auto text-[17px] leading-relaxed`}
          style={{ color: 'var(--muted)' }}>
          Trust is built through results and relationships. Partner with GroowFuse and benefit
          from our expertise and commitment to your success.
        </p>
        <div className={`gf-reveal gf-reveal-3 ${shown ? 'is-shown' : ''} mt-12 flex flex-wrap gap-3 justify-center`}>
          <a href="/contact" className="gf-btn-primary px-8 py-4 rounded-md text-[15px] inline-flex items-center gap-2 tracking-tight">
            Book a Consultation
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
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)' }}>
            © 2026 Groow Fuse Consult — All rights reserved
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)' }}>
            Designed for growth. Built for resilience.
          </span>
        </div>
      </div>
    </footer>
  );
}