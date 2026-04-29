/**
 * Scroll behavior on route change.
 * Mount once inside <BrowserRouter>; renders nothing.
 *
 * Behavior:
 *   - New path, no hash      → jump to top instantly
 *   - New path with #hash    → wait a frame, then smooth-scroll to the element
 *     (the element renders after the route mounts; querying immediately misses it)
 *   - Reduced-motion users get instant jumps regardless
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hash) {
      // Defer until after the new route has rendered.
      const id = hash.replace(/^#/, '');
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
          });
        } else {
          // Element not in DOM yet — try once more on next frame.
          requestAnimationFrame(tryScroll);
        }
      };
      requestAnimationFrame(tryScroll);
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}