/**
 * Audit log — records every admin action with the user who performed it.
 *
 *  ⚠️  TEMPORARY FRONTEND-ONLY IMPLEMENTATION  ⚠️
 *
 * Currently writes to localStorage so entries persist across sessions on
 * this machine. When the backend lands:
 *   1. logAction() should POST to /api/admin/log.php
 *   2. getRecentActions() / getActionsForTarget() should GET from the same
 *   3. localStorage backup can stay as an offline fallback or be removed.
 *
 * Public API:
 *   logAction(action, target, meta?)  — record an action
 *   getRecentActions(limit?)          — list recent actions, newest first
 *   getActionsForTarget(targetType, targetId?) — actions filtered by target
 *   getLastActionForTarget(...)       — convenience: most recent matching
 *   clearLog()                        — admin-only nuke (used by the
 *                                       Re-take tour flow)
 *
 * Action format:
 *   { id, at, user: { email, name }, action, target: { type, id, label }, meta }
 *
 * Action verbs we use:
 *   'login' | 'logout'
 *   'post.create' | 'post.update' | 'post.publish' | 'post.delete'
 *   'message.archive' | 'message.unarchive' | 'message.read'
 *   'subscriber.remove'
 *   'newsletter.send'
 */

import { getUser } from './auth';

const STORAGE_KEY = 'gf-admin-audit-log';
const MAX_ENTRIES = 200;     // cap so localStorage never blows up

/* ─── Subscribers — for live UI updates ─── */
const listeners = new Set();
function emit() {
  for (const fn of listeners) fn(getRecentActions(10));
}
export function onAuditChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ─── Reading ─── */
function readLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLog(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable (private mode, quota) — silently degrade
  }
}

/**
 * Record an admin action.
 *
 * @param {string} action  Verb like 'post.update' (see header for the set we use)
 * @param {{type: string, id?: string, label?: string}} target
 * @param {object} [meta]  Anything worth showing in the activity feed
 */
export function logAction(action, target, meta = {}) {
  const user = getUser();
  if (!user) return;     // shouldn't happen — guarded routes — but defensive

  const entry = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    user: { email: user.email, name: user.name || 'Admin' },
    action,
    target,
    meta,
  };

  const log = readLog();
  log.unshift(entry);

  // Trim to cap
  if (log.length > MAX_ENTRIES) log.length = MAX_ENTRIES;

  writeLog(log);
  emit();
  return entry;
}

/**
 * Most recent N actions, newest first.
 */
export function getRecentActions(limit = 20) {
  return readLog().slice(0, limit);
}

/**
 * Actions filtered by target. Pass targetId to narrow further.
 */
export function getActionsForTarget(targetType, targetId) {
  return readLog().filter((entry) => {
    if (entry.target?.type !== targetType) return false;
    if (targetId && entry.target?.id !== targetId) return false;
    return true;
  });
}

/**
 * Most recent action for a specific target — shortcut for "Last edited by".
 */
export function getLastActionForTarget(targetType, targetId) {
  return getActionsForTarget(targetType, targetId)[0] || null;
}

/**
 * Wipe the log. Used by the "re-take the tour" flow and useful for testing.
 */
export function clearLog() {
  writeLog([]);
  emit();
}

/* ─── Display helpers ─── */

/**
 * Friendly verb for an action verb-id. Used in the activity feed.
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
    case 'subscriber.remove':  return 'removed subscriber';
    case 'newsletter.send':    return 'sent newsletter';
    default:                   return action.replace(/\./g, ' ');
  }
}
