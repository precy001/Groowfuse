/**
 * Admin login page.
 *
 * On success, redirects back to the route the user was trying to reach
 * (carried in location.state.from), or to /admin if they came directly.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import { login, isAuthenticated } from '../lib/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'error'
  const [error, setError] = useState('');

  // If already logged in, skip the form.
  useEffect(() => {
    if (isAuthenticated()) {
      const target = location.state?.from?.pathname || '/admin';
      navigate(target, { replace: true });
    }
  }, [navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    const result = await login(email, password);

    if (result.ok) {
      const target = location.state?.from?.pathname || '/admin';
      navigate(target, { replace: true });
    } else {
      setStatus('error');
      setError(result.error || 'Login failed.');
    }
  };

  return (
    <div className="adm-login">
      <SEO title="Sign in — Admin" description="GroowFuse admin sign-in" noindex />

      <div className="adm-login-card">
        {/* Header */}
        <div className="adm-login-header">
          <span className="adm-login-eyebrow">Console / Sign in</span>
          <h1 className="adm-login-title">
            <span style={{ color: 'var(--text)' }}>Welcome</span>{' '}
            <span className="gf-serif" style={{ color: 'var(--green)' }}>back</span>.
          </h1>
          <p className="adm-login-sub">
            Sign in to manage posts, messages, and subscribers.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <label className="adm-field">
            <span className="adm-field-label">Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'submitting'}
              className="adm-input"
              placeholder="you@groowfuse.com"
              autoFocus
            />
          </label>

          <label className="adm-field">
            <span className="adm-field-label">Password</span>
            <div className="adm-input-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === 'submitting'}
                className="adm-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="adm-input-toggle"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && (
            <p className="adm-login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="adm-login-submit"
          >
            {status === 'submitting' ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        {/* Footer */}
        <div className="adm-login-footer">
          <Link to="/" className="adm-login-back">
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
