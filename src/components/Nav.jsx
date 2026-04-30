/**
 * Site-wide navigation bar.
 * Highlights the active route automatically via useLocation.
 * Uses <Link> so route changes don't trigger full page reloads.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Blog',     to: '/blog' },
  { label: 'About',    to: '/about' },
  { label: 'Contact',  to: '/contact' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Add the blurred-pill effect once the user has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Active route detection — exact match for '/', startsWith for the rest.
  const isCurrent = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <header className={`gf-nav fixed top-0 inset-x-0 z-50 border-b border-transparent ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="max-w-[1280px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="GroowFuse home">
          <Logo height={36} />
        </Link>

        <ul
          className="hidden md:flex items-center gap-9 text-[14px]"
          style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}
        >
          {LINKS.map((link, i) => (
            <li key={link.label}>
              <Link
                to={link.to}
                className={`gf-nav-link ${isCurrent(link.to) ? 'is-current' : ''}`}
              >
                <span style={{ color: 'var(--dim)' }} className="mr-1.5">0{i + 1}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="gf-btn-primary text-[13px] px-4 py-2 rounded-md tracking-tight items-center gap-2 hidden sm:inline-flex"
          >
            Book Consultation
            <span aria-hidden>→</span>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-md border"
            style={{ borderColor: 'var(--border-bright)' }}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className="block w-4 h-px bg-white relative before:content-[''] before:absolute before:left-0 before:right-0 before:h-px before:bg-white before:-top-1.5 after:content-[''] after:absolute after:left-0 after:right-0 after:h-px after:bg-white after:top-1.5" />
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t" style={{ borderColor: 'var(--border)', background: 'rgba(10,10,11,0.95)' }}>
          <ul className="px-6 py-6 space-y-4" style={{ fontFamily: 'var(--mono)', fontSize: 14 }}>
            {LINKS.map((link, i) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className={`flex justify-between items-center ${isCurrent(link.to) ? 'is-current' : ''}`}
                  style={{ color: isCurrent(link.to) ? 'var(--text)' : 'var(--muted)' }}
                >
                  <span>{link.label}</span>
                  <span style={{ color: 'var(--dim)' }}>0{i + 1}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/contact"
                className="gf-btn-primary block text-center text-[13px] px-4 py-3 rounded-md mt-4"
              >
                Book Consultation →
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}