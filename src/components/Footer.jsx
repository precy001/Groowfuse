/**
 * Site-wide footer with newsletter signup, link columns, social icons.
 * Newsletter form is pre-wired to POST /api/newsletter.php — uncomment
 * when the PHP endpoint is ready.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const SITE_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const SERVICE_LINKS = [
  'Process Analysis',
  'IT Procurement',
  'Digital Transformation',
  'Workflow Automation',
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      // Wire this up when the PHP endpoint is ready:
      // const res = await fetch('/api/newsletter.php', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
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
            <div className="flex items-center gap-2">
              <Logo size={32} withWord />
              <span className="text-[15px] tracking-tight font-medium" style={{ color: 'var(--muted)' }}>
                {' '}Consult
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
              <div className="flex gap-2 border rounded-md p-1.5" style={{ borderColor: 'var(--border-bright)' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="gf-input flex-1 px-3 py-2 text-[14px]"
                  required
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="gf-btn-primary px-4 py-2 rounded-[6px] text-[13px]"
                >
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
              {SITE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-white transition-colors" style={{ color: 'var(--muted)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service links */}
          <div className="lg:col-span-2">
            <span className="gf-eyebrow">Services</span>
            <ul className="mt-6 space-y-3 text-[14px]">
              {SERVICE_LINKS.map((label) => (
                <li key={label}>
                  <Link to="/services" className="hover:text-white transition-colors" style={{ color: 'var(--muted)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <span className="gf-eyebrow">Contact</span>
            <ul className="mt-6 space-y-3 text-[14px]">
              <li>
                <a href="mailto:info@groowfuse.com" className="hover:text-white transition-colors" style={{ color: 'var(--muted)' }}>
                  info@groowfuse.com
                </a>
              </li>
              <li className="flex gap-3 mt-4">
                <a
                  href="https://www.linkedin.com/company/groowfuse-consult/"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md border flex items-center justify-center transition-colors hover:border-[var(--green)]"
                  style={{ borderColor: 'var(--border-bright)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M3 5h2v7H3V5zm1-3a1.2 1.2 0 100 2.4A1.2 1.2 0 004 2zm3 3h1.9v1h.03c.27-.5.93-1.05 1.92-1.05 2.05 0 2.43 1.32 2.43 3.04V12h-2V8.4c0-.86-.02-1.97-1.2-1.97s-1.38.93-1.38 1.9V12H7V5z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/share/1HF9C3hmW1/"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md border flex items-center justify-center transition-colors hover:border-[var(--green)]"
                  style={{ borderColor: 'var(--border-bright)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M7 0a7 7 0 00-1.1 13.9V9H4.2V7h1.7V5.4c0-1.7 1-2.6 2.6-2.6.7 0 1.4.1 1.4.1v1.6H9c-.8 0-1.1.5-1.1 1V7h1.9l-.3 2H7.9v4.9A7 7 0 007 0z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t flex flex-wrap justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
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