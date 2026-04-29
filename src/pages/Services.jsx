/**
 * Groow Fuse Consult — Services page
 * --------------------------------------------------------
 * Visual rhythm:
 *   1. Viewport-fit hero with treated background image
 *   2. Two alternating-layout service blocks, each with image
 *   3. Engagement process strip
 *   4. Final CTA
 *
 * Copy is verbatim from the proposal.
 * Images use Unsplash placeholders — swap URLs for real assets.
 */

import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useReveal, useMouseGlow } from '../lib/hooks';

export default function Services() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'provider': {
      '@type': 'Organization',
      'name': 'GroowFuse Consult',
      'url': 'https://groowfuse.com',
    },
    'serviceType': 'IT Consulting',
    'description': 'Business process improvement, IT procurement advisory, and digital transformation support for SMEs.',
    'areaServed': 'Worldwide',
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Services',
      'itemListElement': [
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': 'Business Process Improvement & Business Analysis for SMEs',
            'description': 'Process mapping, workflow analysis, and operational redesign for growing businesses.',
          },
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': 'IT Procurement Advisory & Digital Transformation Support',
            'description': 'Software selection, vendor evaluation, and digital transformation roadmaps.',
          },
        },
      ],
    },
  };

  return (
    <div className="gf-root">
      <SEO
        title="Our Services"
        description="Specialized consulting for growing businesses: business process improvement, IT procurement advisory, and digital transformation support."
        url="https://groowfuse.com/services"
        jsonLd={jsonLd}
        jsonLdId="services"
      />
      <Nav />
      <ServicesHero />
      <ServiceBlocks />
      <ProcessStrip />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Hero — viewport-fit, single static frame
 * ──────────────────────────────────────────────────────────── */

function ServicesHero() {
  const spotRef = useMouseGlow();

  return (
    <section ref={spotRef} className="gf-hero gf-spotlight">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2400&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.2,
          filter: 'grayscale(100%) contrast(1.05)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,11,0.65) 0%, rgba(10,10,11,0.45) 45%, rgba(10,10,11,0.95) 100%)',
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
          <span className="gf-eyebrow">Services</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.22em' }}>
            <Link to="/" style={{ color: 'var(--dim)' }}>HOME</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--green)' }}>SERVICES</span>
          </span>
        </div>

        {/* CENTER */}
        <div className="gf-hero-center">
          <div className="gf-rise" style={{ animationDelay: '.15s' }}>
            <h1 className="gf-h1" style={{ maxWidth: '14ch' }}>
              Our{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                <span className="gf-serif" style={{ color: 'var(--green)' }}>Services</span>.
                <span className="gf-caret" />
              </span>
            </h1>
            <p className="mt-8 max-w-[60ch] text-[16px] md:text-[18px] leading-relaxed"
              style={{ color: 'var(--muted)' }}>
              Expert solutions designed to help growing businesses work smarter,
              reduce inefficiency, and make better technology decisions.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#service-01"
                className="gf-btn-primary px-6 py-3.5 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight"
              >
                Explore Services
                <span aria-hidden>↓</span>
              </a>
              <Link
                to="/contact"
                className="gf-btn-ghost px-6 py-3.5 rounded-md text-[14px] font-medium inline-flex items-center gap-2 tracking-tight"
              >
                Book Consultation
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM — service tags strip */}
        <div className="gf-rise" style={{ animationDelay: '.5s' }}>
          <div className="gf-tag-strip">
            <a href="#service-01" className="gf-frame-tile" style={{ background: 'var(--bg)' }}>
              <span className="gf-frame-num">01 / 02</span>
              <span className="gf-frame-tag" style={{ letterSpacing: '0.04em', textTransform: 'none' }}>
                Business Process Improvement &amp; Business Analysis
              </span>
            </a>
            <a href="#service-02" className="gf-frame-tile" style={{ background: 'var(--bg)' }}>
              <span className="gf-frame-num">02 / 02</span>
              <span className="gf-frame-tag" style={{ letterSpacing: '0.04em', textTransform: 'none' }}>
                IT Procurement Advisory &amp; Digital Transformation
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Service blocks — verbatim copy from proposal
 * ──────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    tag: 'OFFERING',
    n: '01',
    id: 'service-01',
    title: (
      <>
        Business Process Improvement &amp;{' '}
        <span className="gf-serif" style={{ color: 'var(--green)' }}>Business Analysis</span> for SMEs
      </>
    ),
    paragraphs: [
      'We help small and medium-sized businesses streamline their operations by identifying bottlenecks, reducing delays, and eliminating inefficient manual processes.',
      'Through detailed business analysis and process redesign, we assess how your teams, workflows, and systems currently operate, then develop practical solutions that improve efficiency, accountability, and service delivery.',
      'Our goal is to help your business work smarter, reduce operational waste, and create scalable processes that support growth.',
    ],
    capabilities: [
      'Process mapping and workflow analysis',
      'Identifying operational bottlenecks',
      'Reducing delays and turnaround times',
      'Eliminating repetitive manual tasks',
      'Improving team accountability and handoffs',
      'Process documentation and SOP development',
      'Business requirements gathering and analysis',
    ],
    cta: { label: 'Book A Consultation', to: '/contact' },
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Team collaborating on workflow analysis',
    imageRight: true,
  },
  {
    tag: 'OFFERING',
    n: '02',
    id: 'service-02',
    title: (
      <>
        IT Procurement Advisory &amp;{' '}
        <span className="gf-serif" style={{ color: 'var(--green)' }}>Digital Transformation</span> Support
      </>
    ),
    paragraphs: [
      'We help growing businesses make smarter technology decisions by selecting the right tools, systems, and vendors without overspending.',
      'From software selection to vendor evaluation and implementation support, we ensure your business invests in solutions that align with your goals, improve productivity, and deliver long-term value.',
      'Our advisory approach helps you avoid costly mistakes, reduce procurement risks, and adopt digital tools that support sustainable growth.',
    ],
    capabilities: [
      'Business software and tools selection',
      'Vendor sourcing and evaluation',
      'IT procurement strategy',
      'Cost optimisation and budget advisory',
      'Digital transformation roadmap',
      'Workflow automation solutions',
      'Technology implementation support',
    ],
    cta: { label: 'Get Started', to: '/contact' },
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Professional reviewing technology dashboards',
    imageRight: false,
  },
];

