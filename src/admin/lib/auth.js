/**
 * Admin authentication helpers.
 * --------------------------------------------------------
 *
 *  ⚠️  TEMPORARY FRONTEND-ONLY AUTH  ⚠️
 *
 * Credentials are HARDCODED in this file as a placeholder. Anyone who
 * inspects the JS bundle can read them. This is acceptable ONLY for the
 * pre-backend prototyping phase.
 *
 * When the PHP backend lands, this file's responsibilities change:
 *   1. Remove HARDCODED_EMAIL and HARDCODED_PASSWORD constants entirely.
 *   2. login() should POST credentials to /api/admin/login.php and store
 *      whatever session token the server returns (httpOnly cookie is best;
 *      if not possible, sessionStorage with a short expiry).
 *   3. isAuthenticated() should call /api/admin/me.php and trust the server,
 *      not check a client-side flag.
 *   4. logout() should call /api/admin/logout.php to invalidate server-side.
 *
 * The component-level API (login, logout, getUser, isAuthenticated,
 * onAuthChange) stays the same so swap-out is a localized change.
 */

const HARDCODED_EMAIL    = 'dev@groowfuse.com';
const HARDCODED_PASSWORD = 'admin101';

const STORAGE_KEY = 'gf-admin-session';

// Subscribers for auth-state changes (login/logout) — pages that need to
// react (e.g. show "Logged in as ___" in the topbar) call onAuthChange.
const listeners = new Set();
function emit() {
  for (const fn of listeners) fn(getUser());
}

/**
 * Subscribe to auth-state changes. Returns an unsubscribe function.
 */
export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Attempt to log in. Returns { ok: true } on success, { ok: false, error }
 * on failure. Async to match the eventual fetch-based version.
 */
export async function login(email, password) {
  // Simulate a small server delay so the UX matches the future real flow
  await new Promise((r) => setTimeout(r, 350));

  const emailLower = (email || '').trim().toLowerCase();

  if (emailLower !== HARDCODED_EMAIL || password !== HARDCODED_PASSWORD) {
    return { ok: false, error: 'Invalid email or password.' };
  }

  const session = {
    email: HARDCODED_EMAIL,
    name:  'Admin',
    loggedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  emit();

  // Log the login. Imported lazily to avoid a circular module load
  // (audit-log → auth.getUser). At call time the dependency is resolved.
  const { logAction } = await import('./audit-log');
  logAction('login', { type: 'session' });

  return { ok: true, user: session };
}

/**
 * Clear the session. Always succeeds. Async to match real flow.
 */
export async function logout() {
  // Log the logout BEFORE clearing the session — needs the user info
  const { logAction } = await import('./audit-log');
  logAction('logout', { type: 'session' });

  sessionStorage.removeItem(STORAGE_KEY);
  emit();
  return { ok: true };
}

/**
 * Get the current logged-in user, or null.
 */
export function getUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Boolean shorthand. Use this for route guards.
 */
export function isAuthenticated() {
  return !!getUser();
}