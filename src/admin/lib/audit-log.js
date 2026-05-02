/**
 * Audit log — thin frontend wrapper.
 * --------------------------------------------------------
 * The backend records every admin write action automatically (see
 * api/lib/audit.php). The frontend's job here is just to read those
 * entries and surface human-friendly verbs.
 *
 * logAction() is kept as a no-op for backwards compatibility with the
 * call sites that used to write to localStorage. Removing those calls
 * from page components is a follow-up; leaving the no-op means there
 * are no stale references in the meantime.
 */

import { useAsync } from '../../lib/use-async';
import { api } from '../../lib/api';

/**
 * Hook: returns the most recent N audit entries, with reload().
 * Used on the Dashboard.
 */
export function useRecentActions(limit = 8) {
  return useAsync(
    (signal) => api.get(`/admin/audit-log.php?limit=${limit}`, { signal }),
    [limit]
  );
}

/**
 * Hook: actions filtered by target. Used for "Last activity by ___" rows
 * on individual edit pages.
 */
export function useActionsForTarget(targetType, targetId, limit = 10) {
  return useAsync(
    (signal) => {
      if (!targetType || !targetId) return Promise.resolve({ actions: [] });
      const qs = new URLSearchParams({
        targetType,
        targetId: String(targetId),
        limit:    String(limit),
      });
      return api.get(`/admin/audit-log.php?${qs.toString()}`, { signal });
    },
    [targetType, targetId, limit]
  );
}

/**
 * Backend-side logging happens automatically — every admin endpoint
 * writes to the audit log on the server. This client function is a
 * no-op kept for source compatibility with old call sites that used
 * to hand-record actions to localStorage.
 *
 * Safe to delete the call sites later; meanwhile they don't error.
 */
export function logAction(_action, _target, _meta) {
  // intentional no-op
}

/**
 * No-op subscriber — kept so any leftover Dashboard hook calls don't
 * blow up. The real activity feed uses useRecentActions() above.
 */
export function onAuditChange(_fn) {
  return () => {};
}

/**
 * Friendly verb for an action id. Used in the activity feed and
 * "Last activity" rows.
 */
export function describeAction(action) {
  switch (action) {
    case 'login':              return 'signed in';
    case 'logout':             return 'signed out';
    case 'post.create':        return 'created post';
    case 'post.update':        return 'edited post';
    case 'post.publish':       return 'published post';
    case 'post.delete':        return 'deleted post';
    case 'message.archive':    return 'archived message';
    case 'message.unarchive':  return 'unarchived message';
    case 'message.read':       return 'read message';
    case 'message.delete':     return 'deleted message';
    case 'subscriber.remove':  return 'removed subscriber';
    case 'newsletter.send':    return 'sent newsletter';
    case 'upload.create':      return 'uploaded image';
    default:                   return (action || '').replace(/\./g, ' ');
  }
}