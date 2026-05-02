/**
 * Admin sidebar navigation. Highlights the active section automatically
 * via NavLink. Collapses to a header bar with a hamburger on mobile.
 */

import { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../lib/auth';

const SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin',            label: 'Dashboard', icon: 'dashboard', end: true },
      { to: '/admin/analytics',  label: 'Analytics', icon: 'analytics' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/posts',     label: 'Blog Posts', icon: 'posts' },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/admin/messages',   label: 'Messages',   icon: 'mail',     badge: 'unread' },
      { to: '/admin/newsletter', label: 'Newsletter', icon: 'subscribe' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/admin/settings',   label: 'Settings',   icon: 'settings' },
    ],
  },
];

export default function AdminNav({ open, onClose, unreadCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  // Close mobile drawer on route change
  useEffect(() => {
    if (open) onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <>
      {open && (
        <div
          className="adm-nav-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`adm-nav ${open ? 'is-open' : ''}`}
        aria-label="Admin navigation"
      >
        <div className="adm-nav-brand">
          <NavLink to="/admin" className="adm-nav-brand-link" end>
            <span className="adm-nav-brand-mark">
              <span className="adm-nav-brand-dot" />
            </span>
            <span className="adm-nav-brand-text">
              <span>GroowFuse</span>
              <span className="adm-nav-brand-sub">Admin Console</span>
            </span>
          </NavLink>
        </div>

        <nav className="adm-nav-sections">
          {SECTIONS.map((section) => (
            <div key={section.label} className="adm-nav-section">
              <span className="adm-nav-section-label">{section.label}</span>
              <ul>
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `adm-nav-link ${isActive ? 'is-active' : ''}`
                      }
                    >
                      <NavIcon name={item.icon} />
                      <span className="adm-nav-link-label">{item.label}</span>
                      {item.badge === 'unread' && unreadCount > 0 && (
                        <span className="adm-nav-badge">{unreadCount}</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="adm-nav-footer">
          <div className="adm-nav-user">
            <span className="adm-nav-avatar" aria-hidden="true">
              {(user?.email || 'A').charAt(0).toUpperCase()}
            </span>
            <div className="adm-nav-user-text">
              <span className="adm-nav-user-name">{user?.name || 'Admin'}</span>
              <span className="adm-nav-user-email">{user?.email}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="adm-nav-logout"
            aria-label="Log out"
          >
            <NavIcon name="logout" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function NavIcon({ name }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  switch (name) {
    case 'dashboard':
      return <svg {...props}><rect x="2" y="2" width="5" height="6"/><rect x="9" y="2" width="5" height="3"/><rect x="9" y="7" width="5" height="7"/><rect x="2" y="10" width="5" height="4"/></svg>;
    case 'analytics':
      return <svg {...props}><path d="M2 14 L2 2 M2 14 L14 14"/><path d="M5 11 L5 9 M8 11 L8 6 M11 11 L11 4"/></svg>;
    case 'posts':
      return <svg {...props}><rect x="2.5" y="2" width="11" height="12" rx="1"/><path d="M5 5h6M5 8h6M5 11h4"/></svg>;
    case 'mail':
      return <svg {...props}><rect x="2" y="3.5" width="12" height="9" rx="1"/><path d="M2.5 4.5 L8 9 L13.5 4.5"/></svg>;
    case 'subscribe':
      return <svg {...props}><path d="M2 7 V3 a1 1 0 0 1 1-1 h10 a1 1 0 0 1 1 1 V13 a1 1 0 0 1-1 1 H8"/><path d="M2 11 l4-3 4 3"/><circle cx="4" cy="13" r="1.5"/></svg>;
    case 'settings':
      return <svg {...props}><circle cx="8" cy="8" r="2.5"/><path d="M8 1 V3 M8 13 V15 M1 8 H3 M13 8 H15 M3.2 3.2 L4.5 4.5 M11.5 11.5 L12.8 12.8 M3.2 12.8 L4.5 11.5 M11.5 4.5 L12.8 3.2"/></svg>;
    case 'logout':
      return <svg {...props}><path d="M9 4V3 a1 1 0 0 0-1-1 H3 a1 1 0 0 0-1 1 v10 a1 1 0 0 0 1 1 h5 a1 1 0 0 0 1-1 v-1"/><path d="M11 5 l3 3 -3 3 M14 8 H6"/></svg>;
    default:
      return null;
  }
}