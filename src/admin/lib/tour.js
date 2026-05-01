/**
 * Onboarding tour controller.
 *
 * Tracks whether each admin has completed (or skipped) the tour.
 * Keyed by user email so a fresh login on the same browser still gets
 * the option to view it.
 *
 * State lives in localStorage so it persists past browser tab close.
 *
 * Public API:
 *   shouldAutoOpen(email)   — should we auto-open the tour for this user?
 *   markCompleted(email)    — record they finished or skipped
 *   resetForUser(email)     — let an admin re-take the tour
 *   openTour() / closeTour() — programmatic open/close
 *   useTourState()          — React hook reading current open state
 */

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'gf-admin-tour-completed';

// Subscribers — for components that need to react to open/close changes.
const stateListeners = new Set();
let isOpen = false;

function emit() {
  for (const fn of stateListeners) fn(isOpen);
}

export function onTourChange(fn) {
  stateListeners.add(fn);
  return () => stateListeners.delete(fn);
}

/* ─── Open/close ─── */

export function openTour() {
  isOpen = true;
  emit();
}

export function closeTour() {
  isOpen = false;
  emit();
}

export function isTourOpen() {
  return isOpen;
}

/**
 * React hook — gives a component the current open state plus a function
 * to imperatively change it. Useful for the AdminTour component itself.
 */
export function useTourState() {
  const [open, setOpen] = useState(isOpen);
  useEffect(() => onTourChange(setOpen), []);
  return [open, openTour, closeTour];
}

/* ─── Completion tracking ─── */

function readCompleted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeCompleted(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch { /* noop */ }
}

/**
 * Has this user already done (or skipped) the tour?
 */
export function hasCompletedTour(email) {
  if (!email) return false;
  const map = readCompleted();
  return !!map[email];
}

/**
 * Whether the tour should auto-open for this user right now.
 * (Hasn't seen it yet on this device.)
 */
export function shouldAutoOpen(email) {
  return !hasCompletedTour(email);
}

/**
 * Mark the tour completed for this user. Called from both the
 * "Get started" final-step button and the "Skip" button.
 */
export function markCompleted(email) {
  if (!email) return;
  const map = readCompleted();
  map[email] = { at: new Date().toISOString() };
  writeCompleted(map);
}

/**
 * Reset for a user so they can re-take the tour. Called by the
 * "Take the tour" button on the dashboard.
 */
export function resetForUser(email) {
  if (!email) return;
  const map = readCompleted();
  delete map[email];
  writeCompleted(map);
}
