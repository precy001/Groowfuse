/**
 * Groow Fuse Consult — Contact page
 * --------------------------------------------------------
 * Copy is verbatim from groowfuse.com/contact.
 *
 * Visual rhythm:
 *   1. Viewport-fit hero with the page intro
 *   2. Contact section — info column (address/email/social) + form column
 *   3. Mid-page CTA / closer
 *
 * Form is wired for a PHP endpoint at /api/contact.php (commented in
 * handleSubmit). Submits use a placeholder timeout until that's live.
 * Honeypot field included for basic spam protection.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useReveal, useMouseGlow } from '../lib/hooks';

export default function Contact() {
  return (
    <div className="gf-root">
      <Nav />
      <ContactHero />
      <ContactSection />
      <FinalNote />
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Hero
 * ──────────────────────────────────────────────────────────── */

function ContactHero() {
  const spotRef = useMouseGlow();

  return (
    <section ref={spotRef} className="gf-hero gf-spotlight">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2400&q=80')",
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
          <span className="gf-eyebrow">Contact</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.22em' }}>
            <Link to="/" style={{ color: 'var(--dim)' }}>HOME</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--green)' }}>CONTACT</span>
          </span>
        </div>

        {/* CENTER */}
        <div className="gf-hero-center">
          <div className="gf-rise" style={{ animationDelay: '.15s' }}>
            <p className="gf-eyebrow" style={{ marginBottom: 28 }}>
              Empowering your business through smart technology solutions
            </p>
            <h1 className="gf-h1" style={{ maxWidth: '18ch' }}>
              Ready to elevate your{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                <span className="gf-serif" style={{ color: 'var(--green)' }}>business</span>.
                <span className="gf-caret" />
              </span>
            </h1>
            <p className="mt-8 max-w-[60ch] text-[16px] md:text-[18px] leading-relaxed"
              style={{ color: 'var(--muted)' }}>
              Complete the form below and our team will reach out promptly to discuss
              your needs.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#contact-form"
                className="gf-btn-primary px-6 py-3.5 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight"
              >
                Send Message
                <span aria-hidden>↓</span>
              </a>
              <a
                href="mailto:info@groowfuse.com"
                className="gf-btn-ghost px-6 py-3.5 rounded-md text-[14px] font-medium inline-flex items-center gap-2 tracking-tight"
              >
                info@groowfuse.com
                <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM — quick contact info strip */}
        <div className="gf-rise" style={{ animationDelay: '.5s' }}>
          <div className="gf-tag-strip">
            <a href="#contact-form" className="gf-frame-tile" style={{ background: 'var(--bg)' }}>
              <span className="gf-frame-num">FORM</span>
              <span className="gf-frame-tag" style={{ letterSpacing: '0.04em', textTransform: 'none' }}>
                Send a Message
              </span>
            </a>
            <a href="#contact-info" className="gf-frame-tile" style={{ background: 'var(--bg)' }}>
              <span className="gf-frame-num">DIRECT</span>
              <span className="gf-frame-tag" style={{ letterSpacing: '0.04em', textTransform: 'none' }}>
                Address &amp; Email
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Contact Section — info + form, two columns
 * ──────────────────────────────────────────────────────────── */

function ContactSection() {
  const [ref, shown] = useReveal(0.05);

  return (
    <section
      id="contact-info"
      ref={ref}
      className="relative py-32 lg:py-40 border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="absolute inset-0 gf-grid-dense opacity-20 pointer-events-none" />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* LEFT — contact info */}
          <div className={`gf-reveal ${shown ? 'is-shown' : ''} lg:col-span-5`}>
            <span className="gf-eyebrow">Get in touch</span>
            <h2 className="gf-h2 mt-8 max-w-[18ch]" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
              Tell us about your{' '}
              <span className="gf-serif" style={{ color: 'var(--green)' }}>vision</span>.
            </h2>
            <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              Whether you have a defined project or are still exploring possibilities,
              we'd love to hear from you. Expect a response within one business day.
            </p>

            {/* Info cards */}
            <div className="mt-12 space-y-px" style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
              <InfoCard
                icon={<AddressIcon />}
                label="Address"
                lines={[
                  '77 Camden Street Lower',
                  'Dublin',
                  'D02 XE80',
                  'Ireland',
                ]}
              />
              <InfoCard
                icon={<EmailIcon />}
                label="Email Us"
                lines={[
                  <a key="email" href="mailto:info@groowfuse.com" className="gf-link" style={{ color: 'var(--text)', display: 'inline-flex' }}>
                    info@groowfuse.com
                  </a>,
                ]}
              />
              <InfoCard
                icon={<SocialIcon />}
                label="Follow"
                lines={[
                  <span key="social" style={{ display: 'inline-flex', gap: 12 }}>
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
                  </span>,
                ]}
              />
            </div>

            {/* Map */}
            <div className="mt-px">
              <MapCard />
            </div>
          </div>

          {/* RIGHT — form */}
          <div
            id="contact-form"
            className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} lg:col-span-7`}
          >
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, lines }) {
  return (
    <div className="relative p-8 lg:p-10" style={{ background: 'var(--bg)' }}>
      <div className="flex items-start gap-5">
        <div
          className="w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            border: '1px solid var(--border-bright)',
            background: 'rgba(31,224,122,0.04)',
            color: 'var(--green)',
          }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <span className="gf-eyebrow" style={{ fontSize: 11 }}>{label}</span>
          <div className="mt-3" style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text)' }}>
            {lines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1 C5 1 3 3 3 6 C3 10 8 15 8 15 C8 15 13 10 13 6 C13 3 11 1 8 1 Z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="6" r="2" fill="currentColor" />
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3.5" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 4.5 L8 9 L13.5 4.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function SocialIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 5 L7 11 M10.5 5 L9 11" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * Map — Google Maps embed (no API key required) styled for dark theme
 * ──────────────────────────────────────────────────────────── */

function MapCard() {
  // Verbatim address from the original site
  const address = '77 Camden Street Lower, Dublin, D02 XE80, Ireland';
  const encoded = encodeURIComponent(address);
  const embedSrc = `https://maps.google.com/maps?q=${encoded}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  return (
    <div className="gf-map-card relative" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
      {/* Corner brackets */}
      <span className="absolute" style={{ top: 8, left: 8, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)', zIndex: 2 }}>┌</span>
      <span className="absolute" style={{ top: 8, right: 8, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)', zIndex: 2 }}>┐</span>

      <div className="gf-map-frame">
        <iframe
          title="GroowFuse office location — 77 Camden Street Lower, Dublin"
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {/* Subtle inner gradient to blend the map edges with the dark theme */}
        <div aria-hidden className="gf-map-vignette" />
      </div>

      <div className="gf-map-footer">
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.18em' }}>
          OFFICE · DUBLIN
        </span>
        <a
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="gf-link"
          style={{ fontSize: 12, fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}
        >
          Get directions <span aria-hidden>↗</span>
        </a>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Form
 * ──────────────────────────────────────────────────────────── */

const SECTORS = ['Technology', 'Finance', 'Retail', 'Healthcare', 'Other'];
const SERVICE_TYPES = ['Digital Transformation', 'Data Management', 'Business Analysis', 'Other'];

function ContactForm() {
  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    country: '',
    sector: '',
    contactName: '',
    contactEmail: '',
    serviceType: '',
    serviceTypeOther: '', // shown only when serviceType === 'Other'
    message: '',
    honeypot: '', // spam trap — must stay empty
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [k]: value };
      // Clear the "Other" detail when the parent select moves off "Other"
      if (k === 'serviceType' && value !== 'Other') next.serviceTypeOther = '';
      return next;
    });
  };

  const isOtherService = form.serviceType === 'Other';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.honeypot) return; // bot caught
    setStatus('loading');
    setErrorMsg('');
    try {
      // Wire up when the PHP endpoint is ready:
      // const res = await fetch('/api/contact.php', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form),
      // });
      // if (!res.ok) throw new Error('Server returned ' + res.status);
      await new Promise((r) => setTimeout(r, 800)); // placeholder
      setStatus('success');
      setForm({
        companyName: '', companyEmail: '', country: '', sector: '',
        contactName: '', contactEmail: '', serviceType: '', serviceTypeOther: '',
        message: '', honeypot: '',
      });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return <FormSuccess onReset={() => setStatus('idle')} />;
  }

  return (
    <form onSubmit={handleSubmit} className="gf-form" noValidate>
      {/* Card frame */}
      <div className="relative p-8 lg:p-10" style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}>
        {/* Corner brackets */}
        <span className="absolute top-3 left-3" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┌</span>
        <span className="absolute top-3 right-3" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┐</span>
        <span className="absolute bottom-3 left-3" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>└</span>
        <span className="absolute bottom-3 right-3" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>┘</span>

        <div className="flex items-baseline justify-between mb-8">
          <span className="gf-eyebrow">Send a message</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.18em' }}>
            FORM / 01
          </span>
        </div>

        <div className="gf-form-grid">
          {/* Row 1 */}
          <Field label="Company Name" required>
            <input
              type="text"
              required
              value={form.companyName}
              onChange={set('companyName')}
              className="gf-form-input"
              placeholder="e.g. Acme Industries"
            />
          </Field>
          <Field label="Company Email" required>
            <input
              type="email"
              required
              value={form.companyEmail}
              onChange={set('companyEmail')}
              className="gf-form-input"
              placeholder="hello@acme.com"
            />
          </Field>

          {/* Row 2 */}
          <Field label="Country">
            <input
              type="text"
              value={form.country}
              onChange={set('country')}
              className="gf-form-input"
              placeholder="Ireland"
            />
          </Field>
          <Field label="Sector / Industry">
            <select
              value={form.sector}
              onChange={set('sector')}
              className="gf-form-input gf-form-select"
            >
              <option value="">Select…</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          {/* Row 3 */}
          <Field label="Contact Name" required>
            <input
              type="text"
              required
              value={form.contactName}
              onChange={set('contactName')}
              className="gf-form-input"
              placeholder="Your full name"
            />
          </Field>
          <Field label="Contact Email" required>
            <input
              type="email"
              required
              value={form.contactEmail}
              onChange={set('contactEmail')}
              className="gf-form-input"
              placeholder="you@example.com"
            />
          </Field>

          {/* Row 4 — Service Type, full width */}
          <Field label="Service Type" full>
            <select
              value={form.serviceType}
              onChange={set('serviceType')}
              className="gf-form-input gf-form-select"
            >
              <option value="">Select…</option>
              {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          {/* Conditional — appears only when Service Type === Other */}
          <div className={`gf-form-conditional ${isOtherService ? 'is-shown' : ''}`}>
            <div className="gf-form-conditional-inner">
              <label className="gf-form-field">
                <span className="gf-form-label">
                  Specify Service Type
                  {isOtherService && <span style={{ color: 'var(--green)', marginLeft: 4 }}>*</span>}
                </span>
                <input
                  type="text"
                  required={isOtherService}
                  // Tab/focus only when actually shown
                  tabIndex={isOtherService ? 0 : -1}
                  aria-hidden={!isOtherService}
                  value={form.serviceTypeOther}
                  onChange={set('serviceTypeOther')}
                  className="gf-form-input"
                  placeholder="Tell us what you're looking for"
                />
              </label>
            </div>
          </div>

          {/* Row 5 — Message */}
          <Field label="How can we enhance your business journey?" required full>
            <textarea
              required
              value={form.message}
              onChange={set('message')}
              className="gf-form-input gf-form-textarea"
              rows={5}
              placeholder="Tell us about the problem you'd like to solve…"
            />
          </Field>
        </div>

        {/* Honeypot — invisible, bots fill it, humans don't */}
        <div className="gf-form-honeypot" aria-hidden="true">
          <label>
            Leave this blank
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.honeypot}
              onChange={set('honeypot')}
            />
          </label>
        </div>

        {/* Footer row — error + submit */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.14em' }}>
            <span style={{ color: 'var(--green)' }}>*</span> Required fields
          </p>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="gf-btn-primary px-7 py-3.5 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight"
          >
            {status === 'loading' ? (
              <>
                Sending<span className="gf-form-dots" aria-hidden>...</span>
              </>
            ) : (
              <>
                Send Message
                <span aria-hidden>→</span>
              </>
            )}
          </button>
        </div>

        {status === 'error' && (
          <p
            className="mt-4 text-[13px]"
            style={{ color: '#FF6B6B', fontFamily: 'var(--mono)' }}
            role="alert"
          >
            {errorMsg}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({ label, required, full, children }) {
  return (
    <label className={`gf-form-field ${full ? 'is-full' : ''}`}>
      <span className="gf-form-label">
        {label}
        {required && <span style={{ color: 'var(--green)', marginLeft: 4 }}>*</span>}
      </span>
      {children}
    </label>
  );
}

function FormSuccess({ onReset }) {
  return (
    <div
      className="relative p-12 lg:p-16 text-center"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div
        className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-8"
        style={{
          border: '1px solid var(--green-soft)',
          background: 'rgba(31,224,122,0.08)',
          color: 'var(--green)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M5 11 L9 15 L17 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 500, letterSpacing: '-0.02em' }}>
        Message <span className="gf-serif" style={{ color: 'var(--green)' }}>received</span>.
      </h3>
      <p className="mt-4 max-w-[42ch] mx-auto" style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6 }}>
        Thanks for reaching out. Our team will follow up within one business day to
        discuss your needs.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="gf-btn-ghost mt-10 px-6 py-3 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight"
      >
        Send another message
        <span aria-hidden>↗</span>
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Final note — quiet closer (less heavy than Home/Services CTA)
 * ──────────────────────────────────────────────────────────── */

function FinalNote() {
  const [ref, shown] = useReveal();
  return (
    <section ref={ref} className="relative py-32 border-t overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="absolute inset-0 gf-grid-dense opacity-25 pointer-events-none" />
      <div className="relative max-w-[1080px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className={`gf-reveal ${shown ? 'is-shown' : ''} lg:col-span-7`}>
            <span className="gf-eyebrow">Response time</span>
            <h2 className="mt-6" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              We respond within{' '}
              <span className="gf-serif" style={{ color: 'var(--green)' }}>one business day</span>.
            </h2>
            <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              Prefer email? Send us a note directly and we'll get back to you with
              availability and next steps.
            </p>
          </div>
          <div className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} lg:col-span-5 lg:col-start-8 flex lg:justify-end`}>
            <a
              href="mailto:info@groowfuse.com"
              className="gf-btn-primary px-7 py-4 rounded-md text-[14px] inline-flex items-center gap-2 tracking-tight"
            >
              info@groowfuse.com
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}