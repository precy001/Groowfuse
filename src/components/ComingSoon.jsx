/**
 * Generic "Coming Soon" placeholder for pages not yet built.
 * Stays on-brand so the site doesn't look broken in the meantime.
 */

import { Link } from 'react-router-dom';
import Nav from './Nav';
import Footer from './Footer';
import { useMouseGlow } from '../lib/hooks';

export default function ComingSoon({ eyebrow, title, body, returnTo = '/' }) {
  const spotRef = useMouseGlow();
  return (
    <div className="gf-root">
      <Nav />
      <section ref={spotRef} className="gf-hero gf-spotlight">
        <div className="absolute inset-0 gf-grid gf-drift opacity-80 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[200px] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, var(--bg), transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-[160px] pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
        <div
          aria-hidden
          className="gf-orb absolute"
          style={{
            left: '50%', top: '60%', width: 520, height: 520,
            background: 'radial-gradient(circle, rgba(31,224,122,0.22) 0%, rgba(31,224,122,0.06) 35%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div className="absolute inset-0 gf-noise opacity-25 pointer-events-none mix-blend-overlay" />

        <div className="gf-hero-inner">
          <div className="flex items-center justify-between gf-rise" style={{ animationDelay: '.05s' }}>
            <span className="gf-eyebrow">{eyebrow}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.22em' }}>
              STATUS · <span style={{ color: 'var(--green)' }}>BUILDING</span>
            </span>
          </div>

          <div className="gf-hero-center">
            <div className="gf-rise" style={{ animationDelay: '.15s' }}>
              <h1 className="gf-h1" style={{ maxWidth: '20ch' }}>
                {title}
                <span className="gf-caret" />
              </h1>
              <p className="mt-8 max-w-[58ch] text-[16px] md:text-[18px] leading-relaxed"
                style={{ color: 'var(--muted)' }}>
                {body}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to={returnTo}
                  className="gf-btn-primary px-6 py-3.5 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight"
                >
                  Back to Home
                  <span aria-hidden>→</span>
                </Link>
                <a
                  href="mailto:info@groowfuse.com"
                  className="gf-btn-ghost px-6 py-3.5 rounded-md text-[14px] font-medium inline-flex items-center gap-2 tracking-tight"
                >
                  info@groowfuse.com
                </a>
              </div>
            </div>
          </div>

          <div className="gf-rise" style={{ animationDelay: '.5s' }}>
            <div className="pt-6 border-t flex flex-wrap items-center gap-x-8 gap-y-3"
              style={{ borderColor: 'var(--border)' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.18em' }}>
                AVAILABLE NOW /
              </span>
              <Link to="/" style={{ fontFamily: 'var(--mono)', fontSize: 12 }} className="text-white/80">Home</Link>
              <Link to="/services" style={{ fontFamily: 'var(--mono)', fontSize: 12 }} className="text-white/80">Services</Link>
              <a href="mailto:info@groowfuse.com" style={{ fontFamily: 'var(--mono)', fontSize: 12 }} className="text-white/80">Email us</a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}