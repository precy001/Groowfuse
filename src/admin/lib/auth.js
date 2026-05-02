/**
 * Admin authentication.
 * --------------------------------------------------------
 * Wraps the backend session-cookie auth endpoints. The session itself
 * is held in an HttpOnly cookie that the API sets on /admin/login.php
 * and clears on /admin/logout.php — JS cannot read it (which is the
 * point — no XSS-stealable token).
 *
 * Auth state is broadcast to subscribers so AdminShell, AdminNav, and
 * RequireAuth can react to login/logout without prop drilling.
 *
 * Public surface:
 *   bootstrap()             — call on app mount; resolves the current user
 *   login(email, password)  — { ok, user } | { ok: false, error }
 *   logout()
 *   getUser()               — last known user, or null (sync)
 *   onAuthChange(fn)        — subscribe to changes
 *
 * The shape of getUser() and the result of login() match what the
 * hardcoded version returned, so callers like the dashboard's
 * "Take the tour" button keep working.
 */

import { api, ApiError } from '../../lib/api';

let currentUser  = null;
let bootstrapped = false;
let pendingBoot  = null;

const listeners = new Set();
function emit() {
  for (const fn of listeners) fn(currentUser);
}

/**
 * Subscribe to auth-state changes. Returns an unsubscribe function.
 */
export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Last known user, synchronously. Returns null if not logged in
 * (or before bootstrap()).
 */
export function getUser() {
  return currentUser;
}

/**
 * Was bootstrap()'s first run completed? Used by RequireAuth so it
 * doesn't briefly redirect to /login while we're checking the cookie.
 */
export function isBootstrapped() {
  return bootstrapped;
}

/**
 * Resolve the current admin from the session cookie. Idempotent —
 * subsequent calls return the same in-flight promise (or resolved value).
 *
 * Call this exactly once at app mount, plus whenever login/logout occurs.
 */
export function bootstrap() {
  if (bootstrapped) return Promise.resolve(currentUser);
  if (pendingBoot)  return pendingBoot;

  pendingBoot = api.get('/admin/me.php')
    .then((res) => {
      currentUser = res?.user ?? null;
    })
    .catch((err) => {
      // 401 = not logged in. Anything else (network, 500) = log + treat as unauthed
      if (!(err instanceof ApiError) || err.status !== 401) {
        // eslint-disable-next-line no-console
        console.warn('[admin auth] bootstrap failed:', err?.message || err);
      }
      currentUser = null;
    })
    .finally(() => {
      bootstrapped = true;
      pendingBoot  = null;
      emit();
    });

  return pendingBoot;
}

/**
 * Attempt login. Returns { ok: true, user } on success,
 * { ok: false, error } on failure.
 */
export async function login(email, password) {
  try {
    const res  = await api.post('/admin/login.php', { email, password });
    currentUser  = res?.user ?? null;
    bootstrapped = true;
    emit();
    return { ok: true, user: currentUser };
  } catch (err) {
    const msg = err instanceof ApiError ? err.message : 'Could not sign in.';
    return { ok: false, error: msg };
  }
}

/**
 * Destroy the current session. Always clears local state, even if the
 * server call fails (the cookie is cleared client-side too).
 */
export async function logout() {
  try {
    await api.post('/admin/logout.php');
  } catch {
    // ignore — best effort
  }
  currentUser = null;
  emit();
  return { ok: true };
}

/**
 * Boolean shorthand. Note this is sync and only correct after
 * bootstrap() has resolved (or after a successful login).
 */
export function isAuthenticated() {
  return !!currentUser;
}