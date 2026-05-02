/**
 * Route guard for admin pages.
 *
 * Auth is now async — we have to wait for the bootstrap (a call to
 * /admin/me.php) to finish before knowing whether the cookie is valid.
 * Until then, render a small loading state. After it resolves, either
 * redirect to /login or render children.
 *
 * Listens to onAuthChange so logout from anywhere kicks the user out.
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { bootstrap, isBootstrapped, isAuthenticated, onAuthChange } from '../lib/auth';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const [ready, setReady] = useState(isBootstrapped());
  const [, setTick]       = useState(0);   // re-render on auth change

  // Trigger initial bootstrap (idempotent)
  useEffect(() => {
    let cancelled = false;
    bootstrap().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Re-render whenever auth state changes (login/logout)
  useEffect(() => onAuthChange(() => setTick((n) => n + 1)), []);

  if (!ready) {
    return (
      <div style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #0A0A0B)',
        color: 'var(--green, #1FE07A)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 11,
        letterSpacing: '0.4em',
      }}>
        CHECKING SESSION
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}