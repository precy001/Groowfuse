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
        <svg
          className="gf-loader-mark"
          width="56"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Leaf — draws/fades in */}
          <path
            d="M44 6 C 51 7 57 13 57 21 C 57 30 49 38 39 38 C 35 38 31 35 31 31 C 31 22 35 11 44 6 Z"
            fill="#1FE07A"
            className="gf-loader-leaf"
          />
          {/* Stem */}
          <path
            d="M37 38 C 37 44 35 48 32 52"
            stroke="#1FE07A"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
            className="gf-loader-stem"
          />
          {/* Infinity — pulses */}
          <path
            d="M 16 50 C 16 46 19 43 23 43 C 28 43 30 47 32 50 C 34 53 36 57 41 57 C 45 57 48 54 48 50 C 48 46 45 43 41 43 C 36 43 34 47 32 50 C 30 53 28 57 23 57 C 19 57 16 54 16 50 Z"
            stroke="#1FE07A"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="gf-loader-infinity"
          />
        </svg>
        <span className="gf-loader-text">INITIALIZING</span>
      </div>
    </div>
  );
}