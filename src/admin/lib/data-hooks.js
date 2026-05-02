/**
 * Admin data hooks.
 * --------------------------------------------------------
 * Replaces the static MOCK_MESSAGES / MOCK_SUBSCRIBERS arrays from
 * mock-data.js with live API calls.
 *
 * Pattern: every hook returns { data, error, loading, reload }.
 * Pages call reload() after mutations so the list re-fetches.
 */

import { useAsync } from '../../lib/use-async';
import { api } from '../../lib/api';

/* ─── Dashboard ──────────────────────────────────────────────────── */

export function useDashboardStats() {
  return useAsync((signal) => api.get('/admin/dashboard-stats.php', { signal }), []);
}

/* ─── Messages ───────────────────────────────────────────────────── */

/**
 * @param {string} [status] 'inbox' (default) | 'unread' | 'archived' | 'all'
 */
export function useMessages(status = 'inbox') {
  return useAsync(
    (signal) => api.get(
      '/admin/messages.php' + (status ? `?status=${encodeURIComponent(status)}` : ''),
      { signal }
    ),
    [status]
  );
}

export function useMessage(id) {
  return useAsync(
    (signal) => {
      if (!id) return Promise.resolve(null);
      return api.get(`/admin/messages.php?id=${encodeURIComponent(id)}`, { signal });
    },
    [id]
  );
}

/* ─── Subscribers ────────────────────────────────────────────────── */

/**
 * @param {string} [status] 'all' | 'confirmed' | 'pending' | 'unsubscribed'
 */
export function useSubscribers(status = 'all') {
  return useAsync(
    (signal) => api.get(
      '/admin/subscribers.php' +
        (status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''),
      { signal }
    ),
    [status]
  );
}

/* ─── Posts (admin view, includes drafts) ───────────────────────── */

export function useAdminPosts() {
  return useAsync((signal) => api.get('/admin/posts.php', { signal }), []);
}

export function useAdminPost(id) {
  return useAsync(
    (signal) => {
      if (!id) return Promise.resolve(null);
      return api.get(`/admin/posts.php?id=${encodeURIComponent(id)}`, { signal });
    },
    [id]
  );
}

/* ─── Admin users (owner only) ───────────────────────────────────── */

export function useAdminUsers() {
  return useAsync((signal) => api.get('/admin/users.php', { signal }), []);
}

/* ─── Analytics ──────────────────────────────────────────────────── */

/**
 * @param {'7d'|'30d'|'90d'} range
 */
export function useAnalytics(range = '30d') {
  return useAsync(
    (signal) => api.get(`/admin/analytics.php?range=${encodeURIComponent(range)}`, { signal }),
    [range]
  );
}
