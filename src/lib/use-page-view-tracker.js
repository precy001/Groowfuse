/**
 * Page-view tracker.
 * --------------------------------------------------------
 * Fires a single beacon to /api/track.php on each route change.
 *
 * Why a hook + Router listener instead of a one-shot:
 *   - SPAs don't trigger a full page load on navigation, so we have to
 *     listen to react-router's location changes.
 *   - We send the path + referrer (the full referring URL on first hit).
 *
 * Skips:
 *   - /admin/* paths (also filtered server-side)
 *   - Repeated identical path within 1 second (dev StrictMode double-mount,
 *     or React 19's transitions firing the effect twice)
 *
 * Uses navigator.sendBeacon when possible because it survives page unload
 * (so a user navigating away from the last page they viewed still gets
 * counted). Falls back to fetch.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const RAW_BASE = import.meta.env.VITE_API_URL || '';
const BASE = RAW_BASE.replace(/\/+$/, '');

export default function usePageViewTracker() {
  const location = useLocation();
  const lastPath = useRef('');
  const lastTime = useRef(0);
  // The referrer for the FIRST page in the SPA session. After that, we
  // pass an empty string — we don't pretend the previous SPA route was
  // a referrer (the analytics interpretation would be misleading).
  const initialReferrer = useRef(typeof document !== 'undefined' ? document.referrer : '');
  const isFirstHit = useRef(true);

  useEffect(() => {
    if (!BASE) return;

    const path = location.pathname + location.search;

    // Skip admin paths
    if (path.startsWith('/admin')) return;

    // De-dupe: same path within 1 second is a double-fire, ignore
    const now = Date.now();
    if (path === lastPath.current && now - lastTime.current < 1000) return;
    lastPath.current = path;
    lastTime.current = now;

    const referrer = isFirstHit.current ? (initialReferrer.current || '') : '';
    isFirstHit.current = false;

    const payload = JSON.stringify({ path, referrer });
    const url     = `${BASE}/track.php`;

    // sendBeacon is best — non-blocking, survives unload
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      // Fallback: fetch with keepalive
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {/* swallow */});
    }
  }, [location.pathname, location.search]);
}
