/**
 * Initial-load splash. Shows on first app mount only — not on internal
 * route changes (those are instant in an SPA, a flash would feel broken).
 *
 * Behavior:
 *   - Wait for fonts to be ready (prevents typography pop-in)
 *   - Enforce a minimum display time so the brand moment registers
 *   - Fade out smoothly, then unmount entirely (returns null)
 *   - Honors prefers-reduced-motion (skips animations, shorter display)
 */

import { useEffect, useState } from 'react';
import Logo from './Logo';

const MIN_DISPLAY_MS = 750;
const FADE_MS = 450;

export default function PageLoader() {
  // 'visible' → 'fading' → 'gone' (unmounted)
  const [phase, setPhase] = useState('visible');

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    const fontsReady =
      typeof document !== 'undefined' && document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();

    let fadeTimer;
    let unmountTimer;

    fontsReady.then(() => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

      fadeTimer = setTimeout(() => {
        if (cancelled) return;
        setPhase('fading');
        unmountTimer = setTimeout(() => {
          if (cancelled) return;
          setPhase('gone');
        }, FADE_MS);
      }, remaining);
    });

    return () => {
      cancelled = true;
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      className={`gf-loader ${phase === 'fading' ? 'is-fading' : ''}`}
      aria-hidden={phase !== 'visible'}
      role="status"
      aria-label="Loading"
    >
      <div className="gf-loader-inner">
        <div className="gf-loader-mark">
          <Logo height={64} alt="" />
        </div>
        <span className="gf-loader-text">INITIALIZING</span>
      </div>
    </div>
  );
}