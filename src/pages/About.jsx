/**
 * Groow Fuse Consult — About page
 * --------------------------------------------------------
 * Copy is verbatim from groowfuse.com/about.
 * Visual rhythm:
 *   1. Viewport-fit hero with treated background image
 *   2. Vision & Mission — two side-by-side serif italic cards
 *   3. Why GroowFuse — eyebrow + H2 + 3 differentiator cards
 *   4. Mid-page CTA ("Let's Build Your Digital Edge")
 *   5. FAQ accordion (7 verbatim Q&As)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useReveal, useMouseGlow } from '../lib/hooks';

export default function About() {
  // FAQ structured data — helps Google show our questions in search rich results
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a,
      },
    })),
  };

  return (
    <div className="gf-root">
      <SEO
        title="About"
        description="GroowFuse is an IT consultancy that helps businesses grow with technology, not struggle through it. Strategic solutions that bridge ambition and execution."
        url="https://groowfuse.com/about"
        jsonLd={faqJsonLd}
        jsonLdId="faq"
      />
      <Nav />
      <AboutHero />
      <VisionMission />
      <WhyGroowFuse />
      <DigitalEdgeCTA />
      <Faq />
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Hero
 * ──────────────────────────────────────────────────────────── */

function AboutHero() {
  const spotRef = useMouseGlow();

  return (
    <section ref={spotRef} className="gf-hero gf-spotlight">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2400&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
          filter: 'grayscale(100%) contrast(1.05)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,11,0.7) 0%, rgba(10,10,11,0.45) 45%, rgba(10,10,11,0.95) 100%)',
        }}
      />
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
        {/* TOP — eyebrow + breadcrumb */}
        <div className="flex items-center justify-between gf-rise" style={{ animationDelay: '.05s' }}>
          <span className="gf-eyebrow">About</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.22em' }}>
            <Link to="/" style={{ color: 'var(--dim)' }}>HOME</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--green)' }}>ABOUT</span>
          </span>
        </div>

        {/* CENTER */}
        <div className="gf-hero-center">
          <div className="gf-rise" style={{ animationDelay: '.15s' }}>
            <h1 className="gf-h1" style={{ maxWidth: '20ch' }}>
              We Help Businesses{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                <span className="gf-serif" style={{ color: 'var(--green)' }}>Grow</span>
              </span>{' '}
              With{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                <span className="gf-serif" style={{ color: 'var(--green)' }}>Technology</span>.
                <span className="gf-caret" />
              </span>
            </h1>
            <p className="mt-8 max-w-[70ch] text-[16px] md:text-[18px] leading-relaxed"
              style={{ color: 'var(--muted)' }}>
              GroowFuse is an IT consultancy born out of the vision to help businesses grow
              with technology, not struggle through it. In today's rapidly evolving digital
              landscape, we act as your transformation partner, delivering strategic solutions
              that fuse innovation with measurable impact, bridging the gap between your
              business ambition and technical execution.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="gf-btn-primary px-6 py-3.5 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight"
              >
                Book A Consultation
                <span aria-hidden>→</span>
              </Link>
              <a
                href="#vision-mission"
                className="gf-btn-ghost px-6 py-3.5 rounded-md text-[14px] font-medium inline-flex items-center gap-2 tracking-tight"
              >
                Our Vision
                <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM — vision/mission tags */}
        <div className="gf-rise" style={{ animationDelay: '.5s' }}>
          <div className="gf-tag-strip">
            <a href="#vision-mission" className="gf-frame-tile" style={{ background: 'var(--bg)' }}>
              <span className="gf-frame-num">PURPOSE</span>
              <span className="gf-frame-tag" style={{ letterSpacing: '0.04em', textTransform: 'none' }}>
                Vision &amp; Mission
              </span>
            </a>
            <a href="#why-groowfuse" className="gf-frame-tile" style={{ background: 'var(--bg)' }}>
              <span className="gf-frame-num">PRINCIPLES</span>
              <span className="gf-frame-tag" style={{ letterSpacing: '0.04em', textTransform: 'none' }}>
                Why GroowFuse
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Vision & Mission
 * ──────────────────────────────────────────────────────────── */

function VisionMission() {
  const [ref, shown] = useReveal(0.1);

  const items = [
    {
      n: '01',
      label: 'Vision',
      body: 'To create systems that allow businesses to run smoothly, make confident decisions, and grow without limits.',
    },
    {
      n: '02',
      label: 'Mission',
      body: 'To provide businesses globally with practical, scalable digital solutions that improve efficiency, security, and long-term growth.',
    },
  ];

  return (
    <section
      id="vision-mission"
      ref={ref}
      className="relative py-32 lg:py-40 border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="absolute inset-0 gf-grid-dense opacity-20 pointer-events-none" />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: 'repeat(1, 1fr)',
            background: 'var(--border)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="gf-vm-grid">
            {items.map((item, i) => (
              <article
                key={item.n}
                className={`gf-card gf-reveal gf-reveal-${i + 1} ${shown ? 'is-shown' : ''} relative p-12 lg:p-16`}
                style={{ background: 'var(--bg)' }}
              >
                {/* Corner brackets */}
                <span className="absolute top-4 left-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┌</span>
                <span className="absolute top-4 right-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┐</span>
                <span className="absolute bottom-4 left-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>└</span>
                <span className="absolute bottom-4 right-4" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┘</span>

                <div className="flex items-center justify-between mb-10">
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', letterSpacing: '0.2em' }}>
                    / {item.n}
                  </span>
                  <span className="gf-eyebrow">{item.label}</span>
                </div>

                <p
                  className="max-w-[28ch]"
                  style={{
                    fontFamily: 'var(--serif)',
                    fontStyle: 'italic',
                    fontSize: 'clamp(26px, 3.4vw, 42px)',
                    lineHeight: 1.25,
                    letterSpacing: '-0.015em',
                    color: 'var(--text)',
                  }}
                >
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Why GroowFuse
 * ──────────────────────────────────────────────────────────── */

function WhyGroowFuse() {
  const [ref, shown] = useReveal(0.1);

  const items = [
    {
      n: '01',
      title: 'Precise Execution',
      body: 'We are precise in our work, direct in our communication, and disciplined in delivery.',
    },
    {
      n: '02',
      title: 'Clarity & Efficiency',
      body: 'We prioritize clarity in every solution, focusing on systems that are secure, scalable, and fit for purpose.',
    },
    {
      n: '03',
      title: 'Confidence & Consistency',
      body: 'Built for businesses that want confidence in their technology decisions and consistency in execution.',
    },
  ];

  return (
    <section
      id="why-groowfuse"
      ref={ref}
      className="relative py-40 overflow-hidden border-t"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="absolute inset-0 gf-grid-dense opacity-30 pointer-events-none" />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--green), transparent)' }}
      />

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-24">
          <div className={`gf-reveal ${shown ? 'is-shown' : ''} lg:col-span-7`}>
            <span className="gf-eyebrow">Why GroowFuse</span>
            <h2 className="gf-h2 mt-8">
              Organizations choose GroowFuse because we combine{' '}
              <span className="gf-serif" style={{ color: 'var(--green)' }}>technical depth</span>{' '}
              with sound{' '}
              <span className="gf-serif" style={{ color: 'var(--green)' }}>business judgment</span>.
            </h2>
          </div>
        </div>

        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ background: 'var(--border)', border: '1px solid var(--border)' }}
        >
          {items.map((it, i) => (
            <div
              key={it.n}
              className={`gf-card gf-reveal gf-reveal-${(i % 4) + 1} ${shown ? 'is-shown' : ''} p-10 relative`}
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center justify-between mb-10">
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', letterSpacing: '0.2em' }}>
                  / {it.n}
                </span>
                <WhyIcon i={i} />
              </div>
              <h3 className="text-[20px] font-medium tracking-tight">{it.title}</h3>
              <p className="mt-4 text-[14px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyIcon({ i }) {
  const stroke = 'var(--green)';
  if (i === 0) return (
    // Crosshair / target — Precise Execution
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke={stroke} strokeWidth="1.2" />
      <circle cx="11" cy="11" r="3" stroke={stroke} strokeWidth="1.2" />
      <path d="M11 1 L11 4 M11 18 L11 21 M1 11 L4 11 M18 11 L21 11" stroke={stroke} strokeWidth="1" />
    </svg>
  );
  if (i === 1) return (
    // Layered diamonds — Clarity & Efficiency
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 11 L11 3 L19 11 L11 19 Z" stroke={stroke} strokeWidth="1.2" />
      <path d="M7 11 L11 7 L15 11 L11 15 Z" stroke={stroke} strokeWidth="1" strokeOpacity="0.6" />
    </svg>
  );
  // Bars rising — Confidence & Consistency
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="13" width="3" height="6" stroke={stroke} strokeWidth="1.2" />
      <rect x="9.5" y="9" width="3" height="10" stroke={stroke} strokeWidth="1.2" />
      <rect x="16" y="5" width="3" height="14" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * Mid-page CTA — "Let's Build Your Digital Edge"
 * ──────────────────────────────────────────────────────────── */

function DigitalEdgeCTA() {
  const [ref, shown] = useReveal();
  return (
    <section ref={ref} className="relative py-40 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.16,
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
          left: '50%', top: '50%', width: 720, height: 720,
          background: 'radial-gradient(circle, rgba(31,224,122,0.18) 0%, rgba(31,224,122,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div className="relative max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
        <div className={`gf-reveal ${shown ? 'is-shown' : ''} flex justify-center`}>
          <span className="gf-eyebrow">Partnership</span>
        </div>
        <h2
          className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} mt-10`}
          style={{ fontSize: 'clamp(36px, 5.6vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 500 }}
        >
          Let's Build Your{' '}
          <span style={{ whiteSpace: 'nowrap' }}>
            <span className="gf-serif" style={{ color: 'var(--green)' }}>Digital Edge</span>
          </span>
        </h2>
        <p
          className={`gf-reveal gf-reveal-2 ${shown ? 'is-shown' : ''} mt-10 max-w-[60ch] mx-auto text-[16px] md:text-[17px] leading-relaxed`}
          style={{ color: 'var(--muted)' }}
        >
          Whether you're starting small or scaling fast, GroowFuse gives you the strategic
          clarity and technical confidence to thrive. Let's talk about your vision and build
          the technology to support it.
        </p>
        <div className={`gf-reveal gf-reveal-3 ${shown ? 'is-shown' : ''} mt-14 flex flex-wrap gap-3 justify-center`}>
          <Link to="/contact" className="gf-btn-primary px-8 py-4 rounded-md text-[15px] inline-flex items-center gap-2 tracking-tight">
            Start Your Transformation
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

/* ────────────────────────────────────────────────────────────
 * FAQ — accordion (no external libs, height-animated via CSS grid trick)
 * ──────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: 'What industries does GroowFuse specialize in?',
    a: 'We work across a variety of industries including financial services, healthcare, e-commerce, real estate, and public sector organizations. Our flexible, scalable solutions can be tailored to fit businesses of all sizes and sectors.',
  },
  {
    q: 'What makes GroowFuse different from other IT consulting firms?',
    a: "GroowFuse combines strategic consulting with certified technical delivery. We don't just design solutions — we implement and scale them with your long-term growth in mind. Our team is known for speed, transparency, and a deeply collaborative approach.",
  },
  {
    q: 'Do you only work with large enterprises?',
    a: "Not at all. While we've supported enterprise digital transformations, we also work with startups, growing SMBs, and mid-sized companies. Whether you're looking to modernize a single process or architect an entire cloud environment, we're here for it.",
  },
  {
    q: 'Are your consultants certified?',
    a: 'Yes. Our experts hold industry-leading certifications across major cloud platforms (AWS, Azure, Google Cloud), cybersecurity (ISO 27001, CISSP, CompTIA Security+), DevOps, and AI/ML technologies.',
  },
  {
    q: 'What is your approach to new projects?',
    a: 'We start by understanding your goals, pain points, and current systems. From there, we create a strategic roadmap, design solutions aligned with best practices, and deliver in iterative sprints — ensuring continuous feedback and measurable results.',
  },
  {
    q: 'Do you provide post-project support?',
    a: 'Absolutely. We offer ongoing support, maintenance, training, and system monitoring. You can count on GroowFuse to stay engaged after delivery — as your trusted long-term technology partner.',
  },
  {
    q: 'How do I get started?',
    a: "You can get in touch with us via our Contact Page, schedule a free consultation, or email us directly at info@groowfuse.com. We'll follow up to understand your needs and discuss how we can help.",
  },
];

function Faq() {
  const [ref, shown] = useReveal(0.1);
  const [openIndex, setOpenIndex] = useState(0); // first item open by default

  return (
    <section
      id="faq"
      ref={ref}
      className="relative py-32 lg:py-40 border-t"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      <div className="absolute inset-0 gf-grid-dense opacity-20 pointer-events-none" />
      <div className="relative max-w-[1080px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-16">
          <div className={`gf-reveal ${shown ? 'is-shown' : ''} lg:col-span-12`}>
            <span className="gf-eyebrow">FAQ</span>
            <h2 className="gf-h2 mt-8 max-w-[26ch]">
              Frequently Asked{' '}
              <span className="gf-serif" style={{ color: 'var(--green)' }}>Questions</span>
            </h2>
          </div>
        </div>

        <div className="gf-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              q={item.q}
              a={item.a}
              n={String(i + 1).padStart(2, '0')}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              shown={shown}
              i={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a, n, open, onToggle, shown, i }) {
  return (
    <div
      className={`gf-faq-item gf-reveal gf-reveal-${(i % 4) + 1} ${shown ? 'is-shown' : ''} ${open ? 'is-open' : ''}`}
    >
      <button
        type="button"
        className="gf-faq-q"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="gf-faq-num">{n}</span>
        <span className="gf-faq-q-text">{q}</span>
        <span className="gf-faq-chevron" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div className="gf-faq-a-wrap">
        <div className="gf-faq-a">
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}