/**
 * Public posts data layer.
 * --------------------------------------------------------
 * Replaces the old hardcoded src/data/posts.js. Exposes hooks the
 * Blog and BlogPost pages can use, plus a few helpers that don't
 * depend on data (like formatDate).
 *
 * Strict mode: when the API can't be reached, hooks expose an error
 * object instead of falling back to local data. Callers display the
 * error to the user.
 */

import { useMemo } from 'react';
import { api } from './api';
import { useAsync } from './use-async';

/* ─── Pure helpers (don't need the API) ──────────────────────────── */

/**
 * Format an ISO-ish date string for display.
 * Matches the look used everywhere in the public site.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ─── Hooks ──────────────────────────────────────────────────────── */

/**
 * Returns { data: { posts, total, categories }, error, loading, reload }
 *
 * @param {object} opts
 * @param {string} [opts.category]  filter slug; 'all' means no filter
 * @param {number} [opts.limit]
 * @param {number} [opts.offset]
 */
export function usePostList({ category = 'all', limit = 50, offset = 0 } = {}) {
  return useAsync(
    (signal) => {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      params.set('limit',  String(limit));
      params.set('offset', String(offset));
      return api.get(`/posts.php?${params.toString()}`, { signal });
    },
    [category, limit, offset]
  );
}

/**
 * Returns { data: { post, related }, error, loading, reload }
 */
export function usePost(slug) {
  return useAsync(
    (signal) => {
      if (!slug) return Promise.resolve(null);
      return api.get(`/posts.php?slug=${encodeURIComponent(slug)}`, { signal });
    },
    [slug]
  );
}

/**
 * Convenience: derive the categories array (for filter chips) plus a
 * synthetic 'All' option, given the API's category response.
 */
export function useCategoriesFromList(listData) {
  return useMemo(() => {
    const cats = listData?.categories || [];
    const total = listData?.total ?? cats.reduce((n, c) => n + (c.count || 0), 0);
    return [
      { id: 'all', label: 'All', count: total },
      ...cats,
    ];
  }, [listData]);
}
