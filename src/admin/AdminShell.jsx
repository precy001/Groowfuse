/**
 * Admin layout shell. Wraps every authenticated admin page with the sidebar
 * navigation and a topbar (mobile-only menu trigger). The Outlet renders the
 * specific page (Dashboard, Posts, etc.) inside the content area.
 *
 * Adds an SEO block with noindex so admin pages never get indexed.
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNav from './components/AdminNav';
import AdminTour from './components/AdminTour';
import SEO from '../components/SEO';
import { useDashboardStats } from './lib/data-hooks';

export default function AdminShell() {
  const [navOpen, setNavOpen] = useState(false);

  // Live unread count for the sidebar badge
  const stats = useDashboardStats();
  const unreadCount = stats.data?.unreadMessages || 0;

  return (
    <div className="adm-shell">
      <SEO
        title="Admin"
        description="GroowFuse admin console"
        noindex
      />

      <AdminNav
        open={navOpen}
        onClose={() => setNavOpen(false)}
        unreadCount={unreadCount}
      />

      <main className="adm-main">
        {/* Mobile topbar — only visible below the nav breakpoint */}
        <header className="adm-topbar">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="adm-topbar-menu"
            aria-label="Open navigation"
            aria-expanded={navOpen}
          >
            <span aria-hidden>≡</span>
          </button>
          <span className="adm-topbar-brand">
            Groow<span style={{ color: 'var(--green)' }}>Fuse</span> Admin
          </span>
          <span aria-hidden style={{ width: 36 }} />
        </header>

        <div className="adm-page">
          <Outlet />
        </div>
      </main>

      {/* First-time-user walkthrough — auto-opens once per user, can be replayed */}
      <AdminTour />
    </div>
  );
}