function ServiceBlocks() {
  return (
    <>
      {SERVICES.map((s, i) => (
        <ServiceBlock
          key={s.id}
          service={s}
          isFirst={i === 0}
          isLast={i === SERVICES.length - 1}
        />
      ))}
    </>
  );
}

function ServiceBlock({ service, isFirst, isLast }) {
  const [ref, shown] = useReveal(0.1);

  return (
    <section
      id={service.id}
      ref={ref}
      className="relative border-t"
      style={{
        borderColor: 'var(--border)',
        background: isFirst ? 'var(--bg)' : 'var(--surface)',
      }}
    >
      <div className="absolute inset-0 gf-grid-dense opacity-20 pointer-events-none" />
      {!isLast && (
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(to right, transparent, var(--green), transparent)' }}
        />
      )}

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-32 lg:py-40">
        {/* Section header */}
        <div className="mb-20">
          <div className={`gf-reveal ${shown ? 'is-shown' : ''} flex items-baseline justify-between gap-6 flex-wrap`}>
            <span className="gf-eyebrow">{service.tag}</span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 13,
                color: 'var(--dim)',
                letterSpacing: '0.22em',
              }}
            >
              SERVICE <span style={{ color: 'var(--green)' }}>{service.n}</span> / 02
            </span>
          </div>
          <h2 className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} gf-h2 mt-10 max-w-[24ch]`}>
            {service.title}
          </h2>
        </div>

        {/* Image + content */}
        <div className={`gf-svc-block ${service.imageRight ? 'image-right' : ''}`}>
          <ServiceImage service={service} shown={shown} />

          <div className={`gf-svc-content gf-reveal gf-reveal-2 ${shown ? 'is-shown' : ''}`}>
            {service.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-[15px] md:text-[16px] leading-relaxed"
                style={{
                  color: i === 0 ? 'var(--text)' : 'var(--muted)',
                  marginTop: i === 0 ? 0 : 24,
                }}
              >
                {p}
              </p>
            ))}

            {/* Capabilities */}
            <div className="mt-12 pt-10 border-t" style={{ borderColor: 'var(--border)' }}>
              <span className="gf-eyebrow">What's included</span>
              <ul className="mt-8" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {service.capabilities.map((c) => (
                  <li
                    key={c}
                    className="flex items-baseline gap-3 text-[14px]"
                    style={{ color: 'var(--text)' }}
                  >
                    <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)', flexShrink: 0 }}>→</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="mt-12">
              <Link
                to={service.cta.to}
                className="gf-btn-primary px-7 py-3.5 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight"
              >
                {service.cta.label}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceImage({ service, shown }) {
  return (
    <div className={`gf-svc-image gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''}`}>
      <img src={service.image} alt={service.imageAlt} loading="lazy" />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,11,0.45) 0%, rgba(10,10,11,0.20) 50%, rgba(10,10,11,0.85) 100%)',
        }}
      />
      <div className="absolute inset-0 gf-grid-dense opacity-30 pointer-events-none" />
      <span className="absolute" style={{ top: 12, left: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>┌</span>
      <span className="absolute" style={{ top: 12, right: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>┐</span>
      <span className="absolute" style={{ bottom: 12, left: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>└</span>
      <span className="absolute" style={{ bottom: 12, right: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>┘</span>
      {/* Service number watermark */}
      <span
        className="absolute"
        style={{
          bottom: 24, left: 24,
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 'clamp(80px, 12vw, 160px)',
          lineHeight: 1,
          color: 'var(--green)',
          opacity: 0.85,
          letterSpacing: '-0.04em',
          pointerEvents: 'none',
        }}
      >
        {service.n}
      </span>
      {/* Tag badge */}
      <span
        className="absolute"
        style={{
          top: 16, left: 16,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'var(--text)',
          background: 'rgba(10,10,11,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid var(--border-bright)',
          padding: '8px 12px',
        }}
      >
        {service.tag}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Process strip
 * ──────────────────────────────────────────────────────────── */

function ProcessStrip() {
  const [ref, shown] = useReveal();
  const steps = [
    { n: '01', label: 'Discover', body: 'Understand your business, goals, and existing operations.' },
    { n: '02', label: 'Diagnose', body: 'Map workflows, identify bottlenecks, surface real friction.' },
    { n: '03', label: 'Design',   body: 'Build practical solutions tailored to how your team works.' },
    { n: '04', label: 'Deploy',   body: 'Implement, document, and support — until it actually sticks.' },
  ];

  return (
    <section ref={ref} className="relative py-32 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="absolute inset-0 gf-grid-dense opacity-25 pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-20">
          <div className={`gf-reveal ${shown ? 'is-shown' : ''} lg:col-span-6`}>
            <span className="gf-eyebrow">How we work</span>
            <h2 className="gf-h2 mt-8">
              Four steps. <span className="gf-serif" style={{ color: 'var(--green)' }}>One</span> outcome.
            </h2>
          </div>
          <div className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} lg:col-span-5 lg:col-start-8 flex items-end`}>
            <p className="text-[15px] md:text-[17px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              Every engagement follows the same disciplined arc — whether we're redesigning
              a workflow or selecting a software stack. No mystery process. No theatre.
              Just clear steps from problem to working system.
            </p>
          </div>
        </div>

        <div className="gf-process-grid">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className={`gf-card gf-reveal gf-reveal-${(i % 4) + 1} ${shown ? 'is-shown' : ''} relative p-8 lg:p-10`}
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center justify-between mb-8">
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', letterSpacing: '0.22em' }}>
                  {step.n}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>
                  STEP
                </span>
              </div>
              <h3 className="text-[20px] font-medium tracking-tight">{step.label}</h3>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
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
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=80')",
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
          <span className="gf-eyebrow">Ready to start?</span>
        </div>
        <h2
          className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} mt-10`}
          style={{ fontSize: 'clamp(36px, 5.6vw, 76px)', lineHeight: 1.0, letterSpacing: '-0.035em', fontWeight: 500 }}
        >
          Let's build something <span className="gf-serif" style={{ color: 'var(--green)' }}>practical</span>.
        </h2>
        <p
          className={`gf-reveal gf-reveal-2 ${shown ? 'is-shown' : ''} mt-10 max-w-[58ch] mx-auto text-[16px] md:text-[17px] leading-relaxed`}
          style={{ color: 'var(--muted)' }}
        >
          Tell us where the friction is. We'll tell you whether we can help — and how
          long it'll take. No theatre, no jargon, no surprises.
        </p>
        <div className={`gf-reveal gf-reveal-3 ${shown ? 'is-shown' : ''} mt-14 flex flex-wrap gap-3 justify-center`}>
          <Link to="/contact" className="gf-btn-primary px-8 py-4 rounded-md text-[15px] inline-flex items-center gap-2 tracking-tight">
            Book a Consultation
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