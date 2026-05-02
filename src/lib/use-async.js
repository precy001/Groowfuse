/**
 * Tiny async-state hooks.
 * --------------------------------------------------------
 * useAsync(fn, deps)        — runs fn() and exposes { data, error, loading,
 *                              reload }
 * useAsyncCallback(fn)      — for one-off mutations: { run, loading, error }
 *
 * No external dep (no React Query) so the bundle stays small.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Run an async function on mount and whenever any of `deps` change.
 * The function receives an AbortSignal so it can cancel cleanly.
 *
 * Returns { data, error, loading, reload }
 *   - reload() reruns with fresh state
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  // Bump this to force a rerun
  const [tick, setTick] = useState(0);

  // Keep the latest fn around without retriggering effect for fn identity
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    Promise.resolve()
      .then(() => fnRef.current(ctrl.signal))
      .then((data) => {
        if (!alive) return;
        setState({ data, error: null, loading: false });
      })
      .catch((err) => {
        if (!alive || err?.name === 'AbortError') return;
        setState({ data: null, error: err, loading: false });
      });

    return () => {
      alive = false;
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { ...state, reload };
}

/**
 * For mutating actions that fire on user interaction. Returns
 *   { run, loading, error, data }
 *
 * run(...args) — calls fn(...args) and tracks the resulting promise.
 *   On success returns the resolved value. On failure rethrows so the
 *   caller can branch.
 */
export function useAsyncCallback(fn) {
  const [state, setState] = useState({ data: null, error: null, loading: false });
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });

  const run = useCallback(async (...args) => {
    setState({ data: null, error: null, loading: true });
    try {
      const data = await fnRef.current(...args);
      setState({ data, error: null, loading: false });
      return data;
    } catch (err) {
      setState({ data: null, error: err, loading: false });
      throw err;
    }
  }, []);

  return { ...state, run };
}
