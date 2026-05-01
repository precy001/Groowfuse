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
import SEO from '../components/SEO';
import { MOCK_MESSAGES } from './lib/mock-data';

export default function AdminShell() {
  const [navOpen, setNavOpen] = useState(false);

  // Pulled from mock data for now; will become a fetch when backend lands.
  const unreadCount = MOCK_MESSAGES.filter((m) => m.status === 'unread').length;

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
    </div>
  );
}
