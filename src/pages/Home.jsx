/**
 * Groow Fuse Consult — Home page
 * --------------------------------------------------------
 * Page-level content only. Shared chrome (Nav, Footer, design
 * tokens, fonts) lives in /src/components and /src/styles.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useReveal, useMouseGlow } from '../lib/hooks';

/* ────────────────────────────────────────────────────────────
 * Main
 * ──────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="gf-root">
      <Nav />
      <Hero />
      <Intro />
      <ServicesSection />
      <Differentiators />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Hero — three-frame switcher (non-carousel)
 * ──────────────────────────────────────────────────────────── */

function Hero() {
  const spotRef = useMouseGlow();
  const [activeIndex, setActiveIndex] = useState(0);
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
      primary: { label: 'Get Started', to: '/contact' },
      secondary: { label: 'Our Services', to: '/services' },
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
      primary: { label: 'Book Consultation', to: '/contact' },
      secondary: { label: 'About Us', to: '/about' },
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
      primary: { label: 'Book Consultation', to: '/contact' },
      secondary: { label: 'Our Services', to: '/services' },
    },
  ];

  // Auto-advance. Re-running on activeIndex change means clicks reset the timer.
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
      {/* Background image (treated). Swap URL for your own asset. */}
      <div aria-hidden className="gf-hero-bg" />
      <div aria-hidden className="gf-hero-veil" />
      <div className="absolute inset-0 gf-grid gf-drift opacity-80 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[200px] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, var(--bg), transparent)' }} />
      <div className="absolute inset-x-0 bottom-0 h-[160px] pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
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

        {/* CENTER — slide stack */}
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
                    <Link
                      to={slide.primary.to}
                      tabIndex={isActive ? 0 : -1}
                      className="gf-btn-primary px-6 py-3.5 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight"
                    >
                      {slide.primary.label}
                      <span aria-hidden>→</span>
                    </Link>
                    <Link
                      to={slide.secondary.to}
                      tabIndex={isActive ? 0 : -1}
                      className="gf-btn-ghost px-6 py-3.5 rounded-md text-[14px] font-medium inline-flex items-center gap-2 tracking-tight"
                    >
                      {slide.secondary.label}
                      <span aria-hidden>↗</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM — frame nav + capability strip */}
        <div>
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
 * Intro statement
 * ──────────────────────────────────────────────────────────── */

function Intro() {
  const [ref, shown] = useReveal();
  return (
    <section ref={ref} className="relative border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-28 lg:py-36 grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className={`gf-reveal ${shown ? 'is-shown' : ''} lg:col-span-3`}>
          <span className="gf-eyebrow">Mission</span>
        </div>
        <p
          className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} lg:col-span-9`}
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(24px, 2.8vw, 38px)',
            lineHeight: 1.3,
            letterSpacing: '-0.015em',
            color: 'var(--text)',
          }}
        >
          Groow Fuse Consult provides comprehensive business support to help organizations
          navigate the digital transformation landscape.
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Services teaser
 * ──────────────────────────────────────────────────────────── */

function ServicesSection() {
  const [ref, shown] = useReveal();

  const services = [
    {
      n: '01',
      title: 'Business Process Improvement & Analysis',
      desc: 'We help businesses reduce delays, manual work, and inefficiencies by reviewing and redesigning their business processes for peak performance.',
      to: '/services',
    },
    {
      n: '02',
      title: 'IT Procurement Advisory & Digital Transformation',
      desc: 'We help growing companies choose the right business tools without wasting money, guiding smart technology investments from evaluation to implementation.',
      to: '/services',
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

        <div
          className="mt-24 grid lg:grid-cols-2 gap-px"
          style={{ background: 'var(--border)', border: '1px solid var(--border)' }}
        >
          {services.map((s, i) => (
            <article
              key={s.n}
              className={`gf-card gf-reveal gf-reveal-${i + 2} ${shown ? 'is-shown' : ''} relative p-12 lg:p-16`}
              style={{ background: 'var(--bg)' }}
            >
              <span className="absolute top-4 left-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┌</span>
              <span className="absolute top-4 right-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┐</span>
              <span className="absolute bottom-4 left-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>└</span>
              <span className="absolute bottom-4 right-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┘</span>

              <div className="flex items-center justify-between mb-12">
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', letterSpacing: '0.2em' }}>
                  / {s.n}
                </span>
                <span
                  className="gf-arrow inline-flex items-center justify-center w-10 h-10 rounded-md border"
                  style={{ borderColor: 'var(--border-bright)' }}
                >
                  <span aria-hidden>→</span>
                </span>
              </div>

              <h3 className="text-[22px] md:text-[26px] leading-tight tracking-tight font-medium max-w-[22ch]">
                {s.title}
              </h3>
              <p className="mt-6 text-[15px] leading-relaxed max-w-[48ch]" style={{ color: 'var(--muted)' }}>
                {s.desc}
              </p>

              <Link to={s.to} className="gf-link mt-14 text-[14px] font-medium" style={{ display: 'inline-flex' }}>
                Learn more
                <span aria-hidden>↗</span>
              </Link>
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
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--green), transparent)' }}
      />

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

        <div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: 'var(--border)', border: '1px solid var(--border)' }}
        >
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
        <h2
          className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} mt-10`}
          style={{ fontSize: 'clamp(36px, 5.6vw, 76px)', lineHeight: 1.0, letterSpacing: '-0.035em', fontWeight: 500 }}
        >
          Customer <span className="gf-serif" style={{ color: 'var(--green)' }}>Satisfaction</span> Guaranteed
        </h2>
        <p
          className={`gf-reveal gf-reveal-2 ${shown ? 'is-shown' : ''} mt-10 max-w-[58ch] mx-auto text-[16px] md:text-[17px] leading-relaxed`}
          style={{ color: 'var(--muted)' }}
        >
          At GroowFuse, our focus on customer satisfaction is key to our business.
          We believe trust is built through results and relationships. Partnering with
          GroowFuse means benefiting from our expertise and commitment to your success.
        </p>
        <div className={`gf-reveal gf-reveal-3 ${shown ? 'is-shown' : ''} mt-14 flex flex-wrap gap-3 justify-center`}>
          <Link to="/contact" className="gf-btn-primary px-8 py-4 rounded-md text-[15px] inline-flex items-center gap-2 tracking-tight">
            Let's Get Started
            <span aria-hidden>→</span>
          </Link>
          <a href="mailto:info@groowfuse.com" className="gf-btn-ghost px-8 py-4 rounded-md text-[15px] font-medium inline-flex items-center gap-2 tracking-tight">
            info@groowfuse.com
          </a>
        </div>
      </div>
    </section>
  );
